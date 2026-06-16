import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiLinkedin, FiTwitter, FiMail, FiUsers } from "react-icons/fi";

function TeamImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (failed || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/25 via-cyan-500/20 to-slate-950">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-400/30 bg-[#031211]/80 text-3xl font-black text-[#00cc99] shadow-xl">
          {initials || "ML"}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function OurTeam() {
  const team = [
    {
      id: 1,
      name: "Dr. Alistair Vance",
      role: "Chief Executive Officer (CEO)",
      description:
        "A veteran healthcare administrator with over 15 years of experience pioneering digital clinical transformation systems.",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
      socials: {
        linkedin: "#",
        twitter: "#",
        email: "mailto:ceo@medilink.com",
      },
    },
    {
      id: 2,
      name: "Sajib Khondaker",
      role: "Chief Technology Officer (CTO)",
      description:
        "Full-stack systems architect specializing in secure, encrypted medical records infrastructure and real-time synchronization.",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      socials: {
        linkedin: "#",
        twitter: "#",
        email: "mailto:cto@medilink.com",
      },
    },
    {
      id: 3,
      name: "Dr. Sarah Jenkins",
      role: "Head of Clinical Services",
      description:
        "Consultant Cardiologist dedicated to structuring telemedicine protocols and optimizing online-to-offline patient care workflows.",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
      socials: {
        linkedin: "#",
        twitter: "#",
        email: "mailto:clinical@medilink.com",
      },
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 },
    },
  };

  return (
    <section className="relative overflow-hidden border-t border-emerald-950/40 bg-[#020d0c] py-24 text-slate-200">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#00cc99]/20 bg-[#00cc99]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#00cc99]"
          >
            <FiUsers className="h-3.5 w-3.5" />
            Leadership
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            The Minds Behind MediLink
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            Our leadership brings together clinical mastery and technical
            innovation to reshape how global healthcare is accessed.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {team.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-emerald-950/80 bg-[#041715]/40 shadow-xl backdrop-blur-sm transition-all duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-emerald-950/20">
                <TeamImage src={member.image} name={member.name} />

                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#020d0c] via-[#020d0c]/40 to-transparent pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex translate-y-4 items-center gap-3 transition-transform duration-300 group-hover:translate-y-0">
                    <motion.a
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(0, 204, 153, 0.2)",
                      }}
                      href={member.socials.linkedin}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/60 bg-[#031211]/90 text-slate-300 transition-all hover:text-[#00cc99]"
                    >
                      <FiLinkedin className="h-4 w-4" />
                    </motion.a>

                    <motion.a
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(0, 204, 153, 0.2)",
                      }}
                      href={member.socials.twitter}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/60 bg-[#031211]/90 text-slate-300 transition-all hover:text-[#00cc99]"
                    >
                      <FiTwitter className="h-4 w-4" />
                    </motion.a>

                    <motion.a
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(0, 204, 153, 0.2)",
                      }}
                      href={member.socials.email}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/60 bg-[#031211]/90 text-slate-300 transition-all hover:text-[#00cc99]"
                    >
                      <FiMail className="h-4 w-4" />
                    </motion.a>
                  </div>
                </div>
              </div>

              <div className="relative space-y-2 p-6">
                <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 bg-gradient-to-bl from-[#00cc99]/5 to-transparent" />

                <span className="rounded border border-emerald-900/30 bg-[#00cc99]/5 px-2 py-0.5 text-[11px] font-medium tracking-wide text-[#00cc99]">
                  {member.role}
                </span>

                <h3 className="pt-1 text-lg font-bold tracking-tight text-white">
                  {member.name}
                </h3>

                <p className="pt-1 text-xs font-normal leading-relaxed text-slate-400 sm:text-sm">
                  {member.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}