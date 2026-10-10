// src/components/Header.jsx
// ALLOY — Clean Editorial Navigation Bar
// Minimal, elevated, typography-first header with responsive drawer

import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

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
        
        {/* Brand Wordmark */}
        <a 
          href="#home" 
          className="logo-link alloy-logo-link"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick(() => onNavigate('home'));
          }}
          aria-label="Alloy Home"
        >
          <span className="alloy-wordmark font-editorial">Alloy</span>
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
              onClick={() => handleLinkClick(() => scrollToSection('how-it-works'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => scrollToSection('how-it-works'))}
            >
              How It Works
            </li>
            <li 
              className="nav-item"
              onClick={() => handleLinkClick(() => onNavigate('discover'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(() => onNavigate('discover'))}
            >
              Explore
            </li>
          </ul>
        </nav>

        {/* Right Nav: Actions */}
        <div className="nav-actions">
          <button 
            type="button" 
            className="btn-link-login"
            onClick={onOpenLogin}
            aria-label="Log in"
          >
            <span>Log in</span>
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary btn-sm alloy-nav-btn"
            onClick={onOpenRoleSelect}
            aria-label="Get started"
          >
            <span>Get Started</span>
            <ArrowRight size={13} />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <ul className="mobile-nav-links">
            <li onClick={() => handleLinkClick(() => onNavigate('discover'))}>
              <span>Creators</span>
            </li>
            <li onClick={() => handleLinkClick(() => scrollToSection('for-brands'))}>
              <span>For Brands</span>
            </li>
            <li onClick={() => handleLinkClick(() => scrollToSection('how-it-works'))}>
              <span>How It Works</span>
            </li>
            <li onClick={() => handleLinkClick(() => onNavigate('discover'))}>
              <span>Explore</span>
            </li>
          </ul>

          <div className="mobile-drawer-footer">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => handleLinkClick(onOpenLogin)}
            >
              <span>Log in</span>
            </button>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => handleLinkClick(onOpenRoleSelect)}
            >
              <span>Get Started</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
