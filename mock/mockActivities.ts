import { RecentActivity } from '@/types/hce';

export const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 'ACT-001',
    type: 'checkin_success',
    title: 'Check-In Berhasil (QR Gate 1)',
    description: 'Ahmad Fauzan (102022300142) berhasil check-in untuk Early Bird Ticket',
    timestamp: '2 menit yang lalu',
  },
  {
    id: 'ACT-002',
    type: 'participant_bought',
    title: 'Pembelian Tiket Berhasil',
    description: 'Farhan Maulana Akbar menyelesaikan pembayaran Extended Final Call Pass (Rp 75.000)',
    timestamp: '15 menit yang lalu',
  },
  {
    id: 'ACT-003',
    type: 'ticket_created',
    title: 'Tiket Baru Dibuat',
    description: 'Tiket "Workshop Special Track - UI/UX Masterclass" disimpan sebagai Draft',
    timestamp: '1 jam yang lalu',
  },
  {
    id: 'ACT-004',
    type: 'checkin_success',
    title: 'Check-In Manual Berhasil',
    description: 'Nabila Safitri diverifikasi via Manual Check-In oleh Staff Salsabila',
    timestamp: '2 jam yang lalu',
  },
  {
    id: 'ACT-005',
    type: 'transaction_updated',
    title: 'Koreksi Data Peserta',
    description: 'Super Admin memperbarui data NIM & Fakultas untuk order OM26-0842',
    timestamp: '3 jam yang lalu',
  },
  {
    id: 'ACT-006',
    type: 'staff_created',
    title: 'Akun Staff Ditambahkan',
    description: 'Akun "Bima Perkasa" dengan role Check-In Staff berhasil diaktifkan',
    timestamp: '5 jam yang lalu',
  },
];
