// src/intelligence/conceptEngine.js
// Dynamic CreaSim Concept Synthesizer
// Generates creator-specific creative concepts tailored to BOTH:
// 1. The campaign brief requirements (title, objective, product, industry, platforms)
// 2. The selected creator's documented Creator DNA (aesthetic, tools, storytelling approach)

import { generateCreatorDNA } from './creatorDNA.js';
import { defaultAIProvider } from '../ai/provider.js';

/**
 * Generates an explainable creative concept connecting a creator to a campaign
 */
export function generateCreatorConcept(campaign, creator) {
  if (!campaign || !creator) return null;

  const creatorDNA = generateCreatorDNA(creator);
  const cacheKey = `concept_${campaign.id}_${creator.id}`;

  return defaultAIProvider.analyze(cacheKey, `${campaign.title}:${creator.name}`, () => {
    return buildDeterministicConcept(campaign, creator, creatorDNA);
  });
}

function buildDeterministicConcept(campaign, creator, creatorDNA) {
  const cTitle = campaign.title || 'Creative Campaign';
  const cProduct = campaign.product || campaign.industry || 'Product';
  const cStyle = campaign.creativeStyle || 'Contemporary';
  const creatorFirst = creator.name.split(' ')[0];

  // Specific concept palettes based on creator aesthetic
  const palettePresets = {
    'maya-chen': ["#201A18", "#C89D7C", "#E3D5CA", "#8A5A44"],
    'elena-rostova': ["#141416", "#D8D4D5", "#F7F4EA", "#B5A895"],
    'zora-vance': ["#FAF8F5", "#DDE5B6", "#ADC178", "#6C584C"],
    'kai-sorenson': ["#111111", "#4A4E69", "#9A8C98", "#F2E9E4"],
    'alex-rivera': ["#0F1016", "#3A86FF", "#8338EC", "#FF006E"],
    'sophie-mercier': ["#1C1D21", "#E0B1CB", "#BE95C4", "#9F86C0"]
  };

  const palette = palettePresets[creator.id] || ["#1E1E24", "#92140C", "#FFF8F0", "#FFCF99"];

  // Concept Title tailored to product and creator style
  const conceptTitles = {
    'maya-chen': `“The Golden Hour Horizon: Natural Radiance & Quiet Intimacy”`,
    'elena-rostova': `“Hydraulic Silk: Fluid Sculpture & Weightless Caustics”`,
    'zora-vance': `“Cellular Luminescence: Sub-Surface Botanical Lipid Physics”`,
    'kai-sorenson': `“Zero-Gravity Suspension: Deconstructed Precision & Monolith Light”`,
    'alex-rivera': `“Kinetic Kinetic Velocity: 0.4s Rhythmic Volumetric Hooks”`,
    'sophie-mercier': `“Prismatic Refraction: Fine Crystal Dispersions & Solar Flare”`
  };

  const conceptTitle = conceptTitles[creator.id] || 
    `“${creatorDNA.visualAesthetic.split(',')[0]}: ${cTitle} Interpretation”`;

  // Storyboard sequences (3 sequential scenes)
  const storyboards = {
    'maya-chen': [
      {
        sceneNumber: 1,
        shotType: "Atmospheric Establishing",
        timing: "0:00 – 0:05",
        title: "The Awakening (Hook)",
        description: "Low-angle dawn sunlight filters through sheer Mediterranean curtains. Micro-caustics dance across a dewy morning vanity while soft ambient birdsong fades in.",
        focus: "Atmospheric establishing shot, 35mm optical lens flare."
      },
      {
        sceneNumber: 2,
        shotType: "Macro Slow-Motion Tracking",
        timing: "0:05 – 0:18",
        title: "Sensory Application (Interaction)",
        description: "Slow-motion macro tracking of the product formula contacting skin. The barrier texture visibly relaxes under warm 3200K side-lighting.",
        focus: "Tactile micro-texture, slow-burn emotional pacing."
      },
      {
        sceneNumber: 3,
        shotType: "Golden Hour Cinematic Hero",
        timing: "0:18 – 0:30",
        title: "Golden Hour Glow (Resolve)",
        description: "The subject steps out into direct golden hour sun. The skin catches clean ambient backlight, settling on a clean product lockup with organic typography.",
        focus: "Cinematic hero resolve with quiet luxury resonance."
      }
    ],
    'elena-rostova': [
      {
        sceneNumber: 1,
        shotType: "Weightless Fluid Simulation",
        timing: "0:00 – 0:04",
        title: "Fluid Sculpture (Hook)",
        description: "Translucent ivory silk organza billows in weightless zero-gravity fluid dynamics against an architectural Parisian limestone alcove.",
        focus: "High-contrast neoclassical draping and optical clarity."
      },
      {
        sceneNumber: 2,
        shotType: "Couture Macro Caustics",
        timing: "0:04 – 0:16",
        title: "Textile & Caustic Harmony",
        description: "The product bottle rests within sculptural silk folds. Water refractions project prismatic sunbeams through the bottle shoulders.",
        focus: "Haute couture material simulation & luxury styling."
      },
      {
        sceneNumber: 3,
        shotType: "Editorial Vogue Master",
        timing: "0:16 – 0:25",
        title: "Editorial Stillness",
        description: "A sweeping vertical camera pan frames the hero visual as an editorial print spread suitable for digital Vogue and campaign OOH.",
        focus: "Timeless French luxury maison aesthetic."
      }
    ],
    'zora-vance': [
      {
        sceneNumber: 1,
        shotType: "1000fps High-Speed Macro",
        timing: "0:00 – 0:04",
        title: "Micro-Droplet Impact (Hook)",
        description: "High-speed 1000fps capture of a single serum droplet striking a luminous botanical leaf surface, bursting into micro-droplet prisms.",
        focus: "Hyper-macro fluid physics and crystalline illumination."
      },
      {
        sceneNumber: 2,
        shotType: "Sub-Surface Cellular Diffusion",
        timing: "0:04 – 0:15",
        title: "Cellular Hydration Transition",
        description: "Close-up optical pass tracing cellular absorption across textured skin. Glass-skin luminescence visibly intensifies under clean daylight.",
        focus: "Authentic cosmetic skin texture without artificial over-smoothing."
      },
      {
        sceneNumber: 3,
        shotType: "9:16 Vertical Loop Lockup",
        timing: "0:15 – 0:25",
        title: "Radiant Macro Hero",
        description: "Seamless vertical looping frame showing the finished radiant skin surface alongside the flacon dripping in crystalline condensation.",
        focus: "Thumb-stopping 9:16 mobile loop with crisp audio viscosity."
      }
    ],
    'alex-rivera': [
      {
        sceneNumber: 1,
        shotType: "Exploded 3D Precision Macro",
        timing: "0:00 – 0:05",
        title: "Micro-Mechanical Disassembly (Hook)",
        description: "Zero-gravity levitation of precision titanium components, floating apart in mathematical synchrony with sapphire crystal refractive flares.",
        focus: "Hyper-real 3D spatial modeling and high-contrast studio rims."
      },
      {
        sceneNumber: 2,
        shotType: "Internal Waveform Acoustic Pass",
        timing: "0:05 – 0:18",
        title: "Spatial Acoustic Resonance",
        description: "Volumetric sound-wave particle simulation pulsing through the acoustic chambers, illuminated by cold cyan laser tracing.",
        focus: "Micro-geometry fidelity and fluid acoustic dynamics."
      },
      {
        sceneNumber: 3,
        shotType: "Industrial Lockup & Reassembly",
        timing: "0:18 – 0:30",
        title: "Obsidian Hero Lockup (Resolve)",
        description: "Components snap into place with satisfying mechanical tactile snap on a matte obsidian plinth. Cinematic typography fade.",
        focus: "Pristine commercial hardware key art for digital OOH."
      }
    ],
    'kai-sorenson': [
      {
        sceneNumber: 1,
        shotType: "Monolithic Shadow Reveal",
        timing: "0:00 – 0:05",
        title: "Architectural Silhouette (Hook)",
        description: "Deep obsidian shadows carved by a moving blade of raw tungsten light, slowly revealing the brushed magnesium contours of the hardware.",
        focus: "Minimalist Scandinavian brutalism and high dynamic range."
      },
      {
        sceneNumber: 2,
        shotType: "Extreme Knurled Detail",
        timing: "0:05 – 0:18",
        title: "Tactile Materiality",
        description: "Microscope-level glide across knurled volume dials and memory-foam acoustic seams with subtle grain and natural atmospheric haze.",
        focus: "Honest material texture and tactile acoustic engineering."
      },
      {
        sceneNumber: 3,
        shotType: "Sculptural Key Art Frame",
        timing: "0:18 – 0:30",
        title: "The Monolith (Resolve)",
        description: "A timeless, museum-grade sculptural frame placing the product in quiet architectural balance. Premium billboard ready.",
        focus: "Quiet luxury and authoritative industrial pedigree."
      }
    ]
  };

  const defaultStoryboard = [
    {
      sceneNumber: 1,
      shotType: "Dynamic Visual Hook",
      timing: "0:00 – 0:05",
      title: "Visual Hook",
      description: `Opening dynamic reveal establishing ${creatorDNA.visualAesthetic.split(',')[0]} mood and brand presence.`,
      focus: "High-impact visual engagement for modern feeds."
    },
    {
      sceneNumber: 2,
      shotType: "Core Visual Exploration",
      timing: "0:05 – 0:18",
      title: "Core Creative Exploration",
      description: `In-depth visual presentation exploring ${cProduct} with ${creatorDNA.productPresentationStyle}.`,
      focus: "Tactile fidelity and narrative cohesion."
    },
    {
      sceneNumber: 3,
      shotType: "Hero Lockup",
      timing: "0:18 – 0:30",
      title: "Hero Resolve",
      description: "Clean lockup showcasing key campaign deliverables and verified commercial finish.",
      focus: "Memorable brand recall."
    }
  ];

  const storyboard = storyboards[creator.id] || defaultStoryboard;

  // Narrative Description
  const narrative = `An art-directed visual interpretation of ${cTitle} by ${creator.name}. Leveraging ${creatorDNA.provenance.creatorProvided.toolsUsed.slice(0, 2).join(' and ')}, this direction bridges ${campaign.industry || 'the brand'} with ${creatorDNA.visualAesthetic.toLowerCase()}.`;

  // Why this concept fits this creator
  const fitExplanation = `${creatorFirst}'s verified portfolio demonstrates mastery in ${creatorDNA.traits.slice(0, 2).join(' and ')}, utilizing ${creatorDNA.tools[0] || 'advanced generative engines'}. This concept translates their documented ${creatorDNA.storytellingApproach} into an actionable campaign framework.`;

  return {
    id: `concept-${campaign.id}-${creator.id}`,
    campaignId: campaign.id,
    creatorId: creator.id,
    creatorName: creator.name,
    creatorRole: creator.creativeIdentity,
    creatorAvatar: creator.avatar,
    conceptTitle,
    directionLabel: creatorDNA.visualAesthetic.split(',')[0],
    visualAesthetic: creatorDNA.visualAesthetic,
    targetAesthetic: creatorDNA.visualAesthetic,
    storytellingApproach: creatorDNA.storytellingApproach,
    narrative,
    storyboard,
    recommendedFormat: creator.specialty === 'AI Video' ? '60s 4K Hero Film & 2x 9:16 Loops' : '4K Master Stills Suite (6 Visuals)',
    palette,
    estimatedTurnaround: creator.turnaround || '2 Weeks',
    sampleVisual: creator.projects?.[0]?.image || creator.heroWork,
    fitExplanation,
    disclaimer: `Concept Simulation: Synthesized from ${creator.name}'s verified Creator DNA and campaign brief parameters. Demonstrates artistic creative potential, not a pre-existing client deliverable.`
  };
}
