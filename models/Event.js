import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    avenue: {
      type: String,
      enum: [
        "Community Service",
        "Professional Development",
        "Digital & IT",
        "Club Service",
        "International Service",
        "Sports",
        "Environmental",
        "General",
      ],
      default: "General",
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      default: "TBD",
    },
    location: {
      type: String,
      default: "SLTC Research University, Padukka",
    },
    image: {
      type: String,
      default: "/images/hero.jpg",
    },
    registrationLink: {
      type: String,
      default: "/join-us",
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    tags: {
      type: [String],
      default: ["Rotaract", "SLTC", "Youth Leadership"],
    },
  },
  { timestamps: true }
);

EventSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
EventSchema.set("toJSON", { virtuals: true });
EventSchema.set("toObject", { virtuals: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
