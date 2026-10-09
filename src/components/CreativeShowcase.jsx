// src/components/CreativeShowcase.jsx
// SECTION D: Creative Portfolio Showcase
// Headline: "Meet creativity in every direction."
// Curated selection of creator work across product campaigns, fashion, food/beverage, editorial, social, and brand storytelling.

import React, { useState } from 'react';
import { ArrowRight, Eye, Sparkles, Filter, ExternalLink, Play } from 'lucide-react';

export default function CreativeShowcase({ creators = [], onSelectProject, onExploreAll }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const showcaseItems = [
    {
      id: "work-maya-solarium",
      title: "Echoes of the Solarium",
      category: "Brand Storytelling",
      categoryTag: "storytelling",
      aspectRatio: "aspect-16-9",
      aspectLabel: "16:9 Cinema",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=85",
      creator: creators.find(c => c.id === 'maya-chen') || creators[0],
      description: "Atmospheric narrative commercial exploring mid-century architecture under dusk rain, filmed with 35mm generative lenses.",
      discipline: "Generative Cinema",
      isDemo: true
    },
    {
      id: "work-elena-aura",
      title: "Aura Privée Haute Couture",
      category: "Fashion & Lifestyle",
      categoryTag: "fashion",
      aspectRatio: "aspect-4-5",
      aspectLabel: "4:5 Editorial",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
      creator: creators.find(c => c.id === 'elena-rostova') || creators[1],
      description: "Generative silk organza draping in weightless zero-gravity dynamics against Parisian neoclassical stonework.",
      discipline: "AI Fashion Direction",
      isDemo: true
    },
    {
      id: "work-alex-chronos",
      title: "Chronos Titanium Horizon",
      category: "Product Campaigns",
      categoryTag: "product",
      aspectRatio: "aspect-1-1",
      aspectLabel: "1:1 Macro",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
      creator: creators.find(c => c.id === 'alex-rivera') || creators[2],
      description: "Exploded micro-mechanical watch movement with floating titanium gears and sapphire crystal refractions.",
      discipline: "3D Spatial CGI",
      isDemo: true
    },
    {
      id: "work-zora-hydra",
      title: "L'Hydratation Pure",
      category: "Editorial Visuals",
      categoryTag: "editorial",
      aspectRatio: "aspect-4-5",
      aspectLabel: "4:5 Portrait",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85",
      creator: creators.find(c => c.id === 'zora-vance') || creators[3],
      description: "Macro droplet surface tension and pore-level skin hydration capture illuminated by soft morning sunlight.",
      discipline: "Macro Beauty",
      isDemo: true
    },
    {
      id: "work-alex-beverage",
      title: "Nordic Mist Botanical Spirits",
      category: "Food & Beverage",
      categoryTag: "food-bev",
      aspectRatio: "aspect-1-1",
      aspectLabel: "1:1 Studio",
      image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1000&q=85",
      creator: creators.find(c => c.id === 'alex-rivera') || creators[2],
      description: "Slow-motion crystalline ice shards forming organically around a frosted botanical spirit bottle with amber caustics.",
      discipline: "Fluid Dynamics",
      isDemo: true
    },
    {
      id: "work-nina-kinetic",
      title: "Pop Kinetic 9:16 Velocity",
      category: "Social Content",
      categoryTag: "social",
      aspectRatio: "aspect-4-5",
      aspectLabel: "9:16 Social Reel",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
      creator: creators.find(c => c.id === 'nina-novak') || creators[4],
      description: "High-converting kinetic motion loops, 3D pop graphics, and sound-reactive type for mobile social feeds.",
      discipline: "Social Video",
      isDemo: true
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'All Work' },
    { id: 'product', label: 'Product Campaigns' },
    { id: 'fashion', label: 'Fashion & Lifestyle' },
    { id: 'food-bev', label: 'Food & Beverage' },
    { id: 'editorial', label: 'Editorial Visuals' },
    { id: 'social', label: 'Social Content' },
    { id: 'storytelling', label: 'Brand Storytelling' }
  ];

  const filteredItems = activeFilter === 'all' 
    ? showcaseItems 
    : showcaseItems.filter(item => item.categoryTag === activeFilter);

  return (
    <section className="section-creative-showcase" id="explore-work">
      <div className="page-container">
        {/* Apple-grade Editorial Section Header */}
        <div className="showcase-header-row">
          <div className="showcase-header-text">
            <div className="section-pill-tag">
              <span className="pill-dot-sm" />
              <span>Curated Portfolio Works</span>
            </div>
            <h2 className="section-headline-lg font-editorial">
              Meet creativity in every direction.
            </h2>
            <p className="section-subtitle-max">
              From cinematic brand films to tactile product physics and generative fashion, 
              explore work created by AI artists who define new aesthetic standards.
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-sm showcase-browse-all-btn"
            onClick={onExploreAll}
            aria-label="Explore All Creators"
          >
            <span>Explore All Talent</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="showcase-filter-bar">
          <div className="showcase-filter-list" role="tablist" aria-label="Portfolio Disciplines">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab.id}
                className={`showcase-filter-btn ${activeFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Masonry/Grid with Deliberate Aspect Ratios */}
        <div className="showcase-grid-deliberate">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className={`showcase-card ${item.aspectRatio}`}
              onClick={() => onSelectProject && onSelectProject({
                id: item.id,
                title: item.title,
                image: item.image,
                category: item.category,
                description: item.description,
                creativeDirection: item.discipline,
                creator: item.creator
              }, item.creator)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSelectProject && onSelectProject({
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    category: item.category,
                    description: item.description,
                    creativeDirection: item.discipline,
                    creator: item.creator
                  }, item.creator);
                }
              }}
            >
              {/* Media Frame with precise aspect ratio */}
              <div className="showcase-media-frame">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="showcase-img"
                  loading="lazy"
                />
                <div className="showcase-overlay-gradient" />
                
                {/* Demonstration Notice */}
                <span className="showcase-aspect-badge">
                  {item.aspectLabel}
                </span>

                <div className="showcase-hover-action">
                  <span className="showcase-action-btn">
                    <Eye size={13} />
                    <span>View Direction</span>
                  </span>
                </div>
              </div>

              {/* Editorial Card Footer */}
              <div className="showcase-card-body">
                <div className="showcase-meta-row">
                  <span className="showcase-cat-pill">{item.category}</span>
                  <span className="showcase-demo-indicator">Demonstration Work</span>
                </div>

                <h3 className="showcase-project-title font-editorial">{item.title}</h3>
                <p className="showcase-project-desc">{item.description}</p>

                {item.creator && (
                  <div className="showcase-creator-strip">
                    <img 
                      src={item.creator.avatar} 
                      alt={item.creator.name}
                      className="showcase-avatar-sm"
                    />
                    <div className="showcase-creator-col">
                      <span className="showcase-creator-name">{item.creator.name}</span>
                      <span className="showcase-creator-role">{item.discipline}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
