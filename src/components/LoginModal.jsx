import React, { useState, useEffect } from 'react';
import { X, LogIn, Briefcase, Palette, ArrowRight, ShieldCheck, Mail, Lock, UserPlus, Database, AlertCircle, Loader } from 'lucide-react';
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

  // Synchronize initial role when modal is opened for a specific target role
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const backendStatus = getBackendStatus();

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const targetRole = selectedRole === 'creator' ? 'creator' : 'brand';
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('creasync_intended_role', targetRole);
          localStorage.setItem('creasync_intended_role', targetRole);
          localStorage.setItem('creasync_active_role', targetRole);
        } catch (e) {}
      }
      await signInWithGoogle({ role: targetRole });
      // When Supabase is configured with Google OAuth, browser navigates to Google.
    } catch (err) {
      setErrorMsg(err.message || 'Google Authentication encountered an error.');
      setLoading(false);
    }
  };

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
          onClose();
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
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="login-modal-header">
          <div className="section-tag-pill">
            <LogIn size={13} className="text-lavender" />
            <span>Workspace Entry</span>
          </div>
          <h2 id="login-modal-title" className="login-modal-title">
            {authMode === 'signup' ? 'Create Your Account' : 'Sign In to CreaSync'}
          </h2>
          <p className="login-modal-desc">
            {authMode === 'signup' 
              ? 'Join as an AI Creator or Brand Partner to access the creative workspace.'
              : 'Access your persistent workspace or try an instant milestone preview demo.'}
          </p>

          {/* Pending Action Callout Notice */}
          {pendingActionNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
              padding: '8px 14px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.28)',
              borderRadius: '8px',
              color: '#c7d2fe',
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              <ShieldCheck size={14} className="text-lavender" />
              <span>{pendingActionNotice}</span>
            </div>
          )}

          {/* Backend Status Engine Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: backendStatus.isLiveCloud ? '#10b981' : 'var(--text-muted, #94a3b8)' }}>
            <Database size={13} />
            <span>Active Engine: <strong>{backendStatus.database}</strong></span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '4px', margin: '0 0 16px 0', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              background: authMode === 'signin' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: authMode === 'signin' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              background: authMode === 'signup' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: authMode === 'signup' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Workspace Role Selector (Affects both Google Sign-In and Credentials) */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
              Entering as:
            </span>
            <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.45)' }}>
              {selectedRole === 'brand' ? 'Brand Studio' : 'Creator Studio'}
            </span>
          </div>
          <div className="role-radio-group">
            <label className={`role-radio-label ${selectedRole === 'brand' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="workspace-role" 
                value="brand" 
                checked={selectedRole === 'brand'} 
                onChange={() => setSelectedRole('brand')}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} />
                <span>Brand Studio</span>
              </span>
            </label>

            <label className={`role-radio-label ${selectedRole === 'creator' ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="workspace-role" 
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

        {/* Google OAuth Button */}
        <button
          type="button"
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
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <Loader size={16} className="spinner" color="#1f2937" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span>{authMode === 'signup' ? `Sign up with Google as ${selectedRole === 'brand' ? 'Brand' : 'Creator'}` : `Continue with Google as ${selectedRole === 'brand' ? 'Brand' : 'Creator'}`}</span>
        </button>

        {/* Quick Instant Demo Logins (Only shown on Sign In for easy evaluation) */}
        {authMode === 'signin' && (
          <div className="instant-demo-section" style={{ marginBottom: '14px' }}>
            <span className="demo-section-label">Instant Workspace Access (1-Click Demo)</span>
            
            <div className="demo-login-grid">
              <button
                type="button"
                className="demo-account-card brand-demo-card"
                onClick={() => {
                  onClose();
                  onLoginBrand();
                }}
              >
                <div className="demo-account-icon brand-icon">
                  <Briefcase size={18} />
                </div>
                <div className="demo-account-info">
                  <span className="demo-account-name">Lumina Botanica</span>
                  <span className="demo-account-role">Brand Campaign Studio</span>
                </div>
                <ArrowRight size={15} className="demo-account-arrow" />
              </button>

              <button
                type="button"
                className="demo-account-card creator-demo-card"
                onClick={() => {
                  onClose();
                  onLoginCreator();
                }}
              >
                <div className="demo-account-icon creator-icon">
                  <Palette size={18} />
                </div>
                <div className="demo-account-info">
                  <span className="demo-account-name">Maya Chen</span>
                  <span className="demo-account-role">AI Creator Studio</span>
                </div>
                <ArrowRight size={15} className="demo-account-arrow" />
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="login-divider">
          <span>{authMode === 'signup' ? 'or enter credentials' : 'or enter with credentials'}</span>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.84rem', marginBottom: '14px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '0.84rem', marginBottom: '14px' }}>
            <ShieldCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="login-form">
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="login-name">Full Name / Studio Name</label>
              <div className="input-with-icon">
                <UserPlus size={16} className="input-icon" />
                <input 
                  id="login-name"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Alex Rivera or Aurora Studio"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                id="login-email"
                type="email" 
                className="form-input" 
                placeholder="you@company.com or creator@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                id="login-password"
                type="password" 
                className="form-input" 
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <Loader size={16} className="spinner" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{authMode === 'signup' ? 'Create Account & Enter' : 'Continue to Workspace'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-modal-footer">
          <ShieldCheck size={14} className="text-muted" />
          <span>Production-Ready Dual-Engine Security • Isolated multi-tenant workspaces</span>
        </div>
      </div>
    </div>
  );
}
