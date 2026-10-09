'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Shield,
  Users,
  Building2,
  DollarSign,
  FileCheck,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  FileSpreadsheet,
  Lock,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
  Check,
  Ban
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    currentUser,
    profiles,
    groups,
    subscribers,
    kycList,
    installments,
    payments,
    auctions,
    payouts,
    ledger,
    auditLogs,
    tickets,
    approveKYC,
    rejectKYC,
    createChitGroup,
    finalizeAuction,
    makerApprovePayout,
    checkerReleasePayout
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'overview' | 'groups' | 'kyc' | 'collections' | 'auctions' | 'payouts' | 'accounting' | 'reports' | 'audit'
  >('overview');

  // New Group Modal State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupValue, setNewGroupValue] = useState<number>(500000);
  const [newGroupDuration, setNewGroupDuration] = useState<number>(25);

  // Maker-Checker Notes State
  const [payoutNotesInput, setPayoutNotesInput] = useState('');

  // Rejection Notes State
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectingKycId, setRejectingKycId] = useState<string | null>(null);

  const pendingKYC = kycList.filter((k) => k.status === 'PENDING_APPROVAL');
  const pendingPayoutsMaker = payouts.filter((p) => p.status === 'GUARANTOR_PENDING' || p.status === 'REQUESTED');
  const pendingPayoutsChecker = payouts.filter((p) => p.status === 'MAKER_APPROVED');

  const totalChitVolume = groups.reduce((acc, g) => acc + g.totalValue, 0);
  const totalCollectionsPaid = payments.reduce((acc, p) => acc + p.amountPaid, 0);

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChitGroup({
      groupName: newGroupName || `RAKVIH Scheme ₹${newGroupValue.toLocaleString()}`,
      totalValue: newGroupValue,
      durationMonths: newGroupDuration,
      monthlyContribution: newGroupValue / newGroupDuration,
      totalMembers: newGroupDuration
    });
    setShowCreateGroupModal(false);
    setNewGroupName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-[#374421] to-[#4d5d30] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black">Admin Management Platform</h1>
          </div>
          <p className="text-xs text-gray-200 mt-1">
            Logged in as <span className="font-bold text-amber-400">{currentUser.fullName}</span> ({currentUser.role.replace('_', ' ')})
          </p>
        </div>

        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="bg-amber-400 text-gray-950 hover:bg-amber-300 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Chit Scheme</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-1 overflow-x-auto bg-gray-200/60 p-1.5 rounded-2xl text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview KPIs' },
          { id: 'groups', label: 'Chit Groups' },
          { id: 'kyc', label: `KYC Approvals (${pendingKYC.length})` },
          { id: 'collections', label: 'Collections' },
          { id: 'auctions', label: 'e-Auctions' },
          { id: 'payouts', label: 'Maker-Checker Payouts' },
          { id: 'accounting', label: 'Ledgers' },
          { id: 'reports', label: 'Financial Reports' },
          { id: 'audit', label: 'Audit Trail' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              adminTab === tab.id
                ? 'bg-[#374421] text-white shadow-md font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW KPIs */}
      {adminTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
                Total Chit Volume
              </span>
              <span className="text-2xl font-black text-gray-900 block">
                ₹{totalChitVolume.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">{groups.length} Active Schemes</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
                Total Collections
              </span>
              <span className="text-2xl font-black text-emerald-700 block">
                ₹{totalCollectionsPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-500">{payments.length} Reconciled Transactions</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
                Pending KYC Queue
              </span>
              <span className="text-2xl font-black text-amber-600 block">{pendingKYC.length}</span>
              <span className="text-[11px] text-amber-700 font-semibold">Requires Officer Review</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
                Payout Approvals
              </span>
              <span className="text-2xl font-black text-blue-600 block">
                {pendingPayoutsMaker.length + pendingPayoutsChecker.length}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold">Maker-Checker Queue</span>
            </div>
          </div>

          {/* Quick Pending Queues Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KYC Pending Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-gray-900">Pending KYC Approvals</h3>
                <button onClick={() => setAdminTab('kyc')} className="text-xs font-bold text-[#4d5d30]">
                  View Queue
                </button>
              </div>

              {pendingKYC.length > 0 ? (
                pendingKYC.map((k) => {
                  const prof = profiles.find((p) => p.id === k.userId);
                  return (
                    <div key={k.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{prof?.fullName || 'Customer'}</p>
                        <p className="text-gray-500">PAN: {k.panNumber} | Aadhaar: {k.aadhaarNumber}</p>
                      </div>
                      <button
                        onClick={() => approveKYC(k.id)}
                        className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px]"
                      >
                        Approve
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500">No pending KYC applications in queue.</p>
              )}
            </div>

            {/* Maker Checker Pending Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-gray-900">Maker-Checker Payout Queue</h3>
                <button onClick={() => setAdminTab('payouts')} className="text-xs font-bold text-[#4d5d30]">
                  Open Payout Module
                </button>
              </div>

              {pendingPayoutsMaker.length > 0 || pendingPayoutsChecker.length > 0 ? (
                <div className="space-y-3">
                  {pendingPayoutsMaker.map((p) => (
                    <div key={p.id} className="p-4 bg-amber-50 rounded-2xl text-xs space-y-2 border border-amber-200">
                      <div className="flex justify-between font-bold text-amber-900">
                        <span>Maker Approval Pending: {p.winnerName}</span>
                        <span>₹{p.prizeAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Review guarantor documents and pass maker verification.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No pending payout authorizations.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHIT GROUPS */}
      {adminTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Chit Schemes & Subscriber Seats</h2>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-[#374421] text-white font-bold text-xs px-4 py-2.5 rounded-xl"
            >
              + Add Chit Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((grp) => (
              <div key={grp.id} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md">
                    {grp.groupCode}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {grp.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-900">{grp.groupName}</h3>
                  <p className="text-xl font-black text-[#4d5d30] mt-1">
                    ₹{grp.totalValue.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span>Monthly Dues:</span>
                    <span className="font-bold text-gray-900">₹{grp.monthlyContribution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats Filled:</span>
                    <span className="font-bold text-gray-900">
                      {grp.currentMemberCount} / {grp.totalMembers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Foreman Commission:</span>
                    <span className="font-bold text-gray-900">{grp.foremanCommissionPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KYC APPROVAL QUEUE */}
      {adminTab === 'kyc' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">KYC Verification Officer Queue</h2>
          <div className="space-y-4">
            {kycList.map((k) => {
              const prof = profiles.find((p) => p.id === k.userId);
              return (
                <div
                  key={k.id}
                  className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">{prof?.fullName || 'Customer'}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          k.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : k.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {k.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      PAN: <span className="font-bold">{k.panNumber}</span> | Aadhaar:{' '}
                      <span className="font-bold">{k.aadhaarNumber}</span>
                    </p>
                    <p className="text-gray-400">Submitted at: {k.submittedAt}</p>
                  </div>

                  {k.status === 'PENDING_APPROVAL' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveKYC(k.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Approve KYC
                      </button>
                      <button
                        onClick={() => rejectKYC(k.id, 'Identity details mismatched')}
                        className="bg-red-100 text-red-800 hover:bg-red-200 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: AUCTIONS */}
      {adminTab === 'auctions' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">e-Auction & Winner Declaration Controller</h2>
          </div>

          <div className="space-y-4">
            {auctions.map((auc) => (
              <div key={auc.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {auc.groupCode} • Month {auc.monthNumber}
                    </span>
                    <h3 className="font-bold text-base text-gray-900 mt-1">{auc.groupName}</h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                    {auc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Winning Bid Discount</span>
                    <span className="font-bold text-amber-700 text-sm">₹{auc.winningBidDiscount}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Foreman Fee (5%)</span>
                    <span className="font-bold text-gray-900 text-sm">₹{auc.foremanFee}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Dividend / Member</span>
                    <span className="font-bold text-emerald-600 text-sm">₹{auc.dividendPerMember}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Net Prize Money</span>
                    <span className="font-bold text-gray-900 text-sm">₹{auc.netPrizeAmount}</span>
                  </div>
                </div>

                {auc.status !== 'COMPLETED' && (
                  <button
                    onClick={() => finalizeAuction(auc.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                  >
                    Finalize Winner & Trigger Dividend Distribution
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MAKER-CHECKER PAYOUTS */}
      {adminTab === 'payouts' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Maker-Checker Dual Authorization Module</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MAKER STEP */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-base text-amber-900 flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                <span>Step 1: Maker Authorization (Finance Officer)</span>
              </h3>

              {pendingPayoutsMaker.map((p) => (
                <div key={p.id} className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-3">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>Winner: {p.winnerName}</span>
                    <span>Prize: ₹{p.prizeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600">Group: {p.groupCode} • Winner Month #{p.monthNumber}</p>

                  <button
                    onClick={() => makerApprovePayout(p.id, 'Guarantor document verified cleanly')}
                    className="w-full bg-amber-600 text-white font-bold py-2 rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    Pass Maker Verification
                  </button>
                </div>
              ))}
            </div>

            {/* CHECKER STEP */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-base text-emerald-900 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Step 2: Checker Disbursement Release (Senior Admin)</span>
              </h3>

              {pendingPayoutsChecker.map((p) => (
                <div key={p.id} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-3">
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>Passed Maker: {p.winnerName}</span>
                    <span>Prize: ₹{p.prizeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600">Maker Notes: {p.makerNotes}</p>

                  <button
                    onClick={() => checkerReleasePayout(p.id, 'Approved for bank transfer disbursement')}
                    className="w-full bg-[#374421] text-white font-bold py-2 rounded-xl hover:bg-[#2d381e] transition-colors"
                  >
                    Release Prize Payout to Bank Account
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ACCOUNTING LEDGERS */}
      {adminTab === 'accounting' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">General Accounting Ledgers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="p-3">Entry #</th>
                  <th className="p-3">Account Type</th>
                  <th className="p-3">User / Group</th>
                  <th className="p-3">Narration</th>
                  <th className="p-3">Debit (₹)</th>
                  <th className="p-3">Credit (₹)</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold">{l.entryNumber}</td>
                    <td className="p-3 font-semibold text-amber-800">{l.accountType}</td>
                    <td className="p-3">{l.userName || l.groupCode}</td>
                    <td className="p-3 text-gray-600">{l.narration}</td>
                    <td className="p-3 text-red-600 font-bold">{l.debitAmount ? `₹${l.debitAmount}` : '-'}</td>
                    <td className="p-3 text-emerald-600 font-bold">{l.creditAmount ? `₹${l.creditAmount}` : '-'}</td>
                    <td className="p-3 text-gray-400">{l.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT TRAIL */}
      {adminTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Immutable Audit Trail Logs</h2>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    {log.actorName} ({log.actorRole}) • {log.action}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-gray-600">{log.details}</p>
                <span className="text-[10px] text-gray-400 font-mono">Resource: {log.resourceType} ({log.resourceId}) | IP: {log.ipAddress}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE NEW CHIT GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Create New Registered Chit Group</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-gray-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Group Scheme Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. RAKVIH Emerald ₹5 Lakh Scheme"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Total Chit Value (₹)</label>
                <input
                  type="number"
                  step={50000}
                  value={newGroupValue}
                  onChange={(e) => setNewGroupValue(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Duration & Total Members</label>
                <select
                  value={newGroupDuration}
                  onChange={(e) => setNewGroupDuration(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                >
                  <option value={20}>20 Months (20 Seats)</option>
                  <option value={25}>25 Months (25 Seats)</option>
                  <option value={40}>40 Months (40 Seats)</option>
                </select>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 border border-gray-200">
                <span>Calculated Monthly Contribution: </span>
                <span className="font-extrabold text-[#374421]">
                  ₹{(newGroupValue / newGroupDuration).toLocaleString('en-IN')} / month
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#374421] text-white hover:bg-[#2d381e] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
              >
                Save & Publish Chit Scheme
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
