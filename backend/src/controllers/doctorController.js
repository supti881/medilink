import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

const ALLOWED_SLOT_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const sanitizeAvailableSlots = (slots = []) => {
  if (!Array.isArray(slots)) {
    return [];
  }

  return slots
    .filter((slot) => slot?.day && slot?.startTime && slot?.endTime)
    .map((slot) => ({
      day: ALLOWED_SLOT_DAYS.includes(slot.day) ? slot.day : "Saturday",
      startTime: String(slot.startTime || "").trim(),
      endTime: String(slot.endTime || "").trim(),
      capacity: Number(slot.capacity) > 0 ? Number(slot.capacity) : 5,
      bookedCount: Number(slot.bookedCount) >= 0 ? Number(slot.bookedCount) : 0,
      isActive: slot.isActive !== false,
    }));
};

const buildDoctorPayload = (body) => {
  const allowedFields = [
    "fullName",
    "specialization",
    "department",
    "qualification",
    "experienceYears",
    "consultationFee",
    "bio",
    "phone",
    "imageUrl",
    "availableSlots",
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.experienceYears !== undefined) {
    payload.experienceYears = Number(payload.experienceYears);
  }

  if (payload.consultationFee !== undefined) {
    payload.consultationFee = Number(payload.consultationFee);
  }

  if (payload.availableSlots !== undefined) {
    payload.availableSlots = sanitizeAvailableSlots(payload.availableSlots);
  }

  return payload;
};

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
      availableSlots: sanitizeAvailableSlots(availableSlots),
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

export const getMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access this profile",
      });
    }

    const doctor = await Doctor.findOne({ user: req.user._id }).populate(
      "user",
      "name email phone role isVerified status"
    );

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message,
    });
  }
};

export const updateMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update this profile",
      });
    }

    const payload = buildDoctorPayload(req.body);

    const requiredFields = [
      "fullName",
      "specialization",
      "department",
      "qualification",
      "experienceYears",
      "consultationFee",
    ];

    const existingDoctor = await Doctor.findOne({ user: req.user._id });

    if (!existingDoctor) {
      const missingField = requiredFields.find(
        (field) => payload[field] === undefined || payload[field] === ""
      );

      if (missingField) {
        return res.status(400).json({
          success: false,
          message: `Please provide ${missingField} to create doctor profile`,
        });
      }

      payload.user = req.user._id;

      const createdDoctor = await Doctor.create(payload);

      if (payload.fullName || payload.phone) {
        const userUpdate = {};
        if (payload.fullName) userUpdate.name = payload.fullName;
        if (payload.phone !== undefined) userUpdate.phone = payload.phone;
        await User.findByIdAndUpdate(req.user._id, userUpdate, {
          runValidators: true,
        });
      }

      const populatedDoctor = await Doctor.findById(createdDoctor._id).populate(
        "user",
        "name email phone role isVerified status"
      );

      return res.status(201).json({
        success: true,
        message: "Doctor profile created successfully",
        doctor: populatedDoctor,
      });
    }

    Object.assign(existingDoctor, payload);
    await existingDoctor.save();

    if (payload.fullName || payload.phone !== undefined) {
      const userUpdate = {};
      if (payload.fullName) userUpdate.name = payload.fullName;
      if (payload.phone !== undefined) userUpdate.phone = payload.phone;
      await User.findByIdAndUpdate(req.user._id, userUpdate, {
        runValidators: true,
      });
    }

    const updatedDoctor = await Doctor.findById(existingDoctor._id).populate(
      "user",
      "name email phone role isVerified status"
    );

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor profile",
      error: error.message,
    });
  }
};

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