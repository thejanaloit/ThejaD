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
} else {
  console.log(`ThejaD MCP — LOLC Internet Banking
Usage:
  npx thejad init          # add to .cursor/mcp.json in current project
  npx thejad mcp start     # run MCP server (stdio)
  npx thejad stats         # tool/prompt/resource counts

GitHub: https://github.com/thejanaloit/ThejaD
Thanks to Theja`);
}
