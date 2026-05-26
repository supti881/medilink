import { Link } from "react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headphones,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import HeroSection from "./homeComponents/Hero";
import StatsSection from "./homeComponents/StatsSection";
import ServicesSection from "./homeComponents/ServicesSection";

const services = [
  {
    icon: <Stethoscope size={24} />,
    title: "Find Specialist Doctors",
    description:
      "Search doctors by name, department, specialization, consultation fee, and availability.",
  },
  {
    icon: <CalendarCheck size={24} />,
    title: "Appointment Management",
    description:
      "Patients can book appointments while doctors can manage consultation status.",
  },
  {
    icon: <FileCheck2 size={24} />,
    title: "Digital Prescription",
    description:
      "Doctors can create prescriptions with medicines, tests, advice, and follow-up dates.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Prescription Verification",
    description:
      "Patients and pharmacies can verify prescriptions using secure RX verification tokens.",
  },
  {
    icon: <Headphones size={24} />,
    title: "Support Ticket",
    description:
      "Patients can create support tickets and track status updates from the admin panel.",
  },
  {
    icon: <BadgeCheck size={24} />,
    title: "Reissue Request",
    description:
      "Patients can request duplicate or corrected prescription copies with admin review.",
  },
];

const portals = [
  {
    title: "Patient Portal",
    text: "Register, verify OTP, search doctors, view prescriptions, submit support tickets, and request prescription copies.",
    icon: <UsersRound size={26} />,
    link: "/patient-dashboard",
    accent: "from-emerald-500 to-teal-400"
  },
  {
    title: "Doctor Portal",
    text: "View assigned appointments, update consultation status, and create digital prescriptions.",
    icon: <Stethoscope size={26} />,
    link: "/doctor-dashboard",
    accent: "from-teal-500 to-cyan-400"
  },
  {
    title: "Admin Portal",
    text: "Monitor doctors, review support tickets, and approve or reject prescription replacement requests.",
    icon: <ShieldCheck size={26} />,
    link: "/admin-dashboard",
    accent: "from-cyan-500 to-emerald-400"
  },
];

const processSteps = [
  {
    number: "01",
    title: "Create Account",
    text: "Patient registers and verifies the account using secure OTP.",
  },
  {
    number: "02",
    title: "Find Doctor",
    text: "Patient searches specialist doctors and checks live details.",
  },
  {
    number: "03",
    title: "Consultation",
    text: "Doctor manages appointment status and configuration notes.",
  },
  {
    number: "04",
    title: "Prescription",
    text: "Digital prescription is created and verified using RX token.",
  },
];

function Home() {
  return (
    <main className="overflow-hidden bg-[#fafdfb] text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <HeroSection />

      <StatsSection />

      <ServicesSection services={services} />

      {/* --- PROCESS/FLOW SECTION --- */}
      <section className="bg-gradient-to-b from-[#f9fdfa] to-[#f3faf5] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4 text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Journey Map</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                A clean patient to prescription journey.
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Engineered with explicit operational sequence layout logic, reducing process clutter while ensuring rigid verification checkpoints.
              </p>
            </div>

            <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors duration-300">
                      {step.number}
                    </span>
                    <HeartPulse size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:animate-pulse transition-colors" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* --- PORTALS & ARCHITECTURE SECTION --- */}
      <section id="about" className="scroll-mt-20 bg-slate-950 py-24 text-white relative overflow-hidden">
        {/* Subtle grid layer for dark section */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(circle_at_center,white,transparent_80%)] opacity-20" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">Gateway Framework</p>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl leading-tight">
                Three portals.<br />One connected system.
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium">
                MediLink enforces structural integrity using isolated views across explicit system instances managed seamlessly through dynamic routing setups.
              </p>

              <div className="space-y-3 pt-2">
                <AboutCheck text="Secure JWT state processing architecture & database abstraction" />
                <AboutCheck text="Unified synchronous API mapping operations" />
              </div>
            </div>

            <div className="lg:col-span-7 grid gap-4 sm:grid-cols-3">
              {portals.map((portal) => (
                <Link
                  key={portal.title}
                  to={portal.link}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-slate-900 hover:border-slate-700"
                >
                  <div>
                    <div className={`mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${portal.accent} text-slate-950 shadow-md`}>
                      {portal.icon}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                      {portal.title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-400 font-medium">
                      {portal.text}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-white">
                    <span>Enter Gateway</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>

          </div>

          {/* Infrastructure Cards Bottom Grid */}
          <div className="mt-16 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-4 sm:grid-cols-3 backdrop-blur-sm">
            <SystemCard
              icon={<Activity size={20} />}
              title="Stateful Express Engine"
              text="Asynchronous REST architecture matching schema topologies with structural endpoints."
            />
            <SystemCard
              icon={<LockKeyhole size={20} />}
              title="Granular Token Security"
              text="Automated payload extraction confirming authorization state handling constraints."
            />
            <SystemCard
              icon={<Clock3 size={20} />}
              title="Live Compilation Layout"
              text="Pre-tested modular logic loops guaranteeing immediate demonstration readiness."
            />
          </div>

        </div>
      </section>
    </main>
  );
}

function AboutCheck({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-900/80 border border-slate-800/60 p-3 shadow-inner">
      <CheckCircle2 className="shrink-0 text-emerald-400 mt-0.5" size={16} />
      <p className="text-xs font-medium text-slate-300 leading-normal">{text}</p>
    </div>
  );
}

function SystemCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl bg-slate-950/40 p-5 border border-transparent hover:border-slate-800/80 transition-all duration-300">
      <div className="mb-3 flex items-center gap-2 text-emerald-400">
        <span className="p-1 rounded-lg bg-slate-900">{icon}</span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-slate-400 font-medium">{text}</p>
    </div>
  );
}

export default Home;