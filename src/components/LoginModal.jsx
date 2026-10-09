// src/components/LoginModal.jsx
// ALLOY — Luxury Blended Editorial Login & Workspace Entry Modal
// Seamless integration of Google OAuth, role-aware preselection, 
// protected action notices, and 1-click evaluation demos.

import React, { useState, useEffect } from 'react';
import { 
  X, LogIn, Briefcase, Palette, ArrowRight, ShieldCheck, 
  Mail, Lock, UserPlus, Database, AlertCircle, Loader, Sparkles 
} from 'lucide-react';
import { signIn, signUp, signInWithGoogle, getBackendStatus } from '../services/marketplaceBackend';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onLoginBrand, 
  onLoginCreator,
  onLoginSuccess,
  initialRole = 'brand',
  pendingActionNotice = null
}) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole || 'brand'); // 'brand' | 'creator'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Synchronize initial role when modal is opened for a specific target action
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const backendStatus = getBackendStatus();

  // Initiates Google OAuth with preselected role
  const handleGoogleSignIn = async () => {
    if (!selectedRole || (selectedRole !== 'brand' && selectedRole !== 'creator')) {
      setErrorMsg('Please select a workspace role (Brand or Creator) before continuing.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const targetRole = selectedRole;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('creasync_intended_role', targetRole);
          localStorage.setItem('creasync_intended_role', targetRole);
          localStorage.setItem('creasync_active_role', targetRole);
        } catch (e) {}
      }

      await signInWithGoogle({ role: targetRole });
      // When Supabase is configured with Google OAuth, browser redirects to Google.
    } catch (err) {
      setErrorMsg(err.message || 'Google Authentication encountered an error. Please verify your credentials or try email sign in.');
      setLoading(false);
    }
  };

  // Credentials submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const result = await signUp(email, password, selectedRole, displayName);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('creasync_active_role', selectedRole);
          } catch (e) {}
        }
        setSuccessMsg('Account created successfully! Connecting to workspace...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result?.user, selectedRole);
          } else if (selectedRole === 'brand') {
            onLoginBrand(result?.user);
          } else {
            onLoginCreator(result?.user);
          }
        }, 600);
      } else {
        const result = await signIn(email, password);
        const role = result?.user?.profile?.role || selectedRole;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('creasync_active_role', role);
          } catch (e) {}
        }
        if (onLoginSuccess) {
          onLoginSuccess(result?.user, role);
        } else if (role === 'brand') {
          onLoginBrand(result?.user);
        } else {
          onLoginCreator(result?.user);
        }
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
          
          {/* Brand Wordmark & Eyebrow */}
          <div className="alloy-login-brand-header">
            <span className="alloy-login-logo">A L L O Y</span>
            <div className="alloy-login-pill">
              <Sparkles size={11} className="pill-star" />
              <span>WORKSPACE ENTRY</span>
            </div>
            
            <h2 id="login-modal-title" className="alloy-login-headline font-editorial">
              {authMode === 'signup' ? 'Create Your Account' : 'Sign In to ALLOY'}
            </h2>
            
            <p className="alloy-login-subtext">
              {authMode === 'signup' 
                ? 'Join our network of verified AI creators and forward-thinking brands.'
                : 'Access your persistent workspace, campaign brief, or creator studio.'}
            </p>
          </div>

          {/* Pending Action Callout Notice (if triggered by a protected action) */}
          {pendingActionNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(33, 76, 53, 0.08)',
              border: '1px solid rgba(33, 76, 53, 0.22)',
              borderRadius: '10px',
              color: '#214C35',
              fontSize: '0.84rem',
              fontWeight: 500,
              marginBottom: '14px'
            }}>
              <ShieldCheck size={16} style={{ color: '#214C35', flexShrink: 0 }} />
              <span>{pendingActionNotice}</span>
            </div>
          )}

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div className="alloy-auth-toggle-bar">
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signin' ? 'is-active' : ''}`}
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
              id="auth-tab-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signup' ? 'is-active' : ''}`}
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
              id="auth-tab-signup"
            >
              Create Account
            </button>
          </div>

          {/* Role Preselection / Selector (Brand Studio vs Creator Studio) */}
          <div style={{ marginBottom: '14px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#2A2622', fontWeight: 600 }}>
                Select Workspace Role:
              </span>
              <span style={{ fontSize: '0.74rem', color: '#767069' }}>
                {selectedRole === 'brand' ? 'Brand Studio' : 'Creator Studio'}
              </span>
            </div>
            
            <div className="auth-role-picker">
              <label className={`role-pill-option ${selectedRole === 'brand' ? 'is-selected' : ''}`}>
                <input 
                  type="radio" 
                  name="login-role" 
                  value="brand" 
                  checked={selectedRole === 'brand'} 
                  onChange={() => setSelectedRole('brand')}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={14} />
                  <span>Brand Studio</span>
                </span>
              </label>

              <label className={`role-pill-option ${selectedRole === 'creator' ? 'is-selected' : ''}`}>
                <input 
                  type="radio" 
                  name="login-role" 
                  value="creator" 
                  checked={selectedRole === 'creator'} 
                  onChange={() => setSelectedRole('creator')}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={14} />
                  <span>Creator Studio</span>
                </span>
              </label>
            </div>
          </div>

          {/* Google OAuth Action Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '11px 16px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#191816',
              border: '1.5px solid #D5CCC0',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '14px',
              transition: 'all 0.18s ease',
              boxShadow: '0 2px 6px rgba(26, 25, 24, 0.04)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <Loader size={16} className="auth-spinner" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>
              {loading 
                ? 'Connecting...' 
                : authMode === 'signup' 
                  ? `Sign up with Google as ${selectedRole === 'brand' ? 'Brand' : 'Creator'}` 
                  : `Continue with Google as ${selectedRole === 'brand' ? 'Brand' : 'Creator'}`}
            </span>
          </button>

          {/* 1-Click Instant Demo Accounts (Sign In Mode) */}
          {authMode === 'signin' && (
            <div className="alloy-demo-panel">
              <span className="demo-panel-title">Instant 1-Click Workspace Demo</span>
              <div className="demo-card-grid">
                <button
                  type="button"
                  className="demo-choice-card brand-choice"
                  id="demo-login-brand-btn"
                  onClick={() => {
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
                  id="demo-login-creator-btn"
                  onClick={() => {
                    onLoginCreator();
                  }}
                >
                  <div className="demo-icon-wrap creator-icon-wrap">
                    <Palette size={16} />
                  </div>
                  <div className="demo-text-wrap">
                    <span className="demo-name">Maya Chen</span>
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

          {/* Credentials Form */}
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

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn" disabled={loading} id="auth-submit-btn">
              {loading ? (
                <>
                  <Loader size={16} className="auth-spinner" style={{ animation: 'spin 1s linear infinite' }} />
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
          <div className="alloy-auth-footer-badge" style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.74rem', color: '#8F8880' }}>
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
