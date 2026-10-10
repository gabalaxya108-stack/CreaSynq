// src/components/Footer.jsx
// Minimal Editorial Alloy Footer
// Functional links to Discover Creators, For Brands, For Creators, How It Works, Log in

import React, { useState } from 'react';

export default function Footer({ 
  onNavigate, 
  onEnterBrandStudio, 
  onEnterCreatorStudio,
  onOpenLogin
}) {
  const [legalModalText, setLegalModalText] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (onNavigate) onNavigate('home');
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  return (
    <footer className="alloy-footer">
      <div className="page-container alloy-footer-container">
        
        {/* Brand & Description */}
        <div className="alloy-footer-brand">
          <a 
            href="#home" 
            className="alloy-footer-wordmark font-editorial"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Alloy
          </a>
          <p className="alloy-footer-tagline">
            The AI-native creative marketplace connecting brands with exceptional AI creators who turn ideas into extraordinary campaigns.
          </p>
        </div>

        {/* Links Navigation */}
        <nav className="alloy-footer-nav" aria-label="Footer Navigation">
          <ul className="alloy-footer-links">
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => onNavigate && onNavigate('discover')}
              >
                Discover Creators
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => scrollTo('for-brands')}
              >
                For Brands
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => scrollTo('for-creators')}
              >
                For Creators
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => scrollTo('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                }}
              >
                Log In
              </button>
            </li>
          </ul>
        </nav>

        {/* Legal & Copyright */}
        <div className="alloy-footer-bottom">
          <p className="alloy-copyright-text">
            © {new Date().getFullYear()} Alloy Marketplace Inc. All rights reserved.
          </p>
          <div className="alloy-legal-links">
            <button
              type="button"
              className="legal-link-btn"
              onClick={() => setLegalModalText({
                title: 'Privacy Policy',
                body: 'Alloy protects your privacy and creative intellectual property. All creator portfolios and brand campaign data are strictly isolated and secured.'
              })}
            >
              Privacy Policy
            </button>
            <span className="legal-dot">•</span>
            <button
              type="button"
              className="legal-link-btn"
              onClick={() => setLegalModalText({
                title: 'Terms of Service',
                body: 'Use of the Alloy marketplace is subject to our standard commercial terms for AI creator commissions and collaboration agreements.'
              })}
            >
              Terms of Service
            </button>
          </div>
        </div>

      </div>

      {/* Informative Legal Modal */}
      {legalModalText && (
        <div className="legal-modal-backdrop" onClick={() => setLegalModalText(null)}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="legal-modal-title font-editorial">{legalModalText.title}</h3>
            <p className="legal-modal-body">{legalModalText.body}</p>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setLegalModalText(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
