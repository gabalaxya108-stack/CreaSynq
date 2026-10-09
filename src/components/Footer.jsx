// src/components/Footer.jsx
// Minimal ALLOY Footer
// Contains: ALLOY logo, product description, Discover, For Brands, For Creators, How it works, Privacy, Terms, Copyright.

import React, { useState } from 'react';

export default function Footer({ 
  onNavigate, 
  onEnterBrandStudio, 
  onEnterCreatorStudio 
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
          <div className="alloy-footer-logo-row">
            <span className="logo-dot alloy-dot" />
            <span className="logo-wordmark alloy-wordmark">ALLOY</span>
          </div>
          <p className="alloy-footer-tagline">
            An AI-native creative marketplace connecting brands and creative agencies with exceptional AI content creators.
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
                Discover
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => {
                  if (onEnterBrandStudio) onEnterBrandStudio();
                  else scrollTo('for-brands');
                }}
              >
                For Brands
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => {
                  if (onEnterCreatorStudio) onEnterCreatorStudio();
                  else scrollTo('for-creators');
                }}
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
                How it works
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => setLegalModalText({
                  title: 'Privacy Policy',
                  body: 'ALLOY protects your privacy and proprietary creative concepts. Portfolio assets are shared only with explicit creator consent.'
                })}
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button 
                type="button" 
                className="alloy-footer-link"
                onClick={() => setLegalModalText({
                  title: 'Terms of Service',
                  body: 'Commissioned work licenses, deliverables, and commercial usage rights adhere to standard creative production agreements.'
                })}
              >
                Terms
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom Copyright */}
        <div className="alloy-footer-bottom">
          <span className="alloy-copyright-text">
            © {new Date().getFullYear()} ALLOY Technologies Inc. All rights reserved.
          </span>
        </div>

      </div>

      {/* Legal Dialog */}
      {legalModalText && (
        <div className="modal-backdrop" onClick={() => setLegalModalText(null)}>
          <div className="modal-container-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-simple">
              <h3>{legalModalText.title}</h3>
              <button 
                type="button" 
                className="btn-icon" 
                onClick={() => setLegalModalText(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{legalModalText.body}</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
