'use client';

import React from 'react';
import { TicketBadge } from '../ui/TicketBadge';
import { TicketBadgeType, TicketType, TicketVisibility } from '@/types/hce';
import { Check, Sparkles, Calendar, Lock, Globe } from 'lucide-react';

interface TicketCardPreviewProps {
  name: string;
  description: string;
  type: TicketType;
  badge: TicketBadgeType;
  visibility: TicketVisibility;
  price: number;
  quota: number;
  benefits: string[];
  startDate?: string;
  endDate?: string;
}

export const TicketCardPreview: React.FC<TicketCardPreviewProps> = ({
  name,
  description,
  type,
  badge,
  visibility,
  price,
  quota,
  benefits,
  startDate,
  endDate,
}) => {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateLabel = (dtStr?: string) => {
    if (!dtStr) return '-';
    try {
      const d = new Date(dtStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="sticky top-24 bg-gradient-to-b from-slate-900 to-[#102A43] text-white rounded-3xl p-6 lg:p-7 shadow-2xl border border-slate-700/60 overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#E05A1F]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#1A5E61]/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header Tags */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <TicketBadge badge={badge} size="md" />
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              visibility === 'PUBLIC'
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
            }`}
          >
            {visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {visibility}
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
          KUOTA: {quota || 0}
        </span>
      </div>

      {/* Ticket Name & Description */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-white mb-2">
          {name || 'Nama Tiket Anda'}
        </h3>
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
          {description || 'Deskripsi manfaat dan akses tiket akan tampil di bagian ini secara lengkap.'}
        </p>
      </div>

      {/* Price Section */}
      <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs relative z-10">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
          HARGA TIKET (1 Peserta / 1 Tiket)
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-[#FFF6E9]">
            {type === 'FREE' ? 'Rp 0 (GRATIS)' : formatRupiah(price || 0)}
          </span>
          {type === 'PAID' && <span className="text-xs text-slate-400">/ orang</span>}
        </div>
      </div>

      {/* Sale Period info */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-300 relative z-10">
        <Calendar className="w-4 h-4 text-[#E05A1F] shrink-0" />
        <span>
          Periode: {formatDateLabel(startDate)} — {formatDateLabel(endDate)}
        </span>
      </div>

      {/* Benefits List */}
      <div className="mb-7 relative z-10">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Fasilitas & Benefit:
        </p>
        {benefits.length > 0 ? (
          <ul className="space-y-2">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400 italic">Belum ada benefit ditambahkan.</p>
        )}
      </div>
    </div>
  );
};
