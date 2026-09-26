'use client';

import React, { useState, useMemo } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Transaction } from '@/types/hce';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileSpreadsheet,
  Edit3,
  Trash2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function MasterDataPage() {
  const { transactions, participants, tickets, updateParticipantAndTransaction, deleteParticipant } = useHCEApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    nim: '',
    email: '',
    whatsapp: '',
    faculty: '',
    prodi: '',
    ticketId: '',
  });

  // Edit Confirmation Modal State
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  // 2-Step Verification Delete State
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Map participant data for fast lookup by orderId
  const participantMap = useMemo(() => {
    const map = new Map<string, (typeof participants)[0]>();
    participants.forEach((p) => map.set(p.orderId, p));
    return map;
  }, [participants]);

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

  // Filtered List (Limit 50 data)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const p = participantMap.get(tx.orderId);
      return (
        tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p?.whatsapp && p.whatsapp.includes(searchQuery)) ||
        (p?.faculty && p.faculty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p?.prodi && p.prodi.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }).slice(0, 50);
  }, [transactions, searchQuery, participantMap]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
          Master Data
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 mt-1">
          Pusat pengelolaan dan koreksi master data identitas peserta event HCE 2026.
        </p>
      </div>

      {/* Warning / Note Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-bold">Ketentuan Integritas Master Data:</p>
          <p className="mt-0.5 text-amber-800/90 leading-relaxed">
            Order ID dan Tanggal Transaksi bersifat immutable (terkunci). Anda dapat mengedit identitas peserta
            atau menghapus data melalui verifikasi keamanan 2 langkah.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Master Data (Nama, NIM, Nomor Telp, Email, Fakultas, Prodi)..."
        />
      </div>

      {/* Table of Master Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="Master Data tidak ditemukan"
            description="Tidak ada data yang cocok dengan kata kunci pencarian Anda."
            icon={FileSpreadsheet}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-center">NO</th>
                  <th className="px-5 py-4">NAMA LENGKAP</th>
                  <th className="px-4 py-4">NIM</th>
                  <th className="px-4 py-4">NOMOR TELP</th>
                  <th className="px-4 py-4">EMAIL</th>
                  <th className="px-4 py-4">FAKULTAS</th>
                  <th className="px-4 py-4">PRODI</th>
                  <th className="px-5 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx, idx) => {
                  const p = participantMap.get(tx.orderId);
                  return (
                    <tr key={tx.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{tx.participantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Order: {tx.orderId}</div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-slate-800">{tx.nim}</td>
                      <td className="px-4 py-4 font-mono text-slate-700">
                        {p?.whatsapp || '-'}
                      </td>
                      <td className="px-4 py-4 text-slate-700 truncate max-w-44">
                        {tx.email}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {p?.faculty || '-'}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {p?.prodi || '-'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1A5E61]/10 hover:bg-[#1A5E61]/20 text-[#1A5E61] font-semibold rounded-lg text-xs transition-colors"
                            title="Edit Master Data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Tombol Hapus 2-Step */}
                          <button
                            onClick={() => handleOpenDelete(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition-colors"
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
          title={`Koreksi Master Data: ${selectedTxForEdit.orderId}`}
          subtitle="Ubah informasi nama, nim, kontak, fakultas, atau prodi peserta."
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={editFormData.whatsapp}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
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
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors"
              >
                Simpan Perubahan Master Data
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
          title="Konfirmasi Perubahan Master Data"
          subtitle="Pastikan perubahan data identitas peserta telah sesuai."
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
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeUpdate}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl"
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
          title={deleteStep === 1 ? "Verifikasi Langkah 1: Hapus Master Data" : "Verifikasi Langkah 2: Konfirmasi Final"}
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
                      Anda akan menghapus data master untuk <strong>{txToDelete.participantName}</strong> (NIM: {txToDelete.nim}).
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
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Lanjut ke Verifikasi Final (Langkah 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl space-y-2 text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Langkah 2: Konfirmasi Kata Sandi Keamanan</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Untuk mencegah kesalahan tidak disengaja, silakan ketik teks verifikasi <strong className="font-mono bg-white px-1.5 py-0.5 rounded text-rose-900 border border-rose-300">HAPUS PERMANEN</strong> di bawah ini:
                  </p>
                </div>

                {deleteError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-xl font-medium">
                    {deleteError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ketik Konfirmasi Teks:
                  </label>
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => {
                      setConfirmationInput(e.target.value);
                      setDeleteError('');
                    }}
                    placeholder="HAPUS PERMANEN"
                    className="w-full px-3.5 py-2.5 text-xs border-2 border-rose-300 focus:border-rose-600 rounded-xl font-mono uppercase font-bold text-rose-900 tracking-wider"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    &larr; Kembali ke Langkah 1
                  </button>
                  <button
                    type="button"
                    onClick={executeDeleteFinal}
                    disabled={confirmationInput.trim() !== 'HAPUS PERMANEN'}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hapus Permanen Sekarang</span>
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
