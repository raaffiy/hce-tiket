'use client';

import React, { useState } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { SponsorTier } from '@/types/hce';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Handshake,
  Award,
  Plus,
  Trash2,
  Globe,
  Share2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export default function PartnersAndSponsorsPage() {
  const {
    mediaPartners,
    sponsors,
    addMediaPartner,
    deleteMediaPartner,
    addSponsor,
    deleteSponsor,
  } = useHCEApp();

  const [activeTab, setActiveTab] = useState<'PARTNERS' | 'SPONSORS'>('PARTNERS');

  // Modal States
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'partner' | 'sponsor' } | null>(null);

  // Add Partner Form State
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    website: '',
    instagram: '',
    description: '',
    displayOrder: 1,
    status: 'Active' as 'Active' | 'Inactive',
  });

  // Add Sponsor Form State
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    website: '',
    description: '',
    tier: 'Gold' as SponsorTier,
    displayOrder: 1,
    status: 'Active' as 'Active' | 'Inactive',
  });

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name.trim()) return;
    addMediaPartner(partnerForm);
    setIsAddPartnerOpen(false);
    setPartnerForm({
      name: '',
      logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
      website: '',
      instagram: '',
      description: '',
      displayOrder: mediaPartners.length + 1,
      status: 'Active',
    });
  };

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.name.trim()) return;
    addSponsor(sponsorForm);
    setIsAddSponsorOpen(false);
    setSponsorForm({
      name: '',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      website: '',
      description: '',
      tier: 'Gold',
      displayOrder: sponsors.length + 1,
      status: 'Active',
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Media Partner & Sponsor
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Kelola data mitra publikasi dan brand sponsor yang tampil pada landing page event.
          </p>
        </div>

        <div>
          {activeTab === 'PARTNERS' ? (
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Tambah Media Partner
            </button>
          ) : (
            <button
              onClick={() => setIsAddSponsorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E05A1F] hover:bg-[#c94d17] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Tambah Sponsor
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('PARTNERS')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'PARTNERS'
              ? 'border-[#1A5E61] text-[#1A5E61]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Handshake className="w-4 h-4" />
          Media Partner ({mediaPartners.length})
        </button>

        <button
          onClick={() => setActiveTab('SPONSORS')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'SPONSORS'
              ? 'border-[#E05A1F] text-[#E05A1F]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          Sponsor Event ({sponsors.length})
        </button>
      </div>

      {/* TAB 1: MEDIA PARTNER */}
      {activeTab === 'PARTNERS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Media Partner</th>
                    <th className="px-4 py-4">Website / Media</th>
                    <th className="px-4 py-4">Deskripsi</th>
                    <th className="px-3 py-4 text-center">Urutan</th>
                    <th className="px-3 py-4 text-center">Status</th>
                    <th className="px-4 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mediaPartners.map((mp) => (
                    <tr key={mp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={mp.logo}
                            alt={mp.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{mp.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{mp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 space-y-0.5">
                        <a
                          href={mp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1A5E61] hover:underline font-medium flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-40">{mp.website.replace('https://', '')}</span>
                        </a>
                        <p className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" />
                          {mp.instagram}
                        </p>
                      </td>
                      <td className="px-4 py-4 max-w-xs text-slate-600 truncate">{mp.description}</td>
                      <td className="px-3 py-4 text-center font-bold text-slate-700">{mp.displayOrder}</td>
                      <td className="px-3 py-4 text-center">
                        <StatusBadge status={mp.status} size="sm" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setItemToDelete({ id: mp.id, name: mp.name, type: 'partner' })}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPONSORS */}
      {activeTab === 'SPONSORS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Sponsor Brand</th>
                    <th className="px-4 py-4">Sponsor Tier</th>
                    <th className="px-4 py-4">Website</th>
                    <th className="px-4 py-4">Deskripsi</th>
                    <th className="px-3 py-4 text-center">Urutan</th>
                    <th className="px-3 py-4 text-center">Status</th>
                    <th className="px-4 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sponsors.map((sp) => {
                    const tierColors: Record<SponsorTier, string> = {
                      'Main Sponsor': 'bg-purple-100 text-purple-800 border-purple-200',
                      Gold: 'bg-amber-100 text-amber-800 border-amber-200',
                      Silver: 'bg-slate-200 text-slate-800 border-slate-300',
                      Bronze: 'bg-orange-100 text-orange-800 border-orange-200',
                      Partner: 'bg-sky-100 text-sky-800 border-sky-200',
                    };

                    return (
                      <tr key={sp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={sp.logo}
                              alt={sp.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">{sp.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{sp.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${tierColors[sp.tier]}`}
                          >
                            {sp.tier}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={sp.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1A5E61] hover:underline font-medium flex items-center gap-1"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate max-w-40">{sp.website.replace('https://', '')}</span>
                          </a>
                        </td>
                        <td className="px-4 py-4 max-w-xs text-slate-600 truncate">{sp.description}</td>
                        <td className="px-3 py-4 text-center font-bold text-slate-700">{sp.displayOrder}</td>
                        <td className="px-3 py-4 text-center">
                          <StatusBadge status={sp.status} size="sm" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setItemToDelete({ id: sp.id, name: sp.name, type: 'sponsor' })}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LANDING PAGE PREVIEW SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-[#102A43] to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Preview Tampilan Landing Page</h3>
              <p className="text-xs text-slate-300">
                Simulasi visual bagian Media Partner & Sponsor pada website publik HCE 2026.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
            Live Preview Component
          </span>
        </div>

        {/* Sponsor Grid Section */}
        <div>
          <p className="text-center text-xs uppercase tracking-widest font-bold text-[#E05A1F] mb-4">
            — OFFICIAL SPONSORS —
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {sponsors
              .filter((s) => s.status === 'Active')
              .map((s) => (
                <div
                  key={s.id}
                  className="bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 backdrop-blur-xs transition-all hover:scale-105"
                >
                  <img
                    src={s.logo}
                    alt={s.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/20"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-tight">{s.name}</p>
                    <span className="text-[10px] text-amber-400 font-semibold">{s.tier}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Media Partner Grid Section */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-center text-xs uppercase tracking-widest font-bold text-sky-400 mb-4">
            — MEDIA PARTNERS —
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            {mediaPartners
              .filter((m) => m.status === 'Active')
              .map((m) => (
                <div
                  key={m.id}
                  className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2.5 backdrop-blur-xs transition-all"
                >
                  <img
                    src={m.logo}
                    alt={m.name}
                    className="w-7 h-7 rounded-lg object-cover border border-white/20"
                  />
                  <span className="text-xs font-medium text-slate-200">{m.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Add Media Partner Modal */}
      <Modal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
        title="Tambah Media Partner"
        subtitle="Masukkan profil media rekanan publikasi"
      >
        <form onSubmit={handleCreatePartner} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Media Partner *</label>
            <input
              type="text"
              required
              value={partnerForm.name}
              onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
              placeholder="Contoh: Media Kampus ID"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          {/* Foto / Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto / Logo Media Partner</label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {partnerForm.logo ? (
                  <img
                    src={partnerForm.logo}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#1A5E61]" />
                  <span>Pilih Foto dari Komputer</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setPartnerForm({
                              ...partnerForm,
                              logo: event.target.result as string,
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format PNG, JPG, JPEG, atau WebP (Maks. 2MB).
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Atau Gunakan Logo Image URL</label>
            <input
              type="text"
              value={partnerForm.logo}
              onChange={(e) => setPartnerForm({ ...partnerForm, logo: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={partnerForm.website}
                onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instagram</label>
              <input
                type="text"
                value={partnerForm.instagram}
                onChange={(e) => setPartnerForm({ ...partnerForm, instagram: e.target.value })}
                placeholder="@mediakampus"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={partnerForm.description}
              onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddPartnerOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] rounded-xl"
            >
              Simpan Media Partner
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Sponsor Modal */}
      <Modal
        isOpen={isAddSponsorOpen}
        onClose={() => setIsAddSponsorOpen(false)}
        title="Tambah Brand Sponsor"
        subtitle="Daftarkan tier dan profil sponsor event"
      >
        <form onSubmit={handleCreateSponsor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sponsor *</label>
            <input
              type="text"
              required
              value={sponsorForm.name}
              onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
              placeholder="Contoh: PT Teknologi Utama"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sponsor Tier *</label>
              <select
                value={sponsorForm.tier}
                onChange={(e) => setSponsorForm({ ...sponsorForm, tier: e.target.value as SponsorTier })}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                <option value="Main Sponsor">Main Sponsor</option>
                <option value="Gold">Gold Sponsor</option>
                <option value="Silver">Silver Sponsor</option>
                <option value="Bronze">Bronze Sponsor</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={sponsorForm.website}
                onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          {/* Foto / Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto / Logo Sponsor</label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {sponsorForm.logo ? (
                  <img
                    src={sponsorForm.logo}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#E05A1F]" />
                  <span>Pilih Foto dari Komputer</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setSponsorForm({
                              ...sponsorForm,
                              logo: event.target.result as string,
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format PNG, JPG, JPEG, atau WebP (Maks. 2MB).
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Atau Gunakan Logo Image URL</label>
            <input
              type="text"
              value={sponsorForm.logo}
              onChange={(e) => setSponsorForm({ ...sponsorForm, logo: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={sponsorForm.description}
              onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddSponsorOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#E05A1F] rounded-xl"
            >
              Simpan Sponsor
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (!itemToDelete) return;
          if (itemToDelete.type === 'partner') {
            deleteMediaPartner(itemToDelete.id);
          } else {
            deleteSponsor(itemToDelete.id);
          }
        }}
        title={`Hapus ${itemToDelete?.type === 'partner' ? 'Media Partner' : 'Sponsor'}`}
        message={`Apakah Anda yakin ingin menghapus "${itemToDelete?.name}"?`}
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}
