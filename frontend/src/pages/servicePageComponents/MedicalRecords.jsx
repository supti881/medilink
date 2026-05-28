import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, 
  FiActivity, 
  FiClipboard, 
  FiHistory, 
  FiUser, 
  FiDownload, 
  FiPlusCircle, 
  FiEye 
} from 'react-icons/fi';

export default function MedicalRecords() {
  const [activeTab, setActiveTab] = useState('summary');

  // Interactive Content Mock Data for Project Depth
  const recordTabs = {
    summary: {
      title: "Patient Profile Summary",
      icon: <FiUser />,
      badge: "ID: ML-9082",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#031211] p-4 rounded-xl border border-emerald-950/60">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Blood Type</p>
              <p className="text-sm font-semibold text-white mt-0.5">O Positive (O+)</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Allergies</p>
              <p className="text-sm font-semibold text-rose-400 mt-0.5">Penicillin, Peanuts</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Chronic Status</p>
              <p className="text-sm font-semibold text-[#00cc99] mt-0.5">Hypertension (Managed)</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact</h4>
            <p className="text-sm text-slate-200 font-medium">Sarah Jenkins (Spouse) — +1 (555) 019-2834</p>
          </div>
        </div>
      )
    },
    prescriptions: {
      title: "Prescription Uploads",
      icon: <FiFileText />,
      badge: "2 Active",
      content: (
        <div className="space-y-3">
          {[
            { name: "Amoxicillin 500mg", doctor: "Dr. Alistair Vance", date: "May 12, 2026", file: "rx_amox_992.pdf" },
            { name: "Lisinopril 10mg", doctor: "Dr. Sarah Jenkins", date: "Apr 28, 2026", file: "rx_lisin_411.pdf" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#031211] rounded-xl border border-emerald-950/40 hover:border-emerald-900/60 transition-colors">
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.doctor} • <span className="text-slate-500">{item.date}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-emerald-950/40 hover:bg-[#00cc99]/10 text-[#00cc99] rounded-lg transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
                <button className="p-2 bg-emerald-950/40 hover:bg-[#00cc99]/10 text-[#00cc99] rounded-lg transition-colors" title="Download"><FiDownload className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <button className="w-full py-2.5 border border-dashed border-emerald-900/60 hover:border-[#00cc99]/40 text-xs font-medium text-slate-400 hover:text-[#00cc99] rounded-xl flex items-center justify-center gap-2 transition-all mt-4">
            <FiPlusCircle className="w-4 h-4" /> Upload New Prescription Document
          </button>
        </div>
      )
    },
    diagnosis: {
      title: "Diagnosis History",
      icon: <FiActivity />,
      badge: "3 Records",
      content: (
        <div className="relative border-l border-emerald-950/80 ml-2 pl-4 space-y-6">
          {[
            { title: "Essential Hypertension", status: "Chronic / Stable", date: "Jan 14, 2026", notes: "Blood pressure shows positive reduction scaling regular treatment course." },
            { title: "Acute Seasonal Rhinovirus", status: "Resolved", date: "Nov 02, 2025", notes: "Standard therapeutic antiviral recovery completed within 7-day cycle." }
          ].map((diag, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-950 border border-emerald-500 group-hover:bg-[#00cc99] transition-colors" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">{diag.date}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${diag.status === 'Resolved' ? 'bg-emerald-500/10 text-[#00cc99]' : 'bg-cyan-500/10 text-cyan-400'}`}>{diag.status}</span>
              </div>
              <h5 className="text-sm font-semibold text-white mt-1">{diag.title}</h5>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{diag.notes}</p>
            </div>
          ))}
        </div>
      )
    },
    labReports: {
      title: "Lab Report Records",
      icon: <FiClipboard />,
      badge: "Latest: May 2026",
      content: (
        <div className="space-y-3">
          {[
            { test: "Comprehensive Metabolic Panel (CMP)", lab: "Apex Diagnostics Lab", date: "May 18, 2026", status: "Normal" },
            { test: "Lipid Panel Screening", lab: "Metro General Laboratory", date: "Feb 10, 2026", status: "Flagged High" }
          ].map((lab, idx) => (
            <div key={idx} className="p-3.5 bg-[#031211] rounded-xl border border-emerald-950/40 flex items-center justify-between">
              <div>
                <h5 className="text-sm font-semibold text-white">{lab.test}</h5>
                <p className="text-xs text-slate-400 mt-0.5">{lab.lab} • <span className="text-slate-500">{lab.date}</span></p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${lab.status === 'Normal' ? 'bg-emerald-500/10 text-[#00cc99]' : 'bg-rose-500/10 text-rose-400'}`}>
                {lab.status}
              </span>
            </div>
          ))}
        </div>
      )
    },
    appointments: {
      title: "Appointment History",
      icon: <FiHistory />,
      badge: "14 Total",
      content: (
        <div className="space-y-3">
          {[
            { type: "Cardiology Consultation", doctor: "Dr. Sarah Jenkins", status: "Completed", date: "May 29, 2026" },
            { type: "General Health Checkup", doctor: "Dr. Alistair Vance", status: "Completed", date: "Jan 12, 2026" }
          ].map((app, idx) => (
            <div key={idx} className="p-3 bg-[#041715]/40 border border-emerald-950/60 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-white text-sm">{app.type}</p>
                <p className="text-slate-400 mt-0.5">{app.doctor} • <span className="text-slate-500">{app.date}</span></p>
              </div>
              <span className="bg-slate-900 border border-emerald-950 text-slate-400 px-2 py-0.5 rounded font-medium">
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Ambience Grid */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00cc99]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full"
          >
            Core Project Framework
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Centralized Health Records
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-400 text-sm sm:text-base"
          >
            A secure digital hub that lets patients manage historical diagnoses, prescriptions, and physician tracking seamlessly.
          </motion.p>
        </div>

        {/* Dashboard Frame Wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch bg-[#041715]/30 backdrop-blur-md rounded-2xl border border-emerald-950/80 p-4 sm:p-6 lg:p-8 shadow-2xl">
          
          {/* Left Navigation Menu (4 Columns) */}
          <div className="md:col-span-4 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-emerald-950/60 pb-6 md:pb-0 md:pr-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2">Record Modules</p>
            {Object.keys(recordTabs).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-cyan-500/10 to-[#00cc99]/10 border border-[#00cc99]/30 text-[#00cc99]'
                    : 'bg-transparent border border-transparent text-slate-400 hover:bg-emerald-950/30 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-base ${activeTab === key ? 'text-[#00cc99]' : 'text-slate-500'}`}>
                    {recordTabs[key].icon}
                  </span>
                  {recordTabs[key].title}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${activeTab === key ? 'bg-[#00cc99]/20 text-[#00cc99]' : 'bg-slate-900 text-slate-500'}`}>
                  {recordTabs[key].badge}
                </span>
              </button>
            ))}
          </div>

          {/* Right Live Preview Content (8 Columns) */}
          <div className="md:col-span-8 flex flex-col justify-between pt-4 md:pt-0 md:pl-6 min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3 mb-2">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {recordTabs[activeTab].title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">MediLink Core Vault Secure</span>
                </div>
                
                {recordTabs[activeTab].content}
              </motion.div>
            </AnimatePresence>

            {/* Doctor Note Bottom Bar Widget */}
            <div className="mt-8 pt-4 border-t border-emerald-950/40 flex items-start gap-3 bg-[#031211]/40 p-3 rounded-xl border border-emerald-950/60">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded mt-0.5">Note</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Physician Note integration active:</strong> Direct syncing ensures that clinical summaries populate right after your consultation ends.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}