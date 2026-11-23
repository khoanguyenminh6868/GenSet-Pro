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

---
# Phần 2 (24/11/2026, nhánh `wt-bdk-hang-khac-2`, PR nháp) — làm tiếp

Cách đo: model trong `controllers[]` của MỌI hồ sơ NCC (`brand|model`, số hồ sơ chào) → `factsFor(modelFacts(...), "controller", model)` đếm dòng (mỗi tờ tối đa 700 dòng). Script `scratchpad\measure.mjs` (ngoài git). Số dòng 700 = tờ bị cắt 700 dòng đầu, không phải số thật.

## 1. SmartGen: tờ mới tới model nào
Có dòng: HGM4020T 700, 6110 / 6110N / 6110CAN / 6110NC 692–693, 6110U 581, 6110UC 592, 6120 / 6120N / 6120CAN / 6120NC 693–695, 6120U 582, 6120UC 688, 7110 683, 9420 700, 9510 1399 (tờ 1003+1005), 9510N 700, 9530 1393, 9610 298, 9620 683.
0 dòng và lý do:
- HGM420 (8 hồ sơ chào, nhiều nhất): tờ 1010 có (HGM410/420, 11 + 8 lần nhắc) nhưng `catalog.js` chỉ nhận `HGM\d{4}` (dòng 2964) → "HGM420" 3 chữ số không là mã BĐK, tiêu đề không cho khoá. Đã sửa tay `title` thành "… (HGM410/HGM420)" (không hại, chuẩn bị) nhưng vẫn 0. ĐỀ XUẤT CODE: regex nhận `HGM\d{3,4}`.
- HGM7210: sửa tay title tờ 1008 thành "HGM7200 SERIES (HGM7210/7220/7210CAN/7220CAN)" (tên lấy từ chính tài liệu: có 7210, 7220, 7210CAN, 7220CAN) → HGM7210 từ 0 lên 700.
- HGM7120A, HGM7120UC: tờ 1007 chỉ nêu 7110N/7120N, tờ 1008 nêu 7100A (2 lần) chứ không phải 7120A / 7120UC → không gắn (không suy ra).
- HGM6100N / 6100U / 6100CAN (tên dòng, 2 / 1 / 1 hồ sơ), 6120CAN-4G, 6110K, HGM1790: tài liệu không nêu model đó như một model (6100N là "series"; `isSeries` loại có chủ ý); không có tờ cho 1790 / 6110K / 6120CAN-4G.
- HGM9210, 9220, 9310, 9320 (15 hồ sơ chào!), 9410, 9500, 9520: chưa có tờ (mục 3).

## 2. Các hãng khác
| Hãng | Việc | Kết quả |
|---|---|---|
| ComAp | AMF5 / AC03 / IL-NT AMF20, MRS10, MRS15 / InteliLITE trơn / IG200 / InteliGen 1000 Marine / InteliVision / InteliDrive 0 dòng. Tìm thấy tờ chính hãng InteliNano AMF 5 (comap-control.com/productfile/e8159a13…, tải không cần đăng nhập) | THÊM nguồn 1021 (167 dòng). KHÔNG gắn được: `catalog.js` không nhận "AMF5" / "InteliNano" là bộ điều khiển → factsFor("AMF5") = 0. ĐỀ XUẤT: `controllersIn` nhận InteliNano AMF 5 + `GENERATION` nối "AMF5" với tờ. AC03 là bản cũ, không thấy tờ; IL-NT AMF20 / MRS10 / MRS15 vẫn không có tờ (theo CLAUDE.md); IG200 không gắn có chủ ý. |
| DEIF | NCC chào AGC150 / AGC-150 (700 dòng), SGC-420 (520), "AGC" trơn (mpmc-powertech, 0) | Không thiếu tờ; "AGC" trơn mơ hồ (AGC 150 / 200 / 4) → để nguyên. `controllers[]` hồ sơ deif còn rỗng: chỉ đề xuất thêm AGC 150, AGC 200, SGC 420, AGC-4 (đã có tờ 1001–1004). |
| Datakom | DKG-116 (75), DKG-309 (700) có; DKG-307 có tờ 1002 nhưng không NCC nào chào | Không thêm. `controllers[]` rỗng: đề xuất thêm DKG-309, 307, 116. |
| Woodward | easYgen-1800 (218 dòng); easYgen-3500XT (denyo) đo 0 | 0 chỉ vì khoá thô "EASYGEN3500XT" ≠ "EASYGEN3500"; `ctlModelOf` trong luồng thật dùng `controllersIn` → easYgen-3500 nên nhiều khả năng đã gắn (CHƯA đo qua luồng đầy đủ). `controllers[]` rỗng: đề xuất thêm easYgen-1400/1600/1800, 3400XT/3500XT, 3100XT/3200XT. |
| SICES | GC310, GC350, GC500Plus, GC315Plus, GC400, GC600, DST4602Evolution; catalog không có mục SICES | THÊM DST4602Evolution (nguồn 1004, 550 dòng, meccalte.com/downloads/DST4602Evolution_Datasheet_EN_REV._1.8.pdf). GC310 / GC350 / GC500Plus: meccalte.com chỉ còn handbook cũ (yumpu / scribd bên thứ ba, không dùng) → không có tờ chính hãng; GC400 đã nằm trong tờ 1003 "GC315-GC400". Vẫn KHÔNG gắn model nào (thiếu mục `CONTROLLERS` của SICES). |

