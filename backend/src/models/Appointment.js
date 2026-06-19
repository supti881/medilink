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
      required: true,
    },

    appointmentDay: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    slotStartTime: {
      type: String,
      default: "",
      trim: true,
    },

    slotEndTime: {
      type: String,
      default: "",
      trim: true,
    },

    queuePosition: {
      type: Number,
      default: 1,
      min: 1,
    },

    slotCapacity: {
      type: Number,
      default: 1,
      min: 1,
    },

    consultationMinutes: {
      type: Number,
      default: 10,
      min: 5,
    },

    expectedStartTime: {
      type: Date,
      default: null,
    },

    expectedEndTime: {
      type: Date,
      default: null,
    },

    joinAvailableAt: {
      type: Date,
      default: null,
    },

    joinExpiresAt: {
      type: Date,
      default: null,
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
      enum: ["video", "in_person"],
      default: "video",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },

    paymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "waived"],
      default: "pending",
    },

    paymentReference: {
      type: String,
      trim: true,
      default: "",
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
      enum: ["not_ready", "released"],
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
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({
  doctor: 1,
  appointmentDate: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
});

appointmentSchema.index({
  patient: 1,
  appointmentDate: 1,
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;