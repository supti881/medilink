import express from "express";
import {
  createSupportTicket,
  getAllSupportTickets,
  getMySupportTickets,
  updateSupportTicket,
} from "../controllers/supportTicketController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  createSupportTicket
);

router.get(
  "/my",
  protect,
  authorizeRoles("patient", "doctor", "admin"),
  getMySupportTickets
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllSupportTickets
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateSupportTicket
);

export default router;