import express from "express";
import {
  archiveMyMedicalRecord,
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecordsForDoctor,
} from "../controllers/medicalRecordController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { uploadMedicalRecord } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  uploadMedicalRecord.single("file"),
  createMedicalRecord
);

router.get(
  "/my",
  protect,
  authorizeRoles("patient"),
  getMyMedicalRecords
);

router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("doctor", "admin"),
  getPatientMedicalRecordsForDoctor
);

router.patch(
  "/:recordId/archive",
  protect,
  authorizeRoles("patient"),
  archiveMyMedicalRecord
);

export default router;