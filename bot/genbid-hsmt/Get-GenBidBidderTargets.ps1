<#
Chọn các gói cần lấy danh sách nhà thầu và giá dự thầu từ muasamcong trong lượt này (bước 5b của worker).
Gói được chọn: đang ở Đã nộp hoặc Trúng thầu, và mọi gói Đã đóng trên bản web (Mới, Đang xem, Chuẩn bị HSDT hoặc
không theo dõi, đã đóng thầu), trừ gói Đã hủy TBMT (Khoa 2026-11-04: lấy đến khi có KQLCNT; trước đó chỉ Đã nộp và
Trúng thầu, Khoa 2026-10-27), cùng gói Bỏ qua (Khoa 2026-11-04; markJoined để nguyên Bỏ qua). Không trúng và dự án
không lấy. Gói mình có nộp mà quên chuyển sang Đã nộp: ingest.js markJoined thấy MST công ty trong danh sách nhà thầu
và tự chuyển.
Gói phải đã đóng thầu (quá 30 phút) trong vòng -Days ngày, chưa xoá, chưa có kết quả LCNT trên bản web
(bidders/<TBMT> có final = true), và chưa kiểm tra gần đây (portalids/<TBMT>.checkedAt: 6 giờ với gói đóng
trong 7 ngày, 24 giờ với gói cũ hơn). Gói đóng gần nhất đi trước; tối đa -Max gói.
Ghi ra -Out mảng [{key, notifyNo, bidName, bidCloseDate, tracked, stage, joined}].
#>
param(
    [Parameter(Mandatory)][string]$Out,
    [int]$Max = 15,
    [int]$Days = 180,
    [int]$BcdgMax = 5
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$tmp = Join-Path $env:TEMP "genbid-targets-$(Get-Random)"
New-Item -ItemType Directory $tmp | Out-Null
function Get-Coll([string]$coll, [string]$id) {
    $f = Join-Path $tmp "$coll.json"
    $a = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'Get-GenBidRequests.ps1'), '-Kind', 'docs', '-Coll', $coll, '-Out', $f) + @(if ($id) { '-Id', $id })
    & powershell @a | Out-Null
    if ($LASTEXITCODE -eq 1) { throw "Không đọc được $coll từ bản web." }
    if (-not (Test-Path $f)) { return @() }
    $d = Get-Content $f -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($id) { return $d }
    @($d | ForEach-Object { $_ })
}
try {
    $info = @{}
    foreach ($t in @((Get-Coll 'feed' 'current').tenders)) { if ($t.notifyNo) { $info[$t.notifyNo] = $t } }
    foreach ($c in 'seen', 'manual') { foreach ($d in (Get-Coll $c)) { if (-not $info[$d.id] -and $d.data.bidCloseDate -and -not $d.data.isProject) { $info[$d.id] = $d.data } } }
    $tracked = @{}; $cancelled = @{}
    foreach ($d in (Get-Coll 'tracked')) {
        $tracked[$d.id] = if ($d.data.stage) { $d.data.stage } else { 'new' }
        if ($d.data.tender.status -eq 'cancelled') { $cancelled[$d.id] = 1 }
        # Gói đã rời feed: seen có thể còn bản TBMT cũ (ngày đóng thầu trước khi sửa, IB2600581294 04/11) → lấy bản
        # có notifyVersion mới hơn trong tracked.tender.
        $tt = $d.data.tender
        if ($tt.bidCloseDate -and (-not $info[$d.id] -or [string]$tt.notifyVersion -gt [string]$info[$d.id].notifyVersion)) { $info[$d.id] = $tt }
    }
    foreach ($k in $info.Keys) { if ($info[$k].status -eq 'cancelled') { $cancelled[$k] = 1 } }
    $deleted = @{}; foreach ($d in (Get-Coll 'deleted')) { $deleted[$d.id] = 1 }
    $bidders = @{}; foreach ($d in (Get-Coll 'bidders')) { $bidders[$d.id] = $d.data }
    $portal = @{}; foreach ($d in (Get-Coll 'portalids')) { $portal[$d.id] = $d.data }
    $now = (Get-Date).ToUniversalTime()
    # Gói đóng thầu khi còn ở new/reviewing/preparing (hoặc không theo dõi) hiện là Đã đóng trên bản web.
    $keys = @(@($tracked.Keys | Where-Object { $tracked[$_] -in 'submitted', 'won', 'preparing', 'reviewing', 'new', 'dropped' }) + @($info.Keys | Where-Object { -not $tracked[$_] }))
    $list = foreach ($key in $keys) {
        # Gói đang theo dõi mà bản web không có ngày đóng thầu: vẫn kiểm tra, mỗi 24 giờ một lần.
        $t = if ($info[$key]) { $info[$key] } else { [pscustomobject]@{ bidName = ''; bidCloseDate = $null } }
        if ($deleted[$key] -or $bidders[$key].final -or $cancelled[$key]) { continue }
        $close = if ($t.bidCloseDate) { ([datetime]$t.bidCloseDate).ToUniversalTime() } else { $now.AddDays(-30) }
        # Ngày đóng thầu lần kiểm tra trước đọc được trên muasamcong: gói gia hạn mà notifyVersion không đổi
        # (IB2600574589 04/11) thì seen/tracked vẫn giữ ngày cũ.
        $pc = $portal[$key].bidCloseDate
        if ($pc -and ([datetime]$pc).ToUniversalTime() -gt $close) { $close = ([datetime]$pc).ToUniversalTime() }
        if ($close -gt $now.AddMinutes(-30) -or $close -lt $now.AddDays(-$Days)) { continue }
        $checked = $portal[$key].checkedAt
        $gap = if ($t.bidCloseDate -and $close -gt $now.AddDays(-7)) { 6 } else { 24 }
        # Lần kiểm tra trước sớm hơn 30 phút sau đóng thầu (khi đó còn dùng ngày đóng thầu cũ) thì không tính.
        if ($checked -and ([datetime]$checked).ToUniversalTime() -gt $now.AddHours(-$gap) -and ([datetime]$checked).ToUniversalTime() -gt $close.AddMinutes(30)) { continue }
        $stage = $tracked[$key]
        [pscustomobject]@{ key = $key; notifyNo = $key; bidName = $t.bidName; bidCloseDate = $t.bidCloseDate; tracked = [bool]$stage; stage = $stage; joined = $stage -in 'submitted', 'won', 'lost'; close = $close }
    }
    $pick = @($list | Sort-Object @{ e = { $_.close }; Descending = $true } | Select-Object -First $Max | Select-Object key, notifyNo, bidName, bidCloseDate, tracked, stage, joined)
    # Báo cáo đánh giá E-HSDT (Khoa 2026-11-12): gói đã có kết quả (final) mà MST công ty có trong danh sách nhà thầu và chưa có
    # bcdg/<TBMT> (hoặc lần trước lỗi, quá 24 giờ) thì lấy báo cáo, tối đa -BcdgMax gói một lượt; chỉ ghi bcdg/<TBMT>.
    $bcdg = @()
    if ($BcdgMax -gt 0) {
        try {
            $have = @{}; foreach ($d in (Get-Coll 'bcdg')) { $have[$d.id] = $d.data }
            $bcdg = @($bidders.Keys | Where-Object {
                $b = $bidders[$_]
                if (-not $b.final -or $deleted[$_]) { return $false }
                if (-not (@($b.list) | Where-Object { ([string]$_.taxCode -replace '\D', '') -eq '4101623015' })) { return $false }
                $h = $have[$_]
                # Lần lấy trước lỗi (bcdg-step.js): thử lại sau 1 giờ (lần lỗi thứ 1), 6 giờ (thứ 2); đã bỏ (giveUp) sau 3 lần thì thôi.
                if (-not $h) { return $true }
                if (-not $h.error -or $h.giveUp) { return $false }
                $wait = if ([int]$h.tries -ge 2) { 6 } else { 1 }
                (-not $h.at) -or (([datetime]$h.at).ToUniversalTime() -lt $now.AddHours(-$wait))
            } | Sort-Object | Select-Object -First $BcdgMax | ForEach-Object {
                [pscustomobject]@{ key = $_; notifyNo = $_; bidName = ''; bidCloseDate = $null; tracked = [bool]$tracked[$_]; stage = $tracked[$_]; joined = $true; bcdgOnly = $true }
            })
        } catch { Write-Host "Không đọc được bcdg từ bản web, bỏ qua bước lấy báo cáo đánh giá: $($_.Exception.Message)" }
    }
    $pick = @($pick) + @($bcdg)
    [IO.File]::WriteAllText($Out, (ConvertTo-Json @($pick) -Depth 4), $utf8)
    Write-Host "$(@($list).Count) gói cần lấy nhà thầu, lượt này lấy $($pick.Count - $bcdg.Count)$(if ($bcdg.Count) { " + $($bcdg.Count) gói lấy báo cáo đánh giá" }): $(($pick | ForEach-Object { $_.key }) -join ', ')"
} finally { Remove-Item -Recurse -Force $tmp }
