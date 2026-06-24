import { Link } from "react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";

const stats = [
  {
    label: "Care Modules",
    value: "6+",
    icon: <Activity size={16} />,
  },
  {
    label: "User Portals",
    value: "3",
    icon: <UsersRound size={16} />,
  },
  {
    label: "Secure Flow",
    value: "JWT",
    icon: <LockKeyhole size={16} />,
  },
  {
    label: "Demo Ready",
    value: "100%",
    icon: <BadgeCheck size={16} />,
  },
];

const overviewCards = [
  {
    icon: <HeartPulse size={18} />,
    eyebrow: "Our Mission",
    title: "Make healthcare workflows simple and connected.",
    description:
      "MediLink helps patients, doctors, and admins manage appointments, prescriptions, support tickets, and healthcare records from one organized platform.",
  },
  {
    icon: <ShieldCheck size={18} />,
    eyebrow: "Our Vision",
    title: "Build a secure digital healthcare experience.",
    description:
      "The system focuses on structured role-based access, clear medical records, and a practical workflow that can be explained easily during project presentation.",
  },
  {
    icon: <FileText size={18} />,
    eyebrow: "System Purpose",
    title: "A complete final year healthcare project.",
    description:
      "MediLink demonstrates patient registration, doctor discovery, appointment booking, prescription verification, payments, replacement requests, and admin review.",
  },
];

const values = [
  {
    icon: <ShieldCheck size={17} />,
    title: "Patient-Centric",
    description:
      "Patients can search doctors, book appointments, view prescriptions, and request support from a single portal.",
  },
  {
    icon: <LockKeyhole size={17} />,
    title: "Security Focused",
    description:
      "Role-based access and token-protected routes keep patient, doctor, and admin workflows separated.",
  },
  {
    icon: <Clock3 size={17} />,
    title: "Fast Access",
    description:
      "Appointment schedules, doctor profiles, and prescription verification are designed for quick access.",
  },
  {
    icon: <Wallet size={17} />,
    title: "Organized Process",
    description:
      "Payments, support tickets, and replacement requests are structured for clean admin review.",
  },
];

const teamMembers = [
  {
    name: "Dr. Tanvir Ahmed",
    role: "Medical Advisor",
    initials: "TA",
    description:
      "Supports the healthcare workflow logic and specialist consultation structure.",
  },
  {
    name: "Dr. Sabrina Karim",
    role: "Clinical Consultant",
    initials: "SK",
    description:
      "Guides prescription, appointment, and patient communication flow.",
  },
  {
    name: "MediLink Admin Team",
    role: "System Operations",
    initials: "ML",
    description:
      "Maintains doctors, support tickets, payment review, and replacement requests.",
  },
];

const timeline = [
  {
    year: "2024",
    title: "Project Planning",
    description:
      "Core healthcare workflow, role-based portals, and main system modules were planned.",
  },
  {
    year: "2025",
    title: "Patient & Doctor Flow",
    description:
      "Doctor discovery, appointment booking, and prescription modules were developed.",
  },
  {
    year: "2026",
    title: "Admin Review System",
    description:
      "Support tickets, payment mockup, replacement request review, and dashboard management were added.",
  },
];

const partners = [
  "Patient Portal",
  "Doctor Portal",
  "Admin Portal",
  "Prescription Verify",
  "Support Ticket",
  "Replacement Request",
];

const testimonials = [
  {
    quote:
      "MediLink presents healthcare workflow in a clean and understandable way. The patient, doctor, and admin roles are separated clearly.",
    name: "Rahman Hasan",
    role: "Project Reviewer",
  },
  {
    quote:
      "The system is suitable for demonstrating appointment booking, prescription creation, and support management in one project.",
    name: "Academic Feedback",
    role: "Demo Evaluation",
  },
];

