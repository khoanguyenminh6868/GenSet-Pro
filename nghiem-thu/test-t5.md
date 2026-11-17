# Nghiệm thu T5: bot Node vào CI (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/643 (nhánh `test/t5-bot`, worktree `wt-test-t5`). Không tự merge.

## Tệp đã đổi
| Tệp | Đổi gì |
|---|---|
| `bot/genbid-hsmt/sync-pure.js` (mới, 700 dòng) | hàm thuần cắt NGUYÊN VĂN từ `genbid-sync.js` + 4 hàm cắt từ thân hàm khác (dưới) |
| `bot/genbid-hsmt/genbid-sync.js` | 2.667 → ~2.030 dòng; `require("./sync-pure.js")` cùng tên; specsSource / runSync / autoConfigRow / apiBudget gọi hàm tách |
| `bot/genbid-hsmt/ocr-pdf.js` | xuất `garbled, legible, rotatePgm, scanPages, chapterRange, plainOcr, MIN_CHARS`; `scanPages`, `chapterRange` cắt từ ocrFile |
| `bot/test/*.test.mjs` (5 tệp) + `bot/test/snippet.mjs` | test mới (giả trang muasamcong cho script trích) |
| `.github/workflows/test-bot.yml` | job `bot`: node 22, `node --check` mọi .js của kit + `node --test bot/test/*.test.mjs`; không Chrome / Tesseract / npm |
| `suppliers/specs-parts.test.mjs`, `suppliers/selfcheck.test.mjs` | trước cắt chuỗi `genbid-sync.js` theo mốc chữ rồi chạy vm (vỡ khi tách) → nay require `sync-pure.js`; ca test không đổi |
| `CLAUDE.md` (gốc) | bẫy: test bot ở `bot/test/`, không thư mục con trong `bot/genbid-hsmt/`; `sync-pure.js` đi cùng `genbid-sync.js` |

## Điều phối cần chép sang `C:\Projects\GenSet Pro\genbid-hsmt\` (cùng một lúc, sau khi merge)
- `genbid-sync.js`, `sync-pure.js`, `ocr-pdf.js` (thiếu `sync-pure.js` thì `genbid-sync.js` chết ngay khi nạp; `ocr-pdf.js` độc lập nhưng đã đổi).
- KHÔNG chép `bot/test/` (nằm ngoài `bot/genbid-hsmt/`, Backup và Stop hook không xét).
- Không cần restart task "GenBid Bot" (genbid-sync.js / ocr-pdf.js chạy tiến trình mới mỗi lượt). Nên chép lúc không có lượt Sync / specs đang chạy.
- Kiểm sau khi chép: `powershell -File bot\Backup-GenBidBot.ps1 -Check` trong checkout main mới. Lần chạy -Check trên worktree (trước khi chép) liệt kê đúng 3 tệp: `genbid-sync.js`, `ocr-pdf.js`, `sync-pure.js (đã xoá trên máy)` (+ `claude\memory\supplier-db.md`, ngoài phạm vi T5).

