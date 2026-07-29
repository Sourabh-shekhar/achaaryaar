import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json({ message: "Reset token is required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() }, // token must not be expired
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid or expired reset link" }, { status: 400 });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return NextResponse.json({ message: "Password reset successful" });
}