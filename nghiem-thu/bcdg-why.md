# Nghiệm thu: BCĐG — lý do bị loại lấy từ khối thuyết minh

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/588 — nhánh `bcdg-why`, worktree `wt-bcdg-why`.

## Tệp đã đổi
- `bot/genbid-hsmt/bcdg-reason.js` — `explanationBlocks` (khối thuyết minh), `bcdgReasonEx` (trả `{text, source}`; `bcdgReason` giữ nguyên chữ ký), `pagesToRead` (trang OCR cho `--locate`).
- `bot/genbid-hsmt/ocr-pdf.js` — đường `--locate` gọi `pagesToRead` thay cho "trang nhắc mình ±1" (lưu chữ OCR nhanh `qs[n]`).
- `suppliers/bcdg.test.mjs` — 6 test mới. `genbid-sync.js` KHÔNG đụng.
- Không chép vào `genbid-hsmt\`, không ghi web thật.

## Cách làm
1. Tìm tiêu đề mục "Thuyết minh … không đáp ứng / không đạt / không hợp lệ / bị loại" (chịu lỗi OCR "Thuyét mình", ghép 3 dòng). Trong mục: dòng tiêu đề nhà thầu = `1) …:`, `b.1. …`, `- …:`, `b.2) …: <lý do>`, `Nhà thầu: …`, `CÔNG TY …:`. Tiêu đề mang tên mình/MST → lấy tới tiêu đề nhà thầu kế tiếp hoặc mục lớn kế tiếp (`c) …`, `4. Kết quả …`, `IV.`, `Bảng số N`). Trần 3.000 ký tự, cắt trọn dòng; nhiều mục (năng lực + kỹ thuật) nối bằng `…`. Gạch đầu dòng `+ Thuyết minh Biện pháp thi công` trong nội dung không đóng mục.
2. Tiêu đề mục tự nêu tên mình (và chỉ mình): "…: Có (Nhà thầu Công ty … Thảo Nguyên không đạt …)" → cả mục là của mình.
3. Không có khối của mình → rơi về logic cũ (dòng bảng / đoạn lẻ), `source = "doan"`. Không chắc → rỗng. Không AI.
4. `--locate`: trang nhắc mình ±1; nếu trang đó có dòng tiêu đề/nhắc "Công ty … Thảo Nguyên" (không phải dòng bảng kết bằng Đạt/Không đạt) → thêm các trang kế tiếp tới trang có tiêu đề nhà thầu khác hoặc mục lớn (trang đó cũng lấy), tối đa 8 trang thêm mỗi chỗ. Vẫn chạy dưới `deadline` + cache của đường cũ.

## Kiểm đã chạy
- `node --test` (gốc worktree): `# pass 466 / # fail 0` (gồm bài "19 gói thật" cũ).
- Đo 19 tệp `genbid-test\bcdg\text\*.txt` bằng `genbid-test\bcdg-why-measure.js` (đầu ra: `genbid-test\out-before\`, `out-after\`, `before.txt`, `after.txt`).
- OCR thật `--locate` trên scan IB2400120387 (65 trang, cache `genbid-test\ocr-why\c120387`): `SCAN 65/65`, `LOCATE 3,10,11,12,15,17,45`, `OCR 18/65` (cũ: 16 trang = 2–4, 9–18, 44–46; mới 18 trang: thêm 19, 20 vì trang 17 nhắc mình). Hai lượt chạy (lượt 1 chạm trần 10 phút, `PARTIAL`; lượt 2 chạy tiếp từ cache, 5 phút, xong). Đoạn trích từ chữ OCR `--locate` = đúng khối "1) Công ty … Thảo Nguyên:" 1.187 ký tự, y hệt chạy trên chữ OCR 40 trang cũ.

## Số đo 19 gói (ĐO, không ước tính)
Cột: độ dài trước → sau (ký tự) / nguồn sau / phán đúng-sai (tôi tự đọc từng đoạn).

| Gói | Trước | Sau | Nguồn | Phán |
|---|---|---|---|---|
| IB2400104800 | 728 | 498 | thuyết minh | ĐÚNG: b3 (năng lực: thiếu thuế, BCTC) + b5 (kỹ thuật: VDE 0530 ≠ 0875). Bỏ dòng bảng + dòng "bị loại do" (trùng ý) |
| IB2400120387 | **56** | **1187** | thuyết minh | ĐÚNG: "1) … Thảo Nguyên:" + bảng nhận xét bảo hành 4.1/4.2, dừng trước "2) … Tấn Đức" |
| IB2400254417 | 100 | 100 | thuyết minh | ĐÚNG (ngắn): "4. CÔNG TY … THẢO NGUYÊN – Thông số không đồng bộ một nhà sản xuất" |
| IB2400393199 | 0 | 0 | — | SÓT: có mục "eo Công ty … Thảo Nguyên" (OCR hỏng đánh số "1)") dòng 115 + lý do; chưa nhận |
| IB2400438227 | 795 | 795 | thuyết minh | ĐÚNG: b.1 mã hiệu GM96 ≠ catalogue GR-96, không trả lời làm rõ |
| IB2400564384 | 0 | 0 | — | Chưa xác định: báo cáo dạng "E-HSDT của Nhà thầu: …" bảng chấm từng tiêu chí, không có mục thuyết minh |
| IB2400577658 | 790 | 1889 | thuyết minh | ĐÚNG: b.1 năng lực – hợp đồng kinh nghiệm bị coi chuyển nhượng thầu (đầy đủ hơn) |
| IB2500211376 | 701 | 1114 | thuyết minh | ĐÚNG: "Nhà thầu: …" thiếu catalogue Kubota/Marelli, CE… "Kết luận: không đáp ứng kỹ thuật" |
| IB2500261097 | 795 | 234 | thuyết minh | ĐÚNG: "- CÔNG TY … THẢO NGUYÊN: bộ điều khiển SMARTGEN HGM6120 không có bảo vệ ngắn mạch". Mất bảng chấm chi tiết (nhiễu) |
| IB2500371475 | 496 | 1518 | thuyết minh | ĐÚNG: b.2 thiếu ủy quyền hãng, catalogue, hàng loạt "không đề xuất…" của biện pháp thi công |
| IB2500438703 | 656 | 668 | thuyết minh | ĐÚNG: b.4 hiệu suất đầu phát 92,8% < 93% + thiếu catalogue. (Trước: lấy đúng nhưng không qua mục) |
| IB2600248328 | 132 | 210 | thuyết minh | ĐÚNG: xuất xứ chào Trung Quốc ≠ yêu cầu Châu Âu. Có kèm dòng "Thuyết minh … không hợp lệ: không có" đứng trước — thừa nhưng không sai |
| IB2600253287 | 1001 | 95 | thuyết minh | ĐÚNG nhưng MỎNG: "b2. … Không đạt về kỹ thuật (theo đánh giá chi tiết)". Chi tiết nằm ở phần bảng chấm riêng "Nhà thầu: …" (trước kéo cả bảng nhiễu 1.001 ký tự) |
| IB2600365013 | 403 | 403 | dự phòng | ĐÚNG nhưng lẫn: câu "HSDT của Hưng Thịnh Phát và … Thảo Nguyên không đáp ứng khí thải ≥ Euro 4" (nêu 2 firm, lý do chung) + câu thừa "Trên cơ sở danh sách xếp hạng…" ở cuối |
| IB2600374560 | 0 | 0 | — | SÓT: bảng "STT / Tên nhà thầu / Lý do không đạt" hàng "1 Công ty … Thảo Nguyên | công suất 180 kVA < 405…", OCR xen cột nên tên không khớp |
| IB2600450087 | 135 | 602 | thuyết minh | ĐÚNG: "Có (Nhà thầu … Thảo Nguyên không đạt …)" + bảng nội dung/kết quả: model động cơ chưa vận hành ở VN |
| IB2600478079 | 624 | 252 | thuyết minh | ĐÚNG: "Bảng chào thông số không có dấu xác nhận hãng/đại lý" (mất ý "Nhà thầu không có tài liệu chứng minh… Test Report" mà bản cũ có — nghi dòng "- Nhà thầu không có …:" bị coi là tiêu đề nhà thầu khác; chưa kiểm sâu; xem rủi ro) |
| IB2600483082 | 715 | 356 | thuyết minh | ĐÚNG: Liên danh TN-HA điểm kỹ thuật 51 < 70 (bỏ đoạn lặp OCR thứ hai) |
| IB2600487332 | 489 | 489 | thuyết minh | ĐÚNG: "- … Thảo Nguyên: Có đề xuất kỹ thuật không hợp lý … biện pháp tổ chức thi công" |

Tổng: 16/19 gói có đoạn (trước cũng 16/19, nhưng nhiều đoạn chỉ là dòng bảng — IB2400120387 chỉ 56 ký tự). Có khối thuyết minh: 15 gói; dự phòng: 1; rỗng: 3 (2 sót thật, 1 chưa xác định). **Không đoạn nào lấy chữ của nhà thầu khác** (đã đọc cả 16; IB2600365013 nêu chung 2 firm trong một câu). Gói đạt kỹ thuật nhưng thua giá/trúng: trong 19 tệp không có gói nào rơi vào loại này (3 gói rỗng đều có tên mình bị loại hoặc chưa rõ) → không kiểm được "rỗng là đúng" ngoài test tổng hợp (`gói trúng … thì rỗng` có sẵn).

## 3 mẫu đối chiếu nguồn (chữ trong `genbid-test\bcdg\text\`)
1. IB2400120387.txt dòng ~516: "1) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: / Theo HSMT và nhận xét đánh giá HSDT nhà thầu: … 4. Bảo hành, sửa chữa hư hỏng: … Thời gian bảo hành > 12 tháng" (BCĐG, mục b) kỹ thuật).
2. IB2500438703.txt dòng ~302: "b.4) Công ty TNHH Thiết bị kỹ thuật Thảo Nguyên – … Hiệu suất tại cấp điện áp 380/220V chỉ đạt Max: 92.8% < 93%".
3. IB2600450087.txt dòng ~245: "b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật … Có (Nhà thầu … Thảo Nguyên không đạt yêu cầu về kỹ thuật nêu trong E-HSMT)".
(Nguồn gốc là PDF BCĐG tải về của gói, không có URL công khai riêng; đường dẫn tệp gốc: `genbid-test\bcdg\files\<TBMT>\`.)

## Rủi ro còn lại / quay lui
- Quay lui: revert PR; `bcdgReason(text)` vẫn trả chuỗi như cũ (chỉ đổi nội dung). `bcdg-step.js` không đổi (vẫn `bcdgReason(...) || oldReason`).
- Khối bị cắt sớm khi nội dung có dòng bắt đầu bằng gạch + "Công ty/Nhà thầu … :" (thấy ở IB2600478079: mất đoạn "Nhà thầu không có tài liệu chứng minh …"). Cắt sớm = thiếu chữ, không sai chữ.
- Báo cáo dạng bảng chấm từng tiêu chí / bảng "Lý do không đạt" có cột OCR xen (IB2400564384, IB2600374560, IB2600253287 mỏng) và mục OCR hỏng đánh số (IB2400393199) vẫn chưa trích đủ — cần cách khác (đọc bảng), chưa làm.
- Tiêu đề thuyết minh nêu nhiều nhà thầu (ví dụ "A và Thảo Nguyên không đáp ứng …") vẫn lấy theo logic cũ (kèm cả dòng dưới) — đã có từ trước, chưa sửa.
- Trần 3.000 ký tự: web/`bcdg/<TBMT>.reason` chưa kiểm có giới hạn độ dài thấp hơn (không đọc `genbid-sync.js`/web trong phạm vi này); cần kiểm trước khi merge nếu có giới hạn.
- Mở rộng trang OCR thêm tối đa ~8 trang/chỗ → lượt OCR có thể lâu hơn; vẫn dưới `deadline` (trần 10 phút) + cache. Trên IB2400120387 chỉ thêm 2 trang.

## Chưa kiểm được
- OCR `--locate` thật mới chạy trên 1 gói scan (IB2400120387); 5 gói scan khác chưa chạy lại (mỗi gói vài phút–10 phút).
- Chưa chạy end-to-end qua `bcdg-step.js` → web (không ghi web thật).
