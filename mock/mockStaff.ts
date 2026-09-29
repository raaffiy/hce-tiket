import { Staff, StaffRoleConfig } from '@/types/hce';

export const STAFF_ROLE_CONFIGS: StaffRoleConfig[] = [
  {
    key: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Akses penuh ke seluruh modul, data master, konfigurasi tiket, transaksi, dan manajemen staff.',
    color: 'purple',
  },
  {
    key: 'STAFF',
    label: 'Staff',
    description: 'Akses khusus untuk operasional pemindaian QR code tiket dan verifikasi check-in kehadiran peserta.',
    color: 'emerald',
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'STF-001',
    name: 'Rafi Pratama (You)',
    email: 'superadmin@hce-event.id',
    role: 'SUPER_ADMIN',
    status: 'Active',
    createdDate: '2026-06-01',
    lastActive: 'Online Saat Ini',
  },
  {
    id: 'STF-002',
    name: 'Aditya Bagus Wicaksono',
    email: 'aditya.bagus@hce-event.id',
    role: 'STAFF',
    status: 'Active',
    createdDate: '2026-07-15',
    lastActive: '2026-09-26 22:40',
  },
  {
    id: 'STF-003',
    name: 'Salsabila Putri',
    email: 'salsabila.checkin@hce-event.id',
    role: 'STAFF',
    status: 'Active',
    createdDate: '2026-08-01',
    lastActive: '2026-09-27 00:15',
  },
  {
    id: 'STF-004',
    name: 'Bima Perkasa',
    email: 'bima.gate2@hce-event.id',
    role: 'STAFF',
    status: 'Active',
    createdDate: '2026-08-05',
    lastActive: '2026-09-26 19:30',
  },
  {
    id: 'STF-005',
    name: 'Maya Indah Lestari',
    email: 'maya.finance@hce-event.id',
    role: 'STAFF',
    status: 'Active',
    createdDate: '2026-07-20',
    lastActive: '2026-09-26 18:10',
  },
  {
    id: 'STF-006',
    name: 'Rizky Kurniawan',
    email: 'rizky.staff@hce-event.id',
    role: 'STAFF',
    status: 'Inactive',
    createdDate: '2026-08-10',
    lastActive: '2026-09-20 11:00',
  },
];
