# Nghiệm thu: Hyundai Power Products (DHY110KSE) — IB2600601812

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/598 (nhánh `hyundai-dhy`, chưa merge)

## Tệp đổi (chỉ dữ liệu / nguồn, không sửa code, không sửa hồ sơ khác)
- `suppliers/cn/hyundai-power-products.json` (mới)
- `suppliers/drafts/hyundai-power-products.json` (mới)
- `suppliers/sources/hyundai-power-products/{1,2,3,4,5001}.md` (mới)

## Hồ sơ
- id `hyundai-power-products`, role `genset_oem`, country `ES`, status `verified`, conf `medium`, brand HYUNDAI.
- Đơn vị đứng tên (trang hãng): nhà sản xuất **GRV POWER PRODUCTS SL**, Sta. Llogaia Alguema, Tây Ban Nha; cấp phép bởi "HYUNDAI Corporation Holdings, Korea". Trang hyundaipower-de.com do HPP Pro GmbH (Stuhr, Đức) vận hành (Impressum, nguồn 3).
- **Nơi sản xuất tổ máy: nguồn KHÔNG ghi** (để trống, ghi vào `missing`). Datasheet chỉ ghi "Use Chinese High quality vehicle engine" (nói về động cơ, không phải nơi lắp tổ máy).
- Nguồn: 1 = manual PDF Diesel 1500 (hyundaipower-de.com); 2 = trang sản phẩm DHY110KSE (hyundaipower-de.com); 3 = Impressum; 4 và 5001 = datasheet `DHY110K(S)E.pdf` do chính trang sản phẩm liên kết (mục Downloads). Tất cả hạng A (trang thương hiệu / đơn vị cấp phép; trang 2–3 là shop của đơn vị cấp phép tại Đức, không phải trang bán lại bên thứ ba).
- Không dùng genelite / micksgonebush / trang bán lại nào. `hyundaipower.shop` (GRV) có trang DHY110KSE nhưng trả trang trống (HTTP 202, cả tải thường lẫn firecrawl), không lách, bỏ.

## Bảng DHY110KSE (datasheet, nguồn 5001; cột phải = bản KSE vỏ cách âm)
| Thông số | Giá trị | Nguồn |
|---|---|---|
| Công suất liên tục / dự phòng | 100 kVA / 80 kW; 110 kVA / 88 kW, cosφ 0.8 | 5001 "Prime Power KVA / KW 100 / 80", "Standby Power KVA / KW 110 / 88" |
| Tần số / điện áp / dòng | 50 Hz; 400/230 V; 144.3 A | 5001 |
| Động cơ | HY4A140Z-D25 (hãng động cơ không ghi), 4 xi lanh thẳng hàng, tăng áp có làm mát khí nạp, hành trình×nòng 108×132 mm, dung tích 4.75 L, điều tốc điện tử, làm mát nước, Prime 100 kW | 5001 khối DIESEL ENGINE |
| Đầu phát | model 274C, 1 ổ bi, tự kích từ, cách điện H, IP23, AVR AS440 (hãng đầu phát không ghi) | 5001 khối ALTERNATOR |
| Bộ điều khiển | AMF9 (datasheet: "COMAP AMF9") | 5001 |
| Tiêu hao 25/50/75/100% tải | 8.25 / 13.2 / 18.7 / 24.6 L/h | 5001 |
| Bồn dầu / chạy liên tục | 245 L / 9.3 h | 5001 |
| Kích thước D×R×C / khối lượng / ồn | 2700×1000×1600 mm / 1476 kg / 72 dB (7 m, 75% tải) | 5001 (cột phải) |
| Dao động điện áp (ổn định tĩnh) | ≤ ±0.5 % ; tần số ≤ ±1 % | 5001 |
| Bình ắc quy / điện điều khiển | 2×60 Ah / 24 V; nước làm mát 34 L | 5001 |

