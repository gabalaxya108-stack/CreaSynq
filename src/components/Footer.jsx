// src/components/Footer.jsx
// SECTION K: Clean Footer
// Required links: Discover, For Brands, For Creators, How It Works, Log In, Sign Up, Privacy, Terms
// Zero dead links.

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer({ 
  onNavigate, 
  onOpenCampaignModal, 
  onOpenCreatorModal,
  onEnterBrandStudio,
  onEnterCreatorStudio,
  onOpenLogin,
  onOpenRoleSelect
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
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-dot" />
              <span className="logo-text">CREASYNC</span>
            </div>
            <p className="footer-tagline">
              “The right creator. The right idea. In sync.”
            </p>
            <p className="footer-desc">
              The AI-native marketplace connecting brands with exceptional AI creators 
              through intelligent discovery, creative previews, and seamless collaboration.
            </p>
          </div>

          {/* Links Grid */}
          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li>
                  <a 
                    href="#discover" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onNavigate) onNavigate('discover'); 
                    }}
                  >
                    Discover
                  </a>
                </li>
                <li>
                  <a 
                    href="#for-brands" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onEnterBrandStudio) onEnterBrandStudio(); 
                    }}
                  >
                    For Brands
                  </a>
                </li>
                <li>
                  <a 
                    href="#for-creators" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onEnterCreatorStudio) onEnterCreatorStudio(); 
                    }}
                  >
                    For Creators
                  </a>
                </li>
                <li>
                  <a 
                    href="#how-it-works" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      scrollTo('how-it-works'); 
                    }}
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Account & Access</h4>
              <ul>
                <li>
                  <button 
                    type="button" 
                    className="footer-link-btn"
                    onClick={() => onOpenLogin && onOpenLogin()}
                  >
                    Log In
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="footer-link-btn"
                    onClick={() => onOpenRoleSelect ? onOpenRoleSelect() : onOpenCreatorModal && onOpenCreatorModal()}
                  >
                    Sign Up
                  </button>
                </li>
                <li>
                  <a 
                    href="#explore-work" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      scrollTo('explore-work'); 
                    }}
                  >
                    Portfolio Showcase
                  </a>
                </li>
                <li>
                  <a 
                    href="#creative-concepts" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      scrollTo('interactive-preview'); 
                    }}
                  >
                    CreaSim Concepts
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Governance</h4>
              <ul>
                <li>
                  <button 
                    type="button" 
                    className="footer-link-btn"
                    onClick={() => setLegalModalText({
                      title: "Privacy Policy",
                      content: "CreaSync prioritizes creator intellectual property and client privacy. Portfolio works and campaign briefs remain protected with encrypted storage, zero unapproved model scraping, and transparent attribution standards."
                    })}
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="footer-link-btn"
                    onClick={() => setLegalModalText({
                      title: "Terms of Service",
                      content: "All collaborations conducted through CreaSync are governed by mutual non-disclosure and commercial usage agreements. Creator portfolios are verified, and AI simulations are explicitly disclaimed as conceptual directions."
                    })}
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} CreaSync. The right creator. The right idea. In sync.
          </div>
          <div className="footer-meta-tags">
            <span className="footer-meta-pill">AI-Native Creative Standard</span>
            <span className="footer-meta-pill">Warm Cream & Charcoal Palette</span>
          </div>
        </div>

        {/* Legal Modal if opened */}
        {legalModalText && (
          <div className="modal-overlay" onClick={() => setLegalModalText(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '28px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{legalModalText.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', fontSize: '0.95rem' }}>{legalModalText.content}</p>
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
      </div>
    </footer>
  );
}
