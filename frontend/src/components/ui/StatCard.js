import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = "gold" }) {
  const colors = {
    gold: "text-gold-400",
    green: "text-green-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };
  const bgColors = {
    gold: "bg-gold-600/10 border-gold-800/50",
    green: "bg-green-700/20 border-green-700/50",
    blue: "bg-blue-800/20 border-blue-800/50",
    red: "bg-red-800/20 border-red-800/50",
  };
  return (
    <div className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${bgColors[color]}`}>
          <Icon size={20} className={colors[color]} />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}>
            {trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-green-400 text-xs font-medium mb-1 uppercase tracking-wider">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}
