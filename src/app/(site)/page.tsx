'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ChitCalculator } from '@/components/ChitCalculator';
import {
  ShieldCheck,
  UserCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  ChevronRight,
  Users
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { groups, customerUser, subscribers, joinChitGroup, openAuthModal } = useApp();
  const [enrolledMsg, setEnrolledMsg] = useState<string | null>(null);

  const handleEnroll = (groupId: string) => {
    if (!customerUser) {
      openAuthModal('signup');
      return;
    }

    const success = joinChitGroup(groupId);
    if (success) {
      setEnrolledMsg('Successfully enrolled in the scheme! View your seat in your Customer Portal.');
      setTimeout(() => setEnrolledMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Toast Notification */}
      {enrolledMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Enrolled Successfully!</p>
            <p className="text-xs text-emerald-100">{enrolledMsg}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f2f5ed] via-white to-gray-50 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-[#e8eedd] border border-[#d2dfbd] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#374421]">
                <ShieldCheck className="w-4 h-4 text-[#4d5d30]" />
                <span>RAKVIH Solutions Private Limited • Chit Funds Act 1982 Registered</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Digital Chit Fund <br />
                <span className="text-[#4d5d30] underline decoration-amber-400 decoration-wavy decoration-2">
                  Management Platform
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Experience secure, disciplined monthly savings and instant liquidity through digitized chitty funds.
                Transparent auctions, verified KYC, UPI instalments, and regulated dividend sharing.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="bg-[#4d5d30] text-white hover:bg-[#374421] px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/10 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Create Customer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#schemes"
                  className="bg-white border-2 border-[#4d5d30] text-[#4d5d30] hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Available Schemes</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80 text-xs">
                <div>
                  <span className="font-extrabold text-gray-900 text-lg block">100% Regulated</span>
                  <span className="text-gray-500 font-medium">Govt Compliant</span>
                </div>
                <div>
                  <span className="font-extrabold text-emerald-700 text-lg block">Instant UPI</span>
                  <span className="text-gray-500 font-medium">Zero Dues Delay</span>
                </div>
                <div>
                  <span className="font-extrabold text-amber-600 text-lg block">Maker-Checker</span>
                  <span className="text-gray-500 font-medium">Dual Authorization</span>
                </div>
              </div>
            </div>

            {/* Right Brand Showcase Card */}
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

                <div className="bg-[#f2f5ed] border border-[#e2e8d5] p-4 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#374421]">
                    <span>Official Chit Fund Portal</span>
                    <span className="bg-[#4d5d30] text-white px-2 py-0.5 rounded-full text-[10px]">VERIFIED</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    Transparent digital management compliant with statutory reserve ratios and state registrar rules.
                  </p>
                </div>

                <div className="flex justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase Secured</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mobile Ready</span>
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
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChitCalculator />
      </section>

      {/* Active Chit Schemes Showcase */}
      <section id="schemes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
            Scheme Catalogue
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Registered Chit Schemes
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Choose from registered schemes suited for personal savings, milestone planning, or emergency liquidity.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-gray-500 space-y-3">
            <Users className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="font-bold text-base text-gray-800">No Chit Schemes Published Yet</h4>
            <p className="text-xs">Chit schemes will appear here once created by RAKVIH administrators.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  {/* Max tickets per person indicator */}
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="text-gray-500 font-medium">Max Limit / Person:</span>
                    <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                      Max {grp.maxTicketsPerPerson || 3} Tickets
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span>Monthly Contribution</span>
                      <span className="font-bold text-gray-900">
                        ₹{grp.monthlyContribution.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration & Total Seats</span>
                      <span className="font-bold text-gray-900">
                        {grp.durationMonths} Months ({grp.totalMembers} Seats)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enrolled Members</span>
                      <span className="font-bold text-emerald-600">
                        {grp.currentMemberCount} / {grp.totalMembers} Enrolled
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Regulated Foreman Fee</span>
                      <span className="font-bold text-gray-900">{grp.foremanCommissionPercent}%</span>
                    </div>

                    {/* If user logged in, show how many tickets held */}
                    {customerUser && (() => {
                      const myTickets = subscribers.filter((s) => s.groupId === grp.id && s.userId === customerUser.id);
                      const maxAllowed = grp.maxTicketsPerPerson || 3;
                      if (myTickets.length > 0) {
                        return (
                          <div className="flex justify-between items-center p-2 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[11px]">
                            <span>Your Tickets in Scheme:</span>
                            <span>{myTickets.length} of {maxAllowed} Held</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {(() => {
                  const myTickets = customerUser ? subscribers.filter((s) => s.groupId === grp.id && s.userId === customerUser.id) : [];
                  const maxAllowed = grp.maxTicketsPerPerson || 3;
                  const isMaxReached = myTickets.length >= maxAllowed;

                  return (
                    <button
                      onClick={() => handleEnroll(grp.id)}
                      disabled={isMaxReached}
                      className={`w-full py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 ${
                        isMaxReached
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-[#4d5d30] text-white hover:bg-[#374421] cursor-pointer shadow-sm'
                      }`}
                    >
                      <span>
                        {!customerUser
                          ? 'Create Account to Enroll'
                          : isMaxReached
                          ? `Max Limit (${maxAllowed}/${maxAllowed} Tickets) Reached ✓`
                          : myTickets.length > 0
                          ? `Take Another Ticket (${myTickets.length + 1} of ${maxAllowed})`
                          : 'Enroll in This Scheme'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About & Regulatory Compliance */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f2f5ed] border border-[#d2dfbd] rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#374421] uppercase tracking-wider">
              Legal Protection & Transparency
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              Why Choose RAKVIH Digital Chit Fund?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Chit funds in India are formally governed by the Chit Funds Act, 1982. RAKVIH Solutions provides
              100% digital compliance: prior sanctioned security deposits, transparent online auctions, and Maker-Checker authorized prize releases to protect every subscriber’s hard-earned savings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="font-bold text-xs text-[#374421] block">Statutory Security</span>
              <p className="text-[11px] text-gray-500">
                100% chit value deposited in approved bank before commencing subscription.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="font-bold text-xs text-[#374421] block">Regulated 5% Fee</span>
              <p className="text-[11px] text-gray-500">
                Foreman commission capped at 5% per regulations, maximizing subscriber dividends.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="font-bold text-xs text-[#374421] block">Maker-Checker Authorization</span>
              <p className="text-[11px] text-gray-500">
                Dual approval mandatory on all prize releases and bank disbursements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
