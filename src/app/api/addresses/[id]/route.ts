import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// DELETE /api/addresses/:id — remove a saved address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Not logged in" },
      { status: 401 }
    );
  }

  const { id } = await params;

  await connectDB();

  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const wasDefault = user.addresses.id(id)?.isDefault;

  user.addresses = user.addresses.filter(
    (addr: any) => addr._id.toString() !== id
  );

  // If we removed the default address, promote the first remaining one
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return NextResponse.json({ success: true, addresses: user.addresses });
}

// PATCH /api/addresses/:id — mark this address as the default one
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Not logged in" },
      { status: 401 }
    );
  }

  const { id } = await params;

  await connectDB();

  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  user.addresses.forEach((addr: any) => {
    addr.isDefault = addr._id.toString() === id;
  });

  await user.save();

  return NextResponse.json({ success: true, addresses: user.addresses });
}