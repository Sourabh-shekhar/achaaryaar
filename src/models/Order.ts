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

    // Normalized phone used for coupon/customer matching
    normalizedPhone: {
      type: String,
      default: "",
      index: true,
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
      enum: ["razorpay"],
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    paymentId: {
      type: String,
      default: "",
      index: true,
      unique: true,
      sparse: true,
    },

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

    shipmozoOrderId: {
      type: String,
      default: "",
      index: true,
    },

    courierName: {
      type: String,
      default: "",
    },

    trackingNumber: {
      type: String,
      default: "",
      index: true,
    },

    estimatedDelivery: {
      type: String,
      default: "",
    },

    shippingStatus: {
      type: String,
      default: "Pending",
      index: true,
    },

    trackingUrl: {
      type: String,
      default: "",
    },

    // ----------------------------------------------------
    // SHIPMENT DIMENSIONS
    // ----------------------------------------------------

    shipmentWeight: {
      type: Number,
      default: 500,
    },

    shipmentLength: {
      type: Number,
      default: 20,
    },

    shipmentWidth: {
      type: Number,
      default: 15,
    },

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