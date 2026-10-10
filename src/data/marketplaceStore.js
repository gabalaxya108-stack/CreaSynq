// src/data/marketplaceStore.js
// Centralized, synchronized state management connecting Brand Studio and Creator Studio
// Enforces brand ownership, data isolation, public vs private visibility, and cross-tab real-time sync.

import { INITIAL_CONNECTIONS, INITIAL_CREATOR_OPPORTUNITIES, INITIAL_CREATOR_INVITATIONS, INITIAL_CREATOR_PROJECTS } from './connectionsData.js';
import { CREATORS } from './creatorsData.js';
import { DEMO_WORKFLOWS } from './workflowsData.js';
import { createInitialTrustVerification } from './trustVerificationData.js';

const STORAGE_KEY = 'creasync_marketplace_state_v2';

// ----------------------------------------------------
// 1. BRAND DEFINITIONS (Demo Brands + Initial Registry)
// ----------------------------------------------------
export const DEMO_BRANDS = [
  {
    id: "brand-demo-lumina",
    name: "Lumina Botanica",
    handle: "@luminabotanica",
    logo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
    industry: "Beauty & Skincare",
    website: "https://luminabotanica.co",
    description: "Pioneering organic cold-pressed botanicals for modern minimalist skincare rituals.",
    aesthetic: "Warm, Luminous & Organic",
    brandColors: ["#EB6E4B", "#FDF7ED", "#2E3A2F"],
    preferredPlatforms: ["Instagram", "TikTok", "Digital OOH"],
    isDemo: true
  },
  {
    id: "brand-demo-vanguard",
    name: "Vanguard Horology",
    handle: "@vanguard.watches",
    logo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    industry: "Consumer Tech & Hardware",
    website: "https://vanguardhorology.ch",
    description: "Swiss micro-machining and titanium escapements crafted for next-generation precision horology.",
    aesthetic: "Precise, Monochrome, Architectural",
    brandColors: ["#141312", "#A8A29E", "#7C3AED"],
    preferredPlatforms: ["YouTube", "Instagram", "Digital OOH"],
    isDemo: true
  }
];

