import { useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  Headphones,
  HeartPulse,
  LockKeyhole,
  MapPin,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  Video,
  Wallet,
} from "lucide-react";

const stats = [
  { label: "Core Services", value: "6", icon: <Activity size={16} /> },
  { label: "Care Portals", value: "3", icon: <UsersRound size={16} /> },
  { label: "Secure Access", value: "JWT", icon: <LockKeyhole size={16} /> },
  { label: "Support Flow", value: "24/7", icon: <Headphones size={16} /> },
];

const services = [
  {
    icon: <CalendarDays size={19} />,
    title: "Doctor Appointment Booking",
    type: "Patient Service",
    description:
      "Patients can discover approved doctors, compare fees, and book available slots from one organized workflow.",
    link: "/doctors",
    action: "Find doctors",
  },
  {
    icon: <Video size={19} />,
    title: "Online Consultation",
    type: "Care Access",
    description:
      "Doctors can manage consultation status and keep appointment interaction clear from their dashboard.",
    link: "/doctors",
    action: "Start workflow",
  },
  {
    icon: <FileText size={19} />,
    title: "Digital Prescription",
    type: "Medical Records",
    description:
      "Doctors create prescriptions with medicines, tests, advice, follow-up dates, and secure record details.",
    link: "/dashboard",
    action: "Doctor portal",
  },
  {
    icon: <FileCheck2 size={19} />,
    title: "Prescription Verification",
    type: "Security Module",
    description:
      "Patients and pharmacies can verify prescriptions using a unique RX token without exposing full records.",
    link: "/verify-prescription",
    action: "Verify token",
  },
  {
    icon: <MessageCircle size={19} />,
    title: "Support Ticket",
    type: "Help Desk",
    description:
      "Patients can submit issues while admins review, prioritize, reply, and resolve support requests.",
    link: "/support-ticket",
    action: "Create ticket",
  },
  {
    icon: <CreditCard size={19} />,
    title: "Payment & Support Review",
    type: "Admin Review",
    description:
      "The system supports mock payment records, payment history, support tickets, and admin monitoring.",
    link: "/mock-payment",
    action: "Payment flow",
  },
];

const departments = [
  { name: "Cardiology", icon: <HeartPulse size={16} />, note: "Heart care" },
  { name: "Dermatology", icon: <Sparkles size={16} />, note: "Skin care" },
  { name: "Neurology", icon: <Activity size={16} />, note: "Nerve care" },
  { name: "Pediatrics", icon: <UsersRound size={16} />, note: "Child care" },
  { name: "Orthopedics", icon: <Stethoscope size={16} />, note: "Bone care" },
  { name: "Gynecology", icon: <ShieldCheck size={16} />, note: "Women care" },
  { name: "General Medicine", icon: <BadgeCheck size={16} />, note: "Primary care" },
  { name: "Dental Care", icon: <FileCheck2 size={16} />, note: "Oral health" },
];

const workflow = [
  {
    step: "01",
    title: "Create Account",
    icon: <UserRound size={18} />,
    description:
      "Patient registers, verifies access, and enters the patient portal.",
  },
  {
    step: "02",
    title: "Find Doctor",
    icon: <Stethoscope size={18} />,
    description:
      "Patient searches approved doctors by department, fee, and available schedule.",
  },
  {
    step: "03",
    title: "Book Appointment",
    icon: <CalendarDays size={18} />,
    description:
      "Patient chooses an available slot and confirms the appointment request.",
  },
  {
    step: "04",
    title: "Prescription & Support",
    icon: <FileText size={18} />,
    description:
      "Doctor creates prescriptions and admin reviews support or payment records.",
  },
];

const trustFeatures = [
  {
    icon: <ShieldCheck size={18} />,
    title: "Verified Doctor Access",
    description:
      "Only active doctor accounts are shown to patients after admin approval.",
  },
  {
    icon: <LockKeyhole size={18} />,
    title: "Role-Based Security",
    description:
      "Patient, doctor, and admin areas stay protected through authentication checks.",
  },
  {
    icon: <Clock3 size={18} />,
    title: "Appointment Visibility",
    description:
      "Available days and time slots are presented clearly before booking.",
  },
  {
    icon: <Wallet size={18} />,
    title: "Payment Record Flow",
    description:
      "Mock payments and saved payment records make the project workflow complete.",
  },
];

const faqs = [
  {
    question: "How can a patient book an appointment?",
    answer:
      "The patient signs in, opens the Doctors page, selects an approved doctor, chooses an available slot, and confirms the appointment.",
  },
  {
    question: "Can doctors create prescriptions?",
    answer:
      "Yes. Doctors can manage assigned appointments and create digital prescriptions with medicines, tests, advice, and follow-up information.",
  },
  {
    question: "Is prescription verification available?",
    answer:
      "Yes. The prescription verification page allows users to validate prescriptions using a secure RX token.",
  },
  {
    question: "Does the system support admin review?",
    answer:
      "Yes. Admins can monitor doctors, appointments, support tickets, payment records, and user activity from the dashboard.",
  },
];

function ServicePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <ServicePageStyles />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#061817] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#13c8b4]/15 blur-3xl" />
          <div className="absolute right-10 top-14 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="service-grid absolute inset-0" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="service-reveal">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                <HeartPulse size={13} />
                MediLink Healthcare Services
              </div>

              <h1 className="mt-3 max-w-2xl text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[2.2rem]">
                Smarter healthcare services, organized in one workflow.
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                MediLink connects doctor discovery, appointment booking,
                prescriptions, secure verification, payments, support tickets,
                and admin review through one clean medical platform.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[0.76rem] font-semibold">
                <Link
                  to="/doctors"
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#13c8b4] bg-[#13c8b4] px-3.5 py-2 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0fb3a1] hover:text-white"
                >
                  <CalendarDays size={14} />
                  Book Appointment
                </Link>

                <Link
                  to="/verify-prescription"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 font-bold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
                >
                  <ShieldCheck size={14} />
                  Verify Prescription
                </Link>
              </div>
            </div>

            <div className="service-reveal service-delay-1 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_70px_rgba(2,6,23,0.28)] backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#13c8b4] text-slate-950 shadow-[0_0_30px_rgba(19,200,180,0.28)]">
                    <Activity size={21} />
                  </span>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                      Service Hub
                    </p>

                    <h2 className="mt-1 text-[1.45rem] font-bold leading-none text-white">
                      6 Modules
                    </h2>
                  </div>
                </div>

                <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[0.7rem] font-bold text-teal-200">
                  Ready
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <HeroMiniCard
                  icon={<UserRound size={16} />}
                  title="Patient Workflow"
                  text="Appointments, payments, prescriptions, and support."
                />
                <HeroMiniCard
                  icon={<ShieldCheck size={16} />}
                  title="Admin Review"
                  text="Doctors, payment records, support tickets, and reports."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <article
              key={stat.label}
              className={`service-reveal service-delay-${Math.min(
                index + 1,
                3
              )} rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:shadow-md`}
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

        <div className="service-reveal mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <Search size={17} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-500">
              Services are grouped by patient, doctor, and admin workflows for
              easy project demonstration.
            </p>
          </div>
        </div>

        <section className="service-reveal mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            badge="Core Services"
            icon={<Sparkles size={14} />}
            title="Healthcare modules that connect the full care flow."
            subtitle="Each service has a clear purpose for patient care, doctor workflow, and admin review."
          />

          <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <Link
                key={service.title}
                to={service.link}
                className={`service-card service-reveal service-delay-${Math.min(
                  index % 4,
                  3
                )} group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e] transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-[#13c8b4] group-hover:text-white">
                    {service.icon}
                  </span>

                  <div>
                    <h3 className="text-[0.95rem] font-bold tracking-[-0.01em] text-slate-950">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-[0.74rem] font-semibold text-[#0f766e]">
                      {service.type}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[0.8rem] font-medium leading-6 text-slate-600">
                  {service.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-[0.76rem] font-bold text-[#0f766e]">
                  {service.action}
                  <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="service-reveal px-1 py-2 text-center lg:px-2 lg:py-4 lg:text-left">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Smart Workflow
            </p>
            <h2 className="mt-2 text-[1.25rem] font-bold tracking-[-0.02em] text-slate-950">
              How MediLink Works
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600 lg:mx-0">
              The service flow is designed for a simple final year project
              demonstration: account access, doctor search, appointment booking,
              prescription, payment, and support review.
            </p>

            <Link
              to="/doctors"
              style={{ color: "#ffffff" }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0fb3a1] hover:text-white"
            >
              Start With Doctors
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#13c8b4]/35 to-transparent sm:block" />

            {workflow.map((item, index) => (
              <article
                key={item.step}
                className={`service-reveal service-delay-${Math.min(
                  index,
                  3
                )} relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl font-bold leading-none tracking-tight text-slate-200">
                    {item.step}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                    {item.icon}
                  </span>
                </div>

                <h3 className="mt-3 text-[0.92rem] font-bold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="service-reveal mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            badge="Medical Departments"
            icon={<Stethoscope size={14} />}
            title="Specialized care categories"
            subtitle="Department examples for doctor discovery and filtering."
          />

          <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((department, index) => (
              <Link
                key={department.name}
                to="/doctors"
                className={`service-reveal service-delay-${Math.min(
                  index % 4,
                  3
                )} group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:bg-white hover:shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0f766e] ring-1 ring-slate-200 transition group-hover:bg-[#e6fbf7] group-hover:ring-[#baf4ea]">
                    {department.icon}
                  </span>
                  <div>
                    <h3 className="text-[0.88rem] font-bold text-slate-950">
                      {department.name}
                    </h3>
                    <p className="mt-0.5 text-[0.74rem] font-medium text-slate-500">
                      {department.note}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="service-reveal px-1 py-2 text-center lg:px-2 lg:py-4 lg:text-left">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Why MediLink
            </p>
            <h2 className="mt-2 text-[1.25rem] font-bold tracking-[-0.02em] text-slate-950">
              Clean, secure, and presentation-ready.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600 lg:mx-0">
              MediLink keeps each role separated while connecting the main
              medical workflows through a simple backend API and dashboard
              experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustFeatures.map((feature, index) => (
              <article
                key={feature.title}
                className={`service-reveal service-delay-${Math.min(
                  index,
                  3
                )} rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:shadow-md`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                  {feature.icon}
                </span>
                <h3 className="mt-3 text-[0.9rem] font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="service-reveal rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:shadow-md">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Featured System
            </p>
            <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
              Smart Appointment Management
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Patients can book doctor appointments, doctors can manage
              consultation status, and admins can review operational activity
              from the dashboard.
            </p>

            <div className="mt-4 grid gap-2">
              {[
                "Doctor profile and available schedule",
                "Patient appointment request",
                "Doctor consultation and prescription flow",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[0.82rem] font-medium text-slate-600"
                >
                  <CheckCircle2 size={15} className="text-[#0f766e]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="service-reveal service-delay-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#baf4ea] hover:shadow-md">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.76rem] font-semibold text-slate-500">
                    Appointment Preview
                  </p>
                  <h3 className="mt-1 text-[0.98rem] font-bold text-slate-950">
                    Today, 3 active slots
                  </h3>
                </div>
                <span className="rounded-full bg-[#e6fbf7] px-3 py-1 text-[0.7rem] font-bold text-[#0f766e]">
                  Available
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {[
                  "10:00 AM - 01:00 PM",
                  "04:00 PM - 07:00 PM",
                  "05:00 PM - 08:00 PM",
                ].map((time) => (
                  <div
                    key={time}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[0.8rem] font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Clock3 size={14} className="text-[#0f766e]" />
                      {time}
                    </span>
                    <span className="font-bold text-[#0f766e]">Open</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="service-reveal mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-red-700 ring-1 ring-red-100">
                <AlertCircle size={13} />
                Emergency Support
              </div>
              <h2 className="mt-3 text-[1.12rem] font-bold tracking-[-0.02em] text-slate-950">
                Need urgent medical care?
              </h2>
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                Use emergency contact options or locate nearby emergency
                hospitals through maps.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="tel:999"
                style={{ color: "#ffffff" }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700 hover:text-white"
              >
                <PhoneCall size={15} />
                Call 999
              </a>
              <a
                href="https://www.google.com/maps/search/emergency+hospital+near+me"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50"
              >
                <MapPin size={15} />
                Locate ER
              </a>
            </div>
          </div>
        </section>

        <section className="service-reveal mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            badge="FAQ & Support"
            icon={<Headphones size={14} />}
            title="Frequently Asked Questions"
            subtitle="Common service questions for project demonstration."
          />

          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-sm font-bold text-slate-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={17}
                      className={`shrink-0 text-slate-400 transition duration-300 ${
                        isOpen ? "rotate-180 text-[#0f766e]" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

function SectionHeader({ badge, icon, title, subtitle }) {
  return (
    <div className="px-4 py-6 text-center sm:px-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#e6fbf7] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e] ring-1 ring-[#baf4ea]">
        {icon}
        {badge}
      </div>

      <h2 className="mx-auto mt-3 max-w-2xl text-[1.18rem] font-bold tracking-[-0.02em] text-slate-950 sm:text-[1.35rem]">
        {title}
      </h2>

      <p className="mx-auto mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function HeroMiniCard({ icon, title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
      <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-[#13c8b4]/15 text-teal-200">
        {icon}
      </span>
      <p className="text-[0.78rem] font-bold text-white">{title}</p>
      <p className="mt-1 text-[0.72rem] font-medium leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ServicePageStyles() {
  return (
    <style>{`
      .service-grid {
        background-image:
          linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: radial-gradient(circle at 30% 20%, black, transparent 68%);
      }

      .service-reveal {
        animation: serviceFadeUp 0.72s ease both;
      }

      .service-delay-1 { animation-delay: 0.08s; }
      .service-delay-2 { animation-delay: 0.16s; }
      .service-delay-3 { animation-delay: 0.24s; }

      .service-card {
        position: relative;
        overflow: hidden;
      }

      .service-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent, rgba(19, 200, 180, 0.08), transparent);
        transform: translateX(-120%);
        transition: transform 0.7s ease;
        pointer-events: none;
      }

      .service-card:hover::after {
        transform: translateX(120%);
      }

      @keyframes serviceFadeUp {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .service-reveal {
          animation: none !important;
        }

        .service-card,
        .service-card::after,
        * {
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  );
}

export default ServicePage;
