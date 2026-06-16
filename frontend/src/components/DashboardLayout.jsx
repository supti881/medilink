import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Database,
  FileCheck2,
  Headphones,
  Home,
  Menu,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { formatDateTime } from "./dashboard/ui";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const SIDEBAR_SCROLLBAR_STYLE = `
.medilink-sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 211, 238, 0.9) transparent;
}
.medilink-sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}
.medilink-sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.medilink-sidebar-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #22d3ee, #14b8a6);
  border-radius: 999px;
}
.medilink-sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #67e8f9, #2dd4bf);
}
.medilink-sidebar-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
.medilink-sidebar-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
`;

function getMediaUrl(value = "") {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value}`;
}

function getStoredAdminProfile() {
  try {
    return JSON.parse(localStorage.getItem("medilink_admin_profile") || "null");
  } catch {
    return null;
  }
}

function getNavItems(role) {
  if (role === "doctor") {
    return [
      { label: "Overview", to: "/doctor-dashboard", icon: Activity },
      {
        label: "Appointments",
        to: "/doctor-dashboard#appointments",
        icon: BadgeCheck,
      },
      {
        label: "Prescriptions",
        to: "/doctor-dashboard#prescriptions",
        icon: FileCheck2,
      },
      {
        label: "Payments",
        to: "/doctor-dashboard#payments",
        icon: CreditCard,
      },
    ];
  }

  if (role === "admin") {
    return [
      { label: "Overview", to: "/admin-dashboard", icon: ShieldCheck },
      { label: "Doctors", to: "/admin-dashboard#doctors", icon: Stethoscope },
      { label: "Patients", to: "/admin-dashboard#patients", icon: UserRound },
      {
        label: "Appointments",
        to: "/admin-dashboard#appointments",
        icon: CalendarDays,
      },
      { label: "Support", to: "/admin-dashboard#tickets", icon: Headphones },
      { label: "Reissues", to: "/admin-dashboard#reissues", icon: FileCheck2 },
    ];
  }

  return [
    { label: "Overview", to: "/patient-dashboard", icon: Activity },
    {
      label: "Appointments",
      to: "/patient-dashboard#appointments",
      icon: BadgeCheck,
    },
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
    badge: "text-emerald-700",
    profileHover:
      "hover:border-emerald-400/40 hover:bg-emerald-400/[0.06] hover:shadow-emerald-500/10",
    profileHint: "text-emerald-300",
  },
  doctor: {
    accent: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/20",
    badge: "text-cyan-700",
    profileHover:
      "hover:border-cyan-400/40 hover:bg-cyan-400/[0.06] hover:shadow-cyan-500/10",
    profileHint: "text-cyan-300",
  },
  admin: {
    accent: "from-violet-400 to-fuchsia-500",
    glow: "shadow-violet-500/20",
    badge: "text-violet-700",
    profileHover:
      "hover:border-violet-400/40 hover:bg-violet-400/[0.06] hover:shadow-violet-500/10",
    profileHint: "text-violet-300",
  },
};

function splitPathAndHash(to) {
  const [pathname, rawHash = ""] = to.split("#");

  return {
    pathname,
    hash: rawHash ? `#${rawHash}` : "",
  };
}

function isMenuItemActive(item, location) {
  const { pathname, hash } = splitPathAndHash(item.to);

  if (location.pathname !== pathname) {
    return false;
  }

  if (!hash) {
    return !location.hash || location.hash === "#overview";
  }

  return location.hash === hash;
}

function getDashboardProfileTarget(role) {
  if (role === "doctor") return "/doctor-dashboard#profile";
  if (role === "admin") return "/admin-dashboard#profile";
  return "";
}

function removeDoctorPrefix(name = "") {
  return String(name || "")
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();
}

function getProfileDisplayName(role, user) {
  const name = user?.name || "User";

  if (role === "doctor") {
    const cleanName = removeDoctorPrefix(name);

    return cleanName && cleanName.toLowerCase() !== "doctor"
      ? `Dr. ${cleanName}`
      : "Doctor";
  }

  return name;
}

