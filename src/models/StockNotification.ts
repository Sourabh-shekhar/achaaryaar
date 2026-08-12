import mongoose, { Schema, models, model } from "mongoose";

const StockNotificationSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
    },

    // Example: 120g
    // Combo example: 120g × 2 jars
    variant: {
      type: String,
      required: true,
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
      index: true,
    },

    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same email from registering multiple times
// for the same product and variant.
StockNotificationSchema.index(
  {
    productId: 1,
    variant: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

const StockNotification =
  models.StockNotification ||
  model("StockNotification", StockNotificationSchema);

export default StockNotification;