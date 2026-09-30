'use client';

import React, { useState } from 'react';
import { Search, UserCheck, CheckCircle2, Clock, AlertTriangle, XCircle, Ticket as TicketIcon, Loader2 } from 'lucide-react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Participant } from '@/types/hce';

export const ManualCheckInCard: React.FC = () => {
  const { participants, performCheckIn } = useHCEApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [foundParticipant, setFoundParticipant] = useState<Participant | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<{ status: 'PAID' | 'PENDING' | 'FAILED'; message: string } | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    setCheckInMsg(null);
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
    setIsLoading(true);
    setCheckInMsg(null);

    const res = await performCheckIn(foundParticipant.orderId, 'Manual');
    setIsLoading(false);

    if (res.participant) {
      setFoundParticipant(res.participant);
    }

    if (res.statusType === 'PAID') {
      setCheckInMsg({ status: 'PAID', message: 'QR berhasil di-scan.' });
    } else if (res.statusType === 'PENDING') {
      setCheckInMsg({ status: 'PENDING', message: 'QR tidak bisa di-scan karena belum dikonfirmasi oleh admin.' });
    } else {
      setCheckInMsg({ status: 'FAILED', message: res.statusType === 'FAILED' ? 'QR tersebut ditolak oleh admin.' : res.message });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#E05A1F]" />
            Check-In Manual / Cari Nama &amp; NIM
          </h3>
          <p className="text-xs text-slate-500">
            Cari peserta dengan Nama, NIM, Email, atau Order ID bila QR rusak atau terkendala.
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
              placeholder="Ketik NIM (contoh: 1201220001), Nama, atau Order ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] transition-all text-[#102A43]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#102A43] hover:bg-[#1a3d60] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Cari &amp; Verifikasi Peserta
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
                  <p className="text-xs text-slate-600 font-mono mt-0.5">NIM: {foundParticipant.nim || '-'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
                    {foundParticipant.orderId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      foundParticipant.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : foundParticipant.paymentStatus === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {foundParticipant.paymentStatus === 'Paid'
                      ? 'Pembayaran Berhasil'
                      : foundParticipant.paymentStatus === 'Pending'
                      ? 'Menunggu Konfirmasi'
                      : 'Pembayaran Ditolak'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <p className="flex items-center gap-1.5">
                  <TicketIcon className="w-3.5 h-3.5 text-[#1A5E61]" />
                  <span>{foundParticipant.ticketName}</span>
                </p>
                <p className="text-[11px] text-slate-500">{foundParticipant.faculty} &bull; {foundParticipant.prodi}</p>
              </div>

              {/* Specific Status Banners according to requirement */}
              {foundParticipant.paymentStatus === 'Pending' && (
                <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Status: Menunggu Konfirmasi</strong>
                    <span className="font-semibold text-amber-800">&ldquo;QR tidak bisa di-scan karena belum dikonfirmasi oleh admin.&rdquo;</span>
                  </div>
                </div>
              )}

              {foundParticipant.paymentStatus === 'Failed' && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Status: Pembayaran Ditolak</strong>
                    <span className="font-semibold text-rose-800">&ldquo;QR tersebut ditolak oleh admin.&rdquo;</span>
                  </div>
                </div>
              )}

              {/* Status & CTA */}
              <div className="pt-2">
                {foundParticipant.checkInStatus === 'Checked In' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold block">Sudah Check-In</span>
                        <span className="text-[10px] text-emerald-700">&ldquo;QR berhasil di-scan.&rdquo;</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {foundParticipant.checkInTime} ({foundParticipant.checkedInMethod})
                    </span>
                  </div>
                ) : foundParticipant.paymentStatus === 'Paid' ? (
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirm Check-In Manual (QR Valid)
                  </button>
                ) : (
                  <div className="text-center py-1">
                    <p className="text-[11px] text-slate-400 font-medium">Check-In terkunci karena pembayaran belum diverifikasi.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
        <span>Gate Operasional HCE 2026</span>
        <span>Validasi Status Database Otomatis</span>
      </div>
    </div>
  );
};
