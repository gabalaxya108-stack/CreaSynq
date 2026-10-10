// src/components/TwoJourneysSection.jsx
// SECTION 4 — Two Clear User Journeys
// Balanced editorial section introducing both sides of Alloy:
// - LEFT: FOR BRANDS ("Find the creative minds behind your next campaign." -> CTA: Find Creators)
// - RIGHT: FOR CREATORS ("Turn your creative work into new opportunities." -> CTA: Join Alloy)

import React from 'react';
import { ArrowRight, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TwoJourneysSection({ onFindCreators, onJoinAlloy }) {
  const brandSteps = [
    { num: '01', title: 'Post a brief', desc: 'Describe what you need and your campaign timeline.' },
    { num: '02', title: 'Review applicants', desc: 'Browse portfolios, check visual styles, and evaluate fit.' },
    { num: '03', title: 'Hire & collaborate', desc: 'Work directly with your chosen AI-native creator.' },
    { num: '04', title: 'Receive deliverables', desc: 'Get production-ready campaign assets on schedule.' }
  ];

  const creatorSteps = [
    { num: '01', title: 'Sign up & showcase', desc: 'Create your account, upload work, and list specializations.' },
    { num: '02', title: 'Build Creative DNA', desc: 'Define your signature visual aesthetic and technical tools.' },
    { num: '03', title: 'Receive briefs', desc: 'Brands discover your portfolio and send targeted requests.' },
    { num: '04', title: 'Get commissioned', desc: 'Deliver commercial campaigns and expand brand partnerships.' }
  ];

  return (
    <section className="alloy-journeys-section" id="journeys">
      <div className="page-container alloy-journeys-container">
        
        {/* Section Header */}
        <div className="alloy-journeys-header">
          <div className="section-pill-badge">
            <span className="pill-dot" />
            <span>TWO PATHWAYS • ONE MARKETPLACE</span>
          </div>

          <h2 className="journeys-headline font-editorial">
            Built for both sides of the creative table.
          </h2>

          <p className="journeys-subtext">
            Whether you are commissioning your next brand campaign or turning generative craftsmanship into high-value partnerships, Alloy provides a purposeful home.
          </p>
        </div>

        {/* Dual Journeys Grid */}
        <div className="alloy-journeys-grid">
          
          {/* ==========================================================
              LEFT CARD: FOR BRANDS
              ========================================================== */}
          <div className="journey-editorial-card brand-card" id="for-brands">
            <div className="journey-card-top">
              <span className="journey-audience-badge">FOR BRANDS</span>
              <h3 className="journey-card-title font-editorial">
                Find the creative minds behind your next campaign.
              </h3>
              <p className="journey-card-desc">
                Discover AI creators, explore their work, and find talent that fits your campaign's creative direction.
              </p>
            </div>

            <div className="journey-steps-track">
              {brandSteps.map((step) => (
                <div key={step.num} className="journey-step-row">
                  <span className="step-counter font-editorial">{step.num}</span>
                  <div className="step-text-col">
                    <h4 className="step-heading">{step.title}</h4>
                    <p className="step-explanation">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="journey-cta-wrap">
              <button
                type="button"
                className="btn-editorial-dark"
                onClick={onFindCreators}
                id="journey-brand-find-btn"
              >
                <span>Find Creators</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* ==========================================================
              RIGHT CARD: FOR CREATORS
              ========================================================== */}
          <div className="journey-editorial-card creator-card" id="for-creators">
            <div className="journey-card-top">
              <span className="journey-audience-badge">FOR CREATORS</span>
              <h3 className="journey-card-title font-editorial">
                Turn your creative work into new opportunities.
              </h3>
              <p className="journey-card-desc">
                Build your portfolio, showcase your creative identity, and connect with brands looking for your style.
              </p>
            </div>

            <div className="journey-steps-track">
              {creatorSteps.map((step) => (
                <div key={step.num} className="journey-step-row">
                  <span className="step-counter font-editorial">{step.num}</span>
                  <div className="step-text-col">
                    <h4 className="step-heading">{step.title}</h4>
                    <p className="step-explanation">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="journey-cta-wrap">
              <button
                type="button"
                className="btn-editorial-outline"
                onClick={onJoinAlloy}
                id="journey-creator-join-btn"
              >
                <span>Join Alloy</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
