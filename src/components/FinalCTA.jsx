// src/components/FinalCTA.jsx
// SECTION 3 — Compact Closing Section
// Headline: "Better creative work starts with the right connection."
// Buttons: "Find your creative match", "Join the ALLOY network"

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA({ onFindCreator, onJoinCreator }) {
  return (
    <section className="alloy-closing-section" id="closing-cta">
      <div className="page-container alloy-closing-container">
        <div className="alloy-closing-banner">
          
          {/* Subtle metallic motif backdrop rings */}
          <div className="closing-banner-motif" aria-hidden="true">
            <div className="motif-ring ring-gold" />
            <div className="motif-ring ring-bronze" />
          </div>

          <div className="closing-banner-content">
            <span className="alloy-eyebrow-text closing-eyebrow">THE ALLOY NETWORK</span>
            
            <h2 className="alloy-closing-headline font-editorial">
              Better creative work starts with the right connection.
            </h2>
            
            <p className="alloy-closing-subtext">
              Connect creative direction to exceptional AI creators and build campaigns that resonate.
            </p>

            <div className="alloy-closing-actions">
              <button 
                type="button" 
                className="btn btn-primary btn-lg alloy-primary-cta"
                onClick={onFindCreator}
                id="final-find-creative-match"
              >
                <span>Find your creative match</span>
                <ArrowRight size={16} />
              </button>

              <button 
                type="button" 
                className="btn btn-secondary btn-lg alloy-secondary-cta"
                onClick={onJoinCreator}
                id="final-join-alloy-network"
              >
                <span>Join the ALLOY network</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
