import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Payment from "../models/Payment.js";
import DoctorWallet from "../models/DoctorWallet.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

const PLATFORM_COMMISSION_PERCENTAGE =
  Number(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 10;

const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `ML-PAY-${timestamp}-${randomNumber}`;
};

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

export const createMockPayment = async (req, res) => {
  try {
    const { appointment, paymentMethod } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can make payments",
      });
    }

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointmentData = await Appointment.findById(appointment);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointmentData.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this appointment",
      });
    }

    if (appointmentData.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Payment has already been completed for this appointment",
      });
    }

    if (appointmentData.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled appointment",
      });
    }

    const existingPayment = await Payment.findOne({
      appointment: appointmentData._id,
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment record already exists for this appointment",
      });
    }

    const finalTransactionId = generateTransactionId();

    const { amount, platformFee, doctorEarning } = calculateDoctorEarning(
      appointmentData.paymentAmount
    );

    const payment = await Payment.create({
      appointment: appointmentData._id,
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      amount,
      paymentMethod: paymentMethod || "mock",
      transactionId: finalTransactionId,
      status: "paid",
      paymentDate: new Date(),

      gatewayResponse: {
        provider: "MediLink Mock Payment",
        verified: true,
        message: "Mock payment completed successfully",
      },
    });

    appointmentData.paymentStatus = "paid";
    appointmentData.paymentReference = finalTransactionId;
    appointmentData.platformFee = platformFee;
    appointmentData.doctorEarning = doctorEarning;

    await appointmentData.save();

    await releaseDoctorEarningIfReady(appointmentData);

    const populatedPayment = await Payment.findById(payment._id)
      .populate("patient", "name email phone role")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate("appointment");

    return res.status(201).json({
      success: true,
      message: "Payment completed successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter.patient = req.user._id;
    }

    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({
        user: req.user._id,
      });

      if (!doctorProfile) {
        return res.status(200).json({
          success: true,
          count: 0,
          payments: [],
        });
      }

      filter.doctor = doctorProfile._id;
    }

    const payments = await Payment.find(filter)
      .populate("patient", "name email phone role")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    if (req.params.id === "my") {
      return res.status(400).json({
        success: false,
        message: "Use GET /api/payments/my for your payment history",
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate("patient", "name email phone role")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate("appointment");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (
      req.user.role === "patient" &&
      payment.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this payment",
      });
    }

    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({
        user: req.user._id,
      });

      if (
        !doctorProfile ||
        payment.doctor._id.toString() !== doctorProfile._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to view this payment",
        });
      }
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};