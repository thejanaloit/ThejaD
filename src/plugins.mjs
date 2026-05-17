import fs from 'fs';
import path from 'path';
import { brandPlugins, displayName, listBrandedIntegrations } from './brands.mjs';
import { PACKAGE_ROOT } from './paths.mjs';
import { loadTeam } from './team.mjs';

function loadVendorRepos() {
  const p = path.join(PACKAGE_ROOT, 'data', 'vendor-repos.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'data', 'engineering-plugins.json'), 'utf8'));
}

export function getPluginsManifest() {
  const v = loadVendorRepos();
  const e = fs.existsSync(path.join(PACKAGE_ROOT, 'data', 'engineering-plugins.json'))
    ? JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'data', 'engineering-plugins.json'), 'utf8'))
    : {};
  return { ...v, teamBindings: e.teamBindings || v.teamBindings, claudeCode: e.claudeCode || v.claudeCode };
}

export function getPluginsStatus() {
  const manifest = getPluginsManifest();
  const repos = (manifest.repos || []).map((r) => {
    const p = r.vendorPath ? path.join(PACKAGE_ROOT, r.vendorPath) : null;
    return {
      id: r.id,
      name: r.displayName || displayName(r.id),
      installed: p ? fs.existsSync(p) : Boolean(r.npm),
      path: p,
      npm: r.npm || null,
      lolcUse: r.lolcUse,
      branch: r.branch || 'main',
    };
  });
  const skillsManifest = path.join(PACKAGE_ROOT, 'data', 'imported-skills.json');
  let importedSkills = 0;
  if (fs.existsSync(skillsManifest)) {
    importedSkills = JSON.parse(fs.readFileSync(skillsManifest, 'utf8')).count || 0;
  }
  return {
    claudeCode: manifest.claudeCode,
    claudeOfficialPlugins: manifest.claudeOfficialPlugins,
    pythonTools: manifest.pythonTools,
    repos,
    allReposPresent: repos.every((r) => r.installed),
    importedSkills,
    teamBindings: manifest.teamBindings,
  };
}

export function installHints() {
  const m = getPluginsManifest();
  return {
    step1: 'Run: npm run engineering:install -w thejad-mcp OR powershell thejad/install/install-engineering-plugins.ps1',
    step2: 'Python: pip install graphifyy (then graphify install; graphify . in repo root)',
    step3: 'Claude Code plugins (in Claude Code terminal):',
    claudeCodeMarketplace: m.claudeCode?.marketplace?.add,
    claudeCodeInstall: [
      ...(m.claudeCode?.marketplace?.install || []),
      ...(m.claudeCode?.official || []),
      ...(m.claudeOfficialPlugins || []),
    ],
    brandedCapabilities: listBrandedIntegrations().map((i) => i.name),
    cursor: 'Skills → .cursor/skills/imported-* + team-*',
    graphify: 'Index LOLC monorepo: graphify . → graphify-out/',
    securityWorkflow: '.github/workflows/lolc-security-review.yml (CLAUDE_API_KEY)',
    offlineModels: m.offlineModels,
    multiMcp: m.multiMcp,
    ruflo: 'npm install / npx ruflo@latest — parallel MCP in monorepo .cursor/mcp.json',
    thanks: m.thanks || 'Thanks to Theja',
  };
}

export function graphifyHint() {
  return {
    install: ['pip install graphifyy', 'graphify install'],
    indexLolc: ['cd internetBanking', 'graphify .'],
    outputs: 'graphify-out/ — query instead of grep across apps/web services database',
    cursorSkill: 'thejad/skills/imported/graphify-skill',
    vendor: 'vendor/graphify',
    phase1Paths: ['apps/web', 'services/auth-service', 'services/onboarding-service', 'database/migrations'],
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
      plugins: brandPlugins([...new Set([...(r.plugins || []), ...(bindings[id] || [])])]),
    })),
    brandedIntegrations: listBrandedIntegrations(),
    workflow: team.deliveryWorkflow || null,
    thanks: team.thanks,
  };
}
