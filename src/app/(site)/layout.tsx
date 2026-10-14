'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  UserCheck,
  LogOut,
  Phone,
  Mail,
  Lock
} from 'lucide-react';

import { CustomerAuthModal } from '@/components/CustomerAuthModal';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { customerUser, customerLogout, openAuthModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Global Customer Auth Popup */}
      <CustomerAuthModal />

      {/* Public Site Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Company Name */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 p-0.5 group-hover:scale-105 transition-transform bg-white">
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
                <span className="font-extrabold text-base sm:text-lg text-[#374421] tracking-wide block leading-none">
                  RAKVIH
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">
                  Solutions Private Limited
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-gray-600">
              <Link
                href="/"
                className={`hover:text-[#4d5d30] transition-colors ${pathname === '/' ? 'text-[#4d5d30] font-bold' : ''}`}
              >
                Home
              </Link>
              <Link href="/#schemes" className="hover:text-[#4d5d30] transition-colors">
                Chit Schemes
              </Link>
              <Link href="/#calculator" className="hover:text-[#4d5d30] transition-colors">
                Savings Calculator
              </Link>
              <Link href="/#about" className="hover:text-[#4d5d30] transition-colors">
                About & Compliance
              </Link>
            </nav>

            {/* Customer Authentication & Portal Action */}
            <div className="flex items-center space-x-3">
              {customerUser ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/portal"
                    className="bg-[#4d5d30] text-white hover:bg-[#374421] text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>My Customer Portal</span>
                  </Link>

                  <button
                    onClick={customerLogout}
                    title="Sign Out"
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="text-xs font-bold text-gray-700 hover:text-[#4d5d30] px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-[#4d5d30] text-white hover:bg-[#374421] text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer hover:scale-105"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="bg-[#2d381e] text-white py-12 border-t border-emerald-950 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center font-bold text-[#2d381e]">
                  R
                </div>
                <span className="font-bold text-lg text-white">RAKVIH SOLUTIONS</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                RAKVIH Solutions Private Limited. Next-generation digital chitty management platform providing transparent, regulated savings and emergency liquidity.
              </p>
              <div className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-md inline-block">
                Registered under Chit Funds Act, 1982
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
                <li><Link href="/#schemes" className="hover:text-white transition-colors">Available Schemes</Link></li>
                <li><Link href="/#calculator" className="hover:text-white transition-colors">Financial Calculator</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Customer Login / Register</Link></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Customer Support
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>+91 80 4000 1234</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>support@rakvih.com</span>
                </li>
                <li><span>Bangalore, Karnataka, India</span></li>
              </ul>
            </div>

            {/* Regulatory & Staff Access */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Security & Staff
              </h4>
              <p className="text-xs text-gray-300 mb-3">
                256-bit SSL encrypted financial transactions with Supabase Row Level Security.
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Management Portal</span>
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-700/60 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
            <p>© 2026 RAKVIH Solutions Private Limited. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <span>Privacy Policy</span>
              <span>Terms & Conditions</span>
              <span>Compliance Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
