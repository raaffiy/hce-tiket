'use client';

import React from 'react';
import Link from 'next/link';
import { useHCEApp } from '@/context/HCEAppContext';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TicketBadge } from '@/components/ui/TicketBadge';
import {
  Ticket,
  Users,
  ReceiptText,
  UserCheck,
  UserX,
  ArrowRight,
  TrendingUp,
  Activity,
  Sparkles,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { stats, tickets, transactions, activities } = useHCEApp();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#102A43] tracking-tight">
            Dashboard Super Admin
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Rangkuman operasional, penjualan tiket, dan gate check-in live event HCE 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tickets/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Tiket
          </Link>
          <Link
            href="/admin/check-in"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E05A1F] hover:bg-[#c94d17] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            <UserCheck className="w-4 h-4" />
            Buka Gate Check-In
          </Link>
        </div>
      </div>

      {/* A. 6 SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Tiket"
          value={stats.totalTickets}
          icon={Ticket}
          colorScheme="navy"
          subValue="Jenis Tiket Aktif"
        />
        <StatCard
          label="Tiket Terjual"
          value={stats.totalTicketsSold.toLocaleString('id-ID')}
          icon={TrendingUp}
          colorScheme="teal"
          subValue={`Target Kuota`}
        />
        <StatCard
          label="Total Transaksi"
          value={stats.totalTransactions.toLocaleString('id-ID')}
          icon={ReceiptText}
          colorScheme="orange"
          subValue={formatRupiah(stats.totalRevenue)}
        />
        <StatCard
          label="Total Participant"
          value={stats.totalParticipants.toLocaleString('id-ID')}
          icon={Users}
          colorScheme="purple"
          subValue="Peserta Terdaftar"
        />
        <StatCard
          label="Sudah Check-In"
          value={stats.totalCheckedIn.toLocaleString('id-ID')}
          icon={UserCheck}
          colorScheme="emerald"
          subValue={`${stats.attendancePercentage}% Terverifikasi`}
        />
        <StatCard
          label="Belum Check-In"
          value={stats.totalNotCheckedIn.toLocaleString('id-ID')}
          icon={UserX}
          colorScheme="amber"
          subValue="Menunggu di Gate"
        />
      </div>

      {/* Grid Row: Check-In Progress & Live Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D. CHECK-IN OVERVIEW */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1A5E61]" />
                Check-In Overview
              </h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Gate Operasional
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-medium text-slate-500">Tingkat Kehadiran (Attendance)</span>
                  <span className="text-base font-extrabold text-[#102A43]">
                    {stats.attendancePercentage}%
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-[#1A5E61] to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.attendancePercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total</p>
                  <p className="text-sm font-bold text-[#102A43] mt-0.5">{stats.totalParticipants}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 uppercase font-semibold">Masuk</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{stats.totalCheckedIn}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                  <p className="text-[10px] text-amber-600 uppercase font-semibold">Belum</p>
                  <p className="text-sm font-bold text-amber-700 mt-0.5">{stats.totalNotCheckedIn}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/admin/check-in"
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-[#102A43] font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              Buka Scanner & Check-In Peserta
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* E. RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#E05A1F]" />
                Recent Activity
              </h2>
              <span className="text-xs text-slate-400 font-medium">Realtime Event Stream</span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A5E61]/10 text-[#1A5E61] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#102A43] truncate">{act.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400">Sinkronisasi data otomatis dengan state lokal</span>
          </div>
        </div>
      </div>

      {/* B. TICKET OVERVIEW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#1A5E61]" />
              Ticket Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rangkuman kuota dan status penjualan masing-masing kategori tiket.
            </p>
          </div>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5E61] hover:text-[#134648] transition-colors"
          >
            View All Tickets
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Ticket Name</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Badge</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5 text-center">Quota</th>
                <th className="px-4 py-3.5 text-center">Sold</th>
                <th className="px-4 py-3.5 text-center">Remaining</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#102A43]">
                    <div className="flex items-center gap-2">
                      <span>{t.name}</span>
                      {t.visibility === 'PRIVATE' && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-mono">
                          PRIVATE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={t.type} size="sm" />
                  </td>
                  <td className="px-4 py-4">
                    <TicketBadge badge={t.badge} size="sm" />
                  </td>
                  <td className="px-4 py-4 font-mono font-medium">
                    {t.type === 'FREE' ? 'Rp 0' : formatRupiah(t.price)}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-[#102A43]">{t.quota}</td>
                  <td className="px-4 py-4 text-center font-bold text-emerald-600">{t.sold}</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-500">{t.remaining}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. TRANSACTION OVERVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-[#E05A1F]" />
              Transaction Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aktivitas order tiket terbaru peserta.
            </p>
          </div>
          <Link
            href="/admin/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E05A1F] hover:text-[#c94d17] transition-colors"
          >
            View All Transactions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Participant</th>
                <th className="px-4 py-3.5">Ticket</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Payment Status</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-6 py-3.5 text-center">Check-In Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.orderId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#102A43]">
                    {tx.orderId}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-800">
                    <div>{tx.participantName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.nim}</div>
                  </td>
                  <td className="px-4 py-4">{tx.ticketName}</td>
                  <td className="px-4 py-4 font-mono font-medium">
                    {formatRupiah(tx.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={tx.paymentStatus} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-mono text-[11px]">
                    {tx.orderDate}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={tx.checkInStatus} size="sm" />
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
