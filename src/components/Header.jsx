import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, UserCheck, Sparkles, LogIn, ChevronRight } from 'lucide-react';

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
  createdCreatorProfile 
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

  return (
    <header className={`header-nav ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Brand Logo / Wordmark */}
        <a 
          href="#home" 
          className="logo-link"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick(() => onNavigate('home'));
          }}
          aria-label="CreaSync Home"
        >
          <span className="logo-dot" />
          <span className="logo-wordmark">CREASYNC</span>
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
              How It Works
            </li>
            {currentView !== 'home' && (
              <li 
                className="nav-item nav-item-muted"
                onClick={() => handleLinkClick(() => onNavigate('home'))}
                role="button"
                tabIndex={0}
              >
                Overview
              </li>
            )}
          </ul>
        </nav>

        {/* Right CTA Actions */}
        <div className="nav-actions">
          <button 
            type="button" 
            className="btn btn-ghost btn-sm"
            onClick={onOpenLogin}
            aria-label="Log In"
          >
            <span>Log In</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={onOpenRoleSelect}
            aria-label="Get Started"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>

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
              <span className="logo-wordmark">CREASYNC</span>
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
              <li>
                <button 
                  type="button" 
                  className="mobile-nav-link"
                  onClick={() => handleLinkClick(() => scrollToSection('creative-connection'))}
                >
                  <span>Platform Differentiators</span>
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>

            <div className="mobile-drawer-actions">
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
