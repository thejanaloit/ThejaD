const HUB_MAJOR = [
  { id: 'cursor', label: 'Cursor host LLM', angle: -90 },
  { id: 'pod', label: 'LAN pod mesh', angle: -42 },
  { id: 'hyperspace', label: 'Hyperspace gateway', angle: 6 },
  { id: 'notebooklm', label: 'NotebookLM', angle: 54 },
  { id: 'ruflo', label: 'Ruflo swarm', angle: 102 },
  { id: 'index', label: 'Device / web index', angle: 150 },
  { id: 'skills', label: 'Skills mesh', angle: 198 },
  { id: 'memory', label: 'Memory sync', angle: 246 },
];

/** Seed labels for micro-bubbles (dense mesh field) */
const MESH_MICRO_LABELS = [
  'graphical memory',
  'graphify-out',
  'knowledge graph',
  'semantic graph',
  'memory_store',
  'podMemorySync',
  'graphify_hint',
  'limits_check',
  'thejad_orchestrate',
  'mamaThejana',
  'thejad_unlock',
  'coordination_claim',
  'device_search',
  'notebooklm_ask',
  'swarm_init',
  'agent_spawn',
  'hyperspace_infer',
  'ollama',
  'regeneratePrompt',
  'pickSkills',
  'thejad://skill',
  'thejad://doc',
  'scope_guard',
  'vendor_sync',
  'memory_search',
  'pod serve',
  'UDP 19091',
  'HTTP 19090',
  'integrationCtx',
  'Figma',
  'Superpowers',
  'Claude-mem',
  'Graphify',
  'Queen',
  'Coder',
  'Tester',
  'Security',
  'Thejana',
  'Lahiru',
  'Sachini',
  'Geesara',
  'Backend',
  'MCP tools',
  '1428 routes',
  '87 prompts',
  '221 resources',
  'catalog-router',
  'runOrchestra',
  'beforeSubmit',
  'sessionStart',
  'THEJAD_AUTO_POD',
  'FULL_ACCESS',
  'shared-memory',
  'device-index',
  'lolc-limits',
  'Phase P1',
  'hierarchical-mesh',
  'libp2p',
  'Gateway /v1',
  'pod keys',
  'warm models',
  'role votes',
  'token save',
  'active-claims',
  'smoke_hint',
  'story_lookup',
  'team_consult',
  'white-hat',
  'manifest export',
  'manifest apply',
  'setup_status',
  'plugins_status',
  'worker_hints',
  'raft',
  'byzantine',
  'gossip',
  'mesh coord',
  'Kafka',
  'Kong',
  'Nest BFF',
  'Next.js',
  'Docker',
  'Helm',
  'SIEM',
  'CBS adapter',
  'onboarding',
  'registration',
  'auth JWT',
  'tenant',
  'payments',
  'accounts UI',
  'admin UI',
  'meeting demo',
  'Antigravity',
  'Copilot',
  'Cursor hook',
  'stdio MCP',
  'fusionx',
  'traceability',
  'Stitch UI',
  'Screen map',
  'AGENTS.md',
  'COORDINATION',
  'diary_append',
  'finalize',
  'stats',
  'selftest',
  'init',
  'peer Ollama',
  'LAN discover',
  'Hyperspace pod',
  'NotebookLM src',
  'clean index',
  'usable paths',
  'semantic graph',
  'skill URI',
  'no SKILL paste',
  '80% tier',
  '100% tier',
  'nothejad lock',
  'Thanks Theja',
];

const MESH_RINGS = [
  { r: 88, count: 16, tier: 'inner' },
  { r: 132, count: 24, tier: 'inner' },
  { r: 178, count: 30, tier: 'mid' },
  { r: 228, count: 36, tier: 'mid' },
  { r: 282, count: 42, tier: 'outer' },
  { r: 338, count: 48, tier: 'outer' },
  { r: 395, count: 54, tier: 'far' },
];

function buildMicroBubbleNodes(extraLabels = []) {
  const labels = [...MESH_MICRO_LABELS, ...extraLabels.slice(0, 48)];
  const nodes = [];
  let idx = 0;
  MESH_RINGS.forEach((ring) => {
    for (let j = 0; j < ring.count; j++) {
      const angle = (360 / ring.count) * j + ((idx * 13) % 17) - 8;
      const r = ring.r + ((idx * 7) % 5) * 4 - 8;
      nodes.push({
        id: `micro-${idx}`,
        kind: 'micro',
        tier: ring.tier,
        angle,
        r,
        label: labels[idx % labels.length] || 'node',
      });
      idx += 1;
    }
  });
  return nodes;
}

const TEAM = [
  { name: 'Thejana', role: 'Orchestration & merge' },
  { name: 'Lahiru', role: 'UI / UX' },
  { name: 'Sachini', role: 'Analyst' },
  { name: 'Geesara', role: 'QA' },
  { name: 'Backend', role: 'APIs' },
  { name: 'Security', role: 'White-hat' },
];

