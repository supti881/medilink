import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import supportTicketRoutes from "./routes/supportTicketRoutes.js";
import replacementRequestRoutes from "./routes/replacementRequestRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").trim();

const ALLOWED_ORIGINS = [
  CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];

// Connect MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
  res.send("MediLink Backend API is running");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediLink server health check passed",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/replacement-requests", replacementRequestRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/ai", aiRoutes);

// Static uploaded files
app.use("/uploads", express.static("uploads"));

// 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`MediLink backend server running on port ${PORT}`);
});