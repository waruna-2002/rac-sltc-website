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
        "Community Service Avenue",
        "Club Service Avenue",
        "Professional Development Avenue",
        "Membership Development Avenue",
        "International Service Avenue",
        "Public Relations and Public Image",
        "Sports and Recreational Activities",
        "Environmental Service Avenue",
        // Backwards compatibility
        "Community Service",
        "Professional Development",
        "Club Service",
        "International Service",
        "Digital & IT",
        "Sports",
        "General",
      ],
      default: "Community Service Avenue",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);