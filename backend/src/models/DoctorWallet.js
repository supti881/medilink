import mongoose from "mongoose";

const doctorWalletSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    totalEarned: {
      type: Number,
      default: 0,
    },

    availableBalance: {
      type: Number,
      default: 0,
    },

    pendingBalance: {
      type: Number,
      default: 0,
    },

    withdrawnBalance: {
      type: Number,
      default: 0,
    },

    platformFeeTotal: {
      type: Number,
      default: 0,
    },

    totalPaidAppointments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DoctorWallet = mongoose.model("DoctorWallet", doctorWalletSchema);

export default DoctorWallet;