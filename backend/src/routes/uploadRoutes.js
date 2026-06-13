import express from "express";
import { uploadDoctorPhoto } from "../controllers/uploadController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/doctor-photo",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  uploadImage.single("image"),
  uploadDoctorPhoto
);

export default router;