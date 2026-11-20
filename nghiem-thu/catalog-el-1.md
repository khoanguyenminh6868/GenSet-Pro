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

## Top 30 cloud (điều phối đo main 1e712e19 ↔ da6879e9, 1.093 lượt; giải thích đủ, so đa tập)
Tệp đo: `dau-vao\catalog-el\top30-cloud\` (`so.txt` của điều phối); phân tích `phan-tich.mjs` → `phan-tich.txt` (cùng thư mục). Khoá dòng `do-gop` = NCC | động cơ | **đầu phát (`r.a?.key`, đầu phát tra được trong danh mục)** | chữ dòng. Điểm đầu phát ở `suppliers/config-bot.mjs:1631`: dòng tra được đầu phát `+40`; hãng đầu phát HSMT nêu hoặc `named(hints, model)` thêm `+80`; `+3` mỗi loại thông số đầu phát (tối đa 6).

1. **Ghép cặp khoá cũ ↔ mới của eastern-lion** (cùng NCC + động cơ + chữ dòng, chỉ khác trường đầu phát): **304 khoá-dòng** đổi trường đầu phát từ trống → EL (= 304 khoá "vào all"); mọi lượt có đúng 1 bản cũ, 1 bản mới (không lặp). Điểm: **+40 ở 11.108 lượt-cặp** (trước không tra được đầu phát, nay tra được EL…; luật chung, NCC khác có đầu phát trong danh mục vẫn được +40 từ trước) và **+120 ở 92 lượt-cặp (8 lượt)**. Không cặp nào giảm điểm. Các khoá EL đã có đầu phát từ trước (EL274C, EL314D…, bảng đọc đúng) không đổi khoá, không đổi điểm. Thông số đầu phát (`+3 × loại`) không đổi: bản ghi n156 không có `specs`.
   - **+120 = +40 + 80 "đầu phát HSMT nêu" là KHỚP NHẦM (hồi quy):** `named()` (`config-bot.mjs:1375`) bỏ mọi ký tự không phải chữ / số rồi tìm CHUỖI CON: "Model: 224D" trong HSMT → "model224d" chứa "el224d". Đủ 8 lượt (chữ HSMT trong `doc-cache\bidhist.json`): IB2300027083#0 EL224D ("Đầu phát (alternator): Model 224D"), IB2300123990#0 / #1 EL184G ("Đầu phát - Model: 184G"), IB2300340671#0 EL224G ("Đầu phát: Model: 224G"), IB2400054276#0 EL164D ("model KYO 164D" / "Model: HY 164D"), IB2400090868#0 EL164D ("Model: 164D"), IB2400133990#0 EL184J ("model: 184J"), IB2400267274#0 EL184J ("model: Model 184J"). Lỗi có sẵn của `named()`, mã EL làm nó lộ ra. Đề xuất (chưa làm): so `named` theo ranh giới token (mã đứng sau ký tự không phải chữ) hoặc bỏ tiền tố "el" khỏi phép so chuỗi con.
2. **330 − 304 = 26 khoá rời không có khoá mới:** đủ 26 là dòng đọc sai vai "EL… làm động cơ" (n147 / n149 / n126: động cơ "D114系列WLD…", "12V系列WLV…", "G128系列WLG…", "6126ZLD新", "4105ZD(小泵)" không đọc được, nên dòng không còn động cơ): danh sách trong `phan-tich.txt`. 0 khoá vào không có cặp. → đúng mong muốn (Khoa câu 1 = B).
3. **260 ra top / 97 vào top:** dòng eastern-lion trong top (tổng mọi lượt) **677 → 1.199**: do +40 nêu ở (1), 304 dòng EL lên điểm. 45 khoá EL ra top: 23 chỉ đổi khoá (bản mới cùng dòng vào top), còn lại là khoá sai vai đã mất ở (2) và dòng EL bị dòng EL khác đẩy ra trong trần `PER_SUPPLIER = 4`. Khoá NCC khác ra top **215 khoá / 577 lượt-khoá** (acepow 98, uleengen 89, tecgen 84, jet-power 59, gordon 40, sanq 24, rcg 20, comappower 20, elitech 18, wintpower 17, longkai 12, kaihua 10, …): 341 / 344 lượt có khoá NCC khác ra top là lượt EL vào thêm. Không do trùng khoá. → hệ quả của (1): EL trước bị thiệt vì thiếu dữ liệu đầu phát, nay ngang luật với NCC khác; độ lớn (EL chiếm thêm 522 chỗ) cần Khoa xem có đúng ý không.
4. **Khoá NCC khác:** rời all 0, vào all 0 (danh sách ứng viên NCC khác KHÔNG đổi, điểm không đổi). "25 khoá NCC khác" của `so.txt` là phần vào top: **24 khoá / 55 lượt-khoá** (46 lượt) vào top vì xếp lại theo trần `PER_ENGINE = 3`, `PER_SUPPLIER = 4`, `CN_ROWS = 12` (`config-bot.mjs:1380`, 1676): dòng EL lên điểm chiếm chỗ của một động cơ / hãng TQ, dòng NCC khác cùng động cơ bị đẩy, chỗ trống sang dòng động cơ khác (42 / 46 lượt không có dòng EL nào rời top; 4 lượt dòng EL rớt top nhưng vẫn trong all). → hệ quả của (1), không phải đổi dữ liệu NCC khác.

Kết luận: (1) +40 đúng luật, **+80 ở 8 lượt là hồi quy** (lỗi `named()` có sẵn); (2) đúng mong muốn; (3), (4) hệ quả của (1), không phải lỗi đọc. Chưa đẩy commit mới vào #969.

## Chưa làm / ngoài phạm vi
- Hãng của RUIFEN6120: nguồn không ghi.
- Merge main trước kiểm cuối: lúc mở PR main vẫn là 1e712e19 (PR #954 / #957 / #958 / #963 / #967 chưa merge).
