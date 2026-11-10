import mongoose from "mongoose";

const MediaPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["blog", "article", "bulletin"],
      default: "blog",
      required: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    authorRole: {
      type: String,
      default: "Rotaractor",
      trim: true,
    },
    authorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    avenue: {
      type: String,
      default: "Community Service Avenue",
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    },
    readTime: {
      type: String,
      default: "4 min read",
    },
    image: {
      type: String,
      default: "/images/projects/project1.jpg",
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    issue: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending", // Public submissions must be approved by admin
    },
  },
  { timestamps: true }
);

MediaPostSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
MediaPostSchema.set("toJSON", { virtuals: true });
MediaPostSchema.set("toObject", { virtuals: true });

export default mongoose.models.MediaPost ||
  mongoose.model("MediaPost", MediaPostSchema);
