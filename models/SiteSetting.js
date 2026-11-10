import mongoose from "mongoose";

const SiteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global_site_content",
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    updatedBy: {
      type: String,
      default: "super_admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", SiteSettingSchema);
