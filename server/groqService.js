// server/groqService.js
// Server-side Groq API Service for CreaSync
// Strictly runs in Node.js — NEVER exposed to the frontend or bundled client code.
// Uses official Groq REST API endpoint (OpenAI-compatible) with native fetch.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

/**
 * Validates whether the Groq API key is present and configured.
 * Does NOT log or leak the key.
 */
export function isGroqConfigured() {
  const key = process.env.GROQ_API_KEY;
  return typeof key === 'string' && key.trim().length > 0 && !key.includes('your_groq_api_key');
}

export function getGroqModel() {
  return process.env.GROQ_MODEL || DEFAULT_MODEL;
}

/**
 * Low-level server-side caller to Groq Chat Completion API
 */
async function callGroqChat({ messages, temperature = 0.2, jsonMode = true, maxTokens = 2048 }) {
  if (!isGroqConfigured()) {
    throw new Error('GROQ_CONFIG_MISSING: GROQ_API_KEY environment variable is not configured.');
  }

  const apiKey = process.env.GROQ_API_KEY.trim();
  const model = getGroqModel();

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    let errorMessage = `Groq API responded with status ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error && parsed.error.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      // non-JSON error
    }
    const err = new Error(errorMessage);
    err.status = response.status;
    err.code = response.status === 429 ? 'RATE_LIMIT' : 'GROQ_API_ERROR';
    throw err;
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '{}';

  if (jsonMode) {
    try {
      return JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[Groq Server] JSON parse error on response:', rawContent);
      throw new Error('MALFORMED_AI_RESPONSE: Groq returned invalid JSON format.');
    }
  }

  return rawContent;
}

// =========================================================================
// 1. FEATURE: CREABRIEF
// Turns natural-language campaign text into a structured brief.
// STRICT: Does NOT invent budgets or deadlines. Distinguishes explicit from inferred.
// =========================================================================
export async function generateCreaBrief(naturalPrompt) {
  if (!naturalPrompt || typeof naturalPrompt !== 'string' || naturalPrompt.trim().length === 0) {
    throw new Error('INVALID_INPUT: Campaign description is empty.');
  }

  const systemPrompt = `You are CreaBrief, an expert creative agency producer and brief architect for CreaSync, an AI creative marketplace connecting brands with AI creators.

Analyze the user's natural language campaign concept and extract a structured campaign brief.
Follow these CRITICAL RULES:
1. PRESERVE ORIGINAL INTENT without hallucinating details.
2. DO NOT INVENT BUDGETS OR DEADLINES. If the user did not explicitly state a budget or deadline, set their values to null and note them in "missingInformation".
3. DISTINGUISH EXPLICIT REQUIREMENTS from INFERRED SUGGESTIONS clearly.
4. Output MUST be valid JSON adhering strictly to the schema below.

JSON SCHEMA:
{
  "title": "string (Concise, punchy campaign title)",
  "objective": "string (e.g. Product Launch, Brand Film, Editorial Lookbook, Social Performance)",
  "productOrService": "string (The core product, brand, or service being promoted)",
  "targetAudience": "string (Target demographic & aesthetic sensibility)",
  "creativeDirection": "string (Visual narrative, optical style, mood, lighting)",
  "desiredTone": "string (e.g. Authentic, Warm, Editorial, Luminous, Moody, Kinetic)",
  "deliverables": "string (Explicit or proposed deliverables suite, e.g. 3x 4K Stills, 2x 9:16 Loops)",
  "preferredPlatforms": "string (Platforms specified, e.g. Instagram, TikTok, Digital OOH, YouTube)",
  "requiredCreatorCapabilities": ["string (e.g. Macro fluid physics, 3D spatial renders, 35mm grain)"],
  "budget": "string or null (ONLY if explicitly stated by user, e.g. '$8,000', else null)",
  "deadline": "string or null (ONLY if explicitly stated by user, e.g. '3 weeks', else null)",
  "mandatoryRequirements": ["string (Requirements explicitly specified by brand)"],
  "optionalPreferences": ["string (Preferences inferred to enhance the brief)"],
  "missingInformation": [
    {
      "field": "string (e.g. budget, timeline, deliverableCount)",
      "label": "string",
      "prompt": "string (Helpful guidance for the brand on what to decide)"
    }
  ],
  "clarifyingQuestions": ["string (1-3 targeted questions to refine artistic scope)"]
}`;

  const userMessage = `Natural campaign concept:\n"""${naturalPrompt}"""`;

  const parsed = await callGroqChat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.1,
    jsonMode: true
  });

  // Server-side validation
  return {
    title: parsed.title || 'Creative Campaign Brief',
    objective: parsed.objective || 'Product Launch',
    productOrService: parsed.productOrService || 'Featured Product',
    industry: parsed.industry || (parsed.productOrService?.toLowerCase().includes('skin') ? 'Beauty & Skincare' : parsed.productOrService?.toLowerCase().includes('chrono') || parsed.productOrService?.toLowerCase().includes('watch') ? 'Consumer Tech & Hardware' : 'General Commercial'),
    targetAudience: parsed.targetAudience || 'Aesthetic-conscious consumers',
    creativeDirection: parsed.creativeDirection || 'Contemporary visual storytelling',
    creativeStyle: parsed.creativeStyle || parsed.creativeDirection || 'Cinematic, Moody, Macro, Industrial Precision',
    desiredTone: parsed.desiredTone || 'Authentic & Editorial',
    contentFormats: parsed.contentFormats || parsed.deliverables || '4K Stills Suite, 9:16 Kinetic Loops',
    deliverables: parsed.deliverables || 'Hero Key Visuals & Loops',
    preferredPlatforms: parsed.preferredPlatforms || 'Instagram, Digital OOH',
    requiredCreatorCapabilities: Array.isArray(parsed.requiredCreatorCapabilities) ? parsed.requiredCreatorCapabilities : [],
    budget: parsed.budget || null,
    deadline: parsed.deadline || null,
    mandatoryRequirements: Array.isArray(parsed.mandatoryRequirements) ? parsed.mandatoryRequirements : [],
    optionalPreferences: Array.isArray(parsed.optionalPreferences) ? parsed.optionalPreferences : [],
    missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : [],
    clarifyingQuestions: Array.isArray(parsed.clarifyingQuestions) ? parsed.clarifyingQuestions : []
  };
}

// =========================================================================
// 2. FEATURE: CREATOR DNA
// Generates grounded representation of creator identity with 3-tier provenance.
// =========================================================================
export async function generateCreatorDNA(creator) {
  if (!creator) throw new Error('INVALID_INPUT: Creator profile is missing.');

  const projects = creator.projects || [];
  const systemPrompt = `You are the Creator DNA Synthesizer on CreaSync.
Analyze an AI creator's profile and verified portfolio projects.
Generate an evidence-grounded profile distinguishing between:
1. Creator-Provided: Stated preferences, bio, tools declared by creator.
2. Portfolio-Supported: Proven facts extracted from verified uploaded projects (aspect ratios, techniques, categories, clients).
3. AI-Inferred: Synthesized creative traits (optical signatures, storytelling rhythms, product presentation style).

RULES:
- DO NOT claim a creator has capabilities not backed by projects or bio.
- If projects array is empty or small, highlight uncertainty and state that evidence is limited.
- Output valid JSON strictly conforming to schema.

JSON SCHEMA:
{
  "creatorId": "string",
  "visualAesthetic": "string (Concise signature aesthetic, e.g. 'Cinematic 35mm with Anamorphic Sun Flares')",
  "storytellingApproach": "string (Narrative pacing and thematic tendencies)",
  "productPresentationStyle": "string (How physical/digital products are staged)",
  "provenance": {
    "creatorProvided": {
      "bio": "string",
      "statedSpecialty": "string",
      "preferredStyles": ["string"],
      "toolsUsed": ["string"]
    },
    "portfolioSupported": {
      "totalVerifiedProjects": "number",
      "demonstratedFormats": ["string"],
      "demonstratedCapabilities": ["string"],
      "verifiedClients": ["string"]
    },
    "aiInferred": {
      "derivedPacing": "string",
      "colorSensitivity": "string",
      "opticalSignature": "string"
    }
  },
  "strengths": ["string (Key demonstrated creative strengths)"],
  "completeness": {
    "tier": "string ('Verified Portfolio' | 'Developing Portfolio' | 'Self-Reported Only')",
    "isVerified": "boolean",
    "notes": "string (Statement on evidence depth and what is needed)"
  }
}`;

  const creatorSummary = {
    id: creator.id,
    name: creator.name,
    specialty: creator.specialty,
    bio: creator.bio,
    styles: creator.styles || [],
    tools: creator.tools || [],
    categoryTags: creator.categoryTags || [],
    projects: projects.map(p => ({
      title: p.title,
      category: p.category,
      clientType: p.clientType,
      creativeDirection: p.creativeDirection,
      capabilities: p.capabilities,
      description: p.description
    }))
  };

  const parsed = await callGroqChat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Creator data:\n${JSON.stringify(creatorSummary, null, 2)}` }
    ],
    temperature: 0.1,
    jsonMode: true
  });

  return parsed;
}

