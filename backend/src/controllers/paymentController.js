import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Payment from "../models/Payment.js";

const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `ML-PAY-${timestamp}-${randomNumber}`;
};

// Create mock payment
export const createMockPayment = async (req, res) => {
  try {
    const { appointment, paymentMethod } = req.body;
    // console.log(req)
    console.log("Body",req.body)
    console.log("user of request",req.user)

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
    console.log("appointmentData",appointmentData)

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
    
    console.log("existingPayment",existingPayment)
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment record already exists for this appointment",
      });
    }

    const finalTransactionId =  generateTransactionId();
        console.log("finalTransactionId",finalTransactionId)

//         appointmentData {
//   _id: new ObjectId('6a1d55f1d1acfd9085f7d625'),
//   patient: new ObjectId('6a1d16072407068797af05d4'),
//   doctor: new ObjectId('6a1403108c35909baa451dbc'),
//   appointmentDate: 2026-06-02T18:00:00.000Z,
//   appointmentDay: 'Wednesday',
//   startTime: '10:00 AM',
//   endTime: '01:00 PM',
//   symptoms: 'headache',
//   medicalNotes: '',
//   consultationType: 'video',
//   status: 'pending',
//   paymentStatus: 'pending',
//   paymentAmount: 750,
//   meetingLink: '',
//   createdAt: 2026-06-01T09:50:41.600Z,
//   updatedAt: 2026-06-01T09:50:41.600Z,
//   __v: 0
// }

    const payment = await Payment.create({
      appointment: appointmentData._id,
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      amount: appointmentData.paymentAmount,
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
    console.log("payment",payment)

    appointmentData.paymentStatus = "paid";

    await appointmentData.save();
    console.log(appointmentData)

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

// Get logged-in user's payment history
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

    if (req.user.role === "admin") {
      // Admin sees all payments
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
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

// Get single payment by ID
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