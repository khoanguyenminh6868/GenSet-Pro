# Nghiệm thu: Gợi ý giá đấu và Phân tích HSMT — không cắt im lặng (cut-guard, 12/11)

PR1 nháp #565 (https://github.com/khoanguyenminh6868/GenSet-Pro/pull/565). Worktree `C:\Projects\GenSet Pro\wt-cut-guard`, nhánh `cut-guard` (rebase trên ce04441 #564). Hai PR nháp độc lập:
PR1 (suppliers/, Gợi ý giá) và PR2 (bot/genbid-hsmt/genbid-sync.js, P1–P3). Không chạy agent thật, không post.

## 1. Bảng rà soát + số đo (bước 1)

Cách đo (chỉ đọc): script trong scratchpad của phiên (`m-bp.mjs`, `m-bp2.mjs`, `m-ana.mjs`, `m-info.mjs`, `m-specs.cjs`;
bản chép các hàm `chapterV / trimHsmt / compact / splitSections` của genbid-sync.js), GET `/api/requests?kind=docs…`,
doc-cache (analysis, bidhist), 1.499 `genbid-work\specs\*\text.txt`, log bot `genbid-bot-logs\*`, log `%TEMP%\genbid-bidprice-*.log`.
`prep` của bidprice-bot chạy thật vào `%TEMP%\cutguard-bp*` (chỉ GET, không agent).

### A. Gợi ý giá đấu (12 gói có bidprice, 15 lượt cỡ máy)

| # | Chỗ | Giới hạn | Lý do có | Ghi chú cho agent / người dùng (trước) | Đo | Sửa (PR1) |
|---|---|---|---|---|---|---|
| A1 | `bidprice-bot.mjs:45` cfgText = `technicalPart().slice(0, 20000)` (chỉ khi analysis không có technicalSpecs) → `profileOf` / `brandSyncOf` chọn gói cũ | 20.000 | gọn | Không | 11/12 có technicalSpecs; gói còn lại tp 15.467 → **chưa gặp** | bỏ cắt (code đọc bằng regex) |
| A2 | `:79` input.md "Phần kỹ thuật" `technicalPart().slice(0, 60000)` | 60.000 | token | Không | **1/12**: IB2600574589 tp 63.154, phần bỏ 3.154 ký tự = dòng 1031–1088/1088, **8 chỗ thông số** (giữ 39) | `fitPart`: cửa sổ 60.000 nhiều thông số nhất, trọn dòng; dòng "(đã lược: dòng a–b / N …)" trong input.md; ghi chú kết quả khi phần lược có thông số |
| A3 | input.md, samples.md cho agent (Read ≤ 25.000 token) | Read | — | Không; agent `--output-format json` → không có dấu vết đọc | samples.md **52.410–271.057 ký tự ở 12/12** (≈ 26k–135k token); input.md > 30.000 ở 7/12. Kết quả đang hiển thị: 0 gói "agent không xếp mức", 0 câu trích sai — nhưng mức "khác" không có câu trích để kiểm, không chứng minh đã đọc | writeForRead + read-order.json + agentInput + stream-json + guardRun |
| A4 | `runClaude` / `attemptOne` chỉ xét result.json có tồn tại | 25 phút | — | Không: bản dở nhận như đủ | 2 log JSON trên máy: success / end_turn; 6 log cũ dạng chữ → **chưa gặp** | `stoppedNote`: có kết quả cũ → giữ + ghi chú; không có → bản dở + ghi chú |
| A5 | samples.md: `keyText(config.text, 3000)` | 3.000 (+ dòng chính tới 6.000) | token | **Có** ("…") | — | để nguyên (điều phối) |
| A6 | specs `genbid-sync.js:966` `chapterV().slice(0, 150000)` (nuôi analysis basis specs + bidhist config.text → samples) | 150.000 | 1 lần gọi | Không | 1.499 text: **13 chạm, 7 có thông số ở phần bỏ** (giữ/bỏ): IB2400101857 11/37, IB2500310648 74/22, IB2200015701 6/14, IB2400446772 18/14, IB2500057816 19/12, IB2500240658 8/8, IB2500360434 2/3; 6 gói còn lại bỏ 0 | PR2 (P3) |

### B. Phân tích HSMT (34 phân tích đầy đủ + 1.252 specs; 16 notice trên web)

