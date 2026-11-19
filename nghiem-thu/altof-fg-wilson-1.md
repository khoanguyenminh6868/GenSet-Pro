# altof-fg-wilson-1: `altOf` bóc hãng đầu phát hai từ (FG Wilson, Leroy Somer)

PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/949 (nhánh `altof-fgw`, gốc `origin/main` b00762f1, commit 82369a53). KHÔNG tự merge.

## Kết luận
- `altOf` chỉ thử MỘT từ làm hãng. Nay thử hãng hai từ (đúng cả cụm) trước, rồi hãng một từ như cũ. 26 dòng đổi, tất cả null → bản ghi đầu phát đúng; 0 dòng đổi sang giá trị khác; FG Wilson còn dính: 0.
- Không phụ thuộc #948: gộp thử #948 + commit này (đo lại): 33 dòng đổi, tất cả null → bản ghi, 0 ngoài ý; test liên quan 21/21.
- Top 30: CHƯA đo (điều phối đo cloud theo brief).

## Tệp đổi
- `suppliers/config-bot.mjs`: `ALT_CELL_MAKE` (các regex hãng của `CAT.ALT_BRANDS` + `^fg[\s-]?wilson$`), `altOf` thử cụm hai từ chỉ khi hai từ LÀ hãng ("Leroy Somer"; "Stamford HCI" không là hãng hai từ), rồi một từ. Không đụng `web/catalog.js`.
- `suppliers/altof-fgw.test.mjs` (mới, 3 ca, dòng thật genlitec n122 / n132 / datasheet, ca không đoán).

## 1. Đo trước (main b00762f1), toàn bộ ứng viên dựng như config-bot
Script `scratchpad\measure.mjs` (CAT.build(mọi `suppliers/cn` không `incomplete`), mọi `u.other` của động cơ qua `altOf`): 11.814 dòng, 2.698 bản ghi đầu phát; 11.688 tra được, 126 không; trong đó 62 dòng còn chữ hãng đầu phát:

