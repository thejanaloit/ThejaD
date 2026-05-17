import { execSync } from 'child_process';
import { getPodStatus, loadPodConfig } from './team-pod.mjs';

function gatewayConfig() {
  const cfg = loadPodConfig();
  const url =
    process.env.HYPERSPACE_GATEWAY_URL ||
    cfg?.hyperspace?.gatewayUrl ||
    'http://127.0.0.1:8080/v1';
  const apiKey = process.env.HYPERSPACE_POD_API_KEY || cfg?.hyperspace?.apiKey || '';
  return { baseUrl: url.replace(/\/$/, ''), apiKey };
}

export async function hyperspaceGatewayReachable() {
  const { baseUrl, apiKey } = gatewayConfig();
  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, status: res.status, baseUrl };
  } catch (e) {
    return { ok: false, error: String(e.message || e), baseUrl };
  }
}

export async function listHyperspaceModels() {
  const reach = await hyperspaceGatewayReachable();
  if (!reach.ok) return { live: false, ...reach, install: 'curl -fsSL https://agents.hyper.space/cli | bash' };
  const { baseUrl, apiKey } = gatewayConfig();
  const res = await fetch(`${baseUrl}/models`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
  });
  const j = await res.json();
  return {
    live: true,
    baseUrl,
    models: (j.data || []).map((m) => ({ id: m.id, provider: 'hyperspace-pod' })),
  };
}

export async function hyperspaceChat(prompt, options = {}) {
  const { baseUrl, apiKey } = gatewayConfig();
  if (!apiKey && !options.allowNoKey) {
    return {
      mock: true,
      message: 'Set HYPERSPACE_POD_API_KEY (pk_* from hyperspace pod keys create)',
      gateway: baseUrl,
    };
  }
  const model = options.model || process.env.HYPERSPACE_POD_MODEL || 'llama3.2';
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? 120000),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens ?? 2048,
      }),
    });
    if (!res.ok) return { ok: false, status: res.status, body: await res.text().catch(() => '') };
    const j = await res.json();
    return {
      ok: true,
      model,
      content: j.choices?.[0]?.message?.content || '',
      source: 'hyperspace-gateway',
    };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

export function hyperspaceCliStatus() {
  try {
    const ver = execSync('hyperspace --version', { encoding: 'utf8', timeout: 5000 }).trim();
    const pod = execSync('hyperspace pod status --json', { encoding: 'utf8', timeout: 10000 }).trim();
    return { installed: true, version: ver, podStatus: JSON.parse(pod) };
  } catch {
    return {
      installed: false,
      install: 'curl -fsSL https://agents.hyper.space/cli | bash',
      docs: 'https://pods.hyper.space/',
    };
  }
}

export async function hyperspacePodStatus() {
  const cli = hyperspaceCliStatus();
  const gw = await hyperspaceGatewayReachable();
  const models = gw.ok ? await listHyperspaceModels() : null;
  return { cli, gateway: gw, models, podConfig: getPodStatus() };
}
