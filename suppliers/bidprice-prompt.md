# Gợi ý giá đấu: so cấu hình gói này với các gói đã có kết quả

Bạn chạy không người trông, không ai trả lời câu hỏi. Chỉ đọc các tệp trong thư mục này và chỉ ghi `result.json`.
Không tìm trên internet.

## Tệp
- `input.md`: gói thầu đang cần bỏ giá — tên gói, công suất, giá gói, phân tích HSMT, cấu hình dự kiến chào (nếu đã có
  Gợi ý cấu hình), phần yêu cầu kỹ thuật của HSMT.
- `samples.md`: các phần/gói đã có kết quả trên muasamcong mà code thấy gần nhất (cùng là cung cấp máy phát, công suất
  code đọc được xê dịch không quá 5% so với gói này, giá gói gần, động cơ không khác nhóm xuất xứ với gói này). Mỗi mục có mã `S1`, `S2`... và chỉ có những gì muasamcong ghi: tên gói, chủ đầu tư,
  công suất code đọc được, số nhà thầu, hàng hoá trúng thầu (tên, hãng, model, xuất xứ, số lượng, đơn giá), câu trích HSMT.
  Dòng cuối mỗi mục, "So cấu hình (code)", là code so hãng và hạng mục (vỏ cách âm, ATS, bồn dầu ngoài...) hai gói nêu,
  chỉ để gợi ý chỗ cần đọc: code chỉ dò chữ, có thể sót hay nhầm. Không chép `quote` từ dòng này.

Nếu `input.md` có mục "Gói có nhiều cỡ máy": gói này mua máy nhiều cỡ và lượt này chỉ so MỘT cỡ (Khoa, 2026-11-04).
Tóm tắt và xếp mức theo máy cỡ đó: gói cũ chỉ có máy cỡ đó là giống/gần như bình thường, không xếp "khác" chỉ vì gói này
còn máy cỡ khác; gói cũ nhiều cỡ máy thì xếp "khác" trừ khi các cỡ của nó gần như trùng các cỡ của gói này.

## Việc cần làm
1. Đọc `input.md`, tóm tắt cấu hình và phạm vi của gói này: công suất (liên tục/dự phòng), số máy, hãng hoặc xuất xứ
   HSMT yêu cầu hoặc dự kiến chào (G7 / Trung Quốc / lắp ráp Việt Nam...), các hạng mục đi kèm có giá đáng kể (vỏ cách
   âm, ATS, tủ hoà đồng bộ, bồn dầu ngoài, cáp lực, trạm biến áp, xây dựng, lắp đặt, vận chuyển xa...).
2. Với **mọi** mục trong `samples.md`, xếp một mức:
   - `same` — giống: cùng là cung cấp tổ máy phát; công suất một máy và số máy tương đương;
     phạm vi tương đương (không kèm hạng mục lớn mà gói kia không có); và khi cả hai cùng có thông tin hãng/xuất xứ thì
     cùng nhóm (G7 với G7, Trung Quốc với Trung Quốc, lắp ráp Việt Nam với lắp ráp Việt Nam).
   - `close` — gần: cùng loại, công suất và số máy tương đương, chỉ khác một điểm phụ (một hạng mục đi kèm), hoặc không ghi hãng/xuất xứ nên
     không biết có cùng nhóm không.
   - `different` — khác: công suất hay số máy khác hẳn (gói nhiều máy, công suất tổng khác), phạm vi khác hẳn (kèm trạm
     biến áp, UPS, xây dựng, nhiều loại hàng khác chiếm phần lớn giá), khác nhóm xuất xứ (G7 với Trung Quốc), hoặc thực ra
     không phải cung cấp máy phát (sửa chữa, thuê, phụ tùng...).
   - `unknown` — không đủ thông tin: mục không cho biết công suất hay hàng hoá đủ để so.
   Công suất "code đọc từ tên gói" có thể sai (tên gói nhắc công suất trạm biến áp, hay tổng nhiều máy): đọc cả hàng hoá
   và câu trích HSMT. Đơn giá hàng hoá (khi có) cho biết giá riêng của máy, dùng để nhận ra gói có nhiều hạng mục khác.
3. Mỗi mục ghi `same` (điểm giống) và `diff` (điểm khác) — mỗi điểm vài chữ, ví dụ "400 kVA", "Cummins (G7)",
   "kèm ATS", "2 máy", "không ghi hãng". Và `quote`: một đoạn **chép nguyên văn** từ chính mục đó trong `samples.md`
   (không thêm bớt chữ nào, không chép phần "Công suất (code đọc...)") cho thấy điểm quyết định mức — thường là tên hàng
   hoá có công suất/hãng, hay dòng HSMT. Code kiểm câu này; sai thì mục đó không được tính.

Không đưa ra giá, không ghi số tiền nào: code tính giá từ các mục `same`/`close`.

## result.json
```json
{
  "tender": { "summary": "Một câu: cấu hình và phạm vi của gói này", "points": ["400 kVA dự phòng / 360 kVA liên tục", "1 máy", "Động cơ Trung Quốc", "kèm vỏ cách âm, ATS"] },
  "samples": [
    { "id": "S1", "level": "same", "same": ["400 kVA", "1 máy", "động cơ Trung Quốc"], "diff": ["không ghi ATS"], "quote": "Máy phát điện 400kVA | hãng Weichai" }
  ],
  "notes": ["Ghi chú ngắn nếu cần, ví dụ: ít gói cùng xuất xứ"]
}
```
Ghi đủ mọi mục `S…` trong `samples.md`, mỗi mục một lần. Viết tiếng Việt; trong `summary` và `notes` gọi các mức là "giống", "gần", "khác", "không đủ thông tin" (không viết same/close), gọi gói theo mã TBMT thay vì mã S….
