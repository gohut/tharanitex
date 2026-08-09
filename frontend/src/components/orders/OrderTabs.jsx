"use client";

export default function OrderTabs({
  tabs,
  activeTab,
  onChange,
}) {
  return (
    <div className="border-b border-[#D8CCB4]">
      <div className="flex gap-x-7 overflow-x-auto whitespace-nowrap pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-10 sm:flex-wrap sm:whitespace-normal [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`shrink-0 border-b-2 pb-3 text-[14px] font-medium capitalize transition sm:text-[15px] ${
                active
                  ? "border-[#E0A22E] text-[#E0A22E]"
                  : "border-transparent text-[#2F2A25] hover:text-[#E0A22E]"
              }`}
            >
              {tab.toLowerCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
