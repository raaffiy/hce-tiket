import { supabase } from './supabase';
import {
  Ticket,
  Participant,
  Transaction,
  Staff,
  MediaPartner,
  Sponsor,
  RecentActivity,
  PaymentStatus,
  CheckInStatus,
  CheckInMethod,
} from '@/types/hce';

// ==========================================
// 1. TICKETS SERVICE
// ==========================================

export function mapTicketFromDB(row: any): Ticket {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    type: row.type,
    badge: row.badge,
    visibility: row.visibility || 'PUBLIC',
    price: Number(row.price || 0),
    quota: Number(row.quota || 0),
    sold: Number(row.sold || 0),
    remaining: Number(row.remaining || 0),
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    benefits: Array.isArray(row.benefits) ? row.benefits : typeof row.benefits === 'string' ? JSON.parse(row.benefits) : [],
    status: row.status,
    privateLink: row.private_link || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapTicketToDB(ticket: Partial<Ticket>): any {
  const row: any = {};
  if (ticket.id !== undefined) row.id = ticket.id;
  if (ticket.name !== undefined) row.name = ticket.name;
  if (ticket.description !== undefined) row.description = ticket.description;
  if (ticket.type !== undefined) row.type = ticket.type;
  if (ticket.badge !== undefined) row.badge = ticket.badge;
  if (ticket.visibility !== undefined) row.visibility = ticket.visibility;
  if (ticket.price !== undefined) row.price = ticket.price;
  if (ticket.quota !== undefined) row.quota = ticket.quota;
  if (ticket.sold !== undefined) row.sold = ticket.sold;
  if (ticket.remaining !== undefined) row.remaining = ticket.remaining;
  if (ticket.startDate !== undefined) row.start_date = ticket.startDate;
  if (ticket.endDate !== undefined) row.end_date = ticket.endDate;
  if (ticket.benefits !== undefined) row.benefits = ticket.benefits;
  if (ticket.status !== undefined) row.status = ticket.status;
  if (ticket.privateLink !== undefined) row.private_link = ticket.privateLink;
  return row;
}

export async function fetchTicketsFromSupabase(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchTickets error:', error.message);
      return [];
    }
    return (data || []).map(mapTicketFromDB);
  } catch (err) {
    console.warn('Supabase fetchTickets exception:', err);
    return [];
  }
}

export async function createTicketInSupabase(ticket: Ticket): Promise<boolean> {
  try {
    const row = mapTicketToDB(ticket);
    const { error } = await supabase.from('tickets').insert([row]);
    if (error) {
      console.error('Supabase createTicket error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase createTicket exception:', err);
    return false;
  }
}

export async function updateTicketInSupabase(id: string, updates: Partial<Ticket>): Promise<boolean> {
  try {
    const row = mapTicketToDB(updates);
    const { error } = await supabase.from('tickets').update(row).eq('id', id);
    if (error) {
      console.error('Supabase updateTicket error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase updateTicket exception:', err);
    return false;
  }
}

export async function deleteTicketInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteTicket error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteTicket exception:', err);
    return false;
  }
}

// ==========================================
// 2. PARTICIPANTS SERVICE
// ==========================================

export function mapParticipantFromDB(row: any): Participant {
  return {
    id: row.id,
    orderId: row.order_id,
    name: row.name,
    nim: row.nim || '',
    email: row.email,
    whatsapp: row.whatsapp || '',
    faculty: row.faculty || '',
    prodi: row.prodi || '',
    ticketId: row.ticket_id || '',
    ticketName: row.ticket_name || '',
    ticketType: row.ticket_type || 'PAID',
    price: Number(row.price || 0),
    paymentStatus: row.payment_status,
    paymentProof: row.payment_proof || undefined,
    checkInStatus: row.check_in_status || 'Not Checked In',
    checkInTime: row.check_in_time || undefined,
    checkedInMethod: row.checked_in_method || undefined,
    emailStatus: row.email_status || 'Pending',
    emailSentAt: row.email_sent_at || undefined,
    certificateStatus: row.certificate_status || 'Tersedia Setelah Acara Selesai (SKP Resmi)',
    registeredAt: row.registered_at || new Date().toISOString(),
  };
}

