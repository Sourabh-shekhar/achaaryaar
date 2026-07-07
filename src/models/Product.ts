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
    quantity: {
      type: Number,
      default: 1,
      min: 1,
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

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    weights: [
      {
        size: {
          type: String,
          enum: ["125g", "225g", "425g"],
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        stock: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Combo pack support — a combo is a product made of other fixed
    // products bundled at one price (e.g. "3-pack combo").
    // When isCombo is true, `weights` is not used; comboPrice/comboStock
    // and comboItems drive pricing, stock and contents instead.
    isCombo: {
      type: Boolean,
      default: false,
    },

    comboSize: {
      type: Number,
      enum: [2, 3, 4],
    },

    comboItems: {
      type: [ComboItemSchema],
      default: undefined,
    },

    comboPrice: {
      type: Number,
    },

    comboStock: {
      type: Number,
      default: 0,
    },

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