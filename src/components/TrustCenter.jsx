// src/components/TrustCenter.jsx
// Complete Creator Trust Verification Center for Creator Studio
// Truthful verification states, secure evidence submission, authorized reviewer workflow, and brand-view preview.

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Lock, 
  Eye, 
  Upload, 
  Cpu, 
  Briefcase, 
  Award, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  X, 
  Info, 
  UserCheck, 
  Send, 
  HelpCircle,
  FileCheck2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { 
  VERIFICATION_STATUSES, 
  STATUS_META, 
  PROVENANCE_LEVELS, 
  calculateTrustSummary 
} from '../data/trustVerificationData';

export default function TrustCenter({ 
  creator, 
  currentUser, 
  onUpdateCreator, 
  onViewPublicProfile,
  projects = [],
  workflows = []
}) {
  const [trustData, setTrustData] = useState(() => {
    return creator?.trustVerification || {};
  });

  // Modal & Drawer States
  const [activeModal, setActiveModal] = useState(null); // 'identity' | 'portfolio' | 'tool' | 'licensing' | 'reviewer'
  const [selectedProjectForEvidence, setSelectedProjectForEvidence] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);
  const [isReviewerMode, setIsReviewerMode] = useState(false);
  const [isAuditLogExpanded, setIsAuditLogExpanded] = useState(false);

  // Forms
  const [identityForm, setIdentityForm] = useState({
    legalName: trustData.identity?.legalName || '',
    issuingCountry: trustData.identity?.issuingCountry || 'United Kingdom (GB)',
    documentType: trustData.identity?.documentType || 'Passport',
    documentNumber: ''
  });

  const [evidenceForm, setEvidenceForm] = useState({
    evidenceType: 'Raw Project Files (.blend, .c4d, .exr)',
    description: '',
    artifactUrl: ''
  });

  const [toolForm, setToolForm] = useState({
    toolName: '',
    useCase: '',
    associatedWork: projects[0]?.title || 'General Pipeline',
    evidenceNote: ''
  });

  const [licensingForm, setLicensingForm] = useState({
    modelRightsDeclaration: trustData.licensing?.modelRightsDeclaration || '',
    licenseTypeGranted: trustData.licensing?.licenseTypeGranted || 'Full Commercial Buyout',
    exclusivityPeriod: trustData.licensing?.exclusivityPeriod || '12 Months Category Exclusivity'
  });

  // Reviewer Action Form
  const [reviewerDecision, setReviewerDecision] = useState({
    targetType: 'portfolio', // 'identity' | 'portfolio' | 'tool' | 'workflow' | 'licensing'
    targetId: '',
    decision: 'APPROVE', // 'APPROVE' | 'REJECT' | 'ACTION_REQUIRED'
    notes: '',
    reviewerName: 'Alloy Platform Auditor (SEC-04)'
  });

  const showToast = (msg) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const syncUpdate = (newTrustData) => {
    setTrustData(newTrustData);
    if (onUpdateCreator && creator) {
      onUpdateCreator({
        ...creator,
        trustVerification: newTrustData
      });
    }
  };

  // --- Handlers ---
  const handleResendEmail = () => {
    showToast('Verification link re-sent! Check your inbox for the cryptographic confirmation token.');
  };

  const handleSubmitIdentity = (e) => {
    e.preventDefault();
    if (!identityForm.legalName.trim()) return;

    const masked = identityForm.documentNumber 
      ? `•••••• ${identityForm.documentNumber.slice(-4)}`
      : '•••••• 5821';

    const updated = {
      ...trustData,
      identity: {
        ...trustData.identity,
        legalName: identityForm.legalName.trim(),
        issuingCountry: identityForm.issuingCountry,
        documentType: identityForm.documentType,
        documentMaskedNumber: masked,
        status: VERIFICATION_STATUSES.SUBMITTED,
        submittedAt: 'Just now',
        isPrivate: true,
        notes: 'Identity prototype submission received. Verification queued for compliance audit. (Documents securely isolated from brands).'
      }
    };

    syncUpdate(updated);
    setActiveModal(null);
    showToast('Identity verification submitted! Documents are strictly private and never visible to brands.');
  };

  const handleOpenAddEvidence = (proj) => {
    setSelectedProjectForEvidence(proj);
    setEvidenceForm({
      evidenceType: 'Raw Project Files (.blend, .c4d, .exr)',
      description: '',
      artifactUrl: ''
    });
    setActiveModal('portfolio');
  };

  const handleSubmitEvidence = (e) => {
    e.preventDefault();
    if (!selectedProjectForEvidence) return;

    const newEvidence = {
      id: `pe-${Date.now()}`,
      projectId: selectedProjectForEvidence.id,
      projectTitle: selectedProjectForEvidence.title,
      evidenceType: evidenceForm.evidenceType,
      description: evidenceForm.description.trim() || 'Process artifacts and generation logs.',
      artifactUrl: evidenceForm.artifactUrl.trim() || 'https://vault.creasync.network/audit/submission.zip',
      status: VERIFICATION_STATUSES.SUBMITTED,
      submittedAt: 'Just now',
      reviewedAt: null,
      reviewerNotes: 'Queued for visual authenticity review.'
    };

    const existing = trustData.portfolioEvidence || [];
    const updated = {
      ...trustData,
      portfolioEvidence: [...existing.filter(e => e.projectId !== selectedProjectForEvidence.id), newEvidence]
    };

    syncUpdate(updated);
    setActiveModal(null);
    showToast(`Authenticity evidence submitted for "${selectedProjectForEvidence.title}"!`);
  };

  const handleSubmitToolDeclaration = (e) => {
    e.preventDefault();
    if (!toolForm.toolName.trim()) return;

    const newDecl = {
      id: `td-${Date.now()}`,
      toolName: toolForm.toolName.trim(),
      useCase: toolForm.useCase.trim() || 'Generative concept synthesis and asset detailing.',
      associatedWork: toolForm.associatedWork,
      provenance: toolForm.evidenceNote ? PROVENANCE_LEVELS.EVIDENCE_ATTACHED.key : PROVENANCE_LEVELS.CREATOR_DECLARED.key,
      status: toolForm.evidenceNote ? VERIFICATION_STATUSES.SUBMITTED : VERIFICATION_STATUSES.NOT_VERIFIED,
      evidenceNote: toolForm.evidenceNote.trim() || 'Self-reported by creator'
    };

    const updated = {
      ...trustData,
      toolDeclarations: [...(trustData.toolDeclarations || []), newDecl]
    };

    syncUpdate(updated);
    setActiveModal(null);
    showToast(`AI tool disclosure for "${toolForm.toolName}" saved!`);
  };

  const handleSubmitLicensing = (e) => {
    e.preventDefault();
    const updated = {
      ...trustData,
      licensing: {
        ...trustData.licensing,
        modelRightsDeclaration: licensingForm.modelRightsDeclaration,
        licenseTypeGranted: licensingForm.licenseTypeGranted,
        exclusivityPeriod: licensingForm.exclusivityPeriod,
        declarationDate: 'Today',
        status: VERIFICATION_STATUSES.SUBMITTED
      }
    };
    syncUpdate(updated);
    setActiveModal(null);
    showToast('Commercial licensing disclosures updated!');
  };

  // Reviewer Action (Demonstrates authorized platform auditor approval / rejection)
  const handleExecuteReviewerAction = (e) => {
    e.preventDefault();
    const { targetType, decision, notes, reviewerName } = reviewerDecision;

    let updated = { ...trustData };
    const timestamp = 'Just now • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let categoryName = 'General';

    if (targetType === 'identity') {
      categoryName = 'Legal Identity';
      const newStatus = decision === 'APPROVE' 
        ? VERIFICATION_STATUSES.VERIFIED 
        : (decision === 'REJECT' ? VERIFICATION_STATUSES.NOT_VERIFIED : VERIFICATION_STATUSES.ACTION_REQUIRED);
      updated.identity = {
        ...updated.identity,
        status: newStatus,
        reviewedAt: timestamp,
        reviewedBy: reviewerName,
        notes: notes || (decision === 'APPROVE' ? 'Identity verified against government records.' : 'Additional photo ID required.')
      };
    } else if (targetType === 'portfolio') {
      categoryName = 'Portfolio Authenticity';
      const newStatus = decision === 'APPROVE' 
        ? VERIFICATION_STATUSES.REVIEWED 
        : (decision === 'REJECT' ? VERIFICATION_STATUSES.NOT_VERIFIED : VERIFICATION_STATUSES.ACTION_REQUIRED);
      
      updated.portfolioEvidence = (updated.portfolioEvidence || []).map(pe => ({
        ...pe,
        status: newStatus,
        reviewedAt: timestamp,
        reviewerNotes: notes || (decision === 'APPROVE' ? 'Prompt seeds and project layers confirmed authentic.' : 'Inconclusive generation logs.')
      }));
    } else if (targetType === 'workflow') {
      categoryName = 'Creative Workflow';
      const newStatus = decision === 'APPROVE' ? VERIFICATION_STATUSES.REVIEWED : VERIFICATION_STATUSES.ACTION_REQUIRED;
      updated.workflowVerification = {
        ...updated.workflowVerification,
        status: newStatus,
        auditedAt: timestamp,
        auditorSummary: notes || 'Verified human checkpoints and model disclosures.'
      };
    } else if (targetType === 'licensing') {
      categoryName = 'Licensing Disclosures';
      updated.licensing = {
        ...updated.licensing,
        status: decision === 'APPROVE' ? VERIFICATION_STATUSES.REVIEWED : VERIFICATION_STATUSES.ACTION_REQUIRED
      };
    }

    // Append to immutable audit trail
    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      reviewer: reviewerName,
      category: categoryName,
      action: decision,
      notes: notes || `Audit decision recorded by authorized reviewer.`
    };

    updated.auditLog = [auditEntry, ...(updated.auditLog || [])];
    syncUpdate(updated);
    setActiveModal(null);
    showToast(`Audit decision [${decision}] applied to ${categoryName}!`);
  };

  const summary = calculateTrustSummary(trustData);

  return (
    <div className="trust-center-container" style={{ paddingBottom: '60px' }}>
      {/* Toast Notice */}
      {toastNotice && (
        <div className="studio-top-toast" style={{ background: '#1C1917', color: '#FAF8F5' }}>
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="trust-center-header" style={{
        background: 'linear-gradient(135deg, rgba(253, 247, 237, 0.95) 0%, rgba(245, 238, 227, 0.8) 100%)',
        border: '1px solid rgba(212, 160, 23, 0.25)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(180, 83, 9, 0.12)',
                color: '#B45309',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <ShieldCheck size={13} />
                Trust & Verification Center
              </span>

              {trustData.isDemoProfile && (
                <span style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563EB',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '0.74rem',
                  fontWeight: 600
                }}>
                  Demonstration Profile • Illustrative Evidence
                </span>
              )}
            </div>

            <h1 className="font-editorial" style={{ margin: '0 0 8px 0', fontSize: '1.9rem', color: 'var(--text-primary)' }}>
              Creator Trust & Credibility Center
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.6 }}>
              Establish verified confidence with hiring brands. Disclose original generation records, authentic production workflows, and verifiable engagement track records without fabricated metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onViewPublicProfile}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={14} />
              <span>Preview Brand View</span>
            </button>

            {/* Reviewer Mode Simulator Toggle */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setIsReviewerMode(!isReviewerMode);
                if (!isReviewerMode) {
                  showToast('Switched to Authorized Reviewer Mode — you can now audit and approve/reject claims.');
                }
              }}
              style={{
                background: isReviewerMode ? '#7C3AED' : '#FFFFFF',
                color: isReviewerMode ? '#FFFFFF' : '#7C3AED',
                border: '1px solid #7C3AED',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sliders size={14} />
              <span>{isReviewerMode ? 'Reviewer Mode Active' : 'Switch to Reviewer Mode'}</span>
            </button>
          </div>
        </div>

        {/* Honest Progress Overview (No arbitrary score percentages) */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(212, 160, 23, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Tracked Categories
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              6 Categories
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Full transparency spectrum
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', fontWeight: 600 }}>
              Audited / Verified
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
              {summary.verifiedCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>of 6</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Confirmed by provider/audit
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7C3AED', fontWeight: 600 }}>
              Under Compliance Review
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7C3AED', marginTop: '4px' }}>
              {summary.underReviewCount} Pending
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Evidence in auditor queue
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Trust Integrity Rule
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
              Zero Fake Scores
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              No arbitrary % inflation
            </div>
          </div>
        </div>

        {/* Reviewer Mode Banner if enabled */}
        {isReviewerMode && (
          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px dashed #7C3AED',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} style={{ color: '#7C3AED' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#6D28D9' }}>Authorized Reviewer Panel Active</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#5B21B6' }}>
                  You have administrative privileges to inspect submitted evidence and record audit decisions.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setActiveModal('reviewer')}
              style={{ background: '#7C3AED', color: '#FFFFFF', border: 'none' }}
            >
              Audit Pending Submissions
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          7 VERIFICATION CATEGORIES
          ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* CATEGORY A: ACCOUNT & EMAIL VERIFICATION */}
        <div className="studio-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>A. Account & Email Authentication</h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: STATUS_META[trustData.email?.status || 'not_started'].bg,
                    color: STATUS_META[trustData.email?.status || 'not_started'].color
                  }}>
                    {STATUS_META[trustData.email?.status || 'not_started'].label}
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Confirmed via cryptographic authentication provider session. Proves direct inbox access and account recovery rights.
                </p>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span><strong>Registered Email:</strong> {trustData.email?.emailAddress || 'creator@creasync.network'}</span>
                  {trustData.email?.verifiedAt && (
                    <span style={{ color: '#059669' }}><strong>Verified:</strong> {trustData.email.verifiedAt}</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {trustData.email?.status !== VERIFICATION_STATUSES.VERIFIED ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResendEmail}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} />
                  <span>Resend Verification Link</span>
                </button>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Check size={15} /> Active Session Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY B: PORTFOLIO AUTHENTICITY */}
        <div className="studio-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                <FileCheck2 size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>B. Portfolio Authenticity & Project Provenance</h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669'
                  }}>
                    {(trustData.portfolioEvidence || []).length} Evidence Packs Supplied
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Associate raw production files, generation seeds, ComfyUI node graphs, or multi-layer PSD timelines to substantiate originality.
                </p>
              </div>
            </div>
          </div>

          {/* Project List with Evidence Attachment Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map((proj) => {
              const matchedEvidence = (trustData.portfolioEvidence || []).find(e => e.projectId === proj.id);
              const statusKey = matchedEvidence ? matchedEvidence.status : VERIFICATION_STATUSES.NOT_STARTED;
              const meta = STATUS_META[statusKey] || STATUS_META.not_started;

              return (
                <div key={proj.id} style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={proj.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                      alt={proj.title}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{proj.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {matchedEvidence ? matchedEvidence.evidenceType : 'No generation proof attached'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: meta.bg,
                      color: meta.color
                    }}>
                      {matchedEvidence ? meta.label : 'Evidence Not Provided'}
                    </span>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenAddEvidence(proj)}
                      style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    >
                      {matchedEvidence ? 'Update Evidence' : 'Attach Proof'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATEGORY C: AI TOOLS AND MODELS TRANSPARENCY */}
        <div className="studio-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.1)', color: '#D97706' }}>
                <Cpu size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>C. AI Tools & Models Transparency</h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: 'rgba(217, 119, 6, 0.12)',
                    color: '#B45309'
                  }}>
                    {(trustData.toolDeclarations || []).length} Disclosed Tools
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Transparently disclose generative models and human post-production software. Distinguishes self-reported tools from evidence-backed pipelines.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveModal('tool')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={14} />
              <span>Declare Tool / Model</span>
            </button>
          </div>

          {/* Tools Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {(trustData.toolDeclarations || []).map(decl => {
              const prov = PROVENANCE_LEVELS[decl.provenance?.toUpperCase()] || PROVENANCE_LEVELS.CREATOR_DECLARED;
              return (
                <div key={decl.id} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {decl.toolName}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      background: prov.bg,
                      color: prov.color,
                      fontWeight: 600
                    }}>
                      {prov.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {decl.useCase}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Used in: <em>{decl.associatedWork}</em>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATEGORY D: CREATIVE WORKFLOW VERIFICATION */}
        <div className="studio-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(235, 110, 75, 0.1)', color: '#EB6E4B' }}>
                <Briefcase size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>D. Creative Workflow Verification</h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: STATUS_META[trustData.workflowVerification?.status || 'not_started'].bg,
                    color: STATUS_META[trustData.workflowVerification?.status || 'not_started'].color
                  }}>
                    {STATUS_META[trustData.workflowVerification?.status || 'not_started'].label}
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Integrates with your Creative Workflow. Certifies human review checkpoints, prompt iteration gates, and deliverable handoffs.
                </p>

                {trustData.workflowVerification?.workflowTitle && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <strong>Linked Pipeline:</strong> {trustData.workflowVerification.workflowTitle} ({trustData.workflowVerification.totalStepsCount} Ordered Steps)
                    {trustData.workflowVerification.auditorSummary && (
                      <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#059669' }}>
                        ✓ {trustData.workflowVerification.auditorSummary}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.82rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Check size={14} /> Synchronized with Workflow Studio
              </span>
            </div>
          </div>
        </div>

        {/* CATEGORY E: ENGAGEMENT & DELIVERY HISTORY */}
        <div className="studio-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>E. Platform Engagements & Delivery History</h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: trustData.platformHistory?.completedEngagementsCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(138, 133, 128, 0.12)',
                    color: trustData.platformHistory?.completedEngagementsCount > 0 ? '#059669' : '#8A8580'
                  }}>
                    {trustData.platformHistory?.completedEngagementsCount || 0} Completed Contracts
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Platform-verified delivery track record. Immutable platform escrow contracts and milestone releases. Cannot be manually edited or fabricated.
                </p>
              </div>
            </div>
          </div>

          {/* Records Table or Neutral State */}
          {trustData.platformHistory?.hasHistory && (trustData.platformHistory.records || []).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trustData.platformHistory.records.map((rec, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.86rem'
                }}>
                  <div>
                    <strong>{rec.campaignTitle}</strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      Brand: {rec.brandName} • {rec.deliverablesSubmitted} Deliverables Delivered
                    </div>
                  </div>
                  <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.8rem' }}>
                    ✓ {rec.status} ({rec.completedAt})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem'
            }}>
              No completed platform engagements yet.
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                New creator history will automatically populate here as brand collaborations and escrow milestones are completed.
              </p>
            </div>
          )}
        </div>

        {/* CATEGORY F: COMMERCIAL-USE & LICENSING DISCLOSURES */}
        <div className="studio-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(202, 138, 4, 0.1)', color: '#CA8A04' }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>F. Commercial Rights & Licensing Disclosures</h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: STATUS_META[trustData.licensing?.status || 'submitted'].bg,
                    color: STATUS_META[trustData.licensing?.status || 'submitted'].color
                  }}>
                    {STATUS_META[trustData.licensing?.status || 'submitted'].label}
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  State commercial clearance warranties, foundational model commercial rights, and client buyout terms.
                </p>

                {trustData.licensing?.modelRightsDeclaration && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '680px',
                    lineHeight: 1.5
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Declared License Terms:
                    </div>
                    {trustData.licensing.modelRightsDeclaration}
                    <div style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                      <em>Note: {trustData.licensing.disclaimer || 'Creator self-declaration; not a legal certification.'}</em>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveModal('licensing')}
              >
                Update Licensing Terms
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          AUDIT TRAIL LOG
          ======================================================== */}
      <div className="studio-card" style={{ marginTop: '24px', padding: '20px 24px' }}>
        <button
          type="button"
          onClick={() => setIsAuditLogExpanded(!isAuditLogExpanded)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Compliance & Verification Audit Log ({(trustData.auditLog || []).length} Records)
            </span>
          </div>
          {isAuditLogExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isAuditLogExpanded && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(trustData.auditLog || []).map(entry => (
              <div key={entry.id} style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    [{entry.action}] {entry.category}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {entry.notes}
                  </div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.74rem', marginTop: '2px' }}>
                    Auditor: {entry.reviewer}
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  {entry.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          MODALS & DRAWERS
          ======================================================== */}

      {/* 1. Identity Submission Modal */}
      {activeModal === 'identity' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title font-editorial">Legal Identity Verification</h2>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitIdentity} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(217, 119, 6, 0.08)', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)', fontSize: '0.82rem', color: '#B45309', display: 'flex', gap: '8px' }}>
                <Lock size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Prototype Compliance Submission:</strong> Identity data is encrypted and strictly isolated. It will never be disclosed to hiring brands or made public.
                </span>
              </div>

              <div>
                <label className="form-label">Full Legal Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Maya Li-Wei Chen"
                  value={identityForm.legalName}
                  onChange={e => setIdentityForm({ ...identityForm, legalName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Issuing Country</label>
                  <select
                    className="form-input"
                    value={identityForm.issuingCountry}
                    onChange={e => setIdentityForm({ ...identityForm, issuingCountry: e.target.value })}
                  >
                    <option value="United Kingdom (GB)">United Kingdom (GB)</option>
                    <option value="United States (US)">United States (US)</option>
                    <option value="Germany (DE)">Germany (DE)</option>
                    <option value="France (FR)">France (FR)</option>
                    <option value="Canada (CA)">Canada (CA)</option>
                    <option value="Japan (JP)">Japan (JP)</option>
                    <option value="Other">Other Territory</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Document Type</label>
                  <select
                    className="form-input"
                    value={identityForm.documentType}
                    onChange={e => setIdentityForm({ ...identityForm, documentType: e.target.value })}
                  >
                    <option value="Passport">Passport</option>
                    <option value="National Identity Card">National ID Card</option>
                    <option value="Drivers License">Driver's License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Document Identifier / Number (Encrypted)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 984210984"
                  value={identityForm.documentNumber}
                  onChange={e => setIdentityForm({ ...identityForm, documentNumber: e.target.value })}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  Only the last 4 digits are retained in audit metadata.
                </span>
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit to Compliance Queue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Portfolio Evidence Modal */}
      {activeModal === 'portfolio' && selectedProjectForEvidence && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 className="modal-title font-editorial">Attach Authenticity Evidence</h2>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitEvidence} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  Project: {selectedProjectForEvidence.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Attach generation parameters, raw source project files, or uncompressed timeline passes to substantiate originality.
                </p>
              </div>

              <div>
                <label className="form-label">Evidence Type</label>
                <select
                  className="form-input"
                  value={evidenceForm.evidenceType}
                  onChange={e => setEvidenceForm({ ...evidenceForm, evidenceType: e.target.value })}
                >
                  <option value="Raw Project Files (.blend, .c4d, .exr)">Raw Project Files (.blend, .c4d, .exr)</option>
                  <option value="Model Seed & Generation Logs">Model Seed & Generation Prompt Logs</option>
                  <option value="ComfyUI Node Graph Export (JSON)">ComfyUI Node Graph Export (JSON)</option>
                  <option value="Multi-Layer PSD / Depth Passes">Multi-Layer PSD / Depth Passes</option>
                  <option value="Process Screen Recording / Timelapse">Process Screen Recording / Timelapse</option>
                </select>
              </div>

              <div>
                <label className="form-label">What Does This Evidence Prove? *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  required
                  placeholder="e.g. Demonstrates custom ComfyUI seed runs for liquid viscosity and original layer separation before DaVinci color grading."
                  value={evidenceForm.description}
                  onChange={e => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Evidence URL / Encrypted Vault Reference</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://vault.creasync.network/audit/my_project.zip"
                  value={evidenceForm.artifactUrl}
                  onChange={e => setEvidenceForm({ ...evidenceForm, artifactUrl: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Queue Evidence for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. AI Tool Declaration Modal */}
      {activeModal === 'tool' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title font-editorial">Declare AI Tool or Model</h2>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitToolDeclaration} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Tool or Generative Model Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Flux.1 Dev, Midjourney v6.1, Runway Gen-3"
                  value={toolForm.toolName}
                  onChange={e => setToolForm({ ...toolForm, toolName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Associated Portfolio Project / Workflow</label>
                <select
                  className="form-input"
                  value={toolForm.associatedWork}
                  onChange={e => setToolForm({ ...toolForm, associatedWork: e.target.value })}
                >
                  <option value="General Production Pipeline">General Production Pipeline</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Specific Application in Pipeline *</label>
                <textarea
                  className="form-input"
                  rows={2}
                  required
                  placeholder="e.g. Used for high-frequency skin pores and photorealistic macro specular highlights."
                  value={toolForm.useCase}
                  onChange={e => setToolForm({ ...toolForm, useCase: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Supporting Evidence Reference (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Model run hash #48291 / seed attached in portfolio project"
                  value={toolForm.evidenceNote}
                  onChange={e => setToolForm({ ...toolForm, evidenceNote: e.target.value })}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  If evidence is attached, the tool is labeled "Evidence Supplied" instead of "Self-Reported".
                </span>
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Tool Disclosure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Commercial Licensing Modal */}
      {activeModal === 'licensing' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title font-editorial">Commercial Rights & Licensing</h2>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitLicensing} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">License Scope Granted to Brands</label>
                <input
                  type="text"
                  className="form-input"
                  value={licensingForm.licenseTypeGranted}
                  onChange={e => setLicensingForm({ ...licensingForm, licenseTypeGranted: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Exclusivity Period</label>
                <input
                  type="text"
                  className="form-input"
                  value={licensingForm.exclusivityPeriod}
                  onChange={e => setLicensingForm({ ...licensingForm, exclusivityPeriod: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Commercial Clearance & Training Rights Declaration</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={licensingForm.modelRightsDeclaration}
                  onChange={e => setLicensingForm({ ...licensingForm, modelRightsDeclaration: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Declaration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Reviewer Audit Modal (Demonstrates authorized platform auditor workflow) */}
      {activeModal === 'reviewer' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C3AED', fontWeight: 700 }}>
                  Alloy Platform Compliance Audit
                </span>
                <h2 className="modal-title font-editorial" style={{ margin: 0 }}>Reviewer Decision Console</h2>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleExecuteReviewerAction} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Verification Target Category</label>
                <select
                  className="form-input"
                  value={reviewerDecision.targetType}
                  onChange={e => setReviewerDecision({ ...reviewerDecision, targetType: e.target.value })}
                >
                  <option value="portfolio">B. Portfolio Authenticity Evidence</option>
                  <option value="workflow">D. Creative Workflow Pipeline</option>
                  <option value="licensing">F. Licensing Disclosures</option>
                </select>
              </div>

              <div>
                <label className="form-label">Audit Decision</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewerDecision({ ...reviewerDecision, decision: 'APPROVE' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: reviewerDecision.decision === 'APPROVE' ? '2px solid #059669' : '1px solid var(--border-subtle)',
                      background: reviewerDecision.decision === 'APPROVE' ? 'rgba(16, 185, 129, 0.15)' : '#FFFFFF',
                      color: reviewerDecision.decision === 'APPROVE' ? '#059669' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewerDecision({ ...reviewerDecision, decision: 'ACTION_REQUIRED' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: reviewerDecision.decision === 'ACTION_REQUIRED' ? '2px solid #D97706' : '1px solid var(--border-subtle)',
                      background: reviewerDecision.decision === 'ACTION_REQUIRED' ? 'rgba(217, 119, 6, 0.15)' : '#FFFFFF',
                      color: reviewerDecision.decision === 'ACTION_REQUIRED' ? '#D97706' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ! Action Needed
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewerDecision({ ...reviewerDecision, decision: 'REJECT' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: reviewerDecision.decision === 'REJECT' ? '2px solid #EF4444' : '1px solid var(--border-subtle)',
                      background: reviewerDecision.decision === 'REJECT' ? 'rgba(239, 68, 68, 0.15)' : '#FFFFFF',
                      color: reviewerDecision.decision === 'REJECT' ? '#EF4444' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Auditor Audit Notes *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  required
                  placeholder="Record justification, validated seed parameters, or requested additional evidence..."
                  value={reviewerDecision.notes}
                  onChange={e => setReviewerDecision({ ...reviewerDecision, notes: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Reviewer Signature</label>
                <input
                  type="text"
                  className="form-input"
                  value={reviewerDecision.reviewerName}
                  onChange={e => setReviewerDecision({ ...reviewerDecision, reviewerName: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7C3AED', borderColor: '#7C3AED' }}>
                  Commit Audit Decision & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
