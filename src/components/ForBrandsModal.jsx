import React from 'react';
import { X, ArrowRight, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function ForBrandsModal({ isOpen, onClose, onStartCampaign }) {
  if (!isOpen) return null;

  const points = [
    {
      title: "Direct Access to Pre-Vetted AI Creators",
      desc: "Skip generic agency markups. Discover specialized creators in fashion, product commercial CGI, and narrative storytelling."
    },
    {
      title: "Commercial-Grade Production Quality",
      desc: "Our creators deliver high-resolution master assets ready for print, OOH billboards, digital media, and social campaigns."
    },
    {
      title: "Fast Turnarounds (48h – 5 Days)",
      desc: "AI workflows compress creative iteration cycles from weeks into days while maintaining exacting art direction."
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="section-label">For Brands & Agencies</div>
          <h2 className="modal-title">Bring Your Next Campaign to Life</h2>
          <p className="modal-subtitle">
            CreaSynq connects creative directors and brands with exceptional AI creators who master generative tools.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
          {points.map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent-lavender-deep)', marginTop: '2px' }}>
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
            Browse Creators
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onStartCampaign();
            }}
          >
            <span>Create a Campaign</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
