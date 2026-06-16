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

const DOCTOR_STATUS = ["pending", "active", "inactive", "rejected", "blocked"];

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

  if (payload.fullName !== undefined) {
    payload.fullName = String(payload.fullName || "").trim();
  }

  if (payload.specialization !== undefined) {
    payload.specialization = String(payload.specialization || "").trim();
  }

  if (payload.department !== undefined) {
    payload.department = String(payload.department || "").trim();
  }

  if (payload.qualification !== undefined) {
    payload.qualification = String(payload.qualification || "").trim();
  }

  if (payload.bio !== undefined) {
    payload.bio = String(payload.bio || "").trim();
  }

  if (payload.phone !== undefined) {
    payload.phone = String(payload.phone || "").trim();
  }

  if (payload.imageUrl !== undefined) {
    payload.imageUrl = String(payload.imageUrl || "").trim();
  }

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

const getDoctorStatusFromAction = (actionOrStatus = "") => {
  const value = String(actionOrStatus || "").trim().toLowerCase();

  const actionMap = {
    approve: "active",
    approved: "active",
    activate: "active",
    active: "active",

    deactivate: "inactive",
    inactive: "inactive",

    reject: "rejected",
    rejected: "rejected",

    block: "blocked",
    blocked: "blocked",

    pending: "pending",
  };

  return actionMap[value] || "";
};

const getUserStatusForDoctorStatus = (doctorStatus) => {
  if (doctorStatus === "active") return "active";
  if (doctorStatus === "blocked") return "blocked";
  if (["inactive", "rejected", "pending"].includes(doctorStatus)) {
    return "inactive";
  }

  return "active";
};

const getDefaultAdminNote = (status) => {
  if (status === "active") {
    return "Doctor profile approved and activated by MediLink admin.";
  }

  if (status === "inactive") {
    return "Doctor profile deactivated by MediLink admin.";
  }

  if (status === "rejected") {
    return "Doctor profile rejected after admin review.";
  }

  if (status === "blocked") {
    return "Doctor profile blocked by MediLink admin.";
  }

  if (status === "pending") {
    return "Doctor profile moved back to pending review.";
  }

  return "Doctor profile status updated by MediLink admin.";
};

const populateDoctor = (query) => {
  return query.populate(
    "user",
    "name email phone role isVerified status profileImage createdAt"
  );
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
      status,
      adminNote,
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

    const requestedStatus = getDoctorStatusFromAction(status) || "active";

    if (!DOCTOR_STATUS.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor status",
      });
    }

    const doctor = await Doctor.create({
      user,
      fullName: String(fullName || "").trim(),
      specialization: String(specialization || "").trim(),
      department: String(department || "").trim(),
      qualification: String(qualification || "").trim(),
      experienceYears: Number(experienceYears),
      consultationFee: Number(consultationFee),
      bio: String(bio || "").trim(),
      phone: String(phone || "").trim(),
      imageUrl: String(imageUrl || "").trim(),
      availableSlots: sanitizeAvailableSlots(availableSlots),
      status: requestedStatus,
      adminNote: adminNote || getDefaultAdminNote(requestedStatus),
      reviewedBy: req.user?._id || null,
      reviewedAt: new Date(),
      blockedAt: requestedStatus === "blocked" ? new Date() : null,
      rejectedAt: requestedStatus === "rejected" ? new Date() : null,
    });

    await User.findByIdAndUpdate(
      user,
      {
        name: String(fullName || existingUser.name || "").trim(),
        phone: String(phone || existingUser.phone || "").trim(),
        status: getUserStatusForDoctorStatus(requestedStatus),
        isVerified: requestedStatus === "active" ? true : existingUser.isVerified,
      },
      {
        runValidators: true,
      }
    );

    const populatedDoctor = await populateDoctor(Doctor.findById(doctor._id));

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor: populatedDoctor,
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

    const doctor = await populateDoctor(
      Doctor.findOne({ user: req.user._id })
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
      payload.status = "pending";
      payload.adminNote = "Doctor profile submitted and waiting for admin review.";

      const createdDoctor = await Doctor.create(payload);

      if (payload.fullName || payload.phone !== undefined) {
        const userUpdate = {};

        if (payload.fullName) {
          userUpdate.name = payload.fullName;
        }

        if (payload.phone !== undefined) {
          userUpdate.phone = payload.phone;
        }

        await User.findByIdAndUpdate(req.user._id, userUpdate, {
          runValidators: true,
        });
      }

      const populatedDoctor = await populateDoctor(
        Doctor.findById(createdDoctor._id)
      );

      return res.status(201).json({
        success: true,
        message: "Doctor profile submitted for admin review",
        doctor: populatedDoctor,
      });
    }

    if (["blocked", "rejected"].includes(existingDoctor.status)) {
      return res.status(403).json({
        success: false,
        message:
          "This doctor profile cannot be updated because it is blocked or rejected. Please contact admin.",
      });
    }

    Object.assign(existingDoctor, payload);

    if (existingDoctor.status === "active") {
      existingDoctor.status = "pending";
      existingDoctor.adminNote =
        "Doctor profile updated and moved to pending review.";
      existingDoctor.reviewedBy = null;
      existingDoctor.reviewedAt = null;
    }

    await existingDoctor.save();

    if (payload.fullName || payload.phone !== undefined) {
      const userUpdate = {};

      if (payload.fullName) {
        userUpdate.name = payload.fullName;
      }

      if (payload.phone !== undefined) {
        userUpdate.phone = payload.phone;
      }

      await User.findByIdAndUpdate(req.user._id, userUpdate, {
        runValidators: true,
      });
    }

    const updatedDoctor = await populateDoctor(
      Doctor.findById(existingDoctor._id)
    );

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated and submitted for admin review",
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

    const doctors = await populateDoctor(
      Doctor.find(filter).sort({ createdAt: -1 })
    );

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

