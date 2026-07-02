import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: String,
    address: String,
    city: String,
    pincode: String,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    paymentId: String,
    gatewayOrderId: String,
    items: Array,
    subtotal: Number,
    shipping: Number,
    total: Number,
    courierName: String,
    trackingNumber: String,
    estimatedDelivery: String,

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
