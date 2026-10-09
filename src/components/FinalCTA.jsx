// src/components/FinalCTA.jsx
// SECTION J: Closing Statement
// Headline: "Great things happen when creativity connects."
// Supporting text: "Bring the right people and ideas together."
// Actions: "Start a campaign", "Join as a creator"

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA({ onFindCreator, onJoinCreator }) {
  return (
    <section className="section-final-cta" id="closing-cta">
      <div className="page-container">
        <div className="final-cta-card-editorial">
          <div className="final-cta-content">
            <div className="section-pill-tag">
              <span className="pill-dot-sm" />
              <span>CreaSync Creative Ecosystem</span>
            </div>

            <h2 className="final-cta-headline font-editorial">
              Let's make something worth creating.
            </h2>

            <p className="final-cta-desc">
              Discover talent, craft campaign briefs, and collaborate with AI creators who understand your aesthetic.
            </p>

            <div className="final-cta-buttons">
              <button 
                type="button" 
                className="btn btn-primary btn-lg"
                onClick={onFindCreator}
                id="final-cta-start-campaign"
              >
                <span>Start a Campaign</span>
                <ArrowRight size={16} />
              </button>

              <button 
                type="button" 
                className="btn btn-secondary btn-lg"
                onClick={onJoinCreator}
                id="final-cta-join-creator"
              >
                <span>Join as a Creator</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
