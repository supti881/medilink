import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
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
      "MediLink demonstrates patient registration, doctor discovery, appointment booking, prescription verification, payments, support tickets, and admin review.",
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
      "Payments and support tickets are structured for clean admin review and patient tracking.",
  },
];

const teamMembers = [
  {
    name: "Dr. Tanvir Ahmed",
    role: "Medical Advisor",
    initials: "TA",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
    description:
      "Supports healthcare workflow logic, doctor profile structure, and specialist consultation flow.",
  },
  {
    name: "Dr. Sabrina Karim",
    role: "Clinical Consultant",
    initials: "SK",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    description:
      "Guides prescription, appointment, patient communication, and medical record presentation.",
  },
  {
    name: "MediLink Admin Team",
    role: "System Operations",
    initials: "ML",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
    description:
      "Maintains doctors, support tickets, payment review, and overall platform activity.",
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
      "Support tickets, payment mockup, prescription verification, and dashboard management were added.",
  },
];

const modules = [
  {
    title: "Patient Portal",
    description: "Profile, appointments, prescriptions, support, and payment access.",
    icon: <UserRound size={17} />,
  },
  {
    title: "Doctor Portal",
    description: "Doctor schedule, appointment status, and prescription workflow.",
    icon: <Stethoscope size={17} />,
  },
  {
    title: "Admin Portal",
    description: "Manage users, doctors, support tickets, and system activity.",
    icon: <ShieldCheck size={17} />,
  },
  {
    title: "Prescription Verify",
    description: "Validate digital prescriptions using a secure MediLink token.",
    icon: <BadgeCheck size={17} />,
  },
  {
    title: "Support Ticket",
    description: "Submit, review, and resolve patient support requests.",
    icon: <Headphones size={17} />,
  },
  {
    title: "Payment Review",
    description: "Track mock consultation payments and saved transaction records.",
    icon: <Wallet size={17} />,
  },
];

const testimonials = [
  {
    quote:
      "MediLink presents healthcare workflow in a clean and understandable way. The patient, doctor, and admin roles are separated clearly.",
    name: "Rahman Hasan",
    role: "Project Reviewer",
    initials: "RH",
    badge: "Verified Review",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=220&q=80",
  },
  {
    quote:
      "The system is suitable for demonstrating appointment booking, prescription creation, support management, and payment records in one project.",
    name: "Academic Feedback",
    role: "Demo Evaluation",
    initials: "AF",
    badge: "Faculty Insight",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=80",
  },
];

