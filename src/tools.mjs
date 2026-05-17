import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { capabilityPercent, isFullCapacity, unlockWithPhrase } from './capability.mjs';
import {
  deviceReindexHint,
  deviceSearch,
  deviceUsableSearch,
  deviceUsableSummary,
} from './device.mjs';
import { notebooklmAddRepoSources, notebooklmAsk, notebooklmInstallHint } from './notebooklm.mjs';
import { agentSpawn, securityScanRepo, swarmInit, swarmStatus, workerHints } from './ruflo.mjs';
import {
  consultRole,
  draftStory,
  loadTeam,
  qaPlan,
  supremePlan,
} from './team.mjs';
import { catalogToolCount } from './tool-catalog.mjs';
import { engineeringTeamRoster, getPluginsStatus, graphifyHint, installHints } from './plugins.mjs';
import { syncVendorSkills } from './skills-sync.mjs';
import { listPrompts } from './prompts-registry.mjs';
import { listResources } from './resources-registry.mjs';
import { PACKAGE_ROOT, readJson, resolveDataDir, resolveRepoRoot } from './paths.mjs';

const ALL_TOOLS = [
  {
    name: 'thejad_status',
    tier: 'core',
    description: 'ThejaD status: capability %, unlock state, repo detection, thanks footer.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'thejad_unlock',
    tier: 'core',
    description: 'Unlock maximum capability with secret phrase (friends only).',
    inputSchema: {
      type: 'object',
      properties: { phrase: { type: 'string' } },
      required: ['phrase'],
    },
  },
  {
    name: 'coordination_claim',
    tier: 'core',
    description:
      'Claim a path/lane so Cursor + Antigravity + Copilot do not collide. Writes coordination/active-claims.json.',
    inputSchema: {
      type: 'object',
      properties: {
        tool: { type: 'string', description: 'Cursor | Antigravity | Copilot | Human' },
        lane: { type: 'string', description: 'A–E' },
        paths: { type: 'string' },
        who: { type: 'string' },
      },
      required: ['tool', 'paths'],
    },
  },
  {
    name: 'coordination_release',
    tier: 'core',
    description: 'Release an active coordination claim by id.',
    inputSchema: {
      type: 'object',
      properties: { claimId: { type: 'string' } },
      required: ['claimId'],
    },
  },
  {
    name: 'memory_store',
    tier: 'standard',
    description: 'Store a key/value in ThejaD local memory (.thejad/memory.json).',
    inputSchema: {
      type: 'object',
      properties: { key: { type: 'string' }, value: { type: 'string' } },
      required: ['key', 'value'],
    },
  },
  {
    name: 'memory_search',
    tier: 'standard',
    description: 'Search ThejaD memory keys/values (substring).',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'story_lookup',
    tier: 'standard',
    description: 'Lookup LOLCDL user story by id or route (from stories-traceability.json).',
    inputSchema: {
      type: 'object',
      properties: {
        storyId: { type: 'string' },
        route: { type: 'string' },
      },
    },
  },
  {
    name: 'limits_check',
    tier: 'standard',
    description: 'Return LOLC dev payment limits and programme phase weights.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'scope_guard',
    tier: 'standard',
    description: 'Check task text against Phase 1-only programme scope (AGENTS.md aligned).',
    inputSchema: {
      type: 'object',
      properties: { task: { type: 'string' } },
      required: ['task'],
    },
  },
  {
    name: 'smoke_hint',
    tier: 'standard',
    description: 'Suggest npm smoke commands for a feature area.',
    inputSchema: {
      type: 'object',
      properties: { area: { type: 'string', enum: ['auth', 'accounts', 'payments', 'phase1', 'web'] } },
    },
  },
  {
    name: 'diary_append',
    tier: 'standard',
    description: 'Append daily development diary entry (ThejaD diary log).',
    inputSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        tool: { type: 'string' },
      },
      required: ['summary'],
    },
  },
  {
    name: 'swarm_plan',
    tier: 'full',
    description: 'Generate multi-agent task plan for UI + BFF + service lanes.',
    inputSchema: {
      type: 'object',
      properties: { goal: { type: 'string' }, storyId: { type: 'string' } },
      required: ['goal'],
    },
  },
  {
    name: 'ollama_prompt',
    tier: 'full',
    description: 'Send prompt to local Ollama (mock if unavailable).',
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string' },
        prompt: { type: 'string' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'notebooklm_ask',
    tier: 'full',
    description:
      'NotebookLM bridge (notebooklm-py). Mock: returns repo doc pointers until R2 in requested.md.',
    inputSchema: {
      type: 'object',
      properties: { question: { type: 'string' } },
      required: ['question'],
    },
  },
  {
    name: 'figma_context',
    tier: 'full',
    description: 'Figma/Stitch context — route map + UI plan paths (mock until R1).',
    inputSchema: {
      type: 'object',
      properties: { route: { type: 'string' } },
    },
  },
  {
    name: 'full_stack_map',
    tier: 'full',
    description: 'Map route → page → BFF → microservice (backend + UI plan).',
    inputSchema: {
      type: 'object',
      properties: { route: { type: 'string' } },
    },
  },
  {
    name: 'antigravity_handoff',
    tier: 'full',
    description: 'Format Antigravity ↔ Cursor handoff block for MULTI_AGENT_DEVELOPMENT_LOG.',
    inputSchema: {
      type: 'object',
      properties: {
        shipped: { type: 'string' },
        files: { type: 'string' },
        collisionRisk: { type: 'string' },
      },
      required: ['shipped'],
    },
  },
  { name: 'team_list', tier: 'standard', description: 'List supreme engineering team roles (50+ yrs collective).', inputSchema: { type: 'object', properties: {} } },
  { name: 'team_consult', tier: 'standard', description: 'Consult Lahiru/Geesara/Sachini/Thejana/Security/Backend.', inputSchema: { type: 'object', properties: { role: { type: 'string' }, topic: { type: 'string' } }, required: ['role', 'topic'] } },
  { name: 'thejana_supreme_plan', tier: 'standard', description: 'Supreme Developer end-to-end delivery plan.', inputSchema: { type: 'object', properties: { goal: { type: 'string' } }, required: ['goal'] } },
  { name: 'lahiru_ui_review', tier: 'standard', description: 'UI/UX review for route (Lahiru).', inputSchema: { type: 'object', properties: { route: { type: 'string' } } } },
  { name: 'sachini_story_draft', tier: 'standard', description: 'Draft LOLCDL user story skeleton (Sachini).', inputSchema: { type: 'object', properties: { feature: { type: 'string' } }, required: ['feature'] } },
  { name: 'geesara_qa_plan', tier: 'standard', description: 'QA test plan for story (Geesara).', inputSchema: { type: 'object', properties: { storyId: { type: 'string' } } } },
  { name: 'security_white_hat_scan', tier: 'standard', description: 'White-hat security doc index + dev flag checklist.', inputSchema: { type: 'object', properties: {} } },
  { name: 'device_search', tier: 'standard', description: 'Search full device index (C: user + E: projects).', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  {
    name: 'device_usable_summary',
    tier: 'standard',
    description: 'Summarize usable device assets: MCP configs, skills, FusionX/banking paths, Ollama models.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'device_usable_search',
    tier: 'standard',
    description: 'Search categorized device assets (mcpConfigs, skills, fusionxOrBanking, docker, postman, …).',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        query: { type: 'string' },
      },
    },
  },
  {
    name: 'device_reindex',
    tier: 'standard',
    description: 'Rebuild device-index.json + device-usable.json from entire dev device scan.',
    inputSchema: { type: 'object', properties: {} },
  },
  { name: 'swarm_init', tier: 'standard', description: 'Initialize ThejaD swarm (Ruflo-class).', inputSchema: { type: 'object', properties: { topology: { type: 'string' } } } },
  { name: 'swarm_status', tier: 'standard', description: 'Swarm status.', inputSchema: { type: 'object', properties: {} } },
  { name: 'agent_spawn', tier: 'standard', description: 'Spawn tracked agent in swarm.', inputSchema: { type: 'object', properties: { type: { type: 'string' }, task: { type: 'string' } }, required: ['task'] } },
  { name: 'worker_hints', tier: 'standard', description: 'Background worker + Ruflo daemon hints.', inputSchema: { type: 'object', properties: {} } },
  { name: 'notebooklm_install', tier: 'full', description: 'notebooklm-py install commands.', inputSchema: { type: 'object', properties: {} } },
  { name: 'notebooklm_add_sources', tier: 'full', description: 'Add LOLC repo docs as NotebookLM sources.', inputSchema: { type: 'object', properties: {} } },
  { name: 'geesara_run_smokes', tier: 'full', description: 'Run smoke suite (full capacity) or hints at 80%.', inputSchema: { type: 'object', properties: {} } },
  {
    name: 'engineering_team_roster',
    tier: 'core',
    description: 'Full engineering team: Thejana, Lahiru, Geesara, Sachini + Security + Backend with lanes and plugins.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'plugins_status',
    tier: 'core',
    description: 'Status of superpowers, security-review, claude-mem vendors and Claude plugin install commands.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'plugins_install_hints',
    tier: 'core',
    description: 'Install steps for engineering plugin bundle (PowerShell + Claude Code commands).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'vendors_status',
    tier: 'core',
    description: 'All vendor repos (graphify, superpowers, claude-mem, security-review, notebooklm) install status.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'vendor_sync_skills',
    tier: 'core',
    description: 'Sync vendor SKILL.md files into thejad/skills/imported for Cursor.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'graphify_hint',
    tier: 'standard',
    description: 'Graphify install + index LOLC monorepo as knowledge graph.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
  },
];

