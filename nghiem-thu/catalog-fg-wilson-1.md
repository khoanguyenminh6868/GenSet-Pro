# catalog-fg-wilson-1: catalog.js đọc đầu phát FG Wilson và ô ghi HAI hãng đầu phát kèm model riêng

PR draft: xem cuối báo cáo (nhánh `catalog-fg-wilson`, gốc `origin/main` 49713e3b; `web/catalog.js`, `web/CLAUDE.md` và `suppliers/cn` KHÔNG đổi giữa 2a1b6ebd và 49713e3b nên phép đo ở 2a1b6ebd còn đúng).
Đây là đề xuất mở của PR #873 (Khoa duyệt 19/11/2026 "làm"). KHÔNG tự merge.

## Kết luận
- Nguồn đều ghi rõ hãng → KHÔNG có điều gì phải Khoa quyết để làm phần này. FG Wilson lấy thẳng từ ô nguồn, không thêm vào `manufacturing[]`, không đoán từ mã model.
- Danh mục: 59.016 → 59.064 bản ghi (+48 đầu phát, 10 bản ghi đổi `makes`, 0 mất, đảo vai 0 → 0).
- Top 30 (928 gói / 1.093 lượt, đo thật): 1.087 lượt giống hệt; 6 lượt khác, TẤT CẢ do cùng một nguyên nhân (xem dưới), đều là gói HSMT đòi đầu phát Leroy-Somer → đổi đúng hướng.
- Việc ngoài phạm vi, cần phiên khác (không sửa `config-bot.mjs` theo ràng buộc): `altOf` chưa bóc "FG Wilson" (hai từ) nên bản ghi động cơ genlitec n122–141 chưa nối được với đầu phát FGL… (xem "Cần Khoa / điều phối quyết").

