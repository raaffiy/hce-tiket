'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHCEApp } from '@/context/HCEAppContext';
import { TicketBadgeType, TicketType, TicketVisibility } from '@/types/hce';
import { TicketCardPreview } from '@/components/tickets/TicketCardPreview';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Lock,
  Globe,
  Copy,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function CreateTicketPage() {
  const router = useRouter();
  const { createTicket, addToast } = useHCEApp();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>('PAID');
  const [badge, setBadge] = useState<TicketBadgeType>('EARLY');
  const [visibility, setVisibility] = useState<TicketVisibility>('PUBLIC');
  const [price, setPrice] = useState<number>(35000);
  const [quota, setQuota] = useState<number>(100);
  const [startDate, setStartDate] = useState('2026-09-01T08:00');
  const [endDate, setEndDate] = useState('2026-09-25T23:59');
  const [benefits, setBenefits] = useState<string[]>([
    'Akses Event Utama HCE 2026',
    'E-Ticket & QR Pass',
    'E-Certificate',
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Private link simulation state
  const [privateLink, setPrivateLink] = useState('https://hce-ticket.com/t/PRIVATE-HCE99A');
  const [copied, setCopied] = useState(false);

  // Benefit List handlers
  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setBenefits([...benefits, newBenefitInput.trim()]);
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(privateLink);
    setCopied(true);
    addToast('Private ticket link tersalin ke clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateLink = () => {
    const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const updated = `https://hce-ticket.com/t/PRIVATE-${newCode}`;
    setPrivateLink(updated);
    addToast('Link private berhasil diperbarui.', 'info');
  };

  // Submit Handler
  const handleSubmit = (status: 'Active' = 'Active') => {
    if (!name.trim()) {
      addToast('Harap isi Nama Tiket.', 'error');
      return;
    }
    if (quota <= 0) {
      addToast('Kuota tiket minimal 1.', 'error');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      addToast('Tanggal Selesai Penjualan harus lebih besar dari Tanggal Mulai.', 'error');
      return;
    }

    createTicket({
      name,
      description,
      type,
      badge,
      visibility,
      price: type === 'FREE' ? 0 : Number(price) || 0,
      quota: Number(quota),
      startDate,
      endDate,
      benefits,
      status,
      privateLink: visibility === 'PRIVATE' ? privateLink : undefined,
    });

    router.push('/admin/tickets');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tickets"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Buat Tiket Baru</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan tipe, harga, kuota, dan fasilitas tiket event HCE.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => router.push('/admin/tickets')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('Active')}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Publikasikan Tiket
          </button>
        </div>
      </div>

      {/* Main Form Grid: 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Informasi Dasar Tiket */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
              1. Informasi Dasar Tiket
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ticket Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Early Bird Ticket atau VIP Pass"
                className="w-full px-4 py-2.5 text-xs lg:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] text-[#102A43]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi Tiket</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Jelaskan mengenai akses atau keistimewaan tiket ini untuk peserta..."
                className="w-full px-4 py-2.5 text-xs lg:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] text-[#102A43]"
              />
            </div>
          </div>

          {/* Section 2: Tipe & Harga Tiket */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
              2. Tipe & Harga Tiket
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('PAID');
                  if (price === 0) setPrice(35000);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  type === 'PAID'
                    ? 'border-[#1A5E61] bg-[#1A5E61]/5 text-[#102A43]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="font-bold text-sm block">PAID TICKET</span>
                <span className="text-xs text-slate-500">Tiket berbayar dengan nominal Rupiah</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('FREE');
                  setPrice(0);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  type === 'FREE'
                    ? 'border-[#1A5E61] bg-[#1A5E61]/5 text-[#102A43]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="font-bold text-sm block">FREE TICKET</span>
                <span className="text-xs text-slate-500">Tiket gratis tanpa biaya (Rp 0)</span>
              </button>
            </div>

            {type === 'PAID' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Harga Tiket (IDR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    step={1000}
                    className="w-full pl-12 pr-4 py-2.5 text-xs lg:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] font-mono font-bold text-[#102A43]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Badge Ticket (EARLY / NORMAL / EXTEND) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
                3. Badge Tiket
              </h2>
              <p className="text-xs text-slate-500">Pilih badge penanda fase penjualan tiket.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* EARLY */}
              <button
                type="button"
                onClick={() => setBadge('EARLY')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  badge === 'EARLY'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="font-extrabold text-xs uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 inline-block mb-1">
                  EARLY
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Periode awal penjualan tiket.</p>
              </button>

              {/* NORMAL */}
              <button
                type="button"
                onClick={() => setBadge('NORMAL')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  badge === 'NORMAL'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="font-extrabold text-xs uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 inline-block mb-1">
                  NORMAL
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Periode utama penjualan tiket.</p>
              </button>

              {/* EXTEND */}
              <button
                type="button"
                onClick={() => setBadge('EXTEND')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  badge === 'EXTEND'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="font-extrabold text-xs uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700 inline-block mb-1">
                  EXTEND
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Perpanjangan periode penjualan tiket.</p>
              </button>
            </div>
          </div>

          {/* Section 4: Visibility (PUBLIC vs PRIVATE) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
              4. Visibilitas Tiket
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                  visibility === 'PUBLIC'
                    ? 'border-[#1A5E61] bg-[#1A5E61]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Globe className="w-5 h-5 text-[#1A5E61] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-[#102A43] block">PUBLIC</span>
                  <span className="text-xs text-slate-500">
                    Tiket muncul di katalog dan dapat diakses umum.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                  visibility === 'PRIVATE'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Lock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-purple-950 block">PRIVATE</span>
                  <span className="text-xs text-slate-500">
                    Hanya dapat diakses menggunakan link khusus.
                  </span>
                </div>
              </button>
            </div>

            {visibility === 'PRIVATE' && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 animate-in fade-in duration-200">
                <p className="text-xs text-purple-900 font-semibold">
                  Private ticket dapat dibagikan menggunakan link khusus:
                </p>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-200 text-xs font-mono text-purple-700">
                  <span className="truncate flex-1">{privateLink}</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-sans font-bold flex items-center gap-1 shrink-0 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Tersalin' : 'Copy Link'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateLink}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                    title="Regenerate link"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Kuota & Periode Penjualan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
              5. Kuota & Periode Penjualan
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Total Quota (Jumlah Peserta) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 text-xs lg:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] font-bold text-[#102A43]"
              />
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                <span>Quota: <b className="text-slate-800">{quota || 0}</b></span>
                <span>Sold: <b className="text-emerald-600">0</b></span>
                <span>Remaining: <b className="text-slate-800">{quota || 0}</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Start Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 text-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  End Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 text-[#102A43]"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Dynamic Benefits */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
                6. Fasilitas & Benefit Tiket
              </h2>
              <span className="text-xs text-slate-400">Dynamic List</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBenefitInput}
                onChange={(e) => setNewBenefitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
                placeholder="Contoh: Snack & Merchandise"
                className="flex-1 px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 text-[#102A43]"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 bg-[#102A43] hover:bg-[#1a3d60] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Benefit
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <span className="text-slate-800 font-medium">{b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Realtime Ticket Card Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Ticket Card Preview
              </span>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Realtime
              </span>
            </div>

            <TicketCardPreview
              name={name}
              description={description}
              type={type}
              badge={badge}
              visibility={visibility}
              price={price}
              quota={quota}
              benefits={benefits}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
