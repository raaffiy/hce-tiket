'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useHCEApp } from '@/context/HCEAppContext';
import {
  LayoutDashboard,
  Ticket,
  ReceiptText,
  QrCode,
  Handshake,
  FileSpreadsheet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
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
  const router = useRouter();
  const { currentUser, logoutUser } = useHCEApp();

  const isStaffOnly = currentUser?.role === 'STAFF';

  const navigationSections = isStaffOnly
    ? [
        {
          title: 'OPERASIONAL GATE',
          items: [
            { label: 'Check-In Tiket', href: '/admin/check-in', icon: QrCode },
          ],
        },
      ]
    : [
        {
          title: 'MAIN',
          items: [
            { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'Tickets', href: '/admin/tickets', icon: Ticket },
            { label: 'Transactions', href: '/admin/transactions', icon: ReceiptText },
            { label: 'Check-In', href: '/admin/check-in', icon: QrCode },
          ],
        },
        {
          title: 'CONTENT / LANDING PAGE',
          items: [
            { label: 'Partnership & Media', href: '/admin/partners', icon: Handshake },
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
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                {/* logo hce */}
                <Image src="/HCE LOGO.png" alt="Logo" width={50} height={50} />
                <div>
                  <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                    HCE TICKET
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">HIPMI COLLAB EXPO</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-[#E05A1F] to-[#1A5E61] flex items-center justify-center font-bold text-white shadow-md">
                <Image src="/HCE LOGO.png" alt="Logo" width={50} height={50} />
              </div>
            )}

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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

          <button
            onClick={async () => {
              await logoutUser();
              router.push('/');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs lg:text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>
    </>
  );
};
