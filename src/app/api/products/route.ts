import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      products,
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

    const product = await Product.create({
      name: body.name,
      description: body.description,
      category: body.category,
      image: body.image,
      featured: body.featured || false,
      weights: body.weights,
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