import cloudinary from "../config/cloudinary.js";
import Doctor from "../models/Doctor.js";

const uploadBufferToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "medilink/doctors",
        public_id: `doctor-${userId}-${Date.now()}`,
        resource_type: "image",
        overwrite: true,
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export const uploadDoctorPhoto = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary configuration is missing",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file",
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, req.user._id);

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { imageUrl: result.secure_url },
      { new: true }
    ).populate("user", "name email phone role isVerified status");

    return res.status(200).json({
      success: true,
      message: "Doctor photo uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload doctor photo",
      error: error.message,
    });
  }
};