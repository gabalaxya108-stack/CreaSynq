# CreaSynq — Project Architecture, Context & Engineering Dossier

> **Dossier Purpose:** This file provides complete architectural, operational, and domain context for LLMs and developers working on or extending **CreaSynq**.

---

## 1. Executive Summary & Product Vision

**CreaSynq** is an AI-native marketplace and creative collaboration platform designed for the next generation of creative work: bridging **innovative brands** with **elite AI visual creators, 3D artists, and generative directors**.

Traditional influencer or freelance platforms match based solely on vanity metrics (follower counts, keywords). CreaSynq introduces **Explainable Creative Intelligence**:
- **CreaBrief**: Natural-language campaign generator that transforms vague ideas into structured creative briefs with art direction, format specs, and deliverables.
- **Creator DNA**: Deep multi-dimensional creative profile synthesized from portfolio projects (visual aesthetic, narrative approach, lighting/composition signatures, and verified competencies).
- **CreaMatch & CreaScore**: A 6-dimensional deterministic and explainable compatibility scoring engine (0–100%) that explains *why* a creator fits a brief and highlights potential gaps.
- **CreaSim**: Pre-hire concept simulation engine predicting collaborative creative concepts and frame treatments before contracting.
- **Dual Workspace**: High-fidelity, dedicated portals for both **Brands** (Brand Studio) and **Creators** (Creator Studio) managing end-to-end campaign lifecycles (briefing, invitations, deliverables submission, review loops, revisions, and messaging).

---

## 2. Technology Stack

| Layer | Technologies & Libraries | Details |
|---|---|---|
| **Frontend Framework** | **React 19** (`react`, `react-dom`) | Modern hooks, functional components, zero legacy class patterns |
| **Build Tool & Dev Server** | **Vite 6** (`vite`, `@vitejs/plugin-react`) | Rapid HMR, custom Connect middleware mounted directly onto dev server |
| **Icons & UI Kit** | **Lucide React** (`lucide-react`) | Clean, consistent SVG icon set |
| **Styling** | **Custom CSS Design System** (`src/index.css`) | Curated dark-mode aesthetic, obsidian glassmorphism, accent glows (`#EB6E4B`, `#7C3AED`), typography with Inter / Plus Jakarta Sans |
| **State Management** | **Hybrid Client + Cloud Store** | `src/data/marketplaceStore.js`: reactive local storage with cross-tab `BroadcastChannel`/storage sync + optimistic cloud syncing |
| **Backend & AI Middleware** | **Node.js Connect/Vite Middleware** (`server/groqMiddleware.js`) | Lightweight zero-express proxy mounted directly inside `vite.config.js` |
| **AI Engine & Inference** | **Groq Cloud API** (`groq-sdk` / raw fetch) | Ultra-fast inference using models such as `openai/gpt-oss-120b` or `llama-3.3-70b-versatile` |
| **Fallback Intelligence** | **Deterministic Rule Engine** (`src/intelligence/*`) | Complete offline fallback ensuring 100% platform functionality without an API key |
| **Database & Auth** | **PostgreSQL (Supabase)** (`@supabase/supabase-js`) | 11 relational tables, Row-Level Security (RLS) policies, public/private data separation |

---

## 3. Repository Directory Structure

