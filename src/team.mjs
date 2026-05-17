import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT, resolveRepoRoot } from './paths.mjs';

export function loadTeam() {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'data', 'team.json'), 'utf8'));
}

export function consultRole(roleId, topic) {
  const team = loadTeam();
  const role = team.roles[roleId];
  if (!role) return { error: `Unknown role. Use: ${Object.keys(team.roles).join(', ')}` };
  const repo = resolveRepoRoot();
  const plugins = role.plugins || [];
  const guidance = {
    thejana: `Supreme plan for: ${topic}. Claim lanes ${role.lanes.join(',')}. Merge via coordination. Run smokes before handoff.`,
    lahiru: `UI review: ${topic}. Check apps/web + docs/ui-design/SCREEN_ROUTE_MAP.md. Figma stub until R1 in requested.md.`,
    backend: `Backend: ${topic}. services/* + kong/ + database/migrations. BFF at apps/web/app/api.`,
    geesara: `QA: ${topic}. Run npm run smoke:phase1, smoke:accounts, smoke:phase3:payments, local:health:web.`,
    sachini: `BA: ${topic}. Map to LOLCDL in data/stories-traceability.json. Draft AC: happy path, errors, security.`,
    security: `White hat: ${topic}. Read docs/security/SECURITY_WHITE_HAT.md + SECURITY_FIXED.md. Dev flags in .env only.`,
  };
  return {
    role: roleId,
    title: role.title,
    experienceYears: role.experienceYears,
    focus: role.focus,
    guidance: guidance[roleId],
    plugins,
    repoRoot: repo,
    recommendedTools: role.tools,
  };
}

export function draftStory(feature) {
  return {
    template: 'LOLCDL-XXX',
    title: feature,
    sections: {
      description: feature,
      acceptanceCriteria: [
        'Given authenticated customer, when action completes, then success state shown',
        'Given invalid input, when submit, then validation message (no stack trace)',
        'Given session expired, when API called, then redirect /auth',
      ],
      routes: 'TBD — use story_lookup after id assigned',
      apis: 'TBD — use full_stack_map',
      qa: 'geesara_qa_plan after story id',
    },
    analyst: 'Sachini',
  };
}

export function qaPlan(storyId) {
  return {
    storyId: storyId || 'general',
    checks: [
      'npm run local:health:json',
      'npm run smoke:phase1',
      'npm run smoke:accounts',
      'npm run typecheck:web',
      'Manual: login dev.customer@local.test → target route',
      'BFF: Network tab 401/403 → check ALLOW_DEV_* in .env',
    ],
    engineer: 'Geesara',
  };
}

export function supremePlan(goal) {
  const team = loadTeam();
  const phases =
    team.deliveryWorkflow?.map((w) => ({
      step: w.order,
      who: w.who,
      action: w.action,
      plugins: w.plugins,
    })) || [];
  return {
    owner: 'Thejana — Supreme Developer & Engineering Lead',
    goal,
    engineers: ['thejana', 'lahiru', 'geesara', 'sachini'],
    phases,
    pluginBundle: 'plugins_install_hints',
  };
}
