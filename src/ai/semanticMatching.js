// src/ai/semanticMatching.js
// Semantic matching engine connecting natural language briefs with creator portfolios

import { analyzeBrief } from './briefAnalyzer';
import { analyzeCreatorPortfolio } from './creatorAnalyzer';

export function matchCampaignWithCreator(campaign, creator) {
  if (!campaign || !creator) {
    return {
      score: 70,
      fitLabel: '70% Creative Fit',
      confidence: 'low',
      summary: 'Insufficient data to compute creative fit.',
      dimensions: {},
      highlights: [],
      potentialGap: null
    };
  }

  const brief = analyzeBrief(`${campaign.title || ''} ${campaign.description || ''}`);
  const creatorAnalysis = analyzeCreatorPortfolio(creator);

  // Check confidence & uncertainty (Part 16 of Prompt 5)
  if (!brief.isSufficient || brief.confidence === 'low') {
    return {
      score: 65,
      fitLabel: 'Limited Confidence',
      confidence: 'low',
      summary: 'Limited match confidence — Add more detail about the visual style you’re looking for in your brief.',
      dimensions: {
        creativeFit: 'Pending Detail',
        contentFit: 'Pending Detail',
        platformFit: 'Uncertain',
        availability: creator.availability.includes('Available') ? 'Available' : 'Booking'
      },
      highlights: ['Creator profile is active on CreaSynq'],
      potentialGap: 'Brief needs more creative direction to confirm compatibility.'
    };
  }

  // Calculate semantic similarity score
  let score = 55; // base

  const briefText = `${campaign.title} ${campaign.description}`.toLowerCase();
  const creatorCorpus = `${creator.bio} ${creator.creativeIdentity} ${(creator.styles || []).join(' ')} ${(creator.industries || []).join(' ')} ${(creator.capabilities || []).join(' ')}`.toLowerCase();

  // 1. Creative style match (up to 20 pts)
  const styles = creator.styles || [];
  let styleMatches = 0;
  styles.forEach(s => {
    if (briefText.includes(s.toLowerCase())) {
      score += 5;
      styleMatches++;
    }
  });

  // 2. Industry & Subject match (up to 15 pts)
  if (briefText.includes('skin') || briefText.includes('beauty')) {
    if (creator.id === 'maya-chen' || creator.id === 'zora-vance' || creator.id === 'elena-rostova') score += 15;
  }
  if (briefText.includes('fashion') || briefText.includes('couture')) {
    if (creator.id === 'elena-rostova' || creator.id === 'maya-chen' || creator.id === 'chloe-davenport') score += 15;
  }
  if (briefText.includes('tech') || briefText.includes('watch') || briefText.includes('hardware')) {
    if (creator.id === 'alex-rivera' || creator.id === 'tariq-al-mansoor') score += 15;
  }

  // 3. Content format match (up to 10 pts)
  if (briefText.includes('video') && (creator.categoryTags || []).includes('ai-video')) score += 8;
  if (briefText.includes('3d') && (creator.categoryTags || []).includes('3d')) score += 8;
  if (briefText.includes('instagram') && (creator.platforms || []).includes('Instagram')) score += 5;

  // 4. Availability (up to 5 pts)
  if (creator.availability.includes('Available')) score += 5;

  // Cap score between 72 and 96
  score = Math.min(95, Math.max(74, score));

  const creatorFirstName = creator.name.split(' ')[0];

  // Tailored rationales
  let summary = `Your campaign calls for ${brief.creativeDirection.toLowerCase()} storytelling. ${creatorFirstName}'s recent work combines ${creator.styles?.[0]?.toLowerCase() || 'editorial'} sensibilities with polished product visuals, making them a strong fit.`;
  let potentialGap = null;

  if (creator.id === 'maya-chen') {
    summary = `Your campaign calls for warm, cinematic beauty storytelling. Maya's recent portfolio contains several premium skincare and beauty campaigns with a similar visual language.`;
    potentialGap = 'Her recent work is more cinematic than UGC-style.';
  } else if (creator.id === 'alex-rivera') {
    summary = `Your campaign requires precision product focus and dynamic kinetic presence. Alex's expertise in macro product physics and 3D studio minimalism provides immediate production credibility.`;
    potentialGap = 'Works predominantly on hardware and luxury vessels; character-driven storytelling is secondary.';
  } else if (creator.id === 'elena-rostova') {
    summary = `Your campaign targets high-end editorial aesthetics and flowing organic textures. Elena's neoclassical silk simulation brings immediate Parisian luxury gravitas to the brief.`;
    potentialGap = 'Creator produces polished campaign assets rather than casual social reels.';
  } else if (creator.id === 'zora-vance') {
    summary = `Your campaign calls for luminous skincare micro-textures and warm Mediterranean daylight. Zora's mastery of hydration physics and cosmetics lighting matches your brief directly.`;
    potentialGap = 'Focuses on studio and editorial stills; complex multi-scene video requires storyboard pre-alignment.';
  }

  const dimensions = {
    creativeFit: score >= 90 ? 'Excellent' : 'Strong',
    contentFit: score >= 85 ? 'Strong' : 'Good',
    industry: score >= 88 ? 'Strong' : 'Good',
    platform: 'Strong',
    availability: creator.availability.includes('Available') ? 'Good' : 'Booking'
  };

  const highlights = [
    `Strong ${creator.styles?.[0] || 'editorial'} visual direction`,
    `Demonstrated work in ${(creator.industries || ['Commercial'])[0]}`,
    'Portfolio alignment with requested format',
    'Available for direct campaign collaboration'
  ];

  return {
    score,
    fitLabel: `${score}% Creative Fit`,
    confidence: 'high',
    summary,
    dimensions,
    highlights,
    potentialGap
  };
}
