# Soát 275 số công suất động cơ dưới nhãn kW/HP (bản chuẩn thông số)

Phiên con, chỉ đọc. Dữ liệu: `origin/main` (b1bd66ac), `suppliers/spec-standard.mjs` chạy thật trên `suppliers/cn` (9.685 doc), bắt từng bản ghi qua móc `audit` (không sửa mã). Tệp đầy đủ: `genbid-work\dieu-phoi\dau-vao\kw-hp\kw-hp-275.tsv` (275 dòng, mỗi dòng có NCC, số nguồn, bảng, dòng, tiêu đề cột, model, ô nguyên văn, số đọc, kết luận, căn cứ, dòng nguồn). Script: scratchpad phiên (`kwhp.mjs`, `final.mjs`), có thể chép sang `dau-vao\kw-hp\` nếu cần chạy lại.

## 1. Con số 275 và cách đếm

- 275 là **số bản ghi đọc** (sp, trước khi gộp) thuộc trường `power_kwm` của động cơ có nhãn chứa cả kW và HP. Xác nhận đúng 275. Bản chuẩn gộp trùng thì ít hơn: với 48 ô một số chỉ còn 37 cặp (model, giá trị).
- Không có nhãn kW+HP/PS/BHP nào ở alternator, controller, genset (đã quét mọi bản ghi).
- Theo NCC: ettes-power 255, ricardo-weifang 10, jichai 9, yangdong 1. Có 5 mẫu nhãn:

| Nhãn | NCC | Số dòng |
|---|---|---|
| `Max Power (kW/Hp)` | ettes-power | 173 |
| `Engine Power (kW/Hp)` | ettes-power | 82 |
| `Rated power,kw/hp` | jichai | 9 |
| `Rated Power/Speed(kw/hp/rpm)` | ricardo-weifang | 10 |
| `Rated power KW/HP` | yangdong | 1 |

## 2. Phát hiện chính: giả thiết "ô chỉ có một số" chỉ đúng với 48 dòng

Báo cáo bước 2 nói "ô chỉ có một số". Soát từng dòng cho thấy:

| Dạng ô | Số dòng | Ghi chú |
|---|---|---|
| Một số (vd `1190`) | **48**, toàn ettes-power, nhãn `Max Power (kW/Hp)` | đây mới là ca cần quyết |
| Cặp `kW/HP` (vd `1227/1644`) | 217 (ettes 207, jichai 9, yangdong 1) | bộ đọc lấy số đầu làm kW, số sau vào `cond.hp`; tự có số thứ hai để đối chiếu |
| Bộ ba `kW/HP/rpm` (ricardo) | 10 | bộ đọc **không** xếp là kW: ra `options [kW, HP, rpm]` kèm `missing: ambiguous, speed`; đã bị đánh dấu, không phải ca "ngầm là kW" |

Vậy số bị xếp ngầm là kW mà không có số kiểm = 48 (thay vì 275); 217 cặp tự đối chiếu được; 10 ricardo đã gắn cờ.

## 3. Kết luận từng dòng (đủ 275, xem TSV)

| NCC | Dạng | kW | HP | Không xác định | Tổng |
|---|---|---|---|---|---|
| ettes-power | cặp | 206 | 0 | 1 | 207 |
| ettes-power | một số | 44 | 1 | 3 | 48 |
| jichai | cặp | 9 | 0 | 0 | 9 |
| yangdong | cặp | 1 | 0 | 0 | 1 |
| ricardo-weifang | bộ ba | 10 (số đầu = kW) | 0 | 0 | 10 |
| **Cộng** | | **270** | **1** | **4** | **275** |

### 3.1 Cặp kW/HP (căn cứ a: số thứ hai trong cùng ô)
HP/kW của 217 cặp nằm trong 1,144 .. 1,365, 216 dòng trong khoảng 1,31–1,37 (1 kW = 1,341 HP, mã lực mét 1,360, làm tròn). Số đầu là kW, số sau là HP ở 216/217 dòng. Chưa thấy dòng nào bị đảo thứ tự (HP đứng trước). Ca lệch duy nhất: **`507/580`**, ettes-power, bảng 49 dòng 12, model K19-DM (dòng EC-450M6): tỷ số 1,144, không phải cặp kW/HP; có thể là hai mức công suất kW (chính / dự phòng) nhưng nguồn không nói → **không xác định** (số 507 vẫn là kW so với 450 kW tổ máy, nhưng ô không nói nó là gì).
16 cặp có số đầu > 1,25× kW tổ máy cùng dòng (vd `83/111` với tổ máy 50 kW, động cơ 6BT5.9-GM83): đó là động cơ lớn hơn tổ máy, số 83 khớp tên model "GM83" = 83 kW, không mâu thuẫn.
Đối chiếu (b) (cùng model động cơ, NCC khác ghi kW rõ): 96 cặp có ít nhất một giá trị kW trùng đúng, 41 có kW khác nhưng không trùng, 0 dòng mâu thuẫn (sau khi siết dung sai HP còn 0,3%; dung sai 1,5% sinh 3 trùng hợp giả ở KT38G/KTA38G1/K19DM, đã bỏ vì cặp trong ô cho tỷ số 1,340 đúng).

### 3.2 Ô một số (48 dòng, đều ettes-power, `Max Power (kW/Hp)`)
Căn cứ (a): ô nguồn có cột kW tổ máy (prime / standby). Công suất động cơ phải ≥ kW tổ máy và tối đa khoảng 1,25 lần (hiệu suất máy phát ≥ 80%). Nếu số là HP thì kW động cơ = số / 1,341 sẽ nhỏ hơn kW tổ máy là vô lý. 
- **44 dòng = kW**: số / kW tổ máy cao nhất cùng dòng từ 1,008 đến 1,212 (vd ET-1250: 1100 so với standby 1000). Trong đó 34 dòng còn trùng đúng với kW ghi rõ cho cùng model ở NCC khác (căn cứ b); 10 dòng không có số b để so (6 b không khớp, 4 không có), không có dòng nào b phản bác.
- **1 dòng = HP**: ettes-power bảng 45 dòng 14, model 20V4000G63, ET-3750: ô `3311`, tổ máy standby 2400 kW; 3311 / 2400 = 1,38 nghĩa là máy phát hiệu suất 72%, không thể là kW; 3311 HP = 2469 kW = 1,029 × 2400, hợp lý. Bản chuẩn đang ghi 3311 là kW: **sai**.
- **3 dòng không xác định**: 20V4000G63L: ET-3250 (bảng 44 dòng 24) và ET-3438 (bảng 45 dòng 13) ô `2590`, tổ máy standby 2600 kW: 2590 < 2600 nên cả hai cách đọc đều không khớp ngưỡng (kW chỉ thấp hơn tổ máy 10, HP thì cách xa); ET-4000 (bảng 45 dòng 15) ô `3311`, tỷ số 1,273 nằm khoảng giữa hai ngưỡng. Không có kW ghi rõ cho cùng model. Ghi chú: cùng giá trị 3311 ở dòng HP nói trên (20V4000G63) làm ET-4000 nghiêng về HP, nhưng đó là suy từ model khác nên em để "không xác định".

### 3.3 jichai / yangdong / ricardo
jichai (9 dòng, cặp), yangdong (1 dòng, cặp): tỷ số HP/kW từ 1,31 đến 1,37, đều kW trước. ricardo: bộ ba kW/HP/rpm (vd `30.1/40/1500`, `41/56/1500`); số đầu là kW (tỷ số 1,31–1,37 và nhãn ghi thứ tự kw/hp/rpm). Hiện bản chuẩn ghi `options` với `missing: ambiguous` nên vẫn chưa nhầm, nhưng đọc được rõ: kW, HP, vòng/phút.

## 4. Đề xuất luật đọc

1. Nhãn chứa cả kW và HP/PS/BHP, ô có **hai số a/b** (kW/HP theo thứ tự nhãn): a = kW, b = HP, nếu b/a nằm trong 1,30–1,37. Ủng hộ 216, phản bác 0, lệch 1 (`507/580`, để `missing: unit`). Hiện bộ đọc đã làm đúng nhưng cond.hp chỉ là "cond"; bước 5 nên đọc HP từ đó.
2. Nhãn kW/Hp, ô **bộ ba a/b/c** có chữ rpm: a = kW, b = HP, c = vòng/phút khi b/a trong 1,30–1,37 (10/10 ricardo). Nên đọc thật thay vì `options ambiguous`.
3. Nhãn kW/Hp, ô **một số**: không có luật theo NCC; chỉ có thể quyết theo dòng bằng kW tổ máy cùng dòng (số / kW tổ máy trong 1,0–1,25 → kW; số / 1,341 trong 1,0–1,25 → HP). Ủng hộ kW 44, HP 1, 3 không xác định. Có thể thành luật tự động trong bộ đọc, nhưng không nên tuyên bố "nhãn kW/Hp một số ở ettes = kW" chung vì có ít nhất 1 phản chứng thật (3311 HP) và 3 ca lưng chừng.

## 5. Điểm cần Khoa quyết

1. **Sửa bản chuẩn 1 dòng sai**: ettes-power 20V4000G63 (ET-3750), `3311` đang là kW nhưng là HP (căn cứ ở 3.2). Khoa duyệt thì giao việc sửa (đổi sang `power_hp` hoặc ghi `unit` rõ) kèm cho bộ đọc luật mục 4.3.
2. **4 dòng không xác định** (3 ô một số 20V4000G63L, 1 cặp `507/580` K19-DM): (A) ghi `missing: unit` tạm cho 4 dòng này (đề xuất); (B) Khoa tra tờ hãng (Cummins K19-DM, MTU 20V4000G63L) ngoài repo.
3. **Có đưa bộ ba ricardo vào đọc kW/HP/rpm không** (mục 4.2): hiện đang `ambiguous`, không sai nhưng thiếu 10 số.
4. Khi bước 5 đọc bản chuẩn: nên tin 216 cặp + 44 ô một số theo mục 3, không cần ghi `missing: unit` cho cả nhóm "kW/Hp" (khác phương án B của câu 3 bước 2; phương án A "giao soát" đã hoàn tất, kết quả: nhóm này hầu hết đúng là kW).

## 6. Giới hạn của việc soát

- Chỉ dùng dữ liệu trong repo (origin/main lúc soát, checkout chính trễ 7 commit), không tra internet. Đối chiếu (b) giới hạn ở các bản ghi kW ghi rõ đơn vị của chính repo; các tờ hãng `engine_maker`/"Datasheet: …" nằm trong cùng nguồn đó nên đã được tính vào (b), không soát riêng.
- Ngưỡng 1,0–1,25 (hiệu suất máy phát) là giả thiết kỹ thuật của em, nằm ở `final.mjs`; đổi ngưỡng thì chạy lại, TSV có sẵn tỷ số để tự soát.
