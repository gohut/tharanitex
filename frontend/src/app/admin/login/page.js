"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if admin is already logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.user?.userType === "admin") {
          router.replace("/admin");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
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
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            name: json.data?.user?.name || "Super Admin",
            email: json.data?.user?.email || email,
            role: "admin",
          })
        );
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome back to Tharani Textiles Admin Panel!");
        router.replace("/admin");
        router.refresh();
      } else {
        const errorMsg = json.message || json.error || "Invalid admin credentials";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Admin login error:", err);
      const errorMsg = "Unable to connect to login server.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-green-900 border border-green-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-600 shadow-gold-sm mb-2">
            <ShieldCheck size={32} className="text-green-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tharani Textiles</h1>
          <p className="text-xs text-gold-400 font-medium uppercase tracking-wider">
            Administrator Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/60 border border-red-700 text-red-200 text-xs p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-green-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tharanitextiles.com"
                className="w-full bg-green-950/70 border border-green-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-green-600 focus:outline-none focus:border-gold-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-green-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-green-950/70 border border-green-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-green-600 focus:outline-none focus:border-gold-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-gold-600 hover:bg-gold-500 text-green-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-gold-sm disabled:opacity-50"
          >
            <span>{submitting ? "Authenticating..." : "Sign In to Admin Panel"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-green-500">
          Protected Administrative Session • Tharani Textiles
        </div>
      </div>
    </main>
  );
}