## Tệp đã đổi
- `web/catalog.js` (+29 −3): `FG_WILSON`, `ALT_CELL_BRANDS`, `ALT_PREFIX`, `FG_PREFIX`; `makesFor` nhận FG Wilson từ ô hãng riêng ("Alternator Make | FG Wilson") và từ ô model ("FG Wilson FGL70030" qua nhánh `own`); `splitAltCell` tách ô "hãng X / hãng Y" (≥ 2 phần, MỖI phần phải là "hãng + mã", tất cả hoặc không) và phát bản ghi đầu phát riêng cho từng phần, mỗi bản ghi mang đúng hãng đứng cạnh model. FG Wilson cố ý KHÔNG vào `ALT_BRANDS` (nếu vào, tên trang / tiêu đề / HSMT sẽ gán FG Wilson cho mọi đầu phát không ghi hãng).
- `suppliers/alt-fg-wilson.test.mjs` (mới, 6 ca, dòng thật genlitec n122 / n1013, generatordieselchina n114 / n101, ca không đoán).
- `web/CLAUDE.md`: một bẫy mới (thiết kế, cái không đọc, cái còn lại, tên test).
- Không đụng `config-bot.mjs`, `genbid-hsmt\`, web thật, token.

## Quét TOÀN BỘ `suppliers/cn` (trước khi sửa)
Quét mọi chuỗi (không chỉ `specTables`), tệp `dau-vao\catalog-fg-wilson\scan-raw.json` / `scan-all-strings.json` / `scan-rec-before.json`.

**(a) FG Wilson làm hãng đầu phát — chỉ genlitec (28 bảng), nguyên văn nguồn:**
- genlitec n122–n141 (18 bảng): `| Alternator | FG Wilson FGL70030` (và `| Alternator Model | FG Wilson FGL70030`); các model FGL20060, FGL30020… tương tự.
- genlitec n1013–n1022 (10 bảng, PDF datasheet): `| Alternator Make | FG Wilson` + `| Alternator Model: | FGL70030`.
- Trước: n122–141 không cho bản ghi đầu phát (ô "FG Wilson FGL…" không phải mã); n1013–1022 có bản ghi đầu phát FGL… nhưng `makes` rỗng.

**(b) Ô hai hãng kèm model riêng — chỉ generatordieselchina (15 bảng):** n101, 103, 106, 108, 110, 111, 112, 114, 115, 117, 119, 120, 121, 122, 123. Ví dụ nguyên văn: `Stamford UCI274H / Leroy-Somer TAL-A44-M`, `Stamford UCI274ES / Leroy-Somer TAL-A44-E`, `Stamford UCI224F / Leroy-Somer TAL-A44-C`, `Stamford UCI224E / Leroy-Somer TAL-A42-H`, `Stamford S1L2-Y1 / Leroy-Somer TAL-A42-H`, `Stamford S7L1D-J4 / Leroy-Somer LSA 52.3 L12`.
- Trước: cả ô thành một chuỗi, không bản ghi đầu phát hoặc một bản ghi có model dính "/".

**Có dạng gần giống nhưng KHÔNG đọc (liệt kê cho Khoa, "thà thiếu còn hơn sai"):**
| NCC | Dạng | Vì sao bỏ |
|---|---|---|
| depco-power (491 dòng), fdk-energy (390), avs-aggregatebau (13, "LINZ / Mecc Alte oder gleichwertig"), kingway, pramac ("Leroy Somer/Mecc Alte"), senci, stone-power, tecgen-fujian, bspower, acepow-fuan, camda, cps, deman | danh sách hãng KHÔNG kèm model ("Stamford, Marathon, Leroy Somer") | không có model riêng cho từng hãng → không biết model nào của hãng nào |
| genlitec n149–161 | "GENLITEC S274G120 (STAMFORD & LEROY SOMER alternators for options)" | một model, hai hãng tuỳ chọn |
| saudi-diesel n109–121 | một hãng + hai model ("Leroy Somer TAL-A44-M / TAL-A46-C") hoặc "(50 Hz) / (60 Hz)" | một hãng hai model, ngoài đề bài; bản đầu của em từng tạo model rác "TAL-A44-M / TAL-A46-C" từ đây nên đã thu hẹp (xem Lỗi đã sửa) |
| gb-power n1010 "LSA 43.2 L6", n1020 "HCI 444D" | hãng + mã có dấu cách / không hãng | ngoài phạm vi |
| acepow-fuan n127 "UC274D / UCI274D", "S5L1D-C41 / S5L1D-F41", camda n156 "LSA49.3S4/528KW" | hai mã không hãng, hoặc mã + công suất | KHÔNG tách; cách đọc cũ (model còn dấu "/") giữ nguyên, ngoài phạm vi, test không đổi |

## Kiểm chéo toàn bộ (spec-diff) — `dau-vao\catalog-fg-wilson\spec-diff-full.txt`, `spec-diff-tom-tat.md`
Lệnh: `node suppliers/spec-diff.mjs git:2a1b6ebd . --out spec-diff-full.txt --md spec-diff-tom-tat.md`
- Bản ghi 59.016 → 59.064; 10 đổi, 0 mất, 48 thêm, ở 43 bảng của 2 NCC; đảo vai 0 → 0; số tự kiểm không xác nhận được: 0; bảng chưa đọc / các hạng mục "chưa đọc được" giữ nguyên số.
- Theo NCC: generatordieselchina 30 thêm (15 bảng × 2 model); genlitec 18 thêm (n122–141) + 10 đổi `makes` (n1013–1022: "" → FG Wilson).
- Mọi lớp đã mở dòng nguồn (`lop-doi.txt`, từng bảng: nguyên văn ô "Alternator …", bản ghi gốc ↔ nhánh). Lớp không giải thích được: 0.

## Bộ kiểm
- `node --test suppliers/*.test.mjs web/test/*.test.mjs`: **1287/1287** (`test-full.txt`, trước khi rebase lên 49713e3b; sau rebase chạy lại riêng `alt-fg-wilson.test.mjs`: 6/6).
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng" (`quality-check.txt`).
- `node suppliers/row-flags.mjs`: 162 dòng cờ / 21 loại bỏ ở CẢ gốc và nhánh (`row-flags-goc.txt` ↔ `row-flags-nhanh.txt`, chỉ tổng bản ghi đổi) → số cờ không tăng.

## Đo top 30 — 928 gói / 1.093 lượt, `do-gop-rf.mjs`, SPEC_NORM=1, blocked 20 dòng
- Gốc: worktree `wt-cfw-base` = 2a1b6ebd (`dau-vao\catalog-fg-wilson\gop-main.json`, 6.601 s). Nhánh: `wt-fg-wilson` + cn gốc (`gop-nhanh.json`, 7.834 s). `gop-2b.json` KHÔNG dùng: đo ở 3c0a49ff, trước #926 đổi catalog.js; đã đo lại gốc.
- So bằng `all` đa tập (`[khoá dòng, điểm]`) bằng script riêng `cmp-all.mjs` (scratchpad của phiên; kết quả `so-all.txt`). Chú ý: `gopCl3.mjs` báo "1.089 lượt đổi all" là SAI GIẢ vì so `x.all !== y.all` trên mảng (luôn khác tham chiếu); đừng dùng số đó.

| | |
|---|---|
| lượt giống hệt (top, thứ tự, điểm, all, dropped, rowflag) | 1.087 / 1.093 |
| lượt đổi tập top | 4 (IB2300100347, IB2400058421, IB2400389856, IB2400562787) |
| lượt chỉ đổi điểm trong `all` | 2 (IB2300165131, IB2300201430) |
| lượt đổi dropped / rowflag / thiếu hoặc lỗi | 0 / 0 / 0 |
| dòng `all` đổi điểm | 19 dòng khác nhau, TẤT CẢ +80 điểm (816 vs 736, 808 vs 728, 521 vs 441, 331 vs 251 …) |

**Giải thích MỌI lượt đổi:** cả 6 gói HSMT đòi đầu phát Leroy-Somer (grep `text.txt` của từng gói: "Đầu phát: Hiệu LeroySomer" IB2300100347; "Hãng: Leroy Somer" IB2300165131; "Loại TAL A44 C – LEROYSOMER" IB2300201430; "Đầu phát điện LEROYSOMER TAL A4 D" IB2400058421; "Leroy Somer TAL-A44-" IB2400389856; "Hãng sản xuất Leroy Somer" IB2400562787). Các dòng đổi là dòng của rcg-power, kaihua-genset, penlucky, jet-power, sr-genset, long-gen… có đầu phát TALA44C / TALA44E / TALA42H. Bản ghi đầu phát mới từ generatordieselchina (`Stamford UCI224F / Leroy-Somer TAL-A44-C`, `…UCI274ES / Leroy-Somer TAL-A44-E`, `…UCI224E / Leroy-Somer TAL-A42-H`) gắn hãng Leroy-Somer cho model đó trong danh mục, nên dòng khác của NCC khác dùng đúng mã đó nay khớp hãng HSMT đòi (+80). Các dòng +80 chen vào top 30 và đẩy ra dòng đầu phát Stamford UCI (stone-power SC100E6, dingbo XG90GF, sanq-power SQC125 / SQC55, uleengen UC100GF / UW63GF, acepow, fdk-energy, hosem-power) — các dòng ra có mã đầu phát UCI / UC / S1L2 (không phải TAL / LSA); em chưa tra hãng của từng mã đó trong danh mục, chỉ thấy điểm của chúng không đổi (nên chỉ bị đẩy ra do dòng +80 chen vào). Mỗi mã (TAL-A44-C/E, TAL-A42-H) lấy hãng từ ĐÚNG ô nguồn ghi "Leroy-Somer TAL-…", không đoán từ mã.
Chi tiết từng dòng vào / ra / +/−: `dau-vao\catalog-fg-wilson\so-all.txt`.

Lưu ý: kết quả trên là gói thật đo bằng bidhist ngày 19/11; lớp đổi điểm +80 chỉ đúng với gói đòi Leroy-Somer. Không lượt nào trong 6 lượt đổi có dòng FG Wilson / FGL: phần (a) không đổi thứ hạng nào ở 1.093 lượt (vì `altOf` chưa nối, xem mục quyết 1).

## 3 mẫu đối chiếu nguồn
1. genlitec n122, https://www.genlitecpower.com/P900-1-FG-Wilson-900kVA-Diesel-Generator-p.html (Accessed 2026-11-13): `| Alternator | FG Wilson FGL70030` → đầu phát FGL70030, hãng FG Wilson.
2. genlitec n1013, https://www.genlitecpower.com/Uploads/pro/P900-1-FG-Wilson-900kVA-Diesel-Generator-442-file-1.pdf: `| Alternator Make | FG Wilson` + `| Alternator Model: | FGL70030` → hãng FG Wilson gắn cho FGL70030 (trước: makes rỗng).
3. generatordieselchina n114, https://generatordieselchina.com/products/175kw-diesel-generator/ (Accessed 2026-11-13): `| Alternator | Stamford UCI274H / Leroy-Somer TAL-A44-M` → UCI274H (Stamford) + TAL-A44-M (Leroy-Somer); n101 https://generatordieselchina.com/products/2000kw-diesel-generator/: `Stamford S7L1D-J4 / Leroy-Somer LSA 52.3 L12`.
(Đọc từ `suppliers/sources/<id>/<n>.md` trong repo, chưa mở lại URL trực tiếp.)

## Lỗi đã sửa trong lúc làm
- Bản đầu `isCode(ac.replace(ALT_PREFIX,""))` cho MỌI ô → thêm 15 bản ghi ngoài phạm vi (saudi-diesel 12, gồm model rác "TAL-A44-M / TAL-A46-C"; gb-power 2; tecgen-fujian 1). Thu hẹp còn `(altSplit || FG_PREFIX.test(ac))`, đo lại: +48, 10 makes, 0 mất.
- Test phủ định ban đầu sai (đòi 0 bản ghi trong khi cách đọc cũ vốn đã cho model có "/") → sửa để chỉ kiểm không gắn hãng / không tách.

## Rủi ro và hoàn tác
- Rủi ro: thấp, chỉ thêm bản ghi đầu phát và hãng khi nguồn ghi rõ hãng cạnh model; điểm +80 chỉ ở gói đòi đúng hãng. Có thể còn dạng ô khác (chưa gặp trong cn hiện tại) mà tách sai: tách "tất cả hoặc không" nên ô lạ thì rơi về cách đọc cũ.
- Hoàn tác: `git revert` commit của PR (một commit, `web/catalog.js` + test + dòng CLAUDE.md); không đổi dữ liệu `suppliers/cn`.

## Chưa kiểm
- Không mở lại URL nguồn (chỉ đọc bản đã lưu trong repo).
- Không đo `bidprice` (Gợi ý giá) hay web thật; đo top 30 chỉ Gợi ý cấu hình.
- Không chạy `verify.mjs` (không sửa dữ liệu).
- Số test sau rebase lên 49713e3b chỉ chạy riêng `alt-fg-wilson.test.mjs`; bộ đầy đủ chạy trước rebase (rebase chỉ thêm `do-gop.mjs`, CLAUDE.md, web/index.html, test server).
- Tiến trình lạ PID 19448 lúc đo: không xác định (có thể phiên khác); không ảnh hưởng kết quả.

## Cần Khoa / điều phối quyết
1. `altOf` của `config-bot.mjs` kiểm một từ nên KHÔNG bóc "FG Wilson" (hai từ): `altOf("FG Wilson FGL20060")` → null (đã chạy thử). Hệ quả: bản ghi động cơ genlitec n122–141 (ô `other` = "FG Wilson FGL…") chưa nối được với bản ghi đầu phát mới; n1013–1022 thì nối được và hãng FG Wilson đã tới `candidates`. Sửa `altOf` (nhận `FG_WILSON` / hãng hai từ) là việc của phiên đang giữ `config-bot.mjs`.
2. Có đọc tiếp ba dạng sau không (em bỏ, thà thiếu còn hơn sai): (i) một hãng + hai model ("Leroy Somer TAL-A44-M / TAL-A46-C"); (ii) hãng + mã có dấu cách ngoài ô hai hãng ("LSA 43.2 L6" gb-power); (iii) hai mã không hãng ("S5L1D-C41 / S5L1D-F41", đang thành một model có "/").

## Cần ghi nhớ
- `gopCl3.mjs` so `all` bằng `!==` trên mảng nên luôn báo "đổi all" (1.089/1.093): dùng so đa tập (`[khoá dòng, điểm]`).
- Hãng của model có thể đến từ NCC KHÁC: sửa cách đọc ô đầu phát của một NCC làm dòng của NCC khác (rcg-power, kaihua…) đổi điểm; đo top 30 là bắt buộc.
- FG Wilson không được vào `ALT_BRANDS` (xem bẫy trong `web/CLAUDE.md`).
