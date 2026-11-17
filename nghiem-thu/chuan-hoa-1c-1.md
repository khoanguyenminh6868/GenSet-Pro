# Nghiệm thu chuan-hoa-1c (lần 1) — 6 lỗi đọc thông số NCC còn sót — 14/11/2026

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/783 — nhánh `chuan-hoa-1c` từ main `a612c260` (#782). Không tự merge.

## Tệp đã đổi
`web/catalog.js`, `suppliers/spec-read.test.mjs` (+6 ca), `web/CLAUDE.md` (bẫy mới). KHÔNG đổi `quality-baseline.json`, fixture, `config-bot.mjs`, `spec-norm.js`, `quality.mjs`, dữ liệu.

## Từng lỗi: nguyên nhân → cách sửa
1. **lees-power 134/135** — nguyên nhân thật không phải "dòng ngắn hơn dữ liệu" ở `rowSpecs` (đã không gán khi số cột lệch) mà ở `walkedSpecs`: bảng có 7 tiêu đề, dòng 10 ô, tiêu đề "Electrical Power KW" nằm đè lên ô động cơ → đoạn đi bộ bỏ qua ô động cơ (cho phép tiêu đề "không phải số liệu") rồi mọi nhãn sau lệch một cột ("Gas Consumption" ← 33% / 0.33). Sửa hẹp: `POWER_TITLE` (power/output/功率, trừ brand/make/品牌) đè ô động cơ/đầu phát thì `break`. Lần đầu dùng cả `kw|kva` làm mất 150+ giá trị đúng của jet-power / kente-power (dòng đơn vị "KVA | KW") → thu hẹp, đo lại. Hệ quả: lees-power không còn tiêu hao khí nào (tiêu hao thật 12.2, 252.9 vẫn không đọc được — thà bỏ).
2. **Tiền tố hãng trùng bản** — đường đọc sót là nhánh `productLines` ("fromLine", dòng "A one-model datasheet…"): `model` lấy nguyên `engineModels[0]`. Sửa: qua `tidyModel`. 21 model (energy-gruppi 4, genesal-energy 5, hgi-generators 5, stephill 7) + 2 tên không trùng bản khác (J.Deere 6068HFG05/06) nay bỏ tiền tố.
3. **"Volvo Penta TAD734GE"** — `isCode` cho đúng một dấu cách. Thêm `brandedCode(cell, list)`: hãng + một từ thuộc tên hãng (penta|infracore|heavy|power|diesel|engine) + mã; dùng ở `codes` của dòng bảng ngang và ở `tidyModel`. KHÔNG nuốt tên dòng ("FPT NEF N67 TEVP05.00" vẫn không nhận). Không đổi `isCode`. Dữ liệu hiện tại không còn ô đúng "Volvo Penta TAD734GE" (chỉ còn "POWERED BY VOLVO TAD734GE" trong cps-generators) — ca test dùng bảng dựng với ô đó; ảnh hưởng thật xem dưới.
4. **Running time / running hours** — `NOT_FUEL` thêm `run(ning)? (time|hours?)`; `tank` loại cùng mẫu; `runtime` nhận `running hours`. "Running time @ 75% PRP" và "Fuel Tank running hours" thành `runtime`. "10 Hours Fuel Tank Capacity"=120L vẫn là `tank` (là dung tích).
5. **gtl-power / kangwo** — `speed` loại nhãn có `\d V/\d Hz` ("1500 rpm, 400V/50Hz/3P, 0.8PF"); `voltage` loại "Fre/Volt", "频率/电压". Giá trị bên dưới là công suất (kW / kVA): không còn gán.
6. **acepow "Engine Size(mm)"** — `dims` loại `engine size|dimen`, 发动机/柴油机尺寸. Không có khoá thay thế (không có `engDims`).

## Lệnh kiểm (đầu ra thật)
```
node --test suppliers/*.test.mjs web/test/*.test.mjs   → tests 999, pass 999, fail 0   (spec-read.test.mjs: 17 ca; 6 ca mới đỏ trên main, xanh trên nhánh — đã kiểm bằng git checkout web/catalog.js)
node suppliers/verify.mjs                              → 435 bản ghi, 0 có lỗi
node suppliers/quality.mjs --check                     → --check: không chỉ số nào xấu đi quá ngưỡng.  (không cần --write-baseline)
git status                                             → chỉ 3 tệp trên; suppliers/fixtures không đổi (regress-config, regress-bidprice xanh, không cập nhật fixture)
```

## So từng bản ghi main ↔ nhánh (ĐO, `cmp.cjs` biến thể khớp theo khoá supplier|table|row|kind vì số bản ghi đổi; `all-main.json` / `all-pr.json`)
Số bản ghi 63.576 → 63.580 (+4, 0 mất). Công suất / tần số / hãng / genset: 0 bản ghi đổi.

**Giá trị mất (có ở main, không ở nhánh)** — tất cả là đọc sai:
| Khoá | Số | Nhãn = giá trị | Lý do |
|---|---:|---|---|
| voltage | 52 | kangwo-guangdong "Fre/Volt HZ/V 频率 /电压" = 112.5 … 1250 | công suất kVA (lỗi 5) |
| speed | 17 | gtl-power "1500 rpm, 400V/50Hz/3P, 0.8PF" = 1000/1200/1500/1800 (16) + zichai "Speed (r/m)" = 1000 (1) | công suất (lỗi 5); zichai: 1000 là công suất định mức ("reted power"), tốc độ thật 3000 (hệ quả của lỗi 1: nay không gán) |
| fuel75 | 6 | endress "Running time @ 75% PRP" = 5, 4,2, 6,7 … | → runtime (lỗi 4) |
| fuel | 3 | lees-power "Gas Consumption" = 0.33 | lỗi 1 |
| tank | 2 | acepow "Fuel Tank running hours:" = 8/10/12H | → runtime (lỗi 4) |
| dims | 2 | acepow "Engine Size(mm)" = 770x520x680 | lỗi 6 |
(lees-power 134 "33%": đã bị loại từ #781 nên không ở danh sách mất.)

**Giá trị thêm**: runtime 19 (13 mẫu: endress "Running time @ 75% PRP" 4,2 … 24,8 ×17, acepow "Fuel Tank running hours:" 8/10/12H ×2); tank 2 (acepow "Fuel tank Vol.(L):" = 50 — nhãn thứ hai, trước bị "running hours" chiếm khoá `tank`, đúng nghĩa).

**Bản ghi thêm (4)**: kc-generatorset, bảng 110/111/113/122: ô "Manufacturer/Model | Weichai Power WP13D490E310" (+ WP6D167E200, 12M26D902E200, WP10D238E200) → engine, `specs: []`.

**Model đổi tên (31 kiểu, 34 bản ghi)**:
- bỏ tiền tố hãng, dòng productLines (23): "Perkins 1103A-33G"→"1103A-33G" (2), "Perkins 1103A-33TG2" (2), "Kubota V1505" (2), "J.Deere 6068HFG05/06", "Perkins 4008-TAG1A", "Baudouin 8M33G1100/5", "VOLVO TAD1642GE", "DOOSAN DP222LCF", "MITSUBISHI S12A2-PTA", "PERKINS 4006-23TAG3A", "PERKINS 4008-30TAG3", "Kubota D1703", "Perkins 1103D-33-G3", "Perkins 1104D-44-TG3", "Perkins 1104D-E44-TAG2", "Perkins 1204J-E44TTAG2", "Perkins 904J-E36TAG3", "Yanmar 4TNV98CT-IYE", "Perkins 1104C-E44TAG2", "Perkins 1103A-33TG1", "Perkins 404J-E22T".
- cgm-italia bảng 101 (hàng "| v30HY | … | HYUNDAI INFRACORE DM01VP | …"): trước lấy ô khác làm động cơ (B50, B100, B200, B300 — ô đứng sau), nay lấy ô hãng+mã: B50→DM01VP, B50→DM02VP, B100→DM03VG, B100→DM03VP, B100→DP034CDV, B200→DP054CBV, B200→DP054CCV, B300→DP086CCV, B300→DP086CEV (9 bản ghi: sửa đúng).
- Danh sách đầy đủ: `scratchpad\au\cmp-final.txt` (chép sang `chuan-hoa-1c-1\cmp-final.txt` bên dưới).

## 3 mẫu đối chiếu nguồn (dòng từ `specTables` đã qua verify; chưa mở lại trang gốc)
1. lees-power nguồn 135 (`https://www.leespower.com/` trang Kubota gas set): "| LSK13NGE3 | WG1605N | 13 | 0.33 | 19.5 | 2100×950×1310 | 1125 | …" dưới tiêu đề "| Model | Electrical Power KW | Electrical Efficiency (n %) | Gas Consumption | …" → 0.33 là hiệu suất, không còn `fuel`.
2. gtl-power 109: "| Model | 1500 rpm, 400V/50Hz/3P, 0.8PF | Perkins" + "| PW-9T5 | 9 | 7 | 10 | 8 | 403A-11G1" → không còn `speed`.
3. endress-stromerzeuger 1008: "| Running time @ 75% PRP | 5" (nhãn trong bảng chi tiết, cạnh "Fuel tank capacity [l] | 6,8") → `runtime` = 5.

## Rủi ro còn lại + quay lui
- Lỗi 1 chỉ xử lý theo mẫu tiêu đề "power/output" đè ô động cơ; dạng lệch khác (tiêu đề không có chữ power) vẫn đọc như cũ. Nếu bảng thật có tiêu đề "Power" hợp lệ đè ô động cơ mà phải đọc tiếp qua nó, walk dừng sớm: đo 0 giá trị đúng bị mất ngoài danh sách trên.
- `brandedCode` chỉ nhận 6 từ thứ hai; tên hãng hai từ khác (vd. "Mitsubishi Heavy", "Weichai Steyr") chỉ "Heavy" được nhận; "Steyr" không (chưa có ca dữ liệu).
- `runtime` có thêm 19 giá trị: chuỗi "8/10/12H", "4,2" chưa chuẩn hoá (lớp `spec-norm` chưa có mã `runtime`; `quality --check` vẫn xanh).
- Quay lui: revert PR.

## Việc chưa kiểm được
- Chưa mở lại trang gốc đối chiếu; không chạy Playwright (không đổi `index.html`); `GenbidCatalog.build` md5 so origin/main chưa chạy (đã so từng bản ghi bằng audit2).
- Không tìm lại được ô đúng "Volvo Penta TAD734GE" trong dữ liệu hiện tại (nguồn của lời mô tả không còn); ca test dùng bảng dựng, không phải dòng thật.
- Lỗi lệch cột còn lại của lees-power (tiêu hao thật nằm dưới "Open Type") không sửa: hiện đọc ra không có tiêu hao.

## Cần ghi nhớ
- Bẫy mới đã ghi `web/CLAUDE.md`: tiêu đề power/output đè ô động cơ dừng walk; running time ≠ fuel; `brandedCode`.
- Lỗi chưa xử lý, thấy khi đo: nhãn "Fuel Consumption 25% load" (lees-power 1122…) đang rơi vào khoá `fuel` (mức 25% bị gộp vào tiêu hao 100%) — ngoài danh sách, không sửa.
