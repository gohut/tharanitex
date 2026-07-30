"use client";

export default function OrderTabs({
  tabs,
  activeTab,
  onChange,
}) {
  return (
    <div className="border-b border-[#D8CCB4]">
      <div className="flex flex-wrap gap-x-10 gap-y-3">
        {tabs.map((tab) => {
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`border-b-2 pb-3 text-[15px] font-medium capitalize transition ${
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
