import fs from "fs";
import path from "path";
import multer from "multer";

const doctorUploadDir = path.join(process.cwd(), "uploads", "doctors");
const medicalRecordUploadDir = path.join(
  process.cwd(),
  "uploads",
  "medical-records"
);

fs.mkdirSync(doctorUploadDir, { recursive: true });
fs.mkdirSync(medicalRecordUploadDir, { recursive: true });

const buildSafeName = (prefix, userId, originalName) => {
  const ext = path.extname(originalName || "").toLowerCase();
  const cleanPrefix = String(prefix || "file")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  return `${cleanPrefix}-${userId || "user"}-${Date.now()}${ext}`;
};

const doctorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, doctorUploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, buildSafeName("doctor", req.user?._id, file.originalname));
  },
});

const medicalRecordStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, medicalRecordUploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, buildSafeName("medical-record", req.user?._id, file.originalname));
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."), false);
  }

  cb(null, true);
};

const medicalRecordFileFilter = (req, file, cb) => {
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(
      new Error("Only JPG, PNG, WEBP, PDF, DOC, or DOCX files are allowed."),
      false
    );
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage: doctorStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export const uploadMedicalRecord = multer({
  storage: medicalRecordStorage,
  fileFilter: medicalRecordFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});