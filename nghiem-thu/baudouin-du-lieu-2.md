# Nghiệm thu: baudouin-du-lieu-2 (20/11/2026)

Nhánh `baudouin-du-lieu-1` (PR #971, DRAFT, đã đẩy 2 commit mới) và PR riêng Koten https://github.com/khoanguyenminh6868/GenSet-Pro/pull/983 (DRAFT). Worktree: `wt-baudouin-2`, `wt-koten-1` (đang giữ), `wt-bd-base` (gốc 1e712e19), `wt-bd-old` (1830575b) để đo, gỡ sau khi duyệt.

## Phần 1: sửa tần số của #971
- Nguyên nhân đúng như điều phối nêu: crawler để dòng nhãn "| 50Hz | …" là dòng cuối `header`, các đoạn "| 60Hz" và bảng con DCP nằm trong `rows`, nên mọi dòng bảng đọc tần số 50. Thêm: crawler đã LÀM RƠI hai dòng tiêu đề của bảng con DCP; hai dòng đó có nguyên văn trong nguồn nên đã trả lại (14 bảng DCP).
- Việc làm: tách mọi bảng Ratings (n106–124) thành bảng theo đoạn 50 Hz / 60 Hz / DCP 50 Hz / DCP 60 Hz, mỗi bảng `header` = tiêu đề gốc + nhãn tần số của đoạn; dòng giữ nguyên văn; bỏ các dòng phân cách rỗng "| | | |". Cũng tách bảng n103 (20M55 generator set, cùng lỗi từ main: 20M55G3600/4000/4250 là 60 Hz mà đọc 50). Số bảng baudouin 41 → 63 + bảng mới (xem 3). `specs/baudouin.json` sửa tương ứng; `datasheets/` không cần (rating card đã có tần số trong tiêu đề).
- Ngoại lệ nguồn: trang 8M33 xếp 8M33G800/6 và 8M33G900/6 dưới đoạn "50Hz" (số ESP/PRP đảo, trùng đoạn 60 Hz). Để khỏi khẳng định 50 Hz, hai dòng đó tách thành bảng riêng KHÔNG có nhãn tần số (đọc tần số trống), vẫn nguyên văn.
- `verify.mjs`: 435 bản ghi, 0 lỗi (sau sửa tần số, và sau thêm datasheet 6M31).

## Phần 2: kiểm TOÀN BỘ tần số (141 model Baudouin; build chỉ hồ sơ baudouin; `uses[].freq`)
Lệnh: `node audit.mjs <worktree> <baudouin.json>` (script ở scratchpad `...\bd\work\audit.mjs`; tệp kết quả `aud-main.tsv`, `aud-new.tsv`).
- Gốc origin/main: 22 model, MỌI dòng f50 (kể cả 12M33G12D2/6, 6M33G10D2/6, 20M55G3600…) hoặc f?.
- Nhánh sau sửa: 141 model: 57 đuôi "/5": 0 dòng f60; 48 đuôi "/6": 0 dòng f50 (kể cả 8M33G800/6 và 900/6: một dòng f60 + một dòng f trống); 31 đuôi "/S" (D0/S, D5/S, 2D0/S…): đọc ra theo ĐÚNG đoạn trang đặt nó: model có ở cả hai đoạn → f50 và f60 (vd 4M06G2D0/S n108:f50,f60), model chỉ có ở một đoạn → một tần số (6M11G2D0/S n111:f60; rating card 50 Hz n1005 → f50; 6M21G2D0/S cả n114:f50,f60 và n1006:f60). Hợp lý: đó là máy chuyển được 50/60 Hz ("/S switchable", ghi trong rating card). 20M55G3600/4000/4250 (không đuôi): f60 đúng đoạn của nguồn. 6M11V0D0, 6M11V1D0 (trang heat-exchanger n101): f trống, không đổi.
- Kết quả: `bad = []` cho cả hai luật điều phối nêu.

## Phần 3: 21 lượt đổi của #971 (cloud) và số đo cục bộ sau sửa
Đo cục bộ (20 gói trong tom-tat.md, 24 lượt gồm các cỡ), cùng bidhist đọc lúc 2026-11-20T05:30Z, mỗi bên dùng code + cn của chính cây: `suppliers/do-gop.mjs <cây> <cây>/suppliers/cn out.json --bidhist bidhist21.json`; ba cây: gốc `wt-bd-base`, nhánh cũ 1830575b, nhánh đã sửa. Kết quả: nhánh cũ khác gốc 21 lượt (khớp số cloud), nhánh đã sửa khác gốc **11** lượt. Hai gói đích IB2300194512 và IB2300343668 KHÔNG còn đổi: voltgent 6M31G825/5 (hạng 14 ở gốc, điểm 197) và weichai-heavy-machinery 6M33G825/5 ở lại top.
- Vì sao voltgent 6M31G825/5 RỜI top ở bản cũ: bảng baudouin cũ gán f50 cho cả dòng 60 Hz (6M33G660/6, 6M33G600/6 …); luật (2) của `candidates` (động cơ mà mọi dòng ghi tần số đều ghi tần số kia thì loại dòng không ghi tần số) mất tác dụng, nên dòng 60 Hz "/6" của kaihua-genset và weichai (WPG660*76 | 1800) quay lại top và đẩy voltgent 6M31G825/5 và weichai 6M33G825/5 ra. Sau tách bảng, các dòng /6 chỉ còn f60 → bị loại như gốc.
- 10 lượt đã hết đổi hoàn toàn: IB2200032133, IB2300194512, IB2300260615, IB2300343668, IB2400236068, IB2400546306, IB2500314401, IB2500394492#0, IB2500394492#1, IB2600511196 (đều do bảng /6 f50: kaihua WP13D510E311 → 6M21G400/6, longkai 12M26G1000/5 → 12M26G800/6, koten/voltgent 6M16G308/6 vào, …).
- 11 lượt còn đổi (đo cục bộ, nguyên nhân KHÁC lỗi tần số):
  1. IB2400313213#0, IB2600184587#0: kaihua-genset 20M33G2200/6 RỜI (điểm gốc 241), rcg-power QSK60G23 vào. Hệ quả ĐÚNG: 20M33G2200/6 nay được biết là máy 60 Hz (trang baudouin 20M33), gói đòi 50 Hz nên bị luật (2) loại như mong muốn.
  2. IB2200073279#0, IB2300080302#0, IB2400446772#0, IB2500249901#0, IB2500400828#0 (cgm-italia 12M26G2D0/S vào, cgm 400830TAG3 / 12M33G1250/5 / saudi-diesel S12RPTAR1 ra): điểm dòng cgm-italia 12M26G2D0/S từ 15 lên 75 (gói IB2200073279). Cộng thêm đồng loạt +60 đúng bằng cách tính trong IB2400104800#0 (6M16G2D5/S 11 → 71). Em CHƯA lần ra từng thành phần điểm (suy từ số), nghi là hãng Baudouin của động cơ nay được hồ sơ hãng xác nhận. Cần phiên điều phối hoặc phiên khác xác nhận bằng `candidates` có in `reasons`; coi là "chưa giải thích hết, không phải lỗi tần số".
  3. IB2400104800#0: cgm-italia 6M21G2D0/S ra, 6M16G2D5/S (V300B, V313B) vào: cùng +60 như mục 2.
  4. IB2400208175#0, IB2400475109#0, IB2400560277#0: cùng tập 30 dòng, chỉ đổi thứ tự ở các hạng 6–8 / 12–14 / 24–25 (điểm bằng nhau).
- Chưa làm: đo cloud toàn bộ 1.093 lượt (điều phối giao lại); chưa chạy `config-bot prep` thật.

## Phần 4 (A): datasheet hãng 6M31G825/5 (PDF Khoa cung cấp 20/11/2026)
- Đã đưa lên release `datasheets-upload` (tên `baudouin-6m31g825-5-datasheet.pdf`) làm URL nguồn, nguồn `n1021` trong `baudouin` (tier A), tệp `sources/baudouin/1021.md` (chữ PDF, dấu chấm dẫn "......" đổi thành " | "), dòng đầu ghi "From: PDF do Khoa cung cấp 20/11/2026 …" và có trong quote. `maker-datasheets.mjs` lọc mất bore/cylinders/compression và để dấu chấm dẫn trong giá trị nên em dựng bảng bằng tay từ đúng các dòng của PDF (`header: []`, dòng "| Engine model | 6M31G825/5" mở đầu, + "Governor", 6 dòng Noise, bảng "Fuel consumption" gồm 100% ESP/PRP, 75%, 50%, 25% PRP và "tolerance +/- 5%"); thêm bảng thứ hai (3 dòng tiêu đề Ratings + dòng 1500 rpm: 680 912 740 992 663 889 723 970).
- Trích: "Compression ratio | 14 : 1" (trang 1), "| 100% ESP | 196 | 173", "| 100% PRP | 193 | 156", "| 75% PRP | 186 | 113" (và 50% PRP 190 / 77, 25% PRP 207 / 42 mà điều phối chưa nêu).
- `modelFacts` 6M31G825/5: TRƯỚC 8 dòng (đều Weichai, không có baudouin). SAU 14 dòng: thêm 6 dòng baudouin n1021: bore×stroke 149 × 177, dung tích 18.5, làm mát, nạp khí, **tỉ số nén 14 : 1**, điều tốc ECU. 
- CHƯA gắn được vào `modelFacts` (không sửa code, báo điều phối):
  - Số xi lanh: nhãn "N° of Cylinders / Valves" giá trị "6 / 24" không khớp luật `cyl` (số xi lanh đã có từ Weichai).
  - Tiêu hao 100% / 75% / 50%: `uses[].specs` của dòng n1021 đã ra `fuel=193 (100% PRP) fuel75=186 fuel50=190` nhưng KHÔNG vào `facts` (tiêu hao là thông số theo dòng tổ máy `ROW_ONLY`, không phải của động cơ). Giá trị đọc là cột gr/kWh (193) chứ không phải L/hr (156): đơn vị cột nằm ở dòng "| Rating | gr/kWh | L/hr", bộ đọc lấy ô đầu. Cần việc riêng cho bộ đọc (tiêu hao của hãng động cơ theo model + chọn cột L/hr).
  - Dung tích, tỉ số nén gắn được vì dòng "Engine model | 6M31G825/5" mở bảng nên bộ đọc nhận bảng là tờ một model (không bị vướng tên có "/" như bảng Engine Data của trang web, xem nghiệm thu 1).
- Lưu ý: tỉ số nén 14 : 1 của hãng khác 15.0:1 ghi trong tờ Koten (6M33G8D3/5), là hai động cơ khác nhau (6M31 vs 6M33).

## Phần 5 (B): tờ tổ máy Koten KB700D5 (PR #983)
- Tệp: `suppliers/datasheets/koten-power.json`, `suppliers/cn/koten-power.json`, `suppliers/sources/koten-power/1028.md` (nguồn n1028, tier A; PDF đã đưa lên release `koten-kb700d5-700kva-datasheet.pdf`). Không dùng `catalog-pdf.mjs` vì chạy cả ba kiểu (mặc định, `--single`, `--rows`) đều ra "0 bảng"; tờ này là một tổ máy nên dùng đường datasheet (n1028) như `1002` của chính hồ sơ. `maker-datasheets.mjs` trộn cột trái / phải ("Power Factor | 0.8 | variable load application…") và làm mất "Engine Model", nên dựng bằng tay từ `pdftotext -table`.
- Đối chiếu ảnh trang 1 và 2 (render 90 dpi): các ô cặp nhãn ↔ giá trị khớp "-table" ("Compression ratio 15.0:1", "Aspiration Turbo, intercooling", "Consumption 100% @ load ESP 174L/H"…); "-layout" mới là bản lệch cột. Chỉ ghi 48 dòng nhãn | giá trị (trang 1: model, tần số, điện áp, PRP, ESP, pha, tốc độ, hệ số công suất, bình dầu, động cơ, đầu phát, bộ điều khiển, kích thước + khối lượng; trang 2: động cơ, đầu phát). Không ghi trang 3 (danh sách bảo vệ ●) và các đoạn điều khoản.
- HAI mã cho cùng một động cơ trong tờ: trang 1 "Engine Model | Baudouin 6M33G825/5", trang 2 "Engine model | 6M33G8D3/5" (cùng 19,6 L, 150 × 185, 6 xi lanh, 675 kW prime engine). Đây là lời NCC (Koten), không phải hãng; cả hai dòng đều ở trong bảng.
- Catalog đọc (kiểm bằng `GenbidCatalog.build` chỉ hồ sơ koten): tổ máy KB700D5 50 Hz, động cơ 6M33G825/5, đầu phát LSA493M65 (Leroy-Somer LSA49.3 M65), bộ điều khiển Deepsea DSE7320, điện áp 380V, 3 pha, cosφ 0.8. Mã thứ hai 6M33G8D3/5 không thành dòng động cơ thứ hai (bộ đọc lấy mã đầu). Công suất PRP/ESP của tờ ("560KW/700KVA", "616KW/770KVA") và tiêu hao KHÔNG thành thông số vì nhãn "PRP"/"ESP"/"Consumption … @ load" không thuộc nhãn bộ đọc; để thiếu.
- `verify.mjs`: 435 bản ghi, 0 lỗi (lần đầu lỗi 1 vì một dòng trích bị bỏ do lỗi script của em, đã sửa và kiểm lại).

## Rủi ro còn lại + quay lui
- Sửa tần số: thấp (chỉ chia lại bảng baudouin, dòng nguyên văn); số model baudouin 22 → 141 trong catalog nên cần đo cloud lại toàn bộ trước khi merge.
- Phiên khác có thể đã thêm dòng baudouin vào top 30: 11 lượt còn đổi, 5 + 2 lượt chưa lần ra nguyên nhân điểm +60 (mục 3.2–3.3).
- Quay lui: đóng PR / revert merge commit.

## Việc chưa làm được / cần quyết
1. Đo cloud toàn bộ sau sửa.
2. Việc sửa bộ đọc (một việc riêng): (a) Engine Data theo dòng máy → mọi model cùng nguồn; (b) nhãn "N° of Cylinders / Valves"; (c) tiêu hao theo model của hãng động cơ, chọn cột L/hr.
3. Mục 3.2 chưa giải thích hết.

## Cần ghi nhớ
- Bẫy crawler: `tablesOf` làm rơi các dòng tiêu đề bảng con (Baudouin DCP) và để dòng nhãn "| 50Hz" vào `header`, các đoạn sau vào `rows` → mọi dòng đọc tần số của đoạn đầu. Sau crawl phải kiểm `uses[].freq` bằng `audit.mjs`.
- `maker-datasheets.mjs` hỏng với PDF có dấu chấm dẫn ("......") và PDF hai cột (Koten): dựng tay từ `pdftotext -table`, dấu chấm dẫn đổi thành " | " trong chính tệp nguồn.
