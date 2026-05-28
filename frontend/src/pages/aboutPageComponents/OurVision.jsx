import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiUsers, FiGlobe, FiServer } from 'react-icons/fi';
import { FaNetworkWired } from 'react-icons/fa6'; // Fixed the missing export by using Fa6

export default function OurVision() {
  // Framer Motion Animation Configurations
  const slideFromLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 60, damping: 14 }
    }
  };

  const slideFromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 60, damping: 14, delay: 0.2 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Deep Cyan Ambient Light */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Text Content (Slides in from Left) */}
          <motion.div 
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold tracking-wider uppercase">
              <FiEye className="w-3.5 h-3.5" />
              Future Roadmap
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
              Our Vision
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              To become the leading digital healthcare platform, trusted by patients and medical professionals worldwide. We aim to foster a borderless healthcare grid where premium clinical consultations and instant tracking systems are available instantly at your fingertips.
            </p>

            {/* Core Pillars Mini Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00cc99]" />
                Global Trust Architecture
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Unified Network Mesh
              </div>
            </div>
          </motion.div>

          {/* Right Column: Abstract Medical Network Illustration (Slides in from Right) */}
          <motion.div 
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6 flex justify-center items-center w-full"
          >
            <div className="relative w-full max-w-md aspect-square max-h-[380px] bg-[#041715]/40 backdrop-blur-md rounded-3xl border border-emerald-950/80 p-8 flex flex-col justify-between shadow-2xl overflow-hidden group">
              
              {/* Subtle grid lines background overlay */}
              <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#00cc99_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

              {/* Section Tag */}
              <div className="flex items-center justify-between border-b border-emerald-950/60 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Global Node Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-[#00cc99] animate-pulse" />
              </div>

              {/* Interactive Floating Abstract Medical Network */}
              <div className="relative flex-1 flex items-center justify-center my-6">
                
                {/* Connecting Path Lines Simulation */}
                <svg className="absolute inset-0 w-full h-full stroke-emerald-900/40 stroke-[1.5] stroke-dasharray-[4_4] fill-none" viewBox="0 0 400 200">
                  <path d="M 50 100 Q 125 40 200 100" />
                  <path d="M 200 100 Q 275 160 350 100" />
                  <path d="M 50 100 Q 200 200 350 100" />
                </svg>

                {/* Central Server Core Node */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="absolute z-20 w-14 h-14 rounded-2xl bg-[#031211] border border-[#00cc99]/40 shadow-[0_0_25px_rgba(0,204,153,0.1)] flex items-center justify-center cursor-pointer group-hover:border-[#00cc99] transition-all"
                >
                  <FaNetworkWired className="w-5 h-5 text-[#00cc99]" />
                </motion.div>

                {/* Peripheral Nodes */}
                {/* Node 1: Patients (Top Left) */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 left-10 w-10 h-10 rounded-xl bg-[#031211] border border-emerald-900/60 flex items-center justify-center shadow-lg"
                  title="Patient Nodes"
                >
                  <FiUsers className="w-4 h-4 text-cyan-400" />
                </motion.div>

                {/* Node 2: Global Doctors (Bottom Right) */}
                <motion.div 
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-4 right-10 w-10 h-10 rounded-xl bg-[#031211] border border-emerald-900/60 flex items-center justify-center shadow-lg"
                  title="Doctor Infrastructure"
                >
                  <FiGlobe className="w-4 h-4 text-emerald-400" />
                </motion.div>

                {/* Node 3: Encrypted Core (Top Right) */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-6 right-12 w-9 h-9 rounded-xl bg-[#031211] border border-emerald-900/60 flex items-center justify-center shadow-md"
                >
                  <FiServer className="w-3.5 h-3.5 text-slate-400" />
                </motion.div>
              </div>

              {/* System Footer Metric Tag */}
              <div className="pt-4 border-t border-emerald-950/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Decentralized Framework</span>
                <span className="font-mono font-medium text-slate-400">v2.0.26-secure</span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}