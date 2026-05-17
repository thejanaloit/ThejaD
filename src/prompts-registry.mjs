import { loadTeam } from './team.mjs';

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
];

const RUFLO_STYLE = [
  'swarm_orchestrate', 'memory_learn', 'agent_spawn_mesh', 'neural_train', 'hooks_route',
  'worker_audit_run', 'ddd_scaffold', 'sparc_spec', 'sparc_architecture', 'sparc_refine',
  'tdd_london', 'code_review_swarm', 'cve_remediate', 'performance_profile',
].map((n) => ({ name: `ruflo_style_${n}`, desc: `Ruflo-class workflow: ${n}` }));

export function listPrompts() {
  const team = loadTeam();
  const teamPrompts = Object.entries(team.roles).map(([id, r]) => ({
    name: `team_${id}_consult`,
    description: `Consult ${r.title} (${r.experienceYears}+ yrs) — ${r.focus.join(', ')}`,
    arguments: [
      { name: 'topic', description: 'What to plan or review', required: true },
    ],
  }));

  const staticPrompts = [...ROLE_PROMPTS, ...WORKFLOW_PROMPTS, ...RUFLO_STYLE].map((p) => ({
    name: p.name,
    description: p.desc,
    arguments: [{ name: 'context', description: 'Feature, route, or story id', required: false }],
  }));

  return [...teamPrompts, ...staticPrompts];
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
  };
  return { name, topic, guide: guides[name] || `Execute workflow: ${name} for ${topic}` };
}