const STEPS = [
  {
    id: 'install',
    title: 'Install ThejaD MCP',
    body: 'Cursor spawns node thejad/bin/thejad.js mcp start — stdio JSON-RPC. One MCP process, 1428 tools, prompts, and resources for your IDE agent.',
    code: 'npx thejad init\nthejad mcp start',
    chips: ['MCP stdio', 'Cursor · Claude Code', '1428 tools'],
  },
  {
    id: 'graphical-memory',
    title: 'Graphical memory — the main idea',
    body: 'Graphify turns your monorepo into a knowledge graph (graphify-out/). Pod memory, device index, and local memory_store link into that graph on the mesh ring. Orchestra queries structure — not full-file paste — before coding.',
    viz: 'graphical-memory',
    code: 'graphify .\ngraphify_hint\npodMemorySync',
    chips: ['Graphify graph', 'graphical memory', 'graphify-out/'],
  },
  {
    id: 'datamesh',
    title: 'Unified data mesh (graphical memory hub)',
    body: 'The dense mesh is graphical memory made visible: Graphify nodes, shared pod JSON, device paths, skills, limits — hundreds of links into ThejaD before runOrchestra.',
    viz: 'datamesh',
    chips: ['Graph spine', 'podMemorySync', 'Graphify'],
  },
  {
    id: 'topology',
    title: 'Mesh network topology',
    body: 'Layer 1 — LAN team pod: hierarchical peers (UDP 19091 discover, HTTP 19090 sync). Each node runs pod serve; thejad_pod_bootstrap auto-joins. Layer 2 — Hyperspace overlay: distributed pod gateway (libp2p-class stack via Hyperspace CLI) for cross-network models. Layer 3 — Ruflo hierarchical-mesh: queen + worker agents inside ThejaD swarm.json.',
    viz: 'topology',
    code: 'Topology: LAN mesh + Hyperspace overlay + Ruflo hierarchical-mesh',
    chips: ['19090 sync', '19091 discover', 'hierarchical-mesh'],
  },
  {
    id: 'hyperspace',
    title: 'Hyperspace technology',
    body: 'Hyperspace Pods (pods.hyper.space) provide distributed inference. ThejaD bridges via HYPERSPACE_GATEWAY_URL (OpenAI-compatible /v1) and HYPERSPACE_POD_API_KEY. Tools: hyperspace_pod_status, hyperspace_gateway_infer. CLI: hyperspace pod status — merged into listAllPodMeshModels with local and peer Ollama.',
    viz: 'hyperspace',
    code: 'curl -fsSL https://agents.hyper.space/cli | bash\nhyperspace pod keys create\nHYPERSPACE_GATEWAY_URL=http://127.0.0.1:8080/v1',
    chips: ['libp2p pod mesh', 'Gateway /v1', 'hyperspace_gateway_infer'],
  },
  {
    id: 'notebooklm',
    title: 'NotebookLM connected',
    body: 'After notebooklm login (OAuth), runOrchestra calls notebooklmAsk for BA/research prompts. Sources from your repo docs via notebooklm_add_sources. MCP: notebooklm_ask, notebooklm_auth_status. Feeds integrationContext in the orchestrated plan — no pasting full PDFs into chat.',
    viz: 'notebooklm',
    code: 'pip install notebooklm-py\nnotebooklm login\nnotebooklm_ask → runOrchestra',
    chips: ['notebooklm_ask', 'Repo sources', 'integrationContext'],
  },
  {
    id: 'ruflo',
    title: 'Ruflo-class swarm',
    body: 'ThejaD embeds Ruflo-scale orchestration: swarm_init(topology: hierarchical-mesh), agent_spawn (coder, tester, security-auditor…), swarm_status. Works with optional npx ruflo daemon. Queen coordinates workers (map, audit, optimize, testgaps) — parallel to the 6-person virtual team.',
    viz: 'ruflo',
    code: 'swarm_init({ topology: "hierarchical-mesh" })\nagent_spawn("coder", task)',
    chips: ['swarm_init', 'agent_spawn', '15 max agents'],
  },
  {
    id: 'cleanweb',
    title: 'Clean web & device data',
    body: 'THEJAD_DEVICE_ROOTS + device_reindex build a scoped index (no full-disk scan). device_search / device_usable_search return clean paths for the agent. Data enters the mesh filtered — only what you allow.',
    viz: 'cleanweb',
    code: 'THEJAD_DEVICE_ROOTS=D:\\docs;E:\\projects\ndevice_reindex → device_search',
    chips: ['Scoped index', 'device_search', 'device_usable_search'],
  },
  {
    id: 'skills',
    title: 'Skills — load, never paste',
    body: '66+ SKILL.md bundles (Graphify, Superpowers, Claude-mem, Ruflo agents, team lanes). Orchestra pickSkills() attaches up to 5 thejad://skill/<id> URIs per task. regeneratePrompt lists them under “load on demand” — ~30–60% token savings vs inlining docs.',
    viz: 'skills',
    code: 'vendor_sync_skills\nthejad://skill/superpowers-systematic-debugging',
    chips: ['thejad://skill/*', 'pickSkills', 'vendor_sync_skills'],
  },
  {
    id: 'graphify',
    title: 'Graphify knowledge graph',
    body: 'graphify_hint installs and indexes your monorepo as a semantic graph. Connected on the memory mesh ring with device index and local memory — agents query structure instead of scanning blind.',
    viz: 'graphify',
    code: 'graphify_hint({ path: THEJAD_REPO_ROOT })\nSkill: graphify-graphify',
    chips: ['graphify_hint', 'graphify catalog', 'graphify-graphify'],
  },
  {
    id: 'limits',
    title: 'limits_check — programme guardrails',
    body: 'Returns LOLC dev payment limits (daily, per-txn, schedule) and FusionX phase weights from lolc-limits.json. Pair with scope_guard so agents stay Phase 1 unless the log says otherwise.',
    viz: 'limits',
    code: 'limits_check → paymentLimits + programmeScope\nscope_guard({ task: "..." })',
    chips: ['limits_check', 'scope_guard', 'lolc-limits.json'],
  },
  {
    id: 'memory',
    title: 'Graphical memory mesh — all data, one ring',
    body: 'The ring is graphical memory: Graphify semantic graph at the centre edge, plus pod sync, device index, skill URIs, limits, NotebookLM, Hyperspace/Ollama, docs, swarm — every node is queryable structure linked to ThejaD.',
    viz: 'memoryring',
    code: 'graphify-out/ + podMemorySync → thejad_orchestrate',
    chips: ['Graphify first', 'Graph nodes', 'Mesh ring'],
  },
  {
    id: 'setup-flow',
    title: 'Setup → orchestrate (full flow)',
    body: 'Install → setup_status → Ollama/keys/logins → setup_complete → prompt → thejad_orchestrate → warm models → role/skills/agent → token-efficient prompt → deliveryWorkflow. See the interactive diagram on this page.',
    viz: 'flowchart-link',
    chips: ['thejad_setup_status', 'thejad_setup_complete', 'deliveryWorkflow'],
  },
  {
    id: 'use-thejad',
    title: 'Use ThejaD in Cursor',
    body: 'npx thejad init wires MCP + hooks. thejad_status shows tier %. On every task call thejad_orchestrate — or let beforeSubmitPrompt hook run orchestra automatically.',
    code: 'npx thejad init\nthejad stats\nthejad_orchestrate { "prompt": "…" }',
    chips: ['thejad init', 'thejad_status', 'Use ThejaD'],
  },
  {
    id: 'prompt',
    title: 'Your prompt enters',
    body: 'beforeSubmitPrompt hook or thejad_orchestrate sends text to runOrchestra — same pipeline either way.',
    chips: ['User prompt', 'Auto hook', 'thejad_orchestrate'],
  },
  {
    id: 'orchestra',
    title: 'thejad_orchestrate / runOrchestra',
    body: 'Reads graphical memory first (Graphify graph + pod mesh sync) → warm models → route role → pickSkills → votes → regeneratePrompt with graph/skill refs (not inlined docs) → deliveryWorkflow.',
    code: 'thejad_orchestrate({ prompt: "…" })\n// → runOrchestra internally',
    chips: ['Graphical memory', 'thejad_orchestrate', 'regeneratePrompt'],
  },
  {
    id: 'restructure',
    title: 'Token-efficient prompt',
    body: 'Structured blocks + skill URIs — often 30–60% savings vs inlining docs.',
    tokenDemo: true,
    chips: ['Skill URIs', 'No SKILL.md paste'],
  },
  {
    id: 'assign',
    title: 'Team assignment',
    body: 'Routed to Thejana, Lahiru, Sachini, Geesara, Backend, or Security.',
    team: true,
  },
  {
    id: 'multi',
    title: 'Many users · one mesh',
    body: 'coordination_claim prevents collisions. Everyone shares the same orchestra config and pod memory.',
    chips: ['Active claims', 'No collapse'],
  },
  {
    id: 'unlock',
    title: 'mamaThejana — maximum tier',
    body: 'Say or pass mamaThejana to thejad_unlock → 100% tier: all 1428 catalog tools, NotebookLM smokes, full integrations. Persistent with THEJAD_FULL_ACCESS=1. Lock again with nothejad unlock.',
    code: 'thejad_unlock({ phrase: "mamaThejana" })\nTHEJAD_FULL_ACCESS=1',
    chips: ['mamaThejana', 'thejad_unlock', '100% tier'],
    gold: true,
  },
];

