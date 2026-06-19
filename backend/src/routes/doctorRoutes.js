import express from "express";
import {
  createDoctor,
  getAdminDoctors,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorStatusByAdmin,
  updateMyDoctorProfile,
} from "../controllers/doctorController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllDoctors);

router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAdminDoctors
);

router.patch(
  "/admin/:doctorId/status",
  protect,
  authorizeRoles("admin"),
  updateDoctorStatusByAdmin
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);

router.get(
  "/me",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorProfile
);

router.patch(
  "/me",
  protect,
  authorizeRoles("doctor"),
  updateMyDoctorProfile
);

router.get("/:id", getDoctorById);

export default router;