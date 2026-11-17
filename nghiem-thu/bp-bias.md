# Nghiệm thu: Gợi ý giá — sửa độ lệch / độ phủ khoảng hiệu chỉnh (bp-bias)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/595 (DRAFT, nhánh `bp-bias`, commit 446d21a, trên origin/main e968176)
- **Kết luận ngắn:** đạt độ phủ > 60% (54,8% → 62,4%; ngoài mẫu 60,7% → 72,0%), sai mức giữa không đổi (5,7), độ rộng trung vị +0,9 điểm.
  **Hai độ lệch (cn +7,0; ≥6 nhà thầu +12,5) KHÔNG sửa được** bằng dữ liệu có trước ngày đóng thầu: thử 6 cách, không cách nào giảm lệch mà không làm kém tổng thể (bảng dưới). Thêm nữa: **38/48 phần mới lọt khoảng là gói trúng ≥ 99% giá gói** (mức Cao nhích lên sát 100%), chỉ 8 phần lọt nhờ mức thấp. Phiên điều phối/Khoa quyết có nhận cách này không.

## Tệp đã đổi
| Tệp | Nội dung |
|---|---|
| `web/bidprice.js` | `CALIB.s` 1,1: `calibLevels` giãn [thấp, cao] quanh mức giữa ×s, Cao ≤ 100% giá gói (mức giữa không đổi). `stats.calib` ghi thêm `s` và `fc` (dự báo 4 nhóm số nhà thầu, 3 chữ số) |
| `suppliers/bidprice-bot.mjs` | `GENBID_BIDPRICE_S` (ghi đè s; =1 là khoảng như trước PR). `historyOf` + `HIST_MAX` 10: `bidprice/<TBMT>.history` giữ các lần tính trước |
| `suppliers/bidprice-backtest.mjs` | in s; in thêm nửa sớm (nửa chọn s) bên cạnh nửa sau; đọc `GENBID_BIDPRICE_S` |
| `suppliers/bidprice.test.mjs` | test giãn s, chặn 100%, fc; test `historyOf` (gói một cỡ, nhiều cỡ, cắt 10) |

Không đụng `web/index.html`, `config-bot.mjs`, `bot/`. Web vẫn đọc 3 mức qua `bpLevelsOf` (không đổi).

## Lệnh kiểm (đầu ra thật)
```
node --test suppliers/*.test.mjs                                  → # pass 481  # fail 0
node suppliers/bidprice-backtest.mjs --calib                       → 1556 gói bidhist, 808 phần, 635 có giá (đầu ra dưới)
GENBID_BIDPRICE_S=1 node suppliers/bidprice-backtest.mjs --calib   → số gốc (không giãn)
```
Script thử nghiệm trong scratchpad (`dump.mjs`, `an.mjs`, `diag*.mjs`, `exp*.mjs`, `st*.mjs`, `one.mjs`, `rec.mjs`): ghi pool từng phần một lần rồi thử biến thể; tái lập đúng số của script repo (635 phần, 54,8% / 5,7 / 13,1 trước khi chặn 100%).

## Bước 1 — tái lập số gốc (ĐO, dữ liệu 12/11; số 11/11 là 53,0% trên 670 phần, dữ liệu đã đổi)
| | Phủ | Sai mức giữa | Lệch | Rộng |
|---|---|---|---|---|
| Không calib (25/75) | 36,4% | 7,0 | −1,3 | 10,9 |
| Calib (đang chạy) | 54,8% | 5,7 | +0,9 | 12,9 |
| Calib, lệch theo nhóm | cn +7,0 · cnmade −1,5 · foreign −1,4 · không rõ +0,2 | | | |
| Calib, lệch theo số NT thật | 1: −1,4 · 2–3: −0,3 · 4–5: +5,2 · ≥6: +12,5 | | | |

### Nguyên nhân (ĐO)
- Lệch tập trung ở phần **HSMT không nói nhóm mà hàng trúng là cn**: 106 phần, lệch +11,5, 55% rơi dưới khoảng. HSMT nói "ngoài TQ" mà cn trúng: lệch chỉ +1,6.
- Theo **dự báo** (thứ có trước đóng thầu) thì lệch nhỏ: dự báo cao nhất 1 / 2–3 NT lệch −0,1 / +0,8; 4–5 / ≥6 lệch +4,2 / +5,6. Lệch lớn theo số NT **thật** là hồi quy về trung bình: 57 phần dự báo 2–3 mà thật ≥6 có lệch +20,1. Dự báo không thấy trước được.
- Ngay cả biết đúng nhóm hàng trúng (lọc pool như bot làm khi cấu hình hạng 1 là cn): lệch cn +7,0 → +6,9. Gói cn trong pool cũng cao hơn giá trúng thật trung vị +4,1 điểm.
- Giai đoạn: nửa sớm (2023–09/2024) lệch +2,1, nửa muộn −0,2. Năm 2024 có 24% phần ≥6 NT (2023: 11%), pool từ năm trước vắng hơn. Đây là đổi chế độ, không phải tham số sai.
- Hỏng một phía: nửa sớm 39% dưới / 12% trên; nửa muộn 20% / 20% (đối xứng).

