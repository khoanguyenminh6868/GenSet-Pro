#!/usr/bin/env bash
# Dựng môi trường bot GenBid trong Vercel Sandbox (Ubuntu, x86_64). Tương đương bot/Install-GenBidBot.ps1 cho Windows.
# Chạy một lần trên sandbox mới (sandbox "persistent" giữ lại kết quả qua snapshot); chạy lại nhiều lần không sao.
#   bash setup-sandbox.sh [nhánh-git]        mặc định nhánh main
# Không đụng tới token: bot/sandbox/start-bot.sh tạo tệp token từ biến môi trường mỗi lần khởi chạy.
set -euo pipefail

BRANCH="${1:-main}"
ROOT="${GENBID_ROOT:-$HOME/genset-pro}"
REPO_URL="https://github.com/khoanguyenminh6868/GenSet-Pro.git"
# Bộ cài VNeGP Client Agent 2.0.1 (64bit) do Bộ Tài chính công bố (muasamcong > Hướng dẫn > Nhà đầu tư). Link đổi theo phiên bản:
# lấy lại bằng cách đọc dòng "AgentDTO ... downloadUrl=" trong logs/egp-agent-plugin.log của Agent, hoặc đặt AGENT_RAR_URL.
AGENT_RAR_URL="${AGENT_RAR_URL:-https://muasamcong.mof.gov.vn/api/unau/edocproxy/file/share/87dfc0de7639ba552582e504e4ccceceeffc0691f9c3ed050965737d5f04d9f1}"
AGENT_RAR_SIZE=90466697
export DEBIAN_FRONTEND=noninteractive
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
step() { printf '\n== %s\n' "$*"; }

step "Gói hệ thống (Xvfb, Wine, Poppler, Tesseract, bsdtar, git, gh, ICU)"
$SUDO apt-get update -qq
ICU="$(apt-cache search '^libicu[0-9]+$' | cut -d' ' -f1 | sort -V | tail -1)"
$SUDO apt-get install -y -qq --no-install-recommends \
  xvfb xauth fonts-liberation fonts-noto-core wine wine64 cabextract \
  poppler-utils tesseract-ocr libtesseract-dev libarchive-tools p7zip-full unzip curl ca-certificates git gh \
  "${ICU:-libicu-dev}" libssl-dev procps psmisc >/dev/null
# .doc: antiword hoặc catdoc nếu Ubuntu có (không có thì bot bỏ qua tệp .doc, như máy không có Word).
for p in antiword catdoc; do $SUDO apt-get install -y -qq --no-install-recommends "$p" >/dev/null 2>&1 && break || true; done

step "PowerShell 7 (pwsh)"
if ! command -v pwsh >/dev/null; then
  URL="$(curl -fsSL https://api.github.com/repos/PowerShell/PowerShell/releases/latest | grep -oE 'https://[^"]+powershell-[0-9.]+-linux-x64\.tar\.gz' | head -1)"
  [ -n "$URL" ] || { echo "Không tìm được bản pwsh trên GitHub" >&2; exit 1; }
  curl -fsSL -o /tmp/pwsh.tgz "$URL"
  $SUDO mkdir -p /opt/microsoft/powershell && $SUDO tar -xzf /tmp/pwsh.tgz -C /opt/microsoft/powershell
  $SUDO chmod +x /opt/microsoft/powershell/pwsh && $SUDO ln -sf /opt/microsoft/powershell/pwsh /usr/local/bin/pwsh
fi
pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'

step "Google Chrome (reCAPTCHA của muasamcong chỉ chấp nhận trình duyệt có cửa sổ thật, chạy dưới Xvfb)"
if ! command -v google-chrome >/dev/null; then
  curl -fsSL -o /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  $SUDO apt-get install -y -qq /tmp/chrome.deb >/dev/null
fi
google-chrome --version

step "unrar (RARLAB, chỉ giải nén)"
if ! command -v unrar >/dev/null; then
  U="$(curl -fsSL https://www.rarlab.com/download.htm | grep -oE 'rar/rarlinux-x64-[0-9]+\.tar\.gz' | sort -u | tail -1)"
  curl -fsSL -o /tmp/rarlinux.tgz "https://www.rarlab.com/$U" && tar -xzf /tmp/rarlinux.tgz -C /tmp
  $SUDO install -m 755 /tmp/rar/unrar /usr/local/bin/unrar
fi

step "Node.js 22 (image vercel/sandbox/ubuntu không có sẵn)"
if ! command -v node >/dev/null; then
  NODE_TGZ="$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | grep -oE 'node-v22\.[0-9.]+-linux-x64\.tar\.gz' | head -1)"
  [ -n "$NODE_TGZ" ] || { echo "Không tìm được bản Node 22 trên nodejs.org" >&2; exit 1; }
  curl -fsSL -o /tmp/node.tgz "https://nodejs.org/dist/latest-v22.x/$NODE_TGZ"
  $SUDO tar -xzf /tmp/node.tgz -C /usr/local --strip-components=1
