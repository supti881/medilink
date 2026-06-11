import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiActivity, FiUsers, FiCpu, FiPlus } from 'react-icons/fi';

export default function HeroAbout() {
  // Animation presets
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (customDelay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 15, delay: customDelay }
    })
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#020d0c] text-slate-200 overflow-hidden py-20 lg:py-0 border-b border-emerald-950/20">
      
      {/* Subtle Medical-Themed Blur Background Layer */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00cc99]/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Abstract Grid Line Overlays for High-Tech Aesthetic */}
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#00cc99_1px,transparent_1px),linear-gradient(to_bottom,#00cc99_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Headline and Positioning (7 Columns) */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#00cc99]/10 border border-[#00cc99]/20 text-[#00cc99] rounded-full text-xs font-semibold tracking-wider uppercase"
            >
              <FiCpu className="w-3.5 h-3.5 animate-spin-slow" />
              Introducing MediLink Architecture
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.15}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
              >
                Empowering <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00cc99] to-emerald-400">
                  Digital Healthcare
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Connecting patients and doctors through innovative healthcare technology. We unify medical workflows, structural records, and consultations into a single secure ecosystem.
              </motion.p>
            </div>

            {/* Action Targets */}
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-[#00cc99] text-[#020d0c] font-semibold text-sm rounded-xl shadow-lg shadow-cyan-950/20 hover:shadow-xl transition-all duration-200"
              >
                Learn More About Us
              </motion.button>
              
              <motion.a 
                href="#how-it-works"
                whileHover={{ x: 3 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-300 hover:text-white py-3 px-5 transition-colors"
              >
                Explore System Workflow
                <FiArrowRight className="w-4 h-4 text-[#00cc99]" />
              </motion.a>
            </motion.div>
          </div>

          {/* Right Column: Abstract Abstract Geometric Framework Mockup (5 Columns) */}
          <div className="lg:col-span-5 flex justify-center items-center relative w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.4 }}
              className="relative w-full max-w-md h-[340px] rounded-3xl bg-[#041715]/40 backdrop-blur-md border border-emerald-950/80 p-8 flex flex-col justify-between shadow-2xl overflow-hidden group"
            >
              {/* Internal Mesh Aesthetic Grid Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-[#00cc99]/5 pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">System Integrity</span>
                  <h3 className="text-lg font-bold text-white tracking-tight">Active Platform Hub</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#031211] border border-emerald-900/60 flex items-center justify-center">
                  <FiActivity className="w-4 h-4 text-[#00cc99] animate-pulse" />
                </div>
              </div>

              {/* Central Abstract Data Architecture Link Display */}
              <div className="my-auto py-6 flex items-center justify-center gap-8 relative">
                {/* Visual Intersect Pipeline lines */}
                <div className="absolute w-2/3 h-[1px] bg-dashed bg-emerald-950 border-t border-dashed border-emerald-900/40 -z-10" />

                <div className="w-12 h-12 rounded-xl bg-[#031211] border border-emerald-900/60 flex items-center justify-center shadow-lg group-hover:border-cyan-500/50 transition-colors" title="Patient Node">
                  <FiUsers className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00cc99]/20 border border-[#00cc99]/40 flex items-center justify-center">
                  <FiPlus className="w-4 h-4 text-[#00cc99]" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#031211] border border-emerald-900/60 flex items-center justify-center shadow-lg group-hover:border-[#00cc99]/50 transition-colors" title="Doctor Node">
                  <FiActivity className="w-5 h-5 text-[#00cc99]" />
                </div>
              </div>

              {/* Bottom Decorative Metrics Widget */}
              <div className="grid grid-cols-2 gap-4 border-t border-emerald-950/60 pt-4 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Network Relay</p>
                  <p className="text-white font-semibold mt-0.5">Automated Sync</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium">Latency Threshold</p>
                  <p className="text-[#00cc99] font-mono font-bold mt-0.5">&lt; 14ms</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}