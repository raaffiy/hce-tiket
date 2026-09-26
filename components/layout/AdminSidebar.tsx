'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  ReceiptText,
  QrCode,
  Users,
  Handshake,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const pathname = usePathname();

  const navigationSections = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Tickets', href: '/admin/tickets', icon: Ticket },
        { label: 'Transactions', href: '/admin/transactions', icon: ReceiptText },
        { label: 'Check-In', href: '/admin/check-in', icon: QrCode },
        { label: 'Participants', href: '/admin/participants', icon: Users },
      ],
    },
    {
      title: 'CONTENT / LANDING PAGE',
      items: [
        { label: 'Media & Sponsor', href: '/admin/partners', icon: Handshake },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Master Data', href: '/admin/transaction-data', icon: FileSpreadsheet },
        { label: 'Staff Management', href: '/admin/staff', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#102A43] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E05A1F] to-[#1A5E61] flex items-center justify-center font-bold text-white shadow-md">
                  H
                </div>
                <div>
                  <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                    HCE TICKET
                    <span className="text-[10px] bg-[#E05A1F] text-white px-1.5 py-0.5 rounded-full font-bold">
                      ADMIN
                    </span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">SUPER ADMIN v2.0</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-[#E05A1F] to-[#1A5E61] flex items-center justify-center font-bold text-white shadow-md">
                H
              </div>
            )}

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {navigationSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {!isCollapsed ? (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {sec.title}
                  </p>
                ) : (
                  <div className="w-4 h-0.5 bg-slate-800 mx-auto my-2 rounded-full" />
                )}

                {sec.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#1A5E61] text-white shadow-sm shadow-[#1A5E61]/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-[#FFF6E9]' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom System & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="overflow-hidden">
                <p className="text-[11px] font-semibold text-slate-200 truncate">Sistem Berjalan Normal</p>
                <p className="text-[10px] text-slate-400">Gate Active: 2 Scanner</p>
              </div>
            </div>
          )}

          <button
            onClick={() => alert('Fitur simulasi logout - Super Admin session.')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs lg:text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
