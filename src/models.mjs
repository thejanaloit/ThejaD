import { readJson } from './paths.mjs';

const ONLINE_CATALOG = [
  { id: 'cursor-host', provider: 'cursor', type: 'online', note: 'Primary orchestration LLM (this session)' },
  { id: 'openai-gpt', provider: 'openai', type: 'online', env: 'OPENAI_API_KEY', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' },
  { id: 'anthropic-claude', provider: 'anthropic', type: 'online', env: 'ANTHROPIC_API_KEY', model: 'claude-sonnet' },
];

async function listOllamaModels() {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const j = await res.json();
    return (j.models || []).map((m) => ({
      id: `ollama:${m.name}`,
      name: m.name,
      provider: 'ollama',
      type: 'offline',
      size: m.size,
      status: 'listed',
    }));
  } catch {
    const usable = readJson('data/device-usable.json');
    const names = usable.ollamaModels || [];
    return names.map((name) => ({
      id: `ollama:${name}`,
      name,
      provider: 'ollama',
      type: 'offline',
      status: 'cached-from-device-index',
    }));
  }
}

async function warmOllamaModel(name) {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: name,
        prompt: 'ping',
        stream: false,
        options: { num_predict: 1 },
      }),
    });
    return { name, warmed: res.ok };
  } catch (e) {
    return { name, warmed: false, error: String(e.message || e).slice(0, 80) };
  }
}

/** Start / enumerate offline + online models for orchestra routing. */
export async function startAllModels(options = {}) {
  const warm = options.warm !== false;
  const maxWarm = options.maxWarmOllama ?? 2;

  const offline = await listOllamaModels();
  const online = ONLINE_CATALOG.map((m) => ({
    ...m,
    available: m.env ? Boolean(process.env[m.env]?.trim()) : true,
    status: m.env ? (process.env[m.env]?.trim() ? 'ready' : 'missing-env') : 'ready',
  }));

  const warmResults = [];
  if (warm && offline.length) {
    for (const m of offline.slice(0, maxWarm)) {
      warmResults.push(await warmOllamaModel(m.name));
    }
  }

  return {
    startedAt: new Date().toISOString(),
    offline: { count: offline.length, models: offline, warmed: warmResults },
    online: { count: online.length, models: online },
    total: offline.length + online.length,
    hint: offline.length === 0 ? 'Install Ollama and run: ollama pull llama3.2' : null,
  };
}

export function pickModelForAssignment(assignment, modelsStarted) {
  const offline = modelsStarted?.offline?.models || [];
  const online = (modelsStarted?.online?.models || []).filter((m) => m.available !== false && m.status === 'ready');

  const preferOffline = assignment.preferOffline;
  const defaultOllama =
    offline.find((m) => /llama3/i.test(m.name))?.name ||
    offline[0]?.name ||
    process.env.THEJAD_OLLAMA_MODEL ||
    'llama3.2';

  if (preferOffline && offline.length) {
    return {
      primary: { id: `ollama:${defaultOllama}`, type: 'offline', provider: 'ollama', model: defaultOllama },
      secondary: online[0] || { id: 'cursor-host', type: 'online', provider: 'cursor' },
    };
  }

  return {
    primary: online[0] || { id: 'cursor-host', type: 'online', provider: 'cursor' },
    secondary: offline.length
      ? { id: `ollama:${defaultOllama}`, type: 'offline', provider: 'ollama', model: defaultOllama }
      : null,
  };
}
