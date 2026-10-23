'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Plus, Trash2, Layers } from 'lucide-react';

export default function AdminGroupsPage() {
  const { groups, createChitGroup, deleteChitGroup } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [totalValue, setTotalValue] = useState<number>(100000);
  const [durationMonths, setDurationMonths] = useState<number>(20);
  const [maxTicketsPerPerson, setMaxTicketsPerPerson] = useState<number>(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createChitGroup({
      groupName: groupName || `RAKVIH Scheme ₹${totalValue.toLocaleString()}`,
      totalValue,
      durationMonths,
      monthlyContribution: totalValue / durationMonths,
      totalMembers: durationMonths,
      maxTicketsPerPerson
    });
    if (created) { setShowModal(false); setGroupName(''); }
  };

  return (
    <div className="admin-groups-page space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Chit Schemes Management</h2>
          <p className="text-xs text-gray-500">Configure regulated chit plans, durations, and member seat quotas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#123d33] text-white hover:bg-[#0b2e26] font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Scheme</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500 space-y-3">
          <Layers className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Chit Schemes Found</h4>
          <p className="text-xs">Create your first chit scheme to allow customers to enroll.</p>
        </div>
      ) : (
        <div className="admin-groups-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((grp) => (
            <div key={grp.id} className="admin-scheme-card bg-white rounded-[20px] border border-gray-200 p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold bg-[#e8eee8] text-[#123d33] px-2.5 py-1 rounded-md">
                  {grp.groupCode}
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {grp.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-gray-900">{grp.groupName}</h3>
                <p className="text-2xl font-semibold text-[#123d33] mt-1">
                  ₹{grp.totalValue.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span>Monthly Contribution:</span>
                  <span className="font-bold text-gray-900">₹{grp.monthlyContribution.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled Seats:</span>
                  <span className="font-bold text-gray-900">
                    {grp.currentMemberCount} / {grp.totalMembers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-bold text-gray-900">{grp.durationMonths} Months</span>
                </div>
                <div className="flex justify-between">
                  <span>Foreman Fee:</span>
                  <span className="font-bold text-gray-900">{grp.foremanCommissionPercent}%</span>
                </div>
                <div className="flex justify-between text-amber-900 font-semibold bg-amber-50 px-2 py-1 rounded">
                  <span>Max Chits / Person:</span>
                  <span className="font-bold">{grp.maxTicketsPerPerson || 3} Tickets</span>
                </div>
              </div>
              <div className="admin-seat-progress" aria-label={`${grp.currentMemberCount} of ${grp.totalMembers} seats enrolled`}>
                <span style={{ width: `${Math.min(100, (grp.currentMemberCount / grp.totalMembers) * 100)}%` }} />
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => deleteChitGroup(grp.id)}
                  title="Delete Group"
                  className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Create Registered Chit Scheme</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Scheme Title</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. RAKVIH Emerald ₹1 Lakh Scheme"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#123d33]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Total Chit Value (₹)</label>
                <input
                  type="number"
                  step={25000}
                  value={totalValue}
                  onChange={(e) => setTotalValue(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Duration (Months / Total Members)</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                >
                  <option value={20}>20 Months (20 Seats)</option>
                  <option value={25}>25 Months (25 Seats)</option>
                  <option value={40}>40 Months (40 Seats)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Max Tickets Allowed per Single Person
                </label>
                <select
                  value={maxTicketsPerPerson}
                  onChange={(e) => setMaxTicketsPerPerson(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                >
                  <option value={1}>1 Ticket Max per Person (Strictly 1 Seat)</option>
                  <option value={2}>2 Tickets Max per Person</option>
                  <option value={3}>3 Tickets Max per Person (Recommended)</option>
                  <option value={5}>5 Tickets Max per Person</option>
                </select>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Allows a single customer to take multiple seats/chits in this scheme.
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 border border-gray-200">
                <span>Monthly Dues per Member: </span>
                <span className="font-semibold text-[#123d33]">
                  ₹{(totalValue / durationMonths).toLocaleString('en-IN')} / month
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#123d33] text-white hover:bg-[#0b2e26] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
              >
                Save & Register Scheme
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
