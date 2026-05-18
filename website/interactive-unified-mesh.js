/** Unified zoomable mesh: dense hub + memory ring + graphical memory + interactive Cursor */
(function () {
  const CX = 500;
  const CY = 500;
  const MEMORY_RING = [
    { id: 'graphify', label: 'Graphify', angle: -90, primary: true },
    { id: 'local-memory', label: 'Local', angle: -60 },
    { id: 'pod-memory', label: 'Pod', angle: -30 },
    { id: 'device-index', label: 'Device', angle: 0 },
    { id: 'skills', label: 'Skills', angle: 30 },
    { id: 'limits', label: 'Limits', angle: 60 },
    { id: 'coordination', label: 'Claims', angle: 90 },
    { id: 'notebooklm', label: 'NLM', angle: 120 },
    { id: 'hyperspace', label: 'Hyperspace', angle: 150 },
    { id: 'ollama', label: 'Ollama', angle: 180 },
    { id: 'docs', label: 'Docs', angle: 210 },
    { id: 'swarm', label: 'Ruflo', angle: 240 },
  ];

  const MAJOR = [
    { id: 'cursor', label: 'Cursor', angle: -90, interactive: true },
    { id: 'pod', label: 'LAN pod', angle: -42 },
    { id: 'hyperspace', label: 'Hyperspace', angle: 6 },
    { id: 'notebooklm', label: 'NotebookLM', angle: 54 },
    { id: 'ruflo', label: 'Ruflo', angle: 102 },
    { id: 'index', label: 'Device', angle: 150 },
    { id: 'skills', label: 'Skills', angle: 198 },
    { id: 'memory', label: 'Memory', angle: 246 },
  ];

  const NODE_INFO = {
    thejad: {
      title: 'ThejaD — graphical memory hub',
      body: 'All mesh paths merge here. runOrchestra reads the locked graphical memory snapshot, then routes to team roles and tools.',
      locks: ['podMemorySync before every orchestra pass'],
    },
    mamaThejana: {
      title: 'mamaThejana — tier lock',
      body: 'Unlock phrase → 100% tier (all catalog, NotebookLM, smokes). Stays until nothejad unlock or THEJAD_FULL_ACCESS=1 in MCP env.',
      locks: ['Session tier lock via thejad_unlock'],
    },
    cursor: {
      title: 'Cursor — interactive host',
      body: 'Your IDE agent runs here. MCP stdio + beforeSubmitPrompt hook sends every prompt to thejad_orchestrate. Click Focus Cursor to zoom this lane.',
      locks: ['Hook order: podMemorySync lock → then orchestra'],
    },
    graphify: {
      title: 'Graphical memory (Graphify)',
      body: 'graphify-out/ knowledge graph — files, routes, services as nodes. Primary graphical memory spine.',
      locks: ['Re-index on graphify . — graph version is point-in-time'],
    },
    'pod-memory': {
      title: 'Pod memory + LWW lock',
      body: 'shared-memory.json across LAN. podMemorySync merges peers: newest at timestamp wins per key.',
      locks: ['Per-key last-write-wins (LWW) lock on sync'],
    },
    coordination: {
      title: 'Coordination claim lock',
      body: 'coordination_claim / release locks paths so Cursor, Copilot, and Antigravity do not edit the same files.',
      locks: ['Lane lock in active-claims.json'],
    },
  };

  let meshState = { scale: 1, tx: 0, ty: 0, activeId: null };
  let viewportEl = null;
  let rootG = null;
  let stageEl = null;

  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function applyTransform() {
    if (!viewportEl) return;
    viewportEl.style.transform = `translate(${meshState.tx}px, ${meshState.ty}px) scale(${meshState.scale})`;
  }

  function showDetail(id) {
    const panel = document.getElementById('mesh-detail-panel');
    if (!panel) return;
    const info = NODE_INFO[id] || {
      title: id,
      body: 'Part of the unified graphical memory mesh.',
      locks: [],
    };
    panel.classList.remove('hidden');
    panel.innerHTML = '';
    panel.appendChild(Object.assign(document.createElement('h4'), { textContent: info.title }));
    panel.appendChild(Object.assign(document.createElement('p'), { textContent: info.body }));
    if (info.locks?.length) {
      const ul = document.createElement('ul');
      info.locks.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
      panel.appendChild(ul);
    }
    meshState.activeId = id;
    rootG?.querySelectorAll('[data-mesh-node]').forEach((n) => {
      n.classList.toggle('mesh-node-active', n.getAttribute('data-mesh-node') === id);
    });
  }

  function focusNode(id, scale = 1.65) {
    const node = rootG?.querySelector(`[data-mesh-node="${id}"]`);
    if (!node || !stageEl) return;
    const cx = Number(node.getAttribute('data-cx'));
    const cy = Number(node.getAttribute('data-cy'));
    const rect = stageEl.getBoundingClientRect();
    meshState.scale = scale;
    meshState.tx = rect.width / 2 - cx * scale;
    meshState.ty = rect.height / 2 - cy * scale;
    applyTransform();
    showDetail(id);
  }

  function resetView() {
    meshState = { scale: 1, tx: 0, ty: 0, activeId: null };
    applyTransform();
    document.getElementById('mesh-detail-panel')?.classList.add('hidden');
    rootG?.querySelectorAll('.mesh-node-active').forEach((n) => n.classList.remove('mesh-node-active'));
  }

  function zoom(delta) {
    meshState.scale = Math.min(3, Math.max(0.35, meshState.scale + delta));
    applyTransform();
  }

  function bindControls() {
    document.getElementById('mesh-zoom-in')?.addEventListener('click', () => zoom(0.2));
    document.getElementById('mesh-zoom-out')?.addEventListener('click', () => zoom(-0.2));
    document.getElementById('mesh-zoom-reset')?.addEventListener('click', resetView);
    document.getElementById('mesh-focus-cursor')?.addEventListener('click', () => focusNode('cursor', 1.9));
    document.getElementById('mesh-focus-thejad')?.addEventListener('click', () => focusNode('thejad', 1.5));
    document.getElementById('mesh-focus-mama')?.addEventListener('click', () => focusNode('mamaThejana', 2.1));
  }

  function bindPanZoom() {
    if (!stageEl) return;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    stageEl.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        zoom(e.deltaY < 0 ? 0.12 : -0.12);
      },
      { passive: false },
    );

    stageEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('[data-mesh-node]')) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stageEl.classList.add('is-panning');
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      meshState.tx += e.clientX - lastX;
      meshState.ty += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      stageEl?.classList.remove('is-panning');
    });
  }

  function addNode(g, ns, cfg) {
    const p = polar(CX, CY, cfg.r, cfg.angle);
    const hit = document.createElementNS(ns, 'circle');
    hit.setAttribute('class', cfg.className);
    hit.setAttribute('cx', p.x);
    hit.setAttribute('cy', p.y);
    hit.setAttribute('r', cfg.hitR);
    hit.setAttribute('data-mesh-node', cfg.id);
    hit.setAttribute('data-cx', p.x);
    hit.setAttribute('data-cy', p.y);
    if (cfg.interactive) hit.setAttribute('tabindex', '0');
    hit.style.cursor = cfg.interactive ? 'pointer' : 'default';
    hit.addEventListener('click', (e) => {
      e.stopPropagation();
      focusNode(cfg.id, cfg.id === 'cursor' ? 1.9 : 1.55);
    });
    g.appendChild(hit);

    if (cfg.label) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', p.x);
      t.setAttribute('y', p.y + 4);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', cfg.labelClass || 'mesh-label');
      t.textContent = cfg.label;
      g.appendChild(t);
    }
    if (cfg.linkCenter && cfg.linkLayer) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('class', 'mesh-spoke');
      line.setAttribute('x1', CX);
      line.setAttribute('y1', CY);
      line.setAttribute('x2', p.x);
      line.setAttribute('y2', p.y);
      cfg.linkLayer.appendChild(line);
    }
    return p;
  }

  function buildMicroLayer(g, ns, labels) {
    const rings = [
      { r: 88, count: 16 },
      { r: 132, count: 24 },
      { r: 178, count: 30 },
      { r: 228, count: 36 },
      { r: 282, count: 42 },
      { r: 338, count: 48 },
      { r: 395, count: 54 },
    ];
    let idx = 0;
    rings.forEach((ring) => {
      for (let j = 0; j < ring.count; j++) {
        const angle = (360 / ring.count) * j + ((idx * 13) % 17) - 8;
        const r = ring.r + ((idx * 7) % 5) * 4 - 8;
        const p = polar(CX, CY, r, angle);
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('class', 'mesh-micro');
        c.setAttribute('cx', p.x);
        c.setAttribute('cy', p.y);
        c.setAttribute('r', '3.5');
        c.setAttribute('data-label', labels[idx % labels.length] || '');
        g.appendChild(c);
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('class', 'mesh-micro-link');
        line.setAttribute('x1', CX);
        line.setAttribute('y1', CY);
        line.setAttribute('x2', p.x);
        line.setAttribute('y2', p.y);
        g.appendChild(line);
        idx++;
      }
    });
  }

  function buildGraphPath(g, ns) {
    const pts = [
      polar(CX, CY, 420, 200),
      polar(CX, CY, 350, 170),
      polar(CX, CY, 280, 150),
      polar(CX, CY, 200, 130),
    ];
    const path = document.createElementNS(ns, 'path');
    path.setAttribute(
      'class',
      'gm-flow-path',
    );
    path.setAttribute(
      'd',
      `M${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y} L${pts[2].x},${pts[2].y} L${pts[3].x},${pts[3].y} L${CX},${CY}`,
    );
    g.appendChild(path);
    const labels = ['Repo', 'Graphify', 'Mesh', 'ThejaD'];
    pts.forEach((p, i) => {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', p.x);
      t.setAttribute('y', p.y - 8);
      t.setAttribute('class', 'gm-flow-label');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = labels[i];
      g.appendChild(t);
    });
  }

  window.buildUnifiedInteractiveMesh = function buildUnifiedInteractiveMesh(extraLabels = []) {
    const host = document.getElementById('mesh-viewport');
    if (!host) return;
    host.innerHTML = '';
    stageEl = document.getElementById('mesh-stage');

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 1000');
    svg.setAttribute('class', 'unified-mesh-svg');

    const defs = document.createElementNS(ns, 'defs');
    const grad = document.createElementNS(ns, 'radialGradient');
    grad.setAttribute('id', 'hubGradUnified');
    grad.innerHTML =
      '<stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0c1229"/>';
    defs.appendChild(grad);
    svg.appendChild(defs);

    rootG = document.createElementNS(ns, 'g');
    rootG.setAttribute('class', 'mesh-root-g');
    const linkLayer = document.createElementNS(ns, 'g');
    const nodeLayer = document.createElementNS(ns, 'g');

    buildGraphPath(linkLayer, ns);
    buildMicroLayer(linkLayer, ns, [...(window.MESH_MICRO_LABELS || []), ...extraLabels]);

    const ringGuide = document.createElementNS(ns, 'circle');
    ringGuide.setAttribute('class', 'mesh-ring-guide');
    ringGuide.setAttribute('cx', CX);
    ringGuide.setAttribute('cy', CY);
    ringGuide.setAttribute('r', '200');
    linkLayer.appendChild(ringGuide);

    MEMORY_RING.forEach((n) => {
      addNode(nodeLayer, ns, {
        id: n.id,
        label: n.label,
        angle: n.angle,
        r: 200,
        hitR: n.primary ? 24 : 18,
        className: `mesh-ring-node${n.primary ? ' mesh-ring-primary' : ''}`,
        labelClass: 'mesh-ring-label',
        linkCenter: true,
        linkLayer,
        interactive: true,
      });
    });

    MAJOR.forEach((n) => {
      addNode(nodeLayer, ns, {
        id: n.id,
        label: n.label,
        angle: n.angle,
        r: 268,
        hitR: n.interactive ? 34 : 26,
        className: `mesh-major-node${n.interactive ? ' mesh-node-cursor' : ''}`,
        labelClass: 'mesh-major-label',
        linkCenter: true,
        linkLayer,
        interactive: n.interactive || true,
      });
    });

    addNode(nodeLayer, ns, {
      id: 'mamaThejana',
      label: 'mamaThejana',
      angle: -118,
      r: 95,
      hitR: 22,
      className: 'mesh-mama-node',
      labelClass: 'mesh-mama-label',
      linkCenter: true,
      linkLayer,
      interactive: true,
    });

    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('class', 'mesh-core-halo');
    halo.setAttribute('cx', CX);
    halo.setAttribute('cy', CY);
    halo.setAttribute('r', '55');
    nodeLayer.appendChild(halo);

    const core = document.createElementNS(ns, 'circle');
    core.setAttribute('class', 'mesh-core-node');
    core.setAttribute('cx', CX);
    core.setAttribute('cy', CY);
    core.setAttribute('r', '44');
    core.setAttribute('fill', 'url(#hubGradUnified)');
    core.setAttribute('data-mesh-node', 'thejad');
    core.setAttribute('data-cx', CX);
    core.setAttribute('data-cy', CY);
    core.style.cursor = 'pointer';
    core.addEventListener('click', (e) => {
      e.stopPropagation();
      focusNode('thejad', 1.5);
    });
    nodeLayer.appendChild(core);

    const coreText = document.createElementNS(ns, 'text');
    coreText.setAttribute('x', CX);
    coreText.setAttribute('y', CY + 5);
    coreText.setAttribute('text-anchor', 'middle');
    coreText.setAttribute('class', 'mesh-core-label');
    coreText.textContent = 'ThejaD';
    nodeLayer.appendChild(coreText);

    rootG.appendChild(linkLayer);
    rootG.appendChild(nodeLayer);
    svg.appendChild(rootG);
    host.appendChild(svg);

    viewportEl = host;
    resetView();
    bindControls();
    bindPanZoom();

    const labelsEl = document.getElementById('hub-labels');
    if (labelsEl) {
      labelsEl.innerHTML = '';
      const summary = document.createElement('div');
      summary.className = 'hub-mesh-summary';
      summary.innerHTML =
        '<strong>Interactive</strong> · drag pan · wheel zoom · <span class="mesh-btn-cursor" style="padding:0;border:none">Cursor</span> · ThejaD · mamaThejana';
      labelsEl.appendChild(summary);
      ['Cursor host LLM', 'Graphify graphical memory', 'Pod LWW lock', 'mamaThejana 100%'].forEach((t) => {
        const lbl = document.createElement('span');
        lbl.className = 'hub-label';
        lbl.textContent = t;
        labelsEl.appendChild(lbl);
      });
    }
  };
})();
