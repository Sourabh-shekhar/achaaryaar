import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/addresses
// List the logged-in user's saved addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("addresses");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("GET /api/addresses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
      },
      { status: 500 }
    );
  }
}

// POST /api/addresses
// Add a new saved address
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      type,
      isDefault,
    } = body;

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required address fields",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number must be 10 digits",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Pincode must be 6 digits",
        },
        { status: 400 }
      );
    }

    // Only allow the address types defined in User.ts
    const allowedTypes = ["Home", "Work", "Other"] as const;

    const addressType = allowedTypes.includes(type)
      ? type
      : "Home";

    // ----------------------------------------------------
    // CONNECT DATABASE
    // ----------------------------------------------------

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ----------------------------------------------------
    // DEFAULT ADDRESS
    // ----------------------------------------------------

    // First address automatically becomes default.
    // If user explicitly chooses default, existing default
    // addresses are unset.
    const shouldBeDefault =
      Boolean(isDefault) || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // ----------------------------------------------------
    // SAVE ADDRESS
    // ----------------------------------------------------

    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      type: addressType,
      isDefault: shouldBeDefault,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("POST /api/addresses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save address",
      },
      { status: 500 }
    );
  }
}