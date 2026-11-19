# Nghiệm thu: đọc lại 67 gói IB24xx để có `reqOrigin` (19/11/2026)

Không PR, không sửa code, không đụng repo git. Dùng cơ chế đọc lại lịch sử SẴN CÓ của bot: `node genbid-sync.js history --key <67 số TBMT> --profile reread` (hàm `historyKeys` trong `genbid-sync.js`: mở lại trang kết quả theo `url` đã lưu trong bidhist, đọc bằng `history-extract.js` + `goods-read.js` mới, giữ nguyên các trường khác của bản ghi, ghi lên web qua `post()` như mọi lượt đọc lại trước). `--profile reread` = hồ sơ trình duyệt riêng `.genbid-browser-reread` và KHÔNG lấy khoá worker, nên không đụng bot: không dừng / khởi động lại tác vụ "GenBid Bot", không chạy `GenBid-Bot.ps1`. Chạy một trình duyệt, lần lượt từng gói, nghỉ 0,8–2 giây giữa các gói.

## Kết luận
- 67/67 gói đọc lại xong, 0 gói lỗi (không cần thử lại), đã ghi lên web.
- So từng gói bản web trước và sau (đủ 67, so sâu mọi trường, bỏ `at`): **0 khác biệt ngoài `reqOrigin`**. Số dòng hàng, giá, nhà thầu, lô giống hệt (số dòng hàng cũ = mới ở cả 67 gói). `reqOrigin` thêm đúng ở **620 / 780** dòng hàng; mọi khoá mới đều là `reqOrigin`; không khoá nào mất. Mục audit `reqLabel` chỉ nằm ở tệp audit TSV, không nằm trong bản ghi web; log lượt này không có dòng "mẫu bảng hàng hoá lạ" nào.
- Giá trị `reqOrigin` ở dòng đầu mỗi gói khớp với giá trị trong bảng reqlabel-1 ở cả 67 gói (kiểm bằng tiền tố 60 ký tự vì audit cũ cắt 300 ký tự).
- Nhóm A/B/C của reqlabel-1: đúng ở 66 gói. IB2400433961 (nhóm A) có 4 giá trị khác nhau, ngoài "G7/EU" còn "Nhập khẩu theo máy hoặc sản xuất tại Việt Nam" (kiểu C), nên là gói lẫn. Cột cuối bảng do regex phân loại lại trên MỌI giá trị của gói, tôi đọc lại kết quả.
- Điều mới so với nghiệm thu trước (vốn chỉ biết dòng đầu): **7 gói có >1 giá trị** trong cùng gói (IB2400208175 2, IB2400270596 10, IB2400339967 2, IB2400362865 2, IB2400389666 2, IB2400433961 4, IB2400440222 2); **18 gói có dòng không có `reqOrigin`** (bên mời thầu để trống ở dòng đó; vd IB2400168837 chỉ 1/93 dòng, IB2400027592 1/24, IB2400470242 1/8). Khi dùng ở Gợi ý: `reqOrigin` là theo từng dòng, không suy từ dòng đầu ra cả gói.

