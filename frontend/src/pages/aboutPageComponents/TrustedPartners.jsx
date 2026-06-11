import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiGrid } from 'react-icons/fi';
import { FaBriefcaseMedical, FaUserDoctor, FaHospital } from 'react-icons/fa6'; 
import { GiMedicalPack } from 'react-icons/gi';

export default function TrustedPartners() {
  // Mock data for prominent medical facilities & institutional partnerships
  const partners = [
    { id: 1, icon: <FaHospital className="w-5 h-5" />, name: "Metro General Hospital" }, 
    { id: 2, icon: <FaBriefcaseMedical className="w-5 h-5" />, name: "Apex Diagnostics Lab" },
    { id: 3, icon: <GiMedicalPack className="w-5 h-5" />, name: "Sylhet Medical Trust" },
    { id: 4, icon: <FaUserDoctor className="w-5 h-5" />, name: "CarePlus Pharma Networks" },
    { id: 5, icon: <FaHospital className="w-5 h-5" />, name: "Metropolitan Medical Institute" }, 
  ];

  // Duplicate the array to create a seamless infinite loop effect in the ticker
  const continuousPartners = [...partners, ...partners, ...partners];

  return (
    <section className="relative py-16 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00cc99]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-1.5"
          >
            <FiGrid className="text-[#00cc99]" />
            Institutional Ecosystem
          </motion.p>
          <motion.h3 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm font-semibold tracking-wider text-slate-400 uppercase"
          >
            Trusted By Healthcare Providers & Clinical Partners
          </motion.h3>
        </div>

        {/* Infinite Carousel Container Wrapper */}
        <div className="relative w-full overflow-hidden py-4">
          
          {/* Left Edge Fade Blur Layer Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#020d0c] to-transparent z-20 pointer-events-none" />
          
          {/* Right Edge Fade Blur Layer Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#020d0c] to-transparent z-20 pointer-events-none" />

          {/* Infinite Moving Row Track */}
          <motion.div 
            animate={{ x: [0, -1920] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 28, // Speed control (lower number moves faster)
                ease: "linear",
              },
            }}
            className="flex items-center gap-6 sm:gap-8 w-max whitespace-nowrap"
          >
            {continuousPartners.map((partner, index) => (
              <div 
                key={`${partner.id}-${index}`}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#041715]/30 border border-emerald-950/60 shadow-md select-none group hover:border-[#00cc99]/30 hover:bg-[#041715]/50 transition-all duration-300"
              >
                {/* Clean Flat Vector Placeholder Icon Mimicking a Logo */}
                <div className="text-slate-500 group-hover:text-[#00cc99] transition-colors duration-300">
                  {partner.icon}
                </div>
                
                {/* Partner Hospital Name */}
                <span className="text-xs sm:text-sm font-medium tracking-wide text-slate-400 group-hover:text-white transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Minimal Bottom Invitation Footnote */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] text-slate-600 inline-flex items-center gap-1 hover:text-slate-400 transition-colors cursor-pointer">
            <FiPlus className="text-[#00cc99]" />
            Interested in linking your clinical registry network? Learn about API partnerships
          </p>
        </motion.div>

      </div>
    </section>
  );
}