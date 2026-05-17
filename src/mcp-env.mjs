import fs from 'fs';
import path from 'path';

/** Load ThejaD env from project .cursor/mcp.json (hooks do not inherit MCP env). */
export function loadMcpEnv(repoRoot) {
  const root = repoRoot || process.cwd();
  const mcpPath = path.join(root, '.cursor', 'mcp.json');
  if (!fs.existsSync(mcpPath)) return { loaded: false };
  try {
    const j = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    const env = j.mcpServers?.ThejaD?.env || {};
    let count = 0;
    for (const [k, v] of Object.entries(env)) {
      if (v == null || v === '') continue;
      if (!process.env[k]) {
        process.env[k] = String(v);
        count += 1;
      }
    }
    return { loaded: true, keys: count, path: mcpPath };
  } catch {
    return { loaded: false };
  }
}
