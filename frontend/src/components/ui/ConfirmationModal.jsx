"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, Info, X, Loader2 } from "lucide-react";
import Button from "./Button";

/**
 * Reusable accessible Confirmation Modal
 * Replaces native window.confirm() dialogs with application UI.
 */
export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "primary" | "warning"
  isLoading = false,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isLoading]);

  if (!open) return null;

  const getIcon = () => {
    if (variant === "danger") {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200 shadow-sm shrink-0">
          <Trash2 size={22} />
        </div>
      );
    }
    if (variant === "warning") {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm shrink-0">
          <AlertTriangle size={22} />
        </div>
      );
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF3E0] text-[#8C6D1F] border border-[#E8DCC8] shadow-sm shrink-0">
        <Info size={22} />
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in font-sans"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white border border-[#E8DCC8] rounded-2xl shadow-2xl p-6 sm:p-7 text-[#2F2B27] animate-slide-up z-10"
      >
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h2
              id="confirmation-modal-title"
              className="text-lg font-bold text-[#2F2B27] leading-tight"
            >
              {title}
            </h2>
            <p
              id="confirmation-modal-description"
              className="mt-2 text-sm leading-relaxed text-[#7C7267]"
            >
              {message}
            </p>
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#7C7267] hover:bg-[#FAF6F0] hover:text-[#2F2B27] transition"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-end gap-3 pt-4 border-t border-[#E8DCC8]/60">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
