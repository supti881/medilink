import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    doctorAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "card", "cash", "bank", "mock"],
      default: "mock",
    },

    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    refundReason: {
      type: String,
      trim: true,
      default: "",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    gatewayResponse: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ doctor: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;