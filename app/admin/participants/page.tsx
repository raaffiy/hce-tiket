'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParticipantsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/transaction-data');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-[#1A5E61] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Mengalihkan ke menu Master Data & Participants...</p>
      </div>
    </div>
  );
}
