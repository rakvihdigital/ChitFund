'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ChitCalculator } from '@/components/ChitCalculator';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Smartphone,
  Layers,
  FileSpreadsheet,
  Users,
  Clock,
  Calendar,
  ChevronRight,
  Shield,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function LandingPage() {
  const { groups, joinChitGroup, currentUser } = useApp();
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<boolean>(false);

  const handleJoinGroup = (groupId: string) => {
    joinChitGroup(groupId);
    setSelectedGroupToJoin(null);
    setJoinSuccess(true);
    setTimeout(() => setJoinSuccess(false), 5000);
  };

  const modules = [
    { title: '1. Customer Registration', desc: 'Mobile/Email OTP, Nominee setup & profile management.' },
    { title: '2. KYC Verification', desc: 'PAN, Aadhaar, Photo & Bank proof verification workflow.' },
    { title: '3. Chit Group Management', desc: 'Custom chit plans, monthly dues, member seats & duration.' },
    { title: '4. Subscriber Tracking', desc: 'Seat allocation, group membership & subscriber history.' },
    { title: '5. Monthly Contributions', desc: 'Automated instalment schedules, dues, penalties & dividends.' },
    { title: '6. Payment Gateway', desc: 'Instant UPI, NetBanking, Debit/Credit Card & Bank Transfer.' },
    { title: '7. Reconciliation', desc: 'Automated gateway matching with bank settlement accounts.' },
    { title: '8. Auction & Draw Engine', desc: 'Live e-Auction bidding room with countdown & winner declaration.' },
    { title: '9. Prize Calculations', desc: 'Regulated 5% Foreman fee, Dividend distribution & Net Prize.' },
    { title: '10. Payout Management', desc: 'Maker-Checker dual authorization for safe disbursement.' },
    { title: '11. Guarantor & Security', desc: 'Salary slips, property deeds, security cheques verification.' },
    { title: '12. Digital Documents', desc: 'Instant PDF receipts, chit agreements & passbook statements.' },
    { title: '13. Notifications', desc: 'SMS, Email & In-App payment reminders & auction alerts.' },
    { title: '14. Accounting Ledgers', desc: 'Double-entry customer, group, collection & payout ledgers.' },
    { title: '15. Financial Reports', desc: 'PDF, Excel & CSV collection, dues & compliance reports.' },
    { title: '16. Support Tickets', desc: 'Customer complaint ticketing, assignment & resolution.' },
    { title: '17. Roles & Permissions', desc: 'Granular access control for Admin, Finance & KYC officers.' },
    { title: '18. Immutable Audit Trail', desc: 'Cryptographically accountable log of financial & admin events.' }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Toast Notification */}
      {joinSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Successfully Joined Chit Group!</p>
            <p className="text-xs text-emerald-100">Check your Customer Portal for monthly schedule.</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f2f5ed] via-white to-gray-50 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-[#e8eedd] border border-[#d2dfbd] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#374421]">
                <ShieldCheck className="w-4 h-4 text-[#4d5d30]" />
                <span>RAKVIH Solutions Private Limited • Chit Fund Act 1982 Compliant</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Digital Chit Fund <br />
                <span className="text-[#4d5d30] underline decoration-amber-400 decoration-wavy decoration-2">
                  Management Platform
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Centralized financial management software connecting subscribers and administrators. Complete
                digital lifecycle: KYC verification, UPI contributions, live e-auctions, dividend payouts, and maker-checker ledgers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  href="/portal"
                  className="bg-[#4d5d30] text-white hover:bg-[#374421] px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/10 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Launch Customer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/admin"
                  className="bg-white border-2 border-[#4d5d30] text-[#4d5d30] hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Open Admin Dashboard</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80 text-xs">
                <div>
                  <span className="font-extrabold text-gray-900 text-lg block">₹100+ Cr</span>
                  <span className="text-gray-500 font-medium">Group Volume</span>
                </div>
                <div>
                  <span className="font-extrabold text-emerald-700 text-lg block">100% Regulated</span>
                  <span className="text-gray-500 font-medium">Govt Compliant</span>
                </div>
                <div>
                  <span className="font-extrabold text-amber-600 text-lg block">Maker-Checker</span>
                  <span className="text-gray-500 font-medium">Dual Authorization</span>
                </div>
              </div>
            </div>

            {/* Right Card / Logo Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 card-shadow text-center space-y-6 relative z-10">
                <div className="w-24 h-24 mx-auto relative rounded-2xl bg-gray-50 p-2 border border-gray-100 shadow-inner flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="RAKVIH Solutions Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                </div>

                <div>
                  <h3 className="font-extrabold text-xl text-[#374421]">RAKVIH SOLUTIONS</h3>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                    Private Limited
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200/70 p-4 rounded-2xl text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Active Chit Group Status</span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">LIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-700 font-medium">
                    <span>RAK-100K-01 (Month 5/20)</span>
                    <span className="font-bold text-[#4d5d30]">₹1,00,000</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#4d5d30] h-full w-1/4"></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase RLS</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Capacitor/Mobile Ready</span>
                  </span>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#4d5d30]/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Chit Financial Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChitCalculator />
      </section>

      {/* Active Chit Schemes Showcase */}
      <section id="schemes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Available Chit Schemes
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Choose from registered chit groups tailored for monthly savings, business capital, or emergency liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                    {grp.groupCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      grp.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {grp.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1">{grp.groupName}</h3>
                <p className="text-2xl font-black text-[#4d5d30] mb-4">
                  ₹{grp.totalValue.toLocaleString('en-IN')}
                </p>

                <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span>Monthly Contribution</span>
                    <span className="font-bold text-gray-900">
                      ₹{grp.monthlyContribution.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration & Members</span>
                    <span className="font-bold text-gray-900">
                      {grp.durationMonths} Months ({grp.totalMembers} Seats)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Seats</span>
                    <span className="font-bold text-emerald-600">
                      {grp.totalMembers - grp.currentMemberCount} / {grp.totalMembers} Left
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Foreman Reg. Fee</span>
                    <span className="font-bold text-gray-900">{grp.foremanCommissionPercent}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleJoinGroup(grp.id)}
                className="w-full bg-[#4d5d30] text-white hover:bg-[#374421] py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Join Scheme Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 18 Modules Grid Showcase */}
      <section className="bg-gray-100 py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
              Full Development Work Order Specification
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              18 Core Platform Modules Included
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
              Everything specified in the 8-page RAKVIH Digital Chit Fund Development Work Order built natively.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-[#4d5d30] transition-colors space-y-2"
              >
                <h4 className="font-bold text-sm text-[#374421]">{m.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Apps Capacitor/Native Ready Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#374421] to-[#4d5d30] text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-amber-400 text-gray-950 px-3 py-1 rounded-lg text-xs font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Android & iOS Ready</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Mobile Application Integration Architecture
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Designed for shared-code Capacitor integration or standalone React Native mobile apps. Native push notifications, biometric login, and mobile camera KYC scanner support included.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/portal"
              className="bg-amber-400 text-gray-950 hover:bg-amber-300 font-bold px-6 py-3.5 rounded-2xl text-xs text-center transition-all shadow-md"
            >
              Test Mobile Web View
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
