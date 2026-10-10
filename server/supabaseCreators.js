import { createClient } from '@supabase/supabase-js';

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || !url.startsWith('https://')) {
    return null;
  }

  return { url, key };
}

function normalizeCreator(row) {
  return {
    id: row.id,
    userId: row.user_id,
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
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    commercialLicensingVerified: row.commercial_licensing_verified !== undefined 
      ? Boolean(row.commercial_licensing_verified) 
      : (row.commercialLicensingVerified !== undefined ? Boolean(row.commercialLicensingVerified) : undefined),
    trustVerification: row.trust_verification || row.trustVerification || null,
    projects: (row.projects || []).map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      creativeStyle: project.creative_style,
      tools: project.tools,
      format: project.format,
      image: project.image,
      video: project.video,
      aspect: project.aspect,
      role: project.role,
      clientType: project.client_type,
      creativeDirection: project.creative_direction,
      capabilities: project.capabilities || [],
      media: project.media || [],
      workflowId: project.workflow_id,
      visibility: project.visibility,
      featured: Boolean(project.featured),
      displayOrder: project.display_order,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    })),
    creativeDNA: row.creative_dna?.[0] ? {
      traits: row.creative_dna[0].traits || [],
      visualAesthetic: row.creative_dna[0].visual_aesthetic,
      storytellingApproach: row.creative_dna[0].storytelling_approach,
      productPresentationStyle: row.creative_dna[0].product_presentation_style,
      provenance: row.creative_dna[0].provenance || {},
      completeness: row.creative_dna[0].completeness || {},
      source: row.creative_dna[0].source,
      isLiveAI: Boolean(row.creative_dna[0].is_live_ai)
    } : null,
    workflows: (row.workflows || []).map(workflow => ({
      id: workflow.id,
      creatorId: workflow.creator_id,
      title: workflow.title,
      description: workflow.description,
      specialization: workflow.specialization,
      linkedProjectId: workflow.linked_project_id,
      linkedProjectTitle: workflow.linked_project_title,
      status: workflow.status,
      visibility: workflow.visibility,
      humanInvolvementNotes: workflow.human_involvement_notes,
      steps: workflow.steps || [],
      isDemo: Boolean(workflow.is_demo)
    }))
  };
}

export async function fetchSupabaseCreators() {
  const config = getSupabaseConfig();

  if (!config) {
    return { configured: false, creators: [] };
  }

  const supabase = createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data, error } = await supabase
    .from('creator_profiles')
    .select(`
      *,
      projects:portfolio_projects(*),
      creative_dna(*),
      workflows:creator_workflows(*)
    `)
    .eq('visibility', 'published')
    .eq('status', 'Published');

  if (error) {
    throw new Error(`Supabase creator query failed: ${error.message}`);
  }

  return {
    configured: true,
    creators: (data || []).map(normalizeCreator)
  };
}
