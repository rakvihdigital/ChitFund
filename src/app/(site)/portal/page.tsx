'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ChitGroup, ChitSubscriber } from '@/lib/types';
import {
  UserCheck,
  Award,
  Clock,
  CheckCircle2,
  LogIn,
  Ticket,
  ShieldCheck,
  ShieldAlert,
  FileText,
  UploadCloud,
  AlertCircle,
  CreditCard,
  Building2,
  User,
  Eye,
  Trash2,
  Download,
  HelpCircle,
  Phone,
  Mail,
  ArrowRight,
  X,
  Layers,
  LayoutDashboard,
  Calendar,
  LogOut,
  Sparkles
} from 'lucide-react';

interface EnrolledChitGroupItem {
  group: ChitGroup;
  tickets: ChitSubscriber[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    bankAccounts,
    nominees,
    documents,
    tickets,
    submitKYC,
    placeAuctionBid,
    createSupportTicket,
    joinChitGroup,
    openKYCDocument,
    customerLogout
  } = useApp();

  // Real customer data
  const mySubs = customerUser ? subscribers.filter((s) => s.userId === customerUser.id) : [];
  const myKYC = customerUser ? kycList.find((k) => k.userId === customerUser.id) : undefined;
  const myInstallments = customerUser ? installments.filter((i) => i.userId === customerUser.id) : [];
  const dueInstallments = myInstallments.filter((i) => i.status === 'DUE' || i.status === 'OVERDUE');
  const myPayments = customerUser ? payments.filter((p) => p.userId === customerUser.id) : [];
  const myDocs = customerUser ? documents.filter((d) => d.userId === customerUser.id) : [];
  const myTickets = customerUser ? tickets.filter((t) => t.userId === customerUser.id) : [];
  const myBankAccounts = customerUser ? bankAccounts.filter((b) => b.userId === customerUser.id) : [];
  const myNominees = customerUser ? nominees.filter((n) => n.userId === customerUser.id) : [];

  // Group subscriptions by chit group
  const enrolledGroups = useMemo<EnrolledChitGroupItem[]>(() => {
    if (!customerUser) return [];
    const map = new Map<string, EnrolledChitGroupItem>();
    subscribers
      .filter((sub) => sub.userId === customerUser.id)
      .forEach((sub) => {
        const grp = groups.find((g) => g.id === sub.groupId);
        if (!grp) return;
        if (!map.has(grp.id)) {
          map.set(grp.id, { group: grp, tickets: [] });
        }
        map.get(grp.id)!.tickets.push(sub);
      });
    return Array.from(map.values());
  }, [customerUser, subscribers, groups]);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'chits' | 'kyc' | 'payments' | 'auctions' | 'bank' | 'documents' | 'support'
  >('overview');

  const [selectedInstalmentToPay, setSelectedInstalmentToPay] = useState<string | null>(null);

  // KYC Form State
  const [panInput, setPanInput] = useState<string>('');
  const [aadhaarInput, setAadhaarInput] = useState<string>('');
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [isPanDragging, setIsPanDragging] = useState(false);
  const [isAadhaarDragging, setIsAadhaarDragging] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [kycFeedback, setKycFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const panFileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarFileInputRef = useRef<HTMLInputElement>(null);

  // Auction State
  const [bidDiscountInput, setBidDiscountInput] = useState<number>(15000);

  // Support Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER'>('PAYMENT');
  const [ticketMessage, setTicketMessage] = useState('');

  // Gate if not logged in
  if (!customerUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-md w-full bg-white rounded-[24px] border border-gray-200/80 p-8 sm:p-10 text-center space-y-6 shadow-xl shadow-gray-200/50">
          <div className="w-16 h-16 mx-auto bg-emerald-50 text-[#123d33] rounded-2xl flex items-center justify-center shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Member Portal Access</h2>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              Please sign in to your verified customer account to access your enrolled chit schemes, monthly contribution schedules, and e-auction rooms.
            </p>
          </div>
          <Link
            href="/login?redirect=/portal"
            className="w-full bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center space-x-2 group"
          >
            <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>Sign In to Member Portal</span>
          </Link>
          <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
            Regulated under the Government Chit Funds Act, 1982
          </div>
        </div>
      </div>
    );
  }

  // Handle KYC Submit
  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycFeedback(null);

