import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const endpoint = process.argv[2];
const website = process.argv[3];
if (!endpoint || !website) throw new Error('Usage: npm run package:plugin -- https://ACTUAL-HOST/mcp https://ACTUAL-HOST/');
const url = new URL(endpoint), home = new URL(website);
if (url.protocol !== 'https:' || home.protocol !== 'https:' || /localhost|127\.0\.0\.1|\.example$/.test(url.hostname) || /localhost|127\.0\.0\.1|\.example$/.test(home.hostname)) throw new Error('Use actual public HTTPS URLs, not placeholders or local endpoints.');
const client = new Client({ name: 'mavixx-package-verification', version: '1.0.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(url));
  const { tools } = await client.listTools();
  for (const name of ['list_design_categories', 'search_design_templates', 'get_design_template', 'get_design_guidance']) {
    if (!tools.some(tool => tool.name === name)) throw new Error(`Live endpoint does not expose ${name}.`);
  }
} finally { await client.close(); }
for (const path of ['./', 'support.html', 'privacy-policy.html', 'terms-of-service.html']) {
  const response = await fetch(new URL(path, home), { signal: AbortSignal.timeout(15000) });
  if (!response.ok || !(response.headers.get('content-type') ?? '').includes('text/html')) throw new Error(`Required public HTML page is unavailable: ${path}`);
}
const output = resolve('release/mavixx-social-media-design-2.0.0');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp('plugin-template', output, { recursive: true });
const manifest = JSON.parse(await readFile(`${output}/.codex-plugin/plugin.json`, 'utf8'));
manifest.homepage = home.href;
for (const [field, path] of Object.entries({ websiteURL: './', supportURL: 'support.html', privacyPolicyURL: 'privacy-policy.html', termsOfServiceURL: 'terms-of-service.html' })) manifest.interface[field] = new URL(path, home).href;
await writeFile(`${output}/.codex-plugin/plugin.json`, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(`${output}/.mcp.json`, `${JSON.stringify({ mcpServers: { 'mavixx-design': { url: url.href } } }, null, 2)}\n`);
execFileSync('python3', ['-c', 'import pathlib,sys,zipfile; p=pathlib.Path(sys.argv[1]); z=zipfile.ZipFile(str(p)+".zip","w",zipfile.ZIP_DEFLATED); [z.write(f,f.relative_to(p)) for f in sorted(p.rglob("*")) if f.is_file()]; z.close()', output]);
console.log(`${output}.zip`);
console.log('Package created. Verify the live endpoint, domain ownership, legal pages and walkthrough URL before uploading as a NEW MCP-enabled entry.');
