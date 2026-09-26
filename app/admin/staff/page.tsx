'use client';

import React, { useState } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Staff, StaffRole } from '@/types/hce';
import { STAFF_ROLE_CONFIGS } from '@/mock/mockStaff';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Power,
  Shield,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { staffList, addStaff, deleteStaff, toggleStaffStatus, addToast } = useHCEApp();

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('CHECKIN_STAFF');
  const [showPassword, setShowPassword] = useState(false);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Nama staff wajib diisi.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      addToast('Email staff tidak valid.', 'error');
      return;
    }
    if (password.length < 8) {
      addToast('Password minimal 8 karakter.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    addStaff({
      name,
      email,
      role,
      status: 'Active',
    });

    setIsAddStaffOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('CHECKIN_STAFF');
  };

  const getRoleBadge = (roleKey: StaffRole) => {
    const config = STAFF_ROLE_CONFIGS.find((r) => r.key === roleKey);
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200',
      rose: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          colorMap[config?.color || 'blue']
        }`}
      >
        <Shield className="w-3 h-3" />
        {config?.label || roleKey}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Staff Management</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Kelola akun petugas event, pembagian wewenang peran (Role Matrix), dan status akses.
          </p>
        </div>

        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Tambah Staff
        </button>
      </div>

      {/* Role Configs Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STAFF_ROLE_CONFIGS.map((rc) => (
          <div
            key={rc.key}
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5"
          >
            <span className="text-[11px] font-bold text-slate-900 block">{rc.label}</span>
            <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{rc.description}</p>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Nama & Akun</th>
                <th className="px-4 py-4">Role / Wewenang</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4">Tanggal Dibuat</th>
                <th className="px-4 py-4">Aktivitas Terakhir</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((stf) => (
                <tr key={stf.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm">{stf.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{stf.email}</div>
                  </td>
                  <td className="px-4 py-4">{getRoleBadge(stf.role)}</td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={stf.status} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">{stf.createdDate}</td>
                  <td className="px-4 py-4 text-slate-600 text-[11px]">{stf.lastActive}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {stf.role !== 'SUPER_ADMIN' && (
                        <>
                          <button
                            onClick={() => toggleStaffStatus(stf.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              stf.status === 'Active'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={stf.status === 'Active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setStaffToDelete(stf)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Tambah Akun Staff Baru"
        subtitle="Registrasikan staf operasional gate, tiket, atau finance"
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Staff *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Staff *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@hce-event.id"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role / Peran Staff *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
            >
              {STAFF_ROLE_CONFIGS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full px-3 py-2 pr-9 text-xs border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddStaffOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors"
            >
              Buat Akun Staff
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={() => {
          if (staffToDelete) deleteStaff(staffToDelete.id);
        }}
        title="Hapus Akun Staff"
        message={`Apakah Anda yakin ingin menghapus akun staff "${staffToDelete?.name}"?`}
        confirmText="Hapus Akun"
        variant="danger"
      />
    </div>
  );
}
