$ErrorActionPreference = 'Stop'
$plugin = 'C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin'
$staging = 'C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.1'
$zip = 'C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.1.zip'
Set-Location $plugin
npm run build | Out-Host
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null
robocopy $plugin (Join-Path $staging 'umg-envoy-agent-plugin') /E /XD node_modules .git | Out-Null
if ($LASTEXITCODE -ge 8) { throw 'robocopy failed' }
if (Test-Path $zip) { Remove-Item -Force $zip }
Compress-Archive -Path (Join-Path $staging 'umg-envoy-agent-plugin') -DestinationPath $zip -Force
Get-Item $zip | Select-Object FullName,Length,LastWriteTime | ConvertTo-Json -Compress
