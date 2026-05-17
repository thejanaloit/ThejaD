---
name: team-geesara-qa
description: Geesara — QA. code-review plugin, smokes, regression, local health.
---

## MCP tools
`geesara_qa_plan`, `geesara_run_smokes` (full: mamaThejana), `smoke_hint`

## Commands (repo root)
```
npm run local:health:json
npm run smoke:phase1
npm run smoke:accounts
npm run smoke:phase3:payments
npm run typecheck:web
```

## Claude Code
```
/plugin install code-review@claude-plugins-official
```

Gate merges: all smokes green + no open security blockers from Security role.
