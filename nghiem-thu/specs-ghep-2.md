# Nghiệm thu: specsMerge lần 2 — công suất so theo con số, mục trùng khác chữ (12/11)

PR nháp: xem cuối tệp. Worktree `C:\Projects\GenSet Pro\wt-specs-ghep2`, nhánh `specs-ghep-2` (từ origin/main 792484e, sau #569). Không gọi Claude thật, không ghi web thật, `genbid-hsmt\` không bị đụng.

## Tệp đổi
- `bot/genbid-hsmt/genbid-sync.js` (chỉ phần ghép, trước `specsMerge`):
  - **generatorCapacity** (`capFig`, `capCompare`): mỗi con số kèm đơn vị (kVA/kW/không đơn vị) và loại (liên tục/dự phòng, chỉ khi văn bản nêu đúng một loại); "a – b", "a đến b", "từ a đến b" là khoảng, số nằm trong khoảng được coi là có nêu. Ghép lần lượt từng phần:
    - số của phần này đều có ở phần kia (hoặc ngược lại) → không mâu thuẫn, GIỮ NGUYÊN câu đầy đủ hơn (nhiều con số hơn, bằng nhau thì dài hơn); không viết câu mới, không đổi số.
    - một phần không có con số nào, phần kia có → lấy phần có số.
    - mỗi phần có số mà phần kia không có, CÙNG đơn vị (vd 500 kVA liên tục / 500 kVA dự phòng; 2 x 500 / 3 x 500; 500 / 250 kVA) → "chưa rõ": null (hoặc dựng từ generatorSets như cũ nếu có) + ghi chú.
    - mỗi phần có số mà phần kia không có nhưng KHÁC đơn vị (kVA với kW) → không mâu thuẫn, giữ câu đầy đủ hơn + ghi chú phần kia ghi thêm gì.
  - **technicalSpecs trùng khác chữ** (`specTwin`): coi là một mục khi hai mục đến từ HAI PHẦN KHÁC NHAU, và `sameItems` (hai tên mục không nói về hai thứ khác: khác cỡ máy kèm con số, hoặc khác thành phần động cơ / đầu phát / điều khiển / ATS / MDB / hòa đồng bộ / ống khói / cách âm / bồn / ắc quy), và cùng tập số trong yêu cầu, và một trong ba:
    1. trích dẫn của cái này chứa cái kia nguyên từ (sau NFC, chữ thường, bỏ dấu câu/khoảng trắng), cả hai ≥ 25 ký tự;
    2. yêu cầu chuẩn hoá gần y hệt (≥ 85% từ chung, ≥ 25 ký tự);
    3. cùng yêu cầu chuẩn hoá và cùng tên mục sau khi bỏ cỡ máy ("Tổ máy 1000 kVA: Xuất xứ" = "Tổ máy: Xuất xứ"), CHỈ khi chương chỉ có một cỡ máy (từ generatorSets); chương nhiều cỡ thì (2) cần cả hai tên nêu cùng cỡ.
    Giữ mục có trích dẫn dài hơn. Quy tắc cũ (cùng trích dẫn nguyên văn, hoặc cùng mục + cùng yêu cầu) giữ nguyên, thêm `sameItems` (cùng trích dẫn nhưng khác cỡ máy / thành phần thì không gộp). Mọi trường hợp còn ngờ → để trùng.
- `suppliers/specs-parts.test.mjs`: +5 test (công suất theo số: ví dụ IB2500310648, mâu thuẫn thật, khác đại lượng; mục trùng khác chữ giữ trích dẫn dài hơn; không gộp: hai cỡ máy, động cơ vs đầu phát, cùng phần, khác con số, tiêu đề chứa trích dẫn ngắn của mục khác).

## Số đo (ĐO, mô phỏng lại phép ghép trên dữ liệu 4 gói đã đăng)
Câu trả lời từng phần không còn (parts\ đã xoá) nên mô phỏng bằng cách tách danh sách `technicalSpecs` ĐÃ ghép thành hai phần theo số mục mỗi phần ghi trong log lượt chạy (specs-parts.log: IB2400446772 49|26, IB2500310648 5|25, IB2500057816 25|6) rồi chạy `specsMerge` bản cũ (origin/main) và bản mới. Chỉ đo được phần trùng CÒN LẠI sau phép ghép cũ, không đo được cái phép ghép cũ đã gộp trước đó.
| Gói | Mục sau ghép cũ | Sau ghép mới | Ghi chú |
|---|---|---|---|
| IB2400446772 | 75 | **61** (−14) | 0 ghi chú mới |
| IB2500310648 | 30 | 30 | không có cặp trùng |
| IB2500057816 | 31 | 30 (−1) | xem rủi ro |
| IB2200015701 | 4 | không mô phỏng được | không biết mục nào thuộc phần nào (4 phần, chỉ 6 mục) |
Còn nghi trùng ở IB2400446772 sau khi gộp: quét cặp có ≥ 60% từ chung ở yêu cầu và ≥ 40% ở tên mục → còn 7 cặp, trong đó đa số là khác thật (động cơ vs đầu phát cùng viết "Ký hiệu do nhà thầu đề xuất; nước sản xuất G20…", tủ ATS-1 vs ATS-2, công suất tổ máy vs đầu phát); trùng thật còn khoảng 3: "Bộ điều khiển - ký hiệu, nước sản xuất" / "Điều khiển: Ký hiệu, nước sản xuất", "Đầu phát - ký hiệu, xuất xứ, chủng loại" / "Đầu phát: Ký hiệu, nước sản xuất", "Động cơ - tốc độ vòng quay và điều tốc" / "Động cơ: Cơ chế điều tốc…" (chia khác nhau, không khớp được mà không đoán). Tức dòng trùng 14 → khoảng 3 (ước tính bằng mắt trên 7 cặp).
generatorCapacity IB2500310648: chạy `specsMerge` với hai chữ ngắn gọn "hai nhóm ≤ 10 kVA / 10–30 kVA" và "từ 5 kVA đến 30 kVA" (chữ đầy đủ của lượt thật không còn, ghi chú trong analysis đã bị cắt 40 ký tự) → giữ nguyên câu đầy đủ hơn, 0 ghi chú (trước: null + "chưa rõ"). Chưa kiểm với chữ gốc đầy đủ.
Không mô phỏng được: generatorSets/`_notes` (không đổi trong lần này), ảnh hưởng lên IB2200015701 (xem trên), chữ capacity thật của 4 gói.

## Lệnh kiểm đã chạy
```
node --check bot/genbid-hsmt/genbid-sync.js   -> OK
node --test suppliers/specs-parts.test.mjs    -> 18/18 (13 cũ + 5 mới)
node --test (toàn repo, trong worktree)       -> 400 tests, 400 pass, 0 fail  (main 395 + 5)
```

## 3 mẫu đối chiếu với nguồn (IB2400446772, `genbid-work\specs\IB2400446772\text.txt`)
1. "Tổ máy 1000 kVA: Động cơ - ký hiệu, nước sản xuất, thương hiệu" (mục 1.3 B.1-4, trích dẫn "Nhà thầu cung cấp đường link website hoặc") và "Tổ máy - Động cơ: Ký hiệu, nước sản xuất, thương hiệu" (mục 8 B.1–B.4, trích dẫn "Nhà thầu cung cấp đường link website"): dòng 386 và dòng 3782 của text.txt, cùng bảng lặp lại; gộp, giữ trích dẫn dài (dòng 386).
2. "Tình trạng máy và năm sản xuất": dòng 370 "Máy mới 100%, sản xuất năm 2024 trở về sau" và dòng 3761 "…năm 2024 trở về" (bản kia cắt ngang dòng); gộp, giữ câu đủ.
3. "Máy phát điện chạy dầu diesel": dòng 363 "Máy phát điện chạy dầu diesel; Tổ máy phát điện" và dòng 3752 "…; Tổ máy"; gộp.

## Rủi ro còn lại + quay lui
- Gộp nhầm có thể xảy ra khi trích dẫn mục này chứa trích dẫn mục kia nhưng nói điều khác. Đã chặn bằng: cùng tập số, ≥ 25 ký tự, cùng thành phần/cỡ máy. Một ca vẫn gộp (IB2500057816): "Công suất liên tục | 100kVA" (bảng A.1) nằm trọn trong trích dẫn nhãn bản vẽ "CÔNG SUẤT LIÊN TỤC: 100kVA" của mục "Loại động cơ và công suất": coi là cùng một sự kiện, giữ mục có trích dẫn dài (nhãn bản vẽ), mất tham chiếu bảng A.1. Đáng xem nếu Khoa muốn giữ cả hai nơi nêu.
- Chương nhiều cỡ máy nhưng các phần không đọc ra generatorSets thì `multi` false (quy tắc 3 có thể gộp mục không nêu cỡ với một cỡ). Hiếm.
- Danh sách thành phần (`SPEC_COMP`) cố định, thiếu thì hai mục khác thành phần mà tên không chứa từ khoá vẫn có thể gộp nếu yêu cầu giống hệt.
- Số trong generatorCapacity viết bằng chữ ("hai nhóm") không đọc được; khoảng "a – b" chỉ nhận dấu - – — ~ "đến" "tới"; "10/30 kVA" tính hai số riêng.
- Quay lui: revert PR. Kết quả đã đăng chỉ khác ở số mục / ghi chú; đọc lại gói để thay.
- Chép vào bot sau khi merge: như `specs-nhieu-phan.md` (copy genbid-sync.js, chạy `bot\Backup-GenBidBot.ps1`); không cần restart.

## Chưa kiểm
- Lượt Claude thật với bản ghép mới; chữ generatorCapacity gốc của IB2500310648 và 3 gói còn lại.
- IB2200015701 (4 phần).

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/572
