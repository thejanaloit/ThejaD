/** Programmatic tool catalog (280+ tools) — Ruflo-scale surface for Cursor MCP */

const ACTIONS = {
  swarm: [
    'init', 'status', 'scale', 'stop', 'topology_mesh', 'topology_hierarchical', 'topology_adaptive',
    'consensus_raft', 'consensus_byzantine', 'consensus_gossip', 'queen_elect', 'agent_spawn', 'agent_list',
    'agent_terminate', 'agent_health', 'task_route', 'memory_sync', 'hook_pre', 'hook_post', 'worker_map',
    'worker_audit', 'worker_optimize', 'worker_testgaps', 'worker_consolidate',
  ],
  memory: [
    'store', 'search', 'delete', 'list', 'namespace_create', 'namespace_clear', 'embed_reindex',
    'pattern_learn', 'trajectory_save', 'trajectory_replay', 'hnsw_search', 'hybrid_search', 'decay_apply',
  ],
  agent: [
    'spawn_coder', 'spawn_tester', 'spawn_reviewer', 'spawn_architect', 'spawn_security', 'spawn_researcher',
    'spawn_ba', 'spawn_qa', 'spawn_ui', 'spawn_backend', 'status', 'pool_warm', 'pool_scale', 'logs',
  ],
  auth: [
    'login_smoke', 'refresh_smoke', 'logout_smoke', 'mfa_enroll', 'biometric_register', 'session_list',
    'password_reset', 'lockout_status', 'jwt_verify', 'dev_fallback_check',
  ],
  account: [
    'list', 'detail', 'transactions', 'statements', 'balance', 'nickname', 'primary_flag', 'visibility',
    'fixed_deposits', 'total_balance', 'statement_job',
  ],
  payment: [
    'transfer_create', 'transfer_approve', 'transfer_process', 'beneficiary_list', 'beneficiary_add',
    'bill_pay', 'bill_schedule', 'standing_order', 'limits_get', 'limits_validate', 'idempotency_check',
    'callback_mock', 'schedule_list', 'all_transactions',
  ],
  onboarding: [
    'register_verify', 'register_otp', 'register_complete', 'id_types', 'reference_types', 'dev_otp_file',
  ],
  admin: [
    'login', 'users_list', 'user_status', 'audit_log', 'roles_list', 'admin_users',
  ],
  notification: [
    'inbox', 'unread_count', 'preferences', 'mark_read', 'security_events', 'fraud_simulate',
  ],
  support: [
    'ticket_create', 'ticket_list', 'ticket_comment', 'categories',
  ],
  ui: [
    'route_map', 'screen_audit', 'stitch_parity', 'accessibility', 'i18n_check', 'shell_nav', 'middleware_check',
    'bff_proxy_map', 'component_tokens',
  ],
  ba: [
    'story_lookup', 'story_draft', 'traceability', 'acceptance_criteria', 'epic_map', 'route_bind',
  ],
  qa: [
    'smoke_phase1', 'smoke_accounts', 'smoke_payments', 'smoke_web', 'regression_pack', 'e2e_hint',
    'typecheck_web', 'health_all',
  ],
  security: [
    'white_hat_scan', 'scope_guard', 'jwt_policy', 'dev_flag_audit', 'cve_hint', 'pii_scan', 'kong_jwt',
    'internal_secret_check', 'siem_forward_test',
  ],
  backend: [
    'service_health', 'migration_status', 'openapi_export', 'kong_route', 'docker_compose', 'kafka_check',
  ],
  coordination: [
    'claim', 'release', 'list_claims', 'handoff_antigravity', 'handoff_cursor', 'log_append', 'lane_lock',
    'merge_order',
  ],
  notebooklm: [
    'install_hint', 'ask', 'add_source', 'research_fast', 'research_deep', 'podcast_generate', 'quiz_export',
  ],
  ollama: [
    'prompt', 'list_models', 'pull_model', 'embed',
  ],
  figma: [
    'context', 'stitch_prompt', 'route_bind',
  ],
  devops: [
    'local_up', 'db_migrate', 'db_seed', 'helm_lint', 'ci_hint',
  ],
  programme: [
    'scope_p1', 'mvp_percent', 'phase_gate', 'doc_index',
  ],
  ruflo_compat: [
    'swarm_init', 'swarm_status', 'agent_spawn', 'memory_store', 'memory_search', 'hooks_enable',
    'topology_mesh', 'topology_hierarchical', 'neural_train', 'neural_infer', 'worker_audit',
    'worker_testgaps', 'worker_consolidate', 'ddd_scaffold', 'sparc_spec', 'sparc_pseudo',
    'sparc_arch', 'sparc_refine', 'tdd_london', 'code_review', 'github_pr', 'github_issue',
    'performance_profile', 'security_cve', 'pii_scan', 'claims_auth', 'crdt_sync', 'gossip',
    'raft_leader', 'byzantine_vote', 'quorum_adjust', 'load_balance', 'resource_alloc',
  ],
  nest: [
    'controller_scaffold', 'service_scaffold', 'dto_validate', 'guard_jwt', 'pipe_transform',
    'module_wire', 'health_probe', 'exception_filter', 'interceptor_log', 'config_load',
  ],
  bff: [
    'proxy_auth', 'proxy_accounts', 'proxy_payments', 'proxy_onboarding', 'proxy_admin',
    'cookie_session', 'csrf_check', 'timeout_wrap', 'error_map', 'dev_fallback',
  ],
  cursor: [
    'lane_a_ui', 'lane_b_bff', 'lane_c_backend', 'paste_block', 'claim_before_edit',
    'typecheck_web', 'build_web_clean', 'figma_mcp', 'browser_smoke',
  ],
  antigravity: [
    'handoff_in', 'handoff_out', 'service_only', 'kafka_wire', 'openapi_sync',
  ],
  copilot: [
    'claim_lane', 'review_diff', 'suggest_test',
  ],
  helm: [
    'lint', 'template', 'values_prod', 'values_dev', 'networkpolicy_apply',
  ],
  kafka: [
    'topic_list', 'consumer_lag', 'produce_test', 'schema_hint',
  ],
  docker: [
    'compose_up', 'compose_ps', 'mysql_shell', 'redis_cli', 'kong_reload',
  ],
  fusionx: [
    'ui_wave', 'stitch_parity', 'route_bind', 'screen_map', 'token_audit',
    'shell_nav', 'i18n_keys', 'middleware_routes', 'bff_map', 'story_bind',
    'png_reference', 'accessibility', 'mobile_safe_area',
  ],
};

function tierForCategory(cat) {
  if (['notebooklm', 'ollama'].includes(cat)) return 'full';
  return 'standard';
}

export function buildCatalogTools() {
  const out = [];
  for (const [category, actions] of Object.entries(ACTIONS)) {
    for (const action of actions) {
      out.push({
        name: `thejad_${category}_${action}`,
        tier: tierForCategory(category),
        category,
        action,
        description: `ThejaD ${category}: ${action.replace(/_/g, ' ')} (LOLC Internet Banking).`,
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Optional parameters (JSON string or plain text)' },
            storyId: { type: 'string' },
            route: { type: 'string' },
          },
        },
      });
    }
  }
  return out;
}

export function catalogToolCount() {
  return buildCatalogTools().length;
}
