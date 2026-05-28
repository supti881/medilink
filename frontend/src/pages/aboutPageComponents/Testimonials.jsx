import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMessageSquare, FiStar } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa6';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    {
      id: 1,
      name: "Rahman Hasan",
      role: "Chronic Hypertension Patient",
      quote: "Managing my blood pressure readings used to be a nightmare of scattered papers. With MediLink, my entire history logs instantly for my physician to view ahead of our digital calls. It has completely transformed my health administration.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      endorsement: "Verified Care Ledger User"
    },
    {
      id: 2,
      name: "Dr. Sarah Jenkins",
      role: "Consultant Cardiologist",
      quote: "From a professional perspective, MediLink minimizes structural scheduling lag. I can review prescription histories and past diagnoses in seconds from the clinical module before launching high-definition virtual checkups.",
      image: "https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&w=300&q=80",
      endorsement: "Medical Board Endorsed"
    },
    {
      id: 3,
      name: "Nadia Ahmed",
      role: "Maternity Care Patient",
      quote: "The automated appointment reminders over WhatsApp saved me from missing critical screenings multiple times. The dashboard interface is incredibly straightforward and highly intuitive even for my elders.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      endorsement: "Verified Care Ledger User"
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Radial Ambient Spotlights */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[#00cc99]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5"
          >
            <FiMessageSquare className="w-3.5 h-3.5" />
            Patient Stories
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Trusted by Patients & Professionals
          </motion.h2>
        </div>

        {/* Sliding Carousel Display Window */}
        <div className="relative min-h-[380px] sm:min-h-[320px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full bg-[#041715]/40 backdrop-blur-sm border border-emerald-950/80 rounded-2xl p-6 sm:p-10 shadow-2xl relative flex flex-col md:flex-row items-center gap-8 md:gap-10"
            >
              {/* Giant Background Floating Quote Aesthetic */}
              <FaQuoteLeft className="absolute top-6 right-8 text-emerald-950/20 text-7xl pointer-events-none" />

              {/* Left Side Profile Image Frame */}
              <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#00cc99] to-cyan-500 p-[1px] shadow-xl">
                <div className="w-full h-full rounded-2xl bg-[#031211] overflow-hidden">
                  <img 
                    src={stories[currentIndex].image} 
                    alt={stories[currentIndex].name} 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Micro Verified Star Badge */}
                <span className="absolute -bottom-2 -right-2 bg-[#031211] border border-emerald-950 p-1.5 rounded-xl shadow-md text-[#00cc99]">
                  <FiStar className="w-3.5 h-3.5 fill-[#00cc99]" />
                </span>
              </div>

              {/* Right Side Quote Context Block */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic font-normal">
                  "{stories[currentIndex].quote}"
                </p>

                <div className="pt-2 border-t border-emerald-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {stories[currentIndex].name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {stories[currentIndex].role}
                    </p>
                  </div>
                  
                  {/* Endorsement Flag */}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#00cc99] bg-[#00cc99]/5 px-2.5 py-1 rounded border border-emerald-900/30 self-center md:self-auto">
                    {stories[currentIndex].endorsement}
                  </span>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrow Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(4, 23, 21, 0.8)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            className="p-3 rounded-xl bg-[#041715]/40 border border-emerald-950 text-slate-400 hover:text-[#00cc99] hover:border-[#00cc99]/30 transition-all shadow-md"
            aria-label="Previous story"
          >
            <FiChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Center Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {stories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-[#00cc99]' : 'w-1.5 bg-emerald-950'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(4, 23, 21, 0.8)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="p-3 rounded-xl bg-[#041715]/40 border border-emerald-950 text-slate-400 hover:text-[#00cc99] hover:border-[#00cc99]/30 transition-all shadow-md"
            aria-label="Next story"
          >
            <FiChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

      </div>
    </section>
  );
}