## 3. SmartGen còn thiếu tờ
`smartgen.cn` là SPA; Firecrawl (links) không ra liên kết; trang Download phải gõ model vào ô tìm (client-side), URL `/index.php/en/download.html` trả 404. Tìm kiếm chỉ ra: tờ `…/yun/data/download/<Tên>_en.pdf` cho HGM9600, 9510, 9530, 4020T, HGM7220N_HGM7220S, protocol 9510N/9520N/9530N (giao thức, không phải datasheet). KHÔNG tìm được tờ chính hãng cho HGM9320 / 9310 (chỉ scribd, manuals.plus, diytrade, smartgen-america: bên thứ ba), 9520, 9220 / 9210, 9410, 9500, 6100CAN → ghi và bỏ qua, chưa mở Download bằng trình duyệt. Có sẵn trên smartgen.cn mà chưa thêm: HGM7220N_HGM7220S_en.pdf (không NCC nào chào 7220).

## 4. Kiểm sau từng hãng
`verify.mjs` 436 bản ghi 0 lỗi sau mỗi commit. So với `origin/main`: smartgen chỉ đổi 2 dòng `title` (cả `cn/` và `datasheets/`); sices bảng 3→4, nguồn 8→9, controllers 7→7; comap bảng 19→20, nguồn 20→21, controllers 4→4; diff chỉ thêm. `ctl-twin` + `ctl-module` + `ctl-amf` + `regress-config`: 37/37 đạt (chạy sau SmartGen và sau ComAp).

## 5. Trường `controller` các hãng này KHÔNG ghi / chưa soát
CHƯA soát tay "trường 0" trong lượt này (hết ngân sách context): số ở Phần 1 là khớp regex. Việc còn lại: soát tay vài dòng mỗi trường 0 (rs232, modbus_rtu, modbus_tcp, snmp, data_logging, load_sharing, dead_bus, order_code, ul, prot_mains_decoupling) trên SmartGen / ComAp / DEIF trước khi kết luận "hãng không ghi". Trang đòi đăng nhập: ComAp Reference Guide / productfile Operator & Reference (đòi tài khoản; không đăng nhập). Datasheet ComAp (productfile loại Datasheet) tải được không cần đăng nhập.

## 6. Đề xuất (chưa sửa)
- `catalog.js` dòng 2964: `HGM\d{4}` → `HGM\d{3,4}` để HGM410 / HGM420 (8 hồ sơ chào) nhận được tờ 1010.
- Thêm InteliNano AMF 5 ("AMF5") vào `controllersIn` + `GENERATION`; thêm mục `CONTROLLERS` cho SICES (GC315 / GC400 / GC600 / DST4602 Evolution).
- Bộ trường: `kind` cần giá trị cho "genset parallel (with genset)" của HGM9530; thêm đề xuất 4 trường bắt buộc (`languages`, `front_ip`, `dc_supply`, `dimensions`) như Phần 1.

## 7. Bổ sung brief (điều phối, Khoa 24/11/2026): luật "2 nguồn internet" — CHƯA LÀM
Phiên này dừng vì luật context 30 % trước khi nhận bổ sung, nên danh sách (model, trường, giá trị, 2 URL, câu trích) CHƯA lập. Việc cho phiên sau: các model NCC chào mà không có tờ hãng (HGM9320, 9520, 9220/9210, 9410, 9500, 6100CAN, 7120A, 7120UC, 1790, 6120CAN-4G; ComAp AMF5 đã có tờ nhưng chưa gắn; SICES GC310/350/500Plus). Chỉ dùng khi trang chính hãng không có; hai nguồn độc lập cùng giá trị; không đưa vào hồ sơ, chỉ lập danh sách. Ứng viên nguồn đã thấy: smartgen-america.com (HGM9320MPU/CAN), manualslib / manuals.plus / scribd (HGM9310/9320 manual v1.3/1.4 — có thể là cùng một bản chép, cần kiểm độc lập).
