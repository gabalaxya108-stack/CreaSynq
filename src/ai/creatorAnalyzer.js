// src/ai/creatorAnalyzer.js
// Deep semantic analysis of creator portfolio pieces and metadata to synthesize Creator DNA

export function analyzeCreatorPortfolio(creator) {
  if (!creator) return null;

  const projects = creator.projects || [];
  
  // Collect all text tokens from projects
  const projectTexts = projects.map(p => 
    `${p.title} ${p.description || ''} ${p.creativeDirection || ''} ${p.category || ''} ${(p.capabilities || []).join(' ')}`
  ).join(' ').toLowerCase();

  const bioText = `${creator.bio || ''} ${creator.creativeIdentity || ''}`.toLowerCase();
  const allText = `${bioText} ${projectTexts}`;

  // Analyze visual style
  const styles = [...(creator.styles || [])];
  if (allText.includes('cinematic') && !styles.includes('Cinematic')) styles.push('Cinematic');
  if (allText.includes('editorial') && !styles.includes('Editorial')) styles.push('Editorial');
  if (allText.includes('luxury') && !styles.includes('Luxury')) styles.push('Luxury');
  if (allText.includes('minimal') && !styles.includes('Minimal')) styles.push('Minimal');
  if (allText.includes('surreal') && !styles.includes('Surreal')) styles.push('Surreal');
  if (allText.includes('product') && !styles.includes('Product-focused')) styles.push('Product-focused');

  // Analyze industries
  const industries = [...(creator.industries || [])];
  if (allText.includes('skincare') || allText.includes('beauty')) {
    if (!industries.includes('Beauty & Skincare')) industries.push('Beauty & Skincare');
  }
  if (allText.includes('fashion') || allText.includes('couture')) {
    if (!industries.includes('Luxury & High Fashion')) industries.push('Luxury & High Fashion');
  }
  if (allText.includes('hardware') || allText.includes('tech') || allText.includes('watch')) {
    if (!industries.includes('Consumer Tech & Hardware')) industries.push('Consumer Tech & Hardware');
  }

  // Synthesize clean traits
  const traits = Array.from(new Set([
    ...styles.slice(0, 3),
    creator.specialty,
    ...(creator.capabilities || []).slice(0, 2)
  ])).slice(0, 5);

  // Creative identity line
  let creativeIdentity = creator.creativeIdentity;
  if (!creativeIdentity || creativeIdentity.length < 15) {
    creativeIdentity = `Creates ${styles.slice(0, 2).join(' ')} worlds around progressive brands.`;
  }

  return {
    creatorId: creator.id,
    creatorName: creator.name,
    traits,
    creativeIdentity,
    styles,
    industries,
    capabilities: creator.capabilities || [],
    platforms: creator.platforms || ['Instagram', 'Vimeo'],
    projectCount: projects.length,
    tools: creator.tools || []
  };
}
