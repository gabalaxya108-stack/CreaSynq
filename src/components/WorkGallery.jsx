import React from 'react';
import WorkCard from './WorkCard';
import { ArrowRight } from 'lucide-react';

export default function WorkGallery({ creators, onSelectProject, onExploreAll }) {
  // Collect standout portfolio pieces across creators
  const curatedWorks = [
    {
      work: creators[0]?.projects?.[0],
      creator: creators[0],
      colSpan: 8 // Maya Chen - Echoes of the Solarium (landscape 16:9)
    },
    {
      work: creators[2]?.projects?.[0],
      creator: creators[2],
      colSpan: 4 // Elena Rostova - Aura Privée (portrait 3:4)
    },
    {
      work: creators[1]?.projects?.[0],
      creator: creators[1],
      colSpan: 4 // Alex Rivera - Chronos Titanium (square/portrait)
    },
    {
      work: creators[3]?.projects?.[0],
      creator: creators[3],
      colSpan: 8 // Zora Vance - L'Hydratation Pure (landscape macro)
    },
    {
      work: creators[4]?.projects?.[0],
      creator: creators[4],
      colSpan: 6 // Tariq Al-Mansoor - Sanctuary of the Red Dune (landscape)
    },
    {
      work: creators[5]?.projects?.[0],
      creator: creators[5],
      colSpan: 6 // Sophie Mercier - Éclat d'Or (portrait)
    }
  ].filter(item => item.work && item.creator);

  return (
    <section className="section-work-gallery" id="explore-work">
      <div className="page-container">
        <div className="section-header-minimal">
          <div>
            <div className="section-label">Curated Portfolio Stream</div>
            <h2 className="section-headline">
              Explore what AI creators are making.
            </h2>
            <p className="section-desc">
              Discover synthetic high-fashion, macro product physics, impossible spatial architecture, and cinematic storytelling.
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onExploreAll}
          >
            <span>Browse All Work</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Dynamic Aspect Ratio Masonry */}
        <div className="gallery-grid">
          {curatedWorks.map((item, idx) => (
            <WorkCard
              key={`${item.creator.id}-${item.work.id}-${idx}`}
              work={item.work}
              creator={item.creator}
              colSpan={item.colSpan}
              onClick={() => onSelectProject(item.work, item.creator)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
