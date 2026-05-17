# ThejaD — requested from owner (pending)

Items below use **mocks** until you provide real values. Reply in chat or edit this file.

| ID | Request | Mock used now |
|----|---------|----------------|
| R1 | Production Figma file URL / team ID for Stitch sync | Local `docs/ui-design/` route map only |
| R2 | NotebookLM Google account / API cookies for notebooklm-py | Stub tool returns doc paths from repo |
| R3 | Preferred Ollama model tags (e.g. `llama3.2`, `qwen2.5`) | `llama3.2` if `ollama list` empty |
| R4 | Official Antigravity account labels for coordination rows | `Antigravity` / `Cursor` generic |
| R5 | Bank-approved payment limit defaults for UAT (if different from seed) | `data/lolc-limits.json` from dev seed |
| R6 | Full device scan | **Done** — `device_reindex` / `build-device-index.mjs` (14k+ files, C: user + E: projects) |
| R7 | D: drive project paths | D: not present — set `THEJAD_DEVICE_ROOTS=D:\your\path` and reindex |