export function listToolsForSession() {
  const full = isFullCapacity();
  return ALL_TOOLS.filter((t) => {
    if (t.tier === 'core' || t.tier === 'standard') return true;
    return full;
  });
}

function memoryPath() {
  return path.join(resolveDataDir(), 'memory.json');
}

function loadMemory() {
  const p = memoryPath();
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveMemory(m) {
  fs.writeFileSync(memoryPath(), JSON.stringify(m, null, 2), 'utf8');
}

function claimsPath() {
  return path.join(PACKAGE_ROOT, 'coordination', 'active-claims.json');
}

function loadClaims() {
  const p = claimsPath();
  if (!fs.existsSync(p)) return { claims: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveClaims(c) {
  fs.mkdirSync(path.dirname(claimsPath()), { recursive: true });
  fs.writeFileSync(claimsPath(), JSON.stringify(c, null, 2), 'utf8');
}

const THANKS = 'Thanks to Theja';

export async function handleTool(name, args) {
  const pct = capabilityPercent();
  const footer = `\n\n---\n${THANKS}`;

  switch (name) {
    case 'thejad_status':
      return {
        version: '4.2.0',
        capabilityPercent: pct,
        fullCapacity: isFullCapacity(),
        repoRoot: resolveRepoRoot(),
        packageRoot: PACKAGE_ROOT,
        team: Object.keys(loadTeam().roles),
        namedTools: listToolsForSession().length,
        catalogTools: catalogToolCount(),
        prompts: listPrompts().length,
        resources: listResources().length,
        mcpTotalTools: listToolsForSession().length + catalogToolCount(),
        thanks: THANKS,
        planFiles: ['ULTIMATE_PLAN.json', 'THEJAD_PLAN.json'],
      };

    case 'thejad_unlock': {
      const r = unlockWithPhrase(args.phrase);
      return { ...r, capabilityPercent: capabilityPercent() };
    }

    case 'coordination_claim': {
      const data = loadClaims();
      const id = `claim-${Date.now()}`;
      data.claims.push({
        id,
        tool: args.tool,
        lane: args.lane || 'A',
        paths: args.paths,
        who: args.who || 'ThejaD user',
        startedAt: new Date().toISOString(),
      });
      saveClaims(data);
      const repo = resolveRepoRoot();
      const logHint = path.join(repo, 'docs', 'MULTI_AGENT_DEVELOPMENT_LOG.md');
      return { claimId: id, mirrorTo: fs.existsSync(logHint) ? logHint : null };
    }

    case 'coordination_release': {
      const data = loadClaims();
      data.claims = data.claims.filter((c) => c.id !== args.claimId);
      saveClaims(data);
      return { released: args.claimId };
    }

    case 'coordination_list':
      return loadClaims();

    case 'memory_store': {
      const m = loadMemory();
      m[args.key] = { value: args.value, at: new Date().toISOString() };
      saveMemory(m);
      return { stored: args.key };
    }

    case 'memory_search': {
      const m = loadMemory();
      const q = String(args.query || '').toLowerCase();
      const hits = Object.entries(m)
        .filter(([k, v]) => k.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q))
        .map(([k, v]) => ({ key: k, ...v }));
      return { hits };
    }

    case 'story_lookup': {
      const stories = readJson('data/stories-traceability.json');
      let entries = stories.entries || [];
      if (args.storyId) {
        const id = args.storyId.toUpperCase();
        entries = entries.filter((e) => e.id === id);
      }
      if (args.route) {
        const r = args.route.toLowerCase();
        entries = entries.filter((e) => String(e.route || '').toLowerCase().includes(r));
      }
      return { count: entries.length, entries: entries.slice(0, 15) };
    }

    case 'limits_check':
      return readJson('data/lolc-limits.json');

    case 'scope_guard': {
      const task = String(args.task || '').toLowerCase();
      const blocked = ['mobile app', 'phase 6', 'cards programme', 'international wire prod'];
      const hit = blocked.filter((b) => task.includes(b));
      return {
        allowed: hit.length === 0,
        phase1Only: true,
        warnings: hit.length ? hit : ['OK for Phase 1 spine — log in MULTI_AGENT_DEVELOPMENT_LOG if cross-phase'],
      };
    }

    case 'smoke_hint': {
      const map = {
        auth: 'npm run smoke:phase1',
        accounts: 'npm run smoke:accounts',
        payments: 'npm run smoke:phase3:payments',
        phase1: 'npm run smoke:phase1',
        web: 'npm run local:health:web',
      };
      const area = args.area || 'phase1';
      return { command: map[area] || map.phase1, cwd: resolveRepoRoot() };
    }

    case 'diary_append': {
      const dir = path.join(PACKAGE_ROOT, 'diary');
      fs.mkdirSync(dir, { recursive: true });
      const day = new Date().toISOString().slice(0, 10);
      const file = path.join(dir, `${day}.md`);
      const line = `- **${new Date().toISOString()}** [${args.tool || 'MCP'}] ${args.summary}\n`;
      fs.appendFileSync(file, line, 'utf8');
      return { file };
    }

    case 'swarm_plan': {
      const story = args.storyId
        ? (await handleTool('story_lookup', { storyId: args.storyId })).entries?.[0]
        : null;
      return {
        goal: args.goal,
        story,
        lanes: [
          { lane: 'A', agent: 'Cursor', scope: 'apps/web pages + ui' },
          { lane: 'B', agent: 'Cursor', scope: 'apps/web/app/api BFF' },
          { lane: 'C', agent: 'Antigravity', scope: 'services/*' },
        ],
        steps: ['coordination_claim', 'implement', 'smoke_hint', 'diary_append', 'coordination_release'],
      };
    }

    case 'ollama_prompt': {
      const model = args.model || process.env.THEJAD_OLLAMA_MODEL || 'llama3.2';
      try {
        const body = JSON.stringify({ model, prompt: args.prompt, stream: false });
        const res = await fetch('http://127.0.0.1:11434/api/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        });
        if (!res.ok) throw new Error(`ollama ${res.status}`);
        const j = await res.json();
        return { model, response: j.response || j };
      } catch (e) {
        return {
          mock: true,
          message: 'Ollama not reachable — install from https://ollama.com and run `ollama pull llama3.2`',
          echo: args.prompt.slice(0, 200),
          error: String(e.message || e),
        };
      }
    }

    case 'notebooklm_ask':
      return notebooklmAsk(args.question);

    case 'notebooklm_install':
      return notebooklmInstallHint();

    case 'notebooklm_add_sources':
      return notebooklmAddRepoSources();

    case 'team_list':
      return loadTeam();

    case 'team_consult':
      return consultRole(String(args.role || 'thejana').toLowerCase(), args.topic || 'general');

    case 'thejana_supreme_plan':
      return supremePlan(args.goal || 'feature delivery');

    case 'lahiru_ui_review': {
      const route = args.route || '/home';
      const planPath = path.join(PACKAGE_ROOT, 'plans', 'ui-ux-route-plan.md');
      const stories = await handleTool('story_lookup', { route });
      return {
        engineer: 'Lahiru',
        route,
        planFile: fs.existsSync(planPath) ? planPath : null,
        stories: stories.entries?.slice(0, 5),
        checklist: ['SCREEN_ROUTE_MAP', 'accessibility', 'mobile safe-area', 'WorkflowEntryGate vs middleware'],
      };
    }

    case 'sachini_story_draft':
      return draftStory(args.feature || 'New feature');

    case 'geesara_qa_plan':
      return qaPlan(args.storyId);

    case 'geesara_run_smokes': {
      const cmds = ['npm run local:health:json', 'npm run smoke:phase1', 'npm run smoke:accounts', 'npm run typecheck:web'];
      if (!isFullCapacity()) {
        return { mode: 'hint-only', commands: cmds, cwd: resolveRepoRoot() };
      }
      const results = [];
      for (const c of cmds) {
        try {
          const out = execSync(c, { cwd: resolveRepoRoot(), encoding: 'utf8', timeout: 180000 });
          results.push({ cmd: c, ok: true, tail: out.slice(-400) });
        } catch (e) {
          results.push({ cmd: c, ok: false, error: String(e.message || e).slice(0, 300) });
        }
      }
      return { engineer: 'Geesara', results };
    }

    case 'security_white_hat_scan':
      return securityScanRepo();

    case 'device_search':
      return deviceSearch(args.query);

    case 'device_usable_summary':
      return deviceUsableSummary();

    case 'device_usable_search':
      return deviceUsableSearch(args.category, args.query);

    case 'device_reindex': {
      const script = path.join(PACKAGE_ROOT, 'scripts', 'build-device-index.mjs');
      try {
        const out = execSync(`node "${script}"`, {
          encoding: 'utf8',
          timeout: 300000,
          cwd: path.join(PACKAGE_ROOT, '..'),
          env: { ...process.env, THEJAD_REPO_ROOT: resolveRepoRoot() },
        });
        return { ok: true, tail: out.slice(-800), ...deviceUsableSummary() };
      } catch (e) {
        return { ok: false, error: String(e.message || e).slice(0, 400), hint: deviceReindexHint() };
      }
    }

    case 'swarm_init':
      return swarmInit(args.topology);

    case 'swarm_status':
      return swarmStatus();

    case 'agent_spawn':
      return agentSpawn(args.type || 'coder', args.task || 'task');

    case 'worker_hints':
      return workerHints();

    case 'figma_context': {
      const route = args.route || '/home';
      const planPath = path.join(PACKAGE_ROOT, 'plans', 'ui-ux-route-plan.md');
      return {
        route,
        planFile: fs.existsSync(planPath) ? planPath : null,
        stitch: 'mock — provide Figma URL in requested.md R1',
      };
    }

    case 'full_stack_map': {
      const backend = readJson('plans/backend-api-plan.json');
      const route = args.route || '/payments';
      const story = await handleTool('story_lookup', { route });
      return { route, backend, stories: story.entries?.slice(0, 5) };
    }

    case 'antigravity_handoff':
      return {
        markdown: `### ${new Date().toISOString().slice(0, 10)} — Antigravity — handoff\n\n**Shipped:** ${args.shipped}\n**Files:** ${args.files || '—'}\n**Collision risk:** ${args.collisionRisk || 'Low'}\n`,
        pasteInto: 'docs/MULTI_AGENT_DEVELOPMENT_LOG.md',
      };

    case 'engineering_team_roster':
      return engineeringTeamRoster();

    case 'plugins_status':
      return getPluginsStatus();

    case 'plugins_install_hints':
      return installHints();

    case 'vendors_status':
      return getPluginsStatus();

    case 'vendor_sync_skills':
      return syncVendorSkills();

    case 'graphify_hint':
      return graphifyHint();

    default:
      return { error: `Unknown tool: ${name}` };
  }

  // append thanks to string results when returned as text - handled in server
}

export function formatToolResult(data) {
  const text = JSON.stringify(data, null, 2) + `\n\n---\n${THANKS}`;
  return { content: [{ type: 'text', text }] };
}