// ----------------------------------------------------
// 2. CAMPAIGN DEFINITIONS WITH EXPLICIT OWNERSHIP
// ----------------------------------------------------
export const INITIAL_CAMPAIGNS = [
  {
    id: "camp-summer-skincare",
    ownerBrandId: "brand-demo-lumina",
    brandName: "Lumina Botanica",
    brandWebsite: "luminabotanica.co",
    brandAvatar: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80",
    title: "Summer Skincare & Radiant Hydration Launch",
    objective: "Product Launch",
    productOrService: "Botanical Barrier Restoration Serum",
    industry: "Beauty & Skincare",
    description: "We are launching our botanical barrier restoration serum. Looking for an AI creator who excels at macro fluid physics, radiant skin micro-textures, and warm Mediterranean sunlit aesthetics for digital editorial and vertical ads.",
    budget: "$5,000 – $10,000",
    currency: "USD",
    timeline: "2–3 Weeks",
    deadline: "Nov 20, 2026",
    targetAudience: "Aesthetic-conscious skincare enthusiasts aged 22–38",
    platforms: ["Instagram", "Digital OOH", "TikTok"],
    targetPlatforms: ["Instagram", "Digital OOH", "TikTok"],
    contentFormats: ["4K Stills Suite", "9:16 Vertical Loops"],
    creativeStyle: "Cinematic, Macro, Luminous",
    desiredCreatorSpecialties: ["AI Beauty", "Macro Viscosity", "AI Photography"],
    toneOfVoice: "Authentic, Warm, Editorial",
    deliverables: ["3x Key Campaign Stills (4K)", "2x Short-Form Kinetic Loops (9:16)", "Social Packaging Renders"],
    coverImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
    shortlist: ["elena-rostova", "zora-vance", "maya-chen"],
    status: "Active",
    visibility: "published", // 'draft' | 'published' | 'paused' | 'completed' | 'archived'
    createdAt: "2 days ago",
    updatedAt: "2 hours ago",
    isDemo: true
  },
  {
    id: "camp-vanguard-chrono",
    ownerBrandId: "brand-demo-vanguard",
    brandName: "Vanguard Horology",
    brandWebsite: "vanguardhorology.ch",
    brandAvatar: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80",
    title: "Titanium Kinetic Chrono Motion Series",
    objective: "Global Motion Teaser",
    productOrService: "Vanguard Kinetic Titanium Chronograph",
    industry: "Consumer Tech & Hardware",
    description: "Micro-machining exploded views, suspended titanium escapements, and minimal Scandinavian studio lighting for global digital launch.",
    budget: "$10,000 – $15,000",
    currency: "USD",
    timeline: "3 Weeks",
    deadline: "Dec 05, 2026",
    targetAudience: "Luxury horology collectors and industrial design enthusiasts",
    platforms: ["YouTube", "Instagram", "Digital OOH"],
    targetPlatforms: ["YouTube", "Instagram", "Digital OOH"],
    contentFormats: ["3D Kinetic Motion", "Macro Renders"],
    creativeStyle: "Minimal, Industrial, 3D Kinetic",
    desiredCreatorSpecialties: ["3D CGI", "AI Product Visuals", "Motion Design"],
    toneOfVoice: "Precise, Monochrome, Architectural",
    deliverables: ["1x Macro 3D Motion Pass", "1x Zero-Gravity Teaser Loop (15s)", "4x Monochromatic Key Stills"],
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    shortlist: ["kai-sorenson", "alex-rivera"],
    status: "Active",
    visibility: "published",
    createdAt: "3 days ago",
    updatedAt: "Yesterday",
    isDemo: true
  },
  {
    id: "camp-solis-fragrance",
    ownerBrandId: "brand-demo-lumina",
    brandName: "Lumina Botanica",
    brandWebsite: "luminabotanica.co",
    brandAvatar: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80",
    title: "Solar Amber Eau de Parfum Stills",
    objective: "Editorial Lookbook",
    productOrService: "Solar Amber Fragrance",
    industry: "Luxury & Fragrance",
    description: "Luminous amber flacon resting on warm volcanic stone, catching golden hour solar flares and dry botanical wisps.",
    budget: "$6,500 – $9,000",
    currency: "USD",
    timeline: "2 Weeks",
    deadline: "Nov 30, 2026",
    targetAudience: "Luxury perfume consumers",
    platforms: ["Vogue Editorial", "Instagram"],
    targetPlatforms: ["Vogue Editorial", "Instagram"],
    contentFormats: ["Editorial Stills", "Refraction Loops"],
    creativeStyle: "Luxury, Ethereal, Golden Hour",
    desiredCreatorSpecialties: ["AI Fashion", "AI Photography"],
    toneOfVoice: "Evocative, Tactile, Poetic",
    deliverables: ["Refractive Glass Caustic Stills", "Editorial Print Spreads", "Slow-Motion Mist Reveal"],
    coverImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    shortlist: ["sophie-mercier"],
    status: "Draft",
    visibility: "draft",
    createdAt: "1 week ago",
    updatedAt: "3 days ago",
    isDemo: true
  },
  {
    id: "camp-aether-nomad",
    ownerBrandId: "brand-demo-vanguard",
    brandName: "Vanguard Horology",
    brandWebsite: "vanguardhorology.ch",
    brandAvatar: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80",
    title: "AETHER Nomad Technical Carry Series",
    objective: "Brand Film & Lookbook",
    productOrService: "Nomad Precision Backpack",
    industry: "Lifestyle & Apparel",
    description: "Technical commuter waterproof carry film with 35mm grain and authentic street aesthetic.",
    budget: "$9,000",
    currency: "USD",
    timeline: "Completed",
    deadline: "Oct 15, 2026",
    targetAudience: "Urban minimalists & creative travelers",
    platforms: ["Instagram", "TikTok", "Vimeo"],
    targetPlatforms: ["Instagram", "TikTok", "Vimeo"],
    contentFormats: ["60s Anamorphic Film", "8 Narrative Stills"],
    creativeStyle: "Cinematic 35mm, Documentary",
    desiredCreatorSpecialties: ["AI Video", "Documentary"],
    toneOfVoice: "Raw, Energetic, Human",
    deliverables: ["60s Anamorphic Film", "8 Narrative Stills"],
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    shortlist: ["maya-chen"],
    status: "Completed",
    visibility: "completed",
    createdAt: "3 weeks ago",
    updatedAt: "1 week ago",
    isDemo: true
  }
];

