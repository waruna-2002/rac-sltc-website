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
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: [true, "Gender is required"],
      default: "Male",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, "University ID is required"],
      trim: true,
    },
    nic: {
      type: String,
      required: [true, "NIC Number is required"],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, "Contact number (WhatsApp) is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      required: [true, "Date of birth is required"],
      trim: true,
    },
    yearOfStudy: {
      type: String,
      required: [true, "Year of study is required"],
      enum: ["2028A", "2028B", "2029A", "2029B", "2030A"],
      default: "2028A",
    },
    faculty: {
      type: String,
      required: [true, "Faculty is required"],
      enum: [
        "Technology",
        "Engineering",
        "Business Management",
        "IT",
        "Science",
        "Music",
        "Other",
      ],
      default: "IT",
    },
    avenue: {
      type: String,
      required: [true, "Avenue is required"],
      enum: [
        "Community Service Avenue",
        "Club Service Avenue",
        "Professional Development Avenue",
        "Membership Development Avenue",
        "International Service Avenue",
        "Public Relations and Public Image",
        "Sports and Recreational Activities",
        "Environmental Service Avenue",
      ],
      default: "Community Service Avenue",
    },
    avenues: {
      type: [String],
      default: [],
    },
    otherClub: {
      type: String,
      default: "",
      trim: true,
    },
    reason: {
      type: String,
      default: "",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    photoFileName: {
      type: String,
      default: "",
    },
    paymentReceiptUrl: {
      type: String,
      default: "",
    },
    paymentReceiptFileName: {
      type: String,
      default: "",
    },
    agreedToTerms: {
      type: Boolean,
      default: true,
      required: [true, "You must agree to the club commitment terms"],
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