function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <style>{aboutMotionStyles}</style>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#061817] px-4 py-7 text-white sm:px-6 lg:px-8">
        <div className="about-hero-grid absolute inset-0 opacity-40" />
        <div className="about-orb about-orb-one" />
        <div className="about-orb about-orb-two" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
            <AnimatedBlock>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200 shadow-[0_12px_30px_rgba(19,200,180,0.08)]">
                <HeartPulse size={13} />
                About MediLink
              </div>

              <h1 className="mt-3 max-w-2xl text-[1.65rem] font-bold leading-tight tracking-[-0.025em] text-white sm:text-[2rem]">
                Building a connected healthcare system.
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                MediLink connects patients, doctors, and admins through
                appointment, prescription, payment, support, and review
                workflows in one organized medical platform.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[0.76rem] font-semibold">
                <Link
                  to="/doctors"
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#13c8b4] bg-[#13c8b4] px-3.5 py-2 font-bold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#0fb3a1] hover:text-white"
                >
                  <Stethoscope size={14} />
                  Find Doctors
                </Link>

                <Link
                  to="/service"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 font-bold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1]"
                >
                  <ArrowRight size={14} />
                  View Services
                </Link>
              </div>
            </AnimatedBlock>

            <AnimatedBlock delay={120}>
              <div className="about-premium-panel rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.22)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="about-soft-pulse grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#13c8b4] text-slate-950">
                      <Activity size={20} />
                    </span>

                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                        System Overview
                      </p>

                      <h2 className="mt-1 text-[1.35rem] font-bold leading-none text-white">
                        3 Portals
                      </h2>
                    </div>
                  </div>

                  <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[0.7rem] font-bold text-teal-200">
                    Secure
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <HeroMiniCard
                    title="Connected Roles"
                    text="Patient, doctor, and admin flows stay separated."
                  />
                  <HeroMiniCard
                    title="Project Ready"
                    text="Designed for testing, demo, and final presentation."
                  />
                </div>
              </div>
            </AnimatedBlock>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <AnimatedBlock key={stat.label} delay={index * 70}>
              <article className="about-card rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="about-icon grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
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
            </AnimatedBlock>
          ))}
        </div>

        <AnimatedBlock>
          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              eyebrow="Core Identity"
              title="Mission, Vision & Purpose"
              subtitle="The foundation of MediLink as a connected healthcare workflow."
            />

            <div className="grid gap-4 p-4 md:grid-cols-3">
              {overviewCards.map((card, index) => (
                <AnimatedBlock key={card.title} delay={index * 80}>
                  <article className="about-card group h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="about-icon grid h-10 w-10 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e] transition duration-300 group-hover:scale-105">
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
                </AnimatedBlock>
              ))}
            </div>
          </section>
        </AnimatedBlock>

        <section className="mt-6">
          <AnimatedBlock>
            <SectionHeader
              eyebrow="Why MediLink"
              title="Why Choose MediLink"
              subtitle="A clean, secure, and presentation-ready healthcare workflow for patients, doctors, and admins."
              plain
            />
          </AnimatedBlock>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <AnimatedBlock>
              <div className="about-card flex h-full flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                  Platform Focus
                </p>

                <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
                  Clean, secure, and easy to present.
                </h2>

                <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600">
                  The platform keeps healthcare workflows structured with clear
                  role separation, simple navigation, and practical modules for
                  a final year project demonstration.
                </p>

                <Link
                  to="/service"
                  style={{ color: "#ffffff" }}
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#0fb3a1] hover:text-white"
                >
                  Explore Services
                  <ArrowRight size={15} />
                </Link>
              </div>
            </AnimatedBlock>

            <div className="grid gap-3 sm:grid-cols-2">
              {values.map((value, index) => (
                <AnimatedBlock key={value.title} delay={index * 70}>
                  <article className="about-card group h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="about-icon grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e] transition duration-300 group-hover:scale-105">
                      {value.icon}
                    </span>

                    <h3 className="mt-3 text-[0.9rem] font-bold text-slate-950">
                      {value.title}
                    </h3>

                    <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                      {value.description}
                    </p>
                  </article>
                </AnimatedBlock>
              ))}
            </div>
          </div>
        </section>

        <AnimatedBlock>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              eyebrow="Leadership"
              title="The Minds Behind MediLink"
              subtitle="Visual team section with medical and operational roles."
            />

            <div className="grid gap-4 p-4 md:grid-cols-3">
              {teamMembers.map((member, index) => (
                <AnimatedBlock key={member.name} delay={index * 90}>
                  <article className="about-card group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <TeamImage
                      src={member.image}
                      name={member.name}
                      initials={member.initials}
                    />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[0.95rem] font-bold text-slate-950">
                            {member.name}
                          </h3>
                          <p className="mt-1 text-[0.74rem] font-semibold text-[#0f766e]">
                            {member.role}
                          </p>
                        </div>

                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[0.72rem] font-bold text-[#0f766e] transition duration-300 group-hover:scale-105">
                          {member.initials}
                        </span>
                      </div>

                      <p className="mt-3 text-[0.8rem] font-medium leading-6 text-slate-600">
                        {member.description}
                      </p>
                    </div>
                  </article>
                </AnimatedBlock>
              ))}
            </div>
          </section>
        </AnimatedBlock>

        <section className="mt-6">
          <AnimatedBlock>
            <SectionHeader
              eyebrow="Project Timeline"
              title="The Journey of MediLink"
              subtitle="A simple visual timeline showing how the system moved from planning to presentation-ready modules."
              plain
            />
          </AnimatedBlock>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <AnimatedBlock>
              <div className="about-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                  System Growth
                </p>
                <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
                  From workflow planning to complete healthcare modules.
                </h2>
                <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-slate-600">
                  MediLink was designed step by step as a structured healthcare
                  system with patient, doctor, and admin workflows connected
                  through one platform.
                </p>
              </div>
            </AnimatedBlock>

            <div className="relative grid gap-3 before:absolute before:left-[1.1rem] before:top-4 before:hidden before:h-[calc(100%-2rem)] before:w-px before:bg-[#baf4ea] sm:before:block">
              {timeline.map((item, index) => (
                <AnimatedBlock key={item.year} delay={index * 90}>
                  <article className="about-card relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:ml-10">
                    <span className="absolute -left-[3.1rem] top-4 hidden h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e] ring-4 ring-[#f3f6fa] sm:grid">
                      <CalendarDays size={16} />
                    </span>

                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                      {item.year}
                    </p>

                    <h3 className="mt-1 text-[0.92rem] font-bold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-[0.78rem] font-medium leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                </AnimatedBlock>
              ))}
            </div>
          </div>
        </section>

        <AnimatedBlock>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              eyebrow="System Modules"
              title="Connected System Modules"
              subtitle="Key areas included in the MediLink ecosystem."
            />

            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module, index) => (
                <AnimatedBlock key={module.title} delay={index * 55}>
                  <Link
                    to="/service"
                    className="about-card group block h-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm transition duration-300 hover:border-[#baf4ea] hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <span className="about-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#0f766e] ring-1 ring-slate-200 transition duration-300 group-hover:scale-105 group-hover:bg-[#e6fbf7]">
                        {module.icon}
                      </span>

                      <div>
                        <h3 className="text-[0.9rem] font-bold text-slate-950">
                          {module.title}
                        </h3>
                        <p className="mt-1 text-[0.74rem] font-medium leading-5 text-slate-500">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </AnimatedBlock>
              ))}
            </div>
          </section>
        </AnimatedBlock>

        <AnimatedBlock>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              eyebrow="Feedback"
              title="Trusted by Patients & Professionals"
              subtitle="Simple project feedback and system evaluation."
            />

            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {testimonials.map((item, index) => (
                <AnimatedBlock key={item.name} delay={index * 90}>
                  <article className="about-card group h-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#0f766e]">
                        <span className="about-icon grid h-8 w-8 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                          <CheckCircle2 size={15} />
                        </span>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em]">
                          Feedback
                        </p>
                      </div>

                      <span className="rounded-full border border-[#baf4ea] bg-white px-2.5 py-1 text-[0.66rem] font-bold text-[#0f766e]">
                        {item.badge}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <span className="text-4xl font-black leading-none text-[#13c8b4]/25">
                        “
                      </span>
                      <p className="text-sm font-medium leading-6 text-slate-700">
                        {item.quote}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <AvatarImage
                        src={item.avatar}
                        name={item.name}
                        initials={item.initials}
                      />

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
                </AnimatedBlock>
              ))}
            </div>
          </section>
        </AnimatedBlock>

        <AnimatedBlock>
          <section className="cta-glow mt-6 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-5 text-center shadow-sm">
            <div className="mx-auto max-w-3xl">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-[#baf4ea]">
                <Sparkles size={17} />
              </div>

              <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                Start Your Journey
              </p>

              <h2 className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-slate-950">
                Ready to experience MediLink?
              </h2>

              <p className="mx-auto mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                Create an account, find specialist doctors, book appointments,
                and manage your healthcare workflow from one clean system.
              </p>

              <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                <Link
                  to="/register"
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#0fb3a1] hover:text-white"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#baf4ea] bg-white px-4 py-2.5 text-sm font-bold text-[#0f766e] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Book Consultation
                </Link>
              </div>
            </div>
          </section>
        </AnimatedBlock>
      </section>
    </main>
  );
}

