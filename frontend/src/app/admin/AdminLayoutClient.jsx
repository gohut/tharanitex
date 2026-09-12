"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Home,
  Package,
  ShoppingCart,
  Users,
  Star,
  FileText,
  Shield,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

const navLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Reviews", path: "/admin/reviews", icon: Star },
  { name: "Content", path: "/admin/content", icon: FileText },
  { name: "Users & Roles", path: "/admin/users", icon: Shield },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayoutClient({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [liveUser, setLiveUser] = useState(user || null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!liveUser) {
      fetch("/api/auth/session")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.success && json?.data?.user) {
            setLiveUser(json.data.user);
          }
        })
        .catch(() => {});
    }
  }, [liveUser]);

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }

    if (path === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Logout redirect still happens if the request fails.
    }

    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("auth-change"));

    setShowLogoutModal(false);
    setIsLoggingOut(false);
    router.replace("/admin/login");
    router.refresh();
  };

  const activeUser = liveUser || user;
  const initials = (activeUser?.name || activeUser?.fullName || "SA")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SA";
  const displayName = activeUser?.name || activeUser?.fullName || "Admin";
  const displayEmail = activeUser?.email || "admin@tharanitex.com";
  const displayRole = activeUser?.roleName || activeUser?.role || "Staff";

  return (
    <div className="flex h-screen bg-[#FAF6F0] overflow-hidden font-sans">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#5A1F2F] border-r border-[#471825] shrink-0 text-white">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#471825]">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center shadow-sm">
            <span className="text-[#5A1F2F] font-bold text-xs tracking-wider">TT</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight font-sans">Tharani Textiles</p>
            <p className="text-[#D4AF37] text-[10px] font-semibold tracking-wider uppercase font-sans">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group font-sans ${
                isActive(path)
                  ? "bg-[#D4AF37] text-[#2F2B27] shadow-sm font-bold"
                  : "text-[#FAF6F0]/80 hover:bg-[#471825] hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={
                  isActive(path)
                    ? "text-[#5A1F2F]"
                    : "text-[#FAF6F0]/70 group-hover:text-[#D4AF37]"
                }
              />
              <span>{name}</span>
              {isActive(path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5A1F2F]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        <div className="px-3 py-4 border-t border-[#471825]">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#471825]/40 hover:bg-[#471825] border border-[#D4AF37]/20 cursor-pointer group text-left transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#2F2B27] font-bold text-xs shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate font-sans">{displayName}</p>
              <p className="text-[#D4AF37] text-[11px] font-medium truncate font-sans">{displayRole}</p>
            </div>
            <LogOut
              size={15}
              className="text-[#FAF6F0]/70 group-hover:text-[#D4AF37] transition-colors shrink-0"
            />
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#5A1F2F] border-r border-[#471825] flex flex-col md:hidden transition-transform duration-300 text-white ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#471825]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center shadow-sm">
              <span className="text-[#5A1F2F] font-bold text-xs">TT</span>
            </div>
            <p className="text-white font-bold text-sm">Tharani Textiles</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-[#E8DCC8] hover:bg-[#471825] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(path)
                  ? "bg-[#471825] text-[#D4AF37] font-semibold"
                  : "text-[#E8DCC8] hover:bg-[#471825]/60 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={isActive(path) ? "text-[#D4AF37]" : "text-[#E8DCC8]"}
              />
              <span>{name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Right Side (Navbar + Content) ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#FAF6F0]">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E8DCC8] flex items-center gap-4 px-4 md:px-6 shrink-0 shadow-xs">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#2F2B27] hover:bg-[#FAF6F0]"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative hidden sm:flex items-center flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 text-[#7C7267]" />
            <input
              type="text"
              placeholder="Search admin portal…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-[#FAF6F0] text-[#2F2B27] placeholder-[#8A8175] text-sm border border-[#E8DCC8] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#5A1F2F] focus:ring-1 focus:ring-[#5A1F2F] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-[#7C7267] hover:bg-[#FAF6F0] hover:text-[#5A1F2F] transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#FAF6F0] transition-colors border border-transparent hover:border-[#E8DCC8]"
              >
                <div className="w-8 h-8 rounded-full bg-[#5A1F2F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs shadow-xs font-sans">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[#2F2B27] text-xs font-bold leading-tight font-sans">
                    {displayName}
                  </span>
                  <span className="text-[#8C6D1F] text-[10px] font-semibold leading-tight uppercase font-sans">
                    {displayRole}
                  </span>
                </div>
                <ChevronDown size={13} className="text-[#7C7267]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E8DCC8] rounded-2xl shadow-xl animate-fade-in overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#E8DCC8] bg-[#FDFBF7]">
                    <p className="text-[#2F2B27] text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-[#7C7267] text-xs truncate mt-0.5">{displayEmail}</p>
                  </div>

                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[#2F2B27] hover:bg-[#FAF6F0] hover:text-[#5A1F2F] text-sm font-medium transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={15} />
                    Settings
                  </Link>

                  <hr className="border-[#E8DCC8]" />

                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm font-medium text-left transition cursor-pointer"
                    onClick={() => {
                      setProfileOpen(false);
                      setShowLogoutModal(true);
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#FAF6F0] p-4 md:p-6 text-[#2F2B27]">
          {children}
        </main>
      </div>

      {/* ── Confirm Logout Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-[#2F2B27] font-bold text-base">Confirm Sign Out</h3>
                <p className="text-[#7C7267] text-xs">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-[#5C544B] text-sm leading-relaxed">
              You will need to sign in again with your credentials to access the admin portal.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#7C7267] hover:bg-[#FAF6F0] border border-[#E8DCC8] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#C5221F] hover:bg-[#A51B18] transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}