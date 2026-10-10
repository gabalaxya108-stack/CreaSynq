// src/components/admin/AdminOverview.jsx
// ALLOY Super Admin — Platform Overview & Executive KPIs

import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { getRiskBadgeColor } from '../../services/alloyTrustEngine';

export default function AdminOverview({
  metrics,
  trustReports = [],
  onNavigateTab,
  onRunScan
}) {
  const m = metrics || {};

  // Compute risk distributions
  const criticalCount = trustReports.filter(r => r.risk_category === 'critical' || r.risk_score >= 85).length;
  const highCount = trustReports.filter(r => r.risk_category === 'high' || (r.risk_score >= 60 && r.risk_score < 85)).length;
  const moderateCount = trustReports.filter(r => r.risk_category === 'moderate' || (r.risk_score >= 30 && r.risk_score < 60)).length;
  const lowCount = trustReports.filter(r => r.risk_category === 'low' || r.risk_score < 30).length;

  return (
    <div className="alloy-admin-overview-view">
      {/* Top Banner Notice */}
      <div className="alloy-admin-hero-banner">
        <div className="alloy-admin-hero-content">
          <div className="alloy-admin-hero-badge">
            <Sparkles size={14} />
            <span>EXECUTIVE COMMAND SYSTEM</span>
          </div>
          <h1 className="alloy-admin-hero-title">Platform Intelligence & Safety Command</h1>
          <p className="alloy-admin-hero-sub">
            Monitoring active brand sponsorships, creator escrow, deliverable contracts, and AlloyTrust safety signals across ALLOY.
          </p>
        </div>
        <div className="alloy-admin-hero-actions">
          <button
            type="button"
            className="alloy-admin-btn-primary"
            onClick={() => onNavigateTab('alloy-trust')}
          >
            <ShieldAlert size={16} />
            <span>AlloyTrust Command Center</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="alloy-admin-kpi-grid">
        {/* Metric 1: Brands */}
        <div className="alloy-admin-kpi-card">
          <div className="alloy-admin-kpi-header">
            <span className="alloy-admin-kpi-title">Verified Brands</span>
            <div className="alloy-admin-kpi-icon brand">
              <Building2 size={18} />
            </div>
          </div>
          <div className="alloy-admin-kpi-value">{m.totalBrands ?? 0}</div>
          <div className="alloy-admin-kpi-meta positive">
            <TrendingUp size={14} />
            <span>Active Enterprise & Atelier Tiers</span>
          </div>
        </div>

        {/* Metric 2: Creators */}
        <div className="alloy-admin-kpi-card">
          <div className="alloy-admin-kpi-header">
            <span className="alloy-admin-kpi-title">Creator Network</span>
            <div className="alloy-admin-kpi-icon creator">
              <Users size={18} />
            </div>
          </div>
          <div className="alloy-admin-kpi-value">{m.totalCreators ?? 0}</div>
          <div className="alloy-admin-kpi-meta positive">
            <CheckCircle size={14} />
            <span>100% Portfolio DNA Verified</span>
          </div>
        </div>

        {/* Metric 3: Active Campaigns & Volume */}
        <div className="alloy-admin-kpi-card">
          <div className="alloy-admin-kpi-header">
            <span className="alloy-admin-kpi-title">Escrow Capital In Flight</span>
            <div className="alloy-admin-kpi-icon escrow">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="alloy-admin-kpi-value">
            ₹{((m.totalEscrowVolume || 0)).toLocaleString()}
          </div>
          <div className="alloy-admin-kpi-meta neutral">
            <span>{m.totalCampaigns ?? 0} Active Briefs & Allocations</span>
          </div>
        </div>

        {/* Metric 4: Trust Queue */}
        <div className="alloy-admin-kpi-card urgent">
          <div className="alloy-admin-kpi-header">
            <span className="alloy-admin-kpi-title">AlloyTrust Attention Queue</span>
            <div className="alloy-admin-kpi-icon trust">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="alloy-admin-kpi-value">
            {m.reportsAwaitingReview ?? trustReports.filter(r => r.status === 'needs_review' || r.status === 'under_investigation').length}
          </div>
          <div className="alloy-admin-kpi-meta warning">
            <AlertTriangle size={14} />
            <span>{criticalCount} Critical • {highCount} High Priority</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Risk Health Distribution & Immediate Attention Items */}
      <div className="alloy-admin-two-col">
        {/* Left: Risk Health Breakdown */}
        <div className="alloy-admin-panel">
          <div className="alloy-admin-panel-header">
            <div>
              <h2 className="alloy-admin-panel-title">AlloyTrust Risk Distribution</h2>
              <p className="alloy-admin-panel-sub">Continuous heuristic & AI risk stratification</p>
            </div>
            <button
              type="button"
              className="alloy-admin-text-link"
              onClick={() => onNavigateTab('alloy-trust')}
            >
              View Full Feed
            </button>
          </div>

          <div className="alloy-admin-risk-bars">
            {/* Critical */}
            <div className="alloy-admin-risk-row">
              <div className="alloy-admin-risk-info">
                <span className="alloy-admin-risk-label critical">Critical (85-100)</span>
                <span className="alloy-admin-risk-count">{criticalCount} Entities</span>
              </div>
              <div className="alloy-admin-bar-track">
                <div 
                  className="alloy-admin-bar-fill critical" 
                  style={{ width: `${Math.max(8, (criticalCount / (trustReports.length || 1)) * 100)}%` }} 
                />
              </div>
              <span className="alloy-admin-risk-desc">Immediate freeze & manual super admin review</span>
            </div>

            {/* High */}
            <div className="alloy-admin-risk-row">
              <div className="alloy-admin-risk-info">
                <span className="alloy-admin-risk-label high">High (60-84)</span>
                <span className="alloy-admin-risk-count">{highCount} Entities</span>
              </div>
              <div className="alloy-admin-bar-track">
                <div 
                  className="alloy-admin-bar-fill high" 
                  style={{ width: `${Math.max(12, (highCount / (trustReports.length || 1)) * 100)}%` }} 
                />
              </div>
              <span className="alloy-admin-risk-desc">Escrow milestone verification required</span>
            </div>

            {/* Moderate */}
            <div className="alloy-admin-risk-row">
              <div className="alloy-admin-risk-info">
                <span className="alloy-admin-risk-label moderate">Moderate (30-59)</span>
                <span className="alloy-admin-risk-count">{moderateCount} Entities</span>
              </div>
              <div className="alloy-admin-bar-track">
                <div 
                  className="alloy-admin-bar-fill moderate" 
                  style={{ width: `${Math.max(16, (moderateCount / (trustReports.length || 1)) * 100)}%` }} 
                />
              </div>
              <span className="alloy-admin-risk-desc">Velocity monitoring and profile integrity scan</span>
            </div>

            {/* Low */}
            <div className="alloy-admin-risk-row">
              <div className="alloy-admin-risk-info">
                <span className="alloy-admin-risk-label low">Low (0-29)</span>
                <span className="alloy-admin-risk-count">{lowCount} Entities</span>
              </div>
              <div className="alloy-admin-bar-track">
                <div 
                  className="alloy-admin-bar-fill low" 
                  style={{ width: `${Math.max(25, (lowCount / (trustReports.length || 1)) * 100)}%` }} 
                />
              </div>
              <span className="alloy-admin-risk-desc">Standard operations, clean compliance state</span>
            </div>
          </div>
        </div>

        {/* Right: Urgent Review Feed */}
        <div className="alloy-admin-panel">
          <div className="alloy-admin-panel-header">
            <div>
              <h2 className="alloy-admin-panel-title">Urgent Review Queue</h2>
              <p className="alloy-admin-panel-sub">Highest risk flags requiring executive action</p>
            </div>
            <button
              type="button"
              className="alloy-admin-btn-secondary-sm"
              onClick={onRunScan}
            >
              <Sparkles size={13} />
              <span>Trigger Scan</span>
            </button>
          </div>

          <div className="alloy-admin-urgent-list">
            {trustReports.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--admin-text-secondary)', fontSize: '13px' }}>
                <CheckCircle size={28} style={{ margin: '0 auto 10px', display: 'block', color: '#16a34a' }} />
                <span style={{ fontWeight: 600, display: 'block', color: 'var(--admin-text-primary)' }}>No active incidents</span>
                <span>No trust reports currently recorded in database. System standing is clean.</span>
              </div>
            ) : (
              trustReports.slice(0, 3).map((report) => {
                const badgeStyle = getRiskBadgeColor(report.risk_category);
                return (
                  <div key={report.id} className="alloy-admin-urgent-item">
                    <div className="alloy-admin-urgent-top">
                      <span 
                        className="alloy-admin-badge"
                        style={{ 
                          backgroundColor: badgeStyle.bg, 
                          color: badgeStyle.text, 
                          borderColor: badgeStyle.border 
                        }}
                      >
                        {report.risk_category?.toUpperCase()} • {report.risk_score}/100
                      </span>
                      <span className="alloy-admin-urgent-time">
                        <Clock size={12} />
                        <span>{report.entity_type?.toUpperCase()}</span>
                      </span>
                    </div>
                    <h4 className="alloy-admin-urgent-entity">{report.entity_name}</h4>
                    <p className="alloy-admin-urgent-summary">{report.summary}</p>
                    <div className="alloy-admin-urgent-footer">
                      <span className="alloy-admin-urgent-id">{report.id}</span>
                      <button
                        type="button"
                        className="alloy-admin-btn-action-sm"
                        onClick={() => onNavigateTab('alloy-trust')}
                      >
                        <span>Take Action</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
