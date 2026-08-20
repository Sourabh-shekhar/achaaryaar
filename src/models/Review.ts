import { Schema, models, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Customer review photos
    images: {
      type: [String],
      default: [],
    },

    // Customer review videos
    videos: {
      type: [String],
      default: [],
    },

    approved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review =
  models.Review || model("Review", ReviewSchema);

export default Review;