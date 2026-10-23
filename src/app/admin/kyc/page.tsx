'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Mail,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
  FileText,
  Search,
  Filter
} from 'lucide-react';

export default function AdminKYCPage() {
  const { kycList, approveKYC, rejectKYC, openKYCDocument, customers } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveKYC(id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      const ok = await rejectKYC(rejectId, rejectReason.trim());
      if (ok) {
        setRejectId(null);
        setRejectReason('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter & Search
  const filteredList = kycList.filter((k) => {
    const customer = customers.find((c) => c.id === k.userId);
    const name = (k.userName || customer?.fullName || '').toLowerCase();
    const email = (k.userEmail || customer?.email || '').toLowerCase();
    const phone = (k.userPhone || customer?.phone || '').toLowerCase();
    const pan = (k.panNumber || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q) || pan.includes(q);
    const matchesStatus = filterStatus === 'ALL' || k.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = kycList.filter((k) => k.status === 'PENDING_APPROVAL').length;
  const verifiedCount = kycList.filter((k) => k.status === 'VERIFIED').length;
  const rejectedCount = kycList.filter((k) => k.status === 'REJECTED').length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-[#123d33]" />
            <span>KYC Verification Officer Queue</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Statutory customer identification & document audit under Chit Funds Act, 1982
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl">
            {pendingCount} Pending Review
          </span>
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl">
            {verifiedCount} Approved
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, or PAN..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#123d33]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: `All (${kycList.length})` },
            { id: 'PENDING_APPROVAL', label: `Pending (${pendingCount})` },
            { id: 'VERIFIED', label: `Approved (${verifiedCount})` },
            { id: 'REJECTED', label: `Rejected (${rejectedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as typeof filterStatus)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#123d33] text-white font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[24px] border border-gray-200/90 text-gray-500 space-y-3 shadow-xs">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No KYC Applications Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No KYC submissions match your search query.'
              : 'When customers submit PAN and Aadhaar documents, they will appear here for officer approval.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((k) => {
            const customer = customers.find((c) => c.id === k.userId);
            const applicantName = k.userName || customer?.fullName || 'Customer';
            const applicantEmail = k.userEmail || customer?.email || 'N/A';
            const applicantPhone = k.userPhone || customer?.phone || 'N/A';

            return (
              <div
                key={k.id}
                className="bg-white rounded-[24px] border border-gray-200/90 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Header: Customer Identity & Status */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#123d33] to-[#205447] text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-xs">
                      {applicantName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-gray-900 tracking-tight">
                          {applicantName}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">
                          (UID: {k.userId.slice(0, 8)})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 font-medium">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{applicantEmail}</span>
                        </span>
                        {applicantPhone !== 'N/A' && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{applicantPhone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border inline-flex items-center space-x-1 ${
                        k.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : k.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {k.status === 'VERIFIED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : k.status === 'REJECTED' ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>
                        {k.status === 'VERIFIED'
                          ? 'Verified'
                          : k.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Pending Officer Review'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* ID Proof Numbers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      PAN Card Number
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                      {k.panNumber || 'Not Provided'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      Aadhaar Card Reference
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                      {k.aadhaarNumber || 'Not Provided'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      Submission Timestamp
                    </span>
                    <span className="font-medium text-gray-700 text-xs block">
                      {k.submittedAt ? k.submittedAt.slice(0, 16) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">
                    Attached Identity Proof Documents ({k.documents.length})
                  </span>
                  {k.documents.length === 0 ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>No document files uploaded by customer. Verification cannot proceed.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {k.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2.5 truncate pr-2">
                            <FileText className="w-4 h-4 text-[#123d33] flex-shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-gray-900 block truncate">
                                {doc.fileName}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {doc.type.replace('_', ' ')} • {doc.uploadedAt}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => void openKYCDocument(doc.fileUrl)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-[#123d33] hover:underline bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs flex-shrink-0 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Doc</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification History / Notes */}
                {k.status === 'VERIFIED' && k.verifiedBy && (
                  <div className="pt-2 text-[11px] text-emerald-800 font-medium">
                    ✓ Verified by officer <strong>{k.verifiedBy}</strong> on {k.verifiedAt}
                  </div>
                )}

                {k.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-0.5">
                    <span className="font-bold block">Rejection Reason Given:</span>
                    <p>{k.rejectionReason}</p>
                  </div>
                )}

                {/* Officer Action Buttons */}
                {k.status === 'PENDING_APPROVAL' && (
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setRejectId(k.id)}
                      disabled={isProcessing}
                      className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApprove(k.id)}
                      disabled={isProcessing || k.documents.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Identity Verification</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl animate-in fade-in">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight">Reject KYC Verification</h3>
            <p className="text-xs text-gray-500">
              Provide a clear reason for the customer so they know what to fix when re-uploading documents.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Blurry PAN card copy, name mismatch between Aadhaar and application..."
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs"
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
