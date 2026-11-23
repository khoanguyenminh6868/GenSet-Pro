# BĐK các hãng ngoài Deep Sea — tiến độ (24/11/2026) — DỪNG VÌ LUẬT CONTEXT 30 %

Nhánh `wt-bdk-hang-khac` (worktree `C:\Projects\GenSet Pro\wt-bdk-hang-khac`). Mới xong SmartGen (1 commit `f6a70b5e`). Bộ trường lấy từ `origin/wt-spec-fields:suppliers/spec-fields.json` (phần `controller`, 49 trường).

## 1. Bảng theo hãng (đo bằng KHỚP TỪ KHOÁ, không phải đọc hiểu)
Cách đo: model "có datasheet" = có bảng "Datasheet: …" mà tiêu đề nêu model (SmartGen: mở rộng "HGM6110N/6120N" thành HGM6120N); trường "trả lời được" = ít nhất một dòng bảng của model khớp regex từ khoá của trường. Số = số model (trong những model có datasheet). Script: `scratchpad\cover.mjs` (đang ở thư mục tạm của phiên, chưa đưa vào git).

| Hãng | model trong controllers[] | model có datasheet | bảng "Datasheet:" | Thiếu datasheet |
|---|---|---|---|---|
| smartgen (sau) | 26 | 18 (trước: 15) | 3 → 11 | HGM6100CAN, 9210, 9220, 9310, 9320, 9410, 9500, 9520 |
| comap | 4 (+tờ ngoài controllers[]) | 4 | 19 | IL-NT AMF20/MRS10/MRS15 không có tờ (CLAUDE.md); Reference Guide đòi đăng nhập |
| datakom | 0 | (3 tờ: DKG-309, 307, 116) | 3 | chưa xét |
| deif | 0 | (4 tờ: AGC 150, 200, SGC 420, AGC-4) | 4 | chưa xét |
| woodward | 0 | (3 tờ easYgen 1400-1800, 3400/3500XT, 3100/3200XT) | 3 | chưa xét |
| sices | 7 | 3 | 3 | GC310, GC350, GC500Plus, DST4602Evolution |

Trường trả lời được (SmartGen sau thêm / 18 model): kind_amf 18, auto_start_stop 18, remote_start 18, scheduler 13, prot_earth_fault 4, prot_reverse_power 4, prot_overcurrent 17, prot_mains_decoupling 0, emergency_stop 15, ecu_support 13, display 18, measure_* 18/18/2 (V/Hz/A: V chỉ 2), accuracy 18, usb 13, rs232 0, rs485 18, ethernet 4, can 18, modbus_rtu 0, modbus_tcp 0, snmp 0, remote_monitoring 18, cellular_sms 4, event_log 13, data_logging 0, plc 1, synchronising 1, load_sharing 0, load_demand 1, dead_bus 0, max_sets 3, governor_avr 8, languages 18, dc_supply 18, front_ip 18, operating_temp 13, dimensions 18, io 18, ul 1, order_code 0.
(Regex "khớp" rộng: "modbus_rtu 0" cho SmartGen nghĩa là không dòng nào ghi chữ "Modbus RTU"; hay dùng "RS485 MODBUS". Cần soát tay trước khi kết luận "hãng không ghi".) Các hãng khác: số trong `scratchpad\cover-before.json` (chạy lại `cover.mjs`).

## 2. Việc đã làm — SmartGen
Tải từ smartgen.cn (URL từ kết quả tìm kiếm; không cần đăng nhập) vào `genbid-work\bdk-datasheets\smartgen\`: HGM9530_en, HGM9510N_HGM9530N_en, HGM9600_en, HGM7110N_HGM7120N_en, HGM7200_en, HGM4020T_en, HGM410_HGM420_en, HGM9420N_HGM9420LT_en. `maker-datasheets.mjs` (nhận URL, không nhận tệp cục bộ) → nguồn 1004–1011. Tiêu đề do script chọn đã đúng tên tài liệu, không phải sửa tay (1010 "HGM400 Series Genset Controller", 1011 "HGM9420N_HGM9420LT" là chữ của chính tài liệu). `merge-specs smartgen`: 0 dòng cũ bị xoá (diff chỉ thêm); `verify.mjs` 436 bản ghi 0 lỗi; ba test (`ctl-twin`, `ctl-module`, `regress-config`) 30/30 đạt.

Chưa gắn model: `controllers[]` của hồ sơ không đổi sau merge (không có dòng "model" thêm trong diff). Model NCC đang chào mà chưa có tờ: HGM9320 (×1 NCC), HGM9530/9510N (đã có tờ nay, nhưng `controllersIn` của catalog chưa chắc nhận), HGM7110/7120A/7120UC/7210 (tờ 7100N/7200 vừa thêm), HGM1790, HGM4020T, HGM420 ×2, HGM6120CAN-4G. Cần điều phối kiểm `factsFor` xem tờ mới tới được model nào (em chưa đo).
Không tìm được URL chính hãng cho HGM9320, HGM9520, HGM9220/9210, HGM9410 qua tìm kiếm (smartgen.cn là SPA; trang Download tìm theo model, em chưa mở bằng trình duyệt).

## 3. Chưa làm (cho phiên sau)
- comap / datakom / deif / woodward / sices: chưa tìm tờ mới. Gợi ý ưu tiên: DEIF AGC 150 đã có (NCC chào ×14 hãng deif); Datakom DKG-309/116 đã có, thiếu DKG-307 gắn `controllers[]`; ComAp AMF5/AC03/IG-NT nhiều NCC chào (`comap | AMF20 ×8, AMF25 ×10`) đã có tờ.
- Ba hồ sơ deif/woodward/datakom nay `status: partial` (không còn `incomplete`).

## 4. Đề xuất chỉnh trường BĐK (chưa sửa spec-fields.json)
Chưa đủ dữ liệu từ các hãng khác để đề xuất chắc. Quan sát từ SmartGen: tờ ghi "Genset Parallel (With Genset)", "Automatic Start Module", "AMF" → `kind` cần giá trị cho "mains parallel / genset parallel" (đã có `sync`); trường `languages`, `front_ip`, `dc_supply`, `dimensions` hãng nào cũng ghi, nên cho là trường bắt buộc; `rs232`/`snmp`/`dead_bus`/`order_code`/`ul` SmartGen không ghi (theo regex).
