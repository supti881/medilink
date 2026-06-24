import { Link, NavLink } from "react-router";
import { Menu, Plus, X, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { authApi } from "../services/api";
import { getDashboardPath, getStoredUser } from "../utils/auth";

const baseNavItems = [
  { label: "Home", path: "/" },
  { label: "Doctors", path: "/doctors" },
  { label: "Services", path: "/service" },
  { label: "About", path: "/about" },
];

const otherItems = [
  { label: "Verify Prescription", path: "/verify-prescription" },
  { label: "Support Ticket", path: "/support-ticket" },
  { label: "Mock Payment", path: "/mock-payment" },
  { label: "Replacement Request", path: "/replacement-request" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileUserDropdownOpen, setIsMobileUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const userMobileDropdownRef = useRef(null);

  const navItems = useMemo(() => {
    const dashboardPath = user?.role ? getDashboardPath(user.role) : "/login";
    return [...baseNavItems, { label: "Dashboard", path: dashboardPath }];
  }, [user]);

  const closeMenu = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileUserDropdownOpen(false);
  };

  useEffect(() => {
    setUser(getStoredUser());

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
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

  const getFirstLetter = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-white/10 bg-[#061817]/95 shadow-[0_14px_34px_rgba(2,6,23,0.18)] backdrop-blur-xl"
          : "border-white/10 bg-[#061817]"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#13c8b4] text-slate-950 shadow-[0_10px_22px_rgba(19,200,180,0.20)] transition group-hover:scale-105">
            <Plus size={16} strokeWidth={3} />
          </span>

          <span className="text-[1rem] font-extrabold leading-none tracking-[-0.02em] text-white">
            Medi
            <span className="font-serif font-semibold italic text-teal-300">
              Link
            </span>
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-1.5 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                color: isActive ? "#061817" : "rgba(255, 255, 255, 0.78)",
              })}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold transition ${
                  isActive
                    ? "bg-[#13c8b4] shadow-[0_8px_18px_rgba(19,200,180,0.18)]"
                    : "hover:bg-white/[0.06] hover:!text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((previous) => !previous)}
              style={{
                color: isDropdownOpen ? "#ffffff" : "rgba(255, 255, 255, 0.84)",
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold outline-none transition ${
                isDropdownOpen
                  ? "bg-white/[0.06]"
                  : "hover:bg-white/[0.06] hover:!text-white"
              }`}
            >
              Others
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-3 w-60 rounded-2xl border border-white/10 bg-[#08211f] p-2 shadow-2xl ring-1 ring-black/20">
                {otherItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={closeMenu}
                    className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user && user.email ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen((previous) => !previous)}
                className="flex max-w-[250px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 pr-3 text-left outline-none transition hover:border-teal-300/35 hover:bg-white/[0.06]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#13c8b4] text-xs font-bold text-slate-950">
                  {getFirstLetter(user.name)}
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[0.75rem] font-bold text-white">
                    {user.email}
                  </span>
                </span>

                <ChevronDown
                  size={14}
                  className={`shrink-0 text-teal-300 transition-transform ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-white/10 bg-[#08211f] p-4 text-white shadow-2xl">
                  <div className="border-b border-white/10 pb-4">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-teal-300">
                      Account Profile
                    </p>
                    <p className="mt-2 truncate text-sm font-bold text-white">
                      {user.name || "User"}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to={getDashboardPath(user.role)}
                    onClick={closeMenu}
                    className="mt-3 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Go to dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition hover:border-teal-300/35 hover:bg-white/[0.08]"
            >
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#061817] px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                style={({ isActive }) => ({
                  color: isActive ? "#061817" : "rgba(255, 255, 255, 0.82)",
                })}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#13c8b4]"
                      : "hover:bg-white/[0.07] hover:!text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div
              className="rounded-2xl border border-white/10 p-2"
              ref={userMobileDropdownRef}
            >
              <button
                type="button"
                onClick={() =>
                  setIsMobileUserDropdownOpen((previous) => !previous)
                }
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-white/82"
              >
                Others
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isMobileUserDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMobileUserDropdownOpen && (
                <div className="mt-1 grid gap-1">
                  {otherItems.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      onClick={closeMenu}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user && user.email ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex items-center gap-2 rounded-xl border border-red-400/20 px-4 py-3 text-sm font-semibold text-red-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-2 rounded-xl bg-[#13c8b4] px-4 py-3 text-center text-sm font-bold text-slate-950"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;