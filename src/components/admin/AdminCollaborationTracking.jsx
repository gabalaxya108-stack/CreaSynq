// src/components/admin/AdminCollaborationTracking.jsx
// ALLOY Super Admin — Collaboration Tracking & Escrow Milestone Management

import React, { useState } from 'react';
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Eye,
  X,
  MessageSquare
} from 'lucide-react';

export default function AdminCollaborationTracking({
  collaborations = [],
  onInterveneCollab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollab, setSelectedCollab] = useState(null);

  const filteredCollabs = collaborations.filter((collab) => {
    const matchesSearch =
      (collab.campaignTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collab.creatorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collab.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collab.status || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="alloy-admin-section">
      <div className="alloy-admin-section-header">
        <div>
          <h2 className="alloy-admin-section-title">Collaboration & Escrow Tracking</h2>
          <p className="alloy-admin-section-sub">
            Real-time pipeline of active brand-creator contracts, work submission milestones, and dispute mediation.
          </p>
        </div>
        <div className="alloy-admin-counter-pill">
          <span>{filteredCollabs.length} Active Collaborations</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="alloy-admin-filter-bar">
        <div className="alloy-admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search collaborations by brand, creator, or campaign name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collaborations Table */}
      <div className="alloy-admin-table-container">
        <table className="alloy-admin-table">
          <thead>
            <tr>
              <th>Campaign Contract</th>
              <th>Brand Sponsor</th>
              <th>Matched Creator</th>
              <th>Contract Milestone</th>
              <th>Escrow Allocation</th>
              <th className="text-right">Administrative Oversight</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollabs.length === 0 ? (
              <tr>
                <td colSpan="6" className="alloy-admin-empty-cell">
                  No active collaborations matching search criteria.
                </td>
              </tr>
            ) : (
              filteredCollabs.map((collab) => {
                const isDisputed = collab.status === 'revision-requested' || collab.status === 'disputed';
                const isApproved = collab.status === 'approved' || collab.status === 'completed';

                return (
                  <tr key={collab.id}>
                    <td>
                      <div className="alloy-admin-entity-cell">
                        <div className="alloy-admin-brand-thumb collab">
                          <GitPullRequest size={16} />
                        </div>
                        <div>
                          <div className="alloy-admin-entity-name">{collab.campaignTitle || collab.campaign_title || 'Direct Collaboration'}</div>
                          <div className="alloy-admin-entity-id">{collab.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{collab.brandName || collab.brand_name || 'Brand Partner'}</td>
                    <td>
                      <div className="font-medium text-white">{collab.creatorName || collab.creator_name || 'Creator'}</div>
                    </td>
                    <td>
                      <span className={`alloy-admin-collab-badge ${isDisputed ? 'disputed' : isApproved ? 'approved' : 'active'}`}>
                        {isDisputed ? <AlertTriangle size={12} /> : isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{collab.deliverableStatus || collab.status || 'Active'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="alloy-admin-pill-budget">
                        {collab.budget ? String(collab.budget).replace(/\$/g, '₹') : 'Unspecified'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="alloy-admin-action-row">
                        <button
                          type="button"
                          className="alloy-admin-btn-table"
                          onClick={() => setSelectedCollab(collab)}
                        >
                          <Eye size={14} />
                          <span>Track</span>
                        </button>
                        {isDisputed && (
                          <button
                            type="button"
                            className="alloy-admin-btn-table warning"
                            onClick={() => onInterveneCollab?.(collab.id)}
                            title="Open Super Admin Mediation"
                          >
                            <ShieldAlert size={14} />
                            <span>Mediate</span>
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

      {/* Collab Inspection Modal */}
      {selectedCollab && (
        <div className="alloy-modal-backdrop" onClick={() => setSelectedCollab(null)}>
          <div className="alloy-admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="alloy-admin-modal-header">
              <div className="alloy-admin-modal-title-group">
                <GitPullRequest size={20} className="text-amber-400" />
                <h3>Collaboration Audit: {selectedCollab.campaignTitle}</h3>
              </div>
              <button
                type="button"
                className="alloy-modal-close"
                onClick={() => setSelectedCollab(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alloy-admin-modal-body">
              <div className="alloy-admin-dossier-grid">
                <div className="alloy-admin-dossier-item">
                  <span className="label">Brand</span>
                  <span className="val">{selectedCollab.brandName}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Creator</span>
                  <span className="val">{selectedCollab.creatorName}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Escrow Value</span>
                  <span className="val text-amber-400 font-mono">{String(selectedCollab.budget || '₹8,500').replace(/\$/g, '₹')}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Milestone State</span>
                  <span className="val text-emerald-400">{selectedCollab.deliverableStatus || selectedCollab.status}</span>
                </div>
              </div>

              <div className="alloy-admin-brief-box mt-4">
                <div className="label mb-1 text-xs text-zinc-400 uppercase font-mono">Escrow Vault Verification</div>
                <p className="text-sm text-zinc-200">
                  Funds held in smart platform escrow. Payout released automatically upon brand final deliverable sign-off or Super Admin dispute clearance.
                </p>
              </div>

              <div className="alloy-admin-modal-actions mt-6">
                <button
                  type="button"
                  className="alloy-admin-btn-secondary"
                  onClick={() => setSelectedCollab(null)}
                >
                  Close Tracking Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
