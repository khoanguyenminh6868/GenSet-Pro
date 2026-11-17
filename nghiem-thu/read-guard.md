# Nghiệm thu: agent đọc thiếu đầu vào — rà soát + chốt chặn bằng code (read-guard, 12/11)

PR nháp #562 (https://github.com/khoanguyenminh6868/GenSet-Pro/pull/562). Nhánh `read-guard` (rebase trên 87dda3d #561), worktree `C:\Projects\GenSet Pro\wt-read-guard`, từ origin/main 2e1510c (#559). PR nháp, không tự merge.

Câu hỏi của Khoa: "việc agent đọc thiếu đầu vào đã fix triệt để chưa". Trả lời ngắn: **#559 mới làm cho việc đọc đủ CÓ THỂ (cắt tệp dưới giới hạn Read); chưa có gì bảo đảm agent ĐÃ đọc đủ.** Số đo dưới đây cho thấy catalog.md gần như chưa lượt nào đọc trọn. PR này thêm chốt chặn: code tự xem log của lượt và ghi chú vào kết quả khi agent đọc thiếu.

## Cách đo

`suppliers/read-guard.mjs` đọc log stream-json của lượt (`%TEMP%\genbid-config-<gói>[-cỡ].log`). Mỗi Read trong log có `tool_use_result.file` = { startLine, numLines, totalLines } — tức số dòng agent THẬT SỰ nhận được, không phải số dòng nó xin. Hợp các khoảng dòng của mỗi tệp (tệp nguyên hoặc các phần catalog-N.md / input-N.md quy về dòng của tệp nguyên) rồi so với số dòng tệp. Đọc bằng Bash chỉ tính khi là `cat <tệp>` hoặc `sed -n 'a,bp' <tệp>` một mình và đầu ra không bị cắt (`Output too large`); `head -c`, `tail -c`, `| cut -c1-500`, `| grep` không tính (cắt chữ / chỉ tìm).

Lệnh: `node suppliers/read-guard.mjs <log>...` (chỉ đọc log).

## 1. Bảng rà soát (xếp theo mức nghiêm trọng)