Lưu ý nhập liệu: datasheet có 2 cột (DHY110KE hở trái, DHY110KSE phải) nên bảng gốc của `pdftotext -table` lẫn hai cột. Tôi viết lại khối "Bảng DHY110KSE" ở cuối `5001.md` (đã ghi chú trong tệp) theo thứ tự nhãn | đơn vị | giá trị, lấy cột phải; hai nhãn "Model" trong khối động cơ / đầu phát được đổi thành "Engine Model" / "Alternator Model" để bộ đọc danh mục nhận được. `verify.mjs` chạy trên khối này.

## So với yêu cầu HSMT
| Yêu cầu | DHY110KSE | Kết quả |
|---|---|---|
| ≥ 100 kVA liên tục | 100 kVA | Đạt (bằng) |
| ≥ 110 kVA tối đa | 110 kVA dự phòng | Đạt (bằng) |
| Tiêu hao 100% tải ≤ 25 L/h | 24.6 | Đạt |
| Tiêu hao 50% tải ≤ 15 L/h | 13.2 | Đạt |
| Cách điện H | H (đầu phát 274C) | Đạt |
| Dao động điện áp ≤ ±1 % | ≤ ±0.5 % | Đạt |

## Mâu thuẫn giữa các nguồn (cần Khoa biết)
- Trang sản phẩm hyundaipower-de.com (nguồn 2): "4 Zylinder", 6.870 cm³, 90 kW/122 PS, 23.8 L/h, tank 245 L chạy 10.3 h, ồn 69 dB, 1520 kg, 2700×1000×1600, AVR ±3 %. Datasheet (5001): 4.75 L, 100 kW, 24.6 L/h, 9.3 h, 72 dB, 1476 kg, AVR ±0.5 %. Snippet tìm kiếm của hyundaipower.shop (GRV) ghi "6 cilindros" (không tải được trang). Hồ sơ dùng datasheet làm số chính; dòng đã ghi vào `missing`.
- Trang bán lại (genelite…) không dùng, nhưng snippet ghi động cơ 6.870 cc giống trang 2.

## Lệnh kiểm
```
node suppliers/verify.mjs   -> ✓ hyundai-power-products (genset_oem, verified, medium) ... 434 bản ghi, 0 có lỗi
node --test suppliers/*.test.mjs -> # pass 493  # fail 0
```

## Đo trong danh mục / ứng viên (chỉ đo, không sửa code)
- `GenbidCatalog.build`: sau khi thêm, `engines` có HY4A140Z-D25 (kW 100, specs: tiêu hao, điều tốc, nạp khí, đường kính, dung tích), `alternators` có 274C (kVA 100, kích từ, cách điện H, IP23), `makes` rỗng vì nguồn không ghi hãng. Trước khi đổi nhãn "Model" → "Engine Model" thì động cơ không vào danh mục (0 mục).
- `candidates(cat, 100 kVA, hint "Huyndai / DHY110K SE")`: **không có dòng nào của hyundai-power-products** (top 201, dropped 0; cũng không có khi không hint). Thử thêm hàng "Genset Model | DHY110KSE" hoặc bảng 1 dòng "DHY110KSE | 110 | HY4A140Z-D25 | 274C": vẫn 0. Chưa tìm nguyên nhân (nghi lọc theo xuất xứ ES / hãng động cơ trống / `named()` không có đường hãng+model tổ máy — đúng chẩn đoán 2 và 3 của phiên điều phối). Cần phiên sửa `config-bot.mjs` xử lý.

## 3 mẫu đối chiếu nguồn
1. Tiêu hao: nguồn 4 (`.../Datenblatt/DHY110K(S)E.pdf`) "Fuel consumption @25/50/75/100% load  L / hour  8.25/13.2/18.7/24.6".
2. Đơn vị đứng tên: nguồn 2 "Hersteller: GRV POWER PRODUCTS SL, Camí de la Bòbila, s/n, 17771 Sta. Llogaia Alguema".
3. Cấp phép: nguồn 1 (manual) "Licensed by Hyundai Corporation, Korea".

