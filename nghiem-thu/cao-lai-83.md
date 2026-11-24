# Cào lại dòng bảng NCC bị cắt giữa ô (nhóm D của #1105), 24/11/2026

Nhánh `fix/cao-lai-83`, worktree `C:\Projects\GenSet Pro\wt-cao-lai-83`, từ origin/main `1999b631`. PR NHÁP, chưa merge, chưa đo top 30.

## Danh sách dòng (dựng từ `classify.mjs` chạy lại trên main, đối chiếu rest-blocks.txt của #1105)
82 dòng (không phải 83; không thấy dòng thứ 83): sanq-power 23 (n102 11, n107 11, n123 1), conductorjasa 26, jet-power 25 (n129), camda-generator 8 (n155).

| Nhóm | Dòng | Nguyên nhân thật | Xử lý |
|---|--:|---|---|
| sanq n102 / n107 / n123, jet n129, camda n155 | 56 | tệp nguồn lưu 28/10/2026, TRƯỚC #123 (29/10) cho `htmlToText` giữ mỗi ô trên một dòng: "P-\n220\n\| 220 \|…", "QSKTAA19-G4\nNR2" | cào lại, sửa |
| conductorjasa n101–n103 | 7 | KHÔNG cắt ô; hàng MJPS có ô "305 L/jam" và "–" nên `isData` < 40 %, `tableOf` trả null | KHÔNG sửa (đổi `tablesOf` ảnh hưởng mọi NCC) |
| conductorjasa n116 | 19 | khối không có chữ kVA / kW (tiêu đề nằm ngoài khối) | KHÔNG sửa |

Bộ thu thập KHÔNG phải sửa: tải lại 5 trang bằng `get` + `htmlToText` hiện tại (đường cào sẵn có, tải trực tiếp, không cần Firecrawl, không dùng khoá), chữ trang y hệt tệp cũ khi bỏ khoảng trắng (camda chỉ khác đồng hồ "21:00" → "21:13"). Sau đó `tablesOf` ra đủ dòng.

## Đã đổi (chỉ 5 trang)
- `sources/{jet-power/129, sanq-power/102, 107, 123, camda-generator/155}.md` ghi lại, Accessed 2026-11-24.
- `specs/` thay bảng của đúng n đó bằng `tablesOf` mới; `cn/` sinh bằng `merge-specs.mjs jet-power sanq-power camda-generator` (trước đó chạy trên main ra diff 0). `git diff cn/` chỉ chạm bảng n của 5 trang + `accessedAt` của 5 nguồn.
- Test mới `suppliers/cao-lai-83.test.mjs` (3 ca); ghi bẫy vào `suppliers/CLAUDE.md` (sửa câu "82 tệp nguồn cắt").

## Trước / sau (dòng bảng; bản ghi `fromSupplier` so từng bản ghi bằng `rec-diff.mjs`)
| Trang | Dòng trước → sau | Ghi chú |
|---|--:|---|
| jet-power n129 | 15 → 40 (+25) | thêm 25 dòng P-220 … P-2500; bản ghi 1081 → 1130 (+49, mất 0, đổi 0) |
| sanq-power n102 | 52 → 62 (+10; 2 bảng) | thêm 10 dòng, 1 dòng cũ ghép lại đủ ô (SQC715 … SQC1650; SQC715 "QSKTAA19-G4" → "QSKTAA19-G4 NR2") |
| sanq-power n107 | 102 → 111 (+9; 4 bảng) | thêm dòng SQC715… và SQC750-6 ghép lại đủ ô; tiêu đề "Genset Weight Kg" liền một ô |
| sanq-power n123 | 13 → 14 (2 bảng → 1) | bảng bị cắt đôi nay liền; SQN578 / SQN619 đủ ô kích thước |
| camda n155 | 11 → 19 (+8; 1 → 2 bảng) | +8 dòng KDGC660S1 … KDGC1505S1 (bảng 60 Hz thành bảng riêng, tiêu đề lấy nguyên văn) |

sanq-power: 1164 → 1320 bản ghi, thêm 158, mất 2 (hai bản ghi cắt "QSKTAA19-G4" và SQN578 đầu phát bị thay bằng bản đủ ô, có THÊM tương ứng), đổi 114: 102 chỉ thêm `specs` (fuel / weight / dims, vì nhãn cột "Genset Weight Kg" nay liền ô) + 12 đầu phát n123 có `other` (động cơ) vì tiêu đề nay nguyên. camda-generator 86 → 124 (+38, mất 0, đổi 0).

