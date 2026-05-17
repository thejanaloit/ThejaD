#!/usr/bin/env node
/** LAN sync server — shared memory + agent manifest + UDP discover for ThejaD team pod */
import fs from 'fs';
import http from 'http';
import dgram from 'dgram';
import { bootstrapEnv } from '../src/env-bootstrap.mjs';
import { exportAgentManifest } from '../src/agent-parity.mjs';
import { handleDiscoverMessage } from '../src/pod-lan.mjs';
import { exportMemorySnapshot } from '../src/pod-memory.mjs';
import { getPodStatus, loadPodConfig, verifyPodAuth } from '../src/team-pod.mjs';

bootstrapEnv();

const cfg = loadPodConfig();
if (!cfg) {
  console.error('[ThejaD] No pod — run thejad_pod_init via MCP first');
  process.exit(1);
}

const port = Number(process.env.THEJAD_POD_SYNC_PORT || cfg.syncPort || 19090);
const discoverPort = Number(process.env.THEJAD_POD_DISCOVER_PORT || 19091);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, podId: cfg.podId, syncPort: port }));
    return;
  }

  if (!verifyPodAuth(req.headers)) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'X-ThejaD-Pod-Secret required' }));
    return;
  }

  if (req.url === '/memory' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(exportMemorySnapshot().memory));
    return;
  }

  if (req.url === '/manifest' && req.method === 'GET') {
    exportAgentManifest();
    const st = getPodStatus();
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(fs.readFileSync(st.manifestPath, 'utf8'));
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[ThejaD Pod] sync server pod=${cfg.podId} http://0.0.0.0:${port}`);
  console.log('[ThejaD Pod] GET /memory /manifest — headers X-ThejaD-Pod-Id + X-ThejaD-Pod-Secret');
});

const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
udp.on('message', (msg, rinfo) => {
  const pong = handleDiscoverMessage(msg, rinfo, port);
  if (!pong) return;
  const out = Buffer.from(JSON.stringify(pong));
  udp.send(out, rinfo.port, rinfo.address, () => {});
});
udp.on('error', (e) => console.warn('[ThejaD Pod] discover UDP:', e.message));
udp.bind(discoverPort, '0.0.0.0', () => {
  console.log(`[ThejaD Pod] LAN discover listening udp://0.0.0.0:${discoverPort}`);
});
