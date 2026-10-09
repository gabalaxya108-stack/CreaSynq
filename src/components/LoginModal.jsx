import React, { useState } from 'react';
import { X, LogIn, Briefcase, Palette, ArrowRight, ShieldCheck, Mail, Lock, UserPlus, Database, AlertCircle, Loader } from 'lucide-react';
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

        {/* Quick Instant Demo Logins (Only shown on Sign In for easy evaluation) */}
        {authMode === 'signin' && (
          <div className="instant-demo-section">
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
          <span>{authMode === 'signup' ? 'Enter Account Details' : 'or enter with credentials'}</span>
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

          <div className="form-group">
            <label className="form-label">Select Workspace Role</label>
            <div className="role-radio-group">
              <label className={`role-radio-label ${selectedRole === 'brand' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="login-role" 
                  value="brand" 
                  checked={selectedRole === 'brand'} 
                  onChange={() => setSelectedRole('brand')}
                />
                <span>Brand Studio</span>
              </label>

              <label className={`role-radio-label ${selectedRole === 'creator' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="login-role" 
                  value="creator" 
                  checked={selectedRole === 'creator'} 
                  onChange={() => setSelectedRole('creator')}
                />
                <span>Creator Studio</span>
              </label>
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
