# bdk-ten-tat — BĐK NCC ghi tên tắt / thiếu → tới đúng datasheet (24/11/2026)

Nhánh `wt-bdk-ten-tat` (worktree `C:\Projects\GenSet Pro\wt-bdk-ten-tat`), gốc cố định `origin/main` = `2e678d48`. PR NHÁP. Không tải thêm tài liệu, không tra internet. Script đo (ngoài git): `scratchpad\measure.mjs` (số model BĐK / khoá `controller:*` / `factsFor` / `ctlKinds` / quét chữ NCC), `ctx.mjs` (ngữ cảnh một mẫu chữ trong `cn/`), `merge-ctl.mjs`; kết quả `before.json` / `after.json`, `spec-full.txt`, `spec-sum.md`.

## Thay đổi (chỉ 3 vùng của `web/catalog.js` + 1 dòng `GENERATION` + dữ liệu)
1. `web/catalog.js` SmartGen: thêm mẫu thứ ba `\bHGM\s?-?(4(?:10|20))(?![\dA-Z])` (danh sách ĐÓNG, 2 model có trong tài liệu smartgen 1010 "HGM410_HGM420").
2. ComAp: nhóm `Inteli(Lite|Gen|Sys|Compact|Drive|Mains|Nano)`; mẫu tên tắt `(AMF|MRS)\s?-?(…|5)` (cần chữ ComAp trong dòng như cũ). `suppliers/config-bot.mjs` `GENERATION`: "AMF5" ↔ khoá `INTELINANOAMF5` (tờ comap 1021), cùng cách AMF25 ↔ InteliLite 4 AMF25.
3. SICES: mục mới trong `CONTROLLERS`: `GC(315|400|600)(Plus|Link|Mains)?` và `DST4602Evolution`, CẢ HAI mẫu `needsMake` và chữ hãng = `sices` hoặc `Mecc Alte` đứng NGAY TRƯỚC `GC…`/`DST…` (không là "Mecc Alte, Stamford alternator … controller", không là tên tổ máy GC-600(S) của agestar / GC500 của gtl-power). Vì tiêu đề tờ phải có chữ hãng (bẫy DEIF / Woodward), sửa tay `title` 4 bảng sices (cả `cn/` và `datasheets/`): "Datasheet: Mecc Alte GC600", "… GC315 (GC315Plus, GC315Link)", "… GC315-GC400", "… DST4602Evolution" (tên lấy từ chính tài liệu: "Mecc Alte GC315 advanced genset controller"); dòng bảng không đổi.
4. Dữ liệu: `controllers[]` của smartgen, comap, sices, deif, datakom, woodward, senci (xem mục 4). `suppliers/CLAUDE.md` (2 chỗ lỗi thời + bẫy mới). Test mới `suppliers/bdk-ten-tat.test.mjs` (4 ca).
KHÔNG đụng `ROW_EXCEPTIONS`, `spec-norm.js`, `spec-standard.mjs`, `spec-value-check*`, `ratings.mjs`. `git fetch`: origin/main chỉ thêm 2 commit bộ nhớ, `catalog.js` không đổi → không xung đột.

