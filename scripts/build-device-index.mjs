#!/usr/bin/env node
/**
 * Full device re-index (user-requested): dev roots on C: + E:, not Windows system dirs.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_INDEX = path.join(__dirname, '..', 'data', 'device-index.json');
const OUT_USABLE = path.join(__dirname, '..', 'data', 'device-usable.json');

const USER = process.env.USERPROFILE || `C:\\Users\\${process.env.USERNAME}`;
const EXT = new Set([
  '.md', '.json', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.yaml', '.yml',
  '.env.example', '.ps1', '.sh', '.sql', '.prisma',
]);
const SPECIAL_FILES = new Set([
  'AGENTS.md', 'COORDINATION.md', 'docker-compose.yml', 'docker-compose.yaml',
  'package.json', 'mcp.json', '.mcp.json', 'SKILL.md', 'skill.md',
]);
const SKIP_DIR = new Set([
  'node_modules', '.git', '.next', 'dist', 'coverage', 'build', '.turbo',
  'Windows', 'Program Files', 'Program Files (x86)', '$Recycle.Bin',
  'AppData', 'System Volume Information', '.pnpm-store', 'vendor',
]);
const MAX_FILES = 15000;
const MAX_DEPTH = 8;

function defaultRoots() {
  const repo = process.env.THEJAD_REPO_ROOT || 'e:\\internetBanking';
  const roots = [
    repo,
    path.join(USER, '.cursor'),
    path.join(USER, '.cursor', 'projects'),
    path.join(USER, '.cursor', 'skills-cursor'),
    path.join(USER, '.claude'),
    path.join(USER, '.claude-flow'),
    path.join(USER, '.antigravity'),
    path.join(USER, '.ollama'),
    path.join(USER, 'Documents'),
    path.join(USER, 'Downloads'),
    path.join(USER, 'Postman'),
    path.join(USER, 'OneDrive - Group of LOLC'),
    'e:\\internetBanking',
    'e:\\internetBanking by antigravity',
    'e:\\internet banking backup',
    'e:\\recovery fusionx',
    'e:\\DesignStudio',
    'e:\\DesignStudio',
    'e:\\LOIT CRM',
    'e:\\MINI CRM',
    'e:\\CRM SOFT',
    'e:\\grandhanthana',
    'e:\\grandhanthana_v2',
    'e:\\Keko',
    'D:\\',
    'D:\\projects',
    'D:\\internetBanking',
    'D:\\LOLC',
    'D:\\DesignStudio',
  ];
  const extra = (process.env.THEJAD_DEVICE_ROOTS || '')
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set();
  return [...roots, ...extra].filter((r) => {
    const n = path.resolve(r).toLowerCase();
    if (seen.has(n)) return false;
    seen.add(n);
    return fs.existsSync(r);
  });
}

function walk(dir, depth, files) {
  if (files.length >= MAX_FILES || depth > MAX_DEPTH) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIR.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, depth + 1, files);
    else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      const base = e.name;
      if (EXT.has(ext) || SPECIAL_FILES.has(base) || base.endsWith('.postman_collection.json')) {
        files.push(full.replace(/\\/g, '/'));
      }
    }
  }
}

function categorize(files) {
  const buckets = {
    mcpConfigs: [],
    skills: [],
    coordination: [],
    docker: [],
    envExamples: [],
    postman: [],
    packageJson: [],
    ollama: [],
    fusionxOrBanking: [],
    plans: [],
    other: [],
  };
  for (const f of files) {
    const low = f.toLowerCase();
    if (low.endsWith('mcp.json') || low.endsWith('.mcp.json')) buckets.mcpConfigs.push(f);
    else if (low.endsWith('/skill.md') || low.includes('/skills/')) buckets.skills.push(f);
    else if (low.includes('coordination') || low.endsWith('agents.md')) buckets.coordination.push(f);
    else if (low.includes('docker-compose')) buckets.docker.push(f);
    else if (low.includes('.env.example') || low.endsWith('.env.sample')) buckets.envExamples.push(f);
    else if (low.includes('postman')) buckets.postman.push(f);
    else if (low.endsWith('package.json')) buckets.packageJson.push(f);
    else if (low.includes('.ollama')) buckets.ollama.push(f);
    else if (
      low.includes('fusionx') || low.includes('internetbanking') || low.includes('internet banking') ||
      low.includes('lolc') || low.includes('ipay')
    ) {
      buckets.fusionxOrBanking.push(f);
    } else if (low.includes('plan') || low.includes('roadmap') || low.includes('mvp')) buckets.plans.push(f);
    else buckets.other.push(f);
  }
  for (const k of Object.keys(buckets)) {
    buckets[k] = [...new Set(buckets[k])].slice(0, 500);
  }
  return buckets;
}

function listOllamaModels() {
  const modelsDir = path.join(USER, '.ollama', 'models');
  const models = [];
  if (!fs.existsSync(modelsDir)) return models;
  try {
    const blobs = path.join(modelsDir, 'manifests', 'registry.ollama.ai', 'library');
    if (fs.existsSync(blobs)) {
      for (const name of fs.readdirSync(blobs)) models.push(name);
    }
  } catch {
    /* ignore */
  }
  return models;
}

const roots = defaultRoots();
const files = [];
console.log(`[device-index] host=${os.hostname()} user=${USER}`);
for (const root of roots) {
  const before = files.length;
  walk(path.resolve(root), 0, files);
  console.log(`[device-index] ${root} +${files.length - before}`);
}

const usable = categorize(files);
usable.ollamaModels = listOllamaModels();
usable.cursorGlobalMcp = fs.existsSync(path.join(USER, '.cursor', 'mcp.json'))
  ? path.join(USER, '.cursor', 'mcp.json').replace(/\\/g, '/')
  : null;

const indexPayload = {
  generatedAt: new Date().toISOString(),
  note: 'Expanded device scan — C: user dev + E: projects. Excludes Windows/Program Files/node_modules.',
  host: os.hostname(),
  userProfile: USER.replace(/\\/g, '/'),
  roots,
  fileCount: files.length,
  files,
};

const usablePayload = {
  generatedAt: indexPayload.generatedAt,
  summary: {
    totalFiles: files.length,
    mcpConfigs: usable.mcpConfigs.length,
    skills: usable.skills.length,
    fusionxOrBanking: usable.fusionxOrBanking.length,
    docker: usable.docker.length,
    postman: usable.postman.length,
    nodeProjects: usable.packageJson.length,
    ollamaModels: usable.ollamaModels.length,
  },
  roots,
  ...usable,
};

fs.writeFileSync(OUT_INDEX, JSON.stringify(indexPayload), 'utf8');
fs.writeFileSync(OUT_USABLE, JSON.stringify(usablePayload, null, 2), 'utf8');
console.log(`[device-index] ${files.length} files → ${OUT_INDEX}`);
console.log(`[device-usable]`, usablePayload.summary);
