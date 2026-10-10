import React, { useState } from 'react';
import { X, Check, Sparkles, Send } from 'lucide-react';

export default function CreatorJoinModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    specialty: 'Fashion & Editorial',
    portfolioUrl: '',
    tools: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <>
            <div className="modal-header">
              <div className="section-label">Creator Onboarding</div>
              <h2 className="modal-title">Join as a Creator</h2>
              <p className="modal-subtitle">
                Showcase your generative portfolio to premier brands and creative agencies looking for exceptional AI talent.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Creator Handle</label>
                  <input
                    type="text"
                    required
                    placeholder="@maya.ai"
                    className="form-input"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Creative Specialty</label>
                <select
                  className="form-select"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                >
                  <option>Fashion & Editorial</option>
                  <option>Product Advertising</option>
                  <option>Cinematic Narrative</option>
                  <option>Surreal 3D & Spatial</option>
                  <option>Digital Humans & Character Design</option>
                  <option>Beauty & Cosmetics</option>
                  <option>Motion Design & VFX</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio URL or Social Showcase</label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/... or personal site"
                  className="form-input"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Tools / Diffusion Pipelines</label>
                <input
                  type="text"
                  placeholder="e.g. Midjourney v6, Runway Gen-3, ComfyUI, Kling AI"
                  className="form-input"
                  value={formData.tools}
                  onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="creator@studio.com"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Submit Application</span>
                  <Send size={15} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-peach-light)', color: 'var(--accent-peach-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Check size={28} />
            </div>
            <h2 className="modal-title">Application Received!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Welcome to Alloy, <strong>{formData.name}</strong>. Our curator team reviews portfolios weekly. You'll receive profile activation details at <strong>{formData.email}</strong>.
            </p>
            <button type="button" className="btn btn-primary" onClick={handleReset}>
              Explore Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
