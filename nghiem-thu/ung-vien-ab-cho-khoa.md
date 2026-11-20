# Luật điểm A + B ở bước chọn ứng viên: bản đọc cho anh Khoa (20/11/2026)

Trạng thái: PR nháp [#996](https://github.com/khoanguyenminh6868/GenSet-Pro/pull/996), CHƯA merge, đang chờ anh chọn một trong ba hướng ở mục 6. Bản kỹ thuật đầy đủ của phiên làm: `ung-vien-ab-1.md` (cùng thư mục).

## 1. Vì sao có việc này, và điều em báo sai

- Bước "chọn ứng viên" là bước code xếp điểm mọi dòng tổ máy trong danh mục rồi lấy 30 dòng tốt nhất đưa cho agent. Động cơ không vào 30 dòng thì agent không thể gợi ý.
- Lúc 15:10 em báo anh: sau khi thêm dữ liệu hãng Baudouin, 6M31G825/5 vẫn 190 điểm, ngoài 30 dòng của IB2600603983. Từ đó em đề xuất hai luật A và B, anh trả lời "làm cả A và B".
- Số đó SAI. Em đo ngay sau khi merge, lúc web chưa đăng dữ liệu mới, nên đọc phải danh mục cũ. Đo lại (cả dữ liệu web lẫn dữ liệu trong repo): 6M31G825/5 đã có **222 điểm, hạng 17, nằm trong 30 dòng** mà không cần luật mới.
- Vậy lý do em đưa ra để đề xuất A + B không còn. Hai luật vẫn có giá trị riêng, nhưng phải cân với tác dụng phụ bên dưới.

## 2. Luật A là gì

Cộng 40 điểm cho dòng mà động cơ có datasheet của CHÍNH hãng động cơ trong danh mục (giống 40 điểm đang cộng cho bộ điều khiển có datasheet hãng).

- Chỉ tính tờ của nhà cung cấp loại "hãng động cơ" và cùng hãng với động cơ đó. Không tính trang của nhà lắp ráp chép lại, không tính tờ chung cho cả khung máy.
- Hiện 390 trên 6.878 động cơ trong danh mục được cộng. Phân bố rất lệch:

| Hãng (hồ sơ) | Số động cơ có tờ hãng |
|---|---|
| Weichai | 137 |
| Wudong | 55 |
| SDEC | 50 |
| Volvo Penta | 25 |
| Googol | 22 |
| Cummins (DCEC) | 10 |
| Perkins | 6 |
| Baudouin | 1 (chính là 6M31G825/5, tờ anh gửi) |
| Yuchai | 0 |

- Hệ quả: A thưởng hãng nào mình đã cào được nhiều trang chính hãng, chưa chắc là động cơ tốt hơn. Cummins, Perkins, Yuchai bị thiệt chỉ vì mình chưa có tờ hãng của họ.
- Một điểm anh nên biết: hồ sơ Weichai mang cả thương hiệu Baudouin (cùng tập đoàn), nên dòng Baudouin trên trang Weichai cũng được coi là "datasheet hãng".

## 3. Luật B là gì

Chỗ dành cho mỗi hãng động cơ chia cho các MODEL khác nhau trước; hết model mới tới dòng thứ hai của cùng model.

- Hiện nay một model nhiều nhà cung cấp chào (ví dụ Cummins 4B3.9-G2) có thể chiếm 2–3 dòng trong 30, đẩy model khác ra.
- Với B, số model khác nhau trong 30 dòng tăng từ trung bình 17,6 lên 22,8: agent thấy nhiều lựa chọn động cơ hơn.
- B không phụ thuộc mình có nhiều hay ít dữ liệu của hãng nào.
- B đang áp cho: chỗ dành theo hãng khi HSMT đòi G7 / EU / G20, và lượt lấp chung khi HSMT không nêu hãng. KHÔNG áp khi HSMT nêu đích danh hãng hoặc model.
- B chưa áp cho nhóm 12 dòng dành hãng Trung Quốc (phiên làm không chắc nên để lại hỏi anh). Vì vậy SDEC SC9D340D2 vẫn có thể chiếm 3 trong 12 chỗ đó.
- Mã trùng (ví dụ "6M33G8D3/5 (6M33G825/5)") bị B coi là hai model khác nhau cho tới khi PR mã trùng (#998 và các PR sau) merge.

## 4. Tác động với IB2600603983

| | Main hiện tại | Sau A + B |
|---|---|---|
| 6M31G825/5 (voltgent) | 222 điểm, hạng 17 | 262 điểm, hạng 8 |
| Số dòng Baudouin trong 30 | 3 | 5 |

6 dòng vào, 6 dòng ra:
- Vào: Volvo Penta TWD1744GE, Volvo Penta TWD1653GE, Cummins QSK23-G3, Perkins 2806A-E18TTAG5, Baudouin 6M31G900/5, và dòng mã trùng của kaihua.
- Ra: 4 dòng Perkins 4006-23TAG2A / TAG3A (các dòng thứ 2–3 của cùng model) và 2 dòng Mitsubishi S6R2-PTAA.

## 5. Tác động trên các gói khác (đo MẪU 1/10, chưa phải toàn bộ)

Phạm vi: 91 gói lịch sử, 114 lượt. Số của phiên làm, em chưa tự đo lại.

- 30 dòng ứng viên đổi ở **100 / 114 lượt** khi bật cả hai (chỉ A: 81 lượt; chỉ B: 86 lượt).
- Trung bình khoảng 7 trong 30 dòng bị thay ở mỗi lượt.
- Hãng mất nhiều dòng nhất: Cummins 245, Perkins 241, Yangdong 65, Yanmar 59, Yuchai 58.
- Hãng vào nhiều nhất: Weichai 97, Cummins 92, Baudouin 83, SDEC 74, Deutz 69, Perkins 61. (Cummins và Perkins vừa ra vừa vào: B thay dòng lặp của một model bằng model khác cùng hãng.)
- Ví dụ gói 250 kVA không đòi xuất xứ (IB2500198948): A đưa vào SDEC SC9D340D2, Weichai WP10D264E200, YTO, Deutz BF6M1015C, Baudouin 6M12G8D3/5; đẩy ra Cummins NT855 / 6LTAA8.9, Perkins 1206A / 1506A, Yuchai YC6MK350.

Chưa biết: tác động trên toàn bộ 1.093 lượt (phải đo trên cloud, khoảng 1,5 giờ), và tác động tới cấu hình cuối cùng agent chọn (chưa chạy Gợi ý thật với luật mới).

## 6. Ba hướng để anh chọn

| Hướng | Được gì | Mất / rủi ro |
|---|---|---|
| **1. Gác cả hai** (em khuyến nghị) | Không đổi gì; 6M31G825/5 đã vào danh sách sẵn | Một model vẫn có thể chiếm 2–3 dòng |
| **2. Chỉ lấy B** | Nhiều model khác nhau hơn trong 30 dòng, không lệch theo độ phủ dữ liệu | Vẫn đổi khoảng 86/114 lượt mẫu; phải đo cloud toàn bộ rồi em trình số trước khi merge |
| **3. Cả A và B** | 6M31G825/5 lên hạng 8; động cơ có tờ hãng được ưu tiên | Cummins / Perkins / Yuchai tụt vì thiếu tờ hãng; gói không đòi xuất xứ nghiêng hẳn về hãng Trung Quốc |

Vì sao em nghiêng về hướng 1: mục tiêu của đợt này (ra đúng cấu hình IB2600603983) đã đạt không cần luật mới, còn A làm lệch kết quả theo việc mình cào được dữ liệu của ai. Nếu anh thích ý tưởng của A, cách chắc hơn là bổ sung tờ hãng Cummins, Perkins, Yuchai trước rồi mới bật.

Nếu anh chọn hướng 2 hoặc 3, cần anh trả lời thêm:
- B có áp cho nhóm 12 dòng hãng Trung Quốc không? (phiên làm khuyến nghị có)
- Hãng chỉ có 1–2 model có được lấy dòng thứ hai / ba của cùng model cho đủ 3 chỗ không? (phiên làm khuyến nghị giữ như đang làm: có)

Cả hai luật đều có công tắc tắt riêng trên máy bot (không cần sửa code), nên bật rồi vẫn quay lui được ngay.
