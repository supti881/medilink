import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Activity, ShieldCheck, HeartPulse } from "lucide-react";

// Curated high-resolution imagery showcasing real human care and medication
const CAROUSEL_DATA = [
  {
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    caption: "Dr. Liam Chen · Cardiologist",
    tagline: "Your bridge to seamless, specialized care"
  },
  {
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    caption: "Clinical Therapeutics",
    tagline: "Instant, verified digital prescriptions"
  },
  {
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80",
    caption: "On-Demand Diagnostics",
    tagline: "Consult trusted doctors, anywhere you are"
  }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_DATA.length);
    }, 6000); // 6 seconds for a relaxed, therapeutic transition pace
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-[#071316] py-16 lg:py-24 text-white selection:bg-teal-500 selection:text-slate-950">
      
      {/* --- FLUID AMBIENT EFFECTS (Inspired by watermarked_img_3349092368718188110.png) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(20,184,166,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(217,119,6,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/10 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* --- LEFT SIDE: TYPOGRAPHY ARCHITECTURE --- */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            
            {/* Elegant Status Capsule */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/50 backdrop-blur-md px-4 py-1.5 text-xs text-teal-300 font-medium tracking-wide">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <span>MediLink Hub Platform · Live</span>
            </div>

            {/* Premium Editorial Header */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl xl:text-6xl leading-[1.12]">
              Connecting care for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-200">
                Patients &amp; Doctors.
              </span>
            </h1>

            {/* Balanced Clinical Copy */}
            <p className="max-w-md mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed text-teal-100/70">
              Consult trusted medical professionals, securely coordinate health records, and arrange treatment pathways instantly. The future of personalized healthcare, right where you are.
            </p>

            {/* Strategic CTA Arrays */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/doctors"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-500 px-8 py-4 text-sm font-bold text-slate-950 shadow-[0_15px_30px_rgba(20,184,166,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-400"
              >
                <span>Connect With A Doctor</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/register"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-teal-500/30 bg-teal-950/20 backdrop-blur-md px-8 py-4 text-sm font-bold text-teal-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/50 hover:bg-teal-950/40"
              >
                Schedule A Consult
              </Link>
            </div>

            {/* Fluid Utility Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 border-t border-teal-950">
              <div className="flex items-center gap-2 text-xs font-medium text-teal-200/50">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Fully Secured Ecosystem</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-teal-200/50">
                <Activity size={15} className="text-amber-400" />
                <span>Real-time Response Network</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: CINEMATIC SLOW-VANISH PORTAL --- */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            
            {/* Multi-layered Soft Circular Frames mirroring watermarked_img_3349092368718188110.png */}
            <div className="absolute inset-0 border border-teal-500/10 rounded-[3rem] scale-105 pointer-events-none" />
            <div className="absolute inset-0 border border-dashed border-amber-500/10 rounded-[3rem] rotate-12 scale-95 pointer-events-none" />

            <div className="relative h-[420px] sm:h-[500px] lg:h-[540px] w-full rounded-[3rem] overflow-hidden bg-teal-950/40 border border-teal-500/20 shadow-[0_40px_80px_-15px_rgba(3,7,18,0.6)]">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }} // Highly efficient "slow vanish" effect
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Performance-optimized background container */}
                  <div className="absolute inset-0 w-full h-full bg-slate-950">
                    <img
                      src={CAROUSEL_DATA[currentIndex].url}
                      alt={CAROUSEL_DATA[currentIndex].caption}
                      className="w-full h-full object-cover opacity-85 transform scale-100 animate-[subtle-zoom_24s_infinite_alternate]"
                    />
                  </div>

                  {/* Gradient Light Shrouds for Text Separation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061817] via-transparent to-[#0B2524]/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B2524]/30 via-transparent to-transparent" />

                  {/* Contextual Card Meta-info */}
                  <div className="absolute bottom-8 left-8 right-8 sm:bottom-12 sm:left-12 sm:right-12 z-20 space-y-2">
                    <motion.div 
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-teal-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-300 border border-teal-500/20"
                    >
                      <HeartPulse size={11} className="text-teal-400" />
                      {CAROUSEL_DATA[currentIndex].caption}
                    </motion.div>
                    
                    <motion.p 
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="text-xl sm:text-2xl font-semibold tracking-tight text-white drop-shadow-md max-w-md"
                    >
                      {CAROUSEL_DATA[currentIndex].tagline}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* --- COMPACT TIMELINE NAVIGATION CONTROLS --- */}
              <div className="absolute top-8 right-8 z-30 flex gap-1.5 bg-slate-950/60 backdrop-blur-md p-2 rounded-full border border-teal-500/10">
                {CAROUSEL_DATA.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1 rounded-full transition-all duration-700 ease-out ${
                      index === currentIndex ? "w-5 bg-teal-400" : "w-1 bg-teal-100/30 hover:bg-teal-100/50"
                    }`}
                    aria-label={`Advance to frame ${index + 1}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}