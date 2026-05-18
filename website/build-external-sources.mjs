/** Build full attribution list from vendor-repos.json + known externals */
import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from '../src/paths.mjs';

export function buildExternalSources() {
  const vendorPath = path.join(PACKAGE_ROOT, 'data', 'vendor-repos.json');
  const vendor = JSON.parse(fs.readFileSync(vendorPath, 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));

  const groups = [];

  groups.push({
    id: 'thejad',
    title: 'ThejaD (primary repository)',
    items: [
      {
        name: 'ThejaD MCP',
        url: vendor.repository || 'https://github.com/thejanaloit/ThejaD.git',
        type: 'github',
        use: 'This MCP server — mesh, orchestra, 1428 tools, team roles, coordination',
      },
    ],
  });

  groups.push({
    id: 'github-vendors',
    title: 'GitHub vendor repositories (thejad/vendor/)',
    items: (vendor.repos || []).map((r) => ({
      name: r.displayName || r.id,
      url: r.url,
      type: 'github',
      branch: r.branch || null,
      npm: r.npm || null,
      vendorPath: r.vendorPath || null,
      use: r.lolcUse || '',
    })),
  });

  const claudeItems = [];
  if (vendor.claudeCode?.marketplace?.add) {
    claudeItems.push({
      name: 'Superpowers marketplace (Claude Code)',
      url: 'https://github.com/obra/superpowers-marketplace',
      type: 'claude-plugin',
      install: vendor.claudeCode.marketplace.add,
      use: 'Marketplace add command for Superpowers plugins',
    });
  }
  for (const cmd of vendor.claudeCode?.marketplace?.install || []) {
    claudeItems.push({
      name: cmd.replace(/^\/plugin install /, ''),
      type: 'claude-plugin',
      install: cmd,
      use: 'Claude Code plugin from superpowers marketplace',
    });
  }
  for (const p of vendor.claudeOfficialPlugins || []) {
    claudeItems.push({
      name: p.displayName || p.id,
      type: 'claude-plugin',
      install: p.install,
      use: p.lolcUse || '',
    });
  }
  if (claudeItems.length) {
    groups.push({
      id: 'claude-plugins',
      title: 'Anthropic Claude Code plugins (official + marketplace)',
      items: claudeItems,
    });
  }

  const pythonItems = (vendor.pythonTools || []).map((p) => ({
    name: p.displayName || p.id,
    url: p.url || null,
    type: 'python',
    install: p.install,
    cli: p.cli || null,
    use: p.lolcUse || '',
  }));
  if (pythonItems.length) {
    groups.push({ id: 'python', title: 'Python packages & CLIs', items: pythonItems });
  }

  groups.push({
    id: 'services',
    title: 'External services & distributed inference',
    items: [
      ...(vendor.offlineModels || []).map((m) => ({
        name: m.displayName || m.id,
        url: m.install?.startsWith('http') ? m.install : 'https://ollama.com',
        type: 'service',
        install: m.install,
        use: m.lolcUse || '',
      })),
      {
        name: 'Hyperspace Pods',
        url: 'https://pods.hyper.space/',
        type: 'service',
        install: 'curl -fsSL https://agents.hyper.space/cli | bash',
        use: 'Distributed pod mesh — gateway /v1, hyperspace_gateway_infer',
      },
      {
        name: 'Google NotebookLM',
        url: 'https://notebooklm.google.com/',
        type: 'service',
        install: 'pip install notebooklm-py && notebooklm login',
        use: 'Research / BA context via notebooklm_ask (OAuth)',
      },
    ],
  });

  groups.push({
    id: 'mcp-peers',
    title: 'Parallel MCP servers (multi-MCP workspace)',
    items: (vendor.multiMcp || []).map((m) => ({
      name: m.name,
      type: 'mcp',
      mcpKey: m.mcpKey || null,
      use: m.role || '',
    })),
  });

  groups.push({
    id: 'ides',
    title: 'IDEs & agent hosts',
    items: [
      {
        name: 'Cursor',
        url: 'https://cursor.com',
        type: 'platform',
        use: 'Primary host — MCP stdio, beforeSubmitPrompt / sessionStart hooks',
      },
      {
        name: 'Claude Code',
        url: 'https://docs.anthropic.com/en/docs/claude-code',
        type: 'platform',
        use: 'Terminal agent + plugin marketplace',
      },
      {
        name: 'Antigravity',
        type: 'platform',
        use: 'Cross-tool agent handoff — antigravity_handoff MCP tool',
      },
      {
        name: 'GitHub Copilot',
        url: 'https://github.com/features/copilot',
        type: 'platform',
        use: 'Multi-agent coordination via coordination_claim',
      },
    ],
  });

  groups.push({
    id: 'optional-mcp',
    title: 'Optional MCP integrations (when configured in .cursor/mcp.json)',
    items: [
      {
        name: 'Figma MCP',
        url: 'https://www.figma.com/developers/api',
        type: 'mcp',
        use: 'figma_context — design ↔ code',
      },
      {
        name: 'Atlassian MCP (Jira / Confluence)',
        url: 'https://www.atlassian.com',
        type: 'mcp',
        use: 'Programme tracking — optional in multi-MCP setup',
      },
    ],
  });

  groups.push({
    id: 'npm',
    title: 'npm runtime dependencies',
    items: Object.entries(pkg.dependencies || {}).map(([name, ver]) => ({
      name: `${name}@${ver}`,
      url:
        name === '@modelcontextprotocol/sdk'
          ? 'https://github.com/modelcontextprotocol/typescript-sdk'
          : 'https://www.npmjs.com/package/' + encodeURIComponent(name),
      type: 'npm',
      use: name === '@modelcontextprotocol/sdk' ? 'Model Context Protocol server SDK' : 'Runtime dependency',
    })),
  });

  groups.push({
    id: 'protocols',
    title: 'Protocols & specifications',
    items: [
      {
        name: 'Model Context Protocol (MCP)',
        url: 'https://modelcontextprotocol.io/',
        type: 'spec',
        use: 'JSON-RPC tools / prompts / resources — ThejaD transport',
      },
      {
        name: 'OpenAI-compatible API',
        url: 'https://platform.openai.com/docs/api-reference',
        type: 'spec',
        use: 'Hyperspace gateway /v1, optional OpenAI orchestra pass',
      },
    ],
  });

  groups.push({
    id: 'host-repo',
    title: 'Typical host monorepo (when embedded)',
    items: [
      {
        name: 'LOLC Internet Banking / FusionX programme',
        type: 'host',
        use: 'Default THEJAD_REPO_ROOT — Phase 1 spine, docs, services (not bundled inside ThejaD npm package)',
      },
    ],
  });

  let totalCount = 0;
  for (const g of groups) totalCount += g.items.length;

  return {
    thanks: vendor.thanks || 'Thanks to Theja',
    generatedFrom: 'thejad/data/vendor-repos.json + package.json',
    groups,
    totalCount,
  };
}
