"use client";

import { useState } from "react";
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

  return (
    <div className="flex h-screen bg-green-950 overflow-hidden">

      {/* KEEP THE REST OF YOUR EXISTING ADMIN UI HERE */}

      {/* IMPORTANT:
          Replace your existing logout handler with handleLogout.
      */}

      {children}
    </div>
  );
}