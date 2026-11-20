# Nghiệm thu: tỉ số nén HSMT ghi trơ = số chính xác (ti-so-nen-1, 20/11/2026)

Brief: phiên điều phối `session_011tAj4Mp31GbgmLRtLgBxSA`. Khoa duyệt 20/11/2026: "sửa luật để kiểm tra tỉ số nén nếu hsmt ghi trơ".

- PR (DRAFT, không tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/981 — nhánh `ti-so-nen-1`, đã gộp origin/main (có #963 nhiên liệu: xung đột một dòng `hintsOf`, giữ cả `fuel` lẫn `comprOf`; một chỗ trong `suppliers/CLAUDE.md`, giữ cả hai mục).
- Không chép sang bot, không ghi gì lên web.

## Tệp đã đổi
- `suppliers/config-bot.mjs`: `comprLines`, `comprOf` (vào `hintsOf`: `compr`, `comprExact`); `comprFig`, `sameCompr`, `comprExactOf`, `comprChecks` (mới); `makerSheetChecks` nhận `{ hsmtCompr }`, `SHEET_CMP.compression` so chính xác khi có số trơ; `check` tính `hsmtCompr` một lần và gọi `comprChecks` ngay sau `makerSheetChecks`.
- `suppliers/config-prompt.md`: bỏ tỉ số nén khỏi nhóm "số thiết kế khác số → chưa rõ", thêm câu luật mới.
- `suppliers/hints-audit.mjs`: so thêm `compr` / `comprExact` với Phân tích (`analysisCompr`). (Brief chỉ nêu "đo bằng hints-audit"; tệp này ngoài danh sách 4 tệp, em sửa để luật mới có soát hệ thống — điều phối bỏ được nếu không muốn.)
- `suppliers/compr-exact.test.mjs` (mới), `suppliers/fixtures/runs/IB2600603983/config.expected.json` (đổi có chủ ý), `suppliers/CLAUDE.md`.

## Luật đã làm
- HSMT: mỗi dòng có nhãn tỉ số nén → `exact` / `min` (≥ > tối thiểu, "hoặc tốt hơn", "trở lên") / `max` (≤ < tối đa) / `band` (hai số, khoảng, ±, từ…đến) / `ref` (tham khảo, tương đương, tương tự ở dòng đó hoặc dòng kề). Số ở ô của nhãn, hoặc dòng sau khi dòng đó chỉ là giá trị (có dấu, có ":1" hoặc phần thập phân; số nguyên trơ một mình ở dòng sau KHÔNG nhận vì hay là số thứ tự dòng). Dải 5–30. `comprExact` = mọi dòng `exact` cùng một số.
- Chấm: chỉ áp khi CẢ đọc HSMT của code lẫn yêu cầu agent ghi (`requirement` + `quote`) đều trơ cùng số. Chỉ đổi check "chưa rõ" (hoặc chưa có). Lấy mọi nguồn `compr` của động cơ (`factsOf`, mọi dòng NCC + tờ hãng ghi model đó):
  - không nguồn nào ghi / có giá trị code không đọc ra một số ("18.2–18.3:1") → giữ "chưa rõ";
  - nguồn mâu thuẫn (không cùng một số đến độ làm tròn) → giữ "chưa rõ" (không lấy đa số); riêng mâu thuẫn mà có đúng một tờ hãng đúng mã → `makerSheetChecks` theo tờ hãng, so chính xác (đạt / không đạt);
  - một số, cùng số HSMT đến độ làm tròn → giữ nguyên;
  - một số, khác số HSMT → KHÔNG ĐẠT, byCode, `rule: "ti-so-nen"`, ghi chú nêu số HSMT, số nguồn và id NCC.
- HSMT có ≥ / ≤: như cũ. Số xi lanh: không đụng.

### Lựa chọn làm tròn (brief yêu cầu nêu rõ)
"Cùng số" = bằng nhau hoặc `roundCompat` (số dài hơn làm tròn về số chữ số của số kia ra đúng số kia VÀ lệch ≤ 1 %). Hệ quả: 14 ↔ 14,0 ↔ 14,1 ↔ 13,9 là một số; 14 ↔ 13,6 / 14,5 khác; 17 ↔ 17,3 khác (lệch 1,8 %). Chiều ngược (HSMT 14,1, nguồn chỉ ghi 14) cũng tính là cùng số — khác cách Khoa chốt cho dung tích 19/11 ("nguồn chỉ có số làm tròn thì không giữ"); em chọn vậy vì ở đây kết quả là "chưa rõ" chứ không loại. Số ca bị ảnh hưởng: trên 12 kết quả lưu có ĐÚNG 1 ca (IB2600603983 Mitsubishi S6R2-PTAA-C: aosif 14,1:1 / fdk-energy 14:1 ↔ HSMT 14:1 → giữ "chưa rõ"; nếu so chặt sẽ thành mâu thuẫn → vẫn "chưa rõ", tức kết quả không đổi).

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/` (sau gộp main): `# tests 1222 / # pass 1222 / # fail 0`.
- `node --test suppliers/compr-exact.test.mjs`: 7/7 qua.
- `GENBID_REGRESS_UPDATE=1 node --test suppliers/regress-config.test.mjs`: chỉ fixture IB2600603983 đổi (xem dưới).
- `node suppliers/hints-audit.mjs --texts genbid-work\specs`: `SUMMARY: 1499 gói, 1252 có Phân tích; lệch 10, thiếu 298` — trong đó tỉ số nén: 0 lệch, 21 thiếu (10 lệch còn lại là trường cũ, không phải tỉ số nén).

## Số đo
### (1) Ngưỡng tỉ số nén trên mọi HSMT (đo, `genbid-work\specs`, 1.499 gói có text.txt)
| | Số gói |
|---|---|
| Có nhắc tỉ số nén | 435 |
| Ghi trơ (`comprExact`) | 102 |
| Có dấu (một số, ≥ / ≤) | 257 |
| Hai số khác nhau / khoảng | 34 |
| Không có số ("Nêu cụ thể", "Theo tiêu chuẩn nhà sản xuất", "Nhà thầu đề xuất"…) | 42 |

Theo dòng: 115 trơ, 325 tối thiểu, 45 tối đa, 3 khoảng, 4 tham khảo. Soát tay danh sách 102 gói trơ: đúng dạng trơ; một gói (IB2400014133) là mô tả máy hiện hữu của gói bảo trì Wartsila (Gợi ý không chạy gói loại này). `hints-audit` 0 gói code đọc trơ mà Phân tích ghi có dấu. 4 gói trơ code KHÔNG đọc ra (số nguyên một mình ở dòng sau, vd IB2300123990 "Tỷ số nén" / "17"): luật không áp, giữ như cũ.

### (2) Bước chấm: xong (xem "Luật đã làm").

### (3) Chạy lại `check` trên mọi `configmatch` đã lưu (đo)
17 doc, 12 có cấu hình. Chữ HSMT qua `hsmtTextOf` (web), dữ liệu NCC `suppliers/cn` của 1e712e19, gỡ check / yêu cầu byCode cũ; mã gốc 1e712e19 ↔ nhánh (chạy lượt nhánh hai lần, giống hệt). Gói có yêu cầu tỉ số nén: IB2600601812 ("Nêu cụ thể"), IB2600602880 / IB2600609805 (trơ 17,3:1), IB2600603983 (trơ 14:1), IB2600613475 (≥ 20:1).
- 11 / 12 lượt KHÔNG đổi gì. IB2600602880, IB2600609805: 6BTAA5.9-G12 nguồn ghi 17,3:1 = HSMT → vẫn đạt.
- IB2600603983 đổi:

| Hạng cũ → mới | Động cơ | Tỉ số nén cũ → mới | Vì sao |
|---|---|---|---|
| 1 → 5 | Perkins 4006-23TAG2A | chưa rõ → không đạt | 5 dòng nguồn (depco-power, fdk-energy, gb-power, weiman-fujian ×2) đều 13,6:1 ≠ 14:1 |
| 2 → 6 | Cummins QSK23-G2 | chưa rõ → không đạt | 1 nguồn fdk-energy 16,0:1 |
| 4 → 7 | Volvo Penta TWD1744GE | chưa rõ → không đạt | tờ hãng volvo-penta 16,5:1 |
| 3 → 1 | Baudouin 6M31G825/5 | chưa rõ (giữ) | không nguồn nào ghi (PR #971: baudouin.com không công bố) |
| 5 → 2 | Mitsubishi S6R2-PTAA-C | chưa rõ (giữ) | 14:1 / 14,1:1 cùng số HSMT đến độ làm tròn |
| 6 → 3, 7 → 4, 8 → 8 | MTU 12V2000G63, Baudouin 6M33G825/5, MTU 12V1600G11F | chưa rõ (giữ) | nguồn không ghi |

Thứ hạng đổi chỉ do ba cấu hình có thêm 1 "không đạt" ở động cơ (tiêu chí xếp hạng đầu); các cấu hình còn lại giữ thứ tự tương đối.
- Fixture `regress-config` IB2600603983 (dữ liệu NCC đóng băng 17/11): Perkins và Cummins → không đạt "Tỷ số nén", xuống hạng 4–5; Volvo TWD1744GE trong fixture không có nguồn tỉ số nén (tờ volvo-penta [1016] vào sau) nên giữ "chưa rõ". Volvo / S6R2 / Baudouin 6M33 lên hạng 1–3.

### (4) Bước chọn ứng viên: CHƯA XONG
Không sửa `candidates`. Script đếm `do4.mjs` (scratch của phiên, chạy `candidates` cho mọi gói lịch sử có `comprExact` trên bidhist chụp 18/11, đếm dòng qua lọc / top 30 có động cơ mà mọi nguồn ghi số khác) đã chạy > 80 phút chưa ra; sẽ bổ sung vào tệp này nếu xong trong phiên. Ước tính (KHÔNG đo): ở IB2600603983 các dòng Perkins 4006-23TAG2A, Cummins QSK23-G2, Volvo TWD1744GE trong top 30 sẽ bị loại.

## 3 mẫu đối chiếu nguồn gốc
1. Perkins 4006-23TAG2A — fdk-energy [1103] https://fdkenergy.com/wp-content/uploads/2026/03/P825-H1.pdf: "| Compression Ratio | 13.6:1". HSMT IB2600603983: "14    Tỉ số nén    14 : 01".
2. Cummins QSK23-G2 — fdk-energy [1028] https://fdkenergy.com/wp-content/uploads/2026/03/CG825E-H1-QSK23-G2.pdf: "| Compression Ratio | 16.0:1".
3. Volvo Penta TWD1744GE — volvo-penta [1016] https://pubs.volvopenta.com/publications/47715495: "| Compression ratio | 16.5:1".
(Ca giữ "chưa rõ": Mitsubishi S6R2-PTAA-C — aosif [1132] https://www.aosif.com/w/files/doc/2022/01/220859711580.pdf "| Compression ratio | 14.1:1"; fdk-energy [1117] https://fdkenergy.com/wp-content/uploads/2026/03/M825-H1-S6R2-PTAA-C.pdf "| Compression Ratio | 14:1".)

## Rủi ro còn lại + quay lui
- Đọc nhầm dòng HSMT thành "trơ" (mô tả máy tham khảo không có chữ "tham khảo"/"tương đương") → cấu hình bị "không đạt" sai. Giảm bằng điều kiện kép (code + agent cùng trơ). Soát: `hints-audit` (trường `comprExact`).
- Dữ liệu NCC chép sai một số: nếu mọi nguồn cùng sai thì thành "không đạt" sai; nhiều nguồn khác nhau thì giữ "chưa rõ".
- Kết quả đã lưu trên web không tự đổi; chỉ lượt Gợi ý mới / chạy lại `check`.
- Quay lui: revert PR #981 (một squash commit); hoặc bỏ dòng gọi `comprChecks` và tham số `{ hsmtCompr }` trong `check`.

## Chưa kiểm được
- (4) số dòng / gói bị loại ở bước ứng viên (đang chạy).
- Chưa chạy một lượt Gợi ý thật (agent) với prompt mới.
- 4 gói trơ code không đọc ra (số nguyên trơ ở dòng sau).

## Cần ghi nhớ
- Khoa 20/11/2026: tỉ số nén HSMT ghi trơ = số chính xác ở bước chấm (PR #981). Cùng số đến độ làm tròn theo `roundCompat` (em chọn; 1 ca trên 12 kết quả lưu, không đổi kết quả) — cần Khoa xác nhận nếu muốn so chặt.
- Cần Khoa quyết: có lọc ở bước chọn ứng viên không (chờ số đếm (4)).
- Worktree `wt-ti-so-nen-goc` (detached 1e712e19) chỉ để đo; gỡ khi xong.
