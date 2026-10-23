'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { History } from 'lucide-react';

export default function AdminAuditPage() {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Immutable Audit Trail</h2>
        <p className="text-xs text-gray-500">
          Append-only log of security and financial events, recorded by the database, for regulatory compliance and forensics
        </p>
      </div>

      {auditLogs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[20px] border border-gray-200 text-gray-500 space-y-3">
          <History className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="font-bold text-base text-gray-800">No Audit Events Logged</h4>
          <p className="text-xs">All administrative actions and customer events will be recorded here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Resource Target</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{log.actorName}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#123d33]">{log.action}</td>
                    <td className="p-4 text-gray-500 font-mono text-[11px]">{log.resourceType}</td>
                    <td className="p-4 text-gray-700 max-w-xs break-words" title={log.details}>{log.details}</td>
                    <td className="p-4 font-mono text-gray-400 text-[11px]">{log.ipAddress}</td>
                    <td className="p-4 text-gray-400 text-[11px]">{log.timestamp}</td>
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
