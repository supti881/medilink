import { useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Headphones,
  HeartPulse,
  LockKeyhole,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
  Wallet,
} from "lucide-react";

const stats = [
  { label: "Core Services", value: "6", icon: <Activity size={16} /> },
  { label: "Care Portals", value: "3", icon: <UserRound size={16} /> },
  { label: "Secure Access", value: "JWT", icon: <LockKeyhole size={16} /> },
  { label: "Support Flow", value: "24/7", icon: <Headphones size={16} /> },
];

const services = [
  {
    icon: <CalendarDays size={18} />,
    title: "Doctor Appointment Booking",
    type: "Patient Service",
    description:
      "Patients can find approved doctors, compare fees, and book available slots from one clean workflow.",
  },
  {
    icon: <Video size={18} />,
    title: "Online Consultation",
    type: "Care Access",
    description:
      "Doctors can manage consultation status and keep patient interaction organized through the portal.",
  },
  {
    icon: <FileText size={18} />,
    title: "Digital Prescription",
    type: "Medical Records",
    description:
      "Doctors can create prescriptions with medicine, advice, tests, and secure verification tokens.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Prescription Verification",
    type: "Security Module",
    description:
      "Patients and pharmacies can verify prescriptions using a unique RX token and validation page.",
  },
  {
    icon: <Headphones size={18} />,
    title: "Support Ticket",
    type: "Help Desk",
    description:
      "Patients can submit support requests while admins review, update, and resolve tickets.",
  },
  {
    icon: <Wallet size={18} />,
    title: "Payment & Replacement",
    type: "Admin Review",
    description:
      "The system supports payment demonstration and prescription replacement request review.",
  },
];

const departments = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "General Medicine",
  "Dental Care",
];

const workflow = [
  {
    step: "01",
    title: "Create Account",
    description: "Patient registers, verifies OTP, and accesses the patient portal.",
  },
  {
    step: "02",
    title: "Find Doctor",
    description: "Patient searches approved doctors by department, fee, and availability.",
  },
  {
    step: "03",
    title: "Book Appointment",
    description: "Patient selects an available slot and confirms the appointment request.",
  },
  {
    step: "04",
    title: "Prescription & Support",
    description:
      "Doctor creates prescriptions and admin manages support or replacement requests.",
  },
];

const trustFeatures = [
  {
    icon: <ShieldCheck size={17} />,
    title: "Verified Doctor Access",
    description: "Only active doctor accounts are shown to patients after admin approval.",
  },
  {
    icon: <LockKeyhole size={17} />,
    title: "Role-Based Security",
    description:
      "Patient, doctor, and admin areas stay protected through authentication checks.",
  },
  {
    icon: <Clock3 size={17} />,
    title: "Appointment Visibility",
    description:
      "Available days and times are presented clearly before appointment booking.",
  },
  {
    icon: <CheckCircle2 size={17} />,
    title: "Demo-Ready Workflow",
    description:
      "Each module is easy to explain during project presentation and testing.",
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
      "Yes. Doctors can manage assigned appointments and create digital prescriptions with medicine, tests, advice, and follow-up information.",
  },
  {
    question: "Is prescription verification available?",
    answer:
      "Yes. The prescription verification page allows users to validate prescriptions using a secure RX token.",
  },
  {
    question: "Does the system support admin review?",
    answer:
      "Yes. Admins can monitor doctors, support tickets, appointments, payments, and prescription replacement requests.",
  },
];

function ServicePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <section className="border-b border-slate-200 bg-[#f3f6fa] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#baf4ea] bg-[#e6fbf7] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              <HeartPulse size={13} />
              MediLink Services
            </div>

            <h1 className="mt-3 text-[1.55rem] font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.9rem]">
              Healthcare Service Management
            </h1>

            <p className="mx-auto mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Manage doctor discovery, appointment booking, prescriptions,
              support tickets, payments, and admin review from one organized
              medical workflow.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[0.76rem] font-semibold">
              <Link
                to="/doctors"
                style={{ color: "#ffffff" }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#13c8b4] bg-[#13c8b4] px-3.5 py-2 font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white"
              >
                <CalendarDays size={14} />
                Book Appointment
              </Link>

              <Link
                to="/verify-prescription"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ShieldCheck size={14} />
                Verify Prescription
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
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <Search size={17} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-500">
              Services are grouped by patient, doctor, and admin workflows for
              easy project demonstration.
            </p>
          </div>
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              Core Service Directory
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              6 healthcare modules available
            </p>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#baf4ea] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
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
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="px-1 py-2 lg:px-2 lg:py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Workflow
            </p>
            <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
              How MediLink Works
            </h2>
            <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600">
              The service flow is designed for a simple final year project
              demonstration: account access, doctor search, appointment booking,
              prescription, and support review.
            </p>

            <Link
              to="/doctors"
              style={{ color: "#ffffff" }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white"
            >
              Start With Doctors
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {workflow.map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="text-2xl font-bold leading-none tracking-tight text-slate-200">
                  {item.step}
                </span>
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

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              Specialized Care Categories
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Department examples for doctor discovery and filtering
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((department) => (
              <Link
                key={department}
                to="/doctors"
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-[#baf4ea] hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0f766e] ring-1 ring-slate-200 group-hover:bg-[#e6fbf7]">
                    <Stethoscope size={16} />
                  </span>
                  <div>
                    <h3 className="text-[0.88rem] font-bold text-slate-950">
                      {department}
                    </h3>
                    <p className="mt-0.5 text-[0.74rem] font-medium text-slate-500">
                      Find doctors
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="px-1 py-2 lg:px-2 lg:py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Why MediLink
            </p>
            <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
              Clean, secure, and presentation-ready.
            </h2>
            <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600">
              MediLink keeps each role separated while connecting the main
              medical workflows through a simple backend API and dashboard
              experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustFeatures.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
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

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

        <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 hover:text-white"
              >
                <PhoneCall size={15} />
                Call 999
              </a>
              <a
                href="https://www.google.com/maps/search/emergency+hospital+near+me"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                <MapPin size={15} />
                Locate ER
              </a>
            </div>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Common service questions for project demonstration
            </p>
          </div>

          <div className="divide-y divide-slate-200">
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
                      className={`shrink-0 text-slate-400 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default ServicePage;