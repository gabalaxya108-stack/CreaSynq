// src/components/PipelineTraceModal.jsx
// Desktop-First Explainable Campaign-to-Creator Filtering Pipeline Visualization
// Features horizontal connected stage track, truthful pacing, human-readable exclusions, and Discover integration.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  FileText,
  PanelRightClose,
  Eye,
  Target,
  BarChart3,
  Award,
  Zap,
  List
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

/**
 * Human-readable stage purpose descriptions
 */
const STAGE_PURPOSE_MAP = {
  stage_01_brief_normalization: 'This stage validates the campaign brief and separates mandatory hard requirements from preferred soft signals. It ensures the pipeline has well-defined constraints before evaluating any creator.',
  stage_02_skills_filter: 'Checks each creator\'s verified skills, capabilities, and portfolio evidence against the mandatory technical skills the campaign requires. Creators missing any required skill are excluded.',
  stage_03_specialization_filter: 'Verifies that each creator\'s primary specialty or domain category matches what the campaign needs. A fashion photographer won\'t pass a campaign requiring 3D product visualization.',
  stage_04_ai_tools_filter: 'Confirms creators have demonstrated production experience with the specific AI tools or generation models the campaign requires. Self-reported familiarity is insufficient — portfolio evidence is evaluated.',
  stage_05_format_filter: 'Ensures creators can deliver in the required output formats — whether that\'s vertical video, 4K stills, 3D renders, or other specific deliverable types the campaign specifies.',
  stage_06_licensing_verification: 'Validates commercial readiness: verified enterprise licensing credentials and minimum portfolio depth. A creator with great work but no commercial licensing verification cannot be engaged for licensed commercial use.',
  stage_07_ranking_engine: 'All creators reaching this stage have passed every mandatory eligibility check. This stage ranks eligible creators using the existing deterministic CreaMatch scoring system, which evaluates compatibility across six dimensions.'
};

/**
 * Part C helper: Build human-readable decision breakdown from a rejection object
 */
