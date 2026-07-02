import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { baseUrl } from "@/lib/baseUrl";
import { sendOrderConfirmation } from "@/lib/sendEmail";
// Create Order
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        console.log("Received Body:", JSON.stringify(body, null, 2));

        for (const item of body.items) {
            console.log("Item _id:", item._id);
        }
        const order = await Order.create(body);
        await sendOrderConfirmation(
            body.email,
            body.fullName,
            order._id.toString()
        );
        for (const item of body.items) {

            const product = await Product.findById(item._id);

            if (!product) continue;

            const variant = product.weights?.find(
                (v: any) => v.quantity === item.selectedVariant
            );

            if (variant) {
                variant.stock -= item.quantity;
            }

            await product.save();
        }
        return NextResponse.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create order",
            },
            { status: 500 }
        );
    }
}

// Fetch Orders
export async function GET() {
    try {
        await connectDB();

        const orders = await Order.find().sort({
            createdAt: -1,
        });

        return NextResponse.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch orders",
            },
            { status: 500 }
        );
    }
}