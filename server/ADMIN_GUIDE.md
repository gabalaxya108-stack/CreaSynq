# ALLOY Super Admin & AlloyTrust — Architecture & Operations Guide

## 1. Overview

The **ALLOY Super Admin & AlloyTrust Intelligence System** provides end-to-end governance, fraud detection, escrow milestone monitoring, and trust & safety surveillance for the ALLOY marketplace.

The implementation strictly connects to the live **Supabase** backend using authenticated JWT authorization and server-side role validation. All dashboard metrics, incident dossiers, and platform controls reflect real database records.

---

## 2. Directory & Component Structure

```
├── server/
│   ├── adminMiddleware.js          # Secure Vite Connect middleware (/api/admin/*)
│   ├── db/
│   │   ├── schema.sql              # Base database schema (profiles, brands, creators, campaigns)
│   │   └── admin_migration.sql     # Admin schema (admin_roles, trust_reports, audit_events, platform_config)
│   ├── scripts/
│   │   └── provisionAdmin.js       # CLI provisioning script (npm run provision:admin)
│   └── tests/
│       └── securityAudit.test.js   # Automated security test suite (npm run test:security)
│
├── src/
│   ├── admin.css                   # Luxury editorial styling for Admin & AlloyTrust
│   ├── services/
│   │   ├── adminApi.js             # Authenticated live Supabase client (/api/admin/*)
│   │   └── alloyTrustEngine.js     # Heuristic risk calculation & signal catalog
│   ├── views/
│   │   ├── AdminLoginView.jsx      # Security login portal with Autofill Judge Credentials
│   │   └── AdminDashboardView.jsx  # Master executive dashboard coordinator with live refresh
│   └── components/
│       ├── Header.jsx              # Admin entry link in top navigation
│       └── admin/
│           ├── AdminSidebar.jsx                # Navigation among the 8 sections
│           ├── AdminOverview.jsx               # Section 1: Executive KPIs & risk distribution
│           ├── AdminAlloyTrust.jsx             # Section 2: AlloyTrust Command & Incident reviews
│           ├── AdminBrandManagement.jsx        # Section 3: Brand registry & restriction controls
│           ├── AdminCreatorManagement.jsx      # Section 4: Creator network & DNA governance
│           ├── AdminCampaignManagement.jsx     # Section 5: Campaign brief & escrow compliance
│           ├── AdminCollaborationTracking.jsx  # Section 6: Live contracts & deliverable milestones
│           ├── AdminAuditLog.jsx               # Section 7: Append-only cryptographic audit trail
│           └── AdminPlatformControls.jsx       # Section 8: Platform parameters & safety thresholds
```

---

## 3. Environment Variables Configuration

The project distinguishes public frontend variables from private server-only secrets in `.env`:

### Public Frontend Variables (Safe for Browser)
- `VITE_SUPABASE_URL`: Connected Supabase project URL (`https://<project-id>.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: Public anonymous key used for client authentication.
- `VITE_JUDGE_EMAIL`: Dedicated public evaluation account email (`judge@alloy.market`).
- `VITE_JUDGE_PASSWORD`: Dedicated public evaluation account security key.

### Private Server-Only Secrets (Never Exposed to Browser)
- `SUPABASE_SERVICE_ROLE_KEY`: Privileged service-role key used exclusively by server middleware.
- `ALLOY_ADMIN_EMAIL`: Designated primary administrator email.
- `ALLOY_ADMIN_PROVISION_SECRET`: Optional bootstrap secret for provisioning endpoints.

---

## 4. Database Schema & Migration Execution

To apply the complete ALLOY datastore schema:

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run `server/db/schema.sql` to establish core marketplace tables (`profiles`, `brands`, `creator_profiles`, `campaigns`, `collaborations`, `invitations`, `shortlists`).
3. Run `server/db/admin_migration.sql` to establish admin governance tables:
   - `admin_roles`: Explicit `super_admin` and `judge_admin` assignments linked to `auth.users`.
   - `trust_reports`: Incident tracking, risk categories (`low`, `moderate`, `high`, `critical`), and risk scores (0-100).
   - `trust_signals`: Signal events linked to entities or reports with confidence ratings.
   - `trust_decisions`: Decisions with administrative justifications.
   - `audit_events`: Append-only audit logging for compliance and forensics.
   - `platform_config`: Dynamic platform parameters and thresholds.
   - Row-Level Security (RLS) policies and performance indexes.

---

## 5. Account Provisioning

Run the server-side provisioning script to establish both the dedicated Judge Reviewer and Super Administrator accounts in Supabase Auth:

```bash
npm run provision:admin
```

This script:
- Verifies and creates the `judge_admin` user in Supabase Auth.
- Synchronizes password and metadata safely without altering other accounts.
- Upserts records in `public.profiles` and `public.admin_roles` when available.

---

## 6. Accessing and Evaluating the Portal

1. **Public UI Entry**: In the main header, click **Super Admin** (positioned next to Log in).
2. **Direct Hash Route**: `#/admin/login`
3. **One-Click Autofill**: Click **"Autofill Judge Credentials"** on the login screen to automatically populate the approved evaluation credentials (`judge@alloy.market`).
4. **Authenticate**: Click **"Enter Super Admin Console"** to authenticate via Supabase Auth and launch the live dashboard.
5. **Dashboard Hash Route**: `#/admin/dashboard`
6. **Return to Marketplace**: Click **Return to Marketplace** or use the sidebar link to return.
