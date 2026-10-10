// src/data/workflowsData.js
// Curated Demonstration Workflows for Alloy AI Creator Marketplace
// Clearly distinguishes creator-provided information from verified standards.
// Provides realistic pipelines across key creative specializations.

export const WORKFLOW_SPECIALIZATIONS = [
  "AI Beauty & Skincare",
  "AI Product Visualization",
  "AI Fashion Campaigns",
  "AI Interior Visualization",
  "AI Motion Design",
  "AI Commercial Photography",
  "Generative Worldbuilding & CGI"
];

export const DEMO_WORKFLOWS = [
  {
    id: "wf-skincare-maya",
    creatorId: "maya-chen",
    title: "Premium Skincare Campaign Workflow",
    description: "End-to-end generative and post-production workflow for high-end organic skincare visuals, featuring micro-viscosity physics and 35mm warm ambient lighting.",
    specialization: "AI Beauty & Skincare",
    linkedProjectId: "maya-proj-1",
    linkedProjectTitle: "Echoes of the Solarium — Mid-Century Brand Odyssey",
    status: "Published",
    visibility: "published",
    isDemo: true,
    humanInvolvementNotes: "Human art direction on lighting setup, custom prompt curation, manual Photoshop retouching of micro-fluid droplet caustics and skin texture retention.",
    updatedAt: "2 hours ago",
    steps: [
      {
        id: "step-sk-1",
        stepNumber: "01",
        title: "Brief Analysis",
        description: "Analyze the campaign objective, target audience aesthetics, brand color palette, deliverable formats (4K stills and 9:16 vertical loops), and product ingredient storytelling.",
        tools: ["Notion", "Figma", "Client Creative Brief"],
        evidence: "Reviewed brand aesthetic guidelines and created color palette spec (3200K warm ambient, organic earth tones).",
        humanRole: "Creative Director brief interpretation & alignment"
      },
      {
        id: "step-sk-2",
        stepNumber: "02",
        title: "Concept Development",
        description: "Establish the creative direction, mood, tactile composition, lighting choreography, and visual references. Construct moodboards for sunlit botanicals and macro fluid droplets.",
        tools: ["Midjourney v6.1", "Milanote", "Photoshop"],
        evidence: "Curated 12-slide moodboard with botanical refractions and tactile stone textures.",
        humanRole: "Art Direction & visual composition curation"
      },
      {
        id: "step-sk-3",
        stepNumber: "03",
        title: "AI Generation",
        description: "Generate initial visual passes using custom ComfyUI workflows and Midjourney v6.1 with structured camera prompts and surface texture parameters.",
        tools: ["Midjourney v6.1", "ComfyUI", "Custom SDXL Checkpoints"],
        evidence: "Prompt exploration run with 40+ variations across raking sunlight and glass caustics.",
        humanRole: "Prompt engineering, seed iteration, and latent space navigation"
      },
      {
        id: "step-sk-4",
        stepNumber: "04",
        title: "Refinement",
        description: "Improve composition, lighting balance, bottle typography alignment, and micro-viscosity consistency using inpainting and regional prompting passes.",
        tools: ["ComfyUI Inpainting", "Magnific AI", "Photoshop"],
        evidence: "Regional inpainting passes on dropper tip and droplet surface tensions.",
        humanRole: "Precision inpainting mask selection and structural refinement"
      },
      {
        id: "step-sk-5",
        stepNumber: "05",
        title: "Post-production",
        description: "Edit and polish the selected creative assets. Manual skin retouching, color grading to 3200K warm gold tones, and 35mm grain blending.",
        tools: ["Adobe Photoshop", "DaVinci Resolve", "Lightroom"],
        evidence: "16-bit TIFF color grading curve with high-pass frequency separation for pore textures.",
        humanRole: "Hand-retouched fluid specular highlights and color harmony calibration"
      },
      {
        id: "step-sk-6",
        stepNumber: "06",
        title: "Quality Review",
        description: "Review the output against the client brief, brand guidelines, optical realism standards, and zoom-level artifact inspections.",
        tools: ["Frame.io", "Checklist Inspection Matrix"],
        evidence: "Passed 100% crop inspection for sharp label text and natural light physics.",
        humanRole: "Rigorous optical realism QA and compliance sign-off"
      },
      {
        id: "step-sk-7",
        stepNumber: "07",
        title: "Final Delivery",
        description: "Prepare and export approved assets in master 4K lossless formats (PNG/TIFF) and 9:16 vertical motion loops formatted for social and digital OOH displays.",
        tools: ["Adobe Media Encoder", "Cloud Storage Delivery Vault"],
        evidence: "Delivered package with 4K TIFF master files and color profile embedded (sRGB/Display P3).",
        humanRole: "Export mastering, metadata tagging, and client handoff"
      }
    ]
  },
  {
    id: "wf-motion-maya",
    creatorId: "maya-chen",
    title: "Cinematic Anamorphic Motion Teaser Series",
    description: "Multimodal generative pipeline taking high-res concept art into fluid 24fps filmic video passes with temporal coherence and physical sound staging.",
    specialization: "AI Motion Design",
    linkedProjectId: "maya-proj-2",
    linkedProjectTitle: "Neon Monsoon — Neo-Tokyo Nocturne",
    status: "Published",
    visibility: "published",
    isDemo: true,
    humanInvolvementNotes: "Pacing beatboard editing, manual optical flow stabilization, Foley sound design synchronization, and Davinci tone mapping.",
    updatedAt: "1 day ago",
    steps: [
      {
        id: "step-mo-1",
        stepNumber: "01",
        title: "Motion Beatboard & Camera Script",
        description: "Deconstruct narrative pacing into 3-second camera beats. Specify focal length moves (anamorphic 40mm pan, dolly zoom, tilt-shift).",
        tools: ["Milanote", "Figma", "Final Draft"],
        evidence: "Constructed 6-shot storyboard with focal speed parameters.",
        humanRole: "Cinematographer camera motion choreography"
      },
      {
        id: "step-mo-2",
        stepNumber: "02",
        title: "Keyframe Master Generation",
        description: "Synthesize high-fidelity first-frame and last-frame anchor images with exact atmosphere, rim lighting, and specular highlights.",
        tools: ["Midjourney v6.1", "Photoshop"],
        evidence: "Generated 12 anchor keyframes with consistent neon color temperature.",
        humanRole: "Visual style lock and color anchor definition"
      },
      {
        id: "step-mo-3",
        stepNumber: "03",
        title: "AI Video Motion Synthesis",
        description: "Drive video generation between anchor keyframes using Runway Gen-3 and Luma Dream Machine with explicit motion brush controls.",
        tools: ["Runway Gen-3 Alpha", "Luma Dream Machine"],
        evidence: "Rendered 18 video passes testing camera velocity and liquid rain flow.",
        humanRole: "Temporal prompt tuning and motion curve iteration"
      },
      {
        id: "step-mo-4",
        stepNumber: "04",
        title: "Optical Stabilization & Upscaling",
        description: "Apply AI frame interpolation to resolve micro-jitter, followed by 4K spatial upscaling preserving film grain texture.",
        tools: ["Topaz Video AI", "DaVinci Resolve"],
        evidence: "Interpolated from 24fps native to smooth cinema rate with zero motion blur artifacts.",
        humanRole: "Artifact scrubbing and technical motion smoothing"
      },
      {
        id: "step-mo-5",
        stepNumber: "05",
        title: "Master Color Grade & Sound Sync",
        description: "Harmonize color LUTs across all sequence clips in DaVinci Resolve and synchronize atmospheric ambient audio stems.",
        tools: ["DaVinci Resolve", "Adobe Audition"],
        evidence: "Exported Master ProRes 422HQ file with embedded multichannel audio.",
        humanRole: "Final color timing and audio-visual cadence editing"
      }
    ]
  },
  {
    id: "wf-product-kai",
    creatorId: "kai-sorenson",
    title: "Precision Industrial Product Rendering",
    description: "CAD-aligned photorealistic generative visualization pipeline for consumer hardware, titanium textures, and studio lighting.",
    specialization: "AI Product Visualization",
    linkedProjectId: "kai-proj-1",
    linkedProjectTitle: "Titanium Chrono Exploded Pass",
    status: "Published",
    visibility: "published",
    isDemo: true,
    humanInvolvementNotes: "CAD reference extraction, ControlNet depth mapping, material physics tuning, and micro-bevel shadow compositing.",
    updatedAt: "3 days ago",
    steps: [
      {
        id: "step-pr-1",
        stepNumber: "01",
        title: "3D CAD Model & Geometry Extraction",
        description: "Extract clean wireframe passes, surface normals, and depth maps from industrial CAD files for precision generative conditioning.",
        tools: ["Blender", "Rhino 3D"],
        evidence: "Generated depth and normal maps at 4096x4096 resolution.",
        humanRole: "3D geometry alignment & camera focal point setup"
      },
      {
        id: "step-pr-2",
        stepNumber: "02",
        title: "ControlNet Conditioned Generation",
        description: "Guide generative diffusion with strict surface normal and line-art ControlNet adapters to maintain 100% geometric dimensional accuracy.",
        tools: ["ComfyUI", "SDXL ControlNet Normal/Depth"],
        evidence: "Dimensional error deviation verified <0.5% against original CAD contours.",
        humanRole: "Node-based generative pipeline orchestration"
      },
      {
        id: "step-pr-3",
        stepNumber: "03",
        title: "Material & Lighting Pass Synthesis",
        description: "Synthesize brushed titanium anisotropic reflections, sapphire crystal refraction caustics, and studio strip softbox lighting.",
        tools: ["ComfyUI", "Custom LORAs"],
        evidence: "Synthesized 8 distinct studio lighting rigs for client comparison.",
        humanRole: "Virtual gaffer lighting design and material calibration"
      },
      {
        id: "step-pr-4",
        stepNumber: "04",
        title: "Multi-Pass Compositing & Retouching",
        description: "Composite specular, ambient occlusion, and reflection passes in Photoshop. Clean up typography and micro-dust elements.",
        tools: ["Adobe Photoshop", "Affinity Photo"],
        evidence: "32-bit floating point layer stack with isolated shadow passes.",
        humanRole: "High-precision commercial retouching & label placement"
      },
      {
        id: "step-pr-5",
        stepNumber: "05",
        title: "High-Resolution Master Delivery",
        description: "Generate 8K print-ready and e-commerce transparent PNG deliverables formatted for global omnichannel distribution.",
        tools: ["Photoshop", "Asset Delivery Pipeline"],
        evidence: "Delivered 8K key visuals and transparent cutouts with embedded clipping paths.",
        humanRole: "Quality assurance and omnichannel packout"
      }
    ]
  },
  {
    id: "wf-fashion-elena",
    creatorId: "elena-rostova",
    title: "Editorial Haute Couture Lookbook Pipeline",
    description: "High-fashion generative direction combining silk drape dynamics, editorial casting consistency, and European architectural backgrounds.",
    specialization: "AI Fashion Campaigns",
    linkedProjectId: "elena-proj-1",
    linkedProjectTitle: "Neoclassical Silk & Light",
    status: "Published",
    visibility: "published",
    isDemo: true,
    humanInvolvementNotes: "Virtual model facial landmark consistency lock, textile drape prompt weighting, and editorial grain curves.",
    updatedAt: "4 days ago",
    steps: [
      {
        id: "step-fa-1",
        stepNumber: "01",
        title: "Editorial Brief & Silhouette Moodboard",
        description: "Define collection themes, textile physical characteristics (organza, velvet, hammered silk), color palettes, and architectural setting.",
        tools: ["Figma", "Vogue Runway Archive"],
        evidence: "Curated 15-page collection moodboard signed off with client creative lead.",
        humanRole: "Fashion direction and textile reference research"
      },
      {
        id: "step-fa-2",
        stepNumber: "02",
        title: "Identity & Casting Consistency Calibration",
        description: "Calibrate virtual model facial embeddings via InstantID and FaceID LORAs to maintain uniform casting across entire lookbook.",
        tools: ["ComfyUI InstantID", "IP-Adapter FaceID"],
        evidence: "Tested facial consistency across 25 different camera angles with >96% similarity score.",
        humanRole: "Casting direction and identity weight tuning"
      },
      {
        id: "step-fa-3",
        stepNumber: "03",
        title: "Garment Silhouette & Drape Generation",
        description: "Generate full-body lookbook stills capturing fabric tension, natural garment folding, and dramatic architectural chiaroscuro.",
        tools: ["Midjourney v6.1", "ComfyUI"],
        evidence: "Generated 60 looks, selected top 12 hero poses for campaign story.",
        humanRole: "Fashion styling curation and pose selection"
      },
      {
        id: "step-fa-4",
        stepNumber: "04",
        title: "Fabric Retouching & Detail Refinement",
        description: "High-resolution regional inpainting on seam stitching, hem folds, and eye micro-details.",
        tools: ["Photoshop", "Magnific AI"],
        evidence: "Resolved fabric grain detail down to individual thread weave.",
        humanRole: "Artisanal detail retouching and textile fidelity check"
      },
      {
        id: "step-fa-5",
        stepNumber: "05",
        title: "Editorial Lookbook Spread Layout",
        description: "Final color calibration with warm Italian limestone tones, Kodak Portra film emulation, and double-page spread formatting.",
        tools: ["Adobe InDesign", "Lightroom"],
        evidence: "Packaged 24-page digital lookbook PDF and individual 300DPI print masters.",
        humanRole: "Editorial art direction and publication mastering"
      }
    ]
  },
  {
    id: "wf-interior-alex",
    creatorId: "alex-rivera",
    title: "Architectural & Interior Spatial Staging",
    description: "Atmospheric architectural visualization pipeline translating spatial floorplans into luminous, tactile residential spaces.",
    specialization: "AI Interior Visualization",
    linkedProjectId: "alex-proj-1",
    linkedProjectTitle: "Monolithic Concrete & Cedar Villa",
    status: "Published",
    visibility: "published",
    isDemo: true,
    humanInvolvementNotes: "Architectural perspective alignment, custom furniture placement, daylight simulation, and lens distortion correction.",
    updatedAt: "5 days ago",
    steps: [
      {
        id: "step-in-1",
        stepNumber: "01",
        title: "Architectural Plan & Spatial Blocking",
        description: "Study architect floorplans and establish interior camera viewpoints (one-point perspective, horizontal level 1.4m eye height).",
        tools: ["AutoCAD", "Sketchup"],
        evidence: "Established 4 camera angles respecting building sightlines.",
        humanRole: "Architectural photography composition standards"
      },
      {
        id: "step-in-2",
        stepNumber: "02",
        title: "Depth-Guided Spatial Synthesis",
        description: "Render basic 3D room volumes and guide diffusion models with depth maps to guarantee correct room proportions and ceiling heights.",
        tools: ["ComfyUI Depth ControlNet", "Midjourney v6.1"],
        evidence: "Spatial ceiling height and column grid preserved without perspective drift.",
        humanRole: "Spatial proportion QA and camera leveling"
      },
      {
        id: "step-in-3",
        stepNumber: "03",
        title: "Materiality & Daylight Simulation",
        description: "Synthesize cast shadows from south-facing skylights, raw board-formed concrete grain, and natural oiled cedar wood panels.",
        tools: ["ComfyUI", "Custom Architectural LORAs"],
        evidence: "Simulated 10:00 AM spring sun path angle with natural bounce light.",
        humanRole: "Lighting design and atmospheric mood orchestration"
      },
      {
        id: "step-in-4",
        stepNumber: "04",
        title: "Bespoke Furniture & Prop Staging",
        description: "Inpaint custom mid-century furniture, minimalist ceramics, and curated botanical stems with natural shadow integration.",
        tools: ["Adobe Photoshop", "ComfyUI Inpainting"],
        evidence: "Integrated bespoke travertine coffee table and linen drapery.",
        humanRole: "Interior styling and tactile prop curation"
      },
      {
        id: "step-in-5",
        stepNumber: "05",
        title: "Final Architectural Color Timing",
        description: "Correct lens distortion and apply subtle neutral warm color grade to preserve authentic wood and stone finishes.",
        tools: ["Lightroom", "Photoshop Camera Raw"],
        evidence: "Exported TIFF architectural suite matching RAL material color swatches.",
        humanRole: "Color accuracy certification and high-res print export"
      }
    ]
  }
];

