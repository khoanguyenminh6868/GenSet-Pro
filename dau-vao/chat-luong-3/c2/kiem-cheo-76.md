# Kiểm chéo toàn bộ 76 bản ghi được thêm (chenxing-weifang 37, huachai-deutz 39), 18/11/2026

- Cách làm: in MỌI trường của cả 76 bản ghi cạnh toàn bộ bảng nguồn, rồi đối chiếu từng giá trị.
  - Tệp đã in: `them-76-nguon.txt` (bản sau khi sửa).
  - Script: `node added-dump.mjs <worktree> 1133dc1c <tệp ra>`, nằm trong scratchpad của phiên.
- Gốc so: main 1133dc1c. Nhánh `chat-luong-3` đã rebase lên main này.
- Một bản ghi "đọc ra" một tổ máy: thông số của phần tổ máy, phần động cơ và phần đầu phát gộp chung. Bản ghi động cơ và bản ghi đầu phát của cùng một tổ máy có chung bộ thông số. Mọi bảng dạng dòng khác cũng làm như vậy.

## Kết quả
| | số bản ghi |
|---|--:|
| Mọi trường khớp nguồn, không sửa gì | 44 |
| Có trường sai, **đã sửa mã** (chi tiết bên dưới) | 32 (30 huachai, 2 chenxing) |
| Còn sai sau khi sửa | 0 |

Ngoài ra có 4 bảng mà nguồn tự mâu thuẫn hoặc trái số liệu chuẩn của hãng. Danh mục chép đúng nguồn ở cả 4 bảng; không sửa số vì sửa là bịa (mục "Nguồn nghi sai").

### Sai đã sửa (`web/catalog.js` `sectionSheet` và chốt sau `saneSpecs`, kèm 2 test mới)
1. **Dòng điện lấy nhầm của đầu phát.** Phần tổ máy của huachai ghi nhãn sai chính tả "Rated currency", nên trước đây bộ đọc lấy "Rated current" của phần đầu phát. Đó là dòng điện ở công suất riêng của đầu phát, không phải của tổ máy.
   - Ca lệch nhiều nhất là n121 "600GF": bản ghi ghi 902 A, trong khi dòng của tổ máy là 1082 A.
   - Các ca khác: n110 878 → 812 A, n115 505 → 451 A, n122 144 → 135, n123 173 → 162, n124 202 → 180, n125 231 → 217, n126 289 → 271, n102 548 → 541, n103 331 → 325, n116 57 → 54, n118 72 → 77, n119 104 → 99.
   - Sửa: phần động cơ và phần đầu phát không còn cho dòng điện; nhãn "currency" ở phần tổ máy đọc là dòng điện.
2. **Dòng điện tổ máy không khớp công suất thì để thiếu**, ghi vào danh sách chưa đọc được với lý do mới "dòng điện tổ máy không khớp công suất". Dùng cùng phép kiểm `posFits` của WCHK. Có 5 ca:
   - huachai n111: nguồn đảo chỗ "Rated frequency 415A" và "Rated currency 50Hz". Trước khi bỏ, bộ đọc đã lấy "50Hz" làm dòng điện.
   - huachai n105 "400GF": 812 A. Đầu phát của chính bảng này ghi 721 A, mà 400 kW × 1,804 = 722 A.
   - huachai n117: "52A 、 36A" ghi hai biến thể một pha / ba pha trong một ô.
   - chenxing n117 "250GF": 540 A, là dòng của 300 kW.
   - chenxing n118 "300GF": 630 A, là dòng của 350 kW. Ở cả hai bảng chenxing này, cột 标定功率 của động cơ ghi đúng 300 / 350 kW.
3. **Khối lượng của một bộ phận lấy làm khối lượng tổ máy.** huachai n117 không ghi khối lượng tổ máy, chỉ có "Weight 130kg 、 150kg" của đầu phát. Sửa: phần động cơ và phần đầu phát không còn cho khối lượng hay kích thước. n119 ghi "89kg" của đầu phát; số này trước đây bị chốt "số vô lý" bỏ, nay không đọc nữa.

### Các trường đã đối chiếu và khớp (cả 76 bản ghi)
- **Model**
  - Động cơ đọc đúng ô 型号 / Model của phần động cơ; đầu phát đọc đúng ô của phần đầu phát.
  - Tổ máy (genset) lấy từ ô của phần tổ máy.
  - huachai n112 ghi "1 5 GF" (có dấu cách), nên genset để thiếu; không đoán thành 15GF.
