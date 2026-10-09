'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  Shield,
  UserCheck,
  Bell,
  Wallet,
  Building2,
  FileText,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronDown,
  Layers,
  CheckCircle2,
  LogOut,
  Sliders,
  DollarSign,
  FileCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, setCurrentUserRole, notifications, markNotificationRead } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roles: { role: UserRole; label: string; badge: string; color: string }[] = [
    { role: 'CUSTOMER', label: 'Customer View (Rahul Sharma)', badge: 'Subscriber', color: 'bg-emerald-100 text-emerald-800' },
    { role: 'SUPER_ADMIN', label: 'Admin View (Vikram Mehta)', badge: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
    { role: 'FINANCE_MANAGER', label: 'Finance Manager (Ananya Reddy)', badge: 'Finance', color: 'bg-blue-100 text-blue-800' },
    { role: 'KYC_OFFICER', label: 'KYC Verification Officer (Rajesh)', badge: 'KYC Officer', color: 'bg-amber-100 text-amber-800' }
  ];

  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 p-0.5 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="RAKVIH Solutions"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-bold text-lg text-[#374421] tracking-wide block leading-none">
                  RAKVIH
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">
                  Digital Chit Fund
                </span>
              </div>
            </Link>

            {/* Portal Switcher Tabs */}
            <div className="hidden md:flex items-center ml-8 space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <Link
                href="/portal"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  !isAdminRoute && pathname !== '/'
                    ? 'bg-white text-[#4d5d30] shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Customer Portal</span>
              </Link>
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  isAdminRoute
                    ? 'bg-[#4d5d30] text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Right Navigation & Controls */}
          <div className="flex items-center space-x-4">
            {/* Quick Calculator / Schemes Link */}
            <Link
              href="/#schemes"
              className="hidden lg:flex items-center space-x-1 text-xs font-medium text-gray-600 hover:text-[#4d5d30] px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <TrendingUp className="w-4 h-4 text-[#d97706]" />
              <span>Chit Schemes</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} unread
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer text-xs ${
                          !n.isRead ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex justify-between font-semibold text-gray-900 mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-gray-400 font-normal">{n.timestamp}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#4d5d30] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-none">{currentUser.fullName}</p>
                  <span className="text-[10px] text-gray-500 font-medium leading-none capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Demo Role Switcher
                    </p>
                    <p className="text-xs text-gray-600">Switch user persona to test workflows</p>
                  </div>
                  <div className="py-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          setCurrentUserRole(r.role);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          currentUser.role === r.role ? 'bg-amber-50/60 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {currentUser.role === r.role && (
                            <CheckCircle2 className="w-4 h-4 text-[#4d5d30]" />
                          )}
                          <span className="text-gray-900">{r.label}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${r.color}`}>
                          {r.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-1 pt-1 px-4 py-1.5 text-[11px] text-gray-400">
                    Supabase Auth + RLS enforcement simulation
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