/**
 * Returns a blank workflow template for creator editing
 */
export function createBlankWorkflow(creatorId, creatorSpecialty = "AI Beauty & Skincare") {
  return {
    id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    creatorId,
    title: "",
    description: "",
    specialization: creatorSpecialty || WORKFLOW_SPECIALIZATIONS[0],
    linkedProjectId: "",
    linkedProjectTitle: "",
    status: "Draft",
    visibility: "draft",
    isDemo: false,
    humanInvolvementNotes: "",
    updatedAt: "Just now",
    steps: [
      {
        id: `step-${Date.now()}-1`,
        stepNumber: "01",
        title: "Brief Analysis & Scope",
        description: "Understand the campaign objective, target audience, brand aesthetic guidelines, and deliverable specifications.",
        tools: ["Creative Brief", "Notion"],
        evidence: "",
        humanRole: "Creative interpretation and scope alignment"
      },
      {
        id: `step-${Date.now()}-2`,
        stepNumber: "02",
        title: "Concept Development & Moodboarding",
        description: "Establish the creative direction, visual compositions, lighting references, and artistic palette.",
        tools: ["Moodboard Suite", "Midjourney"],
        evidence: "",
        humanRole: "Art direction and visual curation"
      },
      {
        id: `step-${Date.now()}-3`,
        stepNumber: "03",
        title: "Generative Production & AI Pipeline",
        description: "Generate initial assets using selected generative models and custom latent workflows.",
        tools: ["Midjourney v6", "ComfyUI"],
        evidence: "",
        humanRole: "Prompt engineering, seed exploration, and latent curation"
      },
      {
        id: `step-${Date.now()}-4`,
        stepNumber: "04",
        title: "Refinement & Human-in-the-Loop Polish",
        description: "Refine compositions, inpaint localized elements, and retouch micro-details.",
        tools: ["Photoshop", "Inpainting"],
        evidence: "",
        humanRole: "Precision manual retouching and color calibration"
      },
      {
        id: `step-${Date.now()}-5`,
        stepNumber: "05",
        title: "Final Delivery & Quality Review",
        description: "Inspect against client specifications and export high-resolution master deliverables.",
        tools: ["Adobe Suite", "Cloud Storage"],
        evidence: "",
        humanRole: "Quality assurance and client package handoff"
      }
    ]
  };
}
