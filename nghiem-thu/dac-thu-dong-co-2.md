# Nghiệm thu: Đặc thù hãng động cơ, chặng 2 — phần (a) (b) (c) (18/11/2026)

Phiên điều phối: `session_011tAj4PT2GrYzPqLYkLFfvV`. Phạm vi lượt này: (a) dữ liệu + test bảng, (b) thiết kế, (c) test. **Chưa đụng `suppliers/config-bot.mjs`, `config-prompt.md`, `web/bidprice.js`** (config-bot chờ điều phối nhắn "config-bot rảnh"); chưa chạy do-gop / gopRow, chưa chạy Gợi ý thật, không ghi web.

## 1. PR và tệp
- PR 1 DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/925 (nhánh `dac-thu-dong-co-2`, 2 commit trên `fc94789f`).
- `suppliers/engine-traits.json`: Holset, Lombardini, KOHLER Flex thêm `"filter": false` + `"filterWhy"` (Khoa 18/11/2026; Holset: turbo lắp trên nhiều hãng; hai mục Kohler: chưa soát). `exclusive` giữ `true` (đúng sự thật), không xoá mục; `note` đầu tệp ghi nghĩa trường mới.
- `suppliers/engine-traits.mjs` (MỚI, hàm thuần, không import config-bot): `filtersEngine` = exclusive + part engine + không "tên dòng" + không `filter: false` (16 mục); `isControllerTrait` = exclusive + part controller (6 mục); `MAKE_NAME` (slug → tên hãng của `catalog.js`); `traitsIn(text)` (mọi chỗ khớp, kèm bộ phận dòng đó thuộc về), `filterOf(text)` → `{ engineMake, engineTerms, engineConflict?, controllers, unused }`.
- `suppliers/engine-traits.test.mjs`: khoá `filter` / `filterWhy` (chỉ ghi `false`, bắt buộc kèm lý do có ngày Khoa).
- `suppliers/engine-traits-hsmt.test.mjs` (MỚI): nhóm 16 / 6 mục; ba mục bỏ lọc; dòng HSMT thật.
- `suppliers/engine-traits-config.test.mjs` (MỚI): test cho điều (1)–(5) ở mức config-bot, `todo` tới PR 2 (chạy được, không đỏ CI); 1 test không todo (đồng bộ vẫn đòi động cơ khi câu có ghi động cơ).
- `suppliers/CLAUDE.md`: bổ sung dòng bẫy của engine-traits (nhóm lọc, `engine-traits.mjs`, "PCC").

## 2. Lệnh kiểm và đầu ra thật
- `node --test suppliers/engine-traits.test.mjs suppliers/engine-traits-hsmt.test.mjs`: tests 16, pass 16, fail 0.
- `node --test suppliers/*.test.mjs` (trước khi thêm tệp test todo): tests 1059, pass 1059, fail 0.
- `node --test suppliers/engine-traits-config.test.mjs`: tests 9, pass 1, todo 8, fail 0.
- Kiểm fixture của test todo trên mã HIỆN TẠI (scratch `fx.mjs`): ứng viên ra cả Kubota D1105 / V1505, Yanmar 3TNV76, Perkins 403A-11G1, Caterpillar C1.1 (dropped 0); `rankConfigs` 4 cấu hình Kubota → còn 2; hai biến thể D1105-BG / D1105-E2BG cùng đạt → còn 2; `brandSyncOf` câu đồng bộ của IB2600612866 → `{need: 2, parts: [engine, alternator]}`. Tức là fixture tái hiện đúng 4 lỗi của chẩn đoán.

## 3. Đo bộ nhận biết trên toàn bộ HSMT (đo, không lấy mẫu)
Nguồn: `genbid-work\specs\*\text.txt` (1.499 gói) + `technicalSpecs` của bản chụp `doc-cache\analysis.json` (46 gói chỉ có Phân tích; dòng = `item | quote`). 1.545 gói có chữ. Script + đầu ra đủ từng dòng: `dau-vao\dac-thu-dong-co-2\scan.mjs`, `quet-tu-dac-thu.txt`.

- Lần quét 1: 25 gói có khớp; "PCC" (bí danh PowerCommand) khớp nhầm ở 6 gói (IB2300005377 "PCC net", IB2300270603 Point of Common Coupling, IB2400104800 nhãn bản vẽ, IB2500450615 "QĐ-PCC", IB2600110321 23 ô "PCC", IB2600547578 Particular conditions of contract), không ca nào là PowerCommand → bỏ "PCC" khỏi từ khớp (`NOT_MATCHED`).
- Lần quét 2: **19 gói**.
  - Lọc hãng động cơ: **đúng 3 gói, cả ba → Kubota (E-TVCS)**: IB2500189935 (chữ OCR vỡ "X áy b h ớng (E-TVCS)"), IB2500416364, IB2600612866 (từ Phân tích). 0 gói hai hãng, 0 gói từ động cơ ngoài khối động cơ.
  - Từ bộ điều khiển (điều 5, không lọc hãng): 16 gói — AmpSentry 6 (IB2400100405, IB2400216847, IB2400285076, IB2400333932, IB2500039578, IB2500102600), PowerCommand 4 (IB2300230061 khối bộ điều khiển; IB2400166974, IB2500197652, IB2600362632 "Bộ powercommand 2.2" là gói VẬT TƯ máy Cummins C500), EMCP 5 (IB2400073077 "Màn hình điều khiển EMCP 4.2B" là vật tư; IB2300114016, IB2400216498, IB2500340280, IB2600570346 là gói bảo trì máy CAT hiện hữu), ADEM 1 (IB2300023194, ECM của động cơ Cat trong yêu cầu kỹ thuật).
  - Gói vật tư / bảo trì không chạy Gợi ý cấu hình tự động (gói dịch vụ không tự Gợi ý; vật tư do luật tên gói). Nếu ai bấm tay Gợi ý cho chúng thì điều (5) sẽ áp; chưa kiểm luật tên gói với từng gói trên.

