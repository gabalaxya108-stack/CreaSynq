// src/components/Hero.jsx
// ALLOY — Redesigned Editorial Hero Section with Original Campaign Artwork
// Incorporates the newly generated original Alloy campaign masterpiece:
// - Left: Eyebrow pill, editorial serif headline, refined copy, dual CTAs, verified stats
// - Right: Prominent, high-resolution editorial campaign image with subtle depth

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero({ 
  onFindCreator, 
  onJoinCreator, 
  onExploreWork,
  onSelectCreator
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="alloy-editorial-hero" id="home">
      <div className="page-container-wide alloy-editorial-container">
        
        {/* ============================================================
            LEFT COLUMN: Editorial Typography, Actions & Traction Stats
            ============================================================ */}
        <div className="alloy-hero-left">
          
          {/* Eyebrow Pill */}
          <div className="hero-eyebrow-pill">
            <span className="hero-eyebrow-dot" />
            <span>THE AI CREATOR MARKETPLACE</span>
          </div>

          {/* Master Headline */}
          <h1 className="hero-title-editorial font-editorial">
            Different minds.<br />
            <span className="title-accent-vision">
              One vision.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="hero-desc-editorial">
            Discover AI creators, explore distinctive creative work, and connect with the right talent to bring your next campaign to life.
          </p>

          {/* Dual Primary / Secondary CTAs */}
          <div className="hero-editorial-actions">
            <button 
              type="button" 
              className="btn-hire-creator"
              onClick={onExploreWork || onFindCreator}
              id="hero-explore-creators-btn"
            >
              <span>Explore Creators</span>
              <ArrowRight size={14} />
            </button>

            <button 
              type="button" 
              className="btn-become-creator"
              onClick={onJoinCreator}
              id="hero-become-creator-btn"
            >
              <span>I'm a Creator</span>
            </button>
          </div>

          {/* Verified Traction Stats Strip */}
          <div className="hero-stats-strip">
            <div className="stat-unit">
              <span className="stat-digits font-editorial">14<span className="stat-plus">+</span></span>
              <span className="stat-caption">VERIFIED CREATORS</span>
            </div>

            <div className="stat-separator" />

            <div className="stat-unit">
              <span className="stat-digits font-editorial">48<span className="stat-plus">+</span></span>
              <span className="stat-caption">PUBLISHED WORKS</span>
            </div>

            <div className="stat-separator" />

            <div className="stat-unit">
              <span className="stat-digits font-editorial">6<span className="stat-plus">+</span></span>
              <span className="stat-caption">DISCIPLINES</span>
            </div>
          </div>

        </div>

        {/* ============================================================
            RIGHT COLUMN: The Original Editorial Campaign Centerpiece
            ============================================================ */}
        <div className="alloy-hero-right">
          <div className={`hero-artwork-frame ${imageLoaded ? 'artwork-loaded' : ''}`}>
            
            <img 
              src="/assets/alloy-creative-hero.webp" 
              alt="Alloy Editorial Creative Campaign Composition — Haute couture, beauty, spatial CGI, and architectural artwork" 
              className="hero-campaign-artwork"
              onLoad={() => setImageLoaded(true)}
              loading="eager"
            />

            {/* Subtle Editorial Caption Badge */}
            <div className="artwork-editorial-badge">
              <Sparkles size={12} className="badge-sparkle-icon" />
              <span>Curated Creative Direction • 2026 Collection</span>
            </div>

          </div>
        </div>

      </div>

      {/* Subtle Scroll Indicator */}
      <div 
        className="hero-scroll-indicator"
        onClick={() => {
          const el = document.getElementById('how-it-works') || document.querySelector('main > section:nth-of-type(2)');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="Scroll to explore"
      >
        <div className="scroll-arrow-circle">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
        <span className="scroll-caption-text">Scroll to explore</span>
      </div>

    </section>
  );
}
