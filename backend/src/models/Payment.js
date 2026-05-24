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

    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "card", "cash", "mock"],
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
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentDate: {
      type: Date,
    },

    notes: {
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

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;