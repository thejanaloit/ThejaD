import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';
import { loadTeam } from './team.mjs';
import { listImportedSkillNames } from './skills-sync.mjs';

const ROLE_PROMPTS = [
  { name: 'thejana_supreme_delivery', role: 'thejana', desc: 'Supreme full-stack delivery plan' },
  { name: 'lahiru_fusionx_ui', role: 'lahiru', desc: 'FusionX UI / Stitch parity review' },
  { name: 'geesara_qa_regression', role: 'geesara', desc: 'QA regression pack for LOLCDL story' },
  { name: 'sachini_ba_story', role: 'sachini', desc: 'BA user story + AC draft' },
  { name: 'security_white_hat_review', role: 'security', desc: 'White-hat security review checklist' },
  { name: 'backend_nest_change', role: 'backend', desc: 'Backend service change plan' },
];

const WORKFLOW_PROMPTS = [
  { name: 'fusionx_ui_wave', desc: 'FusionX UI wave implementation from SCREEN_ROUTE_MAP' },
  { name: 'fusionx_architecture', desc: 'Full-stack architecture path (web BFF + Nest services + Kong)' },
  { name: 'fusionx_development', desc: 'Development way: implement → smoke → log' },
  { name: 'fusionx_qa_way', desc: 'QA way: Geesara smokes + regression pack' },
  { name: 'fusionx_ba_way', desc: 'BA way: LOLCDL story + traceability' },
  { name: 'fusionx_security_hardening', desc: 'Security hardening way (white-hat + dev flags)' },
  { name: 'phase1_only_guard', desc: 'Refuse P2-P5 scope creep; Phase 1 spine only' },
  { name: 'multi_agent_no_collision', desc: 'Cursor + Antigravity coordination paste block' },
  { name: 'multi_agent_speed', desc: 'Parallel lanes A/B/C with claims + smoke gates' },
  { name: 'bff_proxy_auth', desc: 'BFF JWT + dev fallback troubleshooting' },
  { name: 'security_hardening_dev', desc: 'Security hardening with local dev mocks' },
  { name: 'stakeholder_demo_slice', desc: 'Afternoon demo checklist paths' },
  { name: 'payment_transfer_flow', desc: 'CEFT/internal/own transfer implementation' },
  { name: 'registration_onboarding', desc: 'Register verify/otp/complete flow' },
  { name: 'admin_operator', desc: 'Admin console operator flows' },
  { name: 'antigravity_to_cursor_handoff', desc: 'Handoff log entry for MULTI_AGENT_DEVELOPMENT_LOG' },
  { name: 'cursor_parallel_5', desc: 'Five Cursor sessions lane matrix' },
  { name: 'helm_k8s_deploy', desc: 'Helm phase1-foundation deploy hints' },
  { name: 'kong_gateway_jwt', desc: 'Kong routes + JWT plugin alignment' },
  { name: 'local_full_stack', desc: 'docker + migrate + seed + local:services' },
  { name: 'thejad_first_run_setup', desc: 'Install → APIs/logins → thejad_setup_complete' },
  { name: 'thejad_orchestra_master', desc: 'Every user prompt → thejad_orchestrate (models + role + token prompt)' },
];

const RUFLO_STYLE = [
  'swarm_orchestrate', 'memory_learn', 'agent_spawn_mesh', 'neural_train', 'hooks_route',
  'worker_audit_run', 'ddd_scaffold', 'sparc_spec', 'sparc_architecture', 'sparc_refine',
  'tdd_london', 'code_review_swarm', 'cve_remediate', 'performance_profile',
].map((n) => ({ name: `ruflo_style_${n}`, desc: `Ruflo-class workflow: ${n}` }));

