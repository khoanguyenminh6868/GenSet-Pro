# Nghiệm thu: cfg-bcdg — lý do bị loại (BCĐG) thành bộ kiểm cố định của Gợi ý cấu hình

Nhánh `cfg-bcdg` (rebase lên origin/main 02de480, sau #593). PR NHÁP: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/594 — chưa merge.

## Bước 2 — đã làm (điều phối duyệt 12/11 kèm 4 điểm)

### Tệp đã đổi
- `suppliers/config-bot.mjs`: `LOSS_CHECKS` (7 dòng: mã, tên, gói BCĐG, lý do ngắn, điều kiện HSMT `when`, phần con `sub`), `lossWarnOf(c, reqs)`, `LOSS_RANKS`=3; gọi cuối `rankConfigs` (gán `out.lossWarn` hoặc xoá). Không đụng `scoreOf`, status, thứ tự.
- `suppliers/reqcodes.mjs`: `emission` không nhận "lưu lượng / nhiệt độ khí thải" (lookbehind) → các item đó về `exhaust` (điểm 4 của điều phối: sửa ở chỗ gán mã vì nhỏ, và lossWarn vẫn chặn thêm cho kết quả cũ có `code: "emission"` sẵn).
- `suppliers/config-prompt.md`: bước 1 thêm đoạn "Points that lost the company a tender".
- `web/index.html`: `CFG_LOSS_CHIP`, `cfgLossHtml(c)` (tên đã grep, chưa có), gọi ngay sau `cfgWonHtml` trong thẻ cấu hình. Không đụng link/`safeUrl`/`LIBS`, không đụng `genbid-sync.js`.
- `suppliers/cfg-bcdg.test.mjs`: 8 test.

### Quy tắc (theo 4 điểm duyệt)
1. Status cảnh báo: `not_met` → "Không đạt"; `unclear` hoặc `met` mà `unverified` → "Chưa rõ"; mọi phần `confirm` → "Cần chứng từ khi nộp" (document) / "Cần xác nhận khi đặt hàng" (order); không có check → "Chưa kiểm" (BĐK mà cấu hình có check "Bộ điều khiển của cấu hình" không đạt → "Không đạt").
2. Ngắn mạch: chỉ phần `parts` (hoặc check không có parts) có chữ "ngắn mạch/short circuit"; trạng thái nhóm `ctl_protection` không tính. Không có phần đó → "Chưa kiểm".
3. Web chỉ đọc `c.lossWarn` đã lưu; mỗi dòng: tên chỉ tiêu + chip trạng thái + "từng bị loại ở gói <TBMT>" (lý do ngắn ở `title`). Không câu trích nên không liên quan SHOW_SRC.
4. Điều kiện HSMT: ngắn mạch cần chữ ngắn mạch trong requirement/quote/parts; khí thải cần Euro/Tier/Stage/QCVN/TCVN/EPA/emission/"tiêu chuẩn" và không phải lưu lượng/nhiệt độ; tiếng Việt cần chữ "tiếng Việt"/Vietnam (IB2600602880 "LCD 3,1 inch" không cảnh báo).
Check khớp theo `code` của check, không có thì theo `item` của yêu cầu (như `confirmChecks`) hoặc `codeOf`. Bẫy gặp khi làm: `codeOf("Ngôn ngữ, màn hình bộ điều khiển")` = `ctl_measure` (chữ "màn hình") nên đo bước 1 báo nhầm 4/4 "không có check" cho tiếng Việt; thật ra 3 cấu hình IB2600603983 có check, "Chưa rõ".

### Lệnh kiểm + đầu ra thật
- `node --test` (gốc worktree, sau rebase): `# pass 487` / `# fail 0`.
- `node scratchpad/compare.mjs <bản chụp configmatch> <config-bot mới> <config-bot origin/main>` (scratchpad của phiên; base = `git archive origin/main suppliers web`): chạy `rankConfigs` cả hai bản trên 16 kết quả → `{ results: 16, cfgsTop3: 33, rankDiff: 0 }`, không dòng "OTHER DIFF" (bỏ `lossWarn` ra thì kết quả giống hệt), không cảnh báo ở hạng > 3.
- Web: không mở được localhost trong trình duyệt của phiên (bị từ chối); đã render `cfgLossHtml` bằng Node từ chính dòng code trong index.html: ra khối `note err` 2 dòng, chip `warn`/`cfm`, `title` đã escape `<`; `{}` và `lossWarn: []` → chuỗi rỗng.

### Đo trước / sau (ĐO, bản chụp configmatch 12/11 13:46; trước = origin/main không có cảnh báo nào)
| Chỉ tiêu | Cảnh báo sau | Chi tiết |
|---|---|---|
| Tiêu hao 50% tải | 15 | 15 Chưa rõ (2 cấu hình đạt của IB2600594596 cỡ 2 không cảnh báo) |
| Công suất đầu phát | 10 | 10 Chưa rõ (QSK23-G2 IB2600603983 đạt) |
| BĐK bảo vệ ngắn mạch | 6 | 5 Chưa rõ, 1 Chưa kiểm (IB2600601812 #3) |
| Tiêu chuẩn khí thải | 6 | 6 Chưa rõ (IB2600601812, IB2600603983; IB2600581977 "lưu lượng khí thải" đã bỏ) |
| Tiêu chuẩn đầu phát | 3 | 3 Cần chứng từ khi nộp |
| BĐK tiếng Việt | 3 | 3 Chưa rõ |
| Hiệu suất đầu phát | 0 | không gói nào có yêu cầu |
| **Tổng** | **43** | trên 33 cấu hình hạng 1–3; 0 thứ hạng đổi |

### 3 mẫu đối chiếu nguồn
1. `genbid-test\bcdg\text\IB2500261097.txt` (BCĐG): "Bộ điều khiển SMARTGEN, Model: HGM6120 … (Không có chức năng cảnh báo và bảo vệ ngăn mạch)" → dòng ctl_protection; IB2600603983 #1 phần "Ngắn mạch" = unclear → cảnh báo "Chưa rõ".
2. `IB2500438703.txt`: "Hiệu suất tại cấp điện áp 380/220V chỉ đạt Max: 92.8% < 93%" → alt_efficiency (chưa gói nào trong 13 có yêu cầu).
3. `IB2600483082.txt`: "không đáp ứng yêu cầu về mức tiêu thụ nhiên liệu tại chế độ chạy liên tục (Prime) tại 50% công suất" → fuel_consumption_50; IB2600581294 #1 SC25G690D2 "≤ 49,6 L/h" chưa rõ → cảnh báo.
(Nguồn gốc là PDF BCĐG tải về của gói, không có URL công khai; tệp gốc `genbid-test\bcdg\files\<TBMT>\`.)

### Rủi ro / quay lui
- Quay lui: revert PR. `lossWarn` là trường mới, bản web cũ bỏ qua; kết quả đã lưu không bị đổi tới khi Gợi ý lại / rankConfigs chạy lại.
- `reqcodes.mjs` đổi `codeOf` cho item "lưu lượng/nhiệt độ khí thải": yêu cầu mới sẽ mang `exhaust` (option, kind model) thay vì `emission` (core) → điểm xếp hạng của cấu hình có check đó có thể đổi ở lượt Gợi ý mới (option xếp sau). Trên 13 bản cũ không đổi vì yêu cầu đã lưu `code`/được rankConfigs tính theo bản lưu (đo: 0 thứ hạng đổi). REQ_VERSION không tăng (reqHash dùng lại yêu cầu cũ, mã đã lưu sẵn).
- Gắn cờ theo từ khoá HSMT: bỏ sót khi HSMT viết ngắn mạch kiểu khác ("short-circ"), tiếng Việt kiểu "Vietnamese" có `vietnam`; ngược lại "tiêu chuẩn" trong item emission làm mọi yêu cầu emission đã chuẩn hoá đều tính (cả "Phù hợp điều kiện Việt Nam" mơ hồ của IB2600601812).
- Prompt đổi chỉ có hiệu lực ở lượt agent mới; chưa chạy agent thật (brief cấm).

### Chưa kiểm được
- Chưa xem trên web thật (không ghi web thật; trình duyệt phiên không mở localhost) — chỉ render hàm bằng Node.
- Chưa có lượt agent thật để xem prompt mới có làm giảm "chưa rõ" ở các mã này không.

## Bước 1 — bảng lý do → chỉ tiêu → mã → hiện trạng (ĐO)

Nguồn lý do: `genbid-test\bcdg\out-after\*.txt` (19 BCĐG, trích bằng bcdg-why #588) + collection `bcdg` trên web (6 tài liệu, đọc bằng `allDocs`, chỉ đọc). Chỉ giữ lý do về THÔNG SỐ linh kiện; bỏ lỗi soạn hồ sơ.

| # | Gói (BCĐG) | Lý do (tóm tắt) | Chỉ tiêu | Mã hiện có |
|---|---|---|---|---|
| 1 | IB2500261097 | BĐK SmartGen HGM6120 không có chức năng cảnh báo và bảo vệ ngắn mạch | BĐK bảo vệ ngắn mạch | `ctl_protection` (phần "ngắn mạch" trong `parts`) |
| 2 | IB2500438703 | Đầu phát Stamford UCDI274K hiệu suất 92,8% < 93% ở 380/220 V | Hiệu suất đầu phát | `alt_efficiency` |
| 3 | IB2600483082 | Tiêu thụ nhiên liệu Prime ở 50% tải không đáp ứng (0/30 điểm kỹ thuật) | Tiêu hao 50% tải | `fuel_consumption_50` |
| 4 | IB2600365013 | Không đáp ứng khí thải ≥ Euro 4 / Stage IV / Tier 4 | Khí thải | `emission` |
| 5 | IB2400104800 | Đầu phát theo VDE 0530, HSMT đòi VDE 0875 | Tiêu chuẩn đầu phát | `alt_standard` (kind document) |
| 6 | IB2500211376 | Đầu phát Marelli MJB160 SA4 tối đa 16,2 kVA < Prime ≥ 20 kVA | Công suất đầu phát | `alt_power` |
| 7 | IB2500371475 | BĐK không thể hiện cài đặt tiếng Việt | Ngôn ngữ BĐK | `ctl_display_lang` (option, kind order) |

Đã xử lý ở chỗ khác, KHÔNG đưa vào bộ này: IB2400254417 đồng bộ một nhà sản xuất (`brand_sync`, #424/#543); IB2600248328 xuất xứ Châu Âu (`originOfHsmt` EU, #491); IB2600374560 công suất tổ máy 180 < 405 kVA (`power_prime`, xếp hạng đã dùng).
Lỗi soạn hồ sơ / năng lực (bỏ): thiếu catalogue/CE/ủy quyền/dấu xác nhận (IB2500211376 phần CE, IB2500371475, IB2500438703 phần catalogue, IB2600478079, IB2400438227 mã GM96≠GR-96), chuyển nhượng thầu (IB2400577658), thuế/BCTC (IB2400104800 b3), bảo hành (IB2400120387), biện pháp thi công (IB2600487332), vật tư thay thế (IB2400393199), model chưa vận hành ở VN (IB2600450087). Không xác định được chi tiết: IB2600253287 ("theo đánh giá chi tiết", bảng 03B OCR không ghi tiêu chí trượt), IB2400564384.

### Hiện trạng trên 13 configmatch (bản chụp `doc-cache\configmatch.json` 12/11 13:46, 16 kết quả kể cả cỡ; chép vào scratchpad trước khi đo)
Chỉ tính kết quả mà `requirements` có mã đó; trạng thái của check cùng mã ở cấu hình hạng 1–3. Script: scratchpad `measure.mjs`.

| Chỉ tiêu | Kết quả có yêu cầu | Cấu hình hạng 1–3 | đạt | chưa rõ | không đạt | confirm | không có check |
|---|---|---|---|---|---|---|---|
| BĐK bảo vệ ngắn mạch | 2 (IB2600601812, IB2600603983) | 6 | 0* | 5 | 0 | 0 | 1 |
| Hiệu suất đầu phát | 0 | 0 | – | – | – | – | – |
| Tiêu hao 50% tải | 6 | 17 | 2 | 15 | 0 | 0 | 0 |
| Khí thải | 3 (1 là mã sai: "Lưu lượng khí thải" của IB2600581977) | 9 | 0 | 9 | 0 | 0 | 0 |
| Tiêu chuẩn đầu phát | 1 | 3 | 0 | 0 | 0 | 3 | 0 |
| Công suất đầu phát | 4 | 11 | 1 | 10 | 0 | 0 | 0 |
| Ngôn ngữ BĐK | 2 | 4 | 0 | 0 | 0 | 0 | 4 |

\* IB2600603983: 3 check `ctl_protection` mỗi cấu hình (unclear+unclear+met), không phần nào riêng "ngắn mạch" đạt.
Kết luận: 0 "không đạt" ở mọi chỉ tiêu; gần như toàn bộ là "chưa rõ" lẫn trong đống chưa rõ khác (đúng vấn đề brief nêu).

## Phương án bước 2 (chờ duyệt)
1. `config-bot.mjs`: bảng cố định `LOSS_CHECKS` (7 dòng trên: mã, điều kiện HSMT, gói BCĐG làm lý do). `lossWarnOf(c, reqs)` chạy cuối `rankConfigs` cho cấu hình hạng 1–3: HSMT có yêu cầu mã đó (ngắn mạch: chữ "ngắn mạch/short circuit" trong requirement/quote/parts; khí thải: có Euro/Tier/Stage/QCVN/EPA/TCVN, tránh "lưu lượng khí thải") mà check không "đạt" (chưa rõ / không đạt / confirm / chưa có check) → `c.lossWarn = [{code, item, status, why: "Từng bị loại: <lý do ngắn> (gói …)"}]`. Không đổi status, không đổi `scoreOf`/thứ hạng.
2. `config-prompt.md`: thêm mục "chỉ tiêu từng bị loại" — agent phải tìm nguồn cho các mã này ở cấu hình đứng đầu; BĐK ghi "ngắn mạch" thành phần riêng trong `parts`; không bịa số.
3. `web/index.html` (chỉ thẻ cấu hình): khối cảnh báo đỏ "Chỉ tiêu từng làm công ty bị loại" ngay trên bảng kiểm; không in câu trích (SHOW_SRC không liên quan vì chỉ có tên chỉ tiêu + mã gói).
4. Test `suppliers/cfg-bcdg.test.mjs`; đo trước/sau trên bản chụp 13 configmatch (số cảnh báo theo chỉ tiêu, 0 thứ hạng đổi).
