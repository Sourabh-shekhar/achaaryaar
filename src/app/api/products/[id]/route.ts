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

// Get Single Product
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

// Update Product
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const nextBody = {
      ...body,
      weights: normalizeWeights(body.weights),
    };

    if (nextBody.weights.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Add at least one valid variant: 125g, 225g, or 500g",
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

// Delete Product
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
