import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp.js';

const MAX_BODY = 128 * 1024;
const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
const configuredHosts = () => new Set((process.env.ALLOWED_HOSTS ?? '').split(',').map(value => value.trim()).filter(Boolean));
function reject(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: message }));
}
function requestAllowed(req) {
  const host = (req.headers.host ?? '').toLowerCase();
  const hostname = host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host.split(':')[0];
  const hosts = configuredHosts();
  const allowed = loopback.has(hostname) || hosts.has(hostname);
  if (!allowed) return false;
  if (!req.headers.origin) return true;
  try {
    const origin = new URL(req.headers.origin);
    const ownOrigin = origin.host.toLowerCase() === host;
    return ownOrigin || origin.origin === 'https://chatgpt.com' || origin.origin === 'https://platform.openai.com';
  } catch { return false; }
}

export async function mcpHandler(req, res) {
  if (!requestAllowed(req)) return reject(res, 403, 'Host or Origin is not allowed.');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reject(res, 405, 'Stateless MCP supports POST requests only.');
  }
  if (!(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) return reject(res, 415, 'Use application/json.');
  if (Number(req.headers['content-length'] ?? 0) > MAX_BODY) return reject(res, 413, 'Request body is too large.');
  let body = req.body;
  if (body === undefined) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) return reject(res, 413, 'Request body is too large.');
      chunks.push(chunk);
    }
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { return reject(res, 400, 'Malformed JSON.'); }
  } else if (Buffer.byteLength(JSON.stringify(body)) > MAX_BODY) {
    return reject(res, 413, 'Request body is too large.');
  }
  // A fresh server and transport per request allow horizontal scaling without
  // storing user sessions. Do not log request bodies or full tool arguments.
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.setHeader('Cache-Control', 'no-store');
  res.once('close', () => { transport.close().catch(() => {}); server.close().catch(() => {}); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch {
    if (!res.headersSent) reject(res, 500, 'The MCP request could not be completed.');
  }
}
