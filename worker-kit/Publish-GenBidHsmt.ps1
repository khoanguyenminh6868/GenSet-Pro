<#
Đăng tệp HSMT của một gói lên GitHub Release "hsmt-<TBMT>" (mỗi tệp tối đa 200 MB) và ghi danh sách tệp
vào inbox/<TBMT>/release.json trên nhánh hsmt-inbox. Git chỉ giữ danh sách, không giữ tệp.
Sau đó script tự đọc chữ từ tệp và ghi hsmt/<TBMT>, hsmttext và hsmtreq thẳng lên bản web, để trang có tệp
ngay. GitHub Action "hsmt inbox" vẫn đọc release.json và ghi lại đúng dữ liệu đó; script chỉ chờ Action khi
không ghi thẳng được. -QueueAnalysis gửi thêm yêu cầu Phân tích cho gói chưa có bản phân tích đầy đủ.
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
    [switch]$NoCommit,
    # Sau khi có tệp: gửi yêu cầu Phân tích (analysisreq) nếu gói chưa có bản phân tích đầy đủ.
    [switch]$QueueAnalysis
)
# gh ghi ra stderr cả khi chỉ báo "release not found"; lỗi thật được kiểm tra qua $LASTEXITCODE.
$ErrorActionPreference = 'Continue'
if (-not $Src) { $Src = "C:\Users\Khoa\Downloads\GenBid-HSMT\$Key" }
$utf8 = New-Object Text.UTF8Encoding $false
$tag = "hsmt-$Key"

