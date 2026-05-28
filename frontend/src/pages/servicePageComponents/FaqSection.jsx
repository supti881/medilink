import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

export default function FaqSection() {
  // Track which accordion item is currently open (null if all closed)
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How can I book an appointment?",
      answer: "Booking an appointment is simple. Navigate to the doctor or service search section, choose your preferred medical specialist, select an available date and time slot from their live calendar, and click confirm.",
    },
    {
      question: "Can I consult doctors online?",
      answer: "Yes, MediLink fully supports high-definition video consultations. When booking, you can choose between an in-person visit or an online consultation. Online consultations can be launched directly from your patient dashboard.",
    },
    {
      question: "Are my medical records secure?",
      answer: "Absolutely. Security is our top priority. MediLink utilizes advanced end-to-end encryption to store and transmit your digital health records, prescriptions, and lab results, ensuring your private data remains completely confidential.",
    },
    {
      question: "Can doctors manage patient appointments?",
      answer: "Yes, physicians have access to a dedicated professional dashboard where they can update their real-time availability, manage incoming bookings, update patient histories, and write digital clinical notes.",
    },
    {
      question: "Can I view my prescription history?",
      answer: "Yes, every prescription generated or uploaded onto the platform is archived in your Centralized Health Records vault. You can view, search, filter, or download them as PDFs at any time.",
    },
    {
      question: "Is MediLink available for emergency services?",
      answer: "While MediLink provides a dedicated Emergency Help module to quickly locate nearby operational ER rooms and dispatch hotlines, it is a management and routing platform. For life-threatening situations, always dial your local emergency services directly.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Radial Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00cc99]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full"
          >
            Got Questions?
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-400 text-sm sm:text-base"
          >
            Everything you need to know about navigating the MediLink healthcare ecosystem.
          </motion.p>
        </div>

        {/* Accordion Wrapper */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'bg-[#041715]/70 border-[#00cc99]/40 shadow-lg shadow-emerald-950/10' 
                    : 'bg-[#041715]/30 border-emerald-950/80 hover:border-emerald-900/60'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none group select-none"
                >
                  <div className="flex items-center gap-4 pr-4">
                    <FiHelpCircle className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isOpen ? 'text-[#00cc99]' : 'text-slate-500 group-hover:text-slate-400'}`} />
                    <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {faq.question}
                    </span>
                  </div>
                  
                  {/* Chevron Icon Animation */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={`flex-shrink-0 p-1 rounded-md bg-[#031211] border transition-colors duration-200 ${isOpen ? 'border-[#00cc99]/30 text-[#00cc99]' : 'border-emerald-950 text-slate-500'}`}
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Collapsible Answer Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-7 pl-14 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-emerald-950/40 pt-3 bg-[#031211]/20">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}