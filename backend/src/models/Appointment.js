import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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

    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },

    appointmentDay: {
      type: String,
      required: [true, "Appointment day is required"],
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    symptoms: {
      type: String,
      trim: true,
      default: "",
    },

    medicalNotes: {
      type: String,
      trim: true,
      default: "",
    },

    consultationType: {
      type: String,
      enum: ["video", "audio", "chat"],
      default: "video",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled", "no_show"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "waived", "refunded"],
      default: "pending",
    },

    paymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    doctorEarning: {
      type: Number,
      default: 0,
      min: 0,
    },

    earningStatus: {
      type: String,
      enum: ["not_ready", "released", "refunded"],
      default: "not_ready",
    },

    earningReleased: {
      type: Boolean,
      default: false,
    },

    earningReleasedAt: {
      type: Date,
      default: null,
    },

    paymentReference: {
      type: String,
      trim: true,
      default: "",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    statusUpdatedAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    noShowAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: -1 });
appointmentSchema.index({ paymentStatus: 1, createdAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;