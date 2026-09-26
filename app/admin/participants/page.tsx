'use client';

import React, { useState, useMemo } from 'react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Participant } from '@/types/hce';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterSelect } from '@/components/ui/FormControls';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
} from 'lucide-react';

export default function ParticipantsPage() {
  const { participants, stats, exportParticipantsCSV } = useHCEApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('ALL');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [checkInFilter, setCheckInFilter] = useState<string>('ALL');

  // Dynamic filter options
  const uniqueTickets = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => set.add(p.ticketName));
    return Array.from(set).map((name) => ({ value: name, label: name }));
  }, [participants]);

  const uniqueFaculties = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.faculty) set.add(p.faculty);
    });
    return Array.from(set).map((f) => ({ value: f, label: f }));
  }, [participants]);

  // Filter Logic
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.whatsapp.includes(searchQuery);

      const matchTicket = ticketFilter === 'ALL' || p.ticketName === ticketFilter;
      const matchFaculty = facultyFilter === 'ALL' || p.faculty === facultyFilter;
      const matchCheckIn = checkInFilter === 'ALL' || p.checkInStatus === checkInFilter;

      return matchSearch && matchTicket && matchFaculty && matchCheckIn;
    }).slice(0, 50);
  }, [participants, searchQuery, ticketFilter, facultyFilter, checkInFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Participant Management</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Kelola seluruh data peserta yang membeli atau memiliki tiket event HCE.
          </p>
        </div>

        <button
          onClick={exportParticipantsCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5E61] hover:bg-[#134648] text-white text-xs lg:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama, NIM, email, order ID..."
        />

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
      </div>

      {/* Participant Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredParticipants.length === 0 ? (
          <EmptyState
            title="Belum ada participant"
            description="Tidak ada data peserta yang cocok dengan kriteria filter saat ini."
            icon={Users}
            action={{
              label: 'Reset Filter',
              onClick: () => {
                setSearchQuery('');
                setTicketFilter('ALL');
                setFacultyFilter('ALL');
                setCheckInFilter('ALL');
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-center">NO</th>
                  <th className="px-4 py-4">ORDER ID</th>
                  <th className="px-5 py-4">NAMA PESERTA & NIM</th>
                  <th className="px-4 py-4">KONTAK</th>
                  <th className="px-4 py-4">FAKULTAS / PRODI</th>
                  <th className="px-4 py-4">TICKET</th>
                  <th className="px-3 py-4 text-center">CHECK-IN</th>
                  <th className="px-4 py-4 text-center">CHECK-IN TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-900">{p.orderId}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.nim}</div>
                    </td>
                    <td className="px-4 py-4 space-y-0.5">
                      <div className="text-slate-700 truncate max-w-40">{p.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.whatsapp}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">{p.faculty}</div>
                      <div className="text-[11px] text-slate-500">{p.prodi}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[#1A5E61]">{p.ticketName}</div>
                      <span className="text-[10px] text-slate-400">{p.ticketType}</span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <StatusBadge status={p.checkInStatus} size="sm" />
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-slate-600">
                      {p.checkInTime || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
