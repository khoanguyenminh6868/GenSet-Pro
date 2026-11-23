# Tải tờ đầu phát cho model thiếu tờ (24/11/2026)

PR nháp (chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1128 — nhánh `wt-dau-phat-tai-to`, worktree `C:\Projects\GenSet Pro\wt-dau-phat-tai-to`, 1 commit (Stamford).
**Tình trạng**: CHỈ làm xong Stamford (dừng vì luật context 30 %). Leroy-Somer, Mecc Alte, Marathon CHƯA làm.

## Cách tìm tờ Stamford (không đoán URL)
Trang công khai `https://www.stamford-avk.com/downloads/data-sheets` có bảng lọc (Brand / Model / Core / Winding / Poles) phân trang `?page=0..124` = **1.250 tờ**, mỗi dòng có link PDF. Em duyệt hết 125 trang (không đăng nhập, không captcha, không bị chặn): `genbid-work\alt-datasheets\stamford\liet-ke.mjs` → `liet-ke.json`, `rows.json`. Tải 282 tờ của các họ + lõi mà danh sách thiếu nhắc tới vào `alt-datasheets\stamford\pdf\` (ngoài git; `tai-ung-vien.mjs`, tiêu đề dòng đầu ở `tieu-de.json`), chọn `chon.mjs`.
Quy ước chọn (giống 33 tờ cũ): MỖI (họ, lõi) một tờ 3 pha cuộn 311 (312 với S7), bỏ 1 pha, bỏ kiểu HCM / UCM / PM (có PMG, không phải model đang chào).

## 1. Model trùng tên khác cách viết (việc của code đọc, KHÔNG thiếu tờ) — không tải lại
Đối chiếu khoá chuẩn (bỏ khoảng trắng / "-" / "." / "_", bỏ hoặc thêm đuôi "1"): `dau-vao\dau-phat-dien-ap\trung-ten.mjs` → `trung-ten.json`, 29 model:
- S-series đuôi "41" ↔ "4" (tờ ghi "S7L1D-F4 Wdg.312", danh mục ghi S7L1D-F41): S7L1D-F41(10) G41(9) C41(7) H41(7) D41(6) E41(6) K41(2); S4L1D-G41(9); S5L1D-H41(7); S6L1D-G41(6) E41(5) C41(5) D41(4) H41(4) F41(4); và chiều ngược S4L1D-D4(5) E4(3) C4(3) ↔ tờ "D41/E41/C41".
- UC / UCD "…1": UCI 274H1(4) C1 E1 F1(4) D1 G1(3) → tờ UCI274H/C/E/F/D/G; UCDI 274K1(4), 274J1(3); UCI 224G1(4), 224F1(3).
- Leroy-Somer TAL-A49-B1 ↔ TAL-A49-B.
- Không có trường hợp Mecc ECO38/40/43/46 trùng khoá chuẩn: tờ ghi "ECO38 1S4 C" (đủ hậu tố), danh mục ghi "ECO46-2L" — khác tên chứ không chỉ khác cách viết; cần quyết ở code (chưa tải).
LƯU Ý: "41" ↔ "4" và "…1" em coi là KHẢ NĂNG cùng model; chưa chứng minh trong tài liệu hãng. Điều phối / code quyết có gộp hay không.

## 2. Stamford: 26 tờ mới, nguồn 1034–1059 (hồ sơ stamford-avk-china)
Mọi tờ ra dòng định mức theo điện áp qua `ratingsOf` (script `do-hien-trang.mjs` chạy trên worktree; số cột kVA ≠ rỗng):
- S5L1D-G4, C4, D4, E4, F4 (1035–1039), S7L1D-J4 (1058), S4L1D-F41 (1059), S4L1S-E4 (1034), UCI224D, UCI224E (1040–1041): **8 điện áp** mỗi tờ.
- S0L1-H / L / P (1042–1044), S0L2-P / M / F / G (1045–1048), S1L2-Y / R / N / K / J (1051–1055): **6 điện áp** mỗi tờ (tờ chỉ có cột 400/415? 380/400/415 và 60 Hz một số cột; chưa soát từng tờ vì sao 6 chứ không 8).
- HCI 534C/544C, 534F/544F, 434E/444E, 434F/444F (1049, 1050, 1056, 1057): **4 điện áp** (chưa soát vì sao ít; có thể tờ HCI chỉ in cột 50 Hz hoặc tên cột lệch).
Tiêu đề (`title`) đã kiểm: đúng tên model trên tờ ("S5L1D-C4 Wdg.311 - Technical Data Sheet", "HCI 534C/544C - Winding 311"…).
Số liệu hồ sơ: bảng 33→59, dòng 461→838, nguồn 38→64; chỉ thêm, không mất gì (so `origin/main`). `verify.mjs`: 436 bản ghi, 0 lỗi. `node --test ls-ratings dau-phat-hang dau-phat-hang-d regress-config`: 38/38 đạt, fixture hồi quy không đổi (không cập nhật).

### Kết quả liên kết tờ ↔ danh mục (đo `CAT.build` trước / sau)
| | trước | sau |
|---|---|---|
| Stamford thiếu tờ | 249 | 243 |
| …trong đó ≥ 2 NCC chào | 98 | 91 |
Chỉ 6 model Stamford danh mục tự nhận tờ mới (tên trùng chính xác): S5L1D-C4(7), F4(6), G4(6), D4(3), S7L1D-J4(4), S4L1S-E4(2). Các tờ S0L1 / S0L2 / S1L2 / S4L1D-F41 / HCI / UCI224 đã tải nhưng KHÔNG tự gắn vì danh mục ghi tên khác: S1L2-Y1(13), K1(12), N1(10), J1(9), R1(8), S0L2-P1(11), M1(10), G1(9), S0L1-P1(10), H1(9), L1(8), S0L2.F1(5), S0L2-N1(2) ↔ tờ "S1L2-Y / S0L2-P…" (hậu tố "1" ở danh mục); HCI544FS(14), HCI444FS(11), HCI444ES(10), HCI544D1/C1/F1, HCI 544E1, HCI4E, HCI5C ↔ tờ "HCI 534C/544C", "HCI 434E/444E", "HCI 434F/444F"…; S4L1D-F4(4) ↔ tờ "S4L1D-F41"; UCI224D / E ↔ danh mục "224D(2)", "224E(3)". Hậu tố "1" (S0/S1), đuôi "S" (HCI544FS, HCI444FS/ES, UCI274ES), "224F/224E" không viết "UCI" — cần code đọc / quyết alias. Gắn được sẽ thêm ~190 chào-lượt của model có ≥ 2 NCC.
Ghi chú: 2 hàng rác "IEC 60034 Standard", "1500 Hours" (từng ở catalog trước) biến mất sau; không liên quan tờ Stamford (do phép đo đổi), không tính.

### Stamford: không tìm ra tờ trên trang hãng (đã duyệt 1.250 dòng)
- LVI634B/C/D/E/F/G (9+6+5+4+4+...): trang hãng chỉ có HC6 lõi J, K (HCM636J/K, HCI6J/K); không có LVI634.
- Họ cũ 164B/C/D, 184E/G, 224D/E/G không "UCI", P126TI / P126TI-II / P086TI, PI734B1/C1/E1/ES(1), LVSI804R/T, UCI274J / UCI274K (không có tờ I 311 3 pha; chỉ UCDI274J/K), UCI 224C1 / UC224C (trang có UCM/UCI224C chỉ cuộn khác 311, chưa lấy), S4L1S-D4 (chỉ Wdg.17), S6L1D / S7L1D-C/D/E/G/H (đã có tờ trong 1021–1033 dưới tên "…4"; xem mục 1), S0L2-N1 (không có tờ cuộn 311), HCI544FS (không có lõi "FS" trên trang). Chưa thử tìm bằng Firecrawl/ trang Trung Quốc của hãng cho nhóm này.
- Tờ HCI / S0 / S1 cuộn 311 chỉ 1 cuộn / lõi: các cuộn 14, 17, 25, 27 (điện áp khác) và 1 pha KHÔNG tải (không phải mục tiêu; tờ có trong `alt-datasheets\stamford\pdf\`).

## 3. Còn lại sau lần này (≥ 2 NCC chào, thiếu tờ)
Stamford 91 (mọi mục ở mục 2 + mục 1 chưa gắn), Leroy-Somer 28, Mecc Alte 1, Marathon 28 (không đổi: chưa làm).

## 4. Chưa làm
- Leroy-Somer (27–28 model ≥ 2 NCC: TAL 040/042/044, LSA 47.2 M7/S5, LSA 49.3 S4, LSA 53.2M12, LSA 54.2L14): chưa tìm.
- Mecc Alte (ECO46-2L…): chưa soát tên với tờ dải 1007–1016.
- Marathon (28 model ≥ 2 NCC): chưa thử marathonelectric.com / weg.net.
- Soát vì sao tờ HCI chỉ 4 điện áp, S0/S1 chỉ 6.

## 5. Bổ sung brief 24/11/2026 (nguồn 2 trang web, CHƯA làm)
Điều phối: thông số / model hãng không có thì được tìm trên internet, lấy khi có ≥ 2 nguồn ĐỘC LẬP (khác website, không chép cùng bảng) ghi CÙNG giá trị, mỗi nguồn kèm trang + câu trích nguyên văn; lệch nhau thì bỏ, ghi lại. Phiên này KHÔNG đưa vào hồ sơ, chỉ lập danh sách (model, điện áp / trường, giá trị, 2 URL, câu trích) cho model ≥ 2 NCC chào mà không có tờ hãng.
Trạng thái: chưa làm, phiên đã quá 30 % context. Danh sách ưu tiên: mục 2 "không tìm ra tờ" (LVI634B–G, 164/184, 224D/E/G, P126TI, P086TI, PI734, LVSI804, UCI274J/K, S4L1S-D4) + Leroy-Somer 28 + Marathon 28 (marathonelectric.com 403: ghi, không đổi UA). Gợi ý: một phiên mới đọc tệp này rồi làm tiếp.
