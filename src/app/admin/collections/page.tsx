'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { CreditCard, ArrowDownRight } from 'lucide-react';

export default function AdminCollectionsPage() {
  const { payments, installments } = useApp();

  const totalCollected = payments.reduce((acc, p) => acc + p.amountPaid, 0);
  const pendingDues = installments.filter((i) => i.status === 'DUE' || i.status === 'OVERDUE');
  const totalPendingDues = pendingDues.reduce((acc, i) => acc + i.netPayable, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Collections & Payment Reconciliation</h2>
          <p className="text-xs text-gray-500">Monitor monthly subscriber contributions, gateway settlements and dues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Realized Collections</span>
          <span className="text-3xl font-black text-emerald-700">₹{totalCollected.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-gray-500 block">{payments.length} Transactions</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Outstanding Dues</span>
          <span className="text-3xl font-black text-amber-600">₹{totalPendingDues.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-gray-500 block">{pendingDues.length} Pending Monthly Instalments</span>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-500 space-y-3">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Payment Transactions Recorded</h4>
          <p className="text-xs">Payments submitted by subscribers will appear here for settlement reconciliation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Group Code</th>
                  <th className="p-4">Month #</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Amount (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{pay.receiptNumber}</td>
                    <td className="p-4 font-mono text-gray-500">{pay.transactionRef}</td>
                    <td className="p-4 font-semibold text-gray-700">{pay.groupCode}</td>
                    <td className="p-4">Month {pay.monthNumber}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        {pay.paymentMode}
                      </span>
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-sm">₹{pay.amountPaid}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{pay.paidAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
