# Nghiệm thu PR 1 — eastern-lion EL / ELS là đầu phát + đọc n156 "EL Series" (20/11/2026)

PR nháp #969 (`catalog-el`, SHA da6879e9, gốc origin/main 1e712e19; gộp main 59f3369e (#968) → **da57a515**: xung đột chỉ ở `web/CLAUDE.md` (giữ cả hai), `soat-el` lại trên 59f3369e: NCC khác đổi 0, eastern-lion y như dưới; test 1.361 / 1.361). Quyết định: Khoa 20/11/2026 câu 1 = B, câu 2 (xem `catalog-nhom-con-lai-de-xuat.md`).

## Kết quả đo (thư mục `dau-vao\nhom-con-lai\pr1\`)
| Kiểm | Kết quả |
|---|---|
| spec-diff (`spec-diff.txt` / `.md`) | 60.073 → 60.497 bản ghi; 308 đổi, 26 chỉ cũ, 450 chỉ mới, 19 bảng; đảo vai 0 → 0; "ô động cơ không đọc được" 32 → 14; "bảng không cho bản ghi nào" 3.067 → 3.065; tổ máy 1.700 không đổi |
| So `fromSupplier` mọi NCC (`soat-el.mjs` → `soat-el.tsv`) | **NCC khác đổi: 0**. eastern-lion: ĐỔI động cơ 304 (302 chỉ thêm `other` = đầu phát; 2 ở n116 thêm thông số bộ điều khiển), MẤT động cơ 26 (n147 22, n126 1, n149 3: mã EL sai vai), MẤT đầu phát RUIFEN6120 4, MỚI đầu phát 454 (356 bảng tổ máy + 98 n156) |
| Dòng không có đầu phát mới | n117 r14, n144 r11/r13, n149 r11/r13: dòng trùng nguyên văn, gộp vào `also` (đúng) |
| n156 ↔ trang sống (`kiem-build.mjs`, `n156-trang-song-20-11.md`, firecrawl maxAge 0) | 49 dòng trang = 49 dòng `cn`; 98 / 98 bản ghi khớp model + kW + kVA từng tần số, mức `rated` (trang ghi "Ratings are indicative") |
| `build()` cũ ↔ mới (`kiem-build.txt`, `kiem-build2.mjs` → `kiem-build2.tsv`) | Động cơ 6.889 → 6.872: mất 17 khoá EL sai vai, thêm 0; 88 khoá đổi, chỉ `uses` của eastern-lion đổi (uses NCC khác đổi 0; K4100DS thêm 1 giá trị bộ điều khiển). Đầu phát 2.704 → 2.711: +8 (ELS184F ELS184H ELS164C ELS164B ELS164D EL164A EL224GS EL404B), −RUIFEN6120; 61 khoá đổi (khoảng kW / kVA, tần số 50 → 50+60, bộ điều khiển), uses NCC khác 0. Bộ điều khiển 187 = 187, 1 khoá đổi |
| Test | 1.355 / 1.355 đạt (gồm `suppliers/catalog-el.test.mjs` mới, 6 ca dòng thật); `quality.mjs --check` không xấu đi |

## Ảnh hưởng Gợi ý
- Khoá trùng: 87 khoá đầu phát EL / ELS, KHÔNG NCC khác dùng → không chồng dữ liệu NCC khác. 3 khoá chỉ có ở n156 (EL164A, EL224GS, EL404B: không dòng tổ máy nào dùng).
- Luật số đông: chỉ áp cho thông số động cơ (`VOTE_KEYS`); động cơ không đổi thông số → không đổi giá trị thắng.
- `candidates`: dòng eastern-lion nay có đầu phát (`u.other` → `altOf`) → khoá dòng `do-gop` đổi trường đầu phát (đo trước/sau phải bỏ trường đó); 26 dòng động cơ "EL…" sai vai biến mất (0 lần top 30 ở lượt đo gốc). Bản ghi n156 không là ứng viên; chỉ mở rộng khoảng kW / kVA hiển thị của khoá đầu phát (vd EL274K kVA 250–278 → 250–300 do thêm 60 Hz). `altKvaOf` đọc từ dòng bảng (không đổi).
- Cần đo top 30 cloud (`do-gop.mjs`) để xác nhận: kỳ vọng chỉ các dòng eastern-lion đổi khoá, điểm không đổi.

## Chưa làm / ngoài phạm vi
- Hãng của RUIFEN6120: nguồn không ghi.
- Merge main trước kiểm cuối: lúc mở PR main vẫn là 1e712e19 (PR #954 / #957 / #958 / #963 / #967 chưa merge).
