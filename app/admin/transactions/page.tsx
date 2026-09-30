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
import { SEMINAR_INFO, SPEAKER_INFO } from '@/utils/seminarData';
import { generateQRCodeDataUrl } from '@/components/ui/QRCodeImage';
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
  ExternalLink,
  ImageIcon,
  Check,
  X,
} from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, stats, exportTransactionsCSV, updateTransactionStatus, addToast } = useHCEApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');

  // Modal View Detail
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isZoomImage, setIsZoomImage] = useState(false);

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

  const handleDownloadETicket = async (tx: Transaction) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const qrDataUrl = await generateQRCodeDataUrl(tx.orderId.replace('ORD', 'SEM') || tx.orderId, 250);

    const isPaid = tx.paymentStatus === 'Paid';
    const statusBg = isPaid ? '#dcfce7' : '#e0f2fe';
    const statusColor = isPaid ? '#166534' : '#0369a1';
    const statusBorder = isPaid ? '#86efac' : '#7dd3fc';
    const statusLabel = isPaid
      ? 'Pembayaran Berhasil'
      : tx.paymentStatus === 'Pending'
      ? 'Menunggu Konfirmasi Admin'
      : 'Pembayaran Tidak Berhasil';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>E-Ticket_${tx.orderId}_${tx.participantName.replace(/\\s+/g, '_')}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            color: #102a43;
            padding: 30px 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          .ticket-card {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            border: 2px solid #cbd5e1;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          }
          .header {
            background-color: #102a43;
            color: #ffffff;
            padding: 24px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 4px solid #e05a1f;
          }
          .logo-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-icon {
            width: 44px;
            height: 44px;
            background: #ffffff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            color: #102a43;
            font-size: 15px;
            letter-spacing: 0.5px;
          }
          .title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 26px;
            letter-spacing: 1.5px;
            line-height: 1;
          }
          .subtitle {
            font-size: 10px;
            color: #e05a1f;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .status {
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${statusBg};
            color: ${statusColor};
            border: 1.5px solid ${statusBorder};
          }
          .body {
            padding: 26px 28px;
          }
          .event-banner {
            background: #fff8f0;
            border: 1.5px dashed #f97316;
            border-radius: 16px;
            padding: 16px 20px;
            margin-bottom: 22px;
          }
          .event-theme {
            font-size: 15px;
            font-weight: 800;
            color: #102a43;
            line-height: 1.35;
          }
          .speaker-line {
            font-size: 12px;
            color: #475569;
            margin-top: 5px;
          }
          .speaker-line strong {
            color: #102a43;
          }
          .grid-details {
            display: grid;
            grid-template-columns: 1.25fr 1.15fr 0.9fr;
            gap: 18px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #e2e8f0;
          }
          .section-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            font-weight: 800;
            margin-bottom: 6px;
          }
          .info-val {
            font-size: 13px;
            font-weight: 800;
            color: #102a43;
            line-height: 1.4;
          }
          .info-sub {
            font-size: 11.5px;
            color: #64748b;
            line-height: 1.4;
          }
          .qr-box {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 12px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .qr-svg {
            width: 58px;
            height: 58px;
            color: #102a43;
            margin-bottom: 6px;
          }
          .code-label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
          }
          .code-val {
            font-family: monospace;
            font-weight: 900;
            color: #1a5e61;
            font-size: 13px;
          }
          .order-sub {
            font-size: 9.5px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            border-bottom: 2px dashed #e2e8f0;
          }
          .total-amount {
            font-size: 18px;
            font-weight: 900;
            color: #e05a1f;
            font-family: monospace;
          }
          .rules-box {
            margin-top: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 18px;
            font-size: 11px;
            color: #475569;
            line-height: 1.5;
          }
          .rules-box strong {
            color: #102a43;
            display: block;
            margin-bottom: 4px;
            font-size: 11.5px;
          }
          .rules-box ol {
            margin-left: 16px;
          }
          .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 12px 28px;
            text-align: center;
            font-size: 10.5px;
            color: #94a3b8;
            font-weight: 600;
          }
          @media print {
            body { padding: 0; background: #ffffff; }
            .ticket-card { box-shadow: none; border: 2px solid #102a43; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="header">
            <div class="logo-group">
              <div class="logo-icon">HCE</div>
              <div>
                <div class="subtitle">OFFICIAL SEMINAR PASS</div>
                <div class="title">HIPMI COLLAB EXPO 2026</div>
              </div>
            </div>
            <div class="status">
              ${statusLabel}
            </div>
          </div>

          <div class="body">
            <div class="event-banner">
              <div class="event-theme">&ldquo;${SEMINAR_INFO.theme}&rdquo;</div>
              <div class="speaker-line">Keynote Speaker: <strong>${SPEAKER_INFO.name}</strong> &bull; ${SPEAKER_INFO.title}</div>
            </div>

            <div class="grid-details">
              <div>
                <div class="section-title">Data Peserta</div>
                <div class="info-val">${tx.participantName}</div>
                <div class="info-sub">NIM: <strong>${tx.nim}</strong></div>
                <div class="info-sub">${tx.email}</div>
              </div>

              <div>
                <div class="section-title">Waktu &amp; Lokasi</div>
                <div class="info-val">${SEMINAR_INFO.date}</div>
                <div class="info-sub">Pukul: <strong>${SEMINAR_INFO.time}</strong></div>
                <div class="info-val" style="margin-top: 4px; font-size: 12px;">${SEMINAR_INFO.venue}</div>
                <div class="info-sub">${SEMINAR_INFO.organizer}</div>
              </div>

              <div class="qr-box">
                <img src="${qrDataUrl}" alt="QR Check-In" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 6px; border-radius: 6px;" />
                <div class="code-label">QR CHECK-IN</div>
                <div class="code-val">${tx.orderId.replace('ORD', 'SEM')}</div>
                <div class="order-sub">Order: ${tx.orderId}</div>
              </div>
            </div>

            <div class="summary-row">
              <div>
                <div class="section-title">Kategori Tiket</div>
                <div style="font-size: 14px; font-weight: 800; color: #102a43;">${tx.ticketName} (${tx.ticketType})</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Total Pembayaran</div>
                <div class="total-amount">${formatRupiah(tx.amount)}</div>
              </div>
            </div>

            <div class="rules-box">
              <strong>Ketentuan &amp; Informasi Check-In:</strong>
              <ol>
                <li>Tunjukkan dokumen E-Ticket resmi ini (cetak atau digital) beserta identitas diri saat registrasi ulang.</li>
                <li>QR Code Check-in hanya berlaku untuk 1 kali pemindaian masuk gate seminar.</li>
                <li>Pintu masuk seminar dibuka 45 menit sebelum acara dimulai. Harap hadir tepat waktu.</li>
                <li>Bila ada kendala verifikasi, silakan hubungi Customer Service Panitia HCE 2026.</li>
              </ol>
            </div>
          </div>

          <div class="footer">
            &copy; 2026 HIPMI PT Telkom University &bull; Himpunan Pengusaha Muda Indonesia &bull; Dokumen Resmi Elektronik
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleResendEmail = (tx: Transaction) => {
    addToast(`Mengirim ulang invoice & e-ticket ke ${tx.email}...`, 'info');
    setTimeout(() => {
      addToast(`Email e-ticket berhasil dikirimkan ulang ke ${tx.email}!`, 'success');
    }, 900);
  };

  const handleApprovePayment = (orderId: string) => {
    updateTransactionStatus(orderId, 'Paid');
    if (selectedTx && selectedTx.orderId === orderId) {
      setSelectedTx({ ...selectedTx, paymentStatus: 'Paid' });
    }
  };

  const handleRejectPayment = (orderId: string) => {
    updateTransactionStatus(orderId, 'Failed');
    if (selectedTx && selectedTx.orderId === orderId) {
      setSelectedTx({ ...selectedTx, paymentStatus: 'Failed' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Transaction Ticket</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Monitoring arus transaksi, verifikasi bukti pembayaran peserta, dan persetujuan tiket.
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

      {/* Summary Cards */}
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pembayaran Berhasil</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight mt-1">
                {stats.paidOrdersCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Tiket aktif & siap check-in</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending & Exceptions Breakdown Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verifikasi & Status</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
            <div className="p-1.5 bg-amber-50/80 rounded-xl">
              <span className="text-[10px] text-amber-700 font-bold block">Pending</span>
              <span className="text-sm font-extrabold text-amber-800">{stats.pendingOrdersCount}</span>
            </div>
            <div className="p-1.5 bg-rose-50/80 rounded-xl">
              <span className="text-[10px] text-rose-700 font-bold block">Gagal</span>
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
            { value: 'ALL', label: 'Semua Status Pembayaran' },
            { value: 'Pending', label: 'Menunggu Konfirmasi (Pending)' },
            { value: 'Paid', label: 'Pembayaran Berhasil (Paid)' },
            { value: 'Failed', label: 'Pembayaran Tidak Berhasil (Failed)' },
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
                  <th className="px-3 py-4 text-center">Bukti Bayar</th>
                  <th className="px-4 py-4 text-center">Status Transaksi &amp; E-Ticket</th>
                  <th className="px-5 py-4 text-right">Verifikasi</th>
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
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#1A5E61]/10 text-slate-700 hover:text-[#1A5E61] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        title="Lihat Bukti Transfer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#1A5E61]" />
                        <span>Lihat Bukti</span>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {tx.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Pembayaran Berhasil
                          </span>
                        ) : tx.paymentStatus === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Menunggu Konfirmasi
                          </span>
                        ) : tx.paymentStatus === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                            <XCircle className="w-3 h-3" />
                            Pembayaran Gagal
                          </span>
                        ) : (
                          <StatusBadge status={tx.paymentStatus} size="sm" />
                        )}

                        {/* Tombol Cetak PDF Tepat di Samping Kanan Status Transaksi */}
                        <button
                          onClick={() => handleDownloadETicket(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A5E61] hover:bg-[#134648] text-white font-semibold rounded-lg text-[11px] transition-colors shadow-2xs cursor-pointer shrink-0"
                          title="Cetak / Unduh E-Tiket PDF"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak PDF</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {tx.paymentStatus === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprovePayment(tx.orderId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                            title="Setujui Bukti & Terbitkan Tiket"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verifikasi
                          </button>
                          <button
                            onClick={() => handleRejectPayment(tx.orderId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            title="Tolak Bukti Pembayaran"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Terverifikasi</span>
                      )}
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
          onClose={() => {
            setSelectedTx(null);
            setIsZoomImage(false);
          }}
          title={`Detail Transaksi: ${selectedTx.orderId}`}
          subtitle={`Tanggal Order: ${selectedTx.orderDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Status Header Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              selectedTx.paymentStatus === 'Paid'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : selectedTx.paymentStatus === 'Pending'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-3">
                {selectedTx.paymentStatus === 'Paid' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : selectedTx.paymentStatus === 'Pending' ? (
                  <Clock className="w-6 h-6 text-amber-600 animate-pulse shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm">
                    {selectedTx.paymentStatus === 'Paid'
                      ? 'Pembayaran Berhasil (Terverifikasi)'
                      : selectedTx.paymentStatus === 'Pending'
                      ? 'Menunggu Konfirmasi Admin'
                      : 'Pembayaran Tidak Berhasil / Ditolak'}
                  </h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    {selectedTx.paymentStatus === 'Paid'
                      ? 'QR Code tiket aktif dan siap digunakan check-in oleh peserta.'
                      : selectedTx.paymentStatus === 'Pending'
                      ? 'Periksa kesesuaian bukti transfer di bawah sebelum menyetujui.'
                      : 'Bukti transfer tidak valid. QR Code tidak dapat dipakai check-in.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Total Transaction</span>
                <span className="text-base font-black font-mono">
                  {selectedTx.ticketType === 'FREE' ? 'Gratis' : formatRupiah(selectedTx.amount)}
                </span>
              </div>
            </div>

            {/* Grid 2 Kolom: Data Peserta & Bukti Pembayaran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom Kiri: Informasi Peserta & Transaksi */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <h5 className="font-extrabold text-slate-800 border-b border-slate-200 pb-2">Informasi Peserta:</h5>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nama Lengkap:</span>
                    <strong className="text-slate-900">{selectedTx.participantName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIM:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedTx.nim}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-800">{selectedTx.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kategori Tiket:</span>
                    <span className="font-bold text-[#1A5E61]">{selectedTx.ticketName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Metode Bayar:</span>
                    <span className="font-medium text-slate-800">{selectedTx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Check-In:</span>
                    <span className={`font-bold ${selectedTx.checkInStatus === 'Checked In' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {selectedTx.checkInStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Bukti Transaksi */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#1A5E61]" />
                      Bukti Transaksi Peserta
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">Uploaded</span>
                  </div>

                  <div className="mt-2.5 relative group rounded-xl overflow-hidden border border-slate-300 bg-white p-2 text-center space-y-1.5">
                    <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={selectedTx.paymentProof || '/scanqr.jpeg'}
                        alt="Bukti Transfer"
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(selectedTx.paymentProof || '/scanqr.jpeg', '_blank')}
                      />
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] text-slate-400 font-mono">
                        {selectedTx.paymentProof ? 'Bukti transfer Supabase' : 'File bukti transfer'}
                      </p>
                      <a
                        href={selectedTx.paymentProof || '/scanqr.jpeg'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#1A5E61] hover:underline"
                      >
                        Buka Foto ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tombol aksi verifikasi langsung */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprovePayment(selectedTx.orderId)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Setujui (Berhasil)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRejectPayment(selectedTx.orderId)}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Tolak (Gagal)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick action buttons within modal footer */}
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
