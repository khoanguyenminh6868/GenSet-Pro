# huatai-yangzhou n111 — 17 dòng "công suất 135–145" (chỉ đọc, 19/11/2026)

Không sửa gì, không PR. Checkout chính ở `main`, sạch (`git status` trống sau khi dọn: lệnh `row-flags.mjs --json --id X` ghi nhầm tệp `--id` vào gốc repo, vì `--json` nhận đối số kế là đường dẫn; tôi đã chuyển tệp đó ra scratchpad, repo không còn tệp lạ).

## Kết luận
1. **Nguồn ghi sai nhãn cột, không phải bộ đọc đọc lệch cột.** Trang gốc (đã mở lại 19/11: `http://www.yzhuatai.cn/index.php?s=index/show/index&id=13`, tải bằng curl, bảng HTML y hệt `sources/huatai-yangzhou/111.md`) đặt dưới tiêu đề "输出功率 Power of output (KW/KVA)" các số 135/320, 138/150, 138/160, 140/165, 145/165. Đối chiếu với `wudong-wuxi` (hãng động cơ, `wdpower.com`, tệp 102): đó là **đường kính × hành trình xi lanh (mm)** của động cơ (WD135TAD28 = 138×150, WD145TAD30 = 138×160, WD327TAD92 = 145×165). 13/16 dòng có mã ở wudong-wuxi khớp từng chữ số; 3 dòng lệch (0, 13, 14) (xem bảng). Không phải kW/kVA.
2. Bản lưu = trang trực tuyến (cùng 17 dòng, cùng số). Bộ đọc đọc đúng cột (cột 2 → công suất theo nhãn), chỉ là nhãn của nguồn sai.
3. Bản ghi sinh ra: 17 bản ghi engine. **3 bản ghi mang công suất sai** (700GF, 800GF, 850GF: `rated 140 kW / 165 kVA`) vì "140/165" có kW/kVA = 0,848, nằm trong khoảng 0,75–0,86 của `fitPair` (`web/catalog.js:334`) nên bị nhận là cặp kW/kVA. **14 bản ghi không có công suất** (power = null): 138/150 (0,92), 138/160 (0,8625, vừa vượt 0,86), 145/165 (0,879), 135/320 (0,42) đều bị `fitPair` loại. Tức chỉ 3/17 là "số sai nằm trong bản ghi"; 14 dòng kia không chứa số sai, chỉ thiếu công suất. (Điều phối đếm "17 dòng công suất 135–145 sai": tôi không thấy 17 bản ghi mang số đó, chỉ 17 ô trong nguồn. Chưa kiểm được lượt rà hằng tuần đếm bằng cách nào.)
4. Ngoài cột sai: bộ đọc cho n111 chỉ ra 3 thông số mỗi dòng (current, weight, fuel). KHÔNG đọc cột "额定功率 power (KW)" của động cơ (259…1012), số xi lanh ("6缸直列", "12缸V型"), dung tích dầu: chưa tìm nguyên nhân (tiêu đề hai tầng lệch 5 + 7 ô trên dòng dữ liệu 10 ô), ghi để điều phối xem.

## Bảng 17 dòng (chữ nguồn → bản ghi → sai gì → bằng chứng)
Cột nguồn: tổ máy | "输出功率 kW/kVA" | dòng điện | mã động cơ | "额定功率(kW)" động cơ. Bản ghi: `engine <mã>`; công suất đọc ra; cờ row-flags. WU = wudong-wuxi tệp 102 (bore×stroke | công suất 标定 | 超负荷 = standby).

