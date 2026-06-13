import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
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

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    doctorAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["mock", "bkash", "nagad", "card", "bank"],
      default: "mock",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "released", "failed", "refunded"],
      default: "paid",
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    releasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentTransaction = mongoose.model(
  "PaymentTransaction",
  paymentTransactionSchema
);

export default PaymentTransaction;