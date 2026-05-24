import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), bookAppointment);

router.get(
  "/my",
  protect,
  authorizeRoles("patient"),
  getMyAppointments
);

router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor", "admin"),
  getDoctorAppointments
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  updateAppointmentStatus
);

export default router;