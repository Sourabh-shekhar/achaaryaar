import mongoose, { Schema, models, model } from "mongoose";

const ComboItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    videos: {
      type: [String],
      default: [],
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const ComboVariantSchema = new Schema(
  {
    unitWeight: {
      type: String,
      enum: ["120g", "220g", "330g", "430g"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    
      slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      required: false,
    },

    category: {
      type: String,
      required: true,
    },

    // Main cover image
    image: {
      type: String,
      required: true,
    },

    // All product images
    images: {
      type: [String],
      default: [],
    },

    // Product videos
    videos: {
      type: [String],
      default: [],
    },

    // Normal product variants
    weights: [
      {
        size: {
          type: String,
          enum: ["120g", "220g", "330g", "430g"],
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        stock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    // ================= COMBO =================

    isCombo: {
      type: Boolean,
      default: false,
    },

    // Supports 2, 3 and 4 jar combos
    comboSize: {
      type: Number,
      enum: [2, 3, 4],
    },

    // Old legacy combo unit weight
    comboUnitWeight: {
      type: String,
      enum: ["120g", "220g", "330g", "430g"],
    },

    // New combo variants
    comboVariants: {
      type: [ComboVariantSchema],
      default: [],
    },

    // Products included in combo
    comboItems: {
      type: [ComboItemSchema],
      default: [],
    },

    // Legacy fields for backward compatibility
    comboPrice: {
      type: Number,
      min: 0,
    },

    comboStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ================= OTHER =================

    featured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  models.Product || model("Product", ProductSchema);

export default Product;