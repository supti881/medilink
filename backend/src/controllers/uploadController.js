import Doctor from "../models/Doctor.js";

export const uploadDoctorPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image file received. Use form field name: image.",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/doctors/${
      req.file.filename
    }`;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { imageUrl },
      { new: true }
    ).populate("user", "name email phone role isVerified status");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found. Please complete doctor profile first.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor photo uploaded successfully.",
      imageUrl,
      doctor,
    });
  } catch (error) {
    console.error("Doctor photo upload error:", error);

    return res.status(500).json({
      message: error.message || "Failed to upload doctor photo.",
    });
  }
};