function Now-Iso { (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ') }
# Tài liệu <coll>/<Key> trên bản web, hoặc $null khi chưa có hay không đọc được.
function Get-WebDoc([string]$coll) {
    $f = Join-Path $env:TEMP "genbid-get-$Key-$coll.json"
    if (Test-Path $f) { Remove-Item $f }
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Get-GenBidRequests.ps1') -Kind docs -Coll $coll -Id $Key -Out $f | Out-Null
    if (-not (Test-Path $f)) { return $null }
    $d = Get-Content $f -Raw -Encoding UTF8 | ConvertFrom-Json
    Remove-Item $f
    $d
}
function Merge-Doc($base, [hashtable]$add) {
    $o = [ordered]@{}
    if ($base) { $base.PSObject.Properties | ForEach-Object { $o[$_.Name] = $_.Value } }
    foreach ($k in $add.Keys) { $o[$k] = $add[$k] }
    $o
}
# Gửi [{coll, id, data}] lên bản web qua Post-GenBidDocs.ps1; trả $true khi gửi được.
function Send-WebDocs([object[]]$rows) {
    $post = Join-Path $env:TEMP "genbid-post-$Key-$(Get-Random)"
    foreach ($r in $rows) {
        New-Item -ItemType Directory -Force "$post\$($r.coll)" | Out-Null
        [IO.File]::WriteAllText("$post\$($r.coll)\$($r.id).json", ($r.data | ConvertTo-Json -Depth 16), $utf8)
    }
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Post-GenBidDocs.ps1') -Dir $post | Write-Host
    $ok = $LASTEXITCODE -eq 0
    Remove-Item -Recurse -Force $post
    $ok
}
# Chữ trong tệp (PDF qua pdftotext, .docx, .txt), giống ingest.py của Action.
$pdftotext = (Get-Command pdftotext -ErrorAction SilentlyContinue).Source
if (-not $pdftotext -and (Test-Path 'C:\Program Files\Git\mingw64\bin\pdftotext.exe')) { $pdftotext = 'C:\Program Files\Git\mingw64\bin\pdftotext.exe' }
function Get-FileText($f) {
    if (-not $f) { return '' }
    try {
        switch ($f.Extension.ToLower()) {
            '.pdf' {
                if (-not $pdftotext) { return '' }
                $out = Join-Path $env:TEMP "genbid-$Key-$(Get-Random).txt"
                & $pdftotext -layout -enc UTF-8 $f.FullName $out 2>$null
                if (-not (Test-Path $out)) { return '' }
                $t = [IO.File]::ReadAllText($out, [Text.Encoding]::UTF8); Remove-Item $out; return $t
            }
            '.docx' {
                Add-Type -AssemblyName System.IO.Compression.FileSystem
                $z = [IO.Compression.ZipFile]::OpenRead($f.FullName)
                try { $xml = (New-Object IO.StreamReader($z.GetEntry('word/document.xml').Open(), [Text.Encoding]::UTF8)).ReadToEnd() } finally { $z.Dispose() }
                $xml = $xml -replace '</w:p>', "`n" -replace '<w:tab/>', "`t" -replace '<[^>]+>', ''
                return $xml.Replace('&amp;', '&').Replace('&lt;', '<').Replace('&gt;', '>')
            }
            '.txt' { return [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8) }
        }
    } catch { Write-Host "  Không đọc được chữ của $($f.Name): $($_.Exception.Message)" }
    ''
}
# Cắt chuỗi thành các đoạn tối đa $max byte UTF-8, không cắt giữa một ký tự.
function Split-Utf8([string]$text, [int]$max) {
    $b = [Text.Encoding]::UTF8.GetBytes($text)
    $i = 0
    while ($i -lt $b.Length) {
        $cut = [Math]::Min($b.Length, $i + $max)
        while ($cut -lt $b.Length -and ($b[$cut] -band 0xC0) -eq 0x80) { $cut-- }
        [Text.Encoding]::UTF8.GetString($b, $i, $cut - $i)
        $i = $cut
    }
}

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
        gh release upload $tag --repo $Repo --clobber @up
        if ($LASTEXITCODE -ne 0) { throw "Không tải được tệp lên release $tag." }
        $want = @($items.assetName)
        $old = gh release view $tag --repo $Repo --json assets | ConvertFrom-Json
        foreach ($a in $old.assets) { if ($want -notcontains $a.name) { gh release delete-asset $tag $a.name --repo $Repo --yes } }
    } else {
        gh release create $tag --repo $Repo --target hsmt-inbox --title "HSMT $Key" --notes 'Tệp HSMT tải từ muasamcong (VNeGP Agent).' @up
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
    # Ghi thẳng lên bản web (hsmt, hsmttext, hsmtreq) bằng chữ đọc từ tệp trên máy này, để trang có tệp ngay,
    # không phải chờ Action "hsmt inbox" (Action vẫn chạy và ghi lại đúng dữ liệu đó).
    $req = if ($RequestedAt) { Merge-Doc (Get-WebDoc 'hsmtreq') @{ notifyNo = $Key; requestedAt = $RequestedAt; doneAt = (Now-Iso); error = '' } }
    $direct = $false
    try {
        if ($files) {
            $recs = @(); $texts = @()
            foreach ($it in $items) {
                $f = $keep | Where-Object { $_.Name -eq $it.name } | Select-Object -First 1
                $text = Get-FileText $f
                $has = ($text -replace '\s', '').Length -gt 40
                $asset = ($files | Where-Object { $_.assetName -eq $it.assetName } | Select-Object -First 1).asset
                $recs += [ordered]@{ name = $it.name; size = $it.size; hasText = $has; converted = $false; path = $it.name; url = "/_gh/$asset" }
                if ($has) { $texts += "--- Tệp: $($it.name) ---`n$($text.Trim())" }
            }
            $parts = @(Split-Utf8 ($texts -join "`n`n") 190000)
            $hsmt = Merge-Doc (Get-WebDoc 'hsmt') @{ notifyNo = $Key; updatedAt = (Now-Iso); source = 'muasamcong (VNeGP Agent)'; files = $recs; textChunks = $parts.Count }
            $direct = $true
            # Mỗi lần gửi tối đa 15 đoạn chữ (khoảng 3 MB), dưới giới hạn 4,5 MB của Vercel.
            for ($i = 0; $i -lt $parts.Count -and $direct; $i += 15) {
                $direct = Send-WebDocs @($i..([Math]::Min($i + 14, $parts.Count - 1)) | ForEach-Object { @{ coll = 'hsmttext'; id = "${Key}_$_"; data = @{ text = $parts[$_] } } })
            }
            if ($direct) {
                $rows = @(@{ coll = 'hsmt'; id = $Key; data = $hsmt }) + @(if ($req) { @{ coll = 'hsmtreq'; id = $Key; data = $req } })
                $direct = Send-WebDocs $rows
            }
        } elseif ($req) {
            $req.error = $err -join ' '
            $direct = Send-WebDocs @(@{ coll = 'hsmtreq'; id = $Key; data = $req })
        } else { $direct = $true }
    } catch { Write-Host "Không ghi thẳng được lên bản web: $($_.Exception.Message)"; $direct = $false }
    if ($direct) { Write-Host "Đã ghi $Key lên bản web ($($files.Count) tệp)." }
    if ($RequestedAt -and -not $direct) {
        # Ghi thẳng không được: chờ Action "hsmt inbox" đánh dấu hsmtreq/<TBMT>; nếu Action lỗi, hoặc không
        # chạy vì danh sách tệp không đổi, thì tự ghi hsmtreq để trang thôi hiện "đang chờ".
        $sha = git -C $Clone rev-parse HEAD
        $webError = $null
        if (git -C $Clone diff --name-only HEAD~1 HEAD -- "inbox/$Key") {
            $run = $null
            for ($i = 0; $i -lt 24 -and -not $run; $i++) {
                Start-Sleep 5
                $run = (gh run list --repo $Repo --workflow hsmt-inbox.yml --commit $sha --json databaseId | ConvertFrom-Json | Select-Object -First 1).databaseId
            }
            if ($run) {
                gh run watch $run --repo $Repo --interval 10 > $null
                $concl = (gh run view $run --repo $Repo --json conclusion | ConvertFrom-Json).conclusion
                if ($concl -ne 'success') { $webError = "Đã tải tệp nhưng không ghi được lên bản web (Action $concl). Anh bấm Lấy lại tệp." }
            } else { $webError = 'Đã tải tệp nhưng Action không chạy, chưa ghi được lên bản web. Anh bấm Lấy lại tệp.' }
            if ($webError) { Write-Host "Action hsmt inbox: $webError" }
        } else { $webError = if ($files) { '' } else { $err -join ' ' } }
        if ($null -ne $webError) {
            $req.doneAt = Now-Iso
            $req.error = $webError
            Send-WebDocs @(@{ coll = 'hsmtreq'; id = $Key; data = $req }) | Out-Null
        }
    }
    # Gói chưa có bản phân tích đầy đủ: xếp vào hàng chờ Phân tích, để bot chạy lượt phân tích ngay sau lượt lấy tệp.
    if ($QueueAnalysis -and $files) {
        $a = Get-WebDoc 'analysis'
        if (-not $a -or $a.status -ne 'done' -or $a.basis -eq 'notice') {
            if (Send-WebDocs @(@{ coll = 'analysisreq'; id = $Key; data = @{ notifyNo = $Key; requestedAt = (Now-Iso); from = 'agent' } })) { Write-Host "Đã xếp $Key vào hàng chờ phân tích." }
        }
    }
    if ($RequestedAt) {
        $st =if (Test-Path $StateFile) { Get-Content $StateFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { [pscustomobject]@{ done = @() } }
        $st.done = @($st.done) + "$Key|$RequestedAt"
        [IO.File]::WriteAllText($StateFile, ($st | ConvertTo-Json -Compress), $utf8)
    }
}
Write-Host "$Key : $($files.Count) tệp lên release $tag, bỏ qua $($skipped.Count)."
