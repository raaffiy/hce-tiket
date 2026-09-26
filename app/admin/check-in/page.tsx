'use client';

import React from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QRScannerSimulator } from '@/components/checkin/QRScannerSimulator';
import { ManualCheckInCard } from '@/components/checkin/ManualCheckInCard';
import {
  QrCode,
  UserCheck,
  UserX,
  TrendingUp,
  History,
  Clock,
} from 'lucide-react';

export default function CheckInPage() {
  const { stats, participants } = useHCEApp();

  // Get checked-in participants sorted with latest first (maksimal 50 data)
  const checkedInHistory = participants
    .filter((p) => p.checkInStatus === 'Checked In')
    .slice(0, 50);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Gate Check-In</h1>
        <p className="text-xs lg:text-sm text-slate-500 mt-1">
          Scan QR ticket peserta atau cari data peserta secara manual di pintu masuk acara.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Peserta"
          value={stats.totalParticipants}
          icon={QrCode}
          colorScheme="navy"
        />
        <StatCard
          label="Sudah Check-In"
          value={stats.totalCheckedIn}
          icon={UserCheck}
          colorScheme="emerald"
        />
        <StatCard
          label="Tingkat Kehadiran"
          value={`${stats.attendancePercentage}%`}
          icon={TrendingUp}
          colorScheme="teal"
        />
        <StatCard
          label="Belum Check-In"
          value={stats.totalNotCheckedIn}
          icon={UserX}
          colorScheme="amber"
        />
      </div>

      {/* Operational Area: Left = QR Scanner Simulator, Right = Manual Search & Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRScannerSimulator />
        <ManualCheckInCard />
      </div>

      {/* Bottom: Check-In Realtime History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#1A5E61]" />
            <div>
              <h2 className="text-base font-bold text-[#102A43]">Check-In History</h2>
              <p className="text-xs text-slate-500">Daftar kehadiran peserta terbaru di venue event.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {checkedInHistory.length} Riwayat Terkini
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Waktu Check-In</th>
                <th className="px-4 py-3.5">Participant</th>
                <th className="px-4 py-3.5">NIM</th>
                <th className="px-4 py-3.5">Ticket</th>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-3 py-3.5 text-center">Method</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checkedInHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[#1A5E61] font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.checkInTime || '-'}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{item.nim}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{item.ticketName}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{item.orderId}</td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.checkedInMethod === 'QR Scan'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {item.checkedInMethod || 'QR Scan'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={item.checkInStatus} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
