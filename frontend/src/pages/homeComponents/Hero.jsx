import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

const CAROUSEL_DATA = [
  {
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
    caption: "Specialist consultation",
    tagline: "Book trusted doctors with clear appointment status.",
  },
  {
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1400&q=80",
    caption: "Digital prescription",
    tagline: "Verified prescriptions with secure RX tokens.",
  },
  {
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=80",
    caption: "Connected healthcare",
    tagline: "A clean workflow for patients, doctors, and admins.",
  },
];

const heroHighlights = [
  { icon: <ShieldCheck size={14} />, label: "Secure JWT" },
  { icon: <CalendarCheck2 size={14} />, label: "Appointments" },
  { icon: <BadgeCheck size={14} />, label: "RX Verify" },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % CAROUSEL_DATA.length);
    }, 5600);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#061817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(19,200,180,0.12),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.09),transparent_30%),linear-gradient(180deg,#061817_0%,#08211f_64%,#061817_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f5f7fb] to-transparent" />

      <div className="relative mx-auto grid min-h-[470px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-12">
        <div className="lg:col-span-5">
          <h1 className="max-w-xl text-[1.9rem] font-bold leading-[1.18] tracking-[-0.025em] text-white sm:text-[2.15rem] lg:text-[2.35rem]">
            Connecting care for patients and doctors.
          </h1>

          <p className="mt-4 max-w-lg text-[0.88rem] font-medium leading-7 text-slate-300">
            A complete healthcare management platform for doctor discovery,
            appointment booking, digital prescriptions, payments, support, and
            admin review.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/doctors"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-[0.78rem] font-bold text-slate-950 shadow-[0_14px_28px_rgba(19,200,180,0.18)] transition hover:-translate-y-0.5 hover:bg-teal-300"
            >
              Connect With A Doctor
              <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/14 bg-white/[0.045] px-4 py-2.5 text-[0.78rem] font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              Create Patient Account
            </Link>
          </div>

          <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:max-w-lg">
            {heroHighlights.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-teal-300">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative mx-auto max-w-[640px] overflow-hidden rounded-[1.45rem] border border-white/12 bg-slate-950 shadow-[0_24px_58px_rgba(2,6,23,0.34)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.05] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
              </div>
              <div className="rounded-full bg-teal-400/15 px-3 py-1 text-[0.64rem] font-extrabold uppercase tracking-[0.13em] text-teal-200">
                Demo Ready
              </div>
            </div>

            <div className="relative h-[260px] sm:h-[295px] lg:h-[315px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={CAROUSEL_DATA[currentIndex].url}
                    alt={CAROUSEL_DATA[currentIndex].caption}
                    className="h-full w-full object-cover opacity-72"
                    style={{ animation: "subtleZoom 18s ease-in-out infinite alternate" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061817] via-[#061817]/16 to-[#061817]/34" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-5 right-5 top-5 flex justify-end gap-1.5">
                {CAROUSEL_DATA.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex ? "w-7 bg-teal-300" : "w-1.5 bg-white/35"
                    }`}
                    aria-label={`Show healthcare slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/12 bg-[#061817]/84 p-4 shadow-2xl backdrop-blur-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/12 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.13em] text-teal-200">
                  <HeartPulse size={12} />
                  {CAROUSEL_DATA[currentIndex].caption}
                </div>

                <p className="mt-3 max-w-xl text-[0.98rem] font-bold leading-snug tracking-[-0.015em] text-white sm:text-[1.08rem]">
                  {CAROUSEL_DATA[currentIndex].tagline}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <HeroMetric value="3" label="Role portals" />
                  <HeroMetric value="6+" label="Core modules" />
                  <HeroMetric value="24/7" label="Access flow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5">
      <p className="text-[0.95rem] font-bold leading-none text-white">{value}</p>
      <p className="mt-1 text-[0.68rem] font-medium text-slate-300">{label}</p>
    </div>
  );
}