## Lệnh và đầu ra thật
1. Lưu bản ghi cũ (chỉ đọc, GET `/api/requests?kind=docs&coll=bidhist&id=<TBMT>` từng gói, bằng `fetch-old.mjs`): `saved 67 missing none bytes 909010` → `dau-vao\reqlabel\old.json`. Trước đó 0/67 bản ghi có chữ `reqOrigin`. 67 số TBMT lấy từ bảng reqlabel-1 (`keys.csv`).
2. Chạy thử không ghi web: `node genbid-sync.js history --key <67> --profile reread --dry`, log `genbid-bot-logs\history-reread-20261119-reqlabel-dry.log`, dòng cuối `SUMMARY: Lịch sử: 67/67 gói đã đọc lại`. So với `old.json` (`compare.mjs`): `compared 67 missing in new none` / `gói có khác biệt ngoài reqOrigin: 0` / `tổng dòng hàng 780 có reqOrigin 620 gói có ≥1 reqOrigin 67`.
3. Chạy thật: `node genbid-sync.js history --key <67> --profile reread`, log `genbid-bot-logs\history-reread-20261119-reqlabel.log`, dòng cuối `SUMMARY: Lịch sử: 67/67 gói đã đọc lại` (không có "gói lỗi").
4. Đọc lại 67 bản ghi từ web (`new-web.json`, 938.925 byte) và so với `old.json`: kết quả y hệt bước 2 (`gói có khác biệt ngoài reqOrigin: 0`, 780 dòng, 620 có `reqOrigin`, 67 gói có ≥1).
- Lưu ý: `--dry` ghi vào `genbid-work\bidhist-dry.json` và nối thêm vào tệp có sẵn (3 MB, 18/11). Tôi đổi tên tệp đó đi trước khi chạy, rồi trả đúng tên cũ (3.180.418 byte, giờ 00:17 18/11, nguyên vẹn); bản thử lần này để ở `dau-vao\reqlabel\bidhist-dry-run.json`.
- Sự cố nhỏ của tôi: lần ghi nghiệm thu đầu bị shell hiểu nhầm dấu backtick và chạy vài lệnh rỗng (đều báo "not found"); không ghi gì lên web hay tệp khác, dữ liệu trên kiểm lại nguyên vẹn; tệp này đã viết lại.

## Tệp để ở `dieu-phoi\dau-vao\reqlabel\`
`old.json` (bản ghi cũ, 0,9 MB), `new-web.json` (bản mới từ web, 0,9 MB), `bidhist-dry-run.json` (1,2 MB), `keys.csv`. Không có chữ HSMT dài (bản ghi lịch sử đã rút gọn). Không đưa gì vào repo git.

## Gói lỗi
Không có.

## Khác biệt ngoài `reqOrigin`
Không có (0/67 gói).

## Chưa kiểm
- Nội dung `reqOrigin` chưa đối chiếu với nguyên văn tệp HSMT (như reqlabel-1).
- Chưa làm gì ở web / Gợi ý với `reqOrigin` (chờ Khoa quyết như reqlabel-1 mục 2).

## Cần ghi nhớ
- Cách đọc lại đúng gói không đụng bot: `node genbid-sync.js history --key K1,K2,... --profile reread` (thử trước bằng `--dry`, nhớ tệp `genbid-work\bidhist-dry.json` được nối thêm).
- `reqOrigin` có theo từng dòng hàng và có thể trống / khác nhau trong cùng gói (7 gói nhiều giá trị, 18 gói thiếu ở một số dòng).

## Bảng 67 gói
Nhóm cũ = A/B/C ở reqlabel-1. "Dòng hàng" = số dòng hàng của gói; giá trị tối đa 3, cắt 70 ký tự.

