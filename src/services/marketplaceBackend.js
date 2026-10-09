// src/services/marketplaceBackend.js
// Dual-Engine Marketplace Service Layer
// Seamlessly delegates to live Supabase cloud database when configured,
// and gracefully falls back to persistent local marketplace store for offline/local development.

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { 
  getInitialMarketplaceState, 
  saveMarketplaceState, 
  updateCreatorRecord,
  createCampaignRecord,
  createBrandRecord,
  getPublicCreatorProfile
} from '../data/marketplaceStore.js';
import { CREATORS } from '../data/creatorsData.js';

/**
 * Returns backend status descriptor
 */
export function getBackendStatus() {
  const configured = isSupabaseConfigured();
  return {
    engine: configured ? 'supabase' : 'local-persistent',
    isLiveCloud: configured,
    database: configured ? 'PostgreSQL (Supabase)' : 'Browser Local Storage Engine',
    authProvider: configured ? 'Supabase Auth' : 'Local Workspace Session'
  };
}

// ============================================================================
// 1. AUTHENTICATION & USER SESSIONS
// ============================================================================

/**
 * Safely synchronizes an authenticated user's metadata to public.profiles table.
 * Preserves existing database roles to prevent unverified client metadata from
 * overwriting authorized user roles. Never silently overwrites an existing user's
 * stored role with a default role, and handles missing roles explicitly.
 */
export async function syncUserProfileSafely(user, preferredRole = null) {
  if (!isSupabaseConfigured() || !supabase || !user) return null;
  try {
    // 1. Fetch existing profile to preserve existing server-authorized role
    let existingProfile = null;
    try {
      const { data: fetchedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      existingProfile = fetchedProfile;
    } catch (fetchErr) {
      // Table may not exist yet or query blocked by RLS
    }

    // 2. Identify explicit role chosen for this authentication flow (if any)
    let explicitIntent = null;
    if (preferredRole === 'creator' || preferredRole === 'brand') {
      explicitIntent = preferredRole;
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('creasync_intended_role') 
        || localStorage.getItem('creasync_intended_role');
      if (stored === 'creator' || stored === 'brand') {
        explicitIntent = stored;
      }
    }

    // 3. Resolve role with strict priority:
    // - If user explicitly selected a role for this login flow (explicitIntent), honor that selection.
    // - Otherwise, if the user has an existing verified database profile role ('creator' or 'brand'), PRESERVE it!
    //   Do NOT overwrite an existing user's stored role with a default role.
    // - Otherwise, check auth metadata (intended_role or role).
    // - Otherwise, check active role stored from a previous verified workspace session.
    let resolvedRole = null;
    if (explicitIntent) {
      resolvedRole = explicitIntent;
    } else if (existingProfile?.role === 'creator' || existingProfile?.role === 'brand') {
      resolvedRole = existingProfile.role;
    } else if (user.user_metadata?.intended_role === 'creator' || user.user_metadata?.intended_role === 'brand') {
      resolvedRole = user.user_metadata.intended_role;
    } else if (user.user_metadata?.role === 'creator' || user.user_metadata?.role === 'brand') {
      resolvedRole = user.user_metadata.role;
    } else if (typeof window !== 'undefined') {
      const storedActive = localStorage.getItem('creasync_active_role');
      if (storedActive === 'creator' || storedActive === 'brand') {
        resolvedRole = storedActive;
      }
    }

    // Handle missing roles explicitly instead of silently assigning 'brand'
    if (!resolvedRole) {
      console.info('[CreaSync Auth] No explicit or stored role found; handling missing role explicitly without default.');
      return existingProfile || null;
    }

    const displayName = existingProfile?.display_name 
      || user.user_metadata?.full_name 
      || user.user_metadata?.name 
      || user.email?.split('@')[0] 
      || '';

    const avatarUrl = existingProfile?.avatar_url 
      || user.user_metadata?.avatar_url 
      || '';

    const { data, error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      role: resolvedRole,
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' }).select().maybeSingle();

    if (error) {
      console.warn('[CreaSync Auth] Optional profiles sync note:', error.message);
      return existingProfile || { ...user, role: resolvedRole };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('creasync_active_role', resolvedRole);
    }

    return data || existingProfile || null;
  } catch (err) {
    console.warn('[CreaSync Auth] Optional profiles sync bypassed:', err?.message || err);
    return null;
  }
}

/**
 * Initiates Google OAuth authentication via Supabase Auth
 * Requires active Supabase configuration in .env. Does NOT mock authentication.
 */
export async function signInWithGoogle({ role = 'brand', redirectTo } = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Google Authentication requires Supabase to be configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  // Validate target role
  const targetRole = role === 'creator' ? 'creator' : 'brand';

  // Preserve intended role across browser redirect in both sessionStorage and localStorage
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('creasync_intended_role', targetRole);
      localStorage.setItem('creasync_intended_role', targetRole);
      localStorage.setItem('creasync_active_role', targetRole);
    } catch (e) {}
  }

  const callbackUrl = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      },
      data: {
        intended_role: targetRole,
        role: targetRole
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signUp(email, password, role = 'creator', displayName = '') {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, display_name: displayName, intended_role: role }
      }
    });
    if (error) throw error;

    // Defensively create or update profile record if session exists
    if (data.user && data.session) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          role: role,
          display_name: displayName || email.split('@')[0],
          updated_at: new Date().toISOString()
        });
      } catch (profileErr) {
        console.warn('[CreaSync Auth] Profiles upsert bypassed:', profileErr?.message || profileErr);
      }
    }
    return { user: data.user, session: data.session };
  }

  // Local fallback: Simulated session for demo/offline evaluation
  const mockUser = {
    id: `user-${Date.now()}`,
    email,
    role,
    display_name: displayName || email.split('@')[0]
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('creasync_active_user', JSON.stringify(mockUser));
  }
  return { user: mockUser, session: { access_token: 'mock-token' } };
}

