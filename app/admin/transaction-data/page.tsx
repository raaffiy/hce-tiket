'use client';

import React, { useState, useMemo } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Transaction, Participant } from '@/types/hce';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterSelect } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
  Edit3,
  Trash2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  Phone,
  Mail,
  GraduationCap,
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

export default function MasterDataPage() {
  const {
    transactions,
    participants,
    tickets,
    stats,
    updateParticipantAndTransaction,
    deleteParticipant,
    exportParticipantsCSV,
  } = useHCEApp();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('ALL');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [checkInFilter, setCheckInFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Edit State
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    nim: '',
    email: '',
    whatsapp: '',
    faculty: '',
    prodi: '',
    ticketId: '',
  });
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  // 2-Step Verification Delete State
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Map participant data for fast lookup by orderId
  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    participants.forEach((p) => map.set(p.orderId, p));
    return map;
  }, [participants]);

  // Dynamic filter options
  const uniqueTickets = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.ticketName) set.add(p.ticketName);
    });
    return Array.from(set).map((name) => ({ value: name, label: name }));
  }, [participants]);

  const uniqueFaculties = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.faculty) set.add(p.faculty);
    });
    return Array.from(set).map((f) => ({ value: f, label: f }));
  }, [participants]);

  // Filtered List
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      const p = participantMap.get(tx.orderId);

      const matchSearch =
        tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p?.whatsapp && p.whatsapp.includes(searchQuery)) ||
        (p?.faculty && p.faculty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p?.prodi && p.prodi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.ticketName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTicket = ticketFilter === 'ALL' || tx.ticketName === ticketFilter;
      const matchFaculty = facultyFilter === 'ALL' || (p?.faculty && p.faculty === facultyFilter);
      const matchCheckIn = checkInFilter === 'ALL' || tx.checkInStatus === checkInFilter;
      const matchPayment = paymentFilter === 'ALL' || tx.paymentStatus === paymentFilter;

      return matchSearch && matchTicket && matchFaculty && matchCheckIn && matchPayment;
    });
  }, [transactions, searchQuery, ticketFilter, facultyFilter, checkInFilter, paymentFilter, participantMap]);

  // Open Edit Modal & Populate Form
  const handleOpenEdit = (tx: Transaction) => {
    const participant = participantMap.get(tx.orderId);
    setSelectedTxForEdit(tx);
    setEditFormData({
      name: tx.participantName,
      nim: tx.nim,
      email: tx.email,
      whatsapp: participant?.whatsapp || '',
      faculty: participant?.faculty || '',
      prodi: participant?.prodi || '',
      ticketId: tx.ticketId,
    });
  };

  const handleSaveFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditConfirmModal(true);
  };

  const executeUpdate = () => {
    if (!selectedTxForEdit) return;
    updateParticipantAndTransaction(selectedTxForEdit.orderId, editFormData);
    setShowEditConfirmModal(false);
    setSelectedTxForEdit(null);
  };

  // Open 2-Step Delete Modal
  const handleOpenDelete = (tx: Transaction) => {
    setTxToDelete(tx);
    setDeleteStep(1);
    setConfirmationInput('');
    setDeleteError('');
  };

  const handleCloseDelete = () => {
    setTxToDelete(null);
    setDeleteStep(1);
    setConfirmationInput('');
    setDeleteError('');
  };

  const handleProceedToStep2 = () => {
    setDeleteStep(2);
    setDeleteError('');
  };

  const executeDeleteFinal = () => {
    if (!txToDelete) return;
    if (confirmationInput.trim() !== 'HAPUS PERMANEN') {
      setDeleteError('Teks verifikasi tidak sesuai. Ketik "HAPUS PERMANEN" dengan huruf kapital.');
      return;
    }

    const participant = participantMap.get(txToDelete.orderId);
    if (participant) {
      deleteParticipant(participant.id);
    }
    handleCloseDelete();
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setTicketFilter('ALL');
    setFacultyFilter('ALL');
    setCheckInFilter('ALL');
    setPaymentFilter('ALL');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-[#1A5E61]" />
            Master Data & Participants
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Pusat pengelolaan data master identitas peserta, kategori tiket, status check-in, dan export data event HCE.
          </p>
        </div>

        <button
          onClick={exportParticipantsCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Participant"
          value={stats.totalParticipants}
          icon={Users}
          colorScheme="navy"
        />
        <StatCard
          label="Checked In"
          value={stats.totalCheckedIn}
          icon={UserCheck}
          colorScheme="emerald"
        />
        <StatCard
          label="Not Checked In"
          value={stats.totalNotCheckedIn}
          icon={UserX}
          colorScheme="amber"
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          icon={TrendingUp}
          colorScheme="teal"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Master Data (Nama, NIM, WhatsApp, Email, Order ID, Fakultas, Prodi)..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            options={[{ value: 'ALL', label: 'Semua Tiket' }, ...uniqueTickets]}
          />

          <FilterSelect
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            options={[{ value: 'ALL', label: 'Semua Fakultas' }, ...uniqueFaculties]}
          />

          <FilterSelect
            value={checkInFilter}
            onChange={(e) => setCheckInFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Semua Status Check-In' },
              { value: 'Checked In', label: 'Checked In' },
              { value: 'Not Checked In', label: 'Not Checked In' },
            ]}
          />

          <FilterSelect
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Semua Status Bayar' },
              { value: 'Paid', label: 'Pembayaran Berhasil (Paid)' },
              { value: 'Pending', label: 'Menunggu Konfirmasi (Pending)' },
              { value: 'Failed', label: 'Pembayaran Gagal (Failed)' },
              { value: 'Refunded', label: 'Refunded' },
            ]}
          />
        </div>
      </div>

      {/* Table of Master Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <EmptyState
            title="Master Data tidak ditemukan"
            description="Tidak ada data peserta yang cocok dengan kriteria pencarian dan filter saat ini."
            icon={FileSpreadsheet}
            action={{
              label: 'Reset Filter',
              onClick: handleResetFilter,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-center">NO</th>
                  <th className="px-5 py-4">PESERTA & ORDER</th>
                  <th className="px-4 py-4">NIM</th>
                  <th className="px-4 py-4">KONTAK</th>
                  <th className="px-4 py-4">FAKULTAS / PRODI</th>
                  <th className="px-4 py-4">TIKET</th>
                  <th className="px-3 py-4 text-center">STATUS CHECK-IN</th>
                  <th className="px-3 py-4 text-center">STATUS BAYAR</th>
                  <th className="px-5 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((tx, idx) => {
                  const p = participantMap.get(tx.orderId);
                  return (
                    <tr key={tx.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{tx.participantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>Order: {tx.orderId}</span>
                          <span>•</span>
                          <span>{tx.orderDate.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-slate-800">{tx.nim}</td>
                      <td className="px-4 py-4 space-y-1">
                        <div className="text-slate-700 truncate max-w-44 flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{tx.email}</span>
                        </div>
                        {p?.whatsapp && (
                          <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1A5E61] hover:underline"
                            >
                              {p.whatsapp}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p?.faculty || '-'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-4">{p?.prodi || '-'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#1A5E61] flex items-center gap-1">
                          <TicketIcon className="w-3 h-3 shrink-0" />
                          <span>{tx.ticketName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Rp {tx.amount.toLocaleString('id-ID')} ({tx.ticketType})
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge status={tx.checkInStatus} size="sm" />
                          {p?.checkInTime && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.checkInTime}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        {tx.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Pembayaran Berhasil
                          </span>
                        ) : tx.paymentStatus === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Menunggu Konfirmasi
                          </span>
                        ) : tx.paymentStatus === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Pembayaran Gagal
                          </span>
                        ) : (
                          <StatusBadge status={tx.paymentStatus} size="sm" />
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1A5E61]/10 hover:bg-[#1A5E61]/20 text-[#1A5E61] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                            title="Edit Data Peserta"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Tombol Hapus 2-Step */}
                          <button
                            onClick={() => handleOpenDelete(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                            title="Hapus Master Data (2-Langkah)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Master Data Modal */}
      {selectedTxForEdit && (
        <Modal
          isOpen={!!selectedTxForEdit}
          onClose={() => setSelectedTxForEdit(null)}
          title={`Koreksi Data Peserta: ${selectedTxForEdit.orderId}`}
          subtitle="Ubah informasi identitas nama, kontak, fakultas, prodi, atau tiket peserta."
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveFormSubmit} className="space-y-4">
            {/* Immutable Locked Fields */}
            <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Order ID (Locked)
                </span>
                <span className="font-mono font-bold text-slate-700">{selectedTxForEdit.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Payment Method (Locked)
                </span>
                <span className="font-bold text-slate-700">{selectedTxForEdit.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Order Date (Locked)
                </span>
                <span className="font-mono text-slate-700">{selectedTxForEdit.orderDate}</span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Peserta *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIM / Nomor Identitas *</label>
                <input
                  type="text"
                  required
                  value={editFormData.nim}
                  onChange={(e) => setEditFormData({ ...editFormData, nim: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Peserta *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
                <input
                  type="text"
                  value={editFormData.whatsapp}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fakultas</label>
                <input
                  type="text"
                  value={editFormData.faculty}
                  onChange={(e) => setEditFormData({ ...editFormData, faculty: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi</label>
                <input
                  type="text"
                  value={editFormData.prodi}
                  onChange={(e) => setEditFormData({ ...editFormData, prodi: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Tiket Terpilih</label>
              <select
                value={editFormData.ticketId}
                onChange={(e) => setEditFormData({ ...editFormData, ticketId: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — Rp {t.price.toLocaleString('id-ID')} ({t.badge})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTxForEdit(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirmModal && (
        <Modal
          isOpen={showEditConfirmModal}
          onClose={() => setShowEditConfirmModal(false)}
          title="Konfirmasi Perubahan Data Peserta"
          subtitle="Pastikan perubahan identitas dan tiket telah sesuai."
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Apakah Anda yakin ingin menyimpan perubahan data untuk peserta{' '}
              <strong className="text-slate-900">{editFormData.name}</strong>? Data pada seluruh sistem
              akan diperbarui secara real-time.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeUpdate}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl cursor-pointer"
              >
                Ya, Simpan Perubahan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2-STEP VERIFICATION DELETE MODAL */}
      {txToDelete && (
        <Modal
          isOpen={!!txToDelete}
          onClose={handleCloseDelete}
          title={deleteStep === 1 ? "Verifikasi Langkah 1: Hapus Data Peserta" : "Verifikasi Langkah 2: Konfirmasi Final"}
          subtitle={`Order ID: ${txToDelete.orderId}`}
        >
          <div className="space-y-4 text-xs">
            {deleteStep === 1 ? (
              <>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Peringatan Penghapusan Data Peserta</h4>
                    <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                      Anda akan menghapus data untuk <strong>{txToDelete.participantName}</strong> (NIM: {txToDelete.nim}).
                      Penghapusan ini akan membatalkan tiket dan menghapus riwayat kehadiran terkait.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-700">
                  <p><strong>Nama:</strong> {txToDelete.participantName}</p>
                  <p><strong>NIM:</strong> {txToDelete.nim}</p>
                  <p><strong>Email:</strong> {txToDelete.email}</p>
                  <p><strong>Kategori Tiket:</strong> {txToDelete.ticketName}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseDelete}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Lanjut ke Verifikasi Final (Langkah 2)</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
                  <p className="font-bold text-xs">Konfirmasi Tindakan Berisiko Tinggi</p>
                  <p className="text-[11px] text-rose-800">
                    Ketik kata kunci <strong className="font-mono bg-rose-200/80 px-1 py-0.5 rounded text-rose-950">HAPUS PERMANEN</strong> di bawah ini untuk mengonfirmasi:
                  </p>
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => {
                      setConfirmationInput(e.target.value);
                      setDeleteError('');
                    }}
                    placeholder="Ketik: HAPUS PERMANEN"
                    className="w-full px-3 py-2 text-xs border border-rose-300 rounded-xl bg-white font-mono uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  {deleteError && (
                    <p className="text-[11px] font-semibold text-rose-600">{deleteError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Kembali ke Langkah 1
                  </button>
                  <button
                    type="button"
                    onClick={executeDeleteFinal}
                    disabled={confirmationInput.trim() !== 'HAPUS PERMANEN'}
                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                      confirmationInput.trim() === 'HAPUS PERMANEN'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Konfirmasi Hapus Permanen</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
