import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

type ProfileUpdate = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
};

async function getSessionEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email || "";
}

export async function GET() {
  try {
    const email = await getSessionEmail();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select("-password").lean();
    const orders = await Order.find({ email }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      user,
      orders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const email = await getSessionEmail();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ProfileUpdate;

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: body.name?.trim(),
          phone: body.phone?.trim(),
          address: body.address?.trim(),
          city: body.city?.trim(),
          pincode: body.pincode?.trim(),
        },
      },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
