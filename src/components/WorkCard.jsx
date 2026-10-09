import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function WorkCard({ work, creator, colSpan = 4, onClick }) {
  const aspectClass = `aspect-${work.aspect || 'landscape'}`;

  return (
    <div 
      className={`work-card col-span-${colSpan} ${aspectClass}`}
      onClick={onClick}
    >
      <div className="work-card-media-wrapper">
        <img 
          src={work.image} 
          alt={work.title} 
          className="work-card-img" 
          loading="lazy"
        />

        <div className="work-card-overlay">
          <span className="work-card-category-badge">
            {work.category}
          </span>
          <h3 className="work-card-title">
            {work.title}
          </h3>
          <div className="work-card-creator">
            <img 
              src={creator.avatar} 
              alt={creator.name} 
              className="work-card-creator-avatar" 
            />
            <span>{creator.name}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>{creator.creativeIdentity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
