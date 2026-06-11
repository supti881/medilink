import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Database,
  FileCheck2,
  Headphones,
  Home,
  Menu,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { formatDateTime } from "./dashboard/ui";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getNavItems(role) {
  if (role === "doctor") {
    return [
      { label: "Overview", to: "/doctor-dashboard", icon: Activity },
      { label: "Appointments", to: "/doctor-dashboard#appointments", icon: BadgeCheck },
      { label: "Prescriptions", to: "/doctor-dashboard#prescriptions", icon: FileCheck2 },
      { label: "Find doctors", to: "/doctors", icon: Stethoscope },
    ];
  }

  if (role === "admin") {
    return [
      { label: "Overview", to: "/admin-dashboard", icon: ShieldCheck },
      { label: "Doctors", to: "/admin-dashboard#doctors", icon: Users },
      { label: "Support", to: "/admin-dashboard#tickets", icon: Headphones },
      { label: "Reissues", to: "/admin-dashboard#reissues", icon: FileCheck2 },
    ];
  }

  return [
    { label: "Overview", to: "/patient-dashboard", icon: Activity },
    { label: "Appointments", to: "/patient-dashboard#appointments", icon: BadgeCheck },
    { label: "Find doctors", to: "/doctors", icon: Stethoscope },
    { label: "Payments", to: "/mock-payment", icon: CreditCard },
    { label: "Support", to: "/support-ticket", icon: Headphones },
    { label: "Reissue", to: "/replacement-request", icon: FileCheck2 },
    { label: "Verify RX", to: "/verify-prescription", icon: ShieldCheck },
  ];
}

const roleThemes = {
  patient: {
    accent: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
    badge: "text-emerald-300",
  },
  doctor: {
    accent: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/20",
    badge: "text-cyan-300",
  },
  admin: {
    accent: "from-violet-400 to-fuchsia-500",
    glow: "shadow-violet-500/20",
    badge: "text-violet-300",
  },
};

// --- SIDEBAR COMPONENT ---
export function Sidebar({ title, user, role, navItems, theme, onClose, isMobile }) {
  const getFirstLetter = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <div
      className={cx(
        "flex h-full flex-col rounded-[24px] border border-white/[0.06] bg-[#09111e] text-white shadow-2xl relative overflow-hidden",
        theme.glow
      )}
    >
      {/* Decorative Top Ambient Light Streak */}
      <div className="absolute -top-12 left-1/4 right-1/4 h-16 w-1/2 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-xl pointer-events-none" />

      {/* Header Section */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div
              className={cx(
                "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-slate-950 shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6",
                theme.accent
              )}
            >
              <Stethoscope size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-white">
                Medi<span className="text-teal-400 font-serif font-normal italic">Link</span>
              </p>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide truncate max-w-[150px]">
                {title}
              </p>
            </div>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition active:scale-95"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* User Account Capsule Widget */}
        <div className="mt-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm bg-white/10 text-white border border-white/10 shadow-inner">
              {getFirstLetter(user?.name)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="truncate text-xs font-black text-white">{user?.name || "User"}</p>
              <p className="truncate text-[11px] font-medium text-slate-400 mt-0.5">
                {user?.email || "No email profile"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Role Access
            </span>
            <span
              className={cx(
                "inline-flex rounded-md bg-gradient-to-r px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-950 shadow-sm",
                theme.accent
              )}
            >
              {user?.role || role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Stack Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all relative group overflow-hidden",
                  isActive
                    ? "text-white bg-white/[0.06] border border-white/[0.08]"
                    : "text-slate-400 hover:bg-white/[0.02] hover:text-white border border-transparent"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Neon Glow Side Indicator Ring */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlowBar"
                      className={cx(
                        "absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b",
                        theme.accent
                      )}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cx(
                      "transition-colors duration-200",
                      isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Connection Indicator Footer */}
      <div className="border-t border-white/[0.06] p-4 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Core Engine Linked
          </p>
          <span className="text-[10px] font-mono font-medium text-slate-600">v2.4.0</span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN LAYOUT COMPONENT ---
export default function DashboardLayout({
  title,
  subtitle,
  role = "patient",
  user,
  children,
  onRefresh,
  refreshing = false,
  lastSynced,
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = useMemo(() => getNavItems(role), [role]);
  const theme = roleThemes[role] || roleThemes.patient;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebar = (
    <Sidebar
      title={title}
      user={user}
      role={role}
      navItems={navItems}
      theme={theme}
      onClose={() => setMobileOpen(false)}
      isMobile={mobileOpen}
    />
  );

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-emerald-300/20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-300/20 blur-[100px]" />
      </div>

      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="hidden w-[272px] shrink-0 lg:block">
          <div className="sticky top-0 h-screen p-4">{sidebar}</div>
        </aside>

        <div className="min-w-0 flex-1 p-4 lg:p-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div>
                <p
                  className={cx(
                    "text-[10px] font-black uppercase tracking-[0.35em]",
                    theme.badge.replace("text-", "text-slate-")
                  )}
                >
                  {role} · live data
                </p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 max-w-xl text-sm text-slate-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {lastSynced && (
                <span className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 sm:inline-flex">
                  <Database size={14} className="text-emerald-600" />
                  Synced {formatDateTime(lastSynced)}
                </span>
              )}
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              )}
              <Link
                to="/"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 sm:inline-flex"
              >
                <Home size={16} />
                Home
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl  px-4 py-2.5 text-sm font-bold text-white"
              >
                <ArrowLeft size={16} />
                Exit
              </Link>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/60"
              onClick={() => setMobileOpen(false)}
              aria-label="Close overlay"
            />
            <motion.div
              className="absolute left-0 top-0 h-full w-[min(300px,88vw)] p-3"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}