export default function StatCard({ label, value, color, icon }) {
  const colorMap = {
    blue: {
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400'
    },
    green: {
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400'
    },
    yellow: {
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400'
    },
    red: {
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400'
    }
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-[#111827] border border-white/5 rounded-xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 ${style.glow} hover:${style.border}`}>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg} ${style.iconColor}`}>
        {icon}
      </div>
    </div>
  );
}
