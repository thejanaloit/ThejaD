#!/usr/bin/env node
/** Regenerate specialties.generated.json from live ThejaD MCP source */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildCatalogTools } from '../src/tool-catalog.mjs';
import { listToolsForSession } from '../src/tools.mjs';
import { listPrompts } from '../src/prompts-registry.mjs';
import { listImportedSkillNames } from '../src/skills-sync.mjs';
import { PACKAGE_ROOT } from '../src/paths.mjs';
import { buildExternalSources } from './build-external-sources.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walkSkillDirs(dir, prefix, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    const skillMd = path.join(full, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      out.push({
        id: e.name,
        folder: rel,
        uri: `thejad://skill/${e.name}`,
        bundle: prefix ? prefix.split('/')[0] : e.name,
      });
    }
    walkSkillDirs(full, rel, out);
  }
}

function collectSkills() {
  const skills = [];
  walkSkillDirs(path.join(PACKAGE_ROOT, 'skills'), '', skills);
  const imported = listImportedSkillNames();
  return { skills, importedManifest: imported };
}

function loadLimits() {
  const p = path.join(PACKAGE_ROOT, 'data', 'lolc-limits.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const MEMORY_MESH_NODES = [
  { id: 'graphify', label: 'Graphical memory', tool: 'graphify_hint', path: 'graphify-out/ knowledge graph', primary: true },
  { id: 'local-memory', label: 'Local memory', tool: 'memory_store', path: '.thejad/memory.json' },
  { id: 'pod-memory', label: 'Pod memory mesh', tool: 'thejad_pod_memory_sync', path: 'shared-memory.json' },
  { id: 'device-index', label: 'Device index', tool: 'device_reindex', path: 'device-index.json' },
  { id: 'skills', label: 'Skills URIs', tool: 'vendor_sync_skills', path: 'thejad://skill/*' },
  { id: 'limits', label: 'LOLC limits', tool: 'limits_check', path: 'lolc-limits.json' },
  { id: 'coordination', label: 'Coordination', tool: 'coordination_claim', path: 'active-claims.json' },
  { id: 'notebooklm', label: 'NotebookLM', tool: 'notebooklm_ask', path: 'Research context' },
  { id: 'hyperspace', label: 'Hyperspace models', tool: 'hyperspace_gateway_infer', path: 'Gateway /v1' },
  { id: 'ollama', label: 'Ollama mesh', tool: 'thejad_pod_models', path: 'LAN + local' },
  { id: 'docs', label: 'Programme docs', tool: 'resources/read', path: 'thejad://doc/*' },
  { id: 'swarm', label: 'Ruflo swarm', tool: 'swarm_status', path: 'swarm.json' },
];

const named = listToolsForSession().map((t) => ({
  name: t.name,
  tier: t.tier,
  desc: t.description,
}));

const catalog = buildCatalogTools().map((t) => ({
  name: t.name,
  cat: t.category,
  action: t.action,
  tier: t.tier,
}));

const prompts = listPrompts().map((p) => ({
  name: p.name,
  desc: p.description || '',
}));

const { skills, importedManifest } = collectSkills();
const limits = loadLimits();

const coreCommands = [
  {
    id: 'use-thejad',
    title: 'Use ThejaD',
    summary: 'Install MCP in Cursor, run status, enable hooks — your IDE agent calls ThejaD on every task.',
    code: 'npx thejad init\nthejad stats\nthejad mcp start',
    tools: ['thejad_status', 'thejad_setup_complete'],
  },
  {
    id: 'orchestrate',
    title: 'thejad_orchestrate',
    summary: 'Main orchestra entry: warm models → match role + skills → token-optimized prompt → delivery workflow.',
    code: 'Tool: thejad_orchestrate\n{ "prompt": "your task here" }',
    tools: ['thejad_orchestrate', 'runOrchestra'],
  },
  {
    id: 'mamathejana',
    title: 'mamaThejana',
    summary: 'Unlock phrase → 100% tier (all catalog, NotebookLM smokes, full integrations). Lock with "nothejad unlock".',
    code: 'thejad_unlock({ phrase: "mamaThejana" })\n# or THEJAD_FULL_ACCESS=1 in MCP env',
    tools: ['thejad_unlock', 'THEJAD_FULL_ACCESS'],
  },
  {
    id: 'graphify',
    title: 'Graphify',
    summary: 'Index monorepo as knowledge graph — graphify_hint + graphify catalog domain (15 tools).',
    code: 'graphify_hint({ path: "repo root" })\nvendor_sync_skills → graphify-graphify skill',
    tools: ['graphify_hint', 'vendor_sync_skills'],
  },
  {
    id: 'limits',
    title: 'limits_check',
    summary: 'LOLC dev payment limits + programme phase weights — keeps agents inside Phase 1 scope.',
    code: 'limits_check → lolc-limits.json\nscope_guard for AGENTS.md alignment',
    tools: ['limits_check', 'scope_guard'],
  },
];

const externalSources = buildExternalSources();

const out = {
  generatedAt: new Date().toISOString(),
  named,
  catalog,
  prompts,
  skills,
  importedManifest,
  limits,
  memoryMesh: MEMORY_MESH_NODES,
  coreCommands,
  externalSources,
  counts: {
    named: named.length,
    catalog: catalog.length,
    prompts: prompts.length,
    skills: skills.length,
    mcpTools: named.length + catalog.length,
    resources: 221,
    memoryNodes: MEMORY_MESH_NODES.length,
    externalSources: externalSources.totalCount,
  },
};

fs.writeFileSync(path.join(__dirname, 'specialties.generated.json'), JSON.stringify(out));
console.log('[ThejaD] Wrote specialties.generated.json', out.counts);
