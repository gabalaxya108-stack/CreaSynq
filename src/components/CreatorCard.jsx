import React, { useState } from 'react';
import { ArrowUpRight, Heart, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';
import { calculateCreaMatch } from '../intelligence/matchingEngine';
import { getCreatorTrustBadges } from '../data/trustVerificationData';

export default function CreatorCard({ 
  creator, 
  onSelect, 
  isSaved = false, 
  onToggleSave,
  activeCampaign = null,
  onWhyClick = null 
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Compute CreaMatch score only if active campaign context exists
  const matchResult = activeCampaign ? calculateCreaMatch(activeCampaign, creator) : null;
  const isGoodFit = matchResult && matchResult.score >= 82;

  // Published portfolio items (filtering out private drafts)
  const publishedProjects = (creator.projects || []).filter(p => p.visibility !== 'private');
  const cardHeroImage = (publishedProjects.find(p => p.featured)?.image) 
    || (publishedProjects[0]?.image) 
    || creator.heroWork;

  // Trust Centre verification credentials
  const trustBadges = getCreatorTrustBadges(creator);
  const verifiedCount = trustBadges.filter(b => b.status === 'verified').length;

  return (
    <article 
      className="creator-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(creator.id)}
    >
      {/* 1. Large Portfolio Visual Hero */}
      <div className="creator-card-hero-image">
        <img 
          src={cardHeroImage} 
          alt={`${creator.name}'s creative work`} 
          loading="lazy" 
          className={`creator-card-img ${isHovered ? 'zoomed' : ''}`}
          onError={(e) => {
            e.currentTarget.src = creator.heroWork || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=85";
          }}
        />

        {/* Top Bar: Availability, Projects & Save */}
        <div className="creator-card-top-bar">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {creator.statusBadge && (
              <div className="creator-card-badge">
                <span className="status-dot-green" />
                <span>{creator.statusBadge}</span>
              </div>
            )}
            {publishedProjects.length > 0 && (
              <div className="creator-card-badge" style={{ background: 'rgba(0, 0, 0, 0.65)', color: '#FFFFFF' }}>
                <span>{publishedProjects.length} {publishedProjects.length === 1 ? 'Project' : 'Projects'}</span>
              </div>
            )}
            {verifiedCount > 0 && (
              <div 
                className="creator-card-badge" 
                style={{ 
                  background: 'rgba(5, 150, 105, 0.85)', 
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(4px)'
                }}
                title={`${verifiedCount} Trust & Provenance credentials verified`}
              >
                <ShieldCheck size={11} strokeWidth={2.4} />
                <span>{verifiedCount} Verified</span>
              </div>
            )}
          </div>

          {/* Save / Favorite Heart Button */}
          <button
            type="button"
            className={`creator-save-btn ${isSaved ? 'saved' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSave) onToggleSave(creator.id);
            }}
            title={isSaved ? "Saved to favorites" : "Save creator"}
            aria-label="Save creator"
          >
            <Heart 
              size={15} 
              fill={isSaved ? "#EF4444" : "none"} 
              stroke={isSaved ? "#EF4444" : "#FFFFFF"} 
            />
          </button>
        </div>

        {/* Hover Action Overlay */}
        <div className={`creator-hover-pill ${isHovered ? 'visible' : ''}`}>
          <span>View Creator</span>
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* 2. Card Body — Name, Specialty, Short Descriptor */}
      <div className="creator-card-body">
        {/* Campaign Intelligence Strip (Only when browsing in campaign context!) */}
        {isGoodFit && (
          <div className="creator-card-match-strip" onClick={(e) => e.stopPropagation()}>
            <div className="match-tag-pill">
              <Sparkles size={12} className="sparkle-icon" />
              <span>Good fit for your campaign</span>
              <span className="match-score-subtle">• {matchResult.fitLabel}</span>
            </div>

            {onWhyClick && (
              <button
                type="button"
                className="why-creator-link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onWhyClick(creator);
                }}
              >
                Why?
              </button>
            )}
          </div>
        )}

        <div className="creator-card-header">
          <img 
            src={creator.avatar} 
            alt={creator.name} 
            className="creator-card-avatar" 
          />
          <div className="creator-card-name-block">
            <h3>{creator.name}</h3>
            <p className="creator-card-role">{creator.creativeIdentity}</p>
          </div>
        </div>

        {/* Short Descriptor */}
        <p className="creator-card-bio">
          "{creator.bio}"
        </p>

        {/* Portfolio Visual Strip — Quick Hover Previews */}
        {publishedProjects.length > 1 && (
          <div className="creator-card-portfolio-strip" onClick={(e) => e.stopPropagation()}>
            {publishedProjects.slice(0, 3).map((p, idx) => (
              <div 
                key={p.id || idx}
                className="creator-mini-thumb-wrap"
                title={p.title}
              >
                <img 
                  src={p.image} 
                  alt={p.title} 
                  className="creator-mini-thumb" 
                  onError={(e) => {
                    e.currentTarget.src = creator.heroWork;
                  }}
                />
              </div>
            ))}
            {publishedProjects.length > 3 && (
              <span className="creator-mini-more">+{publishedProjects.length - 3}</span>
            )}
          </div>
        )}

        {/* Capabilities / Styles Cloud */}
        <div className="creator-card-tags">
          {(creator.styles || []).slice(0, 2).map((st, i) => (
            <span key={i} className="creator-tag" style={{ background: 'var(--accent-lavender-light, rgba(162, 142, 220, 0.12))', color: 'var(--accent-lavender-deep, #7C3AED)' }}>
              {st}
            </span>
          ))}
          {(creator.capabilities || []).slice(0, 2).map((cap, i) => (
            <span key={i} className="creator-tag">
              {cap}
            </span>
          ))}
          {creator.turnaround && (
            <span className="creator-tag" style={{ background: 'rgba(255, 255, 255, 0.8)', color: 'var(--text-tertiary)' }}>
              ⚡ {creator.turnaround}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="creator-card-footer">
          <span className="creator-location">{creator.location}</span>
          <span className="creator-cta-text">
            Explore Portfolio →
          </span>
        </div>
      </div>
    </article>
  );
}