| # | Chữ nguồn | Bản ghi đọc ra / cờ | Sai gì | Bằng chứng |
|---|---|---|---|---|
| 0 | 200GF \| 135/320 \| 362 \| WD129TAD23 \| 259 | power ∅, không cờ | ô 2 không phải công suất; "320" không khớp hành trình WU 135×150 | WU: 135×150, 235/259. Engine 259 = WU 超负荷 ✓ |
| 1 | 250GF \| 138/150 \| 452.5 \| WD135TAD28 \| 308 | ∅, không cờ | ô 2 = bore/stroke | WU 138×150, 280/308 ✓ ✓ |
| 2 | 300GF \| 138/160 \| 543 \| WD145TAD30 \| 340 | ∅, không cờ | như trên | WU 138×160, 309/340 ✓ ✓ |
| 3 | 320GF \| 138/160 \| 579.2 \| WD145TAD33L \| 373 | ∅, không cờ | như trên | WU (WD145TAD33, không "L") 138×160, 339/373 ✓ |
| 4 | 350GF \| 138/160 \| 633.5 \| WD145TAD35 \| 388 | ∅, không cờ | như trên | WU 138×160, 353/388 ✓ ✓ |
| 5 | 400GF \| 138/150 \| 724 \| WD269TAD38 \| 420 | ∅, không cờ | như trên | WU 138×150, 382/420 ✓ ✓ |
| 6 | 400GF \| 138/150 \| 724 \| WD269TAD41 \| 460 | ∅, không cờ | như trên | WU 138×150, 418/460 ✓ ✓ |
| 7 | 450GF \| 138/150 \| 814.5 \| WD269TAD45 \| 512 | ∅, không cờ | như trên | WU 138×150, 465/512 ✓ ✓ |
| 8 | 500GF \| 138/150 \| 905 \| WD269TAD48 \| 530 | ∅, không cờ | như trên | WU 138×150, 482/530 ✓ ✓ |
| 9 | 500GF \| 138/150 \| 905 \| WD269TAD50 \| 556 | ∅, không cờ | ô 2 = bore/stroke; **cột động cơ 556 ≠ WU 579** | WU 138×150, 526/579 |
| 10 | 500GF \| 138/150 \| 905 \| WD269TAD56 \| 618 | ∅, không cờ | như dòng 1 | WU 138×150, 562/618 ✓ ✓ |
| 11 | 600GF \| 138/160 \| 1086 \| WD287TAD61L \| 680 | ∅, không cờ | ô 2 = bore/stroke; **680 ≠ WU 691** (WU ghi WD287TAD61, không "L") | WU 138×160, 628/691 |
| 12 | 700GF \| 140/165 \| 1267 \| WD305TAD68 \| 750 | `rated 140 kW/165 kVA`; cờ absurd current 1267 (drop) | công suất đọc ra sai (nguồn sai nhãn); mã WD305TAD68 không có ở WU: chưa kiểm được bore/stroke và 750 | 1267 A ≈ 700 kW ở 400 V cosφ 0,8: dòng điện của HÀNG KHÁC với "140/165" |
| 13 | 800GF \| 140/165 \| 1448 \| WD327TAD78 \| 858 | `rated 140/165`; cờ absurd current 1448 (drop) | như 12; ô 2 "140" ≠ WU bore 145 (WU 145×165); 858 ≠ WU 867 | WU 145×165, 788/867 |
| 14 | 850GF \| 140/165 \| 1538.5 \| WD327TAD82 \| 902 | `rated 140/165`; cờ absurd current 1538.5 (drop) | như 13; 902 ≠ WU 911 | WU 145×165, 828/911 |
| 15 | 900GF \| 145/165 \| 1629 \| WD327TAD88 \| 970 | ∅, không cờ | ô 2 = bore/stroke (khớp WU); **970 ≠ WU 988** | WU 145×165, 898/988 |
| 16 | 1000GF \| 145/165 \| 1810 \| WD327TAD92 \| 1012 | ∅, không cờ | ô 2 = bore/stroke; **1012 ≠ WU 1032** | WU 145×165, 938/1032 |

Phép kiểm nhất quán (công thức, không phải dữ liệu NCC): dòng điện ≈ 1,81 × số GF (200GF→362, 250GF→452,5, 300GF→543, 1000GF→1810) ⇒ số GF là kW tổ máy ở 400 V cosφ 0,8. Nghĩa là công suất thật của tổ máy KHÔNG nằm ở cột "输出功率" mà ở tên "NNNGF" và dòng điện; nhưng quy ra kW từ tên là suy luận, tôi không đưa vào hồ sơ.

Thêm dòng nghi ngoài 17 dòng cờ: cột "động cơ kW" của Huatai khác cột 超负荷 của WU ở 6 dòng (9, 11, 13, 14, 15, 16; chênh 9–23 kW), khớp ở 10 dòng có mã; dòng 12 chưa có để so. Huatai có thể dùng bản công suất khác của hãng; chưa kiểm được nguồn nào đúng. Dòng 0 có "320" lệch hành trình (WU 150).

## Vì sao 14 dòng không có cờ
`absurdOf` (`suppliers/row-flags-lib.mjs:76`) trả null (không xét) cho current / weight / engPower khi dòng không có kVA/kW (`POWERED`, dòng 78). 14 bản ghi power = ∅ nên current 362…1810 không bị xét; weight, fuel (198/196 g/kWh) hợp lý. Số sai không đi vào bản ghi, nên không có gì để luật bắt. Luật còn thiếu: "ô dưới nhãn công suất trùng bore×stroke / nhỏ hơn rõ rệt so với tên tổ máy" — row-flags chưa có luật nào so công suất với tên model hay với bore/stroke. 3 dòng có cờ là nhờ dòng điện lệch, cờ ghi "current", không nói đúng nguyên nhân (công suất đọc nhầm).

