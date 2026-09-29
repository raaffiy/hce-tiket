'use client';

import React, { useState } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Staff, StaffRole } from '@/types/hce';
import { STAFF_ROLE_CONFIGS } from '@/mock/mockStaff';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { staffList, addStaff, deleteStaff, addToast } = useHCEApp();

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('STAFF');
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
    setRole('STAFF');
  };

  const getRoleBadge = (roleKey: StaffRole) => {
    if (roleKey === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-purple-100 text-purple-800 border-purple-200">
          <Shield className="w-3 h-3" />
          Super Admin
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
        <QrCode className="w-3 h-3" />
        Staff (Check-In)
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
            Kelola akun petugas event dan pembagian wewenang peran (Super Admin & Staff).
          </p>
        </div>

        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Akun Staff
        </button>
      </div>

      {/* 2 Roles Privilege Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-purple-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Super Admin</h3>
                <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">Akses Penuh (Full Access)</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {staffList.filter((s) => s.role === 'SUPER_ADMIN').length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dapat mengakses seluruh fitur dan modul sistem: Dashboard, Tiket, Transaksi, Check-In, Master Data Peserta, Partner/Sponsor, serta Manajemen Staff.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Staff</h3>
                <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Akses Khusus Check-In</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {staffList.filter((s) => s.role === 'STAFF').length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khusus untuk staf operasional gerbang (gate keeper). Hanya memiliki akses ke fitur <strong>Check-In</strong> untuk memindai tiket QR Code dan verifikasi kehadiran peserta.
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Nama & Akun</th>
                <th className="px-4 py-4">Role / Wewenang</th>
                <th className="px-4 py-4">Tanggal Dibuat</th>
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
                  <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">{stf.createdDate}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {stf.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => setStaffToDelete(stf)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        subtitle="Pilih role Super Admin (Semua fitur) atau Staff (Akses Check-in)"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Role / Peran Akses *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  role === 'SUPER_ADMIN'
                    ? 'border-purple-500 bg-purple-50/50 ring-1 ring-purple-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="SUPER_ADMIN"
                    checked={role === 'SUPER_ADMIN'}
                    onChange={() => setRole('SUPER_ADMIN')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-xs text-slate-800">Super Admin</span>
                </div>
                <span className="text-[11px] text-slate-500 pl-6">
                  Akses ke seluruh fitur dan konfigurasi sistem.
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  role === 'STAFF'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="STAFF"
                    checked={role === 'STAFF'}
                    onChange={() => setRole('STAFF')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-xs text-slate-800">Staff (Check-In)</span>
                </div>
                <span className="text-[11px] text-slate-500 pl-6">
                  Akses operasional khusus fitur Check-In tiket.
                </span>
              </label>
            </div>
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
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors cursor-pointer"
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
