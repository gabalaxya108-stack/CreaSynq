import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CreativeShowcase from './components/CreativeShowcase';
import CreativeHighlights from './components/CreativeHighlights';
import CreatorDNASection from './components/CreatorDNASection';
import CreaMatchSection from './components/CreaMatchSection';
import TwoJourneysSection from './components/TwoJourneysSection';
import WorkspaceEntryCards from './components/WorkspaceEntryCards';
import ProductPreview from './components/ProductPreview';
import HowItWorks from './components/HowItWorks';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

import DiscoverView from './views/DiscoverView';
import CreatorProfileView from './views/CreatorProfileView';
import BrandWorkspaceView from './views/BrandWorkspaceView';
import BrandOnboardingView from './views/BrandOnboardingView';
import CreatorOnboardingView from './views/CreatorOnboardingView';
import CreatorWorkspaceView from './views/CreatorWorkspaceView';

import ProjectModal from './components/ProjectModal';
import CampaignModal from './components/CampaignModal';
import InviteModal from './components/InviteModal';
import ForBrandsModal from './components/ForBrandsModal';
import ForCreatorsModal from './components/ForCreatorsModal';
import WhyThisCreatorModal from './components/WhyThisCreatorModal';
import ConversationModal from './components/ConversationModal';
import RoleSelectModal from './components/RoleSelectModal';
import LoginModal from './components/LoginModal';

