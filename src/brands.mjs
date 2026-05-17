import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';

let cache;

export function loadBrands() {
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'data', 'thejad-brands.json'), 'utf8'));
  }
  return cache;
}

/** User-facing name with ThejaD suffix */
export function displayName(internalId) {
  const b = loadBrands().integrations[internalId];
  if (b) return b.displayName;
  if (!internalId) return 'ThejaD';
  return `${String(internalId).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ThejaD`;
}

export function listBrandedIntegrations() {
  return Object.values(loadBrands().integrations).map((i) => ({
    name: i.displayName,
    internalId: i.internalId,
  }));
}

export function brandPlugins(internalIds) {
  return (internalIds || []).map((id) => displayName(id));
}