```text
d:/HackXL/CreaSynq/
├── index.html                   # HTML5 Entrypoint with modern Google Fonts & meta tags
├── package.json                 # Dependencies & scripts ("dev", "build", "preview")
├── package-lock.json
├── vite.config.js               # Vite config mounting groqMiddleware on /api/ai/*
├── .env.example                 # Environment configuration template
├── .env                         # Active local environment variables
│
├── server/                      # Server-side AI proxy & Database Schemas
│   ├── index.js                 # Standalone Node HTTP server alternative
│   ├── groqMiddleware.js        # Vite Connect middleware handling /api/ai/* routes
│   ├── groqService.js           # Groq API prompts, JSON schema enforcement & parsing
│   └── db/
│       ├── schema.sql           # PostgreSQL / Supabase schema (11 tables + RLS policies)
│       └── seed.sql             # Comprehensive seed data for production testing
│
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Main orchestrator, routing, modal states, global data sync
    ├── index.css                # Core design system, color tokens, animations & utilities
    │
    ├── ai/                      # Frontend AI orchestration & clients
    │   ├── groqClient.js        # Client communicating with /api/ai endpoints + fallback
    │   ├── provider.js          # In-memory caching and resilient fallback provider
    │   ├── briefAnalyzer.js     # Deterministic brief extractor & keyword analyzer
    │   ├── creatorAnalyzer.js   # Deterministic creator portfolio classifier
    │   ├── profileImprover.js   # Recommendations engine for creator profiles
    │   ├── semanticMatching.js  # Heuristic semantic similarity algorithms
    │   ├── semanticSearch.js    # Client-side multi-filter and semantic search
    │   └── smartClarifier.js    # Brief clarification prompter
    │
    ├── components/              # Reusable UI Components & Modals
    │   ├── Header.jsx           # Global navigation with brand switcher, role switcher & CTA
    │   ├── Hero.jsx             # High-impact landing hero with interactive live prompt
    │   ├── VideoHero.jsx        # Dynamic video/motion reel showcase
    │   ├── CreatorCard.jsx      # Marketplace creator card with CreaMatch badge & tags
    │   ├── WorkCard.jsx         # Portfolio artwork card with aspect ratio support & badges
    │   ├── WorkGallery.jsx      # Filterable showcase grid of projects
    │   ├── CreativeShowcase.jsx # Editorial grid of highlighted creators
    │   ├── CreativeHighlights.jsx# Featured campaigns & category highlights
    │   ├── CreatorDNASection.jsx# Interactive visualization of Creator DNA dimensions
    │   ├── CreaMatchSection.jsx # Visual explanation of the 6-dimension scoring engine
    │   ├── TwoJourneysSection.jsx# Side-by-side interactive roadmap for Brands & Creators
    │   ├── WorkspaceEntryCards.jsx# Visual portal cards to enter Brand or Creator Studio
    │   ├── ProductPreview.jsx   # Live product UI interactive preview
    │   ├── HowItWorks.jsx       # Step-by-step workflow explanation
    │   ├── DifferentiatorSection.jsx# Comparison matrix: CreaSynq vs Traditional Agencies
    │   ├── FinalCTA.jsx         # Bottom conversion CTA section
    │   ├── Footer.jsx           # Platform footer with legal, links, status
    │   │
    │   └── [Modals]
    │       ├── CampaignModal.jsx        # Campaign brief creator & editor (AI + manual)
    │       ├── ConversationModal.jsx    # Real-time messaging between brand and creator
    │       ├── CreaSimModal.jsx         # Simulation concept visualizer & pitch viewer
    │       ├── CreatorComparisonModal.jsx# Side-by-side comparison of 2 creators
    │       ├── CreatorJoinModal.jsx     # Quick creator application modal
    │       ├── DeliverableReviewModal.jsx# Brand review modal (Approve / Request Revision)
    │       ├── ForBrandsModal.jsx       # Brand value proposition details
    │       ├── ForCreatorsModal.jsx     # Creator value proposition details
    │       ├── InviteModal.jsx          # Send targeted campaign invitation to creator
    │       ├── LoginModal.jsx           # Authentication modal (Creator / Brand)
    │       ├── ProjectModal.jsx         # Creator portfolio project upload & edit modal
    │       ├── RoleSelectModal.jsx      # Role picker modal
    │       └── WhyThisCreatorModal.jsx  # Detailed explanation breakdown for a match
    │
    ├── data/                    # Initial Seed, Mock Data & State Management
    │   ├── campaignData.js      # Seed campaigns data
    │   ├── connectionsData.js   # Seed invitations, active collaborations & messages
    │   ├── creatorsData.js      # Seed creators with full portfolios, styles & metadata
    │   └── marketplaceStore.js  # Centralized store managing state, persistence & sync
    │
    ├── intelligence/            # Core Deterministic Intelligence Engines
    │   ├── campaignDNA.js       # Extracts artistic intent, styles & formats from brief
    │   ├── creatorDNA.js        # Synthesizes style DNA, storytelling, product presentation
    │   ├── matchingEngine.js    # 6-dimension CreaMatch scoring algorithm (0-100)
    │   ├── matchExplainer.js    # Generates transparent rationale & evidence citations
    │   └── conceptEngine.js     # Generates customized hypothetical collaboration concepts
    │
    ├── lib/
    │   └── supabaseClient.js    # Safe Supabase JS client with automatic offline detection
    │
    ├── services/
    │   └── marketplaceBackend.js# Cloud sync layer interfacing with Supabase tables
    │
    └── views/                   # Full-Page Routed Views
        ├── DiscoverView.jsx         # Creator discovery marketplace with filters & matching
        ├── CreatorProfileView.jsx   # Public Creator Profile with DNA dossier & portfolio
        ├── BrandWorkspaceView.jsx   # Brand Studio: Campaigns, Shortlists, Collaborations
        ├── CreatorWorkspaceView.jsx # Creator Studio: Invitations, Projects, Submissions
        ├── BrandOnboardingView.jsx  # Brand onboarding flow
        └── CreatorOnboardingView.jsx# Creator onboarding & profile builder
```