// ----------------------------------------------------
// 3. INVITATIONS WITH EXPLICIT BRAND & CAMPAIGN IDS
// ----------------------------------------------------
export const INITIAL_BRAND_INVITATIONS = [
  {
    id: "inv-lumina-01",
    brandId: "brand-demo-lumina",
    campaignId: "camp-summer-skincare",
    campaignTitle: "Summer Skincare & Radiant Hydration Launch",
    brandName: "Lumina Botanica",
    brandAvatar: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=120&q=80",
    creatorId: "maya-chen",
    creatorName: "Maya Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    title: "Summer Skincare & Radiant Hydration Launch",
    budget: "$7,500",
    timeline: "3 Weeks",
    deliverables: "3x 4K Hero Key Visuals + 2x 9:16 Vertical Kinetic Loops",
    summary: "Direct invitation from Lumina Creative Director: We loved your cinematic lighting and macro fluid experiments. We'd love to commission key art for our upcoming barrier serum launch.",
    status: "accepted", // 'pending' | 'accepted' | 'declined'
    createdAt: "2 days ago",
    isDemo: true
  },
  {
    id: "inv-vanguard-02",
    brandId: "brand-demo-vanguard",
    campaignId: "camp-vanguard-chrono",
    campaignTitle: "Titanium Kinetic Chrono Motion Series",
    brandName: "Vanguard Horology",
    brandAvatar: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80",
    creatorId: "kai-sorenson",
    creatorName: "Kai Sorenson",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    title: "Titanium Kinetic Chrono Motion Series",
    budget: "$12,000",
    timeline: "4 Weeks",
    deliverables: "1x 45s Anamorphic Teaser + 6x High-Contrast 3D Stills",
    summary: "Direct brief: Suspended titanium escapement passes and exploded mechanical views for global digital campaign.",
    status: "pending",
    createdAt: "Yesterday",
    isDemo: true
  }
];

// ----------------------------------------------------
// 4. COLLABORATION PROJECTS WITH BRAND & CAMPAIGN IDS
// ----------------------------------------------------
export const INITIAL_COLLAB_PROJECTS = [
  {
    id: "proj-lumina-active",
    brandId: "brand-demo-lumina",
    campaignId: "camp-summer-skincare",
    campaignTitle: "Summer Skincare & Radiant Hydration Launch",
    brandName: "Lumina Botanica",
    brandContact: "Sophie Laurent (Creative Director)",
    creatorId: "maya-chen",
    creatorName: "Maya Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    status: "submitted", // 'in-progress' | 'submitted' | 'revision-requested' | 'approved' | 'completed'
    progressPercent: 85,
    milestone: "Milestone 2 of 3: Refined 4K Color Grading & Fluid Physics",
    deadline: "Nov 12, 2026",
    agreedBudget: "$7,500",
    deliverablesScope: "Key Campaign Stills (4K) & Kinetic Loops",
    latestFeedback: "“Deliverables submitted for review! Previews ready for creative director sign-off.”",
    submissionUrl: "https://creasync.storage/lumina-botanica-v2-masters.zip",
    submissionNotes: "Delivered 3x 4K high-res master renders with warm 3200K ambient grading and organic fluid caustics.",
    submissionPreviews: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
    ],
    feedbackHistory: [
      {
        id: "fb-1",
        author: "Sophie Laurent (Creative Director)",
        role: "brand",
        text: "“The droplet caustics in render 3 are breathtaking. Can we warm the ambient lighting slightly towards 3200K?”",
        timestamp: "Yesterday, 4:20 PM"
      }
    ],
    revisionHistory: [],
    createdAt: "5 days ago",
    updatedAt: "Yesterday",
    isDemo: true
  },
  {
    id: "proj-nomad-completed",
    brandId: "brand-demo-vanguard",
    campaignId: "camp-aether-nomad",
    campaignTitle: "AETHER Nomad Technical Carry Series",
    brandName: "Vanguard Horology",
    brandContact: "Marcus Vance (Brand Lead)",
    creatorId: "maya-chen",
    creatorName: "Maya Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    progressPercent: 100,
    milestone: "Final Milestone: All Master Assets Approved",
    deadline: "Completed",
    agreedBudget: "$9,000",
    deliverablesScope: "60s Brand Film + 8 Narrative Stills",
    latestFeedback: "“Outstanding work. Approved and released final milestone payout. Thank you Maya!”",
    submissionUrl: "https://creasync.storage/aether-nomad-final-masters.zip",
    submissionNotes: "Delivered 4K ProRes 422 HQ + uncompressed 16-bit TIFF stills.",
    submissionPreviews: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    ],
    feedbackHistory: [
      {
        id: "fb-nomad-1",
        author: "Marcus Vance",
        role: "brand",
        text: "“Final cuts look sensational. Exactly the mood we envisioned.”",
        timestamp: "3 weeks ago"
      }
    ],
    revisionHistory: [],
    createdAt: "3 weeks ago",
    updatedAt: "1 week ago",
    isDemo: true
  }
];

