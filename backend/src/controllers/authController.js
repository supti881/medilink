import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOtp, getOtpExpiry } from "../utils/otp.js";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getUploadedFileUrl = (file) => {
  if (!file) {
    return "";
  }

  const normalizedPath = String(file.path || "").replace(/\\/g, "/");

  if (normalizedPath.includes("/uploads/")) {
    return normalizedPath.slice(normalizedPath.indexOf("/uploads/"));
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `/${normalizedPath}`;
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return "";
};

const buildUserPayload = (user) => {
  return {
    _id: user._id,
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

// Register new user
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
    } = req.body;

    const selectedRole = normalizeText(role || "patient").toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (selectedRole === "patient") {
      if (!phone || !gender || !dateOfBirth || !bloodGroup || !address) {
        return res.status(400).json({
          success: false,
          message:
            "Phone, gender, date of birth, blood group, and address are required for patient registration",
        });
      }

      if (!emergencyContactName || !emergencyContactPhone) {
        return res.status(400).json({
          success: false,
          message:
            "Emergency contact name and phone are required for patient registration",
        });
      }
    }

    const existingUser = await User.findOne({
      email: normalizeText(email).toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    let parsedDateOfBirth = null;

    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth);

      if (Number.isNaN(parsedDateOfBirth.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid date of birth",
        });
      }
    }

    const otp = generateOtp();
    const otpExpiresAt = getOtpExpiry();
    const uploadedProfileImage = getUploadedFileUrl(req.file);

    const user = await User.create({
      name: normalizeText(name),
      email: normalizeText(email).toLowerCase(),
      password,
      phone: normalizeText(phone),
      role: selectedRole || "patient",
      profileImage: uploadedProfileImage,
      gender: normalizeText(gender).toLowerCase(),
      dateOfBirth: parsedDateOfBirth,
      bloodGroup: normalizeText(bloodGroup),
      address: normalizeText(address),
      emergencyContactName: normalizeText(emergencyContactName),
      emergencyContactPhone: normalizeText(emergencyContactPhone),
      medicalNotes: normalizeText(medicalNotes),
      otp,
      otpExpiresAt,
      isVerified: false,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP generated for verification.",
      devOtp: otp,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is missing in environment variables",
      });
    }

    const user = await User.findOne({
      email: normalizeText(email).toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active",
      });
    }

    const token = createToken(user._id);

    res.cookie("medilink_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: normalizeText(email).toLowerCase(),
    }).select("+otp +otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      user: buildUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      user: buildUserPayload(req.user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
      error: error.message,
    });
  }
};

// Update current logged-in user profile
export const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const {
      name,
      phone,
      profileImage,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      const cleanName = normalizeText(name);

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      updateData.name = cleanName;
    }

    if (phone !== undefined) {
      updateData.phone = normalizeText(phone);
    }

    if (profileImage !== undefined) {
      updateData.profileImage = normalizeText(profileImage);
    }

    if (gender !== undefined) {
      updateData.gender = normalizeText(gender).toLowerCase();
    }

    if (dateOfBirth !== undefined) {
      if (!dateOfBirth) {
        updateData.dateOfBirth = null;
      } else {
        const parsedDate = new Date(dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid date of birth",
          });
        }

        updateData.dateOfBirth = parsedDate;
      }
    }

    if (bloodGroup !== undefined) {
      updateData.bloodGroup = normalizeText(bloodGroup);
    }

    if (address !== undefined) {
      updateData.address = normalizeText(address);
    }

    if (emergencyContactName !== undefined) {
      updateData.emergencyContactName = normalizeText(emergencyContactName);
    }

    if (emergencyContactPhone !== undefined) {
      updateData.emergencyContactPhone = normalizeText(emergencyContactPhone);
    }

    if (medicalNotes !== undefined) {
      updateData.medicalNotes = normalizeText(medicalNotes);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: buildUserPayload(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

// Admin: get all patient accounts
export const getAdminPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients: patients.map(buildUserPayload),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient accounts",
      error: error.message,
    });
  }
};

// Admin: update patient account status
export const updatePatientStatusByAdmin = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "inactive", "blocked"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient status",
      });
    }

    const patient = await User.findOneAndUpdate(
      { _id: patientId, role: "patient" },
      { status },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Patient account marked as ${status}`,
      user: buildUserPayload(patient),
      patient: buildUserPayload(patient),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update patient status",
      error: error.message,
    });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    res.cookie("medilink_token", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};