# Rà soát dữ liệu: đọc lệch dòng / cột, dư dòng / cột, nhầm trước sau (17/11/2026)

Khoa giao 17/11/2026. Chỉ đọc, chưa sửa gì. Main `0c738e3e` (#889). Script và danh sách đầy đủ: `dau-vao\ra-soat-lech-dong-cot\`.

## Phạm vi

| Kho dữ liệu | Số lượng | Đã soát |
|---|---|---|
| Bảng thông số NCC (`suppliers/cn`, `web/catalog.js` đọc) | 439 NCC, 9.813 bảng, 203.701 dòng → 58.999 bản ghi | Toàn bộ bản ghi |
| Lịch sử thầu (`bidhist`, bản web 12/11, không đổi từ đó) | 1.556 gói, 1.627 lô, 8.250 dòng hàng hoá, 4.743 dòng nhà thầu | Toàn bộ |
| Ngưỡng HSMT do code đọc (`powerRead` / `engineMins`) | | KHÔNG soát lại: đã soát 17/11 (#844, #850, `soat-nguong-3.md`) |
| Kết quả Gợi ý cấu hình / Gợi ý giá đã lưu | | KHÔNG soát: là kết quả tính từ hai kho trên |

Cách soát: không dựa nhãn cột mà kiểm số bằng quan hệ phải đúng (kW = 0,8 × kVA; prime < standby; đường kính² × hành trình × số xi lanh = dung tích; tiêu hao ↔ công suất; khối lượng ↔ kVA; Σ số lượng × đơn giá = giá trúng; một mã không thể vừa là động cơ vừa là đầu phát), rồi mở mẫu từng nhóm để tách **lỗi đọc của mã** khỏi **nguồn ghi sai**.

Giới hạn: số đếm là của bộ phát hiện, mỗi nhóm đã mở mẫu 3–6 NCC chứ không mở từng dòng; chỉ đối chiếu với bảng đã lưu, không mở lại trang gốc / ảnh PDF.

---

## A. Bảng thông số NCC

**1.116 bản ghi ở 69 NCC dính ít nhất một lỗi đọc đã xác nhận (1,9% của 58.999)**, cộng khoảng 290 bản ghi lệch cột khối lượng chưa nằm trong số đó (mục A3). Phần còn lại của ~2.900 dòng nghi vấn là nguồn ghi sai hoặc ngưỡng kiểm của tôi chặt quá.

### A1. Ghép nhầm cặp kVA / kW (`powersIn`) — 574 bản ghi

Nguyên nhân chung: `powersIn` không nhìn tiêu đề cột. Hai ô số đứng cạnh nhau có tỉ số 1,15–1,35 là thành cặp, số lớn làm kVA; hậu tố "kVA" / "kW" trong ô bị bỏ trước khi so.

| Loại | Bản ghi | NCC | Ví dụ (dòng nguồn → đọc ra) |
|---|---|---|---|
| Hai ô CÙNG đơn vị thành một cặp | 92 | 9 | elitech `Prime 30KVA \| Standby 35KVA` → 35 kVA / 30 kW; aoke `主用 1700KW \| 备用 2000KW` → 2000 kVA / 1700 kW; zhengchi ×35 |
| Ô không phải công suất vào cặp | 169 | 6 | tecnogen ×121: `kVA LTP 50 Hz \| PRP 50 Hz \| LTP 60 Hz \| PRP 60 Hz` = `150 \| 135 \| 156 \| 141` → 156 kVA / 135 kW (trộn 50 và 60 Hz); kangwo `KW 440 \| KVA 550 \| 电流 792`; chuangyuan `功率 500 \| 电压 400` → 500 kVA / 400 kW |
| Ô tần số 50 / 60 thành công suất | 35 | 3 | victory ×27: `V55XC \| 60 (Hz) \| 50 kW \| 62.5 kVA \| 55 \| 68.75` → prime 60 kVA / 50 kW (đúng: 62,5 / 50) |
| Hai ô kề, tỉ số không phải 0,8 | 266 | 48 | acepow `Kw: 30 \| 33 \| Kva: 38 \| 41` → standby 38 kVA / 33 kW (đúng: prime 38 / 30, standby 41 / 33); lees `Standby KVA 625 \| Prime KVA 575 \| Standby KW 500 \| Prime KW 460` → 575 kVA / 500 kW; frs-shenyang ×14: hai ô KHỐI LƯỢNG `2000 \| 2625` → 2625 kVA / 2000 kW cho máy 184 kW; ettes: `kWe 560 \| kWt 651` (nhiệt) → 651 kVA |
| Một ô "a/b" là prime / standby cùng đơn vị | 12 | 3 | bdadl `输出功率 (主用/备用) \| 64/70` → 70 kVA / 64 kW; senci `（KW）（主用/备用）\| 50/58` |

Nhóm thứ tư (266) lẫn cả dòng nguồn ghi lệch (comappower `313kVA \| 250kW \| 650kVA \| 520kW`): cần xem tay khi sửa.

### A2. Bảng nhãn | giá trị (datasheet một model) — 171 bản ghi

| Loại | Bản ghi | Ví dụ |
|---|---|---|
| Công suất tổ máy = công suất mô-tơ đề; "model" động cơ = "4-stroke diesel" | 95 (himoinsa 34, himoinsa-china 33, hipower 28) | `Starting power: 1,4 kW` → tổ máy 1,4 kW; mã động cơ thật (4TNV88BGGEH) nằm ở ô tổ máy. Kéo theo tiêu hao, khối lượng của ~190 dòng không so được với công suất |
| kVA của tổ máy ghép với kW của ĐỘNG CƠ (hai dòng khác nhau) | 68 (longkai 46, genlitec 11, hosem 9, long-gen 2) | longkai: `Prime Power: 250KW312.5KVA` + `Prime power \| KW \| 280` (động cơ) → 312,5 kVA / 280 kW |
| Trang nhiều model / nhiều bảng trộn nhau, prime > standby | 8 | kingway: prime 2500 kVA, standby 628 (số của bảng khác); tecgen-fujian bảng ngang 4 model |

### A3. Lệch cột do tiêu đề hai tầng (`walkedSpecs` đếm từ trái) — 245 + ~290 bản ghi

Tiêu đề "主用功率 / 备用功率" phủ hai ô (KW, KVA) nhưng lượt đi từ trái tính mỗi tiêu đề một ô, nên mọi cột sau đó lệch:
- yingtai-jiangsu ×165, yingtai-group ×133: `20GF | 20 | 25 | 22 | 27.5 | 36 | 39.6 | 710 | …` → "净重 Net Weight" = **36** (là dòng điện, kg đúng là 710).
- xinzhengfa ×71, kangwo ×9: "电流 A" = kW.
- cgm-italia ×69: "kg" = 39,6 (là kW standby).
Bộ đếm theo tiêu đề bắt được 245; kiểm khối lượng / kVA < 2,5 bắt thêm ~290 (yingtai-group, cgm-italia) → nhóm này thật ra khoảng 530 bản ghi.

### A4. Đảo động cơ ↔ đầu phát — 225 bản ghi chắc, 74 chưa rõ

- Mã mà ≥ 3 NCC khác ghi là động cơ, ở đây đọc thành đầu phát: 216 (longkai ×152, acepow ×46, cldj-fujian ×16). acepow: tiêu đề `Alternator | Engine model`, dòng `BC184H | Y4105D` → động cơ = BC184H. cldj: `发电机型号 CLG-224F | 发动机型号 SC4H95D2` → đầu phát = SC4H95D2.
- Ngược lại: 9 (uleengen `224E`, `TAL-A40-F`, `P086TI-1`).
- 74 mã ở cả hai vai mà không đủ số đông để phân xử.
- Dòng tổ máy hai động cơ (tecnogen `2 x TAD1641GE`): động cơ đọc thành mã tủ điều khiển `SCP8610`, công suất lấy từ ô tiêu hao.

### A5. Nguồn ghi sai (mã đọc đúng chữ, số vẫn sai) — không phải lỗi đọc, nhưng đang nằm trong danh mục

| Loại | Số dòng | Ví dụ |
|---|---|---|
| Công suất động cơ vô nghĩa | 110 | eastern-lion-fuan: `Engine power (kW) = 19408` cho máy 10 kW (cả bảng) |
| Đơn vị ở tiêu đề sai | ~60 | taihai ×34: cột "g/kw.h" ghi 62 (là L/h); bdadl / pengpai "≤418 g/kw.h" |
| Số liệu động cơ của model khác (lệch DÒNG ngay trên trang nguồn) | ~340 (P11) | victory WP4D100E200: 6 xi lanh 105×120 6,25 L (số của WP6); mingbang KTA50-G3: 12 xi lanh 37,8 L (số của KTA38); agestar ×42: 6BTA5.9 ghi 8,3 L; bdadl WP4.1: 6 xi lanh 4,8 L |
| đk × ht × xi lanh ≠ dung tích | 225 | depco ×85 (số xi lanh, phiên depco-sua đang xử lý); huipu `135*150 \| 2.88` (thiếu số 1); jet-power S6R2 `170×120` |
| Cặp kVA / kW gõ ngược hoặc gõ nhầm | 40 | sanq ×13: `176KVA/220KW`; depco `35kW/344kVA`, `50kW/70kVA \| 55kW/69kVA` |
| prime = standby | 169 | fdk-energy ×52, cgm-italia, voltgent |
| Catalog PDF (nguồn 5001+) nghi lệch dòng ở ô gộp | 25 | mecca `MC1000D \| 260 \| 325 \| 800 \| 1000`; app-power `APP-100GF \| 80 \| 100 \| 110 \| 138`: CHƯA đối chiếu ảnh PDF |

Luật số đông (Khoa 16/11) đã che được phần "số liệu của model khác" khi model có ≥ 3 NCC; model ít NCC thì số sai vẫn là số duy nhất.

### A6. Thiếu chứ không sai (ghi nhận, không tính lỗi)
- 38.589 / 54.340 dòng có số ô khác số tiêu đề (tiêu đề nhiều tầng): mã đã chặn bằng kiểm dạng giá trị, phần lớn chỉ mất thông số chứ không gán nhầm.
- depco / kena (bảng Details): cặp bên TRÁI của nhiều dòng không ra thông số (`Frequency (Hz) | 50`, `N.W (kg)`, `Fuel Con.(L/H)`), chỉ cặp bên phải được đọc.
- 432 dòng đường kính và hành trình nằm hai cột riêng: chỉ lấy đường kính.

---

## B. Lịch sử thầu (`bidhist`)

Hàng hoá đọc từ JSON của muasamcong theo tên trường (`goods-read.js`), không đọc bảng, nên không có lệch cột kiểu bảng. Σ số lượng × đơn giá khớp giá trúng ±0,5% ở 518 / 833 lô kiểm được; 94 lô thấp hơn 6–14% (nghi đơn giá chưa thuế, chưa xác minh).

| # | Lỗ hổng | Số lượng | Ví dụ | Nguyên nhân |
|---|---|---|---|---|
| B1 | Đơn giá thật ra là THÀNH TIỀN | 5 gói chắc (Σ đơn giá = giá trúng) | IB2300296794: 100 chiếc × 60,9 tỷ; IB2300263757: 20 × 15,98 tỷ; IB2300363576; IB2500386288; IB2300013484 | `unitPrice: pos(priceUnit, bidPrice, unitPrice)`: `priceUnit` trống thì lấy `bidPrice`, ở các gói này là thành tiền. Còn ~15 gói tỉ số 2–8 lần chưa phân loại được (IB2600064877, IB2600064878, IB2500456429, IB2300363458…) |
| B2 | Dòng hàng hoá lặp y hệt (dư dòng) | 404 dòng ở 43 lô | IB2200100465: 67 / 100; IB2300148471: 43 / 91; 3 gói Σ = đúng 2 lần giá trúng | Mẫu cũ lặp bảng theo nhà thầu / liên danh |
| B3 | Danh sách hàng hoá bị cắt ở 100 dòng (thiếu dòng) | 15 lô đúng 100 dòng; 10 lô Σ chỉ 24–69% giá trúng | IB2300203745, IB2600455248 | `rows.slice(0, 100)` |
| B4 | Nhà thầu lặp trong một lô | 6 dòng ở 5 lô (đều 2022) | IB2200019427: nhà thầu trúng ×3 → giá trúng của gói 7,39 tỷ = 3 × 2,46 tỷ (giá gói 2,5 tỷ) | Dư dòng làm sai cả giá trúng |
| B5 | Giá "sau giảm" lấy nhầm lô khác | 1 | IB2500312373 lô 2: dự thầu 25,06 tỷ, sau giảm 62,64 tỷ (là giá lô 1) | Khớp theo nhà thầu, không theo lô |
| B6 | Công suất đọc từ Chương V = 0,5 kVA (số sau "±") | 37 gói | IB2500536474 "12.5 ±0.5 KVA" → 0,5 kVA | Số sau "±" bị đọc thành công suất. `capacityOf` của web đã bỏ dung sai; `config.kvas` dựng 06/11 thì chưa (tôi chưa mở mã dựng `config.kvas` để xác nhận) |
| B7 | Công suất là tổng / của trạm biến áp | 11 giá trị > 5.000 (7500, 47000, 141200 kVA; 120000 kW) | IB2300030459 "Tổng công suất" 3 × 2500 | Đọc số tổng hoặc số lưới |
| B8 | Công suất đọc ra không trùng số nào trong tên gói | 17 gói | IB2400191798 tên 350 kVA ↔ đọc 250 / 275; IB2500364714 400 ↔ 500; 6 gói tên là trạm biến áp (không phải lỗi) | Cần xem tay ~10 gói |
| B9 | Không có giá dự thầu | 969 dòng (718 có giá sau giảm, 251 không có giá nào; 412 là nhà thầu trúng) | IB2200001635 | Mẫu cũ không trả `bidPrice`; không phải lệch, nhưng chỗ nào dùng `bidPrice` trần sẽ hụt |
| B10 | Giá trúng > giá gói | 43 gói | IB2300189145: 9,3 tỷ ↔ 2,6 tỷ | Phần lớn là gói xây lắp có dự toán duyệt lại (`estimatedPrice` lớn hơn); chưa xem hết |

Không thấy: đảo số lượng ↔ đơn giá (10 dòng nghi đều là dầu, số lượng lít lớn: đúng), ngày ngược thứ tự (0), thứ hạng ngược giá (0), MST sai dạng (1, mã định danh "z…").
Trường năm sản xuất / xuất xứ / đơn vị chứa chữ mô tả (400 dòng) là do nhà thầu gõ vào ô tự do, không phải đọc nhầm cột.

---

## C. Đề xuất (chờ Khoa chọn)

Xếp theo ảnh hưởng tới Gợi ý cấu hình / Gợi ý giá:

1. **`powersIn` đọc theo tiêu đề** (A1, 574 bản ghi): ô có hậu tố đơn vị giống nhau, hoặc tiêu đề hai ô cùng chỉ kVA / cùng chỉ kW, hoặc tiêu đề là tần số / dòng điện / khối lượng / điện áp thì không ghép; ô "a/b" dưới nhãn "(主用/备用)" đọc là prime / standby. Sửa `web/catalog.js`, xếp sau depco-sua (cùng tệp).
2. **`walkedSpecs`: dừng lượt đi từ trái ở tiêu đề công suất** khi dòng rộng hơn tiêu đề (A3, ~530 bản ghi). Cùng PR hoặc PR kế tiếp.
3. **himoinsa / hipower** (A2, 95 + ~190 dòng): "Starting power" không là công suất tổ máy; "4-stroke diesel" không là mã.
4. **Động cơ ↔ đầu phát** (A4): chọn cột theo tiêu đề khi tiêu đề gọi tên cả hai; dòng "2 x <mã>" đọc mã sau "2 x".
5. **Chốt chặn số vô lý lúc đọc** (A5): công suất động cơ > 3 lần hoặc < 0,9 lần tổ máy; tiêu hao "g/kWh" ngoài 150–300; khối lượng < 2,5 kg/kVA → để thiếu thay vì giữ. Đây là luật MỚI về dữ liệu, cần Khoa duyệt.
6. **bidhist**: (a) `unitPrice` không lấy `bidPrice` khi `bidPrice` × số lượng vượt giá trúng; (b) bỏ dòng hàng hoá và dòng nhà thầu lặp y hệt; (c) nâng trần 100 dòng hoặc ghi cờ "bị cắt"; (d) dựng lại `config.kvas` cho 37 gói "0,5 kVA". Sửa bot → phải Backup + PR theo quy trình bot, và chạy lại lịch sử cho các gói dính.
7. Đối chiếu 25 dòng catalog PDF (5001+) với ảnh trang PDF trong `Datasheets`.

Mỗi PR đo trước / sau bằng `cmpk.cjs` (đã có) + `audA.cjs` / `audB.cjs` (mới) + top 30 ứng viên toàn bộ gói.

## D. Kết quả làm (Khoa duyệt làm hết 17/11/2026, kiểm chéo toàn bộ)

### Việc 7: đối chiếu catalog PDF (nguồn 5001+) với ảnh trang gốc — XONG, không có lỗi đọc
`pdfSus.cjs` lọc lại trên toàn bộ 2.072 bản ghi nguồn catalog PDF (8 NCC) theo quan hệ số (hệ số ≠ 0,8; prime ≥ standby; standby / prime ngoài 1,04–1,26): còn 11 dòng tổ máy (số 25 của mục A5 gồm cả dòng lệch do làm tròn 9,6 → 10, nay đã loại). 188 dòng perkins là bảng ĐỘNG CƠ (kWm, không có công suất tổ máy): đúng. Cả 11 dòng đã mở ảnh trang PDF trong `Datasheets` và so từng ô:

| Dòng đã lưu | Trang PDF | Kết quả |
|---|---|---|
| app-power-anpu APP-100GF / 120GF ×2 / 150GF / 180GF / 350GF (玉柴 T2: standby gấp 1,28–1,38 prime) | APPpower.pdf trang 7, bảng "Guangxi Yuchai-T2" | Khớp từng ô. Catalog in như vậy |
| kaichen-jiangsu KCC-500GF QSZ13-G3: 400 / 500 / 410 / 513 | trang 5 (PAGE 07): Standby 513 / 410, Prime 500 / 400 | Khớp |
| lees-power LSSC13S3-6: 10 / 12 / 10 / 13 | trang 17: Standby 13 kVA, Prime 12 kVA, Standby 10 kW, Prime 10 kW | Khớp (catalog làm tròn) |
| mecca-power MC188WC: 145 / 181 / 150 / 188; MC13SD: 10 / 12 / 10 / 13 | trang 16, 18 (lớp chữ của PDF) | Khớp |
| mecca-power **MC1000D** TCD12.1 G1: LTP 1000 kVA / 800 kW, PRP 325 / 260 | trang 13 (DEUTZ 50 Hz), dòng giữa MC330D và MC413D | Khớp chữ in, nhưng CATALOG IN SAI (dòng này phải cỡ 358 kVA; tên model và LTP bị gõ thành 1000). Đang nằm trong danh mục là standby 1000 kVA. Chưa có luật nào loại: cần Khoa quyết (bỏ dòng, hay thêm chốt chặn standby > 1,5 × prime) |

Ghi nhận thêm: `catalog-pdf.mjs` cố ý chỉ giữ dòng kiểm được bằng code, nên catalog scan thiếu dòng so với PDF (APP trang 7: thiếu APP-300GF ×2 có ô "/", và APP-350GF YC6MJ500-D30 vì OCR đọc thành "YC8MJ500"). Là thiếu, không sai.

## Chạy lại

```
node audA.cjs <worktree>   # nghi vấn theo quan hệ số (ghi audA.json cạnh script)
node audB.cjs <worktree>   # đếm từng loại lỗi đọc
node view.cjs "P9b,P10" 5 1 [id NCC]   # xem mẫu
node audH.cjs; node audH2.cjs; node audH3.cjs   # bidhist (đọc genbid-work\doc-cache\bidhist.json)
```
Chép thư mục sang chỗ tạm trước khi chạy (script ghi tệp cạnh nó).
