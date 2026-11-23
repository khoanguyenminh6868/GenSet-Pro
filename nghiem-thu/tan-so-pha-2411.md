# Luật tần số + dòng một pha (Khoa quyết 24/11/2026)

## PR 1: XONG, draft, chờ đo top 30

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1114, nhánh `fix/tan-so-dong-khong-ghi`, SHA `019d251e95a9fa1e1f5d6844fa7fe7cc8048f00f`, gốc main `2090afc4`. Worktree `wt-tan-so-1`.
- Test `node --test suppliers/*.test.mjs`: 1.596 pass, 0 fail. CI `suppliers`, `server` xanh. CHƯA đo 1.093 lượt top 30.

### Luật (`freqVerdict` trong `suppliers/config-bot.mjs`), dòng không tự ghi Hz
1. Cột tốc độ của chính dòng trái gói → loại (`row`). Tên kaihua đuôi -60 → loại (`name`).
2. Ngoại lệ tường minh long-gen n109 LGPL-220EV mã 1206J-E70TTAG4, gói 50 Hz → giữ, cần xác nhận (`listed`).
3. Đuôi Baudouin `/5`, `/6` trái gói → loại (`code`). `/S` không kết luận.
4. Động cơ có dòng ghi đúng tần số gói → giữ, không xét tiếp.
5. Tờ của chính hãng động cơ chỉ ghi tần số kia → loại (`sheet`).
6. Chỉ NCC khác ghi tần số kia (≥ 2 dòng) → giữ, cần xác nhận (`others`). `check` đặt mục tần số thành `confirm` (`freqAskCheck`).

### Căn cứ đuôi Baudouin
Mọi tờ `suppliers/sources/baudouin/*.md` (`baudouin-suffix.mjs`): 260 mã; 87 mã đọc được RPM (43 `/5`, 44 `/6`), 0 mã trái đuôi. Tờ hãng ghi "models ending with S are switchable 50/60 Hz engines". Tờ hãng KHÔNG có câu nói thẳng "/5 = 50 Hz, /6 = 60 Hz": đây là quy luật đo được.
Bảy mã của yêu cầu: 12M33G1000/6, 16M33G1400/6, 12M55G2500/6 đọc được 1800 v/p; 8M33G770/6, 16M55G3300/6 có trong tờ nhưng không đọc được cột RPM; **4M06G25/6, 4M10G66/6 không có trong tờ hãng nào**, bị loại chỉ theo quy luật đuôi. Cả bảy đều bị loại ở gói 50 Hz (trừ dòng tự ghi 60 Hz, vốn đã bị lọc).

### Dòng đổi trạng thái (mọi dòng × hai tần số, 89.916 lượt trên main)
| Gói | loại → cần xác nhận | giữ → loại (mã) | giữ → loại (tờ hãng) |
|---|---|---|---|
| 50 Hz | 562 (1 là ngoại lệ) | 20 | 4 |
| 60 Hz | 8.124 | 77 | 35 |

Đủ từng dòng theo NCC: `tan-so-pha-2411/dong-doi-main.tsv`; trên dữ liệu #1105: `dong-doi-tren-1105.tsv`.

