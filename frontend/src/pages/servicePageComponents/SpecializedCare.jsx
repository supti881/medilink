import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeartPulse, 
  FaUserShield, 
  FaBrain, 
  FaBaby, 
  FaBone, 
  FaPersonPregnant, 
  FaStethoscope, 
  FaTooth 
} from 'react-icons/fa6';

export default function SpecializedCare() {
  const categories = [
    {
      id: 1,
      icon: <FaHeartPulse className="w-6 h-6 text-[#00cc99]" />,
      title: "Cardiology",
      description: "Comprehensive heart care, advanced diagnostics, and cardiovascular treatments.",
    },
    {
      id: 2,
      icon: <FaUserShield className="w-6 h-6 text-[#00cc99]" />,
      title: "Dermatology",
      description: "Expert care for skin conditions, allergies, and advanced cosmetic therapies.",
    },
    {
      id: 3,
      icon: <FaBrain className="w-6 h-6 text-[#00cc99]" />,
      title: "Neurology",
      description: "Advanced neurological assessment for brain, spine, and nerve disorders.",
    },
    {
      id: 4,
      icon: <FaBaby className="w-6 h-6 text-[#00cc99]" />,
      title: "Pediatrics",
      description: "Dedicated healthcare, immunizations, and wellness tracking for children.",
    },
    {
      id: 5,
      icon: <FaBone className="w-6 h-6 text-[#00cc99]" />,
      title: "Orthopedics",
      description: "Treatment for joint pains, bone fractures, and musculoskeletal health.",
    },
    {
      id: 6,
      icon: <FaPersonPregnant className="w-6 h-6 text-[#00cc99]" />,
      title: "Gynecology",
      description: "Complete women's healthcare, maternity services, and wellness guidance.",
    },
    {
      id: 7,
      icon: <FaStethoscope className="w-6 h-6 text-[#00cc99]" />,
      title: "General Medicine",
      description: "Routine health checkups, preventative medicine, and primary diagnosis.",
    },
    {
      id: 8,
      icon: <FaTooth className="w-6 h-6 text-[#00cc99]" />,
      title: "Dental Care",
      description: "Advanced oral hygiene, orthodontic treatments, and surgical care.",
    },
  ];

  // Framer Motion Grid Orchestration
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00cc99]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full"
            >
              Medical Departments
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Specialized Care Categories
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-slate-400 text-sm sm:text-base"
            >
              Connect with top-tier verified specialists across diverse medical disciplines tailored for your complete well-being.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <a 
              href="#all-departments" 
              className="text-sm font-medium text-[#00cc99] hover:text-cyan-400 transition-colors duration-200 inline-flex items-center gap-1.5 underline underline-offset-4"
            >
              View All Departments &rarr;
            </a>
          </motion.div>
        </div>

        {/* Categories Grid (Fluid Responsive Layout) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.div 
              key={category.id} 
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                backgroundColor: "rgba(4, 23, 21, 0.9)",
                borderColor: "rgba(0, 204, 153, 0.4)"
              }}
              className="group relative bg-[#041715]/50 backdrop-blur-sm p-6 rounded-2xl border border-emerald-950/80 shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Radial card gradient overlay that pops out on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00cc99]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Modern Framed Icon Base */}
                <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-[#031211] border border-emerald-900/50 mb-5 group-hover:shadow-[0_0_15px_rgba(0,204,153,0.1)] group-hover:border-[#00cc99]/40 transition-all duration-300">
                  {category.icon}
                </div>
                
                {/* Department Title */}
                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight group-hover:text-[#00cc99] transition-colors duration-200">
                  {category.title}
                </h3>
                
                {/* Description Text */}
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal mb-6">
                  {category.description}
                </p>
              </div>

              {/* Action Indicator */}
              <div className="text-xs font-medium text-slate-500 group-hover:text-[#00cc99] transition-colors duration-200 flex items-center gap-1 self-start mt-auto">
                Find Doctors 
                <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}