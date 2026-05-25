import Prescription from "../models/Prescription.js";
import ReplacementRequest from "../models/ReplacementRequest.js";

// Create replacement / reissue request
export const createReplacementRequest = async (req, res) => {
  try {
    const { prescriptionToken, requestType, reason } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can create replacement requests",
      });
    }

    if (!prescriptionToken || !requestType || !reason) {
      return res.status(400).json({
        success: false,
        message: "Prescription token, request type, and reason are required",
      });
    }

    const prescription = await Prescription.findOne({
      verificationToken: prescriptionToken,
      status: "active",
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found or invalid prescription token",
      });
    }

    if (prescription.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to request replacement for this prescription",
      });
    }

    const existingRequest = await ReplacementRequest.findOne({
      patient: req.user._id,
      prescriptionToken,
      status: {
        $in: ["submitted", "under_review"],
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have an active request for this prescription",
      });
    }

    const replacementRequest = await ReplacementRequest.create({
      patient: req.user._id,
      prescription: prescription._id,
      prescriptionToken,
      requestType,
      reason,
    });

    const populatedRequest = await ReplacementRequest.findById(
      replacementRequest._id
    )
      .populate("patient", "name email phone role")
      .populate("prescription");

    return res.status(201).json({
      success: true,
      message: "Replacement request submitted successfully",
      replacementRequest: populatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit replacement request",
      error: error.message,
    });
  }
};

// Get logged-in patient's replacement requests
export const getMyReplacementRequests = async (req, res) => {
  try {
    const requests = await ReplacementRequest.find({
      patient: req.user._id,
    })
      .populate("patient", "name email phone role")
      .populate("prescription")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch replacement requests",
      error: error.message,
    });
  }
};

// Admin: get all replacement requests
export const getAllReplacementRequests = async (req, res) => {
  try {
    const { status, requestType, paymentStatus } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (requestType) {
      filter.requestType = requestType;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const requests = await ReplacementRequest.find(filter)
      .populate("patient", "name email phone role")
      .populate("prescription")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch replacement requests",
      error: error.message,
    });
  }
};

// Admin: update replacement request
export const updateReplacementRequest = async (req, res) => {
  try {
    const { status, paymentStatus, adminNote } = req.body;

    const allowedStatus = ["submitted", "under_review", "approved", "rejected"];
    const allowedPaymentStatus = ["pending", "paid", "waived"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid replacement request status",
      });
    }

    if (paymentStatus && !allowedPaymentStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const replacementRequest = await ReplacementRequest.findById(req.params.id);

    if (!replacementRequest) {
      return res.status(404).json({
        success: false,
        message: "Replacement request not found",
      });
    }

    if (status) {
      replacementRequest.status = status;
      replacementRequest.reviewedBy = req.user._id;
      replacementRequest.reviewedAt = new Date();
    }

    if (paymentStatus) {
      replacementRequest.paymentStatus = paymentStatus;
    }

    if (adminNote !== undefined) {
      replacementRequest.adminNote = adminNote;
    }

    await replacementRequest.save();

    const updatedRequest = await ReplacementRequest.findById(
      replacementRequest._id
    )
      .populate("patient", "name email phone role")
      .populate("prescription")
      .populate("reviewedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Replacement request updated successfully",
      replacementRequest: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update replacement request",
      error: error.message,
    });
  }
};