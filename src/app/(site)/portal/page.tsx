'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ChitGroup, ChitSubscriber } from '@/lib/types';
import {
  UserCheck,
  Award,
  Clock,
  CheckCircle2,
  Upload,
  LogIn,
  Ticket
} from 'lucide-react';

interface EnrolledChitGroupItem {
  group: ChitGroup;
  tickets: ChitSubscriber[];
}

export default function CustomerPortalPage() {
  const {
    customerUser,
    subscribers,
    groups,
    installments,
    payments,
    auctions,
    kycList,
    documents,
    tickets,
    payInstallment,
    submitKYC,
    placeAuctionBid,
    createSupportTicket,
    joinChitGroup
  } = useApp();

  // Real customer data
  const mySubs = customerUser ? subscribers.filter((s) => s.userId === customerUser.id) : [];
  const myKYC = customerUser ? kycList.find((k) => k.userId === customerUser.id) : undefined;
  const myInstallments = customerUser ? installments.filter((i) => i.userId === customerUser.id) : [];
  const dueInstallments = myInstallments.filter((i) => i.status === 'DUE' || i.status === 'OVERDUE');
  const myPayments = customerUser ? payments.filter((p) => p.userId === customerUser.id) : [];
  const myDocs = customerUser ? documents.filter((d) => d.userId === customerUser.id) : [];
  const myTickets = customerUser ? tickets.filter((t) => t.userId === customerUser.id) : [];

  // Group subscriptions by chit group so that multiple tickets of the same chit NEVER create duplicate cards
  const enrolledGroups = React.useMemo<EnrolledChitGroupItem[]>(() => {
    if (!customerUser) return [];
    const map = new Map<string, EnrolledChitGroupItem>();
    subscribers.filter((sub) => sub.userId === customerUser.id).forEach((sub) => {
      const grp = groups.find((g) => g.id === sub.groupId);
      if (!grp) return;
      if (!map.has(grp.id)) {
        map.set(grp.id, { group: grp, tickets: [] });
      }
      map.get(grp.id)!.tickets.push(sub);
    });
    return Array.from(map.values());
  }, [customerUser, subscribers, groups]);

  // All Hooks declared at top level
  const [activeTab, setActiveTab] = useState<
    'overview' | 'chits' | 'kyc' | 'payments' | 'auctions' | 'documents' | 'support'
  >('overview');
  const [selectedInstalmentToPay, setSelectedInstalmentToPay] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NET_BANKING' | 'DEBIT_CARD'>('UPI');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [panInput, setPanInput] = useState<string | null>(null);
  const [aadhaarInput, setAadhaarInput] = useState<string | null>(null);
  const [bidDiscountInput, setBidDiscountInput] = useState<number>(15000);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER'>('PAYMENT');
  const [ticketMessage, setTicketMessage] = useState('');

  // If not logged in as customer, gate the portal
  if (!customerUser) {
    return (
      <div className="workspace-theme portal-gate min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[20px] border border-gray-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Customer Authentication Required</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Please sign in to your customer account to view your enrolled chit schemes, payment dues, and e-auction rooms.
          </p>
          <Link
            href="/login?redirect=/portal"
            className="w-full bg-[#123d33] text-white hover:bg-[#123d33] font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Customer Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  const handlePayNow = (installmentId: string) => {
    setIsProcessingPay(true);
    setTimeout(() => {
      payInstallment(installmentId, paymentMode);
      setIsProcessingPay(false);
      setSelectedInstalmentToPay(null);
    }, 1000);
  };

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKYC(panInput ?? myKYC?.panNumber ?? '', aadhaarInput ?? myKYC?.aadhaarNumber ?? '');
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    createSupportTicket(ticketSubject, ticketCategory, ticketMessage);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="workspace-theme customer-workspace max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Customer Profile Banner */}
      <div className="member-banner bg-white rounded-[20px] p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#123d33] text-white flex items-center justify-center font-semibold text-2xl shadow-md">
            {customerUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">{customerUser.fullName}</h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  myKYC?.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : myKYC?.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                KYC: {myKYC?.status || 'NOT SUBMITTED'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {customerUser.email} • {customerUser.phone}
            </p>
          </div>
        </div>

        {/* Quick Stats and staff access */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-medium block text-[10px]">Enrolled Schemes</span>
            <span className="font-semibold text-gray-900">
              {enrolledGroups.length} {enrolledGroups.length === 1 ? 'Scheme' : 'Schemes'} ({mySubs.length} Tickets)
            </span>
          </div>
          <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-100">
            <span className="text-amber-700 font-medium block text-[10px]">Pending Dues</span>
            <span className="font-semibold text-amber-900">
              ₹{dueInstallments.reduce((acc, i) => acc + i.netPayable, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <Link href="/admin/login" className="member-admin-link inline-flex items-center gap-2 px-3.5 py-2 border border-[#cbb078] rounded-xl">
            Admin portal
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="member-tabs flex space-x-1 overflow-x-auto bg-gray-200/60 p-1.5 rounded-2xl text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'chits', label: `My Chits (${enrolledGroups.length})` },
          { id: 'kyc', label: 'KYC Verification' },
          { id: 'payments', label: `Monthly Dues (${dueInstallments.length})` },
          { id: 'auctions', label: 'e-Auction Room' },
          { id: 'documents', label: 'Receipts & Docs' },
          { id: 'support', label: 'Support Tickets' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            aria-pressed={activeTab === tab.id}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#123d33] text-white shadow-md font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Due Card */}
            {dueInstallments.length > 0 ? (
              <div className="bg-gradient-to-br from-[#123d33] to-[#205447] text-white rounded-[20px] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-900/40 text-amber-100 text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-md">
                      Instalment Due
                    </span>
                    <h3 className="text-xl font-semibold mt-2">{dueInstallments[0].groupCode}</h3>
                  </div>
                  <Clock className="w-8 h-8 text-amber-200" />
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/20">
                  <div>
                    <p className="text-xs text-amber-100">Month #{dueInstallments[0].monthNumber} • Due Date: {dueInstallments[0].dueDate}</p>
                    <p className="text-2xl font-semibold">
                      ₹{dueInstallments[0].netPayable.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInstalmentToPay(dueInstallments[0].id)}
                    className="bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Pay via UPI
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[20px] text-emerald-900 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">No Pending Instalment Dues</h4>
                  <p className="text-xs text-emerald-700">All your monthly chit contributions are up to date.</p>
                </div>
              </div>
            )}

            {/* Enrolled Schemes Summary */}
            <div className="bg-white p-6 rounded-[20px] border border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-gray-900">Enrolled Chit Schemes</h3>
                <Link href="/#schemes" className="text-xs text-[#123d33] font-bold hover:underline">
                  Browse More Schemes →
                </Link>
              </div>

              {enrolledGroups.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-3">
                  <p className="text-xs text-gray-500">You have not enrolled in any chit scheme yet.</p>
                  <Link
                    href="/#schemes"
                    className="inline-block bg-[#123d33] text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Explore & Enroll in a Scheme
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledGroups.map(({ group: grp, tickets }) => {
                    const combinedMonthly = grp.monthlyContribution * tickets.length;
                    return (
                      <div
                        key={grp.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{grp.groupName}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                              {grp.groupCode}
                            </span>
                            <span className="text-[10px] bg-[#123d33] text-white px-2 py-0.5 rounded font-bold">
                              {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'} (Seats: {tickets.map((t) => `#${t.seatNumber}`).join(', ')})
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Chit Value: ₹{grp.totalValue.toLocaleString('en-IN')} | Duration: {grp.durationMonths} Months | {grp.totalMembers} Members
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-bold text-[#123d33] block">
                            ₹{combinedMonthly.toLocaleString('en-IN')}/month
                          </span>
                          <span className="text-gray-400 text-[10px]">
                            {tickets.length > 1 ? `(₹${grp.monthlyContribution.toLocaleString('en-IN')} × ${tickets.length}) • ` : ''}
                            Month {grp.currentMonth} of {grp.durationMonths}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* KYC Status Card */}
            <div className="bg-white p-6 rounded-[20px] border border-gray-200 space-y-3">
              <h3 className="font-bold text-sm text-gray-900">KYC Compliance</h3>
              {myKYC?.status === 'VERIFIED' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">✓ KYC Fully Verified</p>
                  <p className="text-[11px] text-emerald-700">PAN & Aadhaar approved by KYC Officer.</p>
                </div>
              ) : myKYC?.status === 'PENDING_APPROVAL' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                  <p className="font-bold">⏳ Verification in Progress</p>
                  <p className="text-[11px] text-amber-700">Submitted. Under review by compliance officer.</p>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600 space-y-2">
                  <p className="font-bold text-gray-800">Action Required: Submit KYC</p>
                  <p className="text-[11px] text-gray-500">Mandated for auction participation and prize payout.</p>
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className="w-full bg-[#123d33] text-white font-bold py-2 rounded-xl text-xs"
                  >
                    Upload KYC Documents
                  </button>
                </div>
              )}
            </div>

            {/* Recent Receipts */}
            <div className="bg-white p-6 rounded-[20px] border border-gray-200 space-y-3">
              <h3 className="font-bold text-sm text-gray-900">Recent Payment Receipts</h3>
              {myPayments.length === 0 ? (
                <p className="text-xs text-gray-400">No payment receipts generated yet.</p>
              ) : (
                <div className="space-y-2">
                  {myPayments.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{p.receiptNumber}</p>
                        <p className="text-[10px] text-gray-400">{p.paidAt}</p>
                      </div>
                      <span className="font-semibold text-[#123d33]">₹{p.amountPaid}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY CHITS */}
      {activeTab === 'chits' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Subscribed Chit Schemes</h2>
              <p className="text-xs text-gray-500">
                Holding {mySubs.length} total tickets across {enrolledGroups.length} distinct chit {enrolledGroups.length === 1 ? 'scheme' : 'schemes'}
              </p>
            </div>
            <Link
              href="/#schemes"
              className="bg-[#123d33] text-white font-bold text-xs px-4 py-2 rounded-xl text-center self-start sm:self-auto shadow-sm"
            >
              + Enroll in New Scheme
            </Link>
          </div>

          {enrolledGroups.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500 space-y-3">
              <p className="text-sm">You have not joined any chit schemes yet.</p>
              <Link
                href="/#schemes"
                className="inline-block bg-[#123d33] text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Browse Available Schemes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrolledGroups.map(({ group: grp, tickets }) => {
                const progressPct = (grp.currentMonth / grp.durationMonths) * 100;
                const combinedMonthly = grp.monthlyContribution * tickets.length;
                const maxAllowed = grp.maxTicketsPerPerson || 3;
                const canTakeMore = tickets.length < maxAllowed;

                return (
                  <div key={grp.id} className="bg-white rounded-[20px] border border-gray-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow">
                    {/* Card Header: Group Info + Ticket Count Badge */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded">
                            {grp.groupCode}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Chit Funds Act, 1982
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mt-1">{grp.groupName}</h3>
                      </div>
                      {/* Ticket Count Badge */}
                      <span className="inline-flex items-center space-x-1.5 bg-[#123d33] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm whitespace-nowrap">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>{tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'} Active</span>
                      </span>
                    </div>

                    {/* Scheme Financial Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        <span className="text-gray-400 text-[10px] font-medium block">Total Scheme Value</span>
                        <span className="font-bold text-gray-900 text-sm">
                          ₹{grp.totalValue.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {grp.totalMembers} Members Circle
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        <span className="text-gray-400 text-[10px] font-medium block">Combined Monthly Dues</span>
                        <span className="font-bold text-[#123d33] text-sm">
                          ₹{combinedMonthly.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {tickets.length > 1
                            ? `₹${grp.monthlyContribution.toLocaleString('en-IN')} × ${tickets.length} tickets`
                            : `₹${grp.monthlyContribution.toLocaleString('en-IN')} per month`}
                        </span>
                      </div>
                    </div>

                    {/* Consolidated Seats / Tickets List in this scheme */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800">
                          Tickets & Seats Held ({tickets.length})
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Limit: {tickets.length} of {maxAllowed} Max
                        </span>
                      </div>
                      <div className="space-y-2">
                        {tickets.map((t, idx) => (
                          <div
                            key={t.id}
                            className="bg-white p-2.5 rounded-xl border border-gray-200 flex justify-between items-center text-xs shadow-xs"
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="bg-[#123d33] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                TICKET #{idx + 1}
                              </span>
                              <span className="font-bold text-gray-900 text-xs">Seat #{t.seatNumber}</span>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${
                                t.hasWonAuction
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {t.hasWonAuction ? `🏆 Won Month ${t.wonMonth}` : '✓ Eligible to Bid'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Duration Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Duration Progress</span>
                        <span>Month {grp.currentMonth} of {grp.durationMonths}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#123d33] h-full transition-all" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>

                    {/* Multi-Ticket Quota Footer & Action */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-gray-500 text-[11px]">
                        Holding <strong>{tickets.length}</strong> of <strong>{maxAllowed}</strong> allowed tickets in this scheme
                      </span>
                      {canTakeMore ? (
                        <button
                          onClick={() => {
                            const success = joinChitGroup(grp.id);
                            if (success) {
                              alert(`Successfully enrolled for Ticket #${tickets.length + 1} in ${grp.groupName}!`);
                            }
                          }}
                          className="bg-[#123d33] hover:bg-[#123d33] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>+ Take Ticket #{tickets.length + 1}</span>
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-lg text-[11px] text-center">
                          ✓ Quota Limit Reached ({maxAllowed} Max)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KYC */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-gray-200 max-w-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">KYC Verification Submission</h2>
              <p className="text-xs text-gray-500">Government mandated customer identification details</p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                myKYC?.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : myKYC?.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Status: {myKYC?.status || 'NOT SUBMITTED'}
            </span>
          </div>

          <form onSubmit={handleKYCSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">PAN Card Number</label>
              <input
                type="text"
                value={panInput ?? myKYC?.panNumber ?? ''}
                onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#123d33] uppercase"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Aadhaar Card Number</label>
              <input
                type="text"
                value={aadhaarInput ?? myKYC?.aadhaarNumber ?? ''}
                onChange={(e) => setAadhaarInput(e.target.value)}
                placeholder="e.g. 1234 5678 9012"
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#123d33]"
                required
              />
            </div>

            <div className="border border-dashed border-gray-300 p-6 rounded-2xl text-center space-y-2 bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-700">Upload Identity Documents (PAN, Aadhaar, Bank Proof)</p>
              <p className="text-[11px] text-gray-400">PDF, JPG, PNG up to 10MB</p>
            </div>

            <button
              type="submit"
              className="bg-[#123d33] text-white hover:bg-[#123d33] font-bold py-3 px-6 rounded-xl transition-all"
            >
              Submit KYC for Officer Approval
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Monthly Contribution Dues</h2>
          </div>

          {/* Dividend Discount Explainer Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-900">
            <div className="p-1.5 bg-emerald-200/60 rounded-lg text-emerald-800 font-semibold">₹</div>
            <div>
              <p className="font-bold">How Your Dividend Discount Reduces Dues</p>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                Whenever a monthly e-auction is completed, the winning discount minus the 5% statutory foreman commission is distributed equally to all members. This <strong>Dividend Discount</strong> is subtracted from your gross dues, lowering your actual payable amount!
              </p>
            </div>
          </div>

          {myInstallments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500">
              <p className="text-sm">No monthly instalment obligations found. Enroll in a chit group to generate dues.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="p-4">Group Code</th>
                      <th className="p-4">Month #</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Gross Dues</th>
                      <th className="p-4">Dividend Discount</th>
                      <th className="p-4">Net Payable</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myInstallments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{inst.groupCode}</td>
                        <td className="p-4">Month {inst.monthNumber}</td>
                        <td className="p-4">{inst.dueDate}</td>
                        <td className="p-4">₹{inst.grossAmount}</td>
                        <td className="p-4 text-emerald-600 font-semibold">- ₹{inst.dividendDiscount}</td>
                        <td className="p-4 font-semibold text-gray-900">₹{inst.netPayable}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              inst.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {inst.status !== 'PAID' ? (
                            <button
                              onClick={() => setSelectedInstalmentToPay(inst.id)}
                              className="bg-[#123d33] text-white hover:bg-[#123d33] px-3.5 py-1.5 rounded-lg font-bold text-[11px]"
                            >
                              Pay Dues
                            </button>
                          ) : (
                            <span className="text-gray-400">Paid on {inst.paidDate}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUCTIONS */}
      {activeTab === 'auctions' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-gray-200 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>e-Auction Bidding Room</span>
              </h2>
              <p className="text-xs text-gray-500">Live auction room for registered scheme subscribers</p>
            </div>
          </div>

          {auctions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-2">
              <p className="text-xs">No active auctions scheduled currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bid Form */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Submit Your Discount Bid</h3>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Bid Discount: ₹{bidDiscountInput.toLocaleString('en-IN')}
                  </label>
                  <input
                    type="range"
                    min={5000}
                    max={30000}
                    step={500}
                    value={bidDiscountInput}
                    onChange={(e) => setBidDiscountInput(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
                    <span>₹5,000 (Min 5%)</span>
                    <span>₹30,000 (Max 30%)</span>
                  </div>
                </div>

                {/* Live Prize & Dividend Calculation Preview */}
                {(() => {
                  const targetGroup = groups.find((g) => g.id === auctions[0].groupId) || groups[0];
                  const chitVal = targetGroup ? targetGroup.totalValue : 100000;
                  const fee = (chitVal * 5) / 100;
                  const myPrizeMoney = chitVal - bidDiscountInput;
                  const divPool = Math.max(0, bidDiscountInput - fee);
                  const divPerMember = Math.floor(divPool / (targetGroup ? targetGroup.totalMembers : 20));

                  return (
                    <div className="p-3.5 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-gray-700 uppercase">
                          🏆 Your Take-Home Prize (&quot;Get My Amount&quot;)
                        </span>
                        <span className="text-lg font-semibold text-emerald-700">
                          ₹{myPrizeMoney.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Chit Value (₹{chitVal.toLocaleString('en-IN')}) minus your bid discount (₹{bidDiscountInput.toLocaleString('en-IN')})
                      </p>

                      <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-800">
                          <span className="block text-emerald-600 font-semibold">Dividend / Member:</span>
                          <span className="font-bold text-xs">₹{divPerMember.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg text-amber-800">
                          <span className="block text-amber-600 font-semibold">Foreman Fee (5%):</span>
                          <span className="font-bold text-xs">₹{fee.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => placeAuctionBid(auctions[0].id, bidDiscountInput)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Place Live Discount Bid (Get ₹{(groups.find((g) => g.id === auctions[0].groupId)?.totalValue || 100000) - bidDiscountInput})
                </button>
              </div>

              {/* Recorded Bids */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-900">Auction Bids</h3>
                {auctions[0].bids.length === 0 ? (
                  <p className="text-xs text-gray-400">No bids submitted yet for this auction.</p>
                ) : (
                  auctions[0].bids.map((b) => (
                    <div key={b.id} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900">{b.subscriberName} (Seat #{b.seatNumber})</span>
                        <span className="text-[10px] text-gray-400 block">{b.timestamp}</span>
                      </div>
                      <span className="font-bold text-amber-700">₹{b.bidDiscountAmount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: RECEIPTS & DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-[20px] p-6 border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Digital Receipts & Documents</h2>
          {myDocs.length === 0 ? (
            <p className="text-xs text-gray-500">No receipts generated yet. Pay monthly dues to view receipts.</p>
          ) : (
            <div className="space-y-3">
              {myDocs.map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl text-xs flex justify-between items-center border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{doc.title}</h4>
                    <p className="text-gray-500">Ref: {doc.referenceNumber} • Date: {doc.generatedAt}</p>
                  </div>
                  <button className="bg-[#123d33] text-white hover:bg-[#123d33] font-bold px-4 py-2 rounded-xl">
                    View PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[20px] p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-base text-gray-900">Raise Customer Support Ticket</h3>
            <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Summarize your issue..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as typeof ticketCategory)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none"
                >
                  <option value="PAYMENT">Payment & Dues</option>
                  <option value="AUCTION">Auction & Dividend</option>
                  <option value="KYC">KYC Verification</option>
                  <option value="OTHER">General Query</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your inquiry..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#123d33] text-white hover:bg-[#123d33] font-bold py-2.5 px-5 rounded-xl"
              >
                Submit Ticket
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-base text-gray-900">Your Support Tickets</h3>
            {myTickets.length === 0 ? (
              <p className="text-xs text-gray-400">No support tickets raised.</p>
            ) : (
              myTickets.map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>{t.ticketCode} - {t.subject}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">
                      {t.status}
                    </span>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-gray-100">
                    {t.messages.map((m, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded-xl">
                        <span className="font-bold text-gray-800 block">{m.senderName}:</span>
                        <p className="text-gray-600">{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK PAY MODAL */}
      {selectedInstalmentToPay && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-xl text-gray-900">Pay Monthly Contribution</h3>
                <p className="text-xs text-gray-500">RAKVIH Approved Payment Gateway</p>
              </div>
              <button
                onClick={() => setSelectedInstalmentToPay(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">Select Payment Mode</label>
              {['UPI', 'NET_BANKING', 'DEBIT_CARD'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode as typeof paymentMode)}
                  className={`w-full p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    paymentMode === mode
                      ? 'border-[#123d33] bg-[#f2f1e9] text-[#123d33]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {mode.replace('_', ' ')} (Instant Confirmation)
                </button>
              ))}
            </div>

            <button
              disabled={isProcessingPay}
              onClick={() => handlePayNow(selectedInstalmentToPay)}
              className="w-full bg-[#123d33] text-white hover:bg-[#123d33] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
            >
              {isProcessingPay ? 'Processing Payment...' : 'Confirm & Generate PDF Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
