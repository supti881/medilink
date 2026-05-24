import express from "express";
import {
  createPrescription,
  getMyPrescriptions,
  verifyPrescription,
} from "../controllers/prescriptionController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  createPrescription
);

router.get(
  "/my",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getMyPrescriptions
);

router.get(
  "/verify/:token",
  verifyPrescription
);

export default router;