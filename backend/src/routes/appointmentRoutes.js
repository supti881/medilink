import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Patient appointment routes
|--------------------------------------------------------------------------
*/

router.post("/", protect, authorizeRoles("patient"), bookAppointment);

router.get("/my", protect, authorizeRoles("patient"), getMyAppointments);

/*
|--------------------------------------------------------------------------
| Doctor appointment routes
|--------------------------------------------------------------------------
*/

router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor", "admin"),
  getDoctorAppointments
);

/*
|--------------------------------------------------------------------------
| Admin appointment management routes
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/list",
  protect,
  authorizeRoles("admin"),
  getDoctorAppointments
);

/*
|--------------------------------------------------------------------------
| Shared appointment status route
|--------------------------------------------------------------------------
| Patient: cancel only
| Doctor: approve, complete, cancel, no_show
| Admin: approve, complete, cancel, no_show
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  updateAppointmentStatus
);

/*
|--------------------------------------------------------------------------
| Backward compatible update route
|--------------------------------------------------------------------------
| If frontend already calls PATCH /api/appointments/:id, it will still work.
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  updateAppointmentStatus
);

export default router;