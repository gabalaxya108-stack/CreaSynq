// src/services/mediaStorage.js
// Alloy Multi-Format Portfolio Media Storage & Validation Service
// Handles JPG, PNG, WebP, GIF, MP4, WebM, MOV with size validation, progress simulation, and local/cloud persistence.

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const SUPPORTED_MEDIA_TYPES = {
  // Images
  'image/jpeg': { ext: 'jpg', type: 'image', label: 'JPEG Image', maxBytes: 20 * 1024 * 1024 }, // 20MB
  'image/png': { ext: 'png', type: 'image', label: 'PNG Image', maxBytes: 25 * 1024 * 1024 },   // 25MB
  'image/webp': { ext: 'webp', type: 'image', label: 'WebP Image', maxBytes: 20 * 1024 * 1024 },
  'image/gif': { ext: 'gif', type: 'image', label: 'Animated GIF', maxBytes: 30 * 1024 * 1024 }, // 30MB
  
  // Videos
  'video/mp4': { ext: 'mp4', type: 'video', label: 'MP4 Video', maxBytes: 100 * 1024 * 1024 },   // 100MB
  'video/webm': { ext: 'webm', type: 'video', label: 'WebM Video', maxBytes: 100 * 1024 * 1024 },
  'video/quicktime': { ext: 'mov', type: 'video', label: 'QuickTime MOV', maxBytes: 100 * 1024 * 1024 },
  'video/x-msvideo': { ext: 'avi', type: 'video', label: 'AVI Video', maxBytes: 80 * 1024 * 1024 }
};

export const ACCEPTED_FILE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.webm', '.mov'
];

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validates a creative media file against supported MIME types and size constraints
 */
export function validateMediaFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check file extension as fallback if MIME is generic (e.g. application/octet-stream or video/quicktime)
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  let mime = file.type?.toLowerCase();

  if (!mime || mime === 'application/octet-stream') {
    if (ext === '.mov') mime = 'video/quicktime';
    else if (ext === '.mp4') mime = 'video/mp4';
    else if (ext === '.webm') mime = 'video/webm';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.gif') mime = 'image/gif';
  }

  const spec = SUPPORTED_MEDIA_TYPES[mime];

  if (!spec && !ACCEPTED_FILE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported format (${file.name}). Please upload JPG, PNG, WebP, GIF, MP4, WebM, or MOV.`
    };
  }

  const maxBytes = spec ? spec.maxBytes : 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${formatBytes(maxBytes)} (current: ${formatBytes(file.size)}).`
    };
  }

  const isVideo = mime.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext);
  const mediaType = isVideo ? 'video' : 'image';

  return {
    valid: true,
    mimeType: mime,
    mediaType,
    ext,
    error: null
  };
}

/**
 * Uploads a creative media file to Supabase Storage or persistent local storage
 * Supports onProgress callbacks (0-100%)
 */
export async function uploadPortfolioMedia(file, creatorId = 'creator-1', onProgress = null) {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `portfolio/${creatorId}/${timestamp}_${cleanName}`;

  if (onProgress) onProgress(15);

  // 1. Try Supabase Storage if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      if (onProgress) onProgress(35);
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        if (onProgress) onProgress(85);
        const { data: urlData } = supabase.storage
          .from('portfolio-media')
          .getPublicUrl(path);

        if (urlData?.publicUrl) {
          if (onProgress) onProgress(100);
          return {
            id: `media-${timestamp}`,
            url: urlData.publicUrl,
            storagePath: path,
            storageType: 'supabase',
            name: file.name,
            size: file.size,
            mimeType: validation.mimeType,
            mediaType: validation.mediaType,
            isCover: false
          };
        }
      }
    } catch (err) {
      console.warn('[Alloy Storage] Supabase bucket upload failed, using local persistent fallback:', err);
    }
  }

  // 2. High-performance local media persistence (IndexedDB / Blob URL)
  // Simulate progress smoothly
  if (onProgress) onProgress(50);
  await new Promise(r => setTimeout(r, 120));
  if (onProgress) onProgress(80);
  await new Promise(r => setTimeout(r, 100));

  // Create local object URL for preview and playback
  const objectUrl = URL.createObjectURL(file);

  // Cache in IndexedDB for cross-session survival where feasible
  try {
    saveToLocalMediaCache(`media-${timestamp}`, file);
  } catch (e) {}

  if (onProgress) onProgress(100);

  return {
    id: `media-${timestamp}`,
    url: objectUrl,
    storagePath: `local://${cleanName}`,
    storageType: 'local-blob',
    name: file.name,
    size: file.size,
    mimeType: validation.mimeType,
    mediaType: validation.mediaType,
    isCover: false
  };
}

// Lightweight IndexedDB helper for persisting local blobs across page refreshes
const DB_NAME = 'alloy_portfolio_media_v1';
const STORE_NAME = 'media_blobs';

function getDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject('No indexedDB');
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToLocalMediaCache(id, file) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, file, name: file.name, type: file.type });
  } catch (e) {
    // Graceful fallback
  }
}