const VENDOR_PROMPTS = [
  { name: 'graphify_index_lolc', desc: 'Build Graphify knowledge graph for LOLC monorepo' },
  { name: 'graphify_query_architecture', desc: 'Query Graphify for auth/BFF/service flow' },
  { name: 'superpowers_brainstorm_feature', desc: 'Superpowers brainstorm before implementation' },
  { name: 'superpowers_tdd_story', desc: 'Superpowers TDD for LOLCDL story' },
  { name: 'claude_mem_handoff', desc: 'Persist session handoff via claude-mem' },
  { name: 'security_review_pr_lolc', desc: 'LOLC PR security review (anthropics action)' },
  { name: 'notebooklm_research_docs', desc: 'NotebookLM research on programme docs' },
  { name: 'frontend_design_screen', desc: 'Official frontend-design plugin for FusionX screen' },
  { name: 'code_review_lane', desc: 'Official code-review plugin before merge' },
];

function importedSkillPrompts() {
  return listImportedSkillNames().map((name) => ({
    name: `skill_${name.replace(/-/g, '_')}`,
    description: `Imported vendor skill: ${name} (LOLC adapted)`,
    arguments: [{ name: 'context', description: 'Route or story', required: false }],
  }));
}

export function listPrompts() {
  const team = loadTeam();
  const teamPrompts = Object.entries(team.roles).map(([id, r]) => ({
    name: `team_${id}_consult`,
    description: `Consult ${r.title} (${r.experienceYears}+ yrs) — ${r.focus.join(', ')}`,
    arguments: [
      { name: 'topic', description: 'What to plan or review', required: true },
    ],
  }));

  const staticPrompts = [...ROLE_PROMPTS, ...WORKFLOW_PROMPTS, ...RUFLO_STYLE, ...VENDOR_PROMPTS].map((p) => ({
    name: p.name,
    description: p.desc,
    arguments: [{ name: 'context', description: 'Feature, route, or story id', required: false }],
  }));

  return [...teamPrompts, ...staticPrompts, ...importedSkillPrompts()];
}

export function getPromptContent(name, args) {
  const topic = args?.topic || args?.context || 'internet banking feature';
  if (name.startsWith('team_')) {
    const role = name.replace('team_', '').replace('_consult', '');
    return { role, topic, paste: `Use MCP team_consult role=${role} topic="${topic}"` };
  }
  const guides = {
    fusionx_ui_wave: 'Read thejad/data/fusionx-ui-dev-guide.md + docs/ui-design/SCREEN_ROUTE_MAP.md',
    multi_agent_no_collision:
      'coordination_claim → implement → docs/MULTI_AGENT_DEVELOPMENT_LOG.md append → coordination_release',
    security_hardening_dev: 'docs/security/SECURITY_FIXED.md + ALLOW_DEV_* flags in .env',
    graphify_index_lolc: 'pip install graphifyy && graphify . from repo root (see graphify_hint tool)',
    graphify_query_architecture: 'Query graphify-out for route → BFF → service → DB',
    superpowers_brainstorm_feature: 'vendor/superpowers/skills/brainstorming — Phase 1 scope only',
    security_review_pr_lolc: 'thejad/data/lolc-security-scan-instructions.txt + .github/workflows/lolc-security-review.yml',
    thejad_first_run_setup: `1) npx thejad init (or node thejad/bin/thejad.js init)
2) MCP tool thejad_setup_status — show user missing APIs/logins
3) User sets env vars (OPENAI_API_KEY, FIGMA_ACCESS_TOKEN, …) and Ollama; notebooklm login if needed
4) thejad_setup_complete with acknowledge:[...] markComplete:true
5) Reload Cursor MCP`,
    thejad_orchestra_master: `On EVERY user task:
1) thejad_setup_status (if not ready → stop and complete setup)
2) thejad_orchestrate prompt="<verbatim user request>"
3) Execute optimizedPrompt using assignment.agent + skills (load SKILL.md paths only)
4) Follow workflow steps; use primaryModel online, secondary offline for drafts
5) coordination_claim → work → smoke_hint → diary_append → coordination_release`,
  };
  return { name, topic, guide: guides[name] || `Execute workflow: ${name} for ${topic}` };
}
