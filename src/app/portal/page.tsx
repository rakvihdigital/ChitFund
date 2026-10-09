'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  UserCheck,
  CreditCard,
  TrendingUp,
  Award,
  FileText,
  ShieldAlert,
  HelpCircle,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Upload,
  UserPlus,
  Play,
  FileCheck,
  Check
} from 'lucide-react';

export default function CustomerPortal() {
  const {
    currentUser,
    subscribers,
    groups,
    installments,
    payments,
    auctions,
    kycList,
    payouts,
    documents,
    tickets,
    payInstallment,
    submitKYC,
    placeAuctionBid,
    createSupportTicket
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'chits' | 'kyc' | 'payments' | 'auctions' | 'payouts' | 'documents' | 'support'
  >('overview');

  // Customer specific data
  const mySubs = subscribers.filter((s) => s.userId === currentUser.id);
  const myKYC = kycList.find((k) => k.userId === currentUser.id);
  const myInstallments = installments.filter((i) => i.userId === currentUser.id);
  const dueInstallments = myInstallments.filter((i) => i.status === 'DUE' || i.status === 'OVERDUE');
  const myPayments = payments.filter((p) => p.userId === currentUser.id);
  const myPayouts = payouts.filter((p) => mySubs.some((s) => s.id === p.winnerSubscriberId));
  const myTickets = tickets.filter((t) => t.userId === currentUser.id);

  // Quick Pay State
  const [selectedInstalmentToPay, setSelectedInstalmentToPay] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NET_BANKING' | 'DEBIT_CARD'>('UPI');
  const [payingState, setPayingState] = useState(false);

  // KYC State
  const [panInput, setPanInput] = useState(myKYC?.panNumber || 'ABCPS1234K');
  const [aadhaarInput, setAadhaarInput] = useState(myKYC?.aadhaarNumber || '9876 5432 1098');

  // Auction State
  const [bidDiscountInput, setBidDiscountInput] = useState<number>(18000);

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER'>('PAYMENT');
  const [ticketMessage, setTicketMessage] = useState('');

  const handlePayNow = (installmentId: string) => {
    setPayingState(true);
    setTimeout(() => {
      payInstallment(installmentId, paymentMode);
      setPayingState(false);
      setSelectedInstalmentToPay(null);
    }, 1200);
  };

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKYC(panInput, aadhaarInput);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    createSupportTicket(ticketSubject, ticketCategory, ticketMessage);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Customer Profile Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4d5d30] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">{currentUser.fullName}</h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  myKYC?.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                KYC: {myKYC?.status || 'NOT SUBMITTED'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {currentUser.email} • {currentUser.phone}
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-medium block text-[10px]">Active Groups</span>
            <span className="font-extrabold text-gray-900">{mySubs.length} Schemes</span>
          </div>
          <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-100">
            <span className="text-amber-700 font-medium block text-[10px]">Pending Dues</span>
            <span className="font-extrabold text-amber-900">
              ₹{dueInstallments.reduce((acc, i) => acc + i.netPayable, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 overflow-x-auto bg-gray-200/60 p-1.5 rounded-2xl text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'chits', label: 'My Chits' },
          { id: 'kyc', label: 'KYC & Profile' },
          { id: 'payments', label: 'Monthly Dues' },
          { id: 'auctions', label: 'e-Auction Room' },
          { id: 'payouts', label: 'Prize Payouts' },
          { id: 'documents', label: 'Digital Documents' },
          { id: 'support', label: 'Support Tickets' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#4d5d30] text-white shadow-md font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Payment Due Card */}
            {dueInstallments.length > 0 ? (
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-900/40 text-amber-100 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md">
                      Immediate Action Required
                    </span>
                    <h3 className="text-xl font-black mt-2">Next Instalment Due</h3>
                  </div>
                  <Clock className="w-8 h-8 text-amber-200" />
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/20">
                  <div>
                    <p className="text-xs text-amber-100">{dueInstallments[0].groupCode} • Month {dueInstallments[0].monthNumber}</p>
                    <p className="text-2xl font-black">
                      ₹{dueInstallments[0].netPayable.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-amber-200">
                      Gross: ₹{dueInstallments[0].grossAmount} | Div Discount: ₹{dueInstallments[0].dividendDiscount}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedInstalmentToPay(dueInstallments[0].id)}
                    className="bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Pay via UPI Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-emerald-900 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">All Instalment Dues Paid!</h4>
                  <p className="text-xs text-emerald-700">You have no pending chit contributions for the current cycle.</p>
                </div>
              </div>
            )}

            {/* My Subscribed Groups */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-gray-900">Subscribed Chit Groups</h3>
                <button
                  onClick={() => setActiveTab('chits')}
                  className="text-xs text-[#4d5d30] font-bold hover:underline"
                >
                  View All Seats
                </button>
              </div>

              <div className="space-y-3">
                {mySubs.map((sub) => {
                  const grp = groups.find((g) => g.id === sub.groupId);
                  if (!grp) return null;
                  return (
                    <div
                      key={sub.id}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-gray-900">{grp.groupName}</span>
                          <span className="text-[10px] bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-medium">
                            Seat #{sub.seatNumber}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Group Value: ₹{grp.totalValue.toLocaleString('en-IN')} | Duration: {grp.durationMonths} Months
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-emerald-700 font-bold block">
                          Current Month: {grp.currentMonth} / {grp.durationMonths}
                        </span>
                        <span className="text-[11px] text-gray-400">Total Paid: ₹{sub.totalPaid}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Live Auction Widget */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Upcoming Auction</span>
              </h3>

              {auctions.find((a) => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS') ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-900">RAK-100K-01 (Month 5)</span>
                    <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                      LIVE SOON
                    </span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Scheduled for Oct 15, 2026 at 3:00 PM. Get ready to place your discount bid.
                  </p>
                  <button
                    onClick={() => setActiveTab('auctions')}
                    className="w-full bg-amber-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    Enter Auction Bidding Room
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No active auction at this moment.</p>
              )}
            </div>

            {/* Recent Receipts */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-3">
              <h3 className="font-bold text-sm text-gray-900">Recent Payment Receipts</h3>
              <div className="space-y-2">
                {myPayments.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{p.receiptNumber}</p>
                      <p className="text-[10px] text-gray-500">{p.paidAt}</p>
                    </div>
                    <span className="font-extrabold text-[#4d5d30]">₹{p.amountPaid}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MY CHITS */}
      {activeTab === 'chits' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">My Subscribed Chit Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mySubs.map((sub) => {
              const grp = groups.find((g) => g.id === sub.groupId);
              if (!grp) return null;
              const progressPct = (grp.currentMonth / grp.durationMonths) * 100;
              return (
                <div key={sub.id} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded">
                        {grp.groupCode}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 mt-1">{grp.groupName}</h3>
                    </div>
                    <span className="bg-[#4d5d30] text-white text-xs font-bold px-3 py-1 rounded-xl">
                      Seat #{sub.seatNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <span className="text-gray-500 text-[10px] block">Chit Value</span>
                      <span className="font-bold text-gray-900 text-sm">
                        ₹{grp.totalValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <span className="text-gray-500 text-[10px] block">Auction Winner Status</span>
                      <span
                        className={`font-bold text-xs ${
                          sub.hasWonAuction ? 'text-amber-600' : 'text-emerald-700'
                        }`}
                      >
                        {sub.hasWonAuction ? `Won in Month ${sub.wonMonth}` : 'Eligible for Auction'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>Scheme Progress</span>
                      <span>Month {grp.currentMonth} of {grp.durationMonths}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4d5d30] h-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: KYC & PROFILE */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 max-w-3xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">KYC & Identity Verification</h2>
              <p className="text-xs text-gray-500">Government mandated customer identification details</p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                myKYC?.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {myKYC?.status || 'NOT SUBMITTED'}
            </span>
          </div>

          <form onSubmit={handleKYCSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">PAN Card Number</label>
              <input
                type="text"
                value={panInput}
                onChange={(e) => setPanInput(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#4d5d30] outline-none"
                placeholder="e.g. ABCPS1234K"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Aadhaar Card Number</label>
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#4d5d30] outline-none"
                placeholder="e.g. 9876 5432 1098"
                required
              />
            </div>

            <div className="border border-dashed border-gray-300 p-6 rounded-2xl text-center space-y-2 bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-700">Upload Identity Documents (PAN, Aadhaar, Bank Proof)</p>
              <p className="text-[11px] text-gray-400">PDF, JPG, PNG up to 10MB supported</p>
            </div>

            <button
              type="submit"
              className="bg-[#4d5d30] text-white hover:bg-[#374421] font-bold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Submit KYC Documents for Officer Verification
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 4: MONTHLY PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Monthly Contribution Dues</h2>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
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
                      <td className="p-4 font-extrabold text-gray-900">₹{inst.netPayable}</td>
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
                            className="bg-[#4d5d30] text-white hover:bg-[#374421] px-3 py-1.5 rounded-lg font-bold text-[11px]"
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
        </div>
      )}

      {/* TAB CONTENT 5: LIVE AUCTION ROOM */}
      {activeTab === 'auctions' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Live e-Auction Bidding Room</span>
              </h2>
              <p className="text-xs text-gray-500">Regulated bidding room for RAKVIH Chit Scheme Subscribers</p>
            </div>
            <span className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full animate-pulse">
              AUCTION ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bid Controller */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">Submit Your Discount Bid</h3>
              <p className="text-xs text-gray-600">
                Offer a bid discount from your total chit prize. Higher discount wins the prize pool.
              </p>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Bid Discount Offer: ₹{bidDiscountInput.toLocaleString('en-IN')}
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
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                  <span>₹5,000 (Min 5%)</span>
                  <span>₹18,000</span>
                  <span>₹30,000 (Max 30%)</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Foreman Fee (5%):</span>
                  <span>₹5,000</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Est. Dividend Distributed to All 20 Members:</span>
                  <span>₹{Math.floor((bidDiscountInput - 5000) / 20)} / member</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900 border-t border-gray-100 pt-1">
                  <span>Your Net Prize Money if Won:</span>
                  <span>₹{(100000 - bidDiscountInput).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => placeAuctionBid(auctions[1]?.id || auctions[0].id, bidDiscountInput)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all"
              >
                Place Live Discount Bid Now
              </button>
            </div>

            {/* Live Bids Feed */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900">Recorded Auction Bids</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auctions[0].bids.map((b) => (
                  <div key={b.id} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-900">{b.subscriberName} (Seat #{b.seatNumber})</span>
                      <span className="text-[10px] text-gray-400 block">{b.timestamp}</span>
                    </div>
                    <span className="font-black text-amber-700 text-sm">Discount ₹{b.bidDiscountAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: PRIZE PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Prize Payout & Guarantor Management</h2>
          {myPayouts.length > 0 ? (
            myPayouts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded">
                      {p.groupCode} • Winner Month {p.monthNumber}
                    </span>
                    <h3 className="font-extrabold text-xl text-gray-900 mt-2">
                      Prize Amount: ₹{p.prizeAmount.toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-full">
                    {p.status}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2 border border-gray-100">
                  <h4 className="font-bold text-gray-800">Maker-Checker Authorization Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 block">Finance Maker Approval:</span>
                      <span className="font-bold text-gray-900">{p.makerNotes || 'Pending Maker Review'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Checker Disbursement:</span>
                      <span className="font-bold text-gray-900">{p.disbursedRef || 'Awaiting Final Release'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-8 rounded-3xl text-center text-xs text-gray-500 border border-gray-200">
              No active prize payouts requested yet. Win an e-Auction to unlock payout disbursement.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 7: DIGITAL DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Digital Receipts & Agreements</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl text-xs flex justify-between items-center border border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{doc.title}</h4>
                  <p className="text-gray-500">Ref: {doc.referenceNumber} • Generated on {doc.generatedAt}</p>
                </div>
                <button className="bg-[#4d5d30] text-white hover:bg-[#374421] font-bold px-4 py-2 rounded-xl">
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-base text-gray-900">Raise Customer Support Ticket</h3>
            <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#4d5d30]"
                  placeholder="Summarize your issue..."
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none"
                >
                  <option value="PAYMENT">Payment & Dues</option>
                  <option value="AUCTION">Auction & Dividend</option>
                  <option value="KYC">KYC Verification</option>
                  <option value="PAYOUT">Prize Payout</option>
                  <option value="OTHER">General Query</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#4d5d30]"
                  placeholder="Describe your request in detail..."
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#4d5d30] text-white hover:bg-[#374421] font-bold py-2.5 px-5 rounded-xl"
              >
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Ticket List */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-gray-900">Your Support Tickets</h3>
            {myTickets.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-gray-900">
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
            ))}
          </div>
        </div>
      )}

      {/* QUICK PAY MODAL */}
      {selectedInstalmentToPay && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 animate-scaleIn">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900">Pay Monthly Contribution</h3>
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
                  onClick={() => setPaymentMode(mode as any)}
                  className={`w-full p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    paymentMode === mode
                      ? 'border-[#4d5d30] bg-[#f2f5ed] text-[#374421]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {mode.replace('_', ' ')} (Instant Settlement)
                </button>
              ))}
            </div>

            <button
              disabled={payingState}
              onClick={() => handlePayNow(selectedInstalmentToPay)}
              className="w-full bg-[#4d5d30] text-white hover:bg-[#374421] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
            >
              {payingState ? 'Processing Payment...' : 'Confirm & Generate PDF Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
