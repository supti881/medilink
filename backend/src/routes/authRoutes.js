import express from "express";
import {
  getAdminPatients,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUserProfile,
  updatePatientStatusByAdmin,
  verifyOtp,
} from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/register", uploadImage.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);

router.get("/me", protect, getCurrentUser);
router.patch("/profile", protect, updateCurrentUserProfile);

router.get(
  "/admin/patients",
  protect,
  authorizeRoles("admin"),
  getAdminPatients
);

router.patch(
  "/admin/patients/:patientId/status",
  protect,
  authorizeRoles("admin"),
  updatePatientStatusByAdmin
);

// Test protected role route
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome admin. Role based access is working.",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;