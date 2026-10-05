import { readFile, writeFile } from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createHttpServer } from '../src/http.js';
const cases = JSON.parse(await readFile(new URL('../review/cases.json', import.meta.url), 'utf8'));
let server;
let endpoint = process.argv[2];
if (!endpoint) {
  server = createHttpServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  endpoint = `http://127.0.0.1:${server.address().port}/mcp`;
}
const client = new Client({ name: 'mavixx-review-walkthrough', version: '1.0.0' });
const report = { tested_at: new Date().toISOString(), endpoint, scope: server ? 'Local MCP tool-level tests; not public deployment or end-to-end ChatGPT image generation.' : 'Remote MCP tool-level tests; not end-to-end ChatGPT image generation.', cases: [] };
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  for (const example of [...cases.positive, ...cases.negative]) {
    const result = await client.callTool({ name: example.tool, arguments: example.arguments });
    const expectedError = example.id.startsWith('N');
    const passed = Boolean(result.isError) === expectedError;
    const data = result.structuredContent?.result;
    const observed = data ? {
      catalog_count: data.catalog_count, primary_category_count: data.primary_categories?.length,
      shortlist_ids: data.results?.map(row => row.id), field_count: data.id ? 17 : undefined,
      template_id: data.id, output: data.output, variation_mode: data.campaign_variations?.mode,
      rendering: data.rendering
    } : { error: result.content?.[0]?.text };
    report.cases.push({ ...example, passed, observed });
    console.log(`${example.id} ${passed ? 'PASS' : 'FAIL'} ${example.tool}: ${JSON.stringify(observed)}`);
  }
  await writeFile(new URL('../review/test-results.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  if (report.cases.some(example => !example.passed)) process.exitCode = 1;
} finally {
  await client.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
