import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an image title"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      required: true,
    },
    avenue: {
      type: String,
      enum: [
        "Community Service",
        "Professional Development",
        "Club Service",
        "International Service",
        "Digital & IT",
        "Sports",
        "General",
      ],
      default: "General",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);