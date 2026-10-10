import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const colorMap = {
  cyan: {
    bg: 'from-cyan-500/10 to-sky-500/5',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  emerald: {
    bg: 'from-emerald-500/10 to-teal-500/5',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  amber: {
    bg: 'from-amber-500/10 to-yellow-500/5',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  rose: {
    bg: 'from-rose-500/10 to-red-500/5',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  indigo: {
    bg: 'from-indigo-500/10 to-purple-500/5',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
}) => {
  const scheme = colorMap[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br ${scheme.bg} ${scheme.border} glass-panel transition-all hover:border-slate-700`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-400">{trend.label || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
};
