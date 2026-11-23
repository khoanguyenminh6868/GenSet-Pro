# baifa: 3 điểm lộ ra sau PR #1101 (chỉ đếm, chưa sửa gì)

Ngày 23/11/2026. Đo trên nhánh `fix/baifa-header-rows` (SHA f713a80f, gốc origin/main 2ba6c3b2), toàn bộ 436 hồ sơ `suppliers/cn`.
Không có thay đổi mã nào từ việc này; PR #1101 không thêm gì.

## 1. Luật "prime = 0,8 × standby cùng đơn vị là kW / kVA đặt nhầm tiêu đề"

Chỗ trong mã: `web/catalog.js`, `titledPowers`, dòng `return { veto: true }`. Điều kiện hiện tại: prime và standby nằm dưới CÙNG một
tiêu đề phủ nhiều ô (mỗi mức một đơn vị), ô không tự ghi đơn vị, và prime = 0,8 × standby (sai số 1,1 %). Khi kích hoạt, cả dòng
không tin tiêu đề nữa và hai ô được ghép thành MỘT mức `rated` kVA / kW.

Cách đếm: chạy `fromSupplier` của mọi hồ sơ trên bản chép `catalog.js` có gắn bộ đếm ở đúng dòng đó, ghi lại tiêu đề, tiêu đề con,
ô của dòng và đơn vị của từng mức lấy từ đâu.

Luật kích hoạt ở **1.195 dòng (khác nhau) của 8 NCC**:

| NCC | dòng | tiêu đề phủ | tiêu đề con | đơn vị lấy từ | ví dụ (standby / prime theo tiêu đề) |
|---|--:|---|---|---|---|
| teksan | 1.145 | "Power 9 - 45 kVA 46 - 110 kVA …" | Standby (ESP) ¦ Prime (PRP) | tiêu đề phủ (kVA) | TJ8BD-1: 8 / 6.4, hai ô kế là 7 / 5.6 |
| bdadl-shanghai | 20 | 输出功率(kw) | 主用 ¦ 备用 | tiêu đề phủ (kW) | BDA-50GF: 62.5 / 50 |
| kingway-power | 14 | KVA | ESP ¦ PRP | tiêu đề phủ (kVA) | KGZS38: 42 / 34, hai ô kế là 37.5 / 30 |
| taihai-taizhou | 8 | 输出功率 (kw) | 常用 ¦ 备用 | tiêu đề phủ (kW) | TH-260GF: 325 / 260 |
| xingguang-jiangsu | 3 | Power（kVA） | Standby ¦ Prime | tiêu đề phủ (kVA) | XG2500S3: 2500 / 2000 |
| baifa-power | 2 | POWER | Standby KVA ¦ Prime KVA | **tiêu đề con, cả hai tự ghi KVA** | BF-C2500Q-T2: 2500 / 2000 |
| yingtai-jiangsu | 2 | 功率（KW） | 主用 ¦ 备用 | tiêu đề phủ (kW) | 1600GF: 2000 / 1600 |
| walter-yangzhou | 1 | Power（kVA） | Standby ¦ Prime | tiêu đề phủ (kVA) | WET-WC63: 63 / 50 |

Trả lời câu hỏi "tiêu đề hai cột đều ghi rõ KVA (kiểu Standby KVA / Prime KVA)": đúng kiểu đó (mỗi cột tự ghi đơn vị ở tiêu đề của
chính nó) chỉ có **2 dòng, đều của baifa**:

- `| BF-C2500Q-T2 | 2500 | 2000 | QSK60-G18 | | S7L1D-G41 | TIER 2/ CHINA STAGE3 | UK` (n101 b1): là 1 trong 31 dòng mới của #1101.
  30 dòng mới còn lại KHÔNG dính.
- `| BF-BD38-T3 | 37.5 | 30 | 4M08G8D3/5 | | STAGE 3A/ CHINA STAGE3 | CHINA` (n101 b1): dòng đã có từ trước #1101, đang đọc
  `rated 37.5 kVA / 30 kW` trên main.

