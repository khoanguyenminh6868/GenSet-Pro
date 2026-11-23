# Nhóm B: hằng số và nạp khí từ tờ hãng động cơ (23/11/2026)

PR draft [#1109](https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1109), nhánh `fix/to-hang-nhom-b`, SHA `f11974bf`, gốc `2ba6c3b2`. Chưa merge. Worktree: `wt-luu-bo-nho`.

## Luật
- `modelFacts` đọc thêm xi lanh, đường kính × hành trình, tỉ số nén, nạp khí từ bảng có dòng tiêu đề, chỉ khi: NCC `engine_maker` là hãng của động cơ; tiêu đề ghi đúng một model; dòng tiêu đề cột không nêu model khác; mỗi nhãn một giá trị.
- Không lấy ô dung tích "in³ + l": số lít làm tròn một chữ số (1,1 của động cơ 1,131 L) thành phiếu chống ở luật dung tích chặt.
- `engineSheetChecks` chấm thêm tăng áp, làm mát khí nạp, làm mát bằng dung dịch (`engine_type`, `aspiration`). Tờ chỉ ghi "Turbocharged" không đạt "làm mát khí nạp". Còn chữ lạ trong yêu cầu thì giữ chưa rõ.

## Đo
- `modelFacts`: gốc 43.323, mất 0, thêm 59, toàn Perkins: perkins-wuxi xi lanh 11, tỉ số nén 10, nạp khí 11, D × S 11; perkins xi lanh 8, nạp khí 8.
- Bảng còn lại không gắn: tờ thiếu nhãn (Isuzu, John Deere, Lister Petter: nhiều bảng chỉ có dòng số / bảng giá), hãng không khớp (Volvo Penta "D17" là khoá Deutz; VM Motori chưa có hãng trong danh mục), bảng nhiều cột / nhiều biến thể (MAN, Quanchai, Zichai).
- check-all 17 lượt, 47 cấu hình: 0 check đổi, 0 gói đổi thứ tự / danh sách, `check` hai lần giống nhau. Không có cấu hình nào trong bản chụp dùng được phần mới.
- Test `suppliers` 1.572 / 1.572. `quality --check` đạt (trước lượt bổ sung nạp khí; lượt đó không đổi `web/`).
- **Đổi đầu vào `candidates`, CHƯA đo cloud top 30.**

## Kiểm chéo: 7 fact có NCC khác ghi khác (đủ danh sách)
| Model | Thông số | Tờ hãng | NCC khác | Giải thích |
|---|---|---|---|---|
| 404D22G | D × S | 84 × 100 | hanyang-weifang 74*100; westinpower 84 | 4 × 84 × 100 = 2,217 L khớp 2,2 L; 74*100 cho 1,72 L; westinpower chỉ ghi đường kính |
| 403D15G | xi lanh | 3 | depco-power 4 | 3 × 84 × 90 = 1,496 L khớp 1,5 L; 19/20 NCC ghi 3 |
| 403D15G | D × S | 84 × 90 | hanyang-weifang 74*100 | như trên |
| 404D22TG | D × S | 84 × 100 | hanyang-weifang 74*100 | như 404D22G |
| 1103A33G | tỉ số nén | 19.25:1 | powerpack "19,25 : 1" | cùng số, khác dấu phẩy |
| 1103A33G | D × S | 105 × 127 | kangwo-guangdong 105*128 | 3 × 105 × 127 = 3,299 L khớp 3,3 L; 15/16 NCC ghi 127 |
| 403D11G | xi lanh | 3 | depco-power 4 | 17/18 NCC ghi 3; tờ hãng ghi 3 |

Hình học: 11 bộ có đủ xi lanh + D × S, dung tích tính khớp số lít tờ hãng; lệch tối đa 0,76 % so với trung vị NCC khác (5 model có số để so).
Nạp khí: 28 động cơ đọc được từ tờ hãng, mỗi model một giá trị, 0 model lệch với NCC khác. 40 fact mới không có NCC khác để so: chỉ kiểm được bằng hình học / tờ hãng.

## Bàn giao
- Việc kế: điều phối cho đo cloud SHA `f11974bf`, xem top 30; quyết định merge #1109.
- Chưa làm: dòng n1158 và zhengchi n162 ghi đường kính cần soát lại (không thuộc nhóm B).
- Quyết định đã nhận: Khoa 23/11 "làm tiếp" nhóm B; không tự merge; không đưa tên model vào commit / PR.
- Script đo (scratchpad phiên này, có thể mất): `b-soat.mjs`, `b-bang.mjs`, `b-asp.mjs`.
