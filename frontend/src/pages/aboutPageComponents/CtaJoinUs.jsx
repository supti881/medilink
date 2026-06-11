import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiActivity, FiShield, FiHeart } from 'react-icons/fi';

export default function CtaJoinUs() {
  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* High-Impact Background Glow Spots */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-[#00cc99]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Animated Call-To-Action Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="relative bg-gradient-to-br from-[#041715]/90 via-[#031211]/90 to-[#020d0c] rounded-3xl border border-emerald-950 p-8 sm:p-12 lg:p-16 text-center shadow-2xl overflow-hidden group"
        >
          {/* Subtle Corner Tech Geometric Line Overlay */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#00cc99]/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/5 to-transparent pointer-events-none" />

          {/* Upper Micro Icon Badge */}
          <div className="flex justify-center mb-6">
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-[#031211] border border-emerald-900/60 flex items-center justify-center shadow-lg text-[#00cc99] group-hover:border-[#00cc99]/40 transition-colors duration-300"
            >
              <FiHeart className="w-5 h-5 fill-[#00cc99]/10" />
            </motion.div>
          </div>

          {/* Text Content Block */}
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Start Your Journey <br />
              With <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00cc99]">MediLink</span>
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-normal">
              Join thousands of patients and medical professionals who have already transitioned to a smarter, more organized digital healthcare ecosystem.
            </p>
          </div>

          {/* Action Targets Button Layout */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-sm mx-auto w-full">
            
            {/* Primary Action */}
            <motion.button 
              whileHover={{ scale: 1.02, brightness: 1.1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-[#00cc99] text-[#020d0c] font-bold text-sm rounded-xl shadow-xl shadow-cyan-950/30 transition-all duration-200"
            >
              Get Started
            </motion.button>
            
            {/* Secondary Action */}
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 204, 153, 0.08)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#031211] hover:text-[#00cc99] text-slate-300 font-semibold text-sm rounded-xl border border-emerald-950 transition-all duration-200"
            >
              Book a Consultation
              <FiArrowRight className="w-4 h-4 text-[#00cc99]" />
            </motion.button>
            
          </div>

          {/* Lower Security & Architecture Badges Footer */}
          <div className="mt-12 pt-6 border-t border-emerald-950/60 grid grid-cols-3 gap-2 max-w-xl mx-auto text-[10px] text-slate-500 font-medium tracking-wide uppercase">
            <div className="flex items-center justify-center gap-1.5">
              <FiShield className="text-[#00cc99] w-3.5 h-3.5" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 border-x border-emerald-950/60">
              <FiActivity className="text-cyan-400 w-3.5 h-3.5" />
              <span>Real-time Sync</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <FiShield className="text-emerald-400 w-3.5 h-3.5" />
              <span>Fully Encrypted</span>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}