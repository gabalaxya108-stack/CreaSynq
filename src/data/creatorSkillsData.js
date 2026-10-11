// src/data/creatorSkillsData.js
// Technical Skills, Creative Skills, and AI Production Workflow Standards for CreaSync

export const RECOMMENDED_TECHNICAL_SKILLS = [
  'AI image generation',
  'AI video generation',
  'AI animation',
  'Image-to-video generation',
  'Text-to-image and text-to-video',
  'AI model selection and configuration',
  'Prompt engineering',
  'ControlNet and reference-image conditioning',
  'Upscaling and frame interpolation',
  'Video compositing and post-processing',
  'Audio generation and synchronization',
  'Workflow automation',
  'ComfyUI node workflows',
  'LoRA training & custom weights',
  'Spatial & 3D Gaussian Splatting'
];

export const RECOMMENDED_CREATIVE_SKILLS = [
  'Visual storytelling',
  'Cinematic composition',
  'Art direction',
  'Concept development',
  'Character design',
  'World-building',
  'Motion design',
  'Color grading',
  'Lighting and visual aesthetics',
  'Brand storytelling',
  'Advertising creatives',
  'Storyboarding',
  'Creative editing',
  'Pacing & montage choreography',
  'Atmospheric world-crafting'
];

export const STANDARD_WORKFLOW_STAGE_PRESETS = [
  {
    stageNumber: 1,
    stageKey: 'creative_brief',
    stageName: 'Creative brief and requirements',
    title: 'Creative Brief & Strategic Mandate',
    description: 'Synthesizing campaign mandate, target aesthetic tone, audience demographics, aspect ratios, and brand deliverables.',
    defaultTools: ['Miro', 'Notion', 'FigJam'],
    placeholderNotes: 'Define creative benchmarks, deliverables, and visual non-negotiables.',
    duration: '1-2 Days'
  },
  {
    stageNumber: 2,
    stageKey: 'concept_development',
    stageName: 'Concept development',
    title: 'Concept Development & Visual Moodboard',
    description: 'Iterative moodboard curation, style benchmarks, lighting choreography, and narrative storyboard boards.',
    defaultTools: ['Midjourney v6.1', 'Photoshop'],
    placeholderNotes: 'Curate physical film references, anamorphic distortion styles, and color palettes.',
    duration: '2-3 Days'
  },
  {
    stageNumber: 3,
    stageKey: 'prompting_generation',
    stageName: 'Prompting and asset generation',
    title: 'Prompt Formulation & Generative Synthesis',
    description: 'Prompt formulation, motion brush steering, seed selection, and multi-pass generative rendering across chosen models.',
    defaultTools: ['Runway Gen-3 Alpha', 'ComfyUI', 'Flux.1 Pro', 'Midjourney v6.1'],
    placeholderNotes: 'Specify model versions, guidance scales, seed parameters, and reference conditioning.',
    duration: '3-4 Days'
  },
  {
    stageNumber: 4,
    stageKey: 'refinement_iteration',
    stageName: 'Refinement and iteration',
    title: 'Latent Steering & Artifact Inpainting',
    description: 'Latent-space refinement, inpainting micro-artifacts, ControlNet pose realignment, and multi-iteration convergence.',
    defaultTools: ['ComfyUI Inpaint', 'Magnific AI', 'Photoshop Generative Fill'],
    placeholderNotes: 'Document iteration count, artifact resolution techniques, and output selection criteria.',
    duration: '2 Days'
  },
  {
    stageNumber: 5,
    stageKey: 'editing_postproduction',
    stageName: 'Editing and post-production',
    title: 'Conforming, Temporal Stabilization & Color',
    description: 'Timeline editorial assembly, Topaz 4K frame interpolation, grain conform, sound design, and master color grading.',
    defaultTools: ['DaVinci Resolve Studio', 'Topaz Video AI', 'Premiere Pro'],
    placeholderNotes: 'Upscaling algorithms, color spaces (Rec.709/ACES), and composite stabilization passes.',
    duration: '2-3 Days'
  },
  {
    stageNumber: 6,
    stageKey: 'quality_review',
    stageName: 'Quality review',
    title: 'Brand Alignment & Artifact Inspection',
    description: 'High-resolution frame-by-frame QC, audio sync verification, commercial brand compliance, and licensing review.',
    defaultTools: ['Frame.io', 'DaVinci Scopes'],
    placeholderNotes: 'Internal QC checklist, commercial licensing validation, and stakeholder review notes.',
    duration: '1 Day'
  },
  {
    stageNumber: 7,
    stageKey: 'final_export_delivery',
    stageName: 'Final export and delivery',
    title: 'Master Delivery & Rights Documentation',
    description: 'Master ProRes 4444 delivery, format adaptations (16:9, 9:16), metadata tagging, and commercial clearance release.',
    defaultTools: ['ProRes 4444', 'Rec.709 Master', 'Cloud Delivery'],
    placeholderNotes: 'Deliverable format, commercial licensing terms, and client handoff packages.',
    duration: '1 Day'
  }
];

export function createDefaultWorkflowStages(projectTitle = 'Project') {
  return STANDARD_WORKFLOW_STAGE_PRESETS.map((preset, idx) => ({
    id: `stage-${Date.now()}-${idx + 1}`,
    stageNumber: idx + 1,
    stageName: preset.stageName,
    title: preset.title,
    description: preset.description,
    tools: [...preset.defaultTools],
    duration: preset.duration || '',
    processNotes: preset.placeholderNotes
  }));
}