## 4. Thiết kế PR 2 (mã), mỗi điều nối vào đâu

Nguyên tắc chung: một lần đọc ở `hintsOf` → `hints.trait = ET.filterOf(technicalPart(text))`; `check` đọc lại từ `hsmtText` (không tin agent) và ghi `result.engineTrait` / `result.ctrlTrait` để `rankConfigs`, web, `keepFound` thấy. Mọi chữ hiện cho người xem nói "HSMT ghi <từ> (đặc thù của <hãng>)", không in câu trích nguồn NCC.

**HSMT nhận biết "yêu cầu động cơ" bằng gì (đã có trong PR 1):** dòng có từ thuộc khối động cơ khi (i) chính dòng đó có nhãn hàng của động cơ (buồng đốt, kiểu phun, hệ thống nhiên liệu, turbo / tăng áp, điều tốc, loại / kiểu động cơ, combustion, injection…), hoặc (ii) tiêu đề phần gần nhất phía trên là động cơ ("II Yêu cầu đối với động cơ", nhận cả chữ OCR vỡ "Yê cầ đối với động cơ"), hoặc (iii) dòng đứng dưới tiêu đề tổ máy / đầu phát mà hai dòng quanh nó có nhãn động cơ và không có nhãn bộ điều khiển. Dòng có nhãn bộ điều khiển thì là khối bộ điều khiển. Không có "tương đương / equivalent / hoặc tốt hơn" trong dòng đó và hai dòng kề. Giới hạn biết trước: nhãn "buồng đốt" ở MỌI phần (kể cả "tài liệu tham khảo" của tủ ATS) vẫn tính là yêu cầu động cơ (có test ghi rõ); 1.545 gói hiện không có ca nào như vậy.
**"Yêu cầu bộ điều khiển":** điều (5) theo Khoa không lọc hãng, nên từ bộ điều khiển ở BẤT KỲ phần nào (kể cả ADEM nằm trong khối động cơ của IB2300023194) đều tính là HSMT nêu bộ điều khiển đó.

