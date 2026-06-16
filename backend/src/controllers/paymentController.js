import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import DoctorWallet from "../models/DoctorWallet.js";
import Payment from "../models/Payment.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import PayoutRequest from "../models/PayoutRequest.js";

const PLATFORM_COMMISSION_PERCENTAGE =
  Number(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 10;

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "cancelled"];
const PAYMENT_METHODS = [
  "bkash",
  "nagad",
  "rocket",
  "card",
  "cash",
  "bank",
  "mock",
];

const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `ML-PAY-${timestamp}-${randomNumber}`;
};

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
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

function getPaymentStatusFromAction(actionOrStatus = "") {
  const value = String(actionOrStatus || "").trim().toLowerCase();

  const statusMap = {
    verify: "paid",
    verified: "paid",
    paid: "paid",
    approve: "paid",
    approved: "paid",

    pending: "pending",

    fail: "failed",
    failed: "failed",
    mark_failed: "failed",

    refund: "refunded",
    refunded: "refunded",

    cancel: "cancelled",
    cancelled: "cancelled",
  };

  return statusMap[value] || "";
}

function getAppointmentPaymentStatus(paymentStatus) {
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "refunded") return "refunded";
  if (paymentStatus === "failed") return "failed";
  if (paymentStatus === "cancelled") return "failed";

  return "pending";
}

function getPaymentTransactionStatus(paymentStatus, appointment) {
  if (
    paymentStatus === "paid" &&
    appointment?.status === "completed" &&
    appointment?.earningReleased
  ) {
    return "released";
  }

  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "refunded") return "refunded";
  if (paymentStatus === "failed") return "failed";

  return "pending";
}

function populatePayment(query) {
  return query
    .populate("patient", "name email phone role status profileImage")
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "name email phone role status profileImage",
      },
    })
    .populate({
      path: "appointment",
      populate: [
        {
          path: "patient",
          select: "name email phone role status profileImage",
        },
        {
          path: "doctor",
          populate: {
            path: "user",
            select: "name email phone role status profileImage",
          },
        },
      ],
    })
    .populate("verifiedBy", "name email role");
}