const DEFAULT_MEMORY_MESH = [
  { id: 'graphify', label: 'Graphical memory', tool: 'graphify_hint', primary: true },
  { id: 'local-memory', label: 'Local memory', tool: 'memory_store' },
  { id: 'pod-memory', label: 'Pod graph sync', tool: 'thejad_pod_memory_sync' },
  { id: 'device-index', label: 'Device index', tool: 'device_reindex' },
  { id: 'skills', label: 'Skills', tool: 'vendor_sync_skills' },
  { id: 'limits', label: 'Limits', tool: 'limits_check' },
  { id: 'coordination', label: 'Coordination', tool: 'coordination_claim' },
  { id: 'notebooklm', label: 'NotebookLM', tool: 'notebooklm_ask' },
  { id: 'hyperspace', label: 'Hyperspace', tool: 'hyperspace_gateway_infer' },
  { id: 'ollama', label: 'Ollama mesh', tool: 'thejad_pod_models' },
  { id: 'docs', label: 'Docs', tool: 'thejad://doc' },
  { id: 'swarm', label: 'Ruflo swarm', tool: 'swarm_status' },
];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildMeshHub(extraSkillLabels = []) {
  const wrap = document.getElementById('mesh-hub-wrap');
  const labelsEl = document.getElementById('hub-labels');
  if (!wrap) return;

  wrap.innerHTML = '';
  if (labelsEl) labelsEl.innerHTML = '';

  const cx = 500;
  const cy = 500;
  const majorR = 218;
  const microNodes = buildMicroBubbleNodes(extraSkillLabels);
  const totalNodes = microNodes.length + HUB_MAJOR.length;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'mesh-hub-svg mesh-hub-dense');
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `ThejaD unified mesh with ${totalNodes} connected nodes`);

  const defs = document.createElementNS(ns, 'defs');
  const grad = document.createElementNS(ns, 'radialGradient');
  grad.setAttribute('id', 'hubGrad');
  grad.innerHTML =
    '<stop offset="0%" stop-color="#38bdf8"/><stop offset="55%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#0c1229"/>';
  defs.appendChild(grad);

  const glow = document.createElementNS(ns, 'filter');
  glow.setAttribute('id', 'meshGlow');
  glow.innerHTML =
    '<feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
  defs.appendChild(glow);
  svg.appendChild(defs);

  const linksLayer = document.createElementNS(ns, 'g');
  linksLayer.setAttribute('class', 'mesh-links-layer');
  const microLayer = document.createElementNS(ns, 'g');
  microLayer.setAttribute('class', 'mesh-micro-layer');
  const majorLayer = document.createElementNS(ns, 'g');
  majorLayer.setAttribute('class', 'mesh-major-layer');
  const packetsLayer = document.createElementNS(ns, 'g');
  packetsLayer.setAttribute('class', 'mesh-packets-layer');

  const microPositions = [];

  microNodes.forEach((node, i) => {
    const p = polar(cx, cy, node.r, node.angle);
    microPositions.push(p);

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('class', `mesh-link micro-link tier-${node.tier}`);
    path.setAttribute('d', `M${cx},${cy} L${p.x},${p.y}`);
    linksLayer.appendChild(path);

    if (i > 0 && i % 4 === 0) {
      const prev = microPositions[i - 1];
      const arc = document.createElementNS(ns, 'path');
      arc.setAttribute('class', 'mesh-link mesh-peer-link');
      arc.setAttribute('d', `M${prev.x},${prev.y} L${p.x},${p.y}`);
      linksLayer.appendChild(arc);
    }

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('class', `mesh-bubble micro tier-${node.tier}`);
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    const br = node.tier === 'far' ? 3.5 : node.tier === 'outer' ? 4 : 4.5;
    circle.setAttribute('r', String(br));
    circle.setAttribute('data-label', node.label);
    microLayer.appendChild(circle);
  });

  HUB_MAJOR.forEach((node, i) => {
    const p = polar(cx, cy, majorR, node.angle);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('class', 'mesh-link major-link');
    path.setAttribute('d', `M${cx},${cy} L${p.x},${p.y}`);
    path.setAttribute('id', `path-${node.id}`);
    linksLayer.appendChild(path);

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('class', 'mesh-bubble major satellite');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', '26');
    majorLayer.appendChild(circle);

    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', p.x);
    text.setAttribute('y', p.y + 4);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'mesh-major-label');
    text.textContent = node.label.split(' ')[0];
    majorLayer.appendChild(text);

    const packet = document.createElementNS(ns, 'circle');
    packet.setAttribute('class', 'packet');
    packet.setAttribute('r', '5');
    packet.style.offsetPath = `path('M${p.x},${p.y} L${cx},${cy}')`;
    packet.style.offsetRotate = '0deg';
    packet.style.animationDelay = `${i * 0.4}s`;
    packetsLayer.appendChild(packet);

    if (labelsEl) {
      const lbl = el('div', 'hub-label', node.label);
      lbl.dataset.hub = node.id;
      labelsEl.appendChild(lbl);
    }
  });

  for (let k = 0; k < 24; k++) {
    const n = microNodes[(k * 11) % microNodes.length];
    const p = polar(cx, cy, n.r, n.angle);
    const packet = document.createElementNS(ns, 'circle');
    packet.setAttribute('class', 'packet packet-micro');
    packet.setAttribute('r', '2.5');
    packet.style.offsetPath = `path('M${p.x},${p.y} L${cx},${cy}')`;
    packet.style.offsetRotate = '0deg';
    packet.style.animationDelay = `${(k * 0.18) % 2.8}s`;
    packetsLayer.appendChild(packet);
  }

  svg.appendChild(linksLayer);
  svg.appendChild(microLayer);
  svg.appendChild(majorLayer);

  const halo = document.createElementNS(ns, 'circle');
  halo.setAttribute('class', 'hub-halo');
  halo.setAttribute('cx', cx);
  halo.setAttribute('cy', cy);
  halo.setAttribute('r', '52');
  svg.appendChild(halo);

  const core = document.createElementNS(ns, 'circle');
  core.setAttribute('class', 'hub-core');
  core.setAttribute('cx', cx);
  core.setAttribute('cy', cy);
  core.setAttribute('r', '40');
  core.setAttribute('filter', 'url(#meshGlow)');
  svg.appendChild(core);

  const coreText = document.createElementNS(ns, 'text');
  coreText.setAttribute('x', cx);
  coreText.setAttribute('y', cy + 5);
  coreText.setAttribute('text-anchor', 'middle');
  coreText.setAttribute('class', 'mesh-core-text');
  coreText.textContent = 'ThejaD';
  svg.appendChild(coreText);

  svg.appendChild(packetsLayer);
  wrap.appendChild(svg);

  if (labelsEl) {
    const summary = el('div', 'hub-mesh-summary');
    summary.appendChild(el('strong', null, String(totalNodes)));
    summary.appendChild(document.createTextNode(' mesh nodes · '));
    summary.appendChild(el('span', null, `${microNodes.length} micro · ${HUB_MAJOR.length} anchors`));
    labelsEl.insertBefore(summary, labelsEl.firstChild);
  }
}

