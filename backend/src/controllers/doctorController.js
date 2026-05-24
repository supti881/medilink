import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// Create doctor profile
export const createDoctor = async (req, res) => {
  try {
    const {
      user,
      fullName,
      specialization,
      department,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      phone,
      imageUrl,
      availableSlots,
    } = req.body;

    if (
      !user ||
      !fullName ||
      !specialization ||
      !department ||
      !qualification ||
      experienceYears === undefined ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required doctor information is missing",
      });
    }

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found for this doctor profile",
      });
    }

    if (existingUser.role !== "doctor") {
      return res.status(400).json({
        success: false,
        message: "Selected user must have doctor role",
      });
    }

    const existingDoctor = await Doctor.findOne({ user });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor profile already exists for this user",
      });
    }

    const doctor = await Doctor.create({
      user,
      fullName,
      specialization,
      department,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      phone,
      imageUrl,
      availableSlots,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create doctor profile",
      error: error.message,
    });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, department, search } = req.query;

    const filter = {
      status: "active",
    };

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate("user", "name email role isVerified status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name email role isVerified status"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details",
      error: error.message,
    });
  }
};