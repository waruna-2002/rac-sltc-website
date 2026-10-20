import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
  },
  { timestamps: true }
);

ContactMessageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
ContactMessageSchema.set("toJSON", { virtuals: true });
ContactMessageSchema.set("toObject", { virtuals: true });

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);
