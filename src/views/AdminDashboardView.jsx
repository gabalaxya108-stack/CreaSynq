// src/views/AdminDashboardView.jsx
// ALLOY Super Admin — Master Executive Dashboard Container

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import AdminAlloyTrust from '../components/admin/AdminAlloyTrust';
import AdminBrandManagement from '../components/admin/AdminBrandManagement';
import AdminCreatorManagement from '../components/admin/AdminCreatorManagement';
import AdminCampaignManagement from '../components/admin/AdminCampaignManagement';
import AdminCollaborationTracking from '../components/admin/AdminCollaborationTracking';
import AdminAuditLog from '../components/admin/AdminAuditLog';
import AdminPlatformControls from '../components/admin/AdminPlatformControls';

import {
  fetchOverviewMetrics,
  fetchAdminBrands,
  fetchAdminCreators,
  fetchAdminCampaigns,
  fetchAdminCollaborations,
  fetchTrustReports,
  submitTrustDecision,
  fetchAuditLogs,
  fetchPlatformConfig,
  updatePlatformConfig,
  logoutAdmin
} from '../services/adminApi';
import { runAlloyTrustAnalysis } from '../services/alloyTrustEngine';
import { RefreshCw, Bell, Search } from 'lucide-react';

export default function AdminDashboardView({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Core Live Data States
  const [metrics, setMetrics] = useState({});
  const [trustReports, setTrustReports] = useState([]);
  const [brands, setBrands] = useState([]);
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [platformConfig, setPlatformConfig] = useState({});

  const loadAllData = async () => {
    try {
      const [
        metricsRes,
        reportsRes,
        brandsRes,
        creatorsRes,
        campaignsRes,
        collabsRes,
        auditRes,
        configRes
      ] = await Promise.allSettled([
        fetchOverviewMetrics(),
        fetchTrustReports(),
        fetchAdminBrands(),
        fetchAdminCreators(),
        fetchAdminCampaigns(),
        fetchAdminCollaborations(),
        fetchAuditLogs(),
        fetchPlatformConfig()
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value?.metrics) {
        setMetrics(metricsRes.value.metrics);
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value?.reports) {
        setTrustReports(reportsRes.value.reports);
      }
      if (brandsRes.status === 'fulfilled' && brandsRes.value?.brands) {
        setBrands(brandsRes.value.brands);
      }
      if (creatorsRes.status === 'fulfilled' && creatorsRes.value?.creators) {
        setCreators(creatorsRes.value.creators);
      }
      if (campaignsRes.status === 'fulfilled' && campaignsRes.value?.campaigns) {
        setCampaigns(campaignsRes.value.campaigns);
      }
      if (collabsRes.status === 'fulfilled' && collabsRes.value?.collaborations) {
        setCollaborations(collabsRes.value.collaborations);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.logs) {
        setAuditLogs(auditRes.value.logs);
      }
      if (configRes.status === 'fulfilled' && configRes.value?.config) {
        setPlatformConfig(configRes.value.config);
      }

      setLastRefreshed(new Date());
      setLoadError(null);
    } catch (err) {
      console.error('Error loading admin dashboard state:', err);
      setLoadError(err.message || 'Failed to synchronize live records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // Auto-refresh live data every 60 seconds
    const interval = setInterval(() => {
      loadAllData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  // Submit Trust Decision
  const handleSubmitDecision = async (decisionPayload) => {
    await submitTrustDecision(decisionPayload);
    // Refresh reports and audit logs
    const [reportsRes, auditRes] = await Promise.all([
      fetchTrustReports(),
      fetchAuditLogs()
    ]);
    if (reportsRes.reports) setTrustReports(reportsRes.reports);
    if (auditRes.logs) setAuditLogs(auditRes.logs);
  };

  // Run Real-Time Platform Safety Scan
  const handleRunTrustScan = async () => {
    // Run evaluation against an active campaign or brand
    const targetCampaign = campaigns[0] || { id: 'cmp-01', title: 'Seasonal Collection', budget: '₹85,000' };
    const scanResult = await runAlloyTrustAnalysis({
      entityType: 'campaign',
      entityId: targetCampaign.id,
      entityName: targetCampaign.title,
      contentPayload: targetCampaign
    });

    const newReport = {
      id: scanResult.reportId,
      entity_type: scanResult.entityType,
      entity_id: scanResult.entityId,
      entity_name: scanResult.entityName,
      risk_score: scanResult.riskScore,
      risk_category: scanResult.riskCategory,
      status: scanResult.riskScore > 60 ? 'needs_review' : 'cleared',
      summary: scanResult.summary,
      signals: scanResult.signalsTriggered,
      created_at: scanResult.timestamp
    };

    setTrustReports(prev => [newReport, ...prev]);
  };

  // Update Brand Status
  const handleUpdateBrandStatus = (brandId, status) => {
    setBrands(prev => prev.map(b => b.id === brandId ? { ...b, status } : b));
  };

  // Update Creator Status
  const handleUpdateCreatorStatus = (creatorId, status) => {
    setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, status } : c));
  };

  // Update Campaign Status
  const handleUpdateCampaignStatus = (campaignId, status) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status } : c));
  };

  // Save Platform Config
  const handleSaveConfig = async (formData) => {
    for (const [key, val] of Object.entries(formData)) {
      await updatePlatformConfig(key, val, `Updated via Platform Controls`);
    }
    setPlatformConfig(formData);
    const auditRes = await fetchAuditLogs();
    if (auditRes.logs) setAuditLogs(auditRes.logs);
  };

  const handleLogoutAdmin = async () => {
    await logoutAdmin();
    if (onLogout) {
      onLogout();
    } else {
      window.location.hash = '';
    }
  };

  const pendingReportsCount = trustReports.filter(r => r.status === 'needs_review' || r.status === 'under_investigation').length;

  return (
    <div className="alloy-admin-dashboard-container">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingReportsCount={pendingReportsCount}
        adminUser={adminUser}
        onLogout={handleLogoutAdmin}
      />

      {/* Main Workspace Content */}
      <main className="alloy-admin-main-stage">
        {/* Top Header Bar */}
        <header className="alloy-admin-top-nav">
          <div className="alloy-admin-top-left">
            <span className="alloy-admin-breadcrumb-root">ALLOY Console</span>
            <span className="alloy-admin-breadcrumb-sep">/</span>
            <span className="alloy-admin-breadcrumb-active">
              {activeTab === 'overview' && 'Platform Overview'}
              {activeTab === 'alloy-trust' && 'AlloyTrust Command'}
              {activeTab === 'brands' && 'Brand Registry'}
              {activeTab === 'creators' && 'Creator Network'}
              {activeTab === 'campaigns' && 'Campaign Oversight'}
              {activeTab === 'collaborations' && 'Collaboration Tracking'}
              {activeTab === 'audit' && 'Security Audit Log'}
              {activeTab === 'controls' && 'Platform Controls'}
            </span>
          </div>

          <div className="alloy-admin-top-right">
            <button
              type="button"
              className="alloy-admin-icon-btn"
              onClick={handleRefresh}
              title="Refresh Live Data"
              disabled={refreshing}
              id="admin-refresh-btn"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <div className="alloy-admin-status-pill" title="Connected to Supabase project">
              <span className="alloy-admin-status-dot" style={{ backgroundColor: '#10b981' }} />
              <span>Live Supabase • {lastRefreshed ? `Synced ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Connecting...'}</span>
            </div>
          </div>
        </header>

        {loadError && (
          <div className="alloy-admin-alert-banner" style={{ margin: '16px 24px 0' }}>
            <span>{loadError}</span>
          </div>
        )}

        {/* View Section Switcher */}
        <div className="alloy-admin-content-viewport">
          {loading ? (
            <div className="alloy-admin-loading-state">
              <RefreshCw size={24} className="animate-spin text-amber-400" />
              <span>Synchronizing Super Admin Datastore...</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <AdminOverview
                  metrics={metrics}
                  trustReports={trustReports}
                  onNavigateTab={setActiveTab}
                  onRunScan={handleRunTrustScan}
                />
              )}

              {activeTab === 'alloy-trust' && (
                <AdminAlloyTrust
                  reports={trustReports}
                  onSubmitDecision={handleSubmitDecision}
                  onRunTrustScan={handleRunTrustScan}
                />
              )}

              {activeTab === 'brands' && (
                <AdminBrandManagement
                  brands={brands}
                  onUpdateBrandStatus={handleUpdateBrandStatus}
                />
              )}

              {activeTab === 'creators' && (
                <AdminCreatorManagement
                  creators={creators}
                  onUpdateCreatorStatus={handleUpdateCreatorStatus}
                />
              )}

              {activeTab === 'campaigns' && (
                <AdminCampaignManagement
                  campaigns={campaigns}
                  onUpdateCampaignStatus={handleUpdateCampaignStatus}
                />
              )}

              {activeTab === 'collaborations' && (
                <AdminCollaborationTracking
                  collaborations={collaborations}
                  onInterveneCollab={() => setActiveTab('alloy-trust')}
                />
              )}

              {activeTab === 'audit' && (
                <AdminAuditLog
                  auditLogs={auditLogs}
                />
              )}

              {activeTab === 'controls' && (
                <AdminPlatformControls
                  config={platformConfig}
                  onSaveConfig={handleSaveConfig}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
