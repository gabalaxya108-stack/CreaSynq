// src/components/CreatorDNASection.jsx
// SECTION E: Creator DNA
// Headline: "Every creator has a signature."
// Editorial creative profile demonstrating verified characteristics, portfolio patterns, and transparent provenance.

import React, { useState } from 'react';
import { 
  Dna, Sparkles, CheckCircle2, Layers, Film, ArrowRight, 
  ExternalLink, ShieldCheck, Compass, Eye 
} from 'lucide-react';
import { generateCreatorDNA } from '../intelligence/creatorDNA';

export default function CreatorDNASection({ creators = [], onSelectCreator }) {
  const sampleCreatorIds = ['maya-chen', 'zora-vance', 'alex-rivera'];
  const availableCreators = sampleCreatorIds
    .map(id => creators.find(c => c.id === id))
    .filter(Boolean);

  const [activeCreatorId, setActiveCreatorId] = useState(availableCreators[0]?.id || 'maya-chen');
  const activeCreator = creators.find(c => c.id === activeCreatorId) || availableCreators[0];
  const activeDNA = activeCreator ? generateCreatorDNA(activeCreator) : null;

  if (!activeCreator || !activeDNA) return null;

  return (
    <section className="section-creator-dna" id="creator-dna-section">
      <div className="page-container">
        {/* Section Header */}
        <div className="creator-dna-header">
          <div className="section-pill-tag">
            <span className="pill-dot-sm" />
            <span>Creative Identity Architecture</span>
          </div>
          <h2 className="section-headline-lg font-editorial">
            Every creator has a signature.
          </h2>
          <p className="section-subtitle-max">
            Creator DNA maps verified portfolio patterns, optical tendencies, and storytelling rhythms 
            into an actionable creative identity—distinguishing what is declared from what is verified.
          </p>

          {/* Creator Profile Switcher Pills */}
          <div className="dna-selector-bar">
            {availableCreators.map((creator) => (
              <button
                key={creator.id}
                type="button"
                className={`dna-selector-btn ${creator.id === activeCreatorId ? 'active' : ''}`}
                onClick={() => setActiveCreatorId(creator.id)}
              >
                <img 
                  src={creator.avatar} 
                  alt={creator.name}
                  className="dna-btn-avatar"
                />
                <span>{creator.name}</span>
                <span className="dna-btn-role">{creator.specialty}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Profile Dossier (Apple-grade composition) */}
        <div className="dna-dossier-card">
          <div className="dna-dossier-grid">
            {/* Left: Creative Identity & Visual Mood */}
            <div className="dna-dossier-main">
              <div className="dna-badge-strip">
                <span className="dna-provenance-tag verified-tag">
                  <CheckCircle2 size={13} />
                  <span>Portfolio-Verified Identity</span>
                </span>
                <span className="dna-evidence-tier">
                  Completeness: {activeDNA.completeness?.tier || 'Verified Portfolio'}
                </span>
              </div>

              <div className="dna-creator-intro">
                <h3 className="dna-creator-name font-editorial">{activeCreator.name}</h3>
                <p className="dna-creator-role">{activeCreator.creativeIdentity}</p>
                <p className="dna-creator-bio">{activeCreator.bio}</p>
              </div>

              {/* 3 Pillars of Aesthetic Signature */}
              <div className="dna-signature-pillars">
                <div className="dna-pillar-item">
                  <span className="dna-pillar-label">Visual Aesthetic</span>
                  <p className="dna-pillar-val">{activeDNA.visualAesthetic}</p>
                </div>
                <div className="dna-pillar-item">
                  <span className="dna-pillar-label">Storytelling Approach</span>
                  <p className="dna-pillar-val">{activeDNA.storytellingApproach}</p>
                </div>
                <div className="dna-pillar-item">
                  <span className="dna-pillar-label">Product Presentation</span>
                  <p className="dna-pillar-val">{activeDNA.productPresentationStyle}</p>
                </div>
              </div>

              {/* Verified Tools & Supported Formats */}
              <div className="dna-technical-row">
                <div className="dna-tech-group">
                  <span className="dna-tech-label">Demonstrated Tools</span>
                  <div className="dna-tag-cloud">
                    {(activeCreator.tools || []).map((tool, idx) => (
                      <span key={idx} className="dna-tag-pill">{tool}</span>
                    ))}
                  </div>
                </div>

                <div className="dna-tech-group">
                  <span className="dna-tech-label">Key Output Formats</span>
                  <div className="dna-tag-cloud">
                    {(activeDNA.provenance?.portfolioSupported?.demonstratedFormats || activeCreator.styles || []).map((fmt, idx) => (
                      <span key={idx} className="dna-tag-pill format-pill">{fmt}</span>
                    ))}
                  </div>
                </div>
              </div>

              {onSelectCreator && (
                <div className="dna-footer-action">
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectCreator(activeCreator.id)}
                  >
                    <span>View Full {activeCreator.name.split(' ')[0]}'s Profile</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Verified Portfolio Evidence Gallery */}
            <div className="dna-dossier-visual">
              <div className="dna-visual-header">
                <span className="dna-visual-heading font-editorial">Verified Portfolio Citations</span>
                <span className="dna-visual-count">{activeCreator.projects?.length || 0} Projects Documented</span>
              </div>

              <div className="dna-projects-stack">
                {(activeCreator.projects || []).slice(0, 2).map((proj, idx) => (
                  <div key={proj.id || idx} className="dna-project-box">
                    <div className="dna-project-img-frame">
                      <img 
                        src={proj.image} 
                        alt={proj.title}
                        className="dna-project-img"
                        loading="lazy"
                      />
                      <span className="dna-project-client-badge">{proj.clientType || 'Verified Commission'}</span>
                    </div>
                    <div className="dna-project-content">
                      <h4 className="dna-project-title font-editorial">{proj.title}</h4>
                      <p className="dna-project-direction">{proj.creativeDirection}</p>
                      <div className="dna-project-tags">
                        {(proj.capabilities || []).map((c, i) => (
                          <span key={i} className="dna-micro-tag">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Provenance Disclosure */}
              <div className="dna-provenance-disclosure">
                <ShieldCheck size={14} className="text-mint" />
                <span>Zero arbitrary personality scores. Traits reflect verified client productions and generative methodologies.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
