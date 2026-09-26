'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHCEApp } from '@/context/HCEAppContext';
import { Transaction } from '@/types/hce';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterSelect } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ReceiptText,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  DollarSign,
  Eye,
  Download,
  Printer,
  FileDown,
  Send,
} from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, stats, exportTransactionsCSV, updateTransactionStatus, addToast } = useHCEApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');

  // Modal View Detail
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Ticket unique list for dropdown
  const uniqueTickets = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach((tx) => map.set(tx.ticketId, tx.ticketName));
    return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [transactions]);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTicket = ticketFilter === 'ALL' || tx.ticketId === ticketFilter;
      const matchPayment = paymentStatusFilter === 'ALL' || tx.paymentStatus === paymentStatusFilter;

      return matchSearch && matchTicket && matchPayment;
    }).slice(0, 50);
  }, [transactions, searchQuery, ticketFilter, paymentStatusFilter]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadETicket = (tx: Transaction) => {
    addToast(`Memproses download E-Ticket PDF untuk ${tx.participantName} (${tx.orderId})...`, 'info');
    setTimeout(() => {
      // Simulate creating and downloading PDF ticket file
      const dummyContent = `HCE TICKET 2026 - E-TICKET PASS\n\nOrder ID: ${tx.orderId}\nNama Peserta: ${tx.participantName}\nNIM: ${tx.nim}\nEmail: ${tx.email}\nKategori Tiket: ${tx.ticketName} (${tx.ticketType})\nStatus Pembayaran: ${tx.paymentStatus}\nStatus Check-In: ${tx.checkInStatus}\nTanggal Order: ${tx.orderDate}\n\nVenue: Telkom University Bandung\nHarap tunjukkan dokumen ini saat check-in di gate masuk.`;
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ETicket_${tx.orderId}_${tx.participantName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`E-Ticket PDF ${tx.orderId} berhasil diunduh.`, 'success');
    }, 600);
  };

  const handleResendEmail = (tx: Transaction) => {
    addToast(`Mengirim ulang invoice & e-ticket ke ${tx.email}...`, 'info');
    setTimeout(() => {
      addToast(`Email e-ticket berhasil dikirimkan ulang ke ${tx.email}!`, 'success');
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Transaction Ticket</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Monitoring arus transaksi, status settlement tiket, dan detail pesanan peserta.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportTransactionsCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#1A5E61]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards - Balanced & Clean Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Transaksi</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-[#102A43] tracking-tight mt-1">
                {stats.totalTransactions}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Semua pesanan masuk</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#102A43]/10 text-[#102A43] border border-[#102A43]/20 flex items-center justify-center">
              <ReceiptText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-[#1A5E61] tracking-tight mt-1 font-mono">
                {formatRupiah(stats.totalRevenue)}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Settlement dari order Paid</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1A5E61]/10 text-[#1A5E61] border border-[#1A5E61]/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Paid Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paid (Berhasil)</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight mt-1">
                {stats.paidOrdersCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Tiket aktif dan lunas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending & Exceptions Breakdown Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Lainnya</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
            <div className="p-1.5 bg-amber-50/80 rounded-xl">
              <span className="text-[10px] text-amber-700 font-bold block">Pending</span>
              <span className="text-sm font-extrabold text-amber-800">{stats.pendingOrdersCount}</span>
            </div>
            <div className="p-1.5 bg-rose-50/80 rounded-xl">
              <span className="text-[10px] text-rose-700 font-bold block">Failed</span>
              <span className="text-sm font-extrabold text-rose-800">{stats.failedOrdersCount}</span>
            </div>
            <div className="p-1.5 bg-purple-50/80 rounded-xl">
              <span className="text-[10px] text-purple-700 font-bold block">Refund</span>
              <span className="text-sm font-extrabold text-purple-800">{stats.refundedOrdersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Order ID, nama, NIM, email..."
        />

        <FilterSelect
          value={ticketFilter}
          onChange={(e) => setTicketFilter(e.target.value)}
          options={[{ value: 'ALL', label: 'Semua Tiket' }, ...uniqueTickets]}
        />

        <FilterSelect
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'Semua Status Bayar' },
            { value: 'Paid', label: 'Paid' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Failed', label: 'Failed' },
            { value: 'Refunded', label: 'Refunded' },
          ]}
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi"
            description="Tidak ditemukan transaksi yang cocok dengan filter yang Anda gunakan."
            icon={ReceiptText}
            action={{
              label: 'Reset Filter',
              onClick: () => {
                setSearchQuery('');
                setTicketFilter('ALL');
                setPaymentStatusFilter('ALL');
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-4 py-4">Order Date</th>
                  <th className="px-4 py-4">Participant</th>
                  <th className="px-4 py-4">Ticket</th>
                  <th className="px-4 py-4">Price / Amount</th>
                  <th className="px-3 py-4 text-center">Payment Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.orderId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">{tx.orderId}</td>
                    <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">{tx.orderDate}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{tx.participantName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.nim}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">{tx.ticketName}</div>
                      <span className="text-[10px] text-slate-400">{tx.ticketType}</span>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-900">
                      {tx.ticketType === 'FREE' ? 'Gratis' : formatRupiah(tx.amount)}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <StatusBadge status={tx.paymentStatus} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Detail */}
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                          title="Lihat Rincian Transaksi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>

                        {/* Tombol Download E-Tiket PDF */}
                        <button
                          onClick={() => handleDownloadETicket(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1A5E61]/10 hover:bg-[#1A5E61]/20 text-[#1A5E61] font-semibold rounded-lg text-xs transition-colors"
                          title="Download E-Tiket PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          E-Tiket
                        </button>

                        {/* Tombol Kirim Email Lagi */}
                        <button
                          onClick={() => handleResendEmail(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-semibold rounded-lg text-xs transition-colors"
                          title="Kirim Ulang Tiket ke Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Kirim Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Detail Transaksi: ${selectedTx.orderId}`}
          subtitle={`Tanggal Order: ${selectedTx.orderDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status Pembayaran:</span>
                <StatusBadge status={selectedTx.paymentStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Metode Pembayaran:</span>
                <span className="text-xs font-bold text-slate-800">{selectedTx.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total Nominal:</span>
                <span className="text-sm font-extrabold font-mono text-[#102A43]">
                  {formatRupiah(selectedTx.amount)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-800">Informasi Peserta:</h5>
              <p><b className="text-slate-500">Nama:</b> {selectedTx.participantName}</p>
              <p><b className="text-slate-500">NIM:</b> {selectedTx.nim}</p>
              <p><b className="text-slate-500">Email:</b> {selectedTx.email}</p>
              <p><b className="text-slate-500">Tiket:</b> {selectedTx.ticketName} ({selectedTx.ticketType})</p>
              <p><b className="text-slate-500">Check-In Status:</b> {selectedTx.checkInStatus}</p>
            </div>

            {/* Quick action buttons within modal */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <Link
                href="/admin/transaction-data"
                className="text-xs font-semibold text-[#1A5E61] hover:underline"
              >
                Koreksi Data Peserta di Menu Transaction Data →
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadETicket(selectedTx)}
                  className="px-3 py-1.5 bg-[#1A5E61] hover:bg-[#134648] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => handleResendEmail(selectedTx)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Email
                </button>

                {selectedTx.paymentStatus === 'Paid' && (
                  <button
                    onClick={() => {
                      updateTransactionStatus(selectedTx.orderId, 'Refunded');
                      setSelectedTx({ ...selectedTx, paymentStatus: 'Refunded' });
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Simulasi Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