| # | Chỗ | Giới hạn | Ghi chú (trước) | Đo | Sửa |
|---|---|---|---|---|---|
| B1 | `askOnce` (một tin nhắn, không công cụ) | thật: `modelUsage` của lượt Opus: contextWindow **1.000.000**, maxOutputTokens **128.000**; bot: ≤ 450.000 ký tự | JSON hỏng → "không phải JSON hợp lệ" → agent; **không xét stop_reason / terminal_reason / num_turns** | input ≤ 450.000 ≈ ≤ 225k token: vừa; JSON kết quả lớn nhất 33.027 ký tự ≈ 17k token. Log: 0 lần max_tokens, 1 JSON hỏng (Đối chiếu TLKT 574589, 27/10) → **chưa gặp** | PR2 (P1) |
| B2 | `:1640` notice.info `slice(0, 8000)` | 8.000 | **Có** ("phần sau đã cắt bớt") | **1/16**: IB2600602880 (11.276): phần cắt = danh mục hàng hoá mục 2–4 (có đủ trong goods) + bảo hành 24 tháng, khắc phục 3 ngày, **thanh toán 100%/30 ngày (chỉ có ở đây)** + chân trang muasamcong. Kết quả đang hiển thị do hsmt-worker làm, đủ → không sai | PR2 (P2) |
| B3 | goods `:1647` 30.000, `:817` 30.000 | 30.000 | Không | chưa gặp (lớn nhất 9.432) | PR2 (P2) |
| B4 | webform `:265` 50.000 | 50.000 | Không (Phân tích) | chưa gặp (lớn nhất 15.181) | PR2 (P2) |
| B5 | trimHsmt bỏ chương mẫu | — | **Có** ("Phần đã bỏ") | 9/34 gói | để nguyên (chủ ý) |
| B6 | agent HSMT (thư mục AGENT), Invoke-Agent `--output-format json`, nhiều thư mục / lượt | Read 25.000 token | Không | 6 lượt Phân tích qua agent 27–31/10, lý do đều scan. input.md dựng lại: **12/34 > 50.000 ký tự**; IB2600575567 **558.578** (> 450k → nay đi agent; bản đang hiển thị làm 20/10, ghi "Hồ sơ quá dài nên phần cuối đã bị cắt") | **chưa làm** (P4, điều phối: tần suất thấp, cần restart bot) |
| B7 | read-guard trên log | — | — | **Không có log stream-json nào** của Phân tích HSMT / Gợi ý giá trên máy → không đo được lượt nào đọc thiếu | — |

Web: notes của bidprice (`bidPriceHtml`, `bidPriceMultiHtml`) và analysis đã hiển thị → không cần đổi web. Cờ `readIncomplete` (web chưa dùng, như Gợi ý cấu hình).

## 2. PR1 — suppliers/ (Gợi ý giá đấu)

### Tệp đổi
- `suppliers/bidprice-bot.mjs`: `TP_MAX` 60.000 + `fitPart`; cfgText không cắt; input.md / samples.md qua `writeForRead`, `read-order.json`; `cutNotes` trong samples.json → `check()` thêm sau notes của agent; `runClaude`: `stream-json --verbose`, tin nhắn đầu = `agentInput(dir, "chỉ ghi result.json", { scripts: false })`, maxBuffer 256 MB; `attemptOne`: `guardRun` + `stoppedNote` (quá 25 phút từ `ETIMEDOUT`), log bot "CHỐT ĐỌC — …", lượt dừng có kết quả cũ → giữ kết quả cũ (từng cỡ máy) + ghi chú; `answer()` đọc bidprice cũ (GET).
- `suppliers/config-bot.mjs`: `densest(…, max = MAX_TP)` (Gợi ý cấu hình không đổi: mặc định cũ); `fitPart(text, max)` (mới); `capNote` export; `agentInput(dir, task, { scripts = true })`: dòng "x-N.md là x.md" tổng quát cho mọi tệp chia, dòng hsmt.txt chỉ khi có hsmt.txt, dòng scripts/ chỉ khi scripts. KHÔNG đụng engineMins / powerMins / candidates() / dải công suất.
- `suppliers/read-guard.mjs`: `readNotes` nhận `risk`, `again` (mặc định như cũ).
- `suppliers/cut-guard.test.mjs` (mới, 7 test).

Ghi chú trên web (≤ 300 ký tự, chỉ khi có chuyện):
- "Phần kỹ thuật HSMT dài hơn 60.000 ký tự: agent không được đọc dòng 1031–1088 / 1088 của phần đó (8 chỗ thông số)." (IB2600574589, prep thật)
- "Agent chưa đọc hết samples.md (máy 500 kVA) (thiếu dòng a–b / n): mức giống/gần của gói cũ có thể sai — bấm Gợi ý giá đấu lại."
- "Lượt Gợi ý giá đấu (máy …) lúc … UTC bị dừng giữa chừng (…); đang hiển thị kết quả lần trước — bấm Gợi ý giá đấu lại."

