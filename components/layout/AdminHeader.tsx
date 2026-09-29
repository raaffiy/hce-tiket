'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, User, LayoutGrid, LogOut } from 'lucide-react';
import { useHCEApp } from '@/context/HCEAppContext';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser } = useHCEApp();

  const handleLogout = () => {
    alert('Simulasi Logout - Super Admin session');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left items: Mobile Menu & Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shadow-xs overflow-hidden">
            <Image
              src="/HCE LOGO.png"
              alt="HCE Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="font-extrabold text-sm tracking-tight text-[#102A43]">
              HCE<span className="text-[#E05A1F] ml-0.5">2026</span>
            </h1>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              CONTROL CENTER
            </span>
          </div>
        </div>
      </div>

      {/* Right items: User Profile, Badge, Landing, Keluar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Info */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-[#102A43] leading-none uppercase">
            {currentUser?.name || 'PANITIA HCE'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 capitalize leading-none">
            {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser?.role === 'STAFF' ? 'Staff (Check-In)' : (currentUser?.role || 'Staff')}
          </p>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-bold">
          <User className="w-3.5 h-3.5 text-slate-600" />
          <span>{currentUser?.role === 'STAFF' ? 'STAFF' : 'SUPER ADMIN'}</span>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Landing Page Link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#102A43] transition-colors py-1 px-1.5 rounded-md hover:bg-slate-50"
        >
          <LayoutGrid className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </header>
  );
};
