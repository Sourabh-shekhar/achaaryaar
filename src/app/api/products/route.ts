import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";



const ALLOWED_SIZES = ["120g", "220g", "330g", "430g"];
const ALLOWED_COMBO_SIZES = [2, 3, 4];
const ALLOWED_COMBO_UNIT_WEIGHTS = ["120g", "220g", "330g", "430g"];
const ALLOWED_ORIGIN = "https://www.achaaryaar.com";

function createSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
async function createUniqueSlug(name: string) {
  const baseSlug = createSlug(name);

  let slug = baseSlug;
  let counter = 2;

  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
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

// Validates and normalizes the fixed list of products inside a combo pack.
// Returns null if the combo data is invalid.
function normalizeComboItems(comboItems: any[] = [], comboSize: number) {
  const items = (comboItems || [])
    .filter((item) => item && item.productId && item.name)
    .map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image || "",
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

  if (items.length !== comboSize) return null;

  return items;
}

// Keeps only real, non-empty string URLs, and makes sure the cover `image`
// is always included as the first entry even if the client didn't send it
// as part of the `images` array.
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

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({
      createdAt: -1,
    }).lean();

    return NextResponse.json({
      success: true,
      products: products.map((product: any) => {
        // Older combo records were saved with comboItems but without the
        // isCombo flag. Treat both formats as combo packs for customers.
        const isCombo =
          product.isCombo === true ||
          (Array.isArray(product.comboItems) && product.comboItems.length > 0) ||
          (Number.isFinite(Number(product.comboPrice)) && Number(product.comboPrice) > 0);

        return {
          ...product,
          isCombo,
          weights: isCombo ? [] : normalizeWeights(product.weights),
        };
      }),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 🔒 Only an admin session (logged in via the shared admin password)
    // can create products.
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
      );
    }

    await connectDB();

    const body = await req.json();
    const images = normalizeImages(body.images, body.image);

    if (!body.name || typeof body.name !== "string") {
  return NextResponse.json(
    {
      success: false,
      message: "Product name is required",
    },
    {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    }
  );
}

const slug = await createUniqueSlug(body.name);

    // Combo pack — fixed set of existing products bundled at one price.
    if (body.isCombo) {
      const comboSize = Number(body.comboSize);
      const comboUnitWeight = String(body.comboUnitWeight || "").trim();

      if (!ALLOWED_COMBO_SIZES.includes(comboSize)) {
        return NextResponse.json(
          {
            success: false,
            message: "Combo size must be 2, 3, or 4",
          },
          { status: 400, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
        );
      }

      if (!ALLOWED_COMBO_UNIT_WEIGHTS.includes(comboUnitWeight)) {
        return NextResponse.json(
          { success: false, message: "Select a valid weight for each combo jar" },
          { status: 400, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
        );
      }

      const comboItems = normalizeComboItems(body.comboItems, comboSize);

      if (!comboItems) {
        return NextResponse.json(
          {
            success: false,
            message: `Select exactly ${comboSize} products for this combo`,
          },
          { status: 400, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
        );
      }

      const comboPrice = Number(body.comboPrice);
      const comboStock = Number(body.comboStock || 0);

      if (!Number.isFinite(comboPrice) || comboPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Enter a valid combo price",
          },
          { status: 400, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
        );
      }

    const product = await Product.create({
        name: body.name,
        slug,
        description: body.description,
        shortDescription: body.shortDescription || "",
        category: body.category,
        image: body.image,
        images,
        featured: body.featured || false,
        isCombo: true,
        comboSize,
        comboUnitWeight,
        comboItems,
        comboPrice,
        comboStock: Number.isFinite(comboStock) ? Math.max(0, comboStock) : 0,
        weights: [],
      });

      return NextResponse.json(
        { success: true, product },
        { headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
      );
    }

    // Regular product — weight/price/stock variants
    const weights = normalizeWeights(body.weights);

    if (weights.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Add at least one valid variant: 220g, 330g, or 430g",
        },
        { status: 400, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
      );
    }

const product = await Product.create({
      name: body.name,
      slug,
      description: body.description,
      shortDescription: body.shortDescription || "",
      category: body.category,
      image: body.image,
      images,
      featured: body.featured || false,
      weights,
    });

    return NextResponse.json(
      { success: true, product },
      { headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
    );

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
