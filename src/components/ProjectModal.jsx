// src/components/ProjectModal.jsx
// Complete Single-Page Work Showcase & Case Study Experience
// Displays all information from high-res media display to comprehensive production specs.
// Strictly excludes any 'Invite this Creator' button.

import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Layers, Maximize2, Minimize2, Play, Volume2, VolumeX, Eye, CheckCircle2, Sliders, Palette, Cpu, Film, GitCommit } from 'lucide-react';
import WorkflowTimeline from './WorkflowTimeline';
import { DEMO_WORKFLOWS } from '../data/workflowsData';

export default function ProjectModal({ 
  project, 
  creator, 
  onClose, 
  onViewCreatorProfile 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!project) return null;

  const resolvedCreator = creator || {
    name: 'AI Creator',
    creativeIdentity: 'Visual Worldbuilder & Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    tools: ['Midjourney v6', 'Runway Gen-3'],
    capabilities: ['Generative Stills', 'Visual Direction']
  };

  const hasVideo = !!(project.video || project.videoPreview || (project.category === 'AI Video' && resolvedCreator.videoPreview));
  const videoSrc = project.video || project.videoPreview || resolvedCreator.videoPreview;

  const roleText = project.role || resolvedCreator.creativeIdentity || "Lead Visual Artist";
  const clientText = project.clientType || "Commercial & Editorial";
  const styleText = project.creativeStyle || project.style || (resolvedCreator.styles ? resolvedCreator.styles[0] : "Cinematic & Editorial");
  const toolsText = project.tools || (Array.isArray(resolvedCreator.tools) ? resolvedCreator.tools.join(', ') : "Midjourney v6, Runway Gen-3");
  const formatText = project.format || (project.category === 'AI Video' ? '4K Video Master Loop' : 'High-Resolution 4K Key Art Stills');
  const platformText = project.platform || "Campaign OOH, Social & Digital";
  const tagsList = project.capabilities || resolvedCreator.capabilities || ['Generative Cinema', 'Visual Direction'];

  // Resolve associated creative workflow if linked
  const allWorkflows = (resolvedCreator.workflows && resolvedCreator.workflows.length > 0)
    ? resolvedCreator.workflows
    : DEMO_WORKFLOWS.filter(w => w.creatorId === resolvedCreator.id);
  const associatedWorkflow = allWorkflows.find(w => 
    (w.linkedProjectId && w.linkedProjectId === project.id) ||
    (project.workflowId && w.id === project.workflowId)
  );

  return (
    <div className={`modal-overlay ${isExpanded ? 'modal-expanded-overlay' : ''}`} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="project-modal-headline">
      <div 
        className={`modal-content project-case-study-modal ${isExpanded ? 'expanded-case-study' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: isExpanded ? '96vw' : '880px', maxHeight: '92vh', overflowY: 'auto', padding: '0', borderRadius: '22px', border: '1px solid rgba(226, 232, 240, 0.85)', background: 'var(--bg-card, #FFFFFF)' }}
      >
        {/* Top Floating Controls */}
        <div className="project-modal-top-bar-controls" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            className="modal-icon-control-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse View" : "Expand Media"}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            style={{ background: 'rgba(20, 19, 18, 0.75)', backdropFilter: 'blur(8px)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.25)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
            style={{ background: 'rgba(20, 19, 18, 0.75)', backdropFilter: 'blur(8px)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.25)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Large Cinematic Media Dominating the Top View */}
        <div className={`project-modal-hero-media ${isExpanded ? 'media-full-expand' : ''}`} style={{ margin: 0, borderRadius: '21px 21px 0 0', position: 'relative', width: '100%', maxHeight: isExpanded ? '65vh' : '440px', background: '#121110', overflow: 'hidden' }}>
          {hasVideo && isPlayingVideo ? (
            <div className="project-video-player-wrap" style={{ width: '100%', height: '100%', position: 'relative' }}>
              <video 
                src={videoSrc}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                className="project-modal-video"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button 
                type="button" 
                className="video-mute-pill-btn"
                onClick={() => setIsMuted(!isMuted)}
                style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(20, 19, 18, 0.8)', backdropFilter: 'blur(8px)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '6px 14px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isMuted ? "Unmute Sound" : "Muted"}</span>
              </button>
            </div>
          ) : (
            <div className="project-image-hero-wrap" style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img 
                src={project.image} 
                alt={project.title} 
                className="project-modal-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85";
                }}
              />
              {hasVideo && (
                <button 
                  type="button" 
                  className="project-play-video-cta"
                  onClick={() => setIsPlayingVideo(true)}
                  style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(20, 19, 18, 0.85)', backdropFilter: 'blur(10px)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '10px 20px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                >
                  <Play size={16} fill="#FFFFFF" />
                  <span>Play Cinematic 4K Preview</span>
                </button>
              )}
            </div>
          )}

          {/* Badges on Media */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.76rem', padding: '5px 12px', borderRadius: '100px', background: 'rgba(20, 19, 18, 0.8)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontWeight: 600, border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              {project.category || 'Visual Art'}
            </span>
            {project.featured && (
              <span style={{ fontSize: '0.76rem', padding: '5px 12px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.95)', color: '#FFFFFF', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ★ Featured Work
              </span>
            )}
            {project.visibility && (
              <span style={{ fontSize: '0.76rem', padding: '5px 12px', borderRadius: '100px', background: project.visibility === 'private' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)', color: '#FFFFFF', fontWeight: 600 }}>
                {project.visibility === 'private' ? 'Private Draft' : 'Published'}
              </span>
            )}
            {hasVideo && (
              <span style={{ fontSize: '0.76rem', padding: '5px 12px', borderRadius: '100px', background: 'rgba(20, 19, 18, 0.8)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontWeight: 600, border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                • 4K Video Loop
              </span>
            )}
          </div>
        </div>

        {/* 2. Comprehensive Details Body */}
        <div style={{ padding: '32px 36px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Row: Title, Creator Attribution, and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary, #EB6E4B)', fontWeight: 700 }}>
                Case Study & Portfolio Showcase
              </span>
              <h2 id="project-modal-headline" className="font-editorial" style={{ fontSize: '1.9rem', fontWeight: 700, lineHeight: 1.25, margin: '6px 0 10px', color: 'var(--text-primary)' }}>
                {project.title}
              </h2>

              {/* Creator Attribution Pill */}
              <div 
                className="project-modal-creator-pill"
                onClick={() => {
                  if (onViewCreatorProfile && resolvedCreator.id) {
                    onClose();
                    onViewCreatorProfile(resolvedCreator.id);
                  }
                }}
                style={{ cursor: onViewCreatorProfile && resolvedCreator.id ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '4px 14px 4px 4px', borderRadius: '100px', background: 'var(--bg-secondary, #F4EFEA)', border: '1px solid var(--border-light, #E2E8F0)' }}
              >
                <img 
                  src={resolvedCreator.avatar} 
                  alt={resolvedCreator.name} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '0.84rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resolvedCreator.name}</span>
                  {resolvedCreator.creativeIdentity && (
                    <span style={{ color: 'var(--text-secondary)' }}> • {resolvedCreator.creativeIdentity}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons (Excludes 'Invite Creator') */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {onViewCreatorProfile && resolvedCreator.id && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    onViewCreatorProfile(resolvedCreator.id);
                  }}
                  title="View creator public portfolio"
                >
                  <span>View Full Profile</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>

          {/* 3. Concept & Brief Overview Callout Block */}
          <div style={{ background: 'linear-gradient(135deg, rgba(253, 247, 237, 0.85) 0%, rgba(246, 240, 232, 0.6) 100%)', border: '1px solid rgba(235, 110, 75, 0.25)', borderRadius: '16px', padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-primary, #EB6E4B)' }}>
              <Sparkles size={16} />
              <span>Brief Description & Creative Concept</span>
            </div>
            <p style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.65, color: 'var(--text-primary)', fontWeight: 400 }}>
              {project.description}
            </p>
          </div>

          {/* 4. Creative Direction & Artistry (if present) */}
          {project.creativeDirection && (
            <div style={{ padding: '20px 24px', background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '14px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary, #64748B)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Creative Direction & Lighting Choreography
              </span>
              <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {project.creativeDirection}
              </p>
            </div>
          )}

          {/* 5. Production Specifications Grid */}
          <div>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary, #64748B)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
              Production Details & Specifications
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748B)' }}>
                  Role / Craft
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {roleText}
                </span>
              </div>

              <div style={{ background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748B)' }}>
                  Client / Scope
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {clientText}
                </span>
              </div>

              <div style={{ background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748B)' }}>
                  Creative Style
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {styleText}
                </span>
              </div>

              <div style={{ background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748B)' }}>
                  Tools & Pipeline
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {toolsText}
                </span>
              </div>

              <div style={{ background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748B)' }}>
                  Asset Deliverable Format
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatText}
                </span>
              </div>

              <div style={{ background: 'var(--bg-card-subtle, #F8F9FA)', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary, #64748B)' }}>
                  Target Distribution
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {platformText}
                </span>
              </div>
            </div>
          </div>

          {/* Associated Creative Workflow (if linked) */}
          {associatedWorkflow && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span className="live-pulse-dot" />
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-primary, #EB6E4B)', fontWeight: 700 }}>
                  Associated Production Workflow • How This Work Was Created
                </span>
              </div>
              <WorkflowTimeline 
                workflow={associatedWorkflow} 
                isReadOnly={true}
                compact={false}
              />
            </div>
          )}

          {/* 6. Verified Capabilities & Craft Tags */}
          {tagsList && tagsList.length > 0 && (
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary, #64748B)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Verified Craft Capabilities & Tags
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tagsList.map((tag, i) => (
                  <span key={i} className="skill-chip" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Note & Bottom Close */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid var(--border-light, #E2E8F0)', marginTop: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Provenance: <strong>Verified Commercial & Creative Work</strong>
            </span>

            <button 
              type="button" 
              className="btn btn-secondary btn-md"
              onClick={onClose}
            >
              Close Showcase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