---

## 4. Dual-Engine Intelligence Architecture

CreaSynq utilizes a **Dual-Engine Architecture** that guarantees full feature availability in every environment:

```
[ Frontend: src/ai/groqClient.js ]
                 │
      Is GROQ_API_KEY available?
          ┌──────┴──────┐
         YES            NO (or API error)
          ▼             ▼
   [ Live AI Engine ]  [ Deterministic Engine ]
    • Groq Cloud API    • src/intelligence/*
    • Llama 3.3 / GPT   • 6-Dimension Taxonomy
    • Dynamic JSON      • Rule-based DNA extraction
```

### 1. Live AI Engine (`server/groqService.js`)
When `GROQ_API_KEY` is provided in `.env`:
- Calls Groq's high-speed inference endpoints (`https://api.groq.com/openai/v1/chat/completions`).
- Uses system instructions enforcing strict RFC-8259 JSON output.
- Features:
  - **CreaBrief**: Converts unstructured text (e.g. *"I need a moody perfume launch with floating liquid glass"*) into a structured JSON campaign brief.
  - **Creator DNA**: Analyzes creator projects to extract aesthetic traits, lighting philosophy, and narrative style.
  - **CreaMatch Evaluation**: Generates deep comparative analysis and fit scores.
  - **CreaSim Concepts**: Produces 3 concrete collaborative campaign concepts with visual hooks and execution frameworks.

### 2. Deterministic Rule Engine (`src/intelligence/*`)
When no API key is configured or offline:
- Zero external dependencies.
- Analyzes taxonomies across 10+ visual styles (Cinematic, Luminous, Moody, Minimal, Botanical, Macro, Industrial, Surreal, Editorial, Playful).
- Generates reproducible, explainable scores and dossiers.

---

## 5. CreaMatch Scoring Methodology (`matchingEngine.js`)

The match score is computed out of **100 total points** across 6 transparent dimensions:

| Dimension | Max Points | Evaluation Criteria |
|---|---|---|
| **1. Creative Style Alignment** | 25 pts | Overlap between campaign aesthetic keywords and creator style taxonomy / bio |
| **2. Portfolio Relevance & Evidence** | 25 pts | Analyzes creator's actual portfolio projects for direct aesthetic and keyword relevance |
| **3. Content Format Compatibility** | 15 pts | Compatibility of deliverable formats (e.g. 4K Stills, 9:16 Vertical Video, 3D Renders) |
| **4. Industry Experience Fit** | 15 pts | Past experience in the brand's industry (Beauty, Luxury, Tech, Automotive, Fashion, etc.) |
| **5. Platform Compatibility** | 10 pts | Alignment with target distribution platforms (Instagram, TikTok, YouTube, Digital OOH) |
| **6. Availability & Budget Alignment** | 10 pts | Creator turnaround timeline and current availability status |

---

## 6. Centralized State & Data Layer (`marketplaceStore.js`)

State is managed through a single source of truth that bridges Brand Studio and Creator Studio:

### Key State Properties
```javascript
{
  brands: [...],              // Registered brand profiles (Lumina Botanica, Vanguard, etc.)
  activeBrandId: "...",       // Currently active brand perspective
  creators: [...],            // Creator directory with portfolio projects & styles
  campaigns: [...],           // Brand campaigns with status ('Draft'|'Active'|'Completed')
  activeCampaignId: "...",    // Campaign currently selected for matching & shortlists
  shortlists: {               // Map of campaignId -> array of shortlisted creatorIds
    "camp-xyz": ["creator-1", "creator-2"]
  },
  invitations: [...],         // Campaign invitations sent from brands to creators
  collaborations: [...],      // Active contracted projects with milestones & submissions
  projects: [...],            // Portfolio projects uploaded by creators
  connections: [...],         // Direct messages & communication threads
  isDemoMode: true            // Flag indicating local demo vs authenticated cloud mode
}
```

