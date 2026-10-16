'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Users, UserPlus } from 'lucide-react';

export default function AdminSubscribersPage() {
  const { subscribers, groups, joinChitGroup } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [subscriberName, setSubscriberName] = useState('');

  const handleEnrollManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    joinChitGroup(selectedGroupId, `cust-manual-${Date.now()}`);
    setShowAddModal(false);
    setSubscriberName('');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subscribers & Seat Roster</h2>
          <p className="text-xs text-gray-500">Track member seat allocations and participation history</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#123d33] text-white hover:bg-[#0b2e26] font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll Subscriber</span>
        </button>
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500 space-y-3">
          <Users className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Subscribers Enrolled</h4>
          <p className="text-xs">Members who enroll online or are added by admin will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="p-4">Subscriber Name</th>
                  <th className="p-4">Group Code</th>
                  <th className="p-4">Seat #</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Auction Status</th>
                  <th className="p-4">Total Paid (₹)</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => {
                  const grp = groups.find((g) => g.id === sub.groupId);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">{sub.userName}</td>
                      <td className="p-4 font-semibold text-gray-700">{grp?.groupCode || 'Scheme'}</td>
                      <td className="p-4 font-bold text-[#123d33]">Seat #{sub.seatNumber}</td>
                      <td className="p-4 text-gray-500">{sub.joinedDate}</td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            sub.hasWonAuction ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {sub.hasWonAuction ? `Prize Winner (M${sub.wonMonth})` : 'Eligible to Bid'}
                        </span>
                      </td>
                      <td className="p-4 font-bold">₹{sub.totalPaid}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENROLL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Enroll Member into Scheme</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollManual} className="space-y-4 text-xs">
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
                      {g.groupCode} — {g.groupName} ({g.currentMemberCount}/{g.totalMembers} seats filled)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Subscriber Full Name</label>
                <input
                  type="text"
                  value={subscriberName}
                  onChange={(e) => setSubscriberName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#123d33] text-white hover:bg-[#0b2e26] font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
              >
                Assign Seat & Enroll Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
