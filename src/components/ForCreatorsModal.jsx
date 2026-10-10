import React from 'react';
import { X, ArrowRight, CheckCircle2, DollarSign, Globe, Sparkles } from 'lucide-react';

export default function ForCreatorsModal({ isOpen, onClose, onJoinCreator }) {
  if (!isOpen) return null;

  const points = [
    {
      title: "Portfolio-First Discovery",
      desc: "Get discovered directly for the visual quality of your synthetic work without resume friction or endless cold pitches."
    },
    {
      title: "High-Budget Commercial Briefs",
      desc: "Work with global brands, boutique fashion houses, and progressive agencies seeking bespoke AI visual direction."
    },
    {
      title: "Fair Direct Engagements",
      desc: "Retain your creative identity, showcase your custom generative pipelines, and collaborate with brands that value your craft."
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="section-label">For AI Creators</div>
          <h2 className="modal-title">Where Creators Meet Opportunity</h2>
          <p className="modal-subtitle">
            Alloy is built creator-first. We celebrate the artists shaping the future of diffusion, spatial 3D, and narrative AI.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
          {points.map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent-peach-deep)', marginTop: '2px' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{pt.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Explore Roster
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onJoinCreator();
            }}
          >
            <span>Join as a Creator</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
