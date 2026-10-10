import React from 'react';
import { X, Briefcase, Palette, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RoleSelectModal({ 
  isOpen, 
  onClose, 
  onSelectBrand, 
  onSelectCreator 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <div className="role-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="role-modal-header">
          <div className="section-tag-pill">
            <Sparkles size={13} className="text-lavender" />
            <span>Get Started with CreaSync</span>
          </div>
          <h2 id="role-modal-title" className="role-modal-title">
            How would you like to use CreaSync?
          </h2>
          <p className="role-modal-desc">
            Choose your workspace to get started. You can explore both experiences at any time.
          </p>
        </div>

        <div className="role-options-grid">
          {/* Option 1: Brand / Agency */}
          <div 
            className="role-option-card brand-option"
            id="role-select-brand-card"
            tabIndex={0}
            role="button"
            onClick={() => {
              onClose();
              onSelectBrand();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onClose();
                onSelectBrand();
              }
            }}
          >
            <div className="role-icon-box brand-icon-box">
              <Briefcase size={24} />
            </div>
            <div className="role-badge-pill">For Brands & Agencies</div>
            <h3 className="role-title">I want to hire</h3>
            <p className="role-explanation">
              Describe your campaign, discover matched creators, review creative concept directions, 
              and manage collaborations from brief to final delivery.
            </p>
            <ul className="role-features-mini">
              <li><CheckCircle2 size={13} /> CreaMatch portfolio recommendation</li>
              <li><CheckCircle2 size={13} /> Pre-invitation concept previews (CreaSim)</li>
              <li><CheckCircle2 size={13} /> Centralized campaign management</li>
            </ul>
            <div className="role-btn-wrap">
              <span className="btn btn-primary btn-sm role-cta-btn">
                <span>Enter Brand Studio</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Option 2: AI Creator */}
          <div 
            className="role-option-card creator-option"
            id="role-select-creator-card"
            tabIndex={0}
            role="button"
            onClick={() => {
              onClose();
              onSelectCreator();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onClose();
                onSelectCreator();
              }
            }}
          >
            <div className="role-icon-box creator-icon-box">
              <Palette size={24} />
            </div>
            <div className="role-badge-pill">For AI Artists & Directors</div>
            <h3 className="role-title">I'm a creator</h3>
            <p className="role-explanation">
              Build your public portfolio, generate your Creator DNA, discover tailored campaign opportunities, 
              and work directly with forward-thinking brands.
            </p>
            <ul className="role-features-mini">
              <li><CheckCircle2 size={13} /> High-fidelity portfolio presentation</li>
              <li><CheckCircle2 size={13} /> Automated Creator DNA mapping</li>
              <li><CheckCircle2 size={13} /> Direct brand invitations & messaging</li>
            </ul>
            <div className="role-btn-wrap">
              <span className="btn btn-secondary btn-sm role-cta-btn">
                <span>Enter Creator Studio</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