### Kiểm đã chạy
- `node --test` trong suppliers/: **373/373** (sau rebase trên #564; 351 + 7 mới trước rebase = 358/358).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi.
- prep thật (GET) IB2600574589: read-order `input-1..4.md, samples-1..3.md` (readSize mỗi phần ≤ 29.959), ghép các phần = tệp nguyên (true), cutNotes như trên, dòng "(đã lược: dòng 1031–1088 / 1088 của phần này — giữ 59.977 ký tự …; phần lược có 8 chỗ thông số)" trong input.md. IB2600599817: samples-1..10.md (271.057 ký tự), không cutNotes. Tin nhắn đầu: không có scripts/, không có dòng hsmt.txt.

### Rủi ro
- **Chi phí**: agent nay đọc trọn samples.md: IB2600599817 (80 gói cũ, 271 nghìn ký tự ≈ 135k token) tốn hơn trước nếu trước agent bỏ phần lớn. Ước ≈ +0,3–0,7 USD ở các gói samples lớn (ghi đệm 5 USD/M). Nếu quá đắt: rút `MAX` ứng viên của web/bidprice.js (không thuộc PR này).
- Ghi chú "chưa đọc hết samples.md" có thể hiện ở lượt đầu nếu agent vẫn đọc bằng Grep — đúng là kết quả có thể sai.
- Lượt dừng: giữ kết quả cũ theo nhãn cỡ máy; cỡ đổi nhãn → coi như không có kết quả cũ (bản dở + ghi chú).
- Không cần restart bot: config-bot.mjs `run` khởi bidprice-bot.mjs là tiến trình node mới mỗi lượt từ checkout chính.

### Quay lui
Revert PR1. Kết quả đã đăng chỉ có thêm notes / `readIncomplete`.

### Chưa kiểm
- Lượt agent thật (stream-json, Read theo phần) — chỉ chạy được sau merge.
- `costOf` trên stream-json của bidprice (cùng hàm Gợi ý cấu hình đang dùng với stream-json).

## 3. PR2 — bot/genbid-hsmt/genbid-sync.js (P1–P3)

PR nháp #566 (https://github.com/khoanguyenminh6868/GenSet-Pro/pull/566), nhánh `cut-guard-bot`, worktree `C:\Projects\GenSet Pro\wt-cut-guard-bot`, từ origin/main.
Trước khi sửa: md5 `bot/genbid-hsmt/genbid-sync.js` = `genbid-hsmt\genbid-sync.js` = f4c1a8657e6ae5a665dfa247207b407c (khớp). `genbid-hsmt\` KHÔNG bị đụng.

### Tệp đổi (chỉ một)
- `bot/genbid-hsmt/genbid-sync.js` (md5 sau sửa 7136211fb1503c2031537251ac7466de):
  - P1 `askCut(j)` + `askOnce`: `stop_reason === "max_tokens"`, `terminal_reason` ≠ `completed`, hoặc `subtype` ≠ `success` → `{ error: "câu trả lời bị cắt trước khi JSON đóng (…)" }` (có chữ "JSON" nên specsAsk hỏi lại bản ngắn như cũ; Phân tích → agent như cũ). `num_turns > 1` KHÔNG chặn (điều phối, commit 95531a2): mọi lượt ask ghi một dòng `  [ask] num_turns=… stop_reason=… terminal_reason=…` (thêm "— N lượt, kiểm tra" khi > 1) vào log bot; sau vài ngày có số liệu mới quyết chặn.
  - P2 `headCut`, `noticeBody`; hằng `NOTICE_MAX = 20000`, `GOODS_MAX = 30000`, `WEBFORM_MAX = 50000`. prepOne: thông báo bỏ chân trang (từ dòng "Quay trở lại"), giữ 20.000 tại ranh giới dòng + "(dài N ký tự: đã lược dòng a–b / n …)"; danh mục hàng hoá tương tự; chương webform ≥ 49.990 → dòng "phần cuối có thể thiếu". Các ghi chú này → `cuts.json` → `runFinish` thêm vào notes của Phân tích. `specsGoods`: khi không thấy điểm dừng, cắt trọn dòng + dòng "(danh mục dài hơn 30.000 ký tự, phần sau không đọc)". readNotice dùng `WEBFORM_MAX` (giá trị không đổi).
  - P3 `densestCut` (cùng cách densest của config-bot.mjs) + `SPECS_BODY_MAX = 150000`: specsAsk lấy cửa sổ nhiều thông số nhất; prompt có dòng "(đã lược dòng … )"; analysis.notes thêm "Chương V dài hơn 150.000 ký tự: đã lược dòng … (phần lược có k chỗ thông số)." khi k > 0.

### Lệnh chép sang genbid-hsmt (điều phối làm sau khi merge)
```
copy /Y "C:\Projects\GenSet Pro\GenSet-Pro\bot\genbid-hsmt\genbid-sync.js" "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js"
powershell -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Backup-GenBidBot.ps1"
```
(nên giữ bản cũ: `genbid-sync.js.bak-20261112-cutguard`). Không cần restart "GenBid Bot": genbid-sync.js chạy là tiến trình node mới mỗi lượt.

### Kiểm đã chạy (bản chép ở `C:\Projects\GenSet Pro\genbid-test\genbid-sync.js` + `analysis-prompt.md`, tôi tạo hôm nay; không token)
- `node --check` OK.
- `prep --sigs analysis:<gói>|t --out %TEMP%\cutguard-prep --test --dry` (chỉ GET) cho IB2600602880, IB2600594596: chuẩn bị 1/1 mỗi gói. IB2600602880: input.md nay có "Thanh toán 100% giá trị hợp đồng trong vòng 30 ngày" và "Cam kết bảo hành 24 tháng" (trước bị cắt), không còn chân trang ("Quay trở lại", "Tổng đài") ; thông báo 11.276 < 20.000 nên không có cuts.json. IB2600594596: không cắt gì, không cuts.json.
- `askCut` / `askTrace` (bản 95531a2): success/end_turn/completed/1 lượt → "" + dòng [ask]; 2 lượt → "" + dòng [ask] "— 2 lượt, kiểm tra"; max_tokens → bắt; JSON cũ không có các trường → "" + dòng [ask] với "?". prep --test --dry IB2600602880 chạy lại trên bản chép mới ở genbid-test (md5 khớp): 1/1.
- P3 trên text.txt cục bộ (giữ / tổng chỗ thông số, trước → sau): IB2400101857 11 → **33**/48; IB2400446772 18 → **31**/32; IB2200015701 6 → **10**/20; IB2500057816 19 → **20**/31; IB2500360434 2 → **3**/5; IB2500310648 74 → 74/96 (lược dòng 4315–5034, có ghi chú); IB2500240658 8 → 8/16 (ghi chú); IB2200009054, IB2400142415 không ghi chú (phần lược 0 thông số).

### Gói specs nên đọc lại (Khoa quyết; KHÔNG tự chạy)
IB2400101857, IB2500310648, IB2200015701, IB2400446772, IB2500057816, IB2500240658, IB2500360434 (bản đang hiển thị đọc 150.000 ký tự đầu). Muốn đọc lại: xoá mục của chúng khỏi `.genbid-specs.json` rồi lượt specs sau sẽ đọc.

### Rủi ro
- P1: `num_turns > 1` chỉ ghi log (chưa chặn) → một câu trả lời nối tiếp sau max_tokens mà vẫn parse được sẽ CHƯA bị chặn cho tới khi quyết. Xem: `Select-String "[ask]" genbid-bot-logsot-2026-11.log`.
- P2: thông báo dài hơn trước tới 20.000 ký tự (≈ +6.000 token khi thông báo dài; hiện 1/16 vượt 8.000).
- P3: phần đầu chương V (giới thiệu, có khi tên gói/hãng) có thể bị lược khi cửa sổ dời xuống; chỉ dời khi cửa sổ mới nhiều thông số hơn.

### Quay lui
Revert PR2; nếu đã chép sang genbid-hsmt: chép lại bản .bak.

### Chưa làm
- **P4** (agent HSMT đọc input.md > 25.000 token, Invoke-Agent --output-format json, không chốt đọc): theo điều phối chưa làm. Số đo B6: 6 lượt Phân tích qua agent 27–31/10 (đều scan); 12/34 input.md > 50.000 ký tự; IB2600575567 558.578 ký tự sẽ đi agent. Cần stream-json trong GenBid-Bot.ps1 + guardRun lọc theo thư mục + restart bot.
- read-guard trên log Phân tích HSMT / Gợi ý giá: không có log stream-json nào trên máy (B7). Sau PR1, log Gợi ý giá (`%TEMP%\genbid-bidprice-<gói>[-cỡ].log`) là stream-json → `node suppliers/read-guard.mjs <log>` đọc được.

### Chưa kiểm
- Lượt specs / Phân tích thật với bản mới (cần chép sang genbid-hsmt).
- Đường agent của prep với cuts.json (finish) — chỉ kiểm bằng đọc mã.