export function mapParticipantToDB(p: Partial<Participant>): any {
  const row: any = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.orderId !== undefined) row.order_id = p.orderId;
  if (p.name !== undefined) row.name = p.name;
  if (p.nim !== undefined) row.nim = p.nim;
  if (p.email !== undefined) row.email = p.email;
  if (p.whatsapp !== undefined) row.whatsapp = p.whatsapp;
  if (p.faculty !== undefined) row.faculty = p.faculty;
  if (p.prodi !== undefined) row.prodi = p.prodi;
  if (p.ticketId !== undefined) row.ticket_id = p.ticketId;
  if (p.ticketName !== undefined) row.ticket_name = p.ticketName;
  if (p.ticketType !== undefined) row.ticket_type = p.ticketType;
  if (p.price !== undefined) row.price = p.price;
  if (p.paymentStatus !== undefined) row.payment_status = p.paymentStatus;
  if (p.paymentProof !== undefined) row.payment_proof = p.paymentProof;
  if (p.checkInStatus !== undefined) row.check_in_status = p.checkInStatus;
  if (p.checkInTime !== undefined) row.check_in_time = p.checkInTime;
  if (p.checkedInMethod !== undefined) row.checked_in_method = p.checkedInMethod;
  if (p.emailStatus !== undefined) row.email_status = p.emailStatus;
  if (p.emailSentAt !== undefined) row.email_sent_at = p.emailSentAt;
  if (p.certificateStatus !== undefined) row.certificate_status = p.certificateStatus;
  if (p.registeredAt !== undefined) row.registered_at = p.registeredAt;
  return row;
}

export async function fetchParticipantsFromSupabase(): Promise<Participant[]> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchParticipants error:', error.message);
      return [];
    }
    return (data || []).map(mapParticipantFromDB);
  } catch (err) {
    console.warn('Supabase fetchParticipants exception:', err);
    return [];
  }
}

export async function deleteParticipantInSupabase(id: string, orderId?: string): Promise<boolean> {
  try {
    const { error: partErr } = await supabase.from('participants').delete().eq('id', id);
    if (partErr) {
      console.error('Supabase deleteParticipant error:', partErr.message);
      return false;
    }
    if (orderId) {
      await supabase.from('transactions').delete().eq('order_id', orderId);
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteParticipant exception:', err);
    return false;
  }
}

// ==========================================
// 3. TRANSACTIONS SERVICE
// ==========================================

export function mapTransactionFromDB(row: any): Transaction {
  return {
    orderId: row.order_id,
    orderDate: row.order_date || new Date().toISOString(),
    participantId: row.participant_id || '',
    participantName: row.participant_name || '',
    nim: row.nim || '',
    email: row.email || '',
    whatsapp: row.whatsapp || '',
    faculty: row.faculty || '',
    prodi: row.prodi || '',
    ticketId: row.ticket_id || '',
    ticketName: row.ticket_name || '',
    ticketType: row.ticket_type || 'PAID',
    amount: Number(row.amount || 0),
    paymentStatus: row.payment_status,
    paymentProof: row.payment_proof || undefined,
    checkInStatus: row.check_in_status || 'Not Checked In',
    paymentMethod: row.payment_method || 'QRIS Instant',
    emailStatus: row.email_status || 'Pending',
    emailSentAt: row.email_sent_at || undefined,
    certificateStatus: row.certificate_status || 'Tersedia Setelah Acara Selesai (SKP Resmi)',
    lastUpdated: row.last_updated || new Date().toISOString(),
  };
}

export function mapTransactionToDB(tx: Partial<Transaction>): any {
  const row: any = {};
  if (tx.orderId !== undefined) row.order_id = tx.orderId;
  if (tx.orderDate !== undefined) row.order_date = tx.orderDate;
  if (tx.participantId !== undefined) row.participant_id = tx.participantId;
  if (tx.participantName !== undefined) row.participant_name = tx.participantName;
  if (tx.nim !== undefined) row.nim = tx.nim;
  if (tx.email !== undefined) row.email = tx.email;
  if (tx.whatsapp !== undefined) row.whatsapp = tx.whatsapp;
  if (tx.faculty !== undefined) row.faculty = tx.faculty;
  if (tx.prodi !== undefined) row.prodi = tx.prodi;
  if (tx.ticketId !== undefined) row.ticket_id = tx.ticketId;
  if (tx.ticketName !== undefined) row.ticket_name = tx.ticketName;
  if (tx.ticketType !== undefined) row.ticket_type = tx.ticketType;
  if (tx.amount !== undefined) row.amount = tx.amount;
  if (tx.paymentStatus !== undefined) row.payment_status = tx.paymentStatus;
  if (tx.paymentProof !== undefined) row.payment_proof = tx.paymentProof;
  if (tx.checkInStatus !== undefined) row.check_in_status = tx.checkInStatus;
  if (tx.paymentMethod !== undefined) row.payment_method = tx.paymentMethod;
  if (tx.emailStatus !== undefined) row.email_status = tx.emailStatus;
  if (tx.emailSentAt !== undefined) row.email_sent_at = tx.emailSentAt;
  if (tx.certificateStatus !== undefined) row.certificate_status = tx.certificateStatus;
  if (tx.lastUpdated !== undefined) row.last_updated = tx.lastUpdated;
  return row;
}

export async function fetchTransactionsFromSupabase(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchTransactions error:', error.message);
      return [];
    }
    return (data || []).map(mapTransactionFromDB);
  } catch (err) {
    console.warn('Supabase fetchTransactions exception:', err);
    return [];
  }
}

