import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import TrustCenterView from './views/TrustCenterView';

import ProjectModal from './components/ProjectModal';
import CampaignModal from './components/CampaignModal';
import InviteModal from './components/InviteModal';
import ForBrandsModal from './components/ForBrandsModal';
import ForCreatorsModal from './components/ForCreatorsModal';
import WhyThisCreatorModal from './components/WhyThisCreatorModal';
import ConversationModal from './components/ConversationModal';
import RoleSelectModal from './components/RoleSelectModal';
import LoginModal from './components/LoginModal';
import RoleConflictModal from './components/RoleConflictModal';

import { CREATORS } from './data/creatorsData';
import PipelineTraceModal from './components/PipelineTraceModal';
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
  fetchBrands as fetchBackendBrands,
  fetchInvitations as fetchBackendInvitations,
  fetchCollaborations as fetchBackendCollaborations,
  fetchShortlists as fetchBackendShortlists,
  saveCreator as saveBackendCreator,
  saveCampaign as saveBackendCampaign,
  deleteCampaign as deleteBackendCampaign,
  saveBrand as saveBackendBrand,
  savePortfolioProject as saveBackendProject,
  sendInvitation as sendBackendInvitation,
  updateInvitationStatus as updateBackendInvitationStatus,
  saveCollaboration as saveBackendCollaboration,
  submitDeliverables as submitBackendDeliverables,
  requestRevision as requestBackendRevision,
  approveDeliverables as approveBackendDeliverables,
  toggleShortlist as toggleBackendShortlist,
  subscribeToInvitations,
  subscribeToCollaborations,
  subscribeToCampaigns,
  getBackendStatus,
  getCurrentUser,
  signOut as backendSignOut,
  syncUserProfileSafely,
  updateUserRoleExplicitly,
  executeCampaignFilteringPipeline
} from './services/marketplaceBackend';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

// Safely resolve the active role without letting Supabase default 'authenticated' confuse role logic
function resolveUserRole(user) {
  if (!user) {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('creasync_active_role');
      if (active === 'brand' || active === 'creator') return active;
    }
    return null;
  }
  if (user.profile?.role === 'brand' || user.profile?.role === 'creator') {
    return user.profile.role;
  }
  if (user.user_metadata?.intended_role === 'brand' || user.user_metadata?.intended_role === 'creator') {
    return user.user_metadata.intended_role;
  }
  if (user.user_metadata?.role === 'brand' || user.user_metadata?.role === 'creator') {
    return user.user_metadata.role;
  }
  if (user.role === 'brand' || user.role === 'creator') {
    return user.role;
  }
  if (typeof window !== 'undefined') {
    const active = localStorage.getItem('creasync_active_role');
    if (active === 'brand' || active === 'creator') return active;
    const intended = sessionStorage.getItem('creasync_intended_role') || localStorage.getItem('creasync_intended_role');
    if (intended === 'brand' || intended === 'creator') return intended;
  }
  return null;
}

