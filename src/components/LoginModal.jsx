// src/components/LoginModal.jsx
// ALLOY — Luxury Blended Login & Account Creation Modal
// Features:
// - Seamlessly blended artwork of the ALLOY sculpture & creative ecosystem
// - High-contrast, crisp typography for maximum legibility
// - Full preservation of Supabase / mock backend authentication, instant 1-click demos, and role routing

import React, { useState } from 'react';
import { X, LogIn, Briefcase, Palette, ArrowRight, ShieldCheck, Mail, Lock, UserPlus, Database, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { signIn, signUp, getBackendStatus } from '../services/marketplaceBackend';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onLoginBrand, 
  onLoginCreator 
}) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState('brand'); // 'brand' | 'creator'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const backendStatus = getBackendStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const result = await signUp(email, password, selectedRole, displayName);
        setSuccessMsg('Account created successfully! Connecting to workspace...');
        setTimeout(() => {
          if (selectedRole === 'brand') {
            onLoginBrand(result?.user);
          } else {
            onLoginCreator(result?.user);
          }
          onClose();
        }, 600);
      } else {
        const result = await signIn(email, password);
        const role = result?.user?.profile?.role || selectedRole;
        if (role === 'brand') {
          onLoginBrand(result?.user);
        } else {
          onLoginCreator(result?.user);
        }
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="alloy-modal-backdrop" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="login-modal-title"
    >
      <div className="alloy-login-card-editorial" onClick={(e) => e.stopPropagation()}>
        
        {/* Floating Close Button */}
        <button 
          type="button" 
          className="alloy-modal-close" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* ========================================================
            COLUMN 1: High-Contrast, Elegant Auth Form
            ======================================================== */}
        <div className="alloy-login-form-col">
          
          {/* Brand Wordmark & Header */}
          <div className="alloy-login-brand-header">
            <span className="alloy-login-logo">A L L O Y</span>
            <div className="alloy-login-pill">
              <Sparkles size={11} className="pill-star" />
              <span>WORKSPACE ENTRY</span>
            </div>
            
            <h2 id="login-modal-title" className="alloy-login-headline font-editorial">
              {authMode === 'signup' ? 'Create Your Account' : 'Welcome to ALLOY'}
            </h2>
            
            <p className="alloy-login-subtext">
              {authMode === 'signup' 
                ? 'Join our network of verified AI creators and forward-thinking brands.'
                : 'Sign in to access your persistent campaigns, creator DNA, and production hub.'}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div className="alloy-auth-toggle-bar">
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signin' ? 'is-active' : ''}`}
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signup' ? 'is-active' : ''}`}
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Instant Demo Accounts (Sign In Mode) */}
          {authMode === 'signin' && (
            <div className="alloy-demo-panel">
              <span className="demo-panel-title">Instant 1-Click Workspace Demo</span>
              <div className="demo-card-grid">
                <button
                  type="button"
                  className="demo-choice-card brand-choice"
                  onClick={() => {
                    onClose();
                    onLoginBrand();
                  }}
                >
                  <div className="demo-icon-wrap brand-icon-wrap">
                    <Briefcase size={16} />
                  </div>
                  <div className="demo-text-wrap">
                    <span className="demo-name">Lumina Botanica</span>
                    <span className="demo-role">Brand Campaign Studio</span>
                  </div>
                  <ArrowRight size={13} className="demo-arrow" />
                </button>

                <button
                  type="button"
                  className="demo-choice-card creator-choice"
                  onClick={() => {
                    onClose();
                    onLoginCreator();
                  }}
                >
                  <div className="demo-icon-wrap creator-icon-wrap">
                    <Palette size={16} />
                  </div>
                  <div className="demo-text-wrap">
                    <span className="demo-name">Elena Rostova</span>
                    <span className="demo-role">AI Creator Studio</span>
                  </div>
                  <ArrowRight size={13} className="demo-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* Form Divider */}
          <div className="alloy-auth-divider">
            <span>{authMode === 'signup' ? 'Or Enter Account Details' : 'Or Sign In with Email'}</span>
          </div>

          {/* Error / Success Messages */}
          {errorMsg && (
            <div className="auth-alert alert-error">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert alert-success">
              <ShieldCheck size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="alloy-auth-form">
            {authMode === 'signup' && (
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="auth-name">
                  Full Name / Studio Name
                </label>
                <div className="auth-input-container">
                  <UserPlus size={16} className="auth-input-icon" />
                  <input 
                    id="auth-name"
                    type="text" 
                    className="auth-text-input" 
                    placeholder="e.g. Alex Rivera or Studio Lumina"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="auth-email">
                Email Address
              </label>
              <div className="auth-input-container">
                <Mail size={16} className="auth-input-icon" />
                <input 
                  id="auth-email"
                  type="email" 
                  className="auth-text-input" 
                  placeholder="name@company.com or creator@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="auth-password">
                Password
              </label>
              <div className="auth-input-container">
                <Lock size={16} className="auth-input-icon" />
                <input 
                  id="auth-password"
                  type="password" 
                  className="auth-text-input" 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Role Radio Picker */}
            <div className="auth-field-group">
              <label className="auth-field-label">Select Workspace Role</label>
              <div className="auth-role-picker">
                <label className={`role-pill-option ${selectedRole === 'brand' ? 'is-selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="alloy-role" 
                    value="brand" 
                    checked={selectedRole === 'brand'} 
                    onChange={() => setSelectedRole('brand')}
                  />
                  <span>Brand Studio</span>
                </label>

                <label className={`role-pill-option ${selectedRole === 'creator' ? 'is-selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="alloy-role" 
                    value="creator" 
                    checked={selectedRole === 'creator'} 
                    onChange={() => setSelectedRole('creator')}
                  />
                  <span>Creator Studio</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader size={16} className="auth-spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signup' ? 'Create Account & Enter' : 'Continue to Workspace'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="alloy-auth-footer-badge">
            <ShieldCheck size={13} className="badge-shield-icon" />
            <span>Isolated multi-tenant workspace security</span>
          </div>

        </div>

        {/* ========================================================
            COLUMN 2: Seamlessly Blended Visual Showcase
            ======================================================== */}
        <div className="alloy-login-visual-col">
          <div className="visual-blended-frame">
            <img 
              src="/assets/alloy-login-sculpture.png" 
              alt="ALLOY Creative Fusion Artwork" 
              className="blended-sculpture-img"
            />
            
            {/* Soft Ambient Blend Overlay */}
            <div className="visual-ambient-overlay" aria-hidden="true" />
            
            {/* Elegant Editorial Quote Badge */}
            <div className="visual-quote-badge">
              <span className="quote-eyebrow">THE ALLOY CONCEPT</span>
              <p className="quote-text font-editorial">
                “Creativity and technology intertwined to connect visionary brands with world-class AI creators.”
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