export async function updateTransactionStatusInSupabase(
  orderId: string,
  status: PaymentStatus
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const { error: txErr } = await supabase
      .from('transactions')
      .update({ payment_status: status, last_updated: now })
      .eq('order_id', orderId);

    if (txErr) {
      console.error('Supabase updateTransaction status error:', txErr.message);
      return false;
    }

    const { error: partErr } = await supabase
      .from('participants')
      .update({ payment_status: status })
      .eq('order_id', orderId);

    if (partErr) {
      console.warn('Supabase updateParticipant payment status warning:', partErr.message);
    }
    return true;
  } catch (err) {
    console.error('Supabase updateTransaction status exception:', err);
    return false;
  }
}

export async function updateParticipantAndTransactionInSupabase(
  orderId: string,
  updates: {
    name: string;
    nim: string;
    email: string;
    whatsapp: string;
    faculty: string;
    prodi: string;
    ticketId: string;
    ticketName: string;
    ticketType: 'FREE' | 'PAID';
    price: number;
  }
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    // 1. Update participant
    await supabase
      .from('participants')
      .update({
        name: updates.name,
        nim: updates.nim,
        email: updates.email,
        whatsapp: updates.whatsapp,
        faculty: updates.faculty,
        prodi: updates.prodi,
        ticket_id: updates.ticketId,
        ticket_name: updates.ticketName,
        ticket_type: updates.ticketType,
        price: updates.price,
      })
      .eq('order_id', orderId);

    // 2. Update transaction
    await supabase
      .from('transactions')
      .update({
        participant_name: updates.name,
        nim: updates.nim,
        email: updates.email,
        whatsapp: updates.whatsapp,
        faculty: updates.faculty,
        study_program: updates.prodi,
        ticket_id: updates.ticketId,
        ticket_name: updates.ticketName,
        ticket_type: updates.ticketType,
        amount: updates.price,
        last_updated: now,
      })
      .eq('order_id', orderId);

    return true;
  } catch (err) {
    console.error('Supabase updateParticipantAndTransaction exception:', err);
    return false;
  }
}

export interface CheckInValidationResult {
  success: boolean;
  statusType: 'PAID' | 'PENDING' | 'FAILED' | 'ALREADY_CHECKED_IN' | 'NOT_FOUND';
  message: string;
  participant?: Participant;
  paymentStatus?: string;
  checkInStatus?: string;
  checkInTime?: string;
}

