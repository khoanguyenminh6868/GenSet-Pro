# Nghiệm thu G2: đo lỗi chọn tệp của `specsPick` (13/11/2026)

PR NHÁP: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/648 (nhánh `fix/g2-specspick`, worktree `wt-g2-specspick`). **Chờ Khoa duyệt, chưa merge.**

**Khuyến nghị một dòng:** nên sửa (phương án A): đúng 25 gói đổi lựa chọn, cả 25 tốt hơn, 0 gói đang đúng bị đổi; lỗi chỉ gây tốn (130,8 MB, 1.510 trang, −34% chữ gửi agent), không làm kết quả specs cũ kém đi, nên KHÔNG cần đọc lại 25 gói.

## 1. Tập đo (chỉ đọc)
| Nguồn | Số | Ghi chú |
|---|---|---|
| `genbid-work\specs\<K>\files` | 1.472 gói, 1.746 tên tệp | Đây là tệp ĐÃ TẢI (bộ chọn lúc 03–10/11), không phải danh sách TBMT đầy đủ. Kèm `text.txt` (chữ từng tệp), `src.txt`. |
| `.genbid-specs.json` (gốc `C:\Projects\GenSet Pro\`) | 1.514 gói: done 1.259, none 250, notext 5 | trạng thái lượt specs |
| doc-cache `analysis.json`, `bidhist.json` | 1.287 / 1.556 | số thông số, `config` |
| web `hsmt` (GET chỉ đọc, 1 lần) | 71 gói `muasamcong (VNeGP Agent)` = **danh sách tệp TBMT đầy đủ**, 219 tệp | gói hiện tại do Sync tải cả bộ; dùng làm mẫu để thấy các tệp bị loại (không thấy được trong `files`) |
| `pdfinfo` trên tệp đã tải | số trang PDF | |

Webform Chương V: chỉ **1/1.499** gói specs có (IB2400022720, 481 ký tự, state none). Specs gần như chỉ chạy cho gói lịch sử, nơi Chương V webform hầu như không có.

Script: `C:\Users\Khoa\AppData\Local\Temp\claude\d4c88f0a2fd88962\a9157613-5dfa-4b09-bfe9-739b8cddd147\scratchpad\` — `g2-measure.js` (dựng tập, ra `g2-data.json`), `g2-class.js` (phân loại, `g2-class.json`), `g2-cost.js` (chi phí, `g2-cost.json`), `cmp.js` (chạy cũ / A / B / bản PR trên toàn tập, `cmp.txt`, `cmp-pr.txt`), `peek.js` (đầu chữ từng tệp). `sync-pure.js` = origin/main 6755d01e.

## 2. Phân loại 102 gói có tệp tên vừa Chương V/YCKT vừa HSMT (đo trên `files`)
| Nhóm | Số | Ý nghĩa |
|---|---|---|
| (a) chọn đúng | **77** | tệp đó được chọn, không kèm tệp thừa (thường là tệp duy nhất) |
| (b) chọn thêm tệp thừa | **25** | own rỗng (vì tệp Chương V bị coi là HSMT) → lấy cả cand: HSMT cả bộ, Mục 3, chương VIII, hợp đồng, ĐKCT |
| (c) bỏ mất vì webform | **0 đo được** | trong `files` không thể thấy tệp đã bị loại. Mẫu 71 danh sách đầy đủ: 2/71 gói có tên kiểu này; nếu có webform thì IB2600564645 không đọc tệp nào, IB2600588204 đọc "Chuong 3" (sai) — xem (d) |
| (d) chọn sai hẳn | **0 đo được** | ca mẫu: IB2600588204 + webform → chỉ đọc "14.1 … ( Chuong 3).docx" (Mục 3 tiêu chuẩn đánh giá), bỏ "14.2 … ( Chuong 5 - Ky Thuat).docx" |

Xem tay: cả 25 gói nhóm b + 77 gói nhóm a (tên tệp + đầu chữ từng tệp trong `text.txt`) = 102 gói. Trong nhóm a mọi tệp "both" đều mở đầu bằng "Phần 2 / Chương V. YÊU CẦU VỀ KỸ THUẬT", trừ: IB2200083564 "Chuong V va E-HSMT dinh kem.pdf" (thật là HSMT cả bộ, có mục lục; là tệp duy nhất nên không đổi gì), IB2400150394 / IB2400032948 / IB2200030829 (rar có QĐ + Chương V bên trong — Chương V thật nằm trong rar). 25 gói nhóm a state none, phần lớn là gói xây lắp / dịch vụ ("Ho so moi thau_xay lap_…chuong 5") (Chương V không có thông số máy phát) — đúng, không do chọn tệp.

### Nhóm b — 25 gói (tệp Chương V thật | tệp thừa)
| TBMT | state, số thông số | Tệp Chương V thật (đã xem đầu chữ) | Tệp thừa đã đọc | Ký tự thừa trong text.txt | Trang PDF thừa |
|---|---|---|---|---|---|
| IB2200008717 | done 94 | Chương V - TCKT - HSMT MPĐ 12KVA (+ bản (1)) | HSMT MPĐ 12KVA.pdf (cả bộ, scan) | 274.459 | 156 |
| IB2200062524 | done 50 | Chuong V E-HSMT hàng hóa 1 túi … | Phần 4 E-HSMT (biểu mẫu HĐ) | 10.746 | 0 (docx) |
| IB2200091251 | done 6 | E-HSMT - MPD (GD3) - Yeu cau ve ky thuat | Dieu kien cu the; Du thao hop dong | 22.451 (+93.060 HĐ) | 8 |
| IB2300011564 | done 23 | HSMT+phạm vi cung cấp chi tiết + yêu cầu kỹ thuật.rar | HSMT.pdf (QĐ + cả bộ) | 196.811 | 88 |
| IB2300015080 | done 5 | 03. E-HSMT - MPĐ (GĐ3) - Yêu cầu về kỹ thuật.rar | 04. Điều kiện cụ thể; 05. Dự thảo hợp đồng | 22.653 (+94.078) | 8 |
| IB2300067312 | done 40 | PHAN 2-CHUONG V-HSMT MPĐ 12KVA | PHAN 4-HSMT (biểu mẫu HĐ) | 22.838 | 16 |
| IB2300222010 | done 86 | E-HSMT Chuong V (1).pdf | 10.E-HSMT.pdf (cả bộ, scan) | 258.352 | 125 |
| IB2300251313 | none | 1.2 E-HSMT - chương V.pdf | 1. E-HSMT cả bộ; 1.3 chương VIII | 542.886 | 181 |
| IB2300266461 | done 80 | E_HSMT Chuong V (1).pdf | E-HSMT Muc 4 Tieu chuan ve gia | 4.079 | 2 |
| IB2300268389 | done 24 | E-HSMT_XL_gói 3 - CHUONG V | -CHUONG VIII (biểu mẫu HĐ) | 121.448 | 46 |
| IB2300292168 | done 89 | E-HSMT Chuong V Yeu cau ky thuat (1) | Muc 4 E-HSMT danh gia tai chinh | 3.606 | 2 |
| IB2400014133 | done 22 | 26.01.2024 Chương V - E-HSMT.docx | 8.1. Chuong VIII (HĐ) | 10.959 | 0 |
| IB2400032948 | done 31 | HSMT, yêu cầu kỹ thuật.rar (trong có Chương V) | HSMT may phat … OK.docx (cả bộ) | 49.418 | 0 |
| IB2400186078 | done 107 | 9.2- … Chuong V- Ky Thuat.docx | 9.- E-HSMT cả bộ; 9.3 Phần 4 | 518.961 | 221 |
| IB2400357771 | done 26 | Chuong 5 HSMT- May phat dien - DT.pdf | HSMT - May phat dien - DT (1).pdf (76 MB scan, không ra chữ) | 0 | 216 |
| IB2400428063 | done 46 | E-HSMT Chuong V (1).pdf | E-HSMT.pdf (cả bộ, scan) | 348.293 | 160 |
| IB2400453417 | done 21 | EHSMT - Chương 5.rar | ĐH - EHSMT - C3 (Mục 3 đánh giá) | 15.167 | 6 |
| IB2400496799 | done 66 | E-HSMT CHUONG V+ BAN VE.rar | GT10-HOP DONG; GT10-MUC 3 | 28.358 | 7 |
| IB2400558775 | done 70 | CHƯƠNG V E-HSMT MÁY PHÁT ĐIỆN | MỤC 3 … E-HSMT | 8.962 | 3 |
| IB2400577658 | done 43 | Chuong V E-HSMT Goi mua may phat dien | BMHĐ; Muc 3 | 8.893 | 7 |
| IB2500020231 | done 37 | Chương V E-HSMT gói thầu TB1 | Dự thảo Hợp_đồng kèm HSMT | 194.289 | 73 |
| IB2500271331 | done 78 | 5.2 … (Chuong 5- Ky Thuat).docx | 5. E-HSMT cả bộ (scan) | 411.282 | 169 |
| IB2500380933 | done 23 | CHUONG V - EHSMT THANG MAY + MPĐ | MỤC 3 - EHSMT | 9.244 | 4 |
| IB2600006758 | done 13 | CHƯƠNG 5 HSMT TRƯỜNG THCS THỐNG NHẤT | MỤC 3 HSMT | 14.673 | 8 |
| IB2600313010 | done 68 | 8.1. Đính kèm E-HSMT- Phần 2 chương V | 8.2. Đính kèm E-HSMT - Mục 3 | 13.239 | 4 |

(Cột ký tự thừa của bảng phân loại tính tệp "không phải Chương V" theo tên; IB2200091251/IB2300015080 tách HĐ ra cho rõ.)

## 3. Hậu quả thật (nhóm b)
- **Kết quả specs kém đi: 0/25 do lỗi này (đo).** Lấy chữ đã lưu, chạy `chapterV → densestCut` như lượt 03–04/11 (một lần gọi, 150.000 ký tự): các dòng có thông số của tệp Chương V đúng đều có mặt trong phần đã gửi agent ở 24/25 gói; IB2200091251 thiếu 3–4 dòng, đều là dòng tên gói thầu lặp lại, không phải thông số.
  - 1 gói state none (IB2300251313) đúng nghĩa: gói bảo dưỡng, Chương V không có thông số máy.
  - IB2200091251 (6 thông số) và IB2300015080 (5) thấp nhưng KHÔNG do tệp thừa: agent ghi "văn bản bị cắt sau mục 1.1 b)" — Chương V của FPT GĐ3 tự nó ngắn, thông số ở bản vẽ; chạy chỉ với tệp đúng thì phần gửi gần như y nguyên (39.330 vs 39.633 ký tự). Không đo được bằng agent (không gọi agent).
  - `bidhist.config` rỗng: không gói nào trong 25 do lỗi này.
- **Chi phí thừa (đo):** 130,8 MB tải thêm qua VNeGP Agent; 1.510 trang PDF trong tệp thừa (pdfinfo; bao nhiêu trang thật sự qua OCR thì không có số — ước tính phần lớn: các tệp HSMT cả bộ 125–221 trang là scan). Chữ gửi agent theo mã hôm nay (đọc nhiều phần): 1.078.095 → 713.703 ký tự (−364.392, −34%), số lần gọi không đổi (25 → 25, mỗi gói 1 phần). Đã tốn rồi, chỉ lặp lại nếu đọc lại.
- **Nội dung lẫn:** agent nhận thêm hợp đồng / tiêu chuẩn đánh giá; `checkResult` vẫn kiểm theo toàn chữ nên số trích từ HĐ (vd. tiến độ, bảo hành) có thể lọt vào thông số — chưa đo (cần agent).
- **(c)/(d) tương lai:** mẫu 71 TBMT đầy đủ có 2 gói (2,8%) mang tên kiểu này; khi có webform thì 1 gói mất hẳn tệp Chương V, 1 gói đọc nhầm Mục 3. Specs hiện chỉ dùng `specsPick` cho gói chưa có HSMT trên web (chủ yếu lịch sử, webform 1/1.499) nên ít gặp, nhưng là hỏng thật khi gặp.

## 4. Phương án và số trước/sau
- **A (chọn, vào PR):** tên khớp `CH5` hoặc `YCKT_NAME` là tệp Chương V riêng kể cả có chữ HSMT — vào `own`, và không bị loại khi có webform. Tên chỉ có HSMT vẫn là cả bộ.
- **B:** chỉ sửa `own`, giữ loại khi có webform.

| | 1.472 danh sách đã lưu | 71 danh sách đầy đủ (không web / có web) |
|---|---|---|
| A | 25 đổi = đúng 25 gói nhóm b, 0 gói khác | 3 đổi: IB2600588204 bỏ E-HSMT cả bộ; +web: đọc Chương 5 thay "Chuong 3"; IB2600564645 +web: đọc Chương V thay vì không gì |
| B | 25 đổi (giống A) | 1 đổi (không sửa 2 ca webform) |
| Bản PR (`wt-g2-specspick`) | trùng A từng dòng (`cmp-pr.txt`) | trùng A |

Mọi gói đổi đã xem tay (25 + 3): tệp giữ lại là Chương V thật (mở đầu "Phần 2. YÊU CẦU VỀ KỸ THUẬT / Chương V"); không có ca đổi ngoài 102 gói trên dữ liệu đã lưu. Quy tắc Khoa 03–04/11 giữ: có tệp Chương V/YCKT riêng → không tải E-HSMT cả bộ (nay áp được cả khi tên có HSMT); "Hồ sơ mời thầu", "HSMT_CHCT", "E-HSMT.pdf" vẫn là cả bộ, có webform thì vẫn không đọc (có test); quy tắc webform không OCR scan nằm ở `specsSource`, không đổi.

## 5. PR
- Tệp đổi: `bot/genbid-hsmt/sync-pure.js` (specsPick: thêm `named`/`whole`, 2 dòng logic + chú thích), `bot/test/sync-rules.test.mjs` (bỏ 2 `todo` HSMT-name, thay ca "khoá hành vi 3 tệp" bằng 3 ca mới từ tên tệp thật: IB2400558775, IB2300268389, IB2400428063, IB2300011564, IB2600588204, IB2600564645, cả bộ có webform).
- Lệnh kiểm: `node --check bot/genbid-hsmt/sync-pure.js` ok; `node --test bot/test/*.test.mjs` → 97 ca, 92 đạt, 0 lỗi, 5 todo; `node --test suppliers/specs-parts.test.mjs suppliers/selfcheck.test.mjs` → 36 đạt, 0 lỗi. CI PR #648 lúc ghi: 2 xanh, 4 đang chạy, 0 đỏ.
- Sau merge: chép `bot/genbid-hsmt/sync-pure.js` sang `genbid-hsmt\` (genbid-sync.js không đổi). Phiên G1 sửa `SERVICE_RE`/`apiBudgetOf` cùng tệp ở chỗ khác — merge sau thì rebase, không đụng nhau.

## Gói nên đọc lại nếu sửa
- **Không bắt buộc.** 25 gói nhóm b có nội dung Chương V đúng trong phần đã đọc. Nếu muốn sạch nguồn ("Chỉ đọc … (tệp …HSMT cả bộ…)" trong ghi chú) thì đọc lại 25 gói ở bảng trên (`--key`, xoá mục trong `.genbid-specs.json`), ưu tiên 8 gói có HSMT cả bộ/hợp đồng lớn: IB2200008717, IB2300222010, IB2400186078, IB2400428063, IB2500271331, IB2500020231, IB2300011564, IB2300251313.
- **IB2400022720** (none; webform "Chương V" 481 ký tự là chương quốc gia hợp lệ, không có tệp): có thể là ca (c) — tệp Chương V tên có HSMT bị loại. Không có danh sách tệp để chắc; đáng đọc lại sau khi sửa.

## Mẫu đối chiếu với nguồn
1. IB2200008717: `genbid-work\specs\IB2200008717\src.txt` = "tệp Chương V - TCKT - HSMT MPĐ 12KVA (1).pdf, … , HSMT MPĐ 12KVA.pdf"; tệp thừa mở đầu "HO SO MOI THAU MUA SAM HANG HOA".
2. IB2600588204: web `hsmt/IB2600588204` (source "muasamcong (VNeGP Agent)") liệt kê "14.1 … ( Chuong 3).docx", "14.2 … ( Chuong 5 - Ky Thuat).docx", "E-HSMT hàng hóa 1 túi May phat dien.pdf", QĐ.
3. IB2400032948: `text.txt` dòng 2539 "--- HSMT, yêu cầu kỹ thuật\Chương V- Yêu cầu kỹ thuật.pdf ---" (Chương V nằm trong rar được giữ).

## Rủi ro còn lại, quay lui
- Tên kiểu "E-HSMT gồm Chương I–V.pdf" / "Chuong V va E-HSMT dinh kem.pdf" (cả bộ nhưng có chữ Chương V) nay vào `own`; nếu cùng có tệp Chương V riêng khác thì đọc cả hai (tối đa 3). Trên tập đo: 1 tên như vậy (IB2200083564, tệp duy nhất → không đổi).
- Chưa đo trên danh sách TBMT đầy đủ của 1.472 gói lịch sử (không lưu); (c)/(d) chỉ có mẫu 71 gói.
- Quay lui: revert commit 1695c703 / chép lại `sync-pure.js` của origin/main.

## Chưa kiểm được
- Chất lượng thông số khi agent đọc chỉ tệp đúng (không gọi agent theo brief).
- Số trang thật sự OCR của tệp thừa (log 03/11 không ghi theo tệp).

## Cần ghi nhớ
- Danh sách tệp TBMT đầy đủ không được lưu cho gói specs (chỉ tệp đã tải): muốn đo bộ chọn tệp sau này nên lưu `files-extract` đầy đủ vào `specs\<K>\notice-files.json`.
- Worktree `wt-g2-specspick` giữ tới khi PR #648 được quyết.