function Sidebar({
  title,
  user,
  role,
  navItems,
  theme,
  onClose,
  isMobile,
  location,
}) {
  const navigate = useNavigate();

  const getFirstLetter = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const storedAdminProfile = role === "admin" ? getStoredAdminProfile() : null;
  const sidebarUser =
    role === "admin" && storedAdminProfile
      ? {
          ...user,
          ...storedAdminProfile,
          email: user?.email || storedAdminProfile.email,
          role: user?.role || storedAdminProfile.role || role,
        }
      : user;

  const profileImage = getMediaUrl(
    sidebarUser?.imageUrl || sidebarUser?.profileImage || ""
  );
  const profileLabel =
    sidebarUser?.specialization ||
    sidebarUser?.department ||
    sidebarUser?.designation ||
    sidebarUser?.role ||
    title;

  const canEditProfile = role === "doctor" || role === "admin";

  const goToProfile = () => {
    if (!canEditProfile) return;

    const target = getDashboardProfileTarget(role);
    onClose?.();
    navigate(target);

    window.setTimeout(() => {
      document.getElementById("profile")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleMenuClick = () => {
    onClose?.();
  };

  return (
    <div
      className={cx(
        "relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#09111e] text-white shadow-2xl",
        theme.glow
      )}
    >
      <div className="pointer-events-none absolute -top-12 left-1/4 right-1/4 h-16 w-1/2 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-xl" />

      <div className="border-b border-white/[0.06] p-5">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="group flex items-center gap-3" onClick={onClose}>
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
                Medi
                <span className="font-serif font-normal italic text-teal-400">
                  Link
                </span>
              </p>
              <p className="max-w-[150px] truncate text-[11px] font-semibold tracking-wide text-slate-400">
                {profileLabel}
              </p>
            </div>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={goToProfile}
          disabled={!canEditProfile}
          title={canEditProfile ? "Click to edit profile" : undefined}
          className={cx(
            "mt-5 w-full rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 text-left backdrop-blur-sm transition",
            canEditProfile
              ? `cursor-pointer hover:shadow-lg ${theme.profileHover}`
              : "cursor-default"
          )}
        >
          <div className="flex items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={sidebarUser?.name || "Profile"}
                className="h-10 w-10 shrink-0 rounded-xl border border-white/10 object-cover shadow-inner"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-bold text-white shadow-inner">
                {getFirstLetter(sidebarUser?.name)}
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-xs font-black text-white">
                {getProfileDisplayName(role, sidebarUser)}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                {sidebarUser?.email || "No email profile"}
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
              {sidebarUser?.role || role}
            </span>
          </div>

          {canEditProfile && (
            <p className={cx("mt-2 text-[10px] font-bold", theme.profileHint)}>
              Click this card to edit profile
            </p>
          )}
        </button>
      </div>

      <nav className="medilink-sidebar-scroll custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isMenuItemActive(item, location);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleMenuClick}
              className={cx(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-sm font-bold transition-all",
                active
                  ? "border-white/[0.08] bg-white/[0.06] text-white"
                  : "border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeGlowBar"
                  className={cx(
                    "absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-gradient-to-b",
                    theme.accent
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                size={17}
                strokeWidth={active ? 2.5 : 2}
                className={cx(
                  "transition-colors duration-200",
                  active
                    ? "text-teal-400"
                    : "text-slate-500 group-hover:text-slate-300"
                )}
              />

              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] bg-slate-950/40 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Core Engine Linked
          </p>
          <span className="font-mono text-[10px] font-medium text-slate-600">
            v2.4.0
          </span>
        </div>
      </div>
    </div>
  );
}

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
  }, [location.pathname, location.hash]);

  const sidebar = (
    <Sidebar
      title={title}
      user={user}
      role={role}
      navItems={navItems}
      theme={theme}
      onClose={() => setMobileOpen(false)}
      isMobile={mobileOpen}
      location={location}
    />
  );

  return (
    <>
      <style>{SIDEBAR_SCROLLBAR_STYLE}</style>
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
                    theme.badge
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

              {role !== "admin" && (
                <Link
                  to="/"
                  className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 sm:inline-flex"
                >
                  <Home size={16} />
                  Home
                </Link>
              )}

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
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
    </>
  );
}