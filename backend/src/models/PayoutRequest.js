import mongoose from "mongoose";

const payoutRequestSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    method: {
      type: String,
      enum: ["bkash", "nagad", "bank"],
      required: true,
    },

    accountNumber: {
      type: String,
      trim: true,
      required: true,
    },

    accountHolderName: {
      type: String,
      trim: true,
      default: "",
    },

    bankName: {
      type: String,
      trim: true,
      default: "",
    },

    branchName: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["requested", "approved", "paid", "rejected"],
      default: "requested",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PayoutRequest = mongoose.model("PayoutRequest", payoutRequestSchema);

export default PayoutRequest;