// src/components/PipelineTraceModal.jsx
// Desktop-First Explainable Campaign-to-Creator Filtering Pipeline Visualization
// Features horizontal connected stage track, truthful pacing, human-readable exclusions, and Discover integration.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Sliders,
  Sparkles,
  Layers,
  ShieldCheck,
  Cpu,
  Filter,
  ArrowRight,
  ExternalLink,
  Users,
  Search,
  Info,

  Play,
  RotateCcw,
  Check,
  Compass,
  FileText
} from 'lucide-react';

/**
 * Human-readable failed requirement dictionary
 */
export const READABLE_EXCLUSION_TITLES = {
  COMMERCIAL_LICENSING_UNVERIFIED: 'Commercial licensing not verified',
  PORTFOLIO_THRESHOLD_UNMET: 'Portfolio evidence below required threshold',
  MISSING_MANDATORY_SKILLS: 'Required mandatory skills missing',
  SPECIALIZATION_MISMATCH: 'Specialization mismatch',
  TOOL_CHAIN_INCOMPATIBLE: 'Required AI tools/models not in verified toolchain',
  FORMAT_UNSUPPORTED: 'Deliverable format unsupported'
};

export default function PipelineTraceModal({
  isOpen,
  onClose,
  pipelineTrace,
  isLoading = false,
  onSelectCreator,
  onViewAllEligible,
  onEditCampaign
}) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [revealedStageCount, setRevealedStageCount] = useState(1);
  const [isManualInspection, setIsManualInspection] = useState(false);
  const [expandedExclusions, setExpandedExclusions] = useState({});
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'eligible' | 'exclusions'

  // Track the previous isOpen value for edge-detection
  const prevIsOpenRef = useRef(false);

  const stagesTrackRef = useRef(null);
  const stageRefs = useRef([]);

  const stages = pipelineTrace?.stages || [];
  const summary = pipelineTrace?.summary || {};
  const rankedCreators = pipelineTrace?.rankedCreators || [];
  const globalExclusions = pipelineTrace?.exclusions || [];
  const globalWarnings = pipelineTrace?.warnings || [];
  const isComplete = revealedStageCount >= stages.length;

  // Fix 3: Reset modal state to Execution Stages whenever modal opens for a new viewing session
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Modal just opened — reset to initial presentation state
      setActiveTab('pipeline');
      setActiveStageIndex(0);
      setRevealedStageCount(1);
      setExpandedExclusions({});
      setIsManualInspection(false);
      // Reset scroll position on next frame
      requestAnimationFrame(() => {
        if (stagesTrackRef.current) {
          stagesTrackRef.current.scrollLeft = 0;
        }
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Fix 5: Progressive summary counts derived from the currently revealed stages
  const revealedStages = useMemo(() => stages.slice(0, revealedStageCount), [stages, revealedStageCount]);

  const displayedQualifiedCount = useMemo(() => {
    if (isComplete) {
      return summary.passedEligibilityCount ?? 0;
    }
    if (revealedStages.length === 0) return summary.totalCandidates ?? 0;
    const lastRevealed = revealedStages[revealedStages.length - 1];
    return lastRevealed ? lastRevealed.passedCount : (summary.totalCandidates ?? 0);
  }, [isComplete, revealedStages, summary]);

  const displayedExcludedCount = useMemo(() => {
    if (isComplete) {
      return summary.excludedCount ?? 0;
    }
    // Count unique excluded creator IDs across revealed stages to avoid double-counting
    const uniqueExcluded = new Set();
    revealedStages.forEach(st => {
      (st.rejections || []).forEach(r => uniqueExcluded.add(r.creatorId));
    });
    return uniqueExcluded.size;
  }, [isComplete, revealedStages, summary]);

  const displayedEligibleCreators = useMemo(() => {
    return isComplete ? rankedCreators : [];
  }, [isComplete, rankedCreators]);

  const displayedExclusions = useMemo(() => {
    if (isComplete) return globalExclusions;
    // Only show exclusions from revealed stages
    const revealedStageIds = new Set(revealedStages.map(s => s.stageId));
    return globalExclusions.filter(ex => revealedStageIds.has(ex.stage));
  }, [isComplete, globalExclusions, revealedStages]);

  // Truthful pacing: reveal one stage every 1600ms (1.6 seconds per stage)
  const isManualInspectionRef = useRef(false);

  useEffect(() => {
    isManualInspectionRef.current = isManualInspection;
  }, [isManualInspection]);

  useEffect(() => {
    if (!isOpen || !pipelineTrace || stages.length === 0) {
      setRevealedStageCount(1);
      setActiveStageIndex(0);
      setIsManualInspection(false);
      isManualInspectionRef.current = false;
      return;
    }

    const totalStages = stages.length;
    setRevealedStageCount(1);
    setActiveStageIndex(0);
    setIsManualInspection(false);
    isManualInspectionRef.current = false;

    let current = 1;
    const interval = setInterval(() => {
      if (current < totalStages) {
        current++;
        setRevealedStageCount(current);
        if (!isManualInspectionRef.current) {
          setActiveStageIndex(current - 1);
        }
      } else {
        clearInterval(interval);
      }
    }, 1600);

    return () => clearInterval(interval);
  }, [isOpen, pipelineTrace]);

  // Smoothly keep the active stage centered in horizontal desktop track during automated reveal
  useEffect(() => {
    if (!isManualInspection && stageRefs.current[activeStageIndex]) {
      stageRefs.current[activeStageIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeStageIndex, isManualInspection]);

  if (!isOpen) return null;

  const activeStage = stages[activeStageIndex] || stages[0];


  const handleSelectStageCard = (idx) => {
    if (idx < revealedStageCount) {
      setIsManualInspection(true);
      isManualInspectionRef.current = true;
      setActiveStageIndex(idx);
    }
  };

  const toggleExclusion = (id) => {
    setExpandedExclusions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStageIcon = (stageId) => {
    switch (stageId) {
      case 'stage_01_brief_normalization':
        return <Layers size={16} />;
      case 'stage_02_skills_filter':
        return <Cpu size={16} />;
      case 'stage_03_specialization_filter':
        return <Filter size={16} />;
      case 'stage_04_ai_tools_filter':
        return <Sparkles size={16} />;
      case 'stage_05_format_filter':
        return <Sliders size={16} />;
      case 'stage_06_licensing_verification':
        return <ShieldCheck size={16} />;
      case 'stage_07_ranking_engine':
        return <Sparkles size={16} />;
      default:
        return <Filter size={16} />;
    }
  };

  const getReadableCode = (code) => {
    return READABLE_EXCLUSION_TITLES[code] || code.replace(/_/g, ' ').toLowerCase();
  };

  return (
    <div className="modal-overlay pipeline-trace-overlay" onClick={onClose}>
      <div
        className="modal-content pipeline-desktop-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="pipeline-modal-header">
          <div className="pipeline-header-info">
            <div className="pipeline-header-badge-row">
              <span className="live-pulse-dot" />
              <span className="section-label">
                Backend Filtering Pipeline
              </span>
              <span className="badge-subtle">
                Trace ID: {pipelineTrace?.executionId ? `${pipelineTrace.executionId.slice(0, 14)}…` : 'exec_authoritative'}
              </span>
              {pipelineTrace?.source && (
                <span className="badge-subtle">
                  Source: {pipelineTrace.source}
                </span>
              )}
            </div>
            <h2 className="pipeline-campaign-title font-editorial">
              {pipelineTrace?.campaignTitle || 'Campaign Filtering Trace'}
            </h2>
          </div>

          <div className="pipeline-header-actions">
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close Pipeline Trace"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {pipelineTrace?.isStale && (
          <div className="pipeline-stale-banner" style={{
            background: 'rgba(235, 110, 75, 0.12)',
            border: '1px solid rgba(235, 110, 75, 0.35)',
            borderRadius: '8px',
            padding: '10px 16px',
            margin: '12px 24px 0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#eb6e4b',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={16} />
            <span><strong>Outdated Trace:</strong> {pipelineTrace.staleReason || 'Campaign brief has changed since this pipeline run was computed. Prior results are retained as stale.'}</span>
          </div>
        )}

        {isLoading && !pipelineTrace ? (
          <div className="pipeline-loading-container">
            <div className="ai-processing-visual">
              <span className="ai-processing-ring" />
              <Sparkles size={28} className="sparkle-gold-icon" />
            </div>
            <h3 className="font-editorial pipeline-loading-title">
              Executing Server-Side Filtering Pipeline…
            </h3>
            <p className="pipeline-loading-sub">
              Querying authoritative creator records, enforcing mandatory eligibility constraints, and scoring Creative Fit...
            </p>
          </div>
        ) : (
          <>
            {/* Top Summary KPI Bar */}
            <div className="pipeline-kpi-bar">
              <div className="pipeline-kpi-item">
                <span className="pipeline-kpi-label">Authoritative Pool</span>
                <div className="pipeline-kpi-val">{summary.totalCandidates ?? 0} Creators</div>
              </div>
              <div className="pipeline-kpi-item">
                <span className="pipeline-kpi-label">Eligible Candidates</span>
                <div className="pipeline-kpi-val val-green">{displayedQualifiedCount} Qualified</div>
              </div>
              <div className="pipeline-kpi-item">
                <span className="pipeline-kpi-label">Total Excluded</span>
                <div className="pipeline-kpi-val val-red">{displayedExcludedCount} Removed</div>
              </div>
              <div className="pipeline-kpi-item">
                <span className="pipeline-kpi-label">Presentation State</span>
                <div className="pipeline-kpi-val val-status">
                  {isComplete ? (
                    <>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>7 Stages Computed</span>
                    </>
                  ) : (
                    <>
                      <span className="live-pulse-dot" />
                      <span>Presenting Trace ({revealedStageCount}/7)…</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="pipeline-tab-nav">
              <button
                type="button"
                className={`pipeline-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('pipeline')}
              >
                <Layers size={15} />
                <span>Execution Stages ({stages.length})</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab-btn ${activeTab === 'eligible' ? 'active' : ''}`}
                onClick={() => setActiveTab('eligible')}
              >
                <Sparkles size={15} />
                <span>Ranked Eligible Creators ({displayedEligibleCreators.length})</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab-btn ${activeTab === 'exclusions' ? 'active' : ''}`}
                onClick={() => setActiveTab('exclusions')}
              >
                <XCircle size={15} />
                <span>Exclusion Ledger ({displayedExclusions.length})</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="pipeline-modal-body">

              {/* TAB 1: Horizontal Connected Stages Pipeline Track */}
              {activeTab === 'pipeline' && (
                <div className="pipeline-flow-container">

                  {/* Presentation Progress Banner */}
                  <div className="pipeline-pacing-indicator-bar">
                    <div className="pacing-text-wrap">
                      <span className="pacing-live-indicator">
                        {isComplete ? '✓ Presentation Complete' : '• Presenting computed backend results (Stage-by-stage review)'}
                      </span>
                      <span className="pacing-desc">
                        {isComplete
                          ? 'Click any stage card to inspect exact candidates and exclusion reasons.'
                          : `Currently reviewing Stage ${revealedStageCount} of 7. Each stage enforces a mandatory eligibility dimension.`}
                      </span>
                    </div>

                  </div>

                  {/* Desktop Horizontal Track */}
                  <div className="horizontal-stages-track-wrap" ref={stagesTrackRef}>
                    <div className="horizontal-stages-track">
                      {stages.map((stage, idx) => {
                        const isRevealed = idx < revealedStageCount;
                        const isActive = idx === activeStageIndex;
                        const isCurrentRevealing = idx === revealedStageCount - 1 && !isComplete;
                        const isRanking = stage.stageId === 'stage_07_ranking_engine';

                        let stageStatus = 'pending';
                        if (isRevealed) {
                          if (stage.rejectedCount > 0) {
                            stageStatus = 'filtered';
                          } else {
                            stageStatus = 'passed';
                          }
                        }

                        return (
                          <React.Fragment key={stage.stageId}>
                            <div
                              ref={el => stageRefs.current[idx] = el}
                              className={`horizontal-stage-card ${isRevealed ? 'revealed' : 'pending'} ${isActive ? 'selected' : ''} ${isCurrentRevealing ? 'pulsing-current' : ''}`}
                              onClick={() => handleSelectStageCard(idx)}
                              title={isRevealed ? `Inspect Stage ${idx + 1}: ${stage.stageName}` : `Stage ${idx + 1} will reveal shortly`}
                            >
                              <div className="stage-card-top">
                                <span className="stage-number-badge">0{idx + 1}</span>
                                <div className="stage-status-indicator">
                                  {isRevealed ? (
                                    isRanking ? (
                                      <span className="stage-pill-tag tag-rank">Ranked</span>
                                    ) : stage.rejectedCount > 0 ? (
                                      <span className="stage-pill-tag tag-rejected">-{stage.rejectedCount} Removed</span>
                                    ) : (
                                      <span className="stage-pill-tag tag-passed">All Passed</span>
                                    )
                                  ) : (
                                    <span className="stage-pill-tag tag-pending">Upcoming</span>
                                  )}
                                </div>
                              </div>

                              <div className="stage-card-icon-title">
                                <span className="stage-icon-circle">
                                  {getStageIcon(stage.stageId)}
                                </span>
                                <h4 className="stage-card-title">
                                  {stage.stageName}
                                </h4>
                              </div>

                              <p className="stage-card-purpose">
                                {stage.description}
                              </p>

                              <div className="stage-card-stats-footer">
                                {isRevealed ? (
                                  <div className="stage-counts-row">
                                    <span className="count-in">{stage.inputCount} In</span>
                                    <span className="count-divider">→</span>
                                    <span className="count-out">{stage.passedCount} Passed</span>
                                  </div>
                                ) : (
                                  <span className="stage-waiting-text">Awaiting review…</span>
                                )}
                              </div>
                            </div>

                            {/* Connecting Line between cards */}
                            {idx < stages.length - 1 && (
                              <div className={`stage-connector-line ${idx < revealedStageCount - 1 ? 'connected-active' : 'connected-pending'}`}>
                                <span className="connector-dot" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Stage Inspector Panel */}
                  {activeStage && (
                    <div className="active-stage-inspector studio-card">
                      <div className="inspector-header">
                        <div className="inspector-title-meta">
                          <span className="section-label">
                            Selected Stage Details • Stage 0{activeStageIndex + 1} of {stages.length}
                          </span>
                          <h3 className="inspector-stage-name font-editorial">
                            {activeStage.stageName}
                          </h3>
                          <p className="inspector-stage-desc">
                            {activeStage.description}
                          </p>
                        </div>

                        <div className="inspector-stage-summary-pills">
                          <span className="inspector-pill">
                            <strong>{activeStage.inputCount}</strong> entered stage
                          </span>
                          <span className="inspector-pill pill-passed">
                            <strong>{activeStage.passedCount}</strong> passed eligibility
                          </span>
                          {activeStage.rejectedCount > 0 && (
                            <span className="inspector-pill pill-failed">
                              <strong>{activeStage.rejectedCount}</strong> excluded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stage-Specific Exclusion Breakdown */}
                      {activeStage.rejections && activeStage.rejections.length > 0 ? (
                        <div className="stage-exclusions-section">
                          <h4 className="stage-section-heading heading-exclusions">
                            <XCircle size={15} />
                            <span>Creators Excluded at this Stage ({activeStage.rejections.length})</span>
                          </h4>
                          <div className="stage-rejections-list">
                            {activeStage.rejections.map((rej, i) => (
                              <div key={i} className="stage-rejection-card">
                                <div className="rejection-card-top">
                                  <div className="rej-creator-info">
                                    <span className="rej-creator-name">{rej.creatorName}</span>
                                    <span className="rej-creator-id">({rej.creatorId})</span>
                                  </div>
                                  <span className="rej-user-label">
                                    {getReadableCode(rej.code)}
                                  </span>
                                </div>
                                <p className="rej-reason-text">
                                  {rej.reason}
                                </p>

                                <button
                                  type="button"
                                  className="rej-details-toggle-btn"
                                  onClick={() => toggleExclusion(`stg-${rej.creatorId}-${i}`)}
                                >
                                  <span>{expandedExclusions[`stg-${rej.creatorId}-${i}`] ? 'Hide technical data' : 'Show technical data'}</span>
                                  {expandedExclusions[`stg-${rej.creatorId}-${i}`] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>

                                {expandedExclusions[`stg-${rej.creatorId}-${i}`] && (
                                  <div className="rej-tech-details">
                                    <div><strong>Reason Code:</strong> <code>{rej.code}</code></div>
                                    <div><strong>Stage:</strong> <code>{rej.stage}</code></div>
                                    {rej.missingFields && (
                                      <div><strong>Missing Requirements:</strong> {JSON.stringify(rej.missingFields)}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="stage-clean-pass-banner">
                          <CheckCircle2 size={20} color="#10b981" />
                          <div>
                            <div style={{ fontWeight: 600, color: '#10b981' }}>Full Eligibility Maintained</div>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                              All {activeStage.inputCount} candidates entering this stage satisfied all evaluated constraints.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stage 7: Ranked Creators Preview */}
                      {activeStage.stageId === 'stage_07_ranking_engine' && rankedCreators.length > 0 && (
                        <div className="stage-ranked-preview-section">
                          <h4 className="stage-section-heading">
                            <Sparkles size={15} className="text-mint" />
                            <span>Top Compatible Creators (Ranked by CreaMatch)</span>
                          </h4>
                          <div className="ranked-preview-grid">
                            {rankedCreators.slice(0, 3).map((item, idx) => (
                              <div key={item.creatorId} className="ranked-preview-card">
                                <div className="ranked-card-header">
                                  <span className="ranked-position-pill">#{idx + 1}</span>
                                  <img src={item.creator.avatar} alt={item.creator.name} className="ranked-avatar" />
                                  <div className="ranked-meta">
                                    <h5 className="ranked-creator-name">{item.creator.name}</h5>
                                    <span className="ranked-creator-role">{item.creator.specialty}</span>
                                  </div>
                                  <div className="ranked-score-badge">
                                    <span className="ranked-score-num">{item.score}%</span>
                                    <span className="ranked-score-lbl">{item.fitLabel}</span>
                                  </div>
                                </div>
                                <p className="ranked-summary-quote">
                                  "{item.explanation.summary}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: Ranked Eligible Creators */}
              {activeTab === 'eligible' && (
                <div className="pipeline-eligible-tab-content">
                  {rankedCreators.length === 0 ? (
                    <div className="pipeline-empty-state studio-card text-center">
                      <AlertTriangle size={40} className="text-amber" style={{ margin: '0 auto 14px' }} />
                      <h3 className="font-editorial empty-heading">
                        No Creators Met All Mandatory Requirements
                      </h3>
                      <p className="empty-subtext">
                        The campaign brief specified mandatory toolchains, specializations, or formats that none of the available creators currently possess in verified portfolio records.
                      </p>
                      <div className="empty-actions-row">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setActiveTab('exclusions')}
                        >
                          View Exclusion Ledger
                        </button>
                        {onEditCampaign && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              onClose();
                              onEditCampaign();
                            }}
                          >
                            <FileText size={14} />
                            <span>Adjust Campaign Brief</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="eligible-creators-list">
                      <div className="eligible-header-summary">
                        <div>
                          <h3 className="font-editorial" style={{ fontSize: '1.4rem', margin: 0 }}>
                            {rankedCreators.length} Verified Eligible Creators
                          </h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            Every creator below has passed all mandatory eligibility checks and is ranked by deterministic creative fit.
                          </p>
                        </div>
                        {onViewAllEligible && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              onClose();
                              onViewAllEligible({
                                campaignId: pipelineTrace?.campaignId,
                                campaignTitle: pipelineTrace?.campaignTitle,
                                eligibleCreatorIds: pipelineTrace?.eligibleCreatorIds || [],
                                rankedOrder: rankedCreators
                              });
                            }}
                          >
                            <Compass size={14} />
                            <span>Filter in Discover Creators</span>
                          </button>
                        )}
                      </div>

                      <div className="eligible-cards-grid">
                        {rankedCreators.map((item, idx) => (
                          <div key={item.creatorId} className="eligible-creator-card studio-card">
                            <div className="eligible-card-left">
                              <span className="eligible-rank-badge">#{idx + 1}</span>
                              <img src={item.creator.avatar} alt={item.creator.name} className="eligible-avatar" />
                              <div className="eligible-info">
                                <h4 className="eligible-name">{item.creator.name}</h4>
                                <span className="eligible-specialty">{item.creator.specialty} • {item.creator.location}</span>
                                <div className="eligible-styles-cloud">
                                  {(item.creator.styles || []).slice(0, 3).map((s, i) => (
                                    <span key={i} className="eligible-style-pill">{s}</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="eligible-card-middle">
                              <p className="eligible-evidence-quote">
                                "{item.explanation.summary}"
                              </p>
                              {item.explanation.highlights && item.explanation.highlights.length > 0 && (
                                <ul className="eligible-highlights-list">
                                  {item.explanation.highlights.slice(0, 2).map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="eligible-card-right">
                              <div className="eligible-score-box">
                                <span className="score-number">{item.score}%</span>
                                <span className="score-label">{item.fitLabel}</span>
                              </div>
                              {onSelectCreator && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm eligible-view-btn"
                                  onClick={() => onSelectCreator(item.creator)}
                                >
                                  <span>View Profile</span>
                                  <ArrowRight size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: User-Facing Exclusion Ledger */}
              {activeTab === 'exclusions' && (
                <div className="pipeline-exclusions-tab-content">
                  <div className="exclusions-header-intro">
                    <h3 className="font-editorial" style={{ fontSize: '1.4rem', margin: 0 }}>
                      Grounded Exclusion Ledger
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Creators were removed strictly when a mandatory brief requirement was not satisfied in verified profile data.
                    </p>
                  </div>

                  {displayedExclusions.length === 0 ? (
                    <div className="clean-exclusions-box">
                      <CheckCircle2 size={24} color="#10b981" />
                      <div>
                        <strong>No Excluded Creators</strong>
                        <p>All candidates satisfied every mandatory requirement.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="exclusions-ledger-list">
                      {displayedExclusions.map((ex, idx) => (
                        <div key={idx} className="exclusion-ledger-card studio-card">
                          <div className="ledger-card-top">
                            <div className="ledger-creator-title">
                              <XCircle size={16} className="text-danger" />
                              <span className="ledger-name">{ex.creatorName}</span>
                              <span className="ledger-id">({ex.creatorId})</span>
                            </div>

                            <span className="ledger-failed-badge">
                              {getReadableCode(ex.code)}
                            </span>
                          </div>

                          <p className="ledger-reason-text">
                            {ex.reason}
                          </p>

                          <div className="ledger-meta-row">
                            <span className="ledger-stage-name">
                              Stage: <strong>{ex.stage}</strong>
                            </span>

                            <button
                              type="button"
                              className="ledger-tech-toggle"
                              onClick={() => toggleExclusion(`glob-${idx}`)}
                            >
                              <span>{expandedExclusions[`glob-${idx}`] ? 'Hide Details' : 'Technical Details'}</span>
                              {expandedExclusions[`glob-${idx}`] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                          </div>

                          {expandedExclusions[`glob-${idx}`] && (
                            <div className="ledger-tech-drawer">
                              <div><strong>Machine Code:</strong> <code>{ex.code}</code></div>
                              <div><strong>Stage Identifier:</strong> <code>{ex.stage}</code></div>
                              {ex.missingFields && (
                                <div><strong>Unsatisfied Fields:</strong> {JSON.stringify(ex.missingFields)}</div>
                              )}
                              {ex.availableData && (
                                <div><strong>Available Creator Data:</strong> {JSON.stringify(ex.availableData)}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="pipeline-modal-footer">
              <div className="pipeline-footer-note">
                Verified against authoritative server database records.
              </div>
              <div className="pipeline-footer-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close Trace
                </button>
                {rankedCreators.length > 0 && onViewAllEligible && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onViewAllEligible({
                        campaignId: pipelineTrace?.campaignId,
                        campaignTitle: pipelineTrace?.campaignTitle,
                        eligibleCreatorIds: pipelineTrace?.eligibleCreatorIds || [],
                        rankedOrder: rankedCreators
                      });
                    }}
                  >
                    <span>View {rankedCreators.length} Eligible Creators in Discover</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