// =========================================================================
// 3. FEATURE: CREAMATCH & CREASCORE (Semantic Interpretation & Grounded Explanation)
// =========================================================================
export async function evaluateCreaMatchAndScore(campaign, creator) {
  if (!campaign || !creator) throw new Error('INVALID_INPUT: Campaign or creator missing.');

  const projects = creator.projects || [];
  const systemPrompt = `You are CreaMatch & CreaScore on CreaSync.
You evaluate the creative compatibility between a brand's campaign brief and an AI creator's verified profile.
You provide an evidence-based explanation (CreaScore) grounded ONLY in actual facts.

RULES:
- CITE actual projects by title from the creator's portfolio.
- DO NOT invent projects, audience metrics, or awards.
- Explicitly state UNKNOWNS (e.g. if budget or audience data is unavailable, note it as unverified).
- Assess creative style nuance, format fit, and potential gaps honestly.

JSON SCHEMA:
{
  "semanticAlignmentSummary": "string (Why this creator specifically suits the brief)",
  "citedProjects": [
    {
      "title": "string (Exact title of verified project from creator's portfolio)",
      "relevance": "string (Why this project proves capability for the brief)"
    }
  ],
  "requirementsSatisfied": ["string (Requirements confirmed by portfolio evidence)"],
  "identifiedUnknowns": ["string (Unknown parameters, e.g. audience retention, unstated budget)"],
  "potentialCreativeGaps": ["string (Nuances or constraints for the brand to coordinate)"],
  "styleCompatibilityAnalysis": "string (Detailed comparison of campaign tone vs creator's optical signature)"
}`;

  const context = {
    campaign: {
      title: campaign.title,
      objective: campaign.objective,
      industry: campaign.industry,
      creativeStyle: campaign.creativeStyle,
      toneOfVoice: campaign.toneOfVoice,
      deliverables: campaign.deliverables,
      budget: campaign.budget,
      timeline: campaign.timeline
    },
    creator: {
      name: creator.name,
      specialty: creator.specialty,
      bio: creator.bio,
      styles: creator.styles,
      tools: creator.tools,
      projects: projects.map(p => ({
        title: p.title,
        category: p.category,
        clientType: p.clientType,
        creativeDirection: p.creativeDirection,
        description: p.description
      }))
    }
  };

  const parsed = await callGroqChat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Evaluate match:\n${JSON.stringify(context, null, 2)}` }
    ],
    temperature: 0.1,
    jsonMode: true
  });

  return parsed;
}

// =========================================================================
// 4. FEATURE: CREASIM (Creator-Tailored Campaign Concept Synthesis)
// =========================================================================
export async function generateCreaSimConcepts(campaign, creator, creatorDNA = {}) {
  if (!campaign || !creator) throw new Error('INVALID_INPUT: Campaign or creator missing.');

  const systemPrompt = `You are CreaSim™, an AI creative director synthesizing creator-specific campaign directions on CreaSync.
Generate 3 distinct, high-concept creative directions tailored to BOTH:
1. The brand's campaign brief (objective, product, audience)
2. The creator's signature aesthetic and Creator DNA (tools, lighting, pacing)

CRITICAL RULES:
- The concepts must be tailored to THIS creator's unique style, not generic ideas.
- DO NOT claim these concepts are completed work; they are simulated creative directions.
- Return structured concepts with storyboards, lighting, and palette.

JSON SCHEMA:
{
  "concepts": [
    {
      "id": "string (e.g. 'concept-1')",
      "title": "string (Evocative direction title in quotes)",
      "creativeDirection": "string (Core visual proposition)",
      "openingHook": "string (The first 3 seconds hook)",
      "visualTreatment": "string (Camera, lighting, materials, texture)",
      "connectionToObjective": "string (How this solves the brand's campaign goal)",
      "whyItSuitsCreator": "string (Direct link to creator's documented style/tools)",
      "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
      "storyboard": [
        { "scene": "01", "type": "string", "desc": "string" },
        { "scene": "02", "type": "string", "desc": "string" },
        { "scene": "03", "type": "string", "desc": "string" }
      ],
      "suggestedDeliverable": "string"
    }
  ],
  "disclaimer": "Concept Simulation synthesized by CreaSim using verified Creator DNA. Demonstrates creative direction potential, not pre-existing client work."
}`;

  const context = {
    campaign: {
      title: campaign.title,
      product: campaign.product || campaign.industry,
      objective: campaign.objective,
      creativeStyle: campaign.creativeStyle,
      deliverables: campaign.deliverables
    },
    creator: {
      name: creator.name,
      specialty: creator.specialty,
      styles: creator.styles,
      visualAesthetic: creatorDNA.visualAesthetic || creator.specialty,
      storytellingApproach: creatorDNA.storytellingApproach || creator.bio,
      pastProjects: (creator.projects || []).slice(0, 3).map(p => p.title)
    }
  };

  const parsed = await callGroqChat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate concepts:\n${JSON.stringify(context, null, 2)}` }
    ],
    temperature: 0.3,
    jsonMode: true
  });

  return parsed;
}
