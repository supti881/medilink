import express from "express";
import {
  createMockPayment,
  getMyPayments,
  getPaymentById,
} from "../controllers/paymentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/mock",
  protect,
  authorizeRoles("patient"),
  createMockPayment
);

router.get(
  "/my",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getMyPayments
);

router.get(
  "/:id",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getPaymentById
);

export default router;