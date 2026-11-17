# Loại theo nguồn — Bước 1 (đo trước khi sửa) — CỔNG DUYỆT

Việc: `candidates()` chỉ loại hẳn dòng dưới ngưỡng HSMT khi số liệu vi phạm đến từ datasheet/trang hãng động cơ hoặc ≥ 2 nguồn độc lập cùng trị; một NCC đơn lẻ thì giữ, trừ 600 điểm, ghi chú ngắn.
Trạng thái: **dừng ở cổng duyệt sau Bước 1**, chưa commit, chưa PR. Kết luận: số đo cho thấy quy tắc gần như không đổi kết quả đưa cho agent, và cách nhận "nguồn hãng" không chắc (chi tiết dưới).

## Cách đo
- Worktree `C:\Projects\GenSet Pro\wt-loai-nguon` (nhánh `loai-theo-nguon` từ origin/main 1a11335). Thêm vào `candidates()` (chưa commit): `proofOf()` phân loại nguồn của số liệu làm loại dòng; `PROOF_RULES` (export) là các lý do áp luật mới.
  - "hãng" (`maker`): có ít nhất một số liệu từ NCC role `engine_maker` hoặc fact `sheet` (datasheet hãng đúng model).
  - "≥ 2 nguồn" (`multi`): hai NCC khác nhau (không liên kết `relatedIds`) cho cùng trị (lệch ≤ 3%).
  - "một NCC" (`single`): còn lại.
  - `PROOF_RULES` rỗng = luật cũ y nguyên (dùng làm "trước"); {disp, maxDisp, cyl} = luật mới; thêm prime = biến thể.
- Bộ gói của kiem-rong: 1.162 gói / 1.539 lượt (gói × cỡ), cùng nguồn văn bản (12 HSMT đầy đủ + 241 gói nhiều cỡ + specs), supplier.json 12/11, `keep` từ configmatch. 0 lượt lỗi.
- Script: `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\loai-nguon\measure.mjs` (6 tiến trình), tổng hợp `an.mjs` → `out\an.txt`; mẫu `out\samples.txt`. Không mạng (trừ tra trang hãng cho soát tay), không agent, không ghi web.

## Số đo (đo, không ước tính)
Dòng trong dải: 1.431.393. Bị loại theo mã hiện tại: **163.861** (11,4%).

Theo lý do × nguồn (một dòng có thể nhiều lý do):
| lý do | hãng | ≥ 2 nguồn | một NCC |
|---|---|---|---|
| dung tích tối thiểu | 1.874 | 28.276 | 16.144 |
| số xi lanh | 1.660 | 35.996 | 6.243 |
| dung tích tối đa | 301 | 6.820 | 2.881 |
| Prime (công suất của chính dòng) | 379 (NCC là hãng động cơ) | — | 90.184 (chỉ dòng đó) |

Theo dòng, xét lý do dung tích / xi lanh: hãng 3.104, ≥ 2 nguồn 52.267, **chỉ một NCC 17.927**; thêm 16.262 dòng có cả lý do Prime (vẫn bị loại vì Prime: hãng 709, ≥ 2 nguồn 11.679, một NCC 3.874).

Áp luật mới (Prime vẫn loại hẳn):
- Dòng được giữ lại: **17.927** = 10,9% số dòng bị loại = **1,25% số dòng trong dải**; ở 397 lượt / 360 gói.
- **Top 3 đổi: 0 lượt / 0 gói** (cả thứ tự lẫn tập).
- Top 30 có dòng mới: 52 dòng ở 11 lượt (0,7% lượt), tất cả là dòng bị trừ 600 lấp chỗ trống vì top < 30 (8 lượt máy 5,5–8,5 kVA, 120/160/600/700 kVA top 4–26 dòng). Ở các lượt top đủ 30: 0 dòng mới (−600 đẩy xuống cuối).
- Ca M35 của kiem-rong (FAWDE CA6DL1-24D "4 L" xi lanh, IB2400249622): được giữ lại trong `rows` nhưng **không vào top 30** ở cả hai cỡ 160 / 200 kVA → agent vẫn không thấy.

