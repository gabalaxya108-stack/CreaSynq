// server/filteringPipeline.js
// Deterministic, explainable Campaign-to-Creator Filtering & Ranking Pipeline
// Executes on the server environment to enforce hard eligibility criteria before ranking.

import { CREATORS } from '../src/data/creatorsData.js';
import { calculateCreaMatch } from '../src/intelligence/matchingEngine.js';
import { explainMatch } from '../src/intelligence/matchExplainer.js';

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

export function formatExclusionLabel(code) {
  if (!code) return 'Requirement not satisfied';
  if (READABLE_EXCLUSION_TITLES[code]) return READABLE_EXCLUSION_TITLES[code];
  return code.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Normalizes string tokens for robust, deterministic matching
 */
function normalizeToken(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().trim().replace(/[-_]/g, ' ');
}

/**
 * Normalizes an array of tokens
 */
function normalizeTokenArray(arr) {
  if (!arr) return [];
  if (typeof arr === 'string') {
    return arr.split(/[,|/]/).map(normalizeToken).filter(Boolean);
  }
  if (Array.isArray(arr)) {
    return arr.map(normalizeToken).filter(Boolean);
  }
  return [];
}

/**
 * Extracts and normalizes campaign requirements into distinct mandatory constraints and preferred signals
 */
export function normalizeCampaignBrief(campaign = {}) {
  const brief = campaign || {};
  const rawRequirements = brief.requirements || {};

  // Extract explicit mandatory constraints
  const rawMandatorySpec = normalizeTokenArray(rawRequirements.mandatory?.specialization || rawRequirements.specialization || brief.desiredCreatorSpecialties || brief.specialty);
  const isFormatTerm = term => term.includes('9:16') || term.includes('vertical') || term.includes('horizontal') || term.includes('format') || term.includes('deliverable') || term.includes('still');
  const specialization = rawMandatorySpec.filter(s => !isFormatTerm(s));
  const formatFromSpec = rawMandatorySpec.filter(s => isFormatTerm(s));

  const rawFormats = normalizeTokenArray(rawRequirements.mandatory?.formats || rawRequirements.mandatory?.contentFormats || rawRequirements.formats || brief.contentFormats || brief.deliverables);
  const formats = Array.from(new Set([...rawFormats, ...formatFromSpec]));

  const mandatory = {
    skills: normalizeTokenArray(rawRequirements.mandatory?.skills || rawRequirements.skills || brief.requiredSkills),
    specialization,
    tools: normalizeTokenArray(rawRequirements.mandatory?.tools || rawRequirements.tools || brief.requiredTools),
    formats,
    styles: normalizeTokenArray(rawRequirements.mandatory?.styles || rawRequirements.mandatory?.creativeStyle || rawRequirements.styles || brief.creativeStyle),
    commercialLicensing: Boolean(rawRequirements.mandatory?.commercialLicensing ?? rawRequirements.commercialLicensing ?? brief.requiresCommercialLicense),
    minProjects: typeof (rawRequirements.mandatory?.minProjects ?? rawRequirements.minProjects) === 'number'
      ? (rawRequirements.mandatory?.minProjects ?? rawRequirements.minProjects)
      : (brief.requiresVerifiedPortfolio ? 1 : 0)
  };

  // If explicit mandatory was empty, extract keywords intelligently from brief fields as preferences unless explicitly flagged
  const preferred = {
    styles: normalizeTokenArray(rawRequirements.preferred?.styles || brief.creativeStyle || brief.styles),
    platforms: normalizeTokenArray(rawRequirements.preferred?.platforms || brief.platforms),
    industries: normalizeTokenArray(rawRequirements.preferred?.industries || brief.industry),
    tone: normalizeTokenArray(rawRequirements.preferred?.tone || brief.toneOfVoice)
  };

  // Normalized query summary representation
  return {
    campaignId: brief.id || `camp-${Date.now()}`,
    title: brief.title || 'Untitled Campaign',
    industry: brief.industry || 'General',
    budget: brief.budget || 'Open / Flexible',
    timeline: brief.timeline || 'Flexible',
    mandatory,
    preferred,
    rawBrief: brief
  };
}

/**
 * STAGE 1: Brief Validation & Requirements Normalization
 */
function stageBriefNormalization(normalizedBrief, candidatePool) {
  const stageId = 'stage_01_brief_normalization';
  const stageName = 'Brief Validation & Requirement Extraction';
  const description = 'Validate campaign parameters and extract mandatory constraints vs. preferred signals.';

  const mandatoryCount = Object.values(normalizedBrief.mandatory).reduce((acc, val) => {
    if (Array.isArray(val)) return acc + val.length;
    if (typeof val === 'boolean' && val) return acc + 1;
    if (typeof val === 'number' && val > 0) return acc + 1;
    return acc;
  }, 0);

  const warnings = [];
  if (mandatoryCount === 0) {
    warnings.push({
      code: 'NO_MANDATORY_CONSTRAINTS',
      message: 'Brief specifies no strict mandatory constraints; all candidate creators will pass to subsequent compatibility evaluation.'
    });
  }

  return {
    stageId,
    stageName,
    description,
    inputCount: candidatePool.length,
    passedCount: candidatePool.length,
    rejectedCount: 0,
    unknownCount: 0,
    rejections: [],
    warnings,
    passedCandidates: candidatePool,
    extractedMandatory: normalizedBrief.mandatory,
    extractedPreferred: normalizedBrief.preferred
  };
}

/**
 * Known capability clusters where equivalent industry terminology represents the same
 * underlying AI production capability in an AI creator marketplace.
 */
const SKILL_EQUIVALENCE_CLUSTERS = [
  // Video production cluster: 'ai video', 'video production', and related generative terms
  // represent genuine equivalent video production capabilities.
  new Set([
    'video production',
    'ai video',
    'ai video production',
    'video generation',
    'ai video generation',
    'generative video',
    'video creation'
  ])
];

function isSkillCompatible(reqSkill, creatorSkill) {
  if (!reqSkill || !creatorSkill) return false;
  const normReq = normalizeToken(reqSkill);
  const normSkill = normalizeToken(creatorSkill);
  // 1. Direct substring match (e.g. "storytelling" matches "visual storytelling")
  if (normSkill.includes(normReq) || normReq.includes(normSkill)) {
    return true;
  }
  // 2. Equivalent alias cluster match (e.g. 'ai video' satisfies 'video production')
  for (const cluster of SKILL_EQUIVALENCE_CLUSTERS) {
    if (cluster.has(normReq) && cluster.has(normSkill)) {
      return true;
    }
  }
  return false;
}

/**
 * STAGE 2: Mandatory Skills & Technical Capabilities Filter
 */
function stageSkillsFilter(mandatorySkills, candidatePool) {
  const stageId = 'stage_02_skills_filter';
  const stageName = 'Mandatory Skills & Capabilities Verification';
  const description = 'Verify creator profile and portfolio demonstrate required core skills and capabilities.';

  if (!mandatorySkills || mandatorySkills.length === 0) {
    return {
      stageId,
      stageName,
      description,
      inputCount: candidatePool.length,
      passedCount: candidatePool.length,
      rejectedCount: 0,
      unknownCount: 0,
      rejections: [],
      passedCandidates: candidatePool,
      bypassed: true
    };
  }

  const passedCandidates = [];
  const rejections = [];
  let unknownCount = 0;

  for (const creator of candidatePool) {
    const creatorCaps = normalizeTokenArray(creator.capabilities);
    const creatorTags = normalizeTokenArray(creator.categoryTags);
    const projectCaps = (creator.projects || []).flatMap(p => normalizeTokenArray(p.capabilities));
    const combinedSkills = new Set([...creatorCaps, ...creatorTags, ...projectCaps, normalizeToken(creator.specialty)]);

    const missingSkills = [];
    for (const reqSkill of mandatorySkills) {
      const isMatch = Array.from(combinedSkills).some(skill =>
        isSkillCompatible(reqSkill, skill)
      );
      if (!isMatch) {
        missingSkills.push(reqSkill);
      }
    }

    if (missingSkills.length === 0) {
      passedCandidates.push(creator);
    } else {
      if (!creator.capabilities || creator.capabilities.length === 0) {
        unknownCount++;
      }
      rejections.push({
        creatorId: creator.id,
        creatorName: creator.name,
        stage: stageId,
        code: 'MISSING_MANDATORY_SKILLS',
        reason: `Missing required mandatory skill(s): ${missingSkills.join(', ')}. Demonstrated skills: ${(creator.capabilities || []).slice(0, 3).join(', ') || 'None recorded'}.`,
        missingFields: missingSkills,
        availableData: creator.capabilities || [],
        requiredFields: mandatorySkills
      });
    }
  }

  return {
    stageId,
    stageName,
    description,
    inputCount: candidatePool.length,
    passedCount: passedCandidates.length,
    rejectedCount: rejections.length,
    unknownCount,
    rejections,
    passedCandidates,
    requiredSkills: mandatorySkills
  };
}

/**
 * STAGE 3: Specialization & Domain Category Filter
 */
function stageSpecializationFilter(mandatorySpecialization, candidatePool) {
  const stageId = 'stage_03_specialization_filter';
  const stageName = 'Specialization & Primary Domain Fit';
  const description = 'Confirm creator primary specialty or category domain matches campaign requirements.';

  if (!mandatorySpecialization || mandatorySpecialization.length === 0) {
    return {
      stageId,
      stageName,
      description,
      inputCount: candidatePool.length,
      passedCount: candidatePool.length,
      rejectedCount: 0,
      unknownCount: 0,
      rejections: [],
      passedCandidates: candidatePool,
      bypassed: true
    };
  }

  const passedCandidates = [];
  const rejections = [];
  let unknownCount = 0;

  for (const creator of candidatePool) {
    const specialty = normalizeToken(creator.specialty);
    const creativeIdentity = normalizeToken(creator.creativeIdentity);
    const categoryTags = normalizeTokenArray(creator.categoryTags);

    const hasSpecMatch = mandatorySpecialization.some(spec => {
      return specialty.includes(spec) ||
             spec.includes(specialty) ||
             creativeIdentity.includes(spec) ||
             categoryTags.some(t => t.includes(spec) || spec.includes(t));
    });

    if (hasSpecMatch) {
      passedCandidates.push(creator);
    } else {
      if (!creator.specialty) unknownCount++;
      rejections.push({
        creatorId: creator.id,
        creatorName: creator.name,
        stage: stageId,
        code: 'SPECIALIZATION_MISMATCH',
        reason: `Creator specialty (${creator.specialty || 'Unspecified'}) does not match required specialization (${mandatorySpecialization.join(' or ')}).`,
        missingFields: mandatorySpecialization,
        availableData: { specialty: creator.specialty, tags: creator.categoryTags },
        requiredFields: mandatorySpecialization
      });
    }
  }

  return {
    stageId,
    stageName,
    description,
    inputCount: candidatePool.length,
    passedCount: passedCandidates.length,
    rejectedCount: rejections.length,
    unknownCount,
    rejections,
    passedCandidates,
    requiredSpecialization: mandatorySpecialization
  };
}

/**
 * STAGE 4: AI Tools & Model Generation Pipeline Compatibility Filter
 */
function stageAiToolsFilter(mandatoryTools, candidatePool) {
  const stageId = 'stage_04_ai_tools_filter';
  const stageName = 'AI Tools & Generation Pipeline Alignment';
  const description = 'Ensure creator actively operates with the specific AI toolchains or models requested.';

  if (!mandatoryTools || mandatoryTools.length === 0) {
    return {
      stageId,
      stageName,
      description,
      inputCount: candidatePool.length,
      passedCount: candidatePool.length,
      rejectedCount: 0,
      unknownCount: 0,
      rejections: [],
      passedCandidates: candidatePool,
      bypassed: true
    };
  }

  const passedCandidates = [];
  const rejections = [];
  let unknownCount = 0;

  for (const creator of candidatePool) {
    const creatorTools = normalizeTokenArray(creator.tools);
    const projectTools = (creator.projects || []).flatMap(p => normalizeTokenArray(p.tools));
    const combinedTools = new Set([...creatorTools, ...projectTools]);

    const missingTools = [];
    for (const reqTool of mandatoryTools) {
      const isMatch = Array.from(combinedTools).some(t =>
        t.includes(reqTool) || reqTool.includes(t)
      );
      if (!isMatch) {
        missingTools.push(reqTool);
      }
    }

    if (missingTools.length === 0) {
      passedCandidates.push(creator);
    } else {
      if (!creator.tools || creator.tools.length === 0) unknownCount++;
      rejections.push({
        creatorId: creator.id,
        creatorName: creator.name,
        stage: stageId,
        code: 'TOOL_CHAIN_INCOMPATIBLE',
        reason: `Lacks verified production experience in requested tool(s): ${missingTools.join(', ')}. Verified tools: ${(creator.tools || []).join(', ') || 'None recorded'}.`,
        missingFields: missingTools,
        availableData: creator.tools || [],
        requiredFields: mandatoryTools
      });
    }
  }

  return {
    stageId,
    stageName,
    description,
    inputCount: candidatePool.length,
    passedCount: passedCandidates.length,
    rejectedCount: rejections.length,
    unknownCount,
    rejections,
    passedCandidates,
    requiredTools: mandatoryTools
  };
}

/**
 * STAGE 5: Content Type & Deliverable Format Filter
 */
function stageFormatFilter(mandatoryFormats, candidatePool) {
  const stageId = 'stage_05_format_filter';
  const stageName = 'Deliverable Format & Content Type Compatibility';
  const description = 'Verify creator produces the required output formats (e.g., 9:16 vertical, 4K stills, cinematic loops, 3D).';

  if (!mandatoryFormats || mandatoryFormats.length === 0) {
    return {
      stageId,
      stageName,
      description,
      inputCount: candidatePool.length,
      passedCount: candidatePool.length,
      rejectedCount: 0,
      unknownCount: 0,
      rejections: [],
      passedCandidates: candidatePool,
      bypassed: true
    };
  }

  const passedCandidates = [];
  const rejections = [];
  let unknownCount = 0;

  for (const creator of candidatePool) {
    const creatorTags = normalizeTokenArray(creator.categoryTags);
    const creatorCaps = normalizeTokenArray(creator.capabilities);
    const creatorSpecialty = normalizeToken(creator.specialty);
    const projectFormats = (creator.projects || []).map(p => normalizeToken(p.format || p.aspect || p.category));

    // Check capability for video, stills, 3D, motion
    const missingFormats = [];

    for (const reqFormat of mandatoryFormats) {
      let isSupported = false;

      if (reqFormat.includes('video') || reqFormat.includes('motion') || reqFormat.includes('loop') || reqFormat.includes('reel')) {
        isSupported = creatorTags.some(t => t.includes('video') || t.includes('motion')) ||
                      creatorSpecialty.includes('video') || creatorSpecialty.includes('motion') ||
                      projectFormats.some(f => f.includes('video') || f.includes('motion'));
      } else if (reqFormat.includes('still') || reqFormat.includes('photo') || reqFormat.includes('key art')) {
        isSupported = creatorTags.some(t => t.includes('photo') || t.includes('product')) ||
                      creatorSpecialty.includes('photo') || creatorSpecialty.includes('product') ||
                      projectFormats.some(f => f.includes('photo') || f.includes('still') || f.includes('portrait') || f.includes('landscape'));
      } else if (reqFormat.includes('3d') || reqFormat.includes('spatial') || reqFormat.includes('cgi') || reqFormat.includes('render')) {
        isSupported = creatorTags.some(t => t.includes('3d')) ||
                      creatorSpecialty.includes('3d') ||
                      creatorCaps.some(c => c.includes('3d')) ||
                      projectFormats.some(f => f.includes('3d') || f.includes('render'));
      } else if (reqFormat.includes('9:16') || reqFormat.includes('vertical') || reqFormat.includes('portrait')) {
        isSupported = projectFormats.some(f => f.includes('portrait') || f.includes('vertical') || f.includes('9:16')) ||
                      creatorTags.some(t => t.includes('social') || t.includes('video'));
      } else {
        // Generic format match in tags, capabilities, or projects
        isSupported = creatorTags.some(t => t.includes(reqFormat)) ||
                      creatorCaps.some(c => c.includes(reqFormat)) ||
                      projectFormats.some(f => f.includes(reqFormat));
      }

      if (!isSupported) {
        missingFormats.push(reqFormat);
      }
    }

    if (missingFormats.length === 0) {
      passedCandidates.push(creator);
    } else {
      rejections.push({
        creatorId: creator.id,
        creatorName: creator.name,
        stage: stageId,
        code: 'FORMAT_UNSUPPORTED',
        reason: `Deliverable format requirement not satisfied: ${missingFormats.join(', ')}. Creator specializes in ${creator.specialty || 'other formats'}.`,
        missingFields: missingFormats,
        availableData: { specialty: creator.specialty, tags: creator.categoryTags },
        requiredFields: mandatoryFormats
      });
    }
  }

  return {
    stageId,
    stageName,
    description,
    inputCount: candidatePool.length,
    passedCount: passedCandidates.length,
    rejectedCount: rejections.length,
    unknownCount,
    rejections,
    passedCandidates,
    requiredFormats: mandatoryFormats
  };
}

/**
 * STAGE 6: Commercial Readiness & Portfolio Verification Filter
 */
function stageLicensingVerificationFilter(mandatoryConfig, candidatePool) {
  const stageId = 'stage_06_licensing_verification';
  const stageName = 'Commercial Portfolio & Licensing Verification';
  const description = 'Ensure creator has verified commercial client experience and meet minimum portfolio requirements.';

  const { commercialLicensing, minProjects = 0 } = mandatoryConfig;

  if (!commercialLicensing && minProjects <= 0) {
    return {
      stageId,
      stageName,
      description,
      inputCount: candidatePool.length,
      passedCount: candidatePool.length,
      rejectedCount: 0,
      unknownCount: 0,
      rejections: [],
      passedCandidates: candidatePool,
      bypassed: true
    };
  }

  const passedCandidates = [];
  const rejections = [];
  let unknownCount = 0;

  for (const creator of candidatePool) {
    const projects = creator.projects || [];
    const hasEnoughProjects = projects.length >= minProjects;

    // Distinguish commercial-project client experience from enterprise licensing verification
    const hasCommercialClientWork = projects.some(p => Boolean(p.clientType && p.clientType.trim() !== ''));
    const isLicensingVerified = Boolean(
      creator.trustVerification?.commercialLicensingEligible ||
      creator.commercialLicensingVerified
    );
    const isLicensingExplicitlyUnavailable = Boolean(
      creator.trustVerification?.commercialLicensingEligible === false ||
      creator.commercialLicensingVerified === false ||
      creator.commercialLicensingEligible === false
    );
    const licensingEvidenceStatus = isLicensingVerified
      ? 'verified'
      : (isLicensingExplicitlyUnavailable ? 'confirmed_unavailable' : 'unverified_evidence');

    const failedReasons = [];
    if (minProjects > 0 && !hasEnoughProjects) {
      failedReasons.push(`Requires at least ${minProjects} verified portfolio project(s); found ${projects.length}`);
    }

    if (commercialLicensing && !isLicensingVerified) {
      unknownCount++;
      if (isLicensingExplicitlyUnavailable) {
        if (hasCommercialClientWork) {
          failedReasons.push('Creator has commercial client project experience, but enterprise commercial-use licensing credentials are confirmed unavailable in creator trust records');
        } else {
          failedReasons.push('Enterprise commercial-use licensing authorization is confirmed unavailable in creator trust records');
        }
      } else {
        if (hasCommercialClientWork) {
          failedReasons.push('Creator has commercial client project experience, but formal enterprise commercial-use licensing credentials are not verified in available creator records');
        } else {
          failedReasons.push('Formal enterprise commercial-use licensing credentials are not verified in available creator records');
        }
      }
    }

    if (failedReasons.length === 0) {
      passedCandidates.push(creator);
    } else {
      rejections.push({
        creatorId: creator.id,
        creatorName: creator.name,
        stage: stageId,
        code: isLicensingVerified ? 'PORTFOLIO_THRESHOLD_UNMET' : 'COMMERCIAL_LICENSING_UNVERIFIED',
        reason: failedReasons.join('. '),
        missingFields: commercialLicensing && !isLicensingVerified ? ['commercial_licensing_verification'] : ['verified_portfolio_projects'],
        availableData: {
          projectCount: projects.length,
          hasCommercialClientWork,
          isLicensingVerified,
          licensingStatus: licensingEvidenceStatus
        },
        requiredFields: { commercialLicensing, minProjects }
      });
    }
  }

  return {
    stageId,
    stageName,
    description,
    inputCount: candidatePool.length,
    passedCount: passedCandidates.length,
    rejectedCount: rejections.length,
    unknownCount,
    rejections,
    passedCandidates,
    requiredLicensing: { commercialLicensing, minProjects }
  };
}

/**
 * STAGE 7: Creative Fit & Compatibility Ranking (Executes ONLY on eligible creators)
 */
function stageCreativeFitRanking(campaign, eligibleCandidates) {
  const stageId = 'stage_07_ranking_engine';
  const stageName = 'Creative Fit & Compatibility Scoring';
  const description = 'Score and rank eligible candidates using deterministic CreaMatch compatibility and evidence explanations.';

  if (eligibleCandidates.length === 0) {
    return {
      stageId,
      stageName,
      description,
      inputCount: 0,
      passedCount: 0,
      rejectedCount: 0,
      rankedResults: []
    };
  }

  const rankedResults = eligibleCandidates.map(creator => {
    const match = calculateCreaMatch(campaign, creator);
    const explanation = explainMatch(campaign, creator);

    return {
      creatorId: creator.id,
      creator: {
        id: creator.id,
        name: creator.name,
        handle: creator.handle,
        avatar: creator.avatar,
        specialty: creator.specialty,
        creativeIdentity: creator.creativeIdentity,
        bio: creator.bio,
        location: creator.location,
        availability: creator.availability,
        statusBadge: creator.statusBadge,
        styles: creator.styles,
        industries: creator.industries,
        capabilities: creator.capabilities,
        tools: creator.tools,
        heroWork: creator.heroWork,
        projects: (creator.projects || []).slice(0, 3)
      },
      score: match.score,
      fitLabel: match.fitLabel,
      confidence: match.confidence,
      evidenceTier: match.evidenceTier,
      isSufficient: match.isSufficient,
      breakdown: match.breakdown,
      explanation: {
        summary: explanation?.summary || `Compatible across ${creator.specialty} and ${(creator.styles || []).slice(0, 2).join(', ')}.`,
        highlights: explanation?.highlights || [],
        potentialGap: explanation?.potentialGap || '',
        dimensions: explanation?.dimensions || {}
      }
    };
  });

  // Sort strictly by compatibility score descending
  rankedResults.sort((a, b) => b.score - a.score);

  return {
    stageId,
    stageName,
    description,
    inputCount: eligibleCandidates.length,
    passedCount: rankedResults.length,
    rejectedCount: 0,
    rankedResults
  };
}

/**
 * MAIN BACKEND PIPELINE ENTRY POINT
 * Executes the entire deterministic campaign-to-creator filtering pipeline.
 *
 * @param {Object} params
 * @param {Object} params.campaign - Campaign brief object
 * @param {Array} [params.creators] - Optional authoritative creators list (defaults to system CREATORS)
 * @param {Object} [params.options] - Execution options
 * @returns {Object} Complete pipeline trace response contract
 */
export function executeFilteringPipeline({ campaign = {}, creators = null, options = {} } = {}) {
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const startTime = Date.now();

  // Authoritative candidate pool
  const candidatePool = Array.isArray(creators) ? [...creators] : [...CREATORS];
  const totalCandidates = candidatePool.length;

  // Step 1: Normalize Brief
  const normalizedBrief = normalizeCampaignBrief(campaign);

  // Trace collector
  const stages = [];
  const globalExclusions = [];
  const globalWarnings = [];

  // 1. Stage A: Brief Normalization
  const s1 = stageBriefNormalization(normalizedBrief, candidatePool);
  stages.push(s1);
  if (s1.warnings) globalWarnings.push(...s1.warnings);

  // 2. Stage B1: Mandatory Skills Filter
  const s2 = stageSkillsFilter(normalizedBrief.mandatory.skills, s1.passedCandidates);
  stages.push(s2);
  s2.rejections.forEach(r => globalExclusions.push(r));

  // 3. Stage B2: Specialization Fit Filter
  const s3 = stageSpecializationFilter(normalizedBrief.mandatory.specialization, s2.passedCandidates);
  stages.push(s3);
  s3.rejections.forEach(r => globalExclusions.push(r));

  // 4. Stage B3: AI Tools & Models Filter
  const s4 = stageAiToolsFilter(normalizedBrief.mandatory.tools, s3.passedCandidates);
  stages.push(s4);
  s4.rejections.forEach(r => globalExclusions.push(r));

  // 5. Stage B4: Content Format Filter
  const s5 = stageFormatFilter(normalizedBrief.mandatory.formats, s4.passedCandidates);
  stages.push(s5);
  s5.rejections.forEach(r => globalExclusions.push(r));

  // 6. Stage B5: Commercial & Verification Filter
  const s6 = stageLicensingVerificationFilter(normalizedBrief.mandatory, s5.passedCandidates);
  stages.push(s6);
  s6.rejections.forEach(r => globalExclusions.push(r));

  const eligibleCandidates = s6.passedCandidates;

  // 7. Stage C & D: Creative Fit Ranking & Explanations on Eligible Candidates
  const s7 = stageCreativeFitRanking(campaign, eligibleCandidates);
  stages.push(s7);

  const durationMs = Date.now() - startTime;
  const status = eligibleCandidates.length > 0 ? 'completed' : 'empty';

  return {
    contractVersion: '1.0.0',
    executionId,
    timestamp: new Date().toISOString(),
    durationMs,
    status,
    campaignId: normalizedBrief.campaignId,
    campaignTitle: normalizedBrief.title,
    summary: {
      totalCandidates,
      passedEligibilityCount: eligibleCandidates.length,
      excludedCount: globalExclusions.length,
      isSuccess: true,
      hasEligibleCreators: eligibleCandidates.length > 0
    },
    normalizedBrief: {
      title: normalizedBrief.title,
      industry: normalizedBrief.industry,
      mandatory: normalizedBrief.mandatory,
      preferred: normalizedBrief.preferred
    },
    stages: stages.map(s => ({
      stageId: s.stageId,
      stageName: s.stageName,
      description: s.description,
      inputCount: s.inputCount,
      passedCount: s.passedCount,
      rejectedCount: s.rejectedCount,
      unknownCount: s.unknownCount || 0,
      bypassed: !!s.bypassed,
      rejections: s.rejections || [],
      // Stage-specific criteria & metadata for the frontend inspector
      ...(s.requiredSkills ? { requiredSkills: s.requiredSkills } : {}),
      ...(s.requiredSpecialization ? { requiredSpecialization: s.requiredSpecialization } : {}),
      ...(s.requiredTools ? { requiredTools: s.requiredTools } : {}),
      ...(s.requiredFormats ? { requiredFormats: s.requiredFormats } : {}),
      ...(s.requiredLicensing ? { requiredLicensing: s.requiredLicensing } : {}),
      ...(s.extractedMandatory ? { extractedMandatory: s.extractedMandatory } : {}),
      ...(s.extractedPreferred ? { extractedPreferred: s.extractedPreferred } : {}),
      ...(s.warnings ? { warnings: s.warnings } : {}),
      // Summaries of creators who passed this stage with stage-relevant evidence
      passedCreatorSummaries: (s.passedCandidates || []).slice(0, 10).map(c => ({
        id: c.id,
        name: c.name,
        specialty: c.specialty,
        avatar: c.avatar,
        capabilities: (c.capabilities || []).slice(0, 3),
        tools: (c.tools || []).slice(0, 3),
        categoryTags: (c.categoryTags || []).slice(0, 3),
        projectCount: (c.projects || []).length,
        isLicensingVerified: Boolean(c.trustVerification?.commercialLicensingEligible || c.commercialLicensingVerified)
      }))
    })),
    eligibleCreatorIds: eligibleCandidates.map(c => c.id),
    rankedCreators: s7.rankedResults,
    exclusions: globalExclusions,
    warnings: globalWarnings
  };
}
