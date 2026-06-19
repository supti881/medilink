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

const normalizeAdminDoctorStatus = (status = "active") => {
  const normalized = String(status || "active").trim().toLowerCase();

  if (normalized === "inactive") return "suspended";

  if (
    ["pending", "active", "rejected", "suspended", "blocked"].includes(
      normalized
    )
  ) {
    return normalized;
  }

  return "active";
};

const getDoctorModelStatus = (adminStatus = "active") => {
  const normalized = normalizeAdminDoctorStatus(adminStatus);

  if (normalized === "active") return "active";
  if (normalized === "pending") return "pending";

  return "inactive";
};

const getUserAccountStatus = (adminStatus = "active") => {
  const normalized = normalizeAdminDoctorStatus(adminStatus);

  if (normalized === "blocked") return "blocked";
  if (["suspended", "rejected"].includes(normalized)) return "inactive";

  return "active";
};

const buildAdminDoctorPayload = (doctorProfile, doctorUser) => {
  const hasDoctorProfile = Boolean(doctorProfile);

  const profileStatus = hasDoctorProfile
    ? normalizeAdminDoctorStatus(doctorProfile.status)
    : "pending";

  const userStatus = String(doctorUser?.status || "active").toLowerCase();

  let status = profileStatus;

  if (userStatus === "blocked") {
    status = "blocked";
  } else if (userStatus === "inactive" && profileStatus === "active") {
    status = "suspended";
  }

  return {
    _id: hasDoctorProfile ? doctorProfile._id : doctorUser._id,
    id: hasDoctorProfile ? doctorProfile._id : doctorUser._id,
    userId: doctorUser._id,
    hasDoctorProfile,
    fullName: doctorProfile?.fullName || doctorUser?.name || "Unnamed Doctor",
    specialization:
      doctorProfile?.specialization || "Profile not completed yet",
    department: doctorProfile?.department || "Pending Verification",
    qualification: doctorProfile?.qualification || "Not submitted",
    experienceYears:
      doctorProfile?.experienceYears !== undefined
        ? doctorProfile.experienceYears
        : 0,
    consultationFee:
      doctorProfile?.consultationFee !== undefined
        ? doctorProfile.consultationFee
        : 0,
    bio:
      doctorProfile?.bio ||
      "Doctor account created. Full professional profile is waiting for completion or admin verification.",
    phone: doctorProfile?.phone || doctorUser?.phone || "",
    imageUrl: doctorProfile?.imageUrl || doctorUser?.profileImage || "",
    availableSlots: Array.isArray(doctorProfile?.availableSlots)
      ? doctorProfile.availableSlots
      : [],
    rating: doctorProfile?.rating || 0,
    totalReviews: doctorProfile?.totalReviews || 0,
    status,
    user: {
      _id: doctorUser._id,
      id: doctorUser._id,
      name: doctorUser.name,
      email: doctorUser.email,
      phone: doctorUser.phone || "",
      role: doctorUser.role,
      isVerified: doctorUser.isVerified,
      status: doctorUser.status || "active",
      profileImage: doctorUser.profileImage || "",
      createdAt: doctorUser.createdAt,
      updatedAt: doctorUser.updatedAt,
    },
    createdAt: doctorProfile?.createdAt || doctorUser.createdAt,
    updatedAt: doctorProfile?.updatedAt || doctorUser.updatedAt,
  };
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
      status: "pending",
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
      "name email phone role isVerified status profileImage createdAt updatedAt"
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

      const createdDoctor = await Doctor.create(payload);

      if (payload.fullName || payload.phone !== undefined || payload.imageUrl) {
        const userUpdate = {};
        if (payload.fullName) userUpdate.name = payload.fullName;
        if (payload.phone !== undefined) userUpdate.phone = payload.phone;
        if (payload.imageUrl) userUpdate.profileImage = payload.imageUrl;

        await User.findByIdAndUpdate(req.user._id, userUpdate, {
          runValidators: true,
        });
      }

      const populatedDoctor = await Doctor.findById(createdDoctor._id).populate(
        "user",
        "name email phone role isVerified status profileImage createdAt updatedAt"
      );

      return res.status(201).json({
        success: true,
        message:
          "Doctor profile created successfully. It is pending admin verification.",
        doctor: populatedDoctor,
      });
    }

    Object.assign(existingDoctor, payload);
    await existingDoctor.save();

    if (payload.fullName || payload.phone !== undefined || payload.imageUrl) {
      const userUpdate = {};
      if (payload.fullName) userUpdate.name = payload.fullName;
      if (payload.phone !== undefined) userUpdate.phone = payload.phone;
      if (payload.imageUrl) userUpdate.profileImage = payload.imageUrl;

      await User.findByIdAndUpdate(req.user._id, userUpdate, {
        runValidators: true,
      });
    }

    const updatedDoctor = await Doctor.findById(existingDoctor._id).populate(
      "user",
      "name email phone role isVerified status profileImage createdAt updatedAt"
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
      .populate("user", "name email phone role isVerified status profileImage")
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

export const getAdminDoctors = async (req, res) => {
  try {
    const doctorUsers = await User.find({ role: "doctor" }).sort({
      createdAt: -1,
    });

    const doctorProfiles = await Doctor.find({
      user: { $in: doctorUsers.map((doctorUser) => doctorUser._id) },
    })
      .populate("user", "name email phone role isVerified status profileImage")
      .sort({ createdAt: -1 });

    const profileMap = new Map(
      doctorProfiles.map((profile) => [String(profile.user?._id), profile])
    );

    const doctors = doctorUsers.map((doctorUser) =>
      buildAdminDoctorPayload(profileMap.get(String(doctorUser._id)), doctorUser)
    );

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin doctor accounts",
      error: error.message,
    });
  }
};

export const updateDoctorStatusByAdmin = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;

    const adminStatus = normalizeAdminDoctorStatus(status);
    const doctorModelStatus = getDoctorModelStatus(adminStatus);
    const userAccountStatus = getUserAccountStatus(adminStatus);

    let doctorProfile = await Doctor.findById(doctorId).populate(
      "user",
      "name email phone role isVerified status profileImage createdAt updatedAt"
    );

    let doctorUser = null;

    if (doctorProfile) {
      doctorProfile.status = doctorModelStatus;
      await doctorProfile.save();

      doctorUser = await User.findByIdAndUpdate(
        doctorProfile.user._id,
        { status: userAccountStatus },
        { new: true, runValidators: true }
      );
    } else {
      doctorUser = await User.findOneAndUpdate(
        { _id: doctorId, role: "doctor" },
        { status: userAccountStatus },
        { new: true, runValidators: true }
      );

      if (!doctorUser) {
        return res.status(404).json({
          success: false,
          message: "Doctor account not found",
        });
      }
    }

    if (doctorProfile) {
      doctorProfile = await Doctor.findById(doctorProfile._id).populate(
        "user",
        "name email phone role isVerified status profileImage createdAt updatedAt"
      );
    }

    return res.status(200).json({
      success: true,
      message: `Doctor status updated to ${adminStatus}`,
      doctor: buildAdminDoctorPayload(doctorProfile, doctorUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor status",
      error: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name email phone role isVerified status profileImage createdAt updatedAt"
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