## Dòng trang nguồn nay không còn
Không dòng nào. Cả 56 dòng đều có trên trang sống 24/11/2026.

## Giữ nguyên chữ trang (không sửa)
jet n129 có "P- 220" (hàng 1106A -70TAG4) và "P- 1500" / "4012 - 46TWG3A": trang ghi xuống dòng giữa "P-" và "220", ghép bằng khoảng trắng; tên tổ máy / mã khác dạng "P-220". Không chuẩn hoá.

## Kiểm
- `verify.mjs`: 436 hồ sơ, 0 lỗi. `quality.mjs --check`: không xấu đi.
- `spec-diff git:HEAD . --gate`: qua (đảo vai 0 → 0; bản ghi 63.836 → 64.079; thêm 484, mất 241 là do so theo chỉ số bảng; 102 giá trị "thêm" cần soát tay đều là fuel / weight / dims của sanq n107).
- Test mới 3 / 3; toàn bộ `suppliers/*.test.mjs`: xem kết quả cuối báo cáo gửi điều phối.

## Còn lại (chưa làm, đề xuất)
- 6 trang cùng thời (Accessed 28/10) còn mảnh ô: camda n138 (2), n139 (1), mecca-power n144, n159 (tiêu đề cột), sanq-power n103, n108 (1 dòng SQIC2500 "PI734H/L-\nVSI804R"). Cùng cách cào lại, 6 trang. Chưa làm vì ngoài danh sách 82 dòng.
- conductorjasa 26 dòng: sửa `tableOf` (nhận bảng không có dòng "đủ số" khi mọi dòng là dòng máy) cần đo cả 3.983 tệp như #1105.
- Chưa đo top 30 (1.093 lượt) và row-flags: PR đụng candidates.

## Đợt 2: 6 trang cùng thời còn mảnh ô (cùng nhánh / PR #1208)
Cào lại đúng cách như 5 trang trước: camda-generator n138, n139; mecca-power n144, n159; sanq-power n103, n108. Chữ trang y hệt tệp cũ khi bỏ khoảng trắng (camda chỉ khác đồng hồ "21:00" → "21:43"). Cắt ở đây là TIÊU ĐỀ cột ("Dimension\nL×W×H（mm)", "Gov./\nEmission", "Genset Weight\nKg") và 1 dòng sanq (SQIC2500 "PI734H/L-\nVSI804R"); số dòng bảng không đổi, trừ sanq.

| Trang | Dòng bảng trước → sau | Bản ghi (so từng bản ghi, `rec-diff`) |
|---|--:|---|
| camda n138 / n139 | 68 → 68; 16 → 16 | camda 124 → 272 (+148, mất 0, đổi 0): tiêu đề đủ ô nên đọc ra bản ghi cho các bảng trước đây chỉ có tiêu đề cụt (86 + 50 + 12) |
| mecca-power n144 / n159 | 34 → 34; 17 → 17 | 1709 → 1726 (+17, mất 0, đổi 0): bảng n159 có thêm dòng tiêu đề đầu "Model \| LTP \| PRP …" (trước chỉ có dòng đơn vị) → 17 dòng MC11Y… ra bản ghi |
| sanq n103 / n108 | 36 → 37; 57 → 58 | 1320 → 1366 (+46, mất 0, đổi 75: chỉ thêm `specs` fuel / weight / dims) |

Ghi chú mecca: `merge-specs mecca-power` chết ENOENT (`specs/` có trang n106 không có tệp nguồn: bẫy "specs lệch cn" đã ghi), nên `cn/mecca-power.json` chỉ sửa đúng một chỗ: header của bảng n159 lấy từ bảng `specs/` cùng dòng; các bảng n144 trong `cn/` giữ nguyên (cn bỏ bảng trùng nguyên dòng). Test so `specs/` với `tablesOf`, bỏ so `cn/` cho mecca.

Kiểm đợt 2: verify 436 / 0 lỗi; `quality --check` đạt; `spec-diff git:HEAD . --gate` đạt (đảo vai 0 → 0; 64.079 → 64.290, chỉ mới 211, chỉ cũ 0; 75 giá trị "cần soát tay" là fuel / weight / dims của sanq n103 / n108); test `cao-lai-83.test.mjs` 3 / 3 (nay 11 trang).

## conductorjasa: việc riêng
26 dòng không bị cắt ô, để nguyên. 19 dòng n116 không có chữ công suất trong khối; 7 dòng MJPS (n101–n103) bị `isData` loại vì ô "305 L/jam" và "–". Sửa `tableOf` / `tablesOf` thì đo cả 3.983 tệp nguồn như #1105.
