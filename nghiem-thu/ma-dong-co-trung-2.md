# Nghiệm thu: mã động cơ trùng, PR 2 (tách ô hai mã)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1087 (draft), nhánh `ma-dong-co-trung-2`, head `1c413bea88d24219b31efda3f1ce1c932f6e18a7` (đã gộp main `6169af91`, test 1570 + 158 + 11 pass); số đo khoá bên dưới đo ở `fffd4f9a` so `dccc4669`.
- Quyết định: Khoa 20/11/2026, câu 1 b): ô hai mã tách hai bản ghi; ngoặc là mã riêng của NCC thì giữ mã ngoài ngoặc.
- Cách làm: danh sách tường minh `ENGINE_CELL_LIST` trong `web/catalog.js`: 91 ô tách, 16 ô giữ mã ngoài ngoặc. Bản ghi tách bỏ thông số phạm vi động cơ, giữ công suất và thông số tổ máy.

## Số đo `build()` (so `dccc4669`)

- Khoá động cơ 6.328 → 6.238: mất 107, mới 17, thêm dòng 153, bớt dòng 0.
- Dòng động cơ 48.702 → 48.822. Đầu phát 3.026 và bộ điều khiển 187 không đổi.
- Đổi hãng 2 khoá, từ trống sang Cummins: QSK60-G11, QSK50-G11. 1 khoá mới không có hãng.
- 17 khoá mới: 13 mã MTU 4000, DP372CC, DX22, DX37, PHF4075ZLD1. Cả 13 khoá MTU trong catalog chỉ có dòng của yanan-power (bảng [103]), mỗi mã có nguyên chữ trong dòng; chưa đối chiếu datasheet hãng. SỬA 23/11: nguồn KHÔNG chỉ một NCC ghi. comappower [106] ghi cả 13 mã kèm đuôi "(3D)" (23 dòng), catalog đọc thành khoá riêng "12V4000G74F(3D)", PR 3 `keyOf` mới gộp; krauter [2001] ghi 12V4000G74F, 12V4000G84F, 16V4000G74F (3 dòng), catalog chưa đọc bảng đó. Ô ghi hai mã kèm "(3B)" và "(3D)", nguồn không giải thích hai nhãn này.
- 107 khoá mất (181 dòng nguồn): khoá nào cũng có khoá thay, 0 dòng mất. Bảng cặp cũ → mới ở mục "Đối chiếu khoá" cuối tệp.
- Test 1529 + 158 + 11 pass, `quality --check` đạt, CI xanh ở head.

## Chưa làm

- Top 30 chưa đo cloud.
- Không tách: DE2V1000 (genlitec), X:KD…/XE:KD… (koop), ZS1110/295D và ZS1115/2100D (sunny-weifang, tách làm mất hãng 4 khoá), 8300D/M-2, 4D24TG0/A, 4D24TG2/A, 4100/125Z-09D, "(M)", "(E)", số trơ trong ngoặc, mã Baudouin "/5" "/6" "/S".
- `COMPR_SAME` còn mục "6M33G8D3/5(6M33G825/5)" không khoá nào dùng, vô hại, chưa gỡ.

## Đối chiếu khoá (so `dccc4669`, code `fffd4f9a`)

### 107 khoá mất

181 dòng nguồn của các khoá này; 0 dòng không còn ở khoá nào; 0 khoá không có khoá thay.

