import express from "express";
import {
  createMockPayment,
  getAdminPayments,
  getAdminPaymentSummary,
  getMyPayments,
  getPaymentById,
  updatePaymentStatusByAdmin,
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

/*
|--------------------------------------------------------------------------
| Patient payment routes
|--------------------------------------------------------------------------
*/

router.post("/mock", protect, authorizeRoles("patient"), createMockPayment);

/*
|--------------------------------------------------------------------------
| Shared payment history routes
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getMyPayments
);

/*
|--------------------------------------------------------------------------
| Doctor wallet and payout routes
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Admin payment management routes
|--------------------------------------------------------------------------
| Important: Keep admin routes before "/:id"
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/summary",
  protect,
  authorizeRoles("admin"),
  getAdminPaymentSummary
);

router.get(
  "/admin/list",
  protect,
  authorizeRoles("admin"),
  getAdminPayments
);

router.patch(
  "/admin/:id/status",
  protect,
  authorizeRoles("admin"),
  updatePaymentStatusByAdmin
);

/*
|--------------------------------------------------------------------------
| Admin doctor payout management routes
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Single payment details route
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getPaymentById
);

export default router;