| Điều | Nối vào | Cái đã có | Cái phải làm mới |
|---|---|---|---|
| (1) chỉ hãng đó | `hintsOf`: thêm `trait`; nếu `trait.engineMake` thì thêm hãng vào `engineMakes` (có sẵn: bỏ trần `MAKE_CAP`, bỏ suất `CN_ROWS` / `MAKE_ROWS`, +300 điểm). `candidates`: dòng có `e.make` (tách " / ") không chứa hãng đó → `dropped` với `ruled: ["trait"]` + lý do "HSMT ghi E-TVCS (đặc thù Kubota)"; trừ dòng `named` (HSMT nêu model) như các luật loại khác. `prep` / input.md: mục mới "Đặc thù hãng động cơ" (từ, dòng HSMT, hãng) cho agent. `check`: bỏ cấu hình có động cơ hãng khác (`problems` "động cơ X không phải Kubota, HSMT ghi E-TVCS"), trừ tổ máy HSMT nêu đích danh; ghi `result.engineTrait = {make, terms, quote}`. `rankConfigs`: `perMakeConfigs(mk)` trả vô hạn khi `mk` = `result.engineTrait.make` (vẫn giữ trần 8 cấu hình và 3 / động cơ). `config-prompt.md`: câu "khi input.md có mục Đặc thù hãng động cơ: chỉ động cơ hãng đó, được nhiều hơn 2 cấu hình; tìm internet cũng chỉ hãng đó" (sửa cùng luật ở prompt và code, theo bẫy của `suppliers/CLAUDE.md`). | `engineMakes` + mọi nhánh "HSMT nêu hãng"; `perMakeConfigs`; khuôn bỏ cấu hình + `noteDropped` | `hints.trait`; luật loại `trait` trong `candidates`; mục input.md; lọc trong `check`; `result.engineTrait`; câu prompt |
| (2) internet 100–140% | `check` (và `keepFound`, vì cấu hình internet của lượt trước được giữ): cấu hình có `genset.src.kind === "internet"` (hoặc động cơ internet khi không có genset) → đọc công suất prime (không có thì standby ÷ 1,1, như `gap` trong `candidates`) bằng hàm mới `webPowerOf(c, readWeb)`: `ratedPower` trên câu trích công suất của check công suất / `genset.src.quote`, câu trích phải có trong trang đã lưu. Ngoài `bandOf(cap)` → bỏ, `problems` + `noteDropped` "công suất 13 kVA = 153% công suất gói, ngoài dải 100–140%". Không đọc được → giữ (đã có nhãn "Công suất chưa xác nhận"). `check` hiện KHÔNG nhận `cap`: thêm vào tham số (prep đã biết `cap`, ghi vào meta.json của lượt; `checkDir` đọc lại). Prompt bước 4: thêm "cấu hình internet cũng phải trong dải của mục Ứng viên". | `bandOf`, `inBand`, `ratedPower`, `noteDropped`, `isWebCfg` | `webPowerOf`; `cap` cho `check` / `checkDir` / `keepFound`; câu prompt |
| (3) biến thể | `rankConfigs`, sau khi chấm: nhóm cấu hình theo `variantFamily(engine.model)` = phần mã trước dấu "-" / "/" đầu tiên, đã `keyOf` ("D1105-E2BG-CHN-1/8.4KW" → D1105; V1505-E2BG ≠ D1105-E2BG). Trong một nhóm ≥ 2 cấu hình: (a) nếu có cấu hình không có `not_met` ở động cơ và có cấu hình có `not_met` ở động cơ → bỏ cái có `not_met` ("chỉ chọn cái có thông số phù hợp"); (b) các cấu hình còn lại có cùng thông số động cơ (cùng tập trạng thái các check động cơ, và cùng số `modelFacts` của các khoá công suất động cơ, dung tích, xi lanh, đường kính × hành trình, tốc độ, nơi có số) → giữ cái xếp cao nhất, chuyển NCC của cái kia sang (như luật "cùng động cơ + đầu phát" có sẵn); khác thông số mà cùng đạt → giữ cả hai. Chỉ ở bước chọn cấu hình, không gộp bản ghi danh mục (đúng cách hiểu đã ghi ở bộ nhớ). Không đổi `candidates` (để top 30 các gói khác không đổi). | khuôn gộp "một cấu hình mỗi động cơ + đầu phát + BĐK" trong `rankConfigs`; `modelFacts` | `variantFamily`; luật nhóm biến thể |
| (4) đồng bộ chỉ bộ phận HSMT ghi | `web/bidprice.js` `brandSyncOf` (dùng chung web + bot + Gợi ý giá): `parts` chỉ lấy từ cụm liệt kê gắn liền trước chữ "cùng một nhãn hiệu / hãng…": đi lùi từng mảnh (tách bởi "," ";" "và" "/") khi mảnh là bộ phận / vỏ / tổ máy, DỪNG ở mảnh có vị ngữ khác (thương hiệu, nhãn hiệu, xuất xứ, G7 / G20, hãng). IB2600612866: "đồng bộ động cơ thương hiệu G7, đầu phát và vỏ chống ồn đồng bộ cùng một nhãn hiệu" → dừng ở "động cơ thương hiệu G7" → chỉ còn đầu phát. Luật "đồng bộ 2 trong 3" (SYNC_N) không đổi. | `brandSyncOf`, `syncCheck`, `SYNC_ROWS` | sửa `brandSyncOf` + test ở cả `suppliers/` và `web/test` (Gợi ý giá dùng `SYNC_TAG`); đo `brandSyncOf` trước / sau trên 1.545 gói |
| (5) bộ điều khiển đích danh | `hintsOf`: `trait.controllers`; `catalogMd` / `ctlLookupMd`: đẩy bộ điều khiển có từ đó lên (như `ctrlModels` +1000 hiện có); `candidates`: dòng mà bộ điều khiển dòng / NCC chào khớp từ đó → +200 như `ctrlNamed` (KHÔNG loại dòng, KHÔNG đụng hãng động cơ); prompt: "HSMT nêu bộ điều khiển <từ>: bộ điều khiển của mọi cấu hình là <từ>"; `check`: check của code "Bộ điều khiển HSMT nêu đích danh" — đạt khi model / dòng nguồn bộ điều khiển có từ đó, không thì không đạt (xếp sau). Dữ liệu NCC hiện có: PowerCommand 2 NCC, EMCP 1, ADEM 6, AmpSentry / KODIA / EVC 0 → phần lớn phải tìm internet. | `ctrlNamed`, `noController`, xếp hạng theo không đạt bộ điều khiển | `trait.controllers` trong ứng viên / danh mục BĐK / prompt; check của code |

