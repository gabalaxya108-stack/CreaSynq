// src/components/CreatorComparisonModal.jsx
// Side-by-Side Creator Comparison against Campaign Requirements
// Allows brands to compare 2 or 3 creators across all 6 CreaMatch dimensions and Creator DNA

import React, { useState, useEffect } from 'react';
import { 
  X, Check, Sparkles, Send, Bookmark, ExternalLink, 
  Layers, CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react';
import { calculateCreaMatch } from '../intelligence/matchingEngine';
import { explainMatch } from '../intelligence/matchExplainer';
import { generateCreatorDNA } from '../intelligence/creatorDNA';

export default function CreatorComparisonModal({ 
  isOpen, 
  onClose, 
  campaign, 
  creators = [],
  initialCreatorIds = ['maya-chen', 'zora-vance', 'kai-sorenson'],
  onInviteCreator,
  onOpenCreaSim,
  onViewProfile,
  onToggleShortlist,
  isShortlisted = () => false
}) {
  const [selectedIds, setSelectedIds] = useState(initialCreatorIds.slice(0, 3));

  useEffect(() => {
    if (initialCreatorIds && initialCreatorIds.length > 0) {
      setSelectedIds(initialCreatorIds.slice(0, 3));
    }
  }, [isOpen, initialCreatorIds]);

  if (!isOpen || !campaign) return null;

  const comparedCreators = selectedIds
    .map(id => creators.find(c => c.id === id))
    .filter(Boolean);

  const availableToAdd = creators.filter(c => !selectedIds.includes(c.id));

  const handleAddCreator = (id) => {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveCreator = (id) => {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1100px', width: '96vw', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="live-pulse-dot" />
            <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-lavender-deep)' }}>
              CreaMatch™ Intelligence
            </span>
          </div>

          <h2 className="font-editorial" style={{ fontSize: '2.4rem', margin: '0 0 6px 0' }}>
            Side-by-Side Creator Comparison
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
              Evaluating compatibility against: <strong>{campaign.title}</strong>
            </p>

            {availableToAdd.length > 0 && selectedIds.length < 3 && (
              <select 
                className="form-input" 
                style={{ padding: '6px 12px', fontSize: '0.84rem', width: 'auto' }}
                onChange={(e) => {
                  if (e.target.value) handleAddCreator(e.target.value);
                }}
                value=""
              >
                <option value="">+ Add creator to compare…</option>
                {availableToAdd.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.specialty})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Comparison Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${comparedCreators.length}, 1fr)`, 
          gap: '20px',
          alignItems: 'stretch'
        }}>
          {comparedCreators.map((creator) => {
            const match = calculateCreaMatch(campaign, creator);
            const explanation = explainMatch(campaign, creator);
            const dna = generateCreatorDNA(creator);
            const shortlisted = isShortlisted(creator.id);

            return (
              <div 
                key={creator.id} 
                className="studio-card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '20px',
                  borderRadius: '16px',
                  border: match.score >= 90 ? '2px solid var(--accent-lavender-deep)' : '1px solid var(--border-subtle)'
                }}
              >
                {/* Header & Removal */}
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3', marginBottom: '12px' }}>
                    <img 
                      src={creator.heroWork} 
                      alt={creator.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {selectedIds.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCreator(creator.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'rgba(20, 19, 18, 0.75)',
                        color: '#FFFFFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      title="Remove from comparison"
                    >
                      ×
                    </button>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{creator.name}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{creator.creativeIdentity}</p>
                    </div>
                  </div>
                </div>

                {/* Score Header */}
                <div style={{ 
                  padding: '12px 14px', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '12px',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {match.score}/100
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-lavender-deep)' }}>
                    {match.fitLabel}
                  </span>
                </div>

                {/* Dimension Breakdown Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Creative Style (25)</span>
                    <strong>{match.breakdown.styleScore}/25</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Portfolio Relevance (25)</span>
                    <strong>{match.breakdown.portfolioScore}/25</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Format Fit (15)</span>
                    <strong>{match.breakdown.formatScore}/15</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Industry Experience (15)</span>
                    <strong>{match.breakdown.industryScore}/15</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Platform Fit (10)</span>
                    <strong>{match.breakdown.platformScore}/10</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Availability & Budget (10)</span>
                    <strong>{match.breakdown.availabilityScore}/10</strong>
                  </div>
                </div>

                {/* Creator DNA Provenance */}
                <div style={{ 
                  padding: '12px', 
                  background: '#FFFDF9', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '16px',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>
                    Creator DNA Traits
                  </span>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {dna.visualAesthetic}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-mint-deep)' }}>
                    ✓ {dna.provenance.portfolioSupported.totalVerifiedProjects} Verified Projects in Dossier
                  </span>
                </div>

                {/* Top Alignment Highlight */}
                <div style={{ flex: 1, marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>
                    Key Alignment
                  </span>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    "{explanation.highlights[0] || 'Verified commercial generative capability.'}"
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'center' }}
                      onClick={() => onOpenCreaSim && onOpenCreaSim(creator)}
                    >
                      <Sparkles size={12} />
                      <span>CreaSim</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'center' }}
                      onClick={() => onViewProfile && onViewProfile(creator.id)}
                    >
                      <span>Dossier</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      onClose();
                      if (onInviteCreator) onInviteCreator(creator);
                    }}
                  >
                    <Send size={12} />
                    <span>Invite {creator.name.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