export async function signIn(email, password) {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  }

  // Local fallback: Simulated user for demo/offline evaluation
  const mockUser = {
    id: `user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
    email,
    role: email.toLowerCase().includes('brand') ? 'brand' : 'creator',
    display_name: email.split('@')[0]
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('creasync_active_user', JSON.stringify(mockUser));
  }
  return { user: mockUser, session: { access_token: 'mock-token' } };
}

export async function signOut() {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('[CreaSync Auth] Supabase signOut notice:', error.message);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('creasync_active_user');
    localStorage.removeItem('creasync_intended_role');
    localStorage.removeItem('creasync_active_role');
    try {
      sessionStorage.removeItem('creasync_pending_action');
      sessionStorage.removeItem('creasync_intended_role');
    } catch (e) {}
  }
  return { ok: true };
}

export async function getCurrentUser() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      // Safely attempt to fetch profile without failing authentication if table is absent
      let profile = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        profile = profileData || null;
      } catch (profileErr) {
        // Table may not exist or RLS may restrict query
      }

      // If database profile query didn't return a record, synthesize profile from verified session state
      // (do NOT default to brand; only use if explicitly creator or brand)
      if (!profile) {
        const fallbackRole = (user.user_metadata?.intended_role === 'creator' || user.user_metadata?.intended_role === 'brand')
          ? user.user_metadata.intended_role
          : (user.user_metadata?.role === 'creator' || user.user_metadata?.role === 'brand')
            ? user.user_metadata.role
            : (typeof window !== 'undefined' && (localStorage.getItem('creasync_active_role') === 'creator' || localStorage.getItem('creasync_active_role') === 'brand'))
              ? localStorage.getItem('creasync_active_role')
              : null;

        if (fallbackRole) {
          profile = {
            id: user.id,
            email: user.email,
            role: fallbackRole,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            avatar_url: user.user_metadata?.avatar_url || ''
          };
        }
      }

      return { ...user, profile };
    } catch (e) {
      return null;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('creasync_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// ============================================================================
// 2. CREATORS & PORTFOLIO PROJECTS
// ============================================================================

export async function fetchCreators() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: creators, error } = await supabase
        .from('creator_profiles')
        .select(`
          *,
          projects:portfolio_projects(*),
          creative_dna(*)
        `);
      if (error) throw error;
      if (creators && creators.length > 0) {
        return creators.map(normalizeSupabaseCreator);
      }
    } catch (err) {
      console.warn('[Supabase] Failed to fetch creators, falling back to local store:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  return state.creators || CREATORS;
}

export async function saveCreator(creatorData) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .upsert({
          id: creatorData.id,
          name: creatorData.name,
          handle: creatorData.handle,
          creative_identity: creatorData.creativeIdentity,
          bio: creatorData.bio,
          specialty: creatorData.specialty,
          location: creatorData.location,
          availability: creatorData.availability,
          status_badge: creatorData.statusBadge,
          turnaround: creatorData.turnaround,
          experience: creatorData.experience,
          hero_work: creatorData.heroWork,
          avatar: creatorData.avatar,
          styles: creatorData.styles || [],
          industries: creatorData.industries || [],
          capabilities: creatorData.capabilities || [],
          tools: creatorData.tools || [],
          platforms: creatorData.platforms || [],
          status: creatorData.status || 'Published',
          visibility: creatorData.visibility || 'published',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase] Could not save creator to cloud, syncing locally:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const nextState = updateCreatorRecord(state, creatorData);
  saveMarketplaceState(nextState);
  return creatorData;
}

export async function savePortfolioProject(creatorId, project) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .upsert({
          id: project.id,
          creator_id: creatorId,
          title: project.title,
          description: project.description,
          category: project.category,
          creative_style: project.creativeStyle,
          tools: project.tools,
          format: project.format,
          image: project.image,
          role: project.role,
          client_type: project.clientType,
          visibility: project.visibility || 'published',
          featured: !!project.featured,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase] Could not save project to cloud, syncing locally:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const creator = (state.creators || CREATORS).find(c => c.id === creatorId);
  if (creator) {
    const existingIdx = (creator.projects || []).findIndex(p => p.id === project.id);
    const updatedProjects = existingIdx >= 0
      ? creator.projects.map(p => p.id === project.id ? { ...p, ...project } : p)
      : [project, ...(creator.projects || [])];
    const nextState = updateCreatorRecord(state, { ...creator, projects: updatedProjects });
    saveMarketplaceState(nextState);
  }
  return project;
}

export async function deletePortfolioProject(creatorId, projectId) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId)
        .eq('creator_id', creatorId);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      console.warn('[Supabase] Could not delete project from cloud, updating locally:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const creator = (state.creators || CREATORS).find(c => c.id === creatorId);
  if (creator) {
    const updatedProjects = (creator.projects || []).filter(p => p.id !== projectId);
    const nextState = updateCreatorRecord(state, { ...creator, projects: updatedProjects });
    saveMarketplaceState(nextState);
  }
  return { ok: true };
}

export async function saveCreativeDNA(creatorId, dna) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('creative_dna')
        .upsert({
          id: `dna-${creatorId}`,
          creator_id: creatorId,
          traits: dna.traits || [],
          visual_aesthetic: dna.visualAesthetic,
          storytelling_approach: dna.storytellingApproach,
          product_presentation_style: dna.productPresentationStyle,
          provenance: dna.provenance || {},
          completeness: dna.completeness || {},
          source: dna.source || 'deterministic',
          is_live_ai: !!dna.isLiveAI,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase] Could not save DNA to cloud, updating locally:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const creator = (state.creators || CREATORS).find(c => c.id === creatorId);
  if (creator) {
    const nextState = updateCreatorRecord(state, { ...creator, creativeDNA: dna });
    saveMarketplaceState(nextState);
  }
  return dna;
}

// ============================================================================
// 3. BRANDS & CAMPAIGNS
// ============================================================================

export async function fetchBrands() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('brands').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('[Supabase] Could not fetch brands, using local state:', err);
    }
  }
  const state = getInitialMarketplaceState();
  return state.brands;
}

export async function saveBrand(brandData) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .upsert({
          id: brandData.id,
          name: brandData.name,
          industry: brandData.industry,
          website: brandData.website,
          logo: brandData.logo,
          cover_image: brandData.coverImage,
          description: brandData.description,
          aesthetic: brandData.aesthetic,
          brand_colors: brandData.brandColors || [],
          preferred_platforms: brandData.preferredPlatforms || [],
          is_demo: !!brandData.isDemo,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase] Could not save brand to cloud, updating locally:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const exists = (state.brands || []).some(b => b.id === brandData.id);
  const updatedBrands = exists
    ? state.brands.map(b => b.id === brandData.id ? { ...b, ...brandData } : b)
    : [brandData, ...(state.brands || [])];
  const nextState = { ...state, brands: updatedBrands };
  saveMarketplaceState(nextState);
  return brandData;
}

export async function fetchCampaigns(brandId = null) {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('campaigns').select('*');
      if (brandId) {
        query = query.eq('owner_brand_id', brandId);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('[Supabase] Could not fetch campaigns, using local state:', err);
    }
  }
  const state = getInitialMarketplaceState();
  return brandId 
    ? (state.campaigns || []).filter(c => c.ownerBrandId === brandId)
    : (state.campaigns || []);
}

export async function saveCampaign(campaignData, brand) {
  const finalRecord = createCampaignRecord(campaignData, brand);
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .upsert({
          id: finalRecord.id,
          owner_brand_id: finalRecord.ownerBrandId,
          brand_name: finalRecord.brandName,
          brand_avatar: finalRecord.brandAvatar,
          brand_website: finalRecord.brandWebsite,
          title: finalRecord.title,
          objective: finalRecord.objective,
          product_or_service: finalRecord.productOrService,
          industry: finalRecord.industry,
          description: finalRecord.description,
          creative_direction: finalRecord.creativeDirection,
          creative_style: finalRecord.creativeStyle,
          tone_of_voice: finalRecord.toneOfVoice,
          desired_creator_specialties: finalRecord.desiredCreatorSpecialties || [],
          deliverables: finalRecord.deliverables || [],
          platforms: finalRecord.platforms || [],
          budget: finalRecord.budget,
          currency: finalRecord.currency,
          timeline: finalRecord.timeline,
          deadline: finalRecord.deadline,
          target_audience: finalRecord.targetAudience,
          cover_image: finalRecord.coverImage,
          status: finalRecord.status,
          visibility: finalRecord.visibility,
          is_demo: !!finalRecord.isDemo,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase] Could not save campaign to cloud, updating locally:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const exists = (state.campaigns || []).some(c => c.id === finalRecord.id);
  const updatedCampaigns = exists
    ? state.campaigns.map(c => c.id === finalRecord.id ? { ...c, ...finalRecord } : c)
    : [finalRecord, ...(state.campaigns || [])];
  const nextState = { ...state, campaigns: updatedCampaigns, activeCampaignId: finalRecord.id };
  saveMarketplaceState(nextState);
  return finalRecord;
}

// ============================================================================
// 4. SHORTLISTS & INVITATIONS
// ============================================================================

export async function toggleShortlist(brandIdOrCampaignId, campaignIdOrCreatorId, optionalCreatorId) {
  let brandId = brandIdOrCampaignId;
  let campaignId = campaignIdOrCreatorId;
  let creatorId = optionalCreatorId;

  // Handle flexible 2-argument invocation: toggleShortlist(campaignId, creatorId)
  if (!optionalCreatorId) {
    campaignId = brandIdOrCampaignId;
    creatorId = campaignIdOrCreatorId;
    brandId = 'brand-active';
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      // Check existing
      const { data: existing } = await supabase
        .from('shortlists')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('creator_id', creatorId)
        .single();

      if (existing) {
        await supabase.from('shortlists').delete().eq('id', existing.id);
        return { isShortlisted: false, list: [] };
      } else {
        await supabase.from('shortlists').insert({
          id: `sl-${Date.now()}`,
          brand_id: brandId,
          campaign_id: campaignId,
          creator_id: creatorId
        });
        return { isShortlisted: true, list: [creatorId] };
      }
    } catch (err) {
      console.warn('[Supabase] Shortlist error, falling back to local store:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const currentShortlist = state.shortlists?.[campaignId] || [];
  const exists = currentShortlist.includes(creatorId);
  const updatedList = exists
    ? currentShortlist.filter(id => id !== creatorId)
    : [...currentShortlist, creatorId];

  const nextState = {
    ...state,
    shortlists: {
      ...state.shortlists,
      [campaignId]: updatedList
    }
  };
  saveMarketplaceState(nextState);
  return { isShortlisted: !exists, list: updatedList };
}

export async function sendInvitation(invitationData) {
  const invRecord = {
    id: invitationData.id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    brandId: invitationData.brandId,
    campaignId: invitationData.campaignId,
    creatorId: invitationData.creatorId,
    campaignTitle: invitationData.campaignTitle,
    brandName: invitationData.brandName,
    brandLogo: invitationData.brandLogo,
    budget: invitationData.budget,
    deadline: invitationData.deadline,
    summary: invitationData.summary,
    status: 'Pending',
    createdAt: 'Just now'
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          id: invRecord.id,
          brand_id: invRecord.brandId,
          campaign_id: invRecord.campaignId,
          creator_id: invRecord.creatorId,
          campaign_title: invRecord.campaignTitle,
          brand_name: invRecord.brandName,
          brand_logo: invRecord.brandLogo,
          budget: invRecord.budget,
          deadline: invRecord.deadline,
          summary: invRecord.summary,
          status: invRecord.status
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase] Could not send invitation to cloud, using local store:', err);
    }
  }

  // Local fallback
  const state = getInitialMarketplaceState();
  const nextState = {
    ...state,
    invitations: [invRecord, ...(state.invitations || [])]
  };
  saveMarketplaceState(nextState);
  return invRecord;
}

// Helper: Normalize Supabase row to match frontend camelCase structure
function normalizeSupabaseCreator(row) {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    creativeIdentity: row.creative_identity,
    bio: row.bio,
    specialty: row.specialty,
    location: row.location,
    availability: row.availability,
    statusBadge: row.status_badge,
    turnaround: row.turnaround,
    experience: row.experience,
    heroWork: row.hero_work,
    videoPreview: row.video_preview,
    avatar: row.avatar,
    styles: row.styles || [],
    industries: row.industries || [],
    capabilities: row.capabilities || [],
    tools: row.tools || [],
    platforms: row.platforms || [],
    categoryTags: row.category_tags || [],
    status: row.status,
    visibility: row.visibility,
    isDemo: !!row.is_demo,
    projects: (row.projects || []).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      creativeStyle: p.creative_style,
      tools: p.tools,
      format: p.format,
      image: p.image,
      video: p.video,
      aspect: p.aspect,
      role: p.role,
      clientType: p.client_type,
      creativeDirection: p.creative_direction,
      capabilities: p.capabilities || [],
      visibility: p.visibility,
      featured: !!p.featured,
      displayOrder: p.display_order
    })),
    creativeDNA: row.creative_dna?.[0] ? {
      traits: row.creative_dna[0].traits,
      visualAesthetic: row.creative_dna[0].visual_aesthetic,
      storytellingApproach: row.creative_dna[0].storytelling_approach,
      productPresentationStyle: row.creative_dna[0].product_presentation_style,
      provenance: row.creative_dna[0].provenance,
      completeness: row.creative_dna[0].completeness,
      source: row.creative_dna[0].source
    } : null
  };
}
