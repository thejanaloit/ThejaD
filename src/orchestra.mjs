import { loadTeam } from './team.mjs';
import { listImportedSkillNames } from './skills-sync.mjs';
import { getSetupStatus } from './setup.mjs';
import { startAllModels, pickModelForAssignment } from './models.mjs';
import { regeneratePrompt } from './prompt-optimize.mjs';
import { recordOrchestration } from './session.mjs';
import { consultRole } from './team.mjs';
import { getFigmaContext } from './figma.mjs';
import { notebooklmAsk } from './notebooklm.mjs';
import {
  mergeRoleVotes,
  ollamaDraftSummary,
  ollamaOrchestraPass,
  openaiOrchestraPass,
} from './ollama-infer.mjs';

const ROLE_KEYWORDS = {
  lahiru: ['ui', 'ux', 'figma', 'screen', 'css', 'tailwind', 'component', 'accessibility', 'fusionx', 'stitch', 'route map'],
  geesara: ['test', 'qa', 'smoke', 'regression', 'e2e', 'typecheck', 'bug', 'verify'],
  sachini: ['story', 'acceptance', 'ba', 'lolcdl', 'requirement', 'traceability', 'criteria', 'user story'],
  security: ['security', 'jwt', 'owasp', 'xss', 'csrf', 'white hat', 'vulnerability', 'authz', 'pen test'],
  backend: ['nestjs', 'kong', 'migration', 'service', 'api', 'bff', 'mysql', 'prisma', 'microservice'],
  thejana: ['architecture', 'orchestr', 'merge', 'full stack', 'mcp', 'swarm', 'coordination', 'plan'],
};

const AGENT_BY_ROLE = {
  thejana: 'sparc-coord',
  lahiru: 'coder',
  geesara: 'tester',
  sachini: 'specification',
  security: 'security-auditor',
  backend: 'backend-dev',
};

function scoreRole(text, roleId, words) {
  const keys = ROLE_KEYWORDS[roleId] || [];
  let score = 0;
  for (const k of keys) {
    if (words.includes(k.replace(/\s+/g, ' '))) score += 2;
    if (text.includes(k)) score += 1;
  }
  return score;
}

function routeRole(userPrompt) {
  const text = String(userPrompt || '').toLowerCase();
  const words = text.split(/\W+/).filter(Boolean);
  const team = loadTeam();
  const scores = Object.keys(team.roles).map((roleId) => ({
    roleId,
    score: scoreRole(text, roleId, words),
  }));
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0]?.score > 0 ? scores[0].roleId : 'thejana';
  return { roleId: best, scores: scores.filter((s) => s.score > 0).slice(0, 3) };
}

function pickSkills(roleId, userPrompt) {
  const team = loadTeam();
  const role = team.roles[roleId];
  const imported = listImportedSkillNames();
  const text = String(userPrompt || '').toLowerCase();
  const pluginHints = (role?.plugins || []).map((p) => p.toLowerCase());

  const matched = imported.filter((name) => {
    const n = name.toLowerCase();
    return pluginHints.some((h) => n.includes(h)) || text.split(/\W+/).some((w) => w.length > 4 && n.includes(w));
  });

  return matched.slice(0, 5);
}

function workflowForRole(roleId) {
  const team = loadTeam();
  const all = team.deliveryWorkflow || [];
  const roleNameMap = {
    thejana: 'Thejana',
    lahiru: 'Lahiru',
    geesara: 'Geesara',
    sachini: 'Sachini',
    security: 'Security',
    backend: 'Backend',
  };
  const who = roleNameMap[roleId];
  const primary = all.filter((w) => w.who === who);
  if (primary.length) return primary;
  return all;
}

function outputShape(roleId) {
  const shapes = {
    lahiru: 'UI diff + SCREEN_ROUTE_MAP note + a11y checklist',
    geesara: 'Test plan + smoke commands + pass/fail table',
    sachini: 'LOLCDL story draft + AC bullets + route binding',
    security: 'Threat list + dev-flag check + PR security-review trigger',
    backend: 'Service change plan + Kong route + migration note',
    thejana: 'Supreme plan + lane claims + merge order',
  };
  return shapes[roleId] || shapes.thejana;
}

/**
 * Full orchestra pipeline: setup gate → models → route → optimize prompt → workflow.
 */
