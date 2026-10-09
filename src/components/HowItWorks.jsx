// src/components/HowItWorks.jsx
// SECTION 2 — How ALLOY Works
// Eyebrow: "FROM IDEA TO CREATIVE TEAM"
// Headline: "Your next great collaboration starts here."
// 3 Horizontally Arranged Steps with visual micro-previews and dual Brand / Creator paths

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Compass, CheckCircle2, FileText, Users } from 'lucide-react';

export default function HowItWorks({ onFindCreators, onBuildPortfolio }) {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      num: "01",
      title: "Discover",
      desc: "Explore AI-native creators through their actual work, specialties, and creative styles.",
      visualType: "portfolio"
    },
    {
      num: "02",
      title: "Match",
      desc: "Find creators whose visual direction, skills, and capabilities fit your campaign.",
      visualType: "match"
    },
    {
      num: "03",
      title: "Collaborate",
      desc: "Share a brief, assemble your team, and move from creative direction to deliverables.",
      visualType: "collaborate"
    }
  ];

  return (
    <section className="alloy-how-section" id="how-it-works">
      <div className="page-container alloy-how-container">
        
        {/* Section Header */}
        <div className="alloy-how-header">
          <div className="alloy-eyebrow">
            <span className="alloy-eyebrow-dot" />
            <span className="alloy-eyebrow-text">FROM IDEA TO CREATIVE TEAM</span>
          </div>

          <h2 className="alloy-section-headline font-editorial">
            Your next great collaboration starts here.
          </h2>

          <p className="alloy-section-subtext">
            From finding the right talent to building campaign-ready teams, ALLOY brings the creative process together.
          </p>
        </div>

        {/* 3 Horizontally Arranged Steps */}
        <div className="alloy-steps-wrapper">
          <div className="alloy-steps-track-line" aria-hidden="true" />
          
          <div className="alloy-steps-grid">
            {steps.map((step, idx) => (
              <div 
                key={step.num}
                className={`alloy-step-card ${hoveredStep === idx ? 'step-hovered' : ''}`}
                onMouseEnter={() => setHoveredStep(idx)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Top Bar */}
                <div className="step-card-top">
                  <span className="step-num-badge">{step.num}</span>
                  <span className="step-title-text">{step.title}</span>
                </div>

                {/* Step Description */}
                <p className="step-desc-text">
                  {step.desc}
                </p>

                {/* Step Micro-Visual */}
                <div className="step-visual-box">
                  {step.visualType === 'portfolio' && (
                    <div className="step-visual-portfolio">
                      <div className="micro-thumb-card card-1">
                        <img 
                          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=260&q=80" 
                          alt="Fashion" 
                        />
                        <span className="micro-tag">Couture</span>
                      </div>
                      <div className="micro-thumb-card card-2">
                        <img 
                          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=260&q=80" 
                          alt="3D Spatial" 
                        />
                        <span className="micro-tag">Spatial 3D</span>
                      </div>
                    </div>
                  )}

                  {step.visualType === 'match' && (
                    <div className="step-visual-match">
                      <div className="match-node brand-node">
                        <span className="node-label">Brief</span>
                      </div>
                      <div className="match-connector-line">
                        <div className="match-pulse-node">
                          <Sparkles size={11} />
                          <span>98%</span>
                        </div>
                      </div>
                      <div className="match-node creator-node">
                        <span className="node-label">Creator</span>
                      </div>
                    </div>
                  )}

                  {step.visualType === 'collaborate' && (
                    <div className="step-visual-collab">
                      <div className="collab-brief-bar">
                        <FileText size={12} className="brief-icon" />
                        <span className="brief-bar-title">Q4 Capsule Campaign</span>
                        <span className="brief-status-tag">Ready</span>
                      </div>
                      <div className="collab-team-row">
                        <div className="team-avatar-stack">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Elena" />
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Alex" />
                        </div>
                        <span className="team-status-text">2 Creators Assigned</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Dual Paths for Brands and Creators */}
        <div className="alloy-dual-paths" id="for-brands">
          {/* For Brands */}
          <div className="dual-path-card path-brands">
            <div className="path-content-col">
              <span className="path-eyebrow">FOR BRANDS</span>
              <h3 className="path-heading font-editorial">Have a campaign in mind?</h3>
              <p className="path-desc">Brief AI-native creators and assemble high-velocity creative teams.</p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary path-action-btn"
              onClick={onFindCreators}
              id="how-find-creators-btn"
            >
              <span>Find creators</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* For Creators */}
          <div className="dual-path-card path-creators" id="for-creators">
            <div className="path-content-col">
              <span className="path-eyebrow">FOR CREATORS</span>
              <h3 className="path-heading font-editorial">Ready to showcase your work?</h3>
              <p className="path-desc">Exhibit verified portfolio projects and receive targeted brand briefs.</p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary path-action-btn"
              onClick={onBuildPortfolio}
              id="how-build-portfolio-btn"
            >
              <span>Build your portfolio</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
