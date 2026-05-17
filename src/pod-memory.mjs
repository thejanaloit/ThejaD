import fs from 'fs';
import path from 'path';
import { getPodStatus, loadPodConfig, podAuthHeaders, savePodConfig } from './team-pod.mjs';
import { resolveDataDir } from './paths.mjs';

function memoryPath() {
  const st = getPodStatus();
  if (!st.joined) return path.join(resolveDataDir(), 'memory.json');
  return st.syncPath;
}

function loadShared() {
  const p = memoryPath();
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveShared(data) {
  const p = memoryPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

export function podMemoryStore(key, value, meta = {}) {
  const data = loadShared();
  data[key] = {
    value,
    at: new Date().toISOString(),
    by: meta.by || process.env.USERNAME || 'member',
    ...meta,
  };
  saveShared(data);
  return { stored: key, scope: getPodStatus().joined ? 'pod-shared' : 'local' };
}

export function podMemorySearch(query) {
  const q = String(query || '').toLowerCase();
  const data = loadShared();
  const hits = Object.entries(data)
    .filter(([k, v]) => k.toLowerCase().includes(q) || String(v.value || '').toLowerCase().includes(q))
    .map(([k, v]) => ({ key: k, ...v }));
  return { hits, scope: getPodStatus().joined ? 'pod-shared' : 'local' };
}

/** Pull shared memory from all peer sync servers and merge (newest wins per key). */
export async function podMemorySync() {
  const cfg = loadPodConfig();
  if (!cfg) return { ok: false, message: 'No pod configured' };

  const local = loadShared();
  const merged = { ...local };
  const results = [];

  for (const peer of cfg.peers) {
    try {
      const res = await fetch(`${peer.url.replace(/\/$/, '')}/memory`, {
        headers: podAuthHeaders(),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        results.push({ peer: peer.url, ok: false, status: res.status });
        continue;
      }
      const remote = await res.json();
      for (const [k, v] of Object.entries(remote)) {
        if (!merged[k] || new Date(v.at) > new Date(merged[k].at)) merged[k] = v;
      }
      results.push({ peer: peer.url, ok: true, keys: Object.keys(remote).length });
    } catch (e) {
      results.push({ peer: peer.url, ok: false, error: String(e.message || e).slice(0, 80) });
    }
  }

  saveShared(merged);
  return { ok: true, totalKeys: Object.keys(merged).length, peers: results };
}

export function exportMemorySnapshot() {
  return { memory: loadShared(), exportedAt: new Date().toISOString() };
}
