import React from 'react';
import { TicketStatus, PaymentStatus, CheckInStatus } from '@/types/hce';

type GeneralStatus = TicketStatus | PaymentStatus | CheckInStatus | 'Active' | 'Inactive' | 'PUBLIC' | 'PRIVATE' | 'FREE' | 'PAID';

interface StatusBadgeProps {
  status: GeneralStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  let style = 'bg-slate-100 text-slate-800 border-slate-300';
  let dotColor = 'bg-slate-500';

  switch (status) {
    case 'Active':
    case 'Paid':
    case 'Checked In':
      style = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      dotColor = 'bg-emerald-600';
      break;

    case 'Pending':
      style = 'bg-amber-100 text-amber-900 border-amber-300';
      dotColor = 'bg-amber-600';
      break;

    case 'Sold Out':
    case 'Failed':
      style = 'bg-rose-100 text-rose-800 border-rose-300';
      dotColor = 'bg-rose-600';
      break;

    case 'Refunded':
    case 'Archived':
    case 'Inactive':
    case 'Not Checked In':
      style = 'bg-slate-100 text-slate-700 border-slate-300';
      dotColor = 'bg-slate-500';
      break;

    case 'PUBLIC':
      style = 'bg-sky-100 text-sky-800 border-sky-300';
      dotColor = 'bg-sky-600';
      break;

    case 'PRIVATE':
      style = 'bg-purple-100 text-purple-800 border-purple-300';
      dotColor = 'bg-purple-600';
      break;

    case 'FREE':
      style = 'bg-teal-100 text-teal-800 border-teal-300';
      dotColor = 'bg-teal-600';
      break;

    case 'PAID':
      style = 'bg-blue-100 text-blue-800 border-blue-300';
      dotColor = 'bg-blue-600';
      break;
  }

  const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs ${style} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{status}</span>
    </span>
  );
};

