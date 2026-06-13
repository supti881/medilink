import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiArrowRight, FiActivity, FiShield, FiHeart } from "react-icons/fi";

export default function CtaJoinUs() {
  return (
    <section className="relative overflow-hidden border-t border-emerald-950/40 bg-[#020d0c] py-24 text-slate-200">
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-[300px] w-[500px] -translate-y-1/2 rounded-full bg-[#00cc99]/5 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-[300px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="group relative overflow-hidden rounded-3xl border border-emerald-950 bg-gradient-to-br from-[#041715]/90 via-[#031211]/90 to-[#020d0c] p-8 text-center shadow-2xl sm:p-12 lg:p-16"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-[#00cc99]/5 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-cyan-500/5 to-transparent" />

          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-900/60 bg-[#031211] text-[#00cc99] shadow-lg transition-colors duration-300 group-hover:border-[#00cc99]/40"
            >
              <FiHeart className="h-5 w-5 fill-[#00cc99]/10" />
            </motion.div>
          </div>

          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Start Your Journey <br />
              With{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-[#00cc99] bg-clip-text text-transparent">
                MediLink
              </span>
            </h2>

            <p className="mx-auto max-w-lg text-sm font-normal leading-relaxed text-slate-400 sm:text-base">
              Join thousands of patients and medical professionals who have
              already transitioned to a smarter, more organized digital
              healthcare ecosystem.
            </p>
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex-1"
            >
              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-[#00cc99] px-8 py-4 text-sm font-bold text-[#020d0c] shadow-xl shadow-cyan-950/30 transition-all duration-200 hover:brightness-110"
              >
                Get Started
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex-1"
            >
              <Link
                to="/doctors"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-950 bg-[#031211] px-6 py-4 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-[#00cc99]/40 hover:bg-[#00cc99]/10 hover:text-white"
              >
                Book a Consultation
                <FiArrowRight className="h-4 w-4 text-[#00cc99]" />
              </Link>
            </motion.div>
          </div>

          <div className="mx-auto mt-12 grid max-w-xl grid-cols-1 gap-3 border-t border-emerald-950/60 pt-6 text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-1.5">
              <FiShield className="h-3.5 w-3.5 text-[#00cc99]" />
              <span>HIPAA Compliant</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 border-emerald-950/60 sm:border-x">
              <FiActivity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Real-time Sync</span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <FiShield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Fully Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}