export async function validateAndPerformCheckInInSupabase(
  query: string,
  method: CheckInMethod = 'QR Scan'
): Promise<CheckInValidationResult> {
  const clean = query.trim();
  if (!clean) {
    return {
      success: false,
      statusType: 'NOT_FOUND',
      message: 'Data QR tidak boleh kosong.',
    };
  }

  // Also clean if user scanned with SEM- prefix or URL
  const searchPattern = clean.replace(/^SEM-/, '').replace(/^ORD-/, '');

  try {
    // 1. Check transactions table
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .or(`order_id.ilike.%${clean}%,order_id.ilike.%${searchPattern}%,participant_id.ilike.%${clean}%,nim.ilike.%${clean}%,email.ilike.%${clean}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    // 2. Check participants table
    const { data: partData } = await supabase
      .from('participants')
      .select('*')
      .or(`id.ilike.%${clean}%,order_id.ilike.%${clean}%,order_id.ilike.%${searchPattern}%,nim.ilike.%${clean}%,email.ilike.%${clean}%`)
      .order('registered_at', { ascending: false })
      .limit(1);

    const tx = txData && txData.length > 0 ? txData[0] : null;
    const part = partData && partData.length > 0 ? partData[0] : null;

    if (!tx && !part) {
      return {
        success: false,
        statusType: 'NOT_FOUND',
        message: 'Peserta / Tiket tidak ditemukan dalam database.',
      };
    }

    // Determine current effective payment status and check-in status
    const effectivePaymentStatus: PaymentStatus =
      (tx?.payment_status as PaymentStatus) ||
      (part?.payment_status as PaymentStatus) ||
      'Pending';

    const effectiveCheckInStatus: CheckInStatus =
      (part?.check_in_status as CheckInStatus) ||
      (tx?.check_in_status as CheckInStatus) ||
      'Not Checked In';

    const participantObj: Participant = {
      id: part?.id || tx?.participant_id || `PAR-${Date.now()}`,
      orderId: tx?.order_id || part?.order_id || '',
      name: part?.name || tx?.participant_name || 'Peserta',
      nim: part?.nim || tx?.nim || '',
      email: part?.email || tx?.email || '',
      whatsapp: part?.whatsapp || tx?.whatsapp || '',
      faculty: part?.faculty || tx?.faculty || '',
      prodi: part?.prodi || tx?.study_program || '',
      ticketId: tx?.ticket_id || part?.ticket_id || '',
      ticketName: tx?.ticket_name || part?.ticket_name || 'Seminar Pass',
      ticketType: (tx?.ticket_type || part?.ticket_type || 'PAID') as any,
      price: Number(tx?.amount) || Number(part?.price) || 0,
      paymentStatus: effectivePaymentStatus,
      paymentProof: tx?.payment_proof || part?.payment_proof || '',
      checkInStatus: effectiveCheckInStatus,
      checkInTime: part?.check_in_time || '',
      checkedInMethod: (part?.checked_in_method || method) as CheckInMethod,
      registeredAt: part?.registered_at || tx?.order_date || new Date().toISOString(),
    };

    // Validasi 1: Menunggu Konfirmasi -> popup kuning: "QR tidak bisa di-scan karena belum dikonfirmasi oleh admin."
    if (effectivePaymentStatus === 'Pending') {
      return {
        success: false,
        statusType: 'PENDING',
        message: 'QR tidak bisa di-scan karena belum dikonfirmasi oleh admin.',
        participant: participantObj,
        paymentStatus: 'Pending',
        checkInStatus: effectiveCheckInStatus,
      };
    }

    // Validasi 2: Pembayaran Tidak Berhasil -> popup merah: "QR tersebut ditolak oleh admin."
    if (effectivePaymentStatus === 'Failed' || effectivePaymentStatus === 'Refunded') {
      return {
        success: false,
        statusType: 'FAILED',
        message: 'QR tersebut ditolak oleh admin.',
        participant: participantObj,
        paymentStatus: effectivePaymentStatus,
        checkInStatus: effectiveCheckInStatus,
      };
    }

    // Validasi 3: Cek jika sudah pernah check-in
    if (effectiveCheckInStatus === 'Checked In') {
      return {
        success: false,
        statusType: 'ALREADY_CHECKED_IN',
        message: `Peserta sudah check-in sebelumnya pada ${participantObj.checkInTime || 'waktu sebelumnya'} (${participantObj.checkedInMethod || 'QR'}).`,
        participant: participantObj,
        paymentStatus: 'Paid',
        checkInStatus: 'Checked In',
        checkInTime: participantObj.checkInTime,
      };
    }

    // Validasi 4: Pembayaran Berhasil -> popup hijau: "QR berhasil di-scan."
    if (effectivePaymentStatus === 'Paid') {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
      const nowIso = now.toISOString();

      // Update di tabel participants
      if (participantObj.id) {
        await supabase
          .from('participants')
          .update({
            check_in_status: 'Checked In',
            check_in_time: timeStr,
            checked_in_method: method,
          })
          .eq('id', participantObj.id);
      }

      // Update di tabel transactions
      if (participantObj.orderId) {
        await supabase
          .from('transactions')
          .update({
            check_in_status: 'Checked In',
            last_updated: nowIso,
          })
          .eq('order_id', participantObj.orderId);
      }

      participantObj.checkInStatus = 'Checked In';
      participantObj.checkInTime = timeStr;
      participantObj.checkedInMethod = method;

      return {
        success: true,
        statusType: 'PAID',
        message: 'QR berhasil di-scan.',
        participant: participantObj,
        paymentStatus: 'Paid',
        checkInStatus: 'Checked In',
        checkInTime: timeStr,
      };
    }

    return {
      success: false,
      statusType: 'FAILED',
      message: 'Status pembayaran tidak valid.',
      participant: participantObj,
    };
  } catch (err) {
    console.error('validateAndPerformCheckInInSupabase exception:', err);
    return {
      success: false,
      statusType: 'FAILED',
      message: 'Terjadi kesalahan saat memvalidasi QR ke database.',
    };
  }
}

export async function performCheckInInSupabase(
  participantId: string,
  orderId: string,
  method: CheckInMethod = 'QR Scan'
): Promise<boolean> {
  try {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const nowIso = now.toISOString();

    // 1. Update participant checkin
    const { error: partErr } = await supabase
      .from('participants')
      .update({
        check_in_status: 'Checked In',
        check_in_time: timeStr,
        checked_in_method: method,
      })
      .eq('id', participantId);

    if (partErr) {
      console.error('Supabase performCheckIn error on participant:', partErr.message);
      return false;
    }

    // 2. Update transaction checkin
    await supabase
      .from('transactions')
      .update({
        check_in_status: 'Checked In',
        last_updated: nowIso,
      })
      .eq('order_id', orderId);

    return true;
  } catch (err) {
    console.error('Supabase performCheckIn exception:', err);
    return false;
  }
}

// ==========================================
// 4. CHECKOUT / CREATE ORDER PIPELINE
// ==========================================

export interface CreateOrderPayload {
  orderId: string;
  ticketId: string;
  ticketName: string;
  ticketType: 'FREE' | 'PAID';
  ticketPrice: number;
  quantity: number;
  totalPrice: number;
  paymentMethod: string;
  paymentProof?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    nim: string;
    faculty: string;
    studyProgram: string;
  };
}

export async function uploadPaymentProofToSupabase(
  file: File,
  orderId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanOrderId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = `proof_${cleanOrderId}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase payment-proof storage upload error:', error.message);
      return {
        success: false,
        error: `Gagal upload bukti pembayaran ke Supabase Storage: ${error.message}. Pastikan bucket "payment-proofs" telah dibuat dengan akses Public.`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('Supabase uploadPaymentProof exception:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengunggah bukti pembayaran.',
    };
  }
}

export async function createOrderInSupabase(payload: CreateOrderPayload): Promise<{
  success: boolean;
  participantId?: string;
  error?: string;
}> {
  try {
    const participantId = 'PART-' + Date.now().toString().slice(-6);
    const nowIso = new Date().toISOString();

    // 1. Create Transaction row
    const transactionRow = {
      order_id: payload.orderId,
      order_date: nowIso,
      participant_id: participantId,
      participant_name: payload.customer.fullName,
      nim: payload.customer.nim,
      email: payload.customer.email,
      whatsapp: payload.customer.phone,
      faculty: payload.customer.faculty,
      study_program: payload.customer.studyProgram,
      ticket_id: payload.ticketId,
      ticket_name: payload.ticketName,
      ticket_type: payload.ticketType,
      amount: payload.totalPrice,
      quantity: payload.quantity,
      payment_method: payload.paymentMethod,
      payment_status: 'Pending',
      payment_proof: payload.paymentProof || null,
      check_in_status: 'Not Checked In',
      last_updated: nowIso,
    };

    const { error: txErr } = await supabase.from('transactions').insert([transactionRow]);
    if (txErr) {
      console.error('Supabase createOrder transaction insert error:', txErr.message);
      return { success: false, error: txErr.message };
    }

    // 2. Create Participant row
    const participantRow = {
      id: participantId,
      order_id: payload.orderId,
      name: payload.customer.fullName,
      nim: payload.customer.nim,
      email: payload.customer.email,
      whatsapp: payload.customer.phone,
      faculty: payload.customer.faculty,
      prodi: payload.customer.studyProgram,
      ticket_id: payload.ticketId,
      ticket_name: payload.ticketName,
      ticket_type: payload.ticketType,
      price: payload.ticketPrice,
      payment_status: 'Pending',
      payment_proof: payload.paymentProof || null,
      check_in_status: 'Not Checked In',
      registered_at: nowIso,
    };

    const { error: partErr } = await supabase.from('participants').insert([participantRow]);
    if (partErr) {
      console.error('Supabase createOrder participant insert error:', partErr.message);
      return { success: false, error: partErr.message };
    }

    // 3. Increment ticket sold count if ticket found
    try {
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('id, sold, quota')
        .eq('id', payload.ticketId)
        .single();

      if (ticketData) {
        const newSold = (Number(ticketData.sold) || 0) + payload.quantity;
        const newRemaining = Math.max(0, (Number(ticketData.quota) || 0) - newSold);
        const newStatus = newRemaining === 0 ? 'Sold Out' : undefined;

        const updateObj: any = { sold: newSold, remaining: newRemaining };
        if (newStatus) updateObj.status = newStatus;

        await supabase.from('tickets').update(updateObj).eq('id', payload.ticketId);
      }
    } catch (ticketUpdateErr) {
      console.warn('Could not update ticket sold counter:', ticketUpdateErr);
    }

    // 4. Record Activity
    await recordActivityInSupabase({
      type: 'participant_bought',
      title: 'Pesanan Tiket Baru Masuk',
      description: `${payload.customer.fullName} mendaftar tiket ${payload.ticketName} (${payload.orderId})`,
    });

    return { success: true, participantId };
  } catch (err: any) {
    console.error('Supabase createOrder exception:', err);
    return { success: false, error: err?.message || 'Gagal menyimpan pesanan ke database.' };
  }
}

// ==========================================
// 5. STAFF SERVICE
// ==========================================

export function mapStaffFromDB(row: any): Staff {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdDate: row.created_date || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastActive: row.last_active || 'Belum pernah login',
  };
}

export async function fetchStaffFromSupabase(): Promise<Staff[]> {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchStaff error:', error.message);
      return [];
    }
    return (data || []).map(mapStaffFromDB);
  } catch (err) {
    console.warn('Supabase fetchStaff exception:', err);
    return [];
  }
}

