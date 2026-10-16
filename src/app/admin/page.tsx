'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  FileCheck,
  Lock,
  Plus
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { groups, subscribers, payments, kycList, payouts, auditLogs } = useApp();

  const totalVolume = groups.reduce((acc, g) => acc + g.totalValue, 0);
  const totalCollections = payments.reduce((acc, p) => acc + p.amountPaid, 0);
  const pendingKYC = kycList.filter((k) => k.status === 'PENDING_APPROVAL');
  const pendingPayouts = payouts.filter(
    (p) => p.status === 'GUARANTOR_PENDING' || p.status === 'MAKER_APPROVED'
  );

  return (
    <div className="admin-overview space-y-8 max-w-7xl">
      {/* KPI Metrics Cards */}
      <div className="admin-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-metric admin-metric-feature bg-white p-6 rounded-[20px] border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
            Total Chit Volume
          </span>
          <span className="text-2xl font-semibold text-gray-900 block">
            ₹{totalVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold">
            {groups.length} Registered Schemes
          </span>
        </div>

        <div className="admin-metric bg-white p-6 rounded-[20px] border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
            Enrolled Subscribers
          </span>
          <span className="text-2xl font-semibold text-gray-900 block">{subscribers.length}</span>
          <span className="text-[11px] text-gray-500">Active seat assignments</span>
        </div>

        <div className="admin-metric bg-white p-6 rounded-[20px] border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
            Total Collections
          </span>
          <span className="text-2xl font-semibold text-emerald-700 block">
            ₹{totalCollections.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-gray-500">
            {payments.length} Reconciled transactions
          </span>
        </div>

        <div className="admin-metric bg-white p-6 rounded-[20px] border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
            Action Items Queue
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-semibold text-amber-600">
              {pendingKYC.length + pendingPayouts.length}
            </span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium">
            {pendingKYC.length} KYC, {pendingPayouts.length} Payouts
          </span>
        </div>
      </div>

      {/* Action Queues Section */}
      <div className="admin-queues grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending KYC Approvals */}
        <div className="admin-panel bg-white p-6 rounded-[20px] border border-gray-200 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-900 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-500" />
              <span>Pending KYC Verification ({pendingKYC.length})</span>
            </h3>
            <Link href="/admin/kyc" className="text-xs text-[#123d33] font-bold hover:underline">
              Review Queue →
            </Link>
          </div>

          {pendingKYC.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
              No customer KYC submissions pending officer review.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingKYC.slice(0, 3).map((k) => (
                <div
                  key={k.id}
                  className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-xs border border-gray-100"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">PAN: {k.panNumber}</span>
                    <span className="text-gray-500">Aadhaar: {k.aadhaarNumber}</span>
                  </div>
                  <Link
                    href="/admin/kyc"
                    className="bg-amber-500 text-white font-bold px-3 py-1.5 rounded-xl text-[11px]"
                  >
                    Verify
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maker-Checker Payout Queue */}
        <div className="admin-panel bg-white p-6 rounded-[20px] border border-gray-200 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Maker-Checker Payout Authorizations ({pendingPayouts.length})</span>
            </h3>
            <Link href="/admin/payouts" className="text-xs text-[#123d33] font-bold hover:underline">
              Open Authorizations →
            </Link>
          </div>

          {pendingPayouts.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
              No prize payouts currently awaiting Maker or Checker approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayouts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-amber-50/60 rounded-2xl flex justify-between items-center text-xs border border-amber-200"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{p.winnerName} ({p.groupCode})</span>
                    <span className="text-amber-800">Prize Amount: ₹{p.prizeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <Link
                    href="/admin/payouts"
                    className="bg-[#123d33] text-white font-bold px-3 py-1.5 rounded-xl text-[11px]"
                  >
                    Authorize
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chit Schemes Quick Summary */}
      <div className="admin-panel admin-scheme-summary bg-white p-6 rounded-[20px] border border-gray-200 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-gray-900">Active Chit Schemes</h3>
            <p className="text-xs text-gray-500">Overview of registered chit groups and seat fill status</p>
          </div>
          <Link
            href="/admin/groups"
            className="bg-[#123d33] text-white hover:bg-[#0b2e26] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Schemes</span>
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
            No chit schemes created yet. Click &apos;Manage Schemes&apos; to set up your first chit fund.
          </div>
        ) : (
          <div className="admin-summary-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g.id} className="admin-summary-scheme p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-[#123d33] bg-[#e8eee8] px-2 py-0.5 rounded">
                    {g.groupCode}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    {g.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-gray-900">{g.groupName}</h4>
                <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
                  <span>Value: ₹{g.totalValue.toLocaleString('en-IN')}</span>
                  <span>{g.currentMemberCount} / {g.totalMembers} Seats</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Audit Log Stream */}
      <div className="admin-panel admin-audit-preview bg-white p-6 rounded-[20px] border border-gray-200 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-gray-900">Recent System Audit Trail</h3>
          <Link href="/admin/audit" className="text-xs text-[#123d33] font-bold hover:underline">
            View All Logs →
          </Link>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">No activity recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.slice(0, 4).map((l) => (
              <div key={l.id} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{l.actorName}</span>
                  <span className="text-gray-500"> — {l.action}: {l.details}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{l.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