| Số TBMT | Nhóm cũ | Dòng hàng | Dòng có reqOrigin | Số giá trị khác nhau | Giá trị (tối đa 3) | Nhóm còn đúng? |
|---|---|---|---|---|---|---|
| IB2400027592 | A | 24 | 1 | 1 | G7 | đúng |
| IB2400032584 | B | 4 | 4 | 1 | Theo yêu cầu kỹ thuật | đúng |
| IB2400037458 | A | 2 | 1 | 1 | Yêu cầu về xuất xứ hàng hóa đối với tổ máy phát điện 750kVA: - Động cơ… | đúng |
| IB2400052099 | A | 7 | 7 | 1 | Có giấy xuất xứ hàng hóa | đúng |
| IB2400052694 | C | 2 | 2 | 1 | Nhập khẩu | đúng |
| IB2400058421 | C | 2 | 1 | 1 | Sản xuất tại Trung Quốc | đúng |
| IB2400058723 | A | 3 | 2 | 1 | Tổ máy có nhãn hiệu và xuất xứ thuộc các nước G7/Châu Âu | đúng |
| IB2400104800 | B | 1 | 1 | 1 | Theo quy định tại Chương V | đúng |
| IB2400122312 | C | 1 | 1 | 1 | tại Công trình Nâng cấp, mở rộng Bệnh viện Phổi Đồng Tháp | đúng |
| IB2400124150 | B | 2 | 2 | 1 | Theo quy định tại Chương V | đúng |
| IB2400125924 | A | 6 | 2 | 1 | Việt Nam | đúng |
| IB2400127023 | A | 1 | 1 | 1 | thuộc nhóm nước G7 hoặc Việt Nam. | đúng |
| IB2400139788 | B | 265 | 265 | 1 | Theo quy định tại chương V E-HSMT | đúng |
| IB2400144224 | A | 2 | 2 | 1 | Việt Nam | đúng |
| IB2400155713 | C | 1 | 1 | 1 | Nhập khẩu đồng bộ nguyên chiếc | đúng |
| IB2400164837 | A | 2 | 2 | 1 | Có chứng nhận nguồn gốc xuất xứ | đúng |
| IB2400166974 | A | 138 | 138 | 1 | G7 | đúng |
| IB2400168837 | A | 93 | 1 | 1 | G7 + Nga | đúng |
| IB2400186078 | A | 3 | 1 | 1 | Nhóm nước G7; EU, Việt Nam | đúng |
| IB2400187931 | A | 12 | 12 | 1 | G7 | đúng |
| IB2400191798 | B | 2 | 2 | 1 | Theo quy định tại Chương V | đúng |
| IB2400208175 | A | 2 | 2 | 2 | - Hãng sản xuất thuộc nhóm các nước công nghiệp phát triển G7; - Công … ⏐ - Sản xuất tại Việt Nam; - Vỏ tủ loại đứng trong nhà: Vỏ tủ 2 buồng 2 … | đúng (mọi giá trị) |
| IB2400216847 | A | 7 | 1 | 1 | Châu Âu hoặc G7 | đúng |
| IB2400236068 | A | 6 | 6 | 1 | Châu Á hoặc tương đương | đúng |
| IB2400254417 | A | 1 | 1 | 1 | Châu Á và các nước thuộc nhóm G7 | đúng |
| IB2400257226 | A | 1 | 1 | 1 | G7 | đúng |
| IB2400270596 | C | 12 | 12 | 10 | Tại BHXH tỉnh và 09 trụ sở BHXH huyện, thị còn lại ⏐ Tại BHXH tỉnh ⏐ - Văn phòng BHXH tỉnh: 22 lít - BHXH thị xã Mường Lay: 5 lít - BHXH hu… | đúng (mọi giá trị) |
| IB2400275648 | A | 3 | 3 | 1 | - Máy phát điện xuất xứ G7 hoặc Việt Nam - và động cơ có xuất xứ G7 - … | đúng |
| IB2400282042 | B | 2 | 2 | 1 | Yêu cầu nêu rõ ký hiệu, xuất xứ hàng hóa | đúng |
| IB2400299108 | B | 3 | 3 | 1 | Theo quy định tại Chương V | đúng |
| IB2400306559 | B | 12 | 12 | 1 | Theo quy định tại chương V E-HSMT | đúng |
| IB2400323739 | B | 42 | 42 | 1 | Nhà thầu khai báo cụ thể | đúng |
| IB2400325367 | B | 4 | 4 | 1 | Không yêu cầu | đúng |
| IB2400333602 | B | 1 | 1 | 1 | Theo quy định tại Chương V | đúng |
| IB2400333932 | A | 2 | 1 | 1 | Châu Âu hoặc nhóm các nước G7 | đúng |
| IB2400339967 | C | 5 | 3 | 2 | Nhập khẩu nguyên chiếc ⏐ Việt Nam | đúng (mọi giá trị) |
| IB2400355321 | A | 2 | 2 | 1 | Việt Nam | đúng |
| IB2400362865 | A | 5 | 5 | 2 | Việt Nam ⏐ Sản xuất đồng bộ tại các nước G7. | đúng (mọi giá trị) |
| IB2400365763 | C | 1 | 1 | 1 | - Hàng mới 100% sản xuất năm 2023 trở về sau ( hàng nhập khẩu hoặc tươ… | đúng |
| IB2400367398 | A | 1 | 1 | 1 | Việt Nam hoặc các nước trong nhóm G20 | đúng |
| IB2400367420 | A | 1 | 1 | 1 | Nhóm các nước có nền kinh tế phát triển G20 | đúng |
| IB2400385050 | A | 5 | 3 | 1 | Nhóm các nước phát triển G7. | đúng |
| IB2400389666 | A | 6 | 2 | 2 | EU hoặc Châu Mỹ ⏐ Châu Á | đúng (mọi giá trị) |
| IB2400391446 | A | 1 | 1 | 1 | Ấn Độ hoặc tương đương (Hàng hoá được sản xuất theo tiêu chuẩn ANSI ho… | đúng |
| IB2400428063 | A | 2 | 2 | 1 | Việt Nam | đúng |
| IB2400429380 | A | 3 | 1 | 1 | - Động cơ: Thương hiệu của nhà sản xuất thuộc nhóm các nước G7. - Máy … | đúng |
| IB2400433961 | A | 11 | 11 | 4 | G7/EU ⏐ Nhập khẩu theo máy hoặc sản xuất tại Việt Nam ⏐ G7/EU, vỏ nhập khẩu hoăc sản xuất tại Việt Nam | lẫn A/C (nhóm A nhưng có giá trị kiểu C) |
| IB2400440222 | B | 2 | 2 | 2 | Chi tiết nêu tại Chương V ⏐ Chi tiết nêu tại Chương V Phường 7, quận Gò vấp, TP. Hồ Chí Minh | đúng (mọi giá trị) |
| IB2400440257 | A | 1 | 1 | 1 | Xuất xứ EU/G7 hoặc tương đương | đúng |
| IB2400440445 | A | 1 | 1 | 1 | Máy phát điện công suất: 15KVA/16,5KVA, 3 pha và có vỏ chống ồn, lắp g… | đúng |
| IB2400448320 | A | 9 | 4 | 1 | Các nước G7 | đúng |
| IB2400453053 | B | 6 | 6 | 1 | Theo quy định tại Chương V | đúng |
| IB2400454375 | A | 1 | 1 | 1 | G7 | đúng |
| IB2400459339 | A | 2 | 2 | 1 | Nhật, Hàn Quốc, Trung Quốc | đúng |
| IB2400470041 | B | 1 | 1 | 1 | Theo quy định (nếu có) tại Chương V | đúng |
| IB2400470242 | A | 8 | 1 | 1 | G20 | đúng |
| IB2400475109 | B | 4 | 4 | 1 | Theo Bảng 1: Thông số của thiết bị | đúng |
| IB2400475145 | B | 1 | 1 | 1 | quy định tại Chương V | đúng |
| IB2400489361 | A | 1 | 1 | 1 | Xuất xứ máy chính (tổ máy): G7 hoặc Châu Âu | đúng |
| IB2400493077 | A | 1 | 1 | 1 | thuộc nhóm nước G7 hoặc Việt Nam | đúng |
| IB2400495088 | A | 1 | 1 | 1 | Yêu cầu xuất xứ đối với Tổ máy phát điện, Động cơ, Đầu phát điện, Bảng… | đúng |
| IB2400497000 | A | 6 | 2 | 1 | Việt Nam | đúng |
| IB2400503492 | A | 2 | 1 | 1 | G7 hoặc Việt Nam | đúng |
| IB2400508791 | C | 2 | 2 | 1 | Có chứng nhận CO, CQ | đúng |
| IB2400513782 | B | 4 | 2 | 1 | Không yêu cầu | đúng |
| IB2400529458 | A | 1 | 1 | 1 | thuộc nhóm nước G7 hoặc Việt Nam | đúng |
| IB2400533611 | B | 12 | 12 | 1 | Nhà thầu đề xuất | đúng |