    const pan = (panInput || myKYC?.panNumber || '').trim().toUpperCase();
    const aadhaarDigits = (aadhaarInput || '').replace(/\D/g, '');

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      setKycFeedback({
        type: 'error',
        message: 'Please enter a valid 10-character alphanumeric PAN number (e.g. ABCDE1234F).'
      });
      return;
    }

    if (aadhaarDigits.length !== 12) {
      setKycFeedback({
        type: 'error',
        message: 'Please enter a valid 12-digit Aadhaar card number.'
      });
      return;
    }

    if (!panFile || !aadhaarFile) {
      setKycFeedback({
        type: 'error',
        message: 'Please select both your PAN card and Aadhaar card document files.'
      });
      return;
    }

    setIsSubmittingKYC(true);
    try {
      const success = await submitKYC(pan, aadhaarDigits, [panFile, aadhaarFile]);
      if (success) {
        setKycFeedback({
          type: 'success',
          message: 'Documents uploaded successfully! Your KYC verification is now under officer review.'
        });
        setPanFile(null);
        setAadhaarFile(null);
      } else {
        setKycFeedback({
          type: 'error',
          message: 'Submission could not be completed. Please ensure files are valid PDF, JPG, or PNG under 10MB.'
        });
      }
    } catch (err: unknown) {
      setKycFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'KYC upload failed. Please try again.'
      });
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    const ok = await createSupportTicket(ticketSubject.trim(), ticketCategory, ticketMessage.trim());
    if (ok) {
      setTicketSubject('');
      setTicketMessage('');
    }
  };

  const totalCommittedMonthly = enrolledGroups.reduce(
    (acc, item) => acc + item.group.monthlyContribution * item.tickets.length,
    0
  );
  const totalChitValue = enrolledGroups.reduce(
    (acc, item) => acc + item.group.totalValue * item.tickets.length,
    0
  );
  const totalDueAmount = dueInstallments.reduce((acc, i) => acc + i.netPayable, 0);

  return (
    <div className="min-h-screen bg-[#f8faf9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. MEMBER PROFILE & STATS HERO BANNER */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-200/90 shadow-sm relative overflow-hidden">
          {/* Subtle decorative gradient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-50/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* User Identity Info */}
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[20px] bg-gradient-to-br from-[#123d33] to-[#205447] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-950/15 border-2 border-emerald-800/20">
                {customerUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {customerUser.fullName}
                  </h1>
                  <span
                    className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      myKYC?.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : myKYC?.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {myKYC?.status === 'VERIFIED' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : myKYC?.status === 'PENDING_APPROVAL' ? (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>
                      {myKYC?.status === 'VERIFIED'
                        ? 'KYC Verified'
                        : myKYC?.status === 'PENDING_APPROVAL'
                        ? 'KYC Pending'
                        : 'KYC Action Required'}
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{customerUser.email}</span>
                  </span>
                  {customerUser.phone && (
                    <span className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{customerUser.phone}</span>
                    </span>
                  )}
                  <span className="text-gray-400">• Member #{customerUser.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            {/* Quick Financial Snapshot Badges & Signout */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="bg-gray-50/90 px-4 py-2.5 rounded-2xl border border-gray-200/80 flex-1 sm:flex-initial">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Enrolled Schemes
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {enrolledGroups.length} Schemes ({mySubs.length} Tickets)
                </span>
              </div>

              <div
                className={`px-4 py-2.5 rounded-2xl border flex-1 sm:flex-initial ${
                  totalDueAmount > 0
                    ? 'bg-amber-50/80 border-amber-200/80'
                    : 'bg-emerald-50/80 border-emerald-200/80'
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider block ${
                    totalDueAmount > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  Pending Dues
                </span>
                <span
                  className={`text-sm font-bold ${
                    totalDueAmount > 0 ? 'text-amber-900' : 'text-emerald-900'
                  }`}
                >
                  ₹{totalDueAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={customerLogout}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-rose-700 px-3.5 py-2.5 rounded-2xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-pointer"
                title="Sign out of customer account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. TABBED NAVIGATION BAR */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-xs">
          {[
            { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
            { id: 'chits', label: `My Schemes (${enrolledGroups.length})`, icon: Layers },
            {
              id: 'kyc',
              label: 'KYC & Verification',
              icon: ShieldCheck,
              alertBadge: myKYC?.status !== 'VERIFIED'
            },
            {
              id: 'payments',
              label: `Contribution Dues (${dueInstallments.length})`,
              icon: CreditCard,
              badge: dueInstallments.length > 0 ? dueInstallments.length : undefined
            },
            { id: 'auctions', label: 'e-Auctions & Draws', icon: Award },
            { id: 'bank', label: 'Bank & Nominee', icon: Building2 },
            { id: 'documents', label: 'Receipts & Docs', icon: FileText },
            { id: 'support', label: 'Support Helpdesk', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                aria-pressed={isActive}
                className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#123d33] text-white shadow-md shadow-emerald-950/15 font-bold'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.alertBadge && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                {tab.badge && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                      */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Total Chit Portfolio
                </span>
                <span className="text-2xl font-bold text-gray-900 block">
                  ₹{totalChitValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  Across {enrolledGroups.length} registered scheme{enrolledGroups.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Active Tickets / Seats
                </span>
                <span className="text-2xl font-bold text-gray-900 block">
                  {mySubs.length} Seats
                </span>
                <span className="text-[11px] text-gray-500 font-medium block">
                  Max 3 tickets allowed per scheme
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Monthly Commitment
                </span>
                <span className="text-2xl font-bold text-[#123d33] block">
                  ₹{totalCommittedMonthly.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-500 font-medium block">
                  Reduced by monthly dividend payouts
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Total Payments Made
                </span>
                <span className="text-2xl font-bold text-emerald-700 block">
                  ₹{myPayments.reduce((sum, p) => sum + p.amountPaid, 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-500 font-medium block">
                  {myPayments.length} recorded receipt{myPayments.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Split: Next Due Banner + Enrolled Schemes List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Due Warning Banner */}
                {dueInstallments.length > 0 ? (
                  <div className="bg-gradient-to-br from-[#123d33] to-[#1a4f43] text-white rounded-[22px] p-6 sm:p-7 shadow-lg shadow-emerald-950/10 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-amber-400/20 text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-300/30">
                          Upcoming Contribution Due
                        </span>
                        <h3 className="text-2xl font-bold mt-2.5 tracking-tight">
                          {dueInstallments[0].groupCode}
                        </h3>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15">
                        <Clock className="w-6 h-6 text-amber-300" />
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-white/15">
                      <div>
                        <p className="text-xs text-emerald-100 font-medium">
                          Month #{dueInstallments[0].monthNumber} • Due Date:{' '}
                          <span className="font-bold text-white">{dueInstallments[0].dueDate}</span>
                        </p>
                        <p className="text-3xl font-extrabold tracking-tight mt-1">
                          ₹{dueInstallments[0].netPayable.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedInstalmentToPay(dueInstallments[0].id)}
                        className="bg-white hover:bg-gray-50 text-[#123d33] font-bold text-xs py-3 px-5 rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
                      >
                        Payment Setup Notice
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200/90 p-6 rounded-[22px] text-emerald-900 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">All Monthly Contributions Are Up To Date</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        No outstanding dues. You are fully eligible for this month’s e-auctions.
                      </p>
                    </div>
                  </div>
                )}

                {/* Enrolled Schemes List */}
                <div className="bg-white p-6 rounded-[22px] border border-gray-200/90 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-base text-gray-900">Your Enrolled Schemes</h3>
                    <Link
                      href="/schemes"
                      className="text-xs text-[#123d33] font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>Explore Schemes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {enrolledGroups.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-gray-500">
                        You have not enrolled in any chit scheme yet.
                      </p>
                      <Link
                        href="/schemes"
                        className="inline-block bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
                      >
                        Browse Registered Schemes
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrolledGroups.map(({ group: grp, tickets }) => {
                        const combinedMonthly = grp.monthlyContribution * tickets.length;
                        return (
                          <div
                            key={grp.id}
                            className="p-4 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-200/70 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-gray-900">
                                  {grp.groupName}
                                </span>
                                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                                  {grp.groupCode}
                                </span>
                                <span className="text-[10px] bg-[#123d33] text-white font-bold px-2 py-0.5 rounded-md">
                                  {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Total ₹{grp.totalValue.toLocaleString('en-IN')} • Duration:{' '}
                                {grp.durationMonths} Months • Seats: {tickets.map((t) => `#${t.seatNumber}`).join(', ')}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="font-extrabold text-[#123d33] text-sm block">
                                ₹{combinedMonthly.toLocaleString('en-IN')}/mo
                              </span>
                              <span className="text-[10px] text-gray-400">
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

              {/* Right Column: KYC Status & Quick Documents */}
              <div className="space-y-6">
                {/* KYC Compliance Status Card */}
                <div className="bg-white p-6 rounded-[22px] border border-gray-200/90 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#123d33]" />
                    <h3 className="font-bold text-sm text-gray-900">Government KYC Compliance</h3>
                  </div>

                  {myKYC?.status === 'VERIFIED' ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Identity Verification Active</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Your PAN and Aadhaar identity documents have been approved by the compliance officer. You have full access to bid in e-auctions and request prize payouts.
                      </p>
                      {myKYC.verifiedAt && (
                        <p className="text-[10px] text-emerald-600 font-medium pt-1 border-t border-emerald-200/60">
                          Verified on {myKYC.verifiedAt.slice(0, 10)}
                        </p>
                      )}
                    </div>
                  ) : myKYC?.status === 'PENDING_APPROVAL' ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Verification in Review</span>
                      </div>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        Your identity documents were submitted and are currently undergoing officer verification. You will be notified once approved.
                      </p>
                      <button
                        onClick={() => setActiveTab('kyc')}
                        className="text-xs text-amber-900 font-bold underline cursor-pointer"
                      >
                        View uploaded files →
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                      <div className="flex items-center space-x-2 text-gray-800 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Action Required: Submit KYC</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Mandated under the Chit Funds Act, 1982 before taking part in e-auctions or prize payouts.
                      </p>
                      <button
                        onClick={() => setActiveTab('kyc')}
                        className="w-full bg-[#123d33] hover:bg-[#0c2922] text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      >
                        Upload KYC Documents Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Receipts Mini Widget */}
                <div className="bg-white p-6 rounded-[22px] border border-gray-200/90 shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                    <h3 className="font-bold text-sm text-gray-900">Recent Receipts</h3>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="text-[11px] text-[#123d33] font-bold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  {myPayments.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">
                      No contribution payments recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {myPayments.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center border border-gray-100"
                        >
                          <div>
                            <p className="font-bold text-gray-900">{p.receiptNumber}</p>
                            <p className="text-[10px] text-gray-400">{p.paidAt}</p>
                          </div>
                          <span className="font-bold text-emerald-800">
                            ₹{p.amountPaid.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MY CHIT SCHEMES                                         */}
        {/* ============================================================== */}
        {activeTab === 'chits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  My Enrolled Schemes
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Holding {mySubs.length} total tickets across {enrolledGroups.length} chit schemes
                </p>
              </div>
              <Link
                href="/schemes"
                className="bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto flex items-center space-x-1.5"
              >
                <span>+ Join Another Scheme</span>
              </Link>
            </div>

            {enrolledGroups.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[24px] border border-gray-200/90 text-gray-500 space-y-4 shadow-sm">
                <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-gray-900">No Enrolled Schemes Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    You have not enrolled in any chit scheme tickets yet. Explore active schemes to start saving with regular monthly dividends.
                  </p>
                </div>
                <Link
                  href="/schemes"
                  className="inline-block bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
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
                    <div
                      key={grp.id}
                      className="bg-white rounded-[24px] border border-gray-200/90 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-md">
                              {grp.groupCode}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              Chit Funds Act, 1982
                            </span>
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 tracking-tight">
                            {grp.groupName}
                          </h3>
                        </div>
                        <span className="inline-flex items-center space-x-1.5 bg-[#123d33] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs">
                          <Ticket className="w-3.5 h-3.5 text-amber-300" />
                          <span>{tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}</span>
                        </span>
                      </div>

                      {/* Financial Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-1">
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
                            Total Scheme Value
                          </span>
                          <span className="font-bold text-gray-900 text-base">
                            ₹{grp.totalValue.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {grp.totalMembers} Members Circle
                          </span>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80 space-y-1">
                          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider block">
                            Combined Monthly Dues
                          </span>
                          <span className="font-bold text-[#123d33] text-base">
                            ₹{combinedMonthly.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-800 block">
                            {tickets.length > 1
                              ? `₹${grp.monthlyContribution.toLocaleString('en-IN')} × ${tickets.length} tickets`
                              : `₹${grp.monthlyContribution.toLocaleString('en-IN')} per month`}
                          </span>
                        </div>
                      </div>

                      {/* Held Tickets Listing */}
                      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-800">
                            Tickets Held ({tickets.length})
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            Quota: {tickets.length} of {maxAllowed} Max
                          </span>
                        </div>
                        <div className="space-y-2">
                          {tickets.map((t, idx) => (
                            <div
                              key={t.id}
                              className="bg-white p-3 rounded-xl border border-gray-200/80 flex justify-between items-center text-xs shadow-2xs"
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className="bg-[#123d33] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  TICKET #{idx + 1}
                                </span>
                                <span className="font-bold text-gray-900 text-xs">
                                  Seat #{t.seatNumber}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                                  t.hasWonAuction
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {t.hasWonAuction ? `🏆 Won Month ${t.wonMonth}` : '✓ Eligible to Bid'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>Scheme Progress</span>
                          <span>
                            Month {grp.currentMonth} of {grp.durationMonths}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#123d33] h-full transition-all rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer: Take More Tickets */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-gray-500 text-[11px]">
                          Hold up to <strong>{maxAllowed}</strong> tickets in this circle
                        </span>
                        {canTakeMore ? (
                          <button
                            onClick={async () => {
                              const success = await joinChitGroup(grp.id);
                              if (success) {
                                alert(`Enrolled for Ticket #${tickets.length + 1} in ${grp.groupName}!`);
                              }
                            }}
                            className="bg-[#123d33] hover:bg-[#0c2922] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>+ Take Ticket #{tickets.length + 1}</span>
                          </button>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-lg text-[11px] text-center">
                            ✓ Maximum Ticket Quota Reached ({maxAllowed})
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

        {/* ============================================================== */}
        {/* TAB 3: KYC & DOCUMENT VERIFICATION (REDESIGNED!)                */}
        {/* ============================================================== */}
        {activeTab === 'kyc' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header Compliance Alert Banner */}
            <div
              className={`rounded-[24px] p-6 sm:p-7 border transition-all ${
                myKYC?.status === 'VERIFIED'
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
                  : myKYC?.status === 'PENDING_APPROVAL'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950'
                  : 'bg-white border-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      myKYC?.status === 'VERIFIED'
                        ? 'bg-emerald-600 text-white'
                        : myKYC?.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-[#123d33]'
                    }`}
                  >
                    {myKYC?.status === 'VERIFIED' ? (
                      <ShieldCheck className="w-8 h-8" />
                    ) : myKYC?.status === 'PENDING_APPROVAL' ? (
                      <Clock className="w-8 h-8" />
                    ) : (
                      <ShieldAlert className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      {myKYC?.status === 'VERIFIED'
                        ? 'KYC Verification Approved'
                        : myKYC?.status === 'PENDING_APPROVAL'
                        ? 'KYC Verification Under Review'
                        : 'Government KYC Verification Required'}
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {myKYC?.status === 'VERIFIED'
                        ? 'Your identity documents are compliant with the Government Chit Funds Act, 1982.'
                        : myKYC?.status === 'PENDING_APPROVAL'
                        ? 'Submitted documents are being reviewed by the compliance officer.'
                        : 'Upload your government-issued PAN and Aadhaar documents to unlock full auction bidding.'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border self-start sm:self-auto ${
                    myKYC?.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : myKYC?.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  Status: {myKYC?.status || 'NOT SUBMITTED'}
                </span>
              </div>
            </div>

            {/* Submission / Edit Form */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {myKYC?.status === 'VERIFIED'
                    ? 'Identity Details on Record'
                    : 'Submit Identity Details & Documents'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Securely stored in encrypted storage and verified strictly for statutory compliance.
                </p>
              </div>

              {kycFeedback && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center space-x-3 border ${
                    kycFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {kycFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{kycFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleKYCSubmit} className="space-y-6 text-xs">
                {/* 1. Identification Numbers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 block text-xs">
                      PAN Card Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={panInput || myKYC?.panNumber || ''}
                        onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                        placeholder="e.g. ABCDE1234F"
                        maxLength={10}
                        className="w-full pl-10 pr-3.5 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#123d33] uppercase font-mono tracking-wider font-semibold text-xs"
                        required
                        disabled={myKYC?.status === 'VERIFIED'}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Standard 10-character alphanumeric Indian PAN
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 block text-xs">
                      Aadhaar Card Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={aadhaarInput || (myKYC?.aadhaarNumber ? myKYC.aadhaarNumber : '')}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                          setAadhaarInput(raw);
                        }}
                        placeholder="12-digit Aadhaar Number"
                        maxLength={12}
                        className="w-full pl-10 pr-3.5 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#123d33] font-mono tracking-wider font-semibold text-xs"
                        required
                        disabled={myKYC?.status === 'VERIFIED'}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Only the last 4 digits are permanently stored for your privacy
                    </span>
                  </div>
                </div>

                {/* 2. MODERN DRAG-AND-DROP FILE UPLOADER CARDS */}
                {myKYC?.status !== 'VERIFIED' && (
                  <div className="space-y-3 pt-2">
                    <label className="font-bold text-gray-800 block text-xs">
                      Upload Document Proofs (PDF, JPG, PNG up to 10MB each)
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* PAN Card Dropzone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsPanDragging(true);
                        }}
                        onDragLeave={() => setIsPanDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsPanDragging(false);
                          if (e.dataTransfer.files?.[0]) setPanFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => panFileInputRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${
                          isPanDragging
                            ? 'border-[#123d33] bg-emerald-50/60'
                            : panFile
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : 'border-gray-300 hover:border-[#123d33] hover:bg-gray-50/60 bg-gray-50/40'
                        }`}
                      >
                        <input
                          ref={panFileInputRef}
                          type="file"
                          accept="application/pdf,image/jpeg,image/png"
                          className="hidden"
                          onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                        />

                        {panFile ? (
                          <div className="space-y-2 w-full">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-xs truncate max-w-[200px] mx-auto">
                                {panFile.name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {formatFileSize(panFile.size)} • Ready for upload
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPanFile(null);
                              }}
                              className="inline-flex items-center space-x-1 text-[11px] text-rose-600 hover:underline pt-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove & choose another</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-gray-800 text-xs">PAN Card Document</p>
                              <p className="text-[11px] text-gray-500">
                                Drag & drop or <span className="text-[#123d33] font-bold">browse</span>
                              </p>
                            </div>
                            <span className="text-[10px] text-gray-400 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                              PDF, JPG, PNG • Max 10MB
                            </span>
                          </>
                        )}
                      </div>

                      {/* Aadhaar Card Dropzone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsAadhaarDragging(true);
                        }}
                        onDragLeave={() => setIsAadhaarDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsAadhaarDragging(false);
                          if (e.dataTransfer.files?.[0]) setAadhaarFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => aadhaarFileInputRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${
                          isAadhaarDragging
                            ? 'border-[#123d33] bg-emerald-50/60'
                            : aadhaarFile
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : 'border-gray-300 hover:border-[#123d33] hover:bg-gray-50/60 bg-gray-50/40'
                        }`}
                      >
                        <input
                          ref={aadhaarFileInputRef}
                          type="file"
                          accept="application/pdf,image/jpeg,image/png"
                          className="hidden"
                          onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                        />

                        {aadhaarFile ? (
                          <div className="space-y-2 w-full">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-xs truncate max-w-[200px] mx-auto">
                                {aadhaarFile.name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {formatFileSize(aadhaarFile.size)} • Ready for upload
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAadhaarFile(null);
                              }}
                              className="inline-flex items-center space-x-1 text-[11px] text-rose-600 hover:underline pt-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove & choose another</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-gray-800 text-xs">Aadhaar Card Document</p>
                              <p className="text-[11px] text-gray-500">
                                Drag & drop or <span className="text-[#123d33] font-bold">browse</span>
                              </p>
                            </div>
                            <span className="text-[10px] text-gray-400 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                              PDF, JPG, PNG • Max 10MB
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                {myKYC?.status !== 'VERIFIED' && (
                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                      Officer approval typically completes within 2 to 4 business hours.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmittingKYC}
                      className="bg-[#123d33] hover:bg-[#0c2922] text-white font-bold py-3.5 px-8 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmittingKYC ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Uploading & Submitting...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-amber-300" />
                          <span>Submit KYC for Officer Review</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>

              {/* 3. LIST OF DOCUMENTS CURRENTLY ON RECORD IN SUPABASE */}
              {myKYC && myKYC.documents && myKYC.documents.length > 0 && (
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <h4 className="font-bold text-xs text-gray-800">
                    Uploaded Identity Documents on Record ({myKYC.documents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {myKYC.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-gray-900 truncate">{doc.fileName}</p>
                            <span className="text-[10px] text-gray-400">
                              {doc.type} • Uploaded {doc.uploadedAt}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openKYCDocument(doc.fileUrl)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#123d33] hover:underline flex-shrink-0 pl-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MONTHLY CONTRIBUTION DUES                               */}
        {/* ============================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Monthly Contribution Dues
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track due dates, applied dividend discounts, and payment receipts
                </p>
              </div>
            </div>

            {/* Dividend Explanation Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-start space-x-3.5 text-xs text-emerald-950">
              <div className="p-2 bg-emerald-200/60 rounded-xl text-emerald-900 font-bold flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-emerald-950">
                  How Dividend Discounts Lower Your Payable Dues
                </p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Whenever an e-auction closes, the winning bid discount (minus the statutory 5% foreman commission) is divided equally amongst all non-prized members as a <strong>Dividend Credit</strong>. This is automatically deducted from your gross instalment!
                </p>
              </div>
            </div>

            {myInstallments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[24px] border border-gray-200/90 text-gray-500 shadow-sm">
                <p className="text-sm font-semibold text-gray-700">No Monthly Dues Found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Enroll in a chit group to generate your monthly instalment schedule.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[24px] border border-gray-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100">
                      <tr>
                        <th className="p-4">Scheme Code</th>
                        <th className="p-4">Month #</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Gross Dues</th>
                        <th className="p-4 text-emerald-700">Dividend Discount</th>
                        <th className="p-4">Net Payable</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {myInstallments.map((inst) => (
                        <tr key={inst.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{inst.groupCode}</td>
                          <td className="p-4 text-gray-600">Month #{inst.monthNumber}</td>
                          <td className="p-4 text-gray-600">{inst.dueDate}</td>
                          <td className="p-4 text-gray-600">
                            ₹{inst.grossAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-emerald-700 font-bold">
                            - ₹{inst.dividendDiscount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 font-extrabold text-gray-900 text-sm">
                            ₹{inst.netPayable.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                inst.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {inst.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {inst.status !== 'PAID' ? (
                              <button
                                onClick={() => setSelectedInstalmentToPay(inst.id)}
                                className="bg-[#123d33] hover:bg-[#0c2922] text-white px-3.5 py-1.5 rounded-xl font-bold text-[11px] shadow-xs cursor-pointer"
                              >
                                Pay Dues
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[11px]">
                                Paid on {inst.paidDate}
                              </span>
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

        {/* ============================================================== */}
        {/* TAB 5: E-AUCTION BIDDING ROOM                                  */}
        {/* ============================================================== */}
        {activeTab === 'auctions' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  <span>e-Auction Live Bidding Room</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time transparent reverse auctions for enrolled scheme members
                </p>
              </div>
            </div>

            {auctions.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No Active Auctions Scheduled</p>
                <p className="text-xs text-gray-400">
                  Monthly auctions will appear here according to your scheme’s statutory schedule.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bidding Form */}
                <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-gray-900">Place Your Discount Bid</h3>
                    <p className="text-xs text-gray-500">
                      Scheme: {auctions[0].groupName} (Month #{auctions[0].monthNumber})
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">
                      Your Selected Bid Discount: ₹{bidDiscountInput.toLocaleString('en-IN')}
                    </label>
                    <input
                      type="range"
                      min={5000}
                      max={30000}
                      step={500}
                      value={bidDiscountInput}
                      onChange={(e) => setBidDiscountInput(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                      <span>₹5,000 (Min 5% Foreman)</span>
                      <span>₹30,000 (Max 30% Statutory Cap)</span>
                    </div>
                  </div>

                  {/* Calculations Preview */}
                  {(() => {
                    const targetGroup =
                      groups.find((g) => g.id === auctions[0].groupId) || groups[0];
                    const chitVal = targetGroup ? targetGroup.totalValue : 100000;
                    const fee = (chitVal * 5) / 100;
                    const myPrizeMoney = chitVal - bidDiscountInput;
                    const divPool = Math.max(0, bidDiscountInput - fee);
                    const divPerMember = Math.floor(
                      divPool / (targetGroup ? targetGroup.totalMembers : 20)
                    );

                    return (
                      <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                            Take-Home Prize (&quot;Get My Amount&quot;)
                          </span>
                          <span className="text-xl font-extrabold text-emerald-700">
                            ₹{myPrizeMoney.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-gray-100">
                          <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-900">
                            <span className="text-emerald-700 block font-semibold">
                              Dividend Distributed / Member:
                            </span>
                            <span className="font-extrabold text-xs">
                              ₹{divPerMember.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="bg-amber-50 p-2.5 rounded-lg text-amber-900">
                            <span className="text-amber-700 block font-semibold">
                              Foreman Commission (5%):
                            </span>
                            <span className="font-extrabold text-xs">
                              ₹{fee.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => placeAuctionBid(auctions[0].id, bidDiscountInput)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Confirm & Place Auction Bid
                  </button>
                </div>

                {/* Live Bids Feed */}
                <div className="space-y-4">
                  <h3 className="font-bold text-base text-gray-900">Active Bids in Room</h3>
                  {auctions[0].bids.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center border rounded-2xl border-dashed">
                      No bids submitted yet for this auction round.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {auctions[0].bids.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 bg-gray-50 rounded-xl text-xs flex justify-between items-center border border-gray-200/80"
                        >
                          <div>
                            <span className="font-bold text-gray-900">
                              {b.subscriberName} (Seat #{b.seatNumber})
                            </span>
                            <span className="text-[10px] text-gray-400 block">{b.timestamp}</span>
                          </div>
                          <span className="font-extrabold text-amber-800 text-sm">
                            ₹{b.bidDiscountAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: BANK & NOMINEE (NEW COMPREHENSIVE VIEW)                 */}
        {/* ============================================================== */}
        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bank Account Details */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-gray-200/90 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#123d33] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Registered Bank Account</h3>
                  <p className="text-xs text-gray-500">Used for prize payouts and direct settlements</p>
                </div>
              </div>

              {myBankAccounts.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
                  <p className="text-xs text-gray-500">
                    No bank account linked yet. Contact officer or update details during KYC.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBankAccounts.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">{b.bankName}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            b.isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.isVerified ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-gray-600 pt-1">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Account Holder</span>
                          <span className="font-semibold text-gray-800">{b.accountHolder}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Account Number</span>
                          <span className="font-mono font-semibold text-gray-800">
                            •••• •••• {b.accountNumber.slice(-4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">IFSC Code</span>
                          <span className="font-mono font-semibold text-gray-800">{b.ifscCode}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Branch</span>
                          <span className="font-semibold text-gray-800">{b.branch}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nominee Details */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-gray-200/90 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Registered Nominee</h3>
                  <p className="text-xs text-gray-500">Statutory nominee under Chit Funds Act</p>
                </div>
              </div>

              {myNominees.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
                  <p className="text-xs text-gray-500">
                    No nominee registered yet. You can add a nominee by contacting support.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNominees.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">{n.name}</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                          {n.relationship}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-gray-600 pt-1">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Contact Phone</span>
                          <span className="font-semibold text-gray-800">{n.phone}</span>
                        </div>
                        {n.idProofNumber && (
                          <div>
                            <span className="text-[10px] text-gray-400 block">ID Proof Number</span>
                            <span className="font-mono font-semibold text-gray-800">
                              {n.idProofNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: RECEIPTS & DIGITAL DOCUMENTS                            */}
        {/* ============================================================== */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Digital Receipts & Official Documents
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Download verified payment receipts, chit agreements, and statements
              </p>
            </div>

            {myDocs.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2 border-2 border-dashed rounded-2xl">
                <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No Documents Generated Yet</p>
                <p className="text-xs text-gray-400">
                  Payment receipts and agreements will appear here as you transact.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 truncate pr-3">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{doc.title}</h4>
                      <p className="text-gray-400 text-[11px]">
                        Ref: {doc.referenceNumber || 'N/A'} • {doc.generatedAt}
                      </p>
                    </div>
                    <button
                      onClick={() => openKYCDocument(doc.downloadUrl)}
                      className="bg-[#123d33] hover:bg-[#0c2922] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: SUPPORT HELPDESK TICKETS                                */}
        {/* ============================================================== */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-gray-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">
                Raise Customer Support Ticket
              </h3>
              <form onSubmit={handleSupportSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Summarize your issue..."
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#123d33]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as typeof ticketCategory)}
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#123d33] bg-white cursor-pointer"
                  >
                    <option value="PAYMENT">Payment & Contribution Dues</option>
                    <option value="AUCTION">e-Auction & Dividend Inquiry</option>
                    <option value="KYC">KYC Document Verification</option>
                    <option value="PAYOUT">Prize Disbursement & Guarantors</option>
                    <option value="OTHER">General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details about your query..."
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#123d33]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#123d33] hover:bg-[#0c2922] text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">
                Your Support History ({myTickets.length})
              </h3>
              {myTickets.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-[24px] border border-gray-200/90 text-gray-400 space-y-1">
                  <p className="text-xs">No active or past support tickets found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTickets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-5 rounded-2xl border border-gray-200/90 text-xs space-y-3 shadow-2xs"
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-900 font-bold">
                          {t.ticketCode} • {t.subject}
                        </span>
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px]">
                          {t.status}
                        </span>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        {t.messages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl ${
                              m.sender === 'CUSTOMER'
                                ? 'bg-gray-50 text-gray-800'
                                : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                            }`}
                          >
                            <span className="font-bold text-[11px] block text-gray-900">
                              {m.senderName} ({m.sender}):
                            </span>
                            <p className="mt-0.5 leading-relaxed">{m.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. PAYMENT NOTICE MODAL */}
        {selectedInstalmentToPay && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in duration-200">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-gray-900">Payment Gateway Gateway</h3>
                  <p className="text-xs text-gray-500">Official contribution settlement</p>
                </div>
                <button
                  onClick={() => setSelectedInstalmentToPay(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>Online Payment Integration Notice</span>
                </p>
                <p className="leading-relaxed">
                  In compliance with RBI regulations and the Chit Funds Act 1982, payment gateway settlement takes place via official UPI or NetBanking bank transfer. No funds were debited.
                </p>
              </div>

              <button
                onClick={() => setSelectedInstalmentToPay(null)}
                className="w-full bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
