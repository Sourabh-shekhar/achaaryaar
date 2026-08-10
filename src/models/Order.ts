import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------
    // CUSTOMER
    // ----------------------------------------------------
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
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // ----------------------------------------------------
    // PAYMENT
    // ----------------------------------------------------
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    // Razorpay payment ID
    paymentId: {
      type: String,
      default: "",
      index: true,
    },

    // Razorpay order ID
    gatewayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    // ----------------------------------------------------
    // PRODUCTS
    // ----------------------------------------------------
    items: {
      type: Array,
      required: true,
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
    },

    shipping: {
      type: Number,
      required: true,
      default: 0,
    },

    // ----------------------------------------------------
    // COUPON
    // ----------------------------------------------------
    couponCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    // ----------------------------------------------------
    // ORDER STATUS
    // ----------------------------------------------------
    status: {
      type: String,
      default: "Pending",
      index: true,
    },

    // ----------------------------------------------------
    // SHIPMOZO
    // ----------------------------------------------------

    // Shipmozo order/reference ID
    shipmozoOrderId: {
      type: String,
      default: "",
      index: true,
    },

    // Courier selected by Shipmozo
    courierName: {
      type: String,
      default: "",
    },

    // AWB / tracking number
    trackingNumber: {
      type: String,
      default: "",
      index: true,
    },

    // Estimated delivery date
    estimatedDelivery: {
      type: String,
      default: "",
    },

    // Current shipping status
    shippingStatus: {
      type: String,
      default: "Pending",
      index: true,
    },

    // Tracking URL if available
    trackingUrl: {
      type: String,
      default: "",
    },

    // ----------------------------------------------------
    // SHIPMENT DIMENSIONS
    // ----------------------------------------------------

    // Weight in grams
    shipmentWeight: {
      type: Number,
      default: 500,
    },

    // Length in cm
    shipmentLength: {
      type: Number,
      default: 20,
    },

    // Width in cm
    shipmentWidth: {
      type: Number,
      default: 15,
    },

    // Height in cm
    shipmentHeight: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);