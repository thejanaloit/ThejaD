#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bootstrapEnv } from '../src/env-bootstrap.mjs';
import { startMcpServer } from '../src/server.mjs';
import { getSetupStatus, registerSetup } from '../src/setup.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.join(__dirname, '..');

const [, , cmd, sub] = process.argv;

async function init() {
  const target = process.cwd();
  const cursorDir = path.join(target, '.cursor');
  fs.mkdirSync(cursorDir, { recursive: true });
  const mcpPath = path.join(cursorDir, 'mcp.json');
  let existing = { mcpServers: {} };
  if (fs.existsSync(mcpPath)) {
    existing = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  }
  existing.mcpServers = existing.mcpServers || {};
  existing.mcpServers.ThejaD = {
    command: 'node',
    args: [path.join(PACKAGE_ROOT, 'bin', 'thejad.js'), 'mcp', 'start'],
    env: {
      THEJAD_REPO_ROOT: target,
      npm_config_update_notifier: 'false',
      HYPERSPACE_GATEWAY_URL: 'http://127.0.0.1:8080/v1',
      HYPERSPACE_POD_API_KEY: '',
      THEJAD_POD_PEERS: '',
      THEJAD_POD_SYNC_PORT: '19090',
      THEJAD_FULL_ACCESS: '1',
      THEJAD_AUTO_POD: '1',
    },
  };
  fs.writeFileSync(mcpPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  fs.mkdirSync(path.join(target, '.thejad'), { recursive: true });

  const rulesDir = path.join(cursorDir, 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });
  const ruleSrc = path.join(PACKAGE_ROOT, 'templates', 'thejad-orchestra.mdc');
  const ruleDst = path.join(rulesDir, 'thejad-orchestra.mdc');
  if (fs.existsSync(ruleSrc)) {
    fs.copyFileSync(ruleSrc, ruleDst);
    console.log('[ThejaD] Installed .cursor/rules/thejad-orchestra.mdc (always orchestrate)');
  }

  const hooksSrc = path.join(PACKAGE_ROOT, 'templates', 'hooks.json');
  const hooksDst = path.join(cursorDir, 'hooks.json');
  if (fs.existsSync(hooksSrc)) {
    let hooks = { version: 1, hooks: {} };
    if (fs.existsSync(hooksDst)) {
      try {
        hooks = JSON.parse(fs.readFileSync(hooksDst, 'utf8'));
      } catch {
        /* merge fresh */
      }
    }
    const tpl = JSON.parse(fs.readFileSync(hooksSrc, 'utf8'));
    hooks.hooks = { ...hooks.hooks, ...tpl.hooks };
    fs.writeFileSync(hooksDst, JSON.stringify(hooks, null, 2) + '\n', 'utf8');
    console.log('[ThejaD] Installed .cursor/hooks.json (auto-orchestra on every prompt)');
  }

  process.env.THEJAD_REPO_ROOT = target;
  bootstrapEnv();
  const setup = await getSetupStatus();
  if (setup.requiredOk && !setup.setupCompleteFlag) {
    await registerSetup({ markComplete: true });
    console.log('[ThejaD] Auto-marked setup complete (required checks passed)');
  }

  console.log('[ThejaD] Added MCP server "ThejaD" to .cursor/mcp.json');
  console.log('[ThejaD] Restart Cursor in Agent mode.');
  console.log('[ThejaD] First run: MCP tools thejad_setup_status → user logins → thejad_setup_complete');
  console.log('[ThejaD] Every prompt: auto-orchestrated via Cursor hook (or thejad_orchestrate)');
  console.log('[ThejaD] Unlock max: mamaThejana — stays until: nothejad unlock');
  console.log('[ThejaD] Team pod: MCP thejad_pod_init → node thejad/bin/thejad.js pod serve on each LAN device');
  console.log('Thanks to Theja');
}

if (cmd === 'mcp' && sub === 'start') {
  bootstrapEnv();
  await startMcpServer();
} else if (cmd === 'init') {
  await init();
} else if (cmd === 'stats') {
  bootstrapEnv();
  const { getServerStats } = await import('../src/server.mjs');
  console.log(JSON.stringify(getServerStats(), null, 2));
} else if (cmd === 'pod' && sub === 'serve') {
  bootstrapEnv();
  await import('../scripts/pod-sync-server.mjs');
} else if (cmd === 'pod' && sub === 'bootstrap') {
  bootstrapEnv();
  const { runPodBootstrap } = await import('../src/pod-bootstrap.mjs');
  const r = await runPodBootstrap();
  console.log(JSON.stringify(r, null, 2));
} else if (cmd === 'finalize') {
  bootstrapEnv();
  const { runFinalize } = await import('../src/finalize.mjs');
  const r = await runFinalize();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.programme100 ? 0 : 1);
} else {
  console.log(`ThejaD MCP — LOLC Internet Banking
Usage:
  npx thejad init          # add to .cursor/mcp.json in current project
  npx thejad mcp start     # run MCP server (stdio)
  npx thejad stats         # tool/prompt/resource counts
  npx thejad finalize      # 100% readiness gate (exit 0 when programme ready)
  npx thejad pod serve     # LAN shared-memory sync server (after thejad_pod_init)
  npx thejad pod bootstrap # zero-touch: init + LAN discover + memory sync

GitHub: https://github.com/thejanaloit/ThejaD
Thanks to Theja`);
}
