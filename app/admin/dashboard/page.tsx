'use client';

import React from 'react';
import Link from 'next/link';
import { useHCEApp } from '@/context/HCEAppContext';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TicketBadge } from '@/components/ui/TicketBadge';
import {
  ReceiptText,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  QrCode,
  DollarSign,
  ChevronRight,
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
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Ringkasan transaksi online, total pendapatan, dan status check-in event.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/check-in"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E05A1F] hover:bg-[#c94d17] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Scanner Gate Check-In
          </Link>
        </div>
      </div>

      {/* 3 Focused Key Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Transaksi"
          value={`${stats.totalTransactions.toLocaleString('id-ID')} Pesanan`}
          icon={ReceiptText}
          colorScheme="orange"
          subValue={`${stats.paidOrdersCount} Berhasil • ${stats.pendingOrdersCount} Menunggu • ${stats.failedOrdersCount} Gagal`}
        />
        <StatCard
          label="Total Pendapatan"
          value={formatRupiah(stats.totalRevenue)}
          icon={DollarSign}
          colorScheme="navy"
          subValue="Dana masuk dari transaksi online terverifikasi"
        />
        <StatCard
          label="Kehadiran Peserta"
          value={`${stats.totalCheckedIn} / ${stats.totalParticipants}`}
          icon={UserCheck}
          colorScheme="emerald"
          subValue={`${stats.attendancePercentage}% Telah Check-In Masuk Gate`}
        />
      </div>

      {/* 2-Column Balanced Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Ticket Sales & Recent Orders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ticket Sales Status (Clean Card List) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1A5E61]" />
                  Status Penjualan Kategori Tiket
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kuota dan progres keterisian masing-masing kategori
                </p>
              </div>
              <Link
                href="/admin/tickets"
                className="text-xs font-semibold text-[#1A5E61] hover:underline flex items-center gap-1"
              >
                Kelola Tiket <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {tickets.map((t) => {
                const percentSold = t.quota > 0 ? Math.round((t.sold / t.quota) * 100) : 0;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">
                            {t.name}
                          </span>
                          <TicketBadge badge={t.badge} size="sm" />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {t.type === 'FREE' ? 'Gratis' : formatRupiah(t.price)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">
                          {t.sold}{' '}
                          <span className="text-slate-400 font-normal">/ {t.quota}</span>
                        </span>
                        <span className="block text-[10px] font-semibold text-[#1A5E61]">
                          {percentSold}% Terjual
                        </span>
                      </div>
                    </div>

                    {/* Clean Progress bar */}
                    <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1A5E61] to-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(percentSold, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions (Compact & Clear) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-[#E05A1F]" />
                  Transaksi Terbaru
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Daftar transaksi dan pesanan tiket terakhir
                </p>
              </div>
              <Link
                href="/admin/transactions"
                className="text-xs font-semibold text-[#E05A1F] hover:underline flex items-center gap-1"
              >
                Semua Transaksi <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.orderId}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {tx.participantName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {tx.ticketName} •{' '}
                      <span className="font-mono font-semibold text-slate-700">
                        {formatRupiah(tx.amount)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={tx.paymentStatus} size="sm" />
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      {tx.orderId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Gate Check-in & Live Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gate Check-In Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1A5E61]" />
                Status Gate & Check-In
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Gate Terbuka
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-medium text-slate-600">Tingkat Kehadiran</span>
                <span className="text-lg font-extrabold text-[#102A43]">
                  {stats.attendancePercentage}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${stats.attendancePercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-center">
                <div className="p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-medium block">Sudah Masuk</span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
                    {stats.totalCheckedIn} Peserta
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-medium block">Belum Masuk</span>
                  <span className="text-sm font-bold text-amber-700 font-mono">
                    {stats.totalNotCheckedIn} Peserta
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/check-in"
              className="w-full py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <QrCode className="w-4 h-4" />
              Buka Scanner QR & Check-In
            </Link>
          </div>

          {/* Live Activity Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E05A1F]" />
                Aktivitas Terkini
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#1A5E61]/10 text-[#1A5E61] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
