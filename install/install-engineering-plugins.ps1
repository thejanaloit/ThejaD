# ThejaD v4 — clone all vendor repos + sync skills to Cursor
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Thejad = Join-Path $Root "thejad"
$Vendor = Join-Path $Thejad "vendor"
$Manifest = Join-Path $Thejad "data\vendor-repos.json"
New-Item -ItemType Directory -Force -Path $Vendor | Out-Null

$json = Get-Content $Manifest -Raw | ConvertFrom-Json
foreach ($r in $json.repos) {
  $name = ($r.url -split "/")[-1] -replace "\.git$", ""
  $dest = Join-Path $Vendor $name
  if (-not (Test-Path $dest)) {
    Write-Host "[ThejaD] Cloning $($r.id)..."
    if ($r.branch) { git clone --depth 1 -b $r.branch $r.url $dest }
    else { git clone --depth 1 $r.url $dest }
  } else { Write-Host "[ThejaD] OK $($r.id)" }
}

Write-Host "[ThejaD] Syncing vendor skills..."
Set-Location $Root
node -e "import('./thejad/src/skills-sync.mjs').then(m=>console.log(JSON.stringify(m.syncVendorSkills())))"

Write-Host "[ThejaD] Full device re-index (C: + E: dev paths)..."
$env:THEJAD_REPO_ROOT = $Root
node thejad/scripts/build-device-index.mjs

$CursorSkills = Join-Path $Root ".cursor\skills"
New-Item -ItemType Directory -Force -Path $CursorSkills | Out-Null
foreach ($pat in @("team-*", "plugins-*", "thejad-orchestrator", "imported")) {
  Get-ChildItem (Join-Path $Thejad "skills") -Directory -Filter $pat -ErrorAction SilentlyContinue | ForEach-Object {
    $target = Join-Path $CursorSkills $_.Name
    if (Test-Path $target) { Remove-Item $target -Recurse -Force }
    Copy-Item $_.FullName $target -Recurse -Force
    Write-Host "[ThejaD] Skill -> .cursor/skills/$($_.Name)"
  }
}

$ClaudeCmd = Join-Path $Root ".claude\commands"
New-Item -ItemType Directory -Force -Path $ClaudeCmd | Out-Null
$srcSec = Join-Path $Vendor "claude-code-security-review\.claude\commands\security-review.md"
$dstSec = Join-Path $ClaudeCmd "lolc-security-review.md"
if (Test-Path $srcSec) {
  $extra = @"

## LOLC Internet Banking (Phase 1)
- Scope: auth, tenant, onboarding, admin, apps/web Phase 1 routes only.
- Check: JWT verify path, BFF cookies, ALLOW_DEV_* not in production configs.
"@
  (Get-Content $srcSec -Raw) + $extra | Set-Content $dstSec -Encoding utf8
}

Write-Host ""
Write-Host "Branded capabilities ready (ThejaD suffix):"
Write-Host "  Superpowers ThejaD | Ruflo ThejaD | Graphify ThejaD | Claude-mem ThejaD"
Write-Host "  Security review ThejaD | NotebookLM ThejaD | Frontend design ThejaD | Code review ThejaD"
Write-Host ""
Write-Host "MCP: engineering_team_roster | vendors_status"
Write-Host "Thanks to Theja"
