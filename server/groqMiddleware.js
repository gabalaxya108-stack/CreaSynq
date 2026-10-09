// server/groqMiddleware.js
// Connect/Express compatible middleware for CreaSync AI API
// Routes incoming frontend requests to server/groqService.js

import { 
  isGroqConfigured, 
  getGroqModel,
  generateCreaBrief, 
  generateCreatorDNA, 
  evaluateCreaMatchAndScore, 
  generateCreaSimConcepts 
} from './groqService.js';

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

export function createGroqMiddleware() {
  return async function groqMiddleware(req, res, next) {
    const url = req.url ? req.url.split('?')[0] : '';

    // Handle CORS preflight
    if (req.method === 'OPTIONS' && url.startsWith('/api/ai')) {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.end();
    }

    if (!url.startsWith('/api/ai')) {
      return next ? next() : res.end();
    }

    try {
      // 1. Health check & configuration status
      if (url === '/api/ai/health') {
        const configured = isGroqConfigured();
        return sendJson(res, 200, {
          ok: true,
          configured,
          model: getGroqModel(),
          status: configured ? 'ready' : 'missing_key',
          message: configured 
            ? `Groq AI server is active using ${getGroqModel()}.` 
            : 'GROQ_API_KEY environment variable is not configured on the server. Falling back to deterministic intelligence.'
        });
      }

      // Check key for functional endpoints
      if (!isGroqConfigured()) {
        return sendJson(res, 503, {
          ok: false,
          code: 'CONFIG_MISSING',
          error: 'GROQ_API_KEY is not configured on the server.',
          hint: 'Add GROQ_API_KEY to your .env file and restart the server.'
        });
      }

      const body = await parseJsonBody(req);

      // 2. CreaBrief Generator
      if (url === '/api/ai/creabrief' && req.method === 'POST') {
        const prompt = body.prompt || body.text;
        if (!prompt) {
          return sendJson(res, 400, { ok: false, error: 'Prompt is required.' });
        }
        const brief = await generateCreaBrief(prompt);
        return sendJson(res, 200, { ok: true, source: 'groq', brief });
      }

      // 3. Creator DNA Generator
      if (url === '/api/ai/creatordna' && req.method === 'POST') {
        const creator = body.creator;
        if (!creator) {
          return sendJson(res, 400, { ok: false, error: 'Creator data is required.' });
        }
        const dna = await generateCreatorDNA(creator);
        return sendJson(res, 200, { ok: true, source: 'groq', dna });
      }

      // 4. CreaMatch & CreaScore Evaluation
      if (url === '/api/ai/creamatch' && req.method === 'POST') {
        const { campaign, creator } = body;
        if (!campaign || !creator) {
          return sendJson(res, 400, { ok: false, error: 'Campaign and creator data are required.' });
        }
        const matchAnalysis = await evaluateCreaMatchAndScore(campaign, creator);
        return sendJson(res, 200, { ok: true, source: 'groq', matchAnalysis });
      }

      // 5. CreaSim Concept Generator
      if (url === '/api/ai/creasim' && req.method === 'POST') {
        const { campaign, creator, creatorDNA } = body;
        if (!campaign || !creator) {
          return sendJson(res, 400, { ok: false, error: 'Campaign and creator data are required.' });
        }
        const conceptsData = await generateCreaSimConcepts(campaign, creator, creatorDNA);
        return sendJson(res, 200, { ok: true, source: 'groq', ...conceptsData });
      }

      // Route not found
      return sendJson(res, 404, { ok: false, error: `Endpoint ${url} not found.` });
    } catch (err) {
      console.error('[Groq Middleware Error]:', err.message);
      const statusCode = err.status || (err.code === 'RATE_LIMIT' ? 429 : 500);
      return sendJson(res, statusCode, {
        ok: false,
        code: err.code || 'INTERNAL_ERROR',
        error: err.message || 'An unexpected error occurred during AI processing.'
      });
    }
  };
}
