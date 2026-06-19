import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import DoctorWallet from "../models/DoctorWallet.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

const PLATFORM_COMMISSION_PERCENTAGE =
  Number(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 10;

const JOIN_OPEN_MINUTES_BEFORE = 5;
const JOIN_CLOSE_MINUTES_AFTER = 10;

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

function normalizeText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^dr\.?\s+/i, "")
    .replace(/\s+/g, " ");
}

function normalizePhone(value = "") {
  return String(value || "").replace(/[^\d]/g, "");
}

function parseTimeToMinutes(timeValue = "") {
  const cleanValue = String(timeValue || "").trim();

  if (!cleanValue) {
    return null;
  }

  const twelveHourMatch = cleanValue.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (hours === 12) {
      hours = 0;
    }

    if (period === "PM") {
      hours += 12;
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return hours * 60 + minutes;
  }

  const twentyFourHourMatch = cleanValue.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return hours * 60 + minutes;
  }

  return null;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildDateAtMinutes(baseDate, minutesFromMidnight) {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  return addMinutes(date, minutesFromMidnight);
}

function buildQueueTiming({
  appointmentDate,
  slotStartTime,
  slotEndTime,
  queuePosition,
  consultationMinutes,
}) {
  const slotStartMinutes = parseTimeToMinutes(slotStartTime);
  const slotEndMinutes = parseTimeToMinutes(slotEndTime);

  if (slotStartMinutes === null || slotEndMinutes === null) {
    return {
      expectedStartTime: null,
      expectedEndTime: null,
      joinAvailableAt: null,
      joinExpiresAt: null,
    };
  }

  const safeQueuePosition = Math.max(Number(queuePosition) || 1, 1);
  const safeConsultationMinutes = Math.max(
    Number(consultationMinutes) || 10,
    5
  );

  const expectedStartMinutes =
    slotStartMinutes + (safeQueuePosition - 1) * safeConsultationMinutes;

  const expectedEndMinutes = expectedStartMinutes + safeConsultationMinutes;

  const maxEndMinutes =
    slotEndMinutes > slotStartMinutes ? slotEndMinutes : slotStartMinutes;

  const finalExpectedEndMinutes = Math.min(expectedEndMinutes, maxEndMinutes);

  const expectedStartTime = buildDateAtMinutes(
    appointmentDate,
    expectedStartMinutes
  );

  const expectedEndTime = buildDateAtMinutes(
    appointmentDate,
    finalExpectedEndMinutes
  );

  return {
    expectedStartTime,
    expectedEndTime,
    joinAvailableAt: addMinutes(expectedStartTime, -JOIN_OPEN_MINUTES_BEFORE),
    joinExpiresAt: addMinutes(expectedEndTime, JOIN_CLOSE_MINUTES_AFTER),
  };
}

function isDoctorApprovedForBooking(doctorProfile) {
  const doctorUser = doctorProfile?.user;

  return (
    doctorProfile &&
    doctorProfile.status === "active" &&
    doctorUser &&
    doctorUser.role === "doctor" &&
    (!doctorUser.status || doctorUser.status === "active")
  );
}

function addUniqueDoctorProfile(map, profile) {
  if (!profile?._id) return;
  map.set(String(profile._id), profile);
}