| Khoá cũ | Dòng | Khoá thay |
|---|---:|---|
| 10V1600G10F/G70F | 2 | 10V1600G10F, 10V1600G70F |
| 10V1600G10S/G70S | 2 | 10V1600G10S, 10V1600G70S |
| 10V1600G20F/G80F | 2 | 10V1600G20F, 10V1600G80F |
| 10V1600G20S/G80S | 2 | 10V1600G20S, 10V1600G80S |
| 1103D-33G3/G2 | 1 | 1103D-33-G3, 1103D-33G2 |
| 1104A-44TG1/ 1104D-E44TG1 | 1 | 1104A-44TG1, 1104D-E44TG1 |
| 1104C-44TAG2/ 1104D-E44TAG2 | 1 | 1104C-44TAG2, 1104D-E44TAG2 |
| 1104D-44TG1/ 1103A-33TG2 | 1 | 1103A-33TG2, 1104D-44TG1 |
| 1104D-44TG3/G2 | 1 | 1104D-44-TG3, 1104D-44TG2 |
| 1106A-70TAG2/ 1106D-E70TAG2 | 1 | 1106A-70TAG2, 1106D-E70TAG2 |
| 1106A-70TG1/ 1106D-E70TAG3 | 1 | 1106A-70TG1, 1106D-E70TAG3 |
| 1206J-E70TTAG3/4 | 3 | 1206J-E70TTAG3, 1206J-E70TTAG4 |
| 12M33G14D3/5 (12M33G1650/5) | 2 | 12M33G14D3/5, 12M33G1650/5 |
| 12V1600G10F/G70F | 2 | 12V1600G10F, 12V1600G70F |
| 12V1600G10S/G70S | 2 | 12V1600G10S, 12V1600G70S |
| 12V1600G20F/G80F | 2 | 12V1600G20F, 12V1600G80F |
| 12V1600G20S/G80S | 2 | 12V1600G20S, 12V1600G80S |
| 12V4000G14F(3B) 12V4000G74F(3D) | 2 | 12V4000G14F, 12V4000G74F |
| 12V4000G14S(3B) 12V4000G74S(3D) | 2 | 12V4000G14S, 12V4000G74S |
| 12V4000G24F(3B) 12V4000G84F(3D) | 1 | 12V4000G24F, 12V4000G84F |
| 12V4000G24S(3B) 12V4000G84S(3D) | 1 | 12V4000G24S, 12V4000G84S |
| 16V4000G14F(3B) 16V4000G74F(3D) | 1 | 16V4000G14F, 16V4000G74F |
| 16V4000G14S(3B) 16V4000G74S(3D) | 1 | 16V4000G14S, 16V4000G74S |
| 16V4000G24F(3B) 16V4000G84F(3D) | 1 | 16V4000G24F, 16V4000G84F |
| 18V2000G26F/G76F | 2 | 18V2000G26F, 18V2000G76F |
| 20V4000G14F(3B) 20V4000G64F(3D) | 1 | 20V4000G14F, 20V4000G64F |
| 20V4000G14S(3B) 20V4000G64S(3D) | 1 | 20V4000G14S, 20V4000G64S |
| 20V4000G24F(3B) 20V4000G74F(3D) | 1 | 20V4000G24F, 20V4000G74F |
| 20V4000G24S(3B) 20V4000G74S(3D) | 1 | 20V4000G24S, 20V4000G74S |
| 20V4000G34F(3B) 20V4000G84F(3D) | 1 | 20V4000G34F, 20V4000G84F |
| 20V4000G44S(3B) 20V4000G94S(3D) | 1 | 20V4000G44S, 20V4000G94S |
| 2206A/C-E13TAG2 | 1 | 2206A-E13TAG2, 2206C-E13TAG2 |
| 2206A/C-E13TAG3 | 1 | 2206A-E13TAG3, 2206C-E13TAG3 |
| 2206C/D-E13TAG2 | 1 | 2206C-E13TAG2, 2206D-E13TAG2 |
| 2206C-E13TAG2/3 | 1 | 2206C-E13TAG2, 2206C-E13TAG3 |
| 2206D-E13TAG3 /2206A-E13TAG6 | 1 | 2206A-E13TAG6, 2206D-E13TAG3 |
| 2506A/C-E15TAG1 | 1 | 2506A-E15TAG1, 2506C-E15TAG1 |
| 2506A/C-E15TAG2 | 1 | 2506A-E15TAG2, 2506C-E15TAG2 |
| 2506C/D-E15TAG1 | 1 | 2506C-E15TAG1, 2506D-E15TAG1 |
| 2506C-E15TAG1/2 | 1 | 2506C-E15TAG1, 2506C-E15TAG2 |
| 2606A/C-E13TAG2 | 1 | 2606A-E13TAG2, 2606C-E13TAG2 |
| 2606A/C-E13TAG3 | 1 | 2606A-E13TAG3, 2606C-E13TAG3 |
| 2806A/C-E18TAG1A | 1 | 2806A-E18TAG1A, 2806C-E18TAG1A |
| 2806A/C-E18TAG2 | 1 | 2806A-E18TAG2, 2806C-E18TAG2 |
| 2806A/C-E18TAG3 | 1 | 2806A-E18TAG3, 2806C-E18TAG3 |
| 2806A-E18TTAG4/5 | 1 | 2806A-E18TTAG4, 2806A-E18TTAG5 |
| 4008TAG1A/1 | 1 | 4008TAG1, 4008TAG1A |
| 4008-TAG2A/2 | 1 | 4008TAG2, 4008TAG2A |
| 4012-46TWG3A/ 4012-46TAG1A | 1 | 4012-46TAG1A, 4012-46TWG3A |
| 4012-46TWG4A/ 4012-46TAG2A | 2 | 4012-46TAG2A, 4012-46TWG4A |
| 403A-11G1/ 403D-11G | 2 | 403A-11G1, 403D-11G |
| 403A-15G1/ 403D-15G | 1 | 403A-15G1, 403D-15G |
| 404A-22G1/ 404D-22G | 2 | 404A-22G1, 404D-22G |
| 4B3.9-G1/ 4B3.9-G2 | 2 | 4B3.9-G1, 4B3.9-G2 |
| 4B3.9-G1/G2 | 3 | 4B3.9-G1, 4B3.9-G2 |
| 4BT3.9-G1/ 4BT3.9-G2 | 1 | 4BT3.9-G1, 4BT3.9-G2 |
| 4BT3.9-G1/G2 | 3 | 4BT3.9-G1, 4BT3.9-G2 |
| 4BTA3.9-G2(G45E1) | 8 | 4BTA3.9-G2 |
| 4BTA3.9-G2(G52E1) | 8 | 4BTA3.9-G2 |
| 4BTA3.9-G2 (QC50/60E) | 8 | 4BTA3.9-G2 |
| 4BTA3.9-G2 (QC58/67E) | 5 | 4BTA3.9-G2 |
| 4M10G100/6 WP4.1D115E201 | 1 | 4M10G100/6, WP4.1D115E201 |
| 4M10G83/6 WP4.1D95E201 | 1 | 4M10G83/6, WP4.1D95E201 |
| 4Z2.3-G11/G21 | 1 | 4Z2.3-G11, 4Z2.3-G21 |
| 4Z2.3-G12/21 | 1 | 4Z2.3-G12, 4Z2.3-G21 |
| 4Z2.7-G11/21 | 1 | 4Z2.7-G11, 4Z2.7-G21 |
| 4Z2.7-G12/21 | 1 | 4Z2.7-G12, 4Z2.7-G21 |
| 4Z3.0-G11/21 | 1 | 4Z3.0-G11, 4Z3.0-G21 |
| 4Z3.0-G12/21 | 1 | 4Z3.0-G12, 4Z3.0-G21 |
| 4Z3.2-G12/21 | 1 | 4Z3.2-G12, 4Z3.2-G21 |
| 4ZT3.2-G11/21 | 1 | 4ZT3.2-G11, 4ZT3.2-G21 |
| 4ZT3.2-G12/21 | 1 | 4ZT3.2-G12, 4ZT3.2-G21 |
| 6BT5.9-G1(G75M1) | 2 | 6BT5.9-G1 |
| 6BT5.9-G1/2 | 1 | 6BT5.9-G1, 6BT5.9-G2 |
| 6BT5.9-G1/G2 | 2 | 6BT5.9-G1, 6BT5.9-G2 |
| 6BT5.9-G2(G75E1) | 8 | 6BT5.9-G2 |
| 6BT5.9-G2(G84E1) | 8 | 6BT5.9-G2 |
| 6BT5.9-G2 (QC86/100E) | 2 | 6BT5.9-G2 |
| 6BT5.9-G2 (QC96/115E) | 4 | 6BT5.9-G2 |
| 6BTA5.9-G2(G75E1) | 2 | 6BTA5.9-G2 |
| 6CTA8.3-G1/2 | 1 | 6CTA8.3-G1, 6CTA8.3-G2 |
| 6LTAA8.9-G2/ 6LTAA8.9-G3 | 1 | 6LTAA8.9-G2, 6LTAA8.9-G3 |
| 6M11G110/6 WP6D132E201 | 1 | 6M11G110/6, WP6D132E201 |
| 6M11G135/6 WP6D158E201 | 1 | 6M11G135/6, WP6D158E201 |
| 6M33G8D3/5 (6M33G825/5) | 1 | 6M33G825/5, 6M33G8D3/5 |
| BF8M1015CP-G3/4/5 | 1 | BF8M1015CP-G3, BF8M1015CP-G4, BF8M1015CP-G5 |
| DX22 (DP222CC) | 1 | DP222CC, DX22 |
| DX37 (DP372CC) | 1 | DP372CC, DX37 |
| E3262LE202/212 | 2 | E3262LE202, E3262LE212 |
| E3262LE212/202 | 1 | E3262LE202, E3262LE212 |
| HC12V132ZL-LAG1/2A | 1 | HC12V132ZL-LAG1, HC12V132ZL-LAG2A |
| KTA19-G3A/G4 | 1 | KTA19-G3A, KTA19-G4 |
| KTA19-G4/G3A | 1 | KTA19-G3A, KTA19-G4 |
| KTA50-GS8/G8 | 1 | KTA50-G8, KTA50-GS8 |
| P126TI-II / P126TI | 1 | P126TI, P126TI-II |
| PHF4056ZD1(R1J01) | 1 | PHF4056ZD1 |
| PHF4075ZLD1(R4J01) | 1 | PHF4075ZLD1 |
| PHF6084ZD1(R1J01) | 1 | PHF6084ZD1 |
| PHF6100ZLD1(R1J01) | 2 | PHF6100ZLD1 |
| PHF6110ZLD1(R2J01) | 1 | PHF6110ZLD1 |
| PHF6132ZLD1(R4J01) | 1 | PHF6132ZLD1 |
| QSK38-G3/G5 | 2 | QSK38-G3, QSK38-G5 |
| QSK50-G4/G11 | 1 | QSK50-G11, QSK50-G4 |
| QSK60-G3/G7 | 2 | QSK60-G3, QSK60-G7 |
| QSK60-G4/G11 | 2 | QSK60-G11, QSK60-G4 |
| QSK60-G6/G7 | 1 | QSK60-G6, QSK60-G7 |
| S16R2-PTA/S16R2-PTAW | 2 | S16R2-PTA, S16R2-PTAW |

