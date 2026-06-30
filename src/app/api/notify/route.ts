import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import NotifyRequest from "@/models/NotifyRequest";

export async function POST(req: NextRequest) {
  try {
    const { productId, productName, variant, email } = await req.json();

    if (!productId || !email) {
      return NextResponse.json(
        { error: "productId and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    try {
      await NotifyRequest.create({
        productId,
        productName,
        variant,
        email,
      });
    } catch (err: any) {
      // Duplicate signup (same product + variant + email) — treat as success
      if (err?.code !== 11000) {
        throw err;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}