// src/intelligence/creatorDNA.js
// Structured Creator DNA Engine
// Distinguishes between:
// 1. Creator-Provided (Self-reported preferences & setup)
// 2. Portfolio-Supported (Verified evidence from real uploaded projects)
// 3. AI-Inferred (Synthesized attributes from semantic analysis across projects & captions)

export function generateCreatorDNA(creator) {
  if (!creator) return null;

  const projects = creator.projects || [];

  // 1. Portfolio-supported evidence extraction
  const verifiedFormats = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
  const verifiedCapabilities = Array.from(new Set(projects.flatMap(p => p.capabilities || [])));
  const verifiedClients = Array.from(new Set(projects.map(p => p.clientType).filter(Boolean)));
  const verifiedStyles = Array.from(new Set(projects.map(p => p.style).filter(Boolean)));

  // 2. Provenance Category 1: Creator-Provided Information
  const creatorProvided = {
    bio: creator.bio || 'Independent AI visual creator.',
    statedSpecialty: creator.specialty || 'Generative Direction',
    preferredStyles: creator.styles || ['Editorial', 'Cinematic'],
    declaredIndustries: creator.industries || ['Commercial'],
    toolsUsed: creator.tools || ['Midjourney v6.1', 'Runway Gen-3'],
    platformsActive: creator.platforms || ['Instagram', 'Vimeo'],
    availability: creator.availability || 'Available for projects',
    location: creator.location || 'Remote (Global)'
  };

  // 3. Provenance Category 2: Portfolio-Supported Evidence
  const portfolioSupported = {
    totalVerifiedProjects: projects.length,
    demonstratedFormats: verifiedFormats.length > 0 ? verifiedFormats : [creator.specialty],
    demonstratedCapabilities: verifiedCapabilities.slice(0, 5),
    verifiedClientTiers: verifiedClients.length > 0 ? verifiedClients : ['Commercial Commissions'],
    aspectRatiosDelivered: Array.from(new Set(projects.map(p => p.aspect || '16:9'))),
    evidenceCount: projects.length
  };

  // 4. Provenance Category 3: AI-Inferred Creative Attributes
  // Inferred deterministically from semantic traits across bio, styles, and project briefs
  const allProjectText = projects.map(p => `${p.title} ${p.description || ''} ${p.creativeDirection || ''}`).join(' ').toLowerCase();
  const bioText = (creator.bio || '').toLowerCase();
  const combinedCorpus = `${bioText} ${allProjectText}`;

  // Infer visual aesthetic
  let visualAesthetic = 'High-end Contemporary Editorial';
  if (combinedCorpus.includes('35mm') || combinedCorpus.includes('anamorphic') || combinedCorpus.includes('cinematic')) {
    visualAesthetic = 'Cinematic 35mm, Anamorphic Flares & Volumetric Sunlight';
  } else if (combinedCorpus.includes('silk') || combinedCorpus.includes('couture') || combinedCorpus.includes('draping')) {
    visualAesthetic = 'Neoclassical Haute Couture, Light-Sculpted Silk & Caustics';
  } else if (combinedCorpus.includes('macro') || combinedCorpus.includes('skin') || combinedCorpus.includes('hydration')) {
    visualAesthetic = 'Macro Beauty Fluid Physics, Pristine Cellular Luminescence';
  } else if (combinedCorpus.includes('minimal') || combinedCorpus.includes('titanium') || combinedCorpus.includes('scandinavian')) {
    visualAesthetic = 'Industrial Minimalism, Monochromatic Studio Lighting';
  } else if (combinedCorpus.includes('biophilic') || combinedCorpus.includes('surreal') || combinedCorpus.includes('architecture')) {
    visualAesthetic = 'Monumental Biophilic Surrealism, Atmospheric Golden Hour';
  }

  // Infer storytelling approach
  let storytellingApproach = 'Editorial Polish & Commercial Impact';
  if (combinedCorpus.includes('narrative') || combinedCorpus.includes('character') || combinedCorpus.includes('odyssey')) {
    visualAesthetic.includes('Cinematic')
      ? (storytellingApproach = 'Slow-burn character-driven narrative with emotional cinematic naturalism')
      : (storytellingApproach = 'Atmospheric brand mythology and worldbuilding');
  } else if (combinedCorpus.includes('kinetic') || combinedCorpus.includes('fast') || combinedCorpus.includes('speed')) {
    storytellingApproach = 'Rhythmic kinetic pacing engineered for high-engagement mobile feeds';
  } else if (combinedCorpus.includes('sensory') || combinedCorpus.includes('tactile')) {
    storytellingApproach = 'Sensory tactile focus highlighting micro-textures and material physics';
  }

  // Infer product presentation style
  let productPresentationStyle = 'Studio Tabletop Key Art';
  if (combinedCorpus.includes('fluid') || combinedCorpus.includes('caustic') || combinedCorpus.includes('droplet')) {
    productPresentationStyle = 'Organic Fluid Dynamics & Liquid Refraction';
  } else if (combinedCorpus.includes('zero-gravity') || combinedCorpus.includes('levitation') || combinedCorpus.includes('exploded')) {
    productPresentationStyle = 'Zero-Gravity Mechanical Levitation & Exploded Views';
  } else if (combinedCorpus.includes('editorial') || combinedCorpus.includes('drapery')) {
    productPresentationStyle = 'High-Fashion Editorial Integration with Flowing Textiles';
  }

  const aiInferred = {
    visualAesthetic,
    storytellingApproach,
    productPresentationStyle,
    derivedPacing: combinedCorpus.includes('kinetic') ? 'High-Tempo Dynamic' : 'Deliberate Cinematic Pacing',
    colorSensitivity: combinedCorpus.includes('golden') || combinedCorpus.includes('sun') ? 'Warm Solar & Golden Hour' : combinedCorpus.includes('neon') ? 'High-Contrast Cyber Chroma' : 'Naturalistic Editorial Palette'
  };

  // Structured Core DNA Traits
  const traits = Array.from(new Set([
    ...(creator.styles || []).slice(0, 3),
    creator.specialty,
    ...(creator.capabilities || []).slice(0, 2)
  ])).slice(0, 5);

  // Evidence Completeness Status
  const completenessTier = projects.length >= 2 ? 'Verified Portfolio' : projects.length === 1 ? 'Developing Portfolio' : 'Self-Reported Only';

  return {
    creatorId: creator.id,
    creatorName: creator.name,
    traits,
    visualAesthetic,
    storytellingApproach,
    productPresentationStyle,
    provenance: {
      creatorProvided,
      portfolioSupported,
      aiInferred
    },
    completeness: {
      tier: completenessTier,
      isVerified: projects.length >= 2,
      projectEvidenceCount: projects.length
    },
    tools: creator.tools || [],
    styles: creator.styles || [],
    industries: creator.industries || [],
    capabilities: creator.capabilities || []
  };
}
