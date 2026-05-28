import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiCheckCircle, FiUser, FiSliders, FiActivity } from 'react-icons/fi';

export default function FeaturedService() {
  // State to handle mockup interaction simulation
  const [selectedDate, setSelectedDate] = useState('Today, May 29');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [isBooked, setIsBooked] = useState(false);

  const timeSlots = ['09:00 AM', '10:30 AM', '02:14 PM', '04:45 PM'];

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Ambience Glimmer */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-12 w-80 h-80 bg-[#00cc99]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full"
            >
              Premium Feature Focus
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight"
            >
              Smart Appointment <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00cc99] to-cyan-400">
                Management System
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm sm:text-base leading-relaxed"
            >
              MediLink bridges the gap between patient schedules and clinical flows. By organizing real-time doctor availability dashboards, we eliminate structural wait times, reduce waiting room overcrowding, and completely reform your medical accessibility into a fluid, digital ritual.
            </motion.p>

            {/* Feature Checkmarks list */}
            <motion.ul 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-3.5 pt-2"
            >
              {[
                "Real-time synchronized doctor calendars",
                "Instant single-click appointment restructuring",
                "Automated queue minimization sequencing"
              ].map((text, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00cc99]/10 border border-[#00cc99]/30 flex items-center justify-center">
                    <FiCheckCircle className="w-3 h-3 text-[#00cc99]" />
                  </span>
                  {text}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right Column: Visual Interactive UI Mockup */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              className="w-full max-w-md bg-[#041715]/60 backdrop-blur-md rounded-2xl border border-emerald-950/80 shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Header inside Mockup */}
              <div className="flex items-center justify-between border-b border-emerald-950/60 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-[#00cc99] p-[1px]">
                    <div className="w-full h-full bg-[#031211] rounded-xl flex items-center justify-center">
                      <FiActivity className="w-5 h-5 text-[#00cc99]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Dr. Sarah Jenkins</h4>
                    <p className="text-[11px] text-slate-400">Consultant Cardiologist</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium bg-emerald-500/10 text-[#00cc99] px-2 py-0.5 rounded border border-emerald-500/20">
                  Available
                </span>
              </div>

              {/* Mockup Step 1: Select Date */}
              <div className="mb-5">
                <label className="text-xs font-medium text-slate-400 block mb-2.5 flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-cyan-400" /> Select Consult Date
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Today, May 29', 'Tomorrow, May 30'].map((date) => (
                    <button
                      key={date}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedDate(date)}
                      className={`text-xs py-2.5 px-3 rounded-lg border font-medium transition-all duration-200 ${
                        selectedDate === date
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'bg-[#031211] border-emerald-950/60 text-slate-400 hover:border-emerald-900/60'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mockup Step 2: Select Time */}
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-400 block mb-2.5 flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-cyan-400" /> Available Time Slots
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`text-[11px] py-2 px-1 rounded-md border font-medium text-center transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-[#00cc99]/10 border-[#00cc99] text-[#00cc99] shadow-[0_0_15px_rgba(0,204,153,0.1)]'
                          : 'bg-[#031211] border-emerald-950/60 text-slate-400 hover:border-emerald-900/60'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button Container with AnimatePresence mapping states */}
              <div className="relative h-11">
                <AnimatePresence mode="wait">
                  {!isBooked ? (
                    <motion.button
                      key="book-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.01, brightness: 1.1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsBooked(true)}
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-[#00cc99] text-[#020d0c] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20"
                    >
                      Confirm Appointment
                    </motion.button>
                  ) : (
                    <motion.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full bg-emerald-500/10 border border-emerald-500/30 text-[#00cc99] text-xs font-medium rounded-xl flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4 text-[#00cc99] animate-bounce" />
                      Successfully Scheduled for {selectedTime}!
                      <button 
                        onClick={() => setIsBooked(false)} 
                        className="underline text-[10px] text-slate-400 ml-2 hover:text-white"
                      >
                        Reset
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}