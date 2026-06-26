import { Link, NavLink } from "react-router";
import { Menu, Plus, X, ChevronDown, LogOut } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { authApi } from "../services/api";
import { getDashboardPath, getStoredUser } from "../utils/auth";

const baseNavItems = [
  { label: "Home", path: "/" },
  { label: "Doctors", path: "/doctors" },
  { label: "Services", path: "/service" },
  { label: "About", path: "/about" },
];


function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileUserDropdownOpen, setIsMobileUserDropdownOpen] =
    useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const userDropdownRef = useRef(null);
  const userMobileDropdownRef = useRef(null);

  const navItems = useMemo(() => {
    const dashboardPath = user?.role ? getDashboardPath(user.role) : "/login";
    return [...baseNavItems, { label: "Dashboard", path: dashboardPath }];
  }, [user]);

  const closeMenu = () => {
    setIsOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileUserDropdownOpen(false);
  };

  useEffect(() => {
    setUser(getStoredUser());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }

      if (
        userMobileDropdownRef.current &&
        !userMobileDropdownRef.current.contains(event.target)
      ) {
        setIsMobileUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      localStorage.removeItem("medilink_token");
    }

    localStorage.removeItem("medilink_token");
    localStorage.removeItem("medilink_user");
    setUser(null);
    closeMenu();
    window.location.href = "/";
  };

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        isScrolled
          ? "border-teal-400/15 bg-[#0b2524]/90 shadow-[0_12px_40px_-12px_rgba(3,7,18,0.55)] backdrop-blur-xl"
          : "border-teal-400/10 bg-gradient-to-b from-[#0b2524] to-[#061817]"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-300 to-emerald-400 text-slate-950 shadow-[0_14px_28px_rgba(20,184,166,0.24)] transition duration-300 group-hover:scale-105 group-hover:rotate-90">
            <Plus size={18} strokeWidth={3} />
          </div>

          <p className="text-2xl font-black tracking-tight text-white">
            Medi
            <span className="font-serif font-normal italic tracking-wide text-teal-300">
              Link
            </span>
          </p>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-teal-300/20 bg-[#092f2e]/70 px-2 py-1.5 shadow-inner backdrop-blur-md lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                color: isActive ? "#03151f" : "rgba(255,255,255,0.94)",
              })}
              className={({ isActive }) =>
                `rounded-full px-5 py-2 text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-teal-400 shadow-[0_10px_24px_rgba(45,212,191,0.25)] font-black"
                    : "font-black hover:bg-teal-900/70"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {user && user.email ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() =>
                  setIsUserDropdownOpen((previous) => !previous)
                }
                className="flex max-w-[250px] items-center gap-2.5 rounded-full border border-teal-300/15 bg-teal-950/40 p-1 pr-3.5 shadow-inner outline-none transition duration-300 hover:border-teal-300/35"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-emerald-400 text-xs font-black text-slate-950 shadow-sm">
                  {getFirstLetter(user.name)}
                </div>

                <span
                  style={{ color: "rgba(255,255,255,0.94)" }}
                  className="truncate text-xs font-bold"
                >
                  {user.email}
                </span>

                <ChevronDown
                  size={14}
                  className={`text-teal-300 transition-transform duration-300 ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-2xl border border-teal-300/15 bg-[#0b2524] p-4 text-white shadow-2xl">
                  <div className="mb-3 border-b border-teal-900/70 pb-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                      Account Profile
                    </p>
                    <p className="mt-1 truncate font-black text-white">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs font-semibold text-white/70">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-teal-950 py-2.5 text-sm font-bold text-red-300 transition-all duration-200 hover:bg-red-950/40 hover:text-red-200"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{ color: "rgba(255,255,255,0.94)" }}
                className="text-sm font-black transition-colors duration-300 hover:text-teal-300"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-teal-300 to-emerald-400 px-6 py-2.5 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(45,212,191,0.25)] transition-all duration-300 hover:opacity-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          style={{ color: "rgba(255,255,255,0.94)" }}
          className="grid h-10 w-10 place-items-center rounded-xl border border-teal-300/15 bg-teal-950/30 transition-colors duration-200 hover:text-white lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen && (
        <div className="max-h-[85vh] overflow-y-auto border-t border-teal-900/70 bg-[#0b2524] px-4 py-5 shadow-inner lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                style={({ isActive }) => ({
                  color: isActive ? "#03151f" : "rgba(255,255,255,0.94)",
                })}
                className={({ isActive }) =>
                  `rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "border-teal-300/20 bg-teal-400"
                      : "border-teal-900/30 bg-teal-950/30"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}


            {user && user.email ? (
              <div
                className="mt-2 border-t border-teal-950 pt-4"
                ref={userMobileDropdownRef}
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsMobileUserDropdownOpen((previous) => !previous)
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-teal-900/40 bg-teal-950/40 p-2.5 text-left outline-none"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-400 text-sm font-black text-slate-950 shadow-sm">
                    {getFirstLetter(user.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-white">
                      {user.email}
                    </p>
                    <p className="truncate text-[10px] font-semibold text-teal-300/70">
                      Tap to access account
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-teal-300 transition-transform duration-300 ${
                      isMobileUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isMobileUserDropdownOpen && (
                  <div className="mt-2 rounded-xl border border-teal-900/60 bg-teal-950/20 p-4 text-white">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-950/40 bg-teal-950 py-2.5 text-center text-sm font-bold text-red-300"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  style={{ color: "rgba(255,255,255,0.94)" }}
                  className="rounded-xl border border-teal-300/15 bg-teal-950/25 px-4 py-3 text-center text-sm font-black"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-gradient-to-r from-teal-300 to-emerald-400 px-4 py-3 text-center text-sm font-black text-slate-950"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;