'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { BookOpen } from 'lucide-react';

export default function AdminAccountingPage() {
  const { ledger } = useApp();

  const totalCredit = ledger.reduce((acc, l) => acc + l.creditAmount, 0);
  const totalDebit = ledger.reduce((acc, l) => acc + l.debitAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">General Accounting Ledgers</h2>
        <p className="text-xs text-gray-500">
          Double-entry bookkeeping of collections, foreman commissions, and prize disbursements
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Credit Inflow</span>
          <span className="text-3xl font-semibold text-emerald-700">₹{totalCredit.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-gray-500 block">Collections & Commission credit</span>
        </div>

        <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Debit Outflow</span>
          <span className="text-3xl font-semibold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-gray-500 block">Prize disbursements & settlements</span>
        </div>
      </div>

      {ledger.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500 space-y-3">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Ledger Entries Recorded</h4>
          <p className="text-xs">Accounting journal entries will be generated automatically as collections occur.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="p-4">Entry #</th>
                  <th className="p-4">Account Type</th>
                  <th className="p-4">Party / Scheme</th>
                  <th className="p-4">Narration</th>
                  <th className="p-4">Debit (₹)</th>
                  <th className="p-4">Credit (₹)</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold">{l.entryNumber}</td>
                    <td className="p-4 font-semibold text-amber-800">{l.accountType}</td>
                    <td className="p-4">{l.userName || l.groupCode}</td>
                    <td className="p-4 text-gray-600">{l.narration}</td>
                    <td className="p-4 font-bold text-red-600">{l.debitAmount ? `₹${l.debitAmount}` : '-'}</td>
                    <td className="p-4 font-bold text-emerald-600">{l.creditAmount ? `₹${l.creditAmount}` : '-'}</td>
                    <td className="p-4 text-gray-400">{l.timestamp}</td>
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