import { CREATORS } from './data/creatorsData';
import { 
  getInitialMarketplaceState, 
  saveMarketplaceState,
  subscribeToMarketplace,
  getBrandScopedData,
  getPublicCreatorOpportunities,
  createCampaignRecord,
  createBrandRecord,
  resetMarketplaceState,
  updateCreatorRecord,
  getPublicCreatorProfile,
  INITIAL_CAMPAIGNS
} from './data/marketplaceStore';
import { 
  fetchCreators as fetchBackendCreators, 
  fetchCampaigns as fetchBackendCampaigns, 
  saveCreator as saveBackendCreator,
  saveCampaign as saveBackendCampaign,
  savePortfolioProject as saveBackendProject,
  getBackendStatus,
  getCurrentUser,
  signOut as backendSignOut,
  syncUserProfileSafely
} from './services/marketplaceBackend';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'discover' | 'creator-profile' | 'brand-workspace' | 'creator-join' | 'creator-workspace'
  const [activeCreatorId, setActiveCreatorId] = useState(null);

  // Centralized persistent state (synced with localStorage & reactive cross-tab events)
  const [marketplaceData, setMarketplaceData] = useState(() => getInitialMarketplaceState());
  const creatorsList = marketplaceData.creators && marketplaceData.creators.length > 0 ? marketplaceData.creators : CREATORS;

  const {
    brands = [],
    activeBrandId,
    isDemoMode = true,
    campaigns = [],
    activeCampaignId,
    projects = [],
    invitations = [],
    shortlists = {},
    connections = [],
    opportunities = []
  } = marketplaceData;

  // Persist state updates to localStorage & broadcast event
  useEffect(() => {
    saveMarketplaceState(marketplaceData);
  }, [marketplaceData]);

  // Subscribe to storage & cross-tab events for real-time synchronization
  useEffect(() => {
    const unsubscribe = subscribeToMarketplace((newState) => {
      setMarketplaceData(newState);
    });
    return () => unsubscribe();
  }, []);

  // Sync with cloud backend on mount if Supabase is active
  useEffect(() => {
    const syncBackend = async () => {
      try {
        const cloudCreators = await fetchBackendCreators();
        if (cloudCreators && cloudCreators.length > 0) {
          setMarketplaceData(prev => ({
            ...prev,
            creators: cloudCreators
          }));
        }
      } catch (e) {
        console.warn('[CreaSync] Initial cloud sync deferred to local cache:', e);
      }
    };
    syncBackend();
  }, []);

  // Derived Brand-Scoped Data (Strict Data Isolation)
  const brandScoped = getBrandScopedData(marketplaceData, activeBrandId, isDemoMode);
  const currentBrand = brandScoped.currentBrand;
  const brandCampaigns = brandScoped.campaigns;
  const activeCampaign = brandScoped.activeCampaign || brandCampaigns[0] || null;
  const brandInvitations = brandScoped.invitations;
  const brandProjects = brandScoped.projects;
  const brandConnections = brandScoped.connections;
  const brandShortlists = brandScoped.shortlists;

  // Public Creator Opportunities (strictly published only)
  const publicOpportunities = getPublicCreatorOpportunities(marketplaceData);

  // Saved / Favorited creators
  const [savedCreatorIds, setSavedCreatorIds] = useState(['elena-rostova', 'kai-sorenson']);

  // Modals state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTargetCreator, setInviteTargetCreator] = useState(null);

  // Creator profile generated during onboarding
  const [createdCreatorProfile, setCreatedCreatorProfile] = useState(null);

  // Informative Modals & Authentication
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForBrandsOpen, setIsForBrandsOpen] = useState(false);
  const [isForCreatorsOpen, setIsForCreatorsOpen] = useState(false);

  // Project detail modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectCreator, setSelectedProjectCreator] = useState(null);

  // Why this creator explanation modal
  const [whyModalCreator, setWhyModalCreator] = useState(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  // Direct 1-on-1 Conversation modal
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [activeConversationConnection, setActiveConversationConnection] = useState(null);
  const [conversationUserRole, setConversationUserRole] = useState('brand');

  // Active Authenticated User & Protected Action Queue
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [loginInitialRole, setLoginInitialRole] = useState('brand');
  const [loginNotice, setLoginNotice] = useState(null);

  // Authentication & OAuth session synchronization
  useEffect(() => {
    let isMounted = true;
    let authListener = null;

    if (isSupabaseConfigured() && supabase) {
      // 1. Validate session against Supabase Auth server on mount
      getCurrentUser().then(user => {
        if (!isMounted) return;
        if (user) {
          setCurrentUser(user);
          syncUserProfileSafely(user, null);
        } else {
          setCurrentUser(null);
        }
      }).catch(err => {
        console.warn('[CreaSync Auth] Session validation note:', err);
      });

      // 2. Reactively handle OAuth callbacks & auth transitions without races
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN') {
          if (session?.user) {
            // Retrieve intended role preserved across OAuth redirect
            let intendedRole = null;
            if (typeof window !== 'undefined') {
              try {
                intendedRole = sessionStorage.getItem('creasync_intended_role') 
                  || localStorage.getItem('creasync_intended_role');
              } catch (e) {}
            }

            // Sync user profile with explicit intended role if present
            const syncedProfile = await syncUserProfileSafely(session.user, intendedRole);

            // Validate user and load verified database profile
            const verifiedUser = await getCurrentUser();
            const active = verifiedUser || { ...session.user, profile: syncedProfile };
            if (syncedProfile && active) {
              active.profile = syncedProfile;
            }

            setCurrentUser(active);

            // Detect if this event is an active OAuth return, pending action, or fresh login
            const hasPendingAction = typeof window !== 'undefined' && !!sessionStorage.getItem('creasync_pending_action');
            const isOAuthReturn = !!intendedRole || (typeof window !== 'undefined' && (
              window.location.hash.includes('access_token=') ||
              window.location.search.includes('code=')
            ));

            if (isOAuthReturn || hasPendingAction) {
              executePendingActionOrRoute(active, intendedRole);
            }
          }
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const verifiedUser = await getCurrentUser();
            setCurrentUser(verifiedUser || session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      authListener = subscription;
    } else {
      // Fallback for offline/local simulation
      getCurrentUser().then(user => {
        if (isMounted && user) {
          setCurrentUser(user);
        }
      });
    }

    return () => {
      isMounted = false;
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Executes pending action queued before login/OAuth redirect, or routes to appropriate workspace
  const executePendingActionOrRoute = (user, explicitRole = null) => {
    let action = pendingAction;
    if (!action) {
      try {
        const stored = sessionStorage.getItem('creasync_pending_action');
        if (stored) {
          action = JSON.parse(stored);
        }
      } catch (e) {}
    }

    try {
      sessionStorage.removeItem('creasync_pending_action');
    } catch (e) {}
    setPendingAction(null);
    setLoginNotice(null);

    if (action) {
      switch (action.type) {
        case 'CREATE_CAMPAIGN':
          setIsCampaignModalOpen(true);
          return;
        case 'INVITE_CREATOR':
          if (action.creator) {
            setInviteTargetCreator(action.creator);
            setIsInviteModalOpen(true);
          }
          return;
        case 'TOGGLE_SAVE':
          if (action.creatorId) {
            setSavedCreatorIds(prev => 
              prev.includes(action.creatorId) 
                ? prev.filter(id => id !== action.creatorId) 
                : [...prev, action.creatorId]
            );
          }
          return;
        case 'OPEN_CONVERSATION':
          if (action.connection) {
            setActiveConversationConnection(action.connection);
            setConversationUserRole(action.userRole || 'brand');
            setIsConversationOpen(true);
          }
          return;
        case 'PUBLISH_CREATOR':
          if (action.creator) {
            setCreatedCreatorProfile(action.creator);
            handleUpdateCreator(action.creator);
            setActiveCreatorId(action.creator.id);
            navigateTo('creator-workspace');
          }
          return;
        case 'NAVIGATE':
          if (action.view) {
            navigateTo(action.view);
          }
          return;
        default:
          break;
      }
    }

    // Role-based routing hierarchy:
    // 1. Explicit role passed to this execution
    // 2. Verified profile role from database
    // 3. Stored intent from current login session
    // 4. User metadata (intended_role or role)
    // 5. Active role stored in localStorage
    const storedIntent = typeof window !== 'undefined'
      ? (sessionStorage.getItem('creasync_intended_role') || localStorage.getItem('creasync_intended_role'))
      : null;
    const storedActive = typeof window !== 'undefined'
      ? localStorage.getItem('creasync_active_role')
      : null;

    const resolvedRole = (explicitRole === 'creator' || explicitRole === 'brand' ? explicitRole : null)
      || (user?.profile?.role === 'creator' || user?.profile?.role === 'brand' ? user.profile.role : null)
      || (storedIntent === 'creator' || storedIntent === 'brand' ? storedIntent : null)
      || (user?.user_metadata?.intended_role === 'creator' || user?.user_metadata?.intended_role === 'brand' ? user.user_metadata.intended_role : null)
      || (user?.user_metadata?.role === 'creator' || user?.user_metadata?.role === 'brand' ? user.user_metadata.role : null)
      || (storedActive === 'creator' || storedActive === 'brand' ? storedActive : null);

    // Consume one-time OAuth intent after routing
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('creasync_intended_role');
        localStorage.removeItem('creasync_intended_role');
      } catch (e) {}
    }

    if (resolvedRole === 'creator') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('creasync_active_role', 'creator');
      }
      navigateTo('creator-workspace');
    } else if (resolvedRole === 'brand') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('creasync_active_role', 'brand');
      }
      navigateTo('brand-workspace');
    } else {
      // Missing role: do NOT silently assign 'brand'! Prompt user to select role explicitly.
      console.warn('[CreaSync Auth] Missing role for authenticated user; opening role selection');
      setIsRoleSelectOpen(true);
    }
  };

  // Guard wrapper for actions that require authentication
  const requireAuth = (actionConfig, onAuthorized) => {
    if (currentUser) {
      if (typeof onAuthorized === 'function') {
        onAuthorized();
      }
      return true;
    }

    setPendingAction(actionConfig);
    const targetRole = actionConfig.role || 'brand';
    try {
      sessionStorage.setItem('creasync_pending_action', JSON.stringify(actionConfig));
      sessionStorage.setItem('creasync_intended_role', targetRole);
      localStorage.setItem('creasync_intended_role', targetRole);
    } catch (e) {}

    setLoginInitialRole(targetRole);
    setLoginNotice(actionConfig.notice || 'Authentication required to proceed');
    setIsLoginOpen(true);
    return false;
  };

  const handleLogout = async () => {
    await backendSignOut();
    setCurrentUser(null);
    navigateTo('home');
  };

  const handleOpenWhyModal = (creator) => {
    setWhyModalCreator(creator);
    setIsWhyModalOpen(true);
  };

  const handleOpenConversation = (conn, userRole = 'brand') => {
    requireAuth(
      { type: 'OPEN_CONVERSATION', connection: conn, userRole, role: userRole, notice: 'Please sign in to access collaboration discussions' },
      () => {
        setActiveConversationConnection(conn);
        setConversationUserRole(userRole);
        setIsConversationOpen(true);
      }
    );
  };

  // --- Messaging Action ---
  const handleSendMessage = (connectionId, newMsg) => {
    setMarketplaceData(prev => ({
      ...prev,
      connections: prev.connections.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            messages: [
              ...(conn.messages || []),
              {
                id: `msg-${Date.now()}`,
                ...newMsg
              }
            ]
          };
        }
        return conn;
      })
    }));
  };

  // Hash & URL Synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/creator/join')) {
        setCurrentView('creator-join');
      } else if (hash === '/creator') {
        setCurrentView('creator-workspace');
      } else if (hash.startsWith('/creator/')) {
        const id = hash.replace('/creator/', '');
        const found = creatorsList.find(c => c.id === id);
        if (found) {
          setActiveCreatorId(id);
          setCurrentView('creator-profile');
        }
      } else if (hash === 'discover') {
        setCurrentView('discover');
      } else if (hash === '/brand/onboard') {
        setCurrentView('brand-onboard');
      } else if (hash === '/brand') {
        setCurrentView('brand-workspace');
      } else {
        setCurrentView('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleLocationChange);
    if (window.location.hash) {
      handleLocationChange();
    }
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, [creatorsList]);

  const navigateTo = (view, extraId = null) => {
    setCurrentView(view);
    if (view === 'creator-profile' && extraId) {
      setActiveCreatorId(extraId);
      window.location.hash = `/creator/${extraId}`;
    } else if (view === 'discover') {
      window.location.hash = 'discover';
    } else if (view === 'brand-onboard') {
      window.location.hash = '/brand/onboard';
    } else if (view === 'brand-workspace') {
      window.location.hash = '/brand';
    } else if (view === 'creator-join') {
      window.location.hash = '/creator/join';
    } else if (view === 'creator-workspace') {
      window.location.hash = '/creator';
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Save Creator (Favorites) - Protected Action
  const handleToggleSaveCreator = (creatorId) => {
    requireAuth(
      { type: 'TOGGLE_SAVE', creatorId, role: 'brand', notice: 'Please sign in to save creators to your shortlist' },
      () => {
        setSavedCreatorIds((prev) => 
          prev.includes(creatorId) 
            ? prev.filter(id => id !== creatorId) 
            : [...prev, creatorId]
        );
      }
    );
  };

  // --- Brand Management Handlers ---
  const handleSwitchBrand = (brandId) => {
    const targetBrand = (marketplaceData.brands || []).find(b => b.id === brandId);
    setMarketplaceData(prev => ({
      ...prev,
      activeBrandId: brandId,
      isDemoMode: !!targetBrand?.isDemo
    }));
  };

  const handleCreateBrand = (newBrandData) => {
    const newBrand = createBrandRecord(newBrandData);
    setMarketplaceData(prev => ({
      ...prev,
      brands: [newBrand, ...(prev.brands || [])],
      activeBrandId: newBrand.id,
      isDemoMode: false
    }));
  };

  const handleUpdateBrand = (brandId, updates) => {
    setMarketplaceData(prev => ({
      ...prev,
      brands: (prev.brands || []).map(b => b.id === brandId ? { ...b, ...updates } : b),
      campaigns: (prev.campaigns || []).map(c => c.ownerBrandId === brandId ? {
        ...c,
        brandName: updates.name || c.brandName,
        brandAvatar: updates.logo || c.brandAvatar,
        brandWebsite: updates.website || c.brandWebsite
      } : c)
    }));
  };

  const handleToggleDemoMode = (demoActive) => {
    const demoBrand = (marketplaceData.brands || []).find(b => b.isDemo) || marketplaceData.brands?.[0];
    setMarketplaceData(prev => ({
      ...prev,
      isDemoMode: demoActive,
      activeBrandId: demoActive ? demoBrand?.id || prev.activeBrandId : prev.activeBrandId
    }));
  };

  const handleResetState = () => {
    const fresh = resetMarketplaceState();
    setMarketplaceData(fresh);
  };

  // --- Campaign Handlers ---
  const handleSelectCampaign = (campId) => {
    setMarketplaceData(prev => ({
      ...prev,
      activeCampaignId: campId
    }));
  };

  const handleCampaignCreated = (newCampaignData) => {
    const finalCamp = createCampaignRecord(newCampaignData, currentBrand);
    setMarketplaceData(prev => ({
      ...prev,
      campaigns: [finalCamp, ...(prev.campaigns || [])],
      activeCampaignId: finalCamp.id
    }));
    // Asynchronously synchronize with backend cloud store
    saveBackendCampaign(newCampaignData, currentBrand).catch(err => {
      console.warn('[CreaSync] Background campaign sync deferred:', err);
    });
    setIsCampaignModalOpen(false);
    navigateTo('brand-workspace');
  };

  const handleUpdateCampaign = (campaignId, updates) => {
    setMarketplaceData(prev => ({
      ...prev,
      campaigns: (prev.campaigns || []).map(c => c.id === campaignId ? { 
        ...c, 
        ...updates, 
        updatedAt: 'Just now' 
      } : c)
    }));
  };

  const handleDuplicateCampaign = (campaignId) => {
    const target = (marketplaceData.campaigns || []).find(c => c.id === campaignId);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `camp-${Date.now()}`,
      title: `${target.title} (Copy)`,
      status: 'Draft',
      visibility: 'draft',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      shortlist: []
    };
    setMarketplaceData(prev => ({
      ...prev,
      campaigns: [duplicated, ...(prev.campaigns || [])],
      activeCampaignId: duplicated.id
    }));
  };

  const handleDeleteCampaign = (campaignId) => {
    setMarketplaceData(prev => {
      const remaining = (prev.campaigns || []).filter(c => c.id !== campaignId);
      const nextActive = remaining.find(c => c.ownerBrandId === currentBrand?.id)?.id || remaining[0]?.id || null;
      const newShortlists = { ...(prev.shortlists || {}) };
      delete newShortlists[campaignId];
      return {
        ...prev,
        campaigns: remaining,
        activeCampaignId: nextActive,
        shortlists: newShortlists
      };
    });
  };

  // --- Shortlist Handlers ---
  const handleToggleShortlist = (campaignId, creatorId) => {
    setMarketplaceData(prev => {
      const currentList = prev.shortlists[campaignId] || [];
      const updatedList = currentList.includes(creatorId)
        ? currentList.filter(id => id !== creatorId)
        : [...currentList, creatorId];
      return {
        ...prev,
        shortlists: {
          ...prev.shortlists,
          [campaignId]: updatedList
        }
      };
    });
  };

  // --- Invitation Handlers (Connected Journey: Part 10) ---
  const handleSendInvitation = (invData) => {
    const newInvitation = {
      id: `inv-${Date.now()}`,
      brandId: currentBrand?.id || 'brand-general',
      campaignId: invData.campaignId || activeCampaign?.id || 'camp-general',
      campaignTitle: invData.campaignTitle || activeCampaign?.title || 'Creative Campaign',
      brandName: invData.brandName || currentBrand?.name || 'Brand Partner',
      brandAvatar: currentBrand?.logo || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=120&q=80",
      creatorId: invData.creatorId,
      creatorName: invData.creatorName,
      creatorAvatar: invData.creatorAvatar,
      title: invData.title || activeCampaign?.title || 'Creative Commission',
      budget: invData.budget || activeCampaign?.budget || 'In Discussion',
      timeline: invData.timeline || activeCampaign?.timeline || '3 Weeks',
      deliverables: invData.deliverables || (Array.isArray(activeCampaign?.deliverables) ? activeCampaign.deliverables.join(' • ') : activeCampaign?.deliverables || '3x 4K Master Renders'),
      summary: invData.summary || `Direct invitation from ${currentBrand?.name || 'Brand Partner'} to collaborate.`,
      status: 'pending',
      createdAt: 'Just now'
    };

    // Open connection thread in messages
    const newConn = {
      id: `conn-${invData.creatorId}-${Date.now()}`,
      brandId: currentBrand?.id || 'brand-general',
      creatorId: invData.creatorId,
      creatorName: invData.creatorName,
      creatorRole: "Creative Partner",
      creatorAvatar: invData.creatorAvatar,
      campaignId: newInvitation.campaignId,
      campaignTitle: newInvitation.campaignTitle,
      brandName: currentBrand?.name || 'Brand Partner',
      status: 'connected',
      createdAt: 'Just now',
      connectedAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'brand',
          senderName: currentBrand?.name || 'Brand Partner',
          text: newInvitation.summary,
          timestamp: 'Just now'
        }
      ]
    };

    setMarketplaceData(prev => ({
      ...prev,
      invitations: [newInvitation, ...prev.invitations],
      connections: [newConn, ...prev.connections.filter(c => !(c.creatorId === invData.creatorId && c.campaignId === newInvitation.campaignId))]
    }));
  };

  // Creator Accepts Invitation -> Spawns/Activates Project
  const handleAcceptInvitation = (invitation) => {
    const existingProject = projects.find(p => p.campaignId === invitation.campaignId && p.creatorId === invitation.creatorId);

    const newProject = existingProject ? {
      ...existingProject,
      status: 'in-progress'
    } : {
      id: `proj-collab-${invitation.id}`,
      brandId: invitation.brandId || currentBrand?.id || 'brand-general',
      campaignId: invitation.campaignId,
      campaignTitle: invitation.title || invitation.campaignTitle,
      brandName: invitation.brandName || invitation.brand,
      brandContact: "Creative Director",
      creatorId: invitation.creatorId,
      creatorName: invitation.creatorName || "Maya Chen",
      creatorAvatar: invitation.creatorAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      status: "in-progress",
      progressPercent: 30,
      milestone: "Milestone 1 of 3: Moodboard & Concept Alignment",
      deadline: invitation.timeline,
      agreedBudget: invitation.budget,
      deliverablesScope: invitation.deliverables,
      latestFeedback: "“Invitation accepted! Collaboration started. Looking forward to first visual passes.”",
      submissionUrl: "",
      submissionNotes: "",
      submissionPreviews: [],
      feedbackHistory: [
        {
          id: `fb-${Date.now()}`,
          author: invitation.brandName || invitation.brand,
          role: "brand",
          text: "“Welcome to the project! Concept alignment underway.”",
          timestamp: "Just now"
        }
      ],
      revisionHistory: []
    };

    setMarketplaceData(prev => ({
      ...prev,
      invitations: prev.invitations.map(inv => inv.id === invitation.id ? { ...inv, status: 'accepted' } : inv),
      projects: existingProject 
        ? prev.projects.map(p => p.id === existingProject.id ? newProject : p)
        : [newProject, ...prev.projects]
    }));
  };

  // Creator Declines Invitation
  const handleDeclineInvitation = (invitation) => {
    setMarketplaceData(prev => ({
      ...prev,
      invitations: prev.invitations.map(inv => inv.id === invitation.id ? { ...inv, status: 'declined' } : inv)
    }));
  };

  // --- Collaboration Lifecycle Handlers: Submit -> Review -> Revise -> Approve ---
  const handleSubmitDeliverables = (projectId, { assetsUrl, notes, milestone }) => {
    setMarketplaceData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'submitted',
            progressPercent: Math.min(95, p.progressPercent + 20),
            submissionUrl: assetsUrl,
            submissionNotes: notes,
            milestone: milestone || p.milestone,
            latestFeedback: "“Deliverables submitted for review! Brand creative director evaluating master passes.”",
            submissionPreviews: p.submissionPreviews?.length > 0 ? p.submissionPreviews : [
              "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
            ]
          };
        }
        return p;
      })
    }));
  };

  const handleRequestRevision = (projectId, { revisionNotes }) => {
    setMarketplaceData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
          const newFb = {
            id: `fb-${Date.now()}`,
            author: "Brand Creative Director",
            role: "brand",
            text: `“Revision requested: ${revisionNotes}”`,
            timestamp: "Just now"
          };
          return {
            ...p,
            status: 'revision-requested',
            latestFeedback: `“Revision requested: ${revisionNotes}”`,
            feedbackHistory: [newFb, ...(p.feedbackHistory || [])]
          };
        }
        return p;
      })
    }));
  };

  const handleApproveDeliverables = (projectId, { approvalNotes }) => {
    setMarketplaceData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
          const newFb = {
            id: `fb-${Date.now()}`,
            author: "Brand Creative Director",
            role: "brand",
            text: approvalNotes ? `“Approved: ${approvalNotes}”` : "“Deliverables approved! Final milestone unlocked & payout released.”",
            timestamp: "Just now"
          };
          return {
            ...p,
            status: 'approved',
            progressPercent: 100,
            milestone: "Final Milestone: All Master Assets Approved & Released",
            latestFeedback: "“Outstanding work! Master passes approved and payout released.”",
            feedbackHistory: [newFb, ...(p.feedbackHistory || [])]
          };
        }
        return p;
      })
    }));
  };

  // Creator Profile & Portfolio Management (Unified Single Source of Truth)
  const handleUpdateCreator = (updatedCreator) => {
    if (!updatedCreator || !updatedCreator.id) return;
    setMarketplaceData(prev => updateCreatorRecord(prev, updatedCreator));
    if (createdCreatorProfile && createdCreatorProfile.id === updatedCreator.id) {
      setCreatedCreatorProfile(prev => ({ ...prev, ...updatedCreator }));
    }
    // Asynchronously synchronize with backend cloud store
    saveBackendCreator(updatedCreator).catch(err => {
      console.warn('[CreaSync] Background creator sync deferred:', err);
    });
  };

  // Creator Onboarding Completed - Protected Action
  const handlePublishCreator = (newCreator) => {
    requireAuth(
      { type: 'PUBLISH_CREATOR', creator: newCreator, role: 'creator', notice: 'Please sign in to publish your creator profile to the marketplace' },
      () => {
        setCreatedCreatorProfile(newCreator);
        handleUpdateCreator(newCreator);
        setActiveCreatorId(newCreator.id);
        navigateTo('creator-workspace');
      }
    );
  };

  const handleOpenCreatorProfile = (creatorId) => {
    setActiveCreatorId(creatorId);
    navigateTo('creator-profile', creatorId);
  };

  const handleSelectProject = (project, creator) => {
    setSelectedProject(project);
    setSelectedProjectCreator(creator);
  };

  const handleOpenInviteModal = (creator) => {
    requireAuth(
      { type: 'INVITE_CREATOR', creator, role: 'brand', notice: `Please sign in to invite ${creator?.name || 'this creator'}` },
      () => {
        setInviteTargetCreator(creator);
        setIsInviteModalOpen(true);
      }
    );
  };

  const handleOpportunityResponse = (opportunity, message) => {
    const creator = createdCreatorProfile || creatorsList[0];
    const newConn = {
      id: `conn-opp-${opportunity.id}-${Date.now()}`,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorRole: creator.creativeIdentity,
      creatorAvatar: creator.avatar,
      creatorVisual: creator.projects?.[0]?.image || creator.heroWork,
      campaignId: opportunity.campaignId || 'camp-opp',
      campaignTitle: opportunity.title,
      brandName: opportunity.brand,
      status: 'connected',
      createdAt: 'Just now',
      connectedAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'creator',
          senderName: creator.name,
          text: message || "I'm interested in collaborating on this brief!",
          timestamp: 'Just now'
        }
      ]
    };
    setMarketplaceData(prev => ({
      ...prev,
      connections: [newConn, ...prev.connections.filter(c => c.campaignTitle !== opportunity.title)]
    }));
  };

  const activeCreator = creatorsList.find(c => c.id === activeCreatorId)
    || (createdCreatorProfile && createdCreatorProfile.id === activeCreatorId ? createdCreatorProfile : null)
    || createdCreatorProfile
    || creatorsList[0];

  return (
    <div className="creasynq-app">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(v) => navigateTo(v)}
        onOpenCampaignModal={() => requireAuth({ type: 'CREATE_CAMPAIGN', role: 'brand', notice: 'Please sign in to start a new campaign' }, () => setIsCampaignModalOpen(true))}
        onOpenCreatorModal={() => navigateTo('creator-join')}
        onOpenRoleSelect={() => setIsRoleSelectOpen(true)}
        onOpenLogin={() => {
          setLoginNotice(null);
          setIsLoginOpen(true);
        }}
        onOpenForBrandsModal={() => setIsForBrandsOpen(true)}
        onOpenForCreatorsModal={() => setIsForCreatorsOpen(true)}
        activeCampaign={activeCampaign}
        createdCreatorProfile={createdCreatorProfile}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Views */}
      <main>
        {/* VIEW 1: HOME LANDING — Apple-inspired progressive storytelling */}
        {currentView === 'home' && (
          <>
            {/* SECTION B: Signature Hero ("The right creator. The right idea. In sync.") */}
            <Hero
              onFindCreator={() => navigateTo('brand-onboard')}
              onJoinCreator={() => navigateTo('creator-join')}
              onExploreWork={() => navigateTo('discover')}
            />

            {/* SECTION C: Make the Two Journeys Obvious (Directly after Hero) */}
            <TwoJourneysSection
              onExploreBrandStudio={() => navigateTo('brand-workspace')}
              onBuildCreatorProfile={() => navigateTo('creator-join')}
            />

            {/* SECTION D: Visual Marketplace ("Meet creativity in every direction.") */}
            <CreativeShowcase
              creators={creatorsList}
              onSelectProject={handleSelectProject}
              onExploreAll={() => navigateTo('discover')}
            />

            {/* SECTION E: Creator DNA ("Every creator has a signature.") */}
            <CreatorDNASection
              creators={creatorsList}
              onSelectCreator={handleOpenCreatorProfile}
            />

            {/* SECTION E: The Intelligence Behind the Match (CreaMatch & CreaScore) */}
            <CreaMatchSection
              creators={creatorsList}
              onExploreDiscover={() => navigateTo('discover')}
              onEnterBrandStudio={() => navigateTo('brand-workspace')}
            />

            {/* SECTION: CreaSim: From Brief to Creative Concept */}
            <ProductPreview
              onSelectCreator={handleOpenCreatorProfile}
              onExploreMarketplace={() => navigateTo('discover')}
            />

            {/* SECTION: The Collaboration Journey ("From first idea to final delivery.") */}
            <HowItWorks
              onGetStarted={() => setIsRoleSelectOpen(true)}
            />

            {/* SECTION F: Closing Statement ("Let's make something worth creating.") */}
            <FinalCTA
              onFindCreator={() => navigateTo('brand-onboard')}
              onJoinCreator={() => navigateTo('creator-join')}
            />
          </>
        )}

        {/* VIEW 2: DISCOVER MARKETPLACE */}
        {currentView === 'discover' && (
          <DiscoverView
            creators={creatorsList}
            onSelectCreator={handleOpenCreatorProfile}
            activeCampaign={activeCampaign}
            onBackToCampaign={() => navigateTo('brand-workspace')}
            savedCreatorIds={savedCreatorIds}
            onToggleSaveCreator={handleToggleSaveCreator}
            onWhyClick={handleOpenWhyModal}
            onInviteCreator={handleOpenInviteModal}
          />
        )}

        {/* VIEW 3: BRAND STUDIO (Overhauled Multi-Section Brand Experience) */}
        {currentView === 'brand-workspace' && (
          <BrandWorkspaceView
            currentBrand={currentBrand}
            allBrands={brands}
            isDemoMode={isDemoMode}
            onSwitchBrand={handleSwitchBrand}
            onCreateBrand={handleCreateBrand}
            onUpdateBrand={handleUpdateBrand}
            onToggleDemoMode={handleToggleDemoMode}
            onResetState={handleResetState}
            campaigns={brandCampaigns}
            activeCampaign={activeCampaign}
            onSelectCampaign={handleSelectCampaign}
            onCreateCampaign={handleCampaignCreated}
            onUpdateCampaign={handleUpdateCampaign}
            onDuplicateCampaign={handleDuplicateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            creators={creatorsList}
            shortlists={brandShortlists}
            onToggleShortlist={handleToggleShortlist}
            invitations={brandInvitations}
            onSendInvitation={handleSendInvitation}
            projects={brandProjects}
            onRequestRevision={handleRequestRevision}
            onApproveDeliverables={handleApproveDeliverables}
            connections={brandConnections}
            onSendMessage={handleSendMessage}
            onSelectCreator={handleOpenCreatorProfile}
          />
        )}

        {/* VIEW 3B: BRAND ONBOARDING (Guided Campaign Setup & Discovery) */}
        {currentView === 'brand-onboard' && (
          <BrandOnboardingView
            creators={creatorsList}
            onCompleteBrandOnboarding={({ brand, campaign }) => {
              const finalBrand = createBrandRecord(brand);
              const finalCampaign = createCampaignRecord(campaign, finalBrand);
              setMarketplaceData(prev => ({
                ...prev,
                brands: [finalBrand, ...(prev.brands || [])],
                activeBrandId: finalBrand.id,
                isDemoMode: false,
                campaigns: [finalCampaign, ...(prev.campaigns || [])],
                activeCampaignId: finalCampaign.id
              }));
              navigateTo('brand-workspace');
            }}
            onExploreMarketplace={() => navigateTo('discover')}
          />
        )}

        {/* VIEW 4: CREATOR MICROSITE & ONBOARDING */}
        {currentView === 'creator-join' && (
          <CreatorOnboardingView
            onPublishCreator={handlePublishCreator}
            onExploreMarketplace={() => navigateTo('discover')}
          />
        )}

        {/* VIEW 5: CREATOR WORKSPACE / STUDIO (Milestone 2 Experience connected to Brand Studio) */}
        {currentView === 'creator-workspace' && (
          <CreatorWorkspaceView
            creator={createdCreatorProfile || activeCreator || creatorsList[0]}
            onUpdateCreator={handleUpdateCreator}
            onViewPublicProfile={() => handleOpenCreatorProfile(createdCreatorProfile?.id || activeCreator?.id || creatorsList[0].id)}
            onExploreMarketplace={() => navigateTo('discover')}
            connections={connections}
            onOpenConversation={(conn) => handleOpenConversation(conn, 'creator')}
            opportunities={publicOpportunities}
            onOpportunityResponse={handleOpportunityResponse}
            invitations={invitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            projects={projects}
            onSubmitDeliverables={handleSubmitDeliverables}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* VIEW 6: CREATOR PUBLIC PROFILE */}
        {currentView === 'creator-profile' && activeCreator && (
          <CreatorProfileView
            creator={activeCreator}
            activeCampaign={activeCampaign}
            campaigns={brandCampaigns}
            shortlists={brandShortlists}
            onToggleShortlist={handleToggleShortlist}
            onSelectCampaign={handleSelectCampaign}
            connections={connections}
            onOpenConversation={(conn) => handleOpenConversation(conn, 'brand')}
            onBack={() => navigateTo('discover')}
            onSelectProject={handleSelectProject}
            onInviteCreator={handleOpenInviteModal}
            isSaved={savedCreatorIds.includes(activeCreator.id)}
            onToggleSave={handleToggleSaveCreator}
            onUpdateCreator={handleUpdateCreator}
            isCurrentCreatorOwner={createdCreatorProfile?.id === activeCreator?.id}
            onEditInStudio={() => navigateTo('creator-workspace')}
          />
        )}
      </main>

      {/* SECTION K: Clean Footer */}
      <Footer
        onNavigate={(v) => navigateTo(v)}
        onOpenCampaignModal={() => setIsCampaignModalOpen(true)}
        onOpenCreatorModal={() => navigateTo('creator-join')}
        onEnterBrandStudio={() => navigateTo('brand-workspace')}
        onEnterCreatorStudio={() => navigateTo('creator-workspace')}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRoleSelect={() => setIsRoleSelectOpen(true)}
      />

      {/* Role Selection Modal */}
      <RoleSelectModal
        isOpen={isRoleSelectOpen}
        onClose={() => setIsRoleSelectOpen(false)}
        onSelectBrand={() => {
          setIsRoleSelectOpen(false);
          navigateTo('brand-onboard');
        }}
        onSelectCreator={() => {
          setIsRoleSelectOpen(false);
          navigateTo('creator-join');
        }}
      />

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginNotice(null);
        }}
        initialRole={loginInitialRole}
        pendingActionNotice={loginNotice}
        onLoginSuccess={(user, role) => {
          setCurrentUser(user);
          setIsLoginOpen(false);
          executePendingActionOrRoute(user, role);
        }}
        onLoginBrand={(user) => {
          setIsLoginOpen(false);
          if (user) {
            setCurrentUser(user);
            executePendingActionOrRoute(user, 'brand');
          } else {
            handleSwitchBrand('brand-demo-lumina');
            handleToggleDemoMode(true);
            navigateTo('brand-workspace');
          }
        }}
        onLoginCreator={(user) => {
          setIsLoginOpen(false);
          if (user) {
            setCurrentUser(user);
            executePendingActionOrRoute(user, 'creator');
          } else {
            navigateTo('creator-workspace');
          }
        }}
      />

      {/* Additional Modals */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onCampaignCreated={handleCampaignCreated}
        activeBrand={currentBrand}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        creator={inviteTargetCreator}
        activeCampaign={activeCampaign}
        onInvitationSent={(creator, msg) => handleSendInvitation({
          creatorId: creator.id,
          creatorName: creator.name,
          creatorAvatar: creator.avatar,
          summary: msg
        })}
        onViewCampaign={() => {
          setIsInviteModalOpen(false);
          navigateTo('brand-workspace');
        }}
      />

      <ForBrandsModal
        isOpen={isForBrandsOpen}
        onClose={() => setIsForBrandsOpen(false)}
        onStartCampaign={() => {
          setIsForBrandsOpen(false);
          setIsCampaignModalOpen(true);
        }}
      />

      <ForCreatorsModal
        isOpen={isForCreatorsOpen}
        onClose={() => setIsForCreatorsOpen(false)}
        onJoinCreator={() => {
          setIsForCreatorsOpen(false);
          navigateTo('creator-join');
        }}
      />

      <WhyThisCreatorModal
        isOpen={isWhyModalOpen}
        onClose={() => {
          setIsWhyModalOpen(false);
          setWhyModalCreator(null);
        }}
        creator={whyModalCreator}
        campaign={activeCampaign}
        onInviteCreator={handleOpenInviteModal}
        onViewProfile={handleOpenCreatorProfile}
      />

      <ConversationModal
        isOpen={isConversationOpen}
        onClose={() => {
          setIsConversationOpen(false);
          setActiveConversationConnection(null);
        }}
        connection={activeConversationConnection}
        currentUserRole={conversationUserRole}
        onSendMessage={handleSendMessage}
        onViewProfile={handleOpenCreatorProfile}
      />

      <ProjectModal
        project={selectedProject}
        creator={selectedProjectCreator}
        onClose={() => {
          setSelectedProject(null);
          setSelectedProjectCreator(null);
        }}
        onViewCreatorProfile={handleOpenCreatorProfile}
        onInviteCreator={handleOpenInviteModal}
      />
    </div>
  );
}
