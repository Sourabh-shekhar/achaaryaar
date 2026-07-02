import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    console.log("DEBUG — KEY_ID exists:", !!keyId, "| SECRET exists:", !!keySecret);
    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay keys are not configured.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const receipt = `AY-${Date.now()}`;

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        notes: {
          brand: "AchaarYaar",
        },
      }),
    });

    const razorpayOrder = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            razorpayOrder?.error?.description ||
            "Failed to create Razorpay order.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      keyId,
      order: razorpayOrder,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to start payment.",
      },
      { status: 500 }
    );
  }
}
