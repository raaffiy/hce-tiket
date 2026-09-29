'use client';

import React, { useState } from 'react';
import { Search, UserCheck, CheckCircle2, Clock, Ticket as TicketIcon } from 'lucide-react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Participant } from '@/types/hce';

export const ManualCheckInCard: React.FC = () => {
  const { participants, performCheckIn } = useHCEApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [foundParticipant, setFoundParticipant] = useState<Participant | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    const q = searchQuery.trim().toLowerCase();
    const match = participants.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nim.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );

    setFoundParticipant(match || null);
  };

  const handleConfirm = async () => {
    if (!foundParticipant) return;
    const res = await performCheckIn(foundParticipant.orderId, 'Manual');
    if (res.participant) {
      setFoundParticipant(res.participant);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#E05A1F]" />
            Check-In Manual / Cari Nama
          </h3>
          <p className="text-xs text-slate-500">
            Cari peserta dengan Nama, NIM, Email, atau Order ID bila QR rusak atau kendala teknis.
          </p>
        </div>

        {/* Form Search */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Contoh: Ahmad Fauzan, 102022300142, atau OM26-0841"
              className="w-full pl-10 pr-4 py-2.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] transition-all text-[#102A43]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#102A43] hover:bg-[#1a3d60] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Cari & Verifikasi Peserta
          </button>
        </form>

        {/* Result Area */}
        <div className="mt-5">
          {hasSearched && !foundParticipant && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs font-semibold text-slate-700">Data peserta tidak ditemukan.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pastikan NIM / Order ID sudah benar.</p>
            </div>
          )}

          {foundParticipant && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#102A43]">{foundParticipant.name}</h4>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">{foundParticipant.nim}</p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
                  {foundParticipant.orderId}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <p className="flex items-center gap-1.5">
                  <TicketIcon className="w-3.5 h-3.5 text-[#1A5E61]" />
                  <span>{foundParticipant.ticketName}</span>
                </p>
                <p className="text-[11px] text-slate-500">{foundParticipant.faculty} • {foundParticipant.prodi}</p>
              </div>

              {/* Status & CTA */}
              <div className="pt-2">
                {foundParticipant.checkInStatus === 'Checked In' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">Sudah Check-In</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {foundParticipant.checkInTime} ({foundParticipant.checkedInMethod})
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirm}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Check-In Manual
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
        <span>Gate Operasional HCE 2026</span>
        <span>Manual Override Mode</span>
      </div>
    </div>
  );
};