**Đo phải chạy ở PR 2 (chờ điều phối cho phép):** top 30 + regress toàn bộ gói, gopRow main ↔ nhánh trên CÙNG dữ liệu (mẫu `lech-cot-9-2.md`). Kỳ vọng đổi top 30: (1) 3 gói E-TVCS; (5) tối đa 16 gói có từ bộ điều khiển (chỉ thứ tự / tập do +200); (4) các gói mà `brandSyncOf` đổi kết quả (đếm trước khi đo); (2) và (3) không đụng `candidates` → 0. Mọi gói khác: top giống hệt. Sau đó: `check` lại lượt IB2600612866 (thư mục lượt 17/11 đã bị dọn khỏi `%TEMP%\genbid-config\`; cần kết quả lưu `configmatch/IB2600612866` + chữ HSMT trên web, chỉ ĐỌC) và Gợi ý thật IB2600612866 (tốn agent ~3 USD, ghi web: phải hỏi điều phối).

## 5. Câu cần Khoa quyết (viết sẵn để điều phối chuyển)
1. **(4) IB2600612866 "đầu phát và vỏ chống ồn đồng bộ cùng một nhãn hiệu":** bỏ động cơ là chắc (Khoa đã chốt). Còn đầu phát: em đề xuất vẫn đòi "đầu phát cùng nhãn hiệu tổ máy" (1/1 bộ phận) thay vì bỏ hẳn yêu cầu đồng bộ. Hiện code bỏ hẳn yêu cầu khi còn dưới 2 bộ phận. Anh chọn: (a) đòi đầu phát cùng hãng tổ máy, hay (b) không đòi gì?
2. **(5) bộ điều khiển đích danh, cấu hình không có bộ điều khiển đó:** em đề xuất tính "không đạt" ở bộ điều khiển (xếp sau, vẫn hiện) chứ không bỏ cấu hình, vì danh mục chỉ có 2 NCC ghi PowerCommand, 1 ghi EMCP, 0 ghi AmpSentry: bỏ hẳn thì đa số gói AmpSentry sẽ không còn cấu hình nào trước khi tìm internet. Anh đồng ý, hay muốn bỏ hẳn?
3. **(1) HSMT ghi "E-TVCS hoặc tương đương":** hiện chưa gói nào ghi vậy. Em đề xuất không lọc hãng (chỉ cộng điểm như HSMT nêu hãng). Anh đồng ý?
4. **(3) cách nhận "biến thể cùng động cơ":** em lấy phần mã trước dấu "-" / "/" đầu tiên (D1105-BG, D1105-E2BG-CHN-1 cùng nhóm D1105). Cách này cũng gom Perkins 4006-23TAG2A / 4006-23TAG3A, Cummins QSK60-G3 / QSK60-G4 thành một nhóm (thông số khác nhau → chỉ giữ cái đạt HSMT, cùng đạt thì giữ cả hai). Anh đồng ý phạm vi này, hay chỉ áp cho hậu tố phiên bản (BG, E2BG, CHN…) mà không áp cho hậu tố công suất (G3 / G4, TAG2A / TAG3A)?

## 6. Ba mẫu đối chiếu với nguồn gốc
1. IB2500416364 `genbid-work\specs\IB2500416364\text.txt` dòng 333 "II Yêu cầu đối với động cơ", dòng 339 "Xoáy ba hướng (E-TVCS) giúp hòa trộn" → `filterOf` Kubota. Nguồn đặc thù: https://engine.kubota.com/products/detail?id=58&ln=en — "Kubota’s original E-TVCS (Three Vortex Combustion System)".
2. IB2400100405 `text.txt` dòng 105 "+ Tích hợp phần mềm AmpSentry bảo vệ đầu phát …" → bộ điều khiển AmpSentry, không lọc hãng. Nguồn: https://www.cummins.com/en-na/generators/generator-set-controls — "Backed by Cummins AmpSentry™, the controls will always protect themselves…".
3. IB2600547578 `text.txt` dòng 212 "PCC Particular conditions of contract" → KHÔNG khớp PowerCommand sau khi bỏ "PCC" (trước: khớp nhầm).

## 7. Rủi ro còn lại + quay lui
- PR 1 không đổi hành vi bot (chưa ai import `engine-traits.mjs`; test todo không đỏ). Quay lui: revert PR.
- Nhận biết dựa vào nhãn / tiêu đề: HSMT có từ đặc thù ở phần khác mà dòng có nhãn "buồng đốt" vẫn tính là yêu cầu động cơ (test ghi rõ giới hạn). Từ lạ ngoài bảng 112 mục thì không nhận (giới hạn của chặng 1).
- Dòng ứng viên có hãng động cơ "chưa rõ" (`makeConflict`) sẽ bị loại khi lọc theo hãng (điều 1): đo PR 2 sẽ cho thấy có dòng Kubota nào bị mất vì thế không.

## 8. Việc chưa kiểm được
- Chữ HSMT đầy đủ của IB2600612866 (chỉ có Phân tích trong máy; `text.txt` không có, thư mục lượt Gợi ý 17/11 đã bị dọn): test dùng câu trích của Phân tích.
- Chưa đo top 30 / regress (chờ PR 2 và điều phối cho phép). Chưa chạy `check` / Gợi ý IB2600612866.

## 9. Lượt 2 (sau khi #925 merge `270b4eb4`): đo điều (4) và chuẩn bị điều (3)
Nhánh `dac-thu-dong-co-2b` (từ `270b4eb4`, đã đẩy, CHƯA mở PR). `web/bidprice.js` chỉ là bản nháp trong worktree `wt-dac-thu-2`, lúc đó chưa commit (sau thành PR 2a, mục 10; tệp diff nháp đã xoá).

### 9a. `brandSyncOf` main ↔ bản nháp, 1.545 gói (đo, mọi gói)
Script `dau-vao\dac-thu-dong-co-2\sync-ab.mjs`, đầu ra đủ `sync-ab.txt`. Chữ: `text.txt` (1.499), không có thì dòng Phân tích `item | quote` (46).
- Bản nháp 1 (đi lùi từng mảnh từ chữ "cùng…"): làm mất 29 câu đồng bộ ĐÚNG ("được thiết kế, sản xuất, lắp ráp bởi cùng…", "ắc quy và vỏ…", "Cùng thương hiệu với đầu phát") → bỏ.
- Bản nháp 2 (đang để trong worktree): cắt câu ở "," ";", một bộ phận KHÔNG tính khi mọi mảnh có nó đều gắn vị ngữ xuất xứ khác ĐỨNG SAU nó (G7 / G20 / EU, xuất xứ, nước sản xuất, châu Âu) và không chứa chữ "cùng…". Kết quả:

| Loại | Số gói |
|---|---|
| Không có đồng bộ ở cả hai | 1.433 |
| Có đồng bộ, giống hệt main | 85 |
| main có, nháp KHÔNG (động cơ bị bỏ, còn 1 bộ phận < 2 nên không còn yêu cầu) | **2: IB2500416364, IB2600612866** (cùng câu "đồng bộ động cơ thương hiệu G7, đầu phát và vỏ chống ồn đồng bộ cùng một nhãn hiệu") |
| Đổi bộ phận khác | 0 |

- Câu 1 của Khoa (đòi đầu phát 1/1 hay bỏ hẳn): MAIN HIỆN ĐÃ bỏ mọi câu chỉ nêu một bộ phận (cần ≥ 2). Nếu Khoa chọn (a) "đòi 1 bộ phận", ngoài 2 gói trên còn **25 gói** hôm nay không có yêu cầu đồng bộ sẽ có (danh sách + câu trong `sync-ab.txt`, nhóm "1 bộ phận"), trong đó ít nhất 4 là câu KHÔNG phải yêu cầu tổ máy: IB2300188511 và IB2500102600 (tủ trung thế / SMD), IB2600126365 và IB2600304011 (thang điểm "15 điểm: hãng đầu phát cùng hãng tổ máy"). Tức là (a) cần thêm luật lọc câu, không chỉ đổi ngưỡng. Đề xuất cho điều phối chuyển Khoa: chọn (b) cho lần này (2 gói thành "không đòi đồng bộ"), còn "đòi 1 bộ phận" là việc riêng nếu Khoa muốn.
- Test sau bản nháp: `node --test suppliers/*.test.mjs` 1068 tests, pass 1060, todo 8, fail 0; `node --test web/test/*.test.mjs` 161 / 161.

### 9b. `variantFamily` (`suppliers/engine-variant.mjs` + `engine-variant.test.mjs`, 6 / 6 pass)
Hàm thuần, tham số `scope` ∈ {"all", "version"} để chọn theo câu 4 của Khoa; luôn bỏ công suất ghi dính sau "/" ("D1105-E2BG-CHN-1/8.4KW"). Đo trên danh mục (`CAT.build` của `suppliers/cn`, 6.860 động cơ; danh sách đủ `dau-vao\dac-thu-dong-co-2\nhom-bien-the.txt`):

| Phạm vi | Nhóm ≥ 2 model | Model trong nhóm | D1105 / V1505 | QSK60-G3 / G4 | 4006-23TAG2A / 3A | 403A-11G1 / 403A-15G1 |
|---|---|---|---|---|---|---|
| all (phần trước "-" / "/") | 702 | 2.827 | một nhóm (6 model mỗi cái) | một nhóm (24 model) | một nhóm (15) | MỘT nhóm (1,1 L và 1,5 L là hai động cơ khác) |
| version (chỉ bỏ BG, E2BG, CHN, EU, hậu tố 1 chữ số, công suất sau "/") | 177 | 455 | một nhóm | hai | hai | hai |

Thêm bằng chứng cho câu 4: "all" còn gộp V2003-T (turbo) với V2003 (không turbo). Hậu tố 2 chữ số là công suất (ZCDL-15 / -18, N4105DS-38 / -46) nên "version" không bỏ. Em đề xuất "version".

## 10. Khoa quyết 18/11/2026 (4 câu mục 5) và PR 2a
**Quyết định (điều phối chuyển):** (1) câu chỉ còn một bộ phận: (b) KHÔNG đòi gì (giữ ngưỡng ≥ 2 bộ phận; sửa `brandSyncOf` chỉ để bỏ động cơ khi HSMT không ghi động cơ). (2) HSMT nêu đích danh bộ điều khiển mà cấu hình không có: (a) KHÔNG ĐẠT ở bộ điều khiển, xếp sau, vẫn hiện, không bỏ cấu hình. (3) "E-TVCS hoặc tương đương": KHÔNG lọc hãng, chỉ cộng điểm như HSMT nêu hãng. (4) biến thể: (b) chỉ gom hậu tố PHIÊN BẢN (scope "version"), KHÔNG gom hậu tố công suất (G3 / G4, TAG2A / TAG3A).

**PR 2a DRAFT:** https://github.com/khoanguyenminh6868/GenSet-Pro/pull/928 (nhánh `dac-thu-dong-co-2a` từ `270b4eb4`). Tệp: `web/bidprice.js` (`brandSyncOf` + `syncListParts`), `suppliers/bidprice.test.mjs`, `suppliers/engine-traits-config.test.mjs` (bỏ todo điều 4, giờ đòi `null`), `suppliers/CLAUDE.md`. Không đụng config-bot.
- Sau mục 9a còn một chỉnh: đo trên lô lịch sử cho thấy chữ "Xuất xứ" trơ là NHÃN MỤC ("Động cơ: Xuất xứ, nhãn hiệu, năm sản xuất: Nhà thầu đề xuất; cùng nhãn hiệu với đầu phát điện", bidhist IB2400153322) → lần đó động cơ bị bỏ sai. Đã thu hẹp: chỉ NHÓM nước (G7 / G20 / EU / châu Âu / nước công nghiệp phát triển) mới tính.
- Đo cuối (đo, mọi gói): 1.545 HSMT: đồng bộ ở main 87 → đổi 2 (IB2500416364, IB2600612866: hết yêu cầu), giữ 85, gói khác 0 (`dau-vao\dac-thu-dong-co-2\sync-ab.txt`). Lô lịch sử (`doc-cache\bidhist.json` chụp 18/11, 1.556 gói / 1.627 lô; chữ ghép như `candidates` của bidprice: tên lô / gói + `config.text` + hàng trúng): 127 lô có nhãn "đồng bộ thương hiệu" → đổi 1 (IB2500189935, cùng câu G7 như hai gói trên) (`sync-hist.txt`, script `sync-hist.mjs`).
- Ảnh hưởng Gợi ý giá (`SYNC_TAG`): gói đang tính không còn nhãn → so công suất ±5% (`POWER_TOL`) thay ±10% (`SYNC_POWER_TOL`) và bỏ phạt 0,6 cho lô không đồng bộ; lô lịch sử mất nhãn → khi tính một gói CÓ đồng bộ, lô đó bị phạt 0,6 (xếp xa hơn). Chỉ có hiệu lực khi Gợi ý giá chạy lại; kết quả đã lưu không đổi.
- Kiểm: `node --test suppliers/*.test.mjs` 1070 tests, pass 1063, todo 7, fail 0; `node --test web/test/*.test.mjs` 161 / 161.
- Quay lui: revert PR (một hàm + test).

**Nhánh `dac-thu-dong-co-2b`**: xem mục 11.

## 11. PR 2b (nối config-bot) — code + test xong, CHƯA đo
**PR DRAFT:** https://github.com/khoanguyenminh6868/GenSet-Pro/pull/930 (nhánh `dac-thu-dong-co-2b` trên `3c0a49ff`, 3 commit: `variantFamily` + nối config-bot `270fb443`). Tệp: `suppliers/config-bot.mjs`, `engine-traits.mjs` (`load` nhớ bảng, `termHit`), `engine-variant.mjs` (+ test), `engine-traits-config.test.mjs`, `cover-prep.test.mjs` (meta.json có `cap`), `config-prompt.md`, `suppliers/CLAUDE.md`.
- (1) `hintsOf().trait`; `candidates` `ruled: "trait"` (trừ model HSMT nêu); `check` bỏ cấu hình động cơ hãng khác / chưa rõ hãng TRƯỚC `slice(MAX_CONFIGS)` (hãng = `keptMakes` của model, không có thì `make` agent ghi khi nguồn ghi; tổ máy HSMT nêu giữ), `result.engineTrait {make, terms, quote}` + ghi chú; `rankConfigs` không áp trần mỗi hãng cho hãng đó. Tương đương → không lọc (câu 3).
- (2) `webPowerOf` / `webInBand`: chỉ `genset.src.kind === "internet"`, số đọc từ `src.quote` hoặc `sourceQuote` của check công suất, câu phải có trong trang đã lưu; không đọc được số thì GIỮ. `cap` từ `meta.json` (prep ghi; lượt cũ không có `cap` thì không lọc).
- (3) `variantRule` trong `rankConfigs` (sau khi xếp): cùng `variantFamily` (version) mà khác model — bỏ bản có check động cơ `not_met` khi có bản không; check động cơ giống hệt (item + status) + cùng đầu phát → giữ bản xếp cao, chuyển NCC. So bằng check, KHÔNG bằng số liệu (số liệu biến thể lệch theo NCC nào ghi). Miễn keptFind / named.
- (5) Yêu cầu + check "Bộ điều khiển X (HSMT nêu đích danh)" do code ghi (`trait`), met / unclear (cùng hãng, nguồn không ghi: AmpSentry với PowerCommand) / not_met (câu 2 (a)). `termHit` trên chữ chào hàng tính cả "PCC".
- Kiểm: `node --test suppliers/*.test.mjs web/test/*.test.mjs` 1.246 / 1.246, todo 0; fixture `regress-*` không đổi.
- **Chưa làm (chờ điều phối cấp lượt đo):** do-gop / top 30 toàn bộ gói (gốc = main lúc đo, cùng `suppliers/cn`, truyền `blocked`); kỳ vọng: đổi ở 3 gói E-TVCS, ≤ 16 gói có từ bộ điều khiển (chỉ điểm +200, không loại dòng), 0 gói khác. Gợi ý thật IB2600612866 (ghi web, tốn agent): chờ hỏi.
- Quay lui: revert PR #930.

### 11a. Đo trước cho 19 gói có từ đặc thù (điều phối cho phép, một tiến trình, 18/11)
Script `dau-vao\dac-thu-dong-co-2\do-19.mjs` (như `lech-cot-11\do-gop-rf.mjs`: blocked = `blockedRows(sups, {})`, GENBID_SPEC_NORM=1, cn của `wt-lc11-base` = 3c0a49ff), hai chữ mỗi gói: "hist" = Chương V lô lịch sử (chữ do-gop dùng), "hsmt" = chữ HSMT cả bộ (`genbid-work\specs`), không có thì dòng Phân tích. Gốc `wt-lc11-base` (3c0a49ff) ↔ nhánh `wt-dac-thu-2`. So: `cmp-19.mjs` → `cmp-19.txt` (mọi dòng vào / ra / đổi điểm). 49 lượt: 35 không đổi, 6 lượt hai bên cùng không đọc được công suất (IB2400166974, IB2500197652, IB2600362632, IB2600570346: gói bảo trì / vật tư), 8 lượt đổi:
- **E-TVCS (3 gói, đúng luật 1):** IB2500189935 hist và IB2600612866 (cùng chữ, 8,5 kVA): top 24 → 1, 34 dòng loại `trait` (Perkins 8, Kohler 4, Mitsubishi 2, Lister Petter 4, Caterpillar 1, không rõ hãng 4…); còn denyo D1403K3A (Kubota), điểm 136 → 461 (+300 hãng HSMT nêu… ). Catalog chỉ có 2 dòng Kubota trong dải cho chữ này (cũng 36 dòng tất cả ở gốc) → agent phải tìm internet chỉ Kubota. IB2500189935 hsmt: top 30 → 20, toàn Kubota (D1105 / V1505 / D905 các biến thể, wintpower, comappower, mecca-power, long-gen, genlitec, depco, suneco, yanan…), 190 dòng loại `trait`. IB2500416364: hist không có từ (Chương V bị cắt), hsmt có Kubota nhưng không đọc được công suất cả hai bên (top 0) → không đổi.
- **EMCP (IB2300114016, IB2400216498, IB2500340280, cỡ 320 kVA, cùng danh mục):** mỗi lượt 1 dòng vào / 1 dòng ra: jiuan-power 2206CE13TAG2 (220 → 420: dòng của chính nó ghi "Controller | DSE7320 / EMCP4.4") vào #3, uleengen 2206CE13TAG2 (275, #30) bị chen ra. Đây là luật (5) +200, đúng. Gói này là bảo trì máy CAT hiện có; không loại dòng nào.
- AmpSentry / PowerCommand / ADEM: không đổi (không dòng nào trong dải ghi từ đó).
- Không lượt nào ngoài 19 gói được đo ở đây (đợi do-gop toàn bộ).

### 11b. `check` lại configmatch/IB2600612866 đã lưu (chỉ đọc web), nhánh 2b
Script `rechk-612866.mjs` → `rechk-612866-2b.txt`. Lưu 17/11: 5 cấu hình (CAT C1.1, Kubota D1105, Denyo DCA-15LSX/V2203 internet, Perkins 403A-11G1, Yanmar 3TNV76). Sau check + rankConfigs (byCode gỡ trước, cap 8,5 kVA): còn 1 — Kubota D1105 (wintpower, agestar). Bỏ: CAT / Perkins / Yanmar vì E-TVCS (luật 1); Denyo vì NCC đặt tại JP ngoài nhóm Trung Quốc (luật xuất xứ cũ, câu trích của nó không có số công suất nên dải không xét được). Kubota SQ-1120 / K-13 lượt đó bị trần mỗi hãng bỏ — lượt mới không còn trần cho Kubota. Ra V1505 cần Gợi ý thật (agent): chờ PR merge + bot kéo main (điều phối nhắn).
- Câu 2 (a) "BĐK cùng hãng, nguồn không ghi từ → chưa rõ": điều phối đồng ý 18/11, đã ghi chú thích mã (commit `138ea814`).

## 12. Đo top 30 toàn bộ gói (do-gop, 18/11/2026 20:35–22:35)
- Gốc: `lech-cot-11\gop-main.json` của Lệch cột 11 (code `wt-lc11-base` = main `3c0a49ff`, cn của `wt-lc11-base`, `do-gop-rf.mjs` truyền blocked = `blockedRows(sups, {})`, ghi `all` + điểm), chép nguyên (sha1 `fdde5db491a9…`) thành `dau-vao\dac-thu-dong-co-2\gop-main-3c0a49ff.json`. Nhánh: cùng script, cùng cn, code `wt-dac-thu-2` (`dac-thu-dong-co-2b` @ `138ea814` = 3c0a49ff + 4 commit, KHÔNG đụng `web/catalog.js` / `web/bidprice.js` / `suppliers/cn`) → `gop-2b.json` (1.093 lượt, 7.155 s, một tiến trình; lần đầu bị dừng ở ~500 gói vì RAM trống < 1 GB khi Lệch cột 11 còn chạy, chạy lại từ đầu sau khi hai tiến trình đó thoát). So: `cmp-gop.mjs` → `cmp-gop.txt` (mọi lượt: tập + thứ tự top 30, điểm của MỌI dòng trong `all`, số dòng bị loại).
- **Kết quả: 1.093 lượt, 1.092 không đổi gì (cả top, điểm mọi dòng, all, dropped), 1 lượt đổi: IB2500189935#0.** Không gói nào khác đổi, kể cả điểm ngoài top.
- **IB2500189935#0** (8,5 kVA, Chương V có "Xoáy ba hướng (E-TVCS)" ở yêu cầu động cơ → `filterOf` = Kubota; luật 1): top 24 → 1, all 36 → 2, dropped 0 → 34. Giải thích từng dòng:
  - 22 dòng RA vì loại `trait` (hãng khác / chưa rõ hãng): Perkins 403D11G / 403A11G1 / 403D15G / 403A11G (bruno-generators, genmac ×2, elcos, powerco-systems, aj-power, tecnogen, cgm-italia), Kohler KDW1003 / KWD1404 / KDW1404 (bruno-generators, genmac, cgm-italia, tecnogen), Caterpillar C1.1 (caterpillar), Mitsubishi S3L2SD (tecnogen ×2), Lister Petter LP311 / SA315 / TR2 (lister-petter ×4), không rõ hãng 403D11G DERATE / 403A15G1 DERATE / 403A15G2 DERATE (aj-power ×3), 3TNV80FNGB (cgm-italia; catalog không gán hãng). Cộng 12 dòng ngoài top: 34 dòng `ruled: trait` (do-19 cùng chữ: `trait_dropped` 34).
  - Còn 2 dòng Kubota, cả hai là denyo D1403K3A: "88/110KVA" 161 → 461 VÀO #1, "(KVA)STANDBY…" 136 → 436 RA khỏi top (#8 ở gốc). +300 = "hãng động cơ Kubota HSMT nêu" (hintsOf thêm hãng của từ đặc thù vào `engineMakes`). Dòng thứ hai không vào top vì cùng NCC + cùng động cơ với dòng thứ nhất (trần dòng mỗi NCC / động cơ của `pick`, như gốc).
- **Đối chiếu kỳ vọng** ("3 gói E-TVCS, ≤ 16 gói bộ điều khiển, 0 gói khác"): do-gop chỉ đo gói mua sắm có Chương V trong bidhist (`bidKind === "supply"`), nên 19 gói có từ chỉ có 10 gói trong tập đo:
  - E-TVCS: IB2500189935 đổi (trên). IB2600612866 không có trong bidhist (gói mới; đo riêng ở 11a / 11b: cùng chữ, cùng kết quả). IB2500416364 có trong tập nhưng Chương V lô lịch sử không có chữ E-TVCS (từ chỉ ở HSMT cả bộ, mà gói này hai bên đều không đọc được công suất) → không đổi.
  - Bộ điều khiển: 7 gói trong tập (IB2300230061 PowerCommand; IB2400100405, IB2400216847, IB2400285076, IB2400333932, IB2500039578, IB2500102600 AmpSentry) đều KHÔNG đổi: không dòng nào trong dải công suất của chúng ghi từ đó, nên +200 không cộng cho dòng nào. 3 gói EMCP (bảo trì máy CAT, có đổi 1 vào / 1 ra ở 11a) và ADEM không thuộc tập do-gop (không phải gói mua sắm).
  - 0 gói khác: đúng (1.083 gói không có từ đặc thù, không đổi một điểm nào; luật 3 biến thể và luật 2 dải internet nằm ở `rankConfigs` / `check`, không đo bằng do-gop).
- PR #926 (Lệch cột 11, `web/catalog.js`) merge trước thì em rebase + chạy lại test; số đo này vẫn dùng được vì diff của 2b không đụng `catalog.js` (đổi do catalog.js là phần của Lệch cột 11, đo riêng ở gốc của nó).

## Cần ghi nhớ
- Bí danh "PCC" không dùng để nhận PowerCommand trong chữ HSMT (bẫy đã ghi `suppliers/CLAUDE.md`); trong chữ chào hàng thì dùng.
- Unclear thay vì not_met cho "bộ điều khiển cùng hãng, nguồn không ghi từ đó" là cách em hiểu câu 2 (a) — nếu Khoa muốn not_met cứng thì đổi một dòng trong `check`.
