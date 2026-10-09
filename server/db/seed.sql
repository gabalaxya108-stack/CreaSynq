-- ============================================================================
-- CREASYNC SEED SCRIPT (PostgreSQL / Supabase)
-- Seeds initial curated creators, demo brands, and sample campaigns
-- ============================================================================

-- 1. Insert Initial Demo Brands
INSERT INTO public.brands (
  id, name, industry, website, logo, cover_image, description, aesthetic, brand_colors, preferred_platforms, is_demo
) VALUES 
(
  'brand-demo-lumina',
  'Lumina Botanica',
  'Beauty & Skincare',
  'luminabotanica.com',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
  'High-performance botanical skincare formulations engineered with plant stem cells.',
  'Luminous, Dewy & Ethereal',
  ARRAY['#EB6E4B', '#FDF7ED', '#2E3A2F'],
  ARRAY['Instagram', 'Digital OOH', 'Vogue Editorial'],
  TRUE
),
(
  'brand-demo-vanguard',
  'Vanguard Horology',
  'Luxury & Watches',
  'vanguardhorology.ch',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
  'Precision avant-garde mechanical timepieces forged from aerospace-grade titanium.',
  'Minimalist Titanium & High-Contrast Shadow',
  ARRAY['#141312', '#E5E5E5', '#3B82F6'],
  ARRAY['Instagram', 'YouTube 4K', 'Monocle'],
  TRUE
),
(
  'brand-demo-solis',
  'Solis Living',
  'Architecture & Design',
  'solisliving.design',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  'Biophilic architectural furniture and conscious interior environments.',
  'Warm Natural Woods & Golden Hour Light',
  ARRAY['#D97706', '#F59E0B', '#FDF7ED'],
  ARRAY['Architectural Digest', 'Instagram', 'Pinterest'],
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Maya Chen Creator Profile
INSERT INTO public.creator_profiles (
  id, name, handle, creative_identity, bio, specialty, location, availability, status_badge,
  turnaround, experience, hero_work, avatar, styles, industries, capabilities, tools, platforms,
  category_tags, status, visibility, is_demo
) VALUES (
  'maya-chen',
  'Maya Chen',
  '@mayachen.ai',
  'Cinematic AI Director & Visual Worldbuilder',
  'Directing cinematic narrative commercials, evocative brand mythologies, and cinematic product worlds. Combining 35mm anamorphic grain, Wong Kar-wai color poetry, and Denis Villeneuve scale in generative cinema.',
  'AI Video',
  'London / New York (GMT/EST)',
  'Available for projects',
  'Available now',
  '48h concept boards',
  '4 years AI-native cinema',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  ARRAY['Cinematic', 'Editorial', 'Story-driven', 'Luxury'],
  ARRAY['Beauty & Skincare', 'Luxury & High Fashion', 'Entertainment & Music'],
  ARRAY['AI Video', 'Visual Storytelling', 'Product Campaigns', 'Atmospheric Advertising', 'Creative Direction'],
  ARRAY['Runway Gen-3', 'Midjourney v6.1', 'ComfyUI', 'Luma Dream Machine', 'Premiere Pro'],
  ARRAY['Vimeo Staff Picks', 'Instagram', 'Film Festivals'],
  ARRAY['ai-video', 'creative-direction', 'advertising', 'fashion'],
  'Published',
  'published',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Maya Chen Portfolio Projects
INSERT INTO public.portfolio_projects (
  id, creator_id, title, description, category, format, image, aspect, role, client_type, creative_direction, capabilities, visibility, featured, display_order
) VALUES 
(
  'maya-proj-1',
  'maya-chen',
  'Echoes of the Solarium — Mid-Century Brand Odyssey',
  'A cinematic brand film set in a mid-century botanical observatory, following celestial light refractions across polished glass and raw bronze.',
  'AI Video',
  '4K Stills Suite',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=85',
  'landscape',
  'Generative Director & Editor',
  'Heritage Luxury House',
  'Warm 35mm anamorphic lenses with golden volumetric dust beams and slow mechanical camera tracking.',
  ARRAY['Narrative Cinema', 'Volumetric Lighting', 'Sound-Design Sync'],
  'published',
  TRUE,
  0
),
(
  'maya-proj-2',
  'maya-chen',
  'Neon Monsoon — Neo-Tokyo Nocturne',
  'Atmospheric street cinematography and fluid motion stills capturing rain-drenched neon reflections in an evocative cyber-noir setting.',
  'AI Video',
  '9:16 Video Loop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85',
  'portrait',
  'Director & Colorist',
  'Global Streaming Teaser',
  'Reflective asphalt caustics, soft sodium vapor glow, and melancholic anamorphic flares.',
  ARRAY['Short-Form Video', 'Color Grading', 'Atmospheric Stills'],
  'published',
  FALSE,
  1
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Demo Campaigns
INSERT INTO public.campaigns (
  id, owner_brand_id, brand_name, brand_avatar, brand_website, title, objective, product_or_service,
  industry, description, creative_direction, creative_style, tone_of_voice, deliverables, platforms,
  budget, currency, timeline, deadline, target_audience, cover_image, status, visibility, is_demo
) VALUES (
  'camp-summer-skincare',
  'brand-demo-lumina',
  'Lumina Botanica',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80',
  'luminabotanica.com',
  'Summer Skincare & Radiant Hydration Launch',
  'Product Launch',
  'Radiant Hydration Serum',
  'Beauty & Skincare',
  'Cinematic visual product campaign capturing sun-drenched hydration and cellular dewiness on sun-kissed skin.',
  'Organic natural morning sunlight, macro fluid droplets on botanical leaves, gentle motion caustics.',
  'Luminous, Dewy & Ethereal',
  'Evocative, Sensory, Poetic',
  ARRAY['3x 4K Hero Key Art Stills', '2x 9:16 Kinetic Fluid Motion Loops', '1x 30s Master Cinematic Teaser'],
  ARRAY['Instagram', 'Digital OOH', 'Vogue Editorial'],
  '$8,500 – $12,000',
  'USD',
  '3 Weeks',
  'Nov 15, 2026',
  'Conscious luxury skincare consumers aged 24-42',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
  'Active',
  'published',
  TRUE
)
ON CONFLICT (id) DO NOTHING;