import { createClient } from '@supabase/supabase-js';

const authSignupClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: 'sb-auth-signup-isolated',
    },
  }
);

export async function createStaffInSupabase(
  staff: Staff,
  password?: string
): Promise<{ success: boolean; staff?: Staff; error?: string }> {
  try {
    const cleanEmail = staff.email.toLowerCase().trim();

    // 0. Check if staff email is already in staff table
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingStaff) {
      return { success: false, error: `Email "${cleanEmail}" sudah terdaftar sebagai staff.` };
    }

    // Determine unique staff ID (prevent duplicate key staff_pkey violation)
    let finalId = staff.id;
    const { data: allStaffRows } = await supabase.from('staff').select('id');
    if (allStaffRows && allStaffRows.length > 0) {
      const existingIds = new Set(allStaffRows.map((r: any) => r.id));
      if (existingIds.has(finalId) || !finalId) {
        const nums = allStaffRows
          .map((r: any) => parseInt(String(r.id).replace(/\D/g, ''), 10))
          .filter((n: number) => !isNaN(n));
        const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
        finalId = `STF-${String(maxNum + 1).padStart(3, '0')}`;
        // Fallback if still collision
        if (existingIds.has(finalId)) {
          finalId = `STF-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        }
      }
    }

    // 1. Create Supabase Auth user if password provided
    if (password) {
      const { data: authData, error: authError } = await authSignupClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            name: staff.name,
            role: staff.role,
          },
        },
      });

      if (authError) {
        console.error('Supabase Auth signUp error:', authError);
        let errorMsg = authError.message;
        if (authError.message.includes('rate limit') || (authError as any).code === 'over_email_send_rate_limit') {
          errorMsg = 'Rate limit email tercapai. Nonaktifkan "Confirm email" di Supabase Dashboard -> Authentication -> Providers -> Email agar pembuatan akun instan.';
        } else if (authError.message.toLowerCase().includes('already registered')) {
          errorMsg = `Email "${cleanEmail}" sudah terdaftar di Supabase Authentication.`;
        }
        return { success: false, error: errorMsg };
      }

      if (!authData.user) {
        return { success: false, error: 'Gagal membuat user di Supabase Authentication.' };
      }
    }

    // 2. Insert into public.staff table
    const createdStaff: Staff = {
      ...staff,
      id: finalId,
      email: cleanEmail,
    };

    const row = {
      id: createdStaff.id,
      name: createdStaff.name,
      email: cleanEmail,
      role: createdStaff.role,
      status: createdStaff.status,
      created_date: createdStaff.createdDate,
      last_active: createdStaff.lastActive,
    };

    const { error: staffErr } = await supabase.from('staff').insert([row]);
    if (staffErr) {
      console.error('Supabase createStaff error:', staffErr.message);
      return { success: false, error: staffErr.message };
    }
    return { success: true, staff: createdStaff };
  } catch (err: any) {
    console.error('Supabase createStaff exception:', err);
    return { success: false, error: err?.message || 'Gagal membuat staff.' };
  }
}

export async function signInStaffInSupabase(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'STAFF';
  };
  error?: string;
}> {
  try {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authErr) {
      return { success: false, error: authErr.message };
    }

    // 2. Verify staff profile in public.staff table
    const { data: staffRow } = await supabase
      .from('staff')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (!staffRow) {
      // Check user metadata if created directly
      const metaRole = (authData.user?.user_metadata?.role as 'SUPER_ADMIN' | 'STAFF') || 'SUPER_ADMIN';
      const staffId = 'STF-' + Date.now().toString().slice(-4);
      await supabase.from('staff').insert([
        {
          id: staffId,
          name: authData.user?.user_metadata?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: metaRole,
          status: 'Active',
          last_active: 'Baru saja',
        },
      ]);
      return {
        success: true,
        user: {
          id: staffId,
          name: authData.user?.user_metadata?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: metaRole,
        },
      };
    }

    if (staffRow.status !== 'Active') {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Akun staff Anda saat ini berstatus Non-Aktif. Hubungi Super Admin.',
      };
    }

    // Update last_active timestamp
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    await supabase.from('staff').update({ last_active: nowStr }).eq('id', staffRow.id);

    return {
      success: true,
      user: {
        id: staffRow.id,
        name: staffRow.name,
        email: staffRow.email,
        role: staffRow.role,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal memproses autentikasi.' };
  }
}

export async function signOutStaffInSupabase(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Supabase signOut error:', err);
  }
}

export async function deleteStaffInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteStaff error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteStaff exception:', err);
    return false;
  }
}

export async function updateStaffStatusInSupabase(id: string, status: 'Active' | 'Inactive'): Promise<boolean> {
  try {
    const { error } = await supabase.from('staff').update({ status }).eq('id', id);
    if (error) {
      console.error('Supabase updateStaff status error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase updateStaff exception:', err);
    return false;
  }
}

// ==========================================
// 6. MEDIA PARTNERS & SPONSORS SERVICE
// ==========================================

export function mapMediaPartnerFromDB(row: any): MediaPartner {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo || '',
    website: row.website || '',
    instagram: row.instagram || '',
    description: row.description || '',
    displayOrder: Number(row.display_order || 0),
    status: row.status,
  };
}

export async function uploadPartnerLogoToSupabase(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    const filePath = `partner_${Date.now()}_${cleanName}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('media-partners')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return {
        success: false,
        error: `Supabase Storage error: ${error.message}. Pastikan bucket "media-partners" telah dibuat dengan akses Public.`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('media-partners')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('Supabase storage exception:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengunggah logo ke Supabase Storage.',
    };
  }
}

export async function fetchMediaPartnersFromSupabase(): Promise<MediaPartner[]> {
  try {
    const { data, error } = await supabase
      .from('media_partners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetchMediaPartners error:', error.message);
      return [];
    }
    return (data || []).map(mapMediaPartnerFromDB);
  } catch (err) {
    console.warn('Supabase fetchMediaPartners exception:', err);
    return [];
  }
}

export async function createMediaPartnerInSupabase(partner: MediaPartner): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Generate guaranteed unique ID if needed
    let finalId = partner.id;
    const { data: existingRows } = await supabase.from('media_partners').select('id');
    if (existingRows && existingRows.length > 0) {
      const existingIds = new Set(existingRows.map((r: any) => r.id));
      if (existingIds.has(finalId) || !finalId) {
        const nums = existingRows
          .map((r: any) => parseInt(String(r.id).replace(/\D/g, ''), 10))
          .filter((n: number) => !isNaN(n));
        const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
        finalId = `MP-${String(maxNum + 1).padStart(3, '0')}`;
        if (existingIds.has(finalId)) {
          finalId = `MP-${Date.now().toString().slice(-4)}`;
        }
      }
    }

    const row = {
      id: finalId,
      name: partner.name,
      logo: partner.logo,
      website: partner.website || '',
      instagram: partner.instagram || '',
      description: partner.description || '',
      display_order: partner.displayOrder,
      status: partner.status,
    };
    const { error } = await supabase.from('media_partners').insert([row]);
    if (error) {
      console.error('Supabase createMediaPartner error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, id: finalId };
  } catch (err: any) {
    console.error('Supabase createMediaPartner exception:', err);
    return { success: false, error: err?.message || 'Gagal membuat media partner.' };
  }
}

export async function deletePartnerLogoFromStorage(logoUrl: string): Promise<void> {
  try {
    if (!logoUrl) return;
    let filePath = '';
    if (logoUrl.includes('/media-partners/')) {
      filePath = logoUrl.split('/media-partners/')[1]?.split('?')[0] || '';
    } else if (logoUrl.startsWith('partner_')) {
      filePath = logoUrl;
    }

    if (filePath) {
      const decodedPath = decodeURIComponent(filePath);
      const { error } = await supabase.storage.from('media-partners').remove([decodedPath]);
      if (error) {
        console.warn('Failed to delete image from Supabase storage:', error.message);
      }
    }
  } catch (err) {
    console.warn('Exception deleting logo from storage:', err);
  }
}

export async function deleteMediaPartnerInSupabase(id: string, logoUrl?: string): Promise<boolean> {
  try {
    let targetLogo = logoUrl;
    if (!targetLogo) {
      const { data } = await supabase.from('media_partners').select('logo').eq('id', id).maybeSingle();
      if (data?.logo) {
        targetLogo = data.logo;
      }
    }

    const { error } = await supabase.from('media_partners').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteMediaPartner error:', error.message);
      return false;
    }

    if (targetLogo) {
      await deletePartnerLogoFromStorage(targetLogo);
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteMediaPartner exception:', err);
    return false;
  }
}

export function mapSponsorFromDB(row: any): Sponsor {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo || '',
    website: row.website || '',
    description: row.description || '',
    tier: row.tier,
    displayOrder: Number(row.display_order || 0),
    status: row.status,
  };
}

export async function fetchSponsorsFromSupabase(): Promise<Sponsor[]> {
  try {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetchSponsors error:', error.message);
      return [];
    }
    return (data || []).map(mapSponsorFromDB);
  } catch (err) {
    console.warn('Supabase fetchSponsors exception:', err);
    return [];
  }
}

