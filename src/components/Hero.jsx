import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Pause, Volume2, VolumeX, CheckCircle2, Sparkles, Layers, Sliders, RefreshCw } from 'lucide-react';

export default function Hero({ 
  onFindCreator, 
  onJoinCreator, 
  onExploreWork 
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [syncSequencePhase, setSyncSequencePhase] = useState(0); // 0: Canvas, 1: Brief, 2: Converge, 3: In Sync
  const [isBrandRevealActive, setIsBrandRevealActive] = useState(false);

  const scenes = [
    {
      id: 'horology',
      tag: 'Precision 3D',
      creator: 'Alex Rivera',
      handle: '@alexrivera.3d',
      role: '3D Spatial Technologist',
      matchScore: '98%',
      brief: 'Vanguard Titanium Chronograph',
      category: 'Consumer Tech',
      poster: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      technique: 'Magnetic Zero-G Escapements'
    },
    {
      id: 'fashion',
      tag: 'Haute Couture',
      creator: 'Elena Rostova',
      handle: '@elenarostova',
      role: 'AI Fashion & Editorial Director',
      matchScore: '96%',
      brief: 'Lumina Silk Organza Capsule',
      category: 'Luxury Fashion',
      poster: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      technique: 'Weightless Chiffon Caustics'
    },
    {
      id: 'cinema',
      tag: 'Cinematic Narrative',
      creator: 'Maya Chen',
      handle: '@mayachen.ai',
      role: 'Cinematic AI Director',
      matchScore: '97%',
      brief: 'Solarium Mid-Century Brand Film',
      category: 'Brand Film',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=85',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      technique: '35mm Anamorphic Volumetrics'
    },
    {
      id: 'beauty',
      tag: 'Macro Viscosity',
      creator: 'Zora Vance',
      handle: '@zora.beauty',
      role: 'Cosmetics & Macro Specialist',
      matchScore: '95%',
      brief: 'Aura Botanica Pure Hydration',
      category: 'Beauty & Skincare',
      poster: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=85',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
      technique: 'Sub-Surface Fluid Physics'
    }
  ];

  // Rotate through creator scenes smoothly
  useEffect(() => {
    if (isBrandRevealActive) return;
    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % scenes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [scenes.length, isBrandRevealActive]);

  // Brand "In Sync" sequence controller
  useEffect(() => {
    if (!isBrandRevealActive) return;
    const phase1 = setTimeout(() => setSyncSequencePhase(1), 1200);
    const phase2 = setTimeout(() => setSyncSequencePhase(2), 2800);
    const phase3 = setTimeout(() => setSyncSequencePhase(3), 4600);
    const reset = setTimeout(() => {
      setIsBrandRevealActive(false);
      setSyncSequencePhase(0);
    }, 7500);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
      clearTimeout(reset);
    };
  }, [isBrandRevealActive]);

  const currentScene = scenes[activeSceneIndex];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const triggerBrandReveal = () => {
    setIsBrandRevealActive(true);
    setSyncSequencePhase(0);
  };

  return (
    <section className="hero-section" id="home">
      <div className="page-container">
        <div className="hero-grid">
          {/* Left Column: Focused Art-Directed Hierarchy */}
          <div className="hero-content">
            <div className="hero-brand-pill">
              <span className="hero-sparkle-dot" />
              <span className="hero-tag-text">AI Creative Marketplace</span>
            </div>

            <h1 className="hero-title hero-title-editorial">
              The right creator.<br />
              The right idea.<br />
              <span className="hero-title-accent">In sync.</span>
            </h1>

            <p className="hero-subtitle">
              Discover creative talent, explore campaign concepts, and build meaningful partnerships with AI that understands creative fit.
            </p>

            <div className="hero-actions">
              <button 
                type="button" 
                className="btn btn-primary btn-lg hero-cta-primary"
                onClick={onFindCreator}
                id="hero-find-creator-btn"
              >
                <span>I want to hire</span>
                <ArrowRight size={17} />
              </button>

              <button 
                type="button" 
                className="btn btn-secondary btn-lg hero-cta-secondary"
                onClick={onJoinCreator}
                id="hero-join-creator-btn"
              >
                <span>I'm a creator</span>
              </button>
            </div>

            {/* Clear, refined trust & value signals */}
            <div className="hero-micro-signals">
              <div className="hero-signal-item">
                <span className="signal-icon-dot pastel-lavender-dot" />
                <span>Evidence-Backed Creator DNA</span>
              </div>
              <div className="hero-signal-item">
                <span className="signal-icon-dot pastel-peach-dot" />
                <span>Transparent CreaMatch Scoring</span>
              </div>
              <div className="hero-signal-item">
                <span className="signal-icon-dot pastel-mint-dot" />
                <span>Connected Collaborative Workspaces</span>
              </div>
            </div>
          </div>

          {/* Right Column: Signature CreaSync Visual Canvas */}
          <div className="hero-visual-column">
            <div className="hero-focal-card">
              {/* Top Bar with Category Tabs and Motion Toggle */}
              <div className="focal-card-topbar">
                <div className="focal-scene-tabs">
                  {scenes.map((scene, idx) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`focal-tab-btn ${idx === activeSceneIndex && !isBrandRevealActive ? 'active' : ''}`}
                      onClick={() => {
                        setIsBrandRevealActive(false);
                        setActiveSceneIndex(idx);
                      }}
                    >
                      {scene.tag}
                    </button>
                  ))}
                </div>

                <div className="focal-video-controls">
                  <button 
                    type="button" 
                    className={`focal-ctrl-btn ${isBrandRevealActive ? 'active' : ''}`}
                    onClick={triggerBrandReveal}
                    title="Watch Signature 'In Sync' Brand Sequence"
                    aria-label="Replay brand reveal motion"
                  >
                    <RefreshCw size={13} className={isBrandRevealActive ? 'spin-slow' : ''} />
                    <span className="btn-label-micro">In Sync</span>
                  </button>

                  <button 
                    type="button" 
                    className="focal-ctrl-btn"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  </button>

                  <button 
                    type="button" 
                    className="focal-ctrl-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  >
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                </div>
              </div>

              {/* Media Frame: Video, Image, or Brand 'In Sync' Motion */}
              <div className="focal-media-frame">
                {isBrandRevealActive ? (
                  /* Signature In Sync Brand Motion Canvas */
                  <div className="sync-reveal-canvas">
                    <div className={`sync-stage sync-stage-${syncSequencePhase}`}>
                      {syncSequencePhase === 0 && (
                        <div className="sync-frame-initial">
                          <span className="sync-canvas-label">FRAME 01 — THE CREATIVE VOID</span>
                          <p className="sync-canvas-tagline font-editorial">Where every campaign begins</p>
                          <div className="sync-canvas-grid-lines" />
                        </div>
                      )}

                      {syncSequencePhase === 1 && (
                        <div className="sync-frame-brief">
                          <span className="sync-canvas-label">FRAME 02 — THE BRIEF TAKES SHAPE</span>
                          <div className="sync-brief-floating-card">
                            <span className="sync-brief-badge">Campaign Requirement</span>
                            <h4 className="sync-brief-title font-editorial">“Weightless titanium & fluid motion”</h4>
                            <div className="sync-tag-row">
                              <span className="sync-tag">AI 3D CGI</span>
                              <span className="sync-tag">Zero-Gravity</span>
                              <span className="sync-tag">4K Master</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {syncSequencePhase === 2 && (
                        <div className="sync-frame-converge">
                          <span className="sync-canvas-label">FRAME 03 — DIRECTIONS ALIGN</span>
                          <div className="sync-elements-trio">
                            <div className="sync-elem-card elem-left">
                              <img src={scenes[0].poster} alt="Horology" />
                              <span>Mechanical Precision</span>
                            </div>
                            <div className="sync-elem-card elem-center">
                              <img src={scenes[1].poster} alt="Silk" />
                              <span>Luminous Caustics</span>
                            </div>
                            <div className="sync-elem-card elem-right">
                              <img src={scenes[2].poster} alt="Cinema" />
                              <span>Anamorphic Light</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {syncSequencePhase === 3 && (
                        <div className="sync-frame-locked">
                          <span className="sync-canvas-label">FRAME 04 — THE MOMENT OF SYNC</span>
                          <div className="sync-lockup-box">
                            <span className="sync-mark-dot" />
                            <h2 className="sync-lockup-wordmark">CREASYNC</h2>
                            <p className="sync-lockup-sub font-editorial">The right creator. The right idea. In sync.</p>
                            <span className="sync-match-stamp">98% Verified Creative Fit</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard High-Fidelity Video & Poster Element */
                  <>
                    {!videoError ? (
                      <video
                        ref={videoRef}
                        className="focal-video-el"
                        src="/assets/creasynq-universe.mp4"
                        poster={currentScene.poster}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        onError={() => setVideoError(true)}
                      />
                    ) : (
                      <img 
                        src={currentScene.poster} 
                        alt={currentScene.creator}
                        className="focal-video-el"
                      />
                    )}
                    <div className="focal-media-overlay" />
                  </>
                )}
              </div>

              {/* Integrated Bottom Attribution & Grounded Match Information */}
              <div className="focal-info-strip">
                <div className="focal-creator-row">
                  <img 
                    src={currentScene.avatar} 
                    alt={currentScene.creator} 
                    className="focal-avatar"
                  />
                  <div className="focal-creator-details">
                    <span className="focal-creator-name">{currentScene.creator}</span>
                    <span className="focal-creator-role">{currentScene.role}</span>
                  </div>
                  <span className="focal-match-badge">
                    {currentScene.matchScore} CreaMatch
                  </span>
                </div>

                <div className="focal-brief-row">
                  <div className="focal-brief-meta">
                    <span className="focal-brief-label">Verified Portfolio:</span>
                    <span className="focal-brief-title">{currentScene.brief}</span>
                  </div>
                  <span className="focal-status-chip">
                    <CheckCircle2 size={12} className="text-mint" />
                    <span>{currentScene.technique}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
