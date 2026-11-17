# Nghiệm thu: datasheet một model của tổ máy dạng dọc (IB2600601812)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/601 (nhánh `ds-vertical`, commit dcef44b, từ main b18bc38 = sau #600). Không đổi cấu trúc dữ liệu hồ sơ NCC, không sửa hồ sơ nào.

## 1. Chẩn đoán 14 dòng "chưa rõ" (kết quả đang lưu, 2026-11-12T17:39:27Z, cấu hình #1 DHY110KSE)
Nguyên nhân chung (code): `check` chỉ nhận câu trích từ bảng chứa `src.line` của từng bộ phận (bảng ngang 1 dòng + khối "Diesel engine"); các khối "DHY110KSE" (chung), "Voltage", "Frequency", "Alternator" cùng nguồn 5001 không thuộc văn bản nào để đối chiếu. `modelFacts` chỉ lấy nhãn có khoá SPEC (excit / insul / ip / gov / asp / bore / disp), không lấy "Steady state regulation" (nhãn không có chữ voltage, chữ đó nằm ở tiêu đề khối) hay "Prime power | kVA" của đầu phát. Nguyên nhân phía agent: catalog.md chỉ in "bảng một model" khối Diesel engine, không in khối Voltage / Alternator / chung.

| # | Dòng | Nguồn 5001 có ghi? | Vì sao chưa rõ | Sau sửa |
|---|---|---|---|---|
| 1 | Hãng sản xuất tổ máy (HSMT "Huyndai") | Datasheet không ghi hãng tổ máy (chỉ "HYUNDAI … brushless alternator"); trang hãng [2] ghi "Licensed by HYUNDAI Corporation Holdings, Korea" + "Diesel Notstromaggregat DHY110KSE" | không có đường code cho hãng của dòng named | **đạt (code)** |
| 2 | Ổn định điện áp ≤ ±1% | khối Voltage: `\| Steady state regulation \| % \| ≤±0.5` | khối không thuộc nguồn trích; agent không thấy | **đạt (code)** |
| 3 | Công suất đầu phát ≥ 100 kVA | khối Alternator: `\| Prime power \| kVA \| 100` | như trên | **đạt (code)** |
| 4 | Kiểu đầu phát (không chổi than, tự kích, tự điều chỉnh áp) | bảng: `Excitation mode \| Self-excitation`, `AVR Model \| AS440`; "brushless" chỉ ở chữ mô tả của PDF (5001.md dòng 14–16), không ở khối dọc | "không chổi than" không có trong dòng nào code nhận | vẫn chưa rõ (thiếu dòng dữ liệu, xem việc còn lại) |
| 5 | Kiểu động cơ "Diesel 4 kỳ" | `Fuel type \| Diesel`; không ghi 4 kỳ | nguồn không ghi 4 kỳ | vẫn chưa rõ (đúng) |
| 6 | Hệ thống nhiên liệu "phun trực tiếp, điện tử" | không (chỉ "Governor \| Electrical") | nguồn không ghi | vẫn chưa rõ (đúng) |
| 7 | Tốc độ quay ≤ 1500 | KHÔNG: 5001 không có rpm (manual [1] chỉ có "Diesel 1500" trong tên tệp) | nguồn không ghi | vẫn chưa rõ (đúng; brief ghi "có" nhưng grep không thấy) |
| 8 | Hệ thống làm mát "két nước + quạt" | `Coolling \| Water` (không ghi két / quạt) | agent ghi đúng: chưa ghi két, quạt | vẫn chưa rõ (đúng) |
| 9 | Tiêu chuẩn khí thải | không | — | vẫn chưa rõ (đúng) |
| 10 | Xuất xứ tổ máy | không | — | vẫn chưa rõ (đúng) |
| 11 | Loại bộ điều khiển "kỹ thuật số" | không (5001 / ComAp 1012 không ghi "digital") | — | vẫn chưa rõ |
| 12 | Khởi động/dừng/AMF (thiếu "Khởi động máy và tắt máy") | ComAp 1012 không có dòng riêng; 5001 có "Remote start and stop ●" trong bảng chức năng | bảng chức năng BĐK của datasheet tổ máy chưa được đọc | vẫn chưa rõ |
| 13 | Đo lường, hiển thị (8/12 phần) | 5001 CONTROL PANEL: engine speed ●, engine water temperature ●, fuel level ●, Genset running time ●, Power factor ●, genset power KVA ●, engine oil pressure ● | như trên; bảng PDF xen 2 cột, dấu ● nhiều chỗ rơi xuống dòng sau, có ○ = tuỳ chọn | vẫn chưa rõ |
| 14 | Bảo vệ, dừng máy (4/11) | 5001: High water temperature, Low oil pressure, Low fuel level warning/shutdown ●; **không** có ngắn mạch | như trên | vẫn chưa rõ (ngắn mạch đúng là không có) |

