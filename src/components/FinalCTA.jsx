// src/components/FinalCTA.jsx
// SECTION 6 — Final Call To Action
// Heading: "Your next great collaboration starts here."
// Supporting copy: "Discover the creators, perspectives, and creative possibilities that bring your next idea to life."
// Primary CTA: Explore Creators
// Secondary CTA: I'm a Creator

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA({ onFindCreator, onJoinCreator }) {
  return (
    <section className="alloy-closing-section" id="closing-cta">
      <div className="page-container alloy-closing-container">
        <div className="alloy-closing-card">
          
          <div className="section-pill-badge closing-badge">
            <span className="pill-dot" />
            <span>READY TO COLLABORATE?</span>
          </div>

          <h2 className="closing-headline font-editorial">
            Your next great collaboration starts here.
          </h2>

          <p className="closing-subtext">
            Discover the creators, perspectives, and creative possibilities that bring your next idea to life.
          </p>

          <div className="closing-editorial-actions">
            <button 
              type="button" 
              className="btn-editorial-dark"
              onClick={onFindCreator}
              id="final-explore-creators-btn"
            >
              <span>Explore Creators</span>
              <ArrowRight size={14} />
            </button>

            <button 
              type="button" 
              className="btn-editorial-outline"
              onClick={onJoinCreator}
              id="final-join-creator-btn"
            >
              <span>I'm a Creator</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
