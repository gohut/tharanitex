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
  Truck,
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
  { name: "Shipping", path: "/admin/shipping", icon: Truck },
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
  const profileRef = useRef(null);

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

    router.replace("/admin/login");
    router.refresh();
  };

  const initials = (user?.name || user?.fullName || "SA")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SA";
  const displayName = user?.name || user?.fullName || "Super Admin";
  const displayEmail = user?.email || "admin@tharanitextiles.com";
  const displayRole = user?.roleName || user?.role || "Super Admin";

  return (
    <div className="flex h-screen bg-green-950 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-green-900 border-r border-green-800 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-green-800">
          <div className="w-8 h-8 rounded-lg bg-gold-600 flex items-center justify-center shadow-gold-sm">
            <span className="text-green-950 font-bold text-xs tracking-wider">TT</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Tharani Textiles</p>
            <p className="text-gold-400 text-[10px] font-medium tracking-wider uppercase">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive(path)
                  ? "bg-green-800 text-gold-400 shadow-green-sm"
                  : "text-green-300 hover:bg-green-800 hover:text-gold-300"
              }`}
            >
              <Icon
                size={18}
                className={
                  isActive(path)
                    ? "text-gold-400"
                    : "text-green-400 group-hover:text-gold-300"
                }
              />
              <span>{name}</span>
              {isActive(path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500" />
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        <div className="px-3 py-4 border-t border-green-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800 cursor-pointer group text-left transition"
          >
            <div className="w-8 h-8 rounded-full bg-gold-600 flex items-center justify-center text-green-950 font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{displayName}</p>
              <p className="text-green-400 text-xs truncate">{displayRole}</p>
            </div>
            <LogOut
              size={14}
              className="text-green-500 group-hover:text-gold-400 transition-colors"
            />
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-green-900 border-r border-green-800 flex flex-col md:hidden transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-600 flex items-center justify-center shadow-gold-sm">
              <span className="text-green-950 font-bold text-xs">TT</span>
            </div>
            <p className="text-white font-bold text-sm">Tharani Textiles</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-green-400 hover:bg-green-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(path)
                  ? "bg-green-800 text-gold-400"
                  : "text-green-300 hover:bg-green-800 hover:text-gold-300"
              }`}
            >
              <Icon
                size={18}
                className={isActive(path) ? "text-gold-400" : "text-green-400"}
              />
              <span>{name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Right Side (Navbar + Content) ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-green-900 border-b border-green-800 flex items-center gap-4 px-4 md:px-6 shrink-0 shadow-md">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-green-400 hover:bg-green-800 hover:text-white"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative hidden sm:flex items-center flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 text-green-500" />
            <input
              type="text"
              placeholder="Search admin portal…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-green-800 text-white placeholder-green-500 text-sm border border-green-700 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-green-400 hover:bg-green-800 hover:text-gold-400 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gold-600 flex items-center justify-center text-green-950 font-bold text-xs">
                  {initials}
                </div>
                <span className="hidden sm:block text-white text-xs font-medium">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown size={13} className="text-green-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-green-800 border border-green-700 rounded-xl shadow-card-hover animate-fade-in overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-green-700">
                    <p className="text-white text-sm font-medium">{displayName}</p>
                    <p className="text-green-400 text-xs truncate">{displayEmail}</p>
                  </div>

                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-green-300 hover:bg-green-700 hover:text-white text-sm"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={14} />
                    Settings
                  </Link>

                  <hr className="border-green-700" />

                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-green-700 text-sm text-left"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-green-950 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}