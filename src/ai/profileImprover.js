// src/ai/profileImprover.js
// Creator-side AI insights, profile positioning suggestions, and project creative context assistance

export function getCreatorInsights(creator) {
  if (!creator) return null;

  const topStyles = (creator.styles || ['Editorial', 'Cinematic']).slice(0, 2);
  const topIndustries = (creator.industries || ['Commercial']).slice(0, 2);

  const strongAreas = Array.from(new Set([
    ...topStyles,
    ...topIndustries,
    creator.specialty
  ])).slice(0, 4);

  return {
    strongAreas,
    positioningNote: 'Brands looking for these visual styles are most likely to discover you through semantic search and CreaMatch.'
  };
}

export function generateProfileSuggestions(creator) {
  if (!creator) return null;

  const currentBio = creator.bio || '';
  const isShort = currentBio.length < 90;

  const suggestedBio = isShort 
    ? `Cinematic AI visual creator crafting premium product worlds and editorial storytelling for luxury, beauty, and forward-thinking brands.`
    : `Pioneering generative diffusion and cinematic direction. Specializing in tactile materiality, micro-lighting choreography, and commercial campaign assets.`;

  const suggestedPositioning = `${creator.specialty} Director & AI Visual Worldbuilder`;

  const missingCapabilities = [];
  if (!(creator.capabilities || []).includes('Short-Form Video (9:16)')) {
    missingCapabilities.push('Short-Form Video (9:16)');
  }
  if (!(creator.capabilities || []).includes('Diffusion Consistency')) {
    missingCapabilities.push('Diffusion Consistency');
  }

  return {
    currentBio,
    suggestedBio,
    currentPositioning: creator.creativeIdentity,
    suggestedPositioning,
    missingCapabilities
  };
}

export function polishProjectContext(input = {}) {
  const { what, goal, tools, result } = input;
  
  if (!what && !goal) {
    return 'Crafted with exacting generative art direction and custom color grading for high-end digital editorial delivery.';
  }

  return `${what || 'A visual campaign exploration'}. Developed to ${goal ? goal.toLowerCase() : 'evoke cinematic atmosphere'}, utilizing ${tools || 'advanced diffusion workflows'} to deliver client-ready commercial resolution.`;
}