export async function createSponsorInSupabase(sponsor: Sponsor): Promise<boolean> {
  try {
    const row = {
      id: sponsor.id,
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website,
      description: sponsor.description,
      tier: sponsor.tier,
      display_order: sponsor.displayOrder,
      status: sponsor.status,
    };
    const { error } = await supabase.from('sponsors').insert([row]);
    if (error) {
      console.error('Supabase createSponsor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase createSponsor exception:', err);
    return false;
  }
}

export async function deleteSponsorInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('sponsors').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteSponsor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteSponsor exception:', err);
    return false;
  }
}

// ==========================================
// 7. ACTIVITIES SERVICE
// ==========================================

export function mapActivityFromDB(row: any): RecentActivity {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp || 'Baru saja',
    iconName: row.icon_name || undefined,
  };
}

export async function fetchActivitiesFromSupabase(): Promise<RecentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Supabase fetchActivities error:', error.message);
      return [];
    }
    return (data || []).map(mapActivityFromDB);
  } catch (err) {
    console.warn('Supabase fetchActivities exception:', err);
    return [];
  }
}

export async function recordActivityInSupabase(activity: {
  type: RecentActivity['type'];
  title: string;
  description: string;
  iconName?: string;
}): Promise<boolean> {
  try {
    const id = 'ACT-' + Date.now();
    const row = {
      id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: 'Baru saja',
      icon_name: activity.iconName || null,
    };
    const { error } = await supabase.from('activities').insert([row]);
    if (error) {
      console.warn('Supabase recordActivity error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase recordActivity exception:', err);
    return false;
  }
}

// ==========================================
// 8. TICKET LOOKUP HELPER (PUBLIC SEARCH)
// ==========================================

export async function lookupTicketInSupabase(query: string): Promise<any | null> {
  const clean = query.trim();
  if (!clean) return null;

  try {
    // 1. Search in transactions by order_id, email, participant_id, nim, or participant_name
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .or(`order_id.ilike.%${clean}%,email.ilike.%${clean}%,participant_id.ilike.%${clean}%,nim.ilike.%${clean}%,participant_name.ilike.%${clean}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (txData && txData.length > 0) {
      const tx = txData[0];
      return {
        orderId: tx.order_id,
        ticketCode: 'SEM-' + (tx.order_id.replace(/^ORD-/, '') || tx.order_id),
        ticketCategoryId: tx.ticket_id || 'regular',
        ticketCategoryName: tx.ticket_name,
        ticketPrice: Number(tx.amount) / Math.max(1, Number(tx.quantity || 1)),
        quantity: Number(tx.quantity || 1),
        totalPrice: Number(tx.amount),
        paymentMethod: tx.payment_method || 'QRIS Instant',
        paymentProof: tx.payment_proof || '/scanqr.jpeg',
        paymentStatus:
          tx.payment_status === 'Paid'
            ? 'Pembayaran Berhasil'
            : tx.payment_status === 'Pending'
            ? 'Menunggu Konfirmasi Admin'
            : tx.payment_status === 'Failed'
            ? 'Pembayaran Tidak Berhasil'
            : 'Menunggu Pembayaran',
        ticketStatus:
          tx.payment_status === 'Paid'
            ? tx.check_in_status === 'Checked In'
              ? 'Tiket Digunakan'
              : 'Tiket Aktif'
            : tx.payment_status === 'Failed'
            ? 'Tiket Ditolak'
            : 'Menunggu Konfirmasi',
        createdAt: tx.order_date || tx.created_at || new Date().toISOString(),
        customer: {
          fullName: tx.participant_name,
          email: tx.email,
          phone: tx.whatsapp || '',
          nim: tx.nim,
          faculty: tx.faculty || '',
          studyProgram: tx.study_program || '',
        },
      };
    }

    // 2. Search in participants table if not found directly in transactions
    const { data: partData } = await supabase
      .from('participants')
      .select('*')
      .or(`nim.ilike.%${clean}%,email.ilike.%${clean}%,order_id.ilike.%${clean}%,id.ilike.%${clean}%,name.ilike.%${clean}%`)
      .order('registered_at', { ascending: false })
      .limit(1);

    if (partData && partData.length > 0) {
      const p = partData[0];
      // Try to find matching transaction for full payment details
      let tx: any = null;
      if (p.order_id) {
        const { data: matchedTx } = await supabase
          .from('transactions')
          .select('*')
          .eq('order_id', p.order_id)
          .limit(1);
        if (matchedTx && matchedTx.length > 0) {
          tx = matchedTx[0];
        }
      }

      return {
        orderId: p.order_id || p.id,
        ticketCode: 'SEM-' + ((p.order_id || p.id).replace(/^ORD-/, '') || p.id),
        ticketCategoryId: p.ticket_id || 'regular',
        ticketCategoryName: p.ticket_name || 'Seminar Pass',
        ticketPrice: Number(p.price) || (tx ? Number(tx.amount) : 0),
        quantity: tx ? Number(tx.quantity || 1) : 1,
        totalPrice: tx ? Number(tx.amount) : Number(p.price) || 0,
        paymentMethod: tx?.payment_method || 'QRIS Instant',
        paymentProof: p.payment_proof || tx?.payment_proof || '/scanqr.jpeg',
        paymentStatus:
          (p.payment_status || tx?.payment_status) === 'Paid'
            ? 'Pembayaran Berhasil'
            : (p.payment_status || tx?.payment_status) === 'Pending'
            ? 'Menunggu Konfirmasi Admin'
            : (p.payment_status || tx?.payment_status) === 'Failed'
            ? 'Pembayaran Tidak Berhasil'
            : 'Menunggu Pembayaran',
        ticketStatus:
          (p.payment_status || tx?.payment_status) === 'Paid'
            ? (p.check_in_status || tx?.check_in_status) === 'Checked In'
              ? 'Tiket Digunakan'
              : 'Tiket Aktif'
            : (p.payment_status || tx?.payment_status) === 'Failed'
            ? 'Tiket Ditolak'
            : 'Menunggu Konfirmasi',
        createdAt: p.registered_at || tx?.order_date || new Date().toISOString(),
        customer: {
          fullName: p.name,
          email: p.email,
          phone: p.whatsapp || tx?.whatsapp || '',
          nim: p.nim,
          faculty: p.faculty || tx?.faculty || '',
          studyProgram: p.prodi || tx?.study_program || '',
        },
      };
    }

    return null;
  } catch (err) {
    console.error('Supabase lookupTicket exception:', err);
    return null;
  }
}