function buildGraphicalMemoryViz() {
  const wrap = document.getElementById('graphical-memory-viz');
  if (!wrap) return;
  wrap.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'gm-svg');
  svg.setAttribute('viewBox', '0 0 720 220');

  const edges = [
    [80, 110, 200, 60],
    [80, 110, 200, 110],
    [80, 110, 200, 160],
    [200, 60, 360, 110],
    [200, 110, 360, 110],
    [200, 160, 360, 110],
    [360, 110, 520, 80],
    [360, 110, 520, 140],
    [520, 80, 640, 110],
    [520, 140, 640, 110],
  ];
  edges.forEach(([x1, y1, x2, y2]) => {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('class', 'gm-edge');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    svg.appendChild(line);
  });

  const nodes = [
    [80, 110, 'Repo files', 'gm-node-src'],
    [200, 60, 'routes', 'gm-node'],
    [200, 110, 'services', 'gm-node'],
    [200, 160, 'docs', 'gm-node'],
    [360, 110, 'Graphify graph', 'gm-node-core'],
    [520, 80, 'pod memory', 'gm-node'],
    [520, 140, 'skills', 'gm-node'],
    [640, 110, 'Orchestra', 'gm-node-out'],
  ];
  nodes.forEach(([cx, cy, label, cls]) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('class', cls);
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', cls === 'gm-node-core' ? 36 : 22);
    svg.appendChild(c);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', cx);
    t.setAttribute('y', cy + (cls === 'gm-node-core' ? 5 : 4));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('class', 'gm-label');
    t.textContent = label;
    svg.appendChild(t);
  });

  wrap.appendChild(svg);
}

function buildMemoryMeshRing(nodes) {
  const wrap = document.getElementById('memory-mesh-wrap');
  const legend = document.getElementById('memory-mesh-legend');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (legend) legend.innerHTML = '';

  const cx = 280;
  const cy = 280;
  const R = 200;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'memory-mesh-svg');
  svg.setAttribute('viewBox', '0 0 560 560');

  const ring = document.createElementNS(ns, 'circle');
  ring.setAttribute('class', 'memory-ring-guide');
  ring.setAttribute('cx', cx);
  ring.setAttribute('cy', cy);
  ring.setAttribute('r', R);
  ring.setAttribute('fill', 'none');
  svg.appendChild(ring);

  nodes.forEach((node, i) => {
    const deg = -90 + (360 / nodes.length) * i;
    const p = polar(cx, cy, R, deg);

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('class', 'memory-link');
    path.setAttribute('d', `M${p.x},${p.y} L${cx},${cy}`);
    path.setAttribute('id', `mem-path-${node.id}`);
    svg.appendChild(path);

    const ringSeg = document.createElementNS(ns, 'path');
    const p2 = polar(cx, cy, R, deg + 360 / nodes.length);
    ringSeg.setAttribute('class', 'memory-ring-seg');
    ringSeg.setAttribute('d', `M${p.x},${p.y} A${R},${R} 0 0,1 ${p2.x},${p2.y}`);
    svg.appendChild(ringSeg);

    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('class', node.primary ? 'memory-node memory-node-primary' : 'memory-node');
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    dot.setAttribute('r', node.primary ? 28 : 22);
    svg.appendChild(dot);

    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', p.x);
    label.setAttribute('y', p.y + 3);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'memory-node-label');
    label.textContent = node.label.split(' ')[0];
    svg.appendChild(label);

    const packet = document.createElementNS(ns, 'circle');
    packet.setAttribute('class', 'memory-packet');
    packet.setAttribute('r', 4);
    packet.style.animationDelay = `${i * 0.35}s`;
    packet.style.offsetPath = `path('M${p.x},${p.y} L${cx},${cy}')`;
    svg.appendChild(packet);

    if (legend) {
      const item = el('span', 'memory-legend-item', node.label);
      item.title = node.tool || '';
      legend.appendChild(item);
    }
  });

  const core = document.createElementNS(ns, 'circle');
  core.setAttribute('class', 'memory-core');
  core.setAttribute('cx', cx);
  core.setAttribute('cy', cy);
  core.setAttribute('r', 44);
  svg.appendChild(core);

  const coreText = document.createElementNS(ns, 'text');
  coreText.setAttribute('x', cx);
  coreText.setAttribute('y', cy + 4);
  coreText.setAttribute('text-anchor', 'middle');
  coreText.setAttribute('class', 'memory-core-text');
  coreText.textContent = 'ThejaD';
  svg.appendChild(coreText);

  wrap.appendChild(svg);
}

function renderCoreCommands(commands, limits) {
  const grid = document.getElementById('core-command-grid');
  if (!grid || !commands?.length) return;
  grid.innerHTML = '';
  commands.forEach((cmd) => {
    const card = el('article', `core-cmd-card${cmd.id === 'mamathejana' ? ' gold' : ''}`);
    card.appendChild(el('h3', 'core-cmd-title', cmd.title));
    card.appendChild(el('p', 'encycl-desc', cmd.summary));
    if (cmd.code) card.appendChild(el('pre', 'code', cmd.code));
    if (cmd.tools?.length) {
      const chips = el('div', 'chips');
      cmd.tools.forEach((t) => chips.appendChild(el('span', 'chip', t)));
      card.appendChild(chips);
    }
    grid.appendChild(card);
  });
  if (limits?.paymentLimits) {
    const lim = el('aside', 'limits-panel');
    lim.appendChild(el('h4', 'encycl-group-title', 'limits_check snapshot'));
    const ul = el('ul', 'limits-list');
    const pl = limits.paymentLimits;
    [
      `Daily: ${pl.dailyLimit?.toLocaleString()} ${pl.currency}`,
      `Per txn: ${pl.perTransactionLimit?.toLocaleString()} ${pl.currency}`,
      `Schedule: ${pl.scheduleLimit?.toLocaleString()} ${pl.currency}`,
    ].forEach((t) => ul.appendChild(el('li', null, t)));
    if (limits.programmeScope?.nearTerm) {
      ul.appendChild(el('li', null, limits.programmeScope.nearTerm));
    }
    lim.appendChild(ul);
    grid.appendChild(lim);
  }
}

let skillsFilterBundle = 'all';
let skillsFilterQuery = '';

function renderSkillsShowcase(skills) {
  const grid = document.getElementById('skills-grid');
  const tabs = document.getElementById('skills-bundle-tabs');
  const countEl = document.getElementById('skills-count');
  if (!grid || !skills?.length) return;

  if (countEl) countEl.textContent = String(skills.length);

  const bundles = ['all', ...new Set(skills.map((s) => s.bundle))].sort();
  if (tabs) {
    tabs.innerHTML = '';
    bundles.forEach((b) => {
      const btn = el(
        'button',
        `skills-tab${skillsFilterBundle === b ? ' active' : ''}`,
        b === 'all' ? 'All bundles' : b,
      );
      btn.type = 'button';
      btn.addEventListener('click', () => {
        skillsFilterBundle = b;
        renderSkillsShowcase(skills);
      });
      tabs.appendChild(btn);
    });
  }

  grid.innerHTML = '';
  const q = skillsFilterQuery;
  skills
    .filter((s) => {
      if (skillsFilterBundle !== 'all' && s.bundle !== skillsFilterBundle) return false;
      if (!q) return true;
      const blob = [s.id, s.folder, s.uri, s.bundle].join(' ').toLowerCase();
      return blob.includes(q);
    })
    .forEach((s) => {
      const card = el('article', 'skill-card');
      card.appendChild(el('code', 'encycl-name', s.id));
      card.appendChild(el('span', 'skill-uri', s.uri));
      card.appendChild(el('span', 'skill-bundle', s.bundle));
      grid.appendChild(card);
    });
}

