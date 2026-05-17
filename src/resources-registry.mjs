import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT, resolveRepoRoot } from './paths.mjs';

const PRIORITY_DOCS = [
  'docs/PROGRAMME_MASTER_REFERENCE.md',
  'docs/agents/FULL_PROGRAMME_PLAN_FOR_AGENTS.md',
  'docs/CROSS_TOOL_AGENT_PROTOCOL.md',
  'docs/MULTI_AGENT_DEVELOPMENT_LOG.md',
  'docs/ui-design/SCREEN_ROUTE_MAP.md',
  'docs/GOOGLE_STITCH_DESIGN_PROMPT.md',
  'docs/UI_BACKEND_INTEGRATION_MASTER_PLAN.md',
  'docs/WEB_START_TO_END_PLAN.md',
  'docs/AUTHENTICATION_AND_AUTHORIZATION.md',
  'docs/security/SECURITY_WHITE_HAT.md',
  'docs/security/SECURITY_FIXED.md',
  'docs/LOCAL_FULL_STACK_RUNBOOK.md',
  'docs/ingested/source-copies/fusionx_implementation_plan.md',
  'AGENTS.md',
  'COORDINATION.md',
  'thejad/data/fusionx-ui-dev-guide.md',
  'thejad/data/lolc-limits.json',
  'thejad/data/stories-traceability.json',
  'thejad/plans/backend-api-plan.json',
  'thejad/plans/ui-ux-route-plan.md',
  'thejad/requested.md',
];

function collectDocs(dir, base, out, depth) {
  if (depth > 4 || out.length > 400) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectDocs(full, base, out, depth + 1);
    else if (e.isFile() && /\.(md|json)$/i.test(e.name)) {
      const rel = path.relative(base, full).replace(/\\/g, '/');
      out.push(rel);
    }
  }
}

export function listResources() {
  const repo = resolveRepoRoot();
  const resources = [];
  const seen = new Set();

  for (const rel of PRIORITY_DOCS) {
    const full = rel.startsWith('thejad/') ? path.join(PACKAGE_ROOT, rel.replace(/^thejad\//, '')) : path.join(repo, rel);
    if (!fs.existsSync(full) || seen.has(rel)) continue;
    seen.add(rel);
    resources.push({
      uri: `thejad://doc/${encodeURIComponent(rel)}`,
      name: path.basename(rel),
      description: `LOLC programme doc: ${rel}`,
      mimeType: 'text/markdown',
      rel,
    });
  }

  const docsDir = path.join(repo, 'docs');
  if (fs.existsSync(docsDir)) {
    const extra = [];
    collectDocs(docsDir, repo, extra, 0);
    for (const rel of extra) {
      if (resources.length >= 350) break;
      const norm = rel.replace(/\\/g, '/');
      if (seen.has(norm)) continue;
      seen.add(norm);
      resources.push({
        uri: `thejad://doc/${encodeURIComponent(norm)}`,
        name: path.basename(norm),
        description: norm,
        mimeType: norm.endsWith('.json') ? 'application/json' : 'text/markdown',
        rel: norm,
      });
    }
  }

  resources.push({
    uri: 'thejad://coordination/active-claims',
    name: 'active-claims',
    description: 'Multi-user coordination claims (ThejaD)',
    mimeType: 'application/json',
    rel: 'thejad/coordination/active-claims.json',
  });

  return resources;
}

export function readResource(uri) {
  const repo = resolveRepoRoot();
  if (uri === 'thejad://coordination/active-claims') {
    const p = path.join(PACKAGE_ROOT, 'coordination', 'active-claims.json');
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '{"claims":[]}';
  }
  const m = uri.match(/^thejad:\/\/doc\/(.+)$/);
  if (!m) return null;
  const rel = decodeURIComponent(m[1]);
  let full = path.join(repo, rel);
  if (rel.startsWith('thejad/')) full = path.join(PACKAGE_ROOT, rel.replace(/^thejad\//, ''));
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}
