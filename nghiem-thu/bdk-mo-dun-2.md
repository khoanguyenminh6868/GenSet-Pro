# Nghiệm thu bdk-mo-dun PR 2: chấm truyền thông bộ điều khiển theo cặp với mô-đun

Ngày 20/11/2026. PR DRAFT (chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/999, nhánh `bdk-mo-dun-2`
(3d5111f0 + gộp main 789f96f2, gốc gộp = origin/main 34d56eb5 có #997). CI: 4 qua, 0 lỗi, 1 bỏ qua; mergeable CLEAN.
Script + đầu ra đo: `genbid-work\dieu-phoi\dau-vao\bdk-mo-dun-2\` (`check-all.mjs`, `so-ab.mjs` → `so-ab.txt`, `ca-kiem.mjs` →
`ca-kiem.txt`, `cong40.mjs` → `cong40.txt`; `truoc-gop\` = cùng phép đo trước khi gộp main, gốc 8b5184eb).

## Tệp đổi
| Tệp | Đổi |
|---|---|
| `suppliers/ctl-module.mjs` (mới) | `COMM_MODULES` (DSE890 MKII, DSE891 MKII, DSE855, CM2-4G-GPS, CM-4G-GPS, CM3-Ethernet, CM-RS232-485, InternetBridge-NT), `SUBS`, `moduleFacts`, `compatModules`, `commWords`, `commModules`, `bestPair`, `altLineOf`, `commRestore` |
| `suppliers/config-bot.mjs` | import; trong `check`: `modFacts`, `compatOf`, `ctlAlternatives`; khôi phục phần code đã đổi trước khi chấm; `commWords` trong vòng chấm từng phần; `commModules` + `ctlAlternatives` sau vòng; `rankConfigs` hoà điểm → không mô-đun trước |
| `suppliers/ctl-module.test.mjs` (mới) | 7 ca trên datasheet thật Deep Sea / ComAp |
| `suppliers/CLAUDE.md` | bẫy tiêu đề datasheet mô-đun (BẮT BUỘC) + hồ sơ `incomplete` bị bot bỏ; mục luật "Bộ điều khiển + mô-đun truyền thông" |
Không đụng: `candidates`, prompt / agent (PR 3), web / RFQ (PR 4), `web/catalog.js`, vùng đầu phát.

## Cách làm theo 6 câu
- Q1: `controller.alternatives` + `altLine` "Phương án khác đạt tương đương: …" = bộ điều khiển CÙNG HÃNG khác trên dòng bộ điều khiển của cấu hình (NCC chào), có datasheet, chấm bằng code với mô-đun tốt nhất (`bestPair`); code không bao giờ ghi "không đạt" nên điều kiện "không có không đạt" luôn thoả → lấy những cặp đạt ≥ 1 phần, tốt nhất 2. Chỉ là dữ liệu kết quả; web CHƯA hiện (PR 4).
- Q2: Ethernet / RS232 / RS485 / USB / BMS / Modbus / SNMP / CAN chỉ từ datasheet bộ điều khiển; 4G / 5G / GSM / SMS / Internet được lấy từ mô-đun.
- Q3: BMS đạt khi dòng ghi BMS / building management, hoặc Modbus / BACnet / SNMP + ghi chú "BMS qua Modbus/SNMP, cần NCC xác nhận" (`bmsVia`). Chỉ áp cho phần agent đã chấm đạt (xem câu hỏi 2 dưới).
- Q4: mô-đun ghép được (datasheet bộ điều khiển ghi tên mô-đun, hoặc tờ mô-đun ghi tên bộ điều khiển) làm phần chưa rõ / không đạt thành đạt khi mọi chức năng con của phần có dòng và ít nhất một nhờ mô-đun; `viaModule`, `controller.modules[]` {model, make, order, compat, offeredBy: null, label, why}, nhãn "Mô-đun chọn theo tài liệu hãng, NCC chưa chào". Dòng RFQ chào kèm mô-đun: CHƯA có (PR 4).
- Q5: phần nêu chức năng con chỉ đạt khi câu trích có chữ đó (dòng của mô-đun và dòng "Extendable options …" không tính là chữ của bộ điều khiển); chữ có ở dòng khác của datasheet bộ điều khiển thì giữ đạt (`alsoQuotes`).

## Ca kiểm IB2600603983 (đầu ra thật, `node ca-kiem.mjs` sau `check-all.mjs` hai bên)
Lệnh: `node check-all.mjs ../../../../wt-bdk2-base goc.json` ; `node check-all.mjs ../../../../wt-bdk-mo-dun-2 nhanh.json` ; `node ca-kiem.mjs`.
- 7/7 cấu hình có bộ điều khiển Deep Sea: "Điều khiển từ xa qua cổng Internet/4G" chưa rõ → ĐẠT "Qua mô-đun DSE890 MKII (mã 0890-04): 4G (DSE890 MKII), Internet (DSE890 MKII)", ghép theo dòng "| DSE890 MKII | DSEWebNet® Gateway | 0890-04" của datasheet bộ điều khiển (n1001 DSE7320, n1003 DSE7420, n1004 DSE8610, n1002 DSE6120). Nhóm truyền thông: DSE7420 / DSE8610 5/7 → 6/7; DSE7320 3/7 → 4/7 (3 cấu hình: #2 S6R2-PTAA-C, #5 QSK23-G2, #6 TWD1744GE); DSE6120 1/7 → 2/7. Cấu hình không bộ điều khiển (#8): không đổi.
- DSE7320 + DSE890 MKII: là cặp chính ở 3 cấu hình; ở #4 (4006-23TAG2A, DSE7420, dòng uleengen "Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610") có dòng "Phương án khác đạt tương đương: DSE8610 MKII + DSE890 MKII (… đạt 6/7 …); DSE7320 MKII + DSE890 MKII (… đạt 5/7, chưa rõ: Cổng kết nối với hệ thống kiểm soát từ xa, Ethernet)". → ca kiểm ĐẠT theo tiêu chí của đề xuất.
- Ethernet của DSE7320 vẫn chưa rõ (Q2: cổng Ethernet của DSE890 không tính). BMS vẫn chưa rõ ở 8/8 (agent để chưa rõ; code không tự nâng, xem câu hỏi 2). Điểm: số "chưa rõ" giảm 1 ở mỗi cấu hình có bộ điều khiển; THỨ TỰ cấu hình không đổi.

## Kiểm chéo toàn bộ (17/17 lượt configmatch đã lưu, bản chụp `dau-phat-hang-b\snap` 20/11 = toàn bộ web), `so-ab.txt`
Đổi ở 4 gói, 13 gói không đổi gì (3 gói chỉ có dòng "lặp lại: KHÁC" ở CẢ gốc lẫn nhánh: ghi chú "cần xác nhận đời" và gap NCC tự nhân đôi khi chạy `check` lần hai — có sẵn trên main, không do PR này). Thứ tự cấu hình: không đổi ở gói nào. Mọi cấu hình đổi:
- IB2600603983: 7 cấu hình như trên (+ mô-đun DSE890 MKII; 2 dòng phương án khác ở #4, #6).
- IB2600601812 (Q5, hệ quả đã biết): #1 AMF9, #4 AMF25, #5 DSE7320, #6 DSE7320: "Điều khiển từ xa qua cổng Internet/5G" ĐẠT → CHƯA RÕ (câu trích là dòng tên mô-đun CM3-Ethernet / DSE890; không nguồn nào ghi 5G); nhóm 4/4 → 3/4, đạt → chưa rõ. Phương án khác ở #5 (DSE6120 MKIII, 1/4) và #6 (DSE6020 MKII, 1/4).
- IB2600612866: #1 AMF25 "Cổng RS485 giám sát từ xa qua Internet" vẫn đạt, nay qua mô-đun CM2-4G-GPS (Internet) + RS485 của bộ điều khiển; + mô-đun CM2-4G-GPS.
- IB2600613475: #1, #2, #3 (DSE7320) "Tin nhắn SMS" chưa rõ → đạt qua DSE890 MKII (GSM/SMS); nhóm 1/2 → 2/2 đạt; phương án khác ở #2, #3 (DSE8610 MKII + DSE890 2/2; DSE6120 MKIII + DSE890 1/2).
Trước / sau khi gộp main (#997): cùng các thay đổi, chỉ khác số điểm cột đầu phát do #997 ở cả hai bên.
Test: `node --test suppliers/` 1.275 ca, 1.274 qua; 1 lỗi `cover-prep.test.mjs` (specPost, ENOENT trong `%TEMP%\genbid-catalog` dùng chung khi có tiến trình khác chạy cùng lúc; ca lỗi đổi giữa các lần chạy; chạy lại tệp trên nhánh 2 lần: 0 lỗi; trên gốc 0 lỗi). Sau gộp: `ctl-module` + `regress-config` 15/15 qua (fixture regress không đổi: 5 lượt đóng băng không có ctl_comm). CI PR xanh.

## Vì sao 15 model của #978 không nhận +40 (`cong40.txt`, chỉ ghi, không sửa)
1. Hồ sơ `deif`, `woodward`, `datakom` có `status: "incomplete"` → `prep` (dòng `.filter(d => d.data.status !== "incomplete")`), `do-gop`, `upload` đều bỏ → `modelFacts` của bot: 0 khoá bộ điều khiển của 3 hãng (nạp cả hồ sơ incomplete thì có 15 khoá: DKG309 700 dòng, AGC150 700, SGC420 520, EASYGEN1800 218…). `sices` = `partial` nhưng chưa có mục SICES trong `catalog.js CONTROLLERS` → 0 khoá.
2. Kể cả sửa (1): `built.controllers` không có bộ điều khiển nào của 4 hãng do NCC chào (0 lần) → `offers` không có model nào của chúng → `factsFor(facts, "controller", c.model)` không bao giờ được gọi với các model đó. Dữ liệu chào phải có trước.

## Rủi ro / quay lui
- Code chỉ đổi phần của yêu cầu mã `ctl_comm`; tắt bằng revert PR (không có cờ môi trường). Phần code đổi giữ bản agent trong `codeWas`, chạy lại `check` trả về rồi chấm lại (đã kiểm lặp lại trong test + đo).
- Từ khoá chức năng con có thể hạ "đạt" đúng (agent trích câu chung mà chữ ở dòng khác không có): đo 17 lượt chỉ hạ đúng 4 phần "Internet/5G" đã biết.
- `EXT` (dòng "extend / optional / option / plug-in") bỏ cả dòng thật của bộ điều khiển có chữ "option" khi code dò (chỉ ảnh hưởng `alsoQuotes`, mô-đun, phương án khác).

## Chưa làm / chưa kiểm
- Dòng RFQ "chào kèm mô-đun" và hiện trên web (PR 4); agent biết mô-đun / phương án (PR 3).
- InteliGateway 101/301 (model tách ô "| InteliGateway | 101 |") và mô-đun SmartGen (chưa có datasheet) chưa vào `COMM_MODULES`.
- Không chạy Gợi ý thật (không tốn agent theo brief).

## Điểm cần Khoa quyết (đã báo điều phối; phần còn lại không chờ)
1. Q1 "phương án khác": vì code không bao giờ ghi "không đạt", điều kiện "không có không đạt" luôn thoả → hiện cả cặp kém hơn nhiều (DSE6120 MKIII 1/4, DSE6020 MKII + DSE890 2/7) dưới chữ "đạt tương đương". **Khuyến nghị:** chỉ hiện cặp có số phần đạt (code dò) ≥ số phần đạt của cặp chính theo cùng cách dò trừ 1 (giữ được DSE7320 + DSE890 5/7 cạnh DSE7420 6/7, bỏ các cặp 1–2/7), hoặc đổi chữ thành "Phương án khác (code dò datasheet)".
2. Q3 BMS: code chỉ giữ / ghi chú BMS khi agent đã chấm đạt; không tự nâng "chưa rõ" → đạt dù datasheet ghi Modbus (DSE7420 "Modbus TCP, SNMP"; DSE7320 "1 Modbus RTU Port") → BMS chưa rõ 8/8 ở IB2600603983. **Khuyến nghị:** để agent làm ở PR 3 (prompt + `ctl-lookup.md` dò BMS qua Modbus/SNMP), giữ nguyên tắc "code không tự điền check" (Khoa 16/11); nếu Khoa muốn code tự nâng thì thêm vào `commWords` (một dòng).
3. Đổi `status` của hồ sơ deif / woodward / datakom khỏi `incomplete` (việc dữ liệu riêng) để datasheet #978 tới được Gợi ý.
