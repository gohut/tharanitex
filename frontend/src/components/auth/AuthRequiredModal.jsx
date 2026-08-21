"use client";

import { useEffect } from "react";
import { LockKeyhole, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthRequiredModal({
  open,
  onClose,
  message = "Please sign in to continue.",
}) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSignIn = () => {
    const returnTo =
      window.location.pathname +
      window.location.search;

    onClose();

    router.push(
      `/login?returnTo=${encodeURIComponent(
        returnTo
      )}`
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-[#E8DCC8] bg-[#FFFDF9] p-7 shadow-2xl sm:p-9"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-[#F3E8D8] hover:text-[#5A1F2F]"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#5A1F2F]/10">
          <LockKeyhole
            size={28}
            className="text-[#5A1F2F]"
            strokeWidth={1.8}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B58A45]">
            Tharani Textiles
          </p>

          <h2
            id="auth-required-title"
            className="mt-3 font-cormorant text-3xl font-semibold text-[#5A1F2F]"
          >
            Sign In Required
          </h2>

          <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-[#6F665B]"
          >
            {message}
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            className="mt-7 w-full rounded-xl bg-[#5A1F2F] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#471825] active:scale-[0.99]"
          >
            Sign In to Continue
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-xl border border-[#E8DCC8] bg-transparent px-5 py-3.5 text-sm font-semibold text-[#5A1F2F] transition hover:bg-[#F8F2E8]"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}