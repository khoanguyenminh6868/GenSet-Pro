
## 5. Đụng PR đang mở (`web/catalog.js`, so vùng sửa của từng PR với main)

Vùng của PR (dòng trên nền của PR): **#954** catalog-b3: `subline` (~490), `addMake` (~1162), tiêu đề cột tổ máy (~1250), làm sạch ô (~1263), chọn `gi` trong khối chọn động cơ / đầu phát của dòng (~1283), thêm `TABLE_DROPS` / `MAKE_LEVEL_LOW` / `DASH_FIX` ngay sau `ROW_EXCEPTIONS` (~1350). **#957** dropspec: mục `dropspec` trong `ROW_EXCEPTIONS` (~1383). **#958** fuel: `PRIME` (~79), `titledPowers` (~297, 719), `gasTable` / bộ phát hiện nhiên liệu (~834–946), `fromSupplier` đầu bảng (~1149), gắn `fuel` (~1449), `builder` gộp (~1419), `api` (~2232). **#959** việc C: `GENSET_TABLES` + `gensetsOf` (~1773–1940), `builder` / `unread` (~1946–2070), `api`. **#963** chỉ `suppliers/config-bot.mjs` (`fuelOfHsmt`, `fuelOff`, `candidates`, `check`).

| phương án | chỗ sửa | đụng |
|---|---|---|
| 1A (`ALT_CODE`) | dòng 44 (hằng số) | không PR nào sửa dòng 44 (#958 gần nhất ở ~79). NHƯNG hành vi đi qua khối chọn động cơ / đầu phát mà #954 sửa (`gi`, ~1283) → đo lại sau khi #954 merge |
| 1B (danh sách bảng) | cạnh `ROW_EXCEPTIONS` / sau `rowExceptions` | #954 (TABLE_DROPS ngay đó), #957 (dropspec) — dễ xung đột văn bản |
| 2 (n156, bảng hãng đầu phát) | cạnh nhánh "engine maker's own table" (~1238) | #954 (~1250, 1263) sát bên |
| 3 / 2a-B (jianghao, kingway `fuel`) | bộ nhiên liệu của #958 (danh sách ngoại lệ cấp bảng) | **#958** (phải xếp chồng lên #958 hoặc làm sau merge); dùng ở Gợi ý qua **#963** |
| 4B / 2a-C (simpson loại khỏi gói diesel) | cờ mới ở catalog (#958) + luật ở `candidates` | **#958** + **#963** |
| 5B (nhiên liệu theo bảng cho 164) | danh sách nhiên liệu của #958 | **#958**; 7 bảng cũng là bảng của **#959** |
| 5C (12 bảng xăng) | `GENSET_TABLES` | **#959** (zc n109 b11 / b12 đã ở đó) + **#958** (`fuel`) |
| 6B / 6C (bảng động cơ / đầu phát rời) | danh sách mới kiểu `GENSET_TABLES`, `builder` | **#959** (cùng `builder`, `unread`) |
| 7B / 7C (huatai) | `ROW_EXCEPTIONS` (mục huatai đã có ở ~1364) hoặc danh sách cột theo bảng | #954 (~1350, sửa dòng `return mergeRepeats(...)` ngay trên), #957 (~1383, cùng mảng) |

Thứ tự đề xuất: chờ #954, #957, #958, #959 merge rồi mới mở PR cho 1A / 3 / 7B (mỗi việc một PR nhỏ, đo spec-diff + top 30 cloud như thường lệ).

## 6. Rủi ro còn lại / chưa kiểm
- Số bản ghi của các phương án là ƯỚC TÍNH theo dòng (chưa có code); số thật đo bằng `spec-diff` + `do-gop.mjs` khi làm.
- Top 30 dùng lượt cloud 79e9b175 (main hiện tại không đổi cn / catalog / config-bot từ đó), CHƯA tính #954 / #957 / #958 / #959 / #963.
- Không kiểm trang sống của 164 bảng nhóm 2b từng bảng (phân lớp theo chữ đã lưu + URL); không kiểm trang sống jianghao / kingway (dùng tệp nguồn đã lưu 13–14/11).
- Hãng của "RUIFEN6120": không rõ (nguồn không ghi).
- simpson: nhiên liệu không rõ; đánh giá theo động cơ (GX…) cần nguồn của hãng động cơ, chưa tìm.

## 7. Tệp
`genbid-work\dieu-phoi\dau-vao\nhom-con-lai\`: `bang-day-du.tsv` (254 bảng của bốn nhóm: nhóm, lớp, NCC, n, chỉ số bảng, số dòng, bản ghi hiện tại, tên trang, tiêu đề cột NGUYÊN VĂN, dòng 1, dòng 2), `g2b.tsv` (164 bảng + dấu hiệu nhiên liệu + URL), script `do-all.mjs <repo> all.json` (chạy `fromSupplier` thật, ~100 s, `all.json` 28 MB không lưu), `g1.mjs`, `g2b.mjs`, `g3.mjs`, `g3b.mjs`, `g3c.mjs`, `phu-luc.mjs`. Đếm top 30 bằng lệnh node một dòng trên `dau-vao\catalog-c\top30-cloud\gop-goc.json.gz` (khoá `NCC|động cơ|đầu phát||…`).

## Cần ghi nhớ
- eastern-lion: EL / ELS = đầu phát của chính NCC; RUIFEN6120 = bộ điều khiển (trang sống 20/11). 26 bản ghi động cơ "EL…" và 4 bản ghi đầu phát "RUIFEN6120" đang sai vai (0 lần top).
- jianghao n104 có câu nguồn ghi khí (chờ Khoa câu 3); simpson n124 không nguồn nào ghi nhiên liệu.
- huatai n111: không khoá nào trong 17 có `engPower`; "额定功率" ở 121 bảng là công suất tổ máy → không nới mẫu chung.
- Chờ Khoa 7 câu ở đầu tệp.
