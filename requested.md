# ThejaD — requested from owner (pending)

Items below need **your values** when you want full live integration.

| ID | Request | Status |
|----|---------|--------|
| R1 | Figma file | **Wired** — set `FIGMA_ACCESS_TOKEN` + `FIGMA_FILE_KEY` or `FIGMA_FILE_URL` in MCP env |
| R2 | NotebookLM Google login | **Wired** — `notebooklm login` + `notebooklm_auth_status`; orchestra calls `notebooklm_ask` when relevant |
| R3 | Preferred Ollama model tags | **Wired** — `THEJAD_OLLAMA_MODEL` or auto from `ollama list` |
| R4 | Antigravity account labels | Optional — edit `coordination_claim` who field |
| R5 | Bank UAT payment limits | Optional — edit `data/lolc-limits.json` |
| R6 | Full device scan | **Done** — `device_reindex` |
| R7 | D: drive paths | **Wired** — default scan includes `D:\` if present; add `THEJAD_DEVICE_ROOTS=D:\path` and `device_reindex` |

Reply in chat or set env vars in `.cursor/mcp.json` under `ThejaD.env`.
