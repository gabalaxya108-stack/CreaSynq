// src/components/HowItWorks.jsx
// SECTION H: The Collaboration Journey
// Headline: "From first idea to final delivery."
// Editorial progressive timeline: Discover -> Brief -> Match -> Shortlist -> Invite -> Collaborate -> Review -> Complete.

import React, { useState } from 'react';
import { 
  Compass, FileText, Sparkles, Bookmark, Send, 
  MessageSquare, CheckCircle2, Award, ChevronRight, ArrowRight 
} from 'lucide-react';

export default function HowItWorks({ onGetStarted }) {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      num: "01",
      title: "Discover",
      label: "Visual Talent Roster",
      desc: "Explore verified AI creators filtered by aesthetic style, content format, and documented tools.",
      icon: Compass,
      accent: "var(--accent-lavender)",
      detail: "Browse curated portfolios featuring 35mm cinema, 3D spatial renders, generative fashion, and macro beauty."
    },
    {
      num: "02",
      title: "Brief",
      label: "Natural Language Campaign",
      desc: "Describe your creative vision in natural prose. CreaSync structures requirements without inventing budgets.",
      icon: FileText,
      accent: "var(--accent-peach)",
      detail: "Our brief engine extracts objectives, deliverables, and aesthetic tokens while flagging missing parameters."
    },
    {
      num: "03",
      title: "Match",
      label: "Deterministic CreaMatch",
      desc: "Algorithmic 6-dimension evaluation connects your brief to tangible creator portfolio evidence.",
      icon: Sparkles,
      accent: "var(--accent-pink)",
      detail: "Scores assess Style (25%), Portfolio Evidence (25%), Format (15%), Industry (15%), Platform (10%), and Availability (10%)."
    },
    {
      num: "04",
      title: "Shortlist",
      label: "Comparative Evaluation",
      desc: "Save leading candidates and compare them side by side across aesthetic signatures and turnarounds.",
      icon: Bookmark,
      accent: "var(--accent-mint)",
      detail: "Evaluate side-by-side Creator DNA to align on creative fit before extending offers."
    },
    {
      num: "05",
      title: "Invite",
      label: "Structured Proposals",
      desc: "Send project invitations with pre-aligned deliverables, commission budgets, and production milestones.",
      icon: Send,
      accent: "var(--accent-lavender)",
      detail: "Creators receive structured opportunity briefs with direct accept or decline workflows."
    },
    {
      num: "06",
      title: "Collaborate",
      label: "Shared Production Hub",
      desc: "Exchange feedback, reference boards, prompt parameters, and test renders in real-time.",
      icon: MessageSquare,
      accent: "var(--accent-peach)",
      detail: "Maintain continuous creative synchronization with integrated messaging and asset sharing."
    },
    {
      num: "07",
      title: "Review",
      label: "Frame-Level Deliverables",
      desc: "Inspect high-resolution stills, video loops, and master color grades with precise revision requests.",
      icon: CheckCircle2,
      accent: "var(--accent-pink)",
      detail: "Provide actionable creative direction and track change requests through transparent revision cycles."
    },
    {
      num: "08",
      title: "Complete",
      label: "Final Commercial Sign-Off",
      desc: "Approve final deliverables and release campaign assets directly into your digital marketing suite.",
      icon: Award,
      accent: "var(--accent-mint)",
      detail: "Full commercial licensing handoff and completed project archiving in one seamless motion."
    }
  ];

  return (
    <section className="section-how-it-works" id="how-it-works">
      <div className="page-container">
        {/* Section Header */}
        <div className="how-it-works-header">
          <div className="section-pill-tag">
            <span className="pill-dot-sm" />
            <span>The End-to-End Collaboration Journey</span>
          </div>
          <h2 className="section-headline-lg font-editorial">
            From first idea to final delivery.
          </h2>
          <p className="section-subtitle-max">
            A cohesive creative journey connecting discovery, intelligent matching, 
            concept development, and milestone-driven collaboration.
          </p>
        </div>

        {/* Desktop 8-Stage Progressive Sequence Tracker */}
        <div className="journey-timeline-nav">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeStage;
            return (
              <button
                key={stage.num}
                type="button"
                className={`timeline-step-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStage(idx)}
                aria-label={`Stage ${stage.num}: ${stage.title}`}
              >
                <span className="timeline-step-num">{stage.num}</span>
                <span className="timeline-step-title">{stage.title}</span>
                <span className="timeline-step-indicator" />
              </button>
            );
          })}
        </div>

        {/* Featured Stage Focus Card */}
        <div className="journey-stage-display-card">
          <div className="stage-display-grid">
            <div className="stage-display-info">
              <div className="stage-badge-row">
                <span className="stage-num-pill">Step {stages[activeStage].num} of 08</span>
                <span className="stage-label-tag">{stages[activeStage].label}</span>
              </div>
              <h3 className="stage-display-title font-editorial">
                {stages[activeStage].title}: {stages[activeStage].desc}
              </h3>
              <p className="stage-display-detail">
                {stages[activeStage].detail}
              </p>
              
              <div className="stage-cta-row">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onGetStarted}
                >
                  <span>Experience Workflow</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveStage((prev) => (prev + 1) % stages.length)}
                >
                  <span>Next Stage ({stages[(activeStage + 1) % stages.length].title})</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Stage Visual Representation */}
            <div className="stage-display-visual">
              <div className="stage-graphic-box">
                <div className="stage-graphic-header">
                  <span className="graphic-dot" />
                  <span className="graphic-title">CreaSync Studio Lifecycle</span>
                </div>
                <div className="stage-workflow-steps-mini">
                  {stages.map((st, i) => (
                    <div 
                      key={st.num} 
                      className={`mini-step-item ${i === activeStage ? 'active-mini' : i < activeStage ? 'done-mini' : ''}`}
                      onClick={() => setActiveStage(i)}
                    >
                      <span className="mini-step-num">{st.num}</span>
                      <span className="mini-step-name">{st.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Mobile Vertical Progressive Cards */}
        <div className="journey-mobile-stack">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.num} className="journey-mobile-card">
                <div className="mobile-card-top">
                  <span className="mobile-step-num">{stage.num}</span>
                  <Icon size={18} style={{ color: stage.accent }} />
                  <span className="mobile-step-title">{stage.title}</span>
                </div>
                <p className="mobile-step-desc">{stage.desc}</p>
                <span className="mobile-step-detail">{stage.detail}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
