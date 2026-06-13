import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import DoctorWallet from "../models/DoctorWallet.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

const PLATFORM_COMMISSION_PERCENTAGE =
  Number(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 10;

function calculateDoctorEarning(amount = 0) {
  const safeAmount = Math.max(Number(amount) || 0, 0);
  const platformFee = Math.round(
    (safeAmount * PLATFORM_COMMISSION_PERCENTAGE) / 100
  );
  const doctorEarning = Math.max(safeAmount - platformFee, 0);

  return {
    amount: safeAmount,
    platformFee,
    doctorEarning,
  };
}

async function releaseDoctorEarningIfReady(appointment) {
  if (!appointment) return null;

  const isReady =
    appointment.status === "completed" &&
    appointment.paymentStatus === "paid" &&
    !appointment.earningReleased;

  if (!isReady) {
    return null;
  }

  const { amount, platformFee, doctorEarning } = calculateDoctorEarning(
    appointment.paymentAmount
  );

  if (amount <= 0 || doctorEarning <= 0) {
    return null;
  }

  const releasedAppointment = await Appointment.findOneAndUpdate(
    {
      _id: appointment._id,
      status: "completed",
      paymentStatus: "paid",
      earningReleased: { $ne: true },
    },
    {
      $set: {
        platformFee,
        doctorEarning,
        earningStatus: "released",
        earningReleased: true,
        earningReleasedAt: new Date(),
      },
    },
    {
      new: true,
    }
  );

  if (!releasedAppointment) {
    return null;
  }

  await DoctorWallet.findOneAndUpdate(
    {
      doctor: releasedAppointment.doctor,
    },
    {
      $setOnInsert: {
        doctor: releasedAppointment.doctor,
      },
      $inc: {
        totalEarned: doctorEarning,
        availableBalance: doctorEarning,
        platformFeeTotal: platformFee,
        totalPaidAppointments: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  await PaymentTransaction.findOneAndUpdate(
    {
      appointment: releasedAppointment._id,
    },
    {
      $setOnInsert: {
        patient: releasedAppointment.patient,
        doctor: releasedAppointment.doctor,
        appointment: releasedAppointment._id,
        amount,
        platformFee,
        doctorAmount: doctorEarning,
        paymentMethod: "mock",
        status: "released",
        reference:
          releasedAppointment.paymentReference ||
          `MEDILINK-${releasedAppointment._id}`,
        releasedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return releasedAppointment;
}

export const bookAppointment = async (req, res) => {
  try {
    const {
      doctor,
      appointmentDate,
      appointmentDay,
      startTime,
      endTime,
      symptoms,
      medicalNotes,
      consultationType,
    } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments",
      });
    }

    if (
      !doctor ||
      !appointmentDate ||
      !appointmentDay ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, appointment date, day, start time, and end time are required",
      });
    }

    const doctorProfile = await Doctor.findById(doctor);

    if (!doctorProfile || doctorProfile.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or inactive",
      });
    }

    const matchedSlot = doctorProfile.availableSlots.find(
      (slot) =>
        slot.day === appointmentDay &&
        slot.startTime === startTime &&
        slot.endTime === endTime &&
        slot.isActive
    );

    if (!matchedSlot) {
      return res.status(400).json({
        success: false,
        message: "Selected slot is not available for this doctor",
      });
    }

    const selectedDate = new Date(appointmentDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    selectedDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const existingAppointment = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDate,
      },
      startTime,
      endTime,
      status: {
        $in: ["pending", "approved"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment for this doctor in this slot",
      });
    }

    const bookedCount = await Appointment.countDocuments({
      doctor,
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDate,
      },
      startTime,
      endTime,
      status: {
        $in: ["pending", "approved"],
      },
    });

    if (bookedCount >= matchedSlot.capacity) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is fully booked",
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: selectedDate,
      appointmentDay,
      startTime,
      endTime,
      symptoms,
      medicalNotes,
      consultationType: consultationType || "video",
      paymentAmount: Number(doctorProfile.consultationFee) || 0,
      paymentStatus: "pending",
      earningStatus: "not_ready",
      earningReleased: false,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone role")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .sort({ appointmentDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({
        user: req.user._id,
      });

      if (!doctorProfile) {
        return res.status(200).json({
          success: true,
          count: 0,
          appointments: [],
        });
      }

      filter.doctor = doctorProfile._id;
    }

    if (req.user.role === "admin" && req.query.doctor) {
      filter.doctor = req.query.doctor;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone role")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .sort({ appointmentDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, meetingLink, paymentStatus, paymentReference } = req.body;

    const allowedStatus = ["pending", "approved", "completed", "cancelled"];
    const allowedPaymentStatus = ["pending", "paid", "failed", "waived"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    if (paymentStatus && !allowedPaymentStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({
        user: req.user._id,
      });

      if (
        !doctorProfile ||
        appointment.doctor.toString() !== doctorProfile._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this appointment",
        });
      }
    }

    if (req.user.role === "patient") {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this appointment",
        });
      }

      if (status && status !== "cancelled") {
        return res.status(403).json({
          success: false,
          message: "Patients can only cancel appointments",
        });
      }
    }

    if (status) appointment.status = status;
    if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    if (paymentReference !== undefined) {
      appointment.paymentReference = paymentReference;
    }

    await appointment.save();

    const releasedAppointment = await releaseDoctorEarningIfReady(appointment);

    if (releasedAppointment) {
      appointment = releasedAppointment;
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone role")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      });

    return res.status(200).json({
      success: true,
      message: releasedAppointment
        ? "Appointment updated and doctor earning released successfully"
        : "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};