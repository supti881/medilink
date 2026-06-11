import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "../controllers/doctorController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllDoctors);

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

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);

export default router;