#!/usr/bin/env bash
# Bật VNeGP Client Agent (bản Windows chính thức) dưới Wine trên màn hình ảo, trong sandbox Linux. Gọi từ GenBid-HSMT.ps1.
# Cài Agent: bot/sandbox/setup-sandbox.sh (tải bộ cài từ muasamcong, chạy im lặng vào C:\MPI\EGP-AGENT trong WINEPREFIX).
# Thoát 0 khi Agent đã nghe cổng 1234 (tối đa 120 giây), 1 nếu không.
export WINEPREFIX="${WINEPREFIX:-$HOME/.wine}" WINEDEBUG=-all DISPLAY="${DISPLAY:-:99}"
AGENT_DIR="$WINEPREFIX/drive_c/MPI/EGP-AGENT"
[ -f "$AGENT_DIR/egp-edoc-agent.exe" ] || { echo "Chưa cài VNeGP Client Agent trong $AGENT_DIR (chạy bot/sandbox/setup-sandbox.sh)." >&2; exit 1; }

port_open() { (echo > /dev/tcp/127.0.0.1/1234) 2>/dev/null; }
port_open && { echo "VNeGP Client Agent đang chạy (cổng 1234)."; exit 0; }

# Màn hình ảo cho Wine (và cho Chrome của bot).
if ! pgrep -x Xvfb >/dev/null; then
  nohup Xvfb "$DISPLAY" -screen 0 1280x900x24 >/tmp/xvfb.log 2>&1 &
  sleep 2
fi

cd "$AGENT_DIR" || exit 1
nohup wine egp-edoc-agent.exe >>"$HOME/egp-agent.out" 2>&1 &
for i in $(seq 1 120); do
  if port_open; then echo "Agent đã sẵn sàng sau ${i} giây."; sleep 2; exit 0; fi
  sleep 1
done
echo "Agent không mở cổng 1234 sau 120 giây (xem $HOME/egp-agent.out)." >&2
exit 1
