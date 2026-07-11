import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  await connectDB();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await Otp.create({ phone, otp, expiresAt });

  // MSG91 send
  await fetch(`https://control.msg91.com/api/v5/otp?otp=${otp}&mobile=91${phone}`, {
    method: "POST",
    headers: {
      authkey: process.env.MSG91_AUTH_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID }),
  });

  return NextResponse.json({ success: true });
}