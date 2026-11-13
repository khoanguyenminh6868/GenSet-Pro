# Send-GenBidIngest.ps1: gửi kết quả phân tích từ thư mục xuất ArtifactData lên Vercel /api/ingest.
# Invoke-RestMethod được thay bằng hàm giả; token, trạng thái và thư mục xuất đều nằm trong thư mục tạm.
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'Send-GenBidIngest.ps1' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:IngestScript = Join-Path $global:BotDir 'Send-GenBidIngest.ps1'
        $global:SecretToken = 'tok-' + [guid]::NewGuid().ToString('N')
        if (-not ('GenBidFakeHttpEx' -as [type])) { Add-Type -TypeDefinition 'using System; public class GenBidFakeHttpEx : Exception { public object Response; public GenBidFakeHttpEx(string m, object r) : base(m) { Response = r; } }' }
        function global:Invoke-RestMethod {
            param($Uri, $Method, $Headers, $ContentType, $Body, $TimeoutSec)
            $global:Posts += , @{ Uri = $Uri; Auth = $Headers.Authorization; Body = [Text.Encoding]::UTF8.GetString($Body) }
            if ($global:RestStatus) { throw (New-Object GenBidFakeHttpEx 'lỗi', ([pscustomobject]@{ StatusCode = [pscustomobject]@{ value__ = $global:RestStatus } })) }
            $n = (($global:Posts[-1].Body | ConvertFrom-Json).rows | Measure-Object).Count
            [pscustomobject]@{ written = $n; skipped = 0 }
        }
        # Thư mục xuất: $Docs = @{ 'analysis/IB1' = @{ doc; version } }.
        function global:New-Ingest([hashtable]$Docs, [bool]$Token = $true) {
            $d = New-BotTemp ('ing-' + [guid]::NewGuid().ToString('N'))
            $ver = @{}
            foreach ($k in $Docs.Keys) { Write-BotJson (Join-Path "$d/export" (($k -replace '/', '\') + '.json')) $Docs[$k].doc; $ver[$k] = $Docs[$k].version }
            New-Item -ItemType Directory -Force "$d/export" | Out-Null
            Write-BotJson "$d/versions.json" $ver
            if ($Token) { Write-BotText "$d/token" ($global:SecretToken + "`n") }
            $d
        }
        function global:Send-It([string]$d, [switch]$DryRun) {
            $global:Posts = @(); $global:RestStatus = $null; $global:LASTEXITCODE = $null
            $p = @{ ExportDir = "$d/export"; Versions = "$d/versions.json"; TokenFile = "$d/token"; StateFile = "$d/state.json"; Endpoint = 'http://fake/api/ingest' }
            if ($DryRun) { $p.DryRun = $true }
            $out = & $global:IngestScript @p 6>&1 | ForEach-Object { "$_" }
            @{ Out = ($out -join "`n"); Code = $global:LASTEXITCODE }
        }
        function global:State([string]$d) { if (Test-Path "$d/state.json") { Get-Content -Raw -Encoding UTF8 "$d/state.json" | ConvertFrom-Json } }
    }
    AfterAll { Remove-Item Function:\Invoke-RestMethod -ErrorAction SilentlyContinue }

    It 'không có tệp token hoặc token rỗng: bỏ qua bước gửi, không gọi Vercel, mã 0' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done' }; version = 1 } } $false
        $r = Send-It $d
        Assert-Eq $r.Code 0; Assert-Eq $global:Posts.Count 0; Assert-Match $r.Out 'Chưa có tệp token'
        Write-BotText "$d/token" "  `n"
        Assert-Match (Send-It $d).Out 'Tệp token rỗng'
    }
    It 'gửi phân tích xong (status done) kèm token Bearer; không in token ra màn hình; ghi trạng thái version + SHA' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done'; summary = 'Tóm tắt' }; version = 3 } }
        $r = Send-It $d
        Assert-Eq $global:Posts.Count 1
        Assert-Eq $global:Posts[0].Auth "Bearer $($global:SecretToken)"
        $rows = ($global:Posts[0].Body | ConvertFrom-Json).rows
        Assert-Eq $rows[0].coll 'analysis'; Assert-Eq $rows[0].id 'IB1'; Assert-Eq $rows[0].data.summary 'Tóm tắt'
        Assert-NotMatch $r.Out ([regex]::Escape($global:SecretToken))
        Assert-Match $r.Out 'Đã gửi 1 tài liệu: written=1, skipped=0'
        $s = State $d
        Assert-Eq $s.'analysis/IB1' 3
        Assert-Match $s.'analysis/IB1#sha' '^[0-9A-F]{64}$'
    }
    It 'gửi lần hai cùng version: không gọi Vercel nữa' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done' }; version = 3 } }
        Send-It $d | Out-Null
        $r = Send-It $d
        Assert-Eq $global:Posts.Count 0
        Assert-Match $r.Out 'Không có kết quả phân tích mới'
    }
    It 'version tăng nhưng nội dung y hệt: chỉ cập nhật version, không gửi' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done'; a = 1 }; version = 3 } }
        Send-It $d | Out-Null
        Write-BotJson "$d/versions.json" @{ 'analysis/IB1' = 4 }
        Send-It $d | Out-Null
        Assert-Eq $global:Posts.Count 0
        Assert-Eq (State $d).'analysis/IB1' 4
    }
    It 'version tăng và nội dung đổi: gửi lại' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done'; a = 1 }; version = 3 } }
        Send-It $d | Out-Null
        Write-BotJson (Join-Path "$d/export" 'analysis\IB1.json') @{ status = 'done'; a = 2 }
        Write-BotJson "$d/versions.json" @{ 'analysis/IB1' = 4 }
        Send-It $d | Out-Null
        Assert-Eq $global:Posts.Count 1
    }
    It 'phân tích chưa xong (status khác done) không gửi; collection khác thì gửi bất kể status' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'running' }; version = 1 }; 'bidders/IB2' = @{ doc = @{ status = 'x'; list = @() }; version = 1 } }
        Send-It $d | Out-Null
        $rows = ($global:Posts[0].Body | ConvertFrom-Json).rows
        Assert-Eq @($rows).Count 1; Assert-Eq $rows[0].coll 'bidders'
    }
    It 'tệp xuất có lớp bọc {data, version} thì gửi phần data' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ data = @{ status = 'done'; x = 5 }; version = 9 }; version = 9 } }
        Send-It $d | Out-Null
        $rows = ($global:Posts[0].Body | ConvertFrom-Json).rows
        Assert-Eq $rows[0].data.x 5
    }
    It 'thiếu tệp xuất của một mục thì bỏ qua mục đó' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done' }; version = 1 } }
        Write-BotJson "$d/versions.json" @{ 'analysis/IB1' = 1; 'analysis/MISSING' = 1 }
        Send-It $d | Out-Null
        Assert-Eq @(($global:Posts[0].Body | ConvertFrom-Json).rows).Count 1
    }
    It '-DryRun chỉ liệt kê: không gọi Vercel, không ghi trạng thái' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done' }; version = 1 } }
        $r = Send-It $d -DryRun
        Assert-Eq $global:Posts.Count 0
        Assert-False (Test-Path "$d/state.json")
        Assert-Match $r.Out 'DryRun: sẽ gửi 1 tài liệu'
    }
    It 'Vercel báo 401: bỏ qua lượt, mã 0, không ghi trạng thái (để lần sau gửi lại)' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done' }; version = 1 } }
        $global:Posts = @(); $global:RestStatus = 401; $global:LASTEXITCODE = $null
        $p = @{ ExportDir = "$d/export"; Versions = "$d/versions.json"; TokenFile = "$d/token"; StateFile = "$d/state.json"; Endpoint = 'http://fake' }
        $out = (& $global:IngestScript @p 6>&1 | ForEach-Object { "$_" }) -join "`n"
        Assert-Eq $global:LASTEXITCODE 0
        Assert-Match $out '401'
        Assert-False (Test-Path "$d/state.json")
    }
    It 'lỗi khác 401 thì ném lỗi lên (bot ghi log)' {
        $d = New-Ingest @{ 'analysis/IB1' = @{ doc = @{ status = 'done' }; version = 1 } }
        $global:Posts = @(); $global:RestStatus = 500
        $p = @{ ExportDir = "$d/export"; Versions = "$d/versions.json"; TokenFile = "$d/token"; StateFile = "$d/state.json"; Endpoint = 'http://fake' }
        $threw = $false
        try { & $global:IngestScript @p 6>&1 | Out-Null } catch { $threw = $true }
        Assert-True $threw
    }
    It 'gửi theo lô 200 tài liệu: 201 tài liệu là 2 lần gọi' {
        $docs = @{}; 1..201 | ForEach-Object { $docs["bidders/B$_"] = @{ doc = @{ n = $_ }; version = 1 } }
        $d = New-Ingest $docs
        Send-It $d | Out-Null
        Assert-Eq $global:Posts.Count 2
        Assert-Eq @(($global:Posts[0].Body | ConvertFrom-Json).rows).Count 200
        Assert-Eq @(($global:Posts[1].Body | ConvertFrom-Json).rows).Count 1
    }
}
