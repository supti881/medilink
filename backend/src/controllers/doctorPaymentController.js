import Doctor from "../models/Doctor.js";
import DoctorWallet from "../models/DoctorWallet.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import PayoutRequest from "../models/PayoutRequest.js";

const allowedPayoutMethods = ["bkash", "nagad", "bank"];
const allowedAdminStatuses = ["approved", "paid", "rejected"];

async function getLoggedInDoctorProfile(userId) {
  return Doctor.findOne({ user: userId }).populate(
    "user",
    "name email phone role"
  );
}

export const getDoctorPaymentSummary = async (req, res) => {
  try {
    const doctorProfile = await getLoggedInDoctorProfile(req.user._id);

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const wallet = await DoctorWallet.findOneAndUpdate(
      { doctor: doctorProfile._id },
      {
        $setOnInsert: {
          doctor: doctorProfile._id,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const transactions = await PaymentTransaction.find({
      doctor: doctorProfile._id,
    })
      .populate("patient", "name email phone role")
      .populate("appointment")
      .sort({ createdAt: -1 })
      .limit(20);

    const payoutRequests = await PayoutRequest.find({
      doctor: doctorProfile._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      doctor: doctorProfile,
      wallet,
      transactions,
      payoutRequests,
      summary: {
        totalEarned: wallet.totalEarned || 0,
        availableBalance: wallet.availableBalance || 0,
        pendingBalance: wallet.pendingBalance || 0,
        withdrawnBalance: wallet.withdrawnBalance || 0,
        platformFeeTotal: wallet.platformFeeTotal || 0,
        totalPaidAppointments: wallet.totalPaidAppointments || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor payment summary",
      error: error.message,
    });
  }
};

export const createPayoutRequest = async (req, res) => {
  try {
    const {
      amount,
      method,
      accountNumber,
      accountHolderName,
      bankName,
      branchName,
      note,
    } = req.body;

    const doctorProfile = await getLoggedInDoctorProfile(req.user._id);

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const requestedAmount = Number(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payout amount is required",
      });
    }

    if (!allowedPayoutMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Payout method must be bkash, nagad or bank",
      });
    }

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account number is required",
      });
    }

    const payoutRequest = await PayoutRequest.create({
      doctor: doctorProfile._id,
      amount: requestedAmount,
      method,
      accountNumber,
      accountHolderName,
      bankName,
      branchName,
      note,
      status: "requested",
      requestedAt: new Date(),
    });

    const updatedWallet = await DoctorWallet.findOneAndUpdate(
      {
        doctor: doctorProfile._id,
        availableBalance: { $gte: requestedAmount },
      },
      {
        $inc: {
          availableBalance: -requestedAmount,
          pendingBalance: requestedAmount,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedWallet) {
      await PayoutRequest.findByIdAndDelete(payoutRequest._id);

      return res.status(400).json({
        success: false,
        message: "Insufficient available balance for this payout request",
      });
    }

    const populatedRequest = await PayoutRequest.findById(payoutRequest._id)
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Payout request submitted successfully",
      payoutRequest: populatedRequest,
      wallet: updatedWallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create payout request",
      error: error.message,
    });
  }
};

export const getMyPayoutRequests = async (req, res) => {
  try {
    const doctorProfile = await getLoggedInDoctorProfile(req.user._id);

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const payoutRequests = await PayoutRequest.find({
      doctor: doctorProfile._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payoutRequests.length,
      payoutRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payout requests",
      error: error.message,
    });
  }
};

export const getAllPayoutRequests = async (req, res) => {
  try {
    const payoutRequests = await PayoutRequest.find()
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payoutRequests.length,
      payoutRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payout requests",
      error: error.message,
    });
  }
};

export const updatePayoutRequestStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!allowedAdminStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved, paid or rejected",
      });
    }

    const payoutRequest = await PayoutRequest.findById(req.params.id);

    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: "Payout request not found",
      });
    }

    if (["paid", "rejected"].includes(payoutRequest.status)) {
      return res.status(409).json({
        success: false,
        message: `This payout request is already ${payoutRequest.status}`,
      });
    }

    if (status === "approved") {
      payoutRequest.status = "approved";
      payoutRequest.adminNote = adminNote || payoutRequest.adminNote;
      payoutRequest.approvedAt = new Date();
    }

    if (status === "paid") {
      const updatedWallet = await DoctorWallet.findOneAndUpdate(
        {
          doctor: payoutRequest.doctor,
          pendingBalance: { $gte: payoutRequest.amount },
        },
        {
          $inc: {
            pendingBalance: -payoutRequest.amount,
            withdrawnBalance: payoutRequest.amount,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedWallet) {
        return res.status(400).json({
          success: false,
          message: "Doctor wallet pending balance is insufficient",
        });
      }

      payoutRequest.status = "paid";
      payoutRequest.adminNote = adminNote || payoutRequest.adminNote;
      payoutRequest.paidAt = new Date();
    }

    if (status === "rejected") {
      await DoctorWallet.findOneAndUpdate(
        {
          doctor: payoutRequest.doctor,
        },
        {
          $inc: {
            availableBalance: payoutRequest.amount,
            pendingBalance: -payoutRequest.amount,
          },
        }
      );

      payoutRequest.status = "rejected";
      payoutRequest.adminNote = adminNote || payoutRequest.adminNote;
      payoutRequest.rejectedAt = new Date();
    }

    await payoutRequest.save();

    const updatedRequest = await PayoutRequest.findById(payoutRequest._id)
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      });

    return res.status(200).json({
      success: true,
      message: `Payout request marked as ${status}`,
      payoutRequest: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payout request",
      error: error.message,
    });
  }
};