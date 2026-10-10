import React, { useState, useMemo } from 'react';
import CreatorCard from '../components/CreatorCard';
import { CATEGORIES, FILTER_OPTIONS } from '../data/creatorsData';
import { calculateCreaMatch } from '../intelligence/matchingEngine';
import { semanticCreatorSearch } from '../ai/semanticSearch';
import { Search, SlidersHorizontal, Heart, X, ArrowLeft, RotateCcw, Sparkles, ArrowUpDown } from 'lucide-react';

export default function DiscoverView({ 
  creators, 
  onSelectCreator, 
  activeCampaign, 
  onBackToCampaign,
  savedCreatorIds = [],
  onToggleSaveCreator,
  onWhyClick,
  pipelineFilter = null,
  onClearPipelineFilter,
  onOpenPipelineTrace
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  
  // Sorting inside campaign context: 'recommended' | 'best-fit' | 'recent' | 'available'
  const [sortBy, setSortBy] = useState('recommended');

  // Filter state
  const [filters, setFilters] = useState({
    industry: 'All Industries',
    style: 'All Styles',
    availability: 'All Availability'
  });

  const searchSuggestions = [
    "cinematic luxury fashion creator",
    "AI creator for a skincare product launch",
    "surreal product advertising",
    "Instagram creator for a Gen Z campaign",
    "minimal 3D tech advertising"
  ];

  const activeFiltersCount = 
    (filters.industry !== 'All Industries' ? 1 : 0) +
    (filters.style !== 'All Styles' ? 1 : 0) +
    (filters.availability !== 'All Availability' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setShowOnlySaved(false);
    setSortBy('recommended');
    setFilters({
      industry: 'All Industries',
      style: 'All Styles',
      availability: 'All Availability'
    });
  };

  // Compute semantic search
  const semanticResult = useMemo(() => {
    return semanticCreatorSearch(searchQuery, creators);
  }, [searchQuery, creators]);

  const interpretedTokens = semanticResult.interpretedTokens;

  // Filter and sort creators
  const processedCreators = useMemo(() => {
    let list;

    if (pipelineFilter && Array.isArray(pipelineFilter.eligibleCreatorIds)) {
      const eligibleSet = new Set(pipelineFilter.eligibleCreatorIds);
      const matching = creators.filter(c => eligibleSet.has(c.id));

      if (Array.isArray(pipelineFilter.rankedOrder) && pipelineFilter.rankedOrder.length > 0) {
        const rankIndexMap = new Map();
        pipelineFilter.rankedOrder.forEach((item, idx) => {
          const id = typeof item === 'string' ? item : (item.id || item.creatorId);
          if (id) rankIndexMap.set(id, idx);
        });
        matching.sort((a, b) => {
          const rankA = rankIndexMap.has(a.id) ? rankIndexMap.get(a.id) : 9999;
          const rankB = rankIndexMap.has(b.id) ? rankIndexMap.get(b.id) : 9999;
          return rankA - rankB;
        });
      } else {
        const idOrder = new Map(pipelineFilter.eligibleCreatorIds.map((id, idx) => [id, idx]));
        matching.sort((a, b) => (idOrder.get(a.id) ?? 9999) - (idOrder.get(b.id) ?? 9999));
      }

      list = matching;
    } else {
      list = searchQuery.trim() ? [...semanticResult.results] : [...creators];
    }

    list = list.filter((c) => {
      // Saved filter
      if (showOnlySaved && !savedCreatorIds.includes(c.id)) {
        return false;
      }

      // Horizontal Category Match
      if (selectedCategory !== 'all') {
        const matchesCategoryTag = (c.categoryTags || []).includes(selectedCategory);
        const matchesSpecialty = c.specialty.toLowerCase().replace(/\s+/g, '-').includes(selectedCategory);
        const matchesCapability = (c.capabilities || []).some(cap => 
          cap.toLowerCase().replace(/\s+/g, '-').includes(selectedCategory)
        );
        if (!matchesCategoryTag && !matchesSpecialty && !matchesCapability) {
          return false;
        }
      }

      // Popover Filters
      if (filters.industry !== 'All Industries') {
        if (!c.industries.includes(filters.industry)) return false;
      }

      if (filters.style !== 'All Styles') {
        if (!c.styles.includes(filters.style)) return false;
      }

      if (filters.availability !== 'All Availability') {
        if (c.availability !== filters.availability) return false;
      }

      return true;
    });

    // Sorting logic (especially inside campaign context when no pipeline filter)
    if (!pipelineFilter && activeCampaign && !searchQuery.trim()) {
      if (sortBy === 'recommended' || sortBy === 'best-fit') {
        list = [...list].sort((a, b) => {
          const matchA = calculateCreaMatch(activeCampaign, a).score;
          const matchB = calculateCreaMatch(activeCampaign, b).score;
          return matchB - matchA;
        });
      } else if (sortBy === 'available') {
        list = [...list].sort((a, b) => {
          const availA = a.availability.includes('Available') ? 1 : 0;
          const availB = b.availability.includes('Available') ? 1 : 0;
          return availB - availA;
        });
      }
    }

    return list;
  }, [creators, semanticResult, selectedCategory, searchQuery, showOnlySaved, savedCreatorIds, filters, sortBy, activeCampaign, pipelineFilter]);

  return (
    <div className="discover-view">
      <div className="page-container">
        {/* Campaign Context Banner (when navigating from Campaign Studio) */}
        {activeCampaign && (
          <div className="campaign-context-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={onBackToCampaign}
              >
                <ArrowLeft size={14} />
                <span>Return to Campaign Studio</span>
              </button>
              <div>
                <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-lavender-deep)' }}>
                  Browsing for this campaign
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                  {activeCampaign.title}
                </div>
              </div>
            </div>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              CreaMatch scores calculated for your brief.
            </span>
          </div>
        )}

        {/* Campaign Pipeline Filter Banner */}
        {pipelineFilter && (
          <div className="pipeline-filter-banner studio-card" style={{ marginBottom: 24 }}>
            <div className="filter-banner-content">
              <div className="filter-banner-icon">
                <Sparkles size={20} className="text-mint" />
              </div>
              <div className="filter-banner-text">
                <div className="filter-banner-heading">
                  <strong>Filtered for Campaign:</strong> {pipelineFilter.campaignTitle || 'Campaign'}
                  {pipelineFilter.isStale && (
                    <span className="badge-stale" style={{ marginLeft: 8, background: 'rgba(235, 110, 75, 0.2)', color: '#eb6e4b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      Brief Updated (Stale)
                    </span>
                  )}
                </div>
                <div className="filter-banner-sub">
                  Showing {processedCreators.length} eligible creator{processedCreators.length === 1 ? '' : 's'} matching mandatory pipeline requirements. Excluded candidates are filtered out.
                </div>
              </div>
            </div>
            <div className="filter-banner-actions">
              {onOpenPipelineTrace && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenPipelineTrace(pipelineFilter.campaignId)}
                >
                  <Sparkles size={13} />
                  <span>View Pipeline Trace</span>
                </button>
              )}
              {onClearPipelineFilter && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={onClearPipelineFilter}
                  title="Clear campaign filter and view all creators"
                >
                  <X size={14} />
                  <span>Clear Filter</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Discovery Hero Section */}
        <div className="discover-header">
          <div className="section-label">AI Creator Marketplace</div>
          <h1 className="discover-title font-editorial">
            {activeCampaign 
              ? `Creators for ${activeCampaign.title}`
              : "Find your next creator."}
          </h1>
          <p className="discover-sub">
            {activeCampaign
              ? "Based on your brief, these creators are especially aligned with your creative direction and deliverables."
              : "Explore AI creators making everything from cinematic campaigns to product visuals."}
          </p>

          {/* Prominent Search Field with Rotating Suggestions */}
          <div className="discover-search-container">
            <div className="discover-search-input-wrapper">
              <Search 
                size={20} 
                className="discover-search-icon"
              />
              <input
                type="text"
                className="discover-search-input"
                placeholder="Describe the creator you're looking for…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Suggestion Pills */}
            <div className="search-suggestions-row">
              <span className="suggestions-label">Try searching:</span>
              {searchSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  className="search-suggestion-chip"
                  onClick={() => setSearchQuery(sug)}
                >
                  "{sug}"
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Category System + Sorting & Filter Controls */}
          <div className="category-and-filter-row">
            {/* Horizontal Categories */}
            <div className="horizontal-categories-scroll">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id && !showOnlySaved;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowOnlySaved(false);
                    }}
                  >
                    <span>{cat.name}</span>
                    {cat.count && (
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          opacity: isActive ? 0.9 : 0.6,
                          fontWeight: 600,
                          marginLeft: '2px'
                        }}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter & Sort Actions Group */}
            <div className="filter-controls-group">
              {/* Campaign Sort Control (Section 10 of Prompt 3) */}
              {activeCampaign && (
                <div className="sort-control-wrap">
                  <select 
                    className="form-select form-select-sm sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="best-fit">Best Creative Fit</option>
                    <option value="available">Available Now</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              )}

              {/* Saved Creators Toggle */}
              <button
                type="button"
                className={`filter-icon-btn ${showOnlySaved ? 'active' : ''}`}
                onClick={() => setShowOnlySaved(!showOnlySaved)}
                title="View saved creators"
              >
                <Heart size={14} fill={showOnlySaved ? "#EF4444" : "none"} stroke={showOnlySaved ? "#EF4444" : "currentColor"} />
                <span>Saved ({savedCreatorIds.length})</span>
              </button>

              {/* Compact Filters Popover Button */}
              <button
                type="button"
                className={`filter-icon-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
                onClick={() => setShowFilterPopover(!showFilterPopover)}
              >
                <SlidersHorizontal size={14} />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>
            </div>
          </div>

          {/* Compact Filter Popover Sheet */}
          {showFilterPopover && (
            <div className="filter-popover-card">
              <div className="filter-popover-header">
                <h4>Refine Creators</h4>
                <button 
                  type="button" 
                  className="filter-reset-link"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={12} />
                  <span>Reset All</span>
                </button>
              </div>

              <div className="filter-popover-grid">
                <div className="filter-popover-col">
                  <label>Industry</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  >
                    {FILTER_OPTIONS.industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-popover-col">
                  <label>Aesthetic Style</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.style}
                    onChange={(e) => setFilters({ ...filters, style: e.target.value })}
                  >
                    {FILTER_OPTIONS.styles.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-popover-col">
                  <label>Availability</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  >
                    {FILTER_OPTIONS.availability.map((av) => (
                      <option key={av} value={av}>{av}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Natural Language Search Interpretation Bar */}
        {searchQuery.trim() && (
          <div className="search-understanding-bar">
            <div className="search-understanding-left">
              <span className="search-understood-prefix">You searched:</span>
              <span className="search-understood-query">"{searchQuery}"</span>
              <span className="search-understood-dot">•</span>
              <span className="search-understood-prefix">CreaSync AI understood:</span>
              <div className="search-understood-tokens">
                {interpretedTokens && interpretedTokens.length > 0 ? (
                  interpretedTokens.map((token, idx) => (
                    <span key={idx} className="understood-token-pill">{token}</span>
                  ))
                ) : (
                  <span className="understood-token-pill">Creative Match</span>
                )}
              </div>
            </div>
            <div className="search-understood-count">
              {processedCreators.length} {processedCreators.length === 1 ? 'creator' : 'creators'} found
            </div>
          </div>
        )}

        {/* Discovery Results Overview Bar */}
        {!searchQuery.trim() && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <div>
              <span>Showing <strong>{processedCreators.length}</strong> {selectedCategory === 'all' ? 'curated AI creators' : `${selectedCategory} creators`}</span>
              {activeFiltersCount > 0 && (
                <span style={{ marginLeft: '8px', color: 'var(--accent-lavender-deep, #7C3AED)' }}>• {activeFiltersCount} filter(s) active</span>
              )}
            </div>
            {(activeFiltersCount > 0 || selectedCategory !== 'all' || showOnlySaved) && (
              <button 
                type="button" 
                onClick={handleResetFilters}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--accent-lavender-deep, #7C3AED)', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset View</span>
              </button>
            )}
          </div>
        )}

        {/* Creator Masonry Grid */}
        {processedCreators.length > 0 ? (
          <div className="creator-masonry-gallery">
            {processedCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onSelect={onSelectCreator}
                isSaved={savedCreatorIds.includes(creator.id)}
                onToggleSave={onToggleSaveCreator}
                activeCampaign={activeCampaign}
                onWhyClick={onWhyClick}
              />
            ))}
          </div>
        ) : (
          <div className="discover-empty-state">
            <h3 className="font-editorial empty-state-title">
              {showOnlySaved 
                ? "No saved creators yet." 
                : "Nothing matches this creative direction."}
            </h3>
            <p className="empty-state-desc">
              {showOnlySaved
                ? "Click the heart icon on any creator card or profile to curate your campaign shortlist."
                : "Try a broader creative direction or clear your keyword filters."}
            </p>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} />
              <span>Reset Search & Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
