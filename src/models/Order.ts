import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Links every order back to the account that placed it.
    // Without this field, mongoose's strict mode silently drops
    // any "email" sent to Order.create(), which is why orders
    // never showed up in profile/order history.
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

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
