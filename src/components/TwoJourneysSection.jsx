import React from 'react';
import { 
  ArrowRight, Briefcase, Sparkles, CheckCircle2, 
  FileText, Search, ShieldCheck, Compass, Send, 
  Palette, Upload, Dna, Inbox, Layers 
} from 'lucide-react';

export default function TwoJourneysSection({ onExploreBrandStudio, onBuildCreatorProfile }) {
  const brandSteps = [
    { num: '01', title: 'Create a brief', desc: 'Describe your campaign in your own words, or let AI structure it without hallucinated constraints.' },
    { num: '02', title: 'Discover creators', desc: 'Browse verified creators categorized by visual discipline, tools, and past commercial work.' },
    { num: '03', title: 'Understand creative fit', desc: 'Evaluate explainable CreaScore rationales backed by actual portfolio evidence.' },
    { num: '04', title: 'Explore campaign concepts', desc: 'Preview tailored CreaSim storyboards crafted specifically for each creator.' },
    { num: '05', title: 'Start a collaboration', desc: 'Send direct invitations, align on deliverables, and approve milestones in one place.' },
  ];

  const creatorSteps = [
    { num: '01', title: 'Build a professional profile', desc: 'Craft a portfolio that highlights your signature aesthetic and creative strengths.' },
    { num: '02', title: 'Showcase your work', desc: 'Upload 4K master visuals, motion reels, and 3D scenes with verified technical tags.' },
    { num: '03', title: 'Develop your creative identity', desc: 'Unlock evidence-grounded Creator DNA with transparent 3-tier provenance classification.' },
    { num: '04', title: 'Discover relevant opportunities', desc: 'Receive direct campaign invitations and curated marketplace opportunities tailored to your style.' },
    { num: '05', title: 'Collaborate with brands', desc: 'Deliver work seamlessly with milestone progress tracking and guaranteed payout protection.' },
  ];

  return (
    <section className="two-journeys-section" id="journeys">
      <div className="page-container">
        {/* Section Header */}
        <div className="journeys-header text-center">
          <div className="section-pill-tag">
            <span className="pill-dot-sm" />
            <span>Two Journeys • One Ecosystem</span>
          </div>
          <h2 className="section-headline-lg font-editorial">
            Built for both sides of the creative table.
          </h2>
          <p className="section-subtitle-max">
            Whether you are commissioning a global brand film or turning your generative art into high-value commercial partnerships, CreaSync provides a purposeful environment.
          </p>
        </div>

        {/* Dual Asymmetrical Journeys Grid */}
        <div className="journeys-grid">
          {/* BRAND PATH */}
          <div className="journey-card brand-journey-card" id="for-brands">
            <div className="journey-card-header">
              <div className="journey-badge brand-badge">
                <Briefcase size={14} />
                <span>FOR BRANDS & AGENCIES</span>
              </div>
              <h3 className="journey-headline font-editorial">
                Bring your next campaign to life.
              </h3>
              <p className="journey-intro">
                From initial concept to final master delivery. Find creators whose aesthetic truly aligns with your brand vision.
              </p>
            </div>

            {/* Steps List */}
            <div className="journey-steps-list">
              {brandSteps.map((step) => (
                <div key={step.num} className="journey-step-item">
                  <div className="step-num-badge brand-step-num">{step.num}</div>
                  <div className="step-content">
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Brand Interactive Preview Snippet */}
            <div className="journey-preview-snippet brand-snippet">
              <div className="snippet-header">
                <span className="snippet-tag">Live Brief & Match</span>
                <span className="snippet-score">96% Compatibility</span>
              </div>
              <p className="snippet-brief-title font-editorial">“Sustainable Skincare Botanical Caustics”</p>
              <div className="snippet-evidence-pills">
                <span className="evidence-pill">✓ Verified Macro Physics</span>
                <span className="evidence-pill">✓ 4K Master Stills</span>
                <span className="evidence-pill">✓ 48h Delivery</span>
              </div>
            </div>

            <div className="journey-action-wrap">
              <button
                type="button"
                className="btn btn-primary btn-lg journey-cta-btn"
                onClick={onExploreBrandStudio}
                id="journey-brand-cta-btn"
              >
                <span>Explore Brand Studio</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* CREATOR PATH */}
          <div className="journey-card creator-journey-card" id="for-creators">
            <div className="journey-card-header">
              <div className="journey-badge creator-badge">
                <Palette size={14} />
                <span>FOR AI CONTENT CREATORS</span>
              </div>
              <h3 className="journey-headline font-editorial">
                Turn your creativity into opportunity.
              </h3>
              <p className="journey-intro">
                Build your creative identity, prove your skills with verified portfolio evidence, and connect with brands looking for your exact aesthetic.
              </p>
            </div>

            {/* Steps List */}
            <div className="journey-steps-list">
              {creatorSteps.map((step) => (
                <div key={step.num} className="journey-step-item">
                  <div className="step-num-badge creator-step-num">{step.num}</div>
                  <div className="step-content">
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Creator Interactive Preview Snippet */}
            <div className="journey-preview-snippet creator-snippet">
              <div className="snippet-header">
                <span className="snippet-tag">Creator DNA Dossier</span>
                <span className="snippet-tier">Tier 1: Portfolio Verified</span>
              </div>
              <div className="snippet-dna-tags">
                <span className="dna-chip prov-portfolio">Hyper-real 3D Hardware</span>
                <span className="dna-chip prov-portfolio">Kinetic Zero-G Motion</span>
                <span className="dna-chip prov-ai">Cold Studio Lighting</span>
              </div>
              <p className="snippet-guarantee">Direct brand invitations • No pitch work • Escrow protection</p>
            </div>

            <div className="journey-action-wrap">
              <button
                type="button"
                className="btn btn-secondary btn-lg journey-cta-btn creator-btn"
                onClick={onBuildCreatorProfile}
                id="journey-creator-cta-btn"
              >
                <span>Build Your Creator Profile</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
