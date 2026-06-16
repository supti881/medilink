import express from "express";
import {
  getAdminPatientById,
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

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public auth routes
|--------------------------------------------------------------------------
*/

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);

/*
|--------------------------------------------------------------------------
| Logged-in user profile routes
|--------------------------------------------------------------------------
*/

router.get("/me", protect, getCurrentUser);
router.patch("/profile", protect, updateCurrentUserProfile);

/*
|--------------------------------------------------------------------------
| Admin patient management routes
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/patients",
  protect,
  authorizeRoles("admin"),
  getAdminPatients
);

router.get(
  "/admin/patients/:id",
  protect,
  authorizeRoles("admin"),
  getAdminPatientById
);

router.patch(
  "/admin/patients/:id/status",
  protect,
  authorizeRoles("admin"),
  updatePatientStatusByAdmin
);

/*
|--------------------------------------------------------------------------
| Test protected role route
|--------------------------------------------------------------------------
*/

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