import express from "express";
import {
  createReplacementRequest,
  getAllReplacementRequests,
  getMyReplacementRequests,
  updateReplacementRequest,
} from "../controllers/replacementRequestController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  createReplacementRequest
);

router.get(
  "/my",
  protect,
  authorizeRoles("patient"),
  getMyReplacementRequests
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllReplacementRequests
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateReplacementRequest
);

export default router;