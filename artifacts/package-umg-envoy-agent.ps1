$ErrorActionPreference = 'Stop'
$root = 'C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin'
$staging = 'C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.0'
$dest = Join-Path $staging 'umg-envoy-agent-plugin'
$zip = 'C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.0.zip'
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null
robocopy $root $dest /E /XD node_modules .git | Out-Null
if ($LASTEXITCODE -ge 8) { throw 'robocopy failed' }
if (Test-Path $zip) { Remove-Item -Force $zip }
Compress-Archive -Path $dest -DestinationPath $zip -Force
Get-Item $zip | Select-Object FullName,Length,LastWriteTime | ConvertTo-Json -Compress
