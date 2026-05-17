import { listHyperspaceModels, hyperspaceGatewayReachable } from './hyperspace-bridge.mjs';
import { peerOllamaBases } from './team-pod.mjs';

async function listOllamaAt(baseUrl, label) {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tags`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const j = await res.json();
    return (j.models || []).map((m) => ({
      id: `ollama:${label}:${m.name}`,
      name: m.name,
      provider: 'ollama',
      type: 'offline',
      host: label,
      baseUrl,
    }));
  } catch {
    return [];
  }
}

/** All models: local Ollama + LAN peers + Hyperspace pod gateway (pods.hyper.space class). */
export async function listAllPodMeshModels() {
  const local = await listOllamaAt('http://127.0.0.1:11434', 'local');
  const peerBases = peerOllamaBases();
  const peerModels = [];
  for (const base of peerBases) {
    const label = base.includes('127.0.0.1') ? 'peer-local' : base;
    peerModels.push(...(await listOllamaAt(base, label)));
  }

  let hyperspace = { live: false, models: [] };
  const gw = await hyperspaceGatewayReachable();
  if (gw.ok) {
    const hs = await listHyperspaceModels();
    hyperspace = { live: true, models: hs.models || [], gateway: gw.baseUrl };
  }

  const all = [...local, ...peerModels, ...hyperspace.models.map((m) => ({ ...m, type: 'pod-gateway' }))];
  return {
    local: local.length,
    peers: peerModels.length,
    hyperspace: hyperspace.models.length,
    total: all.length,
    models: all,
    routing: ['hyperspace-gateway', 'local-ollama', 'peer-ollama', 'cursor-host'],
  };
}
