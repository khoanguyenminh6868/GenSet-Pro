# Đo token lượt agent "Gợi ý cấu hình" — chỉ đo, không sửa code (12/11)

Nguồn: 6 log stream-json còn trong `%TEMP%` (`genbid-config-<gói>[-cỡ].log`), đọc bằng script (scratchpad `tok.cjs`, `tok2.cjs`; bộ đọc giống `traceOf` của web-memo). Thư mục lượt đã bị xoá nên kích thước tệp lấy từ nội dung agent đã đọc trong log (phần agent không đọc thì không đo được). Giá Opus 5.5 (bảng giá API): vào $4/M, ghi bộ nhớ đệm 5 phút $5/M, đọc bộ nhớ đệm $0,20/M, ra $20/M — tính lại khớp `total_cost_usd` của cả 6 log đến 0,01 USD.

## 1. Mỗi lượt

| Lượt | Model | Lượt hội thoại | Ghi đệm (token / USD) | Đọc đệm (token / USD) | Ra (token, trong đó suy nghĩ / USD) | Tổng USD |
|---|---|---|---|---|---|---|
| IB2600581977 | claude-opus-5-5 | 32 | 188.544 / 0,94 | 3.576.330 / 0,72 | 40.990 (19.292) / 0,82 | 3,04 |
| IB2600586587 | claude-opus-5-5 | 19 | 174.646 / 0,87 | 2.182.404 / 0,44 | 43.816 (15.702) / 0,88 | 2,19 |
| IB2600592684-1 | claude-opus-5-5 | 17 | 132.904 / 0,66 | 1.166.640 / 0,23 | 41.909 (11.871) / 0,84 | 2,13 |
| IB2600592684-2 | claude-opus-5-5 | 35 | 174.421 / 0,87 | 3.661.407 / 0,73 | 63.656 (20.658) / 1,27 | 3,40 |
| IB2600594596-1 | claude-opus-5-5 | 20 | 186.108 / 0,93 | 1.954.525 / 0,39 | 40.689 (19.444) / 0,81 | 2,14 |
| IB2600594596-2 | claude-opus-5-5 | 38 | 165.918 / 0,83 | 3.879.660 / 0,78 | 43.093 (21.052) / 0,86 | 2,49 |
| **Trung bình** | | **27** | **0,85** | **0,55** | **0,91** | **2,57** |

Token vào thường: 32–72 mỗi lượt (≈ 0 USD). Ba phần gần ngang nhau: ghi đệm ≈ 33% (mọi thứ đi vào ngữ cảnh một lần), đọc đệm ≈ 21% (ngữ cảnh đọc lại mỗi lượt hội thoại: tỉ lệ với số lượt × độ dài ngữ cảnh), ra ≈ 36% (≈ một nửa là suy nghĩ, còn lại chủ yếu là result.json / script dựng result.json).

## 2. Ngữ cảnh gồm gì

Tỉ lệ đo được: ≈ **2,0 ký tự / token** (1,9–2,1 ở cả 6 lượt; (ghi đệm − ra − hệ thống) so với tổng ký tự kết quả công cụ). Chữ Việt có dấu + bảng nên đắt gấp ~2 lần tiếng Anh.

