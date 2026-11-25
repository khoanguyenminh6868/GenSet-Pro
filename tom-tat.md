# ĐO LƯỢT 8: gộp #1229 (fuel-no-load) + #1232 (doc-hz-gtl)

Gốc origin/main 1ed6161; tích hợp `tich-hop-luot-8` e952f4b (merge #1229 rồi #1232, không xung đột; test suppliers + web: 2082 test, 0 lỗi, 2 skip).
Đo `do-gop.mjs`: 928 gói, 1057 lượt, 436 NCC, 0 lượt lỗi; cùng một bản bidhist (tải 24/11/2026 23:59 UTC), cùng `cn`. Bốn lần đo: gốc, tích hợp, riêng #1229 (11378ab), riêng #1232 (ca9ef51). Chi tiết từng dòng (điểm, lý do, tần số) chạy lại cho 528 lượt có dòng đổi, cả gốc và tích hợp.

## Số liệu
| | dòng đổi | lượt có dòng đổi | lượt đổi top 30 |
|---|---|---|---|
| #1229 riêng | 3783 (đều +300) | 264 | 36 (58 dòng vào, 58 ra) |
| #1232 riêng | 2445 (đều mất) | 456 | 0 |
| tích hợp | 6184 = 3739 (+300) + 2445 (mất) | 528 | 36 (giống hệt #1229) |

44 dòng nằm ở cả hai PR (+300 ở #1229 nhưng bản ghi mecca 60 Hz mất ở #1232): 3783 = 3739 + 44. Hai PR không chồng cơ chế khác. Tích hợp = hợp của hai, không tương tác.
**Dòng không quy được về cơ chế: 0 / 6184** (kiểm toàn bộ, không lấy mẫu; `dong-doi.tsv.gz` có cột cơ chế cho từng dòng).

## #1229: tiêu hao không ghi mức tải
- 3739 dòng / 264 lượt: gốc đã gắn `fuelNoLoad` (nhãn không ghi tải, tiêu hao > mức HSMT), nay điểm đúng +300 so với gốc; `why` có "nguồn không ghi mức tải: cần xác nhận"; không dòng nào còn bị loại vì tiêu hao (`ruled` không có fuel). Cả 3739 khớp cả bốn điều kiện (+300, nl ở cả hai bản, why mới, không ruled).
- Dòng tiêu hao vượt mà ghi mức tải: 5 dòng trong 528 lượt đã xem, KHÔNG đổi điểm (không có trong danh sách dòng đổi).
- Top 30: 36 lượt, 58 dòng vào / 58 ra. 53 dòng vào là dòng +300 (aosif chiếm 39 / 58 dòng vào, jet-power 5, victory-generator 3, còn lại 1–2 mỗi NCC). 5 dòng vào KHÔNG tự đổi điểm (tecgen-fujian Y495D, uleengen 4DW9235D, camda 401246TAG2A, kaihua 12M33G1320/6, uleengen BF6M1015CLAG3A, điểm 244–269): vào do dòng +300 cùng lượt chiếm chỗ trong vòng chọn theo trần mỗi hãng / model rồi đẩy dòng khác ra (dòng ra điểm 256–281, 0 dòng ra có nl). Cùng lượt luôn có dòng +300 vào; đây là hiệu ứng chọn top 30, không phải cơ chế thứ ba.
- Kết luận: **an toàn merge**. Cần Khoa lưu ý đúng một điều đã nằm trong ý định PR: dòng +300 giờ chen vào top 30 (aosif nhiều nhất) kèm "cần xác nhận".

## #1232: tần số từ dòng mô tả + gtl-power n105
- 22 bảng `TABLE_CAPTIONS`: cả 22 khớp (mỗi bảng đúng 1 bảng cn/ ứng với dòng đầu; dòng mô tả có trong `sources/<id>/<n>.md`; từ dòng mô tả tới dòng đầu bảng mọi dòng bắt đầu bằng "|"; mọi bản ghi của bảng có freq = số Hz trong dòng mô tả). Đối chiếu đủ mọi bảng đổi, không lấy mẫu: không bản ghi đổi freq nào ngoài 22 bảng. Không phát hiện sai.
- Bản ghi đổi freq (null → số): 462: camda n138 50 Hz ×43, n155 50 Hz ×11; mecca n101 50×43 / 60×28, n102 50×37 / 60×26, n108 50×29 / 60×23, n129 50×18 / 60×19, n151 50×47 / 60×20, n180 50×20, n181 50×20, n187 50×26, n188 50×26, n190 50×26. Bản ghi mecca n151 60 Hz mới: 3 (MC138SC, MC206SC, MC413SC). Bản ghi mất: 0.
- gtl-power n105: 2 bản ghi (404D22, 404D24G3) mất standby 24,5 / 24,2 kW (đúng ý); prime giữ; không dòng nào đổi top 30.
- 2445 dòng "mất" khỏi tập dòng của 456 lượt: cả 2445 là dòng mecca n101 (633), n102 (766), n108 (363), n129 (285), n151 (398), bản ghi nay freq 60 (gốc freq null). Dòng freq 50 vào: không dòng nào đổi điểm (không dòng mới trong kết quả đo). Không dòng nào trong top 30 của lượt nào mất (0 lượt đổi top 30).
- Chưa kiểm: (a) từng lượt trong 456 lượt có HSMT 50 Hz hay không (suy từ luật `freqVerdict`, không in ra từng gói); (b) dòng freq 50 mới chỉ đổi lý do (vd mất "cần xác nhận tần số") mà không đổi điểm thì đo này không thấy; (c) mecca còn 532 bản ghi freq null (PR đã nêu).
- Kết luận: **an toàn merge**.

## Lưu ý đo
Bẫy khi đếm: koten-power báo 6 "bản ghi đổi" giả vì 6 khóa dòng trùng nhau trong cả gốc lẫn tích hợp (tập hợp y hệt). Kết quả không chép chữ HSMT; chỉ mã gói, khoá dòng NCC, model, điểm.
Tệp: `dong-doi.tsv.gz` (6184 dòng + cơ chế), `top30-doi.tsv`, `ban-ghi-doi.json`, `bang-chu-thich-22.json`, `*.meta.json`.
