'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Award, Plus } from 'lucide-react';

export default function AdminAuctionsPage() {
  const { auctions, groups, scheduleAuction, finalizeAuction } = useApp();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [monthNumber, setMonthNumber] = useState(1);
  const [auctionDate, setAuctionDate] = useState('2026-11-15 15:00');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    scheduleAuction(selectedGroupId, monthNumber, auctionDate);
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">e-Auction & Draw Controller</h2>
          <p className="text-xs text-gray-500">
            Conduct monthly bidding auctions, record winner discounts, and compute subscriber dividend pools
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-[#374421] text-white hover:bg-[#2d381e] font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Auction</span>
        </button>
      </div>

      {auctions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-500 space-y-3">
          <Award className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Auctions Scheduled</h4>
          <p className="text-xs">Click 'Schedule Auction' to plan a monthly auction for an enrolled chit group.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map((auc) => (
            <div key={auc.id} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded text-[11px]">
                    {auc.groupCode} • Month #{auc.monthNumber}
                  </span>
                  <h3 className="font-bold text-base text-gray-900 mt-1">{auc.groupName}</h3>
                  <p className="text-gray-500 text-[11px]">Scheduled: {auc.auctionDate}</p>
                </div>
                <span
                  className={`font-bold px-3 py-1 rounded-full text-[10px] ${
                    auc.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {auc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Winning Bid Discount</span>
                  <span className="font-bold text-amber-700 text-sm">₹{auc.winningBidDiscount.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Foreman Fee (5% Fixed)</span>
                  <span className="font-bold text-gray-900 text-sm">₹{auc.foremanFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 block text-[10px] font-bold">Dividend Discount / Member</span>
                  <span className="font-extrabold text-emerald-800 text-base">₹{auc.dividendPerMember.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-amber-800 block text-[10px] font-bold">Winner Take-Home Prize (&quot;My Amount&quot;)</span>
                  <span className="font-extrabold text-[#374421] text-base">₹{auc.netPrizeAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {auc.winningSubscriberName && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <span className="font-bold">Declared Winner: </span>
                  <span>{auc.winningSubscriberName} (Seat #{auc.winningSeatNumber})</span>
                </div>
              )}

              {auc.status !== 'COMPLETED' && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => finalizeAuction(auc.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Declare Winner & Distribute Dividend Credits
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Schedule e-Auction</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Chit Scheme</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                  required
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.groupCode} — {g.groupName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Month #</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={monthNumber}
                  onChange={(e) => setMonthNumber(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Auction Date & Time</label>
                <input
                  type="text"
                  value={auctionDate}
                  onChange={(e) => setAuctionDate(e.target.value)}
                  placeholder="2026-11-15 15:00"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#374421] text-white hover:bg-[#2d381e] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
              >
                Confirm & Open Bidding Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
