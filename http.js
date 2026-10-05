import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { mcpHandler } from './handler.js';
import { CATALOG_COUNT } from './catalog.js';
import { VERSION } from './mcp.js';

const pages = { '/': 'index.html', '/support.html': 'support.html', '/privacy-policy.html': 'privacy-policy.html', '/terms-of-service.html': 'terms-of-service.html' };
export function createHttpServer() {
  return http.createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/mcp') return mcpHandler(req, res);
    if (path === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', version: VERSION, catalog_count: CATALOG_COUNT, image_rendering: false }));
    }
    if (path === '/.well-known/openai-apps-challenge' && req.method === 'GET' && process.env.OPENAI_APPS_CHALLENGE) {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      return res.end(process.env.OPENAI_APPS_CHALLENGE);
    }
    if (pages[path] && req.method === 'GET') {
      try {
        const content = await readFile(new URL(`../public/${pages[path]}`, import.meta.url));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
        return res.end(content);
      } catch { /* Fall through to 404. */ }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}
