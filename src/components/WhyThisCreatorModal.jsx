// src/components/WhyThisCreatorModal.jsx
// Explainable CreaScore & Grounded Match Rationale Modal

import React from 'react';
import { X, Check, AlertCircle, Sparkles, Send, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { explainMatch } from '../intelligence/matchExplainer';

export default function WhyThisCreatorModal({ 
  isOpen, 
  onClose, 
  creator, 
  campaign, 
  onInviteCreator, 
  onViewProfile 
}) {
  if (!isOpen || !creator || !campaign) return null;

  const explanation = explainMatch(campaign, creator);
  if (!explanation) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content why-creator-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
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
        <div className="why-modal-header" style={{ paddingBottom: '18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-pulse-dot" />
              <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-lavender-deep)' }}>
                CreaScore™ Explainability Engine
              </span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(124, 58, 237, 0.12)',
              color: 'var(--accent-lavender-deep)'
            }}>
              <Sparkles size={12} />
              <span>{explanation.fitLabel}</span>
            </div>
          </div>

          <h2 className="modal-title font-editorial" style={{ fontSize: '2.4rem', margin: '4px 0 8px 0' }}>
            Why {creator.name.split(' ')[0]}?
          </h2>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Evaluating against: <strong>{campaign.title}</strong>
          </div>
        </div>

        {/* Bespoke Rationale Summary */}
        <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: '14px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
            "{explanation.summary}"
          </p>
        </div>

        {/* 6 Dimension Fit Breakdown Grid */}
        <div style={{ marginBottom: '22px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '10px' }}>
            Compatibility Dimensions
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ padding: '12px 14px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '3px' }}>Creative Style</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{explanation.dimensions.creativeStyle}</strong>
            </div>

            <div style={{ padding: '12px 14px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '3px' }}>Portfolio Relevance</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{explanation.dimensions.portfolioRelevance}</strong>
            </div>

            <div style={{ padding: '12px 14px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '3px' }}>Content Format</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{explanation.dimensions.contentFormat}</strong>
            </div>

            <div style={{ padding: '12px 14px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '3px' }}>Industry Experience</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{explanation.dimensions.industryFit}</strong>
            </div>

            <div style={{ padding: '12px 14px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '3px' }}>Platform Distribution</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{explanation.dimensions.platformFit}</strong>
            </div>

            <div style={{ padding: '12px 14px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '3px' }}>Availability / Budget</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{explanation.dimensions.budgetAvailability}</strong>
            </div>
          </div>
        </div>

        {/* Verified Evidence Highlights */}
        <div style={{ marginBottom: '22px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '10px' }}>
            Verified Alignment Evidence
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {explanation.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-mint)', flexShrink: 0, marginTop: '2px' }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Gap / Creative Nuance */}
        {explanation.potentialGap && (
          <div style={{ padding: '14px 18px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#B45309', display: 'block', marginBottom: '3px' }}>
                  Creative Nuance to Consider
                </strong>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {explanation.potentialGap}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              if (onViewProfile) onViewProfile(creator.id);
            }}
          >
            <span>View Creator Portfolio</span>
            <ArrowRight size={14} />
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              onClose();
              if (onInviteCreator) onInviteCreator(creator);
            }}
          >
            <Send size={15} />
            <span>Invite {creator.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
