// src/components/admin/AdminAlloyTrust.jsx
// ALLOY — AlloyTrust Trust & Safety Command Center & Intelligence Engine

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Clock,
  Lock,
  RefreshCw,
  Search,
  X,
  FileText
} from 'lucide-react';
import {
  getRiskBadgeColor,
  SIGNAL_CATALOG,
  RISK_THRESHOLDS
} from '../../services/alloyTrustEngine';

export default function AdminAlloyTrust({
  reports = [],
  onSubmitDecision,
  onRunTrustScan
}) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [scanRunning, setScanRunning] = useState(false);

  // Filter reports
  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      (rep.entity_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || rep.risk_category === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleExecuteDecision = async (decisionType) => {
    if (!selectedReport) return;
    setActionInProgress(true);

    try {
      await onSubmitDecision?.({
        reportId: selectedReport.id,
        decision: decisionType,
        notes: decisionNotes || `Super Admin executed ${decisionType.toUpperCase()} action.`,
        actionTaken: decisionType === 'approve' ? 'CLEARED_RISK' : decisionType === 'suspend' ? 'IMPOSED_RESTRICTION' : 'FLAGGED_MONITORING',
        entityId: selectedReport.entity_id,
        entityType: selectedReport.entity_type
      });
      setSelectedReport(null);
      setDecisionNotes('');
    } catch (err) {
      console.error('Error executing decision:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleTriggerScan = async () => {
    setScanRunning(true);
    try {
      await onRunTrustScan?.();
    } finally {
      setScanRunning(false);
    }
  };

  return (
    <div className="alloy-admin-section">
      {/* Top Banner */}
      <div className="alloy-admin-trust-hero">
        <div className="alloy-admin-trust-hero-content">
          <div className="alloy-admin-hero-badge trust">
            <ShieldAlert size={14} />
            <span>ALLOYTRUST SURVEILLANCE & AI INTEGRITY</span>
          </div>
          <h2 className="alloy-admin-section-title">AlloyTrust Intelligence Command</h2>
          <p className="alloy-admin-section-sub">
            Real-time fraud prevention, off-platform solicitation mitigation, and smart escrow risk scoring.
          </p>
        </div>

        <div className="alloy-admin-hero-actions">
          <button
            type="button"
            className="alloy-admin-btn-primary"
            onClick={handleTriggerScan}
            disabled={scanRunning}
          >
            <RefreshCw size={15} className={scanRunning ? 'animate-spin' : ''} />
            <span>{scanRunning ? 'Analyzing Signals...' : 'Run Automated Platform Scan'}</span>
          </button>
        </div>
      </div>

      {/* Signal Weight Catalog Preview */}
      <div className="alloy-admin-panel catalog-strip">
        <div className="alloy-admin-strip-title">Active Safety Signal Catalog:</div>
        <div className="alloy-admin-signals-scroll">
          {SIGNAL_CATALOG.map((sig) => (
            <div key={sig.id} className="alloy-admin-signal-pill">
              <span className="dot" />
              <span className="name">{sig.name}</span>
              <span className="weight">+{sig.defaultWeight} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="alloy-admin-filter-bar">
        <div className="alloy-admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search reports by entity name, ID, or incident summary..."
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
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="alloy-admin-select"
          >
            <option value="all">All Risk Tiers</option>
            <option value="critical">Critical (85-100)</option>
            <option value="high">High (60-84)</option>
            <option value="moderate">Moderate (30-59)</option>
            <option value="low">Low (0-29)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="alloy-admin-select"
          >
            <option value="all">All Statuses</option>
            <option value="needs_review">Needs Review</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="restricted">Restricted / Quarantined</option>
            <option value="cleared">Cleared / Approved</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="alloy-admin-table-container">
        <table className="alloy-admin-table">
          <thead>
            <tr>
              <th>Risk Score</th>
              <th>Flagged Entity</th>
              <th>Type</th>
              <th>Incident Summary</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" className="alloy-admin-empty-cell">
                  No risk reports found matching query filters.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const badge = getRiskBadgeColor(report.risk_category);
                return (
                  <tr key={report.id} className={report.risk_category === 'critical' ? 'row-critical' : ''}>
                    <td>
                      <div className="alloy-admin-score-cell">
                        <span
                          className="alloy-admin-score-badge"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            borderColor: badge.border
                          }}
                        >
                          {report.risk_score}
                        </span>
                        <span className="alloy-admin-score-tier" style={{ color: badge.text }}>
                          {report.risk_category?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-white">{report.entity_name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{report.id}</div>
                    </td>
                    <td>
                      <span className="alloy-admin-pill-neutral">
                        {report.entity_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="max-w-md text-xs text-zinc-300">
                      {report.summary}
                    </td>
                    <td>
                      <span className={`alloy-admin-status-badge ${report.status === 'cleared' ? 'verified' : report.status === 'restricted' ? 'restricted' : 'warning'}`}>
                        {report.status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="alloy-admin-btn-table highlight"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye size={14} />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Investigation Dossier & Decision Drawer */}
      {selectedReport && (
        <div className="alloy-modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="alloy-admin-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="alloy-admin-modal-header">
              <div className="alloy-admin-modal-title-group">
                <ShieldAlert size={22} className="text-amber-400" />
                <div>
                  <h3 className="text-lg font-medium text-white">AlloyTrust Incident Dossier: {selectedReport.id}</h3>
                  <p className="text-xs text-zinc-400">Target Entity: {selectedReport.entity_name} ({selectedReport.entity_type})</p>
                </div>
              </div>
              <button
                type="button"
                className="alloy-modal-close"
                onClick={() => setSelectedReport(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alloy-admin-modal-body">
              {/* Risk Level Banner */}
              <div className="alloy-admin-investigate-score-box">
                <div className="flex items-center gap-4">
                  <div
                    className="alloy-admin-investigate-score-circle"
                    style={{
                      borderColor: getRiskBadgeColor(selectedReport.risk_category).text,
                      color: getRiskBadgeColor(selectedReport.risk_category).text
                    }}
                  >
                    <span className="text-3xl font-mono font-bold">{selectedReport.risk_score}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider">/ 100</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">
                      Risk Stratification: {selectedReport.risk_category?.toUpperCase()}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Computed from deterministic integrity rules, velocity analysis, and behavioral heuristics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signals Breakdown */}
              <div className="alloy-admin-investigate-signals mt-4">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono mb-2">
                  Triggered Intelligence Signals
                </h4>
                <div className="alloy-admin-signals-list">
                  {(selectedReport.signals && selectedReport.signals.length > 0) ? (
                    selectedReport.signals.map((sig, idx) => (
                      <div key={idx} className="alloy-admin-signal-row">
                        <div className="alloy-admin-signal-name">
                          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                          <span>{sig.name || sig.id}</span>
                        </div>
                        <div className="alloy-admin-signal-detail">{sig.details}</div>
                        <div className="alloy-admin-signal-pts">+{sig.impact || 20} pts</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 py-2">
                      No high-severity individual signals logged; composite threshold evaluation.
                    </div>
                  )}
                </div>
              </div>

              {/* Reasoning Summary */}
              <div className="alloy-admin-brief-box mt-4">
                <div className="label text-xs uppercase text-zinc-400 font-mono mb-1">
                  AlloyTrust Synthesis & Context
                </div>
                <p className="text-sm text-zinc-200">{selectedReport.summary}</p>
              </div>

              {/* Decision Notes */}
              <div className="alloy-admin-decision-notes-section mt-4">
                <label className="text-xs uppercase text-zinc-400 font-mono block mb-1">
                  Super Admin Decision Memo (Audit Immutable)
                </label>
                <textarea
                  className="alloy-admin-textarea"
                  rows={2}
                  placeholder="Record formal justification for the decision..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="alloy-admin-investigate-actions mt-6">
                <button
                  type="button"
                  className="alloy-admin-btn-action clear"
                  disabled={actionInProgress}
                  onClick={() => handleExecuteDecision('approve')}
                >
                  <CheckCircle2 size={16} />
                  <span>Clear & Approve Entity</span>
                </button>

                <button
                  type="button"
                  className="alloy-admin-btn-action monitor"
                  disabled={actionInProgress}
                  onClick={() => handleExecuteDecision('flag')}
                >
                  <Eye size={16} />
                  <span>Flag for Active Monitoring</span>
                </button>

                <button
                  type="button"
                  className="alloy-admin-btn-action restrict"
                  disabled={actionInProgress}
                  onClick={() => handleExecuteDecision('suspend')}
                >
                  <Lock size={16} />
                  <span>Impose Quarantine / Freeze</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
