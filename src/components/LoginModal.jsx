// src/components/LoginModal.jsx
// ALLOY — Luxury Blended Editorial Login & Workspace Entry Modal
// Seamless integration of Google OAuth, role preselection, 
// protected action notices, and 1-click evaluation demos.

import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, Palette, ArrowRight, ShieldCheck, 
  Mail, Lock, UserPlus, AlertCircle, Loader, Sparkles, Check 
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
  const [authMode, setAuthMode] = useState('signup'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole || 'brand'); // 'brand' | 'creator'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDemoFallbackOpen, setIsDemoFallbackOpen] = useState(false);

  // Synchronize initial role when modal is opened for a specific target action
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  // Initiates Google OAuth with preselected role
  const handleGoogleSignIn = async () => {
    if (!selectedRole || (selectedRole !== 'brand' && selectedRole !== 'creator')) {
      setErrorMsg('Please select a workspace role (Brand or Creator) before continuing.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsDemoFallbackOpen(false);
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
      setLoading(false);
      // If Supabase keys are not configured in local environment, offer instant demo entry
      if (err.message && err.message.includes('Supabase')) {
        setIsDemoFallbackOpen(true);
      } else {
        setErrorMsg(err.message || 'Google Authentication encountered an error. Please try email sign in.');
      }
    }
  };

  // 1-Click Demo Evaluation Sign In
  const handleQuickDemoEnter = (roleToEnter) => {
    const role = roleToEnter || selectedRole || 'brand';
    if (role === 'brand' && onLoginBrand) {
      onLoginBrand();
    } else if (onLoginCreator) {
      onLoginCreator();
    }
    if (onClose) onClose();
  };

  // Credentials submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsDemoFallbackOpen(false);
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
            COLUMN 1: High-Contrast, Elegant Auth Form (Compact Single Page)
            ======================================================== */}
        <div className="alloy-login-form-col">
          
          {/* Brand Wordmark & Eyebrow Row */}
          <div className="alloy-login-brand-header">
            <div className="alloy-login-brand-row">
              <img 
                src="/assets/alloy-wordmark.webp" 
                alt="Alloy" 
                className="alloy-login-logo-img" 
              />
              <div className="alloy-login-pill">
                <Sparkles size={10} className="pill-star" />
                <span>WORKSPACE ENTRY</span>
              </div>
            </div>
            
            <h2 id="login-modal-title" className="alloy-login-headline font-editorial">
              {authMode === 'signup' ? 'Create Your Account' : 'Sign In to Alloy'}
            </h2>
          </div>

          {/* Pending Action Callout Notice (if triggered by a protected action) */}
          {pendingActionNotice && (
            <div className="alloy-pending-notice">
              <ShieldCheck size={13} className="notice-icon" />
              <span>{pendingActionNotice}</span>
            </div>
          )}

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div className="alloy-auth-toggle-bar">
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signin' ? 'is-active' : ''}`}
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); setIsDemoFallbackOpen(false); }}
              id="auth-tab-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signup' ? 'is-active' : ''}`}
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); setIsDemoFallbackOpen(false); }}
              id="auth-tab-signup"
            >
              Create Account
            </button>
          </div>

          {/* Role Preselection / Selector (Inline) */}
          <div className="auth-role-select-group">
            <div className="auth-role-picker">
              <button
                type="button"
                className={`role-pill-btn ${selectedRole === 'brand' ? 'is-selected' : ''}`}
                onClick={() => setSelectedRole('brand')}
              >
                <Briefcase size={13} />
                <span>Brand Studio</span>
                {selectedRole === 'brand' && <Check size={11} className="role-check" />}
              </button>

              <button
                type="button"
                className={`role-pill-btn ${selectedRole === 'creator' ? 'is-selected' : ''}`}
                onClick={() => setSelectedRole('creator')}
              >
                <Palette size={13} />
                <span>Creator Studio</span>
                {selectedRole === 'creator' && <Check size={11} className="role-check" />}
              </button>
            </div>
          </div>

          {/* Google OAuth Action Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-google-oauth"
          >
            {loading ? (
              <Loader size={14} className="auth-spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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

          {/* Fallback Notice for Unconfigured Supabase OAuth */}
          {isDemoFallbackOpen && (
            <div className="demo-oauth-notice-banner">
              <div className="notice-banner-text">
                <p>Google OAuth requires Supabase in <code>.env</code>.</p>
              </div>
              <button
                type="button"
                className="btn-demo-quick-action"
                onClick={() => handleQuickDemoEnter(selectedRole)}
              >
                <span>Demo {selectedRole === 'brand' ? 'Brand' : 'Creator'} →</span>
              </button>
            </div>
          )}

          {/* Form Divider */}
          <div className="alloy-auth-divider">
            <span>{authMode === 'signup' ? 'Or Enter Account Details' : 'Or Sign In with Email'}</span>
          </div>

          {/* Error / Success Messages */}
          {errorMsg && (
            <div className="auth-alert alert-error">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg('')} className="alert-close-btn">
                <X size={12} />
              </button>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert alert-success">
              <ShieldCheck size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="alloy-auth-form">
            {authMode === 'signup' && (
              <div className="auth-input-container">
                <UserPlus size={14} className="auth-input-icon" />
                <input 
                  id="auth-name"
                  type="text" 
                  className="auth-text-input" 
                  placeholder="Full Name / Studio Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-container">
              <Mail size={14} className="auth-input-icon" />
              <input 
                id="auth-email"
                type="email" 
                className="auth-text-input" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-container">
              <Lock size={14} className="auth-input-icon" />
              <input 
                id="auth-password"
                type="password" 
                className="auth-text-input" 
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn" disabled={loading} id="auth-submit-btn">
              {loading ? (
                <>
                  <Loader size={14} className="auth-spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signup' ? 'Create Account & Enter' : 'Continue to Workspace'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Instant Demo Bar */}
          <div className="alloy-demo-bar">
            <span className="demo-bar-label">Instant Demo:</span>
            <div className="demo-bar-actions">
              <button
                type="button"
                className="demo-pill-btn brand-demo"
                id="demo-login-brand-btn"
                onClick={() => handleQuickDemoEnter('brand')}
              >
                <Briefcase size={12} />
                <span>Lumina Botanica</span>
              </button>

              <button
                type="button"
                className="demo-pill-btn creator-demo"
                id="demo-login-creator-btn"
                onClick={() => handleQuickDemoEnter('creator')}
              >
                <Palette size={12} />
                <span>Maya Chen</span>
              </button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="alloy-auth-footer-badge">
            <ShieldCheck size={12} className="badge-shield-icon" />
            <span>Isolated multi-tenant workspace security</span>
          </div>

        </div>

        {/* ========================================================
            COLUMN 2: Seamlessly Blended Visual Showcase
            ======================================================== */}
        <div className="alloy-login-visual-col">
          <div className="visual-blended-frame">
            <div className="visual-sculpture-wrapper">
              <img 
                src="/assets/alloy-emblem-transparent.png" 
                alt="Alloy Intertwined Creative Sculpture" 
                className="blended-sculpture-img"
              />
            </div>
            
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
