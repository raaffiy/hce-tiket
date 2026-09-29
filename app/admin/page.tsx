'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHCEApp } from '@/context/HCEAppContext';

export default function AdminPage() {
  const { currentUser, isLoading } = useHCEApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.replace('/');
      } else if (currentUser.role === 'STAFF') {
        router.replace('/admin/check-in');
      } else {
        router.replace('/admin/dashboard');
      }
    }
  }, [currentUser, isLoading, router]);

  return null;
}
