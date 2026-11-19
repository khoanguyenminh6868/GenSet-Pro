# Nghiệm thu: `reqLabel` ở hàng hoá lịch sử (19/11/2026)

PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/944 (nhánh `reqlabel-origin`, worktree `wt-reqlabel`). KHÔNG merge, KHÔNG chép sang `genbid-hsmt\`, không ghi web.

## Kết luận
**`reqLabel` = cột "Xuất xứ" của bảng hàng hoá E-HSMT do bên mời thầu điền, tức YÊU CẦU xuất xứ của từng dòng** (chữ tự do). Khác `origin` là xuất xứ nhà thầu trúng chào. Trang muasamcong KHÔNG hiển thị nó (cột "Xuất xứ [quốc gia, vùng lãnh thổ sản xuất]" trên trang là `origin`); nó chỉ nằm trong dữ liệu trang. Có ích (yêu cầu xuất xứ gắn với từng hàng hoá, ví dụ nhóm nước G7). Đã hiện thực: đọc vào `reqOrigin` ở `goods-read.js`, thôi báo là trường lạ.

## Bước 1: quét
- Nguồn quét (đọc hết, không lấy mẫu): `genbid-bot-logs\history-goods-audit.tsv` (09/11, 2 dòng), `history-goods-audit-20261108.tsv` (876 dòng, gồm lượt 07–08/11 và 17/11), `history-goods-audit-tomtat-20261108.md`, `history-reread-20261107.log`, `history-reread-20261109.log`, `bcdg-reread-20261112.log`. Lượt đọc lại 07–08/11 đọc 1.449 gói.
- Lệnh: `node scratchpad\scan.mjs reqlabel.json` (quét mọi tệp audit/reread của thư mục logs). Đầu ra thật: `audit rows 876`, `notices with reqLabel (field rows) 67`; tệp có chữ `reqLabel`: reread-20261107 65 lần, audit-20261108 68, audit.tsv 12, reread-20261109 2, tomtat 1, bcdg-reread 0.
- **67 gói có `reqLabel`, tất cả mã IB24xx (gói đăng 2024).** Không gói IB25xx, IB26xx nào, không gói IB23xx trở về trước. 67/1.449 gói đã đọc.
- Trường cùng họ: không thấy `reqXxx` nào khác trong audit; cùng họ chỉ có `reqLabel` (các trường lạ khác trong audit là của gói dịch vụ: serviceCategory, orgCode, editable... không liên quan).
- Hạn chế: audit chỉ ghi giá trị của MỘT dòng đầu mỗi gói (đã khử trùng khoá `field|what`), nên số dòng hàng có `reqLabel` và mức khác nhau giữa các dòng của cùng gói chưa đếm được từ audit; dữ liệu thô của trang không được lưu trên máy (doc-cache `bidhist.json` chỉ có bản ghi đã rút gọn, không có `reqLabel`). Đếm dòng chỉ làm được khi bot đọc lại trang với mã mới.
- Phân nhóm giá trị (theo chữ, phân loại bằng regex rồi đọc lại bảng dưới): A yêu cầu xuất xứ 41 gói, B tham chiếu hoặc không nêu ("Theo quy định tại Chương V", "Không yêu cầu", "Nhà thầu đề xuất"...) 18 gói, C chữ khác 8 gói (nơi giao hàng, "Hàng mới 100%...", "Có chứng nhận CO, CQ", "Tại BHXH tỉnh...": bên mời thầu điền nhầm cột). Phổ biến nhất: "Theo quy định tại Chương V" 6, "Việt Nam" 6, "G7" 5.

## Đối chiếu trang muasamcong (chỉ xem, không đăng nhập)
Gói của brief là 67 > 20 nên đối chiếu 2 gói, ở cả hai dạng bảng (đọc dữ liệu `dtlKqlcnt` của trang bằng trình duyệt trong app, không thao tác):
1. **IB2400166974** (Toa xe hàng HN, "Gói thầu số 27: Mua sắm vật tư máy phát điện"), dạng `dsHhKq.dsHH`: 138/138 dòng có cả `reqLabel` và `origin`; dòng Piston: `reqLabel:"G7"`, `origin:"G7"`, `description:"Theo quy định tại Chương V."`, `technique` (cấu hình nhà thầu chào) riêng. Bảng trên trang cho cột "Xuất xứ" = các giá trị G7 / "Các nước thuộc nhóm G20" (138 dòng có giá trị, 2 giá trị khác nhau) = `origin`, không phải `reqLabel`.
2. **IB2400440445** (BIDV Yên Bái, "Mua sắm máy phát điện công suất 15KVA/16.5KVA"), dạng cũ `formValue.lotContent.Table`: `reqLabel` = "Máy phát điện công suất: 15KVA/16,5KVA, 3 pha và có vỏ chống ồn, lắp giáp tại Việt Nam (động cơ Mitsubish và đầu phát Leroy Somer - Xuất xứ Ấn độ; Bảng điều khiển - xuất xứ Thổ Nhĩ Kỳ)", còn `origin` = "Lắp ráp tại Việt Nam". Cột "Xuất xứ" trên trang hiển thị "Lắp ráp tại Việt Nam" (`origin`); `reqLabel` không xuất hiện ở đâu trên trang (đã dò cả bảng lẫn tab Thông báo mời thầu: không có chữ "Xuất xứ").
Hai gói cho thấy: `reqLabel` ≠ `origin` khi nhà thầu chào khác yêu cầu → đó là yêu cầu của bên mời thầu, không phải xuất xứ trúng. Mẫu 17/11 trong audit khớp: "G7 + Nga" (IB2400168837), "Theo quy định tại chương V E-HSMT" (IB2400139788) cũng là chữ bên mời thầu điền.
Giả thuyết "G7 là yêu cầu xuất xứ của HSMT": đúng với IB2400166974 theo nghĩa `reqLabel`="G7" nằm ở dòng hàng cùng `description`="Theo quy định tại Chương V" (mô tả bên mời thầu); nhưng KHÔNG đọc được tệp HSMT (Chương V) của gói đó nên chưa đối chiếu được với nguyên văn HSMT. Việc đó chưa kiểm.

## Bước 2: thay đổi
- `bot/genbid-hsmt/goods-read.js`: thêm `reqLabel` vào `USED` (thôi báo trường lạ); bản ghi hàng thêm `reqOrigin` = `reqLabel` đã gọn khoảng trắng, cắt 500 ký tự, chỉ thêm khi không trống (null, rỗng hay toàn dấu cách thì không có khoá). Hai tệp dùng chung (`history-extract.js`, `bidders-extract.js`) không đổi; `snippet()` tự dán. Khi chép sang `genbid-hsmt\` chỉ cần chép `goods-read.js` (tệp kia không đổi) + test.
- `bot/test/extract.test.mjs`: ca "kiểm mẫu bảng" nay dùng trường bịa `reqCountry` (vẫn kiểm được báo trường lạ); thêm ca mới "reqLabel = yêu cầu xuất xứ": 5 dòng (G7 = origin; chuỗi dài khác origin, khoảng trắng gọn; null; toàn dấu cách; 900 ký tự bị cắt 500), kiểm `audit` rỗng và `origin` không đổi, cả ở `bidders-extract.js`.
- KHÔNG đụng web / Gợi ý. Đề xuất (chưa làm, chờ Khoa duyệt): xem mục dưới.

## Lệnh kiểm và đầu ra thật
- `node --test bot/test/extract.test.mjs` (trong `wt-reqlabel`): `# tests 24 / # pass 24 / # fail 0`. (Chưa chạy cả bộ `bot/test`, để CI của PR chạy.)
- Kiểm chéo trên dữ liệu trang thật IB2400440445 (dump đọc từ trang, `scratchpad\cross.mjs`, chạy bản cũ ở checkout main và bản mới ở worktree trên cùng đầu vào):
  - Cũ: `audit:[{"kind":"field","what":"reqLabel","sample":"Máy phát điện công suất: 15KVA/16,5KVA, ..."}]`, hàng không có `reqOrigin`.
  - Mới: `audit: undefined`, hàng giống hệt + `"reqOrigin":"Máy phát điện công suất: 15KVA/16,5KVA, 3 pha và có vỏ chống ồn..."` (nguyên văn như trên).
  - `identical apart from reqOrigin and audit: true`.
