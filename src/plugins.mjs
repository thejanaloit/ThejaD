import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';
import { loadTeam } from './team.mjs';

export function getPluginsManifest() {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'data', 'engineering-plugins.json'), 'utf8'));
}

export function getPluginsStatus() {
  const manifest = getPluginsManifest();
  const repos = (manifest.repos || []).map((r) => {
    const p = path.join(PACKAGE_ROOT, r.vendorPath);
    return {
      id: r.id,
      installed: fs.existsSync(p),
      path: p,
      lolcUse: r.lolcUse,
    };
  });
  return {
    claudeCode: manifest.claudeCode,
    repos,
    allReposPresent: repos.every((r) => r.installed),
    teamBindings: manifest.teamBindings,
  };
}

export function installHints() {
  const m = getPluginsManifest();
  return {
    step1: 'Run: thejad/install/install-engineering-plugins.ps1 (clones vendor repos)',
    claudeCodeMarketplace: m.claudeCode?.marketplace?.add,
    claudeCodeInstall: [
      ...(m.claudeCode?.marketplace?.install || []),
      ...(m.claudeCode?.official || []),
    ],
    cursor: 'Skills synced to .cursor/skills/thejad-* via install script',
    securityWorkflow: '.github/workflows/lolc-security-review.yml (needs CLAUDE_API_KEY secret)',
    claudeMem: 'vendor/claude-mem — follow vendor/README for Cursor hooks',
    thanks: m.thanks,
  };
}

export function engineeringTeamRoster() {
  const team = loadTeam();
  const bindings = getPluginsManifest().teamBindings || {};
  return {
    collectiveExperienceYears: team.collectiveExperienceYears,
    engineers: Object.entries(team.roles).map(([id, r]) => ({
      id,
      title: r.title,
      lanes: r.lanes,
      focus: r.focus,
      tools: r.tools,
      plugins: bindings[id] || [],
    })),
    workflow: team.deliveryWorkflow || null,
    thanks: team.thanks,
  };
}
