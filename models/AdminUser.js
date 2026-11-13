import mongoose from "mongoose";

const TrustedDeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      default: "rotaractsltc@gmail.com",
    },
    role: {
      type: String,
      enum: ["super_admin", "project_editor"],
      default: "super_admin",
    },
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    trustedDevices: {
      type: [TrustedDeviceSchema],
      default: [],
    },
    activeOtp: {
      code: { type: String, default: null },
      purpose: { type: String, default: null }, // "login_2fa" | "password_reset"
      tempToken: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
    resetToken: {
      token: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdminUser ||
  mongoose.model("AdminUser", AdminUserSchema);