## Rủi ro / quay lui
- Số trong khối viết lại của 5001.md lấy cột phải bằng mắt từ văn bản PDF (kích thước/khối lượng/ồn); nên đối chiếu 1 lần với ảnh PDF trước khi tin tuyệt đối. Quay lui: revert PR (chỉ thêm tệp mới).
- Role/country `genset_oem` / `ES` là cách hiểu của tôi (nhà sản xuất ghi trên trang). Muốn đổi sang bản ghi DE (HPP Pro) thì không nên vì HPP Pro là nhà bán trong nguồn.
- Chưa kiểm: nơi sản xuất, hãng động cơ / đầu phát (nguồn không ghi); trang hyundaipower.shop; hyundaipowerequipment.co.uk (shop UK, chỉ thấy mục 3000 rpm, không có dòng 110 kVA đã kiểm).

---
## Bổ sung (13/11): bảng ngang + bộ điều khiển — PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/600
Tệp đổi: `suppliers/cn/hyundai-power-products.json`, `suppliers/sources/hyundai-power-products/5001.md` (thêm khối "Bảng ngang DHY110KSE" cuối tệp, có ghi chú cách ghép).
- Bảng mới (specTables[0], nguồn 5001): `| Genset Model | Prime Power | Standby Power | Engine Model | Alternator Model | Control System` / `| DHY110KSE | 100KVA/ 80KW | 110KVA/ 88KW | HY4A140Z-D25 | 274C | COMAP AMF9`. Ô "COMAP AMF9" ghép từ "Controller | AMF9" + câu datasheet "High quality controller of COMAP AMF9" (viết "AMF9" trơn thì `controllersIn` không nhận: cần chữ COMAP/ComAp).
- `controllers`: ComAp AMF9, line "High quality controller of COMAP AMF9", nguồn 5001. productLines: giữ nguyên (nguồn không ghi hãng động cơ / đầu phát nên không thêm).
- Lệnh: `verify.mjs` → ✓ hyundai-power-products, 434 bản ghi 0 lỗi; `node --test suppliers/*.test.mjs` → pass 504, fail 0.
- ĐO (code main ff502d9, candidates 100 kVA, hint "Huyndai / DHY110K SE" và không hint, cho kết quả như nhau):
  - `GenbidCatalog.build`: engine HY4A140Z-D25 có use genset DHY110KSE, power prime 100 kVA/80 kW, standby 110/88, freq 50, other (đầu phát) 274C; alternator 274C có use từ hyundai-power-products; controllers có AMF9 (make ComAp, 2 use).
  - `candidates()`: dòng hyundai-power-products có `u.power` đủ prime/standby, `a`=274C, `rowCtrl` = [ComAp AMF9], `offers` = [ComAp AMF9]. Hạng 84/202, score 186, named=false (ctrl/engine hints tôi dựng tay rỗng nên chưa phản ánh hạng thật; hạng thật đo ở lượt Gợi ý của điều phối).
  - Dữ liệu chức năng AMF9 (`controllerSheetFacts`, specs của controller) = rỗng: repo chưa có datasheet ComAp AMF9. Datasheet DHY110KSE (5001) có bảng chức năng bảng điều khiển AMF9 (bảo vệ quá tải, mất cân bằng áp/dòng, áp/tần số cao-thấp, CAN, USB, RS485 tuỳ chọn…); KHÔNG ghi "bảo vệ ngắn mạch" — không bịa.
  - Datasheet chính hãng ComAp để điều phối quyết: https://na.comap-control.com/products/controllers/single-gen-set-controllers/intelilite/intelilite-4-amf-9/ (trang ghi "AMF9 Datasheet", link PDF trên trang chưa lấy; không dùng bản hsaoy.com / scribd). Lưu qua `maker-datasheets.mjs` (vai trò controller_maker) nếu quyết lấy.
- Rủi ro: ô "COMAP AMF9" là ghép; quay lui = revert #600.
