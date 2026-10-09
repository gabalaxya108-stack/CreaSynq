import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, UserCheck, Sparkles, LogIn, LogOut, User, Briefcase, Palette, ChevronRight } from 'lucide-react';

export default function Header({ 
  currentView, 
  onNavigate, 
  onOpenCampaignModal, 
  onOpenCreatorModal,
  onOpenRoleSelect,
  onOpenLogin,
  onOpenForBrandsModal,
  onOpenForCreatorsModal,
  activeCampaign,
  createdCreatorProfile,
  currentUser = null,
  onLogout = null
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (action) => {
    setMobileMenuOpen(false);
    if (typeof action === 'function') {
      action();
    }
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract user details defensively
  const displayName = currentUser?.user_metadata?.full_name 
    || currentUser?.user_metadata?.name 
    || currentUser?.profile?.display_name 
    || currentUser?.display_name 
    || currentUser?.email?.split('@')[0] 
    || 'User';

  const avatarUrl = currentUser?.user_metadata?.avatar_url 
    || currentUser?.profile?.avatar_url 
    || currentUser?.avatar_url 
    || '';

  const rawRole = currentUser?.profile?.role 
    || currentUser?.user_metadata?.intended_role 
    || (currentUser?.role && currentUser.role !== 'authenticated' ? currentUser.role : null)
    || (typeof window !== 'undefined' ? localStorage.getItem('creasync_active_role') : null);

  const activeRole = (rawRole === 'creator' || rawRole === 'brand') ? rawRole : null;

  const handleGoToWorkspace = () => {
    if (activeRole === 'creator') {
      onNavigate('creator-workspace');
    } else if (activeRole === 'brand') {
      onNavigate('brand-workspace');
    } else if (typeof onOpenRoleSelect === 'function') {
      onOpenRoleSelect();
    } else {
      onNavigate('home');
    }
  };

  return (
    <header className={`header-nav ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Brand Logo / Wordmark */}
        <a 
          href="#home" 
          className="logo-link alloy-logo-link"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick(() => onNavigate('home'));
          }}
          aria-label="ALLOY Home"
        >
          <span className="logo-wordmark alloy-wordmark">A L L O Y</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links">
            <li 
              className={`nav-item ${currentView === 'discover' ? 'active' : ''}`}
              onClick={() => handleLinkClick(() => onNavigate('discover'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => onNavigate('discover'))}
            >
              Discover
            </li>
            <li 
              className="nav-item"
              onClick={() => handleLinkClick(() => onNavigate('discover'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => onNavigate('discover'))}
            >
              Creators
            </li>
            <li 
              className="nav-item"
              onClick={() => handleLinkClick(() => scrollToSection('for-brands'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => scrollToSection('for-brands'))}
            >
              For Brands
            </li>
            <li 
              className="nav-item"
              onClick={() => handleLinkClick(() => scrollToSection('for-creators'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => scrollToSection('for-creators'))}
            >
              For Creators
            </li>
            <li 
              className="nav-item"
              onClick={() => handleLinkClick(() => scrollToSection('how-it-works'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => scrollToSection('how-it-works'))}
            >
              How it works
            </li>
          </ul>
        </nav>

        {/* Right CTA Actions */}
        <div className="nav-actions">
          {currentUser ? (
            <div className="header-auth-group">
              {/* User Identity Pill / Workspace Link */}
              <button
                type="button"
                onClick={handleGoToWorkspace}
                className="header-user-pill"
                title={`Enter ${activeRole === 'creator' ? 'Creator' : 'Brand'} Workspace`}
                id="header-user-profile-pill"
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                  />
                ) : (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: activeRole === 'creator' ? 'var(--accent-lavender, #EAE6F8)' : 'var(--accent-peach, #FDE8DC)',
                    color: activeRole === 'creator' ? 'var(--accent-lavender-deep, #6D28D9)' : 'var(--accent-peach-deep, #C2410C)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="header-user-name">
                  {displayName}
                </span>
              </button>

              {/* Workspace Action Button */}
              <button 
                type="button" 
                className="header-workspace-btn"
                onClick={handleGoToWorkspace}
                aria-label="Open Workspace"
                id="header-workspace-btn"
              >
                <span>{activeRole === 'creator' ? 'Creator Studio' : activeRole === 'brand' ? 'Brand Studio' : 'Workspace'}</span>
                <ArrowRight size={13} />
              </button>

              {/* Clearly Visible Log Out Button */}
              <button
                type="button"
                id="header-logout-btn"
                className="header-logout-btn"
                onClick={onLogout}
                aria-label="Log Out"
                title="Log Out of CreaSync"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="header-anon-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-link-login"
                onClick={onOpenLogin}
                aria-label="Log in"
                id="header-login-btn"
              >
                <span>Log in</span>
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm alloy-nav-btn"
                onClick={onOpenRoleSelect}
                aria-label="Get started"
                id="header-get-started-btn"
              >
                <span>Get started</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="logo-wordmark alloy-wordmark">ALLOY</span>
              <button 
                type="button" 
                className="btn-icon" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            
            <ul className="mobile-nav-list">
              <li>
                <button 
                  type="button" 
                  className={`mobile-nav-link ${currentView === 'home' ? 'active' : ''}`}
                  onClick={() => handleLinkClick(() => onNavigate('home'))}
                >
                  <span>Home</span>
                  <ChevronRight size={16} />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`mobile-nav-link ${currentView === 'discover' ? 'active' : ''}`}
                  onClick={() => handleLinkClick(() => onNavigate('discover'))}
                >
                  <span>Discover Creators</span>
                  <ChevronRight size={16} />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className="mobile-nav-link"
                  onClick={() => handleLinkClick(() => scrollToSection('for-brands'))}
                >
                  <span>For Brands</span>
                  <ChevronRight size={16} />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className="mobile-nav-link"
                  onClick={() => handleLinkClick(() => scrollToSection('for-creators'))}
                >
                  <span>For Creators</span>
                  <ChevronRight size={16} />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className="mobile-nav-link"
                  onClick={() => handleLinkClick(() => scrollToSection('how-it-works'))}
                >
                  <span>How It Works</span>
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>

            <div className="mobile-drawer-actions">
              {currentUser ? (
                <>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary, #F3EFEA)',
                    border: '1px solid var(--border-light, rgba(26, 25, 24, 0.08))',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: activeRole === 'creator' ? 'var(--accent-lavender, #EAE6F8)' : 'var(--accent-peach, #FDE8DC)',
                        color: activeRole === 'creator' ? 'var(--accent-lavender-deep, #6D28D9)' : 'var(--accent-peach-deep, #C2410C)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#252525', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-block"
                    onClick={() => handleLinkClick(handleGoToWorkspace)}
                  >
                    <span>{activeRole === 'creator' ? 'Enter Creator Studio' : activeRole === 'brand' ? 'Enter Brand Studio' : 'Enter Workspace'}</span>
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-block"
                    onClick={() => handleLinkClick(onLogout)}
                    style={{
                      height: '42px',
                      background: '#ffffff',
                      border: '1px solid rgba(220, 38, 38, 0.32)',
                      color: '#b91c1c',
                      fontWeight: 600,
                      gap: '8px'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-block"
                    onClick={() => handleLinkClick(onOpenLogin)}
                  >
                    <LogIn size={16} />
                    <span>Log In</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-block"
                    onClick={() => handleLinkClick(onOpenRoleSelect)}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
