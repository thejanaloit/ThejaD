# ThejaD MCP

LOLC Internet Banking agent orchestration for **Cursor**, **Claude**, **Antigravity**, and **Copilot**.

## Install (paste GitHub link)

1. Clone or open your project (e.g. Internet Banking monorepo).
2. In **Cursor → Settings → MCP → Add server**, or merge into `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ThejaD": {
      "command": "node",
      "args": ["PATH/TO/thejad/bin/thejad.js", "mcp", "start"],
      "env": { "THEJAD_REPO_ROOT": "PATH/TO/internetBanking" }
    }
  }
}
```

3. Or from repo root: `node thejad/bin/thejad.js init`
4. Restart **Agent** mode.

## Capability

| Mode | % | How |
|------|---|-----|
| Default | 80% | Standard tools |
| Maximum | 100% | `thejad_unlock` with friends phrase, or `THEJAD_FULL_ACCESS=1` |

## Includes

- Multi-tool coordination (no collision file + log handoff format)
- LOLCDL story traceability lookup
- Payment limits + programme scope
- Ollama bridge (local), NotebookLM + Figma stubs
- Daily diary, Antigravity ↔ Cursor handoff
- Plans: UI routes, backend services

## Pending owner input

See `requested.md`.

---

Thanks to Theja
