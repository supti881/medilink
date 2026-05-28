import React from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiVideo, FiFileText, FiUser, FiAlertCircle, FiActivity } from "react-icons/fi";

const services = [
  {
    icon: <FiCalendar size={24} />,
    title: "Doctor Appointment Booking",
    description: "Patients can find doctors and book available time slots.",
  },
  {
    icon: <FiVideo size={24} />,
    title: "Online Consultation",
    description: "Connect with doctors remotely for basic medical guidance.",
  },
  {
    icon: <FiFileText size={24} />,
    title: "Patient Medical Records",
    description: "Store prescriptions, reports, and health history securely.",
  },
  {
    icon: <FiUser size={24} />,
    title: "Doctor Profiles",
    description: "View doctor specialization, experience, availability, and fees.",
  },
  {
    icon: <FiAlertCircle size={24} />,
    title: "Emergency Support",
    description: "Help patients access urgent medical assistance faster.",
  },
  {
    icon: <FiActivity size={24} />,
    title: "Health Tracking",
    description: "Track symptoms, vitals, appointment history, and treatment progress.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
};

export default function CoreServices() {
  return (
    <section className="relative w-full bg-[#0c161f] text-white py-20 px-4 sm:px-8">
      <motion.div
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Our Core Services
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          MediLink provides a full range of digital healthcare services designed for patients and doctors alike.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-start gap-4 hover:bg-white/10 hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md">
              {service.icon}
            </div>
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="text-sm text-slate-400">{service.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}