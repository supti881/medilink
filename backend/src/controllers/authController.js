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

const buildUserPayload = (user) => {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    profileImage: user.profileImage || "",
    imageUrl: user.profileImage || "",

    designation: user.designation || "",
    bio: user.bio || "",

    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth || null,
    bloodGroup: user.bloodGroup || "",
    address: user.address || "",
    emergencyContactName: user.emergencyContactName || "",
    emergencyContactPhone: user.emergencyContactPhone || "",
    medicalNotes: user.medicalNotes || "",

    isVerified: user.isVerified,
    status: user.status,
    adminNote: user.adminNote || "",
    statusUpdatedBy: user.statusUpdatedBy || null,
    statusUpdatedAt: user.statusUpdatedAt || null,
    blockedAt: user.blockedAt || null,
    activatedAt: user.activatedAt || null,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const getUserStatusFromAction = (actionOrStatus = "") => {
  const value = String(actionOrStatus || "").trim().toLowerCase();

  const statusMap = {
    active: "active",
    activate: "active",
    activated: "active",

    inactive: "inactive",
    deactivate: "inactive",
    deactivated: "inactive",

    blocked: "blocked",
    block: "blocked",
  };

  return statusMap[value] || "";
};

const getDefaultUserAdminNote = (status) => {
  if (status === "active") {
    return "Patient account activated by MediLink admin.";
  }

  if (status === "inactive") {
    return "Patient account marked inactive by MediLink admin.";
  }

  if (status === "blocked") {
    return "Patient account blocked by MediLink admin.";
  }

  return "Patient account status updated by MediLink admin.";
};

const buildProfileUpdatePayload = (req) => {
  const {
    name,
    phone,
    profileImage,
    imageUrl,
    designation,
    bio,
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
      return {
        error: "Name must be at least 2 characters",
      };
    }

    updateData.name = cleanName;
  }

  if (phone !== undefined) {
    updateData.phone = normalizeText(phone);
  }

  if (profileImage !== undefined) {
    updateData.profileImage = normalizeText(profileImage);
  }

  if (imageUrl !== undefined && profileImage === undefined) {
    updateData.profileImage = normalizeText(imageUrl);
  }

  if (designation !== undefined) {
    updateData.designation = normalizeText(designation);
  }

  if (bio !== undefined) {
    updateData.bio = normalizeText(bio);
  }

  if (gender !== undefined) {
    const cleanGender = normalizeText(gender).toLowerCase();
    const allowedGender = ["", "male", "female", "other"];

    if (!allowedGender.includes(cleanGender)) {
      return {
        error: "Gender must be male, female, other, or empty",
      };
    }

    updateData.gender = cleanGender;
  }

  if (dateOfBirth !== undefined) {
    if (!dateOfBirth) {
      updateData.dateOfBirth = null;
    } else {
      const parsedDate = new Date(dateOfBirth);

      if (Number.isNaN(parsedDate.getTime())) {
        return {
          error: "Please provide a valid date of birth",
        };
      }

      updateData.dateOfBirth = parsedDate;
    }
  }

  if (bloodGroup !== undefined) {
    const cleanBloodGroup = normalizeText(bloodGroup);
    const allowedBloodGroups = [
      "",
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ];

    if (!allowedBloodGroups.includes(cleanBloodGroup)) {
      return {
        error: "Please provide a valid blood group",
      };
    }

    updateData.bloodGroup = cleanBloodGroup;
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

  return {
    updateData,
  };
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const cleanName = normalizeText(name);
    const cleanEmail = normalizeText(email).toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const otp = generateOtp();
    const otpExpiresAt = getOtpExpiry();

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      phone: normalizeText(phone),
      role: role || "patient",
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

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          user.status === "blocked"
            ? "This account is blocked. Please contact MediLink admin."
            : "This account is not active. Please contact MediLink admin.",
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

    await user.save({
      validateBeforeSave: false,
    });

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
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      user: buildUserPayload(user),
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

    const { updateData, error } = buildProfileUpdatePayload(req);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({
        success: false,
        message: "No profile data provided for update",
      });
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

// Admin: Get all patients
export const getAdminPatients = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {
      role: "patient",
    };

    if (status && ["active", "inactive", "blocked"].includes(status)) {
      filter.status = status;
    }

    if (search) {
      const cleanSearch = normalizeText(search);

      filter.$or = [
        { name: { $regex: cleanSearch, $options: "i" } },
        { email: { $regex: cleanSearch, $options: "i" } },
        { phone: { $regex: cleanSearch, $options: "i" } },
      ];
    }

    const patients = await User.find(filter).sort({
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
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

// Admin: Get one patient
export const getAdminPatientById = async (req, res) => {
  try {
    const patient = await User.findOne({
      _id: req.params.id,
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient: buildUserPayload(patient),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient profile",
      error: error.message,
    });
  }
};

// Admin: Block / activate patient
export const updatePatientStatusByAdmin = async (req, res) => {
  try {
    const requestedStatus = getUserStatusFromAction(
      req.body.status || req.body.action
    );

    if (!requestedStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient action. Use active, inactive, or blocked.",
      });
    }

    const patient = await User.findOne({
      _id: req.params.id,
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const adminNote = normalizeText(req.body.adminNote);

    patient.status = requestedStatus;
    patient.adminNote = adminNote || getDefaultUserAdminNote(requestedStatus);
    patient.statusUpdatedBy = req.user._id;
    patient.statusUpdatedAt = new Date();

    if (requestedStatus === "blocked") {
      patient.blockedAt = new Date();
    }

    if (requestedStatus === "active") {
      patient.activatedAt = new Date();
      patient.blockedAt = null;
    }

    await patient.save();

    return res.status(200).json({
      success: true,
      message: `Patient account marked as ${requestedStatus}`,
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