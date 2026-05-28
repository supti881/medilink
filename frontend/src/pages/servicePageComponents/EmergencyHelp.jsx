import React from 'react';
import { motion } from 'framer-motion';
import { FiPhoneCall, FiMapPin, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

export default function EmergencyHelp() {
  return (
    <section className="relative py-20 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-rose-950/30">
      
      {/* Background High-Impact Coral/Rose Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="relative bg-gradient-to-br from-[#1a090d] via-[#0d0406] to-[#020d0c] rounded-3xl border border-rose-950/60 p-8 sm:p-12 shadow-2xl overflow-hidden group"
        >
          {/* Subtle Right-side Grid Glow Highlight Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column (7 Columns) */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Critical Dispatch Active
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Need Urgent Medical Care? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-orange-400">
                  Find Emergency Support Fast.
                </span>
              </h2>
              
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
                MediLink routes real-time telemetry to locate nearby operational trauma centers, immediate ambulance networks, and on-call ER physicians to bypass traditional queue delays when seconds count.
              </p>
            </div>

            {/* Right Action Column (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:max-w-md sm:mx-auto lg:w-auto">
              
              {/* Primary Hotline Button */}
              <motion.a
                href="tel:911"
                whileHover={{ scale: 1.02, brightness: 1.1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-950/40 transition-all duration-200"
              >
                <FiPhoneCall className="w-4 h-4 animate-bounce" />
                Call Emergency Helpline
              </motion.a>

              {/* Secondary Hospital Finder Button */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#031211] hover:text-rose-400 text-slate-300 font-medium text-sm rounded-2xl border border-rose-950/80 transition-all duration-200"
              >
                <FiMapPin className="w-4 h-4 text-rose-500" />
                Locate Nearby ER Rooms
              </motion.button>

            </div>

          </div>

          {/* Bottom Security Assurance Footnote */}
          <div className="mt-8 pt-4 border-t border-rose-950/30 flex items-center gap-2 justify-center lg:justify-start text-[11px] text-slate-500">
            <FiAlertTriangle className="text-rose-600/70 w-3.5 h-3.5" />
            <span>Emergency locator services execute safely with zero latency caching. Your geolocation data remains strictly local.</span>
          </div>

        </motion.div>
      </div>
    </section>
  );
}