import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    image: String,

    description: String,

    category: {
      type: String,
      default: "Pickle",
    },

    variants: [
      {
        quantity: String, // 150g, 250g, 500g
        price: Number,
        stock: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);