<#
Cài lại bot GenBid trên một máy Windows mới từ repo này (Khoa, 2026-11-04: máy hư thì clone về chạy tiếp).

Trước khi chạy:
  git clone https://github.com/khoanguyenminh6868/GenSet-Pro.git "C:\Projects\GenSet Pro\GenSet-Pro"
rồi:
  powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Install-GenBidBot.ps1"

Script chép bot kit (bot\genbid-hsmt) vào $Root\genbid-hsmt, cài npm, Chromium, tessdata_best, clone nhánh hsmt-inbox,
chép skills Claude, tạo tác vụ Windows "GenBid Bot" (chạy lúc đăng nhập), rồi in những gì còn thiếu (token, phần mềm).
Chạy lại nhiều lần không sao: không ghi đè token hay tệp trạng thái.
#>
param(
    [string]$Root = 'C:\Projects\GenSet Pro',
    [switch]$NoTask,
    [switch]$StartBot
)
$ErrorActionPreference = 'Stop'
$Repo = Split-Path $PSScriptRoot -Parent
$Kit = Join-Path $Root 'genbid-hsmt'
$missing = New-Object System.Collections.Generic.List[string]
function Step($m) { Write-Host "== $m" -ForegroundColor Cyan }
function Has($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

Step "Phần mềm"
if (-not (Has node)) { $missing.Add('Node.js 20+: winget install OpenJS.NodeJS.LTS') }
if (-not (Has git)) { $missing.Add('Git: winget install Git.Git') }
if (-not (Has gh)) { $missing.Add('GitHub CLI: winget install GitHub.cli, rồi gh auth login') }
else { & gh auth status *> $null; if ($LASTEXITCODE) { $missing.Add('GitHub CLI chưa đăng nhập: gh auth login') } }
if (-not (Has claude)) { $missing.Add('Claude Code CLI: irm https://claude.ai/install.ps1 | iex, rồi claude (đăng nhập) hoặc claude setup-token') }
$tess = @("$env:LOCALAPPDATA\Programs\Tesseract-OCR\tesseract.exe", 'C:\Program Files\Tesseract-OCR\tesseract.exe') | Where-Object { Test-Path $_ }
if (-not $tess) { $missing.Add('Tesseract 5 (OCR bản gốc, nhanh hơn tesseract.js): winget install UB-Mannheim.TesseractOCR --scope user') }
$poppler = (Test-Path "$env:LOCALAPPDATA\Microsoft\WinGet\Links\pdftoppm.exe") -or (Has pdftoppm) -or
    @(Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Directory -Filter 'oschwartz10612.Poppler*' -ErrorAction SilentlyContinue).Count
if (-not $poppler) { $missing.Add('Poppler (pdftotext/pdftoppm): winget install --id oschwartz10612.Poppler -e --scope user') }
if (-not (Test-Path 'C:\MPI\EGP-AGENT')) { $missing.Add('VNeGP Client Agent bản chính thức ở C:\MPI\EGP-AGENT (cổng 1234), tải từ muasamcong.mpi.gov.vn') }
if (-not (Test-Path "$env:ProgramFiles\WinRAR\UnRAR.exe")) { $missing.Add('WinRAR (đọc tệp .rar): winget install RARLab.WinRAR') }
if (-not (Test-Path "$env:LOCALAPPDATA\agy\bin\agy.exe")) { $missing.Add('(tuỳ chọn) Antigravity CLI agy cho bản dịch Gemini; thiếu thì bot dịch bằng Claude') }
# Microsoft Word dùng để đọc .doc/.rtf; thiếu thì bot bỏ qua các tệp đó.

Step "Bot kit -> $Kit"
New-Item -ItemType Directory -Force $Kit, (Join-Path $Root 'genbid-bot-logs'), (Join-Path $Root 'genbid-work') | Out-Null
Copy-Item (Join-Path $PSScriptRoot 'genbid-hsmt\*') $Kit -Recurse -Force
Copy-Item (Join-Path $Kit 'hsmt-worker.md') (Join-Path $Root '.hsmt-worker.md') -Force
$state = Join-Path $Root '.hsmt-worker-state.json'
if (-not (Test-Path $state)) { '{"done": []}' | Out-File -Encoding ascii $state }

if (Has node) {
    Step "npm ci + Chromium"
    Push-Location $Kit
    try { & npm ci --no-audit --no-fund; & npx --yes playwright-core install chromium } finally { Pop-Location }
}

Step "tessdata_best (vie, eng)"
$td = Join-Path $Root '.genbid-tessdata-best'
New-Item -ItemType Directory -Force $td | Out-Null
foreach ($l in 'vie', 'eng') {
    $f = Join-Path $td "$l.traineddata"
    if (-not (Test-Path $f)) { Invoke-WebRequest "https://github.com/tesseract-ocr/tessdata_best/raw/main/$l.traineddata" -OutFile $f -UseBasicParsing }
}

Step "Nhánh hsmt-inbox -> $Root\hsmt-inbox"
$inbox = Join-Path $Root 'hsmt-inbox'
if ((Has git) -and -not (Test-Path (Join-Path $inbox '.git'))) {
    & git clone --single-branch -b hsmt-inbox https://github.com/khoanguyenminh6868/GenSet-Pro.git $inbox
}
if ((Has git) -and $Repo -ne (Join-Path $Root 'GenSet-Pro')) {
    $missing.Add("Repo nên ở $Root\GenSet-Pro (bot đọc suppliers\config-bot.mjs ở đó; hiện chạy từ $Repo)")
}
foreach ($d in $inbox, $Repo) {
    if ((Has git) -and (Test-Path (Join-Path $d '.git')) -and -not (& git -C $d config user.email)) { $missing.Add("git config user.name/user.email trong $d") }
}

Step "Skills Claude -> $env:USERPROFILE\.claude"
$cl = Join-Path $env:USERPROFILE '.claude'
foreach ($sub in 'skills\run-hsmt-worker', 'skills\genbid-setup', 'skills\tim-thong-so-ncc', 'scheduled-tasks\hsmt-worker') {
    New-Item -ItemType Directory -Force (Join-Path $cl $sub) | Out-Null
    Copy-Item (Join-Path $PSScriptRoot "claude\$sub\SKILL.md") (Join-Path $cl $sub) -Force
}
# Bộ nhớ Claude của dự án (tên thư mục theo đường dẫn C:\Projects\GenSet Pro); chỉ chép khi máy mới chưa có.
$mem = Join-Path $cl ('projects\' + ($Root -replace '[:\\ ]', '-') + '\memory')
if (-not (Test-Path (Join-Path $mem 'MEMORY.md'))) {
    New-Item -ItemType Directory -Force $mem | Out-Null
    Copy-Item (Join-Path $PSScriptRoot 'claude\memory\*') $mem -Force
}
Copy-Item (Join-Path $Repo 'CLAUDE.md') (Join-Path $Root 'CLAUDE.md') -Force
# Stop hook: chặn Claude kết thúc lượt khi bot trên máy khác bot/ trên GitHub.
$sf = Join-Path $cl 'settings.json'
$s = if (Test-Path $sf) { Get-Content $sf -Raw -Encoding UTF8 | ConvertFrom-Json } else { New-Object psobject }
if ((ConvertTo-Json $s -Depth 20) -notmatch 'Test-GenBidBotGit') {
    $hook = [pscustomobject]@{ hooks = @([pscustomobject]@{ type = 'command'; timeout = 60
        command = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$($Kit -replace '\\','/')/Test-GenBidBotGit.ps1`"" }) }
    if (-not $s.hooks) { $s | Add-Member hooks (New-Object psobject) }
    $s.hooks | Add-Member -Force Stop (@($s.hooks.Stop | Where-Object { $_ }) + $hook)
    [IO.File]::WriteAllText($sf, (ConvertTo-Json $s -Depth 20), (New-Object Text.UTF8Encoding $false))
}
$missing.Add('Skill /hsmt trên claude.ai: Settings > Skills > Upload bot\claude\skills\hsmt\SKILL.md (không làm bằng script được)')

Step "Token và khoá (không có trong git)"
if (-not (Test-Path (Join-Path $Root '.genbid-ingest-token'))) { $missing.Add("$Root\.genbid-ingest-token: token Vercel (biến INGEST_TOKEN của project genset-pro-web), một dòng") }
if (-not (Test-Path (Join-Path $Root '.claude-bot-token'))) { $missing.Add("$Root\.claude-bot-token: chạy claude setup-token rồi lưu token (không cần nếu claude đã đăng nhập)") }
if (-not (Test-Path (Join-Path $Root '.anthropic-api-key'))) { $missing.Add("$Root.anthropic-api-key: API key Anthropic (console.anthropic.com) để Phân tích, Gợi ý cấu hình, Giá gợi ý trả theo API thay vì hạn mức tháng; không có thì dùng gói tháng") }
if (-not (Test-Path (Join-Path $Kit '.firecrawl-key'))) { $missing.Add("$Kit\.firecrawl-key: khoá Firecrawl cho Tìm NCC (suppliers\discover.mjs)") }

if (-not $NoTask) {
    Step "Tác vụ Windows 'GenBid Bot'"
    $act = New-ScheduledTaskAction -Execute 'powershell.exe' -WorkingDirectory $Root `
        -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Kit\GenBid-Bot.ps1`""
    $trg = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
    $set = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0 `
        -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)
    $pri = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
    Register-ScheduledTask -TaskName 'GenBid Bot' -Action $act -Trigger $trg -Settings $set -Principal $pri -Force | Out-Null
    if ($StartBot) { Start-ScheduledTask 'GenBid Bot' }
}

Write-Host ''
if ($missing.Count) {
    Write-Host 'Còn thiếu (làm tay rồi chạy lại script này):' -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "  - $_" }
} else { Write-Host 'Đủ. Bot chạy ở lần đăng nhập sau, hoặc: Start-ScheduledTask "GenBid Bot"' -ForegroundColor Green }
Write-Host 'Lần đầu, muasamcong và Chrome của bot (.genbid-browser*) chưa có phiên: chạy thử node genbid-sync.js sync --force và xem cửa sổ Chromium.'
