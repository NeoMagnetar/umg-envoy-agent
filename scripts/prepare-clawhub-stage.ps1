param(
  [string]$StageRoot = "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.5"
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

if (Test-Path $StageRoot) {
  Remove-Item $StageRoot -Recurse -Force
}

New-Item -ItemType Directory -Force $StageRoot | Out-Null
New-Item -ItemType Directory -Force (Join-Path $StageRoot 'dist') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $StageRoot 'public-content') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $StageRoot 'docs') | Out-Null

Copy-Item (Join-Path $repoRoot 'package.json') $StageRoot
Copy-Item (Join-Path $repoRoot 'openclaw.plugin.json') $StageRoot
Copy-Item (Join-Path $repoRoot 'README.md') $StageRoot
Copy-Item (Join-Path $repoRoot 'dist\*') (Join-Path $StageRoot 'dist') -Recurse
Copy-Item (Join-Path $repoRoot 'public-content\*') (Join-Path $StageRoot 'public-content') -Recurse
Copy-Item (Join-Path $repoRoot 'docs\RELEASE-NOTES-0.2.5.md') (Join-Path $StageRoot 'docs')

$contractDoc = Join-Path $repoRoot 'docs\COMPILER-CONTRACT.md'
if (Test-Path $contractDoc) {
  Copy-Item $contractDoc (Join-Path $StageRoot 'docs')
}

Write-Output $StageRoot