## 2. Sửa phần code (tổng quát, không riêng Hyundai) — `suppliers/config-bot.mjs`
- `gensetSheetOf(s, n, model)`: các bảng không header của nguồn n, nguồn có `tier: "A"`, tiêu đề có đúng MỘT mã model và mã đó = model tổ máy của cấu hình. Kèm câu trích (`sources[].quote`) của các trang tier A có ghi model đó. `sheetOfConfig(c)`: theo src catalog của genset / engine / alternator.
- `sheetFacts`: mỗi dòng → khoá SPEC của nhãn, hoặc nhãn ghép với tiêu đề khối ("Voltage Steady state regulation" → vreg); giá trị phải đúng dạng của khoá ("Stable time 2.0" không thành điện áp); khối Alternator "Prime power | kVA" → `altKva`. Bộ phận theo tiêu đề khối (`headingOf`).
- `check`: `texts.sheet` = mọi khối + câu trích trang → câu trích nguyên dòng của bất kỳ khối nào được nhận. `hintFor`: thêm dòng của khối, SAU thông số theo model (giữ gợi ý cũ cho các gói khác).
- `sheetChecks` (code quyết, chỉ nâng "chưa rõ" lên "đạt"; số không đạt / check đã đạt-không đạt giữ nguyên):
  - `alt_vreg`: mọi dòng vreg (không phải quá độ) của datasheet ≤ ±y% HSMT.
  - `alt_power`: khối đầu phát, đúng định mức HSMT hỏi (prime trừ khi ghi dự phòng / tối đa), ≥ kVA HSMT.
  - `genset_make`: cấu hình là tổ máy HSMT nêu (`namedHit`), NCC của datasheet là genset_oem mang thương hiệu đó (`NG.makerOf`: tên / brands), có dòng trang hãng tier A (ghi model) nêu hãng. Không đọc hãng từ tên model.
- Kiểm lại lần hai (kết quả đã lưu chạy lại `check`) giữ nguyên 3 dòng đạt (đo).

## 3. Phần agent — catalog.md + prompt
- `catalogMd`: ứng viên có datasheet một model (>1 khối) in "datasheet tổ máy DHY110KSE (nguồn tier A …)" với từng khối `[tiêu đề] dòng ; dòng` và dòng trang hãng; ứng viên sau cùng nguồn chỉ ghi "như ứng viên 1".
- `config-prompt.md` bước 2: mọi dòng các khối là của tổ máy đó, trích nguyên dòng, chú ý "Steady state regulation" có ở cả khối Voltage và Frequency; điều không dòng nào ghi giữ `unclear`.
- Đo prep thật (chỉ đọc, `GENBID_LOCAL_SUPPLIERS=1 … prep --key IB2600601812 --origin all`): trước = ứng viên 1 chỉ có `line`; sau = thêm 5 khối + 7 câu trích trang. Diff catalog.md chỉ có 2 chỗ đó (ứng viên 1 và 2), 28 ứng viên khác không đổi.

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/ds-vertical.test.mjs` → `# pass 5 # fail 0` (hãng giả "Denyo" DXG100ESX: tier C → không; NCC assembler → hãng chưa rõ; vreg ±2% → không đạt-bằng-code; khối của model khác "DXG80ESX" không lấy; agent trích dòng model khác bị loại).
- `node --test suppliers/*.test.mjs` → `# tests 509 # pass 509 # fail 0`.

