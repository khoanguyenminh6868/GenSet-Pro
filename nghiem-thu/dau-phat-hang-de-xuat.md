# Đầu phát chọn theo datasheet hãng: đề xuất thiết kế (bước 1: chỉ đọc + đề xuất, chưa sửa code)

Ngày 20/11/2026. Việc: Gợi ý cấu hình được chọn ĐẦU PHÁT từ datasheet hãng khi dòng tổ máy của NCC không ghi đầu phát, hoặc ghi đầu phát không đạt HSMT. Khoa 20/11/2026: "miễn sao đạt yêu cầu của hsmt thì cứ gợi ý". Code đọc tại `origin/main` 54d4309f (worktree `wt-dauphat-doc`, chỉ đọc). Script đo: `genbid-work\dieu-phoi\dau-vao\dau-phat-hang\` (`kho.mjs`, `hsmt.mjs`, `dai-kva.mjs`, `ls-parse.mjs`; đầu ra `kho.json`, `hsmt.json`).

## Câu hỏi cần Khoa quyết (mỗi câu có khuyến nghị)

1. **NCC có ghi đầu phát nhưng đầu phát đó KHÔNG ĐẠT** (ca gốc: dòng NCC ghi LSA 49.3 M6, 730 kVA < 750 kVA HSMT đòi). (a) Thay bằng đầu phát hãng đạt (M8), ghi "NCC chào M6, không đạt công suất; đề xuất M8 theo datasheet hãng"; (b) giữ M6 và gắn cảnh báo. **Khuyến nghị (a)**: đúng ý "miễn đạt thì cứ gợi ý", và cấu hình vẫn hiện NCC đã chào gì.
2. **NCC ghi đầu phát nhưng hệ thống không có số liệu của nó** (check "chưa rõ", không phải "không đạt"). (a) Giữ đầu phát NCC chào; (b) thay bằng đầu phát hãng đạt rõ ràng. **Khuyến nghị (a)**: đầu phát thật NCC chào có giá trị hơn. Chỉ thay khi hệ thống chứng minh được là không đạt.
3. **So kVA ở cột nào của bảng hãng.** Khuyến nghị: cột chạy liên tục (Continuous, tương ứng prime), cấp H, độ tăng nhiệt 125 K, nhiệt độ môi trường 40 °C (Leroy-Somer "Continuous duty/40°C H/125°K"; Stamford "Cont. H - 125/40°C"), đúng tần số HSMT, 3 pha. Đọc ở MỌI điện áp HSMT nêu (380/400/415 V…), lấy số NHỎ NHẤT. Điều kiện: số đó ≥ công suất prime tổ máy HSMT đòi (và ≥ công suất riêng của đầu phát nếu HSMT ghi). Không dùng cột Standby. HSMT chỉ đòi cấp F thì dùng cột F 105 K. Chỉ lấy model nhỏ nhất đạt, mỗi hãng tối đa 2 model, không quá 130 % mức cần (để không gợi ý 1.250 kVA cho gói 750).
4. **Xuất xứ đầu phát khi HSMT đòi G7 / EU** (27 gói: 20 đòi nơi sản xuất, 7 đòi thương hiệu). Không có dòng NCC nên không biết nhà máy. Khuyến nghị: theo nơi sản xuất mặc định của hãng (Khoa chốt 16/11: Leroy-Somer Pháp, Stamford Anh, Mecc Alte Ý). HSMT đòi thương hiệu → "đạt". HSMT đòi nơi sản xuất → "chưa rõ" kèm câu "cần xác nhận nơi sản xuất đầu phát" (giống luật động cơ khi dòng không ghi nhà máy, Khoa 16/11). Marathon chưa xác nhận nơi sản xuất → "chưa rõ".
5. **Thứ hạng.** Khuyến nghị: cấu hình dùng đầu phát hãng KHÔNG bị phạt điểm vì NCC chưa chào. Lý do: Khoa 17/11 đã bỏ việc phạt cấu hình thiếu đầu phát, và đầu phát hãng chỉ được đưa vào khi đạt. Các check đầu phát được tính như mọi check đầu phát khác (tầng "đầu phát + tổ máy"), nên số "chưa rõ" giảm và thứ hạng CÓ THỂ đổi. Bậc "có NCC phù hợp" giữ nguyên luật: NCC chỉ khớp động cơ, không khớp đầu phát.
6. **Bổ sung dữ liệu hãng (PR D).** Hiện chưa có bảng định mức đọc được của Mecc Alte, Marathon, và của Stamford trên ~750 kVA (S6/S7/P7). Khuyến nghị: làm SAU PR B, chỉ Mecc Alte (ECO / NPE) và Stamford S6 / S7 (dùng Firecrawl, ước tính ≤ 30 credit). Marathon: marathonelectric.com / weg.net trả 403 (16/11), để lại.
7. **Đồng bộ thương hiệu hoặc HSMT nêu đích danh hãng đầu phát** (59 gói nêu hãng, 30 trong đó có "hoặc tương đương"). Khuyến nghị: danh sách chỉ gồm hãng HSMT nêu. Có "tương đương" thì thêm hãng khác, xếp sau. HSMT đòi đồng bộ thương hiệu có đầu phát thì KHÔNG dùng đầu phát hãng khác hãng tổ máy.

## 1. Hiện trạng: datasheet hãng đầu phát trong `suppliers/`

**Có 40 bản ghi `role: alternator_maker`, nhưng chỉ ba hãng có datasheet hãng đã lưu (nguồn 1001+):**

| Hãng (id) | Tờ hãng | Model trong tờ | kVA cột prime đọc ĐƯỢC hôm nay (50 Hz, 400 V, Cont. H) | Cách điện / kích từ / AVR / ổn định U / ngắn mạch có chữ trong tờ |
|---|---|---|---|---|
| Stamford (`stamford-avk-china`) | 20 tờ một model | 20 (PI044F … S5L1D-H4) | 17 / 20 model, từ 12,5 đến 750 kVA (UCI224F, UCI274D, PI144x: không đọc được) | có ở cả 20 tờ (cách điện, kích từ, ổn định U, ngắn mạch); AVR ghi ở 17 tờ |
| Leroy-Somer (`leroy-somer-fuzhou`) | 14 tờ theo dải (TAL-A40…A49, LSA 40…52.3) | 84 | **8 / 84** (chỉ TAL-A44, 85–200 kVA). LSA 40 → 52.3: 0 | có ở cả 14 tờ (khối "General characteristics"); "Short-circuit current" ở 12 tờ |
| Mecc Alte (`mecc-alte`) | 6 tờ (tờ quảng cáo PMG, MEC 12-75, ATO/CTP/PE 28) | không có bảng định mức ECO / NPE | 0 | — |
| Marathon, Linz, Sincro, Engga, Faraday… | 0 tờ hãng (chỉ trang chính, crawl) | — | 0 | — |

Đo bằng `dai-kva.mjs` và `ls-parse.mjs`, chạy `ratings.mjs` hiện có (`lsRatings`, `stamfordRatings`, `altSheetAttrs`) trên chính các tệp `sources/<id>/1xxx.md`.

**Vì sao LSA 49.3 M8 (ca gốc) không đọc được, dù nguồn ghi đủ:**
- `lsRatings` đòi mỗi nhóm cột có thêm một cột 1 pha (`cols = 3 pha + 1`). Bảng LSA chỉ có cột 3 pha (16 số, code đợi 20) nên bỏ cả dòng. Dòng L9 / L10 còn có ô dính "1 000 1 000".
- `altSheetAttrs` chỉ đọc mẫu Stamford ("INSULATION SYSTEM", "CONTROL SYSTEM", "300% sustained short circuit"). Khối Leroy-Somer `| Insulation class | H`, `| Excitation system | AREP / PMG`, `| AVR type | D350`, `| Voltage regulation (*) | ± 0.25%`, `| Short-circuit current | 300% (3 IN) : 10s` không có hàm đọc.
- Bảng `specTables` n1012 (do `merge-specs` tạo) đã BỎ hai dòng "AVR type" và "Short-circuit current", và mất tiêu đề cột (không còn biết cột nào là cấp H / 40 °C / 400 V). Vì vậy catalog chỉ đọc 4 thông số `ip, insul, excit, vreg`. Muốn biết cột thì phải đọc từ tệp nguồn `.md`, đừng đọc từ `specTables`.
- `altKvaOf` (kVA không nhãn) tách "1 025" thành 1 và 25: danh sách kVA của M8 có cả số 1, 25, 90. Hiện chỉ dùng số lớn nhất nên chưa gây sai rõ, nhưng là bẫy.

**Catalog (`kho.mjs`, 2.704 model đầu phát):** model chỉ vào `built.alternators` khi có dòng tổ máy của NCC ghi nó. Bảng "Datasheet: …" của NCC hãng đầu phát chỉ đi vào "Thông số theo model" (`modelFacts`). Một model chỉ có trong tờ hãng mà không NCC nào ghi thì KHÔNG có trong catalog: đầu phát hãng phải đọc thẳng từ nguồn hãng, không đi qua `built.alternators`. Theo hãng (cột: model / kVA có nhãn 50 Hz / kVA bất kỳ / cách điện / kích từ / AVR / ngắn mạch / ổn định U):

| Hãng | model | kVA có nhãn 50 Hz | kVA bất kỳ | cách điện | kích từ | AVR | ngắn mạch | ổn định U |
|---|---|---|---|---|---|---|---|---|
| (không hãng) | 2.081 | 21 | 171 | 219 | 197 | 13 | 0 | 116 |
| Stamford | 326 | 62 | 62 | 91 | 86 | 0 | 1 | 77 |
| Leroy-Somer | 187 | 7 | 67 | 44 | 87 | 48 | 0 | 62 |
| Mecc Alte | 47 | 0 | 0 | 2 | 3 | 0 | 0 | 0 |
| Marathon | 39 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Chú thích: "AVR" ở bảng này là chữ trong dòng `factsFor` có tên model AVR hay chữ "regulator", không phải trường riêng. Kết quả Gợi ý hiện KHÔNG có trường AVR / kích từ. AVR chỉ là check `alt_avr` loại "order" ("Xác nhận khi đặt hàng").

**Kết quả đã lưu** (`doc-cache\configmatch.json`, bản chụp 18/11: chỉ 11 lượt, 49 cấu hình): 7 cấu hình không có đầu phát (ở 4 lượt). Có 292 check đầu phát: 63 đạt, 192 chưa rõ, 3 không đạt, 34 xác nhận khi đặt hàng. Ở IB2600603983 cả 8 cấu hình đều "chưa rõ" công suất đầu phát và ngắn mạch 300 %, kể cả cấu hình có S5L1D-H41 / LSA49.3 M65. Mẫu 11 lượt là nhỏ, chưa đo trên toàn bộ `configmatch` của web.

## 2. HSMT đòi gì ở đầu phát (đo trên mọi gói)

`hsmt.mjs` đếm trên `doc-cache\analysis.json`: 1.298 gói có `technicalSpecs`, **849 gói có mục đầu phát**. Mục được gán mã bằng `codeOf` (part `alternator`). Ngưỡng đọc bằng regex trên mục đầu phát. Xuất xứ đọc bằng `partOriginOfHsmt` trên `genbid-work\specs\<key>\text.txt`.

| Yêu cầu | số gói |
|---|---|
| alt_type (không chổi than / tự kích…) | 535 |
| alt_power (công suất đầu phát) | 498; mục có số kVA: 500 |
| alt_insulation | 491; ghi cấp H: 619 mục, cấp F: 11 |
| alt_avr | 370; nêu model AVR (SX460, AS440, MX341, D350…): 18 |
| alt_ip | 366 |
| alt_make | 319; nêu tên hãng: 59 (Stamford 24, Leroy-Somer 24, Mecc Alte 13, Sincro 6, Linz 4, Marathon 2, AvK 1), 30 có "tương đương" |
| alt_vreg | 312; có số ±: 245 (≤ 0,25 %: 3; ≤ 0,5 %: 45; ≤ 1 %: 181; ≤ 1,5 %: 3; > 1,5 %: 13) |
| alt_standard / alt_thd / alt_cooling / alt_efficiency | 97 / 89 / 85 / 73 |
| PMG hoặc AREP (alt_excitation) | 68 |
| alt_origin | 64; theo `partOriginOfHsmt`: 27 (nơi sản xuất 20, thương hiệu 7) |
| ngắn mạch 300 % / 10 s (alt_short_circuit) | 41 (13 gói đòi cả PMG / AREP) |
| tự kích | 360 |

Kết luận: công suất + cấp H + ổn định điện áp + AVR là phần lớn. PMG / AREP và ngắn mạch 300 % ít (≤ 8 % gói), nhưng đúng là chỗ đầu phát của xưởng lắp ráp TQ hay "chưa rõ" nhất.

## 3. Thiết kế đề xuất

### 3.1 Ai chọn: code lọc trước, agent chọn trong danh sách
- **Code** (`config-bot.mjs prep`) dựng danh sách "Đầu phát theo datasheet hãng" từ các tệp nguồn của NCC `alternator_maker` (`sourceRatings`, mở rộng ở PR A). Chỉ giữ model ĐẠT mọi ngưỡng HSMT mà tờ hãng ghi được:
  - tần số;
  - kVA theo câu hỏi 3;
  - cấp cách điện;
  - PMG / AREP nếu HSMT đòi (tờ phải ghi có tuỳ chọn);
  - ngắn mạch 300 % / 10 s nếu HSMT đòi;
  - ổn định điện áp ≤ ngưỡng HSMT.
- Ngưỡng tờ hãng không ghi thì để "chưa rõ", không loại. Tờ ghi không đạt thì loại.
- Xếp: hãng HSMT nêu → hãng hợp nhóm xuất xứ → model nhỏ nhất đạt. Mỗi hãng tối đa 2 model, cả danh sách tối đa 6.
- **Agent** chỉ được lấy đầu phát hãng từ danh sách đó, và chỉ khi (a) dòng NCC không ghi đầu phát, hoặc (b) đầu phát NCC ghi bị code chấm "không đạt" (theo câu hỏi 1 và 2). Agent không tự tìm đầu phát hãng trên internet cho việc này.
- **Vì sao code lọc:** agent đọc bảng 16 cột không nhãn dễ lấy nhầm cột (Standby 27 °C 945 thay cho Continuous 820). Lý do cũng như vì sao `altColumns` ra đời.

### 3.2 Ghi nguồn để `check` kiểm được
- Thêm `alternator.src.kind: "maker"`, dạng `{ kind: "maker", supplierId: "leroy-somer-fuzhou", n: 1012, lines: [dòng định mức, dòng tiêu đề cột…] }`. Code ghi, agent chép nguyên từ catalog.md.
- `check` kiểm từng dòng có nguyên văn trong `sources/<supplierId>/<n>.md` (bot có repo, tệp có sẵn). Không khớp → bỏ đầu phát khỏi cấu hình, ghi chú lý do. Không bao giờ "đạt".
- Các check đầu phát lấy từ tờ hãng do CODE viết, như `altAttrChecks` / `comboChecks` đang làm với Stamford: công suất (kèm nhãn cột, vd "Continuous 40 °C H/125 K, 400 V: 820 kVA"), cách điện, kích từ, ngắn mạch, ổn định điện áp, AVR. Agent không phải viết các check này. Như vậy không tốn thêm token cho check, và không có số do agent đọc nhầm cột.

### 3.3 Hiện trên kết quả và web
- Kết quả: `alternator.fromMaker: true` và `alternator.options: [{ what: "Kích từ", value: "AREP / PMG", line }, { what: "AVR", value: "D350", line }]`. Code ghi từ khối "General characteristics" / "CONTROL SYSTEM" của tờ.
  - Tờ ghi nhiều kiểu kích từ ("AREP / PMG") mà HSMT đòi một kiểu → ghi kiểu HSMT đòi + "chọn khi đặt hàng".
  - Tờ ghi AVR "Standard" và "Option" (D350 / D550) → ghi bản Standard.
- Web (`web/index.html`, ĐỀU PHẢI LÀM MỚI, hiện chưa có):
  - `CFG_SRC.maker` = "Datasheet hãng". Chip vàng cạnh tên đầu phát: "Chọn theo datasheet hãng — NCC chưa chào" (hoặc "NCC chào X, không đạt" ở ca câu hỏi 1).
  - Một dòng nhỏ dưới "Đầu phát": "Kích từ AREP / PMG · AVR D350 (theo datasheet hãng, chọn khi đặt hàng)".
  - Chip NCC sẵn có "dòng bảng không ghi đầu phát …" giữ nguyên.
  - "Chép bảng câu hỏi" (RFQ) thêm câu: "Xác nhận chào đầu phát <model> (<hãng>), kích từ …, AVR …, và lắp ghép với động cơ <model> (mặt bích SAE, khớp nối)".
- Không in câu trích (`SHOW_SRC = false` giữ nguyên).
- Lời văn KHÔNG được viết như NCC đã chào (theo `khong-viet-au`). `summary` của agent và `why` của NCC cũng phải theo luật này: thêm vào prompt.

### 3.4 Xuất xứ
Theo câu hỏi 4: dùng `CAT.madeOf` nơi mặc định của hãng (`manufacturing[]`). Lọc theo nhóm của `partOriginOfHsmt.alternator`: hãng ngoài nhóm thì không vào danh sách. Riêng `leroy-somer-fuzhou` có `country: CN`, nhưng tờ hãng là trang leroy-somer.com toàn cầu, không phải dòng ghi nhà máy Phúc Châu. Vì vậy theo luật 16/11 vẫn tính mặc định Pháp. Cần ghi chú rõ điều này trong code để lần sau không nhầm là NCC Trung Quốc.

### 3.5 Những gì đầu phát hãng KHÔNG chứng minh được (luôn ghi `gaps`)
- NCC có lắp được đầu phát này với động cơ này không (mặt bích SAE, đĩa khớp nối, khung): luôn ghi "cần NCC xác nhận lắp ghép".
- Giá và thời gian giao: ngoài phạm vi (Khoa đã bỏ khỏi xếp hạng).
- HSMT có nhiệt độ môi trường > 40 °C hoặc độ cao > 1.000 m (tờ LS ghi "Altitude ≤ 1 000 m"): công suất "chưa rõ", kèm câu "cần hệ số suy giảm của hãng". Không tự tính suy giảm.

### 3.6 Ca gốc IB2600603983 sau thiết kế (ước tính, chưa chạy)
- Danh sách sẽ có: LSA 49.3 M8 (820 kVA ≥ 750; H; AREP / PMG; D350; ±0,25 % ≤ ±0,5 %; 300 % (3 IN) : 10 s) và Stamford S5L1D-H4 (750 kVA; cột prime đọc được; ngắn mạch 300 % đọc được ở tờ S-range).
- LSA 49.3 M6 (730 kVA) bị loại vì công suất.
- Cấu hình 6M31G825/5 nhận M8, các check đầu phát chuyển từ "chưa rõ" sang "đạt". Riêng xuất xứ: HSMT IB2600603983 ghi "Nhà sản xuất/nhãn hiệu thuộc nhóm nước G7, EU" → theo câu hỏi 4.
- Cấu hình 6M33G825/5 (LSA49.3 M65: không có trong tờ hãng) giữ M65, vẫn "chưa rõ" (câu hỏi 2).
- Việc chọn động cơ 6M31G825/5 vào top 30 là việc khác (Baudouin), không thuộc đề xuất này.

## 4. Tệp phải sửa, chia PR, cách đo, chi phí

Thứ tự đề xuất. Mỗi PR mở draft, điều phối merge. `config-bot.mjs` đang có PR #963 và việc tỉ số nén → PR B, C chờ hai việc đó merge rồi rebase. `web/catalog.js` có hàng chờ → đề xuất KHÔNG đụng `catalog.js` trong việc này (xem cuối mục).

**PR A: đọc tờ hãng (`suppliers/ratings.mjs` + test). Không đổi prompt, không tốn agent.**
- `lsRatings`:
  - nhận bảng không có cột 1 pha (số ô = số điện áp 3 pha);
  - ô dính số nghìn có dấu cách ("1 000 1 000", "1 045 1 140"): thử các cách tách, chỉ nhận cách cho đúng số cột VÀ số tăng dần theo điện áp trong nhóm; không có cách duy nhất thì bỏ dòng;
  - đọc được TAL-A40 / A42 / A46 / A473 / A49 và LSA 40 → 52.3.
- `lsSheetAttrs`: khối "General characteristics" → insulation, excitation (danh sách), avr (Standard / Option), vreg, ip, sc ("300% (3 IN) : 10s"), overspeed, altitude. Mỗi giá trị kèm dòng nguyên văn. Áp cho mọi model của dải trong cùng tờ.
- Stamford: thêm AVR ("AS440 AVR - STANDARD", MX341 / MX321) và "VOLTAGE REGULATION" vào `altSheetAttrs`.
- Sửa `altKvaOf` không tách "1 025".
- Test bằng dòng thật của 1012 / 1003 / 1018.
- **Đo:**
  - `dai-kva.mjs` + `kho.mjs` trước / sau: số model đọc được kVA cột prime, kỳ vọng LS 8 → ~84;
  - `node --test suppliers/regress-*.test.mjs`: các lượt đóng băng có đầu phát LS / Stamford sẽ đổi check đầu phát (`comboChecks` / `altAttrChecks` đọc thêm), đọc từng dòng diff;
  - chạy lại `check` trên MỌI `configmatch` đã lưu (tải toàn bộ bằng `restore-web`, chỉ đọc; gỡ check đạt / không đạt cũ trước như `suppliers/CLAUDE.md` dặn), đếm check đầu phát đổi trạng thái và soát tay mọi ca "đạt → không đạt";
  - top 30 ứng viên (`do-gop.mjs`): kỳ vọng 0 khác, vì `candidates` không đọc `ratings.mjs`. Vẫn chạy để chứng minh.

**PR B: chọn đầu phát hãng (`suppliers/config-bot.mjs`, `suppliers/config-prompt.md` + test).**
- `makerAlts(hints, cap, RT, origin)` → mục catalog.md "Đầu phát theo datasheet hãng (NCC chưa chào)". Mỗi model một khối: hãng, model, kVA + nhãn cột, các thuộc tính kèm dòng nguyên văn. Có `src` để chép. Đặt ngay sau "Ứng viên".
- Prompt: luật ở mục 3.1 thay câu "Prefer an engine and an alternator that appear together in the same genset row". Vẫn ưu tiên đầu phát cùng dòng nếu nó không bị chấm không đạt. Lời văn "NCC chưa chào".
- `check`: nhận `src.kind: "maker"`, kiểm dòng trong tệp nguồn, viết các check đầu phát từ tờ hãng, `options`, gap lắp ghép, xuất xứ (câu hỏi 4). Tóm tắt `noteDropped` sửa số nếu bỏ.
- `rankConfigs`: không đổi luật (câu hỏi 5).
- **Đo:**
  - test đơn vị cho `makerAlts` (ca gốc 750 kVA → M8 + S5L1D-H4, không M6);
  - `regress-config` (kỳ vọng không đổi với lượt có đầu phát NCC, vì agent không chạy lại);
  - chạy agent thật trên 4 gói ở `genbid-test`: IB2600603983, một gói ≤ 200 kVA có PMG (vùng TAL-A44 / UCI274), một gói nêu hãng đầu phát kèm "tương đương", một gói 60 Hz nếu có. Đếm trước / sau: cấu hình không có đầu phát; check đầu phát chưa rõ / không đạt; thứ hạng cấu hình đúng đáp án.

**PR C: web (`web/index.html` + Playwright).**
- Chip "Chọn theo datasheet hãng — NCC chưa chào", dòng kích từ / AVR, `CFG_SRC.maker`, câu RFQ.
- `api/webreq.js` không đổi (không thêm trường yêu cầu).
- **Đo:** `node web/test/serve.mjs` với fixture kết quả có `fromMaker`, ảnh chụp, test spec mới. Hai phiên không sửa `index.html` cùng lúc: hỏi điều phối trước khi mở.

**PR D (tuỳ câu hỏi 6): dữ liệu.**
- Tải datasheet Mecc Alte ECO / NPE, Stamford S6 / S7 vào `sources/<id>/1xxx.md` bằng `maker-datasheets.mjs` / Firecrawl.
- Cần `ratings.mjs` hiểu mẫu Mecc Alte: phải xem tờ thật mới biết.
- **Đo:** `kho.mjs` / `dai-kva.mjs`.

**`web/catalog.js` SPECS: đề xuất KHÔNG sửa trong việc này.** Bảng `specTables` đã mất tiêu đề cột và mất dòng AVR / ngắn mạch, nên thêm từ khoá SPECS (vd `avr`, `sc`) cũng không cứu được ca gốc. Còn rủi ro làm đổi md5 `build()` của mọi đầu phát, đúng lúc hàng chờ `catalog.js` đang dày. Nếu Khoa muốn màn "Danh mục đầu phát" hiện AVR / ngắn mạch: làm việc riêng sau, phải gộp lại (`merge-specs`) giữ các dòng đó.

**Chi phí token agent (ước tính, chưa đo):**
- Mục mới trong catalog.md: tối đa 6 model × ~1,5 KB ≈ 9 KB ≈ 2,5–3 nghìn token đầu vào. Agent đọc catalog.md 1–3 lần, phần lớn trúng cache.
- Check đầu phát do code viết → agent không viết thêm check.
- Ước tính +0,05–0,15 USD / lượt trên ~3 USD hiện nay (2–5 %). Đo thật ở 4 lượt thử của PR B: so `apiMeter` / log `%TEMP%\genbid-config-<TBMT>.log` với lượt cũ cùng gói.
- 4 lượt thử ≈ 12 USD.

## 5. Rủi ro và việc chưa kiểm
- Chưa đo trên toàn bộ kết quả Gợi ý của web (chỉ bản chụp 11 lượt ở doc-cache). Tỉ lệ thật có thể khác: số đo 14/11 ở bộ nhớ là 39 % cấu hình thiếu đầu phát HOẶC bộ điều khiển (không tách riêng đầu phát).
- Chưa mở tờ Mecc Alte để biết có bảng định mức không. Chưa biết số gói theo cỡ máy rơi vào vùng không có tờ hãng (> 750 kVA ngoài Leroy-Somer, < 85 kVA ngoài Stamford PI / UCI).
- Tách số "1 000" có thể đọc sai ở dải khác: PR A phải in mọi model mới đọc kèm số, soát tay với tệp nguồn (`kiem-cheo-toan-bo`: so mọi bản ghi, không lấy mẫu).
- Đầu phát hãng không bảo đảm NCC lắp được: luôn là gap, và phải nói thẳng trên web.
- Quay lui: PR A, B, C độc lập theo thứ tự. Tắt chọn đầu phát hãng bằng cách gỡ mục catalog.md (một cờ `GENBID_MAKER_ALT=0` mặc định bật, đề xuất có trong PR B).

## Cần ghi nhớ
- Khoa 20/11/2026: đầu phát "miễn sao đạt yêu cầu của hsmt thì cứ gợi ý" (đã ở bộ nhớ `config-suggest`).
- Bẫy (đưa vào `suppliers/CLAUDE.md` trong PR A):
  - `lsRatings` bỏ mọi bảng LSA (không cột 1 pha);
  - `specTables` của tờ hãng đã mất tiêu đề cột + dòng AVR / ngắn mạch: đọc định mức từ `sources/<id>/<n>.md`;
  - model chỉ có trong tờ hãng không vào `built.alternators`;
  - `altKvaOf` tách "1 025".
