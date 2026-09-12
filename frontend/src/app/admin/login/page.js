"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if admin is already logged in
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        if (data?.success && data?.data?.user?.userType === "admin") {
          window.location.href = "/admin";
        } else {
          localStorage.removeItem("currentUser");
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem("currentUser");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            role: "admin",
            email: json?.data?.user?.email || trimmedEmail,
            name: json?.data?.user?.name || "Super Admin",
          })
        );
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome to Tharani Textiles Admin Portal");
        window.location.href = "/admin";
      } else {
        const errorMsg = json.message || json.error || "Invalid admin credentials";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Admin login network error:", err);
      const errorMsg = "Unable to connect to login server. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#E8DCC8] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5A1F2F] shadow-md mb-2">
            <ShieldCheck size={36} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#5A1F2F] tracking-tight">Tharani Textiles</h1>
          <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
            Administrator Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2F2B27] uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7267]" />
              <input
                type="email"
                required
                disabled={submitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tharanitextiles.com"
                className="w-full bg-[#FAF6F0] border border-[#E8DCC8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2F2B27] placeholder-[#9E9385] focus:outline-none focus:border-[#5A1F2F] focus:ring-1 focus:ring-[#5A1F2F] transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2F2B27] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7267]" />
              <input
                type="password"
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#FAF6F0] border border-[#E8DCC8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2F2B27] placeholder-[#9E9385] focus:outline-none focus:border-[#5A1F2F] focus:ring-1 focus:ring-[#5A1F2F] transition disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 bg-[#5A1F2F] hover:bg-[#471825] text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#7C7267]">
          Protected Administrative Session • Tharani Textiles
        </div>
      </div>
    </main>
  );
}
