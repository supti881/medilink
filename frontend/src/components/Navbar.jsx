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
  const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    setUser(getStoredUser());

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? "border-teal-500/10 bg-[#0B2524]/75 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(3,7,18,0.4)]" 
          : "border-teal-500/10 bg-gradient-to-b from-[#0B2524] to-[#061817]"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo Group */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 text-slate-950 shadow-md transition duration-300 group-hover:scale-105 group-hover:rotate-90">
            <Plus size={18} strokeWidth={3} />
          </div>
          <p className="text-2xl font-bold tracking-tight text-white transition duration-300">
            Medi<span className="text-teal-400 font-serif font-normal tracking-wide">Link</span>
          </p>
        </Link>

        {/* Center Pillar Nav Links */}
        <div className="hidden items-center gap-1 rounded-full border border-teal-500/10 bg-teal-950/20 backdrop-blur-md px-2 py-1.5 lg:flex">
          {navItems.map((item) =>
            item.path.includes("#") ? (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-full px-5 py-2 text-sm font-semibold text-teal-100/80 hover:text-white hover:bg-teal-900/30 transition-all duration-300"
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                      : "text-teal-100/80 hover:text-white hover:bg-teal-900/30"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}

          {/* Contextual Sub-Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 outline-none ${
                isDropdownOpen
                  ? "bg-teal-900/40 text-white"
                  : "text-teal-100/80 hover:text-white hover:bg-teal-900/30"
              }`}
            >
              Others
              <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-teal-500/10 bg-[#0B2524] p-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/20 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {otherItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-2.5 text-sm font-medium text-teal-100/70 transition-all duration-200 hover:bg-teal-950/60 hover:text-teal-400"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Authentication Actions Cluster */}
        <div className="hidden items-center gap-4 lg:flex">
          {user && user.email ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full border border-teal-500/10 bg-teal-950/40 p-1 pr-3.5 shadow-inner hover:border-teal-500/30 transition duration-300 outline-none max-w-[240px]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 font-bold text-slate-950 text-xs shadow-sm">
                  {getFirstLetter(user.name)}
                </div>
                <span className="truncate text-xs font-semibold text-teal-200">
                  {user.email}
                </span>
                <ChevronDown size={14} className={`text-teal-400 transition-transform duration-300 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-teal-500/10 bg-[#0B2524] p-4 shadow-2xl focus:outline-none z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="border-b border-teal-950 pb-3 mb-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-teal-500">Account Profile</p>
                    <p className="mt-1 font-bold text-white truncate">{user.name || "User"}</p>
                    <p className="text-xs text-teal-200/60 truncate">{user.email}</p>
                  </div>
                  
                  <div className="space-y-2 text-xs text-teal-100/70">
                    {user.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-teal-500">Phone:</span>
                        <span className="truncate max-w-[140px] text-white">{user.phone}</span>
                      </div>
                    )}
                    {user.role && (
                      <div className="flex justify-between items-center">
                        <span className="text-teal-500">Role:</span>
                        <span className="inline-flex items-center rounded-md bg-teal-950 border border-teal-900/60 px-2 py-0.5 text-[10px] text-teal-400 capitalize">{user.role}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-950 border border-red-950/40 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all duration-200"
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
                className="text-sm font-semibold text-teal-200 transition-colors duration-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-teal-400/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Sidebar Trigger Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-teal-500/10 bg-teal-950/20 text-teal-200 lg:hidden hover:text-white transition-colors duration-200"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Context Overlay Menu Container */}
      {isOpen && (
        <div className="border-t border-teal-950 bg-[#0B2524] px-4 py-5 lg:hidden max-h-[85vh] overflow-y-auto shadow-inner">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="rounded-xl bg-teal-950/30 border border-teal-900/20 px-4 py-3 text-sm font-medium text-teal-100"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 border-t border-teal-950/60" />

            {otherItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                onClick={closeMenu}
                className="rounded-xl bg-teal-950/10 border border-transparent px-5 py-2 text-sm text-teal-200/50"
              >
                {subItem.label}
              </Link>
            ))}

            {user && user.email ? (
              <div className="mt-2 border-t border-teal-950 pt-4" ref={userMobileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMobileUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 w-full rounded-xl bg-teal-950/40 p-2.5 text-left outline-none border border-teal-900/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 font-bold text-slate-950 text-sm shadow-sm">
                    {getFirstLetter(user.name)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    <p className="text-[10px] text-teal-400/60 truncate">Tap to access parameters</p>
                  </div>
                  <ChevronDown size={14} className={`text-teal-400 transition-transform duration-300 ${isMobileUserDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isMobileUserDropdownOpen && (
                  <div className="mt-2 rounded-xl border border-teal-900/60 p-4 space-y-4 bg-teal-950/20 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                      <div>
                        <span className="text-teal-500 block text-[10px] uppercase font-bold tracking-wider">Name</span>
                        <span className="text-white font-medium truncate block mt-0.5">{user.name || "User"}</span>
                      </div>
                      {user.role && (
                        <div>
                          <span className="text-teal-500 block text-[10px] uppercase font-bold tracking-wider">Role</span>
                          <span className="inline-flex items-center rounded-md bg-teal-950 border border-teal-900/60 px-2 py-0.5 text-[10px] text-teal-400 capitalize mt-1">{user.role}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="col-span-2 border-t border-teal-950/60 pt-2.5 mt-1">
                          <span className="text-teal-500 text-[10px] uppercase font-bold block tracking-wider">Phone</span>
                          <span className="text-teal-100 font-medium mt-0.5 block">{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-950 border border-red-950/40 py-2.5 text-center text-sm font-semibold text-red-400 active:bg-red-950/60 transition-colors duration-200"
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
                  className="rounded-xl border border-teal-500/10 bg-teal-950/20 px-4 py-3 text-center text-sm font-semibold  transition-colors active:bg-teal-950/40"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-4 py-3 text-center text-sm font-bold text-slate-950 transition-transform active:scale-[0.98]"
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