### Đã thử, không dùng (chọn trên nửa sớm, đo cả nửa muộn)
| Cách | Kết quả | Vì sao bỏ |
|---|---|---|
| Trọng số dự báo mạnh hơn (lam 0,75/1; mũ 1,5) | sớm: sai 6,9 → 7,2–7,6, ≥6 lệch 17,8 → 15,4–16,3 | sai mức giữa tăng |
| Lệch theo chủ đầu tư (k 2–10) | sớm: phủ ±1, sai 6,9, cn 11,5 → 8,1 | không cải thiện phủ / sai |
| Lệch theo tỉnh | sớm phủ 48,9 → 36–39% | kém đi |
| Trọng số gói cùng nhóm xuất xứ (×2–5), cả khi biết nhóm thật | sớm sai 6,9 → 7,0–7,2; muộn 5,1 → 4,7; cn muộn 4,6 → 3,0–3,4 | không nhất quán hai nửa, chỉ đo được với nhóm thật (giả định) |
| Trọng số theo độ mới gói cũ (tau 0,5–2 năm) | muộn phủ 60,7 → 39–58% | kém đi |
| Mức thấp theo kịch bản đông nhà thầu | như hạ phân vị, kém hiệu quả hơn giãn | |
| Phân vị thấp riêng (0,15/0,12/0,10 – 0,8) | tất: 59,1/14,9 · 61,1/16,0 · 62,5/17,0 | rộng hơn giãn s cho cùng độ phủ |
| Thêm gói 1 nhà thầu vào pool theo dự báo | sai 5,7 → 4,7 (cả hai nửa), nhưng lệch +0,9 → +2,2; cn/≥6 lệch tăng | trái quy tắc Khoa (chỉ gói có cạnh tranh) và làm lệch hai nhóm tệ hơn — **ghi lại để Khoa xem** |

## Bước 2 — cách chọn: giãn khoảng ×s
Chọn s trên nửa sớm (đóng trước 30/09/2024, 317 phần) theo tiêu chí "điểm phủ thêm trên mỗi điểm độ rộng thêm" lớn nhất (s 1,05: 3,08; **1,1: 3,70**; 1,15: 3,08; 1,2: 3,24; 1,3: 2,98; 1,5: 2,34). Một tham số mới (s), mức Cao chặn ở 100% giá gói (không phải tham số: không bỏ giá quá giá gói).

## Bảng trước/sau (ĐO, `bidprice-backtest.mjs --calib`, cùng 635 phần)
| | Phủ | Sai mức giữa | Lệch | Rộng trung vị |
|---|---|---|---|---|
| **Cả giai đoạn** trước (s 1) | 54,8% | 5,7 | +0,9 | 12,9 |
| **Cả giai đoạn** sau (s 1,1) | **62,4%** | 5,7 | +0,9 | 13,8 |
| Nửa sớm (chọn s) trước → sau | 48,9 → 52,7% | 6,9 → 6,9 | +2,1 | 10,2 → 11,2 |
| **Nửa muộn (ngoài mẫu)** trước → sau | **60,7 → 72,0%** | 5,1 → 5,1 | −0,2 | 14,8 → 15,9 |

Phủ theo nhóm, cả giai đoạn trước → sau (lệch không đổi vì mức giữa không đổi):

| Nhóm | n | Phủ | Lệch | Rộng |
|---|---|---|---|---|
| 1 NT | 163 | 66,9 → 77,3 | −1,4 | 10,9 → 11,9 |
| 2–3 NT | 232 | 56,5 → 66,4 | −0,3 | 13,3 → 14,2 |
| 4–5 NT | 129 | 48,8 → 53,5 | +5,2 | 13,3 → 14,3 |
| ≥6 NT | 111 | 40,5 → 42,3 | +12,5 | 14,9 → 15,8 |
| cn | 164 | 46,3 → 50,6 | +7,0 | 13,9 → 14,6 |
| cnmade | 34 | 58,8 → 61,8 | −1,5 | 12,6 → 13,7 |
| foreign | 66 | 34,8 → 51,5 | −1,4 | 9,0 → 9,9 |
| không rõ | 371 | 61,7 → 69,5 | +0,2 | 13,1 → 14,2 |

Nửa muộn theo nhóm sau: 1 NT 80,8 · 2–3 74,6 · 4–5 68,8 · ≥6 54,3 · cn 61,6 · foreign 63,6.

**Phần mới lọt khoảng: 48 (mất 0). 40 lọt nhờ mức Cao, trong đó 38 có giá trúng ≥ 99% giá gói; 8 nhờ mức thấp.** Tức là cái lợi chủ yếu là "Cao" phản ánh đúng việc nhiều gói trúng sát 100% (thường gói ít cạnh tranh), không phải bắt thêm gói rẻ.

