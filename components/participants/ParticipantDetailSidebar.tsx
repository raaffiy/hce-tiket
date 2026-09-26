'use client';

import React from 'react';
import { Participant } from '@/types/hce';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  X,
  User,
  GraduationCap,
  Mail,
  Phone,
  Building,
  BookOpen,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  Calendar,
  ReceiptText,
} from 'lucide-react';

interface ParticipantDetailSidebarProps {
  participant: Participant | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn?: (orderId: string) => void;
}

export const ParticipantDetailSidebar: React.FC<ParticipantDetailSidebarProps> = ({
  participant,
  isOpen,
  onClose,
  onCheckIn,
}) => {
  if (!isOpen || !participant) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Right Drawer Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#102A43] to-[#1A5E61] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center font-bold text-lg text-white">
                {participant.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Data Profil Peserta</h2>
                <p className="text-xs text-white/80 font-mono">Order ID: {participant.orderId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Status Overview Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status Kehadiran
              </span>
              <StatusBadge status={participant.checkInStatus} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status Pembayaran
              </span>
              <StatusBadge status={participant.paymentStatus} />
            </div>
          </div>

          {/* 1. DATA IDENTITAS & AKADEMIK */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1A5E61]" />
              Informasi Pribadi &amp; Akademik
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {/* Nama */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nama Lengkap
                </span>
                <span className="font-bold text-slate-900 text-right">{participant.name}</span>
              </div>

              {/* NIM */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  NIM
                </span>
                <span className="font-mono font-bold text-slate-900">{participant.nim}</span>
              </div>

              {/* Fakultas */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Fakultas
                </span>
                <span className="font-semibold text-slate-800 text-right">{participant.faculty}</span>
              </div>

              {/* Prodi */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Program Studi
                </span>
                <span className="font-semibold text-slate-800 text-right">{participant.prodi}</span>
              </div>
            </div>
          </div>

          {/* 2. KONTAK PESERTA */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1A5E61]" />
              Kontak Komunikasi
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {/* Nomor Telp / WhatsApp */}
              <div className="p-3.5 flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Nomor Telepon
                </span>
                <a
                  href={`https://wa.me/${participant.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-emerald-600 hover:underline"
                >
                  {participant.whatsapp}
                </a>
              </div>

              {/* Email */}
              <div className="p-3.5 flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email
                </span>
                <a
                  href={`mailto:${participant.email}`}
                  className="font-semibold text-[#1A5E61] hover:underline truncate max-w-48 text-right"
                >
                  {participant.email}
                </a>
              </div>
            </div>
          </div>

          {/* 3. TIKET & LOG KEHADIRAN */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-[#1A5E61]" />
              Detail Tiket &amp; Gate
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Kategori Tiket</span>
                <span className="font-bold text-[#1A5E61]">{participant.ticketName}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Tipe Tiket</span>
                <span className="font-semibold text-slate-700">{participant.ticketType}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Waktu Check-In</span>
                <span className="font-mono text-slate-700">
                  {participant.checkInTime ? (
                    <span className="text-emerald-700 font-bold">
                      {participant.checkInTime} ({participant.checkedInMethod})
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Belum hadir di venue</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors text-xs cursor-pointer"
          >
            Tutup
          </button>

          {participant.checkInStatus === 'Not Checked In' && onCheckIn && (
            <button
              type="button"
              onClick={() => {
                onCheckIn(participant.orderId);
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Check-In Sekarang
            </button>
          )}
        </div>
      </div>
    </>
  );
};
