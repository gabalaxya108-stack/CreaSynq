// src/components/CreaMatchSection.jsx
// SECTION F: CreaMatch and CreaScore
// Headline: "Find the fit behind the feeling."
// Shows the visual journey from Campaign Brief -> Creator Discovery -> Creative Fit -> Explainable Recommendation.

import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, CheckCircle2, AlertCircle, 
  Layers, Check, FileText, ChevronRight, SlidersHorizontal 
} from 'lucide-react';
import { calculateCreaMatch } from '../intelligence/matchingEngine';
import { explainMatch } from '../intelligence/matchExplainer';

export default function CreaMatchSection({ creators = [], onExploreDiscover, onEnterBrandStudio }) {
  const sampleCampaigns = [
    {
      id: 'lumina-skincare',
      label: 'Skincare Launch',
      title: 'Lumina Botanica — Pure Hydration Campaign',
      industry: 'Beauty & Skincare',
      creativeStyle: 'Clean, Minimal, Luminous, Botanical, Organic',
      contentFormats: ['4K Stills Suite', 'E-Commerce Hero Assets'],
      platforms: ['Instagram', 'Digital OOH'],
      budget: '$5,000 – $10,000',
      timeline: '2–3 Weeks',
      deliverables: '3x Hero Stills, 2x Vertical Loops'
    },
    {
      id: 'obsidian-audio',
      label: 'Audio Hardware',
      title: 'Obsidian Audio — Spatial Headphone Debut',
      industry: 'Consumer Tech & Hardware',
      creativeStyle: 'Cinematic, Moody, Macro, Industrial Precision',
      contentFormats: ['4K Stills Suite', '9:16 Kinetic Loops'],
      platforms: ['Instagram', 'YouTube'],
      budget: '$8,000 – $12,000',
      timeline: '3 Weeks',
      deliverables: '4K Exploded CGI Stills, 15s Kinetic Loop'
    }
  ];

  const [activeCampIndex, setActiveCampIndex] = useState(0);
  const currentCampaign = sampleCampaigns[activeCampIndex];

  // Calculate scores for prominent creators
  const comparedTalent = ['zora-vance', 'alex-rivera', 'maya-chen']
    .map(id => creators.find(c => c.id === id))
    .filter(Boolean)
    .map(creator => ({
      creator,
      match: calculateCreaMatch(currentCampaign, creator),
      explanation: explainMatch(currentCampaign, creator)
    }))
    .sort((a, b) => b.match.score - a.match.score);

  const topCreator = comparedTalent[0];

  return (
    <section className="section-creamatch" id="creamatch-section">
      <div className="page-container">
        {/* Section Header */}
        <div className="creamatch-header">
          <div className="section-pill-tag">
            <span className="pill-dot-sm" />
            <span>Deterministic Creative Matching</span>
          </div>
          <h2 className="section-headline-lg font-editorial">
            Find the fit behind the feeling.
          </h2>
          <p className="section-subtitle-max">
            CreaMatch replaces subjective guessing with explainable intelligence. 
            We evaluate 6 core dimensions across verified portfolio works to explain why a creator fits.
          </p>

          {/* Interactive Campaign Switcher */}
          <div className="creamatch-brief-toggle">
            <span className="toggle-label">Test with real campaign briefs:</span>
            <div className="toggle-buttons">
              {sampleCampaigns.map((camp, idx) => (
                <button
                  key={camp.id}
                  type="button"
                  className={`brief-pill-btn ${idx === activeCampIndex ? 'active' : ''}`}
                  onClick={() => setActiveCampIndex(idx)}
                >
                  <span>{camp.label}: {camp.title.split('—')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4-Step Progressive Journey Visual (Apple-inspired flow) */}
        <div className="creamatch-journey-strip">
          <div className="journey-step">
            <span className="journey-step-num">01</span>
            <span className="journey-step-title">Campaign Brief</span>
            <span className="journey-step-desc">Style, formats & industry</span>
          </div>
          <ChevronRight size={18} className="journey-arrow" />
          <div className="journey-step">
            <span className="journey-step-num">02</span>
            <span className="journey-step-title">Creator Discovery</span>
            <span className="journey-step-desc">Taxonomy & style indexing</span>
          </div>
          <ChevronRight size={18} className="journey-arrow" />
          <div className="journey-step">
            <span className="journey-step-num">03</span>
            <span className="journey-step-title">Creative Fit</span>
            <span className="journey-step-desc">6-Dimension analysis</span>
          </div>
          <ChevronRight size={18} className="journey-arrow" />
          <div className="journey-step active-step">
            <span className="journey-step-num">04</span>
            <span className="journey-step-title">CreaScore Explanation</span>
            <span className="journey-step-desc">Cited portfolio evidence</span>
          </div>
        </div>

        {/* Dynamic Match Showcase Container */}
        {topCreator && (
          <div className="creamatch-showcase-card">
            <div className="creamatch-card-grid">
              {/* Left Column: Top Match Profile & Score */}
              <div className="creamatch-lead-col">
                <div className="creamatch-rank-tag">
                  <Sparkles size={13} />
                  <span>Top Ranked Candidate for {currentCampaign.label}</span>
                </div>

                <div className="creamatch-lead-header">
                  <img 
                    src={topCreator.creator.avatar} 
                    alt={topCreator.creator.name}
                    className="creamatch-lead-avatar"
                  />
                  <div>
                    <h3 className="creamatch-lead-name font-editorial">{topCreator.creator.name}</h3>
                    <p className="creamatch-lead-role">{topCreator.creator.creativeIdentity}</p>
                  </div>
                  <div className="creamatch-score-box">
                    <span className="creamatch-score-val">{topCreator.match.score}%</span>
                    <span className="creamatch-score-sub">CreaMatch Score</span>
                  </div>
                </div>

                {/* 6 Dimension Breakdown Bars */}
                <div className="creamatch-dimensions-list">
                  <h4 className="dimensions-heading">6-Dimension Evaluation</h4>
                  
                  <div className="dimension-row">
                    <span className="dim-name">Creative Style Alignment (25%)</span>
                    <div className="dim-bar-track">
                      <div className="dim-bar-fill" style={{ width: `${(topCreator.match.breakdown.styleScore / 25) * 100}%` }} />
                    </div>
                    <span className="dim-score">{topCreator.match.breakdown.styleScore}/25</span>
                  </div>

                  <div className="dimension-row">
                    <span className="dim-name">Portfolio Evidence (25%)</span>
                    <div className="dim-bar-track">
                      <div className="dim-bar-fill fill-evidence" style={{ width: `${(topCreator.match.breakdown.portfolioScore / 25) * 100}%` }} />
                    </div>
                    <span className="dim-score">{topCreator.match.breakdown.portfolioScore}/25</span>
                  </div>

                  <div className="dimension-row">
                    <span className="dim-name">Format Compatibility (15%)</span>
                    <div className="dim-bar-track">
                      <div className="dim-bar-fill" style={{ width: `${(topCreator.match.breakdown.formatScore / 15) * 100}%` }} />
                    </div>
                    <span className="dim-score">{topCreator.match.breakdown.formatScore}/15</span>
                  </div>

                  <div className="dimension-row">
                    <span className="dim-name">Industry Experience (15%)</span>
                    <div className="dim-bar-track">
                      <div className="dim-bar-fill" style={{ width: `${(topCreator.match.breakdown.industryScore / 15) * 100}%` }} />
                    </div>
                    <span className="dim-score">{topCreator.match.breakdown.industryScore}/15</span>
                  </div>

                  <div className="dimension-row">
                    <span className="dim-name">Platform Distribution (10%)</span>
                    <div className="dim-bar-track">
                      <div className="dim-bar-fill" style={{ width: `${(topCreator.match.breakdown.platformScore / 10) * 100}%` }} />
                    </div>
                    <span className="dim-score">{topCreator.match.breakdown.platformScore}/10</span>
                  </div>

                  <div className="dimension-row">
                    <span className="dim-name">Availability & Budget (10%)</span>
                    <div className="dim-bar-track">
                      <div className="dim-bar-fill" style={{ width: `${(topCreator.match.breakdown.availabilityScore / 10) * 100}%` }} />
                    </div>
                    <span className="dim-score">{topCreator.match.breakdown.availabilityScore}/10</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Explainable Recommendation (CreaScore Evidence) */}
              <div className="creamatch-evidence-col">
                <div className="evidence-header-tag">
                  <FileText size={13} />
                  <span>Explainable CreaScore Breakdown</span>
                </div>

                <div className="evidence-summary-box">
                  <h4 className="evidence-summary-title font-editorial">Why {topCreator.creator.name.split(' ')[0]} matches this brief:</h4>
                  <p className="evidence-summary-text">{topCreator.explanation.summary}</p>
                </div>

                {/* Cited Portfolio Evidence */}
                <div className="evidence-citations-box">
                  <span className="evidence-citations-label">Cited Portfolio Work:</span>
                  <div className="evidence-citation-card">
                    <span className="citation-title font-editorial">
                      “{topCreator.explanation.relevantProjects?.[0]?.title || topCreator.creator.projects?.[0]?.title || 'Key Visual Campaign'}”
                    </span>
                    <p className="citation-rationale">
                      {topCreator.explanation.highlights?.[0] || 'Verified commercial work matching requested aesthetic and fidelity.'}
                    </p>
                  </div>
                </div>

                {/* Requirements Satisfied & Nuances */}
                <div className="evidence-strengths-box">
                  <span className="evidence-strengths-label">Key Requirements Satisfied:</span>
                  <div className="strengths-list">
                    {(topCreator.explanation.highlights || topCreator.creator.capabilities || []).slice(0, 3).map((strength, i) => (
                      <div key={i} className="strength-item">
                        <Check size={14} className="text-mint" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Notice */}
                <div className="evidence-disclaimer">
                  <CheckCircle2 size={13} className="text-lavender-deep" />
                  <span>Deterministic matching demonstration. Calculations cross-reference verified project metadata.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
