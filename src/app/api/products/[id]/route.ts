import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

const ALLOWED_SIZES = ["125g", "225g", "425g"];

function normalizeWeights(weights: any[] = []) {
  const seen = new Set<string>();

  return weights
    .map((weight) => {
      const rawSize = weight.size || weight.quantity || weight.weight;
      const size = rawSize === "500g" ? "425g" : rawSize;
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

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        weights: normalizeWeights((product as any).weights),
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

    const nextBody = {
      ...body,
      images,
      // Cover image always mirrors the first photo so anything still
      // reading the single `image` field stays in sync.
      image: images[0],
      weights: normalizeWeights(body.weights),
    };

    if (nextBody.weights.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Add at least one valid variant: 125g, 225g, or 425g",
        },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      nextBody,
      { new: true }
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