Biến thể áp cả Prime (Prime của dòng luôn chỉ có một nguồn là chính NCC đó): giữ lại 95.772 dòng (58% số bị loại); top 3 đổi 2 lượt / 2 gói; top 30 thêm 84 dòng / 32 lượt. Không đề xuất: Prime là công suất chào của chính dòng, không có "nguồn thứ hai"; mẫu kiem-rong 49/49 dòng Prime bị loại đúng.

## 10 ca soát tay (dòng được luật mới giữ lại)
| # | gói, cỡ | dòng (NCC / động cơ) | số làm loại vs ngưỡng HSMT | đối chiếu nguồn | kết luận |
|---|---|---|---|---|---|
| 1 | IB2400265303, 8,5 kVA | rise-power / CAT C1.1 | 3 xi lanh < "Số xilanh ≥4" | cat.com C1.1: "Inline 3, 4-Stroke-Cycle Diesel" | loại cũ ĐÚNG; luật mới đưa vào top 30 → sai |
| 2 | IB2400265303, 8,5 kVA | voltgent / Yanmar 3TNV76-GGE (số từ genlitec) | 3 xi lanh < 4 | yanmar.com 3TNV76: "No. of Cylinders, 3" | loại cũ ĐÚNG; luật mới đưa vào top 30 → sai |
| 3 | IB2200001635, 100 kVA | longkai-power / Baudouin 4M10G100/6 (số từ waeta-fujian 4.08) | 4,08 L < "≥ 4,4 lít" | baudouin.com 4M10: "Total Displacement (L): 4.1" | loại cũ ĐÚNG. Baudouin có trong DB là `engine_maker` nhưng datasheet ghi model "4M10", khoá chính xác ≠ "4M10G100/6" nên không tính là nguồn hãng |
| 4 | IB2400041536, 410 kVA | longkai-power / Baudouin 6M21G400/6 | 12,54 L < "Dung tích xi lanh: 13L" (số trần = tối thiểu, L2) | baudouin.com spec sheet 6M21: "Displacement (L) 12.54" | số đúng; loại đúng theo quy tắc L2 |
| 5 | IB2300191244, 200 kW | longkai-power / Baudouin 6M16G275/5 | 9,73 L > "≤ 9.5 L" | baudouin.com 6M16: "Total Displacement (L): 9.7" | loại cũ ĐÚNG. Có 2 NCC (waeta 9.73, westinpower "9.726L") nhưng mã đọc "9.726L" thành 9726 L nên không nhận "cùng trị" |
| 6 | IB2500314401, 350 kVA | wintpower / Wudong WD145TAD30 | 14,5 L > maxDisp 9,84 | liangzi 14,5; taihai cũng ghi 14,5 nhưng catalog không đọc thành fact dung tích | số nhiều khả năng đúng; ngưỡng 9,84 chính là ca mins-fix ghi "chưa đối chiếu HSMT"; không chắc |
| 7 | IB2400384429, 5,5 kVA | victory-generator / LA188FG | 474 cc < "Dung tích xi lanh (L): 0,479" | không tìm trang hãng | không chắc |
| 8 | IB2200069368, 118 kVA | jet-power / SDEC 4HTAA4.3-G22 | 4,3 L < "≥ 4.45" | chưa mở trang hãng (tên model ghi 4.3) | chưa xác minh |
| 9 | IB2300088930, 20 kVA | jet-power / Isuzu JE493DB-04 | 2,771 L < ngưỡng dung tích | chưa mở trang hãng | chưa xác minh |
| 10 | IB2300285618, 330 kVA | yingtai-jiangsu / Weichai WP2.1D18E2 | 4 xi lanh < ngưỡng | dòng là động cơ 18 kW lọt dải 330 kVA do cột lệch (kiem-rong L3) | loại cũ đúng (dòng rác); luật mới giữ lại |

Tóm: 5/10 có trang hãng xác nhận số của NCC đơn lẻ là ĐÚNG (loại cũ đúng; luật mới giữ lại sai), 1 dòng rác, 4 không chắc/chưa xác minh; 0/10 là số sai bị loại oan. Ca số sai duy nhất đã biết là M35 (FAWDE), và luật mới không đưa nó lên top 30.