export async function runOrchestra(userPrompt, options = {}) {
  const setup = await getSetupStatus();
  if (!setup.ready && !options.skipSetupCheck) {
    return {
      phase: 'setup_required',
      setup,
      nextStep: 'Call thejad_setup_status, provide APIs/logins, then thejad_setup_complete.',
    };
  }

  const modelsStarted = await startAllModels({
    warm: options.warmModels !== false,
    maxWarmOllama: options.maxWarmOllama ?? 2,
  });

  const keywordRoute = routeRole(userPrompt);
  let roleId = keywordRoute.roleId;

  const skipOllama = options.skipOllama || process.env.THEJAD_ORCHESTRA_SKIP_OLLAMA === '1';
  const [ollamaPass, openaiPass] = await Promise.all([
    skipOllama
      ? { source: 'ollama', skipped: true, role: keywordRoute.roleId }
      : ollamaOrchestraPass(userPrompt, keywordRoute.roleId),
    openaiOrchestraPass(userPrompt, keywordRoute.roleId),
  ]);
  const merged = mergeRoleVotes(keywordRoute.roleId, keywordRoute.scores, ollamaPass, openaiPass);
  roleId = merged.roleId;
  const scores = keywordRoute.scores;

  const team = loadTeam();
  const role = team.roles[roleId];
  const skills = pickSkills(roleId, userPrompt);
  const workflowSteps = workflowForRole(roleId);
  const consult = consultRole(roleId, userPrompt.slice(0, 200));

  const preferOffline = ['sachini', 'geesara'].includes(roleId) && modelsStarted.offline.count > 0;
  const assignment = {
    roleId,
    role,
    roleScores: scores,
    agent: AGENT_BY_ROLE[roleId] || 'generalPurpose',
    skills,
    plugins: role.plugins,
    recommendedTools: role.tools,
    workflowSteps,
    outputShape: outputShape(roleId),
    preferOffline,
    consultSummary: consult.guidance,
  };

  const models = pickModelForAssignment(assignment, modelsStarted);
  const promptPack = regeneratePrompt(userPrompt, assignment);

  const multiModel = {
    keywordRole: keywordRoute.roleId,
    merged,
    ollamaPass,
    openaiPass,
  };

  let ollamaDraft = null;
  if (modelsStarted.offline.count > 0 && ['sachini', 'geesara', 'lahiru'].includes(roleId)) {
    ollamaDraft = await ollamaDraftSummary(userPrompt, roleId);
  }

  let integrationContext = null;
  if (roleId === 'lahiru') {
    integrationContext = { figma: await getFigmaContext(extractRoute(userPrompt)) };
  }
  if (roleId === 'sachini' || /doc|research|programme|spec/i.test(userPrompt)) {
    integrationContext = {
      ...(integrationContext || {}),
      notebooklm: await notebooklmAsk(userPrompt.slice(0, 500)),
    };
  }

  const result = {
    phase: 'orchestrated',
    orchestraVersion: '2.0',
    multiModel,
    ollamaDraft,
    onlineDraft: openaiPass?.plan ? { plan: openaiPass.plan, source: 'openai' } : { plan: ollamaPass?.plan, source: 'ollama' },
    integrationContext,
    modelsStarted: {
      total: modelsStarted.total,
      offline: modelsStarted.offline.count,
      online: modelsStarted.online.count,
    },
    assignment: {
      roleId,
      title: role.title,
      agent: assignment.agent,
      primaryModel: models.primary,
      secondaryModel: models.secondary,
      skills,
      plugins: assignment.plugins,
      recommendedTools: assignment.recommendedTools,
    },
    optimizedPrompt: promptPack.optimized,
    promptMeta: promptPack,
    workflow: workflowSteps,
    hostInstructions: [
      '1. Load listed skills by path (do not paste full vendor docs).',
      '2. Run coordination_claim if touching shared paths.',
      `3. Primary: ${models.primary.type} (${models.primary.id}); drafts on secondary if offline available.`,
      '4. Follow workflow steps in order; scope_guard if cross-phase.',
      '5. diary_append + coordination_release when done.',
    ],
    deliveryWorkflowFull: team.deliveryWorkflow,
  };

  recordOrchestration({
    roleId,
    tokensSaved: promptPack.tokens.savedEstimate,
  });

  return result;
}

function extractRoute(text) {
  const m = String(text).match(/\/[a-z0-9/-]+/i);
  return m ? m[0] : '/home';
}
