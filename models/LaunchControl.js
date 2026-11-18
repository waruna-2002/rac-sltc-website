import mongoose from "mongoose";

const LaunchControlSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "rotaract_sltc_launch",
    },
    // Modes:
    // "LIVE" -> Normal mode (Site is fully open, no countdown. Current mode for approval/reviewers)
    // "COUNTDOWN" -> Pre-launch mode (Countdown active, site locked for public until launch)
    // "LAUNCHED" -> Launched mode (Site officially open post-ignition)
    mode: {
      type: String,
      enum: ["LIVE", "COUNTDOWN", "LAUNCHED"],
      default: "LIVE",
    },
    isLaunched: {
      type: Boolean,
      default: false,
    },
    targetDate: {
      type: String,
      default: "2026-11-21T15:00:00+05:30", // Nov 21, 2026 3:00 PM SLST
    },
    launchedAt: {
      type: Date,
      default: null,
    },
    launchedBy: {
      type: String,
      default: null,
    },
    zeroMessage: {
      type: String,
      default: "Standing by for Official Ignition by the Chief Guest...",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LaunchControl ||
  mongoose.model("LaunchControl", LaunchControlSchema);
