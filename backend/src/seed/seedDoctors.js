import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

dotenv.config();

const doctors = [
  {
    name: "Dr. Ayesha Rahman",
    email: "doctor1@medilink.com",
    phone: "01733333333",
    fullName: "Dr. Ayesha Rahman",
    specialization: "Cardiologist",
    department: "Cardiology",
    qualification: "MBBS, FCPS Cardiology",
    experienceYears: 8,
    consultationFee: 800,
    bio: "Experienced cardiologist focused on heart disease prevention and patient care.",
    availableSlots: [
      {
        day: "Sunday",
        startTime: "10:00 AM",
        endTime: "01:00 PM",
        capacity: 5,
        bookedCount: 0,
        isActive: true,
      },
      {
        day: "Tuesday",
        startTime: "04:00 PM",
        endTime: "07:00 PM",
        capacity: 5,
        bookedCount: 0,
        isActive: true,
      },
    ],
  },
  {
    name: "Dr. Farhan Islam",
    email: "doctor2@medilink.com",
    phone: "01733333334",
    fullName: "Dr. Farhan Islam",
    specialization: "Neurologist",
    department: "Neurology",
    qualification: "MBBS, MD Neurology",
    experienceYears: 10,
    consultationFee: 1000,
    bio: "Neurology specialist for migraine, stroke, nerve pain, and brain-related conditions.",
    availableSlots: [
      {
        day: "Monday",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        capacity: 6,
        bookedCount: 0,
        isActive: true,
      },
      {
        day: "Wednesday",
        startTime: "05:00 PM",
        endTime: "08:00 PM",
        capacity: 6,
        bookedCount: 0,
        isActive: true,
      },
    ],
  },
  {
    name: "Dr. Nusrat Jahan",
    email: "doctor3@medilink.com",
    phone: "01733333335",
    fullName: "Dr. Nusrat Jahan",
    specialization: "Dermatologist",
    department: "Dermatology",
    qualification: "MBBS, DDV",
    experienceYears: 6,
    consultationFee: 700,
    bio: "Dermatology consultant for skin allergy, acne, hair fall, and cosmetic skin care.",
    availableSlots: [
      {
        day: "Saturday",
        startTime: "11:00 AM",
        endTime: "02:00 PM",
        capacity: 5,
        bookedCount: 0,
        isActive: true,
      },
      {
        day: "Thursday",
        startTime: "04:00 PM",
        endTime: "06:00 PM",
        capacity: 4,
        bookedCount: 0,
        isActive: true,
      },
    ],
  },
  {
    name: "Dr. Mahmud Hasan",
    email: "doctor4@medilink.com",
    phone: "01733333336",
    fullName: "Dr. Mahmud Hasan",
    specialization: "Pediatrician",
    department: "Pediatrics",
    qualification: "MBBS, DCH",
    experienceYears: 7,
    consultationFee: 650,
    bio: "Child health specialist for fever, nutrition, vaccination, and common pediatric illness.",
    availableSlots: [
      {
        day: "Sunday",
        startTime: "03:00 PM",
        endTime: "06:00 PM",
        capacity: 6,
        bookedCount: 0,
        isActive: true,
      },
      {
        day: "Tuesday",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        capacity: 6,
        bookedCount: 0,
        isActive: true,
      },
    ],
  },
  {
    name: "Dr. Sabrina Karim",
    email: "doctor5@medilink.com",
    phone: "01733333337",
    fullName: "Dr. Sabrina Karim",
    specialization: "Orthopedic Surgeon",
    department: "Orthopedics",
    qualification: "MBBS, MS Orthopedics",
    experienceYears: 9,
    consultationFee: 900,
    bio: "Orthopedic specialist for bone, joint, fracture, arthritis, and sports injury care.",
    availableSlots: [
      {
        day: "Monday",
        startTime: "04:00 PM",
        endTime: "07:00 PM",
        capacity: 5,
        bookedCount: 0,
        isActive: true,
      },
      {
        day: "Friday",
        startTime: "10:00 AM",
        endTime: "01:00 PM",
        capacity: 5,
        bookedCount: 0,
        isActive: true,
      },
    ],
  },
  {
    name: "Dr. Tanvir Ahmed",
    email: "doctor6@medilink.com",
    phone: "01733333338",
    fullName: "Dr. Tanvir Ahmed",
    specialization: "Medicine Specialist",
    department: "Medicine",
    qualification: "MBBS, FCPS Medicine",
    experienceYears: 11,
    consultationFee: 750,
    bio: "Medicine specialist for diabetes, hypertension, fever, infection, and chronic disease care.",
    availableSlots: [
      {
        day: "Wednesday",
        startTime: "10:00 AM",
        endTime: "01:00 PM",
        capacity: 7,
        bookedCount: 0,
        isActive: true,
      },
      {
        day: "Saturday",
        startTime: "05:00 PM",
        endTime: "08:00 PM",
        capacity: 7,
        bookedCount: 0,
        isActive: true,
      },
    ],
  },
];

const seedDoctors = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash("123456", 10);

    for (const doctorData of doctors) {
      let user = await User.findOne({ email: doctorData.email });

      if (!user) {
        user = await User.create({
          name: doctorData.name,
          email: doctorData.email,
          password: hashedPassword,
          phone: doctorData.phone,
          role: "doctor",
          isVerified: true,
          status: "active",
        });
      }

      const existingDoctor = await Doctor.findOne({ user: user._id });

      if (!existingDoctor) {
        await Doctor.create({
          user: user._id,
          fullName: doctorData.fullName,
          specialization: doctorData.specialization,
          department: doctorData.department,
          qualification: doctorData.qualification,
          experienceYears: doctorData.experienceYears,
          consultationFee: doctorData.consultationFee,
          bio: doctorData.bio,
          phone: doctorData.phone,
          imageUrl: "",
          availableSlots: doctorData.availableSlots,
          rating: 0,
          totalReviews: 0,
          status: "active",
        });

        console.log(`Added: ${doctorData.fullName}`);
      } else {
        console.log(`Already exists: ${doctorData.fullName}`);
      }
    }

    console.log("Doctor seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Doctor seeding failed:", error.message);
    process.exit(1);
  }
};

seedDoctors();