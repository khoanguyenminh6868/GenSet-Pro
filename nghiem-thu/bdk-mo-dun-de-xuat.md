# Bộ điều khiển + mô-đun truyền thông: đề xuất thiết kế (bước 1, chỉ đọc)

Ngày 20/11/2026. Code đọc: `origin/main` 1e712e19 (worktree `wt-bdk-mo-dun`, không sửa). Script đo + đầu ra:
`genbid-work\dieu-phoi\dau-vao\bdk-mo-dun\` (`hang-bdk.mjs/.txt`, `do-ctl-comm.mjs/.txt`, `ca-goc.mjs/.txt`).
Kết quả Gợi ý đã lưu đọc từ `genbid-work\doc-cache\configmatch.json` (bản chụp 18/11, 16 gói); Phân tích từ
`doc-cache\analysis.json` (1.298 gói có `technicalSpecs`); chữ HSMT từ `genbid-work\specs` (1.499 gói).

## 0. Câu hỏi cần Khoa quyết (mỗi câu có khuyến nghị)

**Q1. Vì sao DSE7320 MKII + DSE890 MKII là đáp án đúng chứ không phải DSE7420 MKII (+ DSE890 MKII)?**
Theo datasheet đã lưu, DSE7420 MKII có mọi cổng của DSE7320 MKII và thêm Ethernet (mục 3.3). Chấm bằng số chức năng đạt
(luật hiện hành của `scoreOf`), DSE7420 MKII + DSE890 MKII luôn bằng hoặc hơn DSE7320 MKII + DSE890 MKII; hệ thống sẽ
KHÔNG ra đúng cặp Khoa nêu, trừ khi có tiêu chí khác. Các khả năng:
- (a) Rẻ hơn / đủ dùng (giá không vào xếp hạng: Khoa đã bỏ "đưa giá vốn vào xếp hạng"). → Hệ thống ra 7420 + 890, Khoa coi là chấp nhận được.
- (b) Luật "đủ thì thôi": cặp nào đạt hết yêu cầu HSMT thì ngang nhau, ưu tiên cặp có bộ điều khiển NCC chào phổ biến hơn / đời thấp hơn.
- (c) Khoa chấp nhận cả hai, hiện cặp kia thành "phương án bộ điều khiển khác" trong cùng cấu hình (không chiếm chỗ trong 8 cấu hình).
- **Khuyến nghị: (c)**, chấm và xếp theo cặp tốt nhất; hiện dòng "Phương án khác đạt tương đương: DSE7320 MKII + DSE890 MKII" khi cặp đó cũng không có "không đạt". Ca kiểm IB2600603983 được tính đúng khi DSE7320 MKII + DSE890 MKII xuất hiện (cặp chính hoặc phương án khác).

**Q2. Cổng Ethernet của mô-đun (DSE890 có cổng Ethernet) có tính là "Cổng kết nối tiêu chuẩn: … Ethernet" của bộ điều khiển không?**
HSMT ghi cổng ở mục bộ điều khiển. Gateway nối bộ điều khiển qua RS485 / Ethernet rồi ra mạng; cổng Ethernet của gateway không phải cổng Modbus TCP của bộ điều khiển.
**Khuyến nghị: không tính** (Ethernet của bộ điều khiển chỉ đạt khi datasheet bộ điều khiển ghi). 4G / Internet / GSM / SMS / giám sát từ xa thì tính theo mô-đun.

**Q3. "BMS" HSMT ghi: dòng nguồn nào thì tính đạt?** Không datasheet đã lưu nào có chữ "BMS". DSE7420 MKII ghi "Integrated Ethernet port providing Modbus TCP, SNMP v2c"; trang ComAp CM3-Ethernet (chưa lưu, mô tả trong kết quả tìm kiếm) ghi tích hợp BMS qua Modbus và SNMP.
**Khuyến nghị:** đạt khi dòng nguồn ghi chữ BMS / building management, HOẶC ghi Modbus (RTU/TCP) / BACnet / SNMP và HSMT chỉ ghi "BMS" trơ (không nêu giao thức); ghi chú "BMS qua Modbus/SNMP, cần NCC xác nhận" (vào bảng câu hỏi RFQ). Nếu Khoa muốn chặt: chỉ đạt khi nguồn có chữ BMS → 8/8 cấu hình ở các gói đã lưu vẫn "chưa rõ" BMS.

**Q4. Mô-đun hệ thống tự thêm (NCC chưa chào) có được làm cấu hình "đạt" không, hay chỉ "đạt, cần NCC xác nhận" (trạng thái `confirm`)?**
**Khuyến nghị:** chức năng nhờ mô-đun là `met` + cờ `viaModule` (không bị phạt khi xếp hạng như "chưa rõ"), nhưng LUÔN có một dòng RFQ "Chào kèm mô-đun X (mã đặt hàng Y) cho bộ điều khiển Z" và nhãn trên thẻ "Mô-đun chọn theo tài liệu hãng, NCC chưa chào". Vì mô-đun là phụ kiện mua rời (DSE890 có mã đặt hàng riêng 0890-04), không phải đổi model.

**Q5. Có sửa luôn lỗi chấm lỏng đang có không (mục 1.4: DSE7320 "đạt Internet/5G" chỉ nhờ dòng "DSE890 MKII | DSEWebNet® Gateway")?**
**Khuyến nghị: có, trong PR 2** (code kiểm chữ của chức năng con trong câu trích). Hệ quả đo trước: IB2600601812 sẽ tụt từ "Đạt 4/4" về 3/4 ở 4 cấu hình cho tới khi có datasheet mô-đun (5G: không nguồn nào ghi 5G).

**Q6. Hãng chưa có datasheet bộ điều khiển (DEIF, Woodward, Datakom, SICES: 0 bảng) có làm mô-đun không?**
**Khuyến nghị: không ở việc này.** Không có datasheet bộ điều khiển thì không chấm được chức năng nào; mô-đun đứng sau. Ghi việc riêng "lưu datasheet bộ điều khiển 4 hãng" nếu Khoa muốn.

## 1. Hiện trạng dữ liệu

### 1.1 Datasheet bộ điều khiển đã lưu (`suppliers/cn/*.json`, `role: controller_maker`)
| Hãng | Bảng | Dòng mô-đun / phụ kiện truyền thông trong datasheet bộ điều khiển |
|---|---|---|
| Deep Sea (`deep-sea-electronics`) | 11 (n1001–1011) | n1001 (DSE7310/7320 MKII), n1003 (DSE7410/7420 MKII), n1004 (DSE8610 MKII), n1005 (DSE8660 MKII): "\| DSE890 MKII \| DSEWebNet® Gateway \| 0890-04". n1002 (DSE6110/6120 MKIII) và n1005: "\| DSE890 MKII \| DSEWebNet® / IoT Gateway - 4G (GSM/Ethernet) \| 0890-04", "\| DSE891 MKII \| DSEWebNet® / IoT Gateway - Ethernet Only \| 0891-04". n1006–1011 (DSE3110, 6010/20, 4520, 4610/20, 8620, 7210/20): không dòng mô-đun nào. |
| ComAp (`comap`) | 12 (n1001–1013) | InteliLite 4 AMF8 / AMF9 / AMF20 / AMF25 / MRS16, InteliGen NTC / 500 G2 / 4-200: "\| CM2-4G-GPS \| 4G & GPS plug-in communication module \| CM24GGPSXBX", "\| CM3-Ethernet \| Internet / Ethernet plug-in communication module \| CM3ETHERXBX", "\| CM-RS232-485 \| Dual port (RS232 & RS485) …". InteliGen NT / NTC: "InternetBridge-NT \| Multiple Internet connections (PC and Modbus) …". InteliGen 1000: CM-4G-GPS, InteliGateway 100/101/300/301 ("… with 4G cellular connectivity"). |
| SmartGen (`smartgen`) | 3 (HGM6100N, HGM6100U, HGM9510) | Không có dòng mô-đun. HGM9510: bảng so sánh "\| ETHERNET \| ●", "\| GSM \| ●" mất cột model (một dấu ● cho bảng 10 cột) → không gán được cho model nào. |
| DEIF, Woodward, Datakom, SICES | 0 | Chỉ có trang nơi sản xuất (nguồn 6001+) / trang chủ. |

### 1.2 Mô-đun: có datasheet riêng chưa? → CHƯA mô-đun nào
Mọi mô-đun trên chỉ có MỘT dòng tên (+ mã đặt hàng) trong datasheet của bộ điều khiển. Chức năng kiểm được từ dòng đó:
- DSE890 MKII: "4G (GSM/Ethernet)", "IoT Gateway" — CHỈ ở n1002 / n1005 (datasheet DSE6110/6120 MKIII, DSE8660 MKII); trong datasheet DSE7320 MKII (n1001) và DSE7420 MKII (n1003) chỉ có "DSEWebNet® Gateway" (không chữ 4G, không Internet). Không câu nào ghi điều khiển từ xa (đóng / mở máy), Modbus, BMS.
- DSE891 MKII: "Ethernet Only".
- ComAp CM2-4G-GPS: "4G & GPS"; CM3-Ethernet: "Internet / Ethernet"; dòng chung "Extendable options including 4G/GPS, Ethernet and RS485/RS232", "Support of Modbus RTU/TCP, SNMP v1/v2c/v3", "Monitoring via WebSupervisor, InteliSCADA, …, active SMS and e-mails".
- Chưa có nguồn: điều khiển từ xa qua 4G (khởi động / dừng), giao thức BMS, số bộ điều khiển một gateway nối được, 5G.

### 1.3 Trang hãng cần lưu thêm (URL lấy từ kết quả tìm kiếm WebSearch 20/11/2026, CHƯA mở / CHƯA lưu)
| Mô-đun | URL | Ghi chú |
|---|---|---|
| DSE890 MKII | https://www.deepseaelectronics.com/genset/remote-communications-overview-displays/dse890-mkii/downloads/datasheet | dạng URL Deep Sea trong `config-suggest.md` ("<trang model>/downloads/datasheet") |
| DSEWebNet (tổng quan) | https://www.deepseaelectronics.com/genset/remote-communications-overview-displays/dsewebnetr/downloads/datasheet | để có câu về điều khiển / giám sát từ xa |
| DSE891 MKII | chưa có URL trong kết quả tìm kiếm | tìm lại |
| ComAp CM2-4G-GPS | https://www.comap-control.com/products/communications/cm2-4g-gps/ | trang có link datasheet (ComAp `/productfile/<id>`) |
| ComAp CM3-Ethernet | https://www.comap-control.com/products/communications/cm3-ethernet/ | mô tả tìm kiếm nói có BMS qua Modbus / SNMP: phải đọc từ trang đã lưu mới dùng |
| SmartGen CMM366-4G | http://www.smartgen.com.cn/data/download/CMM366-4G_en.pdf | mô-đun 4G nối bộ điều khiển qua RS485 |
| SmartGen CMM366A-4G | https://www.smartgen.com.cn/data/download/CMM366A-4G_en.pdf | |
| SmartGen HGM6100N-4G (bộ điều khiển có sẵn 4G) | https://www.smartgen.cn/data/download/HGM6110N-4G_6120N-4G_6110CAN-4G_6120CAN-4G_en.pdf | là bộ điều khiển, không phải mô-đun; regex `HGM…(-4G)` của `catalog.js` đã nhận |
| SmartGen SGUE485 | http://www.smartgen.cn/product.php?cat_id=63&product_id=191 | USB → RS485, không phải 4G |
Lưu bằng `maker-datasheets.mjs <id> <pdf>` (PDF) / `fetch-source.mjs` → `merge-specs.mjs` → `verify.mjs` (PR dữ liệu riêng, PR 1 dưới).

### 1.4 Phát hiện: cách chấm hiện nay KHÔNG nhất quán và có chỗ lỏng
- IB2600601812 (HSMT "Điều khiển từ xa qua cổng Internet/5G"): agent cho DSE7320 **met** với `factSrc` = dòng "| DSE890 MKII | DSEWebNet® Gateway | 0890-04" (offered "Qua bộ DSE890 MKII (DSEWebNet)"), và AMF9 / AMF25 **met** với dòng "| CM3-Ethernet | Internet / Ethernet plug-in communication module". Không dòng nào có chữ 5G hay 4G; mô-đun không có trong cấu hình; `check` cho qua vì nó chỉ kiểm câu trích nằm trong datasheet của model, không kiểm câu có nói đúng chức năng.
- IB2600603983: cùng DSE7320, cùng datasheet n1001 → "Internet/4G" **unclear**.
→ Kết quả phụ thuộc lượt agent. Đây là lý do chính cần đưa mô-đun thành phần tử có tên trong cấu hình và để code kiểm.

### 1.5 Ngoài phạm vi, ghi lại
IB2600603983 các cấu hình Deep Sea chỉ "Đạt 3/12" đo lường, "1/13" bảo vệ, "0/8" cảnh báo dù datasheet có các chức năng đó (nghi agent dừng kiểm sớm / `ctl-lookup.md` không bắt chữ tiếng Việt của từng phần). Nên mở việc riêng; không sửa ở đây.

## 2. HSMT đòi gì (đo)
**(A) Phân tích đã lưu** (`do-ctl-comm.txt`): 1.298 gói có `technicalSpecs`, **505 gói** có dòng mã `ctl_comm`. Chức năng con (một gói có thể đếm nhiều mục):
| Chức năng con | Số gói |
|---|---|
| RS485 | 239 |
| USB | 225 |
| Giám sát / điều khiển từ xa (chữ chung) | 222 |
| Modbus | 168 |
| RS232 | 81 |
| 4G / GSM / GPRS / SMS | 77 |
| Internet / web / IoT / cloud | 71 |
| Ethernet / LAN / TCP | 61 |
| BMS / SCADA | 40 |
| CAN / J1939 | 20 |
| SNMP | 15 |
**4G hoặc Internet: 113 gói; một trong 4G / Internet / Ethernet: 149 gói** (11,5% các gói có Phân tích). (B) quét chữ HSMT 1.499 gói ra cùng bậc (4G 124, Ethernet 107, Internet 49; dòng ngoài bộ điều khiển cũng bị đếm nên chỉ để đối chiếu).

**(C) configmatch đã lưu** (16 gói, 23 cấu hình có yêu cầu ctl_comm ở 5 gói): phần không đạt đều là "chưa rõ" (0 "không đạt"):
| Phần chưa rõ | Số cấu hình |
|---|---|
| 4G / Internet / 5G (điều khiển từ xa qua Internet) | 10 |
| BMS | 8 |
| Cổng kết nối với hệ thống kiểm soát từ xa (chữ chung) | 7 |
| Ethernet | 5 |
| Phần mềm PC tải miễn phí từ website hãng | 5 |
| RS232 / RS485 | 2 / 2 |
| USB | 1 |
Ca IB2600603983 (8 cấu hình): 4G unclear ở 8/8, BMS 8/8; DSE7420 / DSE8610 5/7, DSE7320 3/7, DSE6120 1/7, không BĐK 0/7.

## 3. Thiết kế

### 3.1 Dữ liệu mô-đun
- Datasheet mô-đun lưu vào hồ sơ hãng bộ điều khiển (`deep-sea-electronics`, `comap`, `smartgen`) như bảng "Datasheet: DSE890 MKII …" (số nguồn 1001+). Không tạo hồ sơ NCC mới.
- `modelFacts`: thêm khoá `module:<KEY>` (cạnh `controller:<KEY>`). Mô-đun nhận diện bằng danh sách cố định `COMM_MODULES` (DSE890 MKII, DSE891 MKII, CM2-4G-GPS, CM3-Ethernet, CM-RS232-485, CM-4G-GPS, InternetBridge-NT, CMM366-4G, CMM366A-4G…), mỗi mục `{ make, model, re }`. KHÔNG đưa vào `controllersIn` (regex Deep Sea `[3-8]\d{3}` đã không nhận DSE890; giữ như vậy để mô-đun không thành bộ điều khiển trong danh mục).
- Nguồn của một fact mô-đun: (i) mọi dòng của datasheet riêng của mô-đun; (ii) dòng tên mô-đun trong datasheet bộ điều khiển (n1002 "4G (GSM/Ethernet)") — fact của mô-đun, không phải của bộ điều khiển trong tiêu đề.
- **Tương thích** (code kiểm, không suy ra): cặp (bộ điều khiển X, mô-đun M) chỉ hợp lệ khi (a) datasheet của X có dòng tên M (DSE7320 MKII n1001 có DSE890 MKII; AMF25 n1001 có CM2-4G-GPS), hoặc (b) datasheet riêng của M có dòng tên X. Không có → không ghép. Đời: X ghi không đời (DSE7320) dùng datasheet đời hiện hành như `factsFor` đang làm (vẫn gắn "cần xác nhận đời").

### 3.2 Kết quả: `controller.modules[]`
```json
"controller": { "model": "DSE7320", "make": "Deep Sea", "src": {…},
  "modules": [{ "model": "DSE890 MKII", "make": "Deep Sea", "order": "0890-04",
    "compat": { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| DSE890 MKII | DSEWebNet® Gateway | 0890-04" },
    "offeredBy": null, "why": ["4G", "Internet"] }] }
```
- `offeredBy: null` = NCC chưa chào → web và RFQ ghi "Mô-đun chọn theo tài liệu hãng, NCC chưa chào". Có NCC nào ghi mô-đun trên trang của họ (hiếm; không đo được vì danh mục chưa đọc mô-đun) thì ghi `supplierId`.
- Chỉ thêm mô-đun khi nó làm ít nhất một phần `ctl_comm` từ chưa rõ / không đạt thành đạt; tối đa 2 mô-đun mỗi bộ điều khiển (mỗi hãng một loại 4G + một loại Ethernet/RS là đủ cho mọi tổ hợp đo được).

### 3.3 Chấm `ctl_comm` theo cặp
- Mỗi phần (part) của check ctl_comm có `factSrc` + thêm `factOf: "controller" | "module:<model>"`. `check` tìm fact trong `factsOf(controller)` hoặc `module:<model>` tương ứng; mô-đun không có trong `controller.modules` hoặc không qua kiểm tương thích → "factSrc không phải dòng ghi thông số…" → unclear (như hiện nay).
- **Kiểm chữ của chức năng (mới, áp cả cho bộ điều khiển trơn, sửa lỗi 1.4)**: phần ctl_comm có từ của chức năng con (bảng `SUB` trong `do-ctl-comm.mjs`: 4G/5G/GSM, Internet/web/cloud, Ethernet, RS485, RS232, USB, BMS, Modbus, SNMP, CAN) chỉ được `met` khi câu trích có từ tương ứng (4G ↔ `4G|LTE|cellular`; 5G chỉ `5G`; Internet ↔ `internet|web|cloud|IoT|remote`; BMS theo Q3). Thiếu → unclear + gợi ý dòng (`hintFor`).
- Theo Q2: Ethernet / RS232 / RS485 / USB của bộ điều khiển chỉ lấy từ fact của bộ điều khiển; 4G / Internet / GSM / SMS / giám sát từ xa nhận cả fact mô-đun.
- `scoreOf` không đổi (đếm từng phần). Hoà điểm: cặp không mô-đun đứng trước cặp có mô-đun.

**Căn cứ so DSE7320 MKII + DSE890 MKII với DSE7420 MKII (chỉ từ datasheet đã lưu, chưa có datasheet DSE890):**
| Phần HSMT IB2600603983 | DSE7320 MKII (n1001) | DSE7420 MKII (n1003) | DSE890 MKII (dòng tên) |
|---|---|---|---|
| RS232 | "\| RS232 \| 1 Modbus RTU Port" | "\| RS232 \| 1 Modbus RTU Port" | — |
| RS485 | "\| RS485 \| 1 Modbus RTU Port" | "\| RS485 \| 1 Modbus RTU Port" | — |
| USB | "\| USB B \| 1 Programming Port" | "\| USB A \| 1 Data Storage Port", "\| USB B \| 1 Programming Port" | — |
| Ethernet | không dòng nào | "\| Ethernet \| 1 10/100 Ethernet Port", "Integrated Ethernet port providing Modbus TCP, SNMP v2c and in built web SCADA support" | "4G (GSM/Ethernet)" (chỉ ở n1002 / n1005) |
| Internet / 4G | không | không (chỉ "web SCADA" qua Ethernet) | "4G (GSM/Ethernet)", "IoT Gateway" |
| BMS | không chữ BMS | không chữ BMS (Modbus TCP, SNMP: tuỳ Q3) | không |
Kết luận theo nguồn: 7420 MKII ⊇ 7320 MKII về cổng; DSE890 MKII ghép được với CẢ HAI (cả n1001 và n1003 có dòng DSE890 MKII). Không có câu nguồn nào cho DSE7320 + DSE890 đứng trên DSE7420 (+ DSE890) → Q1.

**Luật chọn giữa các bộ điều khiển NCC chào (đề xuất):**
1. Ứng viên bộ điều khiển của một cấu hình = bộ điều khiển dòng tổ máy ghi + bộ điều khiển NCC của dòng đó có hồ sơ chào (như nay) + (MỚI) bộ điều khiển cùng hãng, có datasheet, mà một NCC khác cùng động cơ chào. Không thêm bộ điều khiển hãng không NCC nào chào cho động cơ đó.
2. Chọn cặp (bộ điều khiển, mô-đun 0–2) có ít "không đạt" rồi ít "chưa rõ" nhất trên mọi yêu cầu bộ điều khiển (không chỉ ctl_comm); hoà thì: HSMT nêu hãng / model → NCC của cấu hình chào → không mô-đun → thứ tự agent.
3. HSMT nêu đích danh model bộ điều khiển → chỉ model đó (luật hiện có), mô-đun vẫn được ghép.
4. Agent làm bước 1–2 trong lượt (prompt); code chỉ kiểm (3.3) và xếp. Không để code tự điền check (Khoa đã bỏ "code điền sẵn check" 16/11).

### 3.4 Hiển thị
- **Web (thẻ cấu hình, `web/index.html` `cfgResultHtml` / `part`)**: dòng "Bộ điều khiển: DSE7320 (Deep Sea) + mô-đun DSE890 MKII (mã 0890-04)" và nhãn `chip warn` "Mô-đun chọn theo tài liệu hãng, NCC chưa chào" khi `offeredBy` null; tiêu đề thẻ (`parts` dòng 4254) thêm "+ DSE890 MKII". Ô "Cấu hình chào" của phần đạt nhờ mô-đun ghi "(qua DSE890 MKII)". Theo Q1(c): dòng "Phương án khác đạt tương đương: …" dưới bộ điều khiển.
- **Bảng câu hỏi RFQ (`rfqOf`, tier 1 "Hãng / model / xuất xứ")**: thêm một dòng mỗi mô-đun: "Bộ điều khiển DSE7320: chào kèm mô-đun DSE890 MKII (0890-04) để đáp ứng: Điều khiển từ xa qua Internet/4G; xác nhận tương thích, gửi datasheet". `ask` cho phần `viaModule` đổi thành câu đó, không lặp "gửi datasheet" chung.
- Đây đều là phần PHẢI LÀM MỚI; hiện web / RFQ không có chỗ nào cho mô-đun.

## 4. Tệp sửa, chia PR, cách đo, chi phí

| PR | Nội dung | Tệp | Phụ thuộc |
|---|---|---|---|
| 1 (dữ liệu) | Lưu datasheet DSE890 MKII, DSE891 MKII, DSEWebNet, ComAp CM2-4G-GPS, CM3-Ethernet, CM-RS232-485, SmartGen CMM366-4G (URL mục 1.3) | `suppliers/cn/{deep-sea-electronics,comap,smartgen}.json`, `suppliers/sources/<id>/10xx.md`, `datasheets/` | không; làm song song được |
| 2 (code chấm) | `COMM_MODULES`, fact `module:<KEY>` + kiểm tương thích trong `modelFacts`; `controller.modules[]` trong `check`; kiểm chữ chức năng con của ctl_comm (sửa 1.4); hoà điểm "không mô-đun trước"; test mới `ctl-module.test.mjs` | `suppliers/config-bot.mjs` (modelFacts, check, factsOf, hintFor, ctlLineFor), test | SAU PR #963 (đang sửa config-bot.mjs) và hai việc xếp trước (tỉ số nén, đầu phát theo datasheet hãng) |
| 3 (agent) | `catalog.md` / `controllers.md` thêm mục "Mô-đun truyền thông (datasheet hãng)" cho hãng của các bộ điều khiển đã liệt kê; `ctl-lookup.md` dò cả dòng mô-đun; prompt đoạn Controller: luật chọn 3.3, cách ghi `modules[]` và `factOf`; luật chọn bộ điều khiển theo HSMT (3.3 mục 1) | `config-bot.mjs` (catalogMd, ctlLookupMd), `config-prompt.md`, `check-prompt.md` nếu có đoạn bộ điều khiển | PR 2 |
| 4 (web + RFQ) | thẻ cấu hình, nhãn, phương án khác, `rfqOf` | `web/index.html`, `suppliers/config-bot.mjs` (`rfqOf`) | PR 2 (dạng dữ liệu) |

**Đo (không tốn agent, PR 2):**
- Chạy lại `check` bằng code mới trên mọi `configmatch` đã lưu (16 gói, theo `suppliers/CLAUDE.md`: gỡ check byCode trước khi đo): đếm phần ctl_comm met → unclear do kiểm chữ chức năng (dự kiến: IB2600601812 4 cấu hình mất "Internet/5G" met), không phần nào unclear → met nếu không có `modules`.
- `node --test suppliers/regress-config.test.mjs`: 5 lượt đóng băng không có check ctl_comm (đã đếm: 0 lần "Truyền thông, giám sát từ xa" trong `config.expected.json`) → không đổi là đúng; thêm một fixture IB2600603983 mới có ctl_comm khi PR 3 chạy lượt thật.
- Ca kiểm: chạy Gợi ý thật IB2600603983 sau PR 3 (1 lượt, ~3 USD): có cấu hình Baudouin 6M31G825/5 với DSE7320 MKII + DSE890 MKII (chính hoặc phương án khác theo Q1), 4G met có câu trích từ datasheet DSE890.
- Đo trên toàn bộ: 113 gói đòi 4G / Internet (mục 2) là tập chịu ảnh hưởng; không chạy agent cho cả tập, chỉ đo `catalogMd` (kích thước `catalog.md` / `controllers.md` thêm bao nhiêu) bằng `prep` trên ~20 gói trong tập.

**Chi phí token agent (ước tính, chưa đo):** mục mô-đun trong `controllers.md` (agent grep, không đọc trọn) ~30–60 dòng mỗi mô-đun, `catalog.md` thêm ~15 dòng mỗi hãng; agent thêm 1–3 lượt grep + ghi `modules[]`. Ước +2–6 nghìn token vào mỗi gói có ctl_comm đòi 4G / Internet / Ethernet (~11% gói), tức ≈ +0,03–0,10 USD trên ~3 USD/gói; gói khác không đổi (mục chỉ in khi HSMT có chức năng con đó). Đo thật ở PR 3 bằng log `%TEMP%\genbid-config-<TBMT>.log`.

## 5. Rủi ro
- Mô-đun bị agent thêm tràn lan (mọi cấu hình gắn DSE890) → giới hạn: chỉ thêm khi có phần ctl_comm chưa đạt mà mô-đun làm đạt, code bỏ mô-đun không làm đổi phần nào.
- DSE890 MKII: kết quả tìm kiếm có nhắc hạn chế dùng 4G ở EU/EEA từ 1/8/2025 (hướng dẫn lắp đặt; CHƯA đọc trang đã lưu). Gói VN không chịu luật EU; ghi lại để biết, không đưa vào luật.
- Kiểm chữ chức năng con có thể hạ "đạt" ở cả gói không liên quan mô-đun (USB / RS485 trích câu chung "remote communications") → đo trước/sau ở PR 2 rồi mới bật.

## Cần ghi nhớ
- Chưa có quyết định mới của Khoa ở bước này; chờ Q1–Q6.
- Việc ngoài phạm vi đề xuất mở: (i) chức năng đo lường / bảo vệ / cảnh báo Deep Sea "chưa rõ" hàng loạt ở IB2600603983 (1.5); (ii) datasheet bộ điều khiển DEIF / Woodward / Datakom / SICES (0 bảng).
