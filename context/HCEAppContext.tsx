'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Ticket, 
  Participant, 
  Transaction, 
  Staff, 
  MediaPartner, 
  Sponsor, 
  RecentActivity,
  CheckInMethod,
  PaymentStatus
} from '@/types/hce';
import { INITIAL_TICKETS } from '@/mock/mockTickets';
import { INITIAL_PARTICIPANTS } from '@/mock/mockParticipants';
import { INITIAL_TRANSACTIONS } from '@/mock/mockTransactions';
import { INITIAL_STAFF } from '@/mock/mockStaff';
import { INITIAL_MEDIA_PARTNERS, INITIAL_SPONSORS } from '@/mock/mockPartners';
import { INITIAL_ACTIVITIES } from '@/mock/mockActivities';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

interface HCEAppContextType {
  // Current User Context (Frontend Permission Sim)
  currentUser: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  };

  // State Datasets
  tickets: Ticket[];
  participants: Participant[];
  transactions: Transaction[];
  staffList: Staff[];
  mediaPartners: MediaPartner[];
  sponsors: Sponsor[];
  activities: RecentActivity[];
  toasts: ToastMessage[];

  // Derived Stats
  stats: {
    totalTickets: number;
    totalTicketsSold: number;
    totalTransactions: number;
    totalParticipants: number;
    totalCheckedIn: number;
    totalNotCheckedIn: number;
    attendancePercentage: number;
    totalRevenue: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    failedOrdersCount: number;
    refundedOrdersCount: number;
  };

  // Actions - Toast
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Actions - Tickets
  createTicket: (ticketData: Omit<Ticket, 'id' | 'sold' | 'remaining' | 'createdAt'>) => Ticket;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  duplicateTicket: (id: string) => void;
  archiveTicket: (id: string) => void;

  // Actions - Check-In
  performCheckIn: (participantIdOrOrderId: string, method?: CheckInMethod) => { success: boolean; message: string; participant?: Participant };

  // Actions - Participants & Transactions
  updateParticipantAndTransaction: (orderId: string, updates: {
    name: string;
    nim: string;
    email: string;
    whatsapp: string;
    faculty: string;
    prodi: string;
    ticketId: string;
  }) => void;
  deleteParticipant: (id: string) => void;

  // Actions - Transactions
  updateTransactionStatus: (orderId: string, status: PaymentStatus) => void;

  // Actions - Staff
  addStaff: (staffData: Omit<Staff, 'id' | 'createdDate' | 'lastActive'>) => void;
  deleteStaff: (id: string) => void;
  toggleStaffStatus: (id: string) => void;

  // Actions - Partners & Sponsors
  addMediaPartner: (partner: Omit<MediaPartner, 'id'>) => void;
  deleteMediaPartner: (id: string) => void;
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
  deleteSponsor: (id: string) => void;

  // Helpers
  exportParticipantsCSV: () => void;
  exportTransactionsCSV: () => void;
}

const HCEAppContext = createContext<HCEAppContextType | undefined>(undefined);

