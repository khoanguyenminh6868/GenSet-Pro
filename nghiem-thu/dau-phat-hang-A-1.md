# Nghiệm thu dau-phat-hang A-1: `ratings.mjs` đọc mọi tờ Leroy-Somer (20/11/2026)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/976 (draft) — nhánh `dau-phat-hang-a`, commit cb069e0e trên `origin/main` 59f3369e.
- Đề xuất gốc: `nghiem-thu\dau-phat-hang-de-xuat.md` (PR A). Script đo: `genbid-work\dieu-phoi\dau-vao\dau-phat-hang\`.

## Tệp đổi
- `suppliers/ratings.mjs`:
  - `lsRatings` đọc mỗi khối "Ratings 50/60 Hz" bằng cách cũ (`lsBlockOld`, giữ y). Khối nào cách cũ không ra số thì đọc bằng `lsBlock` mới.
  - Thêm `lsFigures`: ghép số nghìn ("1 000", "| 1 | 315 |").
  - Thêm `lsSheetAttrs`: đọc khối "General characteristics" (cách điện, kích từ, AVR, ổn định U, IP, ngắn mạch 300 %, quá tốc, độ cao), mỗi mục kèm dòng nguyên văn.
- `suppliers/ls-ratings.test.mjs` (mới): 7 test, đọc thẳng tệp nguồn thật 1004 / 1005 / 1007 / 1012 / 1013 / 1014.
- `suppliers/CLAUDE.md`: bẫy (đọc định mức từ tệp nguồn chứ không từ `specTables`; dòng "Y" thứ hai là bảng quấn dây tuỳ chọn; nguồn tự lệch kW; `altKvaOf` tách "1 025"; model chỉ có trong tờ hãng không vào `built.alternators`).
- KHÔNG đụng `config-bot.mjs`, `web/catalog.js`.

## Không làm (cần điều phối quyết)
- **Sửa `altKvaOf` tách "1 025"**: hàm này nằm trong `config-bot.mjs`, brief cấm đụng tệp này ở PR A. Hiện chỉ dùng số kVA lớn nhất mỗi nguồn nên chưa sai rõ. Đề xuất gộp vào PR B. Bẫy đã ghi ở `suppliers/CLAUDE.md`.
- `lsSheetAttrs` CHƯA có nơi gọi (nối ở PR B), nên hôm nay không đổi kết quả nào.
- Stamford: không thêm đọc AVR / ổn định U (brief: Stamford không đổi số nào).

## Lệnh kiểm + đầu ra thật

1. **Mọi mục định mức / thuộc tính của MỌI tệp `sources/*/*.md` (mọi NCC), gốc ↔ nhánh**:
   - lệnh: `dump-ratings.mjs` (truoc.json, sau2.json) + `so-dump.mjs`;
   - đầu ra: `giữ y: 9049, mất/đổi: 0, mới: 3164`;
   - Stamford (stamford-avk-china, Ratings Book, các NCC chép tờ Stamford), Cummins: 0 mục đổi.
   - Mục mới chỉ ở 14 tờ `leroy-somer-fuzhou` và `gfe-power/1025` (bản chép tờ TAL 046 / 047 / 049 của Leroy-Somer).
2. **Soát từng số mới**:
   - lệnh: `soat-ls.mjs truoc.json sau2.json` (bảng đầy đủ mọi model: `soat-ls.txt`). Kiểm:
     - kW = 0,8 × kVA (±2 %, nguồn làm tròn tới 5 kW);
     - cùng model / Hz / điện áp thì F 105K ≤ H 125K ≤ Standby 40 °C ≤ Standby 27 °C;
     - mỗi kVA có trong dòng nguồn.
   - Đầu ra: `mục mới: 3164, lỗi: 1`. Lỗi duy nhất là nguồn tự ghi lệch: gfe-power n1025, dòng 60 Hz `| TAL 047 F | kVA | 650 | 715 | 755 | 825 | 592 | 650 | …` / `| kW | 526 | 572 | 604 | 660 | 474 | 496 | …`. Cột F 416 V: 650 kVA ↔ 496 kW. Code giữ số nguồn.
   - Lượt soát đầu (sau1) bắt được lỗi thật: tờ LSA 50.2 có thêm bảng "12 wires version winding no. 6 (option)" bị đọc chồng lên bảng chuẩn (M6 ra hai số mỗi cột). Đã sửa: dòng "Y" thứ hai thì dừng khối. Model "TAL -A473-A" của bảng 60 Hz nay gộp thành "TAL-A473-A".
3. **Đối chiếu tay với nguồn** (dòng nguồn ↔ số đọc, 50 Hz 400 V cột F | H | SB40 | SB27):
   - 1012 `| LSA 49.3 M8 | kVA | 820 | 820 | 820 | 810 | 760 | 760 | 760 | 710 | 910 | 910 | 910 | 885 | 945 | …` → 760 | 820 | 910 | 945. 60 Hz 480 V → 925 | 1025 | 1090 | 1130. ✓
   - 1007 `| LSA 40 VS1 | kVA | 10 | 10 | 10 | 9 | 7 | 9 | 9 | 9 | 8 | 6.5 | 10.5 | 10.5 10.5 | 9.5 | 7.5 | 11 | …` (dòng Y ghi một lần, có cột 1 pha) → 9 | 10 | 10.5 | 11, 1 pha cột H = 7. ✓
   - 1014 `| LSA | 52.3 | S5` rồi `| kVA | 1 | 860 | 1 | 860 | 1 | 860 | 1 | 696 | … | 2 | 046 | …` → 1696 | 1860 | 1953 | 2046. ✓
   - Thêm: 1011 LSA 47.3 M8 (500 | 550 | 585 | 600 ✓), 1009 LSA 44.3 M8 60 Hz 480 V (154 | 169 | 179 | 186 ✓).
4. **Model Leroy-Somer đọc được, trước → sau**:
   - Trước: TAL-A44 (8 model) + TAL-A40 chỉ 60 Hz (5 model).
   - Sau: đủ 84 model của 14 tờ `leroy-somer-fuzhou`:
     - TAL-A40 C–G (thêm 50 Hz);
     - TAL-A42 C/E/F/G/H;
     - TAL-A44 (không đổi);
     - TAL-A46 C–H;
     - TAL-A473 A–F;
     - TAL-A49 B–E;
     - LSA 40 VS1/VS2/S3/S4/M5;
     - LSA 42.3 VS1/VS2/VS3/S4/S5/M7/M8/L9;
     - LSA 44.3 S2/S3/S4/S5/M6/M8/L10/L12/VL13/VL14;
     - LSA 46.3 S4/S5/M7/M8/L10/L11;
     - LSA 47.3 S4/S5/M7/M8/L9/L10;
     - LSA 49.3 M6/M8/L9/L10;
     - LSA 50.2 M6/L7/L8/VL10;
     - LSA 52.3 S5/S6/S7/L9/L12/UL16.
   - Thêm 19 model TAL 046 / 047 / 049 ở gfe-power/1025.
   - Bảng kVA từng model: `dau-vao\dau-phat-hang\soat-ls.txt`.
5. **`lsSheetAttrs` trên mọi tệp có "General characteristics"**:
   - lệnh: `ls-attrs.mjs`, đầu ra `ls-attrs.txt` (29 tệp, mỗi giá trị in kèm dòng nguồn).
   - Đọc được ở 14 tờ leroy-somer-fuzhou + gfe-power/1025. 14 tệp aksa-power và sevenpower không có khối dạng này → không ra mục nào. Đã soát từng dòng.
   - Ví dụ 1012: insulation H, excitation [AREP, PMG], avr [D350], vreg [0.25], sc300 {300, 10 s, all: true} ⇐ `| Short-circuit current | 300% (3 IN) : 10s`.
   - LSA 40–47.3: sc300 `all: false` (cột SHUNT ghi "-").
   - TAL 1002–1006: không có sc300 (tờ chỉ ghi "2.7 In : 5 seconds", không đọc).
6. **Nơi đang dùng `ratings.mjs`** (`sourceRatings` → `ratingsFor` trong config-bot, đầu vào của `altColumns` / `comboChecks`):
   - lệnh: `rt-dump.mjs` code gốc (worktree `wt-dauphat-base` = 59f3369e) ↔ nhánh trên toàn bộ `cn/` + `sources/`, rồi `rt-so.mjs`.
   - Đầu ra:
     - `alt: 177 khoá, khác 86 (trước không có gì: 81)`, không model nào mất mục cũ (5 model TAL-A40: 20 → 36 mục);
     - `eng: khác 0`, `attr: khác 0` (thuộc tính Stamford giữ y);
     - `configs: 42 khoá, khác 2`.
   - Trong `doc-cache\configmatch.json` (16 lượt, bản chụp 18/11), chỉ 2 cấu hình có đầu vào đổi: IB2600592658 #1 và IB2600595853 #1, cả hai TAL-A473-C.
7. **Chạy lại `check` + `rankConfigs` trên hai lượt đó**, gốc ↔ nhánh:
   - lệnh: `check-ab.mjs`; chữ HSMT đọc từ web, chỉ đọc; gỡ check byCode đạt / không đạt trước.
   - Đầu ra `diff ab-goc.json ab-nhanh.json` → GIỐNG HẾT. Hai HSMT không đòi kVA / hiệu suất đầu phát (check đầu phát chỉ có hãng / model / xuất xứ).
8. **Test**:
   - `node --test suppliers/ls-ratings.test.mjs suppliers/ratings.test.mjs` → pass 16, fail 0.
   - `node --test suppliers/regress-config.test.mjs` → pass 8, fail 0 (fixture không đổi).
   - `node --test suppliers/*.test.mjs` → tests 1201, pass 1201, fail 0.

## Số đo trước / sau (đo, không ước tính)

| chỉ số | trước | sau |
|---|---|---|
| model Leroy-Somer (14 tờ hãng) có định mức có nhãn cột | 13 (TAL-A40 chỉ 60 Hz + TAL-A44) | 84 |
| mục định mức có nhãn cột, mọi nguồn | 9.049 | 12.213 |
| model catalog có đầu vào `ratingsFor(RT.alt)` | 96 | 177 |
| tờ có thuộc tính chung đọc được (`lsSheetAttrs`) | 0 | 15 |
| cấu hình đã lưu đổi kết quả `check` | — | 0 / 42 có đầu phát |

## Rủi ro + quay lui
- Cấu hình về sau dùng đầu phát Leroy-Somer sẽ có thêm `altColumns` / `comboChecks` (kVA, hiệu suất theo cột). Kết quả `check` của các gói đó CÓ THỂ đổi:
  - check "Công suất định mức đầu phát" từ không có thành có;
  - cân bằng công suất.
  - Đây là ý muốn của việc. Chưa đo được trên gói nào có ảnh hưởng (bản chụp chỉ 16 lượt).
- `lsFigures` từ chối mọi dòng có nhiều cách ghép số nghìn: thà thiếu còn hơn sai.
- Quay lui: revert commit. `lsBlockOld` giữ nguyên nên khối cũ không đổi.

## Việc chưa kiểm được
- Chưa chạy `check` trên toàn bộ `configmatch` của web (chỉ bản chụp 16 lượt ở doc-cache, máy không có chữ HSMT của chúng nên đọc từ web cho 2 lượt bị ảnh hưởng).
- `do-gop.mjs` (top 30): không chạy. Trong code chạy thật, `ratings.mjs` chỉ được `config-bot.mjs` import, và chỉ `check` gọi `sourceRatings` (config-bot.mjs:2421; còn lại là test `cfg-r3`, `ratings`, `ls-ratings`). `candidates` không gọi, nên ứng viên không thể đổi.

## Cần ghi nhớ
- Khoa trả lời 7 câu của đề xuất (20/11, điều phối đã ghi `config-suggest.md`). PR B chờ #963 và PR tỉ số nén.
- PR B nhớ làm:
  - sửa `altKvaOf` tách "1 025";
  - nối `lsSheetAttrs` vào `sourceRatings` (thuộc tính áp cho mọi model của dải trong cùng tờ, kể cả bản chép của gfe-power);
  - `sc300.all: false` nghĩa là chỉ đạt với kích từ AREP / PMG.
