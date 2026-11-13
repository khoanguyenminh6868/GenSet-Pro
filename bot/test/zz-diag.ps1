$global:BotTD = Join-Path ([IO.Path]::GetTempPath()) 'diag'; New-Item -ItemType Directory -Force $global:BotTD | Out-Null
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')
$fx = New-BotTemp 'fx'
Write-BotJson "$fx/tracked.json" @(@{ id = 'N'; data = @{ note = 'x' } })
Write-Host "FILE: $(Get-Content -Raw "$fx/tracked.json")"
$d = Get-Content "$fx/tracked.json" -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "TYPE: $($d.GetType().FullName) count=$(@($d).Count) id=$($d.id) dataNote=$($d.data.note)"
function global:powershell { Write-Host "FAKE ARGS: $($args -join ' | ')"; $global:LASTEXITCODE = 0 }
$a = @('-NoProfile', '-File', 'x.ps1', '-Kind', 'docs', '-Coll', 'tracked', '-Out', 'o.json') + @(if ($false) { '-Id', 'z' })
& powershell @a | Out-Null
$a2 = @('-NoProfile', '-File', 'x.ps1', '-Kind', 'docs', '-Coll', 'feed', '-Out', 'o.json') + @(if ($true) { '-Id', 'current' })
& powershell @a2 | Out-Null
$tmp = Join-Path $fx 't'; New-Item -ItemType Directory $tmp | Out-Null
$f = Join-Path $tmp 'tracked.json'
Write-Host "JOINED: $f"
