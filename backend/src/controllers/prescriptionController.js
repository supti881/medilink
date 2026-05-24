import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Prescription from "../models/Prescription.js";

const generatePrescriptionToken = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `RX-ML-${year}-${randomNumber}`;
};

// Create prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      appointment,
      diagnosis,
      symptoms,
      medicines,
      tests,
      advice,
      followUpDate,
    } = req.body;

    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can create prescriptions",
      });
    }

    if (!appointment || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Appointment and diagnosis are required",
      });
    }

    const appointmentData = await Appointment.findById(appointment);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const doctorProfile = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    if (appointmentData.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to prescribe for this appointment",
      });
    }

    if (!["approved", "completed"].includes(appointmentData.status)) {
      return res.status(400).json({
        success: false,
        message: "Prescription can be created only for approved or completed appointments",
      });
    }

    const existingPrescription = await Prescription.findOne({
      appointment,
    });

    if (existingPrescription) {
      return res.status(409).json({
        success: false,
        message: "Prescription already exists for this appointment",
      });
    }

    let verificationToken = generatePrescriptionToken();

    const existingToken = await Prescription.findOne({
      verificationToken,
    });

    if (existingToken) {
      verificationToken = generatePrescriptionToken();
    }

    const prescription = await Prescription.create({
      appointment,
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      diagnosis,
      symptoms,
      medicines: medicines || [],
      tests: tests || [],
      advice,
      followUpDate,
      verificationToken,
    });

    appointmentData.status = "completed";
    await appointmentData.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
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
      message: "Prescription created successfully",
      prescription: populatedPrescription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};

// Get logged-in user's prescriptions
export const getMyPrescriptions = async (req, res) => {
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
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      filter.doctor = doctorProfile._id;
    }

    const prescriptions = await Prescription.find(filter)
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
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

// Verify prescription by token
export const verifyPrescription = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Prescription verification token is required",
      });
    }

    const prescription = await Prescription.findOne({
      verificationToken: token,
      status: "active",
    })
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate("appointment");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found or invalid token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription verified successfully",
      prescription: {
        id: prescription._id,
        verificationToken: prescription.verificationToken,
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        medicines: prescription.medicines,
        tests: prescription.tests,
        advice: prescription.advice,
        followUpDate: prescription.followUpDate,
        patient: prescription.patient,
        doctor: prescription.doctor,
        appointment: prescription.appointment,
        issuedAt: prescription.createdAt,
        status: prescription.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Prescription verification failed",
      error: error.message,
    });
  }
};