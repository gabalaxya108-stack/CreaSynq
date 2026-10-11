// src/components/admin/AdminAuditLog.jsx
// ALLOY Super Admin — Immutable Security & Operational Audit Log

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  Eye,
  X
} from 'lucide-react';

export default function AdminAuditLog({ auditLogs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [inspectedLog, setInspectedLog] = useState(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.target_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="alloy-admin-section">
      <div className="alloy-admin-section-header">
        <div>
          <h2 className="alloy-admin-section-title">Cryptographic Security Audit Log</h2>
          <p className="alloy-admin-section-sub">
            Append-only, immutable record of administrative actions, trust reviews, and platform configuration mutations.
          </p>
        </div>
        <div className="alloy-admin-counter-pill">
          <span>{filteredLogs.length} Events Logged</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="alloy-admin-filter-bar">
        <div className="alloy-admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search audit trail by actor, action type, or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="alloy-admin-filter-group">
          <Filter size={14} />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="alloy-admin-select"
          >
            <option value="all">All Action Classes</option>
            <option value="TRUST">Trust & Safety Decisions</option>
            <option value="CONFIG">Platform Config Updates</option>
            <option value="ADMIN">Admin Auth & Sessions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="alloy-admin-table-container">
        <table className="alloy-admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Identifier</th>
              <th>Super Admin Actor</th>
              <th>Target Resource</th>
              <th>Audit Reason / Justification</th>
              <th className="text-right">Inspection</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="alloy-admin-empty-cell">
                  No audit entries recorded matching this filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span className="alloy-admin-pill-code">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs font-medium text-white">{log.actor_email}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{log.actor_role}</div>
                  </td>
                  <td>
                    <div className="text-xs text-zinc-200">{log.target_name || log.target_id}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">{log.target_type}</div>
                  </td>
                  <td className="max-w-xs truncate text-xs text-zinc-400">
                    {log.reason || 'Routine security check'}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="alloy-admin-btn-table"
                      onClick={() => setInspectedLog(log)}
                    >
                      <Terminal size={13} />
                      <span>Forensics</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Forensics Modal */}
      {inspectedLog && (
        <div className="alloy-modal-backdrop" onClick={() => setInspectedLog(null)}>
          <div className="alloy-admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="alloy-admin-modal-header">
              <div className="alloy-admin-modal-title-group">
                <Terminal size={18} className="text-amber-400" />
                <h3>Event Payload Forensics: {inspectedLog.id}</h3>
              </div>
              <button
                type="button"
                className="alloy-modal-close"
                onClick={() => setInspectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alloy-admin-modal-body">
              <pre className="alloy-admin-json-viewer">
                {JSON.stringify(inspectedLog, null, 2)}
              </pre>

              <div className="alloy-admin-modal-actions mt-4">
                <button
                  type="button"
                  className="alloy-admin-btn-secondary"
                  onClick={() => setInspectedLog(null)}
                >
                  Close Forensics Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