- **Hãng**
  - Theo mã: Cummins, Weichai, Yuchai, SDEC, Deutz.
  - Theo tiêu đề phần: Stamford; Mecc Alte ở n121.
- **Công suất**
  - Luôn lấy của tổ máy: chenxing 输出功率 là rated; huachai Rated prime / Standby.
  - Không lấy 标定功率 hay Prime power của động cơ, cũng không lấy Rated power của đầu phát.
  - huachai n105 chỉ có "Rated power 400KW" và "Max. power 440KW". Bộ đọc chỉ lấy rated 400; "Max." không được đọc thành standby (để thiếu).
  - huachai n108 ghi "1 2 KW" (dự phòng), nên để thiếu.
  - huachai n114 có prime trống, chỉ lấy "Standby 500KW".
  - n125 / n126 có Prime power của động cơ trống; không ảnh hưởng.
- **Các trường còn lại khớp đúng ô:** điện áp, hệ số công suất, xi lanh, đường kính × hành trình, dung tích, tiêu hao nhiên liệu, khởi động, điều tốc, hiệu suất, kích từ, cấp cách điện, cấp bảo vệ (IP), số pha, dầu bôi trơn, kích thước, khối lượng tổ máy.
- **Trường để thiếu** (đọc đúng chỗ, chỉ là không đọc; không sai):
  - Xi lanh "6/L", "4/L", "12/V" (chenxing Cummins / SDEC). Chenxing Weichai / Yuchai ghi "6" thì đọc được.
  - Cột 标定功率 và 1小时功率 của động cơ.
  - 压缩比.
  - Bore/stroke ở huachai n116–n119: nguồn đảo chỗ "Bore/stroke | Line" với "Cylinder arrangement | 100/120", nên không đọc.

### Nguồn nghi sai (danh mục chép đúng nguồn; KHÔNG sửa vì sửa là bịa)
- **chenxing n110 KTA19-G3A:** bore 140/152 là của NT855. KTA19 của Cummins là 159 × 159 mm.
- **chenxing n103 6BTAA5.9-G2:** bore 114/135 là của 6CTA8.3. 6BTAA5.9 là 102 × 120 mm.
- **chenxing n120 YC4FA55Z-D20:** 108 × 115 mm × 4 xi lanh = 4,21 L, nhưng cùng bảng ghi dung tích 2,982 L. Nguồn tự mâu thuẫn.
- **chenxing n134 "900GF":** dùng YC6C1320L với 标定功率 880 kW, tức tổ máy lớn hơn động cơ. Đây là cùng động cơ với 800GF (n133). Nguồn nghi sai.

## Câu hỏi riêng của điều phối
- **huachai n105 "BF8M1015CP-LA G3" và n106 "BF6M1015C-LA G1A": giữ nguyên, không cắt.**
  - " G3" / " G1A" là đuôi biến thể công suất trong tên chính thức của Deutz. agestar ghi cùng dạng, từ "BF8M1015CP-LA G1A" tới "G5", mỗi đuôi một mức công suất. Cắt đuôi sẽ gộp các biến thể khác công suất làm một.
  - `keyOf` bỏ mọi dấu cách khi so mã, nên "BF8M1015CP-LA G3" và "BF8M1015CP-LAG3" vẫn khớp nhau.
- **huachai n110 / n114 "BF 8M 1015CP-LA G4" / "BF8M 1015CP-LA G5":** dấu cách nằm GIỮA mã, không qua `isCode`, nên không ra bản ghi động cơ (để thiếu). Bản ghi đầu phát HCI5E / HCI5FS vẫn có, với `other` = ∅.
- **chenxing n101, alternator "200GF":** bản ghi đã bỏ (mã đầu phát trùng model tổ máy). Cột 发电机参数 không còn bị đọc nhầm:
  - 额定功率 bị bỏ (không phải công suất tổ máy).
  - 额定电压 / 输出电流 trùng phần tổ máy; nay dòng điện chỉ lấy ở phần tổ máy.
  - 绝缘等级 H级 và 防护等级 IP22 là thuộc tính đầu phát, gán đúng.
  - Không có số nào của cột này vào nhầm trường khác.
