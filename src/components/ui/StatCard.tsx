import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-cyan-500/30 group ${className}`}
    >
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-cyan-400 border border-slate-200 dark:border-white/5">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-2">
          {subtext && <span>{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.direction === 'up'
                  ? 'text-emerald-500'
                  : trend.direction === 'down'
                  ? 'text-rose-500'
                  : 'text-slate-400'
              }`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '•'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
