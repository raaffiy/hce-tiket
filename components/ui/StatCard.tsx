import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  colorScheme?: 'teal' | 'orange' | 'navy' | 'emerald' | 'purple' | 'amber';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subValue,
  trend,
  colorScheme = 'teal',
  className = '',
}) => {
  const iconColorMap = {
    teal: 'bg-[#1A5E61]/10 text-[#1A5E61] border-[#1A5E61]/20',
    orange: 'bg-[#E05A1F]/10 text-[#E05A1F] border-[#E05A1F]/20',
    navy: 'bg-[#102A43]/10 text-[#102A43] border-[#102A43]/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {label}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold text-[#102A43] tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl border ${iconColorMap[colorScheme]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subValue || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subValue && <span>{subValue}</span>}
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {trend.value} <span className="font-normal text-slate-400">{trend.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