1.193 dòng còn lại lấy đơn vị từ tiêu đề phủ chung. Trong đó 1.163 dòng (teksan, kingway, xingguang, walter) có tiêu đề phủ ghi kVA
cho cả hai cột; chúng KHÁC kiểu baifa ở chỗ đơn vị không nằm trên từng cột.

### Đề xuất điều kiện sửa

Không veto khi đơn vị của CẢ prime lẫn standby đều lấy từ tiêu đề con của chính cột đó (tiêu đề con tự ghi "KVA" / "KW").
Lý do: luật sinh ra cho bảng mà một tiêu đề phủ ghi một đơn vị cho hai cột (bdadl "输出功率(kw)" trên "主用 | 备用" mà số là
kW và kVA). Khi từng cột tự ghi đơn vị thì nguồn đã nói rõ hai lần.

Đo điều kiện này trên toàn bộ hồ sơ (so mọi bản ghi `fromSupplier` trước ↔ sau): **3 bản ghi đổi, 1 NCC (baifa), chỉ đổi trường
công suất, 0 bản ghi thêm / mất, 0 NCC khác đổi**:

| bản ghi | trước | sau |
|---|---|---|
| baifa n101 b1 động cơ QSK60-G18 | rated 2500 kVA / 2000 kW | standby 2500 kVA, prime 2000 kVA |
| baifa n101 b1 đầu phát S7L1D-G41 (cùng dòng) | rated 2500 kVA / 2000 kW | standby 2500 kVA, prime 2000 kVA |
| baifa n101 b1 động cơ 4M08G8D3/5 | rated 37.5 kVA / 30 kW | standby 37.5 kVA, prime 30 kVA |

Điều tôi KHÔNG biết: hai dòng baifa này nguồn ghi đúng hay gõ nhầm. Mọi dòng khác của bảng có prime ≈ 0,91 × standby, riêng hai
dòng này đúng 0,8. Đọc theo tiêu đề là giữ số nguồn; nó không chứng minh số nguồn đúng.

Chưa đo: phương án rộng hơn "tiêu đề phủ ghi kVA cho cả hai cột thì cũng không veto" (đụng 1.163 dòng của teksan, kingway,
xingguang, walter). Tôi không đề xuất phương án đó: dòng teksan và kingway có hai ô số kế tiếp cũng theo tỉ lệ 0,8, cần soát từng
bảng trước.

## 2. Mã đầu phát mang tiền tố của một hãng nhưng bản ghi mang hãng khác

Cách đếm: mọi bản ghi `kind: alternator` của `fromSupplier` (13.330 bản ghi). Mã thuộc ba họ dưới đây: 5.333 bản ghi. Bảng tiền tố →
hãng là hiểu biết chung về dòng sản phẩm, KHÔNG lấy từ nguồn NCC nào, chỉ dùng để đếm:

- LSA…, TAL-A… → Leroy-Somer
- UCI / UCDI / UCM…, HCI / HCM / HCK…, PI + 3 số, S0L…–S9L… → Stamford
- ECO…, ECP… → Mecc Alte

Kết quả: **39 bản ghi ở 4 NCC, 5 bảng**; cả 39 đều nhận hãng ở mức "tiêu đề cột" (không ca nào từ dòng bảng hay tên trang):

| NCC | bảng | bản ghi | mã | hãng đang gán | tiêu đề cột |
|---|---|--:|---|---|---|
| kaihua-genset | n119 b23, n127 b33 | 26 | TAL-A42-H, TAL-A44-C / D / E / H / J, TAL-A46-D / F, LSA52.3 UL16, LSA 53.2M9, LSA 53.2M12, LSA 54.2L14 | Stamford | "Alternator Stamford" |
| baifa-power | n101 b1, n101 b3 | 6 | LSA52.3 UL16, LSA 53.2M12, LSA 54.2L14, LSA 53.2M9 | Stamford | "STAMFORD" (dòng tiêu đề con dưới "ALTERNATOR") |
| sr-genset | n2009 b13 | 4 | TAL-A40-F, TAL-A42-C, TAL-A40-G | Stamford | "Alternator" (dòng ghi "SOL2-G1 ¦ TAL-A40-F": hai mã, hai hãng) |
| penlucky | n103 b4 | 3 | PI734E1, PI734F1, PI734G1 | Leroy-Somer | "Alternator Leroy-Somer" |