async function getDoctorProfilesForLoggedInDoctor(user) {
  const profileMap = new Map();

  const linkedProfile = await Doctor.findOne({
    user: user._id,
  }).populate("user", "name email phone role status isVerified profileImage");

  addUniqueDoctorProfile(profileMap, linkedProfile);

  const userName = normalizeText(user.name);
  const userEmail = normalizeText(user.email);
  const userPhone = normalizePhone(user.phone);

  const allDoctorProfiles = await Doctor.find({}).populate(
    "user",
    "name email phone role status isVerified profileImage"
  );

  allDoctorProfiles.forEach((profile) => {
    const profileName = normalizeText(profile.fullName || profile.user?.name);
    const profileEmail = normalizeText(profile.user?.email);
    const profilePhone = normalizePhone(profile.phone || profile.user?.phone);

    const sameUser = String(profile.user?._id || "") === String(user._id);
    const sameEmail = userEmail && profileEmail && userEmail === profileEmail;
    const samePhone = userPhone && profilePhone && userPhone === profilePhone;
    const sameName = userName && profileName && userName === profileName;

    if (sameUser || sameEmail || samePhone || sameName) {
      addUniqueDoctorProfile(profileMap, profile);
    }
  });

  return Array.from(profileMap.values());
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

    const doctorProfile = await Doctor.findById(doctor).populate(
      "user",
      "name email phone role status isVerified profileImage"
    );

    if (!isDoctorApprovedForBooking(doctorProfile)) {
      return res.status(403).json({
        success: false,
        message:
          "This doctor is not approved for appointments yet. Please choose an approved doctor.",
      });
    }

    const matchedSlot = doctorProfile.availableSlots.find(
      (slot) =>
        slot.day === appointmentDay &&
        slot.startTime === startTime &&
        slot.endTime === endTime &&
        slot.isActive !== false
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

    const slotCapacity = Math.max(Number(matchedSlot.capacity) || 1, 1);
    const consultationMinutes = Math.max(
      Number(matchedSlot.consultationMinutes) || 10,
      5
    );

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

    if (bookedCount >= slotCapacity) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is fully booked",
      });
    }

    const queuePosition = bookedCount + 1;

    const {
      expectedStartTime,
      expectedEndTime,
      joinAvailableAt,
      joinExpiresAt,
    } = buildQueueTiming({
      appointmentDate: selectedDate,
      slotStartTime: startTime,
      slotEndTime: endTime,
      queuePosition,
      consultationMinutes,
    });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: selectedDate,
      appointmentDay,
      startTime,
      endTime,
      slotStartTime: startTime,
      slotEndTime: endTime,
      queuePosition,
      slotCapacity,
      consultationMinutes,
      expectedStartTime,
      expectedEndTime,
      joinAvailableAt,
      joinExpiresAt,
      symptoms,
      medicalNotes,
      consultationType: consultationType || "video",
      paymentAmount: Number(doctorProfile.consultationFee) || 0,
      paymentStatus: "pending",
      earningStatus: "not_ready",
      earningReleased: false,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone role status profileImage")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role status profileImage",
        },
      });

    return res.status(201).json({
      success: true,
      message: `Appointment booked successfully. Your queue number is ${queuePosition}.`,
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
          select: "name email phone role status profileImage",
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
    const filter = {};

    if (req.user.role === "doctor") {
      const doctorProfiles = await getDoctorProfilesForLoggedInDoctor(req.user);
      const doctorProfileIds = doctorProfiles.map((profile) => profile._id);

      if (doctorProfileIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          appointments: [],
        });
      }

      filter.doctor = {
        $in: doctorProfileIds,
      };
    }

    if (req.user.role === "admin" && req.query.doctor) {
      filter.doctor = req.query.doctor;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone role status profileImage")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role status profileImage",
        },
      })
      .sort({
        appointmentDate: 1,
        startTime: 1,
        queuePosition: 1,
        createdAt: -1,
      });

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
      const doctorProfiles = await getDoctorProfilesForLoggedInDoctor(req.user);
      const matchedDoctorProfile = doctorProfiles.find(
        (profile) => String(profile._id) === String(appointment.doctor)
      );

      if (!matchedDoctorProfile) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this appointment",
        });
      }

      if (!isDoctorApprovedForBooking(matchedDoctorProfile)) {
        return res.status(403).json({
          success: false,
          message:
            "Your doctor account is not approved or active. Appointment actions are disabled.",
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

      if (
        meetingLink !== undefined ||
        paymentStatus !== undefined ||
        paymentReference !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message: "Patients cannot update meeting or payment information",
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
      .populate("patient", "name email phone role status profileImage")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role status profileImage",
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