- Hệ thống + công cụ Claude Code: ≈ 8,4 nghìn token (lượt đầu ghi 2.433–8.887 + đọc 6.009), có đệm sẵn.
- prompt.md (= config-prompt.md + công thức): 29–30 nghìn ký tự ≈ 15 nghìn token; đọc 1 lần mỗi lượt (vài lượt đọc 2 lần: `bash head` rồi Read).
- input.md: 22–53 nghìn ký tự (≈ 11–27 nghìn token). Trong đó "Phần kỹ thuật của HSMT" 13–40 nghìn ký tự, bảng mã yêu cầu 5,5 nghìn, thông số theo phân tích 4,4–6,9 nghìn.
- hsmt.txt: agent KHÔNG đọc toàn văn; chỉ grep 1–2 lần (1,6–14 nghìn ký tự) để chép câu trích.
- catalog.md (phần agent đọc được, ký tự): Ứng viên 18–49 nghìn; Thông số theo model 17–50 nghìn (không có ở 581977 — bản cũ); Thông số BĐK 0,3–20 nghìn; "NCC khác có dòng cùng động cơ" 9–18 nghìn; "Động cơ khác" 6–7 nghìn; "Tiêu đề bảng" 12–15 nghìn; "Bộ điều khiển (40–44)" 12–32 nghìn. Tổng đã đọc: 117 / 154 / 76 / 61 / 131 / 59 nghìn ký tự (≈ 30–77 nghìn token) — phần lớn nhất của ngữ cảnh.
- controllers.md: đọc bằng grep/sed nhiều lần (581977: 11 lần, 54 nghìn ký tự; 586587: 6 lần, 22 nghìn); 594596-1 đọc 1 đoạn 10,8 nghìn.
- Đọc lặp / lãng phí: 594596-1 và -2 mỗi lượt có 1 lần Read catalog.md bị từ chối vì quá dài (378 ký tự lỗi) rồi đọc lại; 592684-2 có một kết quả Bash quá dài bị ghi ra tệp rồi Read lại (33 nghìn ký tự); prompt.md đọc 2 lần ở 4/6 lượt (head + Read). Lượt có tra mạng (594596-2) đọc web/1.txt 5 lần (36 nghìn ký tự).
- Ngữ cảnh đỉnh: 133–195 nghìn token.

## 3. Ứng viên thực sự dùng

Mỗi lượt có đủ 30 dòng ứng viên. Đếm dòng có model tổ máy được agent nhắc lại trong lệnh / tệp nó viết (proxy, vì suy nghĩ bị ẩn): 5 / 9 / 10 / 6 / 6 / 1 dòng (594596-2 dùng cấu hình tìm trên internet). Kết quả cuối ≤ 6 cấu hình. → agent dùng khoảng 1/5–1/3 số dòng; phần "Thông số theo model" cũng chỉ cần cho model của các dòng đó.

## 4. hsmt.txt / phần kỹ thuật theo cỡ máy

- Gói nhiều cỡ: mỗi cỡ là một lượt riêng và input.md của MỖI cỡ chứa NGUYÊN phần kỹ thuật của cả gói. IB2600594596 (ước lượng theo dòng): phần kỹ thuật dòng 140–826 ≈ 39,6 nghìn ký tự; mục 400 kVA (dòng 244–431) ≈ 27%, mục 300 kVA (432–637) ≈ 30%, phần chung (giới thiệu, yêu cầu chung, yêu cầu khác) ≈ 35%, quyết định phê duyệt / nội dung HSMT ở cuối ≈ 8%. → mỗi lượt cỡ đọc ≈ 30% là của cỡ kia, ≈ 8% không phải yêu cầu kỹ thuật. IB2600592684 (500/30 kVA): mục mỗi cỡ chỉ ~40 dòng / 275, phần lớn là chung.
- Agent không đọc lại hsmt.txt toàn văn; chỉ grep chép câu trích.

## 5. Ước lượng ba phương án (ƯỚC LƯỢNG, không phải số đo)

Công thức: bớt X token đọc ở khoảng lượt hội thoại k của N lượt → tiết kiệm ≈ X × $5/M (ghi) + X × (N − k) × $0,20/M (đọc lại). Mỗi lượt hội thoại thêm ≈ ngữ cảnh (~150 nghìn) × $0,20/M ≈ 0,03 USD + phần ra. Trung bình N = 27.

