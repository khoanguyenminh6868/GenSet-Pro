# Nghiệm thu: Gợi ý giá chuyên môn — PR 4 (bật hiệu chỉnh mặc định + web hiện mức hiệu chỉnh)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/511 (DRAFT, nhánh `calib-on`, trên origin/main fe1a719)
- Khoa đã duyệt bật bản hiệu chỉnh (11/11). Nhánh không có run GitHub Actions: **mọi test chạy cục bộ**.

## Tệp đã đổi
| Tệp | Nội dung |
|---|---|
| `suppliers/bidprice-bot.mjs` | `calibOn()` = bật trừ khi `GENBID_BIDPRICE_CALIB=0`; `prep` tính `fc` theo đó, trả `fc`; đường "không có ứng viên" cũng truyền `fc`; gói nhiều cỡ: `result.calib` = tổng `stats.calib.levels` của các cỡ (khi cỡ nào cũng có), `levels` cũ giữ nguyên; `printResult` in dòng hiệu chỉnh |
| `suppliers/bidprice.test.mjs` | test: mặc định bật / `=1` bật / `=0` tắt; `check` với `fc` có `stats.calib`, không có `fc` thì không; `levels` y hệt cũ |
| `web/index.html` (chỉ phần Giá gợi ý) | `bpLevelsOf(result)`: lấy calib khi có, không thì `levels` cũ; dùng ở bảng lợi nhuận kỳ vọng + cảnh báo giá gói khó khả thi (`profitHtml`), 3 ô mức giá (`bidPriceHtml`), tổng gói nhiều cỡ (`bidPriceMultiHtml`); dòng "Khoảng thấp–cao chứa khoảng một nửa giá trúng của các gói cũ; đã tính theo số nhà thầu dự báo."; `bpCrowdNote`: lưu ý khi dự báo nghiêng về ≥6 nhà thầu (`fc.top === 3`) hoặc `basis.group === "cn"` (cấu hình hạng 1; gói nhiều cỡ: có cỡ nào cn) |

Ghi chú: ô calib không có "% gói cũ trúng ≥ mức này" (không lưu `chance`) nên với calib bỏ phần đó và câu giải thích nó. Không tự trừ số cho lưu ý. Không có thao tác ghi docs mới (không cần `updated_at`). Không có hàm trùng tên (grep trước: `bpLevelsOf`, `bpHasCalib`, `bpCrowdNote` chưa có). `SHOW_SRC` không liên quan phần này.

## Lệnh kiểm đã chạy (cục bộ)
```
cd suppliers && node --test          → # tests 179  # pass 179  # fail 0
node -e '…new Function(script)…'     → syntax ok (index.html)
node suppliers/bidprice-backtest.mjs --calib   (808 phần, 505 s)
  Hiện nay:    670 phần  phủ [thấp,cao] 36,4%  sai mức giữa 6,8 điểm  rộng 12,0
  Hiệu chỉnh:  670 phần  phủ [thấp,cao] 53,0%  sai mức giữa 5,7 điểm  rộng 14,5
```
Đúng số của PR #508 (53,0% / 5,7). (ĐO THẬT, chạy lại.)

## Thử giao diện cục bộ (serve.js, DB giả, nhập kết quả giả bằng `BP.suggest` thật)
- Kết quả có calib (gói IB2699000001): 3 ô Cạnh tranh 2,56 tỷ 80% / Trung vị 2,62 tỷ 82% / Cao 3,1 tỷ 97% (là mức hiệu chỉnh), có dòng giải thích khoảng, có lưu ý (cn), không in `chance`.
- Kết quả cũ không calib (IB2699000002): 2,56 / 3,04 / 3,07 tỷ kèm "% gói cũ trúng ≥ mức này" như trước, không có dòng khoảng; lưu ý không hiện vì nhóm "foreign" và dự báo không nghiêng ≥6.
- Gói nhiều cỡ có calib (IB2699000003, mobile 375): Cả gói 3 mức hiệu chỉnh + dòng giải thích 1 lần, mỗi cỡ gập; không tràn ngang (scrollWidth 375).
- Ảnh: `nghiem-thu\anh-gia-chuyen-mon-4\` — `…mj7xj6.jpg` desktop có calib, `…pzqq9p.jpg` desktop kết quả cũ, `…qd6lvm.jpg` mobile gói nhiều cỡ.

## Mẫu đối chiếu
Việc này không đổi nguồn dữ liệu nhà cung cấp; 3 mẫu đối chiếu là số trong 3 ô trên với `BP.suggest(pool,…)` của test (`calib.levels[1].ratio` 0,82 với dự báo nghiêng ≥6 nhà thầu), khớp ô trên màn hình (82%).

## Rủi ro + quay lui
- Bot đã chạy phải **restart task** để nạp bản mới (vòng điều phối nạp 1 lần). Kết quả mới có thêm `stats.calib` (và `result.calib` với gói nhiều cỡ); web cũ bỏ qua.
- Web mới đọc kết quả cũ như trước. Gói nhiều cỡ có một cỡ lỗi thì không có `result.calib` (rơi về `levels` cũ, cũng rỗng như trước).
- Số hiệu chỉnh là xu hướng; gói ≥6 nhà thầu vẫn lệch +8 (nửa sau) và nhóm TQ +3,5 nên có dòng lưu ý.
- Quay lui nhanh: đặt `GENBID_BIDPRICE_CALIB=0` cho bot (kết quả mới không có calib, web hiện 3 mức cũ). Quay lui hẳn: revert squash commit.

## Chưa kiểm được
- Bot thật với agent (không chạy agent, không ghi web thật); chưa xem trên Vercel.
- Ngưỡng "nghiêng về ≥6 nhà thầu" = nhóm có xác suất cao nhất của dự báo (`fc.top`), chưa đặt ngưỡng xác suất riêng.
