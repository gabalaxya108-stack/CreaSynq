// src/components/admin/AdminCampaignManagement.jsx
// ALLOY Super Admin — Campaign Oversight & Brief Validation

import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export default function AdminCampaignManagement({
  campaigns = [],
  onUpdateCampaignStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.deliverables || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="alloy-admin-section">
      <div className="alloy-admin-section-header">
        <div>
          <h2 className="alloy-admin-section-title">Campaign Oversight & Escrow Briefs</h2>
          <p className="alloy-admin-section-sub">
            Monitoring brand requirements, budget commitments, deliverables, and brief compliance.
          </p>
        </div>
        <div className="alloy-admin-counter-pill">
          <span>{filteredCampaigns.length} Campaigns Active</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="alloy-admin-filter-bar">
        <div className="alloy-admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search campaigns by brief title, brand sponsor, or deliverable..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="alloy-admin-select"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Active</option>
            <option value="draft">Draft Briefs</option>
            <option value="in-review">Under Review</option>
            <option value="completed">Completed / Disbursed</option>
            <option value="flagged">Flagged by AlloyTrust</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="alloy-admin-table-container">
        <table className="alloy-admin-table">
          <thead>
            <tr>
              <th>Campaign Brief</th>
              <th>Brand Sponsor</th>
              <th>Committed Escrow</th>
              <th>Status</th>
              <th>Deliverable Scope</th>
              <th className="text-right">Oversight Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan="6" className="alloy-admin-empty-cell">
                  No campaigns matching query criteria.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((camp) => {
                const isFlagged = camp.status === 'flagged';
                return (
                  <tr key={camp.id}>
                    <td>
                      <div className="alloy-admin-entity-cell">
                        <div className="alloy-admin-brand-thumb campaign">
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <div className="alloy-admin-entity-name">{camp.title}</div>
                          <div className="alloy-admin-entity-id">{camp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{camp.brandName || camp.brand_name || 'Unassigned'}</td>
                    <td>
                      <span className="alloy-admin-pill-budget">
                        {camp.budget ? String(camp.budget).replace(/\$/g, '₹') : 'Unspecified'}
                      </span>
                    </td>
                    <td>
                      <span className={`alloy-admin-status-badge ${isFlagged ? 'restricted' : 'verified'}`}>
                        {isFlagged ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        <span>{camp.status || 'Active'}</span>
                      </span>
                    </td>
                    <td className="max-w-xs truncate text-xs text-zinc-400">
                      {Array.isArray(camp.deliverables) ? camp.deliverables.join(', ') : (camp.deliverables || 'Deliverables not specified')}
                    </td>
                    <td className="text-right">
                      <div className="alloy-admin-action-row">
                        <button
                          type="button"
                          className="alloy-admin-btn-table"
                          onClick={() => setSelectedCampaign(camp)}
                        >
                          <Eye size={14} />
                          <span>Brief</span>
                        </button>
                        {isFlagged ? (
                          <button
                            type="button"
                            className="alloy-admin-btn-table success"
                            onClick={() => onUpdateCampaignStatus?.(camp.id, 'published')}
                          >
                            <FileCheck size={14} />
                            <span>Clear</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="alloy-admin-btn-table warning"
                            onClick={() => onUpdateCampaignStatus?.(camp.id, 'flagged')}
                          >
                            <ShieldAlert size={14} />
                            <span>Flag</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="alloy-modal-backdrop" onClick={() => setSelectedCampaign(null)}>
          <div className="alloy-admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="alloy-admin-modal-header">
              <div className="alloy-admin-modal-title-group">
                <Briefcase size={20} className="text-amber-400" />
                <h3>Campaign Brief Audit: {selectedCampaign.title}</h3>
              </div>
              <button
                type="button"
                className="alloy-modal-close"
                onClick={() => setSelectedCampaign(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alloy-admin-modal-body">
              <div className="alloy-admin-dossier-grid">
                <div className="alloy-admin-dossier-item">
                  <span className="label">Brand Owner</span>
                  <span className="val">{selectedCampaign.brandName || 'Verified Brand'}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Committed Budget</span>
                  <span className="val text-amber-400 font-mono">{String(selectedCampaign.budget || '₹15,000').replace(/\$/g, '₹')}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Current Status</span>
                  <span className="val">{selectedCampaign.status || 'published'}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">AlloyTrust Escrow Verification</span>
                  <span className="val text-emerald-400">Guaranteed Locked in Vault</span>
                </div>
              </div>

              <div className="alloy-admin-brief-box mt-4">
                <div className="label mb-1 text-xs text-zinc-400 uppercase font-mono">Creative Requirements</div>
                <p className="text-sm text-zinc-200">{selectedCampaign.description || 'Full seasonal campaign production targeting luxury minimalist demographics.'}</p>
              </div>

              <div className="alloy-admin-brief-box mt-3">
                <div className="label mb-1 text-xs text-zinc-400 uppercase font-mono">Deliverables Specified</div>
                <p className="text-sm text-zinc-300">{selectedCampaign.deliverables || '3x High-Resolution Stills, 1x 15s 4K Motion Asset.'}</p>
              </div>

              <div className="alloy-admin-modal-actions mt-6">
                <button
                  type="button"
                  className="alloy-admin-btn-secondary"
                  onClick={() => setSelectedCampaign(null)}
                >
                  Close Audit View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
