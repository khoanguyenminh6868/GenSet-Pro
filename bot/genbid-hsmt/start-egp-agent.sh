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

# Khoá cũ của trình chạy Java (24/11/2026): mỗi lần Agent chạy, vỏ java.exe ghi Temp\vlxjre\<PID>.lck. Sandbox dừng đột ngột nên
# khoá còn trong snapshot, mà PID trong Wine lặp lại giữa các phiên (32, 300...): trùng PID là java.exe thoát mã 1 ngay, không
# in gì ("exit status 1", "0/2 tệp" ở mọi gói). Tới đây cổng 1234 chưa mở = không Agent nào chạy, xoá hết khoá là an toàn.
rm -f "$WINEPREFIX"/drive_c/users/*/AppData/Local/Temp/vlxjre/*.lck

# Chờ cổng 1234 tối đa $1 giây; in kết quả và thoát 0 khi Agent đã nghe.
wait_port() {
  for i in $(seq 1 "$1"); do
    if port_open; then echo "Agent đã sẵn sàng sau ${i} giây."; sleep 2; return 0; fi
    sleep 1
  done
  return 1
}

# Cách 1 (23/11/2026): chạy thẳng Java của Agent như egp-edoc-agent.bat. Vỏ egp-edoc-agent.exe dưới Wine thoát ngay
# "exit status 1" (từ 23/11, gói IB2600617747: cả ba lượt sandbox báo "0/2 tệp"), còn Java chạy trực tiếp mở cổng sau ~14 giây.
if [ -f "$AGENT_DIR/vlxjre/bin/java.exe" ] && [ -f "$AGENT_DIR/vlxlib/vlxapp.jar" ]; then
  nohup wine 'vlxjre\bin\java.exe' -Dfile.encoding=UTF8 -Xms256M -Xmx1200M -cp 'vlxlib\vlxapp.jar;vlxlib\*' com.fis.egp.ServiceApp >>"$HOME/egp-agent.out" 2>&1 &
  wait_port 60 && exit 0
  echo "Java của Agent không mở cổng 1234 sau 60 giây, thử vỏ egp-edoc-agent.exe." >&2
  wineserver -k 2>/dev/null; sleep 2
fi

# Cách 2 (dự phòng): vỏ egp-edoc-agent.exe như trước.
nohup wine egp-edoc-agent.exe >>"$HOME/egp-agent.out" 2>&1 &
wait_port 120 && exit 0
echo "Agent không mở cổng 1234 (Java 60 giây, vỏ .exe 120 giây; xem $HOME/egp-agent.out)." >&2
exit 1