- Chưa chạy bộ đọc mới trên IB2400166974 (138 dòng) trong trang: không nạp được tệp từ localhost vào trang (fetch bị chặn) và dán 20KB mã vào trang là quá lớn; thay bằng: logic của dạng `dsHH` được phủ bởi ca test `dsHhKq` (thao tác trên cùng mã), và đọc trực tiếp dữ liệu trang xác nhận 138/138 dòng có cả hai trường.
- Không đọc lại toàn bộ 67 gói bằng bộ đọc mới: dữ liệu thô trang không lưu trên máy, chỉ bot (trình duyệt) đọc lại được. Mọi bản ghi khác trước/sau giống nhau theo thiết kế (chỉ thêm khoá `reqOrigin`; không bản ghi nào mất hay đổi).

## Số đo trước/sau
- Trước: 67 gói bị báo trường lạ `reqLabel` mỗi lần đọc lại (đo, từ audit). Sau: 0 gói báo (đo trên ca test + IB2400440445; chưa đo trên 67 gói thật).
- Kích thước bản ghi: thêm tối đa 500 ký tự mỗi dòng có `reqLabel`; IB2400166974 thêm khoảng 138 × (≈15 ký tự) ≈ 2 KB (ước tính). Gói dài nhất trong audit: chuỗi mẫu >300 ký tự (audit cắt 300) nên giới hạn 500 có thể cắt vài gói; ước tính thôi.

