"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare, X, Loader2 } from "lucide-react";
import Button from "./Button";

/**
 * Reusable accessible Input Modal
 * Replaces native window.prompt() dialogs with application UI.
 */
export default function InputModal({
  open,
  onClose,
  onSubmit,
  title = "Input Required",
  description = "Please enter the required information below.",
  label = "Reason / Notes",
  placeholder = "Enter reason...",
  defaultValue = "",
  submitText = "Submit",
  cancelText = "Cancel",
  inputType = "textarea", // "textarea" | "text"
  required = true,
  isLoading = false,
}) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setError("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey || inputType === "text") && !isLoading) {
        handleFormSubmit(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isLoading, value]);

  if (!open) return null;

  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (required && !trimmed) {
      setError(`${label} is required.`);
      inputRef.current?.focus();
      return;
    }
    setError("");
    await onSubmit(trimmed);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="input-modal-title"
      aria-describedby="input-modal-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in font-sans"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-md bg-white border border-[#E8DCC8] rounded-2xl shadow-2xl p-6 sm:p-7 text-[#2F2B27] animate-slide-up z-10">
        <div className="flex items-start justify-between gap-3 border-b border-[#E8DCC8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3E0] text-[#8C6D1F] border border-[#E8DCC8] shadow-sm shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2
                id="input-modal-title"
                className="text-base font-bold text-[#2F2B27]"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="input-modal-description"
                  className="text-xs text-[#7C7267] mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7C7267] hover:bg-[#FAF6F0] hover:text-[#2F2B27] transition"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2F2B27] mb-1.5">
              {label} {required && <span className="text-red-500">*</span>}
            </label>

            {inputType === "textarea" ? (
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                placeholder={placeholder}
                rows={4}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#2F2B27] placeholder-[#A89F91] transition bg-[#FAF6F0]/40 focus:bg-white focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#E8DCC8] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                }`}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                placeholder={placeholder}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#2F2B27] placeholder-[#A89F91] transition bg-[#FAF6F0]/40 focus:bg-white focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#E8DCC8] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                }`}
              />
            )}

            {error && (
              <p className="mt-1.5 text-xs text-red-600 font-medium animate-fade-in">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8DCC8]/60">
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
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </span>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
