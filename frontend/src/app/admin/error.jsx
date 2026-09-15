"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("Admin Portal Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-[#FAF6F0] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white border border-[#E8DCC8] rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5A1F2F]/10 text-[#5A1F2F] border border-[#5A1F2F]/20 shadow-sm">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#2F2B27]">
            Admin Module Error
          </h1>
          <p className="text-sm text-[#7C7267] max-w-md mx-auto leading-relaxed">
            An unexpected error occurred while loading this administrative section.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#2F2B27] text-sm font-bold shadow hover:bg-[#c49f2e] transition active:scale-95"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DCC8] text-[#2F2B27] text-sm font-semibold hover:bg-[#F4ECE1] transition active:scale-95"
          >
            <LayoutDashboard size={15} />
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
