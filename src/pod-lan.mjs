import dgram from 'dgram';
import { addPeer, getPodStatus, loadPodConfig, podAuthHeaders } from './team-pod.mjs';

const DISCOVER_PORT = Number(process.env.THEJAD_POD_DISCOVER_PORT || 19091);
const BEACON = 'THEJAD_POD_DISCOVER_v1';

/** UDP LAN discovery — find other ThejaD pod sync servers on same network. */
export function discoverLanPeers(options = {}) {
  const timeoutMs = options.timeoutMs ?? 3500;
  const cfg = loadPodConfig();

  return new Promise((resolve) => {
    const found = new Map();
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    const done = () => {
      try {
        socket.close();
      } catch {
        /* ignore */
      }
      resolve({
        count: found.size,
        peers: [...found.values()],
      });
    };

    const timer = setTimeout(done, timeoutMs);

    socket.on('message', (msg, rinfo) => {
      try {
        const j = JSON.parse(msg.toString());
        if (j.type !== 'pong' || !j.syncUrl) return;
        if (cfg && j.podId === cfg.podId && rinfo.address === '127.0.0.1') return;
        const url = String(j.syncUrl).replace(/\/$/, '');
        if (!found.has(url)) {
          found.set(url, {
            url,
            podId: j.podId,
            host: rinfo.address,
            label: `lan-${rinfo.address}`,
          });
        }
      } catch {
        /* ignore */
      }
    });

    socket.on('error', () => done());

    socket.bind(() => {
      try {
        socket.setBroadcast(true);
      } catch {
        /* ignore */
      }
      const payload = Buffer.from(
        JSON.stringify({
          type: 'discover',
          beacon: BEACON,
          podId: cfg?.podId || 'unknown',
        }),
      );
      socket.send(payload, DISCOVER_PORT, '255.255.255.255', () => {});
    });
  });
}

export async function autoJoinLanPeers(options = {}) {
  const discovered = await discoverLanPeers(options);
  const added = [];
  for (const p of discovered.peers) {
    const r = addPeer(p.url, p.label);
    if (r.ok) added.push(p);
  }
  return { discovered: discovered.count, joined: added.length, peers: added };
}

/** Call from sync server when discover packet received. */
export function handleDiscoverMessage(msg, rinfo, syncPort) {
  try {
    const j = JSON.parse(msg.toString());
    if (j.type !== 'discover' || j.beacon !== BEACON) return null;
    const cfg = loadPodConfig();
    if (!cfg) return null;
    const host = rinfo.address;
    const syncUrl = `http://${host}:${syncPort || cfg.syncPort || 19090}`;
    return {
      type: 'pong',
      podId: cfg.podId,
      syncUrl,
      secretRequired: true,
    };
  } catch {
    return null;
  }
}

export async function probePeerHealth(peerUrl) {
  try {
    const res = await fetch(`${peerUrl.replace(/\/$/, '')}/health`, {
      headers: podAuthHeaders(),
      signal: AbortSignal.timeout(2000),
    });
    return { ok: res.ok, url: peerUrl };
  } catch (e) {
    return { ok: false, url: peerUrl, error: String(e.message || e) };
  }
}