- TAD1350GE (đo trên dữ liệu #1105 phủ lên PR 1): 5 dòng từ loại về cần xác nhận: comappower n108, nenjo-generator n142, rise-power n111, tellhow-power n115, victory-generator n111.
- 2806C/A-E18TTAG6: nhánh `sheet` (tờ Perkins n5001 chỉ ghi 60 Hz), bị loại ở gói 50 Hz.
- 233 dòng trái tờ hãng, xét ở gói trái với Hz của hãng: 197 giữ vì dòng tự ghi đúng gói (125 ở 50 Hz, 72 ở 60 Hz), 5 giữ ở gói 50 Hz vì động cơ có dòng ghi 50 Hz, 31 loại ở gói 60 Hz vì dòng tự ghi trái gói; 0 dòng "cần xác nhận".

### Cần điều phối xem
- Gói 60 Hz: 8.124 lượt-dòng từ loại về cần xác nhận (động cơ chỉ có NCC ghi 50 Hz). Đúng luật đối xứng, nhưng gói 60 Hz sẽ có nhiều dòng thực chất là máy 50 Hz.
- Mã `/6` có NCC ghi ở bảng 50 Hz: dòng tự ghi 50 Hz vẫn ở lại, dòng không ghi thì bị loại theo mã. Test cũ "bán ở cả hai tần số" đã đổi sang mã không tự nói tần số.

## PR 2: CHƯA LÀM (bàn giao cho phiên mới)

- Dựng từ `origin/fix/crawl-dropped-rows` (#1105). Lúc 24/11 nhánh còn ở `a95b8ab5`, CHƯA merge main (merge PR 1 vào đụng `suppliers/CLAUDE.md`, `suppliers/crawl-specs.mjs`): fetch lại, chờ phiên kia merge main xong.
- #1105 không đổi `web/catalog.js`; đổi `crawl-specs.mjs`, 16 tệp `cn/`, 16 tệp `specs/`.
- Việc: (a) awt-aiweite bảng "Dual-band 50/60HZ" (13 dòng) đang đọc thành 60 Hz → hai tần số thì không kết luận; (b) dòng dưới phân đoạn "Single phase" (lees-power 17 dòng) mang thuộc tính một pha; gói đòi ba pha → `ruled: phase`, gói không ghi pha → giữ, cần xác nhận số pha; (c) quét toàn bộ hồ sơ tìm bảng / dòng ghi một pha, liệt kê, không suy từ điện áp / công suất; (d) xem HSMT ghi pha ở đâu trong `need`; chưa có trường pha thì BÁO phương án trước khi thêm bước đọc HSMT. Gợi ý điểm vào: `STD` trong `config-bot.mjs` đã có khoá `phase` (`STD_CODE.phase = "phases"`).
- Script đo dùng lại: `tan-so-pha-2411/freq-all.mjs <worktree> <out.tsv>`, `freq-sheet.mjs <worktree> <233.tsv>`.

### PR 2: XONG, draft, chờ đo top 30
- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1118, nhánh `fix/mot-pha-hai-tan-so`, SHA `fc10692363196222de475b1887081ec77cf50700`, base `fix/crawl-dropped-rows` (`28615f52`). Worktree `wt-tan-so-2`. Điều phối chọn PA A. CHƯA đo 1.093 lượt top 30.
- Test 1.607 pass, 0 fail; `quality --check` không xấu đi. Thử gộp với #1114 (`019d251e`): không xung đột.
- Dòng có căn cứ một pha: 39 (lees-power 17, superwatt-swt 15, bruno-generators 7), đủ ở `tan-so-pha-2411/dong-mot-pha.tsv`.
- Tần số: 60 / 63.474 bản ghi 60 Hz → không kết luận (minsun-motor 44, awt-aiweite 13, plus-power 3), đủ ở `freq-doi.tsv`. Không trường nào khác đổi.
- Số pha theo lượt (`pha-theo-luot.tsv`, 1.594 lượt bidhist cục bộ, chưa lọc như `do-gop`): 662 ba pha, 214 một pha, 718 không rõ.
- So với mã `phases` của Phân tích (`pha-lech-goi.tsv`, chỉ số gói + giá trị): 879 khớp, 376 lệch. Chữ HSMT của từng gói lệch để NGOÀI git: `genbid-work\tan-so-pha-2411-local\`.
- Đã soát bằng chữ HSMT: 13 gói rủi ro (code 3 mà Phân tích 1 / cả hai / không rõ, code 1 mà Phân tích 3): code đúng 13 / 13 khi xét tổ máy, Phân tích lẫn dòng ATS / biến dòng. Nhóm 87 + 13: 41 + 6 gói code ra 3 hoặc 1 đã đọc từng dòng, tìm ra lỗi "1 pha/3 pha" (đã sửa). Nhóm code = null (43 + 6) giữ dòng nên không đọc từng gói. 3 / không ghi: 236 gói, soát 11 gói không có cụm rõ; 225 gói còn lại chỉ kiểm bằng regex cụm rõ.
- **Việc để Khoa quyết:** (1) gói đòi 1 pha (169 gói theo đếm đầu) chưa loại dòng ba pha; (2) 91 dòng chỉ có đuôi "-1P" (agg-fuzhou 85, kachai-hangzhou 5, voltgent 1) chưa tính một pha vì voltgent "P2500-1P" là máy 2.500 kVA; (3) tên trang ghi "Single Phase" không tính (ade-power, acepow…).

### PR 2: ghi chép lúc đang làm (worktree `wt-tan-so-2`, gốc #1105 `28615f52`)
- Tham chiếu cục bộ `origin/fix/crawl-dropped-rows` còn ở `a95b8ab5`, đầu thật của #1105 là `28615f52`: dùng SHA.
- HSMT ghi pha ở đâu: `hintsOf` (đầu vào `candidates`, cả `prep` lẫn `do-gop`) KHÔNG có trường pha. Số pha chỉ có ở yêu cầu mã `phases` của Phân tích, mà `prep` có còn `do-gop` không đọc. → DỪNG phần một pha, chờ điều phối chọn phương án.
- Phân tích cục bộ (`doc-cache/analysis.json`, bản 17/11): 1.298 gói có thông số, 910 gói nêu pha: 641 ba pha, 169 một pha, 87 có cả hai (phần lớn gói nhiều cỡ), 13 không rõ. Đây là đếm bằng regex trên dòng thông số, chưa soát từng gói.
- Quét hồ sơ (`tan-so-pha-2411/mot-pha-bang.tsv`, `hai-tan-so-bang.tsv`; regex, CHƯA soát tay): 281 bảng / 53 NCC có chữ một pha (79 ở tiêu đề, 202 chỉ ở dòng); 40 bảng / 17 NCC, 573 dòng có tiêu đề hai tần số. lees-power n111 b21 (5 dòng) + n112 b24 (12 dòng) = 17; awt-aiweite n102 b10 = 13.
