import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Medical record title is required"],
      trim: true,
      maxlength: 140,
    },

    category: {
      type: String,
      enum: [
        "previous_prescription",
        "lab_report",
        "xray_scan",
        "discharge_summary",
        "diagnosis_report",
        "allergy_record",
        "chronic_condition",
        "other",
      ],
      default: "other",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 800,
    },

    fileUrl: {
      type: String,
      required: [true, "Medical record file is required"],
      trim: true,
    },

    originalName: {
      type: String,
      trim: true,
      default: "",
    },

    mimeType: {
      type: String,
      trim: true,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    visibility: {
      type: String,
      enum: ["patient_only", "patient_doctor"],
      default: "patient_doctor",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.index({
  patient: 1,
  createdAt: -1,
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;