export default function App() {
  // Active Authenticated User & Protected Action Queue
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRef = useRef(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const [loginInitialRole, setLoginInitialRole] = useState('brand');
  const [loginNotice, setLoginNotice] = useState(null);

  // Synchronously update both the ref and the React state
  const updateActiveUser = (user) => {
    currentUserRef.current = user;
    setCurrentUser(user);
  };

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'discover' | 'creator-profile' | 'creator-not-found' | 'brand-workspace' | 'creator-join' | 'creator-workspace'
  const [activeCreatorId, setActiveCreatorId] = useState(null);
  const [initialBrandTab, setInitialBrandTab] = useState('overview');
  const [initialCreatorTab, setInitialCreatorTab] = useState('overview');

  // --- Filtering Pipeline Trace States ---
  const [pipelineTrace, setPipelineTrace] = useState(null);
  const [isPipelineTraceModalOpen, setIsPipelineTraceModalOpen] = useState(false);
  const [isPipelineTraceLoading, setIsPipelineTraceLoading] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState(null);
  const pipelineRunVersionRef = useRef(0);

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
    let isMounted = true;
    const syncBackend = async () => {
      try {
        const [
          cloudCreators,
          cloudCampaigns,
          cloudBrands,
          cloudInvs,
          cloudCollabs,
          cloudShortlists
        ] = await Promise.allSettled([
          fetchBackendCreators(),
          fetchBackendCampaigns(),
          fetchBackendBrands(),
          fetchBackendInvitations(),
          fetchBackendCollaborations(),
          fetchBackendShortlists()
        ]);

        if (!isMounted) return;

        setMarketplaceData(prev => {
          const next = { ...prev };
          if (cloudCreators.status === 'fulfilled' && cloudCreators.value?.length > 0) {
            next.creators = cloudCreators.value;
          }
          if (cloudCampaigns.status === 'fulfilled' && cloudCampaigns.value?.length > 0) {
            next.campaigns = cloudCampaigns.value;
          }
          if (cloudBrands.status === 'fulfilled' && cloudBrands.value?.length > 0) {
            next.brands = cloudBrands.value;
          }
          if (cloudInvs.status === 'fulfilled' && cloudInvs.value?.length > 0) {
            next.invitations = cloudInvs.value;
          }
          if (cloudCollabs.status === 'fulfilled' && cloudCollabs.value?.length > 0) {
            next.projects = cloudCollabs.value;
          }
          if (cloudShortlists.status === 'fulfilled' && typeof cloudShortlists.value === 'object' && Object.keys(cloudShortlists.value || {}).length > 0) {
            next.shortlists = cloudShortlists.value;
          }
          return next;
        });
      } catch (e) {
        console.warn('[CreaSync] Initial cloud sync deferred to local cache:', e);
      }
    };
    syncBackend();

    // Supabase Realtime listeners for live multi-user / multi-tab synchronicity
    const unsubInv = subscribeToInvitations(payload => {
      if (payload?.new) {
        fetchBackendInvitations().then(freshInvs => {
          if (isMounted && freshInvs?.length) {
            setMarketplaceData(prev => ({ ...prev, invitations: freshInvs }));
          }
        }).catch(() => {});
      }
    });

    const unsubCollab = subscribeToCollaborations(payload => {
      if (payload?.new) {
        fetchBackendCollaborations().then(freshCollabs => {
          if (isMounted && freshCollabs?.length) {
            setMarketplaceData(prev => ({ ...prev, projects: freshCollabs }));
          }
        }).catch(() => {});
      }
    });

    const unsubCamp = subscribeToCampaigns(payload => {
      if (payload?.new) {
        fetchBackendCampaigns().then(freshCamps => {
          if (isMounted && freshCamps?.length) {
            setMarketplaceData(prev => ({ ...prev, campaigns: freshCamps }));
          }
        }).catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      unsubInv();
      unsubCollab();
      unsubCamp();
    };
  }, []);

  // Derive effective active brand ID strictly aligned with currentUser
  const effectiveBrandId = useMemo(() => {
    const role = resolveUserRole(currentUser);
    if (role === 'brand' && currentUser?.email && currentUser.email !== 'lumina.demo@alloy.market') {
      const emailKey = currentUser.email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '-');
      return `brand-${emailKey}`;
    }
    return activeBrandId || 'brand-demo-lumina';
  }, [currentUser, activeBrandId]);

  // Derived Brand-Scoped Data (Strict Data Isolation)
  const brandScoped = getBrandScopedData(marketplaceData, effectiveBrandId, isDemoMode);
  const currentBrand = brandScoped.currentBrand;
  const brandCampaigns = brandScoped.campaigns;
  const activeCampaign = brandScoped.activeCampaign || brandCampaigns[0] || null;
  const brandInvitations = brandScoped.invitations;
  const brandProjects = brandScoped.projects;
  const brandConnections = brandScoped.connections;
  const brandShortlists = brandScoped.shortlists;

  // Visible brands: When a real brand user is logged in, ONLY their brand is in the architecture (no demo brands!)
  const visibleBrands = useMemo(() => {
    if (!currentUser || currentUser.email === 'lumina.demo@alloy.market') {
      const demoList = (marketplaceData.brands || DEMO_BRANDS).filter(b => b.isDemo);
      return demoList.length > 0 ? demoList : (marketplaceData.brands || DEMO_BRANDS);
    }
    const myBrands = (marketplaceData.brands || []).filter(b => !b.isDemo && (b.id === effectiveBrandId || b.userId === currentUser.id));
    if (myBrands.length > 0) return myBrands;
    return currentBrand ? [currentBrand] : [];
  }, [marketplaceData.brands, effectiveBrandId, currentUser, currentBrand]);

  // Public Creator Opportunities (strictly published only)
  const publicOpportunities = getPublicCreatorOpportunities(marketplaceData);

  // Saved / Favorited creators
  const [savedCreatorIds, setSavedCreatorIds] = useState(['elena-rostova', 'kai-sorenson']);

  // Modals state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTargetCreator, setInviteTargetCreator] = useState(null);

  // Persistent pointer to the creator profile published on this device.
  // Derived from marketplace state so it survives refresh; never substituted with a different creator.
  const myCreatorId = marketplaceData.myCreatorId || null;
  const myCreator = myCreatorId ? (creatorsList.find(c => c.id === myCreatorId) || null) : null;

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



  // Role Conflict Resolution State
  const [isRoleConflictOpen, setIsRoleConflictOpen] = useState(false);
  const [conflictAttemptedRole, setConflictAttemptedRole] = useState('brand');

  // Authentication & OAuth session synchronization
  useEffect(() => {
    let isMounted = true;
    let authListener = null;

    if (isSupabaseConfigured() && supabase) {
      // 1. Validate session against Supabase Auth server on mount
      getCurrentUser().then(user => {
        if (!isMounted) return;
        if (user) {
          updateActiveUser(user);
          syncUserProfileSafely(user, null);
        } else {
          const localUser = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null')
            : null;
          if (localUser) {
            updateActiveUser(localUser);
          } else {
            updateActiveUser(null);
          }
        }
        setAuthLoading(false);
      }).catch(err => {
        console.warn('[CreaSync Auth] Session validation note:', err);
        const localUser = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null')
          : null;
        if (localUser) {
          updateActiveUser(localUser);
        } else {
          updateActiveUser(null);
        }
        if (isMounted) setAuthLoading(false);
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
              } catch (e) { }
            }

            // Sync user profile (preserves existing verified profile roles!)
            const syncedProfile = await syncUserProfileSafely(session.user, intendedRole);

            // Validate user and load verified database profile
            const verifiedUser = await getCurrentUser();
            const active = verifiedUser || { ...session.user, profile: syncedProfile };
            if (syncedProfile && active) {
              active.profile = syncedProfile;
            }
            const activeRole = active?.profile?.role
              || (active?.role !== 'authenticated' ? active?.role : null)
              || intendedRole
              || (typeof window !== 'undefined' ? localStorage.getItem('creasync_active_role') : null)
              || 'brand';

            active.role = activeRole;
            if (!active.profile) {
              active.profile = { role: activeRole };
            } else {
              active.profile.role = activeRole;
            }

            if (typeof window !== 'undefined') {
              localStorage.setItem('creasync_active_user', JSON.stringify(active));
              localStorage.setItem('creasync_active_role', activeRole);
            }

            updateActiveUser(active);
            setAuthLoading(false);

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
            updateActiveUser(verifiedUser || session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          updateActiveUser(null);
          setAuthLoading(false);
        }
      });

      authListener = subscription;
    } else {
      // Fallback for offline/local simulation
      getCurrentUser().then(user => {
        if (isMounted) {
          if (user) {
            updateActiveUser(user);
          }
          setAuthLoading(false);
        }
      }).catch(() => {
        if (isMounted) setAuthLoading(false);
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
    if (user) {
      updateActiveUser(user);
    }
    const activeUser = user || currentUserRef.current || currentUser;

    let action = pendingAction;
    if (!action) {
      try {
        const stored = sessionStorage.getItem('creasync_pending_action');
        if (stored) {
          action = JSON.parse(stored);
        }
      } catch (e) { }
    }

    try {
      sessionStorage.removeItem('creasync_pending_action');
    } catch (e) { }
    setPendingAction(null);
    setLoginNotice(null);
    setIsLoginOpen(false); // Close login modal on successful authentication

    // Role-based routing hierarchy:
    // 1. Database-verified profile role (Preserve existing persisted role!)
    // 2. Explicit role passed to this execution (if user had no existing profile role)
    // 3. Stored intent from current login flow (if user had no existing profile role)
    // 4. User metadata (role or intended_role)
    // 5. Active role stored in localStorage
    const storedIntent = typeof window !== 'undefined'
      ? (sessionStorage.getItem('creasync_intended_role') || localStorage.getItem('creasync_intended_role'))
      : null;
    const storedActive = typeof window !== 'undefined'
      ? localStorage.getItem('creasync_active_role')
      : null;

    const existingProfileRole = (activeUser?.profile?.role === 'creator' || activeUser?.profile?.role === 'brand')
      ? activeUser.profile.role
      : null;

    const resolvedRole = existingProfileRole
      || (explicitRole === 'creator' || explicitRole === 'brand' ? explicitRole : null)
      || (storedIntent === 'creator' || storedIntent === 'brand' ? storedIntent : null)
      || resolveUserRole(activeUser)
      || (storedActive === 'creator' || storedActive === 'brand' ? storedActive : null);

    if (resolvedRole === 'brand' || resolvedRole === 'creator') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('creasync_active_role', resolvedRole);
      }
      if (activeUser) {
        if (!activeUser.profile || !activeUser.profile.role) {
          activeUser.profile = { ...(activeUser.profile || {}), role: resolvedRole };
        }
        activeUser.role = resolvedRole;
        if (typeof window !== 'undefined') {
          localStorage.setItem('creasync_active_user', JSON.stringify(activeUser));
        }
      }
    }

    // Consume one-time OAuth intent after routing
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('creasync_intended_role');
        localStorage.removeItem('creasync_intended_role');
      } catch (e) { }
    }

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
            // Same persistence path as handlePublishCreator — ownership pointer must land
            // in localStorage before backend sync to avoid stale shared-store snapshots
            saveMarketplaceState({
              ...updateCreatorRecord(getInitialMarketplaceState(), action.creator),
              myCreatorId: action.creator.id
            });
            setMarketplaceData(prev => ({
              ...updateCreatorRecord(prev, action.creator),
              myCreatorId: action.creator.id
            }));
            setActiveCreatorId(action.creator.id);
            saveBackendCreator(action.creator).catch(err => {
              console.warn('[CreaSync] Background creator sync deferred:', err);
            });
            navigateTo('creator-workspace', null, activeUser);
          }
          return;
        case 'NAVIGATE':
          if (action.view === 'brand-workspace') {
            if (resolvedRole === 'brand') {
              navigateTo('brand-workspace', null, activeUser);
            } else if (resolvedRole === 'creator') {
              setConflictAttemptedRole('brand');
              setIsRoleConflictOpen(true);
            } else {
              setIsRoleSelectOpen(true);
            }
            return;
          } else if (action.view === 'creator-workspace') {
            if (resolvedRole === 'creator') {
              navigateTo('creator-workspace', null, activeUser);
            } else if (resolvedRole === 'brand') {
              setConflictAttemptedRole('creator');
              setIsRoleConflictOpen(true);
            } else {
              setIsRoleSelectOpen(true);
            }
            return;
          } else if (action.view) {
            navigateTo(action.view, null, activeUser);
            return;
          }
          break;
        default:
          break;
      }
    }

    if (resolvedRole === 'creator') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('creasync_active_role', 'creator');
      }
      navigateTo('creator-workspace', null, activeUser);
    } else if (resolvedRole === 'brand') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('creasync_active_role', 'brand');
      }
      navigateTo('brand-workspace', null, activeUser);
    } else {
      // Missing role: prompt explicitly
      console.warn('[CreaSync Auth] Missing role for authenticated user; opening role selection');
      setIsRoleSelectOpen(true);
    }
  };

  // Guard wrapper for actions that require authentication
  const requireAuth = (actionConfig, onAuthorized) => {
    const activeUser = currentUserRef.current || currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null') : null);
    if (activeUser) {
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
    } catch (e) { }

    setLoginInitialRole(targetRole);
    setLoginNotice(actionConfig.notice || 'Authentication required to proceed');
    setIsLoginOpen(true);
    return false;
  };

  // Contextual authentication for "I want to hire"
  const handleHireAction = () => {
    const activeUser = currentUserRef.current || currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null') : null);
    if (!activeUser) {
      requireAuth({
        type: 'NAVIGATE',
        view: 'brand-workspace',
        role: 'brand',
        notice: 'Please sign in to access Brand Studio and hire creators'
      }, () => {
        navigateTo('brand-workspace');
      });
      return;
    }

    const currentRole = resolveUserRole(activeUser);

    if (currentRole === 'brand') {
      navigateTo('brand-workspace', null, activeUser);
    } else if (currentRole === 'creator') {
      // Explicit role conflict handling without silent overwrite
      setConflictAttemptedRole('brand');
      setIsRoleConflictOpen(true);
    } else {
      // Missing role: prompt explicitly
      setIsRoleSelectOpen(true);
    }
  };

  // Contextual authentication for "I'm a creator"
  const handleCreatorAction = () => {
    const activeUser = currentUserRef.current || currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null') : null);
    if (!activeUser) {
      requireAuth({
        type: 'NAVIGATE',
        view: 'creator-workspace',
        role: 'creator',
        notice: 'Please sign in to access Creator Studio and build your portfolio'
      }, () => {
        navigateTo('creator-workspace');
      });
      return;
    }

    const currentRole = resolveUserRole(activeUser);

    if (currentRole === 'creator') {
      navigateTo('creator-workspace', null, activeUser);
    } else if (currentRole === 'brand') {
      // Explicit role conflict handling without silent overwrite
      setConflictAttemptedRole('creator');
      setIsRoleConflictOpen(true);
    } else {
      // Missing role: prompt explicitly
      setIsRoleSelectOpen(true);
    }
  };

  const handleLogout = async () => {
    await backendSignOut();
    updateActiveUser(null);
    setPendingAction(null);
    setLoginNotice(null);
    setIsLoginOpen(false);
    handleSwitchBrand('brand-demo-lumina');
    handleToggleDemoMode(true);
    try {
      sessionStorage.removeItem('creasync_pending_action');
      sessionStorage.removeItem('creasync_intended_role');
      localStorage.removeItem('creasync_active_user');
      localStorage.removeItem('creasync_active_role');
    } catch (e) { }
    navigateTo('home', null, null);
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

  // --- Context-Aware Direct Messages Navigation ---
  const handleOpenMessages = () => {
    const activeUser = currentUserRef.current || currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null') : null);

    if (!activeUser) {
      requireAuth({
        type: 'NAVIGATE',
        view: 'brand-workspace',
        role: 'brand',
        notice: 'Please sign in to access direct messaging'
      }, () => {
        setInitialBrandTab('messages');
        navigateTo('brand-workspace');
      });
      return;
    }

    const role = (currentView === 'creator-workspace') ? 'creator' :
                 (currentView === 'brand-workspace') ? 'brand' :
                 resolveUserRole(activeUser);

    if (role === 'creator') {
      setInitialCreatorTab('messages');
      navigateTo('creator-workspace', null, activeUser);
    } else {
      setInitialBrandTab('messages');
      navigateTo('brand-workspace', null, activeUser);
    }
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

  // Hash & URL Synchronization with Protected Route Guards
  // Stabilized with ref so creator state updates do not re-trigger scroll or auth-dependent effects
  const creatorsListRef = useRef(creatorsList);
  useEffect(() => {
    creatorsListRef.current = creatorsList;
  }, [creatorsList]);

  useEffect(() => {
    if (authLoading) return; // Prevent race conditions during initial session restoration

    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      const activeUser = currentUserRef.current || currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null') : null);
      const currentRole = resolveUserRole(activeUser);

      if (hash.startsWith('/creator/join')) {
        setCurrentView('creator-join');
      } else if (hash === '/creator') {
        // Protected Route Guard: Creator Studio
        if (!activeUser) {
          requireAuth({
            type: 'NAVIGATE',
            view: 'creator-workspace',
            role: 'creator',
            notice: 'Please sign in to access Creator Studio'
          });
          setCurrentView('home');
          window.location.hash = '';
          return;
        }

        if (currentRole === 'creator') {
          setCurrentView('creator-workspace');
        } else if (currentRole === 'brand') {
          setConflictAttemptedRole('creator');
          setIsRoleConflictOpen(true);
          setCurrentView('home');
          window.location.hash = '';
        } else {
          setIsRoleSelectOpen(true);
          setCurrentView('home');
          window.location.hash = '';
        }
      } else if (hash.startsWith('/creator/')) {
        const id = hash.replace('/creator/', '');
        const found = creatorsListRef.current.find(c => c.id === id);
        if (found) {
          setActiveCreatorId(id);
          setCurrentView('creator-profile');
        } else {
          // Missing creator: surface it explicitly instead of showing another creator's profile
          setActiveCreatorId(id || null);
          setCurrentView('creator-not-found');
        }
      } else if (hash === 'discover') {
        setCurrentView('discover');
      } else if (hash === '/brand/onboard') {
        setCurrentView('brand-onboard');
      } else if (hash === '/brand') {
        // Protected Route Guard: Brand Studio
        if (!activeUser) {
          requireAuth({
            type: 'NAVIGATE',
            view: 'brand-workspace',
            role: 'brand',
            notice: 'Please sign in to access Brand Studio'
          });
          setCurrentView('home');
          window.location.hash = '';
          return;
        }

        if (currentRole === 'brand') {
          setCurrentView('brand-workspace');
        } else if (currentRole === 'creator') {
          setConflictAttemptedRole('brand');
          setIsRoleConflictOpen(true);
          setCurrentView('home');
          window.location.hash = '';
        } else {
          setIsRoleSelectOpen(true);
          setCurrentView('home');
          window.location.hash = '';
        }
      } else {
        setCurrentView('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, [authLoading, currentUser]);

  const navigateTo = (view, extraId = null, overrideUser = null) => {
    const activeUser = overrideUser || currentUserRef.current || currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('creasync_active_user') || 'null') : null);
    const currentRole = resolveUserRole(activeUser);

    if (view === 'brand-workspace') {
      if (!activeUser) {
        requireAuth({
          type: 'NAVIGATE',
          view: 'brand-workspace',
          role: 'brand',
          notice: 'Please sign in to access Brand Studio'
        });
        return;
      }
      if (currentRole === 'creator') {
        setConflictAttemptedRole('brand');
        setIsRoleConflictOpen(true);
        return;
      }
      if (activeUser.email && activeUser.email !== 'lumina.demo@alloy.market') {
        const emailKey = activeUser.email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '-');
        const customBrandId = `brand-${emailKey}`;
        setMarketplaceData(prev => {
          if (prev.activeBrandId !== customBrandId) {
            const existingBrand = (prev.brands || []).find(b => b.id === customBrandId);
            const brandName = activeUser.profile?.display_name || activeUser.display_name || activeUser.email.split('@')[0];
            const updatedBrands = existingBrand ? prev.brands : [
              {
                id: customBrandId,
                name: brandName,
                industry: 'Creative & Digital',
                description: `${brandName} private studio workspace.`,
                aesthetic: 'Modern & Editorial',
                isDemo: false
              },
              ...(prev.brands || [])
            ];
            return {
              ...prev,
              brands: updatedBrands,
              activeBrandId: customBrandId,
              isDemoMode: false
            };
          }
          return prev;
        });
      }
      setCurrentView('brand-workspace');
      window.location.hash = '/brand';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'creator-workspace') {
      if (!activeUser) {
        requireAuth({
          type: 'NAVIGATE',
          view: 'creator-workspace',
          role: 'creator',
          notice: 'Please sign in to access Creator Studio'
        });
        return;
      }
      if (currentRole === 'brand') {
        setConflictAttemptedRole('creator');
        setIsRoleConflictOpen(true);
        return;
      }
      setCurrentView('creator-workspace');
      window.location.hash = '/creator';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    setCurrentView(view);
    if (view === 'creator-profile' && extraId) {
      setActiveCreatorId(extraId);
      window.location.hash = `/creator/${extraId}`;
    } else if (view === 'discover') {
      window.location.hash = 'discover';
    } else if (view === 'brand-onboard') {
      window.location.hash = '/brand/onboard';
    } else if (view === 'creator-join') {
      window.location.hash = '/creator/join';
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
    saveBackendBrand(newBrand, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background brand sync deferred:', err);
    });
  };

  const handleUpdateBrand = (brandId, updates) => {
    setMarketplaceData(prev => {
      const updated = (prev.brands || []).map(b => b.id === brandId ? { ...b, ...updates } : b);
      const target = updated.find(b => b.id === brandId);
      if (target) {
        saveBackendBrand(target, currentUser?.id).catch(err => {
          console.warn('[CreaSync] Background brand update sync deferred:', err);
        });
      }
      return {
        ...prev,
        brands: updated,
        campaigns: (prev.campaigns || []).map(c => c.ownerBrandId === brandId ? {
          ...c,
          brandName: updates.name || c.brandName,
          brandAvatar: updates.logo || c.brandAvatar,
          brandWebsite: updates.website || c.brandWebsite
        } : c)
      };
    });
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

  const handleRunFilteringPipeline = async (targetCampaign) => {
    const campaignToRun = targetCampaign || (marketplaceData.campaigns || []).find(c => c.id === marketplaceData.activeCampaignId) || marketplaceData.campaigns?.[0];
    if (!campaignToRun) return;
    setIsPipelineTraceLoading(true);
    const currentVersion = ++pipelineRunVersionRef.current;
    try {
      // Pass null creators to ensure authoritative server-side creator data is used
      const trace = await executeCampaignFilteringPipeline(campaignToRun, null);
      if (currentVersion === pipelineRunVersionRef.current) {
        setPipelineTrace({
          ...trace,
          isStale: false,
          staleReason: null
        });
        setIsPipelineTraceModalOpen(true);
      }
    } catch (err) {
      console.error('[App] Pipeline execution error:', err);
    } finally {
      if (currentVersion === pipelineRunVersionRef.current) {
        setIsPipelineTraceLoading(false);
      }
    }
  };

  // --- Campaign Handlers ---
  const handleSelectCampaign = (campId) => {
    setMarketplaceData(prev => ({
      ...prev,
      activeCampaignId: campId
    }));
  };

  const handleCampaignCreated = async (newCampaignData, options = {}) => {
    const finalCamp = createCampaignRecord(newCampaignData, currentBrand);
    setMarketplaceData(prev => ({
      ...prev,
      campaigns: [finalCamp, ...(prev.campaigns || [])],
      activeCampaignId: finalCamp.id
    }));
    // Asynchronously synchronize with backend cloud store
    saveBackendCampaign(newCampaignData, currentBrand, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background campaign sync deferred:', err);
    });
    setIsCampaignModalOpen(false);
    navigateTo('brand-workspace');

    // Run backend filtering pipeline and present real execution trace
    try {
      setIsPipelineTraceLoading(true);
      const trace = await executeCampaignFilteringPipeline(finalCamp, null);
      setPipelineTrace({
        ...trace,
        isStale: false,
        staleReason: null
      });
      setIsPipelineTraceModalOpen(true);
    } catch (pipelineErr) {
      console.warn('[App] Pipeline trace presentation deferred:', pipelineErr);
    } finally {
      setIsPipelineTraceLoading(false);
    }
  };

  const handleUpdateCampaign = async (campaignId, updates) => {
    let updatedCampaign = null;
    setMarketplaceData(prev => {
      const updatedList = (prev.campaigns || []).map(c => {
        if (c.id === campaignId) {
          updatedCampaign = { ...c, ...updates, updatedAt: 'Just now' };
          saveBackendCampaign(updatedCampaign, currentBrand, currentUser?.id).catch(err => {
            console.warn('[CreaSync] Background campaign update sync deferred:', err);
          });
          return updatedCampaign;
        }
        return c;
      });
      return {
        ...prev,
        campaigns: updatedList
      };
    });

    if (!updatedCampaign) {
      const existing = (marketplaceData.campaigns || []).find(c => c.id === campaignId);
      if (existing) {
        updatedCampaign = { ...existing, ...updates };
        saveBackendCampaign(updatedCampaign, currentBrand, currentUser?.id).catch(err => {
          console.warn('[CreaSync] Background campaign update sync deferred:', err);
        });
      }
    }

    if (!updatedCampaign) return;

    // Fix 1: Automatically rerun pipeline after Update Campaign and show running/presenting state
    setIsPipelineTraceLoading(true);
    setIsPipelineTraceModalOpen(true);

    const isCurrentTraceCampaign = pipelineTrace && (pipelineTrace.campaignId === campaignId || !pipelineTrace.campaignId);
    const isCurrentFilterCampaign = pipelineFilter && pipelineFilter.campaignId === campaignId;

    // Invalidate prior trace immediately: retain prior results labeled as stale while re-running
    setPipelineTrace(prev => prev ? {
      ...prev,
      isStale: true,
      staleReason: 'Campaign brief requirements updated. Re-evaluating pipeline…'
    } : null);

    if (isCurrentFilterCampaign) {
      setPipelineFilter(prev => prev ? {
        ...prev,
        isStale: true,
        staleReason: 'Campaign brief requirements updated. Re-running pipeline…'
      } : null);
    }

    // Race condition guard: increment version token so older responses cannot overwrite newer results
    const currentVersion = ++pipelineRunVersionRef.current;

    try {
      const freshTrace = await executeCampaignFilteringPipeline(updatedCampaign, null);

      // Replace prior results only after a successful new run
      if (currentVersion === pipelineRunVersionRef.current) {
        setPipelineTrace({
          ...freshTrace,
          isStale: false,
          staleReason: null
        });

        // Update Discover Creators filter with the exact new eligible set and ranking
        if (isCurrentFilterCampaign) {
          setPipelineFilter({
            campaignId,
            campaignTitle: updatedCampaign.title || freshTrace.campaignTitle,
            eligibleCreatorIds: freshTrace.eligibleCreatorIds || [],
            rankedOrder: freshTrace.rankedCreators || [],
            isStale: false
          });
        }
      }
    } catch (err) {
      console.warn('[App] Pipeline rerun failed after brief update:', err);
      // If execution fails, retain previous results as stale and label them clearly
      if (currentVersion === pipelineRunVersionRef.current) {
        setPipelineTrace(prev => prev ? {
          ...prev,
          isStale: true,
          staleReason: 'Pipeline re-evaluation failed. Displaying previous results as stale.'
        } : null);

        if (isCurrentFilterCampaign) {
          setPipelineFilter(prev => prev ? {
            ...prev,
            isStale: true,
            staleReason: 'Pipeline re-evaluation failed. Displaying previous results as stale.'
          } : null);
        }
      }
    } finally {
      if (currentVersion === pipelineRunVersionRef.current) {
        setIsPipelineTraceLoading(false);
      }
    }
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
    saveBackendCampaign(duplicated, currentBrand, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background campaign duplicate sync deferred:', err);
    });
  };

  const handleDeleteCampaign = (campaignId) => {
    setMarketplaceData(prev => {
      const remaining = (prev.campaigns || []).filter(c => c.id !== campaignId);
      const nextActive = remaining.find(c => c.ownerBrandId === currentBrand?.id)?.id || remaining[0]?.id || null;
      const newShortlists = { ...(prev.shortlists || {}) };
      delete newShortlists[campaignId];
      deleteBackendCampaign(campaignId).catch(err => {
        console.warn('[CreaSync] Background campaign delete sync deferred:', err);
      });
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
      toggleBackendShortlist(currentBrand?.id || 'brand-active', campaignId, creatorId).catch(err => {
        console.warn('[CreaSync] Background shortlist toggle sync deferred:', err);
      });
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

    sendBackendInvitation(newInvitation, currentBrand?.name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background invitation send sync deferred:', err);
    });
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

    updateBackendInvitationStatus(invitation.id, 'accepted', currentUser?.display_name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background invitation accept sync deferred:', err);
    });
    saveBackendCollaboration(newProject, currentUser?.display_name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background collaboration sync deferred:', err);
    });
  };

  // Creator Declines Invitation
  const handleDeclineInvitation = (invitation) => {
    setMarketplaceData(prev => ({
      ...prev,
      invitations: prev.invitations.map(inv => inv.id === invitation.id ? { ...inv, status: 'declined' } : inv)
    }));
    updateBackendInvitationStatus(invitation.id, 'declined', currentUser?.display_name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background invitation decline sync deferred:', err);
    });
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

    submitBackendDeliverables(projectId, { assetsUrl, notes, milestone }, currentUser?.display_name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background deliverable submission sync deferred:', err);
    });
  };

  const handleRequestRevision = (projectId, { revisionNotes }) => {
    const newFb = {
      id: `fb-${Date.now()}`,
      author: "Brand Creative Director",
      role: "brand",
      text: `“Revision requested: ${revisionNotes}”`,
      timestamp: "Just now"
    };

    setMarketplaceData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
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

    requestBackendRevision(projectId, { revisionNotes }, currentUser?.display_name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background revision request sync deferred:', err);
    });
  };

  const handleApproveDeliverables = (projectId, { approvalNotes }) => {
    const newFb = {
      id: `fb-${Date.now()}`,
      author: "Brand Creative Director",
      role: "brand",
      text: approvalNotes ? `“Approved: ${approvalNotes}”` : "“Deliverables approved! Final milestone unlocked & payout released.”",
      timestamp: "Just now"
    };

    setMarketplaceData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
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

    approveBackendDeliverables(projectId, { approvalNotes }, currentUser?.display_name, currentUser?.id).catch(err => {
      console.warn('[CreaSync] Background deliverable approval sync deferred:', err);
    });
  };

  // Creator Profile & Portfolio Management (Unified Single Source of Truth)
  const handleUpdateCreator = (updatedCreator) => {
    if (!updatedCreator || !updatedCreator.id) return;
    setMarketplaceData(prev => updateCreatorRecord(prev, updatedCreator));
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
        // Persist ownership pointer to localStorage before backend sync to avoid stale snapshots
        saveMarketplaceState({
          ...updateCreatorRecord(getInitialMarketplaceState(), newCreator),
          myCreatorId: newCreator.id
        });
        setMarketplaceData(prev => ({
          ...updateCreatorRecord(prev, newCreator),
          myCreatorId: newCreator.id
        }));
        setActiveCreatorId(newCreator.id);
        saveBackendCreator(newCreator).catch(err => {
          console.warn('[CreaSync] Background creator sync deferred:', err);
        });
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

  const handleCreateWorkspaceFromProject = ({ project, creator, suggestedName, suggestedAesthetic }) => {
    // If user is brand, create/launch a brand workspace or pre-fill campaign/collaboration workspace
    const targetBrand = currentBrand || visibleBrands[0];
    const userRole = resolveUserRole(currentUser);

    if (userRole === 'creator') {
      // Navigate to creator studio projects/collaborations
      setInitialCreatorTab('projects');
      navigateTo('creator-workspace');
      return;
    }

    // Launch Brand Studio workspace with pre-populated project collaboration context
    if (targetBrand) {
      // Create new campaign or activate workspace
      const newCampaign = {
        id: `camp-proj-${Date.now()}`,
        ownerBrandId: targetBrand.id,
        title: suggestedName || `${project.title} Production Collaboration`,
        brandName: targetBrand.name,
        brandAvatar: targetBrand.logo,
        status: 'active',
        budget: '$8,000 - $14,000',
        timeline: '3-4 Weeks Production',
        objective: `Commission and produce creative deliverables based on ${project.title}.`,
        aesthetic: suggestedAesthetic || project.creativeStyle || 'Cinematic & Editorial',
        deliverables: project.format || '4K Master Video & Stills Suite',
        tools: project.tools || 'Midjourney v6, Runway Gen-3',
        description: project.description || 'Dedicated commercial production workspace.',
        createdAt: 'Just now'
      };

      setMarketplaceData(prev => ({
        ...prev,
        campaigns: [newCampaign, ...(prev.campaigns || [])],
        activeCampaignId: newCampaign.id
      }));

      saveBackendCampaign(newCampaign, targetBrand, currentUser?.id).catch(err => {
        console.warn('[CreaSync] Background campaign sync deferred:', err);
      });

      setInitialBrandTab('overview');
      navigateTo('brand-workspace');
    } else {
      setInitialBrandTab('overview');
      navigateTo('brand-workspace');
    }
  };

  // Authorize & save dedicated AI production workflow for a specific portfolio project
  const handleSaveProjectWorkflow = async (projectId, stages) => {
    const creatorId = selectedProjectCreator?.id || myCreator?.id || 'maya-chen';

    // Normalize incoming workflow data
    const isObjectWorkflow = stages && typeof stages === 'object' && !Array.isArray(stages);
    const stepsArray = isObjectWorkflow ? (stages.steps || []) : (Array.isArray(stages) ? stages : []);
    const wfTitle = isObjectWorkflow ? (stages.title || '') : '';
    const wfOverview = isObjectWorkflow ? (stages.overview || '') : '';

    // 1. Update project in marketplaceData creators
    setMarketplaceData(prev => {
      const updatedCreators = (prev.creators || CREATORS).map(c => {
        if (c.id === creatorId) {
          const updatedProjects = (c.projects || []).map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                workflowStages: stepsArray,
                workflowTitle: wfTitle || p.workflowTitle || '',
                workflowOverview: wfOverview || p.workflowOverview || '',
                productionWorkflow: {
                  ...(p.productionWorkflow || {}),
                  title: wfTitle || p.productionWorkflow?.title || '',
                  overview: wfOverview || p.productionWorkflow?.overview || '',
                  steps: stepsArray
                },
                updatedAt: 'Just now'
              };
            }
            return p;
          });
          return {
            ...c,
            projects: updatedProjects
          };
        }
        return c;
      });

      return {
        ...prev,
        creators: updatedCreators
      };
    });

    // 2. Also update selectedProject state in-memory so modal view updates instantly
    setSelectedProject(prev => {
      if (prev && prev.id === projectId) {
        return {
          ...prev,
          workflowStages: stepsArray,
          workflowTitle: wfTitle || prev.workflowTitle || '',
          workflowOverview: wfOverview || prev.workflowOverview || '',
          productionWorkflow: {
            ...(prev.productionWorkflow || {}),
            title: wfTitle || prev.productionWorkflow?.title || '',
            overview: wfOverview || prev.productionWorkflow?.overview || '',
            steps: stepsArray
          }
        };
      }
      return prev;
    });

    // 3. Persist to Supabase backend through savePortfolioProject
    const targetProject = (selectedProjectCreator?.projects || []).find(p => p.id === projectId) || selectedProject;
    if (targetProject) {
      await saveBackendProject(creatorId, {
        ...targetProject,
        workflowStages: stepsArray,
        workflowTitle: wfTitle || targetProject.workflowTitle || '',
        workflowOverview: wfOverview || targetProject.workflowOverview || '',
        productionWorkflow: {
          ...(targetProject.productionWorkflow || {}),
          title: wfTitle || targetProject.productionWorkflow?.title || '',
          overview: wfOverview || targetProject.productionWorkflow?.overview || '',
          steps: stepsArray
        }
      });
    }
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
    const creator = myCreator;
    if (!creator) return;
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

  const activeCreator = activeCreatorId
    ? (creatorsList.find(c => c.id === activeCreatorId) || null)
    : null;

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
        onOpenMessages={handleOpenMessages}
        activeCampaign={activeCampaign}
        createdCreatorProfile={myCreator}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Views */}
      <main>
        {/* VIEW 1: ALLOY MASTER LANDING PAGE */}
        {currentView === 'home' && (
          <>
            {/* 1. Master Editorial Hero with 3D ALLOY Animation Engine */}
            <Hero
              onFindCreator={handleHireAction}
              onJoinCreator={handleCreatorAction}
              onExploreWork={() => navigateTo('discover')}
              onSelectCreator={handleOpenCreatorProfile}
            />

            {/* 2. Curated Creative Portfolio Showcase ("Meet creativity in every direction.") */}
            <CreativeShowcase
              creators={creatorsList}
              onSelectProject={handleSelectProject}
              onSelectCreator={handleOpenCreatorProfile}
              onExploreAll={() => navigateTo('discover')}
            />

            {/* 3. How ALLOY Works (3 Connected Steps + Dual Paths) */}
            <HowItWorks
              onFindCreators={handleHireAction}
              onBuildPortfolio={handleCreatorAction}
            />

            {/* 4. Creator DNA Architecture ("Every creator has a signature.") */}
            <CreatorDNASection
              creators={creatorsList}
              onSelectCreator={handleOpenCreatorProfile}
            />

            {/* 5. Two Clear User Journeys (For Brands & For Creators) */}
            <TwoJourneysSection
              onFindCreators={handleHireAction}
              onJoinAlloy={handleCreatorAction}
              onExploreBrandStudio={handleHireAction}
              onBuildCreatorProfile={handleCreatorAction}
            />

            {/* 6. Show How Matching Works (Explainable Style Alignment) */}
            <CreaMatchSection
              creators={creatorsList}
              onExploreDiscover={() => navigateTo('discover')}
              onEnterBrandStudio={handleHireAction}
            />

            {/* 7. CreaSim Interactive Concept Storyboards ("See what the collaboration could become.") */}
            <ProductPreview
              onSelectCreator={handleOpenCreatorProfile}
              onExploreMarketplace={() => navigateTo('discover')}
            />

            {/* 8. Final Closing Banner & Direct Collaboration Actions */}
            <FinalCTA
              onFindCreator={handleHireAction}
              onJoinCreator={handleCreatorAction}
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
            pipelineFilter={pipelineFilter}
            onClearPipelineFilter={() => setPipelineFilter(null)}
            onOpenPipelineTrace={handleRunFilteringPipeline}
          />
        )}

        {/* VIEW 3: BRAND STUDIO (Overhauled Multi-Section Brand Experience) */}
        {currentView === 'brand-workspace' && (
          <BrandWorkspaceView
            currentBrand={currentBrand}
            allBrands={visibleBrands}
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
            onRunFilteringPipeline={handleRunFilteringPipeline}
            initialTab={initialBrandTab}
            pipelineFilter={pipelineFilter}
            onClearPipelineFilter={() => setPipelineFilter(null)}
            onOpenPipelineTrace={(campaignId) => {
              const camp = (marketplaceData.campaigns || []).find(c => c.id === campaignId) || activeCampaign;
              if (camp) {
                handleRunFilteringPipeline(camp);
              } else {
                setIsPipelineTraceModalOpen(true);
              }
            }}
            onOpenTrustCenter={() => setCurrentView('trust-center')}
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
        {currentView === 'creator-workspace' && myCreator && (
          <CreatorWorkspaceView
            creator={myCreator}
            currentUser={currentUser}
            onUpdateCreator={handleUpdateCreator}
            onViewPublicProfile={() => handleOpenCreatorProfile(myCreator.id)}
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
            onSelectProject={handleSelectProject}
            initialTab={initialCreatorTab}
          />
        )}

        {/* VIEW 5b: CREATOR WORKSPACE EMPTY STATE (no published creator on this device) */}
        {currentView === 'creator-workspace' && !myCreator && (
          <div className="page-container-narrow" style={{ padding: '96px 24px', textAlign: 'center' }}>
            <h2 className="step-main-headline font-editorial">No Creator Studio On This Device Yet</h2>
            <p className="step-main-sub" style={{ margin: '12px auto 28px', maxWidth: '560px' }}>
              Your Creator Studio opens after you publish a creator profile. Finish creator onboarding to publish your identity and portfolio for brands to discover.
            </p>
            <div className="step-footer-actions justify-center">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigateTo('creator-join')}
              >
                <span>Start Creator Onboarding</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigateTo('discover')}
              >
                <span>Explore Creator Marketplace</span>
              </button>
            </div>
          </div>
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
            isCurrentCreatorOwner={myCreator?.id === activeCreator?.id}
            onEditInStudio={() => navigateTo('creator-workspace')}
          />
        )}

        {/* VIEW 6b: CREATOR NOT FOUND (explicit — never substitutes another creator's profile) */}
        {(currentView === 'creator-not-found' || (currentView === 'creator-profile' && !activeCreator)) && (
          <div className="page-container-narrow" style={{ padding: '96px 24px', textAlign: 'center' }}>
            <h2 className="step-main-headline font-editorial">Creator Profile Not Found</h2>
            <p className="step-main-sub" style={{ margin: '12px auto 28px', maxWidth: '560px' }}>
              We couldn't find a creator matching this link on this device. The profile may have been unpublished, or the link may be incorrect.
            </p>
            <div className="step-footer-actions justify-center">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigateTo('discover')}
              >
                <span>Back to Marketplace</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: DEDICATED TRUST CENTRE */}
        {currentView === 'trust-center' && (
          <TrustCenterView
            creators={creatorsList}
            activeCreatorId={activeCreator?.id || myCreator?.id || 'maya-chen'}
            currentUser={currentUser}
            onUpdateCreator={handleUpdateCreator}
            onViewCreatorProfile={handleOpenCreatorProfile}
            onBackToMarketplace={() => navigateTo('discover')}
          />
        )}
      </main>

      {/* SECTION K: Clean Footer */}
      <Footer
        onNavigate={(v) => navigateTo(v)}
        onOpenCampaignModal={() => requireAuth({ type: 'CREATE_CAMPAIGN', role: 'brand', notice: 'Please sign in to start a new campaign' }, () => setIsCampaignModalOpen(true))}
        onOpenCreatorModal={handleCreatorAction}
        onEnterBrandStudio={handleHireAction}
        onEnterCreatorStudio={handleCreatorAction}
        onOpenLogin={() => {
          setLoginNotice(null);
          setLoginInitialRole('brand');
          setIsLoginOpen(true);
        }}
        onOpenRoleSelect={() => setIsRoleSelectOpen(true)}
      />

      {/* Role Selection Modal */}
      <RoleSelectModal
        isOpen={isRoleSelectOpen}
        onClose={() => setIsRoleSelectOpen(false)}
        onSelectBrand={() => {
          setIsRoleSelectOpen(false);
          if (currentUser) {
            updateUserRoleExplicitly(currentUser, 'brand').then(() => {
              setCurrentUser(prev => ({ ...prev, role: 'brand', profile: { ...prev?.profile, role: 'brand' } }));
              navigateTo('brand-workspace');
            });
          } else {
            handleHireAction();
          }
        }}
        onSelectCreator={() => {
          setIsRoleSelectOpen(false);
          if (currentUser) {
            updateUserRoleExplicitly(currentUser, 'creator').then(() => {
              setCurrentUser(prev => ({ ...prev, role: 'creator', profile: { ...prev?.profile, role: 'creator' } }));
              navigateTo('creator-workspace');
            });
          } else {
            handleCreatorAction();
          }
        }}
      />

      {/* Role Conflict Resolution Modal */}
      <RoleConflictModal
        isOpen={isRoleConflictOpen}
        onClose={() => setIsRoleConflictOpen(false)}
        currentRole={currentUser?.profile?.role || currentUser?.role || (typeof window !== 'undefined' ? localStorage.getItem('creasync_active_role') : null) || 'brand'}
        attemptedRole={conflictAttemptedRole}
        userName={currentUser?.user_metadata?.full_name || currentUser?.profile?.display_name || currentUser?.email?.split('@')[0] || 'User'}
        onGoToAuthorizedWorkspace={() => {
          const activeRole = currentUser?.profile?.role || currentUser?.role || localStorage.getItem('creasync_active_role');
          if (activeRole === 'creator') {
            navigateTo('creator-workspace');
          } else {
            navigateTo('brand-workspace');
          }
        }}
        onLogout={handleLogout}
      />

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginNotice(null);
          setPendingAction(null);
          try {
            sessionStorage.removeItem('creasync_pending_action');
          } catch (e) { }
        }}
        initialRole={loginInitialRole}
        pendingActionNotice={loginNotice}
        onLoginSuccess={(user, role) => {
          setIsLoginOpen(false);
          setLoginNotice(null);
          const targetRole = role || user?.profile?.role || (user?.role !== 'authenticated' ? user?.role : null) || 'brand';
          if (targetRole === 'brand') {
            const isLuminaDemo = !user || (!user.email || user.email === 'lumina.demo@alloy.market');
            const brandUser = user ? {
              ...user,
              role: 'brand',
              isDemoOnly: isLuminaDemo,
              profile: {
                ...(user?.profile || {}),
                role: 'brand',
                display_name: user?.profile?.display_name || user?.user_metadata?.full_name || user?.display_name || (isLuminaDemo ? 'Lumina Botanica' : (user.email ? user.email.split('@')[0] : 'Brand Studio')),
                isDemoOnly: isLuminaDemo
              }
            } : {
              id: 'brand-demo-lumina',
              email: 'lumina.demo@alloy.market',
              role: 'brand',
              display_name: 'Lumina Botanica',
              isDemoOnly: true,
              profile: {
                id: 'brand-demo-lumina',
                email: 'lumina.demo@alloy.market',
                role: 'brand',
                display_name: 'Lumina Botanica',
                isDemoOnly: true
              }
            };
            localStorage.setItem('creasync_active_user', JSON.stringify(brandUser));
            localStorage.setItem('creasync_active_role', 'brand');
            updateActiveUser(brandUser);

            if (isLuminaDemo) {
              handleSwitchBrand('brand-demo-lumina');
              handleToggleDemoMode(true);
            } else {
              const emailKey = (brandUser.email || brandUser.id || 'custom').toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '-');
              const customBrandId = `brand-${emailKey}`;
              const brandName = brandUser.profile?.display_name || brandUser.display_name || (brandUser.email ? brandUser.email.split('@')[0] : 'My Brand Studio');

              const brandRecord = {
                id: customBrandId,
                userId: brandUser.id,
                name: brandName,
                industry: 'Creative & Digital',
                description: `${brandName} private studio workspace.`,
                aesthetic: 'Modern & Editorial',
                isDemo: false
              };

              setMarketplaceData(prev => {
                const existingBrand = (prev.brands || []).find(b => b.id === customBrandId);
                if (!existingBrand) {
                  return {
                    ...prev,
                    brands: [brandRecord, ...(prev.brands || [])],
                    activeBrandId: customBrandId,
                    isDemoMode: false
                  };
                }
                return {
                  ...prev,
                  activeBrandId: customBrandId,
                  isDemoMode: false
                };
              });

              saveBackendBrand(brandRecord, brandUser.id).catch(err => {
                console.warn('[CreaSync] Background brand sync deferred:', err);
              });
            }
            executePendingActionOrRoute(brandUser, 'brand');
          } else {
            const isDemo = !user || (!user.email || user.email === 'maya.demo@alloy.market') || !!user.isDemoOnly;
            const creatorUser = user ? {
              ...user,
              role: 'creator',
              isDemoOnly: isDemo,
              profile: {
                ...(user?.profile || {}),
                role: 'creator',
                display_name: user?.profile?.display_name || user?.user_metadata?.full_name || user?.display_name || (isDemo ? 'Maya Chen' : (user.email ? user.email.split('@')[0] : 'Creator Studio')),
                isDemoOnly: isDemo
              }
            } : {
              id: 'maya-chen',
              email: 'maya.demo@alloy.market',
              role: 'creator',
              display_name: 'Maya Chen',
              isDemoOnly: true,
              profile: {
                id: 'maya-chen',
                email: 'maya.demo@alloy.market',
                role: 'creator',
                display_name: 'Maya Chen',
                isDemoOnly: true
              }
            };
            localStorage.setItem('creasync_active_user', JSON.stringify(creatorUser));
            localStorage.setItem('creasync_active_role', 'creator');
            updateActiveUser(creatorUser);
            handleToggleDemoMode(isDemo);
            executePendingActionOrRoute(creatorUser, 'creator');
          }
        }}
        onLoginBrand={(user) => {
          setIsLoginOpen(false);
          setLoginNotice(null);
          const isLuminaDemo = !user || (!user.email || user.email === 'lumina.demo@alloy.market');
          const brandUser = user ? {
            ...user,
            role: 'brand',
            isDemoOnly: isLuminaDemo,
            profile: {
              ...(user?.profile || {}),
              role: 'brand',
              display_name: user?.profile?.display_name || user?.user_metadata?.full_name || user?.display_name || (isLuminaDemo ? 'Lumina Botanica' : (user.email ? user.email.split('@')[0] : 'Brand Studio')),
              isDemoOnly: isLuminaDemo
            }
          } : {
            id: 'brand-demo-lumina',
            email: 'lumina.demo@alloy.market',
            role: 'brand',
            display_name: 'Lumina Botanica',
            isDemoOnly: true,
            profile: {
              id: 'brand-demo-lumina',
              email: 'lumina.demo@alloy.market',
              role: 'brand',
              display_name: 'Lumina Botanica',
              isDemoOnly: true
            }
          };
          localStorage.setItem('creasync_active_user', JSON.stringify(brandUser));
          localStorage.setItem('creasync_active_role', 'brand');
          updateActiveUser(brandUser);

          if (isLuminaDemo) {
            handleSwitchBrand('brand-demo-lumina');
            handleToggleDemoMode(true);
          } else {
            const emailKey = (brandUser.email || brandUser.id || 'custom').toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '-');
            const customBrandId = `brand-${emailKey}`;
            const brandName = brandUser.profile?.display_name || brandUser.display_name || (brandUser.email ? brandUser.email.split('@')[0] : 'My Brand Studio');

            const brandRecord = {
              id: customBrandId,
              userId: brandUser.id,
              name: brandName,
              industry: 'Creative & Digital',
              description: `${brandName} private studio workspace.`,
              aesthetic: 'Modern & Editorial',
              isDemo: false
            };

            setMarketplaceData(prev => {
              const existingBrand = (prev.brands || []).find(b => b.id === customBrandId);
              if (!existingBrand) {
                return {
                  ...prev,
                  brands: [brandRecord, ...(prev.brands || [])],
                  activeBrandId: customBrandId,
                  isDemoMode: false
                };
              }
              return {
                ...prev,
                activeBrandId: customBrandId,
                isDemoMode: false
              };
            });

            saveBackendBrand(brandRecord, brandUser.id).catch(err => {
              console.warn('[CreaSync] Background brand sync deferred:', err);
            });
          }
          executePendingActionOrRoute(brandUser, 'brand');
        }}
        onLoginCreator={(user) => {
          setIsLoginOpen(false);
          setLoginNotice(null);
          const isDemo = !user || (!user.email || user.email === 'maya.demo@alloy.market') || !!user.isDemoOnly;
          const creatorUser = user ? {
            ...user,
            role: 'creator',
            isDemoOnly: isDemo,
            profile: {
              ...(user?.profile || {}),
              role: 'creator',
              display_name: user?.profile?.display_name || user?.user_metadata?.full_name || user?.display_name || (isDemo ? 'Maya Chen' : (user.email ? user.email.split('@')[0] : 'Creator Studio')),
              isDemoOnly: isDemo
            }
          } : {
            id: 'maya-chen',
            email: 'maya.demo@alloy.market',
            role: 'creator',
            display_name: 'Maya Chen',
            isDemoOnly: true,
            profile: {
              id: 'maya-chen',
              email: 'maya.demo@alloy.market',
              role: 'creator',
              display_name: 'Maya Chen',
              isDemoOnly: true
            }
          };
          localStorage.setItem('creasync_active_user', JSON.stringify(creatorUser));
          localStorage.setItem('creasync_active_role', 'creator');
          updateActiveUser(creatorUser);
          handleToggleDemoMode(isDemo);
          executePendingActionOrRoute(creatorUser, 'creator');
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

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          creator={selectedProjectCreator}
          onClose={() => {
            setSelectedProject(null);
            setSelectedProjectCreator(null);
          }}
          onViewCreatorProfile={handleOpenCreatorProfile}
          onCreateWorkspace={handleCreateWorkspaceFromProject}
          onSaveWorkflow={handleSaveProjectWorkflow}
          isCreatorOwner={
            // Creator owns project if logged in as creator and matches creator id, or in demo creator mode
            resolveUserRole(currentUser) === 'creator' ||
            (myCreator && myCreator.id === selectedProjectCreator?.id) ||
            (!currentUser && currentView === 'creator-workspace')
          }
        />
      )}

      {/* Campaign-to-Creator Backend Filtering Pipeline Visualizer */}
      <PipelineTraceModal
        isOpen={isPipelineTraceModalOpen}
        onClose={() => setIsPipelineTraceModalOpen(false)}
        pipelineTrace={pipelineTrace}
        isLoading={isPipelineTraceLoading}
        onSelectCreator={handleOpenCreatorProfile}
        onViewAllEligible={(filterPayload) => {
          setIsPipelineTraceModalOpen(false);
          setPipelineFilter(filterPayload);
          setInitialBrandTab('discover');
          navigateTo('brand-workspace');
        }}
      />
    </div>
  );
}
