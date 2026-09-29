'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHCEApp } from '@/context/HCEAppContext';
import { Ticket } from '@/types/hce';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TicketBadge } from '@/components/ui/TicketBadge';
import { SearchInput, FilterSelect } from '@/components/ui/FormControls';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  MoreVertical,
  Eye,
  Copy,
  Archive,
  Trash2,
  Ticket as TicketIcon,
  Globe,
  Lock,
  CheckCircle,
  Calendar,
  Users,
} from 'lucide-react';

export default function TicketManagementPage() {
  const { tickets, deleteTicket, duplicateTicket, archiveTicket } = useHCEApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');

  // Modal / Action States
  const [selectedTicketForView, setSelectedTicketForView] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [ticketToArchive, setTicketToArchive] = useState<Ticket | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchVisibility = visibilityFilter === 'ALL' || t.visibility === visibilityFilter;

      return matchSearch && matchStatus && matchType && matchVisibility;
    });
  }, [tickets, searchQuery, statusFilter, typeFilter, visibilityFilter]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Ticket Management
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Kelola data kategori tiket, harga, kuota, dan status penjualan event.
          </p>
        </div>

        <Link
          href="/admin/tickets/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Tiket
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau ID tiket..."
        />

        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'Semua Status' },
            { value: 'Active', label: 'Active (Aktif)' },
            { value: 'Sold Out', label: 'Sold Out (Habis)' },
            { value: 'Archived', label: 'Archived (Diarsipkan)' },
          ]}
        />

        <FilterSelect
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'Semua Tipe' },
            { value: 'FREE', label: 'Free Ticket' },
            { value: 'PAID', label: 'Paid Ticket' },
          ]}
        />

        <FilterSelect
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'Semua Visibility' },
            { value: 'PUBLIC', label: 'Public' },
            { value: 'PRIVATE', label: 'Private' },
          ]}
        />
      </div>

      {/* Ticket Grid (Kotak-Kotak) */}
      <div>
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8">
            <EmptyState
              title="Belum ada data tiket"
              description="Tidak ada tiket yang sesuai dengan kriteria pencarian dan filter Anda saat ini."
              icon={TicketIcon}
              action={{
                label: 'Reset Filter',
                onClick: () => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                  setVisibilityFilter('ALL');
                },
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTickets.map((ticket) => {
              const percentSold =
                ticket.quota > 0 ? Math.round((ticket.sold / ticket.quota) * 100) : 0;

              return (
                <div
                  key={ticket.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-[#1A5E61]/40 transition-all flex flex-col justify-between relative"
                >
                  {/* Top Bar: Badges & Action Dropdown */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <TicketBadge badge={ticket.badge} size="sm" />
                        <StatusBadge status={ticket.type} size="sm" />
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                            ticket.visibility === 'PUBLIC'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : 'bg-purple-100 text-purple-800 border-purple-300'
                          }`}
                        >
                          {ticket.visibility === 'PUBLIC' ? (
                            <Globe className="w-3 h-3 text-sky-700" />
                          ) : (
                            <Lock className="w-3 h-3 text-purple-700" />
                          )}
                          {ticket.visibility}
                        </span>
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdownId(
                              activeDropdownId === ticket.id ? null : ticket.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeDropdownId === ticket.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveDropdownId(null)}
                            />
                            <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs text-left animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => {
                                  setSelectedTicketForView(ticket);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                Lihat Detail
                              </button>

                              <button
                                onClick={() => {
                                  duplicateTicket(ticket.id);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                Duplikasi Tiket
                              </button>

                              <button
                                onClick={() => {
                                  setTicketToArchive(ticket);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5 text-amber-500" />
                                Arsipkan Tiket
                              </button>

                              <div className="h-px bg-slate-100 my-1" />

                              <button
                                onClick={() => {
                                  setTicketToDelete(ticket);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                Hapus Tiket
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ticket Title & ID */}
                    <div className="mb-3">
                      <h3
                        className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-[#1A5E61] transition-colors"
                        title={ticket.name}
                      >
                        {ticket.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {ticket.id}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Harga Tiket
                      </p>
                      <p className="text-xl font-extrabold text-[#102A43] font-mono">
                        {ticket.type === 'FREE' ? 'Gratis' : formatRupiah(ticket.price)}
                      </p>
                    </div>

                    {/* Quota Progress Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Terjual: {ticket.sold} / {ticket.quota}
                        </span>
                        <span className="text-[#1A5E61] font-bold">{percentSold}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1A5E61] to-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(percentSold, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                        <span>Sisa Kuota: {ticket.remaining}</span>
                        <StatusBadge status={ticket.status} size="sm" />
                      </div>
                    </div>

                    {/* Sales Period */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mb-4">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {ticket.startDate.split('T')[0]} s/d {ticket.endDate.split('T')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedTicketForView(ticket)}
                      className="text-xs font-bold text-[#1A5E61] hover:text-[#134648] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Detail & Benefit
                    </button>

                    <button
                      onClick={() => setTicketToDelete(ticket)}
                      title="Hapus Tiket"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicketForView && (
        <Modal
          isOpen={!!selectedTicketForView}
          onClose={() => setSelectedTicketForView(null)}
          title={`Detail Tiket: ${selectedTicketForView.name}`}
          subtitle={`ID: ${selectedTicketForView.id}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TicketBadge badge={selectedTicketForView.badge} />
              <StatusBadge status={selectedTicketForView.status} />
              <StatusBadge status={selectedTicketForView.visibility} />
            </div>

            <p className="text-xs text-slate-600">{selectedTicketForView.description}</p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Harga</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedTicketForView.type === 'FREE'
                    ? 'Gratis'
                    : formatRupiah(selectedTicketForView.price)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kuota / Terjual / Sisa</span>
                <span className="font-bold text-slate-800">
                  {selectedTicketForView.quota} / {selectedTicketForView.sold} /{' '}
                  {selectedTicketForView.remaining}
                </span>
              </div>
            </div>

            {selectedTicketForView.visibility === 'PRIVATE' && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-xs font-bold text-purple-900 mb-1">Private Ticket Link:</p>
                <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-purple-200 text-xs font-mono text-purple-700">
                  <span className="truncate">
                    {selectedTicketForView.privateLink || 'https://hce-ticket.com/t/PRIVATE-LINK'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedTicketForView.privateLink || '')}
                    className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-purple-800 font-sans font-semibold text-[11px] cursor-pointer"
                  >
                    {copiedLink ? 'Tersalin!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">Benefit & Fasilitas:</h5>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedTicketForView.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!ticketToDelete}
        onClose={() => setTicketToDelete(null)}
        onConfirm={() => {
          if (ticketToDelete) deleteTicket(ticketToDelete.id);
        }}
        title="Hapus Tiket"
        message={`Apakah Anda yakin ingin menghapus tiket "${ticketToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`}
        confirmText="Hapus Tiket"
        variant="danger"
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!ticketToArchive}
        onClose={() => setTicketToArchive(null)}
        onConfirm={() => {
          if (ticketToArchive) archiveTicket(ticketToArchive.id);
        }}
        title="Arsipkan Tiket"
        message={`Apakah Anda yakin ingin mengarsipkan tiket "${ticketToArchive?.name}"? Tiket tidak akan muncul di publik.`}
        confirmText="Arsipkan"
        variant="warning"
      />
    </div>
  );
}
