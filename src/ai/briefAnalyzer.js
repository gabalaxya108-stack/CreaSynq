// src/ai/briefAnalyzer.js
// CreaBrief Natural Language Campaign Understanding
// Parses raw creative prompts into structured briefs without inventing missing parameters

import { defaultAIProvider } from './provider.js';

export function analyzeBrief(naturalText = '') {
  const text = (naturalText || '').trim();
  const lower = text.toLowerCase();

  // Cache key for AI provider
  const cacheKey = `brief_${text.slice(0, 100)}_${text.length}`;

  return defaultAIProvider.analyze(cacheKey, text, () => {
    return extractStructuredBriefDeterministic(text, lower);
  });
}

function extractStructuredBriefDeterministic(text, lower) {
  if (text.length < 10) {
    return {
      isSufficient: false,
      confidence: 'low',
      rawText: text,
      message: 'Brief is too short. Describe what you want to create (e.g., product, desired visual mood, platforms).',
      missingInformation: [
        { field: 'industry', label: 'Industry & Category', prompt: 'Specify your product category (e.g., Skincare, Luxury Fashion, Tech)' },
        { field: 'contentFormat', label: 'Deliverables & Format', prompt: 'Specify desired output formats (e.g., 4K Stills, 9:16 Video Loops)' },
        { field: 'budget', label: 'Budget Tier', prompt: 'Specify target budget (e.g., $5,000 – $10,000)' },
        { field: 'timeline', label: 'Turnaround Timeline', prompt: 'Specify completion target (e.g., 2–3 weeks)' }
      ]
    };
  }

  // 1. Industry Detection
  let industry = 'General Creative';
  if (lower.includes('skin') || lower.includes('beauty') || lower.includes('cosmetic') || lower.includes('serum') || lower.includes('hydration')) {
    industry = 'Beauty & Skincare';
  } else if (lower.includes('fashion') || lower.includes('couture') || lower.includes('apparel') || lower.includes('runway') || lower.includes('silk') || lower.includes('clothing')) {
    industry = 'Luxury & High Fashion';
  } else if (lower.includes('watch') || lower.includes('chrono') || lower.includes('hardware') || lower.includes('tech') || lower.includes('device') || lower.includes('gadget')) {
    industry = 'Consumer Tech & Hardware';
  } else if (lower.includes('food') || lower.includes('culinary') || lower.includes('beverage') || lower.includes('drink') || lower.includes('spirit') || lower.includes('wine')) {
    industry = 'Food & Beverage';
  } else if (lower.includes('fragrance') || lower.includes('perfume') || lower.includes('scent') || lower.includes('eau de parfum')) {
    industry = 'Luxury & Fragrance';
  } else if (lower.includes('architecture') || lower.includes('hotel') || lower.includes('resort') || lower.includes('hospitality')) {
    industry = 'Architecture & Hospitality';
  } else if (lower.includes('music') || lower.includes('entertainment') || lower.includes('film') || lower.includes('album')) {
    industry = 'Entertainment & Music';
  }

  // 2. Campaign Objective
  let objective = 'Brand Visual Campaign';
  if (lower.includes('launch') || lower.includes('debut') || lower.includes('introducing') || lower.includes('release')) {
    objective = 'Product Launch';
  } else if (lower.includes('rebrand') || lower.includes('awareness')) {
    objective = 'Brand Awareness & Mythology';
  } else if (lower.includes('ad') || lower.includes('commercial') || lower.includes('performance')) {
    objective = 'Performance Advertising';
  } else if (lower.includes('editorial') || lower.includes('lookbook') || lower.includes('print')) {
    objective = 'Editorial Lookbook';
  }

  // 3. Product or Service Name
  const product = deriveProductName(lower, industry);

  // 4. Target Audience
  let targetAudience = 'Modern aesthetic-conscious consumers';
  if (lower.includes('gen z') || lower.includes('youth') || lower.includes('college') || lower.includes('student') || lower.includes('teen')) {
    targetAudience = 'Gen Z & young digital natives';
  } else if (lower.includes('luxury') || lower.includes('affluent') || lower.includes('high-end') || lower.includes('haute')) {
    targetAudience = 'Affluent luxury consumers & collectors';
  } else if (lower.includes('women') || lower.includes('female')) {
    targetAudience = 'Design-led modern women';
  } else if (lower.includes('tech') || lower.includes('developer') || lower.includes('enthusiast')) {
    targetAudience = 'Industrial design & technology enthusiasts';
  }

  // 5. Preferred Platforms
  const platforms = [];
  if (lower.includes('instagram') || lower.includes('reels') || lower.includes('ig')) platforms.push('Instagram');
  if (lower.includes('tiktok')) platforms.push('TikTok');
  if (lower.includes('youtube')) platforms.push('YouTube');
  if (lower.includes('vimeo')) platforms.push('Vimeo');
  if (lower.includes('ooh') || lower.includes('billboard')) platforms.push('Digital OOH & Billboards');
  if (lower.includes('print') || lower.includes('editorial')) platforms.push('High-Gloss Print');
  const preferredPlatform = platforms.length > 0 ? platforms.join(', ') : 'Instagram (Reels & Feed)';

  // 6. Content Format & Deliverables
  let contentFormat = 'Visual Campaign Assets';
  let deliverables = 'Key Art & Video Passes';
  if (lower.includes('reel') || lower.includes('short-form') || lower.includes('vertical') || lower.includes('loop') || lower.includes('9:16')) {
    contentFormat = 'Short-Form Kinetic Video (9:16)';
    deliverables = '3x 9:16 Vertical Video Loops, 2x Master Stills';
  } else if (lower.includes('film') || lower.includes('cinema') || lower.includes('video') || lower.includes('commercial')) {
    contentFormat = 'Cinematic Hero Film';
    deliverables = '1x 60s 4K Hero Film, 4x Key Stills';
  } else if (lower.includes('still') || lower.includes('photo') || lower.includes('render') || lower.includes('4k')) {
    contentFormat = '4K Master Stills Suite';
    deliverables = '6x High-Resolution 4K Key Campaign Stills';
  } else if (lower.includes('3d') || lower.includes('cgi') || lower.includes('motion')) {
    contentFormat = '3D CGI Kinetic Animation';
    deliverables = '1x 30s 3D Motion Master, 4x Mechanical Stills';
  }

  // 7. Creative Style & Tone of Voice
  const styleTokens = [];
  if (lower.includes('cinematic') || lower.includes('movie') || lower.includes('35mm')) styleTokens.push('Cinematic 35mm');
  if (lower.includes('minimal') || lower.includes('clean') || lower.includes('scandinavian')) styleTokens.push('Minimalist');
  if (lower.includes('soft light') || lower.includes('golden') || lower.includes('warm') || lower.includes('sun')) styleTokens.push('Warm Sunlit');
  if (lower.includes('editorial') || lower.includes('vogue') || lower.includes('couture')) styleTokens.push('High Editorial');
  if (lower.includes('macro') || lower.includes('fluid') || lower.includes('texture')) styleTokens.push('Macro Textures');
  if (lower.includes('surreal') || lower.includes('dream') || lower.includes('ethereal')) styleTokens.push('Ethereal Surreal');
  if (lower.includes('authentic') || lower.includes('natural') || lower.includes('human')) styleTokens.push('Authentic Naturalism');

  const creativeStyle = styleTokens.length > 0 ? styleTokens.join(', ') : 'Contemporary Commercial Editorial';
  const toneOfVoice = styleTokens.length > 0 ? styleTokens.slice(0, 2).join(' and ') : 'Authentic and visually elevated';

  // 8. Honest Budget Extraction (NEVER invent missing budget!)
  let budget = null;
  if (lower.includes('$') || lower.includes('usd') || lower.includes('dollars')) {
    const match = text.match(/\$[\d,]+(\s*[-–]\s*\$[\d,]+)?/i) || text.match(/\b\d+k\s*usd\b/i) || text.match(/\b\d+,\d+\s*dollars\b/i);
    if (match) budget = match[0];
  } else if (lower.includes('₹') || lower.includes('inr') || lower.includes('lakh') || lower.includes('rs')) {
    const match = text.match(/₹[\d,]+(\s*[-–]\s*₹[\d,]+)?/i) || text.match(/\b\d+\s*lakh\b/i) || text.match(/rs\.?\s*[\d,]+/i);
    if (match) budget = match[0];
  } else if (lower.includes('5k') || lower.includes('10k') || lower.includes('15k')) {
    const match = text.match(/\b\d+k\b/i);
    if (match) budget = `$${match[0]}`;
  }

  // 9. Honest Timeline Extraction (NEVER invent missing deadlines!)
  let timeline = null;
  if (lower.includes('week') || lower.includes('month') || lower.includes('days') || lower.includes('urgent') || lower.includes('asap')) {
    const match = text.match(/\b\d+(\s*[-–]\s*\d+)?\s*(weeks?|days?|months?)\b/i);
    if (match) timeline = match[0];
    else if (lower.includes('urgent') || lower.includes('asap')) timeline = 'Fast turnaround (Urgent)';
  }

  // 10. Missing Information Detection
  const missingInformation = [];
  if (!budget) {
    missingInformation.push({
      field: 'budget',
      label: 'Budget Tier',
      prompt: 'Budget was not specified in your prompt. (e.g. $5,000 – $10,000)'
    });
  }
  if (!timeline) {
    missingInformation.push({
      field: 'timeline',
      label: 'Target Timeline',
      prompt: 'Production timeline was not specified. (e.g. 2–3 weeks)'
    });
  }
  if (styleTokens.length === 0) {
    missingInformation.push({
      field: 'creativeStyle',
      label: 'Specific Visual Style',
      prompt: 'Consider adding lighting or visual texture notes (e.g., 35mm grain, minimal studio lighting)'
    });
  }

  const title = deriveCampaignTitle(lower, industry);

  return {
    isSufficient: text.length >= 25,
    confidence: text.length > 70 && styleTokens.length > 0 ? 'high' : 'medium',
    rawText: text,
    title,
    objective,
    product,
    industry,
    targetAudience,
    preferredPlatform,
    contentFormat,
    creativeStyle,
    toneOfVoice,
    deliverables,
    budget, // strictly null if not provided in prompt!
    timeline, // strictly null if not provided in prompt!
    additionalRequirements: styleTokens.length > 0 ? `Focus on ${styleTokens.join(', ')} visual treatment` : 'Refined commercial aesthetic',
    missingInformation,
    styleTokens
  };
}