export const HCEAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState({
    name: 'Super Admin HCE',
    email: 'superadmin@hce-event.id',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  });

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>(INITIAL_MEDIA_PARTNERS);
  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS);
  const [activities, setActivities] = useState<RecentActivity[]>(INITIAL_ACTIVITIES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Dispatcher
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Derived Calculations
  const stats = useMemo(() => {
    // Ticket statistics
    const totalTickets = tickets.length;
    // Calculate total sold based on sum of sold tickets across active/soldout tickets
    const totalTicketsSold = tickets.reduce((acc, t) => acc + (t.sold || 0), 0);

    // Participant statistics
    const totalParticipants = participants.length;
    const totalCheckedIn = participants.filter((p) => p.checkInStatus === 'Checked In').length;
    const totalNotCheckedIn = totalParticipants - totalCheckedIn;
    const attendancePercentage = totalParticipants > 0 ? Math.round((totalCheckedIn / totalParticipants) * 100) : 0;

    // Transaction & Revenue statistics
    const totalTransactions = transactions.length;
    const paidTransactions = transactions.filter((tx) => tx.paymentStatus === 'Paid');
    const totalRevenue = paidTransactions.reduce((acc, tx) => acc + tx.amount, 0);

    const paidOrdersCount = paidTransactions.length;
    const pendingOrdersCount = transactions.filter((tx) => tx.paymentStatus === 'Pending').length;
    const failedOrdersCount = transactions.filter((tx) => tx.paymentStatus === 'Failed').length;
    const refundedOrdersCount = transactions.filter((tx) => tx.paymentStatus === 'Refunded').length;

    return {
      totalTickets,
      totalTicketsSold,
      totalTransactions,
      totalParticipants,
      totalCheckedIn,
      totalNotCheckedIn,
      attendancePercentage,
      totalRevenue,
      paidOrdersCount,
      pendingOrdersCount,
      failedOrdersCount,
      refundedOrdersCount,
    };
  }, [tickets, participants, transactions]);

  // Helper log activity
  const recordActivity = (type: RecentActivity['type'], title: string, description: string) => {
    const newAct: RecentActivity = {
      id: 'ACT-' + Date.now(),
      type,
      title,
      description,
      timestamp: 'Baru saja',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
  };

  // Ticket Operations
  const createTicket = (ticketData: Omit<Ticket, 'id' | 'sold' | 'remaining' | 'createdAt'>): Ticket => {
    const nextId = 'TCK-' + String(tickets.length + 1).padStart(3, '0');
    const newTicket: Ticket = {
      ...ticketData,
      id: nextId,
      sold: 0,
      remaining: ticketData.quota,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    addToast(`Tiket "${newTicket.name}" berhasil dibuat (${newTicket.status}).`, 'success');
    recordActivity(
      'ticket_created',
      'Tiket Baru Dibuat',
      `Tiket "${newTicket.name}" (${newTicket.badge}) telah ditambahkan dengan kuota ${newTicket.quota}`
    );
    return newTicket;
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          // re-evaluate remaining & soldout status
          if (updated.quota !== undefined && updated.sold !== undefined) {
            updated.remaining = Math.max(0, updated.quota - updated.sold);
            if (updated.remaining === 0 && updated.status === 'Active') {
              updated.status = 'Sold Out';
            }
          }
          return updated;
        }
        return t;
      })
    );
    addToast('Perubahan tiket berhasil disimpan.', 'success');
    recordActivity('ticket_updated', 'Tiket Diperbarui', `Informasi tiket ${id} telah diperbarui`);
  };

  const deleteTicket = (id: string) => {
    const target = tickets.find((t) => t.id === id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
    addToast(`Tiket ${target?.name || id} berhasil dihapus.`, 'info');
  };

  const duplicateTicket = (id: string) => {
    const target = tickets.find((t) => t.id === id);
    if (!target) return;
    const duplicated: Ticket = {
      ...target,
      id: 'TCK-' + String(tickets.length + 1).padStart(3, '0'),
      name: `${target.name} (Copy)`,
      sold: 0,
      remaining: target.quota,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      privateLink: target.visibility === 'PRIVATE' ? `https://hce-ticket.com/t/PRIVATE-COPY-${Math.random().toString(36).substr(2, 4).toUpperCase()}` : undefined
    };
    setTickets((prev) => [duplicated, ...prev]);
    addToast(`Tiket "${duplicated.name}" berhasil diduplikasi sebagai Draft.`, 'success');
  };

  const archiveTicket = (id: string) => {
    updateTicket(id, { status: 'Archived' });
    addToast('Tiket telah diarsipkan.', 'info');
  };

  // Check-In Operation
  const performCheckIn = (
    query: string, 
    method: CheckInMethod = 'QR Scan'
  ): { success: boolean; message: string; participant?: Participant } => {
    const cleanedQuery = query.trim().toLowerCase();
    if (!cleanedQuery) {
      return { success: false, message: 'Harap masukkan query pencarian atau data QR.' };
    }

    const participantIndex = participants.findIndex(
      (p) =>
        p.id.toLowerCase() === cleanedQuery ||
        p.orderId.toLowerCase() === cleanedQuery ||
        p.nim.toLowerCase() === cleanedQuery ||
        p.name.toLowerCase().includes(cleanedQuery) ||
        p.email.toLowerCase() === cleanedQuery
    );

    if (participantIndex === -1) {
      addToast('Peserta tidak ditemukan dalam database.', 'error');
      return { success: false, message: 'Peserta dengan data tersebut tidak ditemukan.' };
    }

    const target = participants[participantIndex];

    if (target.checkInStatus === 'Checked In') {
      addToast(`Peserta ${target.name} sudah check-in sebelumnya pada ${target.checkInTime}.`, 'warning');
      return { 
        success: false, 
        message: `Peserta sudah check-in pada ${target.checkInTime} (${target.checkedInMethod}).`,
        participant: target 
      };
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const updatedParticipant: Participant = {
      ...target,
      checkInStatus: 'Checked In',
      checkInTime: timeStr,
      checkedInMethod: method,
    };

    setParticipants((prev) => {
      const copy = [...prev];
      copy[participantIndex] = updatedParticipant;
      return copy;
    });

    // Update corresponding transaction check-in status
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.orderId === target.orderId
          ? { ...tx, checkInStatus: 'Checked In', lastUpdated: `${now.toISOString().split('T')[0]} ${timeStr.slice(0, 5)}` }
          : tx
      )
    );

    addToast(`Check-In berhasil untuk ${target.name} (${method})!`, 'success');
    recordActivity(
      'checkin_success',
      `Check-In Berhasil (${method})`,
      `${target.name} (${target.nim}) - ${target.ticketName} pada pukul ${timeStr}`
    );

    return {
      success: true,
      message: 'Check-In berhasil diverifikasi!',
      participant: updatedParticipant,
    };
  };

  // Participant & Transaction Correction
  const updateParticipantAndTransaction = (
    orderId: string,
    updates: {
      name: string;
      nim: string;
      email: string;
      whatsapp: string;
      faculty: string;
      prodi: string;
      ticketId: string;
    }
  ) => {
    const selectedTicket = tickets.find((t) => t.id === updates.ticketId);
    const ticketName = selectedTicket ? selectedTicket.name : 'Unknown Ticket';
    const ticketType = selectedTicket ? selectedTicket.type : 'PAID';
    const price = selectedTicket ? selectedTicket.price : 0;

    const now = new Date();
    const lastUpdated = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    // Update participant
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.orderId === orderId) {
          return {
            ...p,
            name: updates.name,
            nim: updates.nim,
            email: updates.email,
            whatsapp: updates.whatsapp,
            faculty: updates.faculty,
            prodi: updates.prodi,
            ticketId: updates.ticketId,
            ticketName,
            ticketType,
            price,
          };
        }
        return p;
      })
    );

    // Update transaction
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.orderId === orderId) {
          return {
            ...tx,
            participantName: updates.name,
            nim: updates.nim,
            email: updates.email,
            ticketId: updates.ticketId,
            ticketName,
            ticketType,
            amount: price,
            lastUpdated,
          };
        }
        return tx;
      })
    );

    addToast(`Data transaksi ${orderId} berhasil diperbarui.`, 'success');
    recordActivity(
      'transaction_updated',
      'Data Transaksi Diperbarui',
      `Super Admin memperbarui data peserta untuk Order ${orderId} (${updates.name})`
    );
  };

  const deleteParticipant = (id: string) => {
    const target = participants.find((p) => p.id === id);
    if (!target) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setTransactions((prev) => prev.filter((tx) => tx.orderId !== target.orderId));
    addToast(`Peserta ${target.name} telah dihapus dari database.`, 'info');
  };

  const updateTransactionStatus = (orderId: string, status: PaymentStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.orderId === orderId ? { ...tx, paymentStatus: status } : tx))
    );
    setParticipants((prev) =>
      prev.map((p) => (p.orderId === orderId ? { ...p, paymentStatus: status } : p))
    );
    addToast(`Status pembayaran order ${orderId} diubah menjadi ${status}.`, 'success');
  };

  // Staff Management
  const addStaff = (staffData: Omit<Staff, 'id' | 'createdDate' | 'lastActive'>) => {
    const nextId = 'STF-' + String(staffList.length + 1).padStart(3, '0');
    const newStaff: Staff = {
      ...staffData,
      id: nextId,
      createdDate: new Date().toISOString().split('T')[0],
      lastActive: 'Belum pernah login',
    };
    setStaffList((prev) => [newStaff, ...prev]);
    addToast(`Akun staff ${newStaff.name} berhasil dibuat.`, 'success');
    recordActivity('staff_created', 'Akun Staff Dibuat', `Staff "${newStaff.name}" (${newStaff.role}) telah ditambahkan`);
  };

  const deleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    addToast(`Akun staff ${target?.name || id} berhasil dihapus.`, 'info');
  };

  const toggleStaffStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s))
    );
    addToast('Status staff berhasil diperbarui.', 'success');
  };

  // Partners & Sponsors
  const addMediaPartner = (partner: Omit<MediaPartner, 'id'>) => {
    const nextId = 'MP-' + String(mediaPartners.length + 1).padStart(3, '0');
    setMediaPartners((prev) => [...prev, { ...partner, id: nextId }]);
    addToast(`Media partner ${partner.name} berhasil ditambahkan.`, 'success');
  };

  const deleteMediaPartner = (id: string) => {
    setMediaPartners((prev) => prev.filter((p) => p.id !== id));
    addToast('Media partner dihapus.', 'info');
  };

  const addSponsor = (sponsor: Omit<Sponsor, 'id'>) => {
    const nextId = 'SP-' + String(sponsors.length + 1).padStart(3, '0');
    setSponsors((prev) => [...prev, { ...sponsor, id: nextId }]);
    addToast(`Sponsor ${sponsor.name} (${sponsor.tier}) berhasil ditambahkan.`, 'success');
    recordActivity('sponsor_added', 'Sponsor Ditambahkan', `${sponsor.name} bergabung sebagai ${sponsor.tier}`);
  };

  const deleteSponsor = (id: string) => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
    addToast('Sponsor dihapus.', 'info');
  };

  // CSV Exporters
  const exportParticipantsCSV = () => {
    const headers = [
      'Order ID',
      'Nama Lengkap',
      'NIM',
      'Email',
      'WhatsApp',
      'Fakultas',
      'Program Studi',
      'Tiket',
      'Tipe Tiket',
      'Harga (IDR)',
      'Status Pembayaran',
      'Status Check-In',
      'Waktu Check-In',
      'Metode Check-In',
      'Tanggal Registrasi'
    ];

    const rows = participants.map((p) => [
      `"${p.orderId}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.nim}"`,
      `"${p.email}"`,
      `"${p.whatsapp}"`,
      `"${p.faculty}"`,
      `"${p.prodi}"`,
      `"${p.ticketName}"`,
      `"${p.ticketType}"`,
      p.price,
      `"${p.paymentStatus}"`,
      `"${p.checkInStatus}"`,
      `"${p.checkInTime || '-'}"`,
      `"${p.checkedInMethod || '-'}"`,
      `"${p.registeredAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HCE_Participants_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Data peserta berhasil di-export ke CSV.', 'success');
  };

  const exportTransactionsCSV = () => {
    const headers = [
      'Order ID',
      'Tanggal Transaksi',
      'Nama Peserta',
      'NIM',
      'Email',
      'Tiket',
      'Tipe',
      'Nominal (IDR)',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Status Check-In',
      'Terakhir Diperbarui'
    ];

    const rows = transactions.map((t) => [
      `"${t.orderId}"`,
      `"${t.orderDate}"`,
      `"${t.participantName.replace(/"/g, '""')}"`,
      `"${t.nim}"`,
      `"${t.email}"`,
      `"${t.ticketName}"`,
      `"${t.ticketType}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${t.paymentStatus}"`,
      `"${t.checkInStatus}"`,
      `"${t.lastUpdated}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HCE_Transactions_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Data transaksi berhasil di-export ke CSV.', 'success');
  };

  return (
    <HCEAppContext.Provider
      value={{
        currentUser,
        tickets,
        participants,
        transactions,
        staffList,
        mediaPartners,
        sponsors,
        activities,
        toasts,
        stats,
        addToast,
        removeToast,
        createTicket,
        updateTicket,
        deleteTicket,
        duplicateTicket,
        archiveTicket,
        performCheckIn,
        updateParticipantAndTransaction,
        deleteParticipant,
        updateTransactionStatus,
        addStaff,
        deleteStaff,
        toggleStaffStatus,
        addMediaPartner,
        deleteMediaPartner,
        addSponsor,
        deleteSponsor,
        exportParticipantsCSV,
        exportTransactionsCSV,
      }}
    >
      {children}
    </HCEAppContext.Provider>
  );
};

export const useHCEApp = () => {
  const context = useContext(HCEAppContext);
  if (!context) {
    throw new Error('useHCEApp must be used within an HCEAppProvider');
  }
  return context;
};
