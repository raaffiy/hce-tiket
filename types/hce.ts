export type TicketBadgeType = 'EARLY' | 'NORMAL' | 'EXTEND';
export type TicketType = 'FREE' | 'PAID';
export type TicketVisibility = 'PUBLIC' | 'PRIVATE';
export type TicketStatus = 'Active' | 'Sold Out' | 'Archived';

export interface Ticket {
  id: string;
  name: string;
  description: string;
  type: TicketType;
  badge: TicketBadgeType;
  visibility: TicketVisibility;
  price: number;
  quota: number;
  sold: number;
  remaining: number;
  startDate: string; // ISO or YYYY-MM-DDTHH:mm
  endDate: string;
  benefits: string[];
  status: TicketStatus;
  privateLink?: string;
  createdAt: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';
export type CheckInStatus = 'Checked In' | 'Not Checked In';
export type CheckInMethod = 'QR Scan' | 'Manual';

export interface Participant {
  id: string;
  orderId: string;
  name: string;
  nim: string;
  email: string;
  whatsapp: string;
  faculty: string;
  prodi: string;
  ticketId: string;
  ticketName: string;
  ticketType: TicketType;
  price: number;
  paymentStatus: PaymentStatus;
  paymentProof?: string;
  checkInStatus: CheckInStatus;
  checkInTime?: string;
  checkedInMethod?: CheckInMethod;
  registeredAt: string;
}

export interface Transaction {
  orderId: string;
  orderDate: string;
  participantId: string;
  participantName: string;
  nim: string;
  email: string;
  ticketId: string;
  ticketName: string;
  ticketType: TicketType;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentProof?: string;
  checkInStatus: CheckInStatus;
  paymentMethod: string;
  lastUpdated: string;
}

export type StaffRole = 
  | 'SUPER_ADMIN' 
  | 'STAFF';

export interface StaffRoleConfig {
  key: StaffRole;
  label: string;
  description: string;
  color: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: 'Active' | 'Inactive';
  createdDate: string;
  lastActive: string;
}

export interface MediaPartner {
  id: string;
  name: string;
  logo: string;
  website: string;
  instagram: string;
  description: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
}

export type SponsorTier = 'Main Sponsor' | 'Gold' | 'Silver' | 'Bronze' | 'Partner';

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  tier: SponsorTier;
  displayOrder: number;
  status: 'Active' | 'Inactive';
}

export interface RecentActivity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'participant_bought' | 'checkin_success' | 'transaction_updated' | 'staff_created' | 'sponsor_added';
  title: string;
  description: string;
  timestamp: string;
  iconName?: string;
}
