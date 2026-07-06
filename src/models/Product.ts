import mongoose, { Schema, models, model } from "mongoose";

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
          enum: ["125g", "225g", "400g", "500g"],
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