// ----------------------------------------------------
// 5. CONNECTIONS / MESSAGES WITH BRAND OWNERSHIP
// ----------------------------------------------------
export const INITIAL_BRAND_CONNECTIONS = [
  {
    id: "conn-maya-skincare",
    brandId: "brand-demo-lumina",
    campaignId: "camp-summer-skincare",
    campaignTitle: "Summer Skincare & Radiant Hydration Launch",
    brandName: "Lumina Botanica",
    creatorId: "maya-chen",
    creatorName: "Maya Chen",
    creatorRole: "Cinematic AI Director & Visual Worldbuilder",
    creatorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    creatorVisual: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=85",
    status: "connected",
    createdAt: "2 days ago",
    connectedAt: "Yesterday",
    messages: [
      {
        id: "msg-1",
        sender: "brand",
        senderName: "Lumina Botanica",
        text: "Hi Maya, we loved your cinematic product work. We'd love to explore this direction for our summer launch.",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "msg-2",
        sender: "creator",
        senderName: "Maya Chen",
        text: "Thanks! I'd love to work on it. I'm especially interested in the visual storytelling direction and warm Mediterranean sunlight.",
        timestamp: "Today, 10:15 AM"
      }
    ],
    isDemo: true
  },
  {
    id: "conn-elena-skincare",
    brandId: "brand-demo-lumina",
    campaignId: "camp-summer-skincare",
    campaignTitle: "Summer Skincare & Radiant Hydration Launch",
    brandName: "Lumina Botanica",
    creatorId: "elena-rostova",
    creatorName: "Elena Rostova",
    creatorRole: "AI Fashion Director & Haute Couture Stylist",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    creatorVisual: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    status: "connected",
    createdAt: "1 day ago",
    connectedAt: "Today",
    messages: [
      {
        id: "msg-elena-1",
        sender: "brand",
        senderName: "Lumina Botanica",
        text: "Elena, your neoclassical silk and light work is breathtaking. We want that exact organic fluid elegance for our hydration serum key art.",
        timestamp: "Yesterday, 5:20 PM"
      },
      {
        id: "msg-elena-2",
        sender: "creator",
        senderName: "Elena Rostova",
        text: "Thank you! I envision translucent raw organza caustics floating through sunlit water droplets. Let's make it extraordinary.",
        timestamp: "Today, 11:30 AM"
      }
    ],
    isDemo: true
  }
];

