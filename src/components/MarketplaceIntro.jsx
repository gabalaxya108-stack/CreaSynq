import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function MarketplaceIntro({ topCreators, onExploreCreators, onSelectCreator }) {
  return (
    <section className="section-marketplace-intro" id="creators-intro">
      <div className="page-container">
        <div className="marketplace-intro-card">
          <div className="section-label">The AI Marketplace</div>
          <h2 className="marketplace-intro-title">
            Find the creator behind the idea.
          </h2>
          <p className="marketplace-intro-text">
            Search creators by style, capability, industry and creative direction.
          </p>
          <button 
            type="button" 
            className="btn btn-primary btn-lg"
            onClick={onExploreCreators}
          >
            <span>Explore Creators</span>
            <ArrowRight size={16} />
          </button>

          {/* Quick Preview Reel of 3 Leading Creators */}
          <div className="creator-preview-reel">
            {topCreators.slice(0, 3).map((creator) => (
              <div 
                key={creator.id}
                className="creator-card"
                onClick={() => onSelectCreator(creator.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="creator-card-hero-image" style={{ aspectRatio: '16/9' }}>
                  <img src={creator.heroWork} alt={creator.name} />
                  <div className="creator-card-badge">
                    <span className="status-dot-green" />
                    <span>{creator.statusBadge}</span>
                  </div>
                </div>
                <div className="creator-card-body" style={{ padding: '18px' }}>
                  <div className="creator-card-header">
                    <img src={creator.avatar} alt={creator.name} className="creator-card-avatar" />
                    <div className="creator-card-name-block">
                      <h3 style={{ fontSize: '1rem' }}>{creator.name}</h3>
                      <p className="creator-card-role">{creator.creativeIdentity}</p>
                    </div>
                  </div>
                  <div className="creator-card-footer" style={{ paddingBottom: 0 }}>
                    <span className="creator-location">{creator.location}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      View Portfolio →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
