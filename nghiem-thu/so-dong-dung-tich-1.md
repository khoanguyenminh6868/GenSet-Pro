# Số đông cho DUNG TÍCH, phương án (c): chặng A (CHỈ ĐO, chưa đổi mã)

Không có PR, chưa sửa tệp nào của repo. Mã đo chạy trên worktree chỉ đọc `C:\Projects\GenSet Pro\wt-so-dong-a` (detached, main `babd36d6`).
Thư mục số liệu: `genbid-work\dieu-phoi\dau-vao\so-dong-dung-tich\`.

## Kết luận ngắn
- Định nghĩa "giống hệt" đề xuất (**C4**): hai NCC có dòng của CÙNG model mà ô kích thước tổ máy (ba số nối `*` / `×` / `x`) giống hệt nhau trong CHỮ dòng nguồn → MỘT phiếu (gộp bắc cầu). Các cách định nghĩa khác (C1–C3, mục 3) hoặc làm mất nhiều giá trị thắng đúng, hoặc không bắt được TAD1341GE.
- **7 nhóm sai đã biết: C4 sửa hết** (MTU 6R1600G70F / G80F, 8V1600G70F / G80F, 10V1600G70F, 12V1600G80F, Volvo TAD1341GE: đều hết giá trị thắng → về luật "mọi nguồn").
- **Không có model nào bị (c) đổi giá trị thắng sang số KHÁC** (0 nhóm "đổi"). (c) chỉ làm hai việc: bỏ giá trị thắng (về luật "mọi nguồn" như main đang làm với dung tích) hoặc tạo giá trị thắng mới ở chỗ trước đây hoà / không đủ phiếu.
- Cái giá: 45 nhóm dung tích có giá trị thắng ĐÚNG (và có nguồn ghi khác) mất giá trị thắng (Yangdong 6 model mà hồ sơ hãng `yangdong` khẳng định, Volvo TAD53x / TAD733GE, Yuchai…). Với dung tích, mất giá trị thắng = y như main hiện tại (main chưa dùng số đông cho dung tích), nên không làm xấu đi so với main.
- Số xi lanh: nếu (c) áp chung cho `majorityOf` thì 2 model đang đúng theo (d) mất giá trị thắng (Jichai H16V190ZL 16 xi lanh, Googol QTA4320G7). **Đề xuất: (c) CHỈ cho dung tích, số xi lanh giữ nguyên (d)** — cần điều phối / Khoa chọn.
- Ảnh hưởng tới top 30: CHƯA ĐO (chặng B).

## 1. Cách đo
Script `dau-vao\so-dong-dung-tich\do-c2.mjs <worktree> do-c2.txt do-c2.json` (bản đầu `do-c.mjs` chỉ có C0–C2, thay bằng do-c2). Đọc số y như `candidates` (`GENBID_SPEC_NORM` bật, cùng `normFig`, cùng cách đọc dung tích `{unit: "L"}` / xi lanh `count` như `winDiff.mjs`): với MỖI dòng của MỌI động cơ trong `suppliers/cn` (6.873 động cơ có dòng, 78.097 lượt dòng × khoá có số), phiếu = facts của động cơ (`modelFacts`) + thông số của chính dòng. So `majorityOf` hiện tại với `majorityOf` khi thay mã NCC bằng mã nhóm (nhóm theo C1 / C2 / C3 / C4 / C0). Đo cả `disp` và `cyl` vì `majorityOf` dùng chung.
- "Đổi hành vi" (cột HV): nhóm mà các nguồn ghi ≥ 2 giá trị (kể cả "không so được"). Nhóm chỉ một giá trị thì có / không có giá trị thắng cho CÙNG kết quả với luật "mọi nguồn", nên không đổi gì trong `candidates`.
- Kết quả: 423 nhóm (model + khoá + kết quả) có ít nhất một cách gộp đổi giá trị thắng; **69 nhóm theo C4 đổi giá trị thắng VÀ đổi hành vi** (2 xi lanh + 67 dung tích; 64 model dung tích khác nhau, YD380D và 4B3.9-G1 có hai nhóm).
- Bảng ĐỦ 69 nhóm (không lấy mẫu): `dau-vao\so-dong-dung-tich\bang-c4.md` (script `bang.cjs`). Chi tiết từng nhóm (mọi dòng nguồn, NCC theo giá trị, các nhóm gộp C1–C4): `do-c2.txt`.

## 2. Định nghĩa "giống hệt" (C4) và vì sao
- Trường dùng: ô kích thước tổ máy trong chữ dòng nguồn (`u.line`, tách ô bằng `CAT.cellsOf`), chuẩn hoá: chữ thường, bỏ dấu cách, `×`/`x` → `*`, bỏ đuôi `mm`; khớp `^\d{3,5}(\.\d+)?\*\d{3,5}(\.\d+)?\*\d{3,5}(\.\d+)?$`. Hai NCC có ít nhất một dòng CÙNG model với ô này giống hệt → cùng nhóm; nhóm bắc cầu (union-find).
- Lý do: kích thước tổ máy là số riêng của nhà lắp ráp (vỏ, khung, bồn), hai nhà độc lập gần như không bao giờ ghi trùng tới từng mm. Số của động cơ (xi lanh, dung tích, đường kính × hành trình) thì NCC độc lập ghi giống nhau là bình thường (chép từ datasheet hãng), nên không dùng được làm dấu hiệu chép bảng.
- Đọc từ chữ dòng, không qua bộ đọc thông số: bộ đọc không nhận được khối lượng ở bảng bdadl (`机组重 量(KG)` tách dòng), nên C3 (kích thước + khối lượng đã đọc) không gộp được nhóm TAD1341GE.
- Các nhóm C4 tìm ra (ngoài bộ ba đã biết): bdadl-shanghai / fukangsi-yangzhou / pengpai-yangzhou / liangzi-yangzhou / huatai-yangzhou; jianghao-genset / kangwo-guangdong / sanq-power / taihai-taizhou; victory-generator / wintpower; rise-power / sdec; frs-shenyang / gtl-power / tellhow-power; aoke-yangzhou / walter-yangzhou / vantek-jiangsu; haifeng-taizhou / taihai-taizhou / meao-jiangsu; jlmech-wuhan / uleengen / yunding-jiangsu. Xem cột "NCC gộp" của `bang-c4.md` (kèm ô kích thước chung).
- Hạn chế: bảng không có ô kích thước thì không bao giờ bị gộp (chép bảng mà bỏ cột kích thước vẫn được tính nhiều phiếu). Bảng mẫu mà NCC tự sửa kích thước thì cũng không bị gộp.

## 3. Các định nghĩa thay thế (đã đo)
Đếm trên các nhóm có đổi hành vi (≥ 2 giá trị) trong 423 nhóm; "mất" = hết giá trị thắng, "mới" = có giá trị thắng mà trước không có, "đổi" = thắng sang số khác.

| Cách | Trường | Dung tích | Xi lanh | 7 nhóm sai | Ghi chú |
|---|---|---|---|---|---|
| C0 | chỉ giá trị đang đếm | mọi giá trị còn 1 phiếu, không ai thắng | như thế | — | suy biến, loại |
| C1 | tập số động cơ {xi lanh, dung tích, D×S, tỉ số nén} giống hệt | mất 63, mới 23 | **mất 10** | sửa 7 / 7 | NCC độc lập chép đúng datasheet hãng bị gộp: hỏng (d) |
| C2 | C1 + dòng có cùng {dầu, tiêu hao, kích thước, khối lượng, ồn, bồn} | mất 18, mới 14 | mất 1 | sửa 6 / 7 (TAD1341GE vẫn 9,36) | fukangsi ghi ≤210 thay ≤202, huatai thứ tự khác → không gộp |
| C3 | kích thước VÀ khối lượng (đã đọc) giống hệt | mất 6, mới 3 | mất 2 | sửa 6 / 7 (TAD1341GE vẫn 9,36) | khối lượng bdadl không đọc được |
| **C4** | ô kích thước (chữ dòng) giống hệt | mất 45, mới 24 | mất 2 | **sửa 7 / 7** | đề xuất |

Không cách nào "đổi" giá trị thắng sang số khác (0 ở mọi cách).
Biến thể có thể làm thêm (chưa đo): C4 nhưng NCC là hãng động cơ (`role: engine_maker`, vd `yangdong`) hoặc datasheet hãng (`sheet: true`) thì không bị gộp và/hoặc thắng thẳng; sẽ giữ được 6 model Yangdong (mục 4b).

## 4. Mọi model C4 đổi kết quả (đủ 69 nhóm, chi tiết + nguồn trong `bang-c4.md`)

### 4a. Sửa đúng: 7 nhóm sai đã biết → hết giá trị thắng
| Model | Trước | Sau | Nhóm gộp | Bên đúng |
|---|---|---|---|---|
| MTU 6R1600G70F, 6R1600G80F | 8,2 (8,2 × 3 : 10,5 × 1) | không | bdadl + fukangsi + pengpai (2500*890*1350) | chưa kiểm được bằng nguồn hãng (không NCC nào ghi D×S; `suppliers/cn` không có datasheet MTU 1600). Lượt trước ghi 10,5 theo hiểu biết hãng, không phải nguồn. |
| MTU 8V1600G70F, 8V1600G80F | 11,6 (11,6 × 3 : 14 × 1) | không | cùng bộ ba (2600*900*1500) | như trên |
| MTU 10V1600G70F | 13,5 (13,5 × 3 : 17,5 × 1) | không | cùng bộ ba (3000*1200*1700) | như trên |
| MTU 12V1600G80F | 23,88 (23,88 × 3 : 21 × 1) | không | cùng bộ ba (3500*1350*1850) | như trên |
| Volvo TAD1341GE | 9,36 (9,36 × 5 : 12,78, 1278, 3,3) | không | bdadl + fukangsi + huatai + liangzi + pengpai (2900*1100*1600) | D×S×z: 131×158×6 = 12,78 L do 5 NCC ghi; 120×138×6 = 9,36 L chỉ huatai ghi. Không có nguồn hãng Volvo trong `suppliers/cn` cho model này. |
Lưu ý MTU 10V1600G80F (17,5 × 4) và 12V1600G70F (21 × 4) KHÔNG nằm trong 69 nhóm vì chỉ một giá trị (bộ ba + wintpower ghi giống nhau).

### 4b. Mất giá trị thắng ĐÚNG (45 nhóm dung tích + 2 xi lanh): về luật "mọi nguồn"
Dung tích (main hiện tại vẫn dùng "mọi nguồn" cho dung tích ⇒ so với main KHÔNG đổi):
- Có nguồn hãng xác nhận giá trị thắng cũ (hồ sơ `yangdong`, role engine_maker, nguồn [9] [12] [13] [16]): Y4100D 3,707; YD380D 1,357 (2 nhóm); YD385D 1,532; YD480D 1,809; YND485D 2,156; YSD490D 2,54. Mất vì victory-generator + wintpower gộp (2250*850*1280 / 1900*730*1130 / 2100*730*1130 / 2250*850*1140).
- Giá trị thắng cũ khớp D×S×z do NCC ghi (phép tính, KHÔNG phải nguồn hãng): Volvo TAD530GE / TAD531GE / TAD532GE 4,76 (108×130×4), TAD733GE 7,15 (108×130×6), TWD1643GE 16,12 (144×165×6); Perkins 1104D-E44TAG2 4,4; SDEC SC13G355D2 12,88, SC9D340D2 8,82; Weichai WP12D317E200 11,596 (126×155×6); Yuchai 4D24G6 / G7 / TG0 / TG2 2,45, YC12VC1680-D31 79,17, YC16VC3000/3300/3600-D31 105,56, YC2115D 2,49, YC4D60-D21 4,214 (có thêm cameo-power ghi 4 xi lanh), YC4D90Z-D21 4,214, YC6A205-D30 7,25, YC6B155L-D20 6,87, YC6C1020L / 1070-D31 / 1070L / 1220L / 1320L 39,58, YC6T550L-D21 16,35.
- Chưa kiểm được (không ai ghi D×S, không nguồn hãng): Baudouin / Weichai 6M33D506E310 19,6 (19,6 × 4; bdadl-shanghai còn một bảng [128] ghi «12.5» cho cùng model nên có hai giá trị; C4 gộp bdadl + pengpai và fukangsi + liangzi → 19,6 × 2); Cummins QSNT-G4X 14 (một NCC ghi 140×152×6 = 14,04: khớp); SDEC 6DTAA8.9-G31 8,9 (một NCC ghi 114×144×6 = 8,82: KHÔNG khớp 8,9; giá trị thắng cũ có thể sai, mất thắng là an toàn).
Xi lanh (đang đúng theo (d), sẽ mất nếu (c) áp cho cả xi lanh):
- Jichai H16V190ZL: 16 × 4 : 12 × 1 (huatai-yangzhou «12») → haifeng + taihai + vantek gộp (6200*1970*2900) → 16 × 2 : 12 × 1, không thắng. Chưa kiểm bằng nguồn hãng (tên model "16V" gợi 16 xi lanh, không phải nguồn).
- Googol QTA4320G7: 16 × 3 : 20 × 1 (taihai-taizhou «20») → fukangsi + huipu gộp (7000*2620*3390) → 16 × 2. Chưa kiểm được.

### 4c. Giá trị thắng MỚI (24 nhóm dung tích): trước hoà / thiếu phiếu, nay thắng
Mọi giá trị mới khớp D×S×z do NCC ghi trừ chỗ ghi rõ (phép tính, không phải nguồn hãng; không model nào có nguồn hãng trong `suppliers/cn`):
- Cummins 4B3.9-G1 (2 nhóm), 4BT3.9-G1, 4BT3.9-G2 → 3,9 (thua: 3,92 = 102×120×4, cùng máy, khác làm tròn); 6BT5.9-G2 → 5,9 (5,88); KTA38-G9 → 37,8 (38; tính 37,88); KTA50-G8 → 50,3 (50; 37,8 × 1 sai; tính 159×159×16 = 50,51); MTAA11-G3 → 10,8 (tính 10,82); QSK19-G11 → 19 (18,9 × 1; **chưa kiểm được**: NCC duy nhất ghi D×S ghi 12 xi lanh, phép tính ra 37,88 vô nghĩa).
- Mitsubishi S12R-PTA-C / PTA2-C / PTAA2-C → 49,03 (49); S16R-PTA2-C / PTAA2-C → 65,37 (65,4); S6R2-PTAA-C → 29,96 (30). Khớp 170×180×12 / ×16, 170×220×6.
- MTU 12V2000G25 → 23,88 (21 × bộ ba): khớp 130×150×12 = 23,89 (4 NCC ghi). Bộ ba ghi 21 là số của 12V1600 chép sang.
- SDEC 6KTAA25-G311 / G33 / G36 / G38 → 25,2 (25, 25,18): khớp 170×185×6 = 25,19; hồ sơ hãng `sdec` ghi «L6» (chỉ số xi lanh).
- Volvo TAD1342GE / TAD1343GE / TAD1344GE → 12,78 (9,36 bộ năm, 4,4 / 3,3 mingbang): khớp 131×158×6.
- Weichai WP10D320E200 → 9,726: hồ sơ hãng `weichai-power` [12] [113] ghi «126×130», 6 xi lanh → 9,73 L (nguồn hãng cho D×S, không cho dung tích trực tiếp).
- Perkins 1106A-70TAG2 có ở C3, KHÔNG ở C4.
Ý nghĩa: các giá trị mới chỉ có tác dụng khi dung tích vào `MAJ_KEYS`; khi đó dòng của các model này bị xét theo giá trị thắng thay vì "mọi nguồn" (có thể bị loại thêm khi HSMT đòi dung tích tối thiểu giữa hai số, vd ≥ 3,91 L với 4BT3.9). Hầu hết hai số chỉ khác làm tròn.

## 5. Trả lời các câu của brief
- 7 nhóm sai: C4 sửa hết (mục 4a). C2, C3 không bắt được TAD1341GE.
- Model đang đúng mà (c) làm SAI (thắng sang số khác): 0. Model đang đúng mà (c) làm MẤT giá trị thắng: 45 dung tích (không đổi so với main) + 2 xi lanh (lùi so với (d) nếu áp chung).
- Định nghĩa: C4 (mục 2); thay thế C0–C3 (mục 3) + biến thể "hãng động cơ không bị gộp".

## 6. Hai điểm trong `pick` (`suppliers/config-bot.mjs`, chỉ phân tích, chưa sửa)
### (1) Thứ tự `CN_ROWS` ↔ `PER_SUPPLIER` (dòng ~1606–1627)
- Cơ chế: khi HSMT không đòi xuất xứ và không nêu hãng, `pick(rows.filter(cn), CN_ROWS = 12)` chạy TRƯỚC lượt chọn chung `pick(rows, max)`, cùng bộ đếm `perSupplier` (`PER_SUPPLIER = 4`). Một NCC có nhiều dòng hãng TQ điểm thấp nhưng vẫn lọt 12 dòng TQ tốt nhất thì tiêu hết 4 suất của nó trong lượt TQ; dòng hãng ngoại điểm cao của chính NCC đó bị chặn ở lượt chung. IB2200065274 (lech-cot-9-2 mục 5.1): fdk-energy 4 dòng SDEC (225/217/213/205) chặn 3 dòng Cummins KTA38 điểm 284 (hạng #0 #1 #3 ở main).
- Phương án (chưa đo, cần top 30 toàn bộ trước khi chọn):
  - (a) Lượt TQ có trần riêng mỗi NCC thấp hơn (vd 2): NCC còn suất cho dòng tốt nhất của mình. Ít đổi nhất; vẫn có thể chặn nếu NCC có > 2 dòng ngoại điểm cao.
  - (b) Dòng chọn ở lượt TQ không tính vào `perSupplier` của lượt chung: NCC có thể có tới 4 + (số dòng TQ) dòng. Đúng ý "suất TQ là suất giữ chỗ" nhưng NCC nhiều dòng lấn top.
  - (c) Đảo thứ tự: lượt chung chọn trước `max − CN_ROWS` dòng, rồi lượt TQ lấp tới 12 dòng TQ: dòng điểm cao luôn vào trước. Đổi nhiều nhất (mọi gói không đòi xuất xứ).
  - Em nghiêng (a) (nhỏ nhất, sửa đúng ca đã thấy). Cả ba đều phải đo top 30 toàn bộ như các PR trước.
### (2) +50 điểm "có bộ điều khiển" không ghi `why` (dòng 1448 `if (offers.length) score += 50`)
- `offers = [...rowCtrl, ...s.controllers]`: bộ điều khiển ghi trong dòng HOẶC trong hồ sơ NCC. Vì phần hồ sơ NCC áp cho MỌI dòng của NCC đó, khoản này thực chất là điểm thưởng cấp NCC; gộp starlight → xingguang (#909) làm 372 dòng lên 50 mà lý do không đổi.
- Đề xuất: thêm `why.push(rowCtrl.length ? "dòng ghi bộ điều khiển" : "NCC có hồ sơ bộ điều khiển")` (hoặc nêu hãng: «bộ điều khiển SmartGen (hồ sơ NCC)»). Không đổi điểm, không đổi top; chỉ đổi chữ "lý do xếp" trong prompt của agent (dòng ~1736) → `regress-config` / test nào so `why` nguyên văn phải cập nhật (chưa kiểm cụ thể test nào). Có thể cân nhắc tách điểm: dòng tự ghi 50, chỉ hồ sơ NCC ít hơn — là đổi điểm, phải đo.

## 7. Lệnh đã chạy + đầu ra thật
- `git diff 37ea072d babd36d6 --stat` → rỗng (gốc `dac-thu-dong-co-2\gop-2b.json` dùng lại được cho chặng B nếu main vẫn `babd36d6`).
- `node do-c2.mjs "C:/Projects/GenSet Pro/wt-so-dong-a" do-c2.txt do-c2.json` → `Động cơ có dòng: 6873; lượt (dòng × khoá) có số: 78097; nhóm model+khoá+kết quả đổi: 423 (disp 214, cyl 209)` (~4 phút).
- Tổng theo cách (chỉ nhóm đổi hành vi): `c1 {"cyl mất":10,"cyl mới":1,"cyl giữ":1,"disp mất":63,"disp mới":23,"disp giữ":29}`; `c2 {"cyl giữ":11,"cyl mất":1,"disp giữ":83,"disp mới":14,"disp mất":18}`; `c3 {"cyl giữ":10,"cyl mất":2,"disp giữ":106,"disp mất":6,"disp mới":3}`; `c4 {"cyl giữ":10,"cyl mất":2,"disp mất":45,"disp mới":24,"disp giữ":46}`; 7 nhóm sai: C1, C4 → null cả 7; C2, C3 → TAD1341GE vẫn 9,36.
- `node bang.cjs ./do-c2.json > bang-c4.md` → 69 dòng bảng.

## 8. Ba mẫu đối chiếu nguồn (từ `suppliers/cn`, chữ dòng nguyên văn)
1. Volvo TAD1341GE, bdadl-shanghai [118]: «| BDA-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450»; huatai-yangzhou [103]: «| 260GF | 260 | TAD1341GE | 6L | 120/138 | 9.36 | 34 | 2450 | 2900*1100*1600» (cùng ô 2900*1100*1600 → gộp); huipu-power [106] ghi «131*158» cho cùng model.
2. MTU 12V2000G25, bdadl-shanghai [112]: «| BDA-M570 | 520/570 | 奔驰MTU | 12V2000G25 | 12 | 21 | 50 | ≤195 | 3500*1350*1850 | 4350» (fukangsi [2007], pengpai [111] giống từng ô trừ mã máy); yunding-jiangsu [2003]: «| YDM-550GF | 550 | 687.5 | 990 | 12V2000G25 | 12 | 130*150 | 23.88L | …».
3. Yangdong YD385D, hồ sơ hãng `yangdong` [9]: dung tích «1.532», đường kính «85»; victory-generator và wintpower cùng ô «1900*730*1130» → gộp, giá trị thắng 1,532 mất (mục 4b).

## 9. Rủi ro + việc chưa kiểm
- Chưa đo top 30 (chặng B). Chưa kiểm số gói có HSMT đòi dung tích nằm giữa hai giá trị của 69 nhóm.
- MTU 1600: lượt trước nói giá trị đúng là 10,5 / 14 / 17,5 / 21 theo hiểu biết hãng, KHÔNG có nguồn hãng trong `suppliers/cn`: ghi "chưa kiểm được".
- C4 phụ thuộc bảng có cột kích thước; bảng mẫu chép mà không có cột này vẫn nhiều phiếu.
- Nếu làm chặng B: cần quyết (i) (c) chỉ dung tích hay cả xi lanh; (ii) có áp cho trần dung tích (`maxDisp`) không (lech-cot-9 lượt đầu có áp); (iii) có giữ hồ sơ hãng động cơ ngoài nhóm gộp không. Quay lui: một commit.

## Cần ghi nhớ
- Nhóm NCC chép chung bảng (cùng ô kích thước tổ máy cho cùng model), ngoài bdadl / fukangsi / pengpai / liangzi / huatai: jianghao-genset / kangwo-guangdong / sanq-power / taihai-taizhou; victory-generator / wintpower; rise-power / sdec; frs-shenyang / gtl-power / tellhow-power; aoke-yangzhou / walter-yangzhou / vantek-jiangsu; jlmech-wuhan / uleengen / yunding-jiangsu.
- Bộ đọc thông số không đọc được khối lượng ở bảng bdadl (`机组重 量(KG)` tách dòng) — ngoài phạm vi, chưa sửa.
- Script: `dau-vao\so-dong-dung-tich\do-c2.mjs`, `bang.cjs`.
