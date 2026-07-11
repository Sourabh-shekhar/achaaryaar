import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  await connectDB();

  const record = await Otp.findOne({
    phone,
    otp,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  record.verified = true;
  await record.save();

  return NextResponse.json({ success: true });
}