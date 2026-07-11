import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  const { phone, otp, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  await connectDB();

  const record = await Otp.findOne({
    phone,
    otp,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
  }

  const user = await User.findOne({ phone });
  if (!user) {
    return NextResponse.json({ message: "No account found with this phone number" }, { status: 404 });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return NextResponse.json({ message: "Password reset successful" });
}