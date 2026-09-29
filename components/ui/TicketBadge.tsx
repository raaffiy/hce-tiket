import React from 'react';
import { TicketBadgeType } from '@/types/hce';

interface TicketBadgeProps {
  badge: TicketBadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TicketBadge: React.FC<TicketBadgeProps> = ({ badge, size = 'md', className = '' }) => {
  const styles: Record<TicketBadgeType, string> = {
    EARLY: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    NORMAL: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
    EXTEND: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 tracking-wide',
    md: 'text-xs px-3 py-1 tracking-wide',
    lg: 'text-sm px-4 py-1.5 font-bold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border uppercase shadow-2xs ${styles[badge] || 'bg-slate-100 text-slate-800 border-slate-300'} ${sizeStyles[size]} ${className}`}
    >
      {badge}
    </span>
  );
};

