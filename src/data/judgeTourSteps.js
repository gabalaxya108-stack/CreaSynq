// src/data/judgeTourSteps.js
// Alloy — Judge Demo Walkthrough Stage Definitions
// Six structured stages guiding judges through core Alloy platform capabilities

export const TOUR_STEPS = [
  {
    stepId: 'discover-creators',
    title: 'Discover AI Creators & Portfolios',
    tag: 'Step 1 of 6 • Marketplace & Discovery',
    iconName: 'Compass',
    description:
      'Explore Alloy\'s curated creator marketplace. Browse verified AI creators, examine distinctive visual aesthetics, review multi-platform portfolios, and inspect rich creator DNA profiles.',
    highlights: [
      'Multi-discipline talent directory (Spatial CGI, Haute Couture, Motion)',
      'Rich Creator DNA cards displaying verified skills, styles, and tools',
      'High-resolution portfolio inspect modals with production breakdowns'
    ],
    actionLabel: 'Open Marketplace',
    executeAction: ({ onNavigate }) => {
      if (typeof onNavigate === 'function') {
        onNavigate('discover');
      }
    }
  },
  {
    stepId: 'find-match',
    title: 'Deterministic Brief & Filtering Pipeline',
    tag: 'Step 2 of 6 • Campaign Alignment Engine',
    iconName: 'Target',
    description:
      'Experience Alloy\'s 7-stage deterministic filtering pipeline. Campaigns filter creators across style alignment, technical capabilities, commercial licensing, and availability with mathematically verified candidate counts.',
    highlights: [
      '7 discrete filtering stages (Format, Capability, Style, Licensing, Budget, Availability, Scoring)',
      'Deterministic candidate reduction with zero hallucinated counts',
      'Explainable match scores with human-readable requirement badges'
    ],
    actionLabel: 'Try Campaign Filtering',
    executeAction: ({ onNavigate }) => {
      if (typeof onNavigate === 'function') {
        onNavigate('discover');
      }
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          const el = document.getElementById('discover-search-bar') || document.querySelector('.discover-pipeline-hero');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }
  },
  {
    stepId: 'creator-workspaces',
    title: 'Explore Creator Studio & Dynamic Workflows',
    tag: 'Step 3 of 6 • Studio Workspaces',
    iconName: 'Sparkles',
    description:
      'Step into the creator\'s operating environment. Creators manage projects, showcase technical & creative skill taxonomy, and construct dynamic, user-filled creative step workflows with custom milestones.',
    highlights: [
      'Dynamic creative workflow builder with custom production stages',
      'Technical & creative skills taxonomy manager for creator profiles',
      'Milestone tracking, deliverables submission & revision loops'
    ],
    actionLabel: 'Open Creator Studio',
    executeAction: ({ onNavigate, onEnableDemoCreator }) => {
      if (typeof onEnableDemoCreator === 'function') onEnableDemoCreator();
      if (typeof onNavigate === 'function') onNavigate('creator-workspace');
    }
  },
  {
    stepId: 'build-trust',
    title: 'Alloy Trust Centre & Verified Credentials',
    tag: 'Step 4 of 6 • Trust & Provenance',
    iconName: 'ShieldCheck',
    description:
      'Trust is Alloy\'s cornerstone. The dedicated Trust Centre audits creator identity, commercial licensing rights, and training provenance. Claims progress through structured review states with verifiable evidence.',
    highlights: [
      'Multi-category verification: Identity, Commercial Licensing, Style',
      'Truthful claim states: Self-Declared, Pending Review, Verified',
      'Cryptographic provenance checks & audit evidence documentation'
    ],
    actionLabel: 'Open Trust Centre',
    executeAction: ({ onNavigate }) => {
      if (typeof onNavigate === 'function') {
        onNavigate('trust-center');
      }
    }
  },
  {
    stepId: 'collaborate',
    title: 'Real-Time Messaging & Direct Collaboration',
    tag: 'Step 5 of 6 • Brand & Creator Collaboration',
    iconName: 'MessageSquare',
    description:
      'Brands and creators collaborate directly through Alloy\'s global messaging drawer and conversation modal. Includes optimistic UI updates, error rollback handling, and demo-mode persistence for unauthenticated evaluation.',
    highlights: [
      'Slide-up Messages drawer accessible across all screens',
      'Bidirectional conversation modal with milestone and campaign context',
      'Demo-mode persistence across page reloads without backend RLS errors'
    ],
    actionLabel: 'Open Messages Drawer',
    executeAction: ({ onOpenMessages }) => {
      if (typeof onOpenMessages === 'function') {
        onOpenMessages();
      }
    }
  },
  {
    stepId: 'super-admin',
    title: 'Super Admin & AlloyTrust Audit Console',
    tag: 'Step 6 of 6 • Administrative Governance',
    iconName: 'Lock',
    description:
      'Evaluate Alloy\'s administrative governance. Super Admin provides platform metrics, verification audit controls, and privileged management. Sign in securely using the designated Judge Demo credentials on the login screen.',
    highlights: [
      'Dedicated Super Admin login route with pre-configured judge autofill',
      'Strict server-side JWT verification & role-based access control (RBAC)',
      'Truthful audit logs and claim status approval/rejection workflows'
    ],
    actionLabel: 'Go to Admin Login',
    executeAction: () => {
      if (typeof window !== 'undefined') {
        window.location.hash = '/admin/login';
      }
    }
  }
];
