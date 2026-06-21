import express from "express";
import {
  adminSupportAssistant,
  askMediLinkAi,
  doctorClinicalNoteAssistant,
  doctorPrescriptionAssistant,
  patientSymptomAssistant,
} from "../controllers/aiController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/ask", protect, askMediLinkAi);

router.post(
  "/patient/symptoms",
  protect,
  authorizeRoles("patient"),
  patientSymptomAssistant
);

router.post(
  "/doctor/prescription",
  protect,
  authorizeRoles("doctor"),
  doctorPrescriptionAssistant
);

router.post(
  "/doctor/clinical-note",
  protect,
  authorizeRoles("doctor"),
  doctorClinicalNoteAssistant
);

router.post(
  "/admin/support",
  protect,
  authorizeRoles("admin"),
  adminSupportAssistant
);

export default router;