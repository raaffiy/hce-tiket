'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, TicketBadgeType, TicketType, TicketVisibility, TicketStatus } from '@/types/hce';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Trash2,
  Globe,
  Lock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Save,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { normalizePrivateTicketUrl } from '@/lib/supabaseServices';

interface EditTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Ticket>) => Promise<void> | void;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>('PAID');
  const [badge, setBadge] = useState<TicketBadgeType>('NORMAL');
  const [visibility, setVisibility] = useState<TicketVisibility>('PUBLIC');
  const [price, setPrice] = useState<number>(50000);
  const [quota, setQuota] = useState<number>(100);
  const [status, setStatus] = useState<TicketStatus>('Active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [privateLink, setPrivateLink] = useState('');
  const [copiedPrivateLink, setCopiedPrivateLink] = useState(false);

  const getFallbackPrivateUrl = (codeOrId: string) => {
    return normalizePrivateTicketUrl(codeOrId);
  };

  // Sync state whenever selected ticket changes
  useEffect(() => {
    if (ticket) {
      setName(ticket.name || '');
      setDescription(ticket.description || '');
      setType(ticket.type || 'PAID');
      setBadge(ticket.badge || 'NORMAL');
      setVisibility(ticket.visibility || 'PUBLIC');
      setPrice(ticket.price || 0);
      setQuota(ticket.quota || 0);
      setStatus(ticket.status || 'Active');
      setStartDate(ticket.startDate || '');
      setEndDate(ticket.endDate || '');
      setBenefits(ticket.benefits || []);
      setPrivateLink(ticket.privateLink || getFallbackPrivateUrl(ticket.id));
      setNewBenefitInput('');
      setErrorMessage(null);
    }
  }, [ticket]);

  if (!ticket) return null;

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
    setCopiedPrivateLink(true);
    setTimeout(() => setCopiedPrivateLink(false), 2000);
  };

  const handleRegenerateLink = () => {
    const newCode = 'TCK-PRV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    setPrivateLink(getFallbackPrivateUrl(newCode));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama tiket wajib diisi.');
      return;
    }

    if (quota <= 0) {
      setErrorMessage('Kuota tiket harus lebih dari 0.');
      return;
    }

    if (quota < ticket.sold) {
      setErrorMessage(`Kuota tidak boleh lebih kecil dari jumlah tiket yang sudah terjual (${ticket.sold} tiket).`);
      return;
    }

    setIsSaving(true);
    try {
      const calculatedRemaining = Math.max(0, quota - ticket.sold);
      let calculatedStatus = status;
      if (calculatedRemaining === 0 && status === 'Active') {
        calculatedStatus = 'Sold Out';
      }

      await onSave(ticket.id, {
        name: name.trim(),
        description: description.trim(),
        type,
        badge,
        visibility,
        price: type === 'FREE' ? 0 : Number(price) || 0,
        quota: Number(quota),
        remaining: calculatedRemaining,
        status: calculatedStatus,
        startDate,
        endDate,
        benefits,
        privateLink: visibility === 'PRIVATE' ? (privateLink || getFallbackPrivateUrl(ticket.id)) : undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan perubahan tiket.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Tiket: ${ticket.name}`}
      subtitle={`ID: ${ticket.id} • Terjual: ${ticket.sold} Tiket`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Nama & Deskripsi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Tiket <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Presale / Regular atau VIP Experience"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Tiket</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat mengenai tiket..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61]"
          />
        </div>

        {/* 2. Tipe & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Tiket</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('PAID');
                  if (price === 0) setPrice(50000);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'PAID'
                    ? 'bg-[#1A5E61] text-white border-[#1A5E61]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                PAID
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('FREE');
                  setPrice(0);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'FREE'
                    ? 'bg-[#1A5E61] text-white border-[#1A5E61]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                FREE
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  visibility === 'PUBLIC'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-3 h-3" /> Public
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisibility('PRIVATE');
                  if (!privateLink) {
                    setPrivateLink(getFallbackPrivateUrl(ticket.id));
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  visibility === 'PRIVATE'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3 h-3" /> Private
              </button>
            </div>
          </div>
        </div>

        {visibility === 'PRIVATE' && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-700" />
                <span>Private Ticket URL</span>
              </label>
              <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                Eksklusif / Tersembunyi
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-purple-200 text-xs font-mono text-purple-900">
              <input
                type="text"
                value={privateLink}
                onChange={(e) => setPrivateLink(e.target.value)}
                placeholder="https://.../?ticket=..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-purple-900 truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-sans font-bold rounded-md flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copiedPrivateLink ? 'Tersalin!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={handleRegenerateLink}
                title="Generate kode private baru"
                className="p-1 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10.5px] text-purple-800 leading-snug">
              Bagikan link ini kepada tamu undangan. Tiket akan langsung terbuka di halaman registrasi.
            </p>
          </div>
        )}

        {/* 3. Badge Kategori & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Badge Kategori</label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value as TicketBadgeType)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
            >
              <option value="EARLY">EARLY (Early Bird)</option>
              <option value="NORMAL">NORMAL (Regular / Presale)</option>
              <option value="EXTEND">EXTEND (VIP / Extended)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Penjualan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="Active">Active (Tersedia)</option>
              <option value="Sold Out">Sold Out (Habis)</option>
              <option value="Archived">Archived (Diarsipkan)</option>
            </select>
          </div>
        </div>

        {/* 4. Harga & Kuota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Harga Tiket (IDR) {type === 'FREE' && '(Gratis)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs font-mono">
                Rp
              </span>
              <input
                type="number"
                disabled={type === 'FREE'}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={1000}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kuota Tiket <span className="text-slate-400 font-normal">(Min: {ticket.sold})</span>
            </label>
            <input
              type="number"
              required
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              min={ticket.sold || 1}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
            />
          </div>
        </div>

        {/* 5. Periode Penjualan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai Penjualan</label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai Penjualan</label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* 6. Fasilitas / Benefit Tiket */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Fasilitas & Benefit Tiket</span>
            <span className="text-[10px] text-slate-400 font-normal">{benefits.length} Benefit</span>
          </label>

          <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-700">{b}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(i)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
              placeholder="Tambah benefit tiket baru..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddBenefit}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1A5E61] hover:bg-[#134648] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
