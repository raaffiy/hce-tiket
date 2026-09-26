import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = '',
}) => {
  return (
    <div
      className={`py-12 px-4 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs mb-4 text-[#1A5E61]">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-[#102A43] mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
