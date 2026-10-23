'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Building2,
  UserCheck,
  Award,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  User,
  HeartHandshake,
  Download,
  AlertTriangle
} from 'lucide-react';

export default function AdminUsersPage() {
  const {
    customers,
    kycList,
    subscribers,
    groups,
    installments,
    payments,
    bankAccounts,
    nominees,
    tickets,
    openKYCDocument,
    approveKYC,
    rejectKYC,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING_APPROVAL' | 'NOT_SUBMITTED' | 'REJECTED'>('ALL');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'ALL' | 'ENROLLED' | 'NOT_ENROLLED'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'NAME' | 'PAID'>('NEWEST');

  // Customer Dossier Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [dossierTab, setDossierTab] = useState<'OVERVIEW' | 'CHITS' | 'KYC' | 'PAYMENTS' | 'BANK_NOMINEE'>('OVERVIEW');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Compute enriched customer list
  const enrichedCustomers = useMemo(() => {
    return customers.map((c) => {
      const kyc = kycList.find((k) => k.userId === c.id);
      const kycStatus = kyc ? kyc.status : 'NOT_SUBMITTED';
      const userSubs = subscribers.filter((s) => s.userId === c.id);
      const userPayments = payments.filter((p) => p.userId === c.id && ['SUCCESS', 'RECONCILED'].includes(p.status));
      const totalPaid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
      const userInstallments = installments.filter((i) => i.userId === c.id);
      const overdueInstallments = userInstallments.filter((i) => i.status === 'OVERDUE' || (i.status === 'DUE' && new Date(i.dueDate) < new Date()));
      const pendingDueAmount = overdueInstallments.reduce((acc, i) => acc + (i.netPayable - i.paidAmount), 0);
      const bank = bankAccounts.find((b) => b.userId === c.id);
      const nominee = nominees.find((n) => n.userId === c.id);
      const userTickets = tickets.filter((t) => t.userId === c.id);

      return {
        ...c,
        kyc,
        kycStatus,
        subscribers: userSubs,
        totalPaid,
        pendingDueAmount,
        bank,
        nominee,
        tickets: userTickets,
      };
    });
  }, [customers, kycList, subscribers, payments, installments, bankAccounts, nominees, tickets]);

  // Filter & Search
  const filteredCustomers = useMemo(() => {
    return enrichedCustomers
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.kyc?.panNumber && c.kyc.panNumber.toLowerCase().includes(q));

        const matchesKyc = kycFilter === 'ALL' || c.kycStatus === kycFilter;
        const matchesEnrollment =
          enrollmentFilter === 'ALL' ||
          (enrollmentFilter === 'ENROLLED' ? c.subscribers.length > 0 : c.subscribers.length === 0);

        return matchesSearch && matchesKyc && matchesEnrollment;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'PAID') return b.totalPaid - a.totalPaid;
        return (b.joinedDate || '').localeCompare(a.joinedDate || '');
      });
  }, [enrichedCustomers, searchQuery, kycFilter, enrollmentFilter, sortBy]);

  // Overall statistics
  const totalCount = customers.length;
  const verifiedCount = enrichedCustomers.filter((c) => c.kycStatus === 'VERIFIED').length;
  const pendingKycCount = enrichedCustomers.filter((c) => c.kycStatus === 'PENDING_APPROVAL').length;
  const enrolledCount = enrichedCustomers.filter((c) => c.subscribers.length > 0).length;
  const totalCollections = enrichedCustomers.reduce((acc, c) => acc + c.totalPaid, 0);

  // Active customer for modal
  const activeCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return enrichedCustomers.find((c) => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId, enrichedCustomers]);

  const handleApproveKYCFromDossier = async (kycId: string) => {
    setIsProcessing(true);
    try {
      await approveKYC(kycId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectKYCFromDossier = async (e: React.FormEvent, kycId: string) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      const ok = await rejectKYC(kycId, rejectReason.trim());
      if (ok) {
        setShowRejectBox(false);
        setRejectReason('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-[#123d33]" />
            <span>Registered Customers Directory</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Comprehensive member profiles, statutory KYC status, chit schemes, and ledger accounts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/subscribers"
            className="bg-[#123d33] hover:bg-[#0b2e26] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Manage Seats</span>
          </Link>
          <Link
            href="/admin/kyc"
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-200 shadow-2xs transition-colors inline-flex items-center space-x-1.5"
          >
            <FileCheck className="w-4 h-4 text-[#123d33]" />
            <span>KYC Queue</span>
            {pendingKycCount > 0 && (
              <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {pendingKycCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <span className="text-[11px] text-gray-500 font-medium">Registered account holders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">KYC Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 flex items-baseline space-x-2">
            <span>{verifiedCount}</span>
            <span className="text-xs font-semibold text-gray-500">
              ({totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {pendingKycCount > 0 ? `${pendingKycCount} awaiting officer review` : 'All submissions processed'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Chit Subscribers</span>
            <Layers className="w-4 h-4 text-[#123d33]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{enrolledCount}</div>
          <span className="text-[11px] text-gray-500 font-medium">Holding 1 or more scheme tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Collections</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">
            ₹{totalCollections.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Gross member subscriptions paid</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row justify-between gap-3 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, UID, or PAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#123d33]/20 focus:border-[#123d33] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* KYC Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value as any)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#123d33]/20"
          >
            <option value="ALL">All KYC Statuses</option>
            <option value="VERIFIED">KYC: Verified</option>
            <option value="PENDING_APPROVAL">KYC: Pending Approval</option>
            <option value="NOT_SUBMITTED">KYC: Not Submitted</option>
            <option value="REJECTED">KYC: Rejected</option>
          </select>

          {/* Scheme Filter */}
          <select
            value={enrollmentFilter}
            onChange={(e) => setEnrollmentFilter(e.target.value as any)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#123d33]/20"
          >
            <option value="ALL">All Enrollments</option>
            <option value="ENROLLED">Enrolled in Chits</option>
            <option value="NOT_ENROLLED">No Schemes Yet</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#123d33]/20"
          >
            <option value="NEWEST">Sort: Newest First</option>
            <option value="NAME">Sort: Name (A-Z)</option>
            <option value="PAID">Sort: Highest Paid</option>
          </select>
        </div>
      </div>

      {/* Customers Table / Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-200/90 text-gray-500 space-y-3 shadow-xs">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Customers Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No registered customers match your search criteria. Try a different term or clear filters.'
              : 'Registered customer accounts will appear here automatically when they sign up on the portal.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4 pl-6">Customer Profile</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">KYC Compliance</th>
                  <th className="p-4">Chit Schemes</th>
                  <th className="p-4">Collections</th>
                  <th className="p-4">Bank / Nominee</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((cust) => {
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Customer Profile */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#123d33] to-[#205447] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {cust.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm tracking-tight flex items-center space-x-1.5">
                              <span>{cust.fullName}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              UID: {cust.id.slice(0, 8)}...
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center space-x-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {cust.joinedDate || 'Recently'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center space-x-1.5 text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[160px] font-medium" title={cust.email}>
                            {cust.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">
                            {cust.phone || 'No phone'}
                          </span>
                        </div>
                      </td>

                      {/* KYC Compliance */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              cust.kycStatus === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : cust.kycStatus === 'PENDING_APPROVAL'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : cust.kycStatus === 'REJECTED'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {cust.kycStatus === 'VERIFIED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : cust.kycStatus === 'PENDING_APPROVAL' ? (
                              <Clock className="w-3 h-3 text-amber-600" />
                            ) : cust.kycStatus === 'REJECTED' ? (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span>
                              {cust.kycStatus === 'VERIFIED'
                                ? 'Verified'
                                : cust.kycStatus === 'PENDING_APPROVAL'
                                ? 'Pending Review'
                                : cust.kycStatus === 'REJECTED'
                                ? 'Rejected'
                                : 'Not Submitted'}
                            </span>
                          </span>

                          {cust.kyc?.panNumber && (
                            <div className="text-[10px] text-gray-500 font-mono font-semibold">
                              PAN: {cust.kyc.panNumber}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Chit Schemes */}
                      <td className="p-4">
                        {cust.subscribers.length === 0 ? (
                          <span className="text-gray-400 text-xs italic">No tickets</span>
                        ) : (
                          <div className="space-y-1 max-w-[200px]">
                            {cust.subscribers.map((s) => {
                              const grp = groups.find((g) => g.id === s.groupId);
                              return (
                                <div
                                  key={s.id}
                                  className="inline-flex items-center space-x-1.5 bg-[#123d33]/5 text-[#123d33] border border-[#123d33]/15 px-2 py-0.5 rounded-lg text-[10px] font-bold mr-1 mb-1"
                                >
                                  <span>{grp?.groupCode || 'Scheme'}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>Seat #{s.seatNumber}</span>
                                  {s.hasWonAuction && (
                                    <span className="bg-amber-100 text-amber-900 px-1 rounded text-[9px] font-bold ml-1">
                                      Won M{s.wonMonth}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Collections */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-gray-900 text-sm">
                          ₹{cust.totalPaid.toLocaleString('en-IN')}
                        </div>
                        {cust.pendingDueAmount > 0 ? (
                          <div className="text-[10px] text-rose-600 font-bold flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Due: ₹{cust.pendingDueAmount.toLocaleString('en-IN')}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            Up to date
                          </div>
                        )}
                      </td>

                      {/* Bank & Nominee */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-xs">
                          <span
                            title={cust.bank ? `${cust.bank.bankName} (A/C: ${cust.bank.accountNumber})` : 'No Bank Added'}
                            className={`p-1.5 rounded-lg border inline-flex items-center ${
                              cust.bank
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-50 text-gray-300 border-gray-200'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </span>

                          <span
                            title={cust.nominee ? `Nominee: ${cust.nominee.name} (${cust.nominee.relationship})` : 'No Nominee Added'}
                            className={`p-1.5 rounded-lg border inline-flex items-center ${
                              cust.nominee
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-gray-50 text-gray-300 border-gray-200'
                            }`}
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setDossierTab('OVERVIEW');
                            setShowRejectBox(false);
                          }}
                          className="bg-white hover:bg-[#123d33] text-[#123d33] hover:text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-[#123d33]/20 hover:border-[#123d33] shadow-2xs transition-all inline-flex items-center space-x-1"
                        >
                          <span>View Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Dossier Modal / Drawer */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#123d33] text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white font-bold text-2xl flex items-center justify-center border border-white/20 shadow-inner">
                  {activeCustomer.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold tracking-tight">{activeCustomer.fullName}</h3>
                    <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {activeCustomer.role}
                    </span>
                  </div>
                  <div className="text-xs text-white/70 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span>UID: {activeCustomer.id}</span>
                    <span>•</span>
                    <span>Member since {activeCustomer.joinedDate || 'Recently'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors self-end sm:self-auto"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 gap-2 overflow-x-auto">
              {[
                { id: 'OVERVIEW', label: 'Overview & Profile', icon: User },
                { id: 'CHITS', label: `Chit Schemes (${activeCustomer.subscribers.length})`, icon: Layers },
                { id: 'KYC', label: 'KYC Compliance', icon: FileCheck },
                { id: 'PAYMENTS', label: 'Passbook & Dues', icon: CreditCard },
                { id: 'BANK_NOMINEE', label: 'Bank & Nominee', icon: Building2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = dossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDossierTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-[#123d33] text-[#123d33] bg-white -mb-px rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {dossierTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Contact & Identity Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-[#123d33]" />
                        <span>Contact Information</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                          <span className="text-gray-400">Email Address:</span>
                          <a
                            href={`mailto:${activeCustomer.email}`}
                            className="font-bold text-[#123d33] hover:underline"
                          >
                            {activeCustomer.email}
                          </a>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                          <span className="text-gray-400">Phone Number:</span>
                          <span className="font-bold text-gray-900">
                            {activeCustomer.phone || 'Not Registered'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-400">Role Status:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                            ACTIVE CUSTOMER
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-[#123d33]" />
                        <span>Financial Summary</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                          <span className="text-gray-400">Total Subscriptions Paid:</span>
                          <span className="font-bold text-emerald-700 text-sm">
                            ₹{activeCustomer.totalPaid.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                          <span className="text-gray-400">Outstanding Overdue:</span>
                          <span
                            className={`font-bold ${
                              activeCustomer.pendingDueAmount > 0 ? 'text-rose-600' : 'text-gray-900'
                            }`}
                          >
                            ₹{activeCustomer.pendingDueAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-400">Active Schemes:</span>
                          <span className="font-bold text-gray-900">
                            {activeCustomer.subscribers.length} Scheme(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary of KYC Status */}
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-700" />
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          Statutory KYC Verification Status: {activeCustomer.kycStatus}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {activeCustomer.kycStatus === 'VERIFIED'
                            ? `Compliant under Chit Funds Act 1982. Verified on ${activeCustomer.kyc?.verifiedAt?.slice(0, 10)}.`
                            : activeCustomer.kycStatus === 'PENDING_APPROVAL'
                            ? 'Documents submitted and currently in officer queue.'
                            : 'Customer has not yet submitted statutory documents.'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDossierTab('KYC')}
                      className="text-xs font-bold text-[#123d33] hover:underline flex items-center space-x-1"
                    >
                      <span>Inspect Documents</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CHIT SCHEMES */}
              {dossierTab === 'CHITS' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Enrolled Chit Schemes ({activeCustomer.subscribers.length})
                    </h4>
                    <Link
                      href="/admin/subscribers"
                      className="text-xs font-bold text-[#123d33] hover:underline flex items-center space-x-1"
                    >
                      <span>Manage All Seats</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {activeCustomer.subscribers.length === 0 ? (
                    <div className="bg-gray-50 p-8 text-center rounded-2xl border border-gray-200 text-gray-400 space-y-2">
                      <Layers className="w-10 h-10 mx-auto text-gray-300" />
                      <p className="text-xs font-medium">This customer has not joined any chit scheme yet.</p>
                      <Link
                        href="/admin/subscribers"
                        className="inline-block bg-[#123d33] text-white text-xs font-bold px-3 py-1.5 rounded-xl mt-2"
                      >
                        Enroll in a Scheme
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeCustomer.subscribers.map((sub) => {
                        const grp = groups.find((g) => g.id === sub.groupId);
                        const subInstallments = installments.filter(
                          (i) => i.subscriberId === sub.id && i.userId === activeCustomer.id
                        );
                        const paidInst = subInstallments.filter((i) => i.status === 'PAID').length;
                        const totalInst = subInstallments.length || (grp ? grp.durationMonths : 0);

                        return (
                          <div
                            key={sub.id}
                            className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#123d33] bg-[#123d33]/10 px-2 py-0.5 rounded">
                                  {grp?.groupCode || 'Scheme'}
                                </span>
                                <h5 className="font-bold text-sm text-gray-900 mt-1">
                                  {grp?.groupName || 'Chit Scheme'}
                                </h5>
                              </div>
                              <span className="font-mono font-bold text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-xl text-gray-800">
                                Seat #{sub.seatNumber}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-gray-200/60">
                              <div>
                                <span className="text-gray-400 text-[10px] block">Chit Value:</span>
                                <span className="font-bold text-gray-900">
                                  ₹{grp?.totalValue?.toLocaleString('en-IN') || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] block">Monthly Due:</span>
                                <span className="font-bold text-gray-900">
                                  ₹{grp?.monthlyContribution?.toLocaleString('en-IN') || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] block">Progress:</span>
                                <span className="font-bold text-gray-900">
                                  {paidInst} / {totalInst} Months Paid
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] block">Auction Status:</span>
                                <span
                                  className={`font-bold ${
                                    sub.hasWonAuction ? 'text-amber-600' : 'text-emerald-700'
                                  }`}
                                >
                                  {sub.hasWonAuction ? `Prize Winner (M${sub.wonMonth})` : 'Eligible to Bid'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-medium">
                                Total Paid: <b className="text-emerald-700">₹{sub.totalPaid.toLocaleString('en-IN')}</b>
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Enrolled: {sub.joinedDate}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: KYC COMPLIANCE */}
              {dossierTab === 'KYC' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Statutory Compliance Status
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center space-x-1.5 ${
                            activeCustomer.kycStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : activeCustomer.kycStatus === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : activeCustomer.kycStatus === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {activeCustomer.kycStatus === 'VERIFIED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : activeCustomer.kycStatus === 'PENDING_APPROVAL' ? (
                            <Clock className="w-4 h-4 text-amber-600" />
                          ) : activeCustomer.kycStatus === 'REJECTED' ? (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span>
                            {activeCustomer.kycStatus === 'VERIFIED'
                              ? 'Verified Statutory Identity'
                              : activeCustomer.kycStatus === 'PENDING_APPROVAL'
                              ? 'Pending Officer Review'
                              : activeCustomer.kycStatus === 'REJECTED'
                              ? 'Rejected Application'
                              : 'No KYC Application Submitted'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons if Pending */}
                    {activeCustomer.kyc && activeCustomer.kycStatus === 'PENDING_APPROVAL' && (
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleApproveKYCFromDossier(activeCustomer.kyc!.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve KYC</span>
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => setShowRejectBox(!showRejectBox)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2 rounded-xl border border-rose-200 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reject Reason Form if open */}
                  {showRejectBox && activeCustomer.kyc && (
                    <form
                      onSubmit={(e) => handleRejectKYCFromDossier(e, activeCustomer.kyc!.id)}
                      className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3"
                    >
                      <label className="block text-xs font-bold text-rose-900">
                        Specify Reason for Rejection:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Blurred PAN card image, name mismatch..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        required
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowRejectBox(false)}
                          className="px-3 py-1.5 text-xs text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isProcessing || !rejectReason.trim()}
                          className="px-4 py-1.5 text-xs bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ID Proof Numbers */}
                  {activeCustomer.kyc && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          PAN Card Number
                        </span>
                        <span className="font-mono font-bold text-gray-900 text-base">
                          {activeCustomer.kyc.panNumber || 'Not Provided'}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          Aadhaar Reference
                        </span>
                        <span className="font-mono font-bold text-gray-900 text-base">
                          {activeCustomer.kyc.aadhaarNumber || 'Not Provided'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Documents Attached */}
                  {activeCustomer.kyc && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Attached Identity Proof Documents ({activeCustomer.kyc.documents.length})
                      </h4>
                      {activeCustomer.kyc.documents.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No files attached to this submission.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeCustomer.kyc.documents.map((doc, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2.5 overflow-hidden">
                                <FileText className="w-5 h-5 text-[#123d33] flex-shrink-0" />
                                <div className="truncate">
                                  <span className="text-xs font-bold text-gray-900 block truncate">
                                    {doc.type.replace('_', ' ')}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block truncate">
                                    {doc.fileName}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => openKYCDocument(doc.fileUrl)}
                                className="bg-white hover:bg-gray-100 text-[#123d33] text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 flex items-center space-x-1 flex-shrink-0 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PASSBOOK & PAYMENTS */}
              {dossierTab === 'PAYMENTS' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Payment History & Passbook
                    </h4>
                    <span className="text-xs font-bold text-emerald-700">
                      Total Paid: ₹{activeCustomer.totalPaid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {(() => {
                    const custPayments = payments.filter((p) => p.userId === activeCustomer.id);
                    if (custPayments.length === 0) {
                      return (
                        <div className="bg-gray-50 p-8 text-center rounded-2xl border border-gray-200 text-gray-400">
                          <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          <p className="text-xs font-medium">No payment transactions recorded for this customer.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-3">Receipt / Ref</th>
                              <th className="p-3">Scheme</th>
                              <th className="p-3">Month</th>
                              <th className="p-3">Mode</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Timestamp</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {custPayments.map((p) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-3 font-mono font-bold text-gray-900">
                                  {p.receiptNumber || p.transactionRef || p.id.slice(0, 8)}
                                </td>
                                <td className="p-3 font-semibold text-gray-700">
                                  {p.groupCode || 'Scheme'}
                                </td>
                                <td className="p-3">Month #{p.monthNumber}</td>
                                <td className="p-3">
                                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {p.paymentMode}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-emerald-800">
                                  ₹{p.amountPaid.toLocaleString('en-IN')}
                                </td>
                                <td className="p-3 text-gray-500 text-[11px]">{p.paidAt}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      p.status === 'SUCCESS' || p.status === 'RECONCILED'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'bg-amber-50 text-amber-800'
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: BANK & NOMINEE */}
              {dossierTab === 'BANK_NOMINEE' && (
                <div className="space-y-6">
                  {/* Bank Account */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-[#123d33]" />
                        <span>Registered Bank Account</span>
                      </h4>
                      {activeCustomer.bank && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            activeCustomer.bank.isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {activeCustomer.bank.isVerified ? 'Verified Bank' : 'Pending Verification'}
                        </span>
                      )}
                    </div>

                    {!activeCustomer.bank ? (
                      <p className="text-xs text-gray-400 italic">No bank account details provided yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">Bank Name:</span>
                          <span className="font-bold text-gray-900">{activeCustomer.bank.bankName}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">Account Holder:</span>
                          <span className="font-bold text-gray-900">{activeCustomer.bank.accountHolder}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">Account Number:</span>
                          <span className="font-mono font-bold text-gray-900">{activeCustomer.bank.accountNumber}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">IFSC Code & Branch:</span>
                          <span className="font-mono font-bold text-gray-900">
                            {activeCustomer.bank.ifscCode} {activeCustomer.bank.branch ? `(${activeCustomer.bank.branch})` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nominee Details */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
                      <HeartHandshake className="w-4 h-4 text-indigo-600" />
                      <span>Statutory Chit Nominee</span>
                    </h4>

                    {!activeCustomer.nominee ? (
                      <p className="text-xs text-gray-400 italic">No nominee registered by this member.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">Nominee Full Name:</span>
                          <span className="font-bold text-gray-900">{activeCustomer.nominee.name}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">Relationship with Member:</span>
                          <span className="font-bold text-gray-900">{activeCustomer.nominee.relationship}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">Nominee Phone Number:</span>
                          <span className="font-bold text-gray-900">{activeCustomer.nominee.phone || 'N/A'}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-gray-400 text-[10px] block">ID Proof Reference:</span>
                          <span className="font-mono font-bold text-gray-900">
                            {activeCustomer.nominee.idProofNumber || 'Not Specified'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-[11px] text-gray-400">
                User Identifier: <code className="text-gray-600 font-mono">{activeCustomer.id}</code>
              </span>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
