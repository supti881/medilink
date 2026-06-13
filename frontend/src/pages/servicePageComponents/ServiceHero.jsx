import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiPlay,
  FiUserCheck,
  FiActivity,
  FiPlusCircle,
  FiHeart,
} from "react-icons/fi";

export default function ServiceHero() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-medilink-works")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative flex min-h-screen w-full select-none items-center justify-center overflow-hidden bg-[#071316] px-[4%] py-20 text-white">
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-[520px] w-[520px] rounded-full bg-emerald-500/20 blur-[150px]" />
      <div className="absolute left-1/2 top-0 h-[1px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.span
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium tracking-wide text-cyan-100 backdrop-blur-md"
          >
            <FiHeart className="text-emerald-400" />
            MediLink Healthcare Services
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Smarter healthcare,{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              closer to you
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-10 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            MediLink helps patients book doctor appointments, manage medical
            records, track health updates, and connect with trusted healthcare
            providers from one secure platform.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-12 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
          >
            <Link
              to="/doctors"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-[#061214] shadow-[0_20px_40px_rgba(16,185,129,0.25)] transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] active:scale-95 sm:w-auto"
            >
              <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative">Book Appointment</span>
              <FiArrowRight className="relative transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 active:scale-95 sm:w-auto"
            >
              <FiPlay className="fill-cyan-300/20 text-cyan-300" />
              How MediLink Works
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex w-full items-center justify-center gap-8 border-t border-white/10 pt-8 lg:justify-start"
          >
            <div>
              <h4 className="text-2xl font-bold text-white sm:text-3xl">
                98.7%
              </h4>
              <p className="text-xs text-slate-500 sm:text-sm">
                Patient Satisfaction
              </p>
            </div>

            <div className="h-10 w-[1px] bg-white/10" />

            <div>
              <h4 className="text-2xl font-bold text-white sm:text-3xl">
                10K+
              </h4>
              <p className="text-xs text-slate-500 sm:text-sm">
                Appointments Managed
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="relative mt-10 flex h-[480px] w-full items-center justify-center lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 15,
              delay: 0.4,
            }}
            whileHover={{
              rotate: 0,
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
            className="flex h-[380px] w-[340px] cursor-pointer flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:w-[360px]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-2xl text-[#061214] shadow-[0_10px_20px_rgba(16,185,129,0.25)]">
              <FiPlusCircle />
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                Doctor Consultation
              </h3>
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">
                Find available doctors, book appointments, and receive medical
                guidance through MediLink’s patient-friendly healthcare system.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                Appointment
              </span>
              <span className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                Records
              </span>
              <span className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                Care
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, -12, 0],
            }}
            transition={{
              initial: { type: "spring", delay: 0.6 },
              y: {
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut",
              },
            }}
            className="pointer-events-none absolute left-2 top-6 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl sm:left-6 md:left-12"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg text-white shadow-lg">
              <FiUserCheck />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                Patient Profile
              </h4>
              <p className="text-xs text-slate-400">Secure medical access</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, 12, 0],
            }}
            transition={{
              initial: { type: "spring", delay: 0.7 },
              y: {
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut",
                delay: 1,
              },
            }}
            className="pointer-events-none absolute bottom-10 right-2 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl sm:right-6 md:right-12"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg text-white shadow-lg">
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