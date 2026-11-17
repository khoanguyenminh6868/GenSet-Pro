# Nghiệm thu: Gợi ý giá chuyên môn — PR 3 (hiệu chỉnh khoảng giá theo cạnh tranh dự báo)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/508 (DRAFT, nhánh `bidprice-calib`, trên origin/main 93ea919, đã có #505, #506)
- **Không đổi 3 mức giá đang hiển thị.** Cách mới chỉ chạy khi bot có biến môi trường `GENBID_BIDPRICE_CALIB=1` và chỉ ghi thêm `stats.calib`; web chưa hiện gì. **Khoa quyết có bật không** (đề xuất cuối tệp).

## Tệp đã đổi
| Tệp | Nội dung |
|---|---|
| `web/bidprice.js` | `CALIB {lam 0,5; q 0,2}`, `wQuantile`, `calibLevels`; `suggest(…, prior, { fc })` thêm `stats.calib` (levels không đổi); `engineWords` cho `rivalsOf` |
| `suppliers/bidprice-bot.mjs` | `prep`: `nbForecast` chỉ khi `GENBID_BIDPRICE_CALIB=1` → `samples.json.fc`; `check` truyền `{fc}` |
| `suppliers/bidprice-backtest.mjs` | `--calib`: so hai cách trên cùng phần, cả giai đoạn + nửa sau |
| `web/index.html` | `bidBasis` gửi thêm `location`, `field`, `bidCloseDate`; ô lãi suất nhận "9.5"/"9,5" |
| `suppliers/bidprice.test.mjs` | test levels không đổi, calib theo dự báo, `wQuantile`; test đối thủ với dòng ghi hãng tổ máy "FPT" + "Động cơ: Cummins" |

## Lệnh kiểm (chạy cục bộ — nhánh này không có run GitHub Actions)
```
node --test suppliers/*.test.mjs     → # pass 174  # fail 0
node -e '…new Function(script)…'     → ok (index.html)
node suppliers/bidprice-backtest.mjs --calib   → 808 phần, 244 s (đầu ra dưới)
```
Thử trên trang cục bộ (serve.js, DB giả): nhập lãi suất "9.5" → lưu 9.5; "9,5" → 9.5; "10" → 10.

## Cách đo
`bidprice-backtest.mjs`: với mỗi phần mua sắm máy phát đã có kết quả (808), chỉ dùng phần khác có kết quả công bố trước ngày đóng thầu của nó; ứng viên do code chọn (coi là "gần", không có bước agent); dự báo số nhà thầu `nbForecast` cũng chỉ từ dữ liệu đó (không dùng số nhà thầu thật). Kiểm thử tiến dần: số "nửa sau" (đóng từ 13/09/2024) là phần độc lập hơn.
Tham số: 2 (lam = mức kéo trọng số về 1; q = phân vị biên). Chọn trên cả giai đoạn trong số {lam 0,5; 1} × {q 0,25; 0,2; 0,15; 0,1} — nửa đầu và nửa sau cho cùng thứ tự, không thấy khớp quá mức.

## Bảng trước/sau từng biến thể (ĐO THẬT; phủ = tỉ lệ giá trúng thật trong [thấp, cao]; sai/lệch/rộng tính bằng điểm % giá gói; lệch dương = mức giữa cao hơn giá trúng)
Cả giai đoạn, 671 phần (thử trong scratchpad `calib-exp.mjs`, cùng tập ứng viên):

| Biến thể | Phủ | Sai mức giữa | Lệch | Rộng | Lệch 1 / 2–3 / 4–5 / ≥6 NT | Lệch cn |
|---|---|---|---|---|---|---|
| Hiện nay 25/75 | 36,4% | 6,8 | −1,0 | 12,0 | −4,4 / −2,0 / +4,1 / +11,3 | +6,1 |
| (b) chỉ nới 20/80 | 43,1% | 6,8 | −1,0 | 16,6 | như trên | +6,1 |
| (b) chỉ nới 15/85 | 52,2% | 6,8 | −1,0 | 21,2 | như trên | +6,1 |
| (b) chỉ nới 10/90 | 60,4% | 6,8 | −1,0 | 26,7 | như trên | +6,1 |
| (a) dự báo lam 0,5, 25/75 | 42,9% | 5,7 | +0,3 | 11,4 | −1,8 / −0,7 / +5,7 / +13,0 | +8,1 |
| (a) dự báo lam 1, 25/75 | 38,0% | 5,7 | +0,3 | 10,3 | −1,8 / −0,5 / +6,8 / +10,1 | +7,7 |
| **(a)+(b) lam 0,5, 20/80 (chọn)** | **53,0%** | **5,7** | **+0,3** | **14,5** | −1,8 / −0,7 / +5,7 / +13,0 | +8,1 |
| (a)+(b) lam 0,5, 15/85 | 60,7% | 5,7 | +0,3 | 16,4 | | |
| (b) mức giữa ± sai số quá khứ (trung vị |sai|, cửa sổ mở rộng) | 52,1% | 6,8 | −1,0 | 13,7 | | |
| (a)+(b) lam 0,5 ± sai số quá khứ | 52,3% | 5,7 | +0,3 | 11,4 | | |
| (c) lam 0,5 + sửa lệch theo nhóm HSMT (nửa sau) | 55,9% | 5,4 | −1,2 | 12,6 | | cn +4,7 |

