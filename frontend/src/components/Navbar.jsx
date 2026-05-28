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
  { label: "Verify-prescription", path: "/verify-prescription" },
  { label: "Support-ticket", path: "/support-ticket" },
  { label: "Mock-payment", path: "/mock-payment" },
  { label: "Replacement-request", path: "/replacement-request" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileUserDropdownOpen, setIsMobileUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navItems = useMemo(() => {
    const dashboardPath = getDashboardPath(user?.role);
    return [
      ...baseNavItems,
      { label: "Dashboard", path: dashboardPath },
    ];
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

  // Safely grab user data from localStorage on mount
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Handle Logout Action
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (userMobileDropdownRef.current && !userMobileDropdownRef.current.contains(event.target)) {
        setIsMobileUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper helper to safely fetch initials
  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-white shadow-xl shadow-cyan-500/20">
            <Plus size={22} strokeWidth={3} />
          </div>
          <p className="text-3xl font-medium tracking-tight text-slate-950">
            Medi<span className="font-serif ">Link</span>
          </p>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 rounded-full border border-slate-100 bg-white px-2 py-2 shadow-[0_10px_40px_rgba(15,23,42,0.08)] lg:flex">
          {navItems.map((item) =>
            item.path.includes("#") ? (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-full px-7 py-3 text-sm font-black text-slate-500 transition hover:bg-emerald-50 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-7 py-3 text-sm font-black transition ${
                    isActive
                      ? "bg-emerald-100 text-slate-950 shadow-inner"
                      : "text-slate-500 hover:bg-emerald-50 hover:text-slate-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}

          {/* "Others" Dropdown Element */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1 rounded-full px-7 py-3 text-sm font-black transition outline-none ${
                isDropdownOpen
                  ? "bg-emerald-50 text-slate-950"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-slate-950"
              }`}
            >
              Others
              <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-3xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none">
                {otherItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={closeMenu}
                    className="block rounded-2xl px-5 py-3 text-sm font-black text-slate-500 transition hover:bg-emerald-50 hover:text-slate-950"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop CTA / Profile Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          {user && user.email ? (
            /* --- DESKTOP USER LOGGED IN DROPDOWN --- */
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-slate-100 bg-white p-1.5 pr-4 shadow-sm hover:bg-slate-50 transition duration-200 outline-none max-w-[240px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 font-bold text-white shadow-sm">
                  {getFirstLetter(user.name)}
                </div>
                <span className="truncate text-sm font-black text-slate-700">
                  {user.email}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-3xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 focus:outline-none z-50">
                  <div className="border-b border-slate-100 pb-3 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Profile</p>
                    <p className="mt-1 font-black text-slate-900 truncate">{user.name || "User"}</p>
                    <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="space-y-2 text-xs font-bold text-slate-600">
                    {user.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Phone:</span>
                        <span className="truncate max-w-[140px] text-slate-800">{user.phone}</span>
                      </div>
                    )}
                    {user.role && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Role:</span>
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 capitalize">{user.role}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 py-2.5 text-center text-sm font-black text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors duration-200"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* --- DESKTOP LOGGED OUT CTA --- */
            <>
              <Link
                to="/login"
                className="text-sm font-black text-slate-950 transition hover:text-emerald-600"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-900 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700"
              >
                {item.label}
              </Link>
            ))}

            {otherItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                onClick={closeMenu}
                className="rounded-2xl bg-slate-50/50 border border-slate-100/50 px-6 py-3 text-sm font-bold text-slate-500"
              >
                {subItem.label}
              </Link>
            ))}

            {/* Bottom Dynamic Authentication Container */}
            {user && user.email ? (
              /* --- MOBILE USER LOGGED IN ACCORDION --- */
              <div className="mt-2 border-t border-slate-100 pt-3" ref={userMobileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMobileUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 w-full rounded-2xl bg-slate-50 p-3 text-left outline-none"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white shadow-sm">
                    {getFirstLetter(user.name)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-black text-slate-800 truncate">{user.email}</p>
                    <p className="text-xs text-slate-400 truncate">Tap to view information</p>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isMobileUserDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isMobileUserDropdownOpen && (
                  <div className="mt-2 rounded-2xl border border-slate-100 p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-bold text-slate-600">
                      <div>
                        <span className="text-slate-400 font-medium block">Name</span>
                        <span className="text-slate-900 text-sm truncate block">{user.name || "User"}</span>
                      </div>
                      {user.role && (
                        <div>
                          <span className="text-slate-400 font-medium block">Role</span>
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 capitalize mt-0.5">{user.role}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="col-span-2 border-t border-slate-50 pt-2 mt-1">
                          <span className="text-slate-400 font-medium">Phone: </span>
                          <span className="text-slate-800 font-black">{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-100 py-3 text-center text-sm font-black text-rose-600 active:bg-rose-100 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* --- MOBILE LOGGED OUT ACCOUNT ACTIONS --- */
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-950"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-black text-white"
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