### 13 khoá MTU 4000 mới

#### 12V4000G74F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 2. Dòng ghi nguyên chữ mã này: 2.

- yanan-power [103]: `| YN1705MTU | 1705kVA | 1364kW | 1550kVA | 1240kW | 12V4000G14F(3B) 12V4000G74F(3D) | 12 | YN1705MTU`
- yanan-power [103]: `| YN1830MTU | 1830kVA | 1464kW | 1650kVA | 1320kW | 12V4000G14F(3B) 12V4000G74F(3D) | 12 | YN1830MTU`

#### 12V4000G74S (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 2. Dòng ghi nguyên chữ mã này: 2.

- yanan-power [103]: `| YN1690MTU | 1690kVA | 1352kW | 1625kVA | 1300kW | 12V4000G14S(3B) 12V4000G74S(3D) | 12 | YN1690MTU`
- yanan-power [103]: `| YN2000MTU | 2000kVA | 1600kW | 1750kVA | 1400kW | 12V4000G14S(3B) 12V4000G74S(3D) | 12 | YN2000MTU`

#### 12V4000G84F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN2035MTU | 2035kVA | 1628kW | 1840kVA | 1472kW | 12V4000G24F(3B) 12V4000G84F(3D) | 12 | YN2035MTU`

#### 12V4000G84S (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN2238MTU | 2238kVA | 1790kW | 2038kVA | 1630kW | 12V4000G24S(3B) 12V4000G84S(3D) | 12 | YN2238MTU`