**(a) catalog.md thành mục lục 1 dòng/ứng viên + tệp chi tiết mở khi cần.** catalog.md trung bình ~100 nghìn ký tự đã đọc → mục lục ~6 nghìn + chi tiết ~6 dòng dùng (cùng thông số model của chúng) ~25–30 nghìn → bớt ≈ 65 nghìn ký tự ≈ 32 nghìn token, đọc ở lượt ~5: ≈ 0,16 + 32K × 22 × 0,2/M ≈ 0,14 → **≈ 0,30 USD/lượt (~12%)**, trừ đi các lượt mở tệp thêm (≈ 4–6 lượt × ~0,04 = 0,15–0,25) → **thực còn ≈ 0,05–0,15 USD (2–6%)** trừ khi gộp mở nhiều tệp trong một lệnh. Rủi ro chính xác: agent chỉ mở dòng nó đoán là tốt → bỏ sót cấu hình tốt hơn ở dòng không mở (thứ hạng code không hoàn hảo: D440 từng nằm ngoài 30 dòng); "CÓ THỂ TRA ĐƯỢC"/hint vẫn chạy ở check nên phần kiểm không mất.

**(b) Rút phần kỹ thuật HSMT trong input.md còn phần của cỡ đang chạy + phần chung (bản đầy đủ vẫn ở hsmt.txt).** Chỉ có tác dụng ở gói nhiều cỡ (2/5 gói đo được): bớt ≈ 38% của 16–40 nghìn ký tự ≈ 3–7,5 nghìn token, đọc ở lượt ~3 → **≈ 0,03–0,07 USD/lượt cỡ (1–3%)**; gói một cỡ chỉ bỏ được phần phê duyệt cuối (~8%) ≈ 0,01. Rủi ro: tách sai ranh giới cỡ (tiêu đề "a) Thông số Máy phát điện 400KVA" có khi không theo mẫu) → mất yêu cầu, hoặc lấy yêu cầu của cỡ kia; phần chung nằm sau mục cỡ (vd "3. Các yêu cầu khác") phải giữ. Câu trích vẫn kiểm theo hsmt.txt nên không sinh trích dẫn sai, chỉ có thể sót yêu cầu (đã có "CÓ THỂ SÓT YÊU CẦU" so với phân tích).

**(c) Code điền sẵn các check đối chiếu được từ số liệu đã lưu, agent chỉ xử lý phần còn lại.** Ra là phần đắt nhất (0,91 USD/lượt; phần không phải suy nghĩ ≈ 22–43 nghìn token chủ yếu là checks trong result.json / script dựng nó). Nếu code điền trước ~30–40% check (công suất, cosφ, dòng điện, tần số, điện áp, số liệu tờ hãng — những gì stdChecks / powerChecks / makerSheetChecks / khoaRules đã quyết sau lượt) và agent không phải viết lại: bớt ≈ 7–15 nghìn token ra (0,14–0,30) + ít đọc "Thông số theo model" hơn → **≈ 0,15–0,35 USD/lượt (6–14%)**, lớn nhất trong ba. Rủi ro: code chỉ được kết luận "đạt"/xác nhận khi số nguyên văn (như hiện nay); nếu agent buộc phải tin check của code thì lỗi đọc bảng của code (cột Prime/Standby, bảng nhiều model theo cột) lan sang mọi gói, không còn lớp agent soi lại; cần giữ quy tắc "code chỉ điền đạt, không điền không đạt" và check() vẫn kiểm lại như cũ.

**Ghi chú thêm (không thuộc 3 phương án, chỉ nêu số):** số lượt hội thoại là đòn bẩy của phần đọc đệm — 3 lượt 32–38 vòng tốn đọc đệm 0,72–0,78 USD, 3 lượt 17–20 vòng 0,23–0,44 USD; nguyên nhân thấy trong log: grep controllers.md từng chức năng (11 lần), sửa script dựng result.json nhiều vòng, đọc lại sau lỗi "tệp quá dài". Suy nghĩ 12–21 nghìn token = 0,24–0,42 USD/lượt (mức effort mặc định); không đề xuất đổi vì ảnh hưởng chính xác chưa đo được.
