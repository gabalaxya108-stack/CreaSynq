// src/views/CreatorProfileView.jsx
// Premium Brand-Facing Creator Portfolio & Evidence-Grounded Creative DNA
// Single Source of Truth: Reads directly from unified creator record with strict visibility isolation

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, MapPin, Heart, Share2, Send, Sparkles, ArrowDown, Dna, 
  CheckCircle2, MessageSquare, Clock, ShieldCheck, AlertCircle, Bookmark, 
  BookmarkCheck, ExternalLink, Edit3, Eye, Layers, ChevronRight, Check,
  Sparkle, Compass, UserCheck, Wrench, Cpu, Palette, GitCommit, FileCheck2, Award, Lock, FileText, Video,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { getPublicCreatorProfile } from '../data/marketplaceStore';
import { generateCreatorDNA } from '../intelligence/creatorDNA';
import { calculateCreaMatch } from '../intelligence/matchingEngine';
import { explainMatch } from '../intelligence/matchExplainer';
import WorkflowTimeline from '../components/WorkflowTimeline';
import { DEMO_WORKFLOWS } from '../data/workflowsData';
import { 
  STATUS_META, 
  PROVENANCE_LEVELS, 
  VERIFICATION_STATUSES, 
  getCreatorTrustBadges 
} from '../data/trustVerificationData';

