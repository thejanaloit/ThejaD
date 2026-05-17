# FusionX UI development guide (ThejaD)

## Sources (repo)
- `docs/ui-design/SCREEN_ROUTE_MAP.md`
- `docs/GOOGLE_STITCH_DESIGN_PROMPT.md`
- `docs/UI_BACKEND_INTEGRATION_MASTER_PLAN.md`
- `docs/ui-design/UI_DESIGN_SOURCE_POLICY.md`
- `apps/web` — Next.js App Router, `BankingAppShell`, design tokens in `globals.css`

## Rules
1. Route `/home` = signed-in dashboard; `/` = marketing.
2. Match Stitch/FusionX copy in auth + register flows.
3. BFF proxies under `apps/web/app/api/**` — never call Nest directly from client except documented SSR paths.
4. `WorkflowEntryGate` + middleware cookies must align for protected routes.
5. i18n: `I18nProvider`, `fusionx.ui.locale`, nav catalog en/si/ta.

## Lanes (no collision)
- **Lahiru (A):** pages, `**/ui/*`, shell, globals.css
- **BFF (B):** `app/api/**`
- **Backend (C):** `services/*`

Use ThejaD `coordination_claim` before edits.