function buildDecisionBreakdown(ex) {
  const sections = [];
  const code = ex.code || '';
  const missing = ex.missingFields;
  const available = ex.availableData;

  switch (code) {
    case 'MISSING_MANDATORY_SKILLS': {
      const missingSkills = Array.isArray(missing) ? missing : [];
      const requiredSkills = Array.isArray(ex.requiredFields) ? ex.requiredFields : (missingSkills.length > 0 ? missingSkills : []);
      const creatorSkills = Array.isArray(available) ? available : [];
      // matched = required items the backend did not report in missingFields
      const matchedSkills = requiredSkills.filter(r => !missingSkills.includes(r));
      sections.push({ label: 'Campaign Required Skills', value: requiredSkills.join(', ') || 'None specified', type: 'requirement' });
      sections.push({ label: 'Creator Demonstrated Skills', value: creatorSkills.length > 0 ? creatorSkills.join(', ') : 'None recorded', type: 'evidence' });
      sections.push({ label: 'Matched Skills', value: matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None', type: matchedSkills.length > 0 ? 'pass' : 'fail' });
      sections.push({ label: 'Missing Skills', value: missingSkills.join(', ') || 'None', type: 'fail' });
      sections.push({ label: 'Coverage', value: `${matchedSkills.length} of ${requiredSkills.length} required skills matched (${requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0}%)`, type: 'metric' });
      sections.push({ label: 'Eligibility Result', value: 'Excluded — failed mandatory skill requirement', type: 'fail' });
      break;
    }
    case 'SPECIALIZATION_MISMATCH': {
      const requiredSpecs = Array.isArray(ex.requiredFields) ? ex.requiredFields : (Array.isArray(missing) ? missing : []);
      const creatorSpec = available?.specialty || 'Unspecified';
      const creatorTags = Array.isArray(available?.tags) ? available.tags : [];
      sections.push({ label: 'Campaign Required Specialization', value: requiredSpecs.join(' or ') || 'None specified', type: 'requirement' });
      sections.push({ label: 'Creator Primary Specialty', value: creatorSpec, type: 'evidence' });
      if (creatorTags.length > 0) {
        sections.push({ label: 'Creator Category Tags', value: creatorTags.join(', '), type: 'evidence' });
      }
      sections.push({ label: 'Eligibility Result', value: 'Excluded — no domain overlap with required specialization', type: 'fail' });
      break;
    }
    case 'TOOL_CHAIN_INCOMPATIBLE': {
      const missingTools = Array.isArray(missing) ? missing : [];
      const requiredTools = Array.isArray(ex.requiredFields) ? ex.requiredFields : (missingTools.length > 0 ? missingTools : []);
      const creatorTools = Array.isArray(available) ? available : [];
      // matched = required items the backend did not report in missingFields
      const matchedTools = requiredTools.filter(r => !missingTools.includes(r));
      sections.push({ label: 'Campaign Required Tools', value: requiredTools.join(', ') || 'None specified', type: 'requirement' });
      sections.push({ label: 'Creator Verified Toolchain', value: creatorTools.length > 0 ? creatorTools.join(', ') : 'None recorded', type: 'evidence' });
      sections.push({ label: 'Matched Tools', value: matchedTools.length > 0 ? matchedTools.join(', ') : 'None', type: matchedTools.length > 0 ? 'pass' : 'fail' });
      sections.push({ label: 'Missing Tools', value: missingTools.join(', ') || 'None', type: 'fail' });
      sections.push({ label: 'Eligibility Result', value: 'Excluded — missing required production AI toolchain experience', type: 'fail' });
      break;
    }
    case 'FORMAT_UNSUPPORTED': {
      const missingFormats = Array.isArray(missing) ? missing : [];
      const requiredFormats = Array.isArray(ex.requiredFields) ? ex.requiredFields : (missingFormats.length > 0 ? missingFormats : []);
      const creatorSpec = available?.specialty || 'Unspecified';
      const creatorTags = Array.isArray(available?.tags) ? available.tags : [];
      sections.push({ label: 'Campaign Required Formats', value: requiredFormats.join(', ') || 'None specified', type: 'requirement' });
      sections.push({ label: 'Creator Specialty', value: creatorSpec, type: 'evidence' });
      if (creatorTags.length > 0) {
        sections.push({ label: 'Creator Supported Tags', value: creatorTags.join(', '), type: 'evidence' });
      }
      sections.push({ label: 'Missing Formats', value: missingFormats.join(', ') || 'None', type: 'fail' });
      sections.push({ label: 'Eligibility Result', value: 'Excluded — deliverable format not supported', type: 'fail' });
      break;
    }
    case 'COMMERCIAL_LICENSING_UNVERIFIED':
    case 'PORTFOLIO_THRESHOLD_UNMET': {
      const data = (typeof available === 'object' && available !== null) ? available : {};
      const req = (typeof ex.requiredFields === 'object' && ex.requiredFields !== null) ? ex.requiredFields : {};
      const missingReqs = Array.isArray(ex.missingFields) ? ex.missingFields : [];
      const failedLicensing = missingReqs.includes('commercial_licensing_verification');
      const failedThreshold = missingReqs.includes('verified_portfolio_projects');
      sections.push({ label: 'Commercial Licensing Mandate', value: req.commercialLicensing ? 'Required (commercial-use enterprise authorization)' : 'Not required by this campaign', type: 'requirement' });
      if (req.minProjects > 0) {
        sections.push({ label: 'Portfolio Depth Requirement', value: `Minimum ${req.minProjects} verified project(s)`, type: 'requirement' });
      }
      if (missingReqs.length > 0) {
        sections.push({ label: 'Missing Requirement', value: missingReqs.map(m => String(m).replace(/_/g, ' ')).join(', '), type: 'fail' });
      }
      sections.push({ label: 'Verified Portfolio Projects Found', value: String(data.projectCount ?? 'None'), type: 'evidence' });
      sections.push({ label: 'Has Commercial Client Projects', value: data.hasCommercialClientWork ? 'Yes (demonstrated commercial client history)' : 'No', type: data.hasCommercialClientWork ? 'partial' : 'fail' });
      sections.push({ label: 'Licensing Verification Status', value: data.isLicensingVerified ? 'Verified' : 'Unverified in trust records', type: data.isLicensingVerified ? 'pass' : 'fail' });
      if (failedLicensing && data.hasCommercialClientWork) {
        sections.push({ label: 'Decision Reason', value: 'Creator has commercial client experience, but formal enterprise licensing credentials are not explicitly verified in creator trust records.', type: 'info' });
      }
      sections.push({
        label: 'Eligibility Result',
        value: failedLicensing
          ? 'Excluded — commercial licensing unverified'
          : failedThreshold
            ? 'Excluded — portfolio project threshold unmet'
            : 'Excluded — commercial readiness requirement not satisfied',
        type: 'fail'
      });
      break;
    }
    default: {
      if (missing) {
        sections.push({ label: 'Unsatisfied Requirements', value: Array.isArray(missing) ? missing.join(', ') : String(missing), type: 'fail' });
      }
      if (available) {
        sections.push({ label: 'Creator Evidence', value: typeof available === 'object' ? Object.entries(available).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ') : String(available), type: 'evidence' });
      }
    }
  }

  return sections;
}

/**
 * Get stage criteria labels from stage data
 */
function getStageCriteria(stage) {
  const criteria = [];
  if (stage.requiredSkills?.length > 0) {
    criteria.push({ label: 'Required Skills', items: stage.requiredSkills });
  }
  if (stage.requiredSpecialization?.length > 0) {
    criteria.push({ label: 'Required Specialization', items: stage.requiredSpecialization });
  }
  if (stage.requiredTools?.length > 0) {
    criteria.push({ label: 'Required AI Tools', items: stage.requiredTools });
  }
  if (stage.requiredFormats?.length > 0) {
    criteria.push({ label: 'Required Formats', items: stage.requiredFormats });
  }
  if (stage.requiredLicensing) {
    const lic = stage.requiredLicensing;
    if (lic.commercialLicensing) criteria.push({ label: 'Commercial Licensing', items: ['Verified Enterprise Authorization Required'] });
    if (lic.minProjects > 0) criteria.push({ label: 'Portfolio Depth Threshold', items: [`Minimum ${lic.minProjects} Verified Projects`] });
  }
  if (stage.extractedMandatory) {
    const m = stage.extractedMandatory;
    if (m.commercialLicensing && !criteria.some(c => c.label === 'Commercial Licensing')) {
      criteria.push({ label: 'Commercial Licensing', items: ['Required'] });
    }
    if (m.minProjects > 0 && !criteria.some(c => c.label.includes('Portfolio'))) {
      criteria.push({ label: 'Minimum Portfolio Depth', items: [`${m.minProjects}+ projects`] });
    }
  }
  return criteria;
}

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
  const [inspectorOpen, setInspectorOpen] = useState(false);

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
      setInspectorOpen(false);
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
      setInspectorOpen(true);
    }
  };

  const handleCloseInspector = () => {
    setInspectorOpen(false);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab !== 'pipeline') {
      setInspectorOpen(false);
    }
  };

  const showInspector = inspectorOpen && activeTab === 'pipeline';

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

  // ── Render the Stage Inspector Panel ──
  const renderInspectorPanel = () => {
    if (!activeStage) return null;

    const stagePurpose = STAGE_PURPOSE_MAP[activeStage.stageId] || activeStage.description;
    const criteria = getStageCriteria(activeStage);
    const passRate = activeStage.inputCount > 0
      ? ((activeStage.passedCount / activeStage.inputCount) * 100).toFixed(1)
      : '100.0';
    const isRanking = activeStage.stageId === 'stage_07_ranking_engine';
    const passedCreators = activeStage.passedCreatorSummaries || [];

    return (
      <div className="stage-inspector-card stage-inspector-panel">
        <div className="inspector-panel-header">
          <div className="inspector-header-top-row">
            <div className="inspector-badge-group">
              <span className="section-label">Node Detail</span>
              <span className="inspector-panel-badge">Stage 0{activeStageIndex + 1}</span>
            </div>
            <button
              type="button"
              className="inspector-close-btn"
              onClick={handleCloseInspector}
              aria-label="Close Node Detail and return to full pipeline"
              title="Return to full pipeline view"
            >
              <span>Full Pipeline</span>
              <PanelRightClose size={14} />
            </button>
          </div>
          <h3 className="inspector-panel-name font-editorial">{activeStage.stageName}</h3>
        </div>

        <div className="inspector-panel-body">
          {/* Section 1: Stage Purpose */}
          <div className="inspector-section">
            <h4 className="inspector-section-title">
              <Eye size={14} />
              <span>What This Stage Checks</span>
            </h4>
            <p className="inspector-purpose-text">{stagePurpose}</p>
          </div>

          {/* Section 2: Scan Results */}
          <div className="inspector-section">
            <h4 className="inspector-section-title">
              <BarChart3 size={14} />
              <span>Scan Results</span>
            </h4>
            <div className="inspector-scan-grid">
              <div className="scan-metric">
                <span className="scan-metric-value">{activeStage.inputCount}</span>
                <span className="scan-metric-label">Entered Stage</span>
              </div>
              <div className="scan-metric metric-pass">
                <span className="scan-metric-value">{activeStage.passedCount}</span>
                <span className="scan-metric-label">Passed</span>
              </div>
              <div className="scan-metric metric-fail">
                <span className="scan-metric-value">{activeStage.rejectedCount}</span>
                <span className="scan-metric-label">Excluded</span>
              </div>
              <div className="scan-metric metric-rate">
                <span className="scan-metric-value">{passRate}%</span>
                <span className="scan-metric-label">Pass Rate</span>
              </div>
            </div>
            {activeStage.bypassed && (
              <div className="inspector-bypass-note">
                <Info size={13} />
                <span>Campaign did not specify requirements for this dimension — all creators passed through.</span>
              </div>
            )}
          </div>

          {/* Section 3: Decision Criteria */}
          {criteria.length > 0 && (
            <div className="inspector-section">
              <h4 className="inspector-section-title">
                <Target size={14} />
                <span>Decision Criteria</span>
              </h4>
              <div className="inspector-criteria-list">
                {criteria.map((c, i) => (
                  <div key={i} className="criteria-row">
                    <span className="criteria-label">{c.label}</span>
                    <div className="criteria-items">
                      {c.items.map((item, j) => (
                        <span key={j} className="criteria-pill">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Creator Leaderboard */}
          {isRanking && rankedCreators.length > 0 ? (
            <div className="inspector-section">
              <h4 className="inspector-section-title">
                <Award size={14} />
                <span>Top Ranked Creators</span>
              </h4>
              <div className="inspector-leaderboard">
                {rankedCreators.slice(0, 5).map((item, idx) => (
                  <div key={item.creatorId} className="leaderboard-row">
                    <span className="leaderboard-rank">#{idx + 1}</span>
                    <img src={item.creator.avatar} alt={item.creator.name} className="leaderboard-avatar" />
                    <div className="leaderboard-info">
                      <span className="leaderboard-name">{item.creator.name}</span>
                      <span className="leaderboard-spec">{item.creator.specialty}</span>
                    </div>
                    <div className="leaderboard-score">
                      <span className="leaderboard-score-num">{item.score}%</span>
                      <span className="leaderboard-score-label">{item.fitLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : passedCreators.length > 0 && !isRanking ? (
            <div className="inspector-section">
              <h4 className="inspector-section-title">
                <CheckCircle2 size={14} />
                <span>Creators Who Passed ({activeStage.passedCount})</span>
              </h4>
              <div className="inspector-leaderboard">
                {passedCreators.map((c, idx) => (
                  <div key={c.id} className="leaderboard-row leaderboard-row-compact">
                    <span className="leaderboard-rank-subtle">{idx + 1}</span>
                    {c.avatar && <img src={c.avatar} alt={c.name} className="leaderboard-avatar" />}
                    <div className="leaderboard-info">
                      <span className="leaderboard-name">{c.name}</span>
                      <span className="leaderboard-spec">{c.specialty}</span>
                      {c.capabilities?.length > 0 && activeStage.stageId === 'stage_02_skills_filter' && (
                        <span className="leaderboard-evidence-tag">Skills: {c.capabilities.join(', ')}</span>
                      )}
                      {c.tools?.length > 0 && activeStage.stageId === 'stage_04_ai_tools_filter' && (
                        <span className="leaderboard-evidence-tag">Tools: {c.tools.join(', ')}</span>
                      )}
                      {c.categoryTags?.length > 0 && activeStage.stageId === 'stage_05_format_filter' && (
                        <span className="leaderboard-evidence-tag">Formats: {c.categoryTags.join(', ')}</span>
                      )}
                      {activeStage.stageId === 'stage_06_licensing_verification' && (
                        <span className="leaderboard-evidence-tag">{c.projectCount} verified projects • {c.isLicensingVerified ? 'Licensing verified' : 'Commercial exp.'}</span>
                      )}
                    </div>
                    <span className="leaderboard-pass-badge">Passed</span>
                  </div>
                ))}
                {activeStage.passedCount > passedCreators.length && (
                  <div className="leaderboard-more">+{activeStage.passedCount - passedCreators.length} more creators passed</div>
                )}
              </div>
            </div>
          ) : null}

          {/* Section 5: Decision Details (exclusions at this stage) */}
          {activeStage.rejections && activeStage.rejections.length > 0 && (
            <div className="inspector-section">
              <h4 className="inspector-section-title inspector-title-danger">
                <XCircle size={14} />
                <span>Exclusion Details ({activeStage.rejections.length})</span>
              </h4>
              <div className="inspector-exclusions-list">
                {activeStage.rejections.map((rej, i) => {
                  const breakdown = buildDecisionBreakdown(rej);
                  const isExpanded = expandedExclusions[`ins-${rej.creatorId}-${i}`];
                  return (
                    <div key={i} className="inspector-exclusion-card">
                      <div className="inspector-excl-header">
                        <div className="inspector-excl-creator">
                          <span className="inspector-excl-name">{rej.creatorName}</span>
                          <span className="inspector-excl-id">({rej.creatorId})</span>
                        </div>
                        <span className="inspector-excl-badge">{getReadableCode(rej.code)}</span>
                      </div>
                      <p className="inspector-excl-reason">{rej.reason}</p>

                      <button
                        type="button"
                        className="inspector-excl-toggle"
                        onClick={() => toggleExclusion(`ins-${rej.creatorId}-${i}`)}
                      >
                        <span>{isExpanded ? 'Hide Decision Breakdown' : 'View Decision Breakdown'}</span>
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>

                      {isExpanded && (
                        <div className="inspector-excl-breakdown">
                          {breakdown.map((item, j) => (
                            <div key={j} className={`breakdown-row breakdown-${item.type}`}>
                              <span className="breakdown-label">{item.label}</span>
                              <span className="breakdown-value">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clean pass banner */}
          {(!activeStage.rejections || activeStage.rejections.length === 0) && !isRanking && (
            <div className="inspector-section">
              <div className="inspector-clean-pass">
                <CheckCircle2 size={18} color="#10b981" />
                <div>
                  <div className="inspector-clean-title">Full Eligibility Maintained</div>
                  <p className="inspector-clean-desc">
                    All {activeStage.inputCount} candidates entering this stage satisfied the evaluated constraints.
                    {activeStage.bypassed ? ' (No specific requirements were mandated by the campaign for this dimension.)' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay pipeline-trace-overlay" onClick={onClose}>
      <div className="pipeline-modal-content">
        <div
          className={`pipeline-modal-workspace ${showInspector ? 'with-inspector' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* A: Complete outer Backend Filtering Pipeline card */}
          <div
            className={`backend-filtering-pipeline-card modal-content pipeline-desktop-modal ${showInspector ? 'with-inspector-open' : ''}`}
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
                onClick={() => handleSelectTab('pipeline')}
              >
                <Layers size={15} />
                <span>Execution Stages ({stages.length})</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab-btn ${activeTab === 'eligible' ? 'active' : ''}`}
                onClick={() => handleSelectTab('eligible')}
              >
                <Sparkles size={15} />
                <span>Ranked Eligible Creators ({displayedEligibleCreators.length})</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab-btn ${activeTab === 'exclusions' ? 'active' : ''}`}
                onClick={() => handleSelectTab('exclusions')}
              >
                <XCircle size={15} />
                <span>Exclusion Ledger ({displayedExclusions.length})</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="pipeline-modal-body">

              {/* TAB 1: Executing Pipeline B (Nested inside A) */}
              {activeTab === 'pipeline' && (
                <div className="pipeline-execution-content">
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
                        const isRankingStage = stage.stageId === 'stage_07_ranking_engine';

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
                              className={`horizontal-stage-card ${isRevealed ? 'revealed' : 'pending'} ${isActive && showInspector ? 'selected' : ''} ${isCurrentRevealing ? 'pulsing-current' : ''}`}
                              onClick={() => handleSelectStageCard(idx)}
                              title={isRevealed ? `Inspect Stage ${idx + 1}: ${stage.stageName}` : `Stage ${idx + 1} will reveal shortly`}
                            >
                              <div className="stage-card-top">
                                <span className="stage-number-badge">0{idx + 1}</span>
                                <div className="stage-status-indicator">
                                  {isRevealed ? (
                                    isRankingStage ? (
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

              {/* TAB 3: User-Facing Exclusion Ledger (Part C: Human-readable) */}
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
                      {displayedExclusions.map((ex, idx) => {
                        const breakdown = buildDecisionBreakdown(ex);
                        const isExpanded = expandedExclusions[`glob-${idx}`];
                        return (
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
                                Stage: <strong>{stages.find(s => s.stageId === ex.stage)?.stageName || ex.stage}</strong>
                              </span>

                              <button
                                type="button"
                                className="ledger-tech-toggle"
                                onClick={() => toggleExclusion(`glob-${idx}`)}
                              >
                                <span>{isExpanded ? 'Hide Decision Breakdown' : 'Decision Breakdown'}</span>
                                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="ledger-decision-drawer">
                                {breakdown.map((item, j) => (
                                  <div key={j} className={`breakdown-row breakdown-${item.type}`}>
                                    <span className="breakdown-label">{item.label}</span>
                                    <span className="breakdown-value">{item.value}</span>
                                  </div>
                                ))}

                                {/* Secondary debug view for developers */}
                                <details className="ledger-debug-details">
                                  <summary>Developer Debug View</summary>
                                  <div className="ledger-debug-content">
                                    <div><strong>Machine Code:</strong> <code>{ex.code}</code></div>
                                    <div><strong>Stage Identifier:</strong> <code>{ex.stage}</code></div>
                                    {ex.missingFields && (
                                      <div><strong>Raw Missing Fields:</strong> <code>{JSON.stringify(ex.missingFields)}</code></div>
                                    )}
                                    {ex.availableData && (
                                      <div><strong>Raw Available Data:</strong> <code>{JSON.stringify(ex.availableData)}</code></div>
                                    )}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        );
                      })}
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

          {/* C: Node Detail, an independent sibling of A */}
          {showInspector && renderInspectorPanel()}
        </div>
      </div>
    </div>
  );
}