function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <section className="border-b border-slate-200 bg-[#f3f6fa] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#baf4ea] bg-[#e6fbf7] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              <HeartPulse size={13} />
              About MediLink
            </div>

            <h1 className="mt-3 text-[1.55rem] font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.9rem]">
              Building a connected healthcare system.
            </h1>

            <p className="mx-auto mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              MediLink is a healthcare management platform designed to connect
              patients, doctors, and admins through a clean appointment,
              prescription, payment, support, and review workflow.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[0.76rem] font-semibold">
              <Link
                to="/doctors"
                style={{ color: "#ffffff" }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#13c8b4] bg-[#13c8b4] px-3.5 py-2 font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white"
              >
                <Stethoscope size={14} />
                Find Doctors
              </Link>

              <Link
                to="/service"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowRight size={14} />
                View Services
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-5 grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                      {stat.icon}
                    </span>

                    <p className="truncate text-[0.76rem] font-medium text-slate-500">
                      {stat.label}
                    </p>
                  </div>

                  <p className="shrink-0 text-[1.12rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
                    {stat.value}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              MediLink Overview
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Mission, vision, and system purpose
            </p>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-3">
            {overviewCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#baf4ea] hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                  {card.icon}
                </span>

                <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                  {card.eyebrow}
                </p>

                <h3 className="mt-2 text-[0.95rem] font-bold tracking-[-0.01em] text-slate-950">
                  {card.title}
                </h3>

                <p className="mt-2 text-[0.8rem] font-medium leading-6 text-slate-600">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="px-1 py-2 lg:px-2 lg:py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Why MediLink
            </p>

            <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
              Clean, secure, and easy to present.
            </h2>

            <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600">
              The platform keeps healthcare workflows structured with clear role
              separation, simple navigation, and practical modules for a final
              year project demonstration.
            </p>

            <Link
              to="/service"
              style={{ color: "#ffffff" }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white"
            >
              Explore Services
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                  {value.icon}
                </span>

                <h3 className="mt-3 text-[0.9rem] font-bold text-slate-950">
                  {value.title}
                </h3>

                <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              The Minds Behind MediLink
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Team and operational roles
            </p>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#baf4ea] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e6fbf7] text-sm font-bold text-[#0f766e]">
                    {member.initials}
                  </span>

                  <div>
                    <h3 className="text-[0.95rem] font-bold text-slate-950">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-[0.74rem] font-semibold text-[#0f766e]">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[0.8rem] font-medium leading-6 text-slate-600">
                  {member.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="px-1 py-2 lg:px-2 lg:py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Project Timeline
            </p>

            <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
              The journey of MediLink.
            </h2>

            <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600">
              MediLink was designed step by step as a structured healthcare
              system with patient, doctor, and admin workflows connected through
              one platform.
            </p>
          </div>

          <div className="grid gap-3">
            {timeline.map((item) => (
              <article
                key={item.year}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                    <CalendarDays size={16} />
                  </span>

                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                      {item.year}
                    </p>

                    <h3 className="mt-1 text-[0.92rem] font-bold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              Connected System Modules
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Key areas included in the MediLink ecosystem
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <Link
                key={partner}
                to="/service"
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-[#baf4ea] hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0f766e] ring-1 ring-slate-200 group-hover:bg-[#e6fbf7]">
                    <UserRound size={16} />
                  </span>

                  <div>
                    <h3 className="text-[0.88rem] font-bold text-slate-950">
                      {partner}
                    </h3>
                    <p className="mt-0.5 text-[0.74rem] font-medium text-slate-500">
                      View module
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              Trusted by Patients & Professionals
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Simple project feedback and system evaluation
            </p>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2 text-[#0f766e]">
                  <CheckCircle2 size={16} />
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em]">
                    Feedback
                  </p>
                </div>

                <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                  “{item.quote}”
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                    <UserRound size={16} />
                  </span>

                  <div>
                    <p className="text-[0.86rem] font-bold text-slate-950">
                      {item.name}
                    </p>
                    <p className="text-[0.74rem] font-medium text-slate-500">
                      {item.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                Start Your Journey
              </p>

              <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
                Ready to experience MediLink?
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                Create an account, find specialist doctors, book appointments,
                and manage your healthcare workflow from one clean system.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to="/register"
                style={{ color: "#ffffff" }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0fb3a1] hover:text-white"
              >
                Get Started
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/doctors"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#baf4ea] bg-white px-4 py-2.5 text-sm font-bold text-[#0f766e] transition hover:bg-slate-50"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default AboutPage;