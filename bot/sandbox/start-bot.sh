#!/usr/bin/env bash
# Khởi chạy bot GenBid trong sandbox (chạy sau setup-sandbox.sh). Thay cho tác vụ Windows "GenBid Bot".
# Bí mật chỉ đi qua biến môi trường của lần chạy này, không nằm trong git:
#   GENBID_INGEST_TOKEN     biến INGEST_TOKEN của project Vercel genset-pro-web (bắt buộc)
#   CLAUDE_CODE_OAUTH_TOKEN token của `claude setup-token` (gói tháng) và/hoặc ANTHROPIC_API_KEY (trả theo API)
#   GH_TOKEN                GitHub token có quyền ghi repo (Publish-GenBidHsmt.ps1: Release + nhánh hsmt-inbox)
#   FIRECRAWL_KEY           (tuỳ chọn) khoá Firecrawl cho Tìm NCC
# Gemini (agy) cho bản dịch: đăng nhập Google một lần trong sandbox (`vercel sandbox connect genbid-bot`, chạy agy), lưu ở
# ~/.config/antigravity và giữ qua snapshot. Tệp oauth_creds.json của máy Windows không dùng được (thử 17/11).
# Bot chạy tới khi sandbox dừng (rảnh, máy Windows bật lại, hoặc hết phiên); web/api/_sandbox.js khởi chạy lại khi cần.
#
# Toàn bộ logic nằm trong main(): script này tự `git merge` kéo code mới (có thể ghi đè chính nó) mà bash đọc script
# từng đoạn, nên phải đọc hết hàm trước khi chạy.
main() {
  set -euo pipefail
  local ROOT="${GENBID_ROOT:-$HOME/genset-pro}"
  local KIT="$ROOT/genbid-hsmt"
  export PATH="$HOME/.npm-global/bin:/usr/local/bin:$PATH"
  export GENBID_ROOT="$ROOT" WINEPREFIX="${WINEPREFIX:-$HOME/.wine}" WINEDEBUG=-all DISPLAY=:99 GENBID_SPEC_NORM="${GENBID_SPEC_NORM:-1}"

  [ -n "${GENBID_INGEST_TOKEN:-}" ] || [ -s "$ROOT/.genbid-ingest-token" ] || { echo "Thiếu GENBID_INGEST_TOKEN" >&2; return 2; }
  umask 077
  [ -z "${GENBID_INGEST_TOKEN:-}" ]     || printf '%s\n' "$GENBID_INGEST_TOKEN"     > "$ROOT/.genbid-ingest-token"
  [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] || printf '%s\n' "$CLAUDE_CODE_OAUTH_TOKEN" > "$ROOT/.claude-bot-token"
  [ -z "${ANTHROPIC_API_KEY:-}" ]       || printf '%s\n' "$ANTHROPIC_API_KEY"       > "$ROOT/.anthropic-api-key"
  [ -z "${FIRECRAWL_KEY:-}" ]           || printf '%s\n' "$FIRECRAWL_KEY"           > "$KIT/.firecrawl-key"
  # Bot tự chọn token / API key theo từng việc (đọc từ các tệp trên): các biến này không được lọt vào tiến trình con
  # (agent Claude có công cụ Bash, đọc tài liệu HSMT của bên thứ ba: biến môi trường là thứ dễ bị lấy nhất).
  # GH_TOKEN: lưu vào cấu hình của gh (gh từ chối `login` khi biến còn trong môi trường) rồi bỏ biến. Dùng PAT hạn chế quyền (README).
  local GHT="${GH_TOKEN:-}"
  unset GENBID_INGEST_TOKEN CLAUDE_CODE_OAUTH_TOKEN ANTHROPIC_API_KEY FIRECRAWL_KEY GH_TOKEN GITHUB_TOKEN
  if [ -n "$GHT" ]; then
    printf '%s\n' "$GHT" | gh auth login --with-token >/dev/null 2>&1 && gh auth setup-git >/dev/null 2>&1 \
      || echo "Cảnh báo: gh auth login không được, tải HSMT lên GitHub sẽ lỗi" >&2
    GHT=""
  fi

  # Kéo code mới nhất của nhánh đang dùng (bot/ và suppliers/), như Update-GenBidBot.ps1 trên Windows.
  local BRANCH
  BRANCH="$(git -C "$ROOT/GenSet-Pro" rev-parse --abbrev-ref HEAD)"
  git -C "$ROOT/GenSet-Pro" fetch -q origin "$BRANCH" && git -C "$ROOT/GenSet-Pro" merge -q --ff-only "origin/$BRANCH" || true
  cp -a "$ROOT/GenSet-Pro/bot/genbid-hsmt/." "$KIT/"
  # Antigravity CLI (agy, Gemini cho bản dịch): sandbox cài trước khi có bước này chưa có; cài một lần, lỗi thì dịch bằng Claude.
  [ -x "$HOME/.local/bin/agy" ] || { curl -fsSL https://antigravity.google/cli/install.sh | bash >/dev/null 2>&1 || echo "Cảnh báo: không cài được agy, bản dịch dùng Claude" >&2; }

  # Màn hình ảo cho Chrome (muasamcong cần cửa sổ thật) và Wine (VNeGP Agent). Agent do bot bật khi cần (GenBid-HSMT.ps1).
  pgrep -x Xvfb >/dev/null || { nohup Xvfb :99 -screen 0 1280x900x24 >/tmp/xvfb.log 2>&1 & sleep 2; }

  cd "$ROOT"
  # host=sandbox: nhịp tim ghi botstatus/sandbox (web/api/_sandbox.js dừng sandbox khi rảnh hoặc khi máy Windows bật lại).
  exec pwsh -NoProfile -File "$KIT/GenBid-Bot.ps1" -Endpoint "${GENBID_WEB:-https://genset-pro-web.vercel.app}/api/requests?kind=all&host=sandbox"
}
main "$@"; exit $?
