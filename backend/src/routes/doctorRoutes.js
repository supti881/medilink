import express from "express";
import {
  createDoctor,
  getAdminDoctorById,
  getAdminDoctors,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorByAdmin,
  updateDoctorStatus,
  updateMyDoctorProfile,
} from "../controllers/doctorController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public doctor routes
|--------------------------------------------------------------------------
*/

router.get("/", getAllDoctors);

/*
|--------------------------------------------------------------------------
| Doctor self profile routes
|--------------------------------------------------------------------------
*/

router.get("/me", protect, authorizeRoles("doctor"), getMyDoctorProfile);

router.patch("/me", protect, authorizeRoles("doctor"), updateMyDoctorProfile);

/*
|--------------------------------------------------------------------------
| Admin doctor management routes
|--------------------------------------------------------------------------
| Important: Keep these routes before "/:id"
|--------------------------------------------------------------------------
*/

router.get("/admin/list", protect, authorizeRoles("admin"), getAdminDoctors);

router.get("/admin/:id", protect, authorizeRoles("admin"), getAdminDoctorById);

router.patch("/admin/:id", protect, authorizeRoles("admin"), updateDoctorByAdmin);

router.patch(
  "/admin/:id/status",
  protect,
  authorizeRoles("admin"),
  updateDoctorStatus
);

router.post("/", protect, authorizeRoles("admin"), createDoctor);

/*
|--------------------------------------------------------------------------
| Public single doctor route
|--------------------------------------------------------------------------
*/

router.get("/:id", getDoctorById);

export default router;