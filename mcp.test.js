import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createHttpServer } from '../src/http.js';
import { FILTER_ORDER, getTemplate } from '../src/catalog.js';

let server, base, client;
before(async () => {
  server = createHttpServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  client = new Client({ name: 'mavixx-review-test', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
});
after(async () => {
  await client?.close();
  await new Promise(resolve => server?.close(resolve));
});
const call = (name, args = {}) => client.callTool({ name, arguments: args });

test('MCP handshake and discovery expose exactly four bounded read-only tools', async () => {
  const { tools } = await client.listTools();
  assert.equal(tools.length, 4);
  for (const tool of tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
    assert.equal(tool.annotations.openWorldHint, false);
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.ok(tool.outputSchema);
  }
});
test('catalog returns real categories and paginated combinations', async () => {
  const all = (await call('list_design_categories')).structuredContent.result;
  assert.equal(all.catalog_count, 4057);
  assert.ok(all.primary_categories.includes('Beauty & Cosmetics'));
  const first = (await call('list_design_categories', { primary_category: 'Beauty & Cosmetics', limit: 2 })).structuredContent.result;
  assert.equal(first.combinations.length, 2);
  assert.equal(first.next_offset, 2);
  const next = (await call('list_design_categories', { primary_category: 'Beauty & Cosmetics', offset: 2, limit: 2 })).structuredContent.result;
  assert.notDeepEqual(first.combinations, next.combinations);
});
test('ordered search retains supported classification when secondary filter has no match', async () => {
  const args = { selection: { primary_category: 'Beauty & Cosmetics', secondary_subcategory: 'Unlisted crossover' }, subject: 'skincare serum bottle', output: 'post', limit: 3 };
  const first = (await call('search_design_templates', args)).structuredContent.result;
  const repeat = (await call('search_design_templates', args)).structuredContent.result;
  assert.deepEqual(first, repeat);
  assert.deepEqual(first.selection_trace.map(item => item.field), FILTER_ORDER);
  assert.equal(first.results.length, 3);
  assert.ok(first.results.every(row => row.primary_category === 'Beauty & Cosmetics'));
  assert.match(first.selection_trace[3].decision, /no compatible match/);
});
test('full records include every source field and quality notes without fabricating images', async () => {
  const result = (await call('get_design_template', { template_id: 'IMG-000001' })).structuredContent.result;
  assert.deepEqual(result, getTemplate('IMG-000001'));
  for (const field of ['id', 'primary_category', 'primary_subcategory', 'secondary_category', 'secondary_subcategory', 'content_format', 'subject', 'purpose', 'source_style', 'colors', 'hex_palette', 'typography', 'layout', 'visible_text', 'analysis', 'reconstruction_prompt', 'reusable_prompt']) assert.equal(typeof result[field], 'string');
  assert.equal(result.source_basis, 'supplied_workbook_text_only');
  assert.ok(Array.isArray(result.quality_notes));
});
test('variation guidance preserves asset identity and fixed campaign anchors', async () => {
  const result = (await call('get_design_guidance', { output: 'carousel', variation_mode: 'different_product' })).structuredContent.result;
  assert.match(result.asset_rules, /actual supplied product\/logo assets/);
  assert.match(result.campaign_variations.rules, /original positions/);
  assert.match(result.campaign_variations.rules, /headline/i);
  assert.equal(result.affiliate_feature.automatic_display_available, false);
  assert.match(result.rendering, /host image-generation/);
});
test('unknown catalog category and record return useful errors', async () => {
  assert.equal((await call('list_design_categories', { primary_category: 'Made Up Category' })).isError, true);
  assert.equal((await call('get_design_template', { template_id: 'IMG-999999' })).isError, true);
});
test('malformed IDs, excess arguments and oversized shortlists are rejected by schemas', async () => {
  for (const [name, args] of [
    ['get_design_template', { template_id: "IMG-000001' OR 1=1" }],
    ['search_design_templates', { subject: 'x'.repeat(501) }],
    ['search_design_templates', { limit: 7 }],
    ['search_design_templates', { url: 'https://example.com/private' }]
  ]) {
    const result = await call(name, args);
    assert.equal(result.isError, true);
  }
});
test('HTTP rejects unknown hosts, cross-origin browser requests and invalid bodies', async () => {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  const invalidHostStatus = await new Promise((resolve, reject) => {
    const request = http.request(`${base}/mcp`, { method: 'POST', headers: { ...headers, Host: 'attacker.example' } }, response => { response.resume(); resolve(response.statusCode); });
    request.on('error', reject);
    request.end(body);
  });
  assert.equal(invalidHostStatus, 403);
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers: { ...headers, Origin: 'https://attacker.example' }, body })).status, 403);
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers, body: '{' })).status, 400);
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers, body: JSON.stringify({ padding: 'x'.repeat(131073) }) })).status, 413);
  assert.equal((await fetch(`${base}/mcp`)).status, 405);
});
test('health and domain challenge do not imply images or unverified ownership', async () => {
  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.catalog_count, 4057);
  assert.equal(health.image_rendering, false);
  assert.equal((await fetch(`${base}/.well-known/openai-apps-challenge`)).status, 404);
  process.env.OPENAI_APPS_CHALLENGE = 'test-only-challenge-token';
  assert.equal(await (await fetch(`${base}/.well-known/openai-apps-challenge`)).text(), 'test-only-challenge-token');
  delete process.env.OPENAI_APPS_CHALLENGE;
});
