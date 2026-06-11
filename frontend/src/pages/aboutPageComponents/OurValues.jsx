import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiLock, FiZap, FiCpu } from 'react-icons/fi';

export default function OurValues() {
  const values = [
    {
      id: 1,
      icon: <FiActivity className="w-6 h-6 text-[#00cc99]" />,
      title: "Patient-Centric",
      description: "We put patient care at the forefront of everything we do, adapting our workflows around user health.",
    },
    {
      id: 2,
      icon: <FiLock className="w-6 h-6 text-cyan-400" />,
      title: "Security",
      description: "All medical records and personal data are fully secure behind modern, end-to-end encrypted storage vaults.",
    },
    {
      id: 3,
      icon: <FiZap className="w-6 h-6 text-amber-400" />,
      title: "Fast Access",
      description: "Quick appointment booking and instant doctor connectivity to bypass traditional wait times completely.",
    },
    {
      id: 4,
      icon: <FiCpu className="w-6 h-6 text-indigo-400" />,
      title: "Innovation",
      description: "Continuously improving digital healthcare experiences by updating the core application framework.",
    },
  ];

  // Grid Stagger Entrance Configurations
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Ambient Spotlights */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[#00cc99]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full"
          >
            Core Pillars
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Why Choose MediLink
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            Our core values define how we build tools to optimize medical processes and connect patients with physicians safely.
          </motion.p>
        </div>

        {/* Values Cards Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((item) => (
            <motion.div 
              key={item.id} 
              variants={cardVariants}
              whileHover={{ 
                scale: 1.04, 
                y: -4,
                backgroundColor: "rgba(4, 23, 21, 0.8)",
                borderColor: "rgba(0, 204, 153, 0.35)",
                boxShadow: "0 10px 30px -10px rgba(0, 204, 153, 0.15)"
              }}
              className="group relative bg-[#041715]/40 backdrop-blur-sm p-6 rounded-2xl border border-emerald-950/80 transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Radial card overlay backdrop */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

              {/* Neo-Dark Rounded Icon Container */}
              <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-[#031211] border border-emerald-900/50 mb-5 group-hover:border-[#00cc99]/30 transition-all duration-300">
                {item.icon}
              </div>
              
              {/* Value Title */}
              <h3 className="text-base font-bold text-white mb-2 tracking-tight transition-colors duration-200 group-hover:text-white">
                {item.title}
              </h3>
              
              {/* Value Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}