| Nhóm | Dòng | NCC | Ví dụ chữ ô | Xử lý |
|---|---|---|---|---|
| "FG Wilson <mã>" | 18 | genlitec n122–141 | `FG Wilson FGL70030`, `FG Wilson FG33A450` | sửa (nay nối) |
| "Leroy Somer <mã>" (hãng hai từ) | 8 nối được | genlitec n132/133/142/143, saudi-diesel n111/114/119/122 | `Leroy Somer LL5114H`, `Leroy Somer TAL-A47-C` | sửa (cùng nguyên nhân: "Leroy" một từ rồi "Somer TAL…" không tra được) |
| "Leroy Somer <mã>" mà danh mục main chưa có bản ghi | 11 | saudi-diesel, gb-power | `Leroy Somer TAL-A47-A`, `LSA 43.2 L6`, `TAL-A44-M / TAL-A46-C`, `(50 Hz) / (60 Hz)` | giữ null (danh mục main không có bản ghi; #948 thêm các dạng này, khi đó altOf mới tự nối: gộp thử nối thêm 7) |
| Hai hãng "Stamford X / Leroy-Somer Y" | 22 (+2 dòng gần giống) | generatordieselchina n101–123 | `Stamford UCI274H / Leroy-Somer TAL-A44-M` | KHÔNG đổi: một dòng động cơ mà hai đầu phát tuỳ chọn, không biết dòng dùng hãng nào → để null (không chắc thì để nguyên) |
| "GENLITEC S274G180 ( STAMFORD & LEROY SOMER alternators for options)" | 8 | genlitec n149–161 | (như trên) | giữ null (mã của genlitec, hai hãng chỉ là ghi chú) |
| Không phải đầu phát | 1 | xinhengxin-fujian | `single bearing alternator IP23` | ngoài phạm vi |

Hãng tổ máy khác dính cùng kiểu: KHÔNG. Quét mọi ô còn null sau sửa (100 dòng): từ đầu chỉ là stamford 16 (ô hai hãng), leroy 11 (không có bản ghi), genlitec 8, single 1. Không có hãng nào khác (Mecc Alte, Marathon, Engga… không có dòng nào dính).

## 3. Bảng trước / sau (mọi dòng đổi giá trị `altOf`; `altof-fgw/diff.txt` = scratchpad `diff.txt`)
Cột: NCC, n, chữ ô, trước, sau (key bản ghi), hãng của bản ghi.
```
genlitec 122 FG Wilson FGL70030  null -> FGL70030 FG Wilson
genlitec 123 FG Wilson FGL30020  null -> FGL30020 FG Wilson
genlitec 124 FG Wilson FGL20060  null -> FGL20060 FG Wilson
genlitec 125 FG Wilson FGL30040  null -> FGL30040 FG Wilson
genlitec 126 FG Wilson FGL20080  null -> FGL20080 FG Wilson
genlitec 127 FG Wilson FGL20030  null -> FGL20030 FG Wilson
genlitec 128 FG Wilson FGL30080  null -> FGL30080 FG Wilson
genlitec 129 FG Wilson FGL30100  null -> FGL30100 FG Wilson
genlitec 130 FG Wilson FGL30120  null -> FGL30120 FG Wilson
genlitec 131 FG Wilson FGL30120  null -> FGL30120 FG Wilson
genlitec 134 FG Wilson FG26A250  null -> FG26A250 FG Wilson
genlitec 135 FG Wilson FG29A280  null -> FG29A280 FG Wilson
genlitec 136 FG Wilson FG29A320  null -> FG29A320 FG Wilson
genlitec 137 FG Wilson FG29A360  null -> FG29A360 FG Wilson
genlitec 138 FG Wilson FG29A400  null -> FG29A400 FG Wilson
genlitec 139 FG Wilson FG33A450  null -> FG33A450 FG Wilson
genlitec 140 FG Wilson FG33A450  null -> FG33A450 FG Wilson
genlitec 141 FG Wilson FG33A560  null -> FG33A560 FG Wilson
genlitec 132 Leroy Somer LL5114H null -> LL5114H Leroy-Somer
genlitec 133 Leroy Somer LL5114H null -> LL5114H Leroy-Somer
genlitec 142 Leroy Somer LL7224J null -> LL7224J (bản ghi không hãng)
genlitec 143 Leroy Somer LL7224L null -> LL7224L (bản ghi không hãng)
saudi-diesel 111 Leroy Somer TAL-A46-H null -> TALA46H Leroy-Somer
saudi-diesel 114 Leroy Somer TAL-A47-C null -> TALA47C Leroy-Somer
saudi-diesel 119 Leroy Somer TAL-A49-C null -> TALA49C Leroy-Somer
saudi-diesel 122 Leroy Somer TAL-A44-M null -> TALA44M Leroy-Somer
```
26 dòng, 0 dòng ngoài ý (so từng dòng, 11.814 / 11.814 cùng thứ tự: 11.788 giống hệt cả key lẫn hãng). Không dòng nào đổi từ bản ghi này sang bản ghi khác.

## Bộ kiểm (đầu ra thật)
- `node --test suppliers/altof-fgw.test.mjs suppliers/alt-cell.test.mjs suppliers/alt-fg-wilson.test.mjs`: pass 12 / fail 0 (lúc đầu 1 fail do fixture thiếu bản ghi LL5114H, đã sửa fixture, không sửa mã).
- `node --test suppliers/*.test.mjs`: tests 1169, pass 1169, fail 0 (`scratchpad\test-full.txt`).
- Gộp thử `refs/pull/948/head` + commit này: `alt-fg-wilson`, `alt-cell`, `altof-fgw`, `catalog-b`: pass 21 / fail 0; đo lại 11.810 dòng, 33 đổi, tất cả null → bản ghi, 0 đổi giá trị khác.
- `web/test/*.test.mjs`: không chạy (không đổi web).

## 4. Top 30
Chưa đo. Dự kiến: chỉ dòng genlitec (FGL…/LL…) và saudi-diesel (TAL-A…) có thể đổi `af` (thông số đầu phát) nên có thể đổi điểm; điều phối đo main ↔ nhánh (SHA 82369a53) → `dau-vao\altof-fgw\top30-cloud\`, em giải thích mọi lượt đổi khi có tệp.

## 3 mẫu đối chiếu nguồn (đọc `suppliers/sources/<id>/<n>.md`, chưa mở lại URL)
1. genlitec n122: `| Alternator | FG Wilson FGL70030` → FGL70030, FG Wilson (như PR #940).
2. genlitec n132: `| Alternator | Leroy Somer LL5114H` → LL5114H.
3. saudi-diesel n114: `| Alternator | Leroy Somer TAL-A47-C` → TALA47C, Leroy-Somer.

## Rủi ro và quay lui
- Rủi ro thấp: chỉ thêm kết nối khi chữ ô = đúng cụm hãng + mã có trong danh mục; không đoán; cụm hai từ chỉ khi cả hai từ là hãng. Hệ quả có thể thấy: dòng động cơ genlitec / saudi có thêm thông số đầu phát (`af`) nên có thể đổi điểm xếp hạng (chờ đo top 30).
- Quay lui: `git revert` một commit (82369a53 sau squash); không đổi dữ liệu.

## Chưa kiểm
- Top 30 (điều phối đo). Không mở lại URL nguồn. Không kiểm `bidprice`.
- LL7224J/L: bản ghi đầu phát trong danh mục không có hãng (do cách catalog đọc, ngoài phạm vi) nên "Leroy Somer" của ô chưa vào `makes`.

## Cần ghi nhớ
- `altOf` còn bỏ ngỏ (không sửa): ô hai hãng "Stamford X / Leroy-Somer Y" (22 dòng, generatordieselchina) trả null vì không biết dòng dùng cái nào; nếu Khoa muốn dùng cả hai thì phải đổi `candidates` (`a` là một bản ghi) — quyết định riêng.
