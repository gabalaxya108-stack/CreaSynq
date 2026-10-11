// src/views/AdminLoginView.jsx
// ALLOY — Super Admin & Judge Security Authentication Portal
// Standalone, high-security editorial login interface with live Supabase authentication

import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { loginAsAdmin } from '../services/adminApi';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function AdminLoginView({ onAdminAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autofillSuccess, setAutofillSuccess] = useState(false);

  // Authenticate user via Supabase Auth and verify administrative privileges server-side
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both administrative email and security key.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await loginAsAdmin(email, password);
      if (result.ok && result.user) {
        if (onAdminAuthenticated) {
          onAdminAuthenticated(result.user);
        } else {
          window.location.hash = '/admin/dashboard';
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Judge Evaluation Autofill (Fills fields only — does not auto-submit)
  const handleAutofillJudge = () => {
    const judgeEmail = (import.meta.env.VITE_JUDGE_EMAIL || 'judge@alloy.market').trim();
    const judgePassword = (import.meta.env.VITE_JUDGE_PASSWORD || 'JudgeAlloy2026!').trim();

    setEmail(judgeEmail);
    setPassword(judgePassword);
    setErrorMsg('');
    setAutofillSuccess(true);
    setTimeout(() => setAutofillSuccess(false), 4500);
  };

  return (
    <div className="alloy-admin-login-page">
      {/* Background Decorative Atmosphere */}
      <div className="alloy-admin-login-glow" />

      <div className="alloy-admin-login-container">
        {/* Top Return Link */}
        <div className="alloy-admin-login-header">
          <button
            type="button"
            className="alloy-admin-back-btn"
            onClick={() => { window.location.hash = ''; }}
          >
            <ArrowLeft size={16} />
            <span>Return to Marketplace</span>
          </button>
        </div>

        {/* Central Auth Card */}
        <div className="alloy-admin-login-card">
          {/* Brand & Editorial Header */}
          <div className="alloy-admin-crest-section">
            <div className="alloy-admin-brand-lockup-center">
              <img 
                src="/assets/alloy-wordmark.webp" 
                alt="Alloy" 
                className="alloy-admin-login-logo" 
              />
            </div>

            <div className="alloy-admin-env-pill">
              <span className="alloy-admin-env-dot" />
              <span>RESTRICTED CONSOLE • TLS 1.3 • LIVE SUPABASE</span>
            </div>

            <h1 className="alloy-admin-login-title font-editorial">
              Administrative <span className="title-accent-vision">Access</span>
            </h1>
            <p className="alloy-admin-login-subtitle">
              Super Admin & AlloyTrust Command Portal
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="alloy-admin-alert-banner">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Autofill Notification Banner */}
          {autofillSuccess && (
            <div className="alloy-admin-alert-banner" style={{ background: '#f4fbf6', borderColor: '#bbf0c8', color: '#166534' }}>
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>Judge credentials loaded. Click "Enter Super Admin Console" below to authenticate.</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="alloy-admin-form">
            <div className="alloy-admin-input-group">
              <label htmlFor="admin-email">Administrative Email</label>
              <div className="alloy-admin-input-wrapper">
                <Mail size={16} className="alloy-admin-field-icon" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@alloy.market"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="alloy-admin-input-group">
              <div className="alloy-admin-label-split">
                <label htmlFor="admin-pass">Access Security Key</label>
              </div>
              <div className="alloy-admin-input-wrapper">
                <Lock size={16} className="alloy-admin-field-icon" />
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="alloy-admin-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="alloy-admin-submit-btn"
              id="admin-submit-btn"
            >
              {loading ? (
                <span>Verifying Authorization via Supabase...</span>
              ) : (
                <>
                  <span>Enter Super Admin Console</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Judge Evaluation Credentials Box */}
          <div className="alloy-admin-demo-box" style={{ marginTop: '20px' }}>
            <div className="alloy-admin-demo-header">
              <KeyRound size={14} className="text-bronze" />
              <span>Judge Evaluation Access</span>
            </div>
            <p className="alloy-admin-demo-text">
              Judges can use the dedicated, low-privilege reviewer account to evaluate the live ALLOY Super Admin console against our connected Supabase backend.
            </p>
            <button
              type="button"
              id="autofill-judge-btn"
              className="alloy-admin-demo-btn"
              onClick={handleAutofillJudge}
              disabled={loading}
            >
              <Sparkles size={14} />
              <span>Autofill Judge Credentials</span>
            </button>
          </div>

          {/* Footer Notice */}
          <div className="alloy-admin-card-footer">
            <span>All administrative queries and role validations are cryptographically verified against Supabase.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
