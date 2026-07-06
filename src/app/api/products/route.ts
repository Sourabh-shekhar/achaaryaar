import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

const ALLOWED_SIZES = ["125g", "225g", "500g"];

function normalizeWeights(weights: any[] = []) {
  const seen = new Set<string>();

  return weights
    .map((weight) => {
      const size = weight.size || weight.quantity || weight.weight;
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

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({
      createdAt: -1,
    }).lean();

    return NextResponse.json({
      success: true,
      products: products.map((product: any) => ({
        ...product,
        weights: normalizeWeights(product.weights),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const weights = normalizeWeights(body.weights);

    if (weights.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Add at least one valid variant: 125g, 225g, or 500g",
        },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: body.name,
      description: body.description,
      category: body.category,
      image: body.image,
      featured: body.featured || false,
      weights,
    });

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}
