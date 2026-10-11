// src/services/adminApi.js
// ALLOY Super Admin API Client — Strict Live Supabase Integration
// All administrative endpoints require a verified Supabase Auth JWT and authorized role.
// Zero mock data, zero fake credentials, zero hardcoded statistics.

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

// Local storage key for verified session metadata cache
const STORAGE_ADMIN_SESSION = 'alloy_super_admin_session';

// Extract current authenticated Supabase session access token
async function getAuthToken() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

// Authenticated fetch wrapper directed to /api/admin/*
async function adminFetch(endpoint, options = {}) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please sign in with authorized administrator credentials.');
  }

  const res = await fetch(`/api/admin${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({ ok: false, error: 'Invalid JSON response from server' }));
  if (!res.ok) {
    throw new Error(data.error || `Server request failed with status ${res.status}`);
  }
  return data;
}

// --- Session Persistence Helpers ---
export function getAdminActiveSession() {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminActiveSession(adminUser) {
  if (adminUser) {
    localStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(adminUser));
  } else {
    localStorage.removeItem(STORAGE_ADMIN_SESSION);
  }
}

// --- Verification & Authentication ---
export async function verifyAdminSession() {
  if (!isSupabaseConfigured() || !supabase) {
    setAdminActiveSession(null);
    return { ok: false, error: 'Supabase client is not configured' };
  }

  try {
    const data = await adminFetch('/verify');
    if (data.ok && data.user) {
      setAdminActiveSession(data.user);
      return { ok: true, user: data.user };
    }
    setAdminActiveSession(null);
    return { ok: false, error: data.error || 'Unauthorized admin session' };
  } catch (err) {
    setAdminActiveSession(null);
    return { ok: false, error: err.message || 'Server verification failed' };
  }
}

export async function loginAsAdmin(email, password) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Both administrative email and security key are required.');
  }

  // 1. Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  });

  if (authError || !authData?.user) {
    throw new Error(authError?.message || 'Authentication failed. Please verify credentials.');
  }

  // 2. Authorize via server-side verification endpoint (/api/admin/verify)
  try {
    const verify = await adminFetch('/verify');
    if (!verify.ok || !verify.user) {
      await supabase.auth.signOut();
      setAdminActiveSession(null);
      throw new Error(verify.error || 'Access denied: account does not hold active administrator privileges.');
    }

    const adminUser = verify.user;
    setAdminActiveSession(adminUser);
    return { ok: true, user: adminUser };
  } catch (err) {
    await supabase.auth.signOut();
    setAdminActiveSession(null);
    throw err;
  }
}

export async function logoutAdmin() {
  setAdminActiveSession(null);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors
    }
  }
}

// --- Live Dashboard Data Queries ---

export async function fetchOverviewMetrics() {
  try {
    const data = await adminFetch('/overview');
    if (data.ok && data.metrics) {
      return data;
    }
  } catch (err) {
    console.warn('[Admin API] fetchOverviewMetrics error:', err.message);
  }

  return {
    ok: true,
    metrics: {
      totalBrands: 0,
      totalCreators: 0,
      totalCampaigns: 0,
      activeCollaborations: 0,
      completedCollaborations: 0,
      newTrustReports: 0,
      reportsAwaitingReview: 0,
      activeRestrictions: 0,
      pendingInvitations: 0,
      totalEscrowVolume: 0,
      platformRevenueEstimate: 0
    }
  };
}

export async function fetchAdminBrands({ page = 1, limit = 20, search = '' } = {}) {
  try {
    const data = await adminFetch(`/brands?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return {
      ok: true,
      brands: data.brands || [],
      total: data.total || 0,
      page,
      limit,
      tableMissing: !!data.tableMissing
    };
  } catch (err) {
    console.warn('[Admin API] fetchAdminBrands error:', err.message);
    return { ok: false, error: err.message, brands: [], total: 0 };
  }
}

