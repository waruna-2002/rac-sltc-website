import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Member role is required"],
      default: "Director",
      trim: true,
    },
    category: {
      type: String,
      enum: ["Executive Committee", "Board of Directors"],
      default: "Board of Directors",
    },
    avenue: {
      type: String,
      default: "",
      trim: true,
    },
    faculty: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    achievements: {
      type: [String],
      default: [],
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    instagram: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

TeamMemberSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
TeamMemberSchema.set("toJSON", { virtuals: true });
TeamMemberSchema.set("toObject", { virtuals: true });

export default mongoose.models.TeamMember ||
  mongoose.model("TeamMember", TeamMemberSchema);
