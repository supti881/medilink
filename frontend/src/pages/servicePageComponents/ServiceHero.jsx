import React from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiPlay,
  FiUserCheck,
  FiActivity,
  FiPlusCircle,
  FiHeart,
} from 'react-icons/fi';

export default function ServiceHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative min-h-screen w-full bg-[#071316] text-white flex items-center justify-center px-[4%] py-20 overflow-hidden select-none">
      {/* Background Decorative Medical Glow */}
      <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[520px] h-[520px] rounded-full bg-emerald-500/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center relative z-10">
        {/* Left Side Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col text-center lg:text-left items-center lg:items-start"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-cyan-100 backdrop-blur-md mb-6 tracking-wide"
          >
            <FiHeart className="text-emerald-400" />
            MediLink Healthcare Services
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-6 text-white"
          >
            Smarter healthcare,{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              closer to you
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-400 leading-relaxed mb-10 max-w-xl"
          >
            MediLink helps patients book doctor appointments, manage medical
            records, track health updates, and connect with trusted healthcare
            providers from one secure platform.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto mb-12"
          >
            <button className="group relative w-full sm:w-auto px-8 py-4 bg-emerald-500 text-[#061214] font-semibold rounded-xl shadow-[0_20px_40px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden active:scale-95">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              Book Appointment
              <FiArrowRight className="relative group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95">
              <FiPlay className="text-cyan-300 fill-cyan-300/20" />
              How MediLink Works
            </button>
          </motion.div>

          {/* Medical Metrics */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-8 border-t border-white/10 pt-8 w-full justify-center lg:justify-start"
          >
            <div>
              <h4 className="text-2xl sm:text-3xl font-bold text-white">
                98.7%
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Patient Satisfaction
              </p>
            </div>

            <div className="w-[1px] h-10 bg-white/10" />

            <div>
              <h4 className="text-2xl sm:text-3xl font-bold text-white">
                10K+
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Appointments Managed
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side Visuals */}
        <div className="relative h-[480px] w-full flex items-center justify-center mt-10 lg:mt-0">
          {/* Main Medical Service Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 15,
              delay: 0.4,
            }}
            whileHover={{
              rotate: 0,
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
            className="w-[340px] sm:w-[360px] h-[380px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 flex flex-col justify-between shadow-[0_40px_80px_rgba(0,0,0,0.6)] cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl text-[#061214] shadow-[0_10px_20px_rgba(16,185,129,0.25)]">
              <FiPlusCircle />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Doctor Consultation
              </h3>
              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                Find available doctors, book appointments, and receive medical
                guidance through MediLink’s patient-friendly healthcare system.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-lg text-slate-300 border border-white/5">
                Appointment
              </span>
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-lg text-slate-300 border border-white/5">
                Records
              </span>
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-lg text-slate-300 border border-white/5">
                Care
              </span>
            </div>
          </motion.div>

          {/* Floating Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, -12, 0],
            }}
            transition={{
              initial: { type: 'spring', delay: 0.6 },
              y: {
                repeat: Infinity,
                duration: 5,
                ease: 'easeInOut',
              },
            }}
            className="absolute top-6 left-2 sm:left-6 md:left-12 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-2xl pointer-events-none"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-lg text-white shadow-lg">
              <FiUserCheck />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                Patient Profile
              </h4>
              <p className="text-xs text-slate-400">Secure medical access</p>
            </div>
          </motion.div>

          {/* Floating Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, 12, 0],
            }}
            transition={{
              initial: { type: 'spring', delay: 0.7 },
              y: {
                repeat: Infinity,
                duration: 5,
                ease: 'easeInOut',
                delay: 1,
              },
            }}
            className="absolute bottom-10 right-2 sm:right-6 md:right-12 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-2xl pointer-events-none"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-lg text-white shadow-lg">
              <FiActivity />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                Health Tracking
              </h4>
              <p className="text-xs text-slate-400">Monitor patient progress</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}