function deriveCampaignTitle(lower, industry) {
  if (lower.includes('skincare') || lower.includes('serum') || lower.includes('hydration')) return 'Radiant Skincare Launch';
  if (lower.includes('watch') || lower.includes('chrono') || lower.includes('hardware')) return 'Titanium Precision Chrono Series';
  if (lower.includes('fashion') || lower.includes('couture') || lower.includes('apparel')) return 'Haute Couture Editorial Debut';
  if (lower.includes('fragrance') || lower.includes('perfume')) return 'Solar Amber Fragrance Campaign';
  if (lower.includes('backpack') || lower.includes('bag') || lower.includes('travel')) return 'Urban Travel Pack Campaign';
  return `${industry} Creative Campaign`;
}

function deriveProductName(lower, industry) {
  if (lower.includes('serum')) return 'Hydration Barrier Serum';
  if (lower.includes('skincare')) return 'Botanical Skincare Line';
  if (lower.includes('watch')) return 'Mechanical Chronograph Watch';
  if (lower.includes('backpack')) return 'Waterproof Modular Backpack';
  if (lower.includes('fragrance') || lower.includes('perfume')) return 'Artisanal Eau de Parfum';
  if (lower.includes('dress') || lower.includes('couture')) return 'Haute Couture Collection';
  return `${industry} Product`;
}