## 1. SmartGen: mọi cách NCC viết model mà không ra bản ghi BĐK
Quét MỌI chuỗi trong `cn/*.json` (trừ controller_maker, trừ trường `controllers`) bằng `HGM|HGR|HAT|HMC` + 3–4 chữ số, đối chiếu `controllersIn` (cột "đọc" = model `controllersIn` ra trên chính dòng đó):
| Chuỗi NCC | NCC | Trước | Quyết định |
|---|---|---|---|
| HGM420 (14 lần; "Digital Panel HGM420", "Smartgen HGM420") + senci n2001 "HGM420 DSE6120 …" | maverick-generators, senci | KHÔNG đọc | ĐỌC (tờ 1010 nêu HGM410 / HGM420) |
| HGM410 | không NCC nào | — | đọc cùng mẫu (tờ 1010, cùng tiêu đề) |
| HGM550E / 625E / 688E / 755E / 775E / 880E | honny-dongguan | không đọc | KHÔNG đọc: tên TỔ MÁY của Honny ("\| HGM550E \| 550 \| 500 \|…PTAA6L-EG490"). Đây là lý do mẫu là danh sách đóng, không phải `\d{3}` |
| HGM1000E … HGM4125EA, HGM1375, HGM1875, HGM3575 | honny-dongguan | ĐỌC (4 chữ số, mẫu cũ) | giữ nguyên, ngoài phạm vi (nghi nhầm tên tổ máy thành BĐK — việc riêng, 0 đổi) |
| HGM160/170/300/600 | yingtai-jiangsu ("GC-1F HGM160 HGM170 HGM300 HGM600 HGM6300") | không đọc (HGM6300 đọc) | không đọc: không có trong tài liệu smartgen đã lưu |
| 6110K (không chữ HGM) | longhong-foshan | không đọc | không có tờ |
| HGM6110 / 6110N / 6110U / 6120 / 6120N / 6120CAN / 6120UC / 7110 / 7210 / 9320 / 9510 / 9530 / 9510N / 4020T / 1790 / 7120A / 7120UC / 6120CAN-4G | nhiều NCC | ĐỌC (4 chữ số) | không đổi (tờ có hay không đã đo ở bdk-hang-khac) |
Mọi chữ viết khác (dấu cách "HGM 6120N", "HGM-…") đã đọc bởi mẫu cũ. Hậu tố N / NC / CAN / UC / U / -4G: mẫu cũ đã nhận; 3 chữ số + hậu tố KHÔNG có bằng chứng (tài liệu chỉ ghi HGM410, HGM420 trơ) nên không mở.
Tài liệu smartgen đã lưu nêu (token): HGM400 (series), 410, 420, 4020T, 6100CAN/N/U (series), 6110/N/NC/U/UC/CAN, 6120/N/NC/U/UC/CAN, 6500, 7100/7100A/7100N, 7110N/7120N, 7200, 7210/7210CAN/7220/7220CAN, 9210/9220/9310(CAN/MPU)/9320(CAN/MPU)/9410/9420/9420N/9420LT/9500/9510/9510N/9520/9520N/9530/9530N/9540/9600/9610/9620. Chỉ HGM410, HGM420 là 3 chữ số.
Đo mẫu mới trên cả `cn/`: số chuỗi `controllersIn` đọc ra trên MỌI dòng chữ trước / sau (`measure.mjs` trường `raw`): chỉ `smartgen|HGM420` đổi ("" → HGM420); mọi mẫu khác y nguyên.

## 2. ComAp
Tên tắt NCC ghi (quét `AMF|MRS|Inteli*|IG-|IL-|AC03`): AMF20 (22 lần, 9 NCC), AMF25 (7), AMF8 (4), AMF9 (3), IL-AMF 25 (tecgen), MRS10 (1), MRS16 (2), **AMF5 (genmac "ComAp AMF5")**, "AMF 4" (coelmo "LEXYS AMF 4.1": KHÔNG phải ComAp), IL-NT AMF20 (gordon-power), IL-NT AMF InteliGen-NTC (kaihua), InteliLITE trơn / "InteliLITE MRS15" / "InteliLITE NT MRS15", IG200 (sr-genset, powgen), AC03, InteliDrive DCU Marine, InteliVision, InteliGen 1000 Marine.
- Làm: AMF5 (đo `factsFor`: 0 → 167 dòng, mỗi dòng có `version` = InteliNano AMF5 nên "cần xác nhận đời"); InteliNano AMF 5 thành model của chính nó.
- KHÔNG gắn (theo bẫy): IG200, InteliDrive DCU; AC03 (không tờ); IL-NT AMF20 / MRS10 / MRS15 (không tờ; tờ 1001/1002 là InteliLite 4, đời khác); "InteliLITE" trơn (không biết NT hay 4).
- `ctlStep` đã có họ InteliNano (bậc 1): không đổi.

