// src/components/InviteModal.jsx
// Compact, editorial Creator Invitation flow & confirmation experience

import React, { useState } from 'react';
import { X, Check, Send, Sparkles, ArrowRight, Eye } from 'lucide-react';

export default function InviteModal({ 
  isOpen, 
  onClose, 
  creator, 
  activeCampaign,
  onInvitationSent,
  onViewCampaign 
}) {
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !creator) return null;

  const campaignTitle = activeCampaign?.title || 'Summer Skincare & Radiant Hydration Launch';
  const selectedWorkImg = creator.projects?.[0]?.image || creator.heroWork;

  const handleSend = (e) => {
    e.preventDefault();
    setIsSent(true);
    if (onInvitationSent) {
      onInvitationSent(creator, message || `Your cinematic product work feels exactly right for our ${campaignTitle} launch.`);
    }
  };

  const handleClose = () => {
    setIsSent(false);
    setMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content invite-modal-compact"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {!isSent ? (
          <>
            {/* Modal Header */}
            <div className="invite-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="live-pulse-dot" />
                <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-lavender-deep)' }}>
                  Creator Collaboration
                </span>
              </div>
              <h2 className="modal-title font-editorial" style={{ fontSize: '2.2rem' }}>
                Invite to Campaign
              </h2>
            </div>

            {/* Creator & Selected Work Showcase Strip */}
            <div className="invite-creator-hero-strip">
              <div className="invite-creator-visual-preview">
                <img 
                  src={selectedWorkImg} 
                  alt={`${creator.name}'s work`} 
                  className="invite-work-thumbnail"
                />
              </div>

              <div className="invite-creator-meta-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="invite-avatar-img" 
                  />
                  <div>
                    <h3 className="invite-creator-fullname">{creator.name}</h3>
                    <p className="invite-creator-identity">{creator.creativeIdentity}</p>
                  </div>
                </div>

                <div className="invite-campaign-context-pill">
                  <span className="invite-campaign-label">Campaign:</span>
                  <span className="invite-campaign-name">{campaignTitle}</span>
                </div>
              </div>
            </div>

            {/* Message Form */}
            <form onSubmit={handleSend} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                  Why would you like to work with this creator?
                </label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  placeholder="Your cinematic product work feels exactly right for our upcoming launch…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-actions-footer" style={{ marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <span>Send Invitation</span>
                  <Send size={14} />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Part 10 Confirmation State */
          <div className="invite-confirmation-state">
            <div className="confirmation-badge-circle">
              <Check size={26} />
            </div>

            <h2 className="modal-title font-editorial" style={{ fontSize: '2.3rem', marginBottom: '10px' }}>
              Invitation sent.
            </h2>

            <p className="confirmation-body-text">
              <strong>{creator.name}</strong> has been invited to your <strong>{campaignTitle}</strong> campaign.
            </p>

            <div className="confirmation-actions-row">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  handleClose();
                  if (onViewCampaign) onViewCampaign();
                }}
              >
                <span>View Campaign</span>
                <ArrowRight size={14} />
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
              >
                Keep Exploring
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
