# Nghiệm thu chuan-hoa-2b (lần 1): đơn vị mặc định cho dung tích (`disp`)

- Quyết định Khoa 14/11/2026, nguyên văn: "displacement nên default đơn vị là L hoặc cm³ (cc)".
- PR draft (chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/785. Nhánh `chuan-hoa-2b` từ origin/main `687921d7`.
- Không đổi `web/catalog.js`; `spec-norm.js` vẫn chưa được web / config-bot nạp.

## Tệp đổi
| Tệp | Đổi |
|---|---|
| `web/spec-norm.js` | `disp`: khi ô, nhãn, ô đơn vị tiêu đề và tên bảng đều không ghi đơn vị, MỌI số 0,4–100 thì là L, 400–100.000 thì là cc (dải `likely` của `catalog.js`). Sau đó xử lý như ô ghi rõ đơn vị, và ghi `cond.unitFrom: "default"`. Ngoài hai dải vẫn `missing: unit`. Đơn vị đọc được từ nguồn thì không đổi gì. Thêm 2 điểm (xem "Cần điều phối xem"): nhãn ghi một đơn vị KHÁC (`(mm)`, `(A)`…) thì không mặc định; "ccm" đọc là cc. |
| `web/test/spec-norm.test.mjs` | Ca aosif "38" đổi từ thiếu đơn vị sang L mặc định. Thêm 8 ca: kanpor-fuan "排量 7.146"; dải cc; số nằm giữa hai dải; tên bảng ghi đơn vị; jlmech "Displacement (mm)"; honny "排量 (A)"; endress "Displacement [ccm]". |
| `suppliers/CLAUDE.md` | Ghi ngoại lệ duy nhất cho `disp`, kèm ngày và câu của Khoa. |
| `suppliers/quality-baseline.json` | Sinh lại. |

## Số đo (ĐO, 11.028 giá trị disp, cn/*.json trên `687921d7`)
| | Trước | Sau |
|---|---|---|
| Thiếu đơn vị | 1.452 (13,2%) | 203 (1,8%) |
| Chuyển sang L mặc định | — | 1.196 |
| Chuyển sang cc mặc định | — | 0 |
| Đọc từ nguồn "[ccm]" → cc (endress-stromerzeuger) | — | 53 |

- Không giá trị nào khác đổi: so từng giá trị, chỉ đổi ở 1.196 giá trị mặc định và 53 giá trị "ccm".
- 1.196 giá trị L mặc định chia theo nhãn: "Displacement" 1.115, "排量" 42, "Disp." 20, "DISPLACEMENT" 18, "Engine displacement" 1.
- Không có giá trị cc mặc định: 40 giá trị trước đây rơi vào dải cc đều là endress "[ccm]" (nay đọc từ nhãn) hoặc jlmech "(mm)" (nay giữ thiếu).

### Còn thiếu đơn vị: 203 (liệt kê hết)
| NCC | Nhãn | Số giá trị | Lý do |
|---|---|---|---|
| honny-dongguan n101 / n102 / n103 | `排量 (A)` | 136 (72 + 58 + 6) | Nhãn ghi "(A)", là đơn vị ampe và sai cho dung tích. Không phải "không ghi đơn vị" nên không mặc định. Giá trị là 14, 17, 21, 25, 33, 42, 43, 54, 65, 86. |
| jlmech-wuhan n102 / n104 | `Displacement (mm)` | 67 (29 + 38) | Nhãn ghi "(mm)", sai cho dung tích. Giá trị là 4.3; 6.5; 8.3; 8.9; 12.88; 11.8; 142; 25.8; 26.6; 32.8; 35.1; 57.2; 2.49; 249; 433; 4.33; 4.21; 6.87; 7.26; 10.33; 11.73; 12.15; 12.94; 16.35; 19.6; 39.58; 79.17; 105.6. |
Trong đó "249" (YC2115ZD) và "433" (YCD4J12D-55) là nguồn viết sai dấu chấm (2.49 / 4.33 ở dòng khác). Nếu cứ mặc định theo độ lớn thì hai số này sẽ thành cc.

## Mâu thuẫn dung tích theo model động cơ (`quality.mjs --conflicts`)
| | trước chuẩn hoá | "đủ đơn vị" | nới |
|---|---|---|---|
| Trước | 352/968 | 314/875 | 352/966 |
| Sau | 352/968 | 351/966 | 352/966 |

- Thêm 91 model so được. 37 model mới vào danh sách mâu thuẫn; 132 dòng mâu thuẫn cũ có thêm NCC.
- 18 dòng có hai số chênh hơn 3 lần. Chỉ 3 dòng trong đó có giá trị L mặc định, và cả 3 là CON SỐ nguồn khác chứ không phải đơn vị: agestar ghi 13 cho KTA19-G3A (nguồn khác ghi 18.9), hosem-power ghi 1.04 cho BF4M2012 (nguồn khác ghi 4), mhiet ghi 18.56 cho S6R-PTA (nguồn khác ghi 24.5 / 6). Các dòng còn lại do giá trị đọc từ nguồn có "(L)", ví dụ huipu "Swept volume(L) = 1278", aoke "排量(L) = 108".
- Số "đủ đơn vị" tăng 37, vượt ngưỡng `conflictRise` 5, nên baseline phải sinh lại. Đây là chủ ý: trước đây các model này không so được.

## 10 mẫu ngẫu nhiên (hạt giống cố định 20261114, trong 1.196 giá trị mặc định)
| NCC | Model | Nhãn = ô | → |
|---|---|---|---|
| kanpor-fuan n122 | BF6M1013FCG3 | 排量 = 7.146 | 7.146 L |
| tellhow-power n115 | TAD1351GE | Displacement = 12.78 | 12.78 L |
| tellhow-power n130 | YC6MK450-D30 | Displacement = 10.34 | 10.34 L |
| tellhow-power n115 | TWD1653GE | Displacement = 16.12 | 16.12 L |
| mwm n1008 | 3016 V16 | 排量 = 35.0 | 35 L |
| victory-generator n111 | TAD1651GE | Displacement = 16.12 | 16.12 L |
| aosif n115 | DP126CAK | Displacement = 11.1 | 11.1 L |
| agestar n104 | KTA50-G9 | Displacement = 37.8 | 37.8 L |
| agestar n111 | ASG224E | Displacement = 4.4 | 4.4 L |
| aosif n117 | QSL9-G5 | Displacement = 8.9 | 8.9 L |
Cả 10 đều có độ lớn của lít, nên đơn vị L hợp lý. Về con số: TAD1651GE 16.12, TAD1351GE 12.78, QSL9 8.9 khớp các NCC khác. agestar ghi 37.8 cho KTA50-G9, mà KTA50 khoảng 50 L còn 37.8 L là dung tích của KTA38; đây là con số nguồn ghi sai, không phải lỗi đơn vị.

## Cần điều phối xem
1. Nhãn ghi đơn vị sai ("排量 (A)", "Displacement (mm)"): tôi đọc "ô, nhãn… đều KHÔNG ghi đơn vị" theo nghĩa đen, nên 203 giá trị này giữ `missing: unit`. Nếu Khoa muốn coi đơn vị sai như không ghi thì bỏ điều kiện `otherUnit` (1 dòng). Khi đó 196 giá trị sẽ thành L, và jlmech "249", "433" thành cc (sai).
2. "ccm" (tiếng Đức, cm³) nay đọc là cc từ nhãn. Đây là đọc chữ trong nguồn, không phải mặc định. Trước đây 53 giá trị endress thiếu đơn vị, trong đó 6 giá trị dưới 100 ("79 ccm") nếu không có điểm này sẽ bị mặc định thành L (sai).

## Kiểm (đầu ra thật)
```
node --test web/test/spec-norm.test.mjs web/test/static.test.mjs → tests 158, pass 158, fail 0
node --test suppliers/*.test.mjs                                 → tests 849, pass 849, fail 0
node suppliers/verify.mjs                                        → exit 0
node suppliers/quality.mjs --check (sau --write-baseline)        → không chỉ số nào xấu đi quá ngưỡng.
web/catalog.js                                                   → không khác origin/main
```
