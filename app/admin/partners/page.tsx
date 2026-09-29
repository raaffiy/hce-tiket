'use client';

import React, { useState, useEffect } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { MediaPartner } from '@/types/hce';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { uploadPartnerLogoToSupabase } from '@/lib/supabaseServices';
import {
  Handshake,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function PartnersAndMediaPage() {
  const { mediaPartners, addMediaPartner, deleteMediaPartner, addToast } = useHCEApp();

  // Modal States
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<MediaPartner | null>(null);

  // Add Partner Form State
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [manualUrl, setManualUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clean up object URL when modal closes or changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle local file selection (Preview only, does NOT upload until user clicks Save)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (Maximum 500KB)
    const MAX_SIZE = 500 * 1024; // 500 KB
    if (file.size > MAX_SIZE) {
      setFileError('Ukuran file terlalu besar (Maksimal 500KB).');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setFileError(null);
    setFormError(null);
    setSelectedFile(file);

    // Create local instant preview URL
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama media partner wajib diisi.');
      return;
    }

    if (!selectedFile && !manualUrl.trim()) {
      setFormError('Silakan pilih file logo media partner (Maks. 500KB) atau masukkan URL logo.');
      return;
    }

    setIsSubmitting(true);
    let finalLogoUrl = manualUrl.trim();

    try {
      // 1. Upload file to Supabase Storage ONLY upon clicking Submit button
      if (selectedFile) {
        const uploadRes = await uploadPartnerLogoToSupabase(selectedFile);
        if (!uploadRes.success || !uploadRes.url) {
          setFormError(uploadRes.error || 'Gagal mengunggah logo ke Supabase Storage.');
          setIsSubmitting(false);
          return;
        }
        finalLogoUrl = uploadRes.url;
      }

      // 2. Insert into media_partners database
      const res = await addMediaPartner({
        name: name.trim(),
        logo: finalLogoUrl,
        website: '',
        instagram: '',
        description: '',
        displayOrder: mediaPartners.length + 1,
        status: 'Active',
      });

      if (res.success) {
        setIsAddPartnerOpen(false);
        setName('');
        setSelectedFile(null);
        setPreviewUrl('');
        setManualUrl('');
        setFileError(null);
        setFormError(null);
      } else {
        setFormError(res.error || 'Gagal menyimpan media partner ke database.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header (Synchronized with Homepage "Partnership & Media Network") */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#1A5E61] border border-teal-200/80 text-[11px] font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E05A1F]" />
            <span>Partnership &amp; Media Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Didukung &amp; Bekerja Sama Dengan
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5">
            Kelola data dan logo jaringan media partner yang ditampilkan pada halaman utama website.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setSelectedFile(null);
            setPreviewUrl('');
            setManualUrl('');
            setFormError(null);
            setFileError(null);
            setIsAddPartnerOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          Tambah Media Partner
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#1A5E61]">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Media Partner Aktif</p>
            <h3 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
              {mediaPartners.length} Mitra Publikasi
            </h3>
          </div>
        </div>
      </div>

      {/* Media Partners Grid */}
      <div>
        {mediaPartners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <EmptyState
              title="Tidak ada media partner"
              description="Belum ada data media partner yang didaftarkan ke Supabase."
              icon={Handshake}
              action={{
                label: 'Tambah Media Partner',
                onClick: () => {
                  setName('');
                  setSelectedFile(null);
                  setPreviewUrl('');
                  setManualUrl('');
                  setFormError(null);
                  setFileError(null);
                  setIsAddPartnerOpen(true);
                },
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mediaPartners.map((mp) => (
              <div
                key={mp.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-[#1A5E61]/40 transition-all flex flex-col justify-between relative"
              >
                {/* Delete button */}
                <button
                  onClick={() => setPartnerToDelete(mp)}
                  title="Hapus Media Partner"
                  className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer opacity-80 group-hover:opacity-100 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Logo Container */}
                <div className="w-full aspect-square rounded-xl bg-[#F8F1E5]/50 border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden">
                  <img
                    src={mp.logo}
                    alt={mp.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Name & ID */}
                <div className="text-center">
                  <h4
                    className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mb-0.5"
                    title={mp.name}
                  >
                    {mp.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono font-medium block">
                    {mp.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Media Partner Modal */}
      <Modal
        isOpen={isAddPartnerOpen}
        onClose={() => !isSubmitting && setIsAddPartnerOpen(false)}
        title="Tambah Media Partner"
        subtitle="Pilih logo (Maks. 500KB) yang akan disimpan ke Supabase Storage"
      >
        <form onSubmit={handleCreatePartner} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Media Partner *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Info Olimpiade / Pojok Event"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]"
            />
          </div>

          {/* Foto / Logo Upload preview (only uploaded when pressing Simpan) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Foto / Logo (Maks. 500KB) *
            </label>
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : manualUrl ? (
                  <img
                    src={manualUrl}
                    alt="Manual Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#1A5E61]" />
                  <span>{selectedFile ? 'Ganti File Gambar' : 'Pilih File Logo (Komputer)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>

                {selectedFile && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  Format: PNG, JPG, JPEG, SVG, WebP. <strong>Maksimal ukuran: 500KB</strong>.
                </p>
              </div>
            </div>

            {fileError && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{fileError}</span>
              </div>
            )}
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAddPartnerOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!selectedFile && !manualUrl.trim())}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? 'Mengunggah & Menyimpan...' : 'Simpan Media Partner'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!partnerToDelete}
        onClose={() => setPartnerToDelete(null)}
        onConfirm={() => {
          if (partnerToDelete) {
            deleteMediaPartner(partnerToDelete.id);
            setPartnerToDelete(null);
          }
        }}
        title="Hapus Media Partner"
        message={`Apakah Anda yakin ingin menghapus media partner "${partnerToDelete?.name}"? Data dan file gambar di Supabase Storage akan dihapus secara permanen.`}
        confirmText="Hapus Mitra"
        variant="danger"
      />
    </div>
  );
}
