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
      enum: ["submitted", "under_review", "approved", "rejected", "issued"],
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

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    issuedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

replacementRequestSchema.index({ patient: 1, createdAt: -1 });
replacementRequestSchema.index({ status: 1, createdAt: -1 });
replacementRequestSchema.index({ requestType: 1, createdAt: -1 });
replacementRequestSchema.index({ paymentStatus: 1, createdAt: -1 });
replacementRequestSchema.index({ prescriptionToken: 1 });

const ReplacementRequest = mongoose.model(
  "ReplacementRequest",
  replacementRequestSchema
);

export default ReplacementRequest;