'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Lock, FileCheck, AlertTriangle } from 'lucide-react';

export default function AdminPayoutsPage() {
  const { payouts, makerApprovePayout, checkerReleasePayout } = useApp();

  const [makerNotes, setMakerNotes] = useState('');
  const [checkerNotes, setCheckerNotes] = useState('');

  const pendingMaker = payouts.filter(
    (p) => p.status === 'GUARANTOR_PENDING' || p.status === 'REQUESTED'
  );
  const pendingChecker = payouts.filter((p) => p.status === 'MAKER_APPROVED');
  const released = payouts.filter((p) => p.status === 'CHECKER_RELEASED');

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Maker-Checker Payout Authorization Workflow</h2>
        <p className="text-xs text-gray-500">
          Dual authorization mechanism: Finance Maker verifies guarantors; Senior Checker releases bank funds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* STEP 1: MAKER QUEUE */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Step 1: Maker Verification</h3>
              <p className="text-xs text-gray-500">Finance Officer guarantor check</p>
            </div>
          </div>

          {pendingMaker.length === 0 ? (
            <p className="text-xs text-gray-400 p-6 text-center">No payouts awaiting Maker approval.</p>
          ) : (
            <div className="space-y-4">
              {pendingMaker.map((p) => (
                <div key={p.id} className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-3">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>Winner: {p.winnerName}</span>
                    <span className="text-sm font-extrabold">₹{p.prizeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600">Scheme: {p.groupCode} • Month #{p.monthNumber}</p>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Maker Audit Notes</label>
                    <input
                      type="text"
                      value={makerNotes}
                      onChange={(e) => setMakerNotes(e.target.value)}
                      placeholder="e.g. Verified salary slip and security cheques"
                      className="w-full border border-gray-300 rounded-xl p-2.5 outline-none bg-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      makerApprovePayout(p.id, makerNotes || 'Guarantors verified');
                      setMakerNotes('');
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    Pass Maker Authorization
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STEP 2: CHECKER QUEUE */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Step 2: Checker Release</h3>
              <p className="text-xs text-gray-500">Super Admin final disbursement</p>
            </div>
          </div>

          {pendingChecker.length === 0 ? (
            <p className="text-xs text-gray-400 p-6 text-center">No payouts awaiting Checker disbursement.</p>
          ) : (
            <div className="space-y-4">
              {pendingChecker.map((p) => (
                <div key={p.id} className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-3">
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>Passed Maker: {p.winnerName}</span>
                    <span className="text-sm font-extrabold">₹{p.prizeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600">Maker Notes: {p.makerNotes}</p>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Checker Authorization Notes</label>
                    <input
                      type="text"
                      value={checkerNotes}
                      onChange={(e) => setCheckerNotes(e.target.value)}
                      placeholder="e.g. Bank settlement authorized via RTGS"
                      className="w-full border border-gray-300 rounded-xl p-2.5 outline-none bg-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      checkerReleasePayout(p.id, checkerNotes || 'Released via Bank Transfer');
                      setCheckerNotes('');
                    }}
                    className="w-full bg-[#374421] hover:bg-[#2d381e] text-white font-bold py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    Authorize & Disburse Bank Payout
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disbursed History */}
      {released.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-gray-900">Disbursed Payout History</h3>
          <div className="space-y-2">
            {released.map((r) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-2xl text-xs flex justify-between items-center border border-gray-100">
                <div>
                  <span className="font-bold text-gray-900 block">{r.winnerName} ({r.groupCode})</span>
                  <span className="text-gray-500">Ref: {r.disbursedRef} • Checker Notes: {r.checkerNotes}</span>
                </div>
                <span className="font-black text-emerald-700 text-sm">₹{r.prizeAmount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
