'use client';

import React, { useState, useMemo } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { SponsorTier } from '@/types/hce';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FilterSelect } from '@/components/ui/FormControls';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Handshake,
  Award,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
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

  // Filter
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // Modal States
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'partner' | 'sponsor';
  } | null>(null);

  // Add Partner Form State
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    logo: '/media_partners/LOGO INFO OLIMPIADE.png',
  });

  // Add Sponsor Form State
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    tier: 'Gold' as SponsorTier,
  });

  // Filtered Sponsors
  const filteredSponsors = useMemo(() => {
    return sponsors.filter((sp) => {
      return tierFilter === 'ALL' || sp.tier === tierFilter;
    });
  }, [sponsors, tierFilter]);

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name.trim()) return;
    addMediaPartner({
      name: partnerForm.name,
      logo: partnerForm.logo,
      website: '',
      instagram: '',
      description: '',
      displayOrder: mediaPartners.length + 1,
      status: 'Active',
    });
    setIsAddPartnerOpen(false);
    setPartnerForm({
      name: '',
      logo: '/media_partners/LOGO INFO OLIMPIADE.png',
    });
  };

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.name.trim()) return;
    addSponsor({
      name: sponsorForm.name,
      logo: sponsorForm.logo,
      tier: sponsorForm.tier,
      website: '',
      description: '',
      displayOrder: sponsors.length + 1,
      status: 'Active',
    });
    setIsAddSponsorOpen(false);
    setSponsorForm({
      name: '',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      tier: 'Gold',
    });
  };

  const tierColors: Record<SponsorTier, string> = {
    'Main Sponsor': 'bg-purple-100 text-purple-800 border-purple-200',
    Gold: 'bg-amber-100 text-amber-800 border-amber-200',
    Silver: 'bg-slate-200 text-slate-800 border-slate-300',
    Bronze: 'bg-orange-100 text-orange-800 border-orange-200',
    Partner: 'bg-sky-100 text-sky-800 border-sky-200',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Media Partner & Sponsor
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Kelola data mitra publikasi dan brand sponsor resmi HIPMI Collab Expo.
          </p>
        </div>

        <div>
          {activeTab === 'PARTNERS' ? (
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Media Partner
            </button>
          ) : (
            <button
              onClick={() => setIsAddSponsorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E05A1F] hover:bg-[#c94d17] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Sponsor
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#1A5E61]">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Media Partner</p>
              <h3 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
                {mediaPartners.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E05A1F]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Sponsor Event</p>
              <h3 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
                {sponsors.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 gap-4">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('PARTNERS')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
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
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'SPONSORS'
                ? 'border-[#E05A1F] text-[#E05A1F]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            Sponsor Event ({sponsors.length})
          </button>
        </div>

        {/* Filter Tier Sponsor */}
        {activeTab === 'SPONSORS' && (
          <div className="pb-2 sm:pb-0 w-full sm:w-56">
            <FilterSelect
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Semua Tier Sponsor' },
                { value: 'Main Sponsor', label: 'Main Sponsor' },
                { value: 'Gold', label: 'Gold Sponsor' },
                { value: 'Silver', label: 'Silver Sponsor' },
                { value: 'Bronze', label: 'Bronze Sponsor' },
                { value: 'Partner', label: 'Partner' },
              ]}
            />
          </div>
        )}
      </div>

      {/* TAB 1: MEDIA PARTNER (KOTAK-KOTAK / GRID) */}
      {activeTab === 'PARTNERS' && (
        <div>
          {mediaPartners.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
              <EmptyState
                title="Tidak ada media partner"
                description="Belum ada data media partner yang didaftarkan."
                icon={Handshake}
                action={{
                  label: 'Tambah Media Partner',
                  onClick: () => setIsAddPartnerOpen(true),
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
                    onClick={() =>
                      setItemToDelete({ id: mp.id, name: mp.name, type: 'partner' })
                    }
                    title="Hapus Media Partner"
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer opacity-80 group-hover:opacity-100 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Logo Container */}
                  <div className="w-full aspect-square rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden">
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
      )}

      {/* TAB 2: SPONSORS (KOTAK-KOTAK / GRID) */}
      {activeTab === 'SPONSORS' && (
        <div>
          {filteredSponsors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
              <EmptyState
                title="Tidak ada sponsor"
                description="Belum ada data brand sponsor yang sesuai dengan filter tier."
                icon={Award}
                action={{
                  label: 'Reset Filter',
                  onClick: () => setTierFilter('ALL'),
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSponsors.map((sp) => (
                <div
                  key={sp.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-[#E05A1F]/40 transition-all flex flex-col justify-between relative"
                >
                  {/* Delete button */}
                  <button
                    onClick={() =>
                      setItemToDelete({ id: sp.id, name: sp.name, type: 'sponsor' })
                    }
                    title="Hapus Sponsor"
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer opacity-80 group-hover:opacity-100 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Logo Container */}
                  <div className="w-full aspect-square rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden">
                    <img
                      src={sp.logo}
                      alt={sp.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Tier, Name & ID */}
                  <div className="text-center">
                    <div className="mb-1.5">
                      <span
                        className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                          tierColors[sp.tier] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sp.tier}
                      </span>
                    </div>
                    <h4
                      className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mb-0.5"
                      title={sp.name}
                    >
                      {sp.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono font-medium block">
                      {sp.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Media Partner Modal */}
      <Modal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
        title="Tambah Media Partner"
        subtitle="Masukkan nama dan foto/logo media partner publikasi"
      >
        <form onSubmit={handleCreatePartner} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Media Partner *
            </label>
            <input
              type="text"
              required
              value={partnerForm.name}
              onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
              placeholder="Contoh: Media Kampus ID"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]"
            />
          </div>

          {/* Foto / Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Foto / Logo Media Partner
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {partnerForm.logo ? (
                  <img
                    src={partnerForm.logo}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1"
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPartnerOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl transition-colors cursor-pointer"
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
        subtitle="Daftarkan nama brand, tier, dan foto/logo sponsor event"
      >
        <form onSubmit={handleCreateSponsor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Brand Sponsor *
            </label>
            <input
              type="text"
              required
              value={sponsorForm.name}
              onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
              placeholder="Contoh: PT Teknologi Utama"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05A1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tier Sponsor *
            </label>
            <select
              value={sponsorForm.tier}
              onChange={(e) =>
                setSponsorForm({
                  ...sponsorForm,
                  tier: e.target.value as SponsorTier,
                })
              }
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05A1F] bg-white"
            >
              <option value="Main Sponsor">Main Sponsor</option>
              <option value="Gold">Gold Sponsor</option>
              <option value="Silver">Silver Sponsor</option>
              <option value="Bronze">Bronze Sponsor</option>
              <option value="Partner">Partner</option>
            </select>
          </div>

          {/* Foto / Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Foto / Logo Sponsor
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {sponsorForm.logo ? (
                  <img
                    src={sponsorForm.logo}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1"
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSponsorOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#E05A1F] hover:bg-[#c94d17] rounded-xl transition-colors cursor-pointer"
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
