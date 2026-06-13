import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiUserPlus, FiSearch, FiCalendar, FiArrowRight } from "react-icons/fi";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: <FiUserPlus className="h-7 w-7 text-[#00cc99]" />,
      title: "Create Patient Profile",
      description:
        "Sign up securely in less than a minute. Fill in your basic details and medical history to set up your secure profile.",
    },
    {
      id: 2,
      icon: <FiSearch className="h-7 w-7 text-[#00cc99]" />,
      title: "Choose Doctor or Service",
      description:
        "Explore verified specialists and choose the right doctor for your healthcare needs.",
    },
    {
      id: 3,
      icon: <FiCalendar className="h-7 w-7 text-[#00cc99]" />,
      title: "Book & Consult",
      description:
        "Pick a convenient time slot, make payment, and consult with your doctor through MediLink.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.8, ease: "easeInOut", delay: 0.4 },
    },
  };

  return (
    <section
      id="how-medilink-works"
      className="relative scroll-mt-28 overflow-hidden border-t border-emerald-950/40 bg-[#020d0c] py-24 text-slate-200"
    >
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#00cc99]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-full border border-[#00cc99]/20 bg-[#00cc99]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#00cc99]"
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
            How{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-[#00cc99] bg-clip-text text-transparent">
              MediLink
            </span>{" "}
            Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            A simple 3-step healthcare journey designed to connect patients
            quickly with trusted medical care.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12"
        >
          <div className="absolute left-[15%] right-[15%] top-[28%] -z-10 hidden h-[2px] bg-emerald-950/50 md:block">
            <motion.div
              variants={lineVariants}
              className="h-full origin-left bg-gradient-to-r from-cyan-500/80 to-[#00cc99]/80"
            />
          </div>

          {steps.map((step) => (
            <motion.div
              key={step.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative flex flex-col items-center rounded-2xl border border-emerald-950/80 bg-[#041715]/60 p-8 text-center shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#00cc99]/40"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#00cc99]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute -top-3 left-6 rounded border border-emerald-900/60 bg-[#031211] px-2.5 py-0.5 font-mono text-xs font-bold text-[#00cc99] shadow-sm">
                0{step.id}
              </div>

              <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-900/60 bg-[#031211] transition-all duration-300 group-hover:border-[#00cc99]/50 group-hover:shadow-[0_0_20px_rgba(0,204,153,0.15)]">
                {step.icon}
              </div>

              <h3 className="mb-3 text-lg font-semibold text-white transition-colors duration-200 group-hover:text-[#00cc99]">
                {step.title}
              </h3>

              <p className="text-sm font-normal leading-relaxed text-slate-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00cc99] px-6 py-3 text-sm font-semibold text-[#020d0c] shadow-lg shadow-emerald-950/20 transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            Get Started Now
            <FiArrowRight className="h-4 w-4 text-[#020d0c]" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}