## Hồi quy (ĐO; `check` + `rankConfigs`, code origin/main b18bc38 so với nhánh, NCC = doc-cache + hồ sơ hyundai-power-products của repo, chữ HSMT tải sẵn)
Script `scratchpad\reg.mjs`, `cmp.mjs`; đầu ra `reg-old.json` / `reg-new.json` (scratchpad của phiên này).
- IB2600574589, 581294, 581977, 586587, 592658, 592684, 594596, 595853, 599817, 601812 (bản doc-cache 06:44Z), 602880, 603983, 604739: **0 đổi** (JSON giống hệt, kể cả hints).
- IB2600601812 bản 17:39Z: đổi đúng 3 dòng của #1 DHY110KSE: Hãng sản xuất tổ máy, Công suất đầu phát, Ổn định điện áp unclear → met; thêm 1 hint (Ổn định điện áp, in trước khi code quyết — vô hại). Không đổi hạng, không cấu hình nào mất.

## Mô phỏng trên kết quả 601812 (ĐO, `scratchpad\sim.mjs`)
- Trước: 18 đạt / 14 chưa rõ / 11 xác nhận / 0 không đạt. Sau: **21 / 11 / 11 / 0**.
- 3 chuyển đạt (bằng code, không cần agent): hãng tổ máy, công suất đầu phát, ổn định điện áp.
- 11 vẫn chưa rõ: 7 vì nguồn thật sự không ghi (4 kỳ, phun trực tiếp, tốc độ quay, két+quạt, khí thải, xuất xứ, BĐK kỹ thuật số); 1 vì "không chổi than" chỉ có trong chữ mô tả PDF chứ không trong khối dọc; 3 nhóm chức năng BĐK vì bảng chức năng CONTROL PANEL của datasheet tổ máy chưa được đọc (và ngắn mạch không có).
- Đường agent (mô phỏng sửa tay): agent ghi "Công suất đầu phát" met với `| Prime power | kVA | 100` → code cũ hạ "chưa rõ (câu trích nguồn)", code mới giữ đạt.

## 3 mẫu đối chiếu nguồn
1. `suppliers/sources/hyundai-power-products/5001.md` dòng 226–227 (URL https://www.hyundaipower-de.com/mediafiles/Anleitungen/Generatoren/Diesel/Datenblatt/DHY110K(S)E.pdf): "DHY110KSE Voltage" / "| Steady state regulation | % | ≤±0.5" (bản gốc dòng 23).
2. Cùng tệp dòng 250–252: "DHY110KSE Alternator" / "| Prime power | kVA | 100".
3. `suppliers/cn/hyundai-power-products.json` sources n=2 (https://www.hyundaipower-de.com/hyundai-diesel-generator-dhy110kse) quote: "Licensed by HYUNDAI Corporation Holdings, Korea", "Diesel Notstromaggregat DHY110KSE".

## Rủi ro còn lại + quay lui
1. "Steady state regulation" có ở cả khối Voltage và Frequency: câu trích nguyên dòng không phân biệt khối; code quyết vreg theo khối (đúng), nhưng agent trích nhầm dòng Frequency cho vreg vẫn qua kiểm câu trích. Đã ghi trong prompt.
2. Hãng tổ máy đạt dựa trên hồ sơ NCC mang thương hiệu (brands) + dòng "Licensed by HYUNDAI…" — là hàng cấp phép (GRV, Tây Ban Nha), không phải Hyundai Hàn Quốc sản xuất; note ghi rõ. Khoa có thể muốn "xác nhận" thay vì "đạt".
3. Áp cho mọi hồ sơ có datasheet dạng khối nhiều bảng cùng nguồn tier A ghi một model; hồi quy 13 gói không có trường hợp nào khác.
4. Quay lui: revert PR #601 (không đổi dữ liệu).

## Việc chưa làm / gợi ý
- Bảng chức năng BĐK (CONTROL PANEL, ●/○) của datasheet tổ máy: cần dữ liệu viết lại thành khối dọc "chức năng | ● / ○" (phiên dữ liệu như #600) rồi mới cho code / agent dùng — sẽ đưa Đo lường lên ~11/12, Bảo vệ lên 10/11 (ngắn mạch vẫn chưa rõ). Đọc thẳng bản pdftotext hiện tại dễ nhầm ○ (tuỳ chọn) thành ● vì cột xen nhau, nên KHÔNG làm trong PR này.
- "brushless … with AVR": phiên dữ liệu có thể thêm 1 dòng vào khối "DHY110KSE Alternator" của 5001.md (chép nguyên chữ datasheet) để agent trích được.
- Chưa chạy agent thật, chưa ghi web (brief cấm). Bot đang chạy giữ code cũ tới khi restart sau merge.
