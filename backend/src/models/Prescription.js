import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },

    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true,
    },

    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true,
    },

    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },

    symptoms: {
      type: String,
      trim: true,
      default: "",
    },

    medicines: {
      type: [medicineSchema],
      default: [],
    },

    tests: {
      type: [String],
      default: [],
    },

    advice: {
      type: String,
      trim: true,
      default: "",
    },

    followUpDate: {
      type: Date,
    },

    verificationToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "reissued"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;