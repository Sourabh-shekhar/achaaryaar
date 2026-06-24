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
    items: Array,
    total: Number,

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);