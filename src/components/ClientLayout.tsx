'use client';

import React from 'react';
import { AppProvider } from '@/lib/store';
import { Navbar } from './Navbar';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-[#2d381e] text-white py-12 border-t border-emerald-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center font-bold text-[#2d381e]">
                    R
                  </div>
                  <span className="font-bold text-lg text-white">RAKVIH SOLUTIONS</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  RAKVIH Solutions Private Limited. Next-generation, regulatory-compliant Digital Chit Fund Management Platform.
                </p>
                <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-md inline-block">
                  Govt Registered Chit Fund Rules 1982 Compliant
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Customer Portal
                </h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li><a href="/portal/chits" className="hover:text-white transition-colors">My Active Groups</a></li>
                  <li><a href="/portal/payments" className="hover:text-white transition-colors">Pay Monthly Dues</a></li>
                  <li><a href="/portal/auctions" className="hover:text-white transition-colors">Live Auction Room</a></li>
                  <li><a href="/portal/kyc" className="hover:text-white transition-colors">KYC Document Upload</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Admin Platform
                </h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li><a href="/admin/groups" className="hover:text-white transition-colors">Group Management</a></li>
                  <li><a href="/admin/kyc" className="hover:text-white transition-colors">KYC Verification Queue</a></li>
                  <li><a href="/admin/payouts" className="hover:text-white transition-colors">Maker-Checker Payouts</a></li>
                  <li><a href="/admin/audit" className="hover:text-white transition-colors">Immutable Audit Logs</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Security & Support
                </h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li><span>Dual Authorization (Maker-Checker)</span></li>
                  <li><span>Supabase Row-Level Security</span></li>
                  <li><span>UPI & Net Banking Gateway</span></li>
                  <li><a href="/portal/support" className="hover:text-white transition-colors">Raise Support Ticket</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-700/60 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
              <p>© 2026 RAKVIH Solutions Private Limited. All Rights Reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Audit & Security</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};