## 3 mẫu đối chiếu (bidhist, doc-cache; tỉ lệ = giá trúng / giá gói)
1. IB2500144659 "Cung cấp và lắp đặt máy phát điện 6.5KVA", đóng 24/04/2025, 2 NT, hàng trúng "Máy phát điện 6.5KVA 1 pha", KOOP POWER, xuất xứ Trung Quốc; trúng 2.049.840.000 / giá gói 2.052.000.000 = 99,89%. Khoảng cũ 84,4–98,4% (lọt ra trên), mới 83,1–100% (lọt).
2. IB2500102600 "Gói thầu số 3: Cung cấp và lắp đặt hệ thống máy phát điện dự phòng", đóng 18/04/2025, 1 NT, "Máy phát điện Diesel 2500kVA-6Kv", Cummins Ltd, Anh Quốc (UK); 18.073.833.118 / 18.090.696.000 = 99,91%. Cũ 96,0–99,9% (trượt 0,02 điểm), mới 95,9–100%.
3. IB2500536474 "Mua sắm máy phát điện 12.5KVA", đóng 03/12/2025, 3 NT, Thiên Hòa An, Việt Nam; 5.302.800.000 / 6.024.456.000 = 88,02%. Cũ 88,8–99,7% (lọt ra dưới), mới 88,0–99,9% (lọt) — một trong 8 phần lọt nhờ mức thấp.
Một gói vẫn trượt (minh hoạ lệch ≥6 NT): IB2500261097 "Mua máy phát điện công nghiệp 500KVA", 11 NT, Wetech/Trung Quốc, trúng 789.000.000 / 1.080.000.000 = 73,1%; khoảng mới 88,5–98,5%.
URL: trường `url` của từng gói trong `genbid-work\doc-cache\bidhist.json` (trang KQLCNT muasamcong).

## Việc phụ: ghi giá gợi ý để hậu kiểm tiến dần
Trước PR, `bidprice/<TBMT>` = `{ at, result }`: có 3 mức cũ, `stats.calib` {levels, lam, q}, `basis` {kva, price, rating, group, qty}, `at`. Thiếu:
- dự báo số nhà thầu lúc tính → **đã thêm** `stats.calib.fc`;
- tham số giãn → **đã thêm** `stats.calib.s`;
- **mỗi lần tính lại (sau Gợi ý cấu hình mới, #521) ghi đè** — nếu tính lại sau ngày đóng thầu thì mất giá lúc trước đóng thầu → **đã thêm** `history` (≤10 lần trước: at, giá gói, kVA, nhóm, 3 mức cũ, 3 mức hiệu chỉnh + lam/q/s/fc). Gói nhiều cỡ lấy mức cả gói.
Còn đề xuất (chưa làm): script hậu kiểm tiến dần đọc `bidprice` + `bidhist`, lấy lần tính cuối có `at` < `bidCloseDate`, so giá trúng; cần ngày đóng thầu từ `bidhist`/tender (không ghi trong bidprice). Ghi chú: hiện bản ghi dùng giá agent đã xếp (khác hậu kiểm code), nên đây là số đo đúng của cái Khoa thấy trên web.

## Rủi ro + cách tắt
- `GENBID_BIDPRICE_S=1` trên máy bot → khoảng như trước PR (mức giữa vốn không đổi). `GENBID_BIDPRICE_CALIB=0` vẫn tắt cả bản hiệu chỉnh. Quay lui hẳn: revert squash commit.
- Kết quả cũ trên web chỉ đổi khi gói được tính lại.
- **Dòng giải thích trên web còn ghi "chứa khoảng một nửa giá trúng"** (`BP_CALIB_NOTE`, `web/index.html:4608`, ngoài phạm vi PR) — nên sửa thành "khoảng 6/10" ở PR giao diện sau.
- Mức Cao hay sát 100% giá gói hơn (chặn ở 100%): thông tin "Cao" ít giá trị hơn với gói ít cạnh tranh.
- `history` làm tài liệu `bidprice` lớn thêm ~2 KB/lần, tối đa 10 lần. `api/ingest.js` không lọc trường (đã kiểm).
- s chọn trên nửa sớm; nửa sớm và nửa muộn khác chế độ (2024 đông nhà thầu), nên độ phủ thực tế sắp tới có thể giữa 53% và 72%.
- Hậu kiểm bỏ bước agent (mọi ứng viên coi là "gần").

## Chưa kiểm được
- Bot thật với PR (không chạy agent, không ghi web thật). `historyOf` chỉ kiểm bằng test đơn vị, chưa qua `post` thật.
- Lệch cn khi cấu hình hạng 1 là cn: chỉ đo được bằng giả định nhóm cấu hình = nhóm hàng trúng (lệch gần như không đổi).