## Backup / Stop hook có chấp nhận không
- `sync-pure.js` (tệp phẳng trong `genbid-hsmt\`): CÓ — Backup chép `Get-ChildItem -File` không đệ quy, Stop hook so từng tệp phẳng.
- Thư mục `bot/genbid-hsmt/test/` như brief đề xuất: KHÔNG — `Test-GenBidBotGit.ps1` lấy phía git bằng `git ls-tree -r origin/main -- bot/genbid-hsmt` (đệ quy) còn phía máy bằng `Get-ChildItem -File` (không đệ quy) → mọi tệp trong thư mục con bị báo "(deleted on this PC)" mãi, kể cả khi chép sang máy. Nên test đặt ở `bot/test/` (Backup chỉ map `genbid-hsmt`, `claude\...`; hook chỉ map `bot/genbid-hsmt`, `bot/claude/...`).

## Hàm đã tách + bằng chứng không đổi hành vi
Cắt bằng script theo mốc chữ (không gõ lại regex), mỗi khối là đoạn liền của tệp cũ: `sig`; `isDecisionFile`; `HIST_PREFIX…histTender` (has, GENSET_RE, isGenset, vnTime, histUrl); `POWER_RE…CFG_SKIP_RE` (histPower, histNeedsConfig, configText, setsOf, histConfigOf, histTbmtUrl); `plainVi, chapterV` + `specsPick` (mới, = đoạn chọn tệp trong specsSource, chỉ đổi `(f.files || [])` → `files`); `specsFinish`; `SERVICE_RE, BUY_SET_RE, isServiceTender`; `NOTICE_MAX…partHead` (KEEP, splitSections, technicalOfIII, trimHsmt, compact, headCut, noticeBody, densestCut, partsOf, capFig/capCompare, specTwin, specsMerge, specsEmpty); `askCut, askTrace`; `normTxt…checkResult` (found, nearby, scoreItems, checkSupplier, checkSelfChecks, selfCheckItems). Tách thêm bằng Edit: `feedMerge` (thân runSync, gộp feed + bản sửa đổi), `autoConfigSkip` (autoConfigRow trả "power" / "service" / ""), `apiBudgetOf(budgetText, spendText, at)` (apiBudget, giữ cả try ngoài vòng đọc như cũ).

Lệnh đã chạy (đầu ra thật):
1. `node --check` cả 11 tệp .js của kit: ok.
2. So origin/main (cắt bằng mốc chữ, chạy vm) với `sync-pure.js` mới trên dữ liệu thật — `scratchpad\equiv.js`, 6 phút, KHÔNG có khác biệt:
   `{"specsPick":2944,"chapterV":1499,"compact":1499,"splitSections":1499,"trimHsmt":7495,"densestCut":1499,"partsOf":1499,"headCut":1499,"histConfigOf":1499,"technicalOfIII":1499,"isDecisionFile":3492,"histNeedsConfig":1556,"isGenset":1556,"isServiceTender":1556,"autoConfigSkip":1556,"sig":1556,"histTbmtUrl":1556,"autoConfigSkip+result":1287,"setsOf":1287,"checkResult":1243,"specsFinish1":1243,"specsMerge":1243,"specsFinish2":1243,"feedMerge":800,"apiBudget":1,"askCut":6,"askTrace":6}`
   (1.507 thư mục `genbid-work\specs`, 1.746 tên tệp thật, 1.556 bidhist, 1.287 analysis của doc-cache; feedMerge 800 kịch bản ngẫu nhiên; apiBudget trên sổ + cấu hình thật của máy lúc chạy; old autoConfigSkip = thân cũ với log thay bằng return.)
3. ocr-pdf trước/sau (`scratchpad\equiv-ocr.js`): `{"garbled":29930,"scanPages":1499,"plain":29930,"range":1499}` khớp hết.
4. Lệnh chỉ-đọc của bot, bản chép ở `genbid-test\t5-run\old` (origin/main) và `\new`: `node genbid-sync.js specs-plan --file <specs\K\text.txt> --fake fake-K.json` trên 6 gói dài nhất có phân tích (IB2500057816 251.645 ký tự 2 phần, IB2600562009, IB2500344346, IB2300270603, IB2500320544, IB2600464766): đầu ra GIỐNG TỪNG BYTE (`cmp`).
5. `sig` của `sync-pure.js` = `Merge-GenBidFeed.ps1 -Mode Sigs` (powershell.exe 5.1.26100) trên 3 gói (`genbid-test\t5-run\sig-current.json`): 8956e3cf2c85 / 73cf8d5ec4cd / 76d7f5994218. search-extract.js cũng ra cùng chữ ký (test).
6. `node --test bot/test/*.test.mjs`: 95 ca, 88 đạt, 7 todo, ~1,2 s; chạy cả TZ=UTC / Asia/Ho_Chi_Minh / America/Los_Angeles. `node --test suppliers/*.test.mjs`: 776 ca, 0 lỗi.
7. CI PR #643: job `bot` XANH (10 s), `suppliers` xanh (31 s, gồm 2 test đổi sang require), `server` xanh; `app` đang chạy lúc ghi (không liên quan).

## Hàm chưa tách + lý do
- `readNotice`, `fetchFiles`, `searchTenders`, `histList`, `historyRound`, `specsSource` (phần tải), `specsRound`, `runSync` (phần còn lại), `bidders`, `bcdgStep` wrapper…: điều khiển trình duyệt / VNeGP Agent / web.
- `histFileText`, `specsFileText`, `fileText`, `ocrText`, `wordText`, `xlsxText`, `archiveText`, `ocrHsmt`, `specsOcr`: gọi tar.exe, UnRAR, Word COM, pdftotext, Tesseract.
- `prepOne`, `scratchDocs`, `prepSupplier`, `supplierShortlist`, `wantedPower`, `supplierFits`, `specRowsFor`: thuần một phần nhưng đan với đọc web/tệp trong cùng hàm; `wantedPower/supplierFits/specRowsFor/supplierShortlist` tách được ở lượt sau (nhỏ, chưa làm để giữ PR gọn).
- `autoConfigRow` (đọc/ghi `.genbid-auto.json`), `noteApiSpend`, `switchToPlan` (ghi sổ, đổi biến môi trường), `askOnce`, `askGemini`, `claudeExe`: tác dụng phụ.
- `ocrFile`: Poppler + Tesseract. `bcdg-reason.js` / `bcdg-step.js` vốn đã là module, đã có 46 ca ở `suppliers/bcdg.test.mjs` (chạy trong job `suppliers`), không thêm.
- `files-extract.js`, `bidders-ids.js`, `bookmarklet.js`: chưa test (ngoài danh sách brief).

## Ca `todo` (lỗi thấy, không sửa) — số đo
1. **'Thuê' có dấu không là gói dịch vụ** (`SERVICE_RE \bthu[êe]\b`: `\b` của JS không coi 'ê' là chữ). doc-cache bidhist: 88/111 tên gói có "thuê" bị coi là mua máy (IB2200033737, IB2200068050…) → gói thuê vẫn tự Gợi ý cấu hình, trái quy tắc 12/11.
2. **'MPĐ' có dấu không là gói máy phát** (`GENSET_RE \bmp[đd]\b`). bidhist 1 gói có MPĐ, được nhận nhờ chữ khác; gói chỉ ghi MPĐ thì Sync/lịch sử bỏ (không đo được số gói bị bỏ vì chúng không vào bidhist).
3. **Tệp Chương V/YCKT có chữ 'HSMT' bị coi là HSMT cả bộ** (specsPick). genbid-work\specs: 102/1.472 gói có tên như vậy, 25 gói chọn thêm tệp HSMT cả bộ hoặc "Điều kiện cụ thể" (IB2200008717, IB2200062524, IB2200091251, IB2300011564); có webform thì tệp YCKT đó bị loại hẳn. (2 ca todo)
4. **bidders-extract.js không đọc hàng chào mẫu BD.CG.02.0192** (dsHhKq[].dsHH, `lableGood`): ghi chú "Hàng chào" của nhà thầu trúng trống. Chưa đo (doc-cache không có bidders).
5. **Sổ chi API: một dòng 'null' làm bỏ mọi dòng sau** (apiBudget cũ, giữ nguyên): chi bị tính thiếu. Sổ hiện tại không có dòng như vậy (đọc thật lúc so).
6. **garbled() không bắt ví dụ trong chú thích '3456ÿ89ÿ ÿ'** (NFD tách ÿ thành y + dấu). Chưa đo (không có PDF gốc).

Ca "khoá hành vi" (ghi trong tên ca): IB2200008717 hôm nay đọc 3 tệp; `scoreItems([])` = 0 điểm nhưng "pass".

## Số đo "hàm xuất ra chưa test nào nhắc tới" (đếm tên trong `suppliers/*.test.mjs` + `bot/test/*.test.mjs`, bỏ hằng chữ hoa; `genbid-test\t5-run\count-names.js`)
- Trước (origin/main): kit xuất 9 hàm (bcdg-reason, bcdg-step, ocr-pdf), chưa nhắc 2 (`failDoc`, `ocrFile`); `genbid-sync.js` không xuất gì (7 hàm được test bằng cách cắt chuỗi).
- Sau: xuất 73 hàm, chưa nhắc 25 — phần lớn là hàm phụ được phủ gián tiếp qua hàm gọi chúng (capFig/capCovers/specTwin/sameItems qua specsMerge; normTxt/numsOf/nearby qua found/checkResult; lineOf/linesIn qua headCut/partsOf; vnTime qua histTender) + `ocrFile`, `failDoc`.

## Mẫu đối chiếu với nguồn
1. IB2400268027 phần 1: dòng hàng `{qty 387, code EPS-FA12KVA, maker Excel Power, origin China, unitPrice 89560244, unit "Tổ máy"}` và 4 nhà thầu (Việt Nhật trúng 34.659.814.428, venture "LIÊN DANH VN") = `genbid-work\doc-cache\bidhist.json` docs.IB2400268027 (bot đọc trang thật 09/11).
2. Trường lạ `reqLabel` = "G7" = `genbid-bot-logs\history-goods-audit.tsv` (IB2400166974, 09/11).
3. Chữ ký 8956e3cf2c85 = đầu ra `Merge-GenBidFeed.ps1 -Mode Sigs` trên `genbid-test\t5-run\sig-current.json`.

## Rủi ro còn lại, quay lui
- Chép thiếu `sync-pure.js` → mọi lượt `genbid-sync.js` lỗi "Cannot find module". Quay lui: chép lại 3 tệp từ commit trước PR (`git show 8dc14822:bot/genbid-hsmt/<tệp>`).
- Đầu vào trang muasamcong trong test là dựng lại theo trường mã đọc (không có JSON trang thô trong doc-cache); kỳ vọng lấy từ bản bot đã lưu. Nếu muasamcong đổi mẫu thì test không biết — kiểm mẫu (audit) của history-extract vẫn là lưới chính.
- `node --check` kiểm cả tệp snippet `await (async…)` — qua được trên Node 20/22.

## Chưa kiểm được
- Chạy Sync / specs thật bằng bản mới (cần trình duyệt, web thật): chỉ chạy `specs-plan` chỉ-đọc.
- pwsh 7 (CI của T6): ConvertFrom-Json của pwsh đổi chuỗi ISO thành DateTime, có thể làm `Sig` khác — T6 nên kiểm bằng chữ ký ở test `sync-rules.test.mjs`.

## Cần ghi nhớ
- Bẫy: thư mục con trong `bot/genbid-hsmt/` làm Stop hook chặn mãi (đã ghi CLAUDE.md gốc).
- Các lỗi todo 1–3 đáng sửa (ảnh hưởng chuỗi tự động / specs); cần Khoa / điều phối quyết.
