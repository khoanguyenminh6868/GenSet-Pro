# Nghiệm thu: BCĐG-3 — reread không xoá lý do, verdict fail/pass, 2 gói sót

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/590 — nhánh `bcdg-3` (từ origin/main 02734db), worktree `wt-bcdg-3`. Không chép vào `genbid-hsmt\`, không ghi web thật.

## Tệp đã đổi
- `bot/genbid-hsmt/bcdg-step.js` — giữ `reason`/`verdict` cũ khi đọc không ra gì hoặc chưa đọc hết; chỉ `--reread` đọc hết mà không thấy gì mới xoá; chữ đọc dở (OCR quá giờ) không thay lý do cũ; `failDoc` giữ `verdict`; ghi `verdict`.
- `bot/genbid-hsmt/genbid-sync.js` — không xoá cache OCR khi đọc xong; `bcdgSweepCache` dọn thư mục cache theo tuổi (14 ngày, tính từ tệp mới nhất trong thư mục).
- `bot/genbid-hsmt/bcdg-reason.js` — `bcdgReasonEx` trả `{text, source, verdict}`; nhận đầu mục OCR hỏng ("eo/© Công ty …") và hàng bảng "1 Công ty … | lý do" (tên kéo xuống dòng sau); khối dừng ở "Kết luận và kiến nghị" / "Tổ chuyên gia nêu…"; mục "Thuyết minh … không hợp lệ: Không có" là mục rỗng (không mở khối).
- `web/index.html` — `bcdgHtml` theo `verdict`.
- `suppliers/bcdg.test.mjs` — +9 test.

## Cách phân loại verdict (không AI)
- `fail`: có khối thuyết minh của mình, hoặc đoạn dự phòng có chữ không đạt/không đáp ứng/bị loại thật, hoặc dòng tên mình kết bằng "Không đạt".
- `pass`: dòng tên mình có đủ ≥3 ô "Đạt" liền nhau (hợp lệ/năng lực/kỹ thuật) và không có chữ không đạt của mình. `text` chỉ là phần "nội dung bổ sung, làm rõ E-HSDT" nếu có công văn/nội dung thật (rỗng khi "(nếu có): Không có").
- `""`: còn lại (như cũ, hiện dưới tiêu đề cũ). Doc cũ không `verdict` hiện như cũ.
- Web: fail → "Lý do không đạt (trích báo cáo đánh giá)"; pass → một dòng "Đạt các bước đánh giá" + khối gập đóng sẵn "Nội dung làm rõ E-HSDT" (chỉ khi có text).

## Kiểm đã chạy
- `node --check` 3 tệp bot: ok. `node --test` (gốc worktree): `# tests 475 / # pass 475 / # fail 0`.
- Dựng HTML thật của `bcdgHtml` (cắt từ web/index.html, state giả) cho 5 trường hợp (doc cũ / fail / pass+làm rõ / pass không làm rõ / không rõ): đúng như trên (`genbid-test\bcdg3\render-web.js`). CHƯA xem UI trong trình duyệt (chỉ kiểm HTML dựng, không kiểm kiểu dáng).
- Đo 19 tệp `genbid-test\bcdg\text\*.txt` + chữ lưu trên web của 2 gói đạt (`genbid-test\bcdg3\measure.js`, đầu ra `out-final2\`).

## Số đo (ĐO)
Trước = bản main 02734db (#588). Cột phán = tôi tự đọc.

| Gói | verdict | Trước → sau (ký tự) | Phán |
|---|---|---|---|
| IB2400104800, IB2400120387, IB2400254417, IB2400438227, IB2400577658, IB2500211376, IB2500261097, IB2500371475, IB2500438703, IB2600248328, IB2600253287, IB2600450087, IB2600478079, IB2600483082, IB2600487332 | fail | không đổi | như nghiệm thu bcdg-why (đúng; 253287 và 478079 vẫn mỏng/cắt sớm) |
| IB2600365013 | fail (đoạn dự phòng) | 403 → 403 | đúng nhưng lẫn câu nêu 2 firm (như trước) |
| **IB2400393199** | fail | **0 → 2307** | ĐÚNG: "eo Công ty … Thảo Nguyên" – hàng hoá thay thế không đúng (RAL 7036 ≠ 7035…) + các bảng so sánh OCR nhiễu + "không có thuyết minh mức độ hiểu biết"; dừng trước "© Công ty … Hữu Toàn Group". Nhiều chữ OCR nhiễu nhưng toàn của mình |
| **IB2600374560** | fail | **0 → 846** | ĐÚNG: "1 Công ty TNHH thiết bị … Thảo Nguyên": công suất liên tục 180 kVA < 405, dự phòng 198 < 450, thiếu giám sát từ xa/ATS, thuyết minh BPTC không phù hợp; dừng ở mục c) |
| IB2400564384 | "" | 0 → 0 | xem dưới |
| pass-IB2600419125 (chữ lưu trên web) | pass | 520 (lẫn bảng) → 472 | ĐÚNG: "Đạt Đạt Đạt", làm rõ: công văn 6337/CV-VNPT Net1 + công văn trả lời 199/CVLR; bỏ dòng bảng |
| pass-IB2600480017 (chữ lưu trên web) | pass | 537 → 0 | ĐÚNG: không có làm rõ ("(nếu có): Không có") |

Không đoạn nào lấy chữ của nhà thầu khác (đã đọc cả 17 + 2 gói mới). Hai gói đạt kiểm bằng chữ ĐÃ LƯU trên web (không tải lại PDF), nên chỉ kiểm được logic trên chữ đó, không kiểm OCR lại.

## IB2400564384 — gói chưa rõ (kết luận)
Bản `text\` cũ chỉ OCR 30/130 trang (phần của mình mới tới hợp lệ: Đạt). Tôi chạy lại `ocr-pdf.js --locate` trên PDF 130 trang (`genbid-test\bcdg3\IB2400564384-locate.txt`): trang 14, 47, 122–125, 127 nhắc mình; **mình KHÔNG đạt về năng lực/kỹ thuật** (đọc từ bảng "Bảng số 03": "Nhà thầu chưa có tài liệu chứng minh nghĩa vụ thuế, TCT có công văn 266/TCg-KT … nhà thầu không có văn bản trả lời" + "bộ điều khiển G545 của hãng Grupel … chưa nêu rõ chức năng bảo vệ mất kích từ, nhà thầu không làm rõ"), nhưng ô tên nhà thầu của dòng đó bị OCR xé ("TNHH THU / 3 / THIẾT BỊ KỸ / Không Đạt") nên bộ trích không gắn được vào mình. Kết quả: verdict "" và không có đoạn (không sai, không đủ). Lỗi tôi bắt được khi đo: bản đầu của quy tắc `pass` coi dòng "THẢO NGUYÊN … Đạt" ở Bảng 02 (chỉ tính hợp lệ) là "pass" → SAI; đã siết thành "≥3 ô Đạt liền nhau" (có test). Muốn trích gói này cần đọc bảng theo cột (chưa làm).

## 3 mẫu đối chiếu nguồn
1. IB2400393199.txt dòng 115: "eo Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên / - Tính hợp lệ của vật tư, thiết bị thay thế … nhà thầu Chào Kích thước … màu RAL 7036".
2. IB2600374560.txt dòng 205–206: "1 Công ty TNHH thiết bi | + Hồ sơ mời thầu yêu cầu công suất liên tục là > 405 / kỹ thuật Thảo Nguyen | kVA, nhà thầu chào công suất liên tục là 180kVA."
3. IB2600419125 (web `bcdg/IB2600419125`, đọc bằng /api/requests): "Công ty TNHH thiết bị kỹ thuật Đạt Đạt Đạt / Thảo Nguyên … Công văn trả lời của Nhà thầu … Số 199/CVLR ngày 18/08/2026".
(Nguồn gốc là PDF BCĐG của từng gói, không có URL công khai riêng.)

## Rủi ro còn lại / quay lui
- Quay lui: revert PR; doc có thêm trường `verdict` — bản cũ bỏ qua nó. Web bản cũ hiện như trước.
- Doc cũ (IB2600419125, IB2600480017 trên web) vẫn chữ cũ lẫn dòng bảng cho tới khi chạy lại `--reread` (lệnh dưới).
- `pass` chỉ nhận khi dòng tên mình đủ ≥3 ô Đạt; báo cáo kiểu bảng từng bước/từng tiêu chí (IB2400564384) → "" (an toàn, không sai).
- `fail` từ đoạn dự phòng dựa chữ "không đạt/không đáp ứng/bị loại" gần tên mình; câu nêu 2 firm (IB2600365013) vẫn lẫn.
- Cache OCR: dọn khi `bcdgDownload` chạy (mỗi lượt có tải); thư mục dùng cho `--reread` cần tệp cùng md5. Đo thật cache giữ lại sau đọc xong CHƯA chạy end-to-end (đường `bcdgText` nằm trong genbid-sync.js, không có test đơn vị); chỉ `node --check`.
- OCR IB2400564384 (130 trang) chạy ~10 phút trên máy này.

## Chưa kiểm được
- End-to-end qua bot → web (không ghi web thật); UI trình duyệt; `--reread` thật với cache giữ lại (lượt 2 không OCR lại 65 trang của IB2400120387).
- 5 gói scan khác chưa OCR lại.

## Lệnh `--reread` cần chạy sau khi gộp (và sau restart tác vụ bot)
Từ checkout bot, profile của bot (cùng cách chạy `bcdg` trước đây):
`node bot/genbid-hsmt/genbid-sync.js bcdg --profile <profile> --keys IB2600419125,IB2600480017,IB2400120387,IB2400393199,IB2600374560,IB2400564384 --reread`
(IB2400120387 đang có đoạn trích; sau khi sửa, reread quá giờ sẽ không xoá nữa, và lượt sau chạy tiếp từ cache.) `--reread` ghi web thật → do phiên điều phối chạy.
