# Nghiệm thu: bớt vòng lãng phí của agent "Gợi ý cấu hình" (agent-waste)

Nhánh `agent-waste`, worktree `C:\Projects\GenSet Pro\wt-agent-waste`, rebase origin/main (sau #556). PR nháp, chưa merge. Không chạy agent thật, không post. Không đổi `check()`, trạng thái, quy tắc nguồn, không đụng `candidates()`.

## Nguyên nhân từng chỗ (trích log `%TEMP%\genbid-config-*.log`)

1. **Read catalog.md bị từ chối rồi đọc lại.** Công cụ Read từ chối tệp/đoạn > 25.000 token: `File content (29666 tokens) exceeds maximum allowed tokens (25000)` (581977, catalog.md off=216 lim=520), `(37081 tokens)` (594596-1, off=910 lim=630), `(32783 tokens)` (594596-2, off=250 lim=430). catalog.md 99–147 nghìn ký tự (≈ 50–75 nghìn token) nên agent tự đoán offset/limit và đoán sai. Cùng nguyên nhân, **input.md bị cắt im lặng**: 594596-1/-2 Read input.md (53 nghìn ký tự, ~26 nghìn token) không báo lỗi nhưng dừng ở dòng 644 ("3. Các yêu cầu khác: … dịch vụ sau bán hàng hợp lý nhằm"), agent phải đọc thêm `input.md@645`.
2. **prompt.md đọc 2 lần.** Lệnh đầu của 4/6 lượt là `ls -la; cat prompt.md` (prompt.md ~30 KB): `<persisted-output> Output too large (29.8KB). Full output saved to: …tool-results\…txt  Preview (first 2KB)` → chỉ thấy 2 KB, rồi `Read prompt.md` lại toàn bộ. 592684-1: `cat prompt.md && wc -c *` lỗi exit 1 rồi Read prompt.md@40. Nguyên nhân gốc: tin nhắn đầu chỉ nói "Đọc prompt.md…", agent chọn `cat`.
3. **grep controllers.md nhiều lần.** 581977: 10 lệnh grep/sed trên controllers.md, mỗi lệnh một nhóm chức năng bằng từ tiếng Anh tự nghĩ (`event|record|log|over ?speed|…`, rồi `china|zhengzhou|event log|…`, rồi `Can measure and display|Accumulated running hours|…`); 586587: 5 lệnh (`overload|over voltage|under voltage|phase|…`). Đây đúng là việc `hintFor` của check đã làm bằng `CTL_WORDS` (từ Việt của HSMT → từ khoá Anh của datasheet) — nhưng chỉ chạy SAU khi agent viết result.
4. **Sửa script dựng result.json nhiều vòng.** Agent luôn tự viết một script 20–28 nghìn ký tự rồi chạy `check --dir .`. Vòng thêm do: (a) **không có python**: 586587 viết `build.py` → `Python was not found` → thử chuyển bằng sed → viết lại `build.js` 21 nghìn ký tự; 594596-1 cũng gặp `Python was not found`; (b) **thư mục tạm ngoài thư mục lượt**: 592684-2 ghi vào `%TEMP%\genbid-build-IB2600592684\build.mjs` — trùng tệp của lượt 30/10 (`Write` lỗi "File has not been read yet"), phải tạo thư mục khác và viết lại 27,6 nghìn ký tự; 594596-1/-2 (hai cỡ chạy song song) cùng dùng `%TEMP%\genbid-scripts-IB2600594596\`; (c) **thông báo check cụt**: `#1 Dung tích xy lanh: số 11.05`, `#5 Công suất liên tục (Prime): số 500` (592684-2 sửa 4 vòng rồi bỏ cuộc, ghi unclear), `#1 Kiểu động cơ: câu trích nguồn`, `factSrc không phải dòng ghi thông số của model này` — check đã in mọi lỗi một lần, nhưng không nói sửa thế nào và câu trích có những số nào.

## Cách sửa (theo nguyên nhân)

1. `writeForRead(dir, name, text)`: luôn ghi tệp nguyên (code, grep, findPrep vẫn dùng `catalog.md` / `input.md`); khi > `READ_MAX` = 30.000 ký tự thì ghi thêm `<tên>-1.md, -2.md…` cắt tại `## ` rồi `### ` rồi dòng (`splitForRead`; ghép lại đúng nguyên văn). Đo được ≈ 2 ký tự/token (1,5 lúc xấu nhất) → mỗi phần ≤ 20.000 token. Áp cho catalog.md, input.md, ctl-lookup.md. `read-order.json` ghi thứ tự đọc.
2. `agentInput(dir)`: tin nhắn đầu của agent = nguyên văn prompt.md + "không cần mở lại" + danh sách tệp phải Read theo thứ tự (mỗi tệp trọn một lần, không offset/limit) + chỗ để script (`./scripts`, node, không python). Thư mục cũ không có read-order.json → tin nhắn cũ. prompt.md vẫn được ghi (kiểm, lượt khác dùng).
3. `ctl-lookup.md`: `ctlLineFor` tách nguyên văn từ `hintFor` (cùng lọc dòng ≤ 240 ký tự, bỏ thông số của chính module, cùng thứ tự từ khoá; `hintFor` gọi lại nó — hành vi không đổi). `ctlLookupMd`: các mục `CTL_WORDS` mà chữ Việt có trên một dòng phần kỹ thuật HSMT (F1, F2…, kèm dòng HSMT đầu tiên) × bộ điều khiển có datasheet trong catalog.md (danh sách `ctls`, ≤ 12, như mục "Thông số bộ điều khiển") → `{ supplierId, n, line }` của dòng khớp, hoặc "không thấy dòng nào: F…". Không viết phép khớp mới. Prompt: đọc dòng, tự kết luận; chỉ grep controllers.md cho chức năng không thấy / dòng chưa đủ.
4. `fixNotes` in sau danh sách lỗi của `check --dir .`: "CÁCH SỬA" một dòng cho mỗi loại lỗi có mặt (số, cột công suất, câu trích nguồn / HSMT, factSrc, nguồn bộ phận, model, hãng, câu trích web) + với lỗi "số …" thì in câu trích và các số của nó. Tin nhắn đầu: script trong `./scripts`, chạy bằng node. Không làm khung result sẵn: yêu cầu do agent đọc từ HSMT (chỉ có sẵn khi Gợi ý lại — đã có requirements.json), code điền trước sẽ đổi thông tin agent dựa vào.

## Tham chiếu "catalog.md" đã rà

- `prep`: catalog.md vẫn ghi nguyên (+ phần); `models.json`, `controllers.md`, `suppliers.json`, `meta.json` không đổi.
- `findPrep` (đọc lại catalog.md, cắt ở "# Nhà cung cấp trong hệ thống" rồi ghi lại): dùng tệp nguyên → đúng; phần catalog-N.md cũ nằm lại trong thư mục Tìm NCC nhưng FIND_INPUT / find-prompt.md chỉ nói catalog.md → không ảnh hưởng.
- Lượt "kiểm cấu hình Tìm NCC" (`check-prompt.md`, ghi catalog.md riêng): không đổi (ngoài phạm vi; tệp này có thể cũng vượt giới hạn Read — chưa đo).
- `check()` / `check --dir .` / `checkDir`: không đọc catalog.md; src/factSrc là dòng của bản ghi NCC, phần cắt chép y nguyên dòng nên `line` lấy từ catalog-N.md vẫn khớp.
- `savePages`, `keepFound`, `restore-web`, web-memo `negativesMd`: không đọc catalog.md (mục "Đã tra trên mạng…" nằm trong catalog.md và do đó trong một phần).
- config-prompt.md: các câu "exactly as in catalog.md", "catalog.md lists only…" vẫn đúng (phần là catalog.md cắt nguyên văn; prompt nói rõ).

## Số đo (không agent)

Kích thước dựng lại trên 14 cỡ của 12 gói trong doc-cache (supplier.json, công suất của configmatch; chữ HSMT thay bằng câu trích yêu cầu của configmatch — xấp xỉ, nên hints / ctl-lookup là ước lượng):

| Gói (cỡ) | catalog.md ký tự | số phần | phần lớn nhất | ctl-lookup.md |
|---|---|---|---|---|
| IB2600574589 (400 kVA) | 98.856 | 4 | 29.044 | 9.383 |
| IB2600581294 (500) | 102.477 | 5 | 23.598 | 6.364 |
| IB2600581977 (313) | 146.201 | 7 | 28.372 | 14.378 |
| IB2600586587 (160) | 145.860 | 7 | 28.130 | 18.095 |
| IB2600592658 (500) | 134.046 | 6 | 27.030 | 7.964 |
| IB2600592684 (30) | 105.372 | 5 | 25.924 | 5.744 |
| IB2600592684 (500) | 135.547 | 6 | 28.624 | 13.279 |
| IB2600594596 (300) | 143.556 | 7 | 28.656 | 14.948 |
| IB2600594596 (400) | 101.256 | 5 | 26.634 | 12.135 |
| IB2600595853 (500) | 137.331 | 6 | 28.624 | 8.383 |
| IB2600599817 (500) | 109.433 | 5 | 28.335 | 0 (không chức năng BĐK) |
| IB2600601812 (500) | 131.067 | 7 | 29.228 | 18.995 |
| IB2600602880 (150) | 116.259 | 6 | 23.635 | 23.733 |
| IB2600603983 (750) | 144.739 | 6 | 29.871 | 19.754 |

Trước: catalog.md một tệp 99–146 nghìn ký tự (≈ 50–73 nghìn token), agent tự cắt offset; sau: mọi phần ≤ 29.871 ký tự (≈ 15 nghìn token, < 25 nghìn cả khi 1,2 ký tự/token). input.md (log): 22–53 nghìn ký tự → 1–2 phần. Bản đầu của ctl-lookup (in dòng 2 lần, mọi BĐK có datasheet) 14–60 nghìn ký tự, 1–3 phần → đã thu gọn còn 6–24 nghìn, 1 phần.

Ước lượng vòng / tiền bỏ được trên 6 log (`waste.cjs`: tiền của đúng lượt hội thoại chứa lệnh đó theo usage của log, giá Opus 5.5; là cận trên vì lượt đó còn chứa suy nghĩ / đầu ra cần thiết):

| Lượt | Read bị từ chối / cắt im lặng | prompt.md 2 lần | grep controllers.md | vòng script / check | Ước bỏ được* |
|---|---|---|---|---|---|
| 581977 | 1 vòng / 0,08 | 0 | 10 / 0,46 | 5 / 0,31 | ≈ 0,50 |
| 586587 | 0 | 2 / 0,02 | 5 / 0,22 | 6 / 0,37 (python) | ≈ 0,38 |
| 592684-1 | 0 | 2 / 0,07 | 3 / 0,20 | 3 / 0,26 | ≈ 0,26 |
| 592684-2 | 0 | 0 | 5 / 0,27 | 7 / 0,34 (trùng thư mục) | ≈ 0,38 |
| 594596-1 | 2 / 0,26 | 2 / 0,02 | 0 | 4 / 0,27 | ≈ 0,42 |
| 594596-2 | 2 / 0,16 | 2 / 0,02 | 2 / 0,07 | 5 / 0,28 | ≈ 0,38 |

\* Công thức: Read bị từ chối + prompt 2 lần: bỏ hết; grep controllers.md: bỏ một nửa (ctl-lookup chỉ thay phần dò bằng từ khoá; chức năng không thấy vẫn phải grep); script: bỏ (n − 2)/n (vẫn cần 1 lần viết + 1 lần check). Trung bình ≈ **0,39 USD/lượt (~15% của 2,57)** và ≈ 8–12 lượt hội thoại/lượt — **ước lượng, cận trên**. Trừ đi: ctl-lookup.md thêm 6–24 nghìn ký tự đọc một lần (≈ 3–12 nghìn token ≈ 0,02–0,06 USD ghi + đọc lại); prompt trong tin nhắn không bớt token (vẫn đọc 1 lần), chỉ bớt vòng.

## Tệp đổi

- `suppliers/config-bot.mjs`: `ctlLineFor`, `ctlLookupMd`, `READ_MAX`, `splitForRead`, `writeForRead`, `agentInput`, `fixNotes`; `hintFor` gọi `ctlLineFor`; `catalogMd` trả thêm `ctlLookup` khi có `opts.hsmtText`; `prep` ghi input.md / catalog.md / ctl-lookup.md qua `writeForRead` + `read-order.json`; `answer()` dùng `agentInput(dir)`; CLI `check` in `fixNotes`.
- `suppliers/config-prompt.md`: đọc tệp theo danh sách trong tin nhắn; ctl-lookup.md.
- `suppliers/agent-waste.test.mjs` (mới, 6 test).

## Kiểm đã chạy

`node --test` trong suppliers: **329/329** (main 323 sau #556 + 6). `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi.

## Rủi ro

- Agent vẫn có thể Read catalog.md (tệp nguyên) thay cho phần → như cũ, không sai.
- ctl-lookup chỉ dò chữ Việt của CTL_WORDS trên dòng HSMT: chức năng HSMT viết khác chữ thì không có F tương ứng (agent vẫn grep như cũ); "không thấy" có thể khiến agent ghi unclear sớm hơn — prompt nói grep controllers.md cho chức năng không thấy.
- Tin nhắn đầu dài ~30 nghìn ký tự (trước là 1 câu): nếu Claude Code có giới hạn độ dài stdin nào đó thì lượt hỏng — chưa thử thật.
- fixNotes nhận dạng lỗi theo chữ của problems; đổi chữ trong check() sau này thì bảng FIX cần sửa theo (chỉ mất phần gợi ý, không sai kết quả).

## Quay lui

Revert PR. Thư mục lượt cũ không bị ảnh hưởng (agentInput rơi về tin nhắn cũ khi không có read-order.json).

## Chờ lượt thật mới biết

- Agent có đọc đúng các phần theo thứ tự và không Read lại catalog.md / prompt.md không; số lượt hội thoại / chi phí thật.
- ctl-lookup có làm giảm grep controllers.md thật không, và có làm giảm / tăng "chưa rõ" của chức năng BĐK.
- CÁCH SỬA có làm giảm số vòng check không; agent có dùng ./scripts và node ngay từ đầu không.

## Bổ sung sau merge #559 (chỉ đo)

### Lượt kiểm Tìm NCC (`checkNewConfigs`, check-prompt.md)
- catalog.md của nó dựng bằng cùng `catalogMd` (30 ứng viên, `focus` = động cơ của cấu hình Tìm NCC), ghi thẳng một tệp, KHÔNG qua `writeForRead`. 4 gói có findmatch: IB2600581294, IB2600581977, IB2600592684, IB2600594596. Kích thước ước theo số đo cùng hàm ở trên (cùng cỡ, khác `focus`): 102–146 nghìn ký tự ≈ 50–73 nghìn token → **vượt giới hạn Read 25.000 token** nếu đọc trọn (ước lượng, chưa dựng lại đúng `focus`).
- Log thật duy nhất còn lại (`genbid-findcheck-IB2600594596.log`, 06/11, 12 lượt, 0,73 USD): agent KHÔNG dùng Read với catalog.md mà `cat catalog.md | head -c 12000`, `tail -c +12000 … | grep`, `sed -n 315,334p` → không có lần bị từ chối hay bị cắt trong log đó. Rủi ro còn: `cat prompt.md` cùng `ls` ở lệnh đầu (prompt check ngắn hơn, lần đó không bị cắt); script để ở `%TEMP%\fillchk_scripts` ngoài thư mục lượt (cùng loại nguyên nhân #4). Chưa sửa (ngoài phạm vi #559).

### input.md bị cắt im lặng — lượt nào KHÔNG thấy phần cuối
Cách đo: số dòng lớn nhất agent thấy qua Read/sed so với số dòng tệp (chỉ biết khi agent tự chạy `wc -l`).
- **IB2600592684 (cả hai cỡ, 04/11 22:40–22:50): KHÔNG thấy dòng 322–446 / 446 (≈ 28% tệp).** Read trả dòng 1–321, dừng giữa bảng đánh giá ("Phương thức bảo hành: + Nhà thầu có đầy đủ kế hoạch cung cấp dịch vụ bảo hành, bảo trì: thời gian, quy trình, địa chỉ, điện thoại liên hệ trong thời gian bảo hành."). Lượt -2 có chạy `wc -l` (446) nhưng chỉ `sed -n 322,447p input.md | grep -i "yêu cầu khác\|^##"` (không ra gì) — không đọc nội dung. Lượt -1 chỉ grep tiêu đề `^##`. Nội dung dòng 322–446 KHÔNG có trong log (thư mục lượt đã xoá, hsmt không có bản cục bộ) → không nói được chắc là yêu cầu nào; dòng 275–321 là "1. Đặc tính, thông số kỹ thuật…", "2. Giải pháp kỹ thuật…", "3. Bảo hành" của bảng tiêu chuẩn đánh giá, nên phần mất nhiều khả năng là phần còn lại của bảng đánh giá (sau bảo hành) và các mục sau nó — có thể có yêu cầu kỹ thuật/chứng từ (vd. CO/CQ, uy tín, tiến độ). Kết quả đang hiển thị của IB2600592684 (500 kVA và 30 kVA) **có thể thiếu yêu cầu**; muốn chắc phải xem lại phần kỹ thuật HSMT từ dòng đó (hoặc Gợi ý lại sau #559).
- IB2600594596-1 / -2 (12/11): Read dừng ở dòng 644/826 nhưng agent đọc tiếp `input.md@645` (645–826) → đã thấy hết.
- IB2600586587 (11/11): Read 1–391; dòng cuối là "Phần 1. THỦ TỤC ĐẤU THẦU" của quyết định phê duyệt — giống điểm kết thúc tự nhiên của phần kỹ thuật, không có `wc` nên không chắc 100%.
- IB2600581977 (04/11): Read 1–707, dòng cuối "Mục 4. Tiêu chuẩn đánh giá về tài chính … Bước 3. Xếp hạng nhà thầu"; không có `wc -l`; lệnh `cat input.md | head -c 60000` đầu lượt trả 56,3 KB (byte, chữ Việt 1–3 byte/ký tự) nên không suy được số dòng → **không xác định được** có mất phần cuối hay không; phần thấy cuối đã là tiêu chuẩn tài chính (sau phần kỹ thuật).
