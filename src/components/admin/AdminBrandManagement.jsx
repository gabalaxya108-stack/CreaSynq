// src/components/admin/AdminBrandManagement.jsx
// ALLOY Super Admin — Brand Directory & Integrity Management

import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Filter,
  X
} from 'lucide-react';

export default function AdminBrandManagement({
  brands = [],
  onUpdateBrandStatus,
  onInspectTrustReport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Filtered brands
  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = 
      (brand.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (brand.status || 'verified') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="alloy-admin-section">
      {/* Header & Controls */}
      <div className="alloy-admin-section-header">
        <div>
          <h2 className="alloy-admin-section-title">Brand Registry</h2>
          <p className="alloy-admin-section-sub">
            Verified corporate sponsors, atelier accounts, and enterprise tier oversight.
          </p>
        </div>
        <div className="alloy-admin-counter-pill">
          <span>{filteredBrands.length} Brands Listed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="alloy-admin-filter-bar">
        <div className="alloy-admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search brands by name, industry, or region..."
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
            <option value="verified">Verified Active</option>
            <option value="restricted">Restricted / Suspended</option>
            <option value="pending">Pending Validation</option>
          </select>
        </div>
      </div>

      {/* Brands Table */}
      <div className="alloy-admin-table-container">
        <table className="alloy-admin-table">
          <thead>
            <tr>
              <th>Brand Entity</th>
              <th>Sector & Industry</th>
              <th>Origin</th>
              <th>Status</th>
              <th>Official Website</th>
              <th className="text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.length === 0 ? (
              <tr>
                <td colSpan="6" className="alloy-admin-empty-cell">
                  No brand records match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredBrands.map((brand) => {
                const isRestricted = brand.status === 'restricted';
                return (
                  <tr key={brand.id}>
                    <td>
                      <div className="alloy-admin-entity-cell">
                        <div className="alloy-admin-brand-thumb">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="alloy-admin-entity-name">{brand.name}</div>
                          <div className="alloy-admin-entity-id">{brand.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{brand.industry || 'Luxury Goods'}</td>
                    <td>{brand.location || 'Global'}</td>
                    <td>
                      <span className={`alloy-admin-status-badge ${isRestricted ? 'restricted' : 'verified'}`}>
                        {isRestricted ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                        <span>{isRestricted ? 'Restricted' : 'Verified'}</span>
                      </span>
                    </td>
                    <td>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="alloy-admin-link-external"
                        >
                          <span>{brand.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="alloy-admin-action-row">
                        <button
                          type="button"
                          className="alloy-admin-btn-table"
                          onClick={() => setSelectedBrand(brand)}
                          title="Inspect Brand Dossier"
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>
                        {isRestricted ? (
                          <button
                            type="button"
                            className="alloy-admin-btn-table success"
                            onClick={() => onUpdateBrandStatus?.(brand.id, 'verified')}
                          >
                            <ShieldCheck size={14} />
                            <span>Reinstate</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="alloy-admin-btn-table danger"
                            onClick={() => onUpdateBrandStatus?.(brand.id, 'restricted')}
                          >
                            <ShieldAlert size={14} />
                            <span>Suspend</span>
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

      {/* Brand Inspection Drawer / Modal */}
      {selectedBrand && (
        <div className="alloy-modal-backdrop" onClick={() => setSelectedBrand(null)}>
          <div className="alloy-admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="alloy-admin-modal-header">
              <div className="alloy-admin-modal-title-group">
                <Building2 size={20} className="text-amber-400" />
                <h3>Brand Dossier: {selectedBrand.name}</h3>
              </div>
              <button
                type="button"
                className="alloy-modal-close"
                onClick={() => setSelectedBrand(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="alloy-admin-modal-body">
              <div className="alloy-admin-dossier-grid">
                <div className="alloy-admin-dossier-item">
                  <span className="label">Internal ID</span>
                  <span className="val code">{selectedBrand.id}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Industry Sector</span>
                  <span className="val">{selectedBrand.industry || 'Fashion / Luxury'}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Primary Headquarters</span>
                  <span className="val">{selectedBrand.location || 'Undisclosed'}</span>
                </div>
                <div className="alloy-admin-dossier-item">
                  <span className="label">Integrity Status</span>
                  <span className={`val ${selectedBrand.status === 'restricted' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedBrand.status || 'verified'}
                  </span>
                </div>
              </div>

              <div className="alloy-admin-modal-actions">
                {selectedBrand.status === 'restricted' ? (
                  <button
                    type="button"
                    className="alloy-admin-btn-primary"
                    onClick={() => {
                      onUpdateBrandStatus?.(selectedBrand.id, 'verified');
                      setSelectedBrand(prev => ({ ...prev, status: 'verified' }));
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Reinstate Full Brand Privileges</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="alloy-admin-btn-danger"
                    onClick={() => {
                      onUpdateBrandStatus?.(selectedBrand.id, 'restricted');
                      setSelectedBrand(prev => ({ ...prev, status: 'restricted' }));
                    }}
                  >
                    <ShieldAlert size={16} />
                    <span>Impose Operational Restriction</span>
                  </button>
                )}
                <button
                  type="button"
                  className="alloy-admin-btn-secondary"
                  onClick={() => setSelectedBrand(null)}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
