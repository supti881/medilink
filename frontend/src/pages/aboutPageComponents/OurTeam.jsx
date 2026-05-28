import React from 'react';
import { motion } from 'framer-motion';
import { FiLinkedin, FiTwitter, FiMail, FiUsers } from 'react-icons/fi';

export default function OurTeam() {
  const team = [
    {
      id: 1,
      name: "Dr. Alistair Vance",
      role: "Chief Executive Officer (CEO)",
      description: "A veteran healthcare administrator with over 15 years of experience pioneering digital clinical transformation systems.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80", // Premium Medical Professional Image
      socials: { linkedin: "#", twitter: "#", email: "mailto:ceo@medilink.com" }
    },
    {
      id: 2,
      name: "Sajib Khondaker",
      role: "Chief Technology Officer (CTO)",
      description: "Full-stack systems architect specializing in secure, encrypted medical records infrastructure and real-time synchronization.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", // Premium Tech Executive Image
      socials: { linkedin: "#", twitter: "#", email: "mailto:cto@medilink.com" }
    },
    {
      id: 3,
      name: "Dr. Sarah Jenkins",
      role: "Head of Clinical Services",
      description: "Consultant Cardiologist dedicated to structuring telemedicine protocols and optimizing online-to-offline patient care workflows.",
      image: "https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&w=600&q=80", // Premium Medical Specialist Image
      socials: { linkedin: "#", twitter: "#", email: "mailto:clinical@medilink.com" }
    }
  ];

  // Framer Motion Animation Variants for Staggered Entrance
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 }
    }
  };

  return (
    <section className="relative py-24 bg-[#020d0c] text-slate-200 overflow-hidden border-t border-emerald-950/40">
      
      {/* Background Ambient Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#00cc99] bg-[#00cc99]/10 border border-[#00cc99]/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5"
          >
            <FiUsers className="w-3.5 h-3.5" />
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
            className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            Our leadership brings together clinical mastery and technical innovation to reshape how global healthcare is accessed.
          </motion.p>
        </div>

        {/* Team Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {team.map((member) => (
            <motion.div 
              key={member.id} 
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group relative bg-[#041715]/40 backdrop-blur-sm rounded-2xl border border-emerald-950/80 shadow-xl overflow-hidden transition-all duration-300"
            >
              
              {/* Image Container with Hover Social Overlay */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-emerald-950/20">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Smooth Social Overlay Reveal */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020d0c] via-[#020d0c]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <div className="flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <motion.a 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 204, 153, 0.2)' }}
                      href={member.socials.linkedin}
                      className="w-9 h-9 rounded-xl bg-[#031211]/90 border border-emerald-900/60 flex items-center justify-center text-slate-300 hover:text-[#00cc99] transition-all"
                    >
                      <FiLinkedin className="w-4 h-4" />
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 204, 153, 0.2)' }}
                      href={member.socials.twitter}
                      className="w-9 h-9 rounded-xl bg-[#031211]/90 border border-emerald-900/60 flex items-center justify-center text-slate-300 hover:text-[#00cc99] transition-all"
                    >
                      <FiTwitter className="w-4 h-4" />
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 204, 153, 0.2)' }}
                      href={member.socials.email}
                      className="w-9 h-9 rounded-xl bg-[#031211]/90 border border-emerald-900/60 flex items-center justify-center text-slate-300 hover:text-[#00cc99] transition-all"
                    >
                      <FiMail className="w-4 h-4" />
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Text Information Details */}
              <div className="p-6 space-y-2 relative">
                {/* Visual Accent Corner Highlight */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#00cc99]/5 to-transparent pointer-events-none" />

                <span className="text-[11px] font-medium tracking-wide text-[#00cc99] bg-[#00cc99]/5 px-2 py-0.5 rounded border border-emerald-900/30">
                  {member.role}
                </span>
                
                <h3 className="text-lg font-bold text-white pt-1 tracking-tight">
                  {member.name}
                </h3>
                
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal pt-1">
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