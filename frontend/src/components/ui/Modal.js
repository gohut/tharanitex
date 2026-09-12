"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white border border-[#E8DCC8] rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col text-[#2F2B27]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCC8] bg-[#FDFBF7] shrink-0 rounded-t-2xl">
          <h2 className="text-[#2F2B27] font-bold text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#7C7267] hover:bg-[#F4ECE1] hover:text-[#2F2B27] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
