'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
import {
  fetchTicketsFromSupabase,
  createTicketInSupabase,
  updateTicketInSupabase,
  deleteTicketInSupabase,
  fetchParticipantsFromSupabase,
  deleteParticipantInSupabase,
  fetchTransactionsFromSupabase,
  updateTransactionStatusInSupabase,
  updateParticipantAndTransactionInSupabase,
  performCheckInInSupabase,
  fetchStaffFromSupabase,
  createStaffInSupabase,
  deleteStaffInSupabase,
  updateStaffStatusInSupabase,
  signInStaffInSupabase,
  signOutStaffInSupabase,
  fetchMediaPartnersFromSupabase,
  createMediaPartnerInSupabase,
  deleteMediaPartnerInSupabase,
  fetchSponsorsFromSupabase,
  createSponsorInSupabase,
  deleteSponsorInSupabase,
  fetchActivitiesFromSupabase,
  recordActivityInSupabase,
} from '@/lib/supabaseServices';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export interface CurrentUser {
  id?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'STAFF' | string;
  avatar?: string;
}

interface HCEAppContextType {
  // Current Authenticated User
  currentUser: CurrentUser | null;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  logoutUser: () => Promise<void>;

  // State Datasets (Direct from Supabase)
  tickets: Ticket[];
  participants: Participant[];
  transactions: Transaction[];
  staffList: Staff[];
  mediaPartners: MediaPartner[];
  sponsors: Sponsor[];
  activities: RecentActivity[];
  toasts: ToastMessage[];
  isLoading: boolean;

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

  // Actions - Data Sync
  refreshData: () => Promise<void>;

  // Actions - Toast
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Actions - Tickets
  createTicket: (ticketData: Omit<Ticket, 'id' | 'sold' | 'remaining' | 'createdAt'>) => Promise<Ticket>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  duplicateTicket: (id: string) => Promise<void>;
  archiveTicket: (id: string) => Promise<void>;

  // Actions - Check-In
  performCheckIn: (participantIdOrOrderId: string, method?: CheckInMethod) => Promise<{ success: boolean; message: string; participant?: Participant }>;

  // Actions - Participants & Transactions
  updateParticipantAndTransaction: (orderId: string, updates: {
    name: string;
    nim: string;
    email: string;
    whatsapp: string;
    faculty: string;
    prodi: string;
    ticketId: string;
  }) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;

  // Actions - Transactions
  updateTransactionStatus: (orderId: string, status: PaymentStatus) => Promise<void>;

