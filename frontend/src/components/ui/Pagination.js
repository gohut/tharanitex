import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 mt-4 font-sans">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-xl border border-[#E8DCC8] bg-white text-[#2F2B27] hover:bg-[#FAF6F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-8 h-8 rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer ${
            p === page
              ? "bg-[#5A1F2F] text-white"
              : "border border-[#E8DCC8] bg-white text-[#2F2B27] hover:bg-[#FAF6F0]"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-xl border border-[#E8DCC8] bg-white text-[#2F2B27] hover:bg-[#FAF6F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
      <span className="text-[#7C7267] text-xs ml-1 font-medium">Page {page} of {totalPages}</span>
    </div>
  );
}