// ----------------------------------------------------
// 6. INITIAL STATE & PERSISTENCE ENGINE
// ----------------------------------------------------
export function getInitialMarketplaceState() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.campaigns) && Array.isArray(parsed.brands)) {
          // Ensure creators array is present and normalized
          if (!Array.isArray(parsed.creators) || parsed.creators.length === 0) {
            parsed.creators = CREATORS;
          }
          // Ensure workflows array exists
          if (!Array.isArray(parsed.workflows) || parsed.workflows.length === 0) {
            parsed.workflows = DEMO_WORKFLOWS;
          }
          // Ensure creators array is present and normalized with workflows and trust verification
          parsed.creators = parsed.creators.map(c => {
            let updatedC = { ...c };
            if (!Array.isArray(updatedC.workflows) || updatedC.workflows.length === 0) {
              const matchedWfs = (parsed.workflows || DEMO_WORKFLOWS).filter(w => w.creatorId === updatedC.id);
              updatedC.workflows = matchedWfs;
            }
            if (!updatedC.trustVerification) {
              updatedC.trustVerification = createInitialTrustVerification(updatedC);
            }
            return updatedC;
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using seed defaults:', e);
    }
  }

  const initialCreators = CREATORS.map(c => ({
    ...c,
    workflows: DEMO_WORKFLOWS.filter(w => w.creatorId === c.id),
    trustVerification: createInitialTrustVerification(c)
  }));

  return {
    brands: DEMO_BRANDS,
    activeBrandId: DEMO_BRANDS[0].id,
    isDemoMode: true,
    creators: initialCreators,
    workflows: DEMO_WORKFLOWS,
    activeCreatorId: initialCreators[0].id,
    myCreatorId: null,
    campaigns: INITIAL_CAMPAIGNS,
    activeCampaignId: INITIAL_CAMPAIGNS[0].id,
    projects: INITIAL_COLLAB_PROJECTS,
    invitations: INITIAL_BRAND_INVITATIONS,
    connections: INITIAL_BRAND_CONNECTIONS,
    opportunities: INITIAL_CREATOR_OPPORTUNITIES,
    shortlists: {
      "camp-summer-skincare": ["elena-rostova", "zora-vance", "maya-chen"],
      "camp-vanguard-chrono": ["kai-sorenson", "alex-rivera"],
      "camp-solis-fragrance": ["sophie-mercier"],
      "camp-aether-nomad": ["maya-chen"]
    }
  };
}

/**
 * Returns brand-facing public view of a creator, strictly filtering out private portfolio items and draft workflows
 * Also sanitizes trust verification to NEVER leak private identity documents or internal reviewer notes
 */
export function getPublicCreatorProfile(creator) {
  if (!creator) return null;
  const isDraft = creator.status === 'Draft' || creator.visibility === 'draft' || creator.visibility === 'private';
  const publishedProjects = (creator.projects || []).filter(p => p.visibility !== 'private');
  // Brands have read-only access to published workflows only
  const publishedWorkflows = (creator.workflows || []).filter(w => 
    (w.visibility === 'published' || w.status === 'Published') && w.visibility !== 'private'
  );

  // Sanitize trust verification: strip private government document IDs and private compliance details
  let sanitizedTrust = null;
  if (creator.trustVerification) {
    sanitizedTrust = {
      ...creator.trustVerification,
      identity: creator.trustVerification.identity ? {
        status: creator.trustVerification.identity.status,
        provider: creator.trustVerification.identity.provider,
        legalName: creator.trustVerification.identity.legalName,
        issuingCountry: creator.trustVerification.identity.issuingCountry,
        documentType: creator.trustVerification.identity.documentType,
        // documentMaskedNumber and private files are explicitly stripped for brand privacy!
        reviewedAt: creator.trustVerification.identity.reviewedAt,
        isPrivate: true
      } : null
    };
  }

  return {
    ...creator,
    isDraft,
    projects: publishedProjects,
    workflows: publishedWorkflows,
    trustVerification: sanitizedTrust
  };
}

/**
 * Updates or adds a creator record in marketplace state
 */
export function updateCreatorRecord(state, updatedCreator) {
  if (!updatedCreator || !updatedCreator.id) return state;
  const currentCreators = state.creators && state.creators.length > 0 ? state.creators : CREATORS;
  const exists = currentCreators.some(c => c.id === updatedCreator.id);
  const updatedCreators = exists
    ? currentCreators.map(c => c.id === updatedCreator.id ? { ...c, ...updatedCreator } : c)
    : [updatedCreator, ...currentCreators];
  return {
    ...state,
    creators: updatedCreators
  };
}

/**
 * Saves or updates a creative workflow for a specific creator
 */