## Rủi ro, quay lui
- Web có thể giới hạn kích thước bản ghi `bidhist`: chưa kiểm giới hạn của ingest với bản ghi lớn hơn; mức tăng nhỏ so với `desc` (cắt 8.000/dòng) nên rủi ro thấp.
- Bên mời thầu điền tuỳ ý (41/67 là yêu cầu xuất xứ thật, 8 là chữ nhầm cột): nếu dùng ở Gợi ý thì phải xử lý như chữ tự do, đừng parse như danh mục nước.
- Khi chép `goods-read.js` sang `genbid-hsmt\` mà quên `history-extract.js`/`bidders-extract.js`: không ảnh hưởng (hai tệp không đổi).
- Quay lui: `git revert` PR, hoặc chép lại `goods-read.js` cũ: `reqOrigin` biến mất, `reqLabel` quay lại thành trường lạ trong audit; bản ghi đã gửi lên web có thêm `reqOrigin` vô hại.

## Việc cần Khoa quyết
1. Duyệt merge PR #944 rồi chép `goods-read.js` sang `genbid-hsmt\` (bot đọc lại thì `reqOrigin` mới có trong bản ghi lịch sử; 67 gói cũ chỉ có sau khi đọc lại, vì dữ liệu thô không lưu).
2. Đề xuất cho web / Gợi ý (CHƯA làm): ở Gợi ý giá, khi chọn gói tương tự, hiện `reqOrigin` bên cạnh `origin` ("yêu cầu: G7 / trúng: Việt Nam") và ưu tiên gói có yêu cầu xuất xứ giống gói đang xét (nhóm G7, Việt Nam, Châu Âu...); và cho Gợi ý cấu hình biết "bên mời thầu thường yêu cầu nhóm nước nào" để xếp hạng hãng theo xuất xứ. Cần Khoa chốt có làm không và quy tắc.
3. Có muốn bot đọc lại 67 gói IB24xx để có `reqOrigin` sớm không (tốn lượt đọc trang muasamcong).

## Cần ghi nhớ
- `reqLabel` (hàng hoá lịch sử) = yêu cầu xuất xứ của E-HSMT do bên mời thầu điền, không hiện trên trang, chỉ gói IB24xx (dạng dsHH và dạng formValue Table). `origin` là xuất xứ nhà thầu trúng chào.

## Bảng 67 gói có `reqLabel`
Nhóm: A = yêu cầu xuất xứ, B = tham chiếu Chương V / không yêu cầu / nhà thầu đề xuất, C = chữ khác (điền nhầm cột). Giá trị lấy từ audit (mẫu dòng đầu của gói, 07–08/11 và 17/11), phân nhóm do regex rồi đọc lại.

| Số TBMT | Nhóm | Giá trị `reqLabel` (mẫu đầu của gói trong audit) |
|---|---|---|
| IB2400027592 | A | G7 |
| IB2400032584 | B | Theo yêu cầu kỹ thuật |
| IB2400037458 | A | Yêu cầu về xuất xứ hàng hóa đối với tổ máy phát điện 750kVA: - Động cơ: Thương hiệu của nhà sản xuất thuộc nhóm các nước G7. - Máy phát: Thương hiệu của nhà sản xuất thuộ… |
| IB2400052099 | A | Có giấy xuất xứ hàng hóa |
| IB2400052694 | C | Nhập khẩu |
| IB2400058421 | C | Sản xuất tại Trung Quốc |
| IB2400058723 | A | Tổ máy có nhãn hiệu và xuất xứ thuộc các nước G7/Châu Âu |
| IB2400104800 | B | Theo quy định tại Chương V |
| IB2400122312 | C | tại Công trình Nâng cấp, mở rộng Bệnh viện Phổi Đồng Tháp |
| IB2400124150 | B | Theo quy định tại Chương V |
| IB2400125924 | A | Việt Nam |
| IB2400127023 | A | thuộc nhóm nước G7 hoặc Việt Nam. |
| IB2400139788 | B | Theo quy định tại chương V E-HSMT |
| IB2400144224 | A | Việt Nam |
| IB2400155713 | C | Nhập khẩu đồng bộ nguyên chiếc |
| IB2400164837 | A | Có chứng nhận nguồn gốc xuất xứ |
| IB2400166974 | A | G7 |
| IB2400168837 | A | G7 + Nga |
| IB2400186078 | A | Nhóm nước G7; EU, Việt Nam |
| IB2400187931 | A | G7 |
| IB2400191798 | B | Theo quy định tại Chương V |
| IB2400208175 | A | - Hãng sản xuất thuộc nhóm các nước công nghiệp phát triển G7; - Công suất dự phòng: >=1000KVA (lớn hơn hoặc bằng 1000kVA). Đáp ứng các tiêu chuẩn: ISO 8528, ISO 3046, IE… |
| IB2400216847 | A | Châu Âu hoặc G7 |
| IB2400236068 | A | Châu Á hoặc tương đương |
| IB2400254417 | A | Châu Á và các nước thuộc nhóm G7 |
| IB2400257226 | A | G7 |
| IB2400270596 | C | Tại BHXH tỉnh và 09 trụ sở BHXH huyện, thị còn lại |
| IB2400275648 | A | - Máy phát điện xuất xứ G7 hoặc Việt Nam - và động cơ có xuất xứ G7 - và đầu phát có thương hiệu G7 |
| IB2400282042 | B | Yêu cầu nêu rõ ký hiệu, xuất xứ hàng hóa |
| IB2400299108 | B | Theo quy định tại Chương V |
| IB2400306559 | B | Theo quy định tại chương V E-HSMT |
| IB2400323739 | B | Nhà thầu khai báo cụ thể |
| IB2400325367 | B | Không yêu cầu |
| IB2400333602 | B | Theo quy định tại Chương V |
| IB2400333932 | A | Châu Âu hoặc nhóm các nước G7 |
| IB2400339967 | C | Nhập khẩu nguyên chiếc |
| IB2400355321 | A | Việt Nam |
| IB2400362865 | A | Việt Nam |
| IB2400365763 | C | - Hàng mới 100% sản xuất năm 2023 trở về sau ( hàng nhập khẩu hoặc tương đương ) |
| IB2400367398 | A | Việt Nam hoặc các nước trong nhóm G20 |
| IB2400367420 | A | Nhóm các nước có nền kinh tế phát triển G20 |
| IB2400385050 | A | Nhóm các nước phát triển G7. |
| IB2400389666 | A | EU hoặc Châu Mỹ |
| IB2400391446 | A | Ấn Độ hoặc tương đương (Hàng hoá được sản xuất theo tiêu chuẩn ANSI hoặc tương đương) |
| IB2400428063 | A | Việt Nam |
| IB2400429380 | A | - Động cơ: Thương hiệu của nhà sản xuất thuộc nhóm các nước G7. - Máy phát: Thương hiệu của nhà sản xuất thuộc nhóm các nước G7. - Bảng điều khiển: Thương hiệu của nhà sả… |
| IB2400433961 | A | G7/EU |
| IB2400440222 | B | Chi tiết nêu tại Chương V |
| IB2400440257 | A | Xuất xứ EU/G7 hoặc tương đương |
| IB2400440445 | A | Máy phát điện công suất: 15KVA/16,5KVA, 3 pha và có vỏ chống ồn, lắp giáp tại Việt Nam ( động cơ Mitsubish và đầu phát Leroy Somer - Xuất xứ Ấn độ; Bảng điều khiển - xuất… |
| IB2400448320 | A | Các nước G7 |
| IB2400453053 | B | Theo quy định tại Chương V |
| IB2400454375 | A | G7 |
| IB2400459339 | A | Nhật, Hàn Quốc, Trung Quốc |
| IB2400470041 | B | Theo quy định (nếu có) tại Chương V |
| IB2400470242 | A | G20 |
| IB2400475109 | B | Theo Bảng 1: Thông số của thiết bị |
| IB2400475145 | B | quy định tại Chương V |
| IB2400489361 | A | Xuất xứ máy chính (tổ máy): G7 hoặc Châu Âu |
| IB2400493077 | A | thuộc nhóm nước G7 hoặc Việt Nam |
| IB2400495088 | A | Yêu cầu xuất xứ đối với Tổ máy phát điện, Động cơ, Đầu phát điện, Bảng điều khiển: ASEAN hoặc OECD hoặc G7 |
| IB2400497000 | A | Việt Nam |
| IB2400503492 | A | G7 hoặc Việt Nam |
| IB2400508791 | C | Có chứng nhận CO, CQ |
| IB2400513782 | B | Không yêu cầu |
| IB2400529458 | A | thuộc nhóm nước G7 hoặc Việt Nam |
| IB2400533611 | B | Nhà thầu đề xuất |
