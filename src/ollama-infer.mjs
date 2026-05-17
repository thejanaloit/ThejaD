const ROLES = ['thejana', 'lahiru', 'geesara', 'sachini', 'security', 'backend'];

export async function ollamaGenerate(model, prompt, options = {}) {
  const res = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(options.timeoutMs ?? 25000),
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { num_predict: options.maxTokens ?? 256, temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const j = await res.json();
  return String(j.response || '').trim();
}

export async function pickDefaultOllamaModel() {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return process.env.THEJAD_OLLAMA_MODEL || 'llama3.2';
    const j = await res.json();
    const names = (j.models || []).map((m) => m.name);
    return (
      names.find((n) => /llama3/i.test(n)) ||
      names[0] ||
      process.env.THEJAD_OLLAMA_MODEL ||
      'llama3.2'
    );
  } catch {
    return process.env.THEJAD_OLLAMA_MODEL || 'llama3.2';
  }
}

/** Offline model: role classification + one-line plan. */
export async function ollamaOrchestraPass(userPrompt, keywordRoleId) {
  const model = await pickDefaultOllamaModel();
  const sys = `You route LOLC internet banking dev tasks. Reply with ONLY valid JSON, no markdown.
Schema: {"role":"thejana|lahiru|geesara|sachini|security|backend","plan":"one sentence"}`;
  const prompt = `${sys}\n\nKeyword hint role: ${keywordRoleId}\nTask: ${userPrompt.slice(0, 1500)}`;
  try {
    const raw = await ollamaGenerate(model, prompt, { maxTokens: 120 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    const role = ROLES.includes(parsed.role) ? parsed.role : keywordRoleId;
    return { model, source: 'ollama', role, plan: parsed.plan || '', raw: raw.slice(0, 300) };
  } catch (e) {
    return { model, source: 'ollama', error: String(e.message || e), role: keywordRoleId, plan: null };
  }
}

/** Short draft for BA/QA lanes (token-saving summary). */
export async function ollamaDraftSummary(userPrompt, roleId) {
  const model = await pickDefaultOllamaModel();
  const prompt = `Role ${roleId}. In 3 bullet points max, outline approach for:\n${userPrompt.slice(0, 800)}`;
  try {
    return { model, draft: await ollamaGenerate(model, prompt, { maxTokens: 200 }) };
  } catch (e) {
    return { model, error: String(e.message || e) };
  }
}

/** Optional OpenAI classification when OPENAI_API_KEY set. */
export async function openaiOrchestraPass(userPrompt, keywordRoleId) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { source: 'openai', skipped: true };

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 120,
        messages: [
          {
            role: 'system',
            content:
              'Reply JSON only: {"role":"thejana|lahiru|geesara|sachini|security|backend","plan":"one sentence"}',
          },
          { role: 'user', content: `Hint: ${keywordRoleId}\nTask: ${userPrompt.slice(0, 1200)}` },
        ],
      }),
    });
    if (!res.ok) return { source: 'openai', error: `HTTP ${res.status}` };
    const j = await res.json();
    const raw = j.choices?.[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    const role = ROLES.includes(parsed.role) ? parsed.role : keywordRoleId;
    return { source: 'openai', model, role, plan: parsed.plan || '', raw: raw.slice(0, 300) };
  } catch (e) {
    return { source: 'openai', error: String(e.message || e) };
  }
}

export function mergeRoleVotes(keywordRoleId, keywordScores, ollamaPass, openaiPass) {
  const votes = { [keywordRoleId]: keywordScores.find((s) => s.roleId === keywordRoleId)?.score || 1 };
  if (ollamaPass?.role && !ollamaPass.error) votes[ollamaPass.role] = (votes[ollamaPass.role] || 0) + 3;
  if (openaiPass?.role && !openaiPass.error) votes[openaiPass.role] = (votes[openaiPass.role] || 0) + 2;

  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const roleId = sorted[0]?.[0] || keywordRoleId;
  return {
    roleId,
    votes,
    consensus: sorted.length > 1 && sorted[0][1] === sorted[1][1] ? 'split' : 'clear',
    inputs: { keyword: keywordRoleId, ollama: ollamaPass?.role, openai: openaiPass?.role },
  };
}