export function saveWorkflowRecord(state, creatorId, workflowData) {
  if (!creatorId || !workflowData || !workflowData.id) return state;

  const currentWorkflows = state.workflows || [];
  const existingWfIndex = currentWorkflows.findIndex(w => w.id === workflowData.id);
  const updatedWorkflows = existingWfIndex >= 0
    ? currentWorkflows.map(w => w.id === workflowData.id ? { ...w, ...workflowData, updatedAt: 'Just now' } : w)
    : [{ ...workflowData, updatedAt: 'Just now' }, ...currentWorkflows];

  // Update in creator record as well
  const currentCreators = state.creators || CREATORS;
  const updatedCreators = currentCreators.map(c => {
    if (c.id === creatorId) {
      const cWfs = c.workflows || [];
      const cIdx = cWfs.findIndex(w => w.id === workflowData.id);
      const nextCWfs = cIdx >= 0
        ? cWfs.map(w => w.id === workflowData.id ? { ...w, ...workflowData, updatedAt: 'Just now' } : w)
        : [{ ...workflowData, updatedAt: 'Just now' }, ...cWfs];
      return { ...c, workflows: nextCWfs };
    }
    return c;
  });

  return {
    ...state,
    workflows: updatedWorkflows,
    creators: updatedCreators
  };
}

/**
 * Deletes a workflow belonging to a creator
 */
export function deleteWorkflowRecord(state, creatorId, workflowId) {
  if (!creatorId || !workflowId) return state;

  const updatedWorkflows = (state.workflows || []).filter(w => w.id !== workflowId);
  const updatedCreators = (state.creators || CREATORS).map(c => {
    if (c.id === creatorId) {
      return {
        ...c,
        workflows: (c.workflows || []).filter(w => w.id !== workflowId)
      };
    }
    return c;
  });

  return {
    ...state,
    workflows: updatedWorkflows,
    creators: updatedCreators
  };
}

/**
 * Toggles published vs draft status for a workflow
 */
export function toggleWorkflowPublishRecord(state, creatorId, workflowId) {
  if (!creatorId || !workflowId) return state;

  let nextVisibility = 'published';
  let nextStatus = 'Published';

  const updatedWorkflows = (state.workflows || []).map(w => {
    if (w.id === workflowId) {
      const isCurrentlyPub = w.visibility === 'published' || w.status === 'Published';
      nextVisibility = isCurrentlyPub ? 'draft' : 'published';
      nextStatus = isCurrentlyPub ? 'Draft' : 'Published';
      return { ...w, visibility: nextVisibility, status: nextStatus, updatedAt: 'Just now' };
    }
    return w;
  });

  const updatedCreators = (state.creators || CREATORS).map(c => {
    if (c.id === creatorId) {
      return {
        ...c,
        workflows: (c.workflows || []).map(w => {
          if (w.id === workflowId) {
            return { ...w, visibility: nextVisibility, status: nextStatus, updatedAt: 'Just now' };
          }
          return w;
        })
      };
    }
    return c;
  });

  return {
    ...state,
    workflows: updatedWorkflows,
    creators: updatedCreators
  };
}

/**
 * Persists state to localStorage and fires cross-component and cross-tab events
 */
export function saveMarketplaceState(state) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('creasync_store_change', { detail: state }));
    } catch (e) {
      console.warn('Could not persist to localStorage:', e);
    }
  }
}

/**
 * Subscribes to real-time state changes (intra-tab and cross-tab storage events)
 */
export function subscribeToMarketplace(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (err) {
        console.warn('Failed to parse cross-tab storage event:', err);
      }
    }
  };

  const handleCustom = (e) => {
    if (e.detail) {
      callback(e.detail);
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('creasync_store_change', handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('creasync_store_change', handleCustom);
  };
}

export function resetMarketplaceState() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('creasync_marketplace_state_v1');
    } catch (e) {}
  }
  const defaultState = getInitialMarketplaceState();
  saveMarketplaceState(defaultState);
  return defaultState;
}

// ----------------------------------------------------
// 7b. CREATOR ONBOARDING DRAFT (local-only, unpublished scratch data)
// ----------------------------------------------------

const ONBOARDING_DRAFT_KEY = 'creasync_creator_onboarding_draft_v1';

/**
 * Loads an unfinished creator onboarding draft.
 * Returns null when the draft is absent, unparseable, or structurally invalid.
 * Drafts are local scratch data and stay separate from published creator records.
 */
