import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  CalendarCheck,
  FileCheck2,
  UsersRound,
  Activity,
} from "lucide-react";

export default function HeroSection() {
  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const floatingNodeVariants = (delay = 0) => ({
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay,
      },
    },
    hover: {
      scale: 1.05,
      y: -5,
      zIndex: 30,
      boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
      borderColor: "rgba(16, 185, 129, 0.4)",
      transition: { duration: 0.3 },
    },
  });

  return (
    <section className="relative min-h-[calc(100vh-86px)] flex items-center justify-center overflow-hidden bg-[#fafdfc] py-16 lg:py-24 selection:bg-emerald-500 selection:text-white">
      
      {/* --- PREMIUM SAAS BACKDROP LAYERS --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(20,184,166,0.15),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(16,185,129,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

      {/* Dynamic Animated Core Lights */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-200/30 blur-[130px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-200/20 blur-[150px] pointer-events-none" 
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* --- LEFT HAND SIDE: COPY --- */}
          <motion.div 
            className="lg:col-span-6 space-y-8 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 backdrop-blur-xl px-4 py-2 text-xs font-bold text-emerald-800 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
              <Sparkles size={14} className="text-emerald-500 animate-pulse" />
              <span className="tracking-wide uppercase font-black text-[10px]">MediLink Hub · Production Ready</span>
            </motion.div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl xl:text-7xl leading-[1.03]">
              Connecting care for{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 font-serif italic font-normal tracking-normal px-1">
                Patients,
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                  className="absolute left-0 bottom-2 h-[8px] bg-emerald-200/50 -z-10 rounded-full" 
                />
              </span><br />
              Doctors <span className="text-slate-300 font-light">&amp;</span> Admins.
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed text-slate-500 font-medium">
              A comprehensive healthcare ecosystem managing appointment queues, digital prescriptions, support workflows, and high-security token verification algorithms natively.
            </p>

            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/doctors"
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-2xl bg-slate-950 px-8 py-4.5 text-sm font-bold text-white shadow-[0_20px_40px_rgba(15,23,42,0.15)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-600 hover:shadow-emerald-600/30"
              >
                <Stethoscope size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Explore Doctors</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md px-8 py-4.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:text-slate-900"
              >
                <span>Create Patient Account</span>
                <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* --- RIGHT HAND SIDE: CODE-DRIVEN INTERACTIVE HUD DASHBOARD --- */}
          <div className="lg:col-span-6 relative flex justify-center mt-12 lg:mt-0 select-none">
            <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center">
              
              {/* Spinning Orbital Lines */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute w-[100%] h-[100%] rounded-full border border-dashed border-slate-300/60 pointer-events-none" 
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute w-[82%] h-[82%] rounded-full border border-slate-200/60 pointer-events-none" 
              />

              {/* PURE CSS/TAILWIND DYNAMIC CODE DASHBOARD PANEL */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="absolute z-10 w-[88%] rounded-[2rem] bg-gradient-to-b from-white to-slate-50 p-3 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] border border-slate-100/80"
              >
                {/* Inside Mock Application Interface */}
                <div className="rounded-[1.5rem] bg-slate-950 aspect-[4/3] overflow-hidden p-4 flex flex-col justify-between relative group text-white">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.4),transparent_60%)]" />
                  
                  {/* Top App Header Window control dots */}
                  <div className="relative z-10 flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
                    </div>
                    <div className="px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800/60 text-[10px] text-slate-400 font-mono tracking-wider">
                      medilink-secure-mesh
                    </div>
                  </div>

                  {/* Dynamic Mock App Body View Grid */}
                  <div className="relative z-10 flex-1 my-3 grid grid-cols-12 gap-3 overflow-hidden">
                    
                    {/* Mock Sidebar Navigation elements */}
                    <div className="col-span-3 space-y-2 border-r border-slate-900/50 pr-2">
                      <div className="h-6 w-full rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center px-2 gap-1.5 text-emerald-400 text-[9px] font-bold">
                        <Activity size={10} /> Live Feed
                      </div>
                      <div className="h-6 w-5/6 rounded-lg bg-slate-900/40" />
                      <div className="h-6 w-4/5 rounded-lg bg-slate-900/40" />
                    </div>

                    {/* Central Content Area */}
                    <div className="col-span-9 space-y-3 pl-1">
                      
                      {/* Metric Widgets Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/50 border border-slate-800/40 p-2.5 rounded-xl space-y-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Consultations</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-white">94.2%</span>
                            <span className="text-[8px] text-emerald-400 font-mono">+4.1%</span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800/40 p-2.5 rounded-xl space-y-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Verified RX</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-white">1,820</span>
                            <span className="text-[8px] text-cyan-400 font-mono">Secured</span>
                          </div>
                        </div>
                      </div>

                      {/* Animated Realtime SVG Line Chart Graphic */}
                      <div className="bg-slate-900/40 border border-slate-800/40 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-bold text-slate-400">Database Load Stream</span>
                          <span className="text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Synchronous
                          </span>
                        </div>
                        <div className="h-10 w-full pt-1 relative overflow-hidden">
                          <svg viewBox="0 0 100 25" className="w-full h-full text-emerald-500/80 stroke-current fill-none stroke-2">
                            <motion.path 
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                              d="M0 20 Q 15 5, 30 15 T 60 8 T 90 12 L 100 5" 
                            />
                          </svg>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* App Dashboard bottom bar info footer */}
                  <div className="relative z-10 flex items-center justify-between border-t border-slate-900/80 pt-2.5 text-[9px] text-slate-500 font-mono">
                    <span>SYS_STATUS: ACTIVE</span>
                    <span className="text-slate-600">v2.1.0-prod</span>
                  </div>
                </div>
              </motion.div>

              {/* --- FLOATING HUD NODE 1: DIGITAL PRESCRIPTION (Top-Left) --- */}
              <motion.div 
                variants={floatingNodeVariants(0)}
                animate="animate"
                whileHover="hover"
                className="absolute -top-4 -left-8 z-20 cursor-pointer rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-md backdrop-blur-xl w-48"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FileCheck2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescriptions</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">Digital RX Flow</p>
                  </div>
                </div>
              </motion.div>

              {/* --- FLOATING HUD NODE 2: VERIFY RX TOKEN (Top-Right) --- */}
              <motion.div 
                variants={floatingNodeVariants(1.2)}
                animate="animate"
                whileHover="hover"
                className="absolute top-12 -right-10 z-20 cursor-pointer rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-md backdrop-blur-xl w-52"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Token</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">Verify Prescription</p>
                  </div>
                </div>
              </motion.div>

              {/* --- FLOATING HUD NODE 3: DOCTOR APPOINTMENTS (Bottom-Left) --- */}
              <motion.div 
                variants={floatingNodeVariants(0.6)}
                animate="animate"
                whileHover="hover"
                className="absolute bottom-6 -left-12 z-20 cursor-pointer rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-md backdrop-blur-xl w-52"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600">
                    <CalendarCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Schedule</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">Doctor Appointments</p>
                  </div>
                </div>
              </motion.div>

              {/* --- FLOATING HUD NODE 4: ROLE BASED SECURITY (Bottom-Right) --- */}
              <motion.div 
                variants={floatingNodeVariants(1.8)}
                animate="animate"
                whileHover="hover"
                className="absolute -bottom-6 right-0 z-20 cursor-pointer rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-xl w-48 text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-slate-950">
                    <UsersRound size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Gateways</p>
                    <p className="text-xs font-bold text-white mt-0.5">3 Role Portals</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Connection Particles */}
              <div className="absolute right-1/4 top-12 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <div className="absolute left-1/4 bottom-12 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60" />

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}