  // Actions - Staff
  addStaff: (staffData: Omit<Staff, 'id' | 'createdDate' | 'lastActive'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteStaff: (id: string) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;

  // Actions - Partners & Sponsors
  addMediaPartner: (partner: Omit<MediaPartner, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteMediaPartner: (id: string) => Promise<void>;
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => Promise<void>;
  deleteSponsor: (id: string) => Promise<void>;

  // Helpers
  exportParticipantsCSV: () => void;
  exportTransactionsCSV: () => void;
}

const HCEAppContext = createContext<HCEAppContextType | undefined>(undefined);

export const HCEAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Toast Dispatcher
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all dynamic datasets from Supabase
  const refreshData = useCallback(async () => {
    try {
      const [
        fetchedTickets,
        fetchedParticipants,
        fetchedTransactions,
        fetchedStaff,
        fetchedPartners,
        fetchedSponsors,
        fetchedActivities,
      ] = await Promise.all([
        fetchTicketsFromSupabase(),
        fetchParticipantsFromSupabase(),
        fetchTransactionsFromSupabase(),
        fetchStaffFromSupabase(),
        fetchMediaPartnersFromSupabase(),
        fetchSponsorsFromSupabase(),
        fetchActivitiesFromSupabase(),
      ]);

      setTickets(fetchedTickets);
      setParticipants(fetchedParticipants);
      setTransactions(fetchedTransactions);
      setStaffList(fetchedStaff);
      setMediaPartners(fetchedPartners);
      setSponsors(fetchedSponsors);
      setActivities(fetchedActivities);
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auth Session & State Sync
  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const cleanEmail = session.user.email.toLowerCase().trim();
          const { data: staffRow } = await supabase
            .from('staff')
            .select('*')
            .eq('email', cleanEmail)
            .single();

          if (staffRow && staffRow.status === 'Active') {
            setCurrentUser({
              id: staffRow.id,
              name: staffRow.name,
              email: staffRow.email,
              role: staffRow.role,
            });
          } else if (session.user.user_metadata?.role) {
            setCurrentUser({
              name: session.user.user_metadata?.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: session.user.user_metadata?.role,
            });
          }
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
    refreshData();

    // Supabase auth state change listener
    const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
      } else if (event === 'SIGNED_IN' && session?.user?.email) {
        const cleanEmail = session.user.email.toLowerCase().trim();
        const { data: staffRow } = await supabase
          .from('staff')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (staffRow && staffRow.status === 'Active') {
          setCurrentUser({
            id: staffRow.id,
            name: staffRow.name,
            email: staffRow.email,
            role: staffRow.role,
          });
        }
      }
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, [refreshData]);

  // Login & Logout
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await signInStaffInSupabase(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        addToast(`Selamat datang, ${res.user.name}!`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Autentikasi gagal.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login gagal.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    await signOutStaffInSupabase();
    setCurrentUser(null);
    addToast('Anda telah keluar dari akun.', 'info');
  };

  // Derived Calculations
  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const totalTicketsSold = tickets.reduce((acc, t) => acc + (t.sold || 0), 0);

    const totalParticipants = participants.length;
    const totalCheckedIn = participants.filter((p) => p.checkInStatus === 'Checked In').length;
    const totalNotCheckedIn = totalParticipants - totalCheckedIn;
    const attendancePercentage = totalParticipants > 0 ? Math.round((totalCheckedIn / totalParticipants) * 100) : 0;

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
  const recordActivity = async (type: RecentActivity['type'], title: string, description: string) => {
    const newAct: RecentActivity = {
      id: 'ACT-' + Date.now(),
      type,
      title,
      description,
      timestamp: 'Baru saja',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
    await recordActivityInSupabase({ type, title, description });
  };

  // Ticket Operations
  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'sold' | 'remaining' | 'createdAt'>): Promise<Ticket> => {
    const nextId = 'TCK-' + String(tickets.length + 1).padStart(3, '0');
    const newTicket: Ticket = {
      ...ticketData,
      id: nextId,
      sold: 0,
      remaining: ticketData.quota,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    await createTicketInSupabase(newTicket);

    addToast(`Tiket "${newTicket.name}" berhasil dibuat (${newTicket.status}).`, 'success');
    recordActivity(
      'ticket_created',
      'Tiket Baru Dibuat',
      `Tiket "${newTicket.name}" (${newTicket.badge}) telah ditambahkan dengan kuota ${newTicket.quota}`
    );
    return newTicket;
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
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

    await updateTicketInSupabase(id, updates);
    addToast('Perubahan tiket berhasil disimpan.', 'success');
    recordActivity('ticket_updated', 'Tiket Diperbarui', `Informasi tiket ${id} telah diperbarui`);
  };

  const deleteTicket = async (id: string) => {
    const target = tickets.find((t) => t.id === id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
    await deleteTicketInSupabase(id);
    addToast(`Tiket ${target?.name || id} berhasil dihapus.`, 'info');
  };

  const duplicateTicket = async (id: string) => {
    const target = tickets.find((t) => t.id === id);
    if (!target) return;
    const duplicated: Ticket = {
      ...target,
      id: 'TCK-' + String(tickets.length + 1).padStart(3, '0'),
      name: `${target.name} (Copy)`,
      sold: 0,
      remaining: target.quota,
      status: 'Active',
      createdAt: new Date().toISOString(),
      privateLink: target.visibility === 'PRIVATE' ? `https://hce-ticket.com/t/PRIVATE-COPY-${Math.random().toString(36).substr(2, 4).toUpperCase()}` : undefined
    };
    setTickets((prev) => [duplicated, ...prev]);
    await createTicketInSupabase(duplicated);
    addToast(`Tiket "${duplicated.name}" berhasil diduplikasi.`, 'success');
  };

  const archiveTicket = async (id: string) => {
    const target = tickets.find((t) => t.id === id);
    if (!target) return;
    if (target.status === 'Archived') {
      const nextStatus = target.remaining === 0 ? 'Sold Out' : 'Active';
      await updateTicket(id, { status: nextStatus });
      addToast(`Arsip tiket "${target.name}" berhasil dibuka (${nextStatus}).`, 'success');
    } else {
      await updateTicket(id, { status: 'Archived' });
      addToast(`Tiket "${target.name}" telah diarsipkan.`, 'info');
    }
  };

  // Check-In Operation
  const performCheckIn = async (
    query: string, 
    method: CheckInMethod = 'QR Scan'
  ): Promise<{ success: boolean; message: string; participant?: Participant }> => {
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

    // Check payment confirmation status
    if (target.paymentStatus !== 'Paid') {
      let statusDesc = 'Pembayaran Belum Dikonfirmasi';
      if (target.paymentStatus === 'Pending') {
        statusDesc = 'Status: "Menunggu Konfirmasi Admin". Harap verifikasi bukti transfer peserta di menu Transactions terlebih dahulu.';
      } else if (target.paymentStatus === 'Failed') {
        statusDesc = 'Status: "Pembayaran Tidak Berhasil". Bukti transfer ditolak atau tidak valid. QR Code tidak dapat digunakan untuk Check-in.';
      } else if (target.paymentStatus === 'Refunded') {
        statusDesc = 'Status: "Refunded". Tiket ini telah dibatalkan / di-refund.';
      }
      addToast(`Check-In Ditolak: ${statusDesc}`, 'error');
      return { 
        success: false, 
        message: `Check-in ditolak. ${statusDesc}`,
        participant: target 
      };
    }

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

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.orderId === target.orderId
          ? { ...tx, checkInStatus: 'Checked In', lastUpdated: `${now.toISOString().split('T')[0]} ${timeStr.slice(0, 5)}` }
          : tx
      )
    );

    // Save to Supabase
    await performCheckInInSupabase(target.id, target.orderId, method);

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
  const updateParticipantAndTransaction = async (
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

    await updateParticipantAndTransactionInSupabase(orderId, {
      ...updates,
      ticketName,
      ticketType,
      price,
    });

    addToast(`Data transaksi ${orderId} berhasil diperbarui.`, 'success');
    recordActivity(
      'transaction_updated',
      'Data Transaksi Diperbarui',
      `Super Admin memperbarui data peserta untuk Order ${orderId} (${updates.name})`
    );
  };

  const deleteParticipant = async (id: string) => {
    const target = participants.find((p) => p.id === id);
    if (!target) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setTransactions((prev) => prev.filter((tx) => tx.orderId !== target.orderId));
    await deleteParticipantInSupabase(id, target.orderId);
    addToast(`Peserta ${target.name} telah dihapus dari database.`, 'info');
  };

  const updateTransactionStatus = async (orderId: string, status: PaymentStatus) => {
    const now = new Date();
    const lastUpdated = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    setTransactions((prev) =>
      prev.map((tx) => (tx.orderId === orderId ? { ...tx, paymentStatus: status, lastUpdated } : tx))
    );
    setParticipants((prev) =>
      prev.map((p) => (p.orderId === orderId ? { ...p, paymentStatus: status } : p))
    );

    await updateTransactionStatusInSupabase(orderId, status);

    const statusLabel =
      status === 'Paid'
        ? 'Pembayaran Berhasil'
        : status === 'Failed'
        ? 'Pembayaran Tidak Berhasil'
        : status === 'Pending'
        ? 'Menunggu Konfirmasi Admin'
        : status;

    addToast(
      `Status pembayaran order ${orderId} diubah menjadi "${statusLabel}".`,
      status === 'Paid' ? 'success' : status === 'Failed' ? 'error' : 'info'
    );

    recordActivity(
      'transaction_updated',
      `Verifikasi Transaksi (${statusLabel})`,
      `Admin memperbarui status Order ${orderId} menjadi "${statusLabel}"`
    );
  };

  // Staff Management
  const addStaff = async (
    staffData: Omit<Staff, 'id' | 'createdDate' | 'lastActive'> & { password?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const existingNums = staffList
      .map((s) => parseInt(s.id.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextId = 'STF-' + String(maxNum + 1).padStart(3, '0');

    const newStaff: Staff = {
      name: staffData.name,
      email: staffData.email.toLowerCase().trim(),
      role: staffData.role,
      status: staffData.status,
      id: nextId,
      createdDate: new Date().toISOString().split('T')[0],
      lastActive: 'Belum pernah login',
    };

    const res = await createStaffInSupabase(newStaff, staffData.password);
    if (!res.success) {
      addToast(`Gagal mendaftarkan akun: ${res.error}`, 'error');
      return { success: false, error: res.error };
    }

    const finalStaff = res.staff || newStaff;
    setStaffList((prev) => [finalStaff, ...prev.filter((s) => s.id !== finalStaff.id)]);
    addToast(`Akun staff ${finalStaff.name} berhasil dibuat & terhubung ke Supabase Auth.`, 'success');
    recordActivity('staff_created', 'Akun Staff Dibuat', `Staff "${finalStaff.name}" (${finalStaff.role}) telah ditambahkan`);
    return { success: true };
  };

  const deleteStaff = async (id: string) => {
    const target = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    await deleteStaffInSupabase(id);
    addToast(`Akun staff ${target?.name || id} berhasil dihapus.`, 'info');
  };

  const toggleStaffStatus = async (id: string) => {
    const target = staffList.find((s) => s.id === id);
    const nextStatus = target?.status === 'Active' ? 'Inactive' : 'Active';
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
    await updateStaffStatusInSupabase(id, nextStatus);
    addToast('Status staff berhasil diperbarui.', 'success');
  };

  // Partners & Sponsors
  const addMediaPartner = async (
    partner: Omit<MediaPartner, 'id'>
  ): Promise<{ success: boolean; error?: string }> => {
    const existingNums = mediaPartners
      .map((m) => parseInt(m.id.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextId = 'MP-' + String(maxNum + 1).padStart(3, '0');

    const newPartner: MediaPartner = { ...partner, id: nextId };
    const res = await createMediaPartnerInSupabase(newPartner);
    if (!res.success) {
      addToast(`Gagal menambahkan media partner: ${res.error}`, 'error');
      return { success: false, error: res.error };
    }

    const finalItem: MediaPartner = { ...newPartner, id: res.id || nextId };
    setMediaPartners((prev) => [...prev.filter((p) => p.id !== finalItem.id), finalItem]);
    addToast(`Media partner ${partner.name} berhasil ditambahkan.`, 'success');
    return { success: true };
  };

  const deleteMediaPartner = async (id: string) => {
    const target = mediaPartners.find((p) => p.id === id);
    setMediaPartners((prev) => prev.filter((p) => p.id !== id));
    await deleteMediaPartnerInSupabase(id, target?.logo);
    addToast('Media partner dan logonya berhasil dihapus.', 'info');
  };

  const addSponsor = async (sponsor: Omit<Sponsor, 'id'>) => {
    const nextId = 'SP-' + String(sponsors.length + 1).padStart(3, '0');
    const newSponsor: Sponsor = { ...sponsor, id: nextId };
    setSponsors((prev) => [...prev, newSponsor]);
    await createSponsorInSupabase(newSponsor);
    addToast(`Sponsor ${sponsor.name} (${sponsor.tier}) berhasil ditambahkan.`, 'success');
    recordActivity('sponsor_added', 'Sponsor Ditambahkan', `${sponsor.name} bergabung sebagai ${sponsor.tier}`);
  };

  const deleteSponsor = async (id: string) => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
    await deleteSponsorInSupabase(id);
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
        loginUser,
        logoutUser,
        tickets,
        participants,
        transactions,
        staffList,
        mediaPartners,
        sponsors,
        activities,
        toasts,
        stats,
        isLoading,
        refreshData,
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
