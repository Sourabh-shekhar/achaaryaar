import { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percent: { type: Number, required: true, min: 1, max: 100 },
    active: { type: Boolean, default: true },
    firstOrderOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Coupon || model("Coupon", CouponSchema);