export function loadCreatorOnboardingDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const { profileData, dnaResult } = parsed;
    if (profileData !== undefined && profileData !== null && (typeof profileData !== 'object' || Array.isArray(profileData))) {
      return null;
    }
    const step = Number(parsed.currentStep);
    return {
      currentStep: Number.isFinite(step) ? Math.min(8, Math.max(1, Math.round(step))) : 1,
      profileData: (profileData && typeof profileData === 'object') ? profileData : null,
      dnaResult: (dnaResult && typeof dnaResult === 'object' && !Array.isArray(dnaResult)) ? dnaResult : null
    };
  } catch (e) {
    console.warn('Could not read creator onboarding draft, ignoring it:', e);
    return null;
  }
}

/**
 * Persists unfinished onboarding progress in local browser storage only.
 * Never stores credentials, tokens, or authentication data.
 */
export function saveCreatorOnboardingDraft({ currentStep, profileData, dnaResult }) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      currentStep: currentStep || 1,
      profileData: profileData || null,
      dnaResult: dnaResult || null,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not persist creator onboarding draft:', e);
  }
}

/**
 * Removes the onboarding draft (called after successful publication).
 */
export function clearCreatorOnboardingDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch (e) {}
}

// ----------------------------------------------------
// 8. UNIFIED STORE ACTIONS (CAMPAIGNS & BRANDS)
// ----------------------------------------------------

/**
 * Creates a new campaign with strict brand ownership and consistent schema
 */
