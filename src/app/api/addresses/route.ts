import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/addresses — list the logged-in user's saved addresses
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Not logged in" },
      { status: 401 }
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id).select("addresses");

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, addresses: user.addresses });
}

// POST /api/addresses — add a new saved address
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Not logged in" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { fullName, phone, addressLine, city, pincode, type, isDefault } =
    body;

  if (!fullName || !phone || !addressLine || !city || !pincode) {
    return NextResponse.json(
      { success: false, message: "Missing required address fields" },
      { status: 400 }
    );
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return NextResponse.json(
      { success: false, message: "Phone number must be 10 digits" },
      { status: 400 }
    );
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    return NextResponse.json(
      { success: false, message: "Pincode must be 6 digits" },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  // If this is the first address, or explicitly marked default,
  // unset isDefault on all existing addresses first.
  const shouldBeDefault = isDefault || user.addresses.length === 0;

  if (shouldBeDefault) {
    user.addresses.forEach((addr: any) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    fullName,
    phone,
    addressLine,
    city,
    pincode,
    type: type || "Home",
    isDefault: shouldBeDefault,
  });

  await user.save();

  return NextResponse.json({ success: true, addresses: user.addresses });
}