// src/components/ProjectModal.jsx
// Editorial Case Study experience with progressive reveals, media expand, and video support

import React, { useState } from 'react';
import { X, ArrowRight, Send, Sparkles, Layers, Maximize2, Minimize2, Play, Volume2, VolumeX } from 'lucide-react';

export default function ProjectModal({ 
  project, 
  creator, 
  onClose, 
  onViewCreatorProfile,
  onInviteCreator 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!project || !creator) return null;

  const hasVideo = !!(project.video || project.videoPreview || (project.category === 'AI Video' && creator.videoPreview));
  const videoSrc = project.video || project.videoPreview || creator.videoPreview;

  return (
    <div className={`modal-overlay ${isExpanded ? 'modal-expanded-overlay' : ''}`} onClick={onClose}>
      <div 
        className={`modal-content project-case-study-modal ${isExpanded ? 'expanded-case-study' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="project-modal-top-bar-controls">
          <button 
            type="button" 
            className="modal-icon-control-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse View" : "Expand Media"}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Large Cinematic Media Dominating the View */}
        <div className={`project-modal-hero-media ${isExpanded ? 'media-full-expand' : ''}`}>
          {hasVideo && isPlayingVideo ? (
            <div className="project-video-player-wrap">
              <video 
                src={videoSrc}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                className="project-modal-video"
              />
              <button 
                type="button" 
                className="video-mute-pill-btn"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isMuted ? "Unmute" : "Muted"}</span>
              </button>
            </div>
          ) : (
            <div className="project-image-hero-wrap">
              <img 
                src={project.image} 
                alt={project.title} 
                className="project-modal-img"
              />
              {hasVideo && (
                <button 
                  type="button" 
                  className="project-play-video-cta"
                  onClick={() => setIsPlayingVideo(true)}
                >
                  <Play size={18} fill="#FFFFFF" />
                  <span>Play Cinematic Preview</span>
                </button>
              )}
            </div>
          )}

          <div className="project-modal-media-badge">
            <span>{project.category}</span>
            {hasVideo && <span>• 4K Video Loop</span>}
          </div>
        </div>

        {/* 2. Project Title & Creator Strip */}
        <div className="project-modal-header-row">
          <div>
            <h2 className="project-modal-title font-editorial">
              {project.title}
            </h2>

            {/* Creator Attribution */}
            <div 
              className="project-modal-creator-pill"
              onClick={() => {
                onClose();
                onViewCreatorProfile(creator.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={creator.avatar} 
                alt={creator.name} 
                className="project-modal-creator-avatar" 
              />
              <div>
                <span className="project-modal-creator-name">{creator.name}</span>
                <span className="project-modal-creator-role"> • {creator.creativeIdentity}</span>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="project-modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onViewCreatorProfile(creator.id);
              }}
            >
              <span>View Portfolio</span>
              <ArrowRight size={14} />
            </button>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onInviteCreator(creator);
              }}
            >
              <Send size={15} />
              <span>Invite this Creator</span>
            </button>
          </div>
        </div>

        {/* 3. Description & Creative Direction Case Study */}
        <div className="project-modal-details-grid">
          <div className="project-modal-info-box">
            <span className="sidebar-heading">Concept & Overview</span>
            <p className="project-modal-desc-text">
              {project.description}
            </p>
          </div>

          <div className="project-modal-info-box">
            <span className="sidebar-heading">Creative Direction</span>
            <p className="project-modal-desc-text">
              {project.creativeDirection || "Exact lighting choreography, generative model consistency, and custom post-processing color grading."}
            </p>
          </div>
        </div>

        {/* 4. Capabilities Used & Client Type Meta Strip */}
        <div className="project-modal-meta-strip">
          <div>
            <span className="sidebar-heading">Capabilities Used</span>
            <div className="chip-cloud" style={{ marginTop: '6px' }}>
              {(project.capabilities || creator.capabilities.slice(0, 3)).map((cap, i) => (
                <span key={i} className="skill-chip">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="sidebar-heading">Client / Format</span>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '6px' }}>
              {project.clientType || "Editorial & Commercial"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
