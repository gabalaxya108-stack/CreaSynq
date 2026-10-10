// src/components/admin/AdminSidebar.jsx
// ALLOY Super Admin Navigation Sidebar

import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  Users,
  Briefcase,
  GitPullRequest,
  FileText,
  Sliders,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingReportsCount = 0,
  adminUser,
  onLogout
}) {
  const navItems = [
    { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
    { 
      id: 'alloy-trust', 
      label: 'AlloyTrust Command', 
      icon: ShieldAlert, 
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
      highlight: true
    },
    { id: 'brands', label: 'Brand Registry', icon: Building2 },
    { id: 'creators', label: 'Creator Network', icon: Users },
    { id: 'campaigns', label: 'Campaign Oversight', icon: Briefcase },
    { id: 'collaborations', label: 'Collab Tracking', icon: GitPullRequest },
    { id: 'audit', label: 'Security Audit Log', icon: FileText },
    { id: 'controls', label: 'Platform Controls', icon: Sliders }
  ];

  return (
    <aside className="alloy-admin-sidebar">
      {/* Brand & Emblem */}
      <div className="alloy-admin-sidebar-header">
        <div className="alloy-admin-brand-lockup">
          <img 
            src="/assets/alloy-wordmark.webp" 
            alt="Alloy" 
            className="alloy-admin-sidebar-logo" 
          />
          <span className="alloy-admin-brand-badge">SUPER ADMIN</span>
        </div>
        <div className="alloy-admin-system-pulse">
          <span className="alloy-admin-pulse-dot" />
          <span>AlloyTrust Engine Active</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="alloy-admin-nav">
        <div className="alloy-admin-nav-group-title">COMMAND & CONTROL</div>
        <ul className="alloy-admin-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`alloy-admin-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-item' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                >
                  <Icon size={18} className="alloy-admin-nav-icon" />
                  <span className="alloy-admin-nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="alloy-admin-nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="alloy-admin-sidebar-footer">
        <div className="alloy-admin-profile-card">
          <div className="alloy-admin-avatar">
            <span>{adminUser?.email?.[0]?.toUpperCase() || 'A'}</span>
          </div>
          <div className="alloy-admin-profile-info">
            <span className="alloy-admin-profile-name">
              {adminUser?.display_name || adminUser?.email?.split('@')[0] || 'Super Administrator'}
            </span>
            <span className="alloy-admin-profile-role">Master Privileges</span>
          </div>
        </div>

        <div className="alloy-admin-footer-actions">
          <button
            type="button"
            className="alloy-admin-footer-btn"
            onClick={() => { window.location.hash = ''; }}
            title="Return to Public Marketplace"
          >
            <ExternalLink size={15} />
            <span>Marketplace</span>
          </button>

          <button
            type="button"
            className="alloy-admin-footer-btn logout"
            onClick={onLogout}
            title="Terminate Super Admin Session"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
