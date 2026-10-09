// server/index.js
// Standalone Node.js server for CreaSync AI API
// Can be run via: node server/index.js

import http from 'http';
import { createGroqMiddleware } from './groqMiddleware.js';

const PORT = process.env.PORT || 3001;
const middleware = createGroqMiddleware();

const server = http.createServer((req, res) => {
  middleware(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'Not found' }));
  });
});

server.listen(PORT, () => {
  console.log(`[CreaSync AI Server] Running on http://localhost:${PORT}`);
});
