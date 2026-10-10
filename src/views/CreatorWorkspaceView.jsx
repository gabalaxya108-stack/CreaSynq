import React, { useState, useEffect, useMemo } from 'react';
import { 
  Palette, Eye, EyeOff, Star, Plus, MessageSquare, Briefcase, ExternalLink, 
  CheckCircle, ArrowRight, Dna, CheckCircle2, X, Send, ChevronRight, Check,
  Clock, DollarSign, Calendar, Sparkles, Filter, Bookmark, BookmarkCheck,
  Edit3, Trash2, Upload, AlertCircle, FileText, UserCheck, ShieldCheck,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { generateCreatorDNA } from '../intelligence/creatorDNA';
import { generateCreatorDNA as generateCreatorDNAWithGroq } from '../ai/groqClient';
import { INITIAL_CREATOR_INVITATIONS, INITIAL_CREATOR_PROJECTS } from '../data/connectionsData';

export default function CreatorWorkspaceView({ 
  creator, 
  onUpdateCreator,
  onViewPublicProfile,
  onExploreMarketplace,
  connections = [],
  onOpenConversation,
  opportunities = [],
  onOpportunityResponse,
  invitations: propInvitations,
  onAcceptInvitation: propOnAcceptInvitation,
  onDeclineInvitation: propOnDeclineInvitation,
  projects: propProjects,
  onSubmitDeliverables: propOnSubmitDeliverables,
  onSendMessage: propOnSendMessage,
  initialTab = 'overview'
}) {
  const [activeCreator, setActiveCreator] = useState(creator || {});
  const [activeTab, setActiveTab] = useState(initialTab || 'overview'); // 'overview' | 'portfolio' | 'opportunities' | 'invitations' | 'projects' | 'messages' | 'profile'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Portfolio state
  const [projectsList, setProjectsList] = useState(creator?.projects || []);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('all');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Sync state when creator prop updates
  useEffect(() => {
    if (creator) {
      setActiveCreator(creator);
      setProjectsList(creator.projects || []);
      if (creator.creativeDNA) {
        setCustomAiDNA(creator.creativeDNA);
      }
    }
  }, [creator]);

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    category: 'Product Visuals',
    creativeStyle: 'Cinematic & Editorial',
    tools: 'Midjourney v6, Runway Gen-3',
    format: '4K Stills Suite',
    platform: 'Campaign OOH & Digital',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    visibility: 'published',
    featured: false,
    role: 'Lead Visual Artist',
    clientType: 'Commercial Campaign'
  });
  const [projectFormErrors, setProjectFormErrors] = useState({});

  // Opportunities & Saved state
  const [opportunitiesList, setOpportunitiesList] = useState(opportunities);
  const [savedOppIds, setSavedOppIds] = useState(['opp-summer-skincare']);
  const [selectedOpportunityForModal, setSelectedOpportunityForModal] = useState(null);
  const [applyModalOpp, setApplyModalOpp] = useState(null);
  const [applyNoteText, setApplyNoteText] = useState('');

  // Synchronize opportunities when published by brands,
  // preserving any locally-applied statuses that are not in the parent prop.
  useEffect(() => {
    if (opportunities) {
      setOpportunitiesList(prev => {
        // Build a set of IDs that have been locally marked as 'applied'
        const appliedIds = new Set(
          prev.filter(o => o.status === 'applied').map(o => o.id)
        );
        // Merge parent opportunities while preserving applied status
        return opportunities.map(o =>
          appliedIds.has(o.id) ? { ...o, status: 'applied' } : o
        );
      });
    }
  }, [opportunities]);

  // Invitations state (synced with shared props)
  const [localInvitationsList, setLocalInvitationsList] = useState(INITIAL_CREATOR_INVITATIONS);
  const invitationsList = propInvitations || localInvitationsList;
  const [invitationNotice, setInvitationNotice] = useState(null);

  // Projects / Collaborations state (synced with shared props)
  const [localProjects, setLocalProjects] = useState(INITIAL_CREATOR_PROJECTS);
  const projectsCollaborations = propProjects || localProjects;
  const [submitModalProject, setSubmitModalProject] = useState(null);
  const [deliverableForm, setDeliverableForm] = useState({
    assetsUrl: '',
    notes: '',
    milestone: 'Milestone 2 of 3'
  });

  // Messages state
  const [creatorConnections, setCreatorConnections] = useState(() => {
    return connections.length > 0 ? connections : [
      {
        id: "conn-lumina-skincare",
        campaignTitle: "Summer Skincare & Radiant Hydration Launch",
        brandName: "Lumina Botanica",
        status: "connected",
        messages: [
          {
            id: "msg-1",
            sender: "brand",
            senderName: "Lumina Botanica",
            text: "Hi Maya, we loved your cinematic product work. We'd love to explore this direction for our summer launch.",
            timestamp: "Yesterday, 3:45 PM"
          },
          {
            id: "msg-2",
            sender: "creator",
            senderName: activeCreator.name || "Maya Chen",
            text: "Thanks! I'd love to work on it. I'm especially interested in the visual storytelling direction and warm Mediterranean sunlight.",
            timestamp: "Today, 10:15 AM"
          }
        ]
      }
    ];
  });

  // Single source of truth: synchronize with connections prop while preserving local demo fallback
  const activeConnectionsList = useMemo(() => {
    const forMe = (connections || []).filter(c => !c.creatorId || c.creatorId === activeCreator?.id);
    if (forMe.length > 0) return forMe;
    if ((connections || []).length > 0) return connections;
    return creatorConnections;
  }, [connections, activeCreator?.id, creatorConnections]);

  const [selectedConnectionId, setSelectedConnectionId] = useState(() => {
    const initial = (connections && connections.length > 0) ? connections : creatorConnections;
    return initial[0]?.id || null;
  });
  const [chatInputText, setChatInputText] = useState('');

  // Keep selectedConnectionId pointing to a valid connection
  useEffect(() => {
    if (activeConnectionsList.length > 0) {
      if (!selectedConnectionId || !activeConnectionsList.some(c => c.id === selectedConnectionId)) {
        setSelectedConnectionId(activeConnectionsList[0].id);
      }
    }
  }, [activeConnectionsList, selectedConnectionId]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: activeCreator.name || 'Maya Chen',
    creativeIdentity: activeCreator.creativeIdentity || 'Cinematic AI Director & Visual Worldbuilder',
    bio: activeCreator.bio || 'Directing cinematic narrative commercials, evocative brand mythologies, and cinematic product worlds with 35mm grain.',
    location: activeCreator.location || 'London / New York (GMT/EST)',
    availability: activeCreator.availability || 'Available for projects'
  });
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);
  const [customAiDNA, setCustomAiDNA] = useState(null);
  const [isDnaAnalyzing, setIsDnaAnalyzing] = useState(false);

  // Creator DNA attributes calculation (live Groq or deterministic fallback)
  const creatorDNA = customAiDNA || generateCreatorDNA(activeCreator);

  const handleRegenerateDNA = async () => {
    setIsDnaAnalyzing(true);
    try {
      const res = await generateCreatorDNAWithGroq(activeCreator);
      if (res) {
        setCustomAiDNA(res);
        if (onUpdateCreator) {
          onUpdateCreator({ ...activeCreator, creativeDNA: res });
        }
      }
    } catch (e) {
      console.error('[Creator DNA UI] Error updating DNA:', e);
    } finally {
      setIsDnaAnalyzing(false);
    }
  };

  // Quick stats
  const portfolioCompletion = Math.min(100, Math.round((projectsList.length / 5) * 100));

  // --- Handlers: Portfolio Project ---
  const handleOpenAddProject = (existing = null) => {
    if (existing) {
      setEditingProject(existing);
      setProjectForm({
        title: existing.title || '',
        description: existing.description || '',
        category: existing.category || 'Product Visuals',
        creativeStyle: existing.creativeStyle || 'Cinematic & Editorial',
        tools: existing.tools || 'Midjourney v6, Runway Gen-3',
        format: existing.format || '4K Stills Suite',
        platform: existing.platform || 'Campaign OOH & Digital',
        image: existing.image || '',
        visibility: existing.visibility || 'published',
        featured: !!existing.featured,
        role: existing.role || 'Lead Visual Artist',
        clientType: existing.clientType || 'Commercial Campaign'
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: '',
        description: '',
        category: 'Product Visuals',
        creativeStyle: 'Cinematic & Editorial',
        tools: 'Midjourney v6, Runway Gen-3',
        format: '4K Stills Suite',
        platform: 'Campaign OOH & Digital',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
        visibility: 'published',
        featured: false,
        role: 'Lead Visual Artist',
        clientType: 'Commercial Campaign'
      });
    }
    setProjectFormErrors({});
    setIsAddProjectModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    const errors = {};
    if (!projectForm.title.trim()) errors.title = 'Project title is required';
    if (!projectForm.description.trim()) errors.description = 'Description is required';
    if (!projectForm.image.trim()) errors.image = 'Media preview URL is required';

    if (Object.keys(errors).length > 0) {
      setProjectFormErrors(errors);
      return;
    }

    let updatedList;
    if (editingProject) {
      updatedList = projectsList.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...projectForm }
          : p
      );
    } else {
      const newProj = {
        id: `proj-${Date.now()}`,
        ...projectForm,
        createdAt: 'Just now'
      };
      updatedList = [newProj, ...projectsList];
    }

    setProjectsList(updatedList);
    if (onUpdateCreator) {
      onUpdateCreator({ ...activeCreator, projects: updatedList });
    }

    setIsAddProjectModalOpen(false);
  };

  const handleDeleteProject = (projId) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this project from your portfolio?')) {
      return;
    }
    const updatedList = projectsList.filter(p => p.id !== projId);
    setProjectsList(updatedList);
    if (onUpdateCreator) {
      onUpdateCreator({ ...activeCreator, projects: updatedList });
    }
  };

  const handleToggleVisibility = (projId) => {
    const updatedList = projectsList.map(p => {
      if (p.id === projId) {
        const nextVis = p.visibility === 'private' ? 'published' : 'private';
        return { ...p, visibility: nextVis };
      }
      return p;
    });
    setProjectsList(updatedList);
    if (onUpdateCreator) {
      onUpdateCreator({ ...activeCreator, projects: updatedList });
    }
  };

  const handleToggleFeatured = (projId) => {
    const updatedList = projectsList.map(p => {
      if (p.id === projId) {
        return { ...p, featured: !p.featured };
      }
      return p;
    });
    setProjectsList(updatedList);
    if (onUpdateCreator) {
      onUpdateCreator({ ...activeCreator, projects: updatedList });
    }
  };

  const handleReorderProject = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projectsList.length) return;
    const newList = [...projectsList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIdx, 0, moved);
    setProjectsList(newList);
    if (onUpdateCreator) {
      onUpdateCreator({ ...activeCreator, projects: newList });
    }
  };

  // --- Handlers: Opportunities ---
  const handleToggleSaveOpportunity = (oppId) => {
    setSavedOppIds(prev => 
      prev.includes(oppId) ? prev.filter(id => id !== oppId) : [...prev, oppId]
    );
  };

  const handleOpenApplyModal = (opp) => {
    setApplyModalOpp(opp);
    setApplyNoteText(`Hi ${opp.brand}, I'm excited about your ${opp.title}. My visual style in ${activeCreator.creativeIdentity || 'generative direction'} aligns directly with your deliverables.`);
  };

  const handleSendApplication = (e) => {
    e.preventDefault();
    if (!applyModalOpp) return;

    if (onOpportunityResponse) {
      // Parent creates the authoritative connection in marketplaceData.connections;
      // it will flow back via the connections prop and activeConnectionsList.
      // The selection-validity useEffect (line 138) will auto-select the new connection.
      onOpportunityResponse(applyModalOpp, applyNoteText);
    } else {
      // Demo/standalone fallback: no parent handler, so manage connections locally
      const newConn = {
        id: `conn-opp-${applyModalOpp.id}-${Date.now()}`,
        campaignTitle: applyModalOpp.title,
        brandName: applyModalOpp.brand,
        status: 'connected',
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'creator',
            senderName: activeCreator.name,
            text: applyNoteText,
            timestamp: 'Just now'
          }
        ]
      };
      setCreatorConnections(prev => [newConn, ...prev]);
      setSelectedConnectionId(newConn.id);
    }

    // Update opportunity status
    setOpportunitiesList(prev => prev.map(o => 
      o.id === applyModalOpp.id ? { ...o, status: 'applied' } : o
    ));

    setApplyModalOpp(null);
    setInvitationNotice(`Application sent to ${applyModalOpp.brand}! Connection opened in Messages.`);
    setTimeout(() => setInvitationNotice(null), 4000);
  };

  // --- Handlers: Invitations (Accept / Decline) ---
  const handleAcceptInvitation = (invitation) => {
    if (propOnAcceptInvitation) {
      propOnAcceptInvitation(invitation);
    } else {
      setLocalInvitationsList(prev => prev.map(inv => 
        inv.id === invitation.id ? { ...inv, status: 'accepted' } : inv
      ));
      const newProject = {
        id: `proj-collab-${invitation.id}`,
        campaignId: invitation.campaignId,
        campaignTitle: invitation.title,
        brandName: invitation.brandName || invitation.brand,
        brandContact: "Creative Director",
        status: "in-progress",
        progressPercent: 30,
        milestone: "Milestone 1 of 3: Moodboard & Concept Alignment",
        deadline: invitation.timeline,
        agreedBudget: invitation.budget,
        deliverablesScope: invitation.deliverables,
        latestFeedback: "“Invitation accepted. Welcome to the team! Looking forward to first concept passes.”",
        submissionUrl: "",
        submissionNotes: ""
      };
      setLocalProjects(prev => [newProject, ...prev]);
    }

    setInvitationNotice(`Invitation from ${invitation.brandName || invitation.brand} accepted! Collaboration project activated.`);
    setTimeout(() => setInvitationNotice(null), 5000);
  };

  const handleDeclineInvitation = (invitation) => {
    if (propOnDeclineInvitation) {
      propOnDeclineInvitation(invitation);
    } else {
      setLocalInvitationsList(prev => prev.map(inv => 
        inv.id === invitation.id ? { ...inv, status: 'declined' } : inv
      ));
    }
    setInvitationNotice(`Invitation from ${invitation.brandName || invitation.brand} politely declined.`);
    setTimeout(() => setInvitationNotice(null), 4000);
  };

  // --- Handlers: Projects (Deliverable Submission) ---
  const handleSubmitDeliverables = (e) => {
    e.preventDefault();
    if (!submitModalProject || !deliverableForm.assetsUrl.trim()) return;

    if (propOnSubmitDeliverables) {
      propOnSubmitDeliverables(submitModalProject.id, {
        assetsUrl: deliverableForm.assetsUrl.trim(),
        notes: deliverableForm.notes.trim(),
        milestone: deliverableForm.milestone
      });
    } else {
      setLocalProjects(prev => prev.map(p => {
        if (p.id === submitModalProject.id) {
          return {
            ...p,
            status: 'submitted',
            progressPercent: Math.min(100, p.progressPercent + 25),
            submissionUrl: deliverableForm.assetsUrl,
            submissionNotes: deliverableForm.notes,
            latestFeedback: "“Deliverables received! Brand creative director reviewing passes.”"
          };
        }
        return p;
      }));
    }

    setSubmitModalProject(null);
    setDeliverableForm({ assetsUrl: '', notes: '', milestone: 'Milestone 2 of 3' });
    setInvitationNotice(`Deliverables submitted for ${submitModalProject.campaignTitle}!`);
    setTimeout(() => setInvitationNotice(null), 4000);
  };

  // --- Handlers: Chat Messages ---
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    const trimmed = chatInputText.trim();
    if (!trimmed || !selectedConnectionId) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'creator',
      senderName: activeCreator.name || 'Creator',
      text: trimmed,
      timestamp: 'Just now'
    };

    if (propOnSendMessage) {
      // Parent handler is the single source of truth: it updates
      // marketplaceData.connections which flows back via the connections prop.
      // activeConnectionsList prioritizes prop connections, so a local
      // setCreatorConnections update here would be invisible (dead write).
      propOnSendMessage(selectedConnectionId, newMsg);
    } else {
      // Demo/standalone fallback: no parent handler, manage messages locally
      setCreatorConnections(prev => prev.map(c => {
        if (c.id === selectedConnectionId) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg]
          };
        }
        return c;
      }));
    }

    setChatInputText('');
  };

  // --- Handlers: Profile Save ---
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...activeCreator,
      ...profileForm
    };
    setActiveCreator(updated);
    if (onUpdateCreator) {
      onUpdateCreator(updated);
    }
    setProfileSuccessNotice(true);
    setTimeout(() => setProfileSuccessNotice(false), 3500);
  };

  const activeConnection = activeConnectionsList.find(c => c.id === selectedConnectionId) || activeConnectionsList[0] || null;

  const filteredProjects = portfolioCategoryFilter === 'all'
    ? projectsList
    : projectsList.filter(p => p.category?.toLowerCase().includes(portfolioCategoryFilter.toLowerCase()));

  return (
    <div className="creator-studio-workspace">
      {/* Studio Banner Notice */}
      {invitationNotice && (
        <div className="studio-top-toast">
          <CheckCircle2 size={16} />
          <span>{invitationNotice}</span>
        </div>
      )}

      <div className="page-container">
        {/* Workspace Top Header Bar */}
        <div className="studio-workspace-header">
          <div className="studio-header-welcome">
            <div className="studio-identity-pill">
              <span className="dot-pulse" />
              <span>Creator Studio • Portfolio-First Workspace</span>
            </div>
            <h1 className="studio-welcome-title">
              Your next creative chapter starts here.
            </h1>
            <p className="studio-welcome-sub">
              Manage your portfolio, accept brand invitations, collaborate on active briefs, and showcase your Creator DNA.
            </p>
          </div>

          <div className="studio-header-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onViewPublicProfile}
            >
              <Eye size={15} />
              <span>Public Profile</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary btn-sm studio-add-work-btn"
              onClick={() => handleOpenAddProject()}
            >
              <Plus size={15} />
              <span>Add to Portfolio</span>
            </button>
          </div>
        </div>

        {/* Studio Primary Navigation Tabs */}
        <div className="studio-nav-bar" role="tablist" aria-label="Creator Studio Navigation">
          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'overview'}
            className={`studio-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>Overview</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'portfolio'}
            className={`studio-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <span>My Portfolio</span>
            <span className="tab-count-pill">{projectsList.length}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'opportunities'}
            className={`studio-tab-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            <span>Opportunities</span>
            <span className="tab-count-pill">{opportunitiesList.length}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'invitations'}
            className={`studio-tab-btn ${activeTab === 'invitations' ? 'active' : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            <span>Invitations</span>
            <span className="tab-count-pill highlight">{invitationsList.filter(i => i.status === 'pending').length}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'projects'}
            className={`studio-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <span>Projects</span>
            <span className="tab-count-pill">{projectsCollaborations.length}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'messages'}
            className={`studio-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span>Messages</span>
            <span className="tab-count-pill">{activeConnectionsList.length}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            aria-selected={activeTab === 'profile'}
            className={`studio-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>Profile & DNA</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW
            ======================================================== */}
        {activeTab === 'overview' && (
          <div className="studio-overview-view">
            {/* Top Grid: Profile Summary & Creator DNA */}
            <div className="overview-summary-grid">
              {/* Creator Profile Summary Card */}
              <div className="studio-card overview-profile-card">
                <div className="overview-avatar-row">
                  <div className="overview-avatar-wrap">
                    <img 
                      src={activeCreator.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"} 
                      alt={activeCreator.name}
                      className="overview-avatar-img"
                    />
                    <span className="avatar-online-dot" />
                  </div>

                  <div className="overview-name-meta">
                    <div className="overview-name-badge">
                      <h2 className="overview-creator-name">{activeCreator.name || 'Maya Chen'}</h2>
                      <span className="status-badge-verified">
                        <CheckCircle2 size={13} />
                        <span>Verified AI Creator</span>
                      </span>
                    </div>
                    <p className="overview-creator-role">{activeCreator.creativeIdentity || 'Cinematic AI Director & Visual Worldbuilder'}</p>
                    <span className="overview-creator-loc">{activeCreator.location || 'London / New York'}</span>
                  </div>
                </div>

                <p className="overview-bio-text">
                  {activeCreator.bio || 'Directing cinematic narrative commercials, evocative brand mythologies, and cinematic product worlds.'}
                </p>

                {/* Progress & Availability Bars */}
                <div className="overview-metrics-row">
                  <div className="metric-box">
                    <span className="metric-label">Portfolio Completion</span>
                    <div className="metric-progress-bar">
                      <div className="metric-progress-fill" style={{ width: `${portfolioCompletion}%` }} />
                    </div>
                    <span className="metric-val">{portfolioCompletion}% Complete</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">Availability Status</span>
                    <span className="availability-pill active-available">
                      <span className="dot-green" />
                      <span>{activeCreator.availability || 'Available for projects'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator DNA Preview Card */}
              <div className="studio-card overview-dna-card">
                <div className="dna-card-header">
                  <div className="dna-header-title">
                    <Dna size={16} className="text-lavender" />
                    <h3>Creator DNA Summary</h3>
                  </div>
                  <span className="dna-verified-pill">Portfolio-Derived</span>
                </div>

                <p className="dna-desc">
                  Nuanced visual attributes extracted from your published commercial works and aesthetic prompt signatures.
                </p>

                <div className="dna-attributes-list">
                  <div className="dna-attribute-item">
                    <div className="dna-attr-label">
                      <span>Cinematic Anamorphic Lighting</span>
                      <span className="dna-attr-val">96%</span>
                    </div>
                    <div className="dna-attr-bar">
                      <div className="dna-attr-fill" style={{ width: '96%', background: 'var(--accent-lavender-deep)' }} />
                    </div>
                  </div>

                  <div className="dna-attribute-item">
                    <div className="dna-attr-label">
                      <span>Story-Driven Narrative Atmosphere</span>
                      <span className="dna-attr-val">94%</span>
                    </div>
                    <div className="dna-attr-bar">
                      <div className="dna-attr-fill" style={{ width: '94%', background: 'var(--accent-peach-deep)' }} />
                    </div>
                  </div>

                  <div className="dna-attribute-item">
                    <div className="dna-attr-label">
                      <span>35mm Film Grain & Organic Caustics</span>
                      <span className="dna-attr-val">92%</span>
                    </div>
                    <div className="dna-attr-bar">
                      <div className="dna-attr-fill" style={{ width: '92%', background: 'var(--accent-mint-deep)' }} />
                    </div>
                  </div>

                  <div className="dna-attribute-item">
                    <div className="dna-attr-label">
                      <span>High-Fashion Macro Physics</span>
                      <span className="dna-attr-val">88%</span>
                    </div>
                    <div className="dna-attr-bar">
                      <div className="dna-attr-fill" style={{ width: '88%', background: '#64748B' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Recent Portfolio Highlights */}
            <div className="overview-section-block">
              <div className="overview-block-header">
                <div>
                  <h3 className="overview-block-title">My Portfolio Showcase</h3>
                  <p className="overview-block-subtitle">High-fidelity project previews visible to brands and agencies.</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('portfolio')}
                >
                  <span>View All ({projectsList.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="overview-portfolio-grid">
                {projectsList.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="overview-project-card">
                    <div className="overview-proj-img-wrap">
                      <img 
                        src={proj.image} 
                        alt={proj.title}
                        className="overview-proj-img"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85";
                        }}
                      />
                      <span className="overview-proj-tag">{proj.category || 'Product'}</span>
                    </div>
                    <div className="overview-proj-body">
                      <h4 className="overview-proj-name">{proj.title}</h4>
                      <p className="overview-proj-desc">{proj.description}</p>
                    </div>
                  </div>
                ))}

                <button 
                  type="button" 
                  className="overview-add-card-placeholder"
                  onClick={() => handleOpenAddProject()}
                >
                  <Plus size={24} />
                  <span>Add New Project</span>
                  <small>Upload stills, video loops, or CGI key art</small>
                </button>
              </div>
            </div>

            {/* Bottom Row: Pending Invitations & New Opportunities Glance */}
            <div className="overview-activity-grid">
              {/* Pending Invitations Glance */}
              <div className="studio-card activity-card">
                <div className="activity-card-header">
                  <div className="activity-header-left">
                    <Sparkles size={16} className="text-peach" />
                    <h4>Pending Brand Invitations</h4>
                  </div>
                  <button 
                    type="button" 
                    className="link-subtle"
                    onClick={() => setActiveTab('invitations')}
                  >
                    Manage Invitations →
                  </button>
                </div>

                <div className="activity-items-list">
                  {invitationsList.filter(i => i.status === 'pending').slice(0, 2).map((inv) => (
                    <div key={inv.id} className="activity-item-row">
                      <img src={inv.brandAvatar} alt={inv.brand} className="activity-brand-avatar" />
                      <div className="activity-item-details">
                        <span className="activity-brand-name">{inv.brand}</span>
                        <span className="activity-camp-title">{inv.title}</span>
                        <div className="activity-meta-pills">
                          <span>{inv.budget}</span>
                          <span>{inv.timeline}</span>
                        </div>
                      </div>
                      <div className="activity-quick-actions">
                        <button 
                          type="button" 
                          className="btn btn-primary btn-xs"
                          onClick={() => handleAcceptInvitation(inv)}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                  {invitationsList.filter(i => i.status === 'pending').length === 0 && (
                    <p className="empty-subtle">No pending invitations. Active collaborations will appear in Projects.</p>
                  )}
                </div>
              </div>

              {/* Opportunities Glance */}
              <div className="studio-card activity-card">
                <div className="activity-card-header">
                  <div className="activity-header-left">
                    <Briefcase size={16} className="text-lavender" />
                    <h4>Recommended Opportunities</h4>
                  </div>
                  <button 
                    type="button" 
                    className="link-subtle"
                    onClick={() => setActiveTab('opportunities')}
                  >
                    Browse All →
                  </button>
                </div>

                <div className="activity-items-list">
                  {opportunitiesList.slice(0, 2).map((opp) => (
                    <div key={opp.id} className="activity-item-row">
                      <div className="activity-item-details">
                        <span className="activity-brand-name">{opp.brand}</span>
                        <span className="activity-camp-title">{opp.title}</span>
                        <p className="activity-fit-reason">{opp.whyItFits}</p>
                      </div>
                      <button 
                        type="button" 
                        className={`btn ${opp.status === 'applied' ? 'btn-secondary' : 'btn-primary'} btn-xs`}
                        onClick={() => handleOpenApplyModal(opp)}
                        disabled={opp.status === 'applied'}
                      >
                        {opp.status === 'applied' ? 'Interest Expressed' : 'Apply'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: MY PORTFOLIO
            ======================================================== */}
        {activeTab === 'portfolio' && (
          <div className="studio-portfolio-view">
            {/* Filter and Action Header */}
            <div className="portfolio-subnav-row">
              <div className="portfolio-filters-group">
                {['all', 'product', 'fashion', 'video', '3d'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`portfolio-filter-pill ${portfolioCategoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setPortfolioCategoryFilter(cat)}
                  >
                    {cat === 'all' ? 'All Works' : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={onViewPublicProfile}
                  title="Preview your public brand-facing portfolio"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} />
                  <span>Preview as Brand</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenAddProject()}
                >
                  <Plus size={15} />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {/* Consistent Grid with Uniform Aspect Ratio */}
            {filteredProjects.length > 0 ? (
              <div className="portfolio-workspace-grid">
                {filteredProjects.map((proj, idx) => (
                  <div key={proj.id} className="portfolio-card-item">
                    <div className="portfolio-item-media" style={{ position: 'relative' }}>
                      <img 
                        src={proj.image} 
                        alt={proj.title}
                        className="portfolio-item-img"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85";
                        }}
                      />
                      <span className="portfolio-cat-badge">{proj.category || 'Visual Art'}</span>

                      {/* Top Badges: Visibility & Featured */}
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 3 }}>
                        {proj.featured && (
                          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.9)', color: '#FFFFFF', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            ★ Featured
                          </span>
                        )}
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '3px 8px', 
                          borderRadius: '100px', 
                          background: proj.visibility === 'private' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)', 
                          color: '#FFFFFF', 
                          fontWeight: 600 
                        }}>
                          {proj.visibility === 'private' ? 'Private Draft' : 'Published'}
                        </span>
                      </div>

                      <div className="portfolio-hover-controls">
                        <button
                          type="button"
                          className="control-icon-btn"
                          title={proj.visibility === 'private' ? "Publish Project (Visible to Brands)" : "Make Private (Hide from Brands)"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleVisibility(proj.id);
                          }}
                        >
                          {proj.visibility === 'private' ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          type="button"
                          className="control-icon-btn"
                          title={proj.featured ? "Remove from Featured" : "Feature on Portfolio"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFeatured(proj.id);
                          }}
                        >
                          <Star size={14} fill={proj.featured ? "#F59E0B" : "none"} stroke={proj.featured ? "#F59E0B" : "currentColor"} />
                        </button>
                        <button 
                          type="button" 
                          className="control-icon-btn"
                          title="Edit Project"
                          onClick={() => handleOpenAddProject(proj)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="control-icon-btn danger"
                          title="Delete Project"
                          onClick={() => handleDeleteProject(proj.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="portfolio-item-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h3 className="portfolio-item-title" style={{ margin: 0 }}>{proj.title}</h3>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="reorder-arrow-btn"
                            disabled={idx === 0}
                            onClick={() => handleReorderProject(projectsList.findIndex(p => p.id === proj.id), -1)}
                            title="Move Earlier"
                            style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '4px', padding: '3px 5px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className="reorder-arrow-btn"
                            disabled={idx === filteredProjects.length - 1}
                            onClick={() => handleReorderProject(projectsList.findIndex(p => p.id === proj.id), 1)}
                            title="Move Later"
                            style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '4px', padding: '3px 5px', cursor: idx === filteredProjects.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === filteredProjects.length - 1 ? 0.4 : 1 }}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      {proj.role && (
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                          Role: {proj.role} {proj.clientType ? `• ${proj.clientType}` : ''}
                        </p>
                      )}

                      <p className="portfolio-item-desc">{proj.description}</p>
                      
                      <div className="portfolio-item-tags">
                        <span className="tag-chip">{proj.creativeStyle || 'Cinematic'}</span>
                        <span className="tag-chip">{proj.tools || 'Midjourney'}</span>
                        {proj.visibility === 'private' && (
                          <span className="tag-chip" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 600 }}>
                            Hidden from Brands
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="portfolio-empty-state">
                <Palette size={48} className="empty-state-icon" />
                <h3 className="empty-state-title">Your work deserves to be seen.</h3>
                <p className="empty-state-desc">
                  Add your first project to start building your portfolio and receiving tailored brand opportunities.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary btn-md"
                  onClick={() => handleOpenAddProject()}
                >
                  <Plus size={16} />
                  <span>Create Your First Project</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: OPPORTUNITIES
            ======================================================== */}
        {activeTab === 'opportunities' && (
          <div className="studio-opportunities-view">
            <div className="section-intro-bar">
              <div>
                <h2 className="section-title-sm">Campaign Opportunities</h2>
                <p className="section-desc-sm">Curated commercial briefs matching your Creator DNA and verified portfolio strengths.</p>
              </div>
            </div>

            <div className="opportunities-grid-view">
              {opportunitiesList.map((opp) => {
                const isSaved = savedOppIds.includes(opp.id);
                return (
                  <div key={opp.id} className="studio-card opportunity-card-item">
                    <div className="opp-header-row">
                      <div className="opp-brand-info">
                        <span className="opp-brand-name">{opp.brand}</span>
                        <h3 className="opp-campaign-title">{opp.title}</h3>
                      </div>
                      <button 
                        type="button" 
                        className={`btn-icon-bookmark ${isSaved ? 'saved' : ''}`}
                        onClick={() => handleToggleSaveOpportunity(opp.id)}
                        title={isSaved ? "Saved" : "Save opportunity"}
                      >
                        {isSaved ? <BookmarkCheck size={18} className="text-peach" /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <div className="opp-specs-chips">
                      <span className="spec-chip">
                        <DollarSign size={13} />
                        <span>{opp.budget}</span>
                      </span>
                      <span className="spec-chip">
                        <Clock size={13} />
                        <span>{opp.timeline}</span>
                      </span>
                    </div>

                    <p className="opp-direction-text">{opp.creativeDirection}</p>

                    <div className="opp-requirements-box">
                      <span className="box-mini-title">Key Deliverables:</span>
                      <ul className="req-list">
                        {(opp.requirements || []).map((req, rIdx) => (
                          <li key={rIdx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="opp-match-fit-note">
                      <Sparkles size={14} className="text-lavender" />
                      <span>{opp.whyItFits}</span>
                    </div>

                    <div className="opp-card-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedOpportunityForModal(opp)}
                      >
                        <span>View Brief</span>
                      </button>

                      <button 
                        type="button" 
                        className={`btn ${opp.status === 'applied' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        onClick={() => handleOpenApplyModal(opp)}
                        disabled={opp.status === 'applied'}
                      >
                        <span>{opp.status === 'applied' ? 'Interest Expressed' : 'Apply / Express Interest'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: INVITATIONS (Dedicated Brand Invitation System)
            ======================================================== */}
        {activeTab === 'invitations' && (
          <div className="studio-invitations-view">
            <div className="section-intro-bar">
              <div>
                <h2 className="section-title-sm">Direct Brand Invitations</h2>
                <p className="section-desc-sm">Invitations sent specifically to you by creative directors and brands ready to commission work.</p>
              </div>
            </div>

            <div className="invitations-list-container">
              {invitationsList.map((inv) => (
                <div key={inv.id} className={`studio-card invitation-item-card ${inv.status}`}>
                  <div className="inv-top-bar">
                    <div className="inv-brand-badge-wrap">
                      <img src={inv.brandAvatar} alt={inv.brand} className="inv-brand-avatar" />
                      <div>
                        <span className="inv-brand-label">{inv.brand}</span>
                        <h3 className="inv-campaign-heading">{inv.title}</h3>
                      </div>
                    </div>

                    <span className={`inv-status-pill ${inv.status}`}>
                      {inv.status === 'pending' && 'Pending Your Review'}
                      {inv.status === 'accepted' && 'Accepted & Active'}
                      {inv.status === 'declined' && 'Declined'}
                    </span>
                  </div>

                  <p className="inv-summary-quote">
                    “{inv.summary}”
                  </p>

                  <div className="inv-details-grid">
                    <div className="inv-detail-box">
                      <span className="detail-label">Agreed Budget</span>
                      <span className="detail-value">{inv.budget}</span>
                    </div>
                    <div className="inv-detail-box">
                      <span className="detail-label">Timeline & Delivery</span>
                      <span className="detail-value">{inv.timeline}</span>
                    </div>
                    <div className="inv-detail-box">
                      <span className="detail-label">Deliverables Required</span>
                      <span className="detail-value">{inv.deliverables}</span>
                    </div>
                  </div>

                  {inv.status === 'pending' && (
                    <div className="inv-actions-row">
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeclineInvitation(inv)}
                      >
                        Decline
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcceptInvitation(inv)}
                      >
                        <Check size={15} />
                        <span>Accept Invitation & Open Studio</span>
                      </button>
                    </div>
                  )}

                  {inv.status === 'accepted' && (
                    <div className="inv-accepted-footer">
                      <CheckCircle2 size={15} className="text-mint" />
                      <span>Collaboration project active in Projects tab. Direct chat enabled in Messages.</span>
                      <button 
                        type="button" 
                        className="link-subtle"
                        onClick={() => setActiveTab('projects')}
                      >
                        Go to Project →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PROJECTS (Active Collaborations)
            ======================================================== */}
        {activeTab === 'projects' && (
          <div className="studio-projects-view">
            <div className="section-intro-bar">
              <div>
                <h2 className="section-title-sm">Active & Completed Collaborations</h2>
                <p className="section-desc-sm">Track milestones, submit deliverables, and review client feedback in one place.</p>
              </div>
            </div>

            <div className="projects-collaborations-grid">
              {projectsCollaborations.map((proj) => (
                <div key={proj.id} className="studio-card project-collab-card">
                  <div className="collab-header">
                    <div>
                      <span className="collab-brand-tag">{proj.brandName} • {proj.brandContact}</span>
                      <h3 className="collab-title">{proj.campaignTitle}</h3>
                    </div>
                    <span className={`collab-status-badge ${proj.status}`}>
                      {proj.status === 'in-progress' && 'In Progress'}
                      {proj.status === 'submitted' && 'Review in Progress'}
                      {proj.status === 'revision-requested' && 'Revision Requested'}
                      {proj.status === 'approved' && 'Approved & Paid'}
                    </span>
                  </div>

                  {/* Progress Milestone Bar */}
                  <div className="collab-milestone-section">
                    <div className="milestone-label-row">
                      <span className="milestone-name">{proj.milestone}</span>
                      <span className="milestone-percent">{proj.progressPercent}%</span>
                    </div>
                    <div className="milestone-track">
                      <div className="milestone-fill" style={{ width: `${proj.progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="collab-meta-row">
                    <span><strong>Deadline:</strong> {proj.deadline}</span>
                    <span><strong>Budget:</strong> {proj.agreedBudget}</span>
                    <span><strong>Scope:</strong> {proj.deliverablesScope}</span>
                  </div>

                  {/* Revision Alert Callout */}
                  {proj.status === 'revision-requested' && (
                    <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', margin: '14px 0', fontSize: '0.86rem', color: '#B45309' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                        <AlertCircle size={14} />
                        <span>Action Required: Brand Lead Requested Revisions</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {proj.latestFeedback || 'Please review requested lighting and color adjustments and resubmit deliverables.'}
                      </p>
                    </div>
                  )}

                  {/* Latest Client Feedback */}
                  {proj.status !== 'revision-requested' && proj.latestFeedback && (
                    <div className="collab-feedback-callout">
                      <MessageSquare size={14} className="text-peach" />
                      <p>{proj.latestFeedback}</p>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="collab-actions-row">
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('messages')}
                    >
                      <MessageSquare size={14} />
                      <span>Open Messages</span>
                    </button>

                    {proj.status !== 'approved' && (
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        style={proj.status === 'revision-requested' ? { background: '#D97706', borderColor: '#D97706' } : {}}
                        onClick={() => {
                          setSubmitModalProject(proj);
                          setDeliverableForm({
                            assetsUrl: proj.submissionUrl || '',
                            notes: proj.submissionNotes || '',
                            milestone: proj.milestone || 'Milestone 2 of 3'
                          });
                        }}
                      >
                        <Upload size={14} />
                        <span>{proj.status === 'revision-requested' ? 'Resubmit Revised Deliverable' : proj.status === 'submitted' ? 'Update Deliverable' : 'Submit Deliverable'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: MESSAGES
            ======================================================== */}
        {activeTab === 'messages' && (
          <div className="studio-messages-view">
            <div className="studio-chat-container studio-card">
              {/* Left Conversations Sidebar */}
              <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                  <h4>Collaborations ({activeConnectionsList.length})</h4>
                </div>
                <div className="chat-threads-list">
                  {activeConnectionsList.map((conn) => (
                    <button
                      key={conn.id}
                      type="button"
                      className={`chat-thread-btn ${conn.id === selectedConnectionId ? 'active' : ''}`}
                      onClick={() => setSelectedConnectionId(conn.id)}
                    >
                      <div className="thread-avatar">
                        <Briefcase size={16} />
                      </div>
                      <div className="thread-info">
                        <span className="thread-brand">{conn.brandName}</span>
                        <span className="thread-brief">{conn.campaignTitle}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Active Conversation Room */}
              <div className="chat-main-room">
                <div className="chat-room-header">
                  <div className="room-brand-meta">
                    <h4>{activeConnection?.brandName}</h4>
                    <span className="room-brief-title">{activeConnection?.campaignTitle}</span>
                  </div>
                  <span className="room-status-badge">Connected Room</span>
                </div>

                <div className="chat-messages-history">
                  {(activeConnection?.messages || []).map((msg) => (
                    <div key={msg.id} className={`chat-message-bubble ${msg.sender === 'creator' ? 'outgoing' : 'incoming'}`}>
                      <span className="bubble-sender">{msg.senderName}</span>
                      <p className="bubble-text">{msg.text}</p>
                      <span className="bubble-time">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} className="chat-compose-form">
                  <input 
                    type="text" 
                    className="form-input chat-input" 
                    placeholder={`Message ${activeConnection?.brandName}...`}
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm chat-send-btn">
                    <Send size={15} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: PROFILE & CREATOR DNA
            ======================================================== */}
        {activeTab === 'profile' && (
          <div className="studio-profile-view">
            {profileSuccessNotice && (
              <div className="notice-banner-success">
                <CheckCircle2 size={16} />
                <span>Profile changes successfully updated and published to your public creator page!</span>
              </div>
            )}

            <div className="profile-layout-grid">
              <div className="studio-card profile-form-card">
                <h3 className="card-section-title">Edit Creator Profile</h3>
                <p className="card-section-sub">Update your positioning, bio, and project availability.</p>

                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Creative Identity & Positioning</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={profileForm.creativeIdentity}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, creativeIdentity: e.target.value }))}
                      placeholder="e.g. Cinematic AI Director & Visual Worldbuilder"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio Statement</label>
                    <textarea 
                      className="form-textarea" 
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Location / Timezone</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Availability Status</label>
                      <select 
                        className="form-input"
                        value={profileForm.availability}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                      >
                        <option value="Available for projects">Available for projects</option>
                        <option value="Booking for Q4">Booking for Q4</option>
                        <option value="Open to select opportunities">Open to select opportunities</option>
                        <option value="Currently Booked">Currently Booked</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                    <button type="submit" className="btn btn-primary btn-md">
                      <span>Save Profile Changes</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-md"
                      onClick={onViewPublicProfile}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={15} />
                      <span>View Public Profile</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Creator DNA Detailed Provenance Card */}
              <div className="studio-card profile-dna-detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 className="card-section-title" style={{ margin: 0 }}>Creator DNA Dossier</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleRegenerateDNA}
                      disabled={isDnaAnalyzing}
                      style={{ fontSize: '0.74rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Sparkles size={11} style={{ color: 'var(--accent-lavender-deep)' }} />
                      <span>{isDnaAnalyzing ? 'Analyzing with AI...' : 'Regenerate DNA Insights'}</span>
                    </button>
                    <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 600 }}>
                      {creatorDNA.completeness?.tier || 'Verified Portfolio'}
                    </span>
                  </div>
                </div>
                <p className="card-section-sub">Transparent creative fingerprint distinguishing self-reported and verified evidence.</p>

                {creatorDNA.completeness && creatorDNA.completeness.isVerified === false && (
                  <div style={{ padding: '10px 14px', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '8px', marginTop: '10px', fontSize: '0.8rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>Limited portfolio evidence detected. Upload 2+ projects with documented tools and categories to verify your visual craft.</span>
                  </div>
                )}

                <div className="dna-detailed-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Category 1: Portfolio-Verified Evidence */}
                  <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.84rem', color: '#059669' }}>Portfolio-Verified Evidence</strong>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', fontWeight: 600 }}>Verified</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      • <strong>{creatorDNA.provenance.portfolioSupported.totalVerifiedProjects} real projects</strong> verified in your public portfolio.
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      • Verified formats: {creatorDNA.provenance.portfolioSupported.demonstratedFormats.join(', ')}
                    </p>
                  </div>

                  {/* Category 2: AI-Inferred Aesthetic Attributes */}
                  <div style={{ padding: '12px 14px', background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--accent-lavender-deep)' }}>AI-Inferred Creative Attributes</strong>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-lavender-deep)', fontWeight: 600 }}>Synthesized</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Visual Aesthetic:</strong> {creatorDNA.visualAesthetic}</div>
                      <div><strong>Storytelling Approach:</strong> {creatorDNA.storytellingApproach}</div>
                      <div><strong>Product Presentation:</strong> {creatorDNA.productPresentationStyle}</div>
                    </div>
                  </div>

                  {/* Category 3: Creator-Declared Information */}
                  <div style={{ padding: '12px 14px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>Creator-Declared Setup</strong>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Self-Reported</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Tools: {creatorDNA.provenance.creatorProvided.toolsUsed.join(', ')}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Active Platforms: {creatorDNA.provenance.creatorProvided.platformsActive.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="dna-info-callout" style={{ marginTop: '16px' }}>
                  <ShieldCheck size={16} className="text-lavender" />
                  <span>No client names or private audience stats are fabricated. Your DNA evolves transparently as you add projects.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT PORTFOLIO PROJECT
          ======================================================== */}
      {isAddProjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddProjectModalOpen(false)}>
          <div className="creator-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn"
              onClick={() => setIsAddProjectModalOpen(false)}
            >
              <X size={18} />
            </button>

            <div className="modal-header-block">
              <span className="section-label-pill">Portfolio Project</span>
              <h2 className="modal-title">{editingProject ? 'Edit Project' : 'Add to Portfolio'}</h2>
              <p className="modal-sub">Publish high-resolution work to showcase your visual craft to brands.</p>
            </div>

            <form onSubmit={handleSaveProject} className="modal-form">
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input 
                  type="text" 
                  className={`form-input ${projectFormErrors.title ? 'error' : ''}`}
                  placeholder="e.g. Echoes of the Solarium"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                />
                {projectFormErrors.title && <span className="error-text">{projectFormErrors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description & Creative Concept *</label>
                <textarea 
                  className={`form-textarea ${projectFormErrors.description ? 'error' : ''}`}
                  rows={3}
                  placeholder="Describe the aesthetic, lighting, and creative direction..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                />
                {projectFormErrors.description && <span className="error-text">{projectFormErrors.description}</span>}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Product Visuals">Product Visuals</option>
                    <option value="Fashion & Runway">Fashion & Runway</option>
                    <option value="Cinematic AI Video">Cinematic AI Video</option>
                    <option value="3D Art & Spatial">3D Art & Spatial</option>
                    <option value="Advertising Campaign">Advertising Campaign</option>
                    <option value="Social Content">Social Content</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Creative Style</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. 35mm Cinematic, Editorial"
                    value={projectForm.creativeStyle}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, creativeStyle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tools Used</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Midjourney v6, Runway Gen-3"
                    value={projectForm.tools}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, tools: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Content Format</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. 4K Stills Suite, 9:16 Video"
                    value={projectForm.format}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, format: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Creator Role / Contribution</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Generative Director & Editor"
                    value={projectForm.role}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client or Campaign Context</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Heritage Luxury House"
                    value={projectForm.clientType}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, clientType: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Visibility Status</label>
                  <select 
                    className="form-input"
                    value={projectForm.visibility}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, visibility: e.target.value }))}
                  >
                    <option value="published">Published (Visible to Brands on Public Profile)</option>
                    <option value="private">Private Draft (Hidden from Brands)</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-lavender-deep)' }}
                    />
                    <span>Highlight as Featured Work</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Media Preview URL *</label>
                <input 
                  type="url" 
                  className={`form-input ${projectFormErrors.image ? 'error' : ''}`}
                  placeholder="https://images.unsplash.com/..."
                  value={projectForm.image}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, image: e.target.value }))}
                />
                {projectFormErrors.image && <span className="error-text">{projectFormErrors.image}</span>}
              </div>

              {/* Live Preview Box */}
              {projectForm.image && (
                <div className="modal-media-preview-box">
                  <img 
                    src={projectForm.image} 
                    alt="Preview" 
                    className="modal-preview-img"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85";
                    }}
                  />
                  <span className="preview-label">Live Preview</span>
                </div>
              )}

              <div className="modal-actions-row">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-md"
                  onClick={() => setIsAddProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  <span>{editingProject ? 'Save Changes' : 'Publish to Portfolio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SUBMIT DELIVERABLES
          ======================================================== */}
      {submitModalProject && (
        <div className="modal-backdrop" onClick={() => setSubmitModalProject(null)}>
          <div className="creator-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn"
              onClick={() => setSubmitModalProject(null)}
            >
              <X size={18} />
            </button>

            <div className="modal-header-block">
              <span className="section-label-pill">Milestone Delivery</span>
              <h2 className="modal-title">Submit Deliverables</h2>
              <p className="modal-sub">
                Deliver assets for <strong>{submitModalProject.campaignTitle}</strong> ({submitModalProject.brandName}).
              </p>
            </div>

            <form onSubmit={handleSubmitDeliverables} className="modal-form">
              <div className="form-group">
                <label className="form-label">Deliverable Master Asset URL (Cloud Storage / Drive / WeTransfer) *</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://drive.google.com/... or https://wetransfer.com/..."
                  required
                  value={deliverableForm.assetsUrl}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, assetsUrl: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Milestone Scope</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={deliverableForm.milestone}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, milestone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes for Creative Director</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="Detail changes made, color grade passes, or resolution specs..."
                  value={deliverableForm.notes}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="modal-actions-row">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-md"
                  onClick={() => setSubmitModalProject(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  <Upload size={14} />
                  <span>Submit Deliverable for Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: APPLY / EXPRESS INTEREST IN OPPORTUNITY
          ======================================================== */}
      {applyModalOpp && (
        <div className="modal-backdrop" onClick={() => setApplyModalOpp(null)}>
          <div className="creator-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn"
              onClick={() => setApplyModalOpp(null)}
            >
              <X size={18} />
            </button>

            <div className="modal-header-block">
              <span className="section-label-pill">Express Interest</span>
              <h2 className="modal-title">Apply to {applyModalOpp.brand}</h2>
              <p className="modal-sub">
                Brief: <strong>{applyModalOpp.title}</strong> • Budget: {applyModalOpp.budget}
              </p>
            </div>

            <form onSubmit={handleSendApplication} className="modal-form">
              <div className="form-group">
                <label className="form-label">Message / Creative Pitch Note</label>
                <textarea 
                  className="form-textarea" 
                  rows={4}
                  value={applyNoteText}
                  onChange={(e) => setApplyNoteText(e.target.value)}
                />
              </div>

              <div className="opp-modal-summary-box">
                <span><strong>Deliverables:</strong> {(applyModalOpp.requirements || []).join(' • ')}</span>
                <span><strong>Timeline:</strong> {applyModalOpp.timeline}</span>
              </div>

              <div className="modal-actions-row">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-md"
                  onClick={() => setApplyModalOpp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  <Send size={14} />
                  <span>Send Pitch Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: FULL OPPORTUNITY BRIEF
          ======================================================== */}
      {selectedOpportunityForModal && (
        <div className="modal-backdrop" onClick={() => setSelectedOpportunityForModal(null)}>
          <div className="creator-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn"
              onClick={() => setSelectedOpportunityForModal(null)}
            >
              <X size={18} />
            </button>

            <div className="modal-header-block">
              <span className="section-label-pill">{selectedOpportunityForModal.brand}</span>
              <h2 className="modal-title">{selectedOpportunityForModal.title}</h2>
              <div className="brief-chips-row">
                <span className="spec-chip">Budget: {selectedOpportunityForModal.budget}</span>
                <span className="spec-chip">Timeline: {selectedOpportunityForModal.timeline}</span>
              </div>
            </div>

            <div className="brief-content-body">
              <div className="brief-section">
                <h4>Creative Direction</h4>
                <p>{selectedOpportunityForModal.creativeDirection}</p>
              </div>

              <div className="brief-section">
                <h4>Key Deliverables</h4>
                <ul className="req-list">
                  {(selectedOpportunityForModal.requirements || []).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="brief-section">
                <h4>Why CreaMatch Surfaced This</h4>
                <p>{selectedOpportunityForModal.whyItFits}</p>
              </div>
            </div>

            <div className="modal-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary btn-md"
                onClick={() => setSelectedOpportunityForModal(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-md"
                onClick={() => {
                  const opp = selectedOpportunityForModal;
                  setSelectedOpportunityForModal(null);
                  handleOpenApplyModal(opp);
                }}
              >
                <span>Apply to Campaign</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
