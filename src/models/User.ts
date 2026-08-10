import mongoose, { Schema, models, model } from "mongoose";

// ----------------------------------------------------
// SAVED ADDRESS
// ----------------------------------------------------

const AddressSchema = new Schema(
  {
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

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    // State is required for the delivery address
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
  {
    timestamps: true,
  }
);

// ----------------------------------------------------
// USER
// ----------------------------------------------------

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Main/profile phone
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // ----------------------------------------------------
    // LEGACY / PROFILE ADDRESS FIELDS
    // ----------------------------------------------------

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    // ----------------------------------------------------
    // MULTIPLE SAVED ADDRESSES
    // Used by checkout / profile
    // ----------------------------------------------------

    addresses: {
      type: [AddressSchema],
      default: [],
    },

    // ----------------------------------------------------
    // PASSWORD RESET
    // ----------------------------------------------------

    resetToken: {
      type: String,
      default: undefined,
    },

    resetTokenExpiry: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// ----------------------------------------------------
// EXPORT MODEL
// ----------------------------------------------------

const User = models.User || model("User", UserSchema);

export default User;