import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiBriefcase, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

export default function TimelineMilestones() {
  const milestones = [
    {
      id: 1,
      year: "2024",
      icon: <FiAward className="w-5 h-5 text-cyan-400" />,
      title: "MediLink Founded",
      description: "The core platform architecture was conceptualized and initiated to bridge critical operational gaps in local clinic connectivity.",
    },
    {
      id: 2,
      year: "2025",
      icon: <FiUsers className="w-5 h-5 text-[#00cc99]" />,
      title: "1,000+ Active Patients Registered",
      description: "Achieved our first major user acquisition milestone, processing medical accounts securely across our preliminary launch phase.",
    },
    {
      id: 3,
      year: "2025",
      icon: <FiBriefcase className="w-5 h-5 text-emerald-400" />,
      title: "First Hospital Partnership",
      description: "Signed a milestone integration agreement with a major healthcare facility, allowing direct synchronization with real-time doctor rosters.",
    },
    {
      id: 4,
      year: "2026",
      icon: <FiRefreshCw className="w-5 h-5 text-indigo-400" />,
      title: "Major V2 Product Lifecycle Upgrade",
      description: "Deployed our fully centralized health history vaults, including prescription uploads, live video consultation channels, and emergency routing protocols.",
    }
  ];

  // Animation variants
  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: { duration: 1.2, ease: "easeInOut" }
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00cc99]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            Our History
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            The Journey of MediLink
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-400 text-sm sm:text-base"
          >
            Tracing our growth from an initial development blueprint to an advanced, multi-module digital healthcare system.
          </motion.p>
        </div>

        {/* Timeline Structure Wrapper */}
        <div className="relative mt-12">
          
          {/* Central Connecting Animated Line (Desktop Only) */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-950/40">
            <motion.div 
              variants={lineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="h-full bg-gradient-to-b from-cyan-500 via-[#00cc99] to-indigo-500 origin-top"
            />
          </div>

          {/* Timeline Milestones Row Mapping */}
          <div className="space-y-12 md:space-y-20">
            {milestones.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={item.id} 
                  className={`flex flex-col md:flex-row items-center justify-between w-full relative ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Left/Right Blank Buffer Content Space (5 Columns equal size) */}
                  <div className="hidden md:block w-[45%]" />

                  {/* Animated Center Timeline Circular Node */}
                  <motion.div 
                    variants={nodeVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="absolute hidden md:flex left-1/2 transform -translate-x-1/2 z-20 w-10 h-10 rounded-xl bg-[#031211] border border-emerald-900/60 items-center justify-center shadow-xl hover:border-[#00cc99] hover:shadow-[0_0_15px_rgba(0,204,153,0.15)] transition-all duration-300"
                  >
                    {item.icon}
                  </motion.div>

                  {/* Content Display Card (Responsive Box Layout) */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -40 : 40, y: 15 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ type: "spring", stiffness: 60, damping: 14 }}
                    className="w-full md:w-[45%] bg-[#041715]/40 backdrop-blur-sm p-6 rounded-2xl border border-emerald-950/80 shadow-lg relative group hover:border-[#00cc99]/30 transition-all duration-300"
                  >
                    {/* Corner aesthetic overlay flag */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/[0.01] to-transparent pointer-events-none" />

                    {/* Milestone Year Indicator */}
                    <span className="text-xs font-mono font-bold text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-2.5 py-0.5 rounded">
                      {item.year}
                    </span>

                    {/* Mobile Only Icon Header Layout */}
                    <div className="flex items-center gap-3 mt-4 mb-2 md:mt-3">
                      <div className="md:hidden w-8 h-8 rounded-lg bg-[#031211] border border-emerald-900/60 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#00cc99] transition-colors duration-200">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </motion.div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}