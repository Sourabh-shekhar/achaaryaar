import mongoose, { Schema, models, model } from "mongoose";

const AddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    addressLine: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: String,
    address: String,
    city: String,
    pincode: String,

    // Multiple saved addresses, Flipkart-style — used at checkout
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;