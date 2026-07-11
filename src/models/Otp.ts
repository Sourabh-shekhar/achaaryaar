import mongoose, { Schema, models } from "mongoose";

const OtpSchema = new Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Otp || mongoose.model("Otp", OtpSchema);