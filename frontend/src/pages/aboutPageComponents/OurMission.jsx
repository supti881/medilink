import React from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiGrid, FiShield, FiCornerDownRight } from 'react-icons/fi';

export default function OurMission() {
  const pillars = [
    {
      id: 1,
      icon: <FiGlobe className="w-5 h-5 text-cyan-400" />,
      title: "Universal Accessibility",
      description: "Breaking geographic barriers to provide instant, effortless access to medical consultations and expert healthcare from anywhere.",
    },
    {
      id: 2,
      icon: <FiGrid className="w-5 h-5 text-[#00cc99]" />,
      title: "Intelligent Organization",
      description: "Consolidating scattered appointment structures, lab reports, and prescription pipelines into one unified health ledger.",
    },
    {
      id: 3,
      icon: <FiShield className="w-5 h-5 text-emerald-400" />,
      title: "Absolute Reliability",
      description: "Securing patient records with robust encryption while guaranteeing synchronized calendars you can safely depend on.",
    },
  ];

  // Framer Motion Slide-In Animation Variants
  const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 60, damping: 14 }
    }
  };

  const containerRight = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Ambience Accent */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#00cc99]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Mission Core Headline (5 Columns) */}
          <motion.div 
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00cc99]/10 border border-[#00cc99]/20 text-[#00cc99] rounded-full text-xs font-semibold tracking-wider uppercase">
              Core Purpose
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
              Our Mission
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              To make healthcare accessible, organized, and reliable for everyone by providing a unified digital platform for appointments, consultations, and health tracking.
            </p>

            {/* Micro aesthetic pointer layout */}
            <div className="pt-4 hidden lg:block">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 uppercase tracking-widest">
                <FiCornerDownRight className="text-[#00cc99] w-4 h-4" />
                Architecting the Future
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Pillar List (7 Columns) */}
          <motion.div 
            variants={containerRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-7 space-y-6 w-full"
          >
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.id}
                variants={slideInRight}
                whileHover={{ x: 6, borderColor: "rgba(0, 204, 153, 0.3)" }}
                className="group flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl bg-[#041715]/40 border border-emerald-950/70 shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual hover background element */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00cc99]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Minimalist Icon Block */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#031211] border border-emerald-900/40 flex-shrink-0 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(0,204,153,0.1)]">
                  {pillar.icon}
                </div>

                {/* Text Layout Block */}
                <div className="space-y-1 mt-2 sm:mt-0">
                  <h3 className="text-base font-semibold text-white transition-colors duration-200 group-hover:text-[#00cc99]">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}