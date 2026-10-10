// src/views/CreatorProfileView.jsx
// Premium Brand-Facing Creator Portfolio & Evidence-Grounded Creative DNA
// Single Source of Truth: Reads directly from unified creator record with strict visibility isolation

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, MapPin, Heart, Share2, Send, Sparkles, ArrowDown, Dna, 
  CheckCircle2, MessageSquare, Clock, ShieldCheck, AlertCircle, Bookmark, 
  BookmarkCheck, ExternalLink, Edit3, Eye, Layers, ChevronRight, Check,
  Sparkle, Compass, UserCheck, Wrench, Cpu
} from 'lucide-react';
import { getPublicCreatorProfile } from '../data/marketplaceStore';
import { generateCreatorDNA } from '../intelligence/creatorDNA';
import { calculateCreaMatch } from '../intelligence/matchingEngine';
import { explainMatch } from '../intelligence/matchExplainer';
import WorkflowTimeline from '../components/WorkflowTimeline';
import { DEMO_WORKFLOWS } from '../data/workflowsData';

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

  // Strict Single Source of Truth: Filter out private portfolio items for brand view
  const publicCreator = useMemo(() => getPublicCreatorProfile(creator), [creator]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            type="button" 
            className="profile-back-link"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
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

              {/* Brand Actions */}
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

                {/* Shortlist Action */}
                {evaluatedCampaign && onToggleShortlist && (
                  <button
                    type="button"
                    className={`btn btn-secondary btn-lg ${isShortlisted ? 'saved' : ''}`}
                    onClick={() => onToggleShortlist(evaluatedCampaign.id, publicCreator.id)}
                    title={isShortlisted ? `Remove from ${evaluatedCampaign.title} shortlist` : `Add to ${evaluatedCampaign.title} shortlist`}
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
            B. PORTFOLIO — THE VISUAL CENTERPIECE
            ======================================================== */}
        <section className="profile-portfolio-section" id="selected-work-section" style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-label">Section 01 • Portfolio</span>
              <h2 className="profile-section-title font-editorial">
                Featured Work & Case Studies
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
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

          {/* Editorial Portfolio Grid */}
          {filteredProjects.length > 0 ? (
            <div className="portfolio-gallery-grid">
              {filteredProjects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="portfolio-item-card"
                  onClick={() => onSelectProject && onSelectProject(proj, publicCreator)}
                >
                  <div className="portfolio-item-media" style={{ position: 'relative' }}>
                    <img 
                      src={proj.image} 
                      alt={proj.title} 
                      loading="lazy" 
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85";
                      }}
                    />
                    
                    {proj.featured && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '0.72rem', padding: '3px 9px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.95)', color: '#FFFFFF', fontWeight: 600 }}>
                        ★ Featured
                      </span>
                    )}

                    <div className="portfolio-item-overlay">
                      <span>Explore Case Study →</span>
                    </div>
                  </div>

                  <div className="portfolio-item-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="portfolio-item-cat">{proj.category || 'Visual Art'}</span>
                      {proj.format && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                          {proj.format}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="portfolio-item-title">{proj.title}</h3>
                    
                    {proj.role && (
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', margin: '0 0 6px 0' }}>
                        Role: {proj.role} {proj.clientType ? `• ${proj.clientType}` : ''}
                      </p>
                    )}

                    <p className="portfolio-item-desc">{proj.description}</p>

                    {/* Capabilities Tags */}
                    {proj.capabilities && proj.capabilities.length > 0 && (
                      <div className="chip-cloud" style={{ marginTop: '10px' }}>
                        {proj.capabilities.slice(0, 3).map((cap, i) => (
                          <span key={i} className="skill-chip" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--bg-secondary)' }}>
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Honest Empty State */
            <div className="portfolio-empty-state" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
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
            C. CREATIVE DNA DOSSIER (EVIDENCE-GROUNDED 3-TIER PROVENANCE)
            ======================================================== */}
        <section className="profile-dna-section" id="creative-dna-section" style={{ marginTop: '50px' }}>
          <div className="profile-dna-card" style={{ padding: '32px' }}>
            {/* Header */}
            <div className="dna-card-header" style={{ marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="live-pulse-dot" />
                  <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-lavender-deep)' }}>
                    CreaSync Creative DNA Dossier
                  </span>
                </div>
                <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.7rem' }}>
                  Creative Fingerprint & Provenance
                </h3>
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

            {/* Developing Portfolio Callout (Mandatory Requirement) */}
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
              <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-subtle)' }}>
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
              <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', fontWeight: 700 }}>
                    2. Portfolio-Supported
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 600 }}>
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
              <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-lavender-deep)', fontWeight: 700 }}>
                    3. AI-Inferred
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-lavender-deep)', fontWeight: 600 }}>
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

            {/* Footer Trust Guarantee */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-lavender-deep)', flexShrink: 0 }} />
              <span>CreaSync enforces strict truth-in-advertising. Creative DNA never manufactures fake follower numbers, client logos, or engagement statistics.</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            D. COLLABORATION INFORMATION & EDITORIAL SPECS
            ======================================================== */}
        <div className="profile-editorial-details-grid" style={{ marginTop: '40px' }}>
          {/* Section: Creative Direction & Bio */}
          <div className="profile-details-card">
            <span className="section-label">Section 03 • Creative Approach</span>
            <h3 className="font-editorial" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
              Artistic Philosophy
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '18px' }}>
              {publicCreator.bio}
            </p>

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
              <span className="sidebar-heading">Preferred Industries</span>
              <div className="chip-cloud" style={{ marginTop: '8px' }}>
                {(publicCreator.industries || []).map((ind, i) => (
                  <span key={i} className="skill-chip" style={{ background: 'var(--bg-secondary)', fontWeight: 500 }}>
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Capabilities, Styles & Generative Tools */}
          <div className="profile-details-card profile-details-secondary">
            {/* Capabilities */}
            <div className="profile-block-row">
              <span className="sidebar-heading">Section 04 • Core Capabilities</span>
              <div className="chip-cloud" style={{ marginTop: '8px' }}>
                {(publicCreator.capabilities || []).map((cap, i) => (
                  <span key={i} className="skill-chip" style={{ background: '#FFFFFF', fontWeight: 500 }}>
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Aesthetics */}
            <div className="profile-block-row">
              <span className="sidebar-heading">Section 05 • Aesthetic Styles</span>
              <div className="chip-cloud" style={{ marginTop: '8px' }}>
                {(publicCreator.styles || []).map((st, i) => (
                  <span key={i} className="skill-chip" style={{ background: 'var(--accent-lavender-light)', color: 'var(--accent-lavender-deep)', borderColor: 'var(--accent-lavender)' }}>
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Generative Stack */}
            <div className="profile-block-row" style={{ marginBottom: 0 }}>
              <span className="sidebar-heading">Section 06 • Generative Pipeline</span>
              <div className="chip-cloud" style={{ marginTop: '8px' }}>
                {(publicCreator.tools || []).map((tool, i) => (
                  <span key={i} className="skill-chip" style={{ background: '#FFFFFF', opacity: 0.9 }}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            E. BOTTOM BRAND ACTIONS BANNER
            ======================================================== */}
        <div className="profile-bottom-cta-banner" style={{ marginTop: '50px' }}>
          <div>
            <h3 className="font-editorial" style={{ fontSize: '1.9rem', marginBottom: '4px' }}>
              Work with {publicCreator.name.split(' ')[0]}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              Direct creative collaboration for your next commercial campaign or visual worldbuilding brief.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {evaluatedCampaign && onToggleShortlist && (
              <button
                type="button"
                className={`btn btn-secondary btn-lg ${isShortlisted ? 'saved' : ''}`}
                onClick={() => onToggleShortlist(evaluatedCampaign.id, publicCreator.id)}
              >
                {isShortlisted ? (
                  <>
                    <BookmarkCheck size={16} style={{ color: 'var(--accent-lavender-deep)' }} />
                    <span>In Shortlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    <span>Add to Shortlist</span>
                  </>
                )}
              </button>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