function renderSkillsViz() {
  const box = el('div', 'skills-viz');
  box.innerHTML =
    '<div class="skills-flow"><span>SKILL.md on disk</span><span class="flow-arrow">→</span><span>thejad://skill/id</span><span class="flow-arrow">→</span><span>pickSkills (≤5)</span><span class="flow-arrow">→</span><span>regeneratePrompt</span></div>';
  return box;
}

function buildGraphicalMemoryVizInline() {
  const note = el('p', 'step-body', 'See the full graphical memory diagram in the section above.');
  const a = el('a', 'cta-outline', 'Jump to graphical memory ↑');
  a.href = '#graphical-memory';
  const box = el('div', null);
  box.appendChild(note);
  box.appendChild(a);
  return box;
}

function renderGraphifyViz() {
  const g = el('div', 'graphify-viz');
  g.innerHTML =
    '<div class="graphify-nodes"><span class="topo-node">Repo files</span><span class="nl-arrow">→</span><span class="topo-node highlight">Graphify index</span><span class="nl-arrow">→</span><span class="topo-node">Memory mesh</span><span class="nl-arrow">→</span><span class="topo-node">thejad_orchestrate</span></div>';
  return g;
}

function renderLimitsViz(limits) {
  const box = el('div', 'limits-viz');
  if (limits?.paymentLimits) {
    const p = limits.paymentLimits;
    box.appendChild(
      el(
        'p',
        'step-body',
        `Dev limits: ${p.dailyLimit?.toLocaleString()} ${p.currency}/day · ${p.perTransactionLimit?.toLocaleString()} per txn · scope_guard enforces Phase 1.`,
      ),
    );
  } else {
    box.appendChild(el('p', 'step-body', 'limits_check reads thejad/data/lolc-limits.json at runtime.'));
  }
  return box;
}

function renderMemoryRingNote() {
  return el(
    'p',
    'step-body',
    'Scroll the memory mesh ring above — packets flow inward from every node. One orchestra reads them all.',
  );
}

function renderTopology() {
  const panel = el('div', 'topology-panel');
  const wrap = el('div', 'topology-layers');

  const lan = el('div', 'topo-layer lan');
  lan.appendChild(el('div', 'topo-layer-title', 'Layer 1 · LAN team pod mesh'));
  lan.appendChild(el('p', 'step-body', 'UDP discover 19091 → HTTP sync 19090 → shared memory + peer Ollama'));
  const lanNodes = el('div', 'topo-nodes');
  ['PC-A · pod serve', 'PC-B · pod serve', 'PC-C · pod serve'].forEach((t) =>
    lanNodes.appendChild(el('span', 'topo-node', t)),
  );
  lan.appendChild(lanNodes);
  lan.appendChild(el('div', 'topo-edges', '⟷ mesh sync ⟷'));

  const hs = el('div', 'topo-layer hyperspace');
  hs.appendChild(el('div', 'topo-layer-title', 'Layer 2 · Hyperspace overlay'));
  hs.appendChild(el('p', 'step-body', 'Distributed pod network · gateway routes inference globally'));
  const hsNodes = el('div', 'topo-nodes');
  ['Hyperspace CLI', 'Pod keys', 'Gateway :8080/v1', 'Remote models'].forEach((t) =>
    hsNodes.appendChild(el('span', 'topo-node', t)),
  );
  hs.appendChild(hsNodes);

  const rf = el('div', 'topo-layer ruflo');
  rf.appendChild(el('div', 'topo-layer-title', 'Layer 3 · Ruflo hierarchical-mesh'));
  rf.appendChild(el('p', 'step-body', 'Queen agent + workers · swarm.json state'));
  const rfNodes = el('div', 'topo-nodes');
  ['Queen', 'Coder', 'Tester', 'Security', 'Researcher'].forEach((t) =>
    rfNodes.appendChild(el('span', 'topo-node', t)),
  );
  rf.appendChild(rfNodes);

  wrap.appendChild(lan);
  wrap.appendChild(hs);
  wrap.appendChild(rf);
  panel.appendChild(wrap);
  return panel;
}

function renderHyperspace() {
  const stack = el('div', 'hyperspace-stack');
  const items = [
    ['1', 'Hyperspace CLI — hyperspace pod status (libp2p pod network)'],
    ['2', 'Pod API keys — HYPERSPACE_POD_API_KEY (pk_*)'],
    ['3', 'Local gateway — HYPERSPACE_GATEWAY_URL /v1/models'],
    ['4', 'thejad_pod_models — merges local + LAN + Hyperspace'],
    ['5', 'hyperspace_gateway_infer — chat/completions to mesh'],
  ];
  items.forEach(([n, t]) => {
    const b = el('div', 'hs-block');
    b.appendChild(el('span', 'hs-num', n));
    b.appendChild(el('span', null, t));
    stack.appendChild(b);
  });
  return stack;
}

function renderNotebooklm() {
  const flow = el('div', 'nl-flow');
  const boxes = [
    ['Your repo docs', false],
    ['↓', false],
    ['notebooklm_add_sources', false],
    ['↓', false],
    ['notebooklm login (OAuth)', false],
    ['↓', false],
    ['notebooklm_ask → integrationContext', true],
    ['↓', false],
    ['runOrchestra → optimized plan', true],
  ];
  boxes.forEach(([t, hi]) => {
    if (t === '↓') flow.appendChild(el('span', 'nl-arrow', '↓'));
    else flow.appendChild(el('div', hi ? 'nl-box highlight' : 'nl-box', t));
  });
  return flow;
}

function renderRuflo() {
  const mesh = el('div', 'ruflo-mesh');
  mesh.innerHTML = '';
  mesh.appendChild(el('div', 'ruflo-agent', 'Coder'));
  mesh.appendChild(el('div', 'ruflo-line'));
  mesh.appendChild(el('div', 'ruflo-queen', 'Queen · hierarchical-mesh'));
  mesh.appendChild(el('div', 'ruflo-line'));
  mesh.appendChild(el('div', 'ruflo-agent', 'Tester'));
  mesh.appendChild(el('div', 'ruflo-agent', 'Security'));
  mesh.appendChild(el('div', 'ruflo-agent', 'Researcher'));
  return mesh;
}

function renderCleanweb() {
  const grid = el('div', 'cleanweb-grid');
  const src = el('div', 'cleanweb-source');
  src.innerHTML = '<strong>Raw paths</strong><ul><li>D: drive folders</li><li>THEJAD_DEVICE_ROOTS</li><li>Repo docs/</li></ul>';
  const mid = el('div', null);
  mid.appendChild(el('div', 'cleanweb-filter', 'SCOPE + INDEX'));
  mid.appendChild(el('div', 'cleanweb-arrow', '→'));
  const sink = el('div', 'cleanweb-sink');
  sink.innerHTML =
    '<strong>Clean mesh data</strong><ul><li>device_search</li><li>graphify_hint</li><li>pod memory keys</li></ul>';
  grid.appendChild(src);
  grid.appendChild(mid);
  grid.appendChild(sink);
  return grid;
}

