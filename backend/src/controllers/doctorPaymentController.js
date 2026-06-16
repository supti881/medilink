import Doctor from "../models/Doctor.js";
import DoctorWallet from "../models/DoctorWallet.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import PayoutRequest from "../models/PayoutRequest.js";

const ALLOWED_PAYOUT_METHODS = ["bkash", "nagad", "bank"];
const ALLOWED_ADMIN_ACTIONS = ["approved", "paid", "rejected"];

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getPayoutStatusFromAction(actionOrStatus = "") {
  const value = String(actionOrStatus || "").trim().toLowerCase();

  const statusMap = {
    approve: "approved",
    approved: "approved",

    paid: "paid",
    mark_paid: "paid",
    markpaid: "paid",

    reject: "rejected",
    rejected: "rejected",
  };

  return statusMap[value] || "";
}

function populateDoctorPaymentProfile(query) {
  return query.populate("user", "name email phone role status profileImage");
}

function populatePayoutRequest(query) {
  return query.populate({
    path: "doctor",
    populate: {
      path: "user",
      select: "name email phone role status profileImage",
    },
  });
}

async function getLoggedInDoctorProfile(userId) {
  return populateDoctorPaymentProfile(Doctor.findOne({ user: userId }));
}

async function getOrCreateDoctorWallet(doctorId) {
  return DoctorWallet.findOneAndUpdate(
    {
      doctor: doctorId,
    },
    {
      $setOnInsert: {
        doctor: doctorId,
        totalEarned: 0,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnBalance: 0,
        platformFeeTotal: 0,
        totalPaidAppointments: 0,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
}

function buildWalletSummary(wallet) {
  return {
    totalEarned: wallet?.totalEarned || 0,
    availableBalance: wallet?.availableBalance || 0,
    pendingBalance: wallet?.pendingBalance || 0,
    withdrawnBalance: wallet?.withdrawnBalance || 0,
    platformFeeTotal: wallet?.platformFeeTotal || 0,
    totalPaidAppointments: wallet?.totalPaidAppointments || 0,
  };
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

    const wallet = await getOrCreateDoctorWallet(doctorProfile._id);

    const transactions = await PaymentTransaction.find({
      doctor: doctorProfile._id,
    })
      .populate("patient", "name email phone role status profileImage")
      .populate("appointment")
      .sort({
        createdAt: -1,
      })
      .limit(30);

    const payoutRequests = await PayoutRequest.find({
      doctor: doctorProfile._id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(15);

    return res.status(200).json({
      success: true,
      doctor: doctorProfile,
      wallet,
      transactions,
      payoutRequests,
      summary: buildWalletSummary(wallet),
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

    if (doctorProfile.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Only active doctors can request payout. Please contact MediLink admin.",
      });
    }

    const requestedAmount = Number(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payout amount is required",
      });
    }

    const payoutMethod = normalizeText(method).toLowerCase();

    if (!ALLOWED_PAYOUT_METHODS.includes(payoutMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payout method must be bkash, nagad or bank",
      });
    }

    if (!normalizeText(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: "Account number is required",
      });
    }

    if (payoutMethod === "bank" && !normalizeText(bankName)) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required for bank payout",
      });
    }

    const wallet = await getOrCreateDoctorWallet(doctorProfile._id);

    if ((wallet.availableBalance || 0) < requestedAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient available balance for this payout request",
      });
    }

    const payoutRequest = await PayoutRequest.create({
      doctor: doctorProfile._id,
      amount: requestedAmount,
      method: payoutMethod,
      accountNumber: normalizeText(accountNumber),
      accountHolderName: normalizeText(accountHolderName),
      bankName: normalizeText(bankName),
      branchName: normalizeText(branchName),
      note: normalizeText(note),
      status: "requested",
      requestedAt: new Date(),
    });

    const updatedWallet = await DoctorWallet.findOneAndUpdate(
      {
        doctor: doctorProfile._id,
        availableBalance: {
          $gte: requestedAmount,
        },
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

    const populatedRequest = await populatePayoutRequest(
      PayoutRequest.findById(payoutRequest._id)
    );

    return res.status(201).json({
      success: true,
      message:
        "Payout request submitted successfully. Amount is reserved for admin review.",
      payoutRequest: populatedRequest,
      wallet: updatedWallet,
      summary: buildWalletSummary(updatedWallet),
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
    }).sort({
      createdAt: -1,
    });

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
    const { status, method, search } = req.query;

    const filter = {};

    if (status && ["requested", "approved", "paid", "rejected"].includes(status)) {
      filter.status = status;
    }

    if (method && ALLOWED_PAYOUT_METHODS.includes(method)) {
      filter.method = method;
    }

    if (search) {
      const cleanSearch = normalizeText(search);

      filter.$or = [
        {
          accountNumber: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          accountHolderName: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          bankName: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          adminNote: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          note: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
      ];
    }

    const payoutRequests = await populatePayoutRequest(
      PayoutRequest.find(filter).sort({
        createdAt: -1,
      })
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

    const payoutSummary = payoutRequests.reduce(
      (accumulator, payout) => {
        const payoutAmount = Number(payout.amount) || 0;

        accumulator.totalRequests += 1;

        if (payout.status === "requested") {
          accumulator.requested += 1;
          accumulator.requestedAmount += payoutAmount;
        }

        if (payout.status === "approved") {
          accumulator.approved += 1;
          accumulator.approvedAmount += payoutAmount;
        }

        if (payout.status === "paid") {
          accumulator.paid += 1;
          accumulator.paidAmount += payoutAmount;
        }

        if (payout.status === "rejected") {
          accumulator.rejected += 1;
          accumulator.rejectedAmount += payoutAmount;
        }

        return accumulator;
      },
      {
        totalRequests: 0,
        requested: 0,
        approved: 0,
        paid: 0,
        rejected: 0,
        requestedAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        rejectedAmount: 0,
      }
    );

    return res.status(200).json({
      success: true,
      count: payoutRequests.length,
      payoutRequests,
      summary: {
        wallet: walletSummary,
        payouts: payoutSummary,
      },
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
    const requestedStatus = getPayoutStatusFromAction(
      req.body.status || req.body.action
    );

    if (
      !requestedStatus ||
      !ALLOWED_ADMIN_ACTIONS.includes(requestedStatus)
    ) {
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

    const adminNote = normalizeText(req.body.adminNote);

    if (requestedStatus === "approved") {
      if (payoutRequest.status !== "requested") {
        return res.status(409).json({
          success: false,
          message: `Only requested payouts can be approved. Current status is ${payoutRequest.status}.`,
        });
      }

      payoutRequest.status = "approved";
      payoutRequest.adminNote =
        adminNote ||
        payoutRequest.adminNote ||
        "Payout request approved by MediLink admin.";
      payoutRequest.approvedAt = new Date();
    }

    if (requestedStatus === "paid") {
      if (payoutRequest.status !== "approved") {
        return res.status(409).json({
          success: false,
          message:
            "Payout must be approved before marking it as paid.",
        });
      }

      const updatedWallet = await DoctorWallet.findOneAndUpdate(
        {
          doctor: payoutRequest.doctor,
          pendingBalance: {
            $gte: payoutRequest.amount,
          },
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
          message:
            "Doctor wallet pending balance is insufficient for this payout.",
        });
      }

      payoutRequest.status = "paid";
      payoutRequest.adminNote =
        adminNote ||
        payoutRequest.adminNote ||
        "Payout marked as paid after successful transfer.";
      payoutRequest.paidAt = new Date();

      await payoutRequest.save();

      const updatedRequest = await populatePayoutRequest(
        PayoutRequest.findById(payoutRequest._id)
      );

      return res.status(200).json({
        success: true,
        message: "Payout request marked as paid",
        payoutRequest: updatedRequest,
        wallet: updatedWallet,
        summary: buildWalletSummary(updatedWallet),
      });
    }

    if (requestedStatus === "rejected") {
      if (!["requested", "approved"].includes(payoutRequest.status)) {
        return res.status(409).json({
          success: false,
          message: `This payout request cannot be rejected from ${payoutRequest.status} status.`,
        });
      }

      const updatedWallet = await DoctorWallet.findOneAndUpdate(
        {
          doctor: payoutRequest.doctor,
          pendingBalance: {
            $gte: payoutRequest.amount,
          },
        },
        {
          $inc: {
            availableBalance: payoutRequest.amount,
            pendingBalance: -payoutRequest.amount,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedWallet) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor wallet pending balance is insufficient to reject this payout.",
        });
      }

      payoutRequest.status = "rejected";
      payoutRequest.adminNote =
        adminNote ||
        payoutRequest.adminNote ||
        "Payout request rejected by MediLink admin.";
      payoutRequest.rejectedAt = new Date();

      await payoutRequest.save();

      const updatedRequest = await populatePayoutRequest(
        PayoutRequest.findById(payoutRequest._id)
      );

      return res.status(200).json({
        success: true,
        message:
          "Payout request rejected and reserved amount returned to doctor wallet",
        payoutRequest: updatedRequest,
        wallet: updatedWallet,
        summary: buildWalletSummary(updatedWallet),
      });
    }

    await payoutRequest.save();

    const updatedRequest = await populatePayoutRequest(
      PayoutRequest.findById(payoutRequest._id)
    );

    const wallet = await getOrCreateDoctorWallet(payoutRequest.doctor);

    return res.status(200).json({
      success: true,
      message: `Payout request marked as ${requestedStatus}`,
      payoutRequest: updatedRequest,
      wallet,
      summary: buildWalletSummary(wallet),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payout request",
      error: error.message,
    });
  }
};