### Persistence & Cross-Tab Synchronization
1. **LocalStorage Persistence**: Auto-saves under key `creasync_marketplace_state_v2`.
2. **BroadcastChannel & Storage Event Listeners**: Multiple browser tabs stay in real-time sync when invitations are accepted or deliverables are submitted.
3. **Supabase Cloud Sync**: In `marketplaceBackend.js`, changes sync to Postgres if Supabase credentials are present.

---

## 7. Backend & API Endpoints

Mounted via `server/groqMiddleware.js` on Vite server (Port `5173`):

### `GET /api/ai/health`
Returns configuration status and active model.
```json
{
  "ok": true,
  "configured": true,
  "model": "openai/gpt-oss-120b",
  "status": "ready"
}
```

### `POST /api/ai/creabrief`
Generates a structured campaign brief from prompt.
- **Request:** `{ "prompt": "Launch campaign for organic cold-pressed skincare" }`
- **Response:** `{ "ok": true, "brief": { "title": "...", "deliverables": [...], ... } }`

### `POST /api/ai/creatordna`
Generates creative DNA dossier for a creator profile.
- **Request:** `{ "creator": { ... } }`
- **Response:** `{ "ok": true, "dna": { "visualAesthetic": "...", "traits": [...], ... } }`

### `POST /api/ai/creamatch`
Evaluates fit between a campaign brief and creator.
- **Request:** `{ "campaign": { ... }, "creator": { ... } }`
- **Response:** `{ "ok": true, "matchAnalysis": { "score": 92, "strengths": [...], ... } }`

### `POST /api/ai/creasim`
Generates hypothetical collaboration concepts.
- **Request:** `{ "campaign": { ... }, "creator": { ... }, "creatorDNA": { ... } }`
- **Response:** `{ "ok": true, "concepts": [ { "conceptName": "...", "treatment": "..." } ] }`

---

## 8. Database Schema Overview (`server/db/schema.sql`)

PostgreSQL / Supabase schema organized into 11 relational tables:

1. `profiles`: Supabase Auth users mapped to roles (`creator`, `brand`, `admin`).
2. `creator_profiles`: Bio, handle, specialty, styles array, capabilities, turnaround, avatar.
3. `portfolio_projects`: Creator artwork, formats, client types, aspects, media URLs.
4. `creative_dna`: DNA dossiers with provenance, completeness, source.
5. `creative_dna_feedback`: Creator confirmations or edits on AI-inferred traits.
6. `brands`: Company info, aesthetic, industry, brand colors, target channels.
7. `campaigns`: Owner brand ID, objectives, creative style, budget, deliverables, status.
8. `shortlists`: Many-to-many relationship between campaigns and creator profiles.
9. `invitations`: Formal project invitations with budget and deadline proposals (`Pending` | `Accepted` | `Declined`).
10. `collaborations`: Active contracts with milestone tracking, submission URLs, revision notes.
11. `messages`: Threaded conversation messages between brands and creators.

---

## 9. Local Development & Environment Setup

### Prerequisites
- Node.js >= 18
- npm >= 9

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, app functions in offline mode without keys)
cp .env.example .env

# 3. Launch dev server
npm run dev
```

Dev server runs on `http://localhost:5173/`.

### Environment Variables (`.env`)
```env
# AI Integration (Server-side only — never exposed to client)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Supabase Relational Database (Optional — falls back to local storage)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
VITE_SUPABASE_STORAGE_BUCKET=creasynq-media

# Server
PORT=5173
NODE_ENV=development
```

---

## 10. Key Conventions for Contributors & LLMs

1. **Vanilla CSS Tokens**: Global styling rules live in `src/index.css`. Adhere to design tokens:
   - Primary Accent: Coral/Flame (`#EB6E4B`)
   - Secondary Accent: Violet (`#7C3AED`)
   - Backgrounds: Dark Obsidian (`#0A0A0B`, `#121214`, `#18181B`)
   - Glassmorphism: `backdrop-filter: blur(16px); background: rgba(255,255,255,0.03);`
2. **Never Expose Private Keys to Client**: `GROQ_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never be used in `src/`. Only public `VITE_` variables belong on the frontend.
3. **Resilient Offline First**: Any new AI feature must supply a deterministic fallback in `src/intelligence/` so that the app runs completely offline without network or API dependencies.
4. **Data Isolation**: Brands must only edit their own campaigns. Creators must only edit their own profile and project submissions.
5. **State Updates**: Always mutate state via `src/data/marketplaceStore.js` helper methods (`updateCreatorRecord`, `createCampaignRecord`, `createBrandRecord`, etc.) to trigger cross-tab and storage synchronizations.
