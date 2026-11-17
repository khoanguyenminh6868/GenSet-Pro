<#
Đặt bí mật cho bot dự phòng Vercel Sandbox (bot/sandbox/README.md). KHOA chạy trên máy có bot, Claude không chạy hộ
(Claude không được đưa token vào kho bí mật). Giá trị không in ra màn hình.

  powershell -NoProfile -ExecutionPolicy Bypass -File bot\sandbox\Set-SandboxSecrets.ps1

- GitHub secrets từ tệp trên máy: CLAUDE_CODE_OAUTH_TOKEN (.claude-bot-token), ANTHROPIC_API_KEY (.anthropic-api-key),
  FIRECRAWL_KEY (genbid-hsmt\.firecrawl-key). GENBID_INGEST_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID đã có.
- Hỏi (dán vào, không hiện chữ):
  * VERCEL_TOKEN: tạo ở https://vercel.com/account/tokens (scope: team của genset-pro-web).
  * PAT GitHub fine-grained, chỉ repo GenSet-Pro, quyền Contents: Read and write + Actions: Read and write:
    https://github.com/settings/personal-access-tokens/new . Dùng cho GH_BOT_TOKEN (GitHub secret) và GH_DISPATCH_TOKEN (Vercel).
- Đặt GH_DISPATCH_TOKEN trên Vercel (production) bằng Vercel CLI đã đăng nhập. Bỏ trống câu hỏi nào thì bỏ qua mục đó.
Không cần quyền admin.
#>
param(
  [string]$Root = 'C:\Projects\GenSet Pro',
  [string]$Repo = 'khoanguyenminh6868/GenSet-Pro',
  [string]$VercelProject = 'prj_aUHYd6alzho2hkEPFw4Yvwfx7ywm',
  [string]$VercelTeam = 'team_8zB3fhM5zT83PRiLbjpUAWQw'
)
$ErrorActionPreference = 'Stop'

function Set-GhSecret([string]$Name, [string]$Value) {
  if (-not $Value) { Write-Host "  - $Name : bỏ qua (trống)"; return }
  gh secret set $Name -R $Repo --body $Value.Trim() | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "gh secret set $Name lỗi" }
  Write-Host "  + $Name : đã đặt"
}
function Read-FileValue([string]$Path) { if (Test-Path $Path) { (Get-Content -Raw $Path).Trim() } else { '' } }
function Read-Secret([string]$Prompt) {
  $s = Read-Host -AsSecureString $Prompt
  $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b).Trim() } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}

Write-Host "GitHub secrets từ tệp trên máy:"
Set-GhSecret 'CLAUDE_CODE_OAUTH_TOKEN' (Read-FileValue "$Root\.claude-bot-token")
Set-GhSecret 'ANTHROPIC_API_KEY' (Read-FileValue "$Root\.anthropic-api-key")
Set-GhSecret 'FIRECRAWL_KEY' (Read-FileValue "$Root\genbid-hsmt\.firecrawl-key")

Write-Host "`nVERCEL_TOKEN: tạo ở https://vercel.com/account/tokens rồi dán vào đây."
Start-Process 'https://vercel.com/account/tokens'
Set-GhSecret 'VERCEL_TOKEN' (Read-Secret 'VERCEL_TOKEN')

Write-Host "`nPAT GitHub (chỉ repo GenSet-Pro; Contents + Actions: Read and write): tạo rồi dán vào đây."
Start-Process 'https://github.com/settings/personal-access-tokens/new'
$pat = Read-Secret 'PAT GitHub'
Set-GhSecret 'GH_BOT_TOKEN' $pat

if ($pat) {
  # vercel env add cần thư mục đã liên kết project: dựng tạm .vercel\project.json.
  $tmp = Join-Path $env:TEMP ("genbid-vercel-" + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force "$tmp\.vercel" | Out-Null
  @{ projectId = $VercelProject; orgId = $VercelTeam } | ConvertTo-Json | Set-Content -Encoding ascii "$tmp\.vercel\project.json"
  Push-Location $tmp
  try {
    $ErrorActionPreference = 'Continue'
    vercel env rm GH_DISPATCH_TOKEN production --yes 2>$null | Out-Null
    $pat | vercel env add GH_DISPATCH_TOKEN production --sensitive 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  ! Vercel: không đặt được GH_DISPATCH_TOKEN, đặt tay ở Settings > Environment Variables" }
    else { Write-Host "  + Vercel GH_DISPATCH_TOKEN : đã đặt (production)" }
  } finally { Pop-Location; Remove-Item -Recurse -Force $tmp }
}
$pat = $null
Write-Host "`nXong. Báo Claude để bật GENBID_SANDBOX_ENABLED, redeploy web và chạy workflow lần đầu."