export function createCampaignRecord(campaignData, brand) {
  const brandId = brand?.id || campaignData.ownerBrandId || DEMO_BRANDS[0].id;
  const brandName = brand?.name || campaignData.brandName || "Brand Partner";
  const brandAvatar = brand?.logo || campaignData.brandAvatar || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80";
  const brandWebsite = brand?.website || campaignData.brandWebsite || "brand.co";

  const visibility = campaignData.visibility || (campaignData.status === 'Draft' ? 'draft' : 'published');
  const status = campaignData.status || (visibility === 'draft' ? 'Draft' : 'Active');

  // Normalize deliverables
  let deliverables = campaignData.deliverables || [];
  if (typeof deliverables === 'string') {
    deliverables = deliverables.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(deliverables) || deliverables.length === 0) {
    deliverables = ['Key Campaign Visuals'];
  }

  // Normalize platforms
  let platforms = campaignData.platforms || campaignData.targetPlatforms || [];
  if (typeof platforms === 'string') {
    platforms = platforms.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(platforms) || platforms.length === 0) {
    platforms = ['Instagram'];
  }

  return {
    id: campaignData.id || `camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ownerBrandId: brandId,
    brandName,
    brandAvatar,
    brandWebsite,
    title: campaignData.title || `${brandName} Campaign`,
    objective: campaignData.objective || "Product Launch",
    productOrService: campaignData.productOrService || campaignData.title || "",
    industry: campaignData.industry || brand?.industry || "Creative & Media",
    description: campaignData.description || campaignData.creativeDirection || "",
    desiredCreatorSpecialties: campaignData.desiredCreatorSpecialties || campaignData.specialties || ["AI Creative Direction"],
    creativeDirection: campaignData.creativeDirection || campaignData.description || "",
    creativeStyle: campaignData.creativeStyle || "Contemporary Editorial",
    toneOfVoice: campaignData.toneOfVoice || "Authentic & Premium",
    deliverables,
    platforms,
    targetPlatforms: platforms,
    contentFormats: campaignData.contentFormats || ["4K Stills Suite"],
    budget: campaignData.budget || "In Discussion",
    currency: campaignData.currency || "USD",
    timeline: campaignData.timeline || campaignData.deadline || "Flexible",
    deadline: campaignData.deadline || campaignData.timeline || "TBD",
    targetAudience: campaignData.targetAudience || campaignData.audience || "Modern consumers",
    coverImage: campaignData.coverImage || brand?.coverImage || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
    shortlist: campaignData.shortlist || [],
    status,
    visibility,
    createdAt: "Just now",
    updatedAt: "Just now",
    isDemo: !!brand?.isDemo
  };
}

/**
 * Creates a new brand profile record
 */
export function createBrandRecord(brandData) {
  const brandName = brandData.name || brandData.brandName || "My Brand";
  const brandId = brandData.id || `brand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const handle = brandData.handle || `@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  return {
    id: brandId,
    name: brandName,
    handle,
    logo: brandData.logo || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80",
    coverImage: brandData.coverImage || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
    industry: brandData.industry || "Creative & Media",
    website: brandData.website || "",
    description: brandData.description || "",
    aesthetic: brandData.aesthetic || brandData.aestheticPreference || "Refined & Modern",
    brandColors: brandData.brandColors || ["#EB6E4B", "#FDF7ED", "#2E3A2F"],
    preferredPlatforms: brandData.preferredPlatforms || ["Instagram", "Digital OOH"],
    isDemo: false
  };
}

// ----------------------------------------------------
// 9. BRAND DATA ISOLATION SELECTORS
// ----------------------------------------------------

/**
 * Derives data isolated strictly to the given brandId
 */
export function getBrandScopedData(state, brandId, isDemoMode = false) {
  const brands = state.brands || DEMO_BRANDS;
  let currentBrand = brands.find(b => b.id === brandId);
  if (!currentBrand && brandId && brandId.startsWith('brand-') && brandId !== 'brand-demo-lumina') {
    const rawName = brandId.replace(/^brand-/, '').replace(/-/g, ' ');
    currentBrand = {
      id: brandId,
      name: rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Brand Studio',
      industry: 'Creative & Digital',
      description: 'Private studio workspace.',
      aesthetic: 'Modern & Editorial',
      isDemo: false
    };
  }
  if (!currentBrand) {
    currentBrand = DEMO_BRANDS[0];
  }

  // Strict Brand Isolation:
  // In real brand mode, ONLY campaigns owned by this specific brandId
  const campaigns = (state.campaigns || []).filter(c => c.ownerBrandId === currentBrand.id);

  // Active campaign must strictly belong to this brand
  const activeCampaign = (state.activeCampaignId && campaigns.find(c => c.id === state.activeCampaignId)) || campaigns[0] || null;

  // Invitations strictly belonging to this brand
  const invitations = (state.invitations || []).filter(inv => 
    inv.brandId === currentBrand.id || (campaigns.length > 0 && campaigns.some(c => c.id === inv.campaignId))
  );

  // Collaborations / Projects strictly belonging to this brand
  const projects = (state.projects || []).filter(p => 
    p.brandId === currentBrand.id || (campaigns.length > 0 && campaigns.some(c => c.id === p.campaignId))
  );

  // Messaging connections strictly belonging to this brand
  const connections = (state.connections || []).filter(conn => 
    conn.brandId === currentBrand.id || (campaigns.length > 0 && campaigns.some(c => c.id === conn.campaignId))
  );

  // Brand-scoped shortlists strictly belonging to this brand's campaigns
  const shortlists = {};
  campaigns.forEach(c => {
    if (state.shortlists && state.shortlists[c.id]) {
      shortlists[c.id] = state.shortlists[c.id];
    }
  });

  return {
    currentBrand,
    campaigns,
    activeCampaign,
    invitations,
    projects,
    connections,
    shortlists
  };
}

/**
 * Derives public opportunities visible to creators in the marketplace
 * Strictly excludes private drafts and paused campaigns!
 */
export function getPublicCreatorOpportunities(state) {
  const publishedCampaignOpps = (state.campaigns || [])
    .filter(c => (c.visibility === 'published' || c.status === 'Active') && c.visibility !== 'draft' && c.visibility !== 'archived')
    .map(c => ({
      id: `opp-${c.id}`,
      campaignId: c.id,
      brand: c.brandName,
      title: c.title,
      budget: c.budget || 'In Discussion',
      timeline: c.timeline || c.deadline || 'Standard Production',
      creativeDirection: c.creativeStyle || c.description,
      requirements: Array.isArray(c.deliverables) ? c.deliverables : [c.deliverables || 'Production Assets'],
      whyItFits: `Direct opportunity published by ${c.brandName} for creators with relevant visual styles.`,
      status: 'new'
    }));

  // Combine with initial opportunities, deduplicating by campaignId
  const initialOpps = state.opportunities || INITIAL_CREATOR_OPPORTUNITIES;
  const campaignIdsSeen = new Set(publishedCampaignOpps.map(o => o.campaignId));
  
  const additionalOpps = initialOpps.filter(o => !campaignIdsSeen.has(o.campaignId));
  return [...publishedCampaignOpps, ...additionalOpps];
}


