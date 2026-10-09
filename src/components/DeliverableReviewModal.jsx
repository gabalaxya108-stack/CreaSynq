// src/components/DeliverableReviewModal.jsx
// Part 11: Campaign Review and Approval — Brand Deliverable Review Modal

import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertCircle, ExternalLink, Download, 
  MessageSquare, Sparkles, CheckCircle2, RotateCcw, Send, FileText 
} from 'lucide-react';

export default function DeliverableReviewModal({ 
  isOpen, 
  onClose, 
  project, 
  onRequestRevision, 
  onApproveDeliverables,
  onOpenMessages 
}) {
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !project) return null;

  const handleSendRevision = (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      setErrorMsg('Please enter feedback notes describing the requested revision.');
      return;
    }

    if (onRequestRevision) {
      onRequestRevision(project.id, { revisionNotes: revisionNotes.trim() });
    }
    setIsRevisionMode(false);
    setRevisionNotes('');
    onClose();
  };

  const handleApprove = () => {
    if (onApproveDeliverables) {
      onApproveDeliverables(project.id, { approvalNotes: approvalNotes.trim() });
    }
    onClose();
  };

  const isSubmitted = project.status === 'submitted';
  const isApproved = project.status === 'approved' || project.status === 'completed';
  const isRevisionRequested = project.status === 'revision-requested';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
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
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
            <span className="section-label" style={{ color: 'var(--accent-lavender-deep)', marginBottom: 0 }}>
              Collaboration Deliverables Review
            </span>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: isApproved 
                ? 'rgba(16, 185, 129, 0.12)' 
                : isRevisionRequested 
                  ? 'rgba(245, 158, 11, 0.12)' 
                  : 'rgba(124, 58, 237, 0.12)',
              color: isApproved 
                ? '#059669' 
                : isRevisionRequested 
                  ? '#D97706' 
                  : 'var(--accent-lavender-deep)'
            }}>
              {isApproved && <CheckCircle2 size={13} />}
              {isRevisionRequested && <RotateCcw size={13} />}
              <span>{project.status.replace('-', ' ')}</span>
            </div>
          </div>

          <h2 className="font-editorial" style={{ fontSize: '2.2rem', margin: '0 0 6px 0' }}>
            {project.campaignTitle}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <span>Creator: <strong>{project.creatorName}</strong></span>
            <span>•</span>
            <span>Agreed Budget: <strong>{project.agreedBudget}</strong></span>
            <span>•</span>
            <span>{project.milestone}</span>
          </div>
        </div>

        {/* Deliverables Scope & Links Strip */}
        <div style={{ 
          padding: '16px 20px', 
          background: 'var(--bg-secondary)', 
          borderRadius: '14px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                Deliverables Scope
              </span>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {project.deliverablesScope}
              </p>
            </div>

            {project.submissionUrl && (
              <a 
                href={project.submissionUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={13} />
                <span>Open Master Assets Archive</span>
              </a>
            )}
          </div>

          {/* Submission Notes */}
          {project.submissionNotes && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                Creator Submission Notes:
              </span>
              <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                “{project.submissionNotes}”
              </p>
            </div>
          )}
        </div>

        {/* Visual Submission Previews */}
        {project.submissionPreviews && project.submissionPreviews.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <span className="sidebar-heading" style={{ marginBottom: '10px', display: 'block' }}>
              Delivered Asset Previews
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {project.submissionPreviews.map((imgUrl, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3', border: '1px solid var(--border-subtle)' }}>
                  <img src={imgUrl} alt={`Render pass ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback History Trail */}
        {project.feedbackHistory && project.feedbackHistory.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <span className="sidebar-heading" style={{ marginBottom: '10px', display: 'block' }}>
              Feedback & Communication Log
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.feedbackHistory.map((fb, idx) => (
                <div key={idx} style={{ padding: '12px 16px', background: '#FFFDF9', border: '1px solid var(--border-subtle)', borderRadius: '10px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{fb.author}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{fb.timestamp}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{fb.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revision Request Form Sub-Panel */}
        {isRevisionMode ? (
          <form onSubmit={handleSendRevision} style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <RotateCcw size={15} style={{ color: '#D97706' }} />
              <strong style={{ fontSize: '0.95rem', color: '#B45309' }}>Request Creative Revision</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              Be specific about adjustments to lighting, color grading, pacing, or formatting for {project.creatorName}.
            </p>

            <textarea
              rows={3}
              className="form-textarea"
              placeholder="e.g., The color grading on pass 2 is slightly cool. Please warm ambient tone to 3200K and increase bottle label contrast by 10%."
              value={revisionNotes}
              onChange={(e) => {
                setRevisionNotes(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              style={{ width: '100%', marginBottom: '10px' }}
            />

            {errorMsg && (
              <p style={{ color: '#EF4444', fontSize: '0.82rem', margin: '0 0 10px 0' }}>{errorMsg}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsRevisionMode(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                style={{ background: '#D97706', borderColor: '#D97706' }}
              >
                <Send size={13} />
                <span>Submit Revision Request to Creator</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* Action Buttons Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              if (onOpenMessages) onOpenMessages(project);
            }}
          >
            <MessageSquare size={14} />
            <span>Chat with {project.creatorName.split(' ')[0]}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isSubmitted && !isRevisionMode && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRevisionMode(true)}
                  style={{ color: '#B45309', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  <RotateCcw size={14} />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleApprove}
                  style={{ background: '#059669', borderColor: '#059669' }}
                >
                  <CheckCircle size={15} />
                  <span>Approve & Complete Campaign</span>
                </button>
              </>
            )}

            {isApproved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} />
                <span>Deliverables Approved & Payout Released</span>
              </div>
            )}

            {isRevisionRequested && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 500, fontSize: '0.88rem' }}>
                <RotateCcw size={16} />
                <span>Awaiting revised submission from {project.creatorName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
