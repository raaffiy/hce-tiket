import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const metadata = {
  title: 'HCE Ticket — Super Admin Dashboard',
  description: 'Enterprise event & ticketing management system for Super Admin',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