## 3. SICES
Chữ NCC ghi: quét `sices|Mecc Alte` + `GC|DST` trong `cn/` (trừ hồ sơ sices): CHƯA NCC nào ghi model BĐK SICES (chỉ thấy tên tổ máy agestar GC-350(S) / GC-500(S) / GC-600(S), gtl-power GC500-BA, kingway "Meccalt/… Controller: Deepsea/Smartgen" không model). Vẫn thêm mục cho các model CÓ TỜ (điều kiện "có NCC ghi" hiện bằng 0 — báo để điều phối quyết có giữ không; bỏ mục là bỏ khối `CONTROLLERS` SICES + 4 tiêu đề, không ảnh hưởng gì khác). Model có tờ: GC315 / GC315Plus / GC315Link (tờ 1002), GC400 (+ Link / Mains nêu trong tờ 1003), GC600 / GC600Mains (1001), DST4602Evolution (1004). GC310 / GC350 / GC500Plus: không tờ, KHÔNG đọc (vẫn nằm ở `controllers[]` cũ của hồ sơ sices, từ dòng nguồn 2001).
Khoá `modelFacts` mới: DST4602EVOLUTION 550, GC315 9.225, GC315LINK 200, GC315PLUS 200, GC400 9.026, GC600 294 dòng (GC315 và GC400 chia chung tờ 1003 9.026 dòng: số cao là của tờ, không phải 9.000 dòng riêng).

## 4. `controllers[]` rỗng + `incomplete`
- Trạng thái: ở `origin/main` 2e678d48 deif / datakom / woodward ĐÃ `status: "partial"` (không còn `incomplete`; bdk-hang-khac phần 1 đã nói; CLAUDE.md cũ lỗi thời, đã sửa). Bot không còn bỏ hồ sơ này. `verify.mjs` / `schema.json` không đòi `controllers[]` cho `partial`.
- `controllers[]` sinh bằng đường có sẵn `node suppliers/controllers.mjs <id>` (không `--crawl`, không mạng): đọc mọi nguồn đã lưu bằng `controllersIn`, mỗi mục có `line` chép nguyên văn từ nguồn (verify kiểm). KHÔNG dùng nguyên kết quả: sinh lại cả hồ sơ làm MẤT mục cũ (senci mất DEIF AGC150, genmac mất DSE G4500 / IG500, sices mất GC310 / GC350 / GC500Plus / GC315Plus: các mục cũ được tạo bởi bản code đọc cũ), nên `merge-ctl.mjs`: giữ mục cũ NGUYÊN + chỉ thêm mục mới có model và nguồn n < 6000.
- Kết quả thêm: deif AGC-150, AGC-4 (nguồn 1001; mục "ComAp (không ghi model)" từ dòng "Compatible third party controllers • ComAp" bị bỏ); datakom DKG-116, DKG-307, DKG-309, DKG-317 (317 từ dòng của tờ 307; DKG-255 "Digital Speed Controller" từ nguồn 6002 bỏ vì là bộ điều tốc); woodward easYgen-100, 1000, 1400, 1600, 1700, 1800, 3100, 3200, 3400, 3500 (easYgen-1500 / 3000 từ nguồn 6001 bỏ); smartgen +25 (HGM410, 420, 4020T, 6500, 7100A/N, 7110N, 7120N, 7200, 7210(CAN), 7220(CAN), 9310CAN/MPU, 9320CAN/MPU, 9420N/LT, 9510N, 9520N, 9530(N), 9540, 9600); comap +17 (InteliLite, InteliGen NT/NTC/4/500/1000, InteliSys NT/NTC/Gas, InteliMains, InteliNano, InteliNano AMF5, InteliLite 4 AMF8/AMF9, InteliDrive…); sices +GC315; senci +DSE8610 MKII.
- AGC 200 và SGC 420 (có tờ 1002 / 1003) KHÔNG vào `controllers[]`: không dòng nào của tờ ghi "DEIF AGC 200" / "DEIF SGC 420" (`controllersIn` của DEIF đòi chữ "deif" cùng dòng); thêm tay dòng nguồn thì trái "không bịa". Cần: dòng nguồn có chữ hãng + model, hoặc Khoa cho phép tiêu đề bảng làm dòng (chưa làm).
- `controllers[]` có tác dụng với `ctlCands` tầng 2 (phương án khác từ hồ sơ NCC) và `built.controllers`; datasheet tới Gợi ý đi qua `factsFor` (không phụ thuộc `controllers[]`).

