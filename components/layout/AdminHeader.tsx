'use client';

import React from 'react';
import { Menu, Shield, Calendar } from 'lucide-react';
import { useHCEApp } from '@/context/HCEAppContext';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser, stats } = useHCEApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left items */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-[#1A5E61]" />
          <span>HCE 2026 Live Event Monitoring</span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Quick Quick Status */}
        <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kehadiran</p>
            <p className="text-xs font-bold text-[#102A43]">
              {stats.totalCheckedIn} / {stats.totalParticipants} ({stats.attendancePercentage}%)
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-600">
            {stats.attendancePercentage}%
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#102A43] leading-tight">{currentUser.name}</p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                <Shield className="w-2.5 h-2.5" />
                SUPER ADMIN
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#1A5E61]/20 shadow-xs">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
