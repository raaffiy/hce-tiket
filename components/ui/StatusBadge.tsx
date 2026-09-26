import React from 'react';
import { TicketStatus, PaymentStatus, CheckInStatus } from '@/types/hce';

type GeneralStatus = TicketStatus | PaymentStatus | CheckInStatus | 'Active' | 'Inactive' | 'PUBLIC' | 'PRIVATE' | 'FREE' | 'PAID';

interface StatusBadgeProps {
  status: GeneralStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'Active':
    case 'Paid':
    case 'Checked In':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;

    case 'Draft':
    case 'Pending':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;

    case 'Paused':
      style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;

    case 'Sold Out':
    case 'Failed':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;

    case 'Refunded':
    case 'Expired':
    case 'Archived':
    case 'Inactive':
    case 'Not Checked In':
      style = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    case 'PUBLIC':
      style = 'bg-sky-50 text-sky-700 border-sky-200';
      dotColor = 'bg-sky-500';
      break;

    case 'PRIVATE':
      style = 'bg-purple-50 text-purple-700 border-purple-200';
      dotColor = 'bg-purple-500';
      break;

    case 'FREE':
      style = 'bg-teal-50 text-teal-700 border-teal-200';
      dotColor = 'bg-teal-500';
      break;

    case 'PAID':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
      break;
  }

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${style} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{status}</span>
    </span>
  );
};
