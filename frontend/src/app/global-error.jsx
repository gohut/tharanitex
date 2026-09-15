"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Root Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBF5EA] flex items-center justify-center p-6 font-sans text-[#2F2B27]">
        <div className="w-full max-w-md bg-white border border-[#E8DCC8] rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5A1F2F]/10 text-[#5A1F2F] border border-[#5A1F2F]/20">
            <span className="text-2xl font-bold">!</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#2F2B27]">
              Application Error
            </h1>
            <p className="text-sm text-[#7C7267] leading-relaxed">
              An unexpected system error occurred. Please reload the application.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#2F2B27] text-sm font-bold shadow hover:bg-[#c49f2e] transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
