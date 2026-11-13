import mongoose from "mongoose";

const NotificationSubscriberSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["push", "email"],
      required: true,
    },
    // For Web Push notifications
    endpoint: {
      type: String,
      trim: true,
    },
    keys: {
      p256dh: { type: String, trim: true },
      auth: { type: String, trim: true },
    },
    // For Email notifications
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
NotificationSubscriberSchema.index({ endpoint: 1 }, { sparse: true });
NotificationSubscriberSchema.index({ email: 1 }, { sparse: true });

export default mongoose.models.NotificationSubscriber ||
  mongoose.model("NotificationSubscriber", NotificationSubscriberSchema);
