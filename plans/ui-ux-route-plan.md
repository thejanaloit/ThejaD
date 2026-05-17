# Screen ↔ route ↔ story map (living)

**Purpose:** Close **Wave 0.1** exit in `docs/FULL_PLAN_UI_FIRST_TO_MVP_FINISH.md` — traceability from **web routes** to **MVP CSV / LOLCDL** anchors and, when assigned, to **PNG filenames** (`UI_DESIGN_SOURCE_POLICY.md`).

**Owner:** Manika / programme UI lane  
**Inventory of PNGs:** `docs/ui-design/SCREENSHOT_INDEX.md` (**102** files; re-run `scripts/generate_screenshot_index.py` when uploads change).

## How to use this file

1. **Product / design** assigns **`Primary PNG`** (exact `Screenshot (nn).png` name) per row when reviewing the clone under `refering documents/Screenshots/Screenshots/`.
2. **Engineering** sets **`Parity status`** after each review: `Not started` → `In progress` → `Signed off` (date + initials in commit or diary).
3. On each **UI merge** that changes a route’s layout, update **`Last updated (ISO)`** and add the PNG reference to `docs/DEVELOPMENT_DIARY.md` per policy.

## Phase 1 web — `apps/web` routes

| Route | Web surface | MVP CSV / story anchor (see `docs/exports/mvp-features/`) | Primary PNG | Parity status | Last updated (ISO) |
|-------|-------------|-----------------------------------------------------------|---------------|---------------|-------------------|
| `/` | Retail home: `app/page.tsx` → **`BankingDashboard`** (`app/ui/banking-dashboard.tsx`) — session chrome, quick actions, static demo tiles (live service health / tenant on roadmap) | Account Management — LOLCDL-263 dashboard, LOLCDL-241/242 list/detail | *TBD* | High-Fidelity | 2026-04-28 |
| `/auth` | Customer + admin sign-in (`retail-top-chrome` slim) | Authentication — LOLCDL-246 subsequent login, LOLCDL-248 first login, operator tab | *TBD* | High-Fidelity | 2026-04-28 |
| `/register` | Registration wizard (`BankingAppShell` + workspace) | Authentication — LOLCDL-174 onboarding | *TBD* | High-Fidelity | 2026-04-28 |
| `/accounts` | Account list (`BankingAppShell` + data client) | Account Management — LOLCDL-241 list | *TBD* | High-Fidelity | 2026-04-28 |
| `/accounts/[id]` | Drill-down, tx + filters, statements + request/download, **Phase 2 actions (nickname/primary/visibility)**, **balance + mini statement**, **transaction detail peek (`/api/accounts/transactions/:id`)** | Account Management — LOLCDL-242 detail, statements rows | *TBD* | High-Fidelity | 2026-04-28 |
| `/loans` | Loans dashboard (`LoansDashboard`) | Lending — LOLCDL-264 loans | *TBD* | High-Fidelity | 2026-04-28 |
| `/fixed-deposits` | Fixed Deposits dashboard (`FixedDepositsDashboard`) | Savings — LOLCDL-265 fixed deposits | *TBD* | High-Fidelity | 2026-04-28 |
| `/payments` | Transfers, bills, history (`PaymentsWorkspace`) | Payments_Fund_Transfers.csv, Bill_Payments.csv (e.g. LOLCDL-14–22 family) | *TBD* | High-Fidelity | 2026-04-28 |
| `/notifications` | Inbox + unread count, mark read/all read, preferences, delete, **page/limit controls** | Notifications_Alerts.csv (e.g. LOLCDL-23 scheduled transfer notification) | *TBD* | High-Fidelity | 2026-04-28 |
| `/support` | Support hub + ticket management | Support — LOLCDL-266 support | *TBD* | High-Fidelity | 2026-04-28 |
| `/profile` | Profile form | Settings_Preferences — LOLCDL-262 profile | *TBD* | High-Fidelity | 2026-04-28 |
| `/settings/application-settings` | Settings hub | Settings — LOLCDL-243 settings | *TBD* | High-Fidelity | 2026-04-28 |
| `/settings/account-preferences` | Account prefs tabs | Settings / Account Management cross-cut | *TBD* | High-Fidelity | 2026-04-28 |
| `/tenant` | Tenant explorer | Tenant / white-label (ingested docs) | *TBD* | Engineering surface | 2026-04-28 |
| `/phase1` | Platform readiness workspace | Internal delivery (not a bank retail PNG set) | *N/A* | N/A | 2026-04-28 |
| `/meeting` | Technical runbooks (markdown) | Internal delivery | *N/A* | N/A | 2026-04-28 |
| `/admin` | Operator console | Admin / audit (P1); align with stakeholder PNGs when assigned | *TBD* | High-Fidelity | 2026-04-28 |

**Global:** `not-found.tsx`, `error.tsx`, `global-error.tsx` — **supporting** surfaces; map PNGs only if programme supplies error-state designs.

## Coverage summary (engineering estimate)

| Metric | Value |
|--------|--------|
| Retail / operator routes in table | **14** |
| Rows with **Primary PNG** assigned | **0** (awaiting design sign-off) |
| Rows with **story / CSV** anchor | **12** (explicit or sheet-level) |
| Internal / N/A | **2** (`/phase1`, `/meeting`) |

When **Primary PNG** is filled for all customer-facing rows and **Parity status** is **Signed off**, Wave **0.1** + customer **Wave 1** UI exit can be called for the web slice.
