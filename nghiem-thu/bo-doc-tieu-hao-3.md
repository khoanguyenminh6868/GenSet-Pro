# bo-doc-tieu-hao-3: giải thích đo cloud #1022 (DỞ, hết hạn mức 21/11/2026)

Đo ở f47bedcd so với 2d2ce26d. Chạy lại `candidates` trên mọi lượt có đổi: 0 lượt không chạy lại được. Bidhist dùng bản máy (20/11 12:30).
Script và kết quả: `dau-vao\bo-doc-tieu-hao\cloud\` (`giai-thich.json`, `tong-hop.txt`, `soat-nhom.txt`, `soat-so.txt`, `soat-to.txt`).
**Chưa sửa mã, #1022 CHƯA nên merge.**

## (a) 1.087 dòng mất

- 796 dòng có luật tiêu hao (fuel / fuel75 / fuel50). Phần lớn là longkai-power.
- 291 dòng còn lại chỉ do xi lanh, kiểu xi lanh, dung tích.

### Tiêu hao: đã kiểm

- **longkai:** nhãn "100% load(Prime power)", L/h, nằm trong khối động cơ của tờ tổ máy. Số là theo Prime ghi trên tờ.
- **generatordieselchina (18 dòng): loại đúng.** Số 100 % = Prime × g/kWh / 0,84 khớp ở cả 7 model, không phải theo Standby; mọi dòng đều vượt ngưỡng.
- **Loại OAN, cần sửa (26 dòng), thân tờ là bộ số của động cơ khác:**
  - longkai n1053 QSB3.9-G2 (16 dòng): tờ ghi 6 in line, 5.9 L, net 96 kW, 26 L/h cho Prime 48 kW (0,54 L/kWh).
  - longkai n1069 QSB6.7-G3 (9 dòng): tờ ghi 5.9 L, 102*120.
  - longkai n1144 6M33D633E200 (1 dòng): tờ ghi V 12, 18.9 L, 159*159, Prime 536 so với tiêu đề 520 kW.
  - Đề xuất `dropspec` các khoá sai của 3 tờ (fuel, fuel75, fuel50, disp, bore; thêm cyl cho n1053 và n1144). Lưu ý: `n` của longkai không duy nhất (305 bảng, 178 số n), phải khớp cả genset + line.
- **Chưa kết luận:** n1124 WP2.3D33E200 (2 dòng): tiêu đề Prime 26 kW, thân 18 kW, 6.4 L/h. Tạm giữ loại.
- **Rủi ro ngược (đạt oan, chưa sửa):** n1085 QSM11-G2 18.3 L/h / 280 kW, n1104 QSK19-G4 38.4 / 536, n1107 KT38-GA 37 / 500 (khoảng 0,07 L/kWh, quá thấp).

### Câu cần Khoa quyết

538 / 796 dòng có công suất lớn hơn công suất HSMT trên 2 % (195 xấp xỉ bằng hoặc nhỏ hơn, 63 không so được). Code so tiêu hao ở 100 % tải của CHÍNH máy đó với ngưỡng HSMT. Nếu quy tỉ lệ về công suất HSMT thì 238 dòng đạt mọi mức (longkai 211, generatordieselchina 18, xinhengxin 9). Quy tỉ lệ chỉ là ước lượng, tờ hãng không ghi. Giữ cách so hiện tại hay nới, là quyết định của Khoa; chưa đổi.

### Xi lanh, dung tích: CHƯA kiểm xong

Đã có bảng 104 cặp (NCC, model) trong `soat-so.txt`. CHƯA đối chiếu số dung tích thực tế đã dùng (fact theo model, nhóm Baudouin 4M06, 4M10, 6M11, 6M16, 6M21, 6M31, 8M21, 8M33, 20M33) với hình học. Ngưỡng `1 xi lanh` của IB2200035219 (6 kVA) chưa đọc lại chữ HSMT.

## (b) 8.771 dòng đổi điểm: CHƯA kiểm

Theo mức: +8: 7.733; +24: 744; +16: 113; −300: 181. Giả thuyết +8 mỗi loại thông số động cơ mới chưa kiểm từng dòng. −300: đã có lý do từng dòng trong `giai-thich.json` (`fuelMinus`, nhiều dòng westinpower), chưa soát hết.

## (c) 35 dòng hạng 1–5 gốc ra khỏi top 30

Danh sách đủ ở cuối `tong-hop.txt`. 33 dòng bị loại (tiêu hao 18, maxDisp 9... theo cột `state`), 2 dòng còn trong bảng nhưng tụt hạng (rcg-power S12A2-PTA, dingbo TWD1645GE). Chưa kết luận đúng / oan cho nhóm dung tích.

## Việc tiếp

1. Hoàn tất kiểm dung tích / xi lanh và (b).
2. Sửa 3 tờ longkai trên nhánh `fix/bo-doc-tieu-hao`, rồi điều phối giao đo lại.
3. Sau đó mới tới E + C + D, A, G, B (chưa bắt đầu sửa). Worktree `wt-do-1022-nhanh` còn giữ để làm tiếp.
