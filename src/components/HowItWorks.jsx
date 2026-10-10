// src/components/HowItWorks.jsx
// SECTION 2 — Explain What ALLOY Does
// Heading: "Where creative vision meets the right talent."
// Supporting copy: "Alloy brings brands and AI creators together through portfolios, creative discovery, and intelligent matching."
// 3-part clean editorial layout:
// 01 — Discover
// 02 — Find Your Fit
// 03 — Create Together

import React from 'react';
import { ArrowRight, Compass, Sparkles, Handshake, Check } from 'lucide-react';

export default function HowItWorks({ onFindCreators, onBuildPortfolio }) {
  const pillars = [
    {
      num: "01",
      title: "Discover",
      desc: "Explore creators through their actual portfolios, creative styles, specializations, and published work.",
      highlight: "Evidence-backed portfolios",
      details: ["Curated 4K commercial visuals", "Verified prompt & tool stacks", "Diverse creative disciplines"]
    },
    {
      num: "02",
      title: "Find Your Fit",
      desc: "Use Alloy's existing matching experience to discover relevant creators and understand why their work may fit a brief.",
      highlight: "Explainable style alignment",
      details: ["Aesthetic style matching", "Technical capability alignment", "Turnaround & brief suitability"]
    },
    {
      num: "03",
      title: "Create Together",
      desc: "Help brands and creators move from discovery to collaboration using the existing campaign and engagement workflows.",
      highlight: "Streamlined collaboration",
      details: ["Structured campaign briefs", "Direct talent engagement", "End-to-end milestone delivery"]
    }
  ];

  return (
    <section className="alloy-explanation-section" id="how-it-works">
      <div className="page-container alloy-explanation-container">
        
        {/* Section Header */}
        <div className="alloy-explanation-header">
          <div className="section-pill-badge">
            <span className="pill-dot" />
            <span>HOW ALLOY WORKS</span>
          </div>

          <h2 className="explanation-headline font-editorial">
            Where creative vision meets the right talent.
          </h2>

          <p className="explanation-subtext">
            Alloy brings brands and AI creators together through portfolios, creative discovery, and intelligent matching.
          </p>
        </div>

        {/* 3-Part Editorial Grid */}
        <div className="explanation-pillars-grid">
          {pillars.map((pillar) => (
            <div key={pillar.num} className="explanation-pillar-card">
              
              <div className="pillar-top-row">
                <span className="pillar-number font-editorial">{pillar.num}</span>
                <span className="pillar-tag">{pillar.highlight}</span>
              </div>

              <h3 className="pillar-title font-editorial">
                {pillar.title}
              </h3>

              <p className="pillar-desc">
                {pillar.desc}
              </p>

              <div className="pillar-details-list">
                {pillar.details.map((detail, idx) => (
                  <div key={idx} className="pillar-detail-item">
                    <span className="pillar-check-dot">✓</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="explanation-action-row">
          <button
            type="button"
            className="btn-editorial-dark"
            onClick={onFindCreators}
            id="how-it-works-find-btn"
          >
            <span>Explore creator portfolios</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
}
