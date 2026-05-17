import fs from 'fs';
import path from 'path';
import { createHash, randomBytes } from 'crypto';
import { resolveDataDir } from './paths.mjs';

const POD_DIR = 'pod';

function podRoot() {
  const base = path.join(resolveDataDir(), POD_DIR);
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function configPath() {
  return path.join(podRoot(), 'config.json');
}

export function loadPodConfig() {
  const p = configPath();
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function savePodConfig(cfg) {
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2), 'utf8');
  return cfg;
}

/** Create ThejaD team pod (LAN + shared memory) — Hyperspace-compatible vision, no cloud required. */
export function initTeamPod(name, options = {}) {
  const existing = loadPodConfig();
  if (existing && !options.force) {
    return { ok: false, message: 'Pod exists — use thejad_pod_status or force', pod: existing };
  }
  const slug = String(name || 'team')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, 32);
  const cfg = {
    podId: slug,
    displayName: name || slug,
    secret: options.secret || randomBytes(16).toString('hex'),
    syncPort: Number(process.env.THEJAD_POD_SYNC_PORT || options.syncPort || 19090),
    peers: [],
    hyperspace: {
      gatewayUrl: process.env.HYPERSPACE_GATEWAY_URL || 'http://127.0.0.1:8080/v1',
      apiKey: process.env.HYPERSPACE_POD_API_KEY || '',
      slug: process.env.HYPERSPACE_POD_SLUG || '',
    },
    createdAt: new Date().toISOString(),
    version: 1,
  };
  savePodConfig(cfg);
  return { ok: true, pod: { podId: cfg.podId, syncPort: cfg.syncPort, peers: 0 }, hint: 'Run: node thejad/bin/thejad.js pod serve' };
}

export function addPeer(peerUrl, label) {
  const cfg = loadPodConfig();
  if (!cfg) return { ok: false, message: 'No pod — thejad_pod_init first' };
  const url = String(peerUrl || '').replace(/\/$/, '');
  if (!url.startsWith('http')) return { ok: false, message: 'peerUrl must be http(s) sync base, e.g. http://192.168.1.5:19090' };
  if (!cfg.peers.find((p) => p.url === url)) {
    cfg.peers.push({ url, label: label || url, addedAt: new Date().toISOString() });
    savePodConfig(cfg);
  }
  return { ok: true, peers: cfg.peers };
}

export function getPodStatus() {
  const cfg = loadPodConfig();
  if (!cfg) {
    return {
      joined: false,
      message: 'No team pod. MCP: thejad_pod_init — or join Hyperspace: curl -fsSL https://agents.hyper.space/cli | bash',
    };
  }
  return {
    joined: true,
    podId: cfg.podId,
    displayName: cfg.displayName,
    syncPort: cfg.syncPort,
    peerCount: cfg.peers.length,
    peers: cfg.peers,
    hyperspace: cfg.hyperspace,
    syncPath: path.join(podRoot(), 'shared-memory.json'),
    manifestPath: path.join(podRoot(), 'agent-manifest.json'),
  };
}

export function podAuthHeaders() {
  const cfg = loadPodConfig();
  if (!cfg?.secret) return {};
  return { 'X-ThejaD-Pod-Id': cfg.podId, 'X-ThejaD-Pod-Secret': cfg.secret };
}

export function verifyPodAuth(headers) {
  const cfg = loadPodConfig();
  if (!cfg) return false;
  return headers['x-thejad-pod-secret'] === cfg.secret && headers['x-thejad-pod-id'] === cfg.podId;
}

export function peerOllamaBases() {
  const cfg = loadPodConfig();
  const envPeers = (process.env.THEJAD_POD_PEERS || '')
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const fromCfg = (cfg?.peers || []).map((p) => {
    try {
      const u = new URL(p.url);
      return `http://${u.hostname}:11434`;
    } catch {
      return null;
    }
  });
  return [...new Set([...envPeers, ...fromCfg.filter(Boolean)])];
}
