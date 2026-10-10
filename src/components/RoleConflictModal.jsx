// src/components/RoleConflictModal.jsx
// Explicit Role Conflict Resolution Dialog for CreaSynq
// Preserves stored user roles, prevents silent overwrites, and offers deliberate user choices.

import React from 'react';
import { AlertCircle, Briefcase, Palette, ArrowRight, LogOut, X } from 'lucide-react';

export default function RoleConflictModal({
  isOpen,
  onClose,
  currentRole, // 'creator' | 'brand'
  attemptedRole, // 'brand' | 'creator'
  userName = 'User',
  onGoToAuthorizedWorkspace,
  onLogout
}) {
  if (!isOpen) return null;

  const currentRoleLabel = currentRole === 'creator' ? 'Creator' : 'Brand Partner';
  const attemptedRoleLabel = attemptedRole === 'brand' ? 'Brand Studio' : 'Creator Studio';
  const currentWorkspaceLabel = currentRole === 'creator' ? 'Creator Studio' : 'Brand Studio';

  return (
    <div 
      className="alloy-modal-backdrop" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="role-conflict-title"
      style={{ zIndex: 1100 }}
    >
      <div 
        className="alloy-login-card-editorial" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          gridTemplateColumns: '1fr',
          padding: '36px',
          background: '#FAF7F2'
        }}
      >
        <button 
          type="button" 
          className="alloy-modal-close" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'left' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(180, 133, 48, 0.12)',
            border: '1px solid rgba(180, 133, 48, 0.28)',
            color: '#B48530',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '16px'
          }}>
            <AlertCircle size={14} />
            <span>WORKSPACE ROLE MISMATCH</span>
          </div>

          <h2 id="role-conflict-title" className="alloy-login-headline font-editorial" style={{ fontSize: '1.75rem', marginBottom: '10px' }}>
            Active {currentRoleLabel} Account
          </h2>

          <p className="alloy-login-subtext" style={{ fontSize: '0.92rem', marginBottom: '22px' }}>
            You are currently signed in as <strong>{userName}</strong> with a verified <strong>{currentRoleLabel}</strong> profile. 
            The action you clicked is intended for <strong>{attemptedRoleLabel}</strong>. Your existing profile role has been preserved.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {/* Primary Action: Go to authorized workspace */}
            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => {
                onClose();
                onGoToAuthorizedWorkspace();
              }}
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentRole === 'creator' ? <Palette size={16} /> : <Briefcase size={16} />}
                <span>Continue to {currentWorkspaceLabel}</span>
              </span>
              <ArrowRight size={15} />
            </button>

            {/* Logout Option */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '9999px',
                background: '#FFFFFF',
                border: '1.5px solid #D5CCC0',
                color: '#2A2622',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.18s ease'
              }}
            >
              <LogOut size={14} />
              <span>Log Out to Switch Accounts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