Trong 6 bản ghi baifa, 1 là của dòng mới từ #1101 (`LSA52.3 UL16`, dòng BF-C3000Q-T2); 5 bản ghi kia có sẵn trên main.
Họ Mecc Alte: 0 ca.

Chưa đo hệ quả ở `build()` (hãng của khoá đầu phát theo số đông) và ở Gợi ý. Chưa đề xuất luật sửa: cần Khoa quyết có cho mã thắng
tiêu đề cột hay không, vì bảng tiền tố không có nguồn NCC.

## 3. 5 dòng Perkins 5006AC / 5008AC của baifa (không model tổ máy)

Dòng nguồn (n101 b1), ô model tổ máy là "TBA" ở dòng đầu, bốn dòng sau trống (ô gộp trên trang):

```
| TBA | | 750 | 5006AC-E23TAG1 | | TBA | TIER 2 | TBA
| | 800 | 5006AC-E23TAG2 | | TIER 2 | TBA
| | 909 | 5008AC-E30TAG1 | | TIER 2 | TBA
| | 1011 | 5008AC-E30TAG2 | | TIER 2 | TBA
| | 1124 | 5008AC-E30TAG3 | | TIER 2 | TBA
```

Bản ghi: chỉ có bản ghi động cơ; không tổ máy, không đầu phát, chỉ `prime` kVA (750 / 800 / 909 / 1011 / 1124), không standby, không
tần số, khí thải "TIER 2", không hãng trên bản ghi (hãng Perkins của khoá đến từ NCC khác: mecca-power, mpmc-powertech, perkins).

Có vào tập ứng viên không: **có**. Gọi `candidates()` với toàn bộ hồ sơ (bỏ `incomplete`), HSMT đúng công suất prime của từng dòng,
"Tần số: 50 Hz":

| dòng | HSMT không nêu hãng: hạng trong `all` / điểm | HSMT nêu hãng Perkins: hạng trong `all` / điểm | vào top 30 (nêu Perkins) |
|---|---|---|---|
| 5006AC-E23TAG1, 750 kVA | 1.812 / 1.877, 75 | 308 / 1.877, 375 | không (điểm hạng 30 là 425) |
| 5006AC-E23TAG2, 800 kVA | 1.288 / 1.356, 83 | 218 / 1.356, 383 | **hạng 29** |
| 5008AC-E30TAG1, 909 kVA | 999 / 1.038, 83 | 157 / 1.038, 383 | **hạng 26** |
| 5008AC-E30TAG2, 1011 kVA | 580 / 616, 83 | 86 / 616, 383 | **hạng 19** |
| 5008AC-E30TAG3, 1124 kVA | 1.118 / 1.173, 83 | 174 / 1.173, 383 | **hạng 20** |

Không dòng nào bị loại (`ruled` rỗng). HSMT không nêu hãng thì chúng đứng gần cuối, không tới top 30. HSMT nêu Perkins thì 4 / 5 dòng
vào top 30, là dòng ứng viên không có model tổ máy và không có đầu phát.

Giới hạn của phép đo: hai HSMT giả, trơn (chỉ công suất + tần số, có / không nêu Perkins), không phải 1.093 lượt thật. Hạng trong
top còn tuỳ trần dòng mỗi NCC / mỗi hãng của từng gói. Số chắc chắn phải lấy từ lượt đo cloud của #1101.

Câu cần quyết: dòng không có model tổ máy ("TBA" / ô gộp) có được làm ứng viên không. Hiện không có luật nào chặn.

## Tệp đo

Script và đầu ra đầy đủ nằm ở thư mục tạm của phiên (không vào git): `p1-veto.mjs` + `p1.txt` + `p1-group.txt`, `p2-alt.mjs` +
`p2.txt`, `p3-cand.mjs` + `p3.txt`, `p3b-cand.mjs`. Cần giữ thì báo, tôi chép sang `dau-vao\`.
