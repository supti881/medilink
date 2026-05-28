import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiClock, 
  FiTrendingUp, 
  FiSliders, 
  FiBell, 
  FiCheckCircle 
} from 'react-icons/fi';

export default function WhyChooseUs() {
  const features = [
    {
      id: 1,
      icon: <FiCheckCircle className="w-6 h-6 text-[#00cc99]" />,
      title: "Verified Doctors",
      description: "Every healthcare specialist on our platform undergoes a strict credential verification process for your absolute safety.",
    },
    {
      id: 2,
      icon: <FiShield className="w-6 h-6 text-[#00cc99]" />,
      title: "Secure Patient Records",
      description: "Your health records are protected with advanced, end-to-end encrypted storage protocols keeping data private.",
    },
    {
      id: 3,
      icon: <FiClock className="w-6 h-6 text-[#00cc99]" />,
      title: "Easy Appointment System",
      description: "Instantly browse open calendars, book a slot in seconds, or reschedule effortlessly without phone queues.",
    },
    {
      id: 4,
      icon: <FiTrendingUp className="w-6 h-6 text-[#00cc99]" />,
      title: "Fast Access to Healthcare",
      description: "Skip long waiting rooms. Connect immediately with available on-call general practitioners or urgent care consults.",
    },
    {
      id: 5,
      icon: <FiSliders className="w-6 h-6 text-[#00cc99]" />,
      title: "Patient-Friendly Dashboard",
      description: "An intuitive, clean interface built for all ages to seamlessly view prescriptions, lab reports, and vitals.",
    },
    {
      id: 6,
      icon: <FiBell className="w-6 h-6 text-[#00cc99]" />,
      title: "Appointment Reminders",
      description: "Never miss a checkup. Get automated SMS, email, or WhatsApp push updates directly ahead of your scheduled time.",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: 25 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 90, damping: 16 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#00cc99]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Sticky Section Copy */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full"
            >
              Why MediLink
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight"
            >
              Building Trust Through <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00cc99]">
                Smarter Digital Care
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed"
            >
              We prioritize transparency, quick accessibility, and strict security protocols to deliver an effortless patient experience you can safely depend on daily.
            </motion.p>

            {/* Micro statistic counter widget for added credibility */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 pt-8 border-t border-emerald-950/60 grid grid-cols-2 gap-4"
            >
              <div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Uptime & Encryption</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#00cc99]">100%</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Verified Medical staff</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Features List Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={featureVariants}
                whileHover={{ 
                  x: 4,
                  borderColor: "rgba(0, 204, 153, 0.35)",
                  backgroundColor: "rgba(4, 23, 21, 0.8)"
                }}
                className="group p-6 rounded-2xl bg-[#041715]/40 border border-emerald-950/70 shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle internal grid lines aesthetic */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#00cc99]/5 to-transparent pointer-events-none" />

                {/* Animated Minimalist Icon Frame */}
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#031211] border border-emerald-900/40 mb-4 group-hover:border-[#00cc99]/40 group-hover:shadow-[0_0_12px_rgba(0,204,153,0.08)] transition-all duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white mb-2 transition-colors duration-200 group-hover:text-[#00cc99]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}