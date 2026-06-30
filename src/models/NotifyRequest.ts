import mongoose, { Schema, models, model } from "mongoose";

const NotifyRequestSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    productName: {
      type: String,
    },

    variant: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate signups for the same product/variant/email
NotifyRequestSchema.index(
  { productId: 1, variant: 1, email: 1 },
  { unique: true }
);

const NotifyRequest =
  models.NotifyRequest || model("NotifyRequest", NotifyRequestSchema);

export default NotifyRequest;