#### 16V4000G74F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN2300MTU | 2300kVA | 1840kW | 2080kVA | 1664kW | 16V4000G14F(3B) 16V4000G74F(3D) | 16 | YN2300MTU`

#### 16V4000G74S (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN2625MTU | 2625kVA | 2100kW | 2350kVA | 1880kW | 16V4000G14S(3B) 16V4000G74S(3D) | 16 | YN2625MTU`

#### 16V4000G84F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN2500MTU | 2500kVA | 2000kW | 2250kVA | 1800kW | 16V4000G24F(3B) 16V4000G84F(3D) | 16 | YN2500MTU`

#### 20V4000G64F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN2800MTU | 2800kVA | 2240kW | 2500kVA | 2000kW | 20V4000G14F(3B) 20V4000G64F(3D) | 20 | YN2800MTU`

#### 20V4000G64S (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN3200MTU | 3200kVA | 2560kW | 2900kVA | 2320kW | 20V4000G14S(3B) 20V4000G64S(3D) | 20 | YN3200MTU`

#### 20V4000G74F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN3000MTU | 3000kVA | 2400kW | 2800kVA | 2240kW | 20V4000G24F(3B) 20V4000G74F(3D) | 20 | YN3000MTU`

#### 20V4000G74S (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN3500MTU | 3500kVA | 2800kW | 3175kVA | 2540kW | 20V4000G24S(3B) 20V4000G74S(3D) | 20 | YN3500MTU`

