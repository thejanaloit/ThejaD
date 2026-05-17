# ThejaD — install engineering plugins (LOLC Internet Banking)
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Thejad = Join-Path $Root "thejad"
$Vendor = Join-Path $Thejad "vendor"
New-Item -ItemType Directory -Force -Path $Vendor | Out-Null

$repos = @(
  "https://github.com/obra/superpowers-marketplace.git",
  "https://github.com/anthropics/claude-code-security-review.git",
  "https://github.com/thedotmack/claude-mem.git"
)

foreach ($url in $repos) {
  $name = ($url -split "/")[-1] -replace "\.git$", ""
  $dest = Join-Path $Vendor $name
  if (-not (Test-Path $dest)) {
    Write-Host "[ThejaD] Cloning $name..."
    git clone --depth 1 $url $dest
  } else {
    Write-Host "[ThejaD] OK $name"
  }
}

# Sync Cursor skills from thejad/skills/team-* and plugins-*
$CursorSkills = Join-Path $Root ".cursor\skills"
New-Item -ItemType Directory -Force -Path $CursorSkills | Out-Null
$patterns = @("team-*", "plugins-*", "thejad-orchestrator")
foreach ($pat in $patterns) {
  Get-ChildItem (Join-Path $Thejad "skills") -Directory -Filter $pat -ErrorAction SilentlyContinue | ForEach-Object {
    $target = Join-Path $CursorSkills $_.Name
    if (Test-Path $target) { Remove-Item $target -Recurse -Force }
    Copy-Item $_.FullName $target -Recurse -Force
    Write-Host "[ThejaD] Skill -> .cursor/skills/$($_.Name)"
  }
}

# LOLC security-review command (Claude Code)
$ClaudeCmd = Join-Path $Root ".claude\commands"
New-Item -ItemType Directory -Force -Path $ClaudeCmd | Out-Null
$srcSec = Join-Path $Vendor "claude-code-security-review\.claude\commands\security-review.md"
$dstSec = Join-Path $ClaudeCmd "lolc-security-review.md"
if (Test-Path $srcSec) {
  $extra = @"

## LOLC Internet Banking (Phase 1)
- Scope: auth, tenant, onboarding, admin, apps/web Phase 1 routes only.
- Check: JWT verify path, BFF cookies, ALLOW_DEV_* not in production configs.
- Ignore: mobile app, Phase 6 cards, international prod unless in diff.
- Docs: docs/security/SECURITY_WHITE_HAT.md, SECURITY_FIXED.md
"@
  (Get-Content $srcSec -Raw) + $extra | Set-Content $dstSec -Encoding utf8
  Write-Host "[ThejaD] Command -> .claude/commands/lolc-security-review.md"
}

Write-Host "[ThejaD] Claude Code plugins (run inside Claude Code):"
Write-Host "  /plugin marketplace add obra/superpowers-marketplace"
Write-Host "  /plugin install superpowers@superpowers-marketplace"
Write-Host "  /plugin install frontend-design@claude-plugins-official"
Write-Host "  /plugin install code-review@claude-plugins-official"
Write-Host ""
Write-Host "Thanks to Theja"
