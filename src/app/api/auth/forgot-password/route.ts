import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // Always respond the same way whether or not the user exists,
    // so attackers can't use this to discover valid emails.
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: "Achaaryaar <noreply@achaaryaar.com>",
      to: [user.email],
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your Achaaryaar account password. Click below to choose a new one.</p>
          <a href="${resetLink}"
             style="display:inline-block;padding:12px 20px;background:#1C3D2E;color:#fff;
                    text-decoration:none;border-radius:8px;margin:16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}