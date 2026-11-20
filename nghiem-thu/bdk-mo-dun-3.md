# Nghiệm thu bdk-mo-dun PR 3: phương án khác lọc theo cặp chính, Ethernet của mô-đun, agent biết luật; hồ sơ DEIF / Woodward / Datakom

Ngày 20/11/2026. Hai PR DRAFT, chưa merge, CI xanh:
- Code: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1003, nhánh `bdk-mo-dun-3` (e78e8310 + 57f0cc8e), gốc origin/main 66cc1008.
- Dữ liệu: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1001, nhánh `bdk-status-partial`.
Script + đầu ra đo: `genbid-work\dieu-phoi\dau-vao\bdk-mo-dun-3\` (`check-all.mjs`, `so-ab.mjs`, `ca-kiem.mjs`, `alt.mjs` chép từ PR 2;
`ds40.mjs` + `so.mjs` → `so.txt` cho mục 3; `fixture-eth.mjs` cho fixture hồi quy). Dữ liệu 17 lượt: bản chụp `dau-phat-hang-b\snap` như PR 2.

## Tệp đổi (#1003)
| Tệp | Đổi |
|---|---|
| `suppliers/config-bot.mjs` | `ctlAlternatives`: chỉ giữ cặp có số phần đạt ≥ (cặp chính, chấm cùng cách `bestPair`) − 1 và ≥ 1. `CTL_WORDS` + BMS (chữ HSMT "BMS / building management / quản lý tòa nhà" ↔ dòng BMS / building management / Modbus / BACnet / SNMP): chỉ ảnh hưởng `ctl-lookup.md` (đầu vào agent) và gợi ý dòng của phần chưa rõ, không đổi trạng thái |
| `suppliers/ctl-module.mjs` | Ethernet `mod: true` (Khoa 20/11 "có", qua điều phối): cổng Ethernet của mô-đun tính đạt, ghi chú `ethNote` "Ethernet nằm trên mô-đun X, không phải trên bộ điều khiển."; `modShows` bỏ dòng tuỳ chọn mở rộng (`EXT`) cho Ethernet. RS232 / RS485 / USB / BMS / Modbus / SNMP / CAN vẫn chỉ từ bộ điều khiển |
| `suppliers/config-prompt.md` | đoạn "Controller communication and communication modules": cùng luật Q2 (kể cả Ethernet mô-đun) / Q3 / Q5, mô-đun do code ghép (`viaModule`, nhãn "Mô-đun chọn theo tài liệu hãng, NCC chưa chào"), phương án khác; cấm viết như NCC đã chào mô-đun |
| `suppliers/ctl-module.test.mjs` | ca lọc phương án khác; ca Ethernet qua DSE890 MKII + ghi chú; dòng tuỳ chọn mở rộng không tính |
| `suppliers/fixtures/runs/IB2600603983/config.expected.json` | cập nhật có chủ ý (xem dưới) |
| `suppliers/CLAUDE.md` | luật mới |

## Khoa "ok" 3 khuyến nghị PR 2 → làm gì
1. Phương án khác: theo đúng chữ khuyến nghị trong `bdk-mo-dun-2.md` = "≥ cặp chính trừ 1". LƯU Ý: brief điều phối ghi "bằng hoặc hơn"; hai cách khác nhau, xem bảng so ở mục Kiểm chéo. Đổi sang "bằng hoặc hơn" = bỏ `- 1` ở một dòng.
2. BMS qua Modbus / BACnet / SNMP: code không tự nâng; agent biết qua prompt + `ctl-lookup.md` (BMS). Chỉ có tác dụng ở lượt Gợi ý MỚI (kết quả đã lưu: agent đã ghi BMS chưa rõ, code giữ).
3. Hồ sơ DEIF / Woodward / Datakom: `incomplete` → `partial` (#1001). Đúng luật dữ liệu: có website + nguồn kiểm sạch (`verify.mjs` 435 bản ghi, 0 lỗi); KHÔNG thể `verified` vì luật verify đòi dòng máy có dải công suất mà hãng bộ điều khiển không có (như `sices` đang `partial`). Bỏ "thông số bộ điều khiển" khỏi `missing` (#978 đã có bảng datasheet); năm thành lập, trụ sở vẫn thiếu.

## Mục 3: trước → sau (`so.txt`; nạp NCC như prep)
- NCC nạp: 432 → 435. Khoá bộ điều khiển có datasheet trong `modelFacts`: 38 → 53 (+DKG309, DKG307, DKG116, AGC150, AGC200, AGC4, SGC420, easYgen-1400 / 1600 / 1700 / 1800 / 3100 / 3200 / 3400 / 3500). Dòng datasheet bộ điều khiển: 12.743 → 18.118.
- Dòng ứng viên (47.299 dòng engine-uses): 2.189 dòng có thêm model gắn được datasheet (DKG-309 747, DKG-116 506, easYgen-1800 492, AGC150 302 + AGC-150 97, SGC-420 45: NCC CÓ chào các model này, khác ghi chú PR 2 "0 lần"), nhưng mọi dòng đó đã có +40 từ bộ điều khiển khác → **0 dòng đổi +40 "bộ điều khiển có datasheet hãng"** → điểm ứng viên không đổi, KHÔNG cần đo cloud.
- 17 lượt configmatch: #1001 một mình (code main) → 0 cấu hình đổi; #1003 + #1001 → giống hệt #1003 một mình.
- Hệ quả khi merge #1001: workflow ĐĂNG 3 hồ sơ lên web (màn Nhà cung cấp).
- SICES vẫn 0 khoá (chưa có mục trong `catalog.js CONTROLLERS`, việc phiên khác giữ); easYgen-3500XT đọc thành easYgen-3500 (khoá danh mục khác): chưa sửa.

## Kiểm chéo TOÀN BỘ 17/17 lượt (gốc origin/main 66cc1008 ↔ nhánh 57f0cc8e), `so-goc-code2.txt`
Đổi ở 1 gói (IB2600603983); 16 gói không đổi gì. 7 gói có dòng "lặp lại: KHÁC" ở CẢ gốc lẫn nhánh (có sẵn trên main, như PR 2 ghi; không do PR này). Mọi cấu hình đổi:
- #2 S6R2-PTAA-C / DSE7320, #4 QSK23-G2 / Deepsea 7320, #6 TWD1744GE / DSE7320, #7 6M33G825/5 / DSE6120: "Ethernet" chưa rõ → ĐẠT "Qua mô-đun DSE890 MKII (mã 0890-04): Ethernet (DSE890 MKII)" + ghi chú Ethernet nằm trên mô-đun; nhóm truyền thông DSE7320 4/7 → 5/7, DSE6120 2/7 → 3/7; điểm số chưa rõ −1; `why` mô-đun thêm Ethernet. Dòng mô-đun có chữ Ethernet trong dữ liệu: "| DSE890 MKII | DSEWebNet® / IoT Gateway - 4G (GSM/Ethernet) | 0890-04" (datasheet DSE6120 n1002; test kiểm dòng này) — câu trích cụ thể của từng cấu hình chưa in trong phép đo.
- THỨ TỰ: QSK23-G2 / Deepsea 7320 (điểm [1,0,0,37,6,…]) lên trên 4006-23TAG2A / DSE7420 ([1,0,0,38,…]): vì Ethernet đạt làm số chưa rõ 38 → 37.
- #5 4006-23TAG2A / DSE7420, phương án khác trước → sau: "DSE8610 MKII + DSE890 MKII (6/7); DSE7320 MKII + DSE890 MKII (5/7, chưa rõ: Cổng kết nối với hệ thống kiểm soát từ xa, Ethernet)" → "DSE7320 MKII + DSE890 MKII (6/7, chưa rõ: Cổng kết nối với hệ thống kiểm soát từ xa); DSE8610 MKII + DSE890 MKII (6/7, …)".
- #6 TWD1744GE / DSE7320, phương án khác: "DSE6020 MKII + DSE890 MKII (2/7, …)" → bỏ (cặp chính 6/7, sàn 5).
- Mọi phương án khác còn lại ở gói khác KHÔNG đổi: IB2600601812 #5 / #6 vẫn "DSE6120 MKIII (1/4)", "DSE6020 MKII (1/4)" — vì cặp chính DSE7320 chấm bằng code cũng chỉ 1/4 (agent chấm 3/4 nhờ câu trích không có chữ chức năng con, code dò không nhận); IB2600613475 #2 / #3 vẫn "DSE8610 MKII + DSE890 (2/2); DSE6120 MKIII + DSE890 (1/2)" (cặp chính 2/2, sàn 1).

So hai cách lọc (đo trên code trước khi thêm Ethernet, `cm-bang.json`): "bằng hoặc hơn" thêm bỏ DSE6120 MKIII 1/2 ở IB2600613475 #2 / #3 và (trước luật Ethernet) DSE7320 5/7 ở IB2600603983; IB2600601812 1/4 vẫn giữ ở cả hai cách. Sau luật Ethernet, DSE7320 + DSE890 là 6/7 nên cách nào cũng giữ.

## Mốc kiểm IB2600603983 (`ca-kiem.txt`)
- DSE7320 MKII + DSE890 MKII chấm bằng code: 5/7 → **6/7, ngang DSE7420 / DSE8610** (chỉ còn "Cổng kết nối với hệ thống kiểm soát từ xa" chưa rõ; BMS đạt qua Modbus trong cách chấm của code). ĐẠT.
- Trong cấu hình đã lưu: DSE7320 4/7 → 5/7, DSE7420 6/7. Khoảng cách còn lại: (a) "Cổng kết nối với hệ thống kiểm soát từ xa" — agent chấm đạt cho DSE7420, chưa rõ cho DSE7320 (phần không nêu chức năng con nên code không chấm lại); (b) BMS chưa rõ ở 8/8 do agent đã ghi chưa rõ ở lượt cũ: lượt Gợi ý mới với prompt PR 3 mới có thể đạt (Modbus RTU của DSE7320, cần NCC xác nhận).

## Fixture hồi quy (`regress-config.test.mjs`, cập nhật có chủ ý)
IB2600603983 đóng băng: QSK23-G2 / DSE7320 đổi chỗ với 4006-23TAG2A / DSE8610 (hạng 4 ↔ 5). Nguyên nhân (`fixture-eth.mjs` gốc ↔ nhánh): DSE7320 Ethernet chưa rõ → đạt qua DSE890 MKII, điểm [1,0,0,40,9,0,3] → [1,0,0,39,9,0,3], hoà cột 4 với DSE8610 [1,0,0,39,15,0,2], cột kế tiếp 9 < 15.

## Test
`node --test suppliers/` 1.296 / 1.296 qua (sau cập nhật fixture). CI #1003, #1001 xanh.

## Rủi ro / quay lui
- Revert #1003 trả lại cả ba thay đổi code; muốn bỏ riêng Ethernet: `mod: false` một dòng + fixture. Revert #1001 (đổi lại `incomplete`) không xoá bản đã đăng trên web (README).
- Ethernet mô-đun: lấy dòng nào của mô-đun có chữ ethernet / LAN / TCP, trừ dòng tuỳ chọn mở rộng / third party / replacement; tờ mô-đun có dòng "connect via Ethernet to the controller" (cổng nối với bộ điều khiển) cũng tính — chưa gặp trong 17 lượt (câu trích thật là dòng "4G (GSM/Ethernet)").
- `CTL_WORDS` BMS khớp dòng Modbus khi HSMT nêu BMS: gợi ý dòng Modbus có thể bị agent đọc như BMS chắc chắn; prompt bắt ghi chú "cần NCC xác nhận".

## Chưa làm
- Web / RFQ hiện mô-đun, phương án khác, dòng chào kèm mô-đun (PR 4): CHƯA có.
- Không chạy Gợi ý thật (kết quả prompt mới chỉ thấy ở lượt sau). Không chép sang genbid-hsmt.
- Worktree đo `wt-bdk3-base`, `wt-bdk3-ca-hai` (nháp) xoá sau khi báo.
