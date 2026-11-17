#!/usr/bin/env bash
# Khởi chạy bot GenBid trong sandbox (chạy sau setup-sandbox.sh). Thay cho tác vụ Windows "GenBid Bot".
# Bí mật chỉ đi qua biến môi trường của lần chạy này, không nằm trong git:
#   GENBID_INGEST_TOKEN     biến INGEST_TOKEN của project Vercel genset-pro-web (bắt buộc)
#   CLAUDE_CODE_OAUTH_TOKEN token của `claude setup-token` (gói tháng) và/hoặc ANTHROPIC_API_KEY (trả theo API)
#   GH_TOKEN                GitHub token có quyền ghi repo (Publish-GenBidHsmt.ps1: Release + nhánh hsmt-inbox)
#   FIRECRAWL_KEY           (tuỳ chọn) khoá Firecrawl cho Tìm NCC
# Bot chạy tới khi sandbox hết phiên; bot/sandbox/ensure.mjs khởi chạy lại ở phiên sau.
set -euo pipefail
ROOT="${GENBID_ROOT:-$HOME/genset-pro}"
KIT="$ROOT/genbid-hsmt"
export PATH="$HOME/.npm-global/bin:/usr/local/bin:$PATH"
export GENBID_ROOT="$ROOT" WINEPREFIX="${WINEPREFIX:-$HOME/.wine}" WINEDEBUG=-all DISPLAY=:99 GENBID_SPEC_NORM="${GENBID_SPEC_NORM:-1}"

[ -n "${GENBID_INGEST_TOKEN:-}" ] || [ -s "$ROOT/.genbid-ingest-token" ] || { echo "Thiếu GENBID_INGEST_TOKEN" >&2; exit 2; }
umask 077
[ -z "${GENBID_INGEST_TOKEN:-}" ]     || printf '%s\n' "$GENBID_INGEST_TOKEN"     > "$ROOT/.genbid-ingest-token"
[ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] || printf '%s\n' "$CLAUDE_CODE_OAUTH_TOKEN" > "$ROOT/.claude-bot-token"
[ -z "${ANTHROPIC_API_KEY:-}" ]       || printf '%s\n' "$ANTHROPIC_API_KEY"       > "$ROOT/.anthropic-api-key"
[ -z "${FIRECRAWL_KEY:-}" ]           || printf '%s\n' "$FIRECRAWL_KEY"           > "$KIT/.firecrawl-key"
# Bot tự chọn token / API key theo từng việc; các biến này không được lọt vào tiến trình con ngoài ý muốn.
unset GENBID_INGEST_TOKEN CLAUDE_CODE_OAUTH_TOKEN ANTHROPIC_API_KEY FIRECRAWL_KEY
if [ -n "${GH_TOKEN:-}" ]; then gh auth setup-git >/dev/null 2>&1 || true; fi

# Kéo code mới nhất của nhánh đang dùng (bot/ và suppliers/), như Update-GenBidBot.ps1 trên Windows.
BRANCH="$(git -C "$ROOT/GenSet-Pro" rev-parse --abbrev-ref HEAD)"
git -C "$ROOT/GenSet-Pro" fetch -q origin "$BRANCH" && git -C "$ROOT/GenSet-Pro" merge -q --ff-only "origin/$BRANCH" || true
cp -a "$ROOT/GenSet-Pro/bot/genbid-hsmt/." "$KIT/"

# Màn hình ảo cho Chrome (muasamcong cần cửa sổ thật) và Wine (VNeGP Agent). Agent do bot bật khi cần (GenBid-HSMT.ps1).
pgrep -x Xvfb >/dev/null || { nohup Xvfb :99 -screen 0 1280x900x24 >/tmp/xvfb.log 2>&1 & sleep 2; }

cd "$ROOT"
exec pwsh -NoProfile -File "$KIT/GenBid-Bot.ps1"
