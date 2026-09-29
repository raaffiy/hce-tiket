'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHCEApp } from '@/context/HCEAppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ToastContainer } from '../ui/Toast';
import { Loader2 } from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, isLoading } = useHCEApp();
  const pathname = usePathname();
  const router = useRouter();

  // Role Protection & Auth Guard
  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        // Not logged in -> redirect to landing page
        router.replace('/');
        return;
      }

      // STAFF role -> strictly only allowed to access /admin/check-in
      if (currentUser.role === 'STAFF' && pathname !== '/admin/check-in') {
        router.replace('/admin/check-in');
      }
    }
  }, [currentUser, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#102A43] flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-[#E05A1F] animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide">Memuat Sistem Autentikasi...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-[#1A5E61] selection:text-white">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminHeader onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Component */}
      <ToastContainer />
    </div>
  );
};