#### 20V4000G84F (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN3300MTU | 3300kVA | 2640kW | 3000kVA | 2400kW | 20V4000G34F(3B) 20V4000G84F(3D) | 20 | YN3300MTU`

#### 20V4000G94S (khoá này chỉ có yanan-power)

NCC: yanan-power. Dòng: 1. Dòng ghi nguyên chữ mã này: 1.

- yanan-power [103]: `| YN4000MTU | 4000kVA | 3200kW | 3500kVA | 2800kW | 20V4000G44S(3B) 20V4000G94S(3D) | 20 | YN4000MTU`

## Trạng thái 23/11/2026 (để phiên sau làm tiếp)

- Gốc main `2ba6c3b2`. #1073 đầu `958d51ec` (worktree `wt-cyl-layout-co`, đã có luật B Khoa chọn 23/11). #1087 đầu `214f1e42` (worktree `wt-ma-dong-co-trung-2`). Cả hai là draft, không tự merge; điều phối đang đo cloud gộp cùng #1101.
- Khi có số đo: liệt kê mọi dòng đổi trạng thái của #1073, cập nhật `cyl-layout-theo-co.md` (tệp đó còn ghi theo số đo cũ `9a262370`).
- PR 3 `keyOf` bỏ ngoặc: chỉ làm sau khi #1087 merge. Nó gộp 13 khoá comappower "12V4000G74F(3D)" với khoá của yanan-power.
- PR cỡ ảo `sizesOf` làm sau cùng (IB2300005377#1, IB2400145438#3, "605KVA/484KVA").
- Chờ Khoa: 51 dòng sát ngưỡng dung tích, chưa đổi.
- Bẫy: máy thiếu RAM, không chạy dump lớn song song; `node --test suppliers/ web/test/` ghi đè `web/test/fixtures/seed.json`, chỉ chạy `suppliers/*.test.mjs`, `web/test/spec-norm.test.mjs`, `static.test.mjs`.
- Luật Khoa 23/11: context quá 40 % thì lưu việc dở vào đây rồi Sync, tới 50 % tự compact; chỉ nhắn điều phối khi xong hoặc cần quyết định, ≤ 10 dòng.

## Soát 2 nhóm nghi oan sau đo gộp `f1db5c86` (23/11/2026)

Đầu #1087 mới: `63c167d6` (thêm một commit trên `214f1e42`). Test suppliers 1572, spec-norm 158, static 11, quality đạt. CHƯA đo lại top 30.

**Nhóm 1, "động cơ chỉ có dòng 60 Hz".** Tên tab "50Hz / 60Hz" của trang không vào `specTables`, nên phải đọc tệp nguồn.

| Khoá | Dòng bị loại | Chính dòng thuộc tần số nào | Kết luận 60 Hz lấy từ | Kết quả |
|---|---|---|---|---|
| 12V1600G20S | comappower COM750MTU | khối dưới nhãn "60Hz" (`sources/comappower/106.md` dòng 120 → 125) | camda "S1600/60HZ", mecca catalog trang 12 phải (60Hz) | loại ĐÚNG |
| 12V1600G20S | yanan YN750MTU | khối thứ ba trong 4 tab 50 / 50 II / 60 / 60 II (103.md dòng 263 → 267) | như trên | loại ĐÚNG |
| 1206JE70TTAG3 | long-gen LGPL-220EV | bảng đầu của tab "Perkins 50Hz / 60Hz" (109.md dòng 69 → 89); số 160/200 khớp bản 50 Hz của Perkins (159/198) | baifa n104 + n105; n104 ĐỌC SAI | loại OAN |
| 1206JE70TTAG4 | long-gen LGPL-220EV | cùng bảng 50 Hz | baifa n104 + n105; n104 ĐỌC SAI | loại sai căn cứ, xem dưới |
| 2206AE13TAG6 | ettes EP-500 | "Perinks Gensets List (60Hz, 1800rpm)" (146.md dòng 217 → 242) | Perkins selector trang 22 (60Hz), gb-power, legapower, uleengen | loại ĐÚNG |
| QSK60G6 | lees LSIC2500S3-6 | khối thứ hai dưới tab 50HZ / 60HZ (107.md dòng 170 → 186), đuôi "-6" | aosif, fdk-energy, jet-power, legapower ghi 60 Hz | loại ĐÚNG |
| 2806AE18TAG3 | victory V600P | cột Frequency của chính dòng ghi 60 | chính dòng + Perkins selector trang 22 | loại ĐÚNG |

Giả thuyết "G10 / G20 là 50 Hz, G70 / G80 là 60 Hz" không khớp nguồn: comappower và yanan xếp hậu tố F ở khối 50 Hz (G10F/G70F, G20F/G80F), hậu tố S ở khối 60 Hz (G10S/G70S, G20S/G80S); wintpower ghi G80F ở bảng 50 Hz, G80S ở bảng 60 Hz.

**Gốc lỗi TAG3 / TAG4.** Tiêu đề cột baifa n104 "1500/1800 RPM SWITCHABLE" bị `freqIn` đọc thành 60 Hz (chỉ "1800 RPM" khớp mẫu), dù trang là `50Hz-STAGE-V5`. Lỗi đọc có sẵn trên main; #1087 làm lộ vì tách ô "1206J-E70TTAG3/4" nên dòng 60 Hz sai sang khoá của long-gen.

**Phần sửa (`63c167d6`).** "1500/1800 rpm" không cho tần số nào. `spec-diff` so `214f1e42`: 153 bản ghi đổi `freq` 60 → không ghi (baifa 79, lister-petter 74), 0 mất, 0 thêm, không trường nào khác đổi. Hai NCC này có thể đổi dòng ngoài các khoá trên, nên CẦN ĐO LẠI.

**Điểm cần quyết, TAG4.** Perkins selector chỉ có TAG4 ở trang 60 Hz (180/225), còn long-gen ghi TAG4 trong bảng 50 Hz với đúng số của TAG3. Sau sửa dòng này quay lại gợi ý 50 Hz. Chưa thêm ngoại lệ.

**Nhóm 2, 12V1600G80F = 23,88 L.** Từ 3 dòng cùng mẫu: bdadl n135 BDA-M580, fukangsi n2007 FKS-M580, pengpai n127 PPDL-M580. 23,88 là dung tích của 12V2000 (bdadl ghi cùng số cho 12V2000G65 ở dòng gần đó). wintpower ghi G80F = 21; G10F, G20F, G70F, G80S đều 21. Lỗi dữ liệu nguồn có sẵn trên main, không do #1087. Điều phối duyệt 23/11: đã `dropspec` disp cả 5 bản chép (bdadl n112, n135; fukangsi n2007; pengpai n111, n127); không dùng `fixspec` vì dòng không ghi đường kính × hành trình. `spec-diff` so `63c167d6`: đúng 3 bản ghi đổi (23.88 → trống; 5 bản chép gộp còn 3 bản ghi), 0 mất, 0 thêm. Test 1576 + 158 + 11, quality đạt. CHƯA đo lại top 30.

## Luật "NCC ghi một tần số, tờ hãng chỉ ghi tần số kia" (Khoa 23/11, CHƯA mã hoá, chờ quyết)

- Căn cứ của TAG4 CÓ trong repo: `perkins` n5001, selector trang 6 (60Hz). Không có TAG4 ở trang 50Hz.
- Viết đúng chữ luật thì KHÔNG chạm dòng long-gen: `specTables` không giữ tên tab, nên dòng đó không có tần số (`hzOfRow` trống).
- Viết đúng chữ luật thì chạm 233 dòng trên 71 động cơ (đủ ở `tan-so-trai-to-hang-233-dong.tsv`; cột: loại, khoá, Hz của hãng, NCC, n, dòng). Căn cứ hãng: perkins 32 động cơ, sdec 15, weichai-power 14, huachai-deutz 4, yto 2, baudouin 2, quanchai 2 (một động cơ có thể có hai hãng).
- Căn cứ yếu: 70 / 71 động cơ chỉ có MỘT dòng hãng ghi tần số, hồ sơ perkins `status: partial`. 15 / 71 động cơ có nhiều dòng NCC ghi ngược hãng hơn ghi giống hãng (4012-46TAG3A: 27 ngược, 7 giống; 403D-15G: 24 / 22). "Không thấy ở trang kia" chưa chắc là hãng không bán ở tần số đó.
- Nếu mở rộng cho cả dòng không ghi tần số thì thêm tới 3.592 dòng (chưa soát).
- Đề xuất: chỉ gắn "cần xác nhận" cho dòng long-gen TAG4 bằng danh sách tường minh (NCC + n + chữ dòng), không làm luật chung cho tới khi tờ hãng đủ cả hai tần số.
