import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = "gold" }) {
  const colors = {
    gold: "text-[#D4AF37]",
    green: "text-[#1E7E34]",
    blue: "text-[#1A73E8]",
    red: "text-[#C5221F]",
  };
  const bgColors = {
    gold: "bg-[#D4AF37]/10 border-[#D4AF37]/30",
    green: "bg-[#E6F4EA] border-[#CEEAD6]",
    blue: "bg-[#E8F0FE] border-[#D2E3FC]",
    red: "bg-[#FCE8E6] border-[#FAD2CF]",
  };
  return (
    <div className="bg-white border border-[#E8DCC8] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group font-sans">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${bgColors[color]}`}>
          <Icon size={20} className={colors[color]} />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend === "up" ? "text-[#1E7E34]" : "text-[#C5221F]"
          }`}>
            {trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-[#7C7267] text-xs font-semibold mb-1 uppercase tracking-wider">{title}</p>
      <p className="text-[#2F2B27] text-2xl font-bold">{value}</p>
    </div>
  );
}
