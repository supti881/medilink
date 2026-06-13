import express from "express";
import {
  createMockPayment,
  getMyPayments,
  getPaymentById,
} from "../controllers/paymentController.js";
import {
  createPayoutRequest,
  getAllPayoutRequests,
  getDoctorPaymentSummary,
  getMyPayoutRequests,
  updatePayoutRequestStatus,
} from "../controllers/doctorPaymentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/mock", protect, authorizeRoles("patient"), createMockPayment);

router.get(
  "/my",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getMyPayments
);

router.get(
  "/doctor/summary",
  protect,
  authorizeRoles("doctor"),
  getDoctorPaymentSummary
);

router.post(
  "/doctor/payout-request",
  protect,
  authorizeRoles("doctor"),
  createPayoutRequest
);

router.get(
  "/doctor/payout-requests",
  protect,
  authorizeRoles("doctor"),
  getMyPayoutRequests
);

router.get(
  "/admin/payout-requests",
  protect,
  authorizeRoles("admin"),
  getAllPayoutRequests
);

router.patch(
  "/admin/payout-requests/:id/status",
  protect,
  authorizeRoles("admin"),
  updatePayoutRequestStatus
);

router.get(
  "/:id",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getPaymentById
);

export default router;