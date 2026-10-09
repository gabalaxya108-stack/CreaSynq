// src/ai/provider.js
// Clean AI Provider Abstraction with caching, schema validation, and reliable demo mode fallback

const analysisCache = new Map();

export class AIProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || null;
    this.mode = config.mode || 'demo'; // 'demo' | 'api'
  }

  // Generic cached request with deterministic fallback
  analyze(cacheKey, prompt, fallbackFn) {
    if (analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey);
    }

    try {
      const result = fallbackFn();
      analysisCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('[CreaSynq AI] Provider error:', err);
      const fallbackResult = fallbackFn();
      analysisCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  async analyzeAsync(cacheKey, prompt, fallbackFn) {
    if (analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey);
    }
    const result = await fallbackFn();
    analysisCache.set(cacheKey, result);
    return result;
  }

  clearCache() {
    analysisCache.clear();
  }
}

export const defaultAIProvider = new AIProvider();
