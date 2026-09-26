import React from 'react';
import { TicketBadgeType } from '@/types/hce';

interface TicketBadgeProps {
  badge: TicketBadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TicketBadge: React.FC<TicketBadgeProps> = ({ badge, size = 'md', className = '' }) => {
  const styles = {
    EARLY: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    NORMAL: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
    EXTEND: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-widest',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full border uppercase shadow-xs transition-colors ${styles[badge]} ${sizeStyles[size]} ${className}`}
    >
      {badge}
    </span>
  );
};