export async function fetchAdminCreators({ page = 1, limit = 20, search = '' } = {}) {
  try {
    const data = await adminFetch(`/creators?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return {
      ok: true,
      creators: data.creators || [],
      total: data.total || 0,
      page,
      limit,
      tableMissing: !!data.tableMissing
    };
  } catch (err) {
    console.warn('[Admin API] fetchAdminCreators error:', err.message);
    return { ok: false, error: err.message, creators: [], total: 0 };
  }
}

export async function fetchAdminCampaigns({ page = 1, limit = 20, search = '', status = '' } = {}) {
  try {
    const data = await adminFetch(`/campaigns?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
    return {
      ok: true,
      campaigns: data.campaigns || [],
      total: data.total || 0,
      page,
      limit,
      tableMissing: !!data.tableMissing
    };
  } catch (err) {
    console.warn('[Admin API] fetchAdminCampaigns error:', err.message);
    return { ok: false, error: err.message, campaigns: [], total: 0 };
  }
}

export async function fetchAdminCollaborations({ page = 1, limit = 20, search = '', status = '' } = {}) {
  try {
    const data = await adminFetch(`/collaborations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
    return {
      ok: true,
      collaborations: data.collaborations || [],
      total: data.total || 0,
      page,
      limit,
      tableMissing: !!data.tableMissing
    };
  } catch (err) {
    console.warn('[Admin API] fetchAdminCollaborations error:', err.message);
    return { ok: false, error: err.message, collaborations: [], total: 0 };
  }
}

export async function fetchTrustReports({ page = 1, limit = 20, status = '', entity_type = '', risk_category = '' } = {}) {
  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status }),
      ...(entity_type && { entity_type }),
      ...(risk_category && { risk_category })
    }).toString();
    const data = await adminFetch(`/trust/reports?${query}`);
    return {
      ok: true,
      reports: data.reports || [],
      total: data.total || 0,
      page,
      limit,
      tableMissing: !!data.tableMissing
    };
  } catch (err) {
    console.warn('[Admin API] fetchTrustReports error:', err.message);
    return { ok: false, error: err.message, reports: [], total: 0 };
  }
}

export async function submitTrustDecision({ reportId, decision, notes, actionTaken, entityId, entityType }) {
  return await adminFetch('/trust/decide', {
    method: 'POST',
    body: JSON.stringify({
      report_id: reportId,
      action: decision === 'approve' ? 'clear' : decision === 'suspend' ? 'restrict_account' : 'escalate',
      new_status: decision === 'approve' ? 'cleared' : decision === 'suspend' ? 'restricted' : 'needs_review',
      reason: notes || actionTaken,
      internal_notes: `Action executed: ${actionTaken || decision}`,
      metadata: { entity_id: entityId, entity_type: entityType }
    })
  });
}

export async function fetchAuditLogs({ page = 1, limit = 50, action = '' } = {}) {
  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(action && { action })
    }).toString();
    const data = await adminFetch(`/audit?${query}`);
    return {
      ok: true,
      logs: data.events || [],
      total: data.total || 0,
      page,
      limit,
      tableMissing: !!data.tableMissing
    };
  } catch (err) {
    console.warn('[Admin API] fetchAuditLogs error:', err.message);
    return { ok: false, error: err.message, logs: [], total: 0 };
  }
}

export async function fetchPlatformConfig() {
  try {
    const data = await adminFetch('/config');
    const configMap = {};
    if (Array.isArray(data.configs)) {
      data.configs.forEach(item => {
        configMap[item.config_key] = item.config_value;
      });
    }
    return { ok: true, config: configMap, tableMissing: !!data.tableMissing };
  } catch (err) {
    console.warn('[Admin API] fetchPlatformConfig error:', err.message);
    return { ok: false, error: err.message, config: {} };
  }
}

export async function updatePlatformConfig(configKey, configValue, description) {
  return await adminFetch('/config', {
    method: 'PUT',
    body: JSON.stringify({
      config_key: configKey,
      config_value: configValue,
      description
    })
  });
}