function renderDatameshNote() {
  return el(
    'p',
    'step-body',
    'Animated hub above shows live links. Each satellite pushes data inward when you scroll — one mesh, one orchestra.',
  );
}

function renderTeam() {
  const grid = el('div', 'team-grid');
  TEAM.forEach((m, i) => {
    const card = el('div', 'team-card');
    card.style.transitionDelay = `${i * 70}ms`;
    card.appendChild(el('div', 'team-name', m.name));
    card.appendChild(el('div', 'team-role', m.role));
    grid.appendChild(card);
  });
  return grid;
}

function renderTokenDemo() {
  const box = el('div', 'token-demo');
  const row = el('div', 'flow-row');
  row.appendChild(el('span', null, 'Raw prompt'));
  row.appendChild(el('span', 'flow-arrow', '→'));
  row.appendChild(el('span', null, 'Structured ~52%'));
  box.appendChild(row);
  const bar = el('div', 'token-bar');
  bar.appendChild(el('div', 'token-fill'));
  box.appendChild(bar);
  box.appendChild(el('p', 'step-body', '~48% token reduction (skills vs inlined docs).'));
  return box;
}

function renderViz(step) {
  switch (step.viz) {
    case 'topology':
      return renderTopology();
    case 'hyperspace':
      return renderHyperspace();
    case 'notebooklm':
      return renderNotebooklm();
    case 'ruflo':
      return renderRuflo();
    case 'cleanweb':
      return renderCleanweb();
    case 'datamesh':
      return renderDatameshNote();
    case 'skills':
      return renderSkillsViz();
    case 'graphical-memory':
      return buildGraphicalMemoryVizInline();
    case 'graphify':
      return renderGraphifyViz();
    case 'limits':
      return renderLimitsViz(window.__thejadLimits);
    case 'memoryring':
      return renderMemoryRingNote();
    case 'flowchart-link': {
      const box = el('p', 'step-body');
      const a = el('a', 'cta-outline', 'View setup → orchestrate flowchart ↓');
      a.href = '#orchestra-flow';
      box.appendChild(a);
      return box;
    }
    default:
      return null;
  }
}

function renderStep(step, index) {
  const card = el('div', 'step-card');
  card.appendChild(el('p', 'step-num', `Step ${index + 1}`));
  card.appendChild(el('h2', 'step-title', step.title));
  card.appendChild(el('p', 'step-body', step.body));
  if (step.code) card.appendChild(el('pre', 'code', step.code));
  const viz = renderViz(step);
  if (viz) card.appendChild(viz);
  if (step.tokenDemo) card.appendChild(renderTokenDemo());
  if (step.team) card.appendChild(renderTeam());
  if (step.chips) {
    const chips = el('div', 'chips');
    step.chips.forEach((c) => chips.appendChild(el('span', step.gold ? 'chip gold' : 'chip', c)));
    card.appendChild(chips);
  }
  const article = el('article', 'step');
  article.setAttribute('data-step-id', step.id);
  article.appendChild(card);
  return article;
}

window.MESH_MICRO_LABELS = MESH_MICRO_LABELS;

function init() {

  const stepsRoot = document.getElementById('steps');
  const rail = document.getElementById('rail');
  const railLine = document.getElementById('rail-line');
  const hubSection = document.getElementById('data-mesh');

  STEPS.forEach((step, i) => {
    stepsRoot.appendChild(renderStep(step, i));
    const dot = el('div', 'rail-dot');
    dot.id = `dot-${step.id}`;
    dot.style.top = `${((i + 0.5) / STEPS.length) * 100}%`;
    rail.appendChild(dot);
  });

  const visible = new Set();

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const id = e.target.getAttribute('data-step-id') || (e.target.id === 'data-mesh' ? 'data-mesh' : null);
        if (!e.isIntersecting) return;
        if (e.target.id === 'data-mesh') {
          hubSection?.classList.add('visible');
          document.querySelectorAll('.hub-label').forEach((l, i) => {
            setTimeout(() => l.classList.add('active'), i * 120);
          });
          return;
        }
        if (!id || !e.target.classList.contains('step')) return;
        visible.add(id);
        e.target.classList.add('visible');
        document.getElementById(`dot-${id}`)?.classList.add('active');
      });
      let max = -1;
      STEPS.forEach((s, i) => {
        if (visible.has(s.id)) max = i;
      });
      if (railLine) railLine.style.transform = `scaleY(${Math.max(0.06, (max + 1) / STEPS.length)})`;
    },
    { threshold: 0.28, rootMargin: '-6% 0px -15% 0px' },
  );

  setTimeout(() => {
    document.querySelectorAll('.step').forEach((n) => obs.observe(n));
    if (hubSection) obs.observe(hubSection);
  }, 80);
}

const ENCYCLO_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'named', label: '60 named tools' },
  { id: 'skills', label: 'Skills' },
  { id: 'catalog', label: 'Catalog (1368)' },
  { id: 'prompts', label: '87 prompts' },
  { id: 'platform', label: 'Platform' },
  { id: 'categories', label: '97 categories' },
  { id: 'sources', label: 'External sources' },
];

let encyclData = null;
let encyclFilter = 'all';
let encyclQuery = '';

