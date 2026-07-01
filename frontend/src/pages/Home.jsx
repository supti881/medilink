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
    icon: <Stethoscope size={20} />,
    title: "Find Specialist Doctors",
    description:
      "Search doctors by name, department, specialization, consultation fee, and availability.",
  },
  {
    icon: <CalendarCheck size={20} />,
    title: "Appointment Management",
    description:
      "Patients can book appointments while doctors can manage consultation status.",
  },
  {
    icon: <FileCheck2 size={20} />,
    title: "Digital Prescription",
    description:
      "Doctors can create prescriptions with medicines, tests, advice, and follow-up dates.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Prescription Verification",
    description:
      "Patients and pharmacies can verify prescriptions using secure RX verification tokens.",
  },
  {
    icon: <Headphones size={20} />,
    title: "Support Ticket",
    description:
      "Patients can create support tickets and track status updates from the admin panel.",
  },
  {
    icon: <BadgeCheck size={20} />,
    title: "Reissue Request",
    description:
      "Patients can request duplicate or corrected prescription copies with admin review.",
  },
];

const portals = [
  {
    title: "Patient Portal",
    text: "Register, verify OTP, search doctors, view prescriptions, submit support tickets, and request prescription copies.",
    icon: <UsersRound size={20} />,
    link: "/patient-dashboard",
  },
  {
    title: "Doctor Portal",
    text: "View assigned appointments, update consultation status, and create digital prescriptions.",
    icon: <Stethoscope size={20} />,
    link: "/doctor-dashboard",
  },
  {
    title: "Admin Portal",
    text: "Monitor doctors, review support tickets, and approve or reject prescription replacement requests.",
    icon: <ShieldCheck size={20} />,
    link: "/admin-dashboard",
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
    text: "Patient searches specialist doctors and checks availability.",
  },
  {
    number: "03",
    title: "Consultation",
    text: "Doctor manages appointment status and patient notes.",
  },
  {
    number: "04",
    title: "Prescription",
    text: "Digital prescription is created and verified using RX token.",
  },
];

const dashboardPreviews = [
  {
    title: "Patient Dashboard",
    role: "Patient Portal",
    icon: <UsersRound size={20} />,
    link: "/patient-dashboard",
    text: "Patients can book appointments, track requests, view prescriptions, manage payments, and submit support tickets.",
    points: ["Book appointment", "Prescription records", "Payment and support"],
  },
  {
    title: "Doctor Dashboard",
    role: "Doctor Portal",
    icon: <Stethoscope size={20} />,
    link: "/doctor-dashboard",
    text: "Doctors can review patient bookings, manage consultation status, create prescriptions, and check payment records.",
    points: ["Appointment queue", "Prescription builder", "Consultation status"],
  },
  {
    title: "Admin Dashboard",
    role: "Admin Control",
    icon: <ShieldCheck size={20} />,
    link: "/admin-dashboard",
    text: "Admins can monitor doctors, patients, appointments, support tickets, and overall MediLink operations.",
    points: ["Doctor approval", "Patient monitoring", "Support review"],
  },
];

function Home() {
  return (
    <main className="overflow-hidden bg-[#f5f7fb] text-slate-950 selection:bg-emerald-500 selection:text-white">
      <HeroSection />
      <StatsSection />
      <ServicesSection services={services} />

      <section className="bg-[#f5f7fb] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-9 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
                Journey Map
              </p>
              <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.85rem]">
                A clean patient to prescription journey.
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                The flow is simple for presentation: account creation,
                doctor search, consultation, and prescription verification.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {processSteps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold leading-none tracking-tight text-slate-200">
                      {step.number}
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <HeartPulse size={16} />
                    </span>
                  </div>

                  <h3 className="mt-4 text-[0.95rem] font-bold tracking-[-0.01em] text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
              Dashboard Preview
            </p>
            <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.85rem]">
              Three role dashboards, one organized healthcare system.
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              MediLink separates patient, doctor, and admin workflows so every user sees the right tools from one connected platform.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {dashboardPreviews.map((dashboard) => (
              <Link
                key={dashboard.title}
                to={dashboard.link}
                className="group rounded-2xl border border-slate-200 bg-[#f8fbfd] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-[0_20px_44px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e6fbf7] text-[#0f766e] shadow-sm">
                      {dashboard.icon}
                    </span>
                    <div>
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-emerald-600">
                        {dashboard.role}
                      </p>
                      <h3 className="mt-1 text-[1rem] font-bold tracking-[-0.01em] text-slate-950">
                        {dashboard.title}
                      </h3>
                    </div>
                  </div>

                  <ArrowRight
                    size={17}
                    className="mt-2 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0f766e]"
                  />
                </div>

                <p className="mt-4 text-[0.8rem] font-medium leading-6 text-slate-600">
                  {dashboard.text}
                </p>

                <div className="mt-4 grid gap-2">
                  {dashboard.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[0.75rem] font-bold text-slate-700"
                    >
                      <CheckCircle2 size={14} className="shrink-0 text-[#0f766e]" />
                      {point}
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="relative scroll-mt-24 overflow-hidden bg-[#061817] py-14 text-white sm:py-16"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(19,200,180,0.12),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.10),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-teal-300">
                Gateway Framework
              </p>
              <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-[-0.025em] sm:text-[1.85rem]">
                Three portals. One connected system.
              </h2>
              <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-300">
                MediLink keeps each user role separated while sharing one clear
                backend API and database structure.
              </p>

              <div className="mt-6 grid gap-3">
                <AboutCheck text="Secure JWT authentication and role-based routing" />
                <AboutCheck text="Connected API mapping for patient, doctor, and admin flows" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
              {portals.map((portal) => (
                <Link
                  key={portal.title}
                  to={portal.link}
                  className="group flex min-h-[200px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_18px_45px_rgba(2,6,23,0.20)] transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-white/[0.08]"
                >
                  <div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#13c8b4] text-slate-950 shadow-[0_12px_26px_rgba(19,200,180,0.16)]">
                      {portal.icon}
                    </span>
                    <h3 className="mt-4 text-[0.95rem] font-bold tracking-[-0.01em] text-white">
                      {portal.title}
                    </h3>
                    <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-300">
                      {portal.text}
                    </p>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 text-[0.8rem] font-bold text-teal-200">
                    Enter Gateway
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-inner backdrop-blur sm:grid-cols-3">
            <SystemCard
              icon={<Activity size={17} />}
              title="Express API Engine"
              text="Structured REST endpoints connect auth, appointments, prescriptions, payments, and support modules."
            />
            <SystemCard
              icon={<LockKeyhole size={17} />}
              title="Token Security"
              text="Authentication state and role checks protect dashboard-specific data and actions."
            />
            <SystemCard
              icon={<Clock3 size={17} />}
              title="Demo Ready Flow"
              text="Every main workflow can be shown clearly during a university project presentation."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function AboutCheck({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
      <CheckCircle2 className="mt-0.5 shrink-0 text-teal-300" size={16} />
      <p className="text-[0.78rem] font-medium leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function SystemCard({ icon, title, text }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#061817]/70 p-4">
      <div className="flex items-center gap-3 text-teal-300">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-400/10">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-[0.78rem] font-medium leading-6 text-slate-400">{text}</p>
    </article>
  );
}

export default Home;