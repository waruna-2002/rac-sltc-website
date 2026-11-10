import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avenue: {
      type: String,
      required: [true, "Service avenue is required"],
      enum: [
        "Community Service Avenue",
        "Club Service Avenue",
        "Professional Development Avenue",
        "Membership Development Avenue",
        "International Service Avenue",
        "Public Relations and Public Image",
        "Sports and Recreational Activities",
        "Environmental Service Avenue",
        // Backwards compatibility for existing legacy entries
        "Community Service",
        "Professional Development",
        "Digital & IT",
        "Club Service",
        "International Service",
        "Sports",
        "Environmental",
        "General",
      ],
      default: "Community Service Avenue",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    impact: {
      type: String,
      default: "Community Impact",
    },
    description: {
      type: String,
      required: [true, "Short description is required"],
    },
    fullDescription: {
      type: String,
      default: "",
    },
    submittedBy: {
      type: String,
      default: "Anonymous",
    },
    image: {
      type: String,
      default: "/images/projects/project1.jpg",
    },
    images: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    organizers: {
      type: String,
      default: "Rotaract SLTC Member",
    },
    highlights: {
      type: [String],
      default: ["Community Engagement Initiative"],
    },
  },
  { timestamps: true }
);

// Virtual for id to match frontend expectation
ProjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
ProjectSchema.set("toJSON", { virtuals: true });
ProjectSchema.set("toObject", { virtuals: true });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