export const getAdminDoctors = async (req, res) => {
  try {
    const { status, specialization, department, search } = req.query;

    const filter = {};

    if (status && DOCTOR_STATUS.includes(status)) {
      filter.status = status;
    }

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
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const doctors = await populateDoctor(
      Doctor.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin doctor list",
      error: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await populateDoctor(Doctor.findById(req.params.id));

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Doctor profile is not available",
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

export const getAdminDoctorById = async (req, res) => {
  try {
    const doctor = await populateDoctor(Doctor.findById(req.params.id));

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
      message: "Failed to fetch admin doctor details",
      error: error.message,
    });
  }
};

export const updateDoctorByAdmin = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const payload = buildDoctorPayload(req.body);

    Object.assign(doctor, payload);

    if (req.body.adminNote !== undefined) {
      doctor.adminNote = String(req.body.adminNote || "").trim();
    }

    doctor.reviewedBy = req.user._id;
    doctor.reviewedAt = new Date();

    await doctor.save();

    if (payload.fullName || payload.phone !== undefined || payload.imageUrl) {
      const userUpdate = {};

      if (payload.fullName) {
        userUpdate.name = payload.fullName;
      }

      if (payload.phone !== undefined) {
        userUpdate.phone = payload.phone;
      }

      if (payload.imageUrl) {
        userUpdate.profileImage = payload.imageUrl;
      }

      await User.findByIdAndUpdate(doctor.user, userUpdate, {
        runValidators: true,
      });
    }

    const updatedDoctor = await populateDoctor(Doctor.findById(doctor._id));

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated by admin",
      doctor: updatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor profile by admin",
      error: error.message,
    });
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const requestedStatus = getDoctorStatusFromAction(
      req.body.status || req.body.action
    );

    if (!requestedStatus || !DOCTOR_STATUS.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid doctor action. Use approve, reject, block, activate, deactivate or pending.",
      });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const adminNote = String(req.body.adminNote || "").trim();

    doctor.status = requestedStatus;
    doctor.adminNote = adminNote || getDefaultAdminNote(requestedStatus);
    doctor.reviewedBy = req.user._id;
    doctor.reviewedAt = new Date();

    if (requestedStatus === "blocked") {
      doctor.blockedAt = new Date();
    }

    if (requestedStatus === "rejected") {
      doctor.rejectedAt = new Date();
    }

    if (requestedStatus === "active") {
      doctor.blockedAt = null;
      doctor.rejectedAt = null;
    }

    await doctor.save();

    const userUpdate = {
      status: getUserStatusForDoctorStatus(requestedStatus),
    };

    if (requestedStatus === "active") {
      userUpdate.isVerified = true;
    }

    await User.findByIdAndUpdate(doctor.user, userUpdate, {
      runValidators: true,
    });

    const updatedDoctor = await populateDoctor(Doctor.findById(doctor._id));

    return res.status(200).json({
      success: true,
      message: `Doctor profile marked as ${requestedStatus}`,
      doctor: updatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor status",
      error: error.message,
    });
  }
};