function groupCatalogByCategory(catalog) {
  const map = new Map();
  catalog.forEach((t) => {
    const cat = t.cat || 'uncategorized';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(t);
  });
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function matchesQuery(text) {
  if (!encyclQuery) return true;
  return text.toLowerCase().includes(encyclQuery);
}

function toolSearchBlob(t) {
  return [t.name, t.desc, t.cat, t.action, t.tier].filter(Boolean).join(' ');
}

const ENCYCLO_TOOL_PREVIEW = 10;

/** Up to 10 tool chips, then a button to reveal the rest (avoids one long horizontal line). */
function renderExpandableToolChips(tools) {
  const wrap = el('div', 'encycl-cat-tools');
  const preview = tools.slice(0, ENCYCLO_TOOL_PREVIEW);
  const rest = tools.slice(ENCYCLO_TOOL_PREVIEW);

  const addChips = (container, list) => {
    list.forEach((t) => {
      const chip = el('span', 'encycl-chip', t.name);
      chip.title = t.action ? `${t.action} · ${t.tier || ''}` : t.name;
      container.appendChild(chip);
    });
  };

  const grid = el('div', 'encycl-chip-grid encycl-chip-grid-compact');
  addChips(grid, preview);
  wrap.appendChild(grid);

  if (rest.length) {
    const more = el('div', 'encycl-chip-grid encycl-chip-grid-compact encycl-tools-more');
    more.hidden = true;
    addChips(more, rest);
    wrap.appendChild(more);

    const btn = el('button', 'encycl-expand-btn', `Show ${rest.length} more`);
    btn.type = 'button';
    btn.addEventListener('click', () => {
      const opening = more.hidden;
      more.hidden = !opening;
      btn.textContent = opening ? 'Show less' : `Show ${rest.length} more`;
    });
    wrap.appendChild(btn);
  }

  return wrap;
}

function updateHeroStats(data) {
  const platform = window.THEJAD_PLATFORM_SPECIALTIES || [];
  const skillN = data.counts.skills || data.skills?.length || 0;
  const total = data.counts.mcpTools + data.counts.prompts + skillN + platform.length;
  const cats = groupCatalogByCategory(data.catalog).length;
  const set = (id, v) => {
    const n = document.getElementById(id);
    if (n) n.textContent = String(v);
  };
  set('stat-tools', data.counts.mcpTools);
  set('stat-skills', skillN);
  set('stat-prompts', data.counts.prompts);
  set('stat-total', total.toLocaleString());
}

function renderSkillsEncyclSection(skills) {
  const section = el('section', 'encycl-block');
  section.appendChild(el('h3', 'encycl-block-title', `Skills (${skills.length})`));
  const grid = el('div', 'encycl-chip-grid');
  skills.forEach((s) => {
    const chip = el('span', 'encycl-chip', s.id);
    chip.title = s.uri;
    grid.appendChild(chip);
  });
  section.appendChild(grid);
  return section;
}

function renderEncyclSummary(data) {
  const root = document.getElementById('encycl-summary');
  if (!root) return;
  const platform = window.THEJAD_PLATFORM_SPECIALTIES || [];
  const cats = groupCatalogByCategory(data.catalog);
  root.innerHTML = '';
  const chips = [
    ['Named MCP tools', data.counts.named],
    ['Catalog tools', data.counts.catalog],
    ['Skills', data.counts.skills || data.skills?.length || 0],
    ['MCP prompts', data.counts.prompts],
    ['Memory mesh nodes', data.counts.memoryNodes || 12],
    ['MCP resources', data.counts.resources || 221],
    ['Catalog categories', cats.length],
    ['Platform specialties', platform.length],
    ['External sources', data.counts.externalSources || data.externalSources?.totalCount || 0],
    ['Generated', (data.generatedAt || '').slice(0, 10)],
  ];
  chips.forEach(([label, val]) => {
    const c = el('div', 'encycl-stat-chip');
    c.appendChild(el('strong', null, String(val)));
    c.appendChild(el('span', null, label));
    root.appendChild(c);
  });
}

function renderEncyclFilters() {
  const root = document.getElementById('encycl-filters');
  if (!root) return;
  root.innerHTML = '';
  ENCYCLO_FILTERS.forEach((f) => {
    const b = el('button', `encycl-filter-btn${encyclFilter === f.id ? ' active' : ''}`, f.label);
    b.type = 'button';
    b.dataset.filter = f.id;
    b.addEventListener('click', () => {
      encyclFilter = f.id;
      renderEncyclFilters();
      renderEncyclBody();
    });
    root.appendChild(b);
  });
}

function renderNamedSection(named) {
  const section = el('section', 'encycl-block');
  section.appendChild(el('h3', 'encycl-block-title', `Named MCP tools (${named.length})`));
  const grid = el('div', 'encycl-grid');
  named.forEach((t) => {
    const card = el('article', 'encycl-card');
    card.appendChild(el('code', 'encycl-name', t.name));
    if (t.tier) card.appendChild(el('span', `encycl-tier tier-${t.tier}`, t.tier));
    if (t.desc) card.appendChild(el('p', 'encycl-desc', t.desc));
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}

function renderPromptsSection(prompts) {
  const section = el('section', 'encycl-block');
  section.appendChild(el('h3', 'encycl-block-title', `MCP prompts (${prompts.length})`));
  const grid = el('div', 'encycl-grid');
  prompts.forEach((p) => {
    const card = el('article', 'encycl-card');
    card.appendChild(el('code', 'encycl-name', p.name));
    if (p.desc) card.appendChild(el('p', 'encycl-desc', p.desc));
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}

function renderPlatformSection(platform) {
  const section = el('section', 'encycl-block');
  section.appendChild(el('h3', 'encycl-block-title', `Platform & orchestra (${platform.length})`));
  const byGroup = new Map();
  platform.forEach((p) => {
    if (!byGroup.has(p.group)) byGroup.set(p.group, []);
    byGroup.get(p.group).push(p);
  });
  [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([group, items]) => {
    const g = el('div', 'encycl-platform-group');
    g.appendChild(el('h4', 'encycl-group-title', group));
    const grid = el('div', 'encycl-grid encycl-grid-compact');
    items.forEach((p) => {
      const card = el('article', 'encycl-card');
      card.appendChild(el('strong', 'encycl-card-title', p.title));
      card.appendChild(el('p', 'encycl-desc', p.detail));
      grid.appendChild(card);
    });
    g.appendChild(grid);
    section.appendChild(g);
  });
  return section;
}

function renderCatalogSection(catalog) {
  const section = el('section', 'encycl-block');
  const groups = groupCatalogByCategory(catalog);
  section.appendChild(
    el('h3', 'encycl-block-title', `Catalog tools by domain (${catalog.length} · ${groups.length} categories)`),
  );
  groups.forEach(([cat, tools]) => {
    const block = el('details', 'encycl-cat');
    const sum = el('summary', 'encycl-cat-summary');
    sum.appendChild(el('span', 'encycl-cat-name', cat));
    sum.appendChild(el('span', 'encycl-cat-count', String(tools.length)));
    block.appendChild(sum);
    block.appendChild(renderExpandableToolChips(tools));
    section.appendChild(block);
  });
  return section;
}

function renderCategoriesOverview(catalog) {
  const section = el('section', 'encycl-block');
  const groups = groupCatalogByCategory(catalog);
  section.appendChild(el('h3', 'encycl-block-title', `Catalog domain index (${groups.length} categories)`));
  const grid = el('div', 'encycl-cat-index');
  groups.forEach(([cat, tools]) => {
    const row = el('div', 'encycl-cat-row');
    row.appendChild(el('code', null, cat));
    row.appendChild(el('span', 'encycl-cat-count', `${tools.length} tools`));
    row.appendChild(renderExpandableToolChips(tools));
    grid.appendChild(row);
  });
  section.appendChild(grid);
  return section;
}

function renderEncyclBody() {
  const root = document.getElementById('encycl-body');
  if (!root || !encyclData) return;
  root.innerHTML = '';
  const platform = window.THEJAD_PLATFORM_SPECIALTIES || [];
  const q = encyclQuery;

  const named = encyclData.named.filter((t) => matchesQuery(toolSearchBlob(t)));
  const prompts = encyclData.prompts.filter((p) => matchesQuery([p.name, p.desc].join(' ')));
  const catalog = encyclData.catalog.filter((t) => matchesQuery(toolSearchBlob(t)));
  const plat = platform.filter((p) =>
    matchesQuery([p.group, p.title, p.detail, p.id].join(' ')),
  );

  const show = (id) => encyclFilter === 'all' || encyclFilter === id;

  if (show('named') && named.length) root.appendChild(renderNamedSection(named));
  if (show('skills') && encyclData.skills?.length) {
    const sk = encyclData.skills.filter((s) =>
      matchesQuery([s.id, s.folder, s.uri, s.bundle].join(' ')),
    );
    if (sk.length) root.appendChild(renderSkillsEncyclSection(sk));
  }
  if (show('platform') && plat.length) root.appendChild(renderPlatformSection(plat));
  if (show('prompts') && prompts.length) root.appendChild(renderPromptsSection(prompts));
  if (show('categories')) root.appendChild(renderCategoriesOverview(catalog));
  if (show('catalog') && catalog.length) root.appendChild(renderCatalogSection(catalog));

  if (show('sources') && encyclData.externalSources?.groups) {
    const ext = { ...encyclData.externalSources, groups: encyclData.externalSources.groups.map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        matchesQuery([item.name, item.url, item.use, item.install, g.title].filter(Boolean).join(' ')),
      ),
    })).filter((g) => g.items.length) };
    if (ext.groups.length) {
      const section = el('section', 'encycl-block');
      section.appendChild(
        el('h3', 'encycl-block-title', `External sources (${encyclData.externalSources.totalCount})`),
      );
      section.appendChild(
        el('p', 'encycl-desc', 'Full list with links — see also #external-sources on this page.'),
      );
      const link = el('a', 'cta-outline', 'Jump to all sources ↓');
      link.href = '#external-sources';
      section.appendChild(link);
      ext.groups.forEach((group) => {
        const g = el('details', 'encycl-cat');
        const sum = el('summary', 'encycl-cat-summary');
        sum.appendChild(el('span', 'encycl-cat-name', group.title));
        sum.appendChild(el('span', 'encycl-cat-count', String(group.items.length)));
        g.appendChild(sum);
        const grid = el('div', 'encycl-chip-grid');
        group.items.forEach((item) => {
          const chip = el('span', 'encycl-chip', item.name);
          if (item.url) chip.title = item.url;
          grid.appendChild(chip);
        });
        g.appendChild(grid);
        section.appendChild(g);
      });
      root.appendChild(section);
    }
  }

  if (!root.children.length) {
    root.appendChild(el('p', 'encycl-empty', 'No specialties match your search.'));
  }
}

let sourcesQuery = '';

function renderExternalSources(ext) {
  const root = document.getElementById('sources-body');
  const summary = document.getElementById('sources-summary');
  if (!root || !ext?.groups) return;

  if (summary) {
    summary.innerHTML = '';
    const chip = el('div', 'encycl-stat-chip');
    chip.appendChild(el('strong', null, String(ext.totalCount)));
    chip.appendChild(el('span', null, 'attributed sources'));
    summary.appendChild(chip);
    const note = el('p', 'sources-note', ext.generatedFrom || '');
    note.appendChild(document.createTextNode(` · ${ext.thanks || 'Thanks to Theja'}`));
    summary.appendChild(note);
  }

  root.innerHTML = '';
  const q = sourcesQuery;

  ext.groups.forEach((group) => {
    const items = group.items.filter((item) => {
      if (!q) return true;
      const blob = [item.name, item.url, item.use, item.install, item.type, group.title]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
    if (!items.length) return;

    const block = el('section', 'sources-group');
    block.appendChild(el('h3', 'encycl-block-title', `${group.title} (${items.length})`));

    items.forEach((item) => {
      const card = el('article', 'source-card');
      const head = el('div', 'source-card-head');
      if (item.url) {
        const a = document.createElement('a');
        a.href = item.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'source-name';
        a.textContent = item.name;
        head.appendChild(a);
      } else {
        head.appendChild(el('strong', 'source-name', item.name));
      }
      if (item.type) head.appendChild(el('span', `source-type type-${item.type}`, item.type));
      card.appendChild(head);
      if (item.use) card.appendChild(el('p', 'encycl-desc', item.use));
      const meta = el('div', 'source-meta');
      if (item.branch) meta.appendChild(el('span', 'source-tag', `branch: ${item.branch}`));
      if (item.vendorPath) meta.appendChild(el('span', 'source-tag', item.vendorPath));
      if (item.npm) meta.appendChild(el('span', 'source-tag', item.npm));
      if (item.install) meta.appendChild(el('code', 'source-install', item.install));
      if (meta.childNodes.length) card.appendChild(meta);
      block.appendChild(card);
    });
    root.appendChild(block);
  });

  if (!root.children.length) {
    root.appendChild(el('p', 'encycl-empty', 'No sources match your search.'));
  }
}

function refreshMeshHubFromData(data) {
  const skillLabels = (data?.skills || []).map((s) => s.id).filter(Boolean);
  const extItems = (data?.externalSources?.groups || []).flatMap((g) => g.items || []);
  const repoShort = extItems
    .filter((i) => i.url && i.type === 'github')
    .map((i) => i.name.replace(/\s+ThejaD$/i, '').trim());
  buildMeshHub([...skillLabels.slice(0, 40), ...repoShort.slice(0, 20)]);
  buildMemoryMeshRing(DEFAULT_MEMORY_MESH);
}

async function loadEncyclopedia() {
  const body = document.getElementById('encycl-body');
  try {
    const res = await fetch('./specialties.generated.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    encyclData = await res.json();
    window.__thejadLimits = encyclData.limits;
    updateHeroStats(encyclData);
    refreshMeshHubFromData(encyclData);
    renderCoreCommands(encyclData.coreCommands || [], encyclData.limits);
    renderSkillsShowcase(encyclData.skills || []);
    const skillsSearch = document.getElementById('skills-search');
    if (skillsSearch) {
      skillsSearch.addEventListener('input', () => {
        skillsFilterQuery = skillsSearch.value.trim().toLowerCase();
        renderSkillsShowcase(encyclData.skills || []);
      });
    }
    renderExternalSources(encyclData.externalSources);
    renderEncyclSummary(encyclData);
    renderEncyclFilters();
    renderEncyclBody();

    const sourcesSearch = document.getElementById('sources-search');
    if (sourcesSearch) {
      sourcesSearch.addEventListener('input', () => {
        sourcesQuery = sourcesSearch.value.trim().toLowerCase();
        renderExternalSources(encyclData.externalSources);
      });
    }

    const search = document.getElementById('encycl-search');
    if (search) {
      search.addEventListener('input', () => {
        encyclQuery = search.value.trim().toLowerCase();
        renderEncyclBody();
      });
    }
  } catch (err) {
    if (body) {
      body.innerHTML = '';
      body.appendChild(
        el(
          'p',
          'encycl-error',
          `Could not load specialties.generated.json — run: node thejad/website/generate-specialties.mjs (${err.message})`,
        ),
      );
    }
  }
}

function initOrchestraFlowchart() {
  const el = document.getElementById('orchestra-flowchart');
  if (!el || typeof mermaid === 'undefined') return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#0c1229',
      primaryTextColor: '#e8eef9',
      primaryBorderColor: '#38bdf8',
      lineColor: '#38bdf8',
      secondaryColor: '#111a38',
      tertiaryColor: '#0a1628',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
    },
    flowchart: { curve: 'basis', htmlLabels: true },
  });
  mermaid.run({ nodes: [el] }).catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  buildMeshHub();
  buildGraphicalMemoryViz();
  buildMemoryMeshRing(DEFAULT_MEMORY_MESH);
  initOrchestraFlowchart();
  loadEncyclopedia();
});
