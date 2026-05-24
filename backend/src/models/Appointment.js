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
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "waived"],
      default: "pending",
    },

    paymentAmount: {
      type: Number,
      default: 0,
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;