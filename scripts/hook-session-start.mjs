#!/usr/bin/env node
/** Cursor sessionStart — inject ThejaD orchestra mandate + unlock state */
import fs from 'fs';
import { bootstrapEnv } from '../src/env-bootstrap.mjs';
import { getUnlockState } from '../src/capability.mjs';
import { ensureSetupReady } from '../src/setup.mjs';
import { resolveDataDir } from '../src/paths.mjs';

async function main() {
  bootstrapEnv();
  const unlock = getUnlockState();
  const setup = await ensureSetupReady();
  const md = `${resolveDataDir()}/last-orchestra.md`;

  const ctx = `# ThejaD session (auto-orchestra)

- **Tier:** ${unlock.tier} (${unlock.capabilityPercent}%) — unlock with \`mamaThejana\`, lock with \`nothejad unlock\` (stays until lock command).
- **Setup:** ${setup.ready ? 'ready' : 'incomplete — run thejad_setup_complete'}.
- **Every user message** is auto-orchestrated by hook → read \`${md}\` and execute the optimized prompt (no need to call \`thejad_orchestrate\` unless hook failed).
- Phase 1 only · coordination_claim for shared paths.

Thanks to Theja`;

  console.log(JSON.stringify({ additional_context: ctx }));
}

main().catch(() => {
  console.log(JSON.stringify({ additional_context: 'ThejaD hooks active. Read .thejad/last-orchestra.md after each user message.' }));
});
