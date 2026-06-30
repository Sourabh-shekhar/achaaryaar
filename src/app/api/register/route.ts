import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // ── Input validation ──────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Please provide a valid name (min 2 characters)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    await connectDB();

    // ── Duplicate check ───────────────────────────────
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Create user ───────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle Mongo duplicate key race condition
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}