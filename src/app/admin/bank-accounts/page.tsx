'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AlertCircle, CheckCircle2, Clock, Eye, Landmark, Search, XCircle } from 'lucide-react';

type Filter = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL';
const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

// Prize money is released only to a verified account, so officers check each one against its proof and the KYC name
export default function AdminBankAccountsPage() {
  const { bankAccounts, customers, kycList, verifyBankAccount, rejectBankAccount, openKYCDocument } = useApp();
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const statusOf = (b: (typeof bankAccounts)[number]): Exclude<Filter, 'ALL'> =>
    b.isVerified ? 'VERIFIED' : b.rejectionReason ? 'REJECTED' : 'PENDING';
  const counts = {
    PENDING: bankAccounts.filter((b) => statusOf(b) === 'PENDING').length,
    VERIFIED: bankAccounts.filter((b) => statusOf(b) === 'VERIFIED').length,
    REJECTED: bankAccounts.filter((b) => statusOf(b) === 'REJECTED').length,
  };
  const q = searchQuery.toLowerCase().trim();
  const filtered = bankAccounts.filter((b) => {
    const customer = customers.find((c) => c.id === b.userId);
    const matchesSearch = !q || [b.accountHolder, b.bankName, b.ifscCode, b.accountNumber, customer?.fullName ?? '', customer?.email ?? '']
      .some((value) => value.toLowerCase().includes(q));
    return matchesSearch && (filter === 'ALL' || statusOf(b) === filter);
  });

  const run = async (action: () => Promise<boolean>) => {
    setIsProcessing(true);
    try { return await action(); } finally { setIsProcessing(false); }
  };
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    if (await run(() => rejectBankAccount(rejectId, rejectReason.trim()))) {
      setRejectId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <Landmark className="w-6 h-6 text-[#123d33]" />
            <span>Bank Account Verification</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Payouts are released only to verified accounts. Check the proof and that the holder name matches the KYC name.
          </p>
        </div>
        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
          {counts.PENDING} Pending Review
        </span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, holder name, bank or IFSC..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#123d33]"
          />
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
          {([
            ['PENDING', `Pending (${counts.PENDING})`],
            ['VERIFIED', `Verified (${counts.VERIFIED})`],
            ['REJECTED', `Rejected (${counts.REJECTED})`],
            ['ALL', `All (${bankAccounts.length})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === id ? 'bg-[#123d33] text-white font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[24px] border border-gray-200/90 text-gray-500 space-y-3 shadow-xs">
          <Landmark className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Bank Accounts Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Accounts customers add in their portal, with a cancelled cheque or passbook page, appear here for verification.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const customer = customers.find((c) => c.id === b.userId);
            const kycName = kycList.find((k) => k.userId === b.userId)?.userName || customer?.fullName || '';
            const nameMatches = !!kycName && normalizeName(kycName) === normalizeName(b.accountHolder);
            const status = statusOf(b);
            return (
              <div key={b.id} className="bg-white rounded-[24px] border border-gray-200/90 p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 tracking-tight">{customer?.fullName || 'Customer'}</h3>
                    <p className="text-xs text-gray-500">{customer?.email} {customer?.phone && `• ${customer.phone}`}</p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full border inline-flex items-center space-x-1 self-start sm:self-auto ${
                      status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {status === 'VERIFIED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : status === 'REJECTED' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{status === 'VERIFIED' ? 'Verified' : status === 'REJECTED' ? 'Rejected' : 'Pending Review'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  {[
                    ['Account Holder', b.accountHolder],
                    ['Account Number', b.accountNumber],
                    ['IFSC', b.ifscCode],
                    ['Bank', b.bankName],
                    ['Branch', b.branch || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{label}</span>
                      <span className="font-mono font-bold text-gray-900 break-all">{value}</span>
                    </div>
                  ))}
                </div>

                <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${nameMatches ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  {nameMatches ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>
                    {nameMatches
                      ? 'Account holder name matches the KYC name.'
                      : `Account holder name does not exactly match the KYC name "${kycName || 'unknown'}". Check the proof before verifying.`}
                  </span>
                </div>

                {b.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <span className="font-bold">Rejection reason:</span> {b.rejectionReason}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  {b.proofPath ? (
                    <button
                      type="button"
                      onClick={() => void openKYCDocument(b.proofPath)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#123d33] hover:underline bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Cheque / Passbook</span>
                    </button>
                  ) : (
                    <span className="text-xs text-rose-700 font-bold">No proof uploaded: this account cannot be verified.</span>
                  )}
                  {status === 'PENDING' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setRejectId(b.id)}
                        disabled={isProcessing}
                        className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => void run(() => verifyBankAccount(b.id))}
                        disabled={isProcessing || !b.proofPath}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Account</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight">Reject Bank Account</h3>
            <p className="text-xs text-gray-500">The customer sees this reason and can add the account again with a corrected proof.</p>
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Cheque is not cancelled, account holder name differs from KYC..."
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                required
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setRejectId(null)} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