## Vì sao dừng ở cổng
1. **Hiệu quả**: 1,25% dòng trong dải đổi trạng thái (gần ngưỡng "< 1%" của brief), nhưng top 3 đổi 0 lượt, top 30 chỉ đổi ở 11 lượt thiếu dòng, và chính các dòng được đưa vào top 30 là vi phạm thật (ca 1, 2).
2. **"Nguồn hãng" không chắc**: 56 NCC role `engine_maker`, nhiều hồ sơ 0 bảng; datasheet hãng ghi model gốc (4M10, 6M16, 6M21) còn catalog khoá theo model định mức (4M10G100/6…), mà brief cấm khớp tên gần giống → datasheet hãng có trong DB vẫn không được tính (ca 3, 5). "≥ 2 nguồn" cũng bị đếm thiếu khi catalog không đọc được cột (ca 6) hoặc đọc sai đơn vị (ca 5). Nên phần lớn 17.927 dòng "một NCC" thực ra là số đúng.

## Đề xuất để điều phối / Khoa quyết
- (A, khuyên) Không làm luật này; đóng việc. Ca M35 xử lý tại dữ liệu (sửa hồ sơ waeta-fujian) hoặc để agent soát.
- (B) Làm như brief (Prime giữ loại): PR nhỏ, đổi 5 test cũ (thêm `engine_maker` hoặc nguồn thứ hai cho dòng bị loại). Hệ quả: 52 dòng vi phạm thật vào top 30 ở 11 lượt máy nhỏ.

