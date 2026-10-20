import mongoose from "mongoose";

const MemberRegistrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, "Student registration number is required"],
      trim: true,
    },
    faculty: {
      type: String,
      required: [true, "Faculty is required"],
      default: "Computing & IT",
    },
    avenues: {
      type: [String],
      default: [],
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

MemberRegistrationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
MemberRegistrationSchema.set("toJSON", { virtuals: true });
MemberRegistrationSchema.set("toObject", { virtuals: true });

export default mongoose.models.MemberRegistration ||
  mongoose.model("MemberRegistration", MemberRegistrationSchema);
