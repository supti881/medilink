import React from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiSearch, FiCalendar, FiArrowRight } from 'react-icons/fi';

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: <FiUserPlus className="w-7 h-7 text-[#00cc99]" />,
      title: "Create Patient Profile",
      description: "Sign up securely in less than a minute. Fill in your basic details and medical history to set up your secure profile.",
    },
    {
      id: 2,
      icon: <FiSearch className="w-7 h-7 text-[#00cc99]" />,
      title: "Choose Doctor or Service",
      description: "Explore a curated list of verified specialists, hospitals, and clinics. Filter by specialty, location, and user reviews.",
    },
    {
      id: 3,
      icon: <FiCalendar className="w-7 h-7 text-[#00cc99]" />,
      title: "Book & Consult",
      description: "Pick a convenient time slot for an in-person appointment or start an instant secure video consultation from anywhere.",
    },
  ];

  // Animation Configs
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 }
    }
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.8, ease: "easeInOut", delay: 0.4 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00cc99]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full"
          >
            Smarter Workflow
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00cc99]">MediLink</span> Works
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            A simple 3-step healthcare journey designed to connect you quickly with premium medical attention.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative"
        >
          
          {/* Animated Connecting Line (Hidden on Mobile Layouts) */}
          <div className="hidden md:block absolute top-[28%] left-[15%] right-[15%] h-[2px] bg-emerald-950/50 -z-10">
            <motion.div 
              variants={lineVariants}
              className="h-full bg-gradient-to-r from-cyan-500/80 to-[#00cc99]/80 origin-left"
            />
          </div>

          {steps.map((step) => (
            <motion.div 
              key={step.id} 
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative bg-[#041715]/60 backdrop-blur-md p-8 rounded-2xl border border-emerald-950/80 hover:border-[#00cc99]/40 shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Dynamic Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#00cc99]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Top Step Counter */}
              <div className="absolute -top-3 left-6 bg-[#031211] text-[#00cc99] text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-900/60 shadow-sm">
                0{step.id}
              </div>
              
              {/* Neo-Dark Medical Icon Wrapper */}
              <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-[#031211] border border-emerald-900/60 mb-6 group-hover:shadow-[0_0_20px_rgba(0,204,153,0.15)] group-hover:border-[#00cc99]/50 transition-all duration-300">
                {step.icon}
              </div>
              
              {/* Card Header & Description */}
              <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-[#00cc99] transition-colors duration-200">
                {step.title}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed font-normal">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Dynamic CTA Button matching Hero style */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-[#00cc99] hover:brightness-110 text-[#020d0c] font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/20 transition-all duration-200"
          >
            Get Started Now
            <FiArrowRight className="w-4 h-4 text-[#020d0c]" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}