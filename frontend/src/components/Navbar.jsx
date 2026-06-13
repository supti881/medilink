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
  const [isMobileUserDropdownOpen, setIsMobileUserDropdownOpen] =
    useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = useMemo(() => {
    const dashboardPath = getDashboardPath(user?.role);

    return [...baseNavItems, { label: "Dashboard", path: dashboardPath }];
  }, [user]);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const userMobileDropdownRef = useRef(null);

  const closeMenu = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileUserDropdownOpen(false);
  };

  useEffect(() => {
    setUser(getStoredUser());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      localStorage.removeItem("medilink_token");
    }

    localStorage.removeItem("medilink_user");
    setUser(null);
    closeMenu();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

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
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        isScrolled
          ? "border-emerald-200/70 bg-white/90 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
          : "border-emerald-100/80 bg-white/85 shadow-[0_10px_35px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow-md shadow-emerald-500/20 transition duration-300 group-hover:scale-105 group-hover:rotate-90">
            <Plus size={18} strokeWidth={3} />
          </div>

          <p className="text-2xl font-black tracking-tight text-slate-950 transition duration-300">
            Medi
            <span className="font-serif font-normal italic tracking-wide text-emerald-500">
              Link
            </span>
          </p>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 px-2 py-1.5 shadow-inner backdrop-blur-md lg:flex">
          {navItems.map((item) =>
            item.path.includes("#") ? (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-full px-5 py-2 text-sm font-extrabold text-slate-700 transition-all duration-300 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-sm font-extrabold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-700 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1 rounded-full px-5 py-2 text-sm font-extrabold outline-none transition-all duration-300 ${
                isDropdownOpen
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-700 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
              }`}
            >
              Others
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-3 w-60 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                {otherItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {user && user.email ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="flex max-w-[260px] items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3.5 shadow-sm outline-none transition duration-300 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-xs font-black text-slate-950 shadow-sm">
                  {getFirstLetter(user.name)}
                </div>

                <span className="truncate text-xs font-black text-slate-800">
                  {user.email}
                </span>

                <ChevronDown
                  size={14}
                  className={`text-emerald-600 transition-transform duration-300 ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-2xl shadow-slate-950/10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-3 border-b border-slate-100 pb-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600">
                      Account Profile
                    </p>
                    <p className="mt-1 truncate font-black text-slate-950">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    {user.phone && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-500">Phone:</span>
                        <span className="max-w-[140px] truncate font-black text-slate-800">
                          {user.phone}
                        </span>
                      </div>
                    )}

                    {user.role && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-500">Role:</span>
                        <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black capitalize text-emerald-700">
                          {user.role}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-black text-red-700 transition-all duration-200 hover:bg-red-100 hover:text-red-800"
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
                className="text-sm font-black text-slate-700 transition-colors duration-300 hover:text-emerald-700"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-emerald-500/20 transition-all duration-300 hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition-colors duration-200 hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-5 shadow-inner lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition-colors active:bg-emerald-50"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 border-t border-slate-200" />

            {otherItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                onClick={closeMenu}
                className="rounded-xl border border-transparent px-5 py-2 text-sm font-bold text-slate-500 transition-colors active:bg-slate-50"
              >
                {subItem.label}
              </Link>
            ))}

            {user && user.email ? (
              <div
                className="mt-2 border-t border-slate-200 pt-4"
                ref={userMobileDropdownRef}
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsMobileUserDropdownOpen((prev) => !prev)
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left outline-none"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-black text-slate-950 shadow-sm">
                    {getFirstLetter(user.name)}
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-xs font-black text-slate-950">
                      {user.email}
                    </p>
                    <p className="truncate text-[10px] font-bold text-emerald-600">
                      Tap to access profile
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-emerald-600 transition-transform duration-300 ${
                      isMobileUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isMobileUserDropdownOpen && (
                  <div className="mt-2 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600">
                          Name
                        </span>
                        <span className="mt-0.5 block truncate font-black text-slate-900">
                          {user.name || "User"}
                        </span>
                      </div>

                      {user.role && (
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600">
                            Role
                          </span>
                          <span className="mt-1 inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black capitalize text-emerald-700">
                            {user.role}
                          </span>
                        </div>
                      )}

                      {user.phone && (
                        <div className="col-span-2 mt-1 border-t border-slate-100 pt-2.5">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600">
                            Phone
                          </span>
                          <span className="mt-0.5 block font-bold text-slate-800">
                            {user.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-center text-sm font-black text-red-700 transition-colors duration-200 active:bg-red-100"
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
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 transition-colors active:bg-slate-50"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-center text-sm font-black text-slate-950 transition-transform active:scale-[0.98]"
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