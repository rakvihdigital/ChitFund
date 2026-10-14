'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Shield,
  LayoutDashboard,
  Layers,
  Users,
  FileCheck,
  CreditCard,
  Award,
  Lock,
  BookOpen,
  History,
  LogOut,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, adminLogout, kycList, payouts } = useApp();

  const isLoginPage = pathname === '/admin/login';

  // Gate admin routes except login
  React.useEffect(() => {
    if (!adminUser && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [adminUser, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-900 text-white">{children}</div>;
  }

  const pendingKYCCount = kycList.filter((k) => k.status === 'PENDING_APPROVAL').length;
  const pendingPayoutCount = payouts.filter((p) => p.status === 'GUARANTOR_PENDING' || p.status === 'MAKER_APPROVED').length;

  const navItems = [
    { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/groups', label: 'Chit Schemes', icon: Layers },
    { href: '/admin/subscribers', label: 'Subscribers & Seats', icon: Users },
    {
      href: '/admin/kyc',
      label: 'KYC Approvals',
      icon: FileCheck,
      badge: pendingKYCCount > 0 ? `${pendingKYCCount} NEW` : null,
      badgeColor: 'bg-amber-500 text-gray-950 font-black'
    },
    { href: '/admin/collections', label: 'Collections & Dues', icon: CreditCard },
    { href: '/admin/auctions', label: 'e-Auctions & Draws', icon: Award },
    {
      href: '/admin/payouts',
      label: 'Maker-Checker Payouts',
      icon: Lock,
      badge: pendingPayoutCount > 0 ? `${pendingPayoutCount} ACTION` : null,
      badgeColor: 'bg-blue-500 text-white font-bold'
    },
    { href: '/admin/accounting', label: 'Ledgers & Accounts', icon: BookOpen },
    { href: '/admin/audit', label: 'Audit Trail', icon: History }
  ];

  return (
    <div className="min-h-screen flex bg-[#f7f9f4] text-gray-900">
      {/* STRICT STICKY SIDEBAR: Stays locked in place on all scrolls */}
      <aside className="w-68 bg-[#182010] text-white flex flex-col justify-between border-r border-[#263319] flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-40 shadow-2xl">
        <div className="flex flex-col">
          {/* Admin Header with Official Logo */}
          <div className="p-5 border-b border-[#253218] bg-[#141a0d]">
            <div className="flex items-center space-x-3">
              <div className="relative w-11 h-11 bg-white p-1 border-2 border-amber-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <Image
                  src="/logo.png"
                  alt="RAKVIH"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="overflow-hidden">
                <span className="font-black text-sm text-white tracking-wider block leading-tight uppercase truncate">
                  RAKVIH ADMIN
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block leading-none mt-0.5">
                  Management Console
                </span>
              </div>
            </div>

            {/* Live System Indicator */}
            <div className="mt-3 pt-2.5 border-t border-[#232e16] flex items-center justify-between text-[10px]">
              <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SYSTEM ACTIVE</span>
              </span>
              <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">
                V2.4 PROD
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <span className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
              Core Modules
            </span>
            <nav className="space-y-1 text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#374421] text-white font-extrabold shadow-md border-l-4 border-amber-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                      <span className="tracking-wide">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 tracking-wider uppercase ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Admin User Section & Quick Controls */}
        <div className="p-4 border-t border-[#253218] bg-[#141a0d] space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-amber-400 text-gray-950 font-black flex items-center justify-center text-sm shadow-sm">
              {adminUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">
                {adminUser?.fullName || 'Administrator'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {adminUser?.email || 'admin@rakvih.com'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <button
              onClick={adminLogout}
              className="bg-white/10 hover:bg-red-700 text-gray-200 hover:text-white font-bold py-2 px-3 text-[11px] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
            <Link
              href="/"
              target="_blank"
              title="Open Public Site"
              className="bg-white/10 hover:bg-[#374421] text-gray-200 hover:text-white font-bold py-2 px-3 text-[11px] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Site</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-xs">
          <div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              <Link href="/admin" className="hover:text-gray-700">Admin</Link>
              <span>/</span>
              <span className="text-[#374421] font-bold">
                {pathname === '/admin' ? 'Dashboard' : pathname.replace('/admin/', '').replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-lg font-black text-gray-900 capitalize tracking-tight mt-0.5">
              {pathname === '/admin' ? 'Executive Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="bg-[#f0f4e8] border border-[#d3dfc3] px-3.5 py-1.5 text-[#374421] font-bold flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-[#374421]" />
              <span>Govt Chit Funds Act 1982 Compliant</span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 relative">
          {!adminUser && (
            <div className="absolute inset-0 bg-gray-100/95 backdrop-blur-xs z-30 flex items-center justify-center p-4">
              <div className="bg-white p-8 border-2 border-[#374421] text-center space-y-4 max-w-sm shadow-2xl">
                <Shield className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                <h3 className="font-black text-base text-gray-900 uppercase">Admin Authorization Required</h3>
                <p className="text-xs text-gray-500">Redirecting to administrator authentication gateway...</p>
                <Link
                  href="/admin/login"
                  className="inline-block bg-[#374421] text-white font-bold text-xs px-5 py-2.5 uppercase tracking-wider shadow-md hover:bg-[#283218]"
                >
                  Go to Admin Login
                </Link>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
