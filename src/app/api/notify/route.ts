import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import StockNotification from "@/models/StockNotification";

function getVariantStock(product: any, variant: string) {
  const isCombo =
    product.isCombo === true ||
    product.category?.toLowerCase().includes("combo");

  if (!isCombo) {
    const weight = (product.weights || []).find(
      (item: any) => item.size === variant
    );

    return Number(weight?.stock || 0);
  }

  // New combo variants
  if (
    Array.isArray(product.comboVariants) &&
    product.comboVariants.length > 0
  ) {
    const comboVariant = product.comboVariants.find(
      (item: any) =>
        `${item.unitWeight} × ${product.comboSize || 2} jars` === variant
    );

    return Number(comboVariant?.stock || 0);
  }

  // Older combo products
  const legacyVariant =
    product.comboUnitWeight && product.comboSize
      ? `${product.comboUnitWeight} × ${product.comboSize} jars`
      : `${product.comboSize || 2}-Pack Combo`;

  if (legacyVariant === variant) {
    return Number(product.comboStock || 0);
  }

  return 0;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const productId = String(body.productId || "").trim();
    const productName = String(body.productName || "").trim();
    const variant = String(body.variant || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!productId || !variant || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Product, variant and email are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const currentStock = getVariantStock(product, variant);

    // Prevent registration if it is already available.
    if (currentStock > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This product is already back in stock",
        },
        { status: 400 }
      );
    }

    try {
      await StockNotification.create({
        productId,
        productName: productName || (product as any).name,
        variant,
        email,
        notified: false,
      });
    } catch (error: any) {
      // MongoDB duplicate key error
      if (error?.code === 11000) {
        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: "You're already on the notification list",
        });
      }

      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "We'll notify you when this product is back in stock",
    });
  } catch (error) {
    console.error("NOTIFY API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save notification request",
      },
      { status: 500 }
    );
  }
}