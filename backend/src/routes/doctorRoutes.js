import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
} from "../controllers/doctorController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);

export default router;