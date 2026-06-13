import path from "path";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

const buildUserPayload = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    profileImage: user.profileImage || "",
    imageUrl: user.profileImage || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth || null,
    bloodGroup: user.bloodGroup || "",
    address: user.address || "",
    emergencyContactName: user.emergencyContactName || "",
    emergencyContactPhone: user.emergencyContactPhone || "",
    medicalNotes: user.medicalNotes || "",
    isVerified: user.isVerified,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const getUploadedFileUrl = (file) => {
  if (!file) return "";

  const normalizedPath = String(file.path || "").replace(/\\/g, "/");

  if (normalizedPath.includes("/uploads/")) {
    return normalizedPath.slice(normalizedPath.indexOf("/uploads/"));
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `/${normalizedPath}`;
  }

  if (file.destination && file.filename) {
    const destination = String(file.destination).replace(/\\/g, "/");
    const uploadIndex = destination.indexOf("uploads");

    if (uploadIndex !== -1) {
      const relativeDestination = destination.slice(uploadIndex);
      return `/${path.posix.join(relativeDestination, file.filename)}`;
    }
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return "";
};

export const uploadDoctorPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const imageUrl = getUploadedFileUrl(req.file);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Image uploaded but file path could not be generated",
      });
    }

    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profileImage: imageUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    let updatedDoctor = null;

    if (userRole === "doctor") {
      updatedDoctor = await Doctor.findOneAndUpdate(
        { user: userId },
        {
          imageUrl,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        userRole === "doctor"
          ? "Doctor profile photo uploaded successfully"
          : "Profile photo uploaded successfully",
      imageUrl,
      url: imageUrl,
      path: imageUrl,
      user: buildUserPayload(updatedUser),
      doctor: updatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile photo upload failed",
      error: error.message,
    });
  }
};