function AnimatedBlock({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle, plain = false }) {
  return (
    <div
      className={`px-4 py-4 text-center sm:px-5 ${
        plain ? "" : "border-b border-slate-200"
      }`}
    >
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#e6fbf7] px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.13em] text-[#0f766e] ring-1 ring-[#baf4ea]">
        <Sparkles size={12} />
        {eyebrow}
      </div>
      <h2 className="mt-2 text-[1.05rem] font-bold tracking-[-0.02em] text-slate-950 sm:text-[1.18rem]">
        {title}
      </h2>
      <p className="mx-auto mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function HeroMiniCard({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]">
      <p className="text-[0.78rem] font-bold text-white">{title}</p>
      <p className="mt-1 text-[0.72rem] font-medium leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function TeamImage({ src, name, initials }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="grid h-48 place-items-center bg-[#e6fbf7] text-3xl font-bold text-[#0f766e]">
        {initials || name?.slice(0, 2) || "ML"}
      </div>
    );
  }

  return (
    <div className="h-48 overflow-hidden bg-slate-100">
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function AvatarImage({ src, name, initials }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e6fbf7] text-[0.78rem] font-bold text-[#0f766e] ring-1 ring-[#baf4ea]">
        {initials || name?.slice(0, 2) || "ML"}
      </span>
    );
  }

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-[#e6fbf7] ring-1 ring-[#baf4ea]">
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

const aboutMotionStyles = `
  .about-hero-grid {
    background-image: linear-gradient(rgba(19, 200, 180, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 200, 180, 0.12) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at 30% 20%, black, transparent 62%);
  }

  .about-orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(34px);
    opacity: 0.24;
    pointer-events: none;
  }

  .about-orb-one {
    width: 220px;
    height: 220px;
    left: -70px;
    top: -80px;
    background: #13c8b4;
    animation: aboutFloat 8s ease-in-out infinite;
  }

  .about-orb-two {
    width: 180px;
    height: 180px;
    right: 10%;
    bottom: -90px;
    background: #2dd4bf;
    animation: aboutFloat 9s ease-in-out infinite reverse;
  }

  .about-premium-panel {
    position: relative;
    overflow: hidden;
  }

  .about-premium-panel::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.10) 44%, transparent 70%);
    transform: translateX(-120%);
    animation: aboutShine 5.5s ease-in-out infinite;
  }

  .about-card {
    transition: transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease, background-color 260ms ease;
  }

  .about-card:hover {
    transform: translateY(-4px);
    border-color: #baf4ea;
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  }

  .about-icon {
    transition: transform 260ms ease, box-shadow 260ms ease;
  }

  .about-card:hover .about-icon {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 10px 24px rgba(19, 200, 180, 0.16);
  }

  .about-soft-pulse {
    animation: aboutPulse 2.8s ease-in-out infinite;
  }

  .cta-glow {
    position: relative;
    overflow: hidden;
  }

  .cta-glow::before {
    content: "";
    position: absolute;
    inset: -60% 10%;
    background: radial-gradient(circle, rgba(19, 200, 180, 0.22), transparent 58%);
    animation: aboutFloat 8s ease-in-out infinite;
    pointer-events: none;
  }

  .cta-glow > * {
    position: relative;
  }

  @keyframes aboutFloat {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -12px, 0); }
  }

  @keyframes aboutPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(19, 200, 180, 0.22); }
    50% { box-shadow: 0 0 0 8px rgba(19, 200, 180, 0); }
  }

  @keyframes aboutShine {
    0%, 58% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-orb,
    .about-soft-pulse,
    .about-premium-panel::after,
    .cta-glow::before {
      animation: none !important;
    }

    .about-card,
    .about-icon,
    .about-card:hover,
    .about-card:hover .about-icon {
      transition: none !important;
      transform: none !important;
    }
  }
`;

export default AboutPage;
