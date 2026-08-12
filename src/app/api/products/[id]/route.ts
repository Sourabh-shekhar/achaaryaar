import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { sendBackInStockNotifications } from "@/lib/stockNotificationEmail";
const ALLOWED_SIZES = ["120g", "220g", "330g", "430g"];
const ALLOWED_COMBO_SIZES = [2, 3, 4];
const ALLOWED_COMBO_UNIT_WEIGHTS = ["120g", "220g", "330g", "430g"];

function getStockMap(product: any) {
  const stockMap = new Map<string, number>();

  const isCombo =
    product?.isCombo === true ||
    product?.category?.toLowerCase().includes("combo") ||
    (Array.isArray(product?.comboItems) &&
      product.comboItems.length > 0);

  // NORMAL PRODUCTS: 120g, 220g, 330g, 430g
  if (!isCombo) {
    for (const weight of product?.weights || []) {
      const size = String(
        weight.size || weight.quantity || weight.weight || ""
      ).trim();

      if (size) {
        stockMap.set(size, Math.max(0, Number(weight.stock || 0)));
      }
    }

    return stockMap;
  }

  // COMBOS WITH MULTIPLE VARIANTS
  if (
    Array.isArray(product?.comboVariants) &&
    product.comboVariants.length > 0
  ) {
    for (const variant of product.comboVariants) {
      const unitWeight = String(variant.unitWeight || "").trim();

      if (!unitWeight) continue;

      const label = `${unitWeight} × ${product.comboSize || 2} jars`;

      stockMap.set(
        label,
        Math.max(0, Number(variant.stock || 0))
      );
    }

    return stockMap;
  }

  // OLD/SINGLE COMBO
  const label =
    product?.comboUnitWeight && product?.comboSize
      ? `${product.comboUnitWeight} × ${product.comboSize} jars`
      : `${product?.comboSize || 2}-Pack Combo`;

  stockMap.set(
    label,
    Math.max(0, Number(product?.comboStock || 0))
  );

  return stockMap;
}

async function notifyVariantsThatCameBackInStock(
  oldProduct: any,
  updatedProduct: any
) {
  const oldStockMap = getStockMap(oldProduct);
  const newStockMap = getStockMap(updatedProduct);

  for (const [variant, newStock] of newStockMap.entries()) {
    const oldStock = oldStockMap.get(variant) || 0;

    // Send email ONLY if:
    // OLD STOCK = 0
    // NEW STOCK > 0
    if (oldStock <= 0 && newStock > 0) {
      try {
        await sendBackInStockNotifications({
          productId: String(updatedProduct._id),
          productName: updatedProduct.name,
          variant,
        });

        console.log(
          `Back-in-stock email sent for ${updatedProduct.name} - ${variant}`
        );
      } catch (error) {
        console.error(
          `Failed to send back-in-stock email for ${variant}:`,
          error
        );
      }
    }
  }
}

function normalizeWeights(weights: any[] = []) {
  const seen = new Set<string>();

  return weights
    .map((weight) => {
      const rawSize = weight.size || weight.quantity || weight.weight;
      const size = rawSize === "500g" ? "430g" : rawSize;
      const price = Number(weight.price);
      const stock = Number(weight.stock || 0);

      return {
        size,
        price,
        stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
      };
    })
    .filter((weight) => {
      if (!ALLOWED_SIZES.includes(weight.size)) return false;
      if (!Number.isFinite(weight.price) || weight.price <= 0) return false;
      if (seen.has(weight.size)) return false;

      seen.add(weight.size);
      return true;
    });
}

// Keeps only real, non-empty string URLs, and makes sure the cover `image`
// is always included as the first entry even if the client didn't send it
// as part of the `images` array. Mirrors the same helper in the POST route
// (src/app/api/products/route.ts) so create and update stay consistent.
function normalizeImages(images: any[] = [], fallbackCover?: string) {
  const cleaned = (images || []).filter(
    (url) => typeof url === "string" && url.trim().length > 0
  );

  if (fallbackCover && !cleaned.includes(fallbackCover)) {
    return [fallbackCover, ...cleaned];
  }

  return cleaned;
}

// Shared admin check — any session with role "admin" (set only via the
// admin-credentials login using the shared ADMIN_PASSWORD) passes.
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin";
}

// Get Single Product — left public, since product pages need this without
// anyone being logged in.
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const productData = product as any;
    const isCombo =
      productData.isCombo === true ||
      (Array.isArray(productData.comboItems) && productData.comboItems.length > 0) ||
      (Number.isFinite(Number(productData.comboPrice)) && Number(productData.comboPrice) > 0);

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        isCombo,
        weights: isCombo ? [] : normalizeWeights(productData.weights),
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

// Update Product — admin only.
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Was previously missing — anyone could hit this endpoint before.
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const images = normalizeImages(body.images, body.image);

    if (images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Keep at least one product photo",
        },
        { status: 400 }
      );
    }

    const isCombo = body.isCombo === true;
    const normalizedWeights = normalizeWeights(body.weights);

    if (!isCombo && normalizedWeights.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Add at least one valid variant: 120g, 220g, 330g, or 430g",
        },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findById(id).lean();
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const comboSize = Number(body.comboSize);
    // Older combo products had no saved per-jar weight.  Do not turn them
    // into 120g packs merely because another field is edited.
    const requestedComboUnitWeight = String(body.comboUnitWeight || "").trim();
    const comboUnitWeight =
      requestedComboUnitWeight || String((existingProduct as any).comboUnitWeight || "").trim();
    const comboPrice = Number(body.comboPrice);
    const comboStock = Number(body.comboStock);

    if (
      isCombo &&
      (!ALLOWED_COMBO_SIZES.includes(comboSize) ||
        (comboUnitWeight.length > 0 && !ALLOWED_COMBO_UNIT_WEIGHTS.includes(comboUnitWeight)) ||
        !Number.isFinite(comboPrice) ||
        comboPrice <= 0 ||
        !Number.isFinite(comboStock) ||
        comboStock < 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Enter valid combo pack details" },
        { status: 400 }
      );
    }

    // Do not let an empty value sent by the edit form overwrite the
    // missing/previous value of an older combo product.
    const bodyWithoutComboUnitWeight = { ...body };
    delete bodyWithoutComboUnitWeight.comboUnitWeight;

    const nextBody = {
      ...bodyWithoutComboUnitWeight,
      images,
      image: images[0],
      isCombo,
      weights: isCombo ? [] : normalizedWeights,
      ...(isCombo
        ? {
          comboSize,
          ...(comboUnitWeight ? { comboUnitWeight } : {}),
          comboPrice,
          comboStock: Math.max(0, Math.floor(comboStock)),
        }
        : {
          comboSize: undefined,
          comboUnitWeight: undefined,
          comboItems: [],
          comboPrice: undefined,
          comboStock: undefined,
        }),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      nextBody,
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update product",
        },
        { status: 500 }
      );
    }

    // IMPORTANT:
    // Compare old stock with new stock.
    // If a product changes from 0 to more than 0,
    // send emails to customers waiting for it.
    await notifyVariantsThatCameBackInStock(
      existingProduct,
      updatedProduct.toObject()
    );

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });


  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
      },
      { status: 500 }
    );
  }
}

// Delete Product — admin only.
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Was previously missing — anyone could hit this endpoint before.
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await context.params;

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
