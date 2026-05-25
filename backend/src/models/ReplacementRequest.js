import mongoose from "mongoose";

const replacementRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },

    prescriptionToken: {
      type: String,
      required: [true, "Prescription token is required"],
      trim: true,
    },

    requestType: {
      type: String,
      enum: ["lost", "damaged", "correction", "duplicate", "reissue"],
      required: [true, "Request type is required"],
    },

    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected"],
      default: "submitted",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ReplacementRequest = mongoose.model(
  "ReplacementRequest",
  replacementRequestSchema
);

export default ReplacementRequest;