| # | Chỗ | Tệp / dòng mã | Giới hạn | Báo khi cắt? | Đã gặp thật? | PR này |
|---|---|---|---|---|---|---|
| 1 | catalog.md không được đọc trọn (Gợi ý) | agent; prep `writeForRead` | Read từ chối > 25.000 token; agent tự chọn offset/limit, `sed \| cut -c1-500` | Không (trước PR) | **CÓ, 9/10 lượt** (bảng §3) | chốt chặn + cấm Bash trong agentInput |
| 2 | input.md bị cắt im lặng | Read (bản cũ trả thiếu dòng không báo) | ~21–22 nghìn ký tự đầu | Không | **CÓ: IB2600592684 -1 và -2, dòng 1–321/447** (04/11); 603983 đọc bằng `head -c 30000` + `tail -c 6000` | chốt chặn |
| 3 | Mã yêu cầu HSMT có mà requirements thiếu / dòng phân tích chưa có yêu cầu | `checkDir` tính `missing` (`missingCodes`, tối đa 15 mã core) và `uncovered` nhưng `answer()` bỏ đi; chỉ CLI `check` in | — | **Không, người dùng không thấy** | có (mọi lượt có missing đều mất) | `coverNotes` → notes |
| 4 | Lượt bị dừng / quá giờ / lỗi mà result.json dở | `runClaudeOnce` (40 phút, `p.kill()`); `answer()` chỉ xét result.json có tồn tại | — | Không: bản dở nhận như bản đủ | chưa (13/13 log `success`) | `stoppedNote`: giữ kết quả cũ + ghi chú |
| 5a | Chương webform của TBMT cắt 50.000 ký tự | `bot/genbid-hsmt/genbid-sync.js:265` (bản sao của `genbid-hsmt\`) | 50.000 ký tự | Không | **chưa**: 13 gói có Gợi ý: 9 chương, lớn nhất 15.181; 1.286 gói đã phân tích (API trả notice của 16): lớn nhất 15.784, không chương nào ≥ 40.000 | PR thứ hai (đề xuất) |
| 5b | Thiếu một chunk hsmttext → "" | `hsmtTextOf` (config-bot.mjs) | — | Không | chưa đo | PR thứ hai |
| 5c | `technicalPart` chỉ lấy MỘT chương tiêu đề kỹ thuật (dài nhất) | config-bot.mjs `technicalPart` | 1 chương; `MAX_TP` 250.000 | Không | chưa đo; yêu cầu ở chương khác (bảng tiêu chuẩn ch. III, danh mục hàng hoá TBMT) không vào input.md — agent chỉ grep hsmt.txt | PR thứ hai |
| 5d | Tệp scan chưa OCR (hasText=false) | prep không xét `hsmt.files` | — | Không (luồng Gợi ý) | IB2600599817: "Mục 3, Chương III - Tiêu chuẩn đánh giá HSDT.doc" hasText=false | PR thứ hai |
| 6 | Lượt kiểm Tìm NCC (checkNewConfigs) | catalog.md ghi thẳng một tệp ~100–150 nghìn ký tự; tin nhắn "Đọc prompt.md" | Read 25.000 token | Không | log 594596 (06/11): agent dùng head -c / sed, không bị từ chối nhưng không đọc trọn | writeForRead + read-order + agentInput + chốt chặn |
| 7 | Tìm NCC (findPrep) | ghi lại catalog.md (kèm mọi NCC) và input.md sau prep → catalog-N.md / input-N.md cũ lệch nội dung còn trong thư mục | — | — | khả năng (FIND_INPUT chỉ nói catalog.md) | xoá phần cũ + read-order.json |
| 8 | Đầu ra shell > ~30 KB → preview 2 KB | Claude Code | ~30 KB | có (`Output too large`) | 8/11 lượt cũ (cat prompt.md); #559 đưa prompt vào tin nhắn đầu | agentInput cấm đọc tệp read-order bằng Bash |
| 9 | Gợi ý giá đấu | `bidprice-bot.mjs:45` `technicalPart(...).slice(0, 20000)`; `:79` `.slice(0, 60000)` | 20.000 / 60.000 ký tự | Không | chưa đo | chỉ liệt kê |
| 9b | Thông số tổ máy (specs) | `genbid-sync.js:966` `chapterV(text).slice(0, 150000)` | 150.000 | Không | chưa đo | chỉ liệt kê |
| 9c | TBMT info trong Phân tích | `genbid-sync.js:1640` 8.000 | 8.000 | **Có** ("phần sau đã cắt bớt") | — | — |
| 9d | Danh mục hàng hoá TBMT | `genbid-sync.js:1647` `.slice(0, 30000)`; `:817` 30.000 khi không thấy điểm dừng | 30.000 | Không | chưa: goods lớn nhất 9.432 | chỉ liệt kê |
| 9e | bidhist config.text | `genbid-sync.js:493` CONFIG_TEXT_MAX 6.000 (chọn dòng quan trọng trước) | 6.000 | — | đã vá 802 gói ngày 06/11 | — |
| 10 | Phân tích HSMT (ask, không công cụ) | toàn bộ input trong một tin nhắn; > 450.000 ký tự → agent; agent đọc input.md > 25.000 token chắc chắn bị cắt/từ chối, không có chốt chặn | 450.000 / Read 25.000 token | Trả lời một lần bị cắt (max output) → JSON hỏng → chuyển agent (đã xử lý) | chưa đo | chỉ liệt kê |
| 11 | Read cắt dòng dài (bản Claude Code cũ cắt dòng > 2.000 ký tự) | Read | — | — | **Không**: dòng dài nhất Read trả về trong 11 log là 7.650 ký tự, nguyên vẹn; thử trên máy: dòng 2.995 ký tự nguyên | — |
| 12 | savePages | `config-bot.mjs` WEB_MAX_BYTES 2 MB | 2 MB/trang | có (`skipped: trang quá lớn`) | — | — |
| 13 | Tìm thông số NCC (crawl-specs, skill tim-thong-so-ncc) | `crawl-specs.mjs` title 200; nội dung trang qua `htmlToText` không cắt | — | — | — | — |
| 14 | viaApi | `api-budget.mjs`: chỉ đặt ANTHROPIC_API_KEY cho `claude -p`; KHÔNG gọi Messages API trực tiếp → không có max_tokens riêng | — | — | — | — |

Ghi chú mục 1: phần agent không đọc của catalog.md thường là "Thông số theo model", "NCC khác có dòng cùng động cơ", "Động cơ khác", "Bộ điều khiển" — nơi có ứng viên / số liệu tốt hơn mà agent không thấy. Trong 13 log, chỉ IB2600586587 (11/11) đọc catalog.md trọn.

### Mục 5 — số đo HSMT trước khi tới agent (GET chỉ đọc, script `scratchpad\hsmt-gaps.mjs`)

Dựng lại `hsmt.txt` đúng như `hsmtTextOf` (chunk hsmttext + TBMT) rồi chạy `technicalPart` của nhánh; "thông số" = số lần SPEC_HIT (kVA, xi lanh, đầu phát, công suất liên tục/dự phòng, prime, standby) trong phần kỹ thuật đã chọn và phần bị bỏ; yêu cầu bị bỏ = `missingCodes(phần bị bỏ, requirements của kết quả đang hiển thị)` trừ mã mà phần đã chọn cũng nói tới.

| Nhóm | Gói | (b) chunk rỗng/thiếu | Không có chữ HSMT | (d) có tệp scan hasText=false | technicalPart = cả văn bản | (c) phần bị bỏ có ≥ 10 lần thông số |
|---|---|---|---|---|---|---|
| Có Gợi ý cấu hình | 13 | 0 | 0 | 1 (IB2600599817) | 5 | **0** |
| Mẫu 60 gói máy phát đã phân tích (mới nhất) | 60 | 0 | 8 | 4 (đều "OCR thử, không ra": 3 .zip, 1 .docx) | 8 | **6** |

- **13 gói có Gợi ý: không yêu cầu nào trong phần bị bỏ mà kết quả đang hiển thị thiếu** (`lost` rỗng cả 13). Phần bị bỏ có ≤ 8 lần thông số (IB2600594596: 8; 592684, 603983: 2). → Kết quả đang hiển thị không thiếu yêu cầu vì (c).
- (c) ở mẫu 60 gói (chưa có Gợi ý, là rủi ro khi bấm Gợi ý): IB2600341462 (871.549 ký tự, technicalPart cắt ở MAX_TP 250.000 và lấy **phần có 3 lần thông số, bỏ phần có 108**), IB2300042764 (giữ 11, bỏ 36), IB2600064877 (55/20), IB2500598824 (67/16), IB2600064878 (34/16), IB2600027651 (65/12).
- (b): 0/73 gói có chunk rỗng hay thiếu.
- 8/60 gói không có chữ HSMT nào (4 không có tệp, 4 chỉ có tệp OCR thử không ra) → prep báo lỗi "chưa có văn bản HSMT" (đã có, không im lặng).
- (d) IB2600599817: tệp "Mục 3, Chương III - Tiêu chuẩn dánh giá HSDT.doc" hasText=false. Gói này là **mua nhiên liệu / dầu nhờn** (Xăng E5, DO 0,05S, dầu 15W40), kết quả đang hiển thị là "Không gợi ý cấu hình" với 0 yêu cầu; tiêu chuẩn đánh giá chương III không ảnh hưởng gì tới Gợi ý cấu hình của gói này. Không thiếu.
- (a) như trên: không chương webform nào ≥ 40.000.

## 2. Chốt chặn bằng code (Phần 2)

1. **Dấu vết Read** (`read-guard.mjs`): `readTrace` (Read: tệp, offset/limit, dòng nhận được, totalLines, bị từ chối; Bash `cat`/`sed -n` đọc trọn; dòng `result` của lượt), `partsMap(dir)` (read-order.json → tệp nguyên + vị trí từng phần), `coverage`, `readNotes`, `guardRun(dir, log)`. Trong `answer()` sau `checkDir`: tệp read-order chưa đọc hết → notes "Agent chưa đọc hết <tệp> (thiếu dòng a–b / n): kết quả có thể thiếu yêu cầu — bấm Gợi ý lại" (hoặc "Agent không đọc <tệp>… Read bị từ chối…"), log bot `CHỐT ĐỌC — …`, và cờ `result.readIncomplete = true` (web chưa dùng — xem Đề xuất).
2. **Độ phủ yêu cầu độc lập với việc đọc** (`coverNotes`): `missing` (mã yêu cầu core mà một dòng phần kỹ thuật HSMT nói tới nhưng requirements không có — `missingCodes`, code dò chữ, có thể nhầm), `uncovered` (dòng thông số của Phân tích chưa có yêu cầu), và yêu cầu chính (không phải option, không byCode) mà cấu hình nào chưa có check → notes. Không đổi trạng thái đạt/không đạt (rankConfigs vốn đã coi yêu cầu chính thiếu check là chưa rõ).
3. **Lượt dừng giữa chừng** (`stoppedNote`): không có dòng `result` trong log, `is_error`, `subtype` ≠ success (vd. error_max_turns), hoặc runner báo quá giờ. Cách chọn: có kết quả lần trước của cùng cỡ → **giữ kết quả lần trước** (không ghi đè bằng bản dở), thêm ghi chú "Lượt Gợi ý lại lúc … UTC bị dừng giữa chừng (lý do); đang hiển thị kết quả lần trước — bấm Gợi ý lại"; không có kết quả trước → dùng bản dở nhưng kèm ghi chú "bị dừng giữa chừng: result.json có thể là bản dở". Lượt kiểm Tìm NCC bị dừng: không nhận checks (cấu hình vẫn "chưa đối chiếu"), ghi chú vào kết quả.
4. **Lúc dựng đầu vào**: `splitForRead` tính kích thước bằng `readSize` (chữ Hán/Nhật/Hàn nặng 1,5 — ≈ 1 token/chữ; catalog.md có bảng tiếng Trung); dòng đơn dài hơn giới hạn cắt trong dòng, ghép lại đúng nguyên văn (test). Lượt kiểm Tìm NCC: catalog.md qua `writeForRead` + read-order.json + `agentInput(dir, task)` + chốt chặn. Tìm NCC: xoá catalog-N.md / input-N.md / ctl-lookup-N.md / read-order.json cũ sau khi findPrep viết lại catalog.md, input.md. `agentInput` thêm câu cấm đọc tệp read-order bằng Bash (cat/head/tail/sed/cut/head -c) và nói rõ code kiểm log.
5. Không đụng `candidates()` / engineMins / powerMins.

## 3. Số đo trên log thật (Phần 2 mục 4)

`node suppliers/read-guard.mjs <log>` trên 11 log Gợi ý cấu hình + 2 log Tìm NCC (Read: dòng thật sự nhận được; Bash chỉ tính `cat`/`sed -n` trọn không cắt). Số dòng lấy từ totalLines của Read (thư mục lượt cũ đã xoá).

| Lượt | Ngày | input.md | catalog.md | Read bị từ chối | Đọc lặp | Vòng | USD |
|---|---|---|---|---|---|---|---|
| IB2600581977 | 04/11 | đủ 707 | **thiếu 216–376, 626–953 / 1603** | catalog@216 | catalog×5 | 32 | 3,04 |
| IB2600592684-1 | 04/11 | **thiếu 322–447 / 447** (cắt im lặng) | **thiếu 361–687, 1088–1265 / 1265** | 0 | catalog×2 | 17 | 2,13 |
| IB2600592684-2 | 04/11 | **thiếu 322–447 / 447** (cắt im lặng) | **thiếu 550–1438 / 1438** | 0 | catalog×2 | 35 | 3,40 |
| IB2600601812 | 09/11 | đủ 469 | **thiếu 540–1634 / 1634** | catalog@240 ×2 | catalog×2 | 48 | 3,61 |
| IB2600602880 | 10/11 | đủ 301 | **thiếu 452–762 / 1430** | catalog (limit 450) | catalog×4 | 26 | 2,93 |
| IB2600586587 | 11/11 | đủ 391 | đủ 1688 | 0 | 0 | 19 | 2,19 |
| IB2600603983 | 11/11 | **không qua Read** (`head -c 30000` + `tail -c 6000`) | **thiếu 535–1572 / 1572** | catalog@879 | catalog×2 | 36 | 3,69 |
| IB2600594596-1 | 12/11 | đủ 826 (đọc 2 lần) | **thiếu 590–909 / 1538** | catalog@910 | input×2, catalog×4 | 20 | 2,14 |
| IB2600594596-2 | 12/11 | đủ 826 (đọc 2 lần) | **thiếu 450–599, 680–1721 / 1721** | catalog@250 | input×2, catalog×3 | 38 | 2,49 |
| IB2600604739-1 | 12/11 03:16Z | đủ 251 | **không qua Read** (`sed -n 60,400p \| cut -c1-500` + sed rải rác) | 0 | 0 | 15 | 0,87 |
| IB2600604739-2 | 12/11 03:16Z | đủ 251 | **không qua Read** | 0 | 0 | 7 | 0,31 |
| findcheck IB2600594596 | 06/11 | — | không qua Read (`head -c 12000`, sed) | 0 | 0 | 12 | 0,73 |
| find IB2600594596 | 06/11 | không qua Read | không qua Read | 0 | 0 | 38 | 1,66 |
| **IB2600592684-1 (lượt mới, sau #559)** | **12/11 05:50Z** | **đủ 610 (input-1, -2)** | **đủ 1401 (catalog-1…6)** + ctl-lookup đủ 106 | **0** | **0** | **20** | **1,71** |
| **IB2600592684-2 (lượt mới, sau #559)** | **12/11 05:50Z** | **đủ 610 (input-1, -2)** | **đủ 1430 (catalog-1…7)** + ctl-lookup đủ 151 | **0** | **0** | **18** | **1,52** |

- Ca 592684 ngày 04/11 bị bắt đúng: input.md 1–321 (CLI in 447 vì totalLines tính dòng trống cuối; tệp 446 dòng).
- Lượt mới (dòng đậm, `guardRun` trên bản chép thư mục lượt lúc đang chạy — số dòng chính xác): mọi tệp trong read-order.json đọc **đủ, mỗi phần đúng một lần, không Read nào bị từ chối, không đọc bằng Bash, không đầu ra shell bị cắt**. guardRun trả **0 ghi chú** cho cả hai cỡ.
- So với lượt 04/11 cùng gói: 37 → 20 + 18 = 38 vòng (cỡ 2: 35 → 18), **5,53 → 3,23 USD (−42%)**, dù input.md mới dài hơn (46.438 ký tự / 610 dòng so với 447 dòng) và lần này agent thấy hết catalog.
- Lượt 604739 (03:16Z, trước #559) cho thấy agent vẫn có thể đọc catalog bằng `sed | cut -c1-500` — vì vậy agentInput giờ cấm rõ và chốt chặn bắt được.

## Tệp đổi

- `suppliers/read-guard.mjs` (mới): bộ đọc dấu vết + CLI.
- `suppliers/read-guard.test.mjs` (mới, 8 test): IB2600592684 1–321/446 bị bắt; phần đọc trọn = tệp nguyên đọc trọn; phần thiếu nêu theo dòng tệp nguyên; head -c / cut / tail -c / đầu ra bị cắt không tính; lượt dừng (không có result, error_max_turns, quá giờ); splitForRead không mất chữ, dòng dài, chữ Hán; coverNotes; agentInput cấm Bash.
- `suppliers/config-bot.mjs`: import `read-guard.mjs`; `answer()` (lượt dừng giữ kết quả cũ; guardRun + coverNotes vào notes); `coverNotes` (mới, export); `readSize`, `splitForRead`; `agentInput(dir, task)`; `checkNewConfigs` (writeForRead, read-order, agentInput, guardRun, không nhận checks của lượt dừng); caller ghi `readNotes`; `findPrep` xoá phần cũ.

## Kiểm đã chạy

- `node --test` trong `suppliers/`: **345/345** (337 trên main sau #561 + 8 mới).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi.
- `node suppliers/read-guard.mjs` trên 13 log (bảng §3).
- Mục 5a: GET chỉ đọc `/api/requests?kind=docs&coll=notice|hsmt&ids=…` cho 13 gói có Gợi ý + 1.286 gói đã phân tích (script ở scratchpad, không ghi gì).

## Rủi ro

- Ghi chú "chưa đọc hết" có thể nhiều ở lượt đầu sau merge nếu agent vẫn đọc catalog bằng sed/cut — đó là đúng (kết quả thật sự có thể thiếu), nhưng sẽ hiện ở phần "Lưu ý về độ tin cậy" của nhiều gói.
- Log định dạng khác (Claude Code đổi `tool_use_result`): Read không có `file` → lấy số dòng từ chữ "N\t…" nếu có, không thì không tính là đã đọc → báo thiếu (an toàn về phía báo).
- `coverNotes` dùng `missingCodes` (dò chữ, có thể nhầm) — câu ghi chú nói rõ "có thể nhầm".
- Giữ kết quả cũ khi lượt dừng: người dùng thấy kết quả lần trước kèm ghi chú, không thấy bản dở. Gói chưa từng có kết quả vẫn nhận bản dở (kèm ghi chú).
- Bot KHÔNG cần restart: mỗi lượt Gợi ý là một tiến trình node mới đọc config-bot.mjs từ checkout chính (điều phối xác nhận: lượt 592684 dùng #559 mà không restart).

## Quay lui

Revert PR. Thư mục lượt cũ không bị ảnh hưởng; kết quả đã đăng chỉ có thêm notes / `readIncomplete` (web bỏ qua trường lạ).

## Đề xuất (chưa làm vì phải đổi web)

- Web: `readIncomplete` → nhãn "Kết quả có thể chưa đầy đủ" cạnh tiêu đề Gợi ý cấu hình, và nút Gợi ý lại nổi bật. Hiện chỉ có ghi chú trong "Lưu ý về độ tin cậy".
- Bot: Gợi ý lại tự động MỘT lần khi lượt đọc thiếu (tốn ~2–3 USD/lượt) — cần Khoa quyết.
- PR thứ hai (mục 5): ghi chú "văn bản HSMT có thể thiếu: <lý do>" khi chunk hsmttext rỗng, tệp hasText=false chưa OCR, chương webform ≥ 49.990 ký tự, hoặc technicalPart bỏ chương có thông số; xem tin nhắn gửi điều phối.

## Chưa kiểm

- Lượt agent thật với code PR này (chốt chặn chỉ chạy được sau merge + restart bot).
- Web hiển thị notes mới (không đổi web).
- Mục 9, 10 (Gợi ý giá, Phân tích HSMT): chỉ liệt kê.

---

# PR2 — văn bản HSMT có thể thiếu + technicalPart (PR nháp #563, nhánh `hsmt-gaps`, trên f678f11)

PR1 #562 đã squash-merge (f678f11). PR2 chỉ sửa `suppliers/config-bot.mjs` (không đụng bot, trần 50.000 của genbid-sync.js để nguyên).

## Thay đổi
- `hsmtGaps({ hsmt, parts, notice, text })` (thuần): phần hsmttext rỗng; không có chữ tệp HSMT nào (chỉ TBMT); tệp hasText=false (ghi "OCR không ra" khi ocrTried); chương webform ≥ 49.990 ký tự; phần kỹ thuật bị cắt (`tpCut`, kèm dòng a–b của hsmt.txt); ≥ 10 chỗ SPEC_HIT ngoài phần đưa vào input.md (kèm tối đa 40 số dòng). prep: mục "Văn bản HSMT có thể thiếu" trong input.md (bảo agent sed quanh các dòng đó) + `meta.json.hsmtGaps`; answer(): notes "Văn bản HSMT có thể thiếu: …" (≤ 300 ký tự). `hsmtTextOf` trả thêm `notice`.
- `technicalPart`: chương kỹ thuật dài hơn MAX_TP → `densest()`: cửa sổ MAX_TP nhiều SPEC_HIT nhất trong chương, bắt đầu ở đầu dòng, kết thúc ở cuối dòng, so với cửa sổ đầu chương và lấy cái nhiều thông số hơn (không bao giờ kém bản cũ). Các nhánh khác giữ nguyên (chương ≤ MAX_TP: `text.slice(at, end)` = như cũ; không có chương: cửa sổ cũ). Cờ `tpCut` cho hsmtGaps.
- `coverNotes` gọn (Khoa không thích cảnh báo dài): "HSMT có N điểm code dò thấy mà danh sách yêu cầu chưa có (có thể nhầm): a; b; c và k điểm khác." — tên mục bỏ phần trong ngoặc; "N cấu hình chưa có điểm đối chiếu cho yêu cầu chính (tính là chưa rõ): #r (…); …"; mọi ghi chú cắt ở NOTE_MAX = 300.

## Số đo
- technicalPart trên 65 gói có chữ (13 Gợi ý + 52 mẫu có chữ; văn bản lưu cục bộ một lần bằng GET): **63 giống hệt md5**; 2 khác là đúng 2 gói có chương kỹ thuật > MAX_TP: IB2600341462 (lần thông số giữ: **3 → 93** / 111 cả văn bản), IB2600184587 (34 → 34; chỉ bỏ nửa dòng cuối).
- 6 gói mẫu: IB2600341462 3 → 93 (đổi); IB2300042764 11 → 11, IB2600064877 55 → 55, IB2500598824 67 → 67, IB2600064878 34 → 34, IB2600027651 65 → 65 (chương ≤ MAX_TP, giống hệt; phần thông số ngoài chương vẫn bị bỏ nhưng nay có ghi chú + số dòng).
- hsmtGaps: 13 gói có Gợi ý → 1 gói có ghi chú (IB2600599817, tệp scan; gói mua nhiên liệu); 52 gói mẫu có chữ → 8 gói (6 "ngoài phần kỹ thuật còn N chỗ thông số", 3 "phần kỹ thuật dài hơn 250.000", IB2600341462 có cả hai).
- coverNotes trên kết quả IB2600592684 mới (05:56Z): mỗi cỡ 2 ghi chú. Trước khi rút gọn 627 / 684 + 133 ký tự; sau: 30 kVA 164 + 116, 500 kVA 153 + 116 ký tự. Lưu ý: `missingCodes` khá nhiễu ở gói này (vd. "Thời gian bảo hành ≥ 1000 giờ chạy" bị dò thành "Đo lường, hiển thị"; dòng "Model: TAL-A473-C" của cỡ kia) — vì vậy câu ghi chú có "(có thể nhầm)".
- Lượt 592684 mới không tra mạng (traceOf: 0 WebSearch, 0 WebFetch, 0 lệnh save) → không có `searched`, kho âm 0 mục là bình thường; prompt chưa được thử ở lượt có tra mạng (chưa kiểm).

## Kiểm
- `node --test` trong suppliers/: **350/350** (345 trên main + 5 mới: hsmtGaps không gap / chunk rỗng / chỉ TBMT / scan / webform ở trần / thông số ngoài chương kèm dòng; technicalPart chương > MAX_TP lấy đúng đoạn thông số, trọn dòng, chương nhỏ không đổi). `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi.

## Rủi ro
- Ghi chú "ngoài phần kỹ thuật còn N chỗ thông số" có thể báo cả chỗ không phải yêu cầu (bảng giá, danh mục hàng hoá đã có trong yêu cầu) — ngưỡng 10; ở 13 gói có Gợi ý không gói nào chạm ngưỡng.
- technicalPart đổi đầu vào của 2/65 gói (chương > 250.000 ký tự); gói đó Gợi ý lại sẽ có requirements khác (đúng hơn).
- bidprice-bot dùng chung technicalPart → cùng thay đổi cho 2 gói đó.

## Quay lui
Revert PR #563.

## Chưa kiểm
- Lượt agent thật với mục "Văn bản HSMT có thể thiếu" trong input.md (agent có sed các dòng được chỉ không).

## PR2 bổ sung (commit 42279d9): mã yêu cầu thiếu chỉ lên web khi đáng
`webMissing`: một mã `missingCodes` chỉ vào notes khi part là engine / alternator / genset VÀ dòng HSMT có số đo (số + đơn vị: kVA, kW, V, Hz, A, vòng/phút, L, lít, dB, °C, mm, kg, bar, %, xi lanh, g/kWh, L/h…; bỏ "mới 100%"). Còn lại chỉ in log bot ("mã yêu cầu code dò thấy, không lên web: …"). Test 351/351.

Đo trên 13 gói có Gợi ý (kết quả trong doc-cache, requirements chuẩn hoá bằng `withCode` như check(); không post):
- Gói có ghi chú "mã yêu cầu thiếu": **trước lọc 10, sau lọc 6** (574589, 581294, 581977, 592658, 592684 cỡ 500 kVA, 604739). Lượt 592684 cỡ 30 kVA: 5 → 0 (cả "bảo hành ≥ 1000 giờ → Đo lường, hiển thị" bị bỏ); 586587, 594596, 603983: → 0.
- Ví dụ còn lại:
  1. IB2600604739 (250 và 1.000 kVA): "Tần số định mức: 50 Hz/60 Hz" và "Nhiệt độ vận hành: 40-70°C" — kết quả không có yêu cầu Tần số / Nhiệt độ môi trường (đáng: thiếu thật).
  2. IB2600592684 500 kVA: "Dung tích dầu bôi trơn: 10,9L", "Dung tích nước làm mát (chỉ động cơ): 7,2L" — số cỡ nhỏ (có thể là của máy 30 kVA đặt trong cùng phần kỹ thuật) → đáng xem tay.
  3. IB2600581294: "Ở 110% tải nhiên liệu tiêu hao ≤ 108,8 L/h" dò thành "Khả năng quá tải" — thật ra là tiêu hao ở 110% tải (nhiễu một nửa).
  Nhiễu còn sót: IB2600592658 "Cao 2465 mm Bộ ắc quy khởi động" → "Hệ thống khởi động" (số là chiều cao).

## Chưa làm (sau khi #562, #563 merge — 615e02c)
- Nhiễu còn sót của mã yêu cầu thiếu trên web: IB2600592658 "Cao 2465 mm Bộ ắc quy khởi động" → "Hệ thống khởi động" (số là chiều cao); IB2600581294 "Ở 110% tải nhiên liệu tiêu hao ≤ 108,8 L/h" → "Khả năng quá tải" (thật là tiêu hao ở 110% tải).
- Gợi ý giá đấu (`bidprice-bot.mjs`: technicalPart cắt 20.000 / 60.000 ký tự) và Phân tích HSMT (genbid-sync.js: ask một lần ≤ 450.000 ký tự, agent đọc input.md > 25.000 token; chapterV 150.000; danh mục hàng hoá 30.000) còn cắt theo ký tự, chưa có chốt chặn đọc / ghi chú cắt.
- `searched` (kho âm web-memo) chưa được thử ở lượt có tra mạng: lượt 592684 mới không tra mạng.
- Worktree wt-read-guard và nhánh read-guard / hsmt-gaps đã xoá (12/11).
