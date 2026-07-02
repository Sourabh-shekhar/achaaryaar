import mongoose, { Schema, models, model } from "mongoose";

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
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
