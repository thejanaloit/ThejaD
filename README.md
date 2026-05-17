# ThejaD MCP — LOLC Internet Banking AI Engineering Platform

**ThejaD** is the unified MCP server for the [LOLC Internet Banking](https://github.com/thejanaloit/LOLCDevelopmentAi50ThejaD) programme: **60+ AI orchestrator patterns**, **1000+ tools**, **85+ prompts**, **persistent memory**, **multi-user coordination without collisions**, **token-efficient workflows**, **offline models**, and **multi-MCP** operation beside Ruflo, Figma, and Claude plugins.

> Example headline: *“60+ AI orchestra agents, shared memory, five engineers one codebase — no stepping on each other.”*

---

## Quick stats (v4.0)

| Capability | Example scale |
|------------|----------------|
| MCP tools | **1000+** (274 core + 731 LOLC/vendor bulk + named tools) |
| AI orchestrator / agent patterns | **60+** (`agent_spawn_*`, swarm, ruflo_compat, mesh, consensus, workers) |
| Prompts | **85+** (team, FusionX, security, imported vendor skills) |
| Resources | **219+** programme docs (`thejad://doc/...`) |
| Imported vendor skills | **30** (Superpowers, Graphify, Claude-mem, …) |
| Engineering team personas | **6** (50+ years collective framing) |

Run `node bin/thejad.js stats` after install.

---

## Install

### 1. Cursor MCP

```json
{
  "mcpServers": {
    "ThejaD": {
      "command": "node",
      "args": ["PATH/TO/thejad/bin/thejad.js", "mcp", "start"],
      "env": {
        "THEJAD_REPO_ROOT": "PATH/TO/internetBanking",
        "npm_config_update_notifier": "false"
      }
    }
  }
}
```

Or from your monorepo root:

```bash
node thejad/bin/thejad.js init
```

Restart **Cursor Agent** mode.

### 2. Download all integrated GitHub repos + skills

```powershell
powershell -ExecutionPolicy Bypass -File thejad/install/install-engineering-plugins.ps1
```

This clones vendors into `thejad/vendor/`, syncs **30** adapted skills to `thejad/skills/imported/` and `.cursor/skills/`, and wires the LOLC security-review command.

### 3. Multi-MCP (recommended)

Use **ThejaD** together with **Ruflo** in the same `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ThejaD": { "...": "see above" },
    "ruflo": {
      "command": "node",
      "args": ["scripts/ruflo-mcp-start.cjs"],
      "env": { "CLAUDE_FLOW_MODE": "v3", "CLAUDE_FLOW_TOOL_MODE": "develop" }
    }
  }
}
```

Optional Cursor plugins: **Figma**, **Atlassian**, **Azure**, **Postman** — ThejaD tools reference their lanes (UI / BA / backend).

---

## Integrated GitHub projects (all links you provided)

| Project | URL | Role in ThejaD |
|---------|-----|----------------|
| **ThejaD** (this repo) | https://github.com/thejanaloit/LOLCDevelopmentAi50ThejaD | MCP server + LOLC team orchestration |
| **Ruflo** | https://github.com/ruvnet/ruflo | 272+ swarm tools — parallel MCP (`ruflo` server) |
| **Claude-flow** (Ruflo skills) | https://github.com/ruvnet/claude-flow | 276 skills → `.cursor/skills/ruflo` in monorepo |
| **Superpowers marketplace** | https://github.com/obra/superpowers-marketplace | `/plugin marketplace add obra/superpowers-marketplace` |
| **Superpowers** | https://github.com/obra/superpowers | TDD, brainstorm, execute-plan (imported skills) |
| **Superpowers dev for Claude** | https://github.com/obra/superpowers-developing-for-claude-code | MCP/plugin authoring |
| **Graphify** | https://github.com/safishamsi/graphify | Knowledge graph — `graphify .` on monorepo |
| **Claude-mem** | https://github.com/thedotmack/claude-mem | Cross-session memory (imported skills) |
| **Claude code security review** | https://github.com/anthropics/claude-code-security-review | PR + `/lolc-security-review` |
| **NotebookLM-py** | https://github.com/teng-lin/notebooklm-py | Research programme docs (`notebooklm_*` tools) |
| **Frontend design** (official) | `frontend-design@claude-plugins-official` | Lahiru — FusionX UI |
| **Code review** (official) | `code-review@claude-plugins-official` | Geesara + Security |

Manifest: `data/vendor-repos.json`

---

## 60+ AI orchestration (example)

ThejaD exposes Ruflo-class and LOLC-specific orchestration:

- **Swarm:** mesh, hierarchical, adaptive, Raft, Byzantine, gossip, queen elect  
- **Agents:** spawn coder, tester, reviewer, architect, security, BA, QA, UI, backend, researcher  
- **Workers:** audit, test gaps, consolidate, optimize  
- **SPARC / DDD / TDD London** compatibility tools  
- **Team consult:** `team_consult` → Thejana, Lahiru, Geesara, Sachini, Security, Backend  

Example MCP calls:

```
thejana_supreme_plan
swarm_init
agent_spawn
coordination_claim
engineering_team_roster
```

---

## Memory (no context loss)

| Layer | What |
|-------|------|
| **Claude-mem** | Session compression + replay ([thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)) |
| **ThejaD memory** | `memory_store` / `memory_search` → `.thejad/memory.json` |
| **Ruflo memory** | Hybrid backend via `ruflo` MCP (`memory_store`, `memory_search`, trajectories) |
| **Diary** | `diary_append` — daily engineering log |
| **Device index** | Scoped dev paths (`device_search`) — not full C: scan |

---

## Multi-user development (no collisions)

Built for **Cursor + Antigravity + Copilot + humans** on one repo:

1. `coordination_claim` — lane A/B/C/D/E + paths → `coordination/active-claims.json`  
2. Work only in claimed paths  
3. Append `docs/MULTI_AGENT_DEVELOPMENT_LOG.md` (handoff template via `antigravity_handoff`)  
4. `coordination_release` when done  

Prompt: `multi_agent_no_collision` · Tool: `thejad_coordination_claim`

---

## Token usage reduction (examples)

| Technique | How |
|-----------|-----|
| **80% default tier** | Core + standard tools only until `thejad_unlock` / `THEJAD_FULL_ACCESS=1` |
| **Graphify** | Query architecture graph instead of loading entire tree |
| **Scope guard** | `scope_guard` blocks P2–P5 scope creep in one call |
| **Story lookup** | `story_lookup` — 15 rows, not full JSON dump |
| **Resources** | `thejad://doc/...` — read one doc, not repo-wide search |
| **Offline Ollama** | `ollama_prompt` — local draft without API tokens |
| **Smokes as hints** | `smoke_hint` returns command only unless full unlock runs smokes |

---

## Offline models

1. Install [Ollama](https://ollama.com)  
2. `ollama pull llama3.2` (or set `THEJAD_OLLAMA_MODEL`)  
3. MCP tool: `ollama_prompt`  

Optional: set `THEJAD_FULL_ACCESS=0` and use local model for planning; cloud for merge review.

---

## Engineering team (50+ years collective)

| Persona | Role | Plugins / tools |
|---------|------|-----------------|
| **Thejana** | Supreme developer & lead | Superpowers, code-review, claude-mem, graphify, ruflo |
| **Lahiru** | UI / UX (FusionX) | frontend-design, superpowers, graphify |
| **Geesara** | QA | code-review, superpowers, smokes |
| **Sachini** | BA / user stories | superpowers, story_lookup, sachini_story_draft |
| **Security** | White hat | claude-code-security-review, code-review |
| **Backend** | Nest / Kong / DB | code-review, superpowers, graphify |

MCP: `engineering_team_roster` · `team_consult` role=`lahiru` topic=`/payments`

Delivery order: Sachini → Lahiru → Thejana/Backend → Security → Geesara → Thejana release.

---

## Capability modes

| Mode | % | How |
|------|---|-----|
| Default | **80%** | Standard + core tools (most of 1000+) |
| Maximum | **100%** | Friends phrase via `thejad_unlock`, or `THEJAD_FULL_ACCESS=1` |

---

## Key MCP tools

| Tool | Purpose |
|------|---------|
| `thejad_status` | Counts tools / prompts / resources |
| `vendors_status` | All GitHub vendors installed? |
| `vendor_sync_skills` | Re-import vendor SKILL.md files |
| `plugins_install_hints` | Claude Code `/plugin install …` lines |
| `graphify_hint` | `pip install graphifyy` + index repo |
| `coordination_claim` / `release` | Multi-user lanes |
| `scope_guard` | Phase 1 only |
| `ollama_prompt` | Offline LLM |
| `notebooklm_ask` | Programme doc research |

---

## FusionX / Phase 1

- UI guide: `data/fusionx-ui-dev-guide.md`  
- Routes: `docs/ui-design/SCREEN_ROUTE_MAP.md` (resource URI)  
- Programme: `docs/PROGRAMME_MASTER_REFERENCE.md`  

---

## Security

- White hat: `security_white_hat_scan`  
- PR workflow: `.github/workflows/lolc-security-review.yml` (needs `CLAUDE_API_KEY`)  
- Custom rules: `data/lolc-security-scan-instructions.txt`  

---

## Pending owner input

See `requested.md` (Figma URL, NotebookLM auth, extra Ollama models).

---

## Repository layout

```
thejad/
├── bin/thejad.js          # MCP entry
├── src/                   # server, 1000+ tool catalog, team, plugins
├── data/                  # team, vendor-repos, stories, limits
├── skills/
│   ├── team-*             # Thejana, Lahiru, Geesara, Sachini, Security
│   ├── imported/          # 30 vendor skills (LOLC footer)
│   └── ruflo/             # Ruflo subset
├── vendor/                # cloned GitHub repos (gitignored — run install)
└── install/               # install-engineering-plugins.ps1
```

---

## License

MIT — vendor projects retain their own licenses.

---

**Thanks to Theja**
