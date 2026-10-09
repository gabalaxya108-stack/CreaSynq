// src/components/Hero.jsx
// ALLOY — Exact Reference Recreation with Continuous Revolving Motion
// Recreating the exact visual composition:
// - Left: Eyebrow pill, editorial serif headline with gold underline flourish, 3-line subtitle, buttons, stats row
// - Right: Live revolving 3D metallic ALLOY sculpture with orbital rings and revolving cards matching the reference image!

import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import AlloySculpture from './AlloySculpture';

export default function Hero({ 
  onFindCreator, 
  onJoinCreator, 
  onExploreWork,
  onSelectCreator
}) {
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const handleOpenVideo = (title, creator, videoSrc) => {
    setActiveVideoModal({
      title,
      creator,
      videoSrc: videoSrc || '/assets/creasynq-universe.mp4'
    });
  };

  return (
    <section className="alloy-editorial-hero" id="home">
      <div className="page-container-wide alloy-editorial-container">
        
        {/* ============================================================
            LEFT COLUMN: Editorial Typography, Actions & Traction Stats
            ============================================================ */}
        <div className="alloy-hero-left">
          
          {/* Eyebrow Pill */}
          <div className="hero-eyebrow-pill">
            <span>CREATORS × BRANDS × AI</span>
          </div>

          {/* Master Headline */}
          <h1 className="hero-title-editorial font-editorial">
            Creativity<br />
            made to<br />
            work <span className="title-accent-together">
              together.
              <svg className="together-flourish-svg" viewBox="0 0 170 14" fill="none" preserveAspectRatio="none">
                <path 
                  d="M3 9.5C48 3.5 120 2.5 167 10" 
                  stroke="#C7A47B" 
                  strokeWidth="3.2" 
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* 3-Line Subtitle */}
          <p className="hero-desc-editorial">
            Brands find their next campaign.<br />
            AI-creators find their next opportunity.<br />
            ALLOY pairs them.
          </p>

          {/* Dual CTAs */}
          <div className="hero-editorial-actions">
            <button 
              type="button" 
              className="btn-hire-creator"
              onClick={onFindCreator}
              id="hero-hire-creator-btn"
            >
              <span>Hire a creator</span>
              <ArrowRight size={14} />
            </button>

            <button 
              type="button" 
              className="btn-become-creator"
              onClick={onJoinCreator}
              id="hero-become-creator-btn"
            >
              <span>Become a creator</span>
            </button>
          </div>

          {/* Traction Stats Strip */}
          <div className="hero-stats-strip">
            <div className="stat-unit">
              <span className="stat-digits font-editorial">190<span className="stat-plus">+</span></span>
              <span className="stat-caption">CREATORS</span>
            </div>

            <div className="stat-separator" />

            <div className="stat-unit">
              <span className="stat-digits font-editorial">936<span className="stat-plus">+</span></span>
              <span className="stat-caption">PROJECTS PUBLISHED</span>
            </div>

            <div className="stat-separator" />

            <div className="stat-unit">
              <span className="stat-digits font-editorial">130<span className="stat-plus">+</span></span>
              <span className="stat-caption">BRANDS</span>
            </div>
          </div>

        </div>

        {/* ============================================================
            RIGHT COLUMN: The 3D Revolving Sculpture & Revolving Ecosystem
            ============================================================ */}
        <div className="alloy-hero-right">
          <AlloySculpture 
            onOpenVideo={handleOpenVideo}
            onExploreWork={onExploreWork}
            onFindCreator={onFindCreator}
          />
        </div>

      </div>

      {/* ============================================================
          CINEMATIC VIDEO MODAL (Plays on Clicking Any Video Card)
          ============================================================ */}
      {activeVideoModal && (
        <div className="alloy-video-modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div className="alloy-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div className="video-meta-col">
                <span className="video-tag">AI CAMPAIGN PREVIEW</span>
                <h3 className="video-title font-editorial">{activeVideoModal.title}</h3>
                <span className="video-creator">Directed by {activeVideoModal.creator}</span>
              </div>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setActiveVideoModal(null)}
                aria-label="Close video"
              >
                <X size={20} />
              </button>
            </div>

            <div className="video-player-container">
              <video 
                src={activeVideoModal.videoSrc}
                autoPlay 
                controls 
                loop 
                className="active-modal-video"
              />
            </div>

            <div className="video-modal-footer">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setActiveVideoModal(null);
                  if (onFindCreator) onFindCreator();
                }}
              >
                <span>Commission this creator</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