export default function CreatorProfileView({ 
  creator, 
  onBack, 
  onSelectProject, 
  onInviteCreator,
  activeCampaign,
  campaigns = [],
  shortlists = {},
  onToggleShortlist,
  onSelectCampaign,
  connections = [],
  onOpenConversation,
  isSaved = false,
  onToggleSave,
  onUpdateCreator,
  isCurrentCreatorOwner = false,
  onEditInStudio
}) {
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedProjectIds, setExpandedProjectIds] = useState([]);
  const [selectedTrustBadge, setSelectedTrustBadge] = useState(null);

  const toggleExpandProject = (e, projectId) => {
    e.stopPropagation();
    setExpandedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Strict Single Source of Truth: Filter out private portfolio items for brand view
  const publicCreator = useMemo(() => getPublicCreatorProfile(creator), [creator]);

  // Derive 6 specific trust verification badges
  const trustBadges = useMemo(() => {
    return publicCreator ? getCreatorTrustBadges(publicCreator) : [];
  }, [publicCreator]);

  if (!publicCreator) return null;

  const publishedProjects = publicCreator.projects || [];
  const featuredProjects = publishedProjects.filter(p => p.featured);
  const heroVisual = (featuredProjects.length > 0 ? featuredProjects[0].image : null) 
    || (publishedProjects.length > 0 ? publishedProjects[0].image : null)
    || publicCreator.heroWork;

  // Connection check
  const matchingConn = connections.find(c => c.creatorId === publicCreator.id && c.status === 'connected');
  const isConnected = !!matchingConn;

  // Creative DNA Resolution (Saved Groq Dossier or Deterministic Provenance)
  const creatorDNA = useMemo(() => {
    return publicCreator.creativeDNA || generateCreatorDNA(publicCreator);
  }, [publicCreator]);

  // Campaign Context for CreaMatch Evaluation
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    activeCampaign?.id || (campaigns[0]?.id || null)
  );

  const evaluatedCampaign = campaigns.find(c => c.id === selectedCampaignId) || activeCampaign || null;

  // CreaMatch Computation
  const matchResult = useMemo(() => {
    if (!evaluatedCampaign) return null;
    return calculateCreaMatch(evaluatedCampaign, publicCreator);
  }, [evaluatedCampaign, publicCreator]);

  const matchExplanation = useMemo(() => {
    if (!evaluatedCampaign) return null;
    return explainMatch(evaluatedCampaign, publicCreator);
  }, [evaluatedCampaign, publicCreator]);

  const isShortlisted = evaluatedCampaign 
    ? (shortlists[evaluatedCampaign.id] || []).includes(publicCreator.id)
    : false;

  // Creative Workflows: Read-only, published workflows only
  const publishedWorkflows = useMemo(() => {
    const raw = (publicCreator.workflows && publicCreator.workflows.length > 0)
      ? publicCreator.workflows
      : DEMO_WORKFLOWS.filter(w => w.creatorId === publicCreator.id);
    return raw.filter(w => (w.visibility === 'published' || w.status === 'Published') && w.visibility !== 'private');
  }, [publicCreator]);

  const [activeWorkflowId, setActiveWorkflowId] = useState(null);
  const selectedWorkflow = publishedWorkflows.find(w => w.id === activeWorkflowId) || publishedWorkflows[0] || null;

  // Available categories for portfolio filtering
  const availableCategories = useMemo(() => {
    const cats = new Set(publishedProjects.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [publishedProjects]);

  const filteredProjects = selectedCategory === 'all'
    ? publishedProjects
    : publishedProjects.filter(p => p.category === selectedCategory);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToPortfolio = () => {
    const el = document.getElementById('selected-work-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDNA = () => {
    const el = document.getElementById('creative-dna-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Provenance extraction
  const provenance = creatorDNA?.provenance || {
    creatorProvided: {
      statedSpecialty: publicCreator.specialty,
      bio: publicCreator.bio,
      toolsUsed: publicCreator.tools || [],
      preferredStyles: publicCreator.styles || [],
      platformsActive: publicCreator.platforms || [],
      availability: publicCreator.availability,
      location: publicCreator.location
    },
    portfolioSupported: {
      totalVerifiedProjects: publishedProjects.length,
      demonstratedFormats: Array.from(new Set(publishedProjects.map(p => p.category).filter(Boolean))),
      demonstratedCapabilities: Array.from(new Set(publishedProjects.flatMap(p => p.capabilities || []))),
      aspectRatiosDelivered: Array.from(new Set(publishedProjects.map(p => p.aspect || '16:9'))),
      verifiedClientTiers: Array.from(new Set(publishedProjects.map(p => p.clientType).filter(Boolean)))
    },
    aiInferred: {
      visualAesthetic: creatorDNA?.visualAesthetic || 'High-end Contemporary Editorial',
      storytellingApproach: creatorDNA?.storytellingApproach || 'Editorial Polish & Commercial Impact',
      productPresentationStyle: creatorDNA?.productPresentationStyle || 'Studio Tabletop Key Art',
      derivedPacing: creatorDNA?.aiInferred?.derivedPacing || 'Deliberate Cinematic Pacing',
      colorSensitivity: creatorDNA?.aiInferred?.colorSensitivity || 'Naturalistic Editorial Palette'
    }
  };

  const isDevelopingPortfolio = publishedProjects.length < 2;

  return (
    <div className="creator-profile-view">
      <div className="page-container">
        {/* Navigation Breadcrumb & Context Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            type="button" 
            className="profile-back-link"
            onClick={onBack}
            aria-label="Back to Marketplace"
          >
            <ArrowLeft size={16} className="profile-back-arrow" />
            <span>Back to Marketplace</span>
          </button>

          {isCurrentCreatorOwner && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', fontSize: '0.82rem', color: 'var(--accent-lavender-deep)' }}>
              <Eye size={14} />
              <span>Viewing in Brand Preview Mode</span>
              {onEditInStudio && (
                <button 
                  type="button" 
                  onClick={onEditInStudio}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-lavender-deep)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', marginLeft: '6px' }}
                >
                  Edit in Studio →
                </button>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            A. CREATOR INTRODUCTION (Large Visual Hero Card)
            ======================================================== */}
        <div className="creator-profile-hero-card">
          <div className="profile-hero-grid">
            <div className="profile-hero-info">
              {/* Top Handle & Status Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span className="hero-badge-pill">
                  {publicCreator.handle}
                </span>
                <span className="creator-card-badge" style={{ position: 'static' }}>
                  <span className="status-dot-green" />
                  <span>{publicCreator.availability || 'Available for projects'}</span>
                </span>
                {publicCreator.specialty && (
                  <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '100px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {publicCreator.specialty}
                  </span>
                )}
              </div>

              {/* Creator Name & Positioning */}
              <h1 className="profile-hero-name font-editorial">
                {publicCreator.name}
              </h1>

              <p className="profile-hero-identity">
                {publicCreator.creativeIdentity}
              </p>

              <p className="profile-hero-bio">
                "{publicCreator.bio}"
              </p>

              {/* Metadata Row */}
              <div className="profile-hero-meta-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                {publicCreator.location && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    <span>{publicCreator.location}</span>
                  </span>
                )}
                {publicCreator.turnaround && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      <span>{publicCreator.turnaround}</span>
                    </span>
                  </>
                )}
                {publicCreator.experience && (
                  <>
                    <span>•</span>
                    <span>{publicCreator.experience}</span>
                  </>
                )}
              </div>

              {/* Active Platforms */}
              {publicCreator.platforms && publicCreator.platforms.length > 0 && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Channels:
                  </span>
                  {publicCreator.platforms.map((plat, idx) => (
                    <span key={idx} className="skill-chip" style={{ fontSize: '0.76rem', padding: '3px 9px', background: 'var(--bg-secondary)' }}>
                      {plat}
                    </span>
                  ))}
                </div>
              )}

              {/* Verified Credentials & Trust Badges Strip (Clickable with Scoped Details) */}
              <div style={{ marginTop: '18px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} style={{ color: '#7C3AED' }} />
                  Trust Badges:
                </span>
                {trustBadges.map(badge => {
                  const meta = STATUS_META[badge.status] || STATUS_META[VERIFICATION_STATUSES.NOT_SUBMITTED];
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setSelectedTrustBadge(badge)}
                      title={`Click to inspect ${badge.title} (${meta.label})`}
                      style={{
                        background: '#FFFFFF',
                        border: `1px solid ${meta.border || 'var(--border-subtle)'}`,
                        borderRadius: '100px',
                        padding: '4px 11px',
                        fontSize: '0.76rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{badge.title}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: meta.color, background: meta.bg, padding: '1px 6px', borderRadius: '100px' }}>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Brand Actions — Stable Positions & No Horizontal Shift */}
              <div className="profile-hero-actions" style={{ marginTop: '24px' }}>
                {isConnected ? (
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-lg"
                    style={{ borderColor: 'var(--accent-lavender)', color: 'var(--accent-lavender-deep)' }}
                    onClick={() => onOpenConversation && onOpenConversation(matchingConn)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Connected • Open Chat</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg"
                    onClick={() => onInviteCreator(publicCreator)}
                  >
                    <Send size={15} />
                    <span>Invite to Campaign</span>
                  </button>
                )}

                {/* Shortlist Action with Stable Min-Width */}
                {evaluatedCampaign && onToggleShortlist && (
                  <button
                    type="button"
                    className={`btn btn-secondary btn-lg btn-shortlist-stable ${isShortlisted ? 'saved' : ''}`}
                    onClick={() => onToggleShortlist(evaluatedCampaign.id, publicCreator.id)}
                    title={isShortlisted ? `Remove from ${evaluatedCampaign.title} shortlist` : `Add to ${evaluatedCampaign.title} shortlist`}
                    aria-pressed={isShortlisted}
                  >
                    {isShortlisted ? (
                      <>
                        <BookmarkCheck size={16} style={{ color: 'var(--accent-lavender-deep)' }} />
                        <span>Shortlisted</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        <span>Add to Shortlist</span>
                      </>
                    )}
                  </button>
                )}

                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg"
                  onClick={scrollToPortfolio}
                >
                  <span>View Portfolio ({publishedProjects.length})</span>
                  <ArrowDown size={15} />
                </button>

                <button 
                  type="button" 
                  className={`btn btn-secondary ${isSaved ? 'saved' : ''}`}
                  onClick={() => onToggleSave && onToggleSave(publicCreator.id)}
                  title={isSaved ? "Saved to Favorites" : "Save Creator"}
                >
                  <Heart size={16} fill={isSaved ? "#EF4444" : "none"} stroke={isSaved ? "#EF4444" : "currentColor"} />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleShare}
                  title="Share creator portfolio link"
                >
                  <Share2 size={15} />
                  <span>{copied ? "Copied" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Creator Hero Visual */}
            <div className="profile-hero-visual-wrapper">
              <img 
                src={heroVisual} 
                alt={`${publicCreator.name}'s hero visual`} 
                className="profile-hero-visual-img"
              />
              <div className="profile-avatar-floating-badge">
                <img 
                  src={publicCreator.avatar} 
                  alt={publicCreator.name} 
                  className="profile-avatar-image" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            CAMPAIGN EVALUATION & CREAMATCH INTELLIGENCE BANNER
            ======================================================== */}
        {evaluatedCampaign && matchResult && (
          <div className="campaign-context-evaluation-card" style={{ marginTop: '24px', padding: '22px 28px', background: 'linear-gradient(135deg, rgba(253, 247, 237, 0.7) 0%, rgba(243, 237, 247, 0.7) 100%)', border: '1px solid rgba(235, 110, 75, 0.2)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={16} style={{ color: '#EB6E4B' }} />
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#EB6E4B', fontWeight: 700 }}>
                    CreaMatch™ Intelligence Evaluation
                  </span>
                </div>
                <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  Compatibility for “{evaluatedCampaign.title}”
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {campaigns.length > 1 && onSelectCampaign && (
                  <select
                    className="form-input"
                    value={selectedCampaignId}
                    onChange={(e) => {
                      setSelectedCampaignId(e.target.value);
                      onSelectCampaign(e.target.value);
                    }}
                    style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#FFFFFF' }}
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>Campaign: {c.title}</option>
                    ))}
                  </select>
                )}

                <div style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  background: matchResult.score >= 80 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: matchResult.score >= 80 ? '#059669' : '#D97706',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{matchResult.fitLabel}</span>
                </div>
              </div>
            </div>

            {/* Match Rationale & Evidence Citing */}
            {matchExplanation && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {matchExplanation.summary}
                </p>

                {matchExplanation.highlights && matchExplanation.highlights.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {matchExplanation.highlights.map((hl, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        <CheckCircle2 size={14} style={{ color: '#059669', flexShrink: 0 }} />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            B. CREATIVE DNA DOSSIER (EVIDENCE-GROUNDED 3-TIER PROVENANCE)
            Positioned before full portfolio for immediate creative comprehension
            ======================================================== */}
        <section className="profile-dna-section" id="creative-dna-section" style={{ marginTop: '36px' }}>
          <div className="profile-dna-card" style={{ padding: '32px' }}>
            {/* Header */}
            <div className="dna-card-header" style={{ marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="live-pulse-dot" />
                  <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-lavender-deep)' }}>
                    Alloy Creative DNA Dossier
                  </span>
                </div>
                <h2 className="font-editorial" style={{ margin: 0, fontSize: '1.75rem' }}>
                  Creative Fingerprint & Provenance
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  fontSize: '0.78rem', 
                  padding: '4px 12px', 
                  borderRadius: '100px', 
                  fontWeight: 600,
                  background: isDevelopingPortfolio ? 'rgba(234, 179, 8, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  color: isDevelopingPortfolio ? '#B45309' : '#059669'
                }}>
                  {isDevelopingPortfolio ? 'Developing Portfolio' : 'Verified Portfolio'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  {publishedProjects.length} Verified Evidence {publishedProjects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>
            </div>

            {/* Developing Portfolio Callout */}
            {isDevelopingPortfolio && (
              <div style={{ padding: '14px 18px', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                <div style={{ fontSize: '0.88rem', color: '#B45309', lineHeight: 1.5 }}>
                  <strong>Creative DNA is still developing.</strong> Add more portfolio projects to help brands understand your creative style and verify your generative execution.
                </div>
              </div>
            )}

            {/* DNA Traits Pills */}
            {creatorDNA.traits && creatorDNA.traits.length > 0 && (
              <div className="dna-traits-row" style={{ marginBottom: '20px' }}>
                {creatorDNA.traits.map((trait, i) => (
                  <span key={i} className="dna-trait-pill">
                    {trait}
                  </span>
                ))}
              </div>
            )}

            {/* 3-Tier Provenance Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginTop: '16px' }}>
              {/* Provenance Category 1: Creator-Provided */}
              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    1. Creator-Provided
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Self-Reported
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Specialty:</strong> {provenance.creatorProvided.statedSpecialty}</div>
                  <div><strong>Declared Tools:</strong> {(provenance.creatorProvided.toolsUsed || []).join(', ') || 'Generative suite'}</div>
                  <div><strong>Preferred Styles:</strong> {(provenance.creatorProvided.preferredStyles || []).join(', ')}</div>
                  <div><strong>Location:</strong> {provenance.creatorProvided.location}</div>
                  <div><strong>Availability:</strong> {provenance.creatorProvided.availability}</div>
                </div>
              </div>

              {/* Provenance Category 2: Portfolio-Supported */}
              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', fontWeight: 700 }}>
                    2. Portfolio-Supported
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontWeight: 600 }}>
                    Verified Evidence
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Verified Projects:</strong> {provenance.portfolioSupported.totalVerifiedProjects} public projects</div>
                  <div><strong>Demonstrated Formats:</strong> {(provenance.portfolioSupported.demonstratedFormats || []).join(', ') || 'Visual Media'}</div>
                  <div><strong>Delivered Aspect Ratios:</strong> {(provenance.portfolioSupported.aspectRatiosDelivered || []).join(', ') || '16:9, 9:16'}</div>
                  <div><strong>Client Tiers:</strong> {(provenance.portfolioSupported.verifiedClientTiers || []).join(', ') || 'Commercial Commissions'}</div>
                </div>
              </div>

              {/* Provenance Category 3: AI-Inferred */}
              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-lavender-deep)', fontWeight: 700 }}>
                    3. AI-Inferred
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--accent-lavender-deep)', fontWeight: 600 }}>
                    Synthesized Observation
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Visual Signature:</strong> {provenance.aiInferred.visualAesthetic}</div>
                  <div><strong>Storytelling Approach:</strong> {provenance.aiInferred.storytellingApproach}</div>
                  <div><strong>Product Staging:</strong> {provenance.aiInferred.productPresentationStyle}</div>
                  <div><strong>Derived Pacing:</strong> {provenance.aiInferred.derivedPacing}</div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  * Inferred from semantic patterns across published projects. Not a verified contractual guarantee.
                </div>
              </div>
            </div>

            {/* Verified Capabilities Breakdown: Technical & Creative Skills */}
            <div style={{ 
              marginTop: '28px', 
              padding: '24px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '14px', 
              border: '1px solid var(--border-subtle)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} style={{ color: 'var(--accent-lavender-deep)' }} />
                    Creator Capabilities & Skill Taxonomy
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Self-reported technical tooling and creative capabilities documented by this creator.
                  </p>
                </div>
                <span style={{ 
                  fontSize: '0.74rem', 
                  color: 'var(--text-tertiary)', 
                  background: 'var(--bg-card)', 
                  padding: '3px 10px', 
                  borderRadius: '100px', 
                  border: '1px solid var(--border-subtle)' 
                }}>
                  Self-Declared Profile Skills
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Technical Skills Box */}
                <div style={{ 
                  background: '#FFFFFF', 
                  padding: '16px 18px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  boxShadow: '0 1px 4px rgba(6, 182, 212, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '6px', 
                        background: 'rgba(6, 182, 212, 0.12)', 
                        color: '#0891B2', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Cpu size={14} />
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#0E7490' }}>Technical Skills & AI Stack</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#0891B2', fontWeight: 600 }}>
                      {(publicCreator.technicalSkills || []).length} Skills
                    </span>
                  </div>

                  {(publicCreator.technicalSkills && publicCreator.technicalSkills.length > 0) ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                      {publicCreator.technicalSkills.map((skill, sIdx) => (
                        <span 
                          key={sIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(6, 182, 212, 0.08)',
                            color: '#0E7490',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0891B2' }} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      No technical skills documented yet.
                    </p>
                  )}
                </div>

                {/* Creative Skills Box */}
                <div style={{ 
                  background: '#FFFFFF', 
                  padding: '16px 18px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  boxShadow: '0 1px 4px rgba(124, 58, 237, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '6px', 
                        background: 'rgba(124, 58, 237, 0.12)', 
                        color: '#7C3AED', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Palette size={14} />
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#6D28D9' }}>Creative Skills & Art Direction</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 600 }}>
                      {(publicCreator.creativeSkills || []).length} Skills
                    </span>
                  </div>

                  {(publicCreator.creativeSkills && publicCreator.creativeSkills.length > 0) ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                      {publicCreator.creativeSkills.map((skill, sIdx) => (
                        <span 
                          key={sIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(124, 58, 237, 0.08)',
                            color: '#6D28D9',
                            border: '1px solid rgba(124, 58, 237, 0.2)',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7C3AED' }} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      No creative skills documented yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Trust Guarantee */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-lavender-deep)', flexShrink: 0 }} />
              <span>Alloy enforces strict truth-in-advertising. Creative DNA never manufactures fake follower numbers, client logos, or engagement statistics.</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            C. PORTFOLIO — THE VISUAL CENTERPIECE
            Image-led, artwork occupies ~1 viewport in height on desktop
            with compact information panel and vertically centered text
            ======================================================== */}
        <section className="profile-portfolio-section" id="selected-work-section" style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-label">Section 02 • Portfolio</span>
              <h2 className="profile-section-title font-editorial">
                Featured Work & Case Studies
              </h2>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Demonstrated commercial commissions, generative pipelines, and visual worldbuilding.
              </p>
            </div>

            {/* Category Filter Pills */}
            {availableCategories.length > 2 && (
              <div className="portfolio-filters-group">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`portfolio-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? `All Works (${publishedProjects.length})` : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image-Led Editorial Showcase Grid */}
          {filteredProjects.length > 0 ? (
            <div className="portfolio-gallery-grid">
              {filteredProjects.map((proj) => {
                const isExpanded = expandedProjectIds.includes(proj.id);

                return (
                  <article
                    key={proj.id}
                    className="portfolio-showcase-card"
                  >
                    {/* Dominant Artwork Side (Approx 1 desktop viewport height) */}
                    <div
                      className="portfolio-showcase-media"
                      onClick={() => onSelectProject && onSelectProject(proj, publicCreator)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Explore case study for ${proj.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          onSelectProject && onSelectProject(proj, publicCreator);
                        }
                      }}
                    >
                      <img
                        src={proj.image}
                        alt={proj.title}
                        loading="lazy"
                        className="portfolio-showcase-img"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85";
                        }}
                      />

                      {proj.featured && (
                        <span className="portfolio-featured-badge">
                          ★ Featured
                        </span>
                      )}

                      <div className="portfolio-showcase-overlay">
                        <span>Explore Case Study →</span>
                      </div>
                    </div>

                    {/* Compact Information Panel Alongside Artwork (Vertically Centered) */}
                    <div className="portfolio-showcase-info">
                      <div className="portfolio-info-meta-top">
                        <span className="portfolio-item-cat">{proj.category || 'Visual Art'}</span>
                        {proj.format && (
                          <span className="portfolio-item-format">
                            {proj.format}
                          </span>
                        )}
                      </div>

                      <h3 className="portfolio-showcase-title font-editorial">
                        {proj.title}
                      </h3>

                      {proj.role && (
                        <p className="portfolio-item-role">
                          Role: <strong>{proj.role}</strong> {proj.clientType ? `• ${proj.clientType}` : ''}
                        </p>
                      )}

                      {/* Description with Restrained Keyboard-Accessible "View Details" Interaction */}
                      <div className="portfolio-desc-wrapper">
                        <p className={`portfolio-showcase-desc ${isExpanded ? 'expanded' : 'clamped'}`}>
                          {proj.description}
                        </p>
                        {proj.description && proj.description.length > 120 && (
                          <button
                            type="button"
                            className="portfolio-details-toggle"
                            onClick={(e) => toggleExpandProject(e, proj.id)}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? `Show less description for ${proj.title}` : `View full description for ${proj.title}`}
                          >
                            <span>{isExpanded ? "Show less" : "View details"}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}
                      </div>

                      {/* Capabilities Tags Cloud */}
                      {proj.capabilities && proj.capabilities.length > 0 && (
                        <div className="chip-cloud" style={{ marginTop: '14px' }}>
                          {proj.capabilities.map((cap, i) => (
                            <span key={i} className="skill-chip portfolio-spec-chip">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Workflow indicator & Technical tags */}
                      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        {proj.workflowStages && proj.workflowStages.length > 0 ? (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            fontSize: '0.74rem', 
                            fontWeight: 600, 
                            color: '#0891B2', 
                            background: 'rgba(6, 182, 212, 0.08)', 
                            border: '1px solid rgba(6, 182, 212, 0.22)',
                            padding: '3px 9px', 
                            borderRadius: '100px' 
                          }}>
                            <GitCommit size={12} />
                            <span>{proj.workflowStages.length} Production Stages Documented</span>
                          </span>
                        ) : (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            color: 'var(--text-tertiary)', 
                            fontStyle: 'italic' 
                          }}>
                            Standard portfolio piece
                          </span>
                        )}

                        {proj.commercialRights && (
                          <span style={{ 
                            fontSize: '0.7rem', 
                            color: '#059669', 
                            fontWeight: 600, 
                            background: 'rgba(16, 185, 129, 0.08)', 
                            padding: '2px 8px', 
                            borderRadius: '4px' 
                          }}>
                            Commercial Rights Verified
                          </span>
                        )}
                      </div>

                      <div className="portfolio-showcase-actions" style={{ marginTop: '16px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectProject && onSelectProject(proj, publicCreator)}
                        >
                          <span>Open Case Study & AI Workflow</span>
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Honest Empty State */
            <div className="portfolio-empty-state" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-medium)' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.4rem', marginBottom: '6px' }}>
                No published portfolio projects yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem' }}>
                This creator has not yet published brand-visible case studies to their public profile.
              </p>
            </div>
          )}
        </section>


        {/* ========================================================
            B2. SECTION 02 • CREATIVE WORKFLOW — HOW THEY CREATE
            ======================================================== */}
        <section className="profile-workflow-section" id="creative-workflows-section" style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-label">Section 02 • Creative Workflow</span>
              <h2 className="profile-section-title font-editorial">
                How They Create — Production Pipelines
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Standardized production methodologies, generative models, and human artistry verified in commercial practice.
              </p>
            </div>

            {/* Workflow Switcher Pills if creator has multiple published workflows */}
            {publishedWorkflows.length > 1 && (
              <div className="portfolio-filters-group">
                {publishedWorkflows.map(wf => (
                  <button
                    key={wf.id}
                    type="button"
                    className={`portfolio-filter-pill ${(selectedWorkflow && selectedWorkflow.id === wf.id) ? 'active' : ''}`}
                    onClick={() => setActiveWorkflowId(wf.id)}
                  >
                    {wf.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Render Timeline or Clean Empty State */}
          {selectedWorkflow ? (
            <WorkflowTimeline 
              workflow={selectedWorkflow}
              isReadOnly={true}
              onSelectProject={(projId) => {
                const matchedProj = publishedProjects.find(p => p.id === projId);
                if (matchedProj && onSelectProject) {
                  onSelectProject(matchedProj, publicCreator);
                }
              }}
            />
          ) : (
            /* Clean Empty State (strictly without fabricated content) */
            <div className="portfolio-empty-state" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
              <Compass size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
              <h3 className="font-editorial" style={{ fontSize: '1.4rem', marginBottom: '6px' }}>
                No published creative workflows yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem' }}>
                This creator has not yet published step-by-step production pipelines to their public profile.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================
            B3. SECTION 03 • TRUST & VERIFICATION DOSSIER
            ======================================================== */}
        <section className="profile-trust-section" id="trust-verification-section" style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-label" style={{ color: '#059669' }}>Section 03 • Trust & Verification</span>
              <h2 className="profile-section-title font-editorial">
                Verified Credentials & Production Provenance
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Audited evidence, cryptographically confirmed contact channels, and transparent AI tool disclosures.
              </p>
            </div>

            {publicCreator.trustVerification?.isDemoProfile && (
              <span style={{
                fontSize: '0.74rem',
                padding: '4px 12px',
                borderRadius: '100px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#2563EB',
                fontWeight: 600
              }}>
                Demonstration Profile • Illustrative Evidence
              </span>
            )}
          </div>

          {/* Verification Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* 1. Account & Email */}
            <div style={{ padding: '18px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', flexShrink: 0 }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  Account Authentication
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {publicCreator.trustVerification?.email?.status === 'verified' ? 'Verified Account' : 'Session Active'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {publicCreator.trustVerification?.email?.verifiedAt ? `Confirmed: ${publicCreator.trustVerification.email.verifiedAt}` : 'Contact channel confirmed'}
                </div>
              </div>
            </div>

            {/* 2. Identity Standing */}
            <div style={{ padding: '18px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: '#7C3AED', flexShrink: 0 }}>
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  Legal Personhood
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {publicCreator.trustVerification?.identity?.status === 'verified' 
                    ? 'Identity Verified' 
                    : (publicCreator.trustVerification?.identity?.status === 'under_review' ? 'Under Compliance Review' : 'Identity Declaration')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {publicCreator.trustVerification?.identity?.issuingCountry ? `Jurisdiction: ${publicCreator.trustVerification.identity.issuingCountry}` : 'Stripe Identity / Compliance'}
                </div>
              </div>
            </div>

            {/* 3. Portfolio Evidence */}
            <div style={{ padding: '18px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', flexShrink: 0 }}>
                <FileCheck2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  Portfolio Authenticity
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {(publicCreator.trustVerification?.portfolioEvidence || []).length} Evidence Packs
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Raw project files & ComfyUI seeds
                </div>
              </div>
            </div>

            {/* 4. Platform Delivery History */}
            <div style={{ padding: '18px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', flexShrink: 0 }}>
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  Platform Escrow History
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {publicCreator.trustVerification?.platformHistory?.completedEngagementsCount || 0} Delivered Contracts
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {publicCreator.trustVerification?.platformHistory?.hasHistory ? `${publicCreator.trustVerification.platformHistory.totalMilestonesDelivered} Verified Milestones` : 'New marketplace participant'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Trust Transparency Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px 28px'
          }}>
            {/* AI Tools & Models Disclosures */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Transparent AI Model & Tool Disclosures
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  Provenance: Audited vs. Evidence-Backed vs. Creator-Declared
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {(publicCreator.trustVerification?.toolDeclarations || []).map(decl => {
                  const provKey = decl.provenance?.toUpperCase() || 'CREATOR_DECLARED';
                  const prov = PROVENANCE_LEVELS[provKey] || PROVENANCE_LEVELS.CREATOR_DECLARED;

                  return (
                    <div key={decl.id} style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{decl.toolName}</strong>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: prov.bg,
                          color: prov.color,
                          fontWeight: 700
                        }}>
                          {prov.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {decl.useCase}
                      </p>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Application: <em>{decl.associatedWork}</em>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Commercial Licensing & Rights Warranty */}
            {publicCreator.trustVerification?.licensing?.modelRightsDeclaration && (
              <div style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(202, 138, 4, 0.1)', color: '#CA8A04', flexShrink: 0 }}>
                  <FileText size={18} />
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Declared Commercial Licensing Scope: </strong>
                  {publicCreator.trustVerification.licensing.modelRightsDeclaration}
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                    License Terms: <strong>{publicCreator.trustVerification.licensing.licenseTypeGranted}</strong> • {publicCreator.trustVerification.licensing.exclusivityPeriod}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            D. COLLABORATION INFORMATION & EDITORIAL SPECS
            Sections 03 and 04: Restrained typography, borders, and clean surfaces
            No heavy colored background boxes
            ======================================================== */}
        <div className="profile-editorial-details-grid" style={{ marginTop: '48px' }}>
          {/* Section: Creative Direction & Bio */}
          <div className="profile-details-card">
            <span className="section-label">Section 03 • Creative Approach</span>
            <h3 className="font-editorial" style={{ fontSize: '1.85rem', marginBottom: '12px' }}>
              Artistic Philosophy
            </h3>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {publicCreator.bio}
            </p>

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
              <span className="sidebar-heading">Preferred Industries</span>
              <div className="chip-cloud" style={{ marginTop: '10px' }}>
                {(publicCreator.industries || []).map((ind, i) => (
                  <span key={i} className="skill-chip spec-clean-chip">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Capabilities, Styles & Generative Tools */}
          <div className="profile-details-card">
            {/* Capabilities */}
            <div className="profile-block-row">
              <span className="sidebar-heading">Section 04 • Core Capabilities</span>
              <div className="chip-cloud" style={{ marginTop: '10px' }}>
                {(publicCreator.capabilities || []).map((cap, i) => (
                  <span key={i} className="skill-chip spec-clean-chip">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Aesthetics */}
            <div className="profile-block-row">
              <span className="sidebar-heading">Section 05 • Aesthetic Styles</span>
              <div className="chip-cloud" style={{ marginTop: '10px' }}>
                {(publicCreator.styles || []).map((st, i) => (
                  <span key={i} className="skill-chip spec-aesthetic-chip">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Generative Stack */}
            <div className="profile-block-row" style={{ marginBottom: 0 }}>
              <span className="sidebar-heading">Section 06 • Generative Pipeline</span>
              <div className="chip-cloud" style={{ marginTop: '10px' }}>
                {(publicCreator.tools || []).map((tool, i) => (
                  <span key={i} className="skill-chip spec-clean-chip">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            E. BOTTOM BRAND ACTIONS BANNER
            Order matches hero: Primary action first, Shortlist second
            with stable min-width to avoid any horizontal shift
            ======================================================== */}
        <div className="profile-bottom-cta-banner" style={{ marginTop: '56px' }}>
          <div>
            <h3 className="font-editorial" style={{ fontSize: '1.9rem', marginBottom: '4px' }}>
              Work with {publicCreator.name.split(' ')[0]}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              Direct creative collaboration for your next commercial campaign or visual worldbuilding brief.
            </p>
          </div>

          <div className="profile-cta-actions">
            {isConnected ? (
              <button 
                type="button" 
                className="btn btn-secondary btn-lg"
                style={{ borderColor: 'var(--accent-lavender)', color: 'var(--accent-lavender-deep)' }}
                onClick={() => onOpenConversation && onOpenConversation(matchingConn)}
              >
                <CheckCircle2 size={16} />
                <span>Connected • Open Chat</span>
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary btn-lg"
                onClick={() => onInviteCreator(publicCreator)}
              >
                <Send size={15} />
                <span>Invite to Campaign</span>
              </button>
            )}

            {evaluatedCampaign && onToggleShortlist && (
              <button
                type="button"
                className={`btn btn-secondary btn-lg btn-shortlist-stable ${isShortlisted ? 'saved' : ''}`}
                onClick={() => onToggleShortlist(evaluatedCampaign.id, publicCreator.id)}
                aria-pressed={isShortlisted}
              >
                {isShortlisted ? (
                  <>
                    <BookmarkCheck size={16} style={{ color: 'var(--accent-lavender-deep)' }} />
                    <span>Shortlisted</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    <span>Add to Shortlist</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: TRUST BADGE VERIFICATION DETAILS & TRUTHFUL SCOPE
          ======================================================== */}
      {selectedTrustBadge && (
        <div className="modal-backdrop" onClick={() => setSelectedTrustBadge(null)}>
          <div className="creator-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.3rem' }}>
                    {selectedTrustBadge.title}
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    {selectedTrustBadge.category}
                  </span>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedTrustBadge(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Current Status Pill */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: STATUS_META[selectedTrustBadge.status]?.bg,
                color: STATUS_META[selectedTrustBadge.status]?.color
              }}>
                Current Status: {STATUS_META[selectedTrustBadge.status]?.label}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {selectedTrustBadge.description}
            </p>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  What Was Checked:
                </strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedTrustBadge.whatWasChecked}
                </span>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Audit Criteria:
                </strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedTrustBadge.criteria}
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                <strong style={{ display: 'block', color: '#D97706', marginBottom: '2px' }}>
                  Specific Limitations & Truthful Disclaimers:
                </strong>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.76rem' }}>
                  {selectedTrustBadge.limitations}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedTrustBadge(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