## Lỗi ngoài phạm vi thấy được (không sửa)
- `dispLitres` / `litres`: "9.726L" (westinpower #1107, nhãn "Displacement" không đơn vị) đọc thành 9726 (dấu chấm hiểu là ngăn nghìn) → các số dạng "x.xxxL" không nhãn đơn vị có thể bị đọc sai ×1000.
- Catalog không đọc dung tích ở bảng taihai-taizhou #116 ("| 6 | 138/160 | 14.5 |").

## Chưa làm / chưa kiểm
- Bước 2 (sửa + test) chưa làm; 5 test hiện đỏ trong worktree vì luật mới (dự kiến): `cand-filter` ×2, `config-accuracy` ×2, `mins-fix2` ×1.
- Ca 7–9 chưa đối chiếu trang hãng.
- Quay lui: worktree chưa commit; bỏ việc thì `git worktree remove --force wt-loai-nguon`.

---

# Sửa litres ("9.726L" thành 9726 L) — PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/576

Điều phối chọn A (bỏ luật "nguồn đơn lẻ"); PR duy nhất của phiên là sửa lỗi đọc dung tích. Nhánh `disp-litres` (commit d328038, từ origin/main 792484e), worktree `C:\Projects\GenSet Pro\wt-loai-nguon`. Thay đổi luật nguồn ở Bước 1 đã bỏ (không commit).

## Chỗ sai
`litres()` (suppliers/config-bot.mjs): regex lấy số ưu tiên dạng ngăn nghìn `\d{1,3}([.,]\d{3})+`, `numOf` bỏ dấu → "9.726" = 9726; có đơn vị lít nên trả luôn 9726 L. Cũng đúng với nhãn có đơn vị ("Displacement (L)" | "45.842": `dispLitres` thêm " L" rồi gọi `litres`).
Sửa: đơn vị lít + MỘT dấu tách + trị > 100 L → dấu là thập phân; nhiều dấu tách → null. cc/cm³/ml (chia 1000), số không đơn vị, số > 100 L viết thập phân thường ("105,56 L", "257 L") không đổi.

## Tệp đổi
- `suppliers/config-bot.mjs` (+4 dòng trong `litres`).
- `suppliers/disp-litres.test.mjs` (mới, 2 test: các dạng số; dòng có "9.726L" không còn bị loại theo "≤ 9.8 L"). Cả 2 test đỏ trên mã cũ (đã chạy), xanh trên mã mới.

## Lệnh kiểm
- `node --test suppliers/`: `# tests 397 # pass 397 # fail 0` (main 395 + 2).
- `node suppliers/verify.mjs`: `433 bản ghi, 0 có lỗi`.

## Số đo trước/sau (đo; `loai-nguon\measure2.mjs`, 6 tiến trình, mã cũ = origin/main 792484e, mới = d328038; bộ 1.539 lượt / 1.162 gói kiem-rong; 0 lỗi)
- Dữ kiện dung tích của catalog đọc khác: **262 dữ kiện / 199 động cơ** (`out\d-facts.json`); giá trị mới 0,296–61,1 L (20 dưới 1 L, 117 từ 1–5 L, 78 từ 5–20 L, 47 từ 20–100 L), không cái nào > 100 L hay null. NCC nhiều nhất: victory-generator 32, liangzi-yangzhou 28, aoke-yangzhou 18, zhengchi-power 17.
- Lượt có thay đổi: 200 lượt / 185 gói.
- **Loại oan được sửa** (trước loại, nay không): **296 dòng / 20 lượt / 18 gói**, đều lý do dung tích tối đa (ví dụ IB2600354007 30 kVA, maxDisp 4 L: Isuzu JE493ZLDB02 "2.771" đọc 2771 L; IB2400114476/IB2400311120… 12 kVA, maxDisp 1,826 L: 4DW8123D).
- **Lọt oan được sửa** (trước không loại, nay loại): **8.654 dòng / 167 lượt / 155 gói**, chủ yếu dung tích tối thiểu: trước đây chỉ cần MỘT nguồn bị đọc ×1000 là "không phải mọi nguồn đều dưới ngưỡng" nên động cơ nhỏ lọt. Ví dụ IB2300088930 20 kVA (≥ 2,9 L) 207 dòng, IB2400116787 12 kVA (≥ 2,3 L) 204 dòng: Perkins 404D-22G 2,216 L.
- Dòng vẫn bị loại nhưng đổi lý do (thêm "disp"): 3.229.
- Top 3 đổi: **91 lượt / 86 gói**; top 30: 1.140 dòng mới ở 138 lượt.

## 3 mẫu đối chiếu nguồn hãng
1. Perkins 404D-22G (westinpower "Displacement | 2.216 L", trước đọc 2216 L, nay 2,216): https://www.perkins.com/en_GB/products/new/perkins/electric-power-generation/diesel-engines/1000002596.html — "Displacement, 135.2 in³ 2.2 l". Nay bị loại đúng ở HSMT "≥ 2,3 L".
2. Perkins 403D-11G (gb-power / genlitec "1.131L", trước 1131 L): https://www.perkins.com/en_GB/products/new/perkins/electric-power-generation/diesel-engines/1000002666.html — "Displacement, 69 in³ 1.1 l".
3. Baudouin 6M16 (westinpower "9.726L", trước 9726 L; ca 5 ở trên): https://baudouin.com/engine_product/6m16-3/ — "Total Displacement (L): 9.7". Nay hai NCC (waeta 9.73, westinpower 9.726) cùng trị.

## Rủi ro / quay lui
- Loại thêm 8.654 dòng đúng theo số liệu, nhưng nếu ngưỡng HSMT đọc sai thì nay loại oan nhiều hơn (lỗi ngưỡng là việc khác, xem kiem-rong / mins-fix).
- Dữ kiện mâu thuẫn còn lại là dữ liệu NCC (vd 4016TAG1A: gb-power 45,842 vs khác 61,123; YD480D 1,532 vs 1,809), không phải đọc số.
- Một số "x.xxx L" > 100 L thật viết ba chữ số thập phân (vd "105.560 L") vẫn đọc đúng 105,56; số lít ngăn nghìn thật (bồn "2.000 lít") nay đọc 2 L — `litres` chỉ dùng cho dung tích động cơ (`dispLitres`), không cho bồn.
- Quay lui: revert d328038. Sửa config-bot.mjs không cần restart bot.

## Chưa kiểm
- Chưa chạy agent; chưa so cấu hình configmatch đang hiển thị.
- Chưa soát tay ngưỡng HSMT của 155 gói có dòng mới bị loại (chỉ xem 8 gói lớn nhất: ngưỡng 2,27–2,9 L, động cơ 404D-22G 2,216 L).