## Đề xuất (không làm)
| Cách | Dòng n111 động tới | Ghi chú |
|---|---|---|
| Nút "Bỏ hẳn" trên web | 3 dòng đã bị loại sẵn bằng cờ; muốn bỏ hết thì 17 (khoá dòng theo băm chữ) | bỏ 14 dòng không có số sai là mất cả dòng động cơ đúng (cột 259…1012 đúng ở 10/16 dòng so với WU) |
| `ROW_EXCEPTIONS` | tối đa 3 dòng có số sai | **không có trong code**: `grep` chỉ thấy nhắc trong `bot/claude/memory/config-suggest.md:78`, chưa có hằng số nào; phải tạo cơ chế mới |
| Sửa bộ đọc | 3 dòng (12–14) bỏ công suất; 14 dòng kia không đổi | cần luật: cặp "KW/KVA" mà số trùng bore×stroke của cùng model ở NCC khác thì không nhận; hoặc bỏ cặp khi tiêu đề "输出功率" nằm trên bảng có cột "缸径/行程" cạnh. Phạm vi ngoài n111: chưa đo (chạy `spec-diff` cần cho cả 59.064 bản ghi) |
| Thêm luật cờ | 17 dòng nếu luật là "công suất tổ máy < công suất động cơ", nhưng 14 dòng power ∅ nên không bắt được; chỉ bắt được 3 dòng đã bị cờ | luật theo tên "NNNGF" là suy ra từ tên, trái "không suy ra" |
Khuyến nghị: sửa bộ đọc theo cách 1 hoặc báo NCC; đừng thêm luật cờ mới cho riêng ca này.

---

## Mục riêng: bổ sung 19/11 — hai việc điều phối hỏi thêm

### (1) Ô "140/165" của 700GF / 800GF / 850GF
Đã trả lời ở trên: là đường kính/hành trình (mm) của động cơ, không phải cột công suất. "Lặp" vì ba mã WD305TAD68 / WD327TAD78 / WD327TAD82 cùng một thân máy, nên nguồn chép cùng một cặp bore/stroke; WU ghi WD327TAD78/82 là 145×165 (Huatai ghi 140: lệch 5 mm so với hãng). Cờ `absurd current` 1267 / 1448 / 1538,5 đúng hướng về cớ sai: dòng điện thật (≈ 700, 800, 850 kW) so với "165 kVA" mà bộ đọc đưa ra thì lệch ~5 lần; cờ ghi đúng triệu chứng nhưng không nói nguyên nhân.

### (2) depco-power n2257, bảng 261, bản ghi engine S6B-PTA, `row = null`
- Nguồn: `https://www.depcogenerator.com/mitsubishi-ranges-275-kva-diesel-generator_p534.html`, truy cập 2026-11-16, tệp `sources/depco-power/2257.md`.
- Bản ghi: tổ máy `DPK-DM-275`, `power = prime 32 kW/40 kVA, standby 35 kW/44 kVA`, `disp "12.88"` (nhãn "Displacement(L)"), cờ `absurd disp` (drop).
- **Trang tự mâu thuẫn**: khối đầu trang ghi "Engine Model: S6B-PTA, PRP (kW): 200, PRP (kVA): 250, ESP (kW): 220, ESP (kVA): 275" và tiêu đề "Silent 220kw/275kva Mitsubishi Diesel Generator S6B-PTA" (tệp dòng 64–74, 108); bảng "Product Parameters" ngay dưới ghi "Prime output | 32kW/40kVA | Standby output | 35kW/44kVA" (dòng 129), có vẻ là số của máy nhỏ chép sang mẫu trang. Bộ đọc lấy bảng tham số: 32/40 và 35/44.
- Cờ: dung tích 12,88 L trên 32 kW prime = 0,40 L/kW, vượt trần 0,3 L/kW của `absurdOf` (`row-flags-lib.mjs:88`), nên bị cờ. Chính 12,88 L là ĐÚNG với S6B (135×150, 6 xi lanh: π/4·13,5²·15·6 = 12,88 L, kiểm tay từ chính bore/stroke ghi trong trang) và hợp lý với 200 kW prime (0,064 L/kW). Vậy cờ bắt đúng dòng có vấn đề nhưng nhầm số: số sai là công suất 32/40 (bảng tham số chép nhầm), không phải dung tích.
- Chưa kiểm được: trang trực tuyến hiện tại (tôi chỉ đọc bản lưu 16/11); số nào trong hai khối là của sản phẩm thật (nghiêng về 200/250 theo tên model "275 kVA" và tiêu đề, nhưng đó là suy luận).
- Hệ quả: dòng bị loại khỏi Gợi ý (đúng, vì công suất không tin được), nhưng lý do ghi trên web là "disp", dễ khiến người duyệt bấm "cho dùng" nhầm.

## Cần ghi nhớ (cho điều phối)
- Bẫy công cụ: `row-flags.mjs --json` bắt buộc kèm đường dẫn tệp (`--json <tệp>`); không có đường dẫn thì nó nuốt `--id` làm tên tệp.
- Nguồn huatai-yangzhou n111 mislabel cột (bore/stroke dưới nhãn kW/kVA); liên hệ: các NCC TQ chép mẫu có thể tái diễn (chưa đo).
