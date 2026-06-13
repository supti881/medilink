import React from "react";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiActivity,
  FiUsers,
  FiCpu,
  FiPlus,
} from "react-icons/fi";

export default function HeroAbout() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (customDelay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        delay: customDelay,
      },
    }),
  };

  const scrollToSectionByText = (text) => {
    const sections = Array.from(document.querySelectorAll("section"));

    const target = sections.find((section) =>
      section.textContent.toLowerCase().includes(text.toLowerCase())
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden border-b border-emerald-950/20 bg-[#020d0c] py-20 text-slate-200 lg:py-0">
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#00cc99]/5 blur-[140px]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00cc99_1px,transparent_1px),linear-gradient(to_bottom,#00cc99_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.015]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="space-y-8 text-center lg:col-span-7 lg:text-left">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-[#00cc99]/20 bg-[#00cc99]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00cc99]"
            >
              <FiCpu className="h-3.5 w-3.5" />
              Introducing MediLink Architecture
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.15}
                className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Empowering <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-400 via-[#00cc99] to-emerald-400 bg-clip-text text-transparent">
                  Digital Healthcare
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="mx-auto max-w-xl text-sm font-normal leading-relaxed text-slate-400 sm:text-base lg:mx-0 lg:text-lg"
              >
                Connecting patients and doctors through innovative healthcare
                technology. We unify medical workflows, structural records, and
                consultations into a single secure ecosystem.
              </motion.p>
            </div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <motion.button
                type="button"
                onClick={() => scrollToSectionByText("Our Mission")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-[#00cc99] px-6 py-3.5 text-sm font-semibold text-[#020d0c] shadow-lg shadow-cyan-950/20 transition-all duration-200 hover:shadow-xl sm:w-auto"
              >
                Learn More About Us
              </motion.button>

              <motion.button
                type="button"
                onClick={() => scrollToSectionByText("The Journey of MediLink")}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-[#00cc99]/30 hover:bg-white/[0.06] hover:text-white sm:w-auto"
              >
                Explore System Workflow
                <FiArrowRight className="h-4 w-4 text-[#00cc99]" />
              </motion.button>
            </motion.div>
          </div>

          <div className="relative flex w-full items-center justify-center lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 40,
                damping: 12,
                delay: 0.4,
              }}
              className="group relative flex h-[340px] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-emerald-950/80 bg-[#041715]/40 p-8 shadow-2xl backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-[#00cc99]/5" />

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    System Integrity
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    Active Platform Hub
                  </h3>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/60 bg-[#031211]">
                  <FiActivity className="h-4 w-4 animate-pulse text-[#00cc99]" />
                </div>
              </div>

              <div className="relative my-auto flex items-center justify-center gap-8 py-6">
                <div className="absolute -z-10 h-[1px] w-2/3 border-t border-dashed border-emerald-900/40" />

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-900/60 bg-[#031211] shadow-lg transition-colors group-hover:border-cyan-500/50"
                  title="Patient Node"
                >
                  <FiUsers className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00cc99]/40 bg-[#00cc99]/20">
                  <FiPlus className="h-4 w-4 text-[#00cc99]" />
                </div>

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-900/60 bg-[#031211] shadow-lg transition-colors group-hover:border-[#00cc99]/50"
                  title="Doctor Node"
                >
                  <FiActivity className="h-5 w-5 text-[#00cc99]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-emerald-950/60 pt-4 text-xs">
                <div>
                  <p className="font-medium text-slate-500">Network Relay</p>
                  <p className="mt-0.5 font-semibold text-white">
                    Automated Sync
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium text-slate-500">
                    Latency Threshold
                  </p>
                  <p className="mt-0.5 font-mono font-bold text-[#00cc99]">
                    &lt; 14ms
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}