Cách chọn chạy lại bằng script trong repo (`--calib`), cùng 670 phần:

| | Phủ | Sai mức giữa | Lệch | Rộng | Phủ 1 / 2–3 / 4–5 / ≥6 NT |
|---|---|---|---|---|---|
| Hiện nay | 36,4% | 6,8 | −1,0 | 12,0 | 37,1 / 35,6 / 37,3 / 36,2 |
| Hiệu chỉnh | 53,0% | 5,7 | +0,3 | 14,5 | 60,6 / 55,6 / 47,0 / 43,1 |
| Hiện nay, nửa sau (335) | 38,5% | 6,5 | −1,8 | 14,0 | 30,9 / 36,8 / 49,3 / 41,2 |
| Hiệu chỉnh, nửa sau (335) | 57,3% | 5,3 | −0,8 | 16,3 | 58,0 / 57,4 / 61,2 / 51,0 |

Theo nhóm hàng trúng, nửa sau: cn 37,5% → 48,8% (sai 8,5 → 8,1), cnmade 60 → 75%, foreign 20,0% → 48,6% (sai 6,2 → 4,4).

## Kết luận
- (a) Trọng số theo cạnh tranh dự báo giảm sai số mức giữa 6,8 → 5,7 điểm (nửa sau 6,5 → 5,3) và gần như hết lệch ở gói 1 và 2–3 nhà thầu (−4,4 → −1,8; −2,0 → −0,7).
- (b) Nới khoảng: 20/80 có trọng số đưa độ phủ lên 53% (nửa sau 57%), gần mục tiêu 50%, khoảng rộng thêm 2,5 điểm. Cách "± sai số quá khứ" hẹp hơn (11,4) với cùng độ phủ nhưng phải chạy lại hậu kiểm của mọi gói cũ mỗi lần tính (~4 phút) — không làm được lúc chạy; bỏ.
- (c) Lệch nhóm Trung Quốc **chưa sửa được** bằng thông tin trước ngày đóng thầu: nhóm theo HSMT gần như không bao giờ là cn (6/671 phần), sửa theo nhóm HSMT làm tổng thể kém đi (5,3 → 5,4); trọng số theo dự báo còn làm lệch cn tăng (6,1 → 8,1). Trong bot thật, nhóm lấy từ cấu hình hạng 1 (cn sẽ bỏ gói ngoài TQ) nên lệch này có thể nhỏ hơn số đo ở đây — chưa đo được vì gói cũ không có Gợi ý cấu hình.
- Gói ≥6 nhà thầu vẫn bị gợi ý cao (+13 cả giai đoạn, +8,6 nửa sau): dự báo hiếm khi thấy trước gói đông.

## Đề xuất cho Khoa
Bật `GENBID_BIDPRICE_CALIB=1` và (PR sau) cho web hiện 3 mức hiệu chỉnh thay mức hiện tại, kèm dòng "khoảng [Cạnh tranh, Cao] chứa khoảng một nửa giá trúng của gói cũ". Lý do: cùng dữ liệu, mức giữa sát hơn ~1,1 điểm % giá gói (≈ 11 triệu trên gói 1 tỷ) và khoảng không còn hẹp giả tạo. Nếu Khoa muốn giữ 3 mức cũ: có thể hiện thêm dòng tham khảo thay vì thay.

## Hai sửa nhỏ
- Đối thủ "Động cơ khi trúng": chỉ đọc 70 ký tự ngay sau "động cơ"/engine trong dòng tổ máy (bỏ hãng tổ máy, tên công ty). Kiểm "FPT" ở ảnh 6: là thật — IB2400493077 (Viễn thông Cà Mau) hàng trúng ghi "Động cơ FPT (Thương hiệu Ý - G7. sản xuất tại Ý)", IB2400495407 "Động cơ FPT (Ý)".
- Ô lãi suất: "9.5", "9,5", "9,5%" → 9,5.

## Rủi ro + quay lui
- Cờ tắt: không ảnh hưởng gì tới kết quả đang đăng. Bật thì chỉ thêm `stats.calib`. `bidBasis` gửi thêm 3 trường (bot cũ bỏ qua).
- Hai tham số chọn trên cả giai đoạn (có dùng nửa sau khi chọn) — nửa sau không hoàn toàn "chưa thấy"; nửa đầu cho cùng thứ tự (25/75 có trọng số: phủ 34,5 → 48,9% với 20/80, sai 7,5 → 6,3).
- Hậu kiểm bỏ bước agent; với agent, pool khác.
- Quay lui: revert squash commit.

## Chưa kiểm được
- Bot thật với cờ bật (không chạy agent trong việc này).