async function populatePaymentById(paymentId) {
  return populatePayment(Payment.findById(paymentId));
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
      $set: {
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

async function syncTransactionFromPayment(payment, appointment) {
  if (!payment || !appointment) return null;

  const transactionStatus = getPaymentTransactionStatus(
    payment.status,
    appointment
  );

  if (payment.status === "cancelled") {
    return null;
  }

  return PaymentTransaction.findOneAndUpdate(
    {
      appointment: appointment._id,
    },
    {
      $set: {
        patient: payment.patient,
        doctor: payment.doctor,
        appointment: appointment._id,
        amount: payment.amount || 0,
        platformFee: payment.platformFee || 0,
        doctorAmount: payment.doctorAmount || 0,
        paymentMethod: payment.paymentMethod || "mock",
        status: transactionStatus,
        reference: payment.transactionId || appointment.paymentReference || "",
        releasedAt:
          transactionStatus === "released"
            ? appointment.earningReleasedAt || new Date()
            : null,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
}

async function syncAppointmentFromPayment(payment) {
  if (!payment?.appointment) return null;

  const appointment = await Appointment.findById(payment.appointment);

  if (!appointment) return null;

  appointment.paymentStatus = getAppointmentPaymentStatus(payment.status);
  appointment.paymentReference =
    payment.transactionId || appointment.paymentReference || "";
  appointment.paymentAmount = payment.amount || appointment.paymentAmount || 0;
  appointment.platformFee = payment.platformFee || 0;
  appointment.doctorEarning = payment.doctorAmount || 0;

  if (payment.status === "paid") {
    const { platformFee, doctorEarning } = calculateDoctorEarning(
      payment.amount || appointment.paymentAmount
    );

    appointment.platformFee = platformFee;
    appointment.doctorEarning = doctorEarning;
  }

  if (payment.status === "refunded") {
    appointment.earningStatus = "refunded";
  }

  if (["failed", "cancelled"].includes(payment.status)) {
    appointment.earningStatus = appointment.earningReleased
      ? appointment.earningStatus
      : "not_ready";
  }

  await appointment.save();

  const releasedAppointment = await releaseDoctorEarningIfReady(appointment);

  const finalAppointment = releasedAppointment || appointment;

  await syncTransactionFromPayment(payment, finalAppointment);

  return finalAppointment;
}

function buildPaymentFilter(query = {}) {
  const filter = {};

  if (query.status && PAYMENT_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.paymentMethod && PAYMENT_METHODS.includes(query.paymentMethod)) {
    filter.paymentMethod = query.paymentMethod;
  }

  if (query.patient) {
    filter.patient = query.patient;
  }

  if (query.doctor) {
    filter.doctor = query.doctor;
  }

  if (query.appointment) {
    filter.appointment = query.appointment;
  }

  if (query.search) {
    const search = normalizeText(query.search);

    filter.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { paymentMethod: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { adminNote: { $regex: search, $options: "i" } },
      { refundReason: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
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

    if (["cancelled", "no_show"].includes(appointmentData.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled or no-show appointment",
      });
    }

    const existingPayment = await Payment.findOne({
      appointment: appointmentData._id,
    });

    if (existingPayment?.status === "paid") {
      return res.status(409).json({
        success: false,
        message: "Payment record already exists for this appointment",
      });
    }

    const finalTransactionId =
      existingPayment?.transactionId || generateTransactionId();

    const { amount, platformFee, doctorEarning } = calculateDoctorEarning(
      appointmentData.paymentAmount
    );

    const paymentPayload = {
      appointment: appointmentData._id,
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      amount,
      platformFee,
      doctorAmount: doctorEarning,
      paymentMethod: PAYMENT_METHODS.includes(paymentMethod)
        ? paymentMethod
        : "mock",
      transactionId: finalTransactionId,
      status: "paid",
      paymentDate: new Date(),
      gatewayResponse: {
        provider: "MediLink Mock Payment",
        verified: true,
        message: "Mock payment completed successfully",
      },
    };

    const payment = existingPayment
      ? await Payment.findByIdAndUpdate(existingPayment._id, paymentPayload, {
          new: true,
          runValidators: true,
        })
      : await Payment.create(paymentPayload);

    appointmentData.paymentStatus = "paid";
    appointmentData.paymentReference = finalTransactionId;
    appointmentData.platformFee = platformFee;
    appointmentData.doctorEarning = doctorEarning;

    await appointmentData.save();

    const releasedAppointment = await releaseDoctorEarningIfReady(
      appointmentData
    );

    await syncTransactionFromPayment(payment, releasedAppointment || appointmentData);

    const populatedPayment = await populatePaymentById(payment._id);

    return res.status(201).json({
      success: true,
      message: releasedAppointment
        ? "Payment completed and doctor earning released successfully"
        : "Payment completed successfully",
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
    const filter = {};

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

    if (req.user.role === "admin" && req.query.status) {
      const status = getPaymentStatusFromAction(req.query.status);

      if (status) {
        filter.status = status;
      }
    }

    const payments = await populatePayment(
      Payment.find(filter).sort({ createdAt: -1 })
    );

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

    const payment = await populatePaymentById(req.params.id);

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

export const getAdminPayments = async (req, res) => {
  try {
    const filter = buildPaymentFilter(req.query);

    const payments = await populatePayment(
      Payment.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin payments",
      error: error.message,
    });
  }
};

export const getAdminPaymentSummary = async (req, res) => {
  try {
    const payments = await Payment.find();

    const summary = payments.reduce(
      (accumulator, payment) => {
        const amount = Number(payment.amount) || 0;
        const platformFee = Number(payment.platformFee) || 0;
        const doctorAmount = Number(payment.doctorAmount) || 0;

        accumulator.totalTransactions += 1;

        if (payment.status === "paid") {
          accumulator.paidTransactions += 1;
          accumulator.totalRevenue += amount;
          accumulator.platformFeeTotal += platformFee;
          accumulator.doctorEarningTotal += doctorAmount;
        }

        if (payment.status === "pending") {
          accumulator.pendingTransactions += 1;
          accumulator.pendingAmount += amount;
        }

        if (payment.status === "failed") {
          accumulator.failedTransactions += 1;
          accumulator.failedAmount += amount;
        }

        if (payment.status === "refunded") {
          accumulator.refundedTransactions += 1;
          accumulator.refundedAmount += amount;
        }

        if (payment.status === "cancelled") {
          accumulator.cancelledTransactions += 1;
          accumulator.cancelledAmount += amount;
        }

        return accumulator;
      },
      {
        totalTransactions: 0,
        paidTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        refundedTransactions: 0,
        cancelledTransactions: 0,

        totalRevenue: 0,
        platformFeeTotal: 0,
        doctorEarningTotal: 0,
        pendingAmount: 0,
        failedAmount: 0,
        refundedAmount: 0,
        cancelledAmount: 0,
      }
    );

    const wallets = await DoctorWallet.find();

    const walletSummary = wallets.reduce(
      (accumulator, wallet) => {
        accumulator.totalEarned += Number(wallet.totalEarned) || 0;
        accumulator.availableBalance += Number(wallet.availableBalance) || 0;
        accumulator.pendingBalance += Number(wallet.pendingBalance) || 0;
        accumulator.withdrawnBalance += Number(wallet.withdrawnBalance) || 0;
        accumulator.platformFeeTotal += Number(wallet.platformFeeTotal) || 0;

        return accumulator;
      },
      {
        totalEarned: 0,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnBalance: 0,
        platformFeeTotal: 0,
      }
    );

    const payoutRequests = await PayoutRequest.find();

    const payoutSummary = payoutRequests.reduce(
      (accumulator, payout) => {
        const amount = Number(payout.amount) || 0;

        accumulator.totalPayoutRequests += 1;

        if (payout.status === "requested") {
          accumulator.requestedPayoutAmount += amount;
          accumulator.requestedPayouts += 1;
        }

        if (payout.status === "approved") {
          accumulator.approvedPayoutAmount += amount;
          accumulator.approvedPayouts += 1;
        }

        if (payout.status === "paid") {
          accumulator.paidPayoutAmount += amount;
          accumulator.paidPayouts += 1;
        }

        if (payout.status === "rejected") {
          accumulator.rejectedPayoutAmount += amount;
          accumulator.rejectedPayouts += 1;
        }

        return accumulator;
      },
      {
        totalPayoutRequests: 0,
        requestedPayouts: 0,
        approvedPayouts: 0,
        paidPayouts: 0,
        rejectedPayouts: 0,

        requestedPayoutAmount: 0,
        approvedPayoutAmount: 0,
        paidPayoutAmount: 0,
        rejectedPayoutAmount: 0,
      }
    );

    return res.status(200).json({
      success: true,
      summary: {
        ...summary,
        wallet: walletSummary,
        payouts: payoutSummary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin payment summary",
      error: error.message,
    });
  }
};

export const updatePaymentStatusByAdmin = async (req, res) => {
  try {
    const requestedStatus = getPaymentStatusFromAction(
      req.body.status || req.body.action
    );

    if (!requestedStatus || !PAYMENT_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment action. Use paid, failed, refunded, cancelled or pending.",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const appointment = await Appointment.findById(payment.appointment);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Connected appointment not found",
      });
    }

    if (
      appointment.earningReleased &&
      ["pending", "failed", "cancelled"].includes(requestedStatus)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Doctor earning is already released. This payment cannot be moved back to pending, failed or cancelled.",
      });
    }

    if (appointment.earningReleased && requestedStatus === "refunded") {
      return res.status(409).json({
        success: false,
        message:
          "Doctor earning is already released. Handle refund manually after payout adjustment.",
      });
    }

    const adminNote = normalizeText(req.body.adminNote);
    const refundReason = normalizeText(req.body.refundReason);
    const transactionId = normalizeText(req.body.transactionId);

    const { platformFee, doctorEarning } = calculateDoctorEarning(
      payment.amount
    );

    payment.status = requestedStatus;
    payment.platformFee = requestedStatus === "paid" ? platformFee : 0;
    payment.doctorAmount = requestedStatus === "paid" ? doctorEarning : 0;
    payment.adminNote = adminNote || payment.adminNote || "";
    payment.verifiedBy = req.user._id;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    if (requestedStatus === "paid") {
      payment.paymentDate = payment.paymentDate || new Date();
      payment.verifiedAt = new Date();
      payment.failedAt = null;
      payment.refundedAt = null;
      payment.cancelledAt = null;
      payment.refundReason = "";
    }

    if (requestedStatus === "pending") {
      payment.paymentDate = null;
      payment.verifiedAt = null;
      payment.failedAt = null;
      payment.refundedAt = null;
      payment.cancelledAt = null;
      payment.refundReason = "";
    }

    if (requestedStatus === "failed") {
      payment.failedAt = new Date();
      payment.refundedAt = null;
      payment.cancelledAt = null;
      payment.refundReason = "";
    }

    if (requestedStatus === "refunded") {
      payment.refundedAt = new Date();
      payment.refundReason =
        refundReason || "Payment refunded by MediLink admin.";
    }

    if (requestedStatus === "cancelled") {
      payment.cancelledAt = new Date();
      payment.refundReason = "";
    }

    await payment.save();

    const updatedAppointment = await syncAppointmentFromPayment(payment);
    const updatedPayment = await populatePaymentById(payment._id);

    return res.status(200).json({
      success: true,
      message:
        updatedAppointment?.earningReleased && requestedStatus === "paid"
          ? "Payment updated and doctor earning released successfully"
          : `Payment marked as ${requestedStatus}`,
      payment: updatedPayment,
      appointment: updatedAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};