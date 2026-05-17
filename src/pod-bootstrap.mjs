import { exportAgentManifest, applyAgentManifest } from './agent-parity.mjs';
import { unlockWithPhrase } from './capability.mjs';
import { hyperspaceGatewayReachable } from './hyperspace-bridge.mjs';
import { podMemorySync } from './pod-memory.mjs';
import { autoJoinLanPeers, discoverLanPeers } from './pod-lan.mjs';
import { listAllPodMeshModels } from './pod-models.mjs';
import { ensureSetupReady } from './setup.mjs';
import { getPodStatus, initTeamPod, loadPodConfig } from './team-pod.mjs';

async function checkOllama() {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Zero-touch pod bootstrap: init → LAN discover → join → manifest → memory sync → max tier.
 */
export async function runPodBootstrap(options = {}) {
  const steps = [];

  if (!loadPodConfig()) {
    const name = process.env.THEJAD_POD_NAME || options.name || 'thejad-team';
    steps.push({ step: 'init', result: initTeamPod(name, { force: !!options.force }) });
  } else {
    steps.push({ step: 'init', result: { ok: true, skipped: true } });
  }

  if (options.discover !== false) {
    const join = await autoJoinLanPeers({ timeoutMs: options.discoverTimeoutMs ?? 4000 });
    steps.push({ step: 'lan_auto_join', result: join });
  }

  steps.push({ step: 'agent_manifest', result: exportAgentManifest() });
  applyAgentManifest();

  try {
    steps.push({ step: 'memory_sync', result: await podMemorySync() });
  } catch (e) {
    steps.push({ step: 'memory_sync', result: { ok: false, error: String(e.message || e) } });
  }

  const phrase = process.env.THEJAD_UNLOCK_PHRASE?.trim();
  if (phrase) {
    steps.push({ step: 'unlock', result: unlockWithPhrase(phrase) });
  } else if (process.env.THEJAD_FULL_ACCESS === '1' || process.env.THEJAD_FULL_ACCESS === 'true') {
    steps.push({ step: 'unlock', result: { ok: true, tier: 'maximum', via: 'THEJAD_FULL_ACCESS' } });
  }

  const mesh = await listAllPodMeshModels();
  const ollama = await checkOllama();
  const gw = await hyperspaceGatewayReachable();
  steps.push({
    step: 'inference_paths',
    ollama,
    hyperspaceGateway: gw.ok,
    meshModels: mesh.total,
  });

  const setup = await ensureSetupReady();
  steps.push({ step: 'setup', ready: setup.ready });

  return {
    ok: true,
    pod: getPodStatus(),
    steps,
    message:
      'Pod bootstrap complete. Reload Cursor MCP to refresh tool list (1400+ tools). LAN peers auto-joined when pod serve is running on other devices.',
  };
}
