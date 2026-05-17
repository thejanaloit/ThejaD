import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT, resolveRepoRoot } from './paths.mjs';

function parseFileKey() {
  const key = process.env.FIGMA_FILE_KEY?.trim();
  if (key) return key;
  const url = process.env.FIGMA_FILE_URL?.trim() || '';
  const m = url.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/);
  return m?.[1] || null;
}

function localRouteContext(route) {
  const repo = resolveRepoRoot();
  const mapPath = path.join(repo, 'docs', 'ui-design', 'SCREEN_ROUTE_MAP.md');
  const planPath = path.join(PACKAGE_ROOT, 'plans', 'ui-ux-route-plan.md');
  return {
    route: route || '/home',
    screenRouteMap: fs.existsSync(mapPath) ? mapPath : null,
    planFile: fs.existsSync(planPath) ? planPath : null,
  };
}

/** Figma REST when FIGMA_ACCESS_TOKEN + FIGMA_FILE_KEY|FIGMA_FILE_URL; else local route map. */
export async function getFigmaContext(route) {
  const token = process.env.FIGMA_ACCESS_TOKEN?.trim();
  const fileKey = parseFileKey();
  const local = localRouteContext(route);

  if (!token || !fileKey) {
    return {
      live: false,
      ...local,
      setup: {
        FIGMA_ACCESS_TOKEN: Boolean(token),
        FIGMA_FILE_KEY: Boolean(fileKey),
        hint: 'Set FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY (or FIGMA_FILE_URL) in MCP env or .env',
      },
    };
  }

  try {
    const res = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
      headers: { 'X-Figma-Token': token },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return {
        live: false,
        error: `Figma API ${res.status}`,
        ...local,
      };
    }
    const file = await res.json();
    const pages = (file.document?.children || []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    }));
    const routeHint = String(route || '').toLowerCase();
    const matchedPage = pages.find((p) => routeHint && p.name.toLowerCase().includes(routeHint.replace(/\//g, '')));

    return {
      live: true,
      fileKey,
      fileName: file.name,
      lastModified: file.lastModified,
      pages: pages.slice(0, 20),
      matchedPage: matchedPage || null,
      ...local,
    };
  } catch (e) {
    return {
      live: false,
      error: String(e.message || e).slice(0, 120),
      ...local,
    };
  }
}