fi
node --version

step "Claude Code CLI"
if ! command -v claude >/dev/null; then
  npm config set prefix "$HOME/.npm-global"
  npm install -g @anthropic-ai/claude-code >/dev/null
fi
export PATH="$HOME/.npm-global/bin:$PATH"
claude --version || true

step "Antigravity CLI (agy: Gemini cho bản dịch; đăng nhập Google một lần: vercel sandbox connect genbid-bot, chạy agy)"
[ -x "$HOME/.local/bin/agy" ] || curl -fsSL https://antigravity.google/cli/install.sh | bash || echo "Không cài được agy: bản dịch dùng Claude"

step "Repo GenSet-Pro ($BRANCH) -> $ROOT/GenSet-Pro"
mkdir -p "$ROOT/genbid-bot-logs" "$ROOT/genbid-work" "$ROOT/genbid-hsmt"
if [ ! -d "$ROOT/GenSet-Pro/.git" ]; then git clone -q "$REPO_URL" "$ROOT/GenSet-Pro"; fi
git -C "$ROOT/GenSet-Pro" fetch -q origin "$BRANCH"
git -C "$ROOT/GenSet-Pro" checkout -q -B "$BRANCH" "origin/$BRANCH"
git config --global user.name "GenBid Bot" && git config --global user.email "genbid-bot@users.noreply.github.com"

step "Bot kit -> $ROOT/genbid-hsmt, npm ci"
cp -a "$ROOT/GenSet-Pro/bot/genbid-hsmt/." "$ROOT/genbid-hsmt/"
cp -f "$ROOT/genbid-hsmt/hsmt-worker.md" "$ROOT/.hsmt-worker.md"
[ -f "$ROOT/.hsmt-worker-state.json" ] || echo '{"done": []}' > "$ROOT/.hsmt-worker-state.json"
(cd "$ROOT/genbid-hsmt" && npm ci --no-audit --no-fund >/dev/null)
(cd "$ROOT/GenSet-Pro/suppliers" && [ -f package.json ] && npm ci --no-audit --no-fund >/dev/null || true)

step "tessdata_best (vie, eng, osd)"
mkdir -p "$ROOT/.genbid-tessdata-best"
for l in vie eng osd; do
  f="$ROOT/.genbid-tessdata-best/$l.traineddata"
  [ -s "$f" ] || curl -fsSL -o "$f" "https://github.com/tesseract-ocr/tessdata_best/raw/main/$l.traineddata"
done

step "Nhánh hsmt-inbox -> $ROOT/hsmt-inbox (Publish-GenBidHsmt.ps1 đẩy danh sách tệp HSMT vào đây)"
if [ ! -d "$ROOT/hsmt-inbox/.git" ]; then git clone -q --single-branch -b hsmt-inbox "$REPO_URL" "$ROOT/hsmt-inbox"
else git -C "$ROOT/hsmt-inbox" pull -q --ff-only origin hsmt-inbox || true; fi

step "VNeGP Client Agent (bản Windows chính thức) dưới Wine"
export WINEPREFIX="${WINEPREFIX:-$HOME/.wine}" WINEDEBUG=-all DISPLAY=:99
AGENT_DIR="$WINEPREFIX/drive_c/MPI/EGP-AGENT"
if [ ! -f "$AGENT_DIR/egp-edoc-agent.exe" ]; then
  pgrep -x Xvfb >/dev/null || { nohup Xvfb :99 -screen 0 1280x900x24 >/tmp/xvfb.log 2>&1 & sleep 2; }
  mkdir -p /tmp/agent-dl && cd /tmp/agent-dl
  curl -fsSL -A 'Mozilla/5.0' -o agent.rar "$AGENT_RAR_URL"
  [ "$(stat -c %s agent.rar)" -gt 50000000 ] || { echo "Tải bộ cài Agent không đúng (PDF/lỗi thay vì RAR). Đặt AGENT_RAR_URL." >&2; exit 1; }
  rm -rf ex && unrar x -y -inul agent.rar ex/
  wine ex/*/agent-setup-*.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP- '/DIR=C:\MPI\EGP-AGENT'
  cd "$HOME" && rm -rf /tmp/agent-dl
fi
[ -f "$AGENT_DIR/egp-edoc-agent.exe" ] || { echo "Cài Agent không thành công" >&2; exit 1; }
echo "Agent: $AGENT_DIR"

echo
echo "Xong. Kế tiếp: GENBID_INGEST_TOKEN=... CLAUDE_CODE_OAUTH_TOKEN=... GH_TOKEN=... bash $ROOT/GenSet-Pro/bot/sandbox/start-bot.sh"
