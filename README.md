# Mavixx Social Media Design — MCP backend, version 2.0.0

A real read-only MCP server for the existing 4,057-record design library. Four tools provide supported categories, contextual template ranking, complete template records and brand/campaign design guidance. Transport: stateless Streamable HTTP at `/mcp`, using the official TypeScript SDK.

**Status:** implemented and locally tested; not deployed, domain-verified, submitted or published. This source archive is not an upload-ready public-plugin ZIP. The public package must contain the actual deployed HTTPS endpoint.

## Run locally

Use Node.js 22 or later (tested with Node 24):

```sh
npm ci
npm test
npm run review
npm start
```

Endpoint: `http://localhost:3000/mcp`. Health: `/health`. Localhost is for development, not public store submission. A client can use the official `StreamableHTTPClientTransport`. Tool schemas and annotations are available through MCP discovery.

## Tools

| Tool | Result |
| --- | --- |
| `list_design_categories` | 62 supported primary categories, formats, purposes and paginated combinations |
| `search_design_templates` | Ordered filters, contextual ranking and a shortlist of 1–6 real records |
| `get_design_template` | All 17 source fields, quality notes and provenance for a known ID |
| `get_design_guidance` | Asset identity, formats, color/grid rules, rendering limits and campaign variation rules |

The server does not render images, fetch websites, process uploaded files, remove backgrounds, store user content, access accounts or publish posts. ChatGPT's image-generation capability supplies final images. Source prices, names, contacts and inferred visual descriptions must not be treated as facts about the current brand.

## Deploy

Deploy the **entire extracted project** to a dedicated Node.js HTTPS host. GitHub Pages cannot run this backend. A Vercel configuration and Dockerfile are included. Do not replace an unrelated existing production project.

For Vercel, import the repository/folder as a new project using the Other preset and Node 24. Install with `npm ci`. The static site is `public/`; Node functions are `api/`. Configure `ALLOWED_HOSTS` with the exact production hostname, e.g. `mavixx-design-mcp.vercel.app` (no scheme/path). Multiple approved hosts may be comma-separated. Requests from unknown hosts/origins are rejected. Production MCP must be reachable by OpenAI without a private deployment login wall. Preview protection may remain enabled.

For a container host, build the included Dockerfile, configure `ALLOWED_HOSTS`, bind the configured `PORT`, and place it behind the host's HTTPS service. Only the fixed public catalog is exposed. No external API keys are needed.

After deployment:

```sh
npm run review -- https://YOUR-ACTUAL-HOST/mcp
```

Confirm all eight cases pass against the live host. Check `/health` and all four public pages. Verify the host's logging, retention and security settings against the published privacy description.

## New public plugin entry

OpenAI supports both skills-only and MCP plugins. Adding MCP to an existing skills-only entry is currently unsupported, so create a **new** entry with MCP in its initial ZIP. Do not delete the existing entry. MCP does not guarantee faster review.

Once the real backend and policy pages are live:

```sh
npm run package:plugin -- https://YOUR-ACTUAL-HOST/mcp https://YOUR-ACTUAL-HOST/
```

The packager rejects local/placeholding endpoints and creates `release/mavixx-social-media-design-2.0.0.zip`. It uses the supported Codex compatibility manifest layout and declares the remote server in `.mcp.json`. Server source and catalog stay on the host rather than inside the small submission ZIP.

In the portal, select the MCP submission flow. Copy its exact domain token into the `OPENAI_APPS_CHALLENGE` deployment environment variable, redeploy if required, and verify `/.well-known/openai-apps-challenge` returns that exact value. No fake/default token is served. Complete domain verification before review.

Use `review/cases.json` for the required five positive and three negative cases. `review/test-results.json` records actual local tool calls. A reviewer-accessible walkthrough URL and end-to-end ChatGPT testing are still required before submission. Local test evidence does not establish public connectivity or successful image rendering.

The new backend includes matching home/support/privacy/terms pages. Existing GitHub Pages links remain useful for the old skills-only product; its static-site-only privacy description should not be used unchanged for this backend. The linked policies are editable creator drafts, not OpenAI-approved legal documents. Before submission, the creator must verify template rights and any binding publisher attestations.

## Preserved campaign and affiliate behavior

Existing guidance preserves real assets, exact current facts, restrained 0–10% refinements, a 60/30/10 color system, an invisible 3×3 grid, requested output count/ratio and distinct variations with fixed CTA/logo/footer anchors. Original instructions are included in `docs/` for traceability; their old local database/composer commands are archival, not installed MCP client commands.

The creator-requested affiliate URL/configuration is preserved transparently. Automatic display is suppressed because an anonymous stateless backend cannot establish private persistent per-user frequency and opt-out state. The recommendation remains optional and disclosed. This does not establish compliance with public-store advertising rules; no reviewer attestation should conceal it.

## Verification and data

The JSON catalog preserves all 4,057 SQLite records, all 17 fields and quality notes. The original source basis is supplied workbook text; no source images are imported. Source rights are the creator's responsibility, not independently verified by this implementation.

`npm test` verifies actual MCP initialization/discovery/calls, schemas, deterministic bounded selection, full records, campaign rules, unknown IDs, invalid input, HTTP host/origin checks, body-size limits, health and domain-token behavior. `npm run review` exercises the five positive and three negative cases with the official MCP client. Application code does not log or persist tool arguments/request bodies. Operational provider logs are separate.

Official references, checked October 5, 2026:

- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/build/mcp-server
- https://developers.openai.com/plugins/deploy/app-review
- https://developers.openai.com/plugins/build/plugins
- https://ts.sdk.modelcontextprotocol.io/server
