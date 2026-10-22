<#
Đăng tệp HSMT của một gói lên GitHub Release "hsmt-<TBMT>" (mỗi tệp tối đa 200 MB) và ghi danh sách tệp
vào inbox/<TBMT>/release.json trên nhánh hsmt-inbox. Git chỉ giữ danh sách, không giữ tệp.
GitHub Action "hsmt inbox" đọc release.json, lấy chữ từ tệp và cập nhật hsmt/<TBMT> cho bản web.
Tệp lớn hơn giới hạn được ghi vào inbox/<TBMT>/error.txt. Không có tệp nào thì chỉ ghi error.txt.
Cần gh (GitHub CLI) đã đăng nhập.
#>
param(
    [Parameter(Mandatory)][string]$Key,
    [string]$RequestedAt,
    [string]$Src,
    [int]$MaxMB = 200,
    [string]$Reason = 'Không tải được tệp nào từ muasamcong.',
    [string]$Repo = 'khoanguyenminh6868/GenSet-Pro',
    [string]$Clone = 'C:\Projects\GenSet Pro\hsmt-inbox',
    [string]$StateFile = 'C:\Projects\GenSet Pro\.hsmt-worker-state.json',
    # Chuyển gói cũ sang release: không commit, không ghi state.
    [switch]$NoCommit
)
$ErrorActionPreference = 'Stop'
if (-not $Src) { $Src = "C:\Users\Khoa\Downloads\GenBid-HSMT\$Key" }
$utf8 = New-Object Text.UTF8Encoding $false
$tag = "hsmt-$Key"

$all = @(if (Test-Path $Src) { Get-ChildItem $Src -File | Where-Object { $_.Name -ne 'manifest.csv' -and $_.Name -notlike '.*' } | Sort-Object Name })
$keep = @($all | Where-Object { $_.Length -le $MaxMB * 1MB })
$skipped = @($all | Where-Object { $_.Length -gt $MaxMB * 1MB } | ForEach-Object { "Bỏ qua $($_.Name): lớn hơn $MaxMB MB" })

# GitHub đổi tên tệp có dấu, nên tên asset là số thứ tự (01.pdf, ...) và tên gốc nằm ở nhãn.
$stage = Join-Path $env:TEMP "genbid-$Key"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory $stage | Out-Null
$items = @()
for ($i = 0; $i -lt $keep.Count; $i++) {
    $ext = ($keep[$i].Extension.ToLower() -replace '[^a-z0-9.]', '')
    $an = '{0:D2}{1}' -f ($i + 1), $ext
    Copy-Item $keep[$i].FullName (Join-Path $stage $an)
    $items += [pscustomobject]@{ name = $keep[$i].Name; size = $keep[$i].Length; assetName = $an }
}

$files = @()
if ($items) {
    $up = @($items | ForEach-Object { "$(Join-Path $stage $_.assetName)#$($_.name)" })
    gh release view $tag --repo $Repo --json tagName 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        gh release upload $tag --repo $Repo --clobber @args
        if ($LASTEXITCODE -ne 0) { throw "Không tải được tệp lên release $tag." }
        $want = @($items.assetName)
        $old = gh release view $tag --repo $Repo --json assets | ConvertFrom-Json
        foreach ($a in $old.assets) { if ($want -notcontains $a.name) { gh release delete-asset $tag $a.name --repo $Repo --yes } }
    } else {
        gh release create $tag --repo $Repo --target hsmt-inbox --title "HSMT $Key" --notes 'Tệp HSMT tải từ muasamcong (VNeGP Agent).' @args
        if ($LASTEXITCODE -ne 0) { throw "Không tạo được release $tag." }
    }
    $assets = (gh release view $tag --repo $Repo --json assets | ConvertFrom-Json).assets
    foreach ($it in $items) {
        $a = $assets | Where-Object { $_.name -eq $it.assetName } | Select-Object -First 1
        if (-not $a) { throw "Release $tag thiếu $($it.assetName)." }
        $files += [ordered]@{ name = $it.name; size = $it.size; asset = [long]($a.apiUrl -replace '.*/', ''); assetName = $it.assetName }
    }
}
Remove-Item -Recurse -Force $stage

$dir = Join-Path $Clone "inbox\$Key"
if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
New-Item -ItemType Directory $dir | Out-Null
if ($files) {
    $json = [ordered]@{ tag = $tag; repo = $Repo; files = $files } | ConvertTo-Json -Depth 4
    [IO.File]::WriteAllText((Join-Path $dir 'release.json'), $json, $utf8)
}
$err = @($skipped) + @(if (-not $all) { $Reason })
if ($err) { [IO.File]::WriteAllText((Join-Path $dir 'error.txt'), (($err -join "`n") + "`n"), $utf8) }

if (-not $NoCommit) {
    git -C $Clone add -A "inbox/$Key"
    git -C $Clone commit -q --allow-empty -m "HSMT $Key"
    git -C $Clone push -q origin hsmt-inbox
    if ($LASTEXITCODE -ne 0) { throw 'git push không thành công.' }
    if ($RequestedAt) {
        $st = if (Test-Path $StateFile) { Get-Content $StateFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { [pscustomobject]@{ done = @() } }
        $st.done = @($st.done) + "$Key|$RequestedAt"
        [IO.File]::WriteAllText($StateFile, ($st | ConvertTo-Json -Compress), $utf8)
    }
}
Write-Host "$Key : $($files.Count) tệp lên release $tag, bỏ qua $($skipped.Count)."
