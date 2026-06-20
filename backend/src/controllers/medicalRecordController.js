import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";

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

  if (file.destination && file.filename) {
    const destination = String(file.destination).replace(/\\/g, "/");
    const uploadIndex = destination.indexOf("uploads");

    if (uploadIndex !== -1) {
      return `/${destination.slice(uploadIndex)}/${file.filename}`;
    }
  }

  if (file.filename) {
    return `/uploads/medical-records/${file.filename}`;
  }

  return "";
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDoctorNameFromAppointment = (appointment) => {
  const doctorName =
    appointment?.doctor?.fullName ||
    appointment?.doctor?.user?.name ||
    "";

  if (!doctorName) {
    return "";
  }

  const cleanName = String(doctorName)
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();

  return cleanName ? `Dr. ${cleanName}` : "";
};

const buildAppointmentLabel = (appointment) => {
  if (!appointment) {
    return "General medical history";
  }

  const doctorName = getDoctorNameFromAppointment(appointment);
  const appointmentDate = formatDate(appointment.appointmentDate);
  const timeText = [appointment.startTime, appointment.endTime]
    .filter(Boolean)
    .join(" - ");

  return [doctorName, appointmentDate, timeText]
    .filter(Boolean)
    .join(" · ");
};

const buildMedicalRecordPayload = (record) => {
  const appointment = record.appointment || null;
  const doctor = appointment?.doctor || null;

  return {
    _id: record._id,
    id: record._id,
    patient: record.patient,
    appointment,
    appointmentId: appointment?._id || null,
    doctorId: doctor?._id || null,
    sharedWithDoctorName: getDoctorNameFromAppointment(appointment),
    linkedAppointmentLabel: buildAppointmentLabel(appointment),
    isGeneralHistory: !appointment,
    title: record.title,
    category: record.category,
    notes: record.notes || "",
    fileUrl: record.fileUrl,
    originalName: record.originalName || "",
    mimeType: record.mimeType || "",
    fileSize: record.fileSize || 0,
    visibility: record.visibility,
    uploadedBy: record.uploadedBy,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const populateMedicalRecord = async (recordId) => {
  return MedicalRecord.findById(recordId)
    .populate("patient", "name email phone role profileImage")
    .populate({
      path: "appointment",
      select:
        "appointmentDate appointmentDay startTime endTime status queuePosition expectedStartTime expectedEndTime",
      populate: {
        path: "doctor",
        select:
          "fullName specialization department consultationFee imageUrl user",
        populate: {
          path: "user",
          select: "name email phone role status profileImage",
        },
      },
    });
};

export const createMedicalRecord = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can upload medical history files",
      });
    }

    const { title, category, notes, appointment, visibility } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Medical record title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a medical record file",
      });
    }

    let linkedAppointment = null;

    if (appointment) {
      linkedAppointment = await Appointment.findOne({
        _id: appointment,
        patient: req.user._id,
      });

      if (!linkedAppointment) {
        return res.status(404).json({
          success: false,
          message: "Selected appointment was not found for this patient",
        });
      }
    }

    const fileUrl = getUploadedFileUrl(req.file);

    if (!fileUrl) {
      return res.status(500).json({
        success: false,
        message: "File uploaded but file URL could not be generated",
      });
    }

    const record = await MedicalRecord.create({
      patient: req.user._id,
      appointment: linkedAppointment?._id || null,
      title: String(title).trim(),
      category: category || "other",
      notes: notes ? String(notes).trim() : "",
      fileUrl,
      originalName: req.file.originalname || "",
      mimeType: req.file.mimetype || "",
      fileSize: req.file.size || 0,
      visibility: visibility || "patient_doctor",
      uploadedBy: req.user._id,
      status: "active",
    });

    const populatedRecord = await populateMedicalRecord(record._id);

    return res.status(201).json({
      success: true,
      message: linkedAppointment
        ? "Medical file uploaded and linked with selected appointment"
        : "General medical history file uploaded successfully",
      record: buildMedicalRecordPayload(populatedRecord),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload medical history file",
      error: error.message,
    });
  }
};

export const getMyMedicalRecords = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can view their medical history records",
      });
    }

    const records = await MedicalRecord.find({
      patient: req.user._id,
      status: "active",
    })
      .populate("patient", "name email phone role profileImage")
      .populate({
        path: "appointment",
        select:
          "appointmentDate appointmentDay startTime endTime status queuePosition expectedStartTime expectedEndTime",
        populate: {
          path: "doctor",
          select:
            "fullName specialization department consultationFee imageUrl user",
          populate: {
            path: "user",
            select: "name email phone role status profileImage",
          },
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records: records.map(buildMedicalRecordPayload),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medical history records",
      error: error.message,
    });
  }
};

export const getPatientMedicalRecordsForDoctor = async (req, res) => {
  try {
    if (!["doctor", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only doctors or admins can view patient medical records",
      });
    }

    const { patientId } = req.params;

    const records = await MedicalRecord.find({
      patient: patientId,
      status: "active",
      visibility: "patient_doctor",
    })
      .populate("patient", "name email phone role profileImage")
      .populate({
        path: "appointment",
        select:
          "appointmentDate appointmentDay startTime endTime status queuePosition expectedStartTime expectedEndTime",
        populate: {
          path: "doctor",
          select:
            "fullName specialization department consultationFee imageUrl user",
          populate: {
            path: "user",
            select: "name email phone role status profileImage",
          },
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records: records.map(buildMedicalRecordPayload),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient medical records",
      error: error.message,
    });
  }
};

export const archiveMyMedicalRecord = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can archive their medical history files",
      });
    }

    const record = await MedicalRecord.findOneAndUpdate(
      {
        _id: req.params.recordId,
        patient: req.user._id,
      },
      {
        status: "archived",
      },
      {
        new: true,
      }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    const populatedRecord = await populateMedicalRecord(record._id);

    return res.status(200).json({
      success: true,
      message: "Medical record archived successfully",
      record: buildMedicalRecordPayload(populatedRecord),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to archive medical record",
      error: error.message,
    });
  }
};