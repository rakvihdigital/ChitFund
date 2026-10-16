'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { FileCheck } from 'lucide-react';

export default function AdminKYCPage() {
  const { kycList, approveKYC, rejectKYC } = useApp();

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    rejectKYC(rejectId, rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">KYC Verification Officer Queue</h2>
        <p className="text-xs text-gray-500">
          Inspect submitted PAN cards, Aadhaar identity documents, and verify customer identities
        </p>
      </div>

      {kycList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500 space-y-3">
          <FileCheck className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No KYC Applications in Queue</h4>
          <p className="text-xs">When customers submit their KYC details, they will appear here for officer approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {kycList.map((k) => (
            <div
              key={k.id}
              className="bg-white p-6 rounded-[20px] border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-gray-900">Application #{k.id.slice(-6)}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

                <div className="grid grid-cols-2 gap-4 text-gray-700 pt-1">
                  <div>
                    <span className="text-gray-400 block text-[10px]">PAN Number</span>
                    <span className="font-mono font-bold">{k.panNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Aadhaar Number</span>
                    <span className="font-mono font-bold">{k.aadhaarNumber}</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400">Submitted on: {k.submittedAt}</p>
                {k.rejectionReason && (
                  <p className="text-xs text-red-600 font-semibold">Rejection Note: {k.rejectionReason}</p>
                )}
              </div>

              {k.status === 'PENDING_APPROVAL' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveKYC(k.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Approve KYC
                  </button>
                  <button
                    onClick={() => setRejectId(k.id)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-red-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Reject KYC Application</h3>
            <p className="text-xs text-gray-500">Provide reason for rejection to notify customer.</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Identity document details mismatched or blurry..."
                className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                required
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-red-700"
                >
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