## 5. Số đo trước / sau (gốc 2e678d48 ↔ nhánh)
| Phép đo | Trước | Sau |
|---|---|---|
| `built.controllers` (model khác nhau) | 209 | 256 (+47: gần hết từ mục `controllers[]` thêm ở mục 4; `modelFacts` không thêm bản ghi tổ máy) |
| khoá `controller:*` của `modelFacts` | 78 | 87 (+9: DST4602EVOLUTION, GC315, GC315LINK, GC315PLUS, GC400, GC600, HGM410, HGM420, INTELINANOAMF5; 0 khoá mất) |
| model NCC ghi nhận dòng qua `factsFor` (trong `controllers[]` NCC) | 69 / 136 | 71 / 136: **ComAp AMF5 0 → 167, SmartGen HGM420 0 → 1.249** (HGM410: không NCC) |
| `ctlKinds` (số model có loại) | 65 | 68; model ĐỔI loại: **0**; thêm 3: INTELINANO amf (tờ comap 1021), HGM410 start, HGM420 amf (cụm "Automatic Mains Failure" của tờ 1010 cho HGM420, "Automatic Start" cho HGM410, đọc bằng luật (a)/(b)/(c) có sẵn) |
`spec-diff git:2e678d48 .`: bản ghi 62.160 → 62.160; **0 đổi, 0 mất, 0 thêm**, 0 đảo vai (0 → 0), 0 bản ghi động cơ / đầu phát đổi (đúng dự kiến: không đụng đường đọc bảng). "Chưa đọc được" mọi dòng y nguyên.
Test: `node --test suppliers/*.test.mjs` 1.648 / 1.648 đạt (gồm `ctl-twin`, `ctl-module`, `ctl-amf`, `regress-config`, `comap-keys`, `controllers`, `catalog*`: KHÔNG fixture nào đổi, không cần cập nhật); `bdk-ten-tat.test.mjs` 4 / 4; `node --test web/test/*.test.mjs` 171 / 171; `node suppliers/quality.mjs --check`: không chỉ số nào xấu đi; `node suppliers/verify.mjs`: 436 bản ghi, 0 lỗi.

## 6. Đụng `candidates` (CHƯA đo top 30, Khoa gộp đo một lần)
- Điểm cộng "bộ điều khiển HSMT nêu đích danh" (+200 qua `trait`, check "Bộ điều khiển X (HSMT nêu đích danh)") và mọi chỗ dùng `controllersIn` trên chữ HSMT / dòng NCC: HSMT nêu "HGM420" / "HGM410" giờ đọc ra model (trước: không); HSMT / dòng nêu "ComAp AMF5" / "InteliNano" giờ đọc ra model; HSMT nêu "Mecc Alte GC315 / GC400 / GC600 / DST4602 Evolution" hoặc "SICES GC…" giờ đọc ra hãng SICES + model (trước: không hãng). Không cộng điểm nào theo datasheet BĐK ở `candidates` (A bị tắt).
- Dòng bảng NCC mang BĐK "HGM420" (maverick-generators, 7 dòng) có thể được tính thành bộ điều khiển của dòng tổ máy (cột `ctrls` của `rowsMemo`: `controllersIn(o.line)` chỉ cho dòng động cơ) — cần đo khi gộp.
- Datasheet HGM420 (1.249 dòng) và AMF5 (167) nay tới `check` / `ctlCands` / `catalogMd` ("Bộ điều khiển theo datasheet hãng") khi có NCC chào hoặc cùng hãng.

## 7. Việc chưa làm / cần quyết
- HGM1000E … HGM4125EA của Honny (tên tổ máy bị đọc là SmartGen 4 chữ số): có sẵn, 0 đổi, nên đo riêng (có thể gây điểm BĐK sai ở `candidates`).
- DEIF AGC 200 / SGC 420, Woodward easYgen-3x00XT khoá (`easYgen-3500XT` ↔ `easYgen-3500`): chưa đo qua luồng đầy đủ.
- SICES: điều kiện "có NCC ghi" chưa thoả (xem mục 3).
