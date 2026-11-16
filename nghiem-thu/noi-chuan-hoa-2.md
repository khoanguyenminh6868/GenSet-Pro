# Đo PR #786 (noi-chuan-hoa) trên KayenGram, 15/11/2026

Nhánh noi-chuan-hoa commit 12b087ae (sau 3 quyết định của Khoa 14/11: nhiên liệu không ghi tải = 100%; so khối lượng / kích thước khi HSMT không đòi bản; đọc cặp prime/standby theo nhãn). Chỉ đọc web, không gọi agent.

## Ứng viên (prep, 1.297 gói có phân tích)
```
Gói đã đo: 1297 (chạy được 1285; không có chữ HSMT 12; lỗi 0)
1: catalog khác 240 gói; danh sách ứng viên đổi 0 gói (thêm 0, bớt 0 model), chỉ đổi thứ tự 90 gói
fuel: catalog khác 104 gói; danh sách ứng viên đổi 0 gói (thêm 0, bớt 0 model), chỉ đổi thứ tự 15 gói
disp: catalog khác 154 gói; danh sách ứng viên đổi 0 gói (thêm 0, bớt 0 model), chỉ đổi thứ tự 75 gói
other: catalog khác 0 gói; danh sách ứng viên đổi 0 gói (thêm 0, bớt 0 model), chỉ đổi thứ tự 0 gói
Cụm lý do mới khi bật cờ (dòng catalog chỉ có khi bật): [["không ghi",821],["không ghi hãng",158],["không ghi model tổ máy",140],["không ghi model",68],["xi lanh: # — factSrc: { \"supplierId\": \"comappower\"",20],["xi lanh: # — factSrc: { \"supplierId\": \"fdk-energy\"",17],["Dung tích xi lanh: # — factSrc: { \"supplierId\": \"waeta-fujia",16],["Dung tích xi lanh: # — factSrc: { \"supplierId\": \"hanyang-wei",16],["Dung tích xi lanh: #L — factSrc: { \"supplierId\": \"fdk-energy",14],["xi lanh: # — factSrc: { \"supplierId\": \"ricardo-weifang\"",9],["Dung tích xi lanh: # — factSrc: { \"supplierId\": \"jet-power\"",8],["Dung tích xi lanh: # — factSrc: { \"supplierId\": \"huatai-yang",7]]
```

## Check lại 10 kết quả Gợi ý đã lưu (gỡ check byCode trước)
```
A. Ứng viên: 10/10 gói chạy được prep.
  1: 1 gói đổi danh sách ứng viên; thêm 0, bớt 0 model. IB2600581977 (+0 −0, chỉ đổi thứ tự)
  fuel: 0 gói đổi danh sách ứng viên; thêm 0, bớt 0 model. 
  disp: 1 gói đổi danh sách ứng viên; thêm 0, bớt 0 model. IB2600581977 (+0 −0, chỉ đổi thứ tự)
  other: 0 gói đổi danh sách ứng viên; thêm 0, bớt 0 model. 
B. Kiểm: 10/10 kết quả chạy được check, 1199 mục kiểm (cờ tắt).
  1: 0 mục đổi trạng thái {}
  fuel: 0 mục đổi trạng thái {}
  disp: 0 mục đổi trạng thái {}
  other: 0 mục đổi trạng thái {}
```

Script: measure-full.mjs, measure.mjs, summarize-full.mjs (bản sao trong thư mục noi-chuan-hoa-2\).
Test suppliers: 855/855 qua ở cả 5 chế độ cờ (tắt, 1, fuel, disp, other).
