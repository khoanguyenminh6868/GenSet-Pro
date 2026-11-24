# Tab "Giá trị nghi sai" trong trang Thông số: khảo sát + thiết kế (24/11/2026)

Khoa 24/11/2026 (nguyên ý): giá trị thông số nghi sai "nên làm thành 1 tab mới trong trang Thông số để anh vào kiểm tra và cập nhật, khi anh cập nhật thì sẽ thành thông số đúng".

Bản này CHỈ là khảo sát và thiết kế, chưa viết code. Số dòng dẫn theo `origin/main` 1765fcdb. Mọi thứ ghi "đề xuất" là CHƯA có.

## 0. Tóm tắt

- Tab mới là tab thứ tư của màn "Thông số cấu hình", cạnh Động cơ / Bộ điều khiển / Đầu phát. Tất cả thành viên xem được, chỉ Superadmin bấm được (giống "Dòng nghi sai").
- Danh sách giá trị nghi sai hiện chỉ in trong tóm tắt lượt chạy Actions. Đề xuất: bước "Spec value gate" ghi thêm danh sách đầy đủ vào một **bảng riêng `spec_flag`** trên Supabase (cách làm như `spec_std`: không realtime, không nhật ký). Web chỉ đọc bảng này khi mở tab.
- Quyết định của Khoa lưu ở doc `specfix/<NCC>` trong bảng `docs` (theo mẫu `rowok/<NCC>`). Lúc đọc dữ liệu NCC, `catalog.js` áp các quyết định này lên trên, nên **mọi đường đọc** (màn Thông số, Gợi ý cấu hình, bản chuẩn, bộ kiểm) cùng thấy một giá trị. Giá trị do Khoa nhập mang dấu riêng "Khoa xác nhận", không lẫn với số đọc từ nguồn. Chữ nguồn (`raw`) vẫn giữ nguyên văn.
- Chia 5 PR nhỏ. Chỉ PR 4 đụng `candidates` của Gợi ý cấu hình, phải đo top 30. Khoa cần chạy tay **một** đoạn SQL (tạo bảng `spec_flag`).

## 1. Hiện trạng

### 1.1 Trang Thông số

- Nút "Thông số" ở thanh trên (`web/index.html:539`, `data-catopen="engine"`) mở hộp thoại "Thông số cấu hình" (`openCatalog`, `web/index.html:3931-3938`).
- Hộp thoại có 3 tab Động cơ / Bộ điều khiển / Đầu phát, định nghĩa ở `CAT_KIND` (`web/index.html:3856-3860`). Thanh tab vẽ ở `web/index.html:3979-3980` (`.seg.cattabs`, nút `data-catkind`). Đổi tab ở `web/index.html:4001`. Mỗi tab có đường dẫn riêng trong `SCREEN_HASH` (`web/index.html:3340`).
- Dữ liệu **không** đến từ Supabase theo từng tab. Trình duyệt tự dựng danh mục từ toàn bộ hồ sơ NCC đã tải (`state.supplier`): `catalog()` gọi `GenbidCatalog.build(supAll())` (`web/index.html:3899-3905`), dựng ngầm bằng `catWarm` (`web/index.html:3876-3898`). Bản dựng mất 4–7 giây, chỉ dựng lại khi `state.supplier` hoặc `state.supdeleted` đổi (`catReady`, `web/index.html:3863`).
- Không có tab tổ máy, nhưng phần lớn giá trị nghi sai lại là của tổ máy (tiêu hao, kích thước, khối lượng). Vì vậy tab mới không thể là một `CAT_KIND` nữa, phải là một nhánh vẽ riêng (mục 2).
- Hiện không có chỗ nào đọc `spec_std` (`suppliers/spec-standard.mjs:6`, chú thích ở `web/supabase/schema.sql:128`). Đọc bản chuẩn là việc của bước 5.

### 1.2 Cách web đọc Supabase và quyền

- Bảng `docs`: mọi thành viên đọc và ghi được (`public.is_member()`, `web/supabase/schema.sql:18-27`). Bảng có realtime (`schema.sql:32-36`) và trigger nhật ký `docs_activity` (`schema.sql:121-123`). Mỗi lần ghi, realtime phát tới mọi trang đang mở, và trang tải lại dòng đó (`web/shim.js:242-258`). Collection nạp lúc mở trang qua `subscribe(coll, field)` (`web/index.html:1170`).
- Bảng riêng: `spec_std` (`schema.sql:125-140`) chỉ có policy đọc `is_member()`, ghi bằng service role, không nằm trong realtime, không có nhật ký. `shim.js` đã có tiền lệ đọc thẳng bảng khác `docs` qua client `sb` (`members` ở `web/shim.js:165`, `activity_log` ở `web/shim.js:177`).
- Bot đọc collection của `docs` qua `web/api/requests.js`. Collection phải có trong danh sách `READABLE` (`web/api/requests.js:12`), hiện đã gồm `rowflags` và `rowok`.
- Quyền Superadmin: `isSuperadmin()` (`web/index.html:3388`). Mục "Dòng nghi sai" kiểm quyền ở một chỗ duy nhất, `rowOkCan` (`web/index.html:3457`).

### 1.3 Bộ kiểm giá trị và nơi kết quả nằm

- `suppliers/spec-value-check.mjs` chạy trên mọi giá trị của bản chuẩn. Mỗi vi phạm có các trường: `part, field, model, key, supplier, value, unit, raw, src{supplierId,n,table,row}, row, rule, level, detail` (`spec-value-check.mjs:230`). `row` là chữ dòng bảng nguồn (`rowTextOf`, `:218-221`). Kết quả chỉ ghi ra tệp trên máy (`:292-295`).
- `suppliers/spec-value-gate.mjs` là bước "Spec value gate" của `.github/workflows/supplier-publish.yml:66-75`. Bước này chỉ lưu **danh sách khoá** vào doc `docs/specvalue/current` (`{at, commit, keys[]}`, ~33 KB với 405 khoá: `spec-value-gate.mjs:34`, `:62-66`). Ca mới chỉ in ra tóm tắt của lượt chạy. Web không có danh sách đầy đủ ở đâu cả.
- Khoá bền của một vi phạm: `phần.trường | model | NCC | n | băm chữ dòng | băm giá trị | luật` (`spec-value-gate.mjs:17-19`).
- Số lượng: 405 ca "sai" khi lưu mốc. 404 trên main 8832317f, theo `nghiem-thu/gia-tri-sai.md`. Nếu nhánh `gia-tri-sai` merge (đưa 130 mục vào `ROW_EXCEPTIONS`, thêm mức "cần xác nhận"), số còn lại là 293 "sai" + 11 "cần xác nhận". Lúc viết, trên `origin/main` chưa có `unsurespec` / `applyRowException`. Ngoài ra có 1.408 ca "chưa chuẩn" (enum chưa về giá trị chuẩn). Đó là việc của bước 4, đề xuất **không** đưa vào tab.
- Bước gate chỉ chạy khi push chạm `suppliers/cn/**` hoặc code đọc (`supplier-publish.yml:5-10`), hoặc khi chạy tay. Chạy mất khoảng +7 phút (`nghiem-thu/spec-value-gate.md`).
- Bản chuẩn chỉ giữ **nguồn đầu tiên** của mỗi giá trị (`Bag.first`, `spec-standard.mjs:137-160`) và số NCC ghi giá trị đó (`suppliers`). Vì vậy bộ kiểm chỉ báo nguồn đầu tiên. Đã thấy bẫy này: bỏ ở nguồn đầu thì dòng thứ hai lộ ra (`gia-tri-sai.md`, mục 2).

### 1.4 Đường sửa hiện có (ngoại lệ theo dòng, trong git)

- `ROW_EXCEPTIONS` (`web/catalog.js:2012` trở đi) là danh sách viết tay. Một mục khớp khi NCC + `n` + model tổ máy + chữ dòng nguồn NGUYÊN VĂN cùng khớp. Có các loại: `nopower`, `drop`, `dropspec`, `fixspec`, `unitspec`. Hàm áp là `rowExceptions` (`web/catalog.js:2197-2223`).
- `fixspec` chỉ đổi số khi (a) hình học của chính dòng ra số đúng trong 2 % VÀ (b) tờ hãng hoặc ≥ 2 NCC khác ghi cùng số (`web/catalog.js:2035-2041`). Số sửa mang dấu `fixed`, không bao giờ hiện như số của nguồn.
- Đổi danh sách này phải qua PR vào `catalog.js`, merge, Vercel deploy, và bot kéo bản mới. Bot nạp `web/catalog.js` từ checkout trên máy (`suppliers/config-bot.mjs:59`).
- Tiền lệ "quyết định của người lưu ở Supabase": `rowok/<NCC>` `{[rowKey]: {d: "ok"|"drop", by, at}}`. Web ghi (`setRowOk`, `web/index.html:3508-3516`). Config-bot đọc mỗi lượt (`rowOkOf`, `config-bot.mjs:2619-2625`) rồi loại dòng (`blockedRows`, `config-bot.mjs:2666`). Nút chỉ đổi `rowok`, không đổi dữ liệu NCC.
- Luật trích nguồn: màn hình không in câu trích / link nguồn (`SHOW_SRC = false`, `web/index.html:695`). Hiện có 3 ngoại lệ đã được Khoa / điều phối duyệt. Ngoại lệ 1 là "Dòng nghi sai" (`web/index.html:3502-3503`; `web/CLAUDE.md`, mục index.html).

## 2. Tab mới: đặt ở đâu, đọc gì

### 2.1 Vị trí và khung

- Thêm một nút thứ tư vào thanh `.cattabs`: **"Giá trị nghi sai (N)"**, N = số ca còn chờ xử lý. Đề xuất hiện cho mọi thành viên (xem được), chỉ Superadmin có nút sửa. Xem điểm quyết Q1.
- Khi `catView.kind === "flags"`, `renderCatalog` rẽ sang `renderFlags()` riêng. Không thêm vào `CAT_KIND`, vì tab này không phải danh sách model và có cả tổ máy. Thêm `SCREEN_HASH.flags = "gia-tri-nghi-sai"`.
- Theo luật `web/CLAUDE.md`, khi mở chi tiết một ca thì phải thêm vào `navSnap` / `navRestore` và `navKey`, để Back trên điện thoại về đúng chỗ.
- Bộ lọc: NCC, phần (tổ máy / động cơ / đầu phát / BĐK), trường, luật, trạng thái (Chờ xử lý / Đã sửa / Đã xác nhận đúng / Đã bỏ / Quyết định không còn khớp). Mặc định sắp theo NCC có nhiều ca nhất, giống báo cáo gate.
- Tab này không dựng danh mục (không cần `catalog()`), nên mở ngay, không chờ 4–7 giây.

### 2.2 Đăng danh sách ra đâu

So ba chỗ có thể đặt danh sách:

| | Doc `docs/specvalue/current` mở rộng | Bảng riêng `spec_flag` (đề xuất) | Tệp trong git |
|---|---|---|---|
| Cỡ | 1 doc khoảng 0,5–1 MB (≈ 300–420 ca × 1–2 KB gồm chữ dòng, tiêu đề, giá trị nguồn khác; ước, **chưa đo**) | 300–420 dòng, tổng như bên trái | như bên trái |
| Realtime | Có. Mỗi lượt đổi đẩy cả doc tới **mọi trang đang mở** (shim tải lại dòng) | Không | Không |
| Nhật ký `activity_log` | 1 dòng mỗi lượt đổi | Không | Không (có lịch sử git) |
| Tải khi nào | Lúc mở trang, mọi người dùng, kể cả không mở tab | Chỉ khi mở tab | Theo bản deploy |
| Ai ghi | service role (bước gate) | service role (bước gate) | workflow commit (repo công khai, bot tự merge) |

Đề xuất dùng **bảng riêng `spec_flag`**, cùng lý do Khoa đã chọn bảng riêng cho `spec_std` (không realtime, không nhật ký). Doc `specvalue/current` giữ nguyên làm mốc "ca mới".

Cấu trúc đề xuất (SQL ở mục 4.3):

- `id` = khoá vi phạm như `violationKey`, nhưng **bỏ `n`** để mọi bản chép cùng dòng thành một ca (lý do ở mục 3.2).
- `supplier`, `part`, `field`, `rule`, `level` (để lọc phía server khi cần).
- `hash` (chỉ ghi dòng đổi, như `spec_std`). Ca đã hết thì ghi `gone` (như `spec_std`), không xoá, để web biết ca đó "đã hết" mà không cần lịch sử.
- `data jsonb`: nội dung ở mục 2.3.
- `updated_at`.

Web đọc bằng `sb.from("spec_flag").select(...).neq("hash","gone").order("id").range(...)`. Truy vấn phân trang phải có `.order` (luật `web/CLAUDE.md`). Đọc lại khi bấm "Tải lại" hoặc khi mở lại tab. Không subscribe.

Egress: khoảng 0,5–1 MB mỗi lần Khoa mở tab. Hạn mức Supabase Free là 5 GB/tháng, nên mở vài lần mỗi ngày không đáng kể.

### 2.3 Mỗi dòng hiện gì

Cho mỗi ca (`data` của `spec_flag`, bước gate tính sẵn):

| Mục | Lấy từ | Ghi chú |
|---|---|---|
| NCC | `supplier` → `supName(state.supplier[id])`, link mở hồ sơ NCC | |
| Phần, model / mã linh kiện | `part`, `model`, `key` | động cơ / đầu phát: link "Xem trong Thông số" (`openCatalog(kind, key)`) |
| Trường | nhãn tiếng Việt `vi` của `spec-fields.json` | vd. "Dung tích xi lanh" |
| Giá trị đang dùng | `value` + `unit` (+ `cond`, `missing`) | đã có quyết định thì hiện cả giá trị cũ ↔ mới |
| Luật vi phạm + lý do | `rule` → chữ tiếng Việt (bảng mã như `ROWFLAG_REASON`) + `detail` | vd. "Ngoài dải: 458 ngoài 0,05–300 L"; "Hình học: 12 xi lanh × 160 × 190 = 45,84 L, ghi 458 L" |
| Câu nguồn nguyên văn | `raw` (ô) + `row` (chữ dòng) + tiêu đề bảng `specTables[table].header` và `title` | trình bày như `rowFlagsHtml`: khối `<pre>` gồm tiêu đề và dòng |
| Liên kết tài liệu nguồn | `src.n` → URL từ `sources` của hồ sơ NCC (`catSrcUrl`, `web/index.html:3908`) + "nguồn [n], dòng r" | không có URL thì chỉ ghi số nguồn |
| Bản chép ở bảng khác | các `n` khác có cùng dòng nguyên văn (bước gate gom) | để Khoa biết một quyết định áp cho mấy chỗ |
| Giá trị của nguồn khác cho cùng mã | các mục khác của `fields[field]` trong doc bản chuẩn của cùng model: giá trị, đơn vị, số NCC ghi, một nguồn mẫu | Động cơ / đầu phát: giữa các NCC. Tổ máy: chỉ trong cùng NCC, vì tên tổ máy là của từng NCC. Có giá trị thắng số đông (`win` / `votes` của `catalog.js`) thì đánh dấu. |
| Cờ dòng | dòng này có trong `rowflags/current` không | chip "Dòng nghi sai: bị loại khỏi gợi ý", link sang mục đó |

Giới hạn cần nói thẳng: bản chuẩn chỉ giữ **một** nguồn cho mỗi giá trị, nên "nguồn khác" hiện được số NCC và một nguồn mẫu, không liệt kê đủ từng NCC. Muốn đủ thì bước gate phải tự gom từ `e.uses` (không đụng `spec-standard.mjs`). Việc này làm được trong PR 1 nếu Khoa muốn (Q5).

Hiện câu nguồn và link trong tab này là **ngoại lệ thứ 4 của `SHOW_SRC`**. Phải được Khoa duyệt (Q2), và phải ghi vào `web/CLAUDE.md` như ba ngoại lệ trước.

### 2.4 Thao tác (Superadmin)

- **Sửa giá trị**: ô nhập giá trị mới, chọn đơn vị trong `units` của luật trường, **lý do bắt buộc**, ô "căn cứ" tuỳ chọn (link / tên tài liệu). Trước khi lưu, kiểm giá trị mới bằng chính luật của trường (`checkValue`, chạy được trên web nếu tách hàm thuần). Vẫn vi phạm thì cảnh báo nhưng vẫn cho lưu.
- **Giá trị này đúng**: lý do tuỳ chọn. Lần sau không báo lại ca này.
- **Bỏ giá trị**: lý do bắt buộc. Giá trị không vào danh mục, không vào Gợi ý.
- **Huỷ quyết định**: bấm lại nút đang chọn thì quay về giá trị của nguồn (như `setRowOk`).
- Sau mỗi thao tác: hiện "Đã lưu, áp ngay trên trang này; Gợi ý cấu hình áp từ lượt chạy kế; bản chuẩn / bộ kiểm cập nhật ở lượt đăng kế" (mục 3.3).

## 3. Lưu ở đâu và thành "thông số đúng" bằng đường nào

### 3.1 Hai phương án (và một bản lai)

**A. Quyết định ở Supabase (`docs/specfix/<NCC>`), đọc đè lúc đọc dữ liệu NCC.** (đề xuất)

- Doc: `{ [fixKey]: { act: "fix"|"ok"|"drop", part, field, model, rowHash, from, to?, unit?, why, ref?, by, at, prev?: [{act,to,why,by,at}] } }`.
  - `from` là giá trị nguồn nguyên văn (chữ ô).
  - `prev` giữ các quyết định trước của cùng ca. Đây là vết kiểm tra ngay trong doc, vì `activity_log` chỉ ghi tên khoá đổi, không ghi giá trị cũ / mới (`schema.sql:96-99`).
  - Mỗi lần ghi còn có một dòng `activity_log` (ai, lúc nào) nhờ trigger `docs_activity`. Đây là điểm muốn có: Khoa ghi ít, nên realtime / nhật ký không tốn.
- Áp đè: thêm `GenbidCatalog.useSpecFixes(map)`, là trạng thái của module, giống `useManufacturing`. Trong `fromSupplier`, sau `rowExceptions`, spec khớp `fixKey` được xử lý:
  - `fix`: đổi `value` thành `to`, gắn `khoa: { act, from, why, ref, by, at }`.
  - `drop`: bỏ spec, ghi note "ngoại lệ theo dòng (Khoa)" vào `unread-tables`.
  - `ok`: giữ nguyên, gắn `khoa.ok`.
  - Từ một điểm áp này, mọi đường đọc cùng thấy một giá trị:
    - web (Thông số, hồ sơ NCC, ô linh kiện): `catalog()` truyền `state.specfix`. Thêm `state.specfix` vào `catReady` để dựng lại danh mục khi Khoa sửa.
    - config-bot: đọc `specfix` qua `readAll` như `rowOkOf`, gọi `useSpecFixes` trước `CAT.build(all)` (`config-bot.mjs:2652`).
    - `spec-standard.mjs` và `spec-value-check.mjs` trong workflow: đọc `specfix` bằng service key trước khi dựng.
- Bản chuẩn: giá trị đã sửa mang `khoa` (như `fixed` của `fixspec`), `raw` vẫn là chữ nguồn. Bộ kiểm bỏ qua ca có `ok` / `drop`, và kiểm lại giá trị `fix` bằng luật. Vẫn sai thì báo ca mới, kèm "Khoa đã sửa".

**B. Sinh mục `ROW_EXCEPTIONS` vào git.**

- Tab ghi một yêu cầu (`specfixreq/<id>`). Một tác nhân (Action, bot hay phiên cloud) đổi yêu cầu thành mục `ROW_EXCEPTIONS` trong `web/catalog.js`, rồi mở PR, CI, merge. Sau đó Vercel deploy, bot kéo main.
- Cần loại mới, vì `fixspec` đòi căn cứ (a) + (b) (`catalog.js:2035-2041`) mà giá trị Khoa nhập không có. Thêm `act: "khoaspec"`. "Giá trị này đúng" không phải ngoại lệ dòng, nên cần thêm một danh sách nữa trong git cho bộ kiểm.

**C. Bản lai: A để có hiệu lực ngay, kèm xuất định kỳ `specfix` ra tệp dữ liệu `suppliers/spec-fixes.json` trong git.** Action chạy hằng ngày, PR tự merge. Mục đích là để test, `quality.mjs`, `spec-diff`, fixture `regress-config` (chỉ thấy git) tái tạo được đúng số đang chạy. `catalog.js` mặc định đọc tệp này khi không có map từ Supabase.

### 3.2 Khoá của một quyết định và khi tài liệu nguồn đổi

- `fixKey = NCC | phần.trường | khoá model | băm chữ dòng nguồn | băm chữ giá trị nguồn`.
  - Không có `n`: dòng chép nguyên văn ở nhiều bảng của cùng NCC thì một quyết định áp hết. Đây là bẫy `mergeRepeats` / "liệt kê đủ mọi n" của `gia-tri-sai.md`.
  - Không có tên luật: sửa `spec-value-rules.json` thì quyết định không mồ côi.
  - Giá trị không có dòng (bảng nhãn, PDF) thì băm `raw`, như `violationKey`.
- Nguồn cào lại mà đổi chữ dòng hoặc chữ ô thì khoá không còn khớp. Khi đó quyết định **tự hết hiệu lực**, giá trị quay về số đọc từ nguồn mới (cùng tính chất "nguồn đổi chữ thì tự hết hiệu lực" của `ROW_EXCEPTIONS`).
- Bước gate liệt kê các quyết định không còn khớp vào `spec_flag` với `rule: "mo-coi"`. Tab hiện chúng ở trạng thái "Quyết định không còn khớp" để Khoa xem lại. Nếu số mới vẫn vi phạm, nó cũng hiện lại thành ca chờ xử lý. Không có gì bị âm thầm mang sang nguồn mới.

### 3.3 So sánh

| | A. Supabase + đọc đè | B. `ROW_EXCEPTIONS` trong git | C. A + xuất ra git |
|---|---|---|---|
| Có hiệu lực trên web | **Ngay** (realtime doc, dựng lại danh mục 4–7 s) | sau PR merge + Vercel deploy: nhanh nhất vài phút nếu tự động, thực tế có thể vài giờ (CI, xung đột với PR khác sửa `catalog.js`) | ngay |
| Gợi ý cấu hình | lượt chạy kế | sau khi bot kéo main | lượt chạy kế |
| Bản chuẩn `spec_std` / bộ kiểm | lượt đăng kế. Workflow chỉ chạy khi push chạm `cn/` / code: cần thêm lịch chạy (Q6) | lượt đăng kế (PR chạm `catalog.js` nên tự chạy) | như A |
| Vết kiểm tra | ai / lúc nào / cũ / mới / lý do trong doc + `prev`; `activity_log` một dòng mỗi lần ghi | lịch sử git (commit do bot, người quyết ghi trong trường `khoa`) | cả hai |
| Không trái "dữ liệu NCC không bịa, có nguồn" | Đạt nếu giá trị mang dấu `khoa` riêng, `raw` giữ nguyên, màn hình ghi "Khoa xác nhận ngày …" chứ không ghi như số nguồn | như A (loại `khoaspec` riêng) | như A |
| Tái tạo từ git (test, `quality --check`, `spec-diff`, `regress-config`) | **Không**: CI và máy đo không thấy quyết định, số đo lệch với số đang chạy | Có | Có (trễ ≤ 1 ngày) |
| Rủi ro | thêm một nguồn sự thật ngoài git; bot đọc lỗi thì phải cảnh báo rõ (như `rowOkOf` in "CẢNH BÁO") | tác nhân tự sửa tệp code 3.670 dòng; nhiều phiên cùng sửa `catalog.js`; repo công khai nên lý do Khoa gõ cũng công khai | như A, cộng một Action + PR tự merge |
| Công | 4 PR (mục 4) | tác nhân sinh code + PR tự động: lớn nhất | A + 1 PR |

Đề xuất: **làm A trước (PR 1–4), sau đó C (PR 5) nếu Khoa muốn tái tạo được từ git**. Không làm B: chậm nhất, sinh code tự động vào `catalog.js`, mà vẫn phải thêm loại ngoại lệ mới.

### 3.4 Luật "không bịa, phải có nguồn"

- Bộ nhớ ghi Khoa 24/11/2026 về giá trị sai do nguồn: "Đưa từng ca vào danh sách để bỏ hoặc sửa", và **sửa chỉ khi giá trị đúng có trong nguồn**. Quyết định mới ("khi anh cập nhật thì sẽ thành thông số đúng") mở thêm đường: Khoa nhập trực tiếp. Em hiểu đây là xác nhận của người, khác với giá trị đọc từ tài liệu. Đề xuất giữ phân biệt như sau:
  1. Giá trị mang `khoa.act = "fix"` + `by` + `at` + `why`, không bao giờ có `src` của NCC.
  2. Màn hình hiện chip "Khoa xác nhận 24/11/2026", rê chuột thấy lý do và giá trị nguồn cũ.
  3. Bản chuẩn có dấu nguồn riêng ("xác nhận của người") cạnh "tờ hãng", "bản hãng đăng lại", "2 nguồn internet".
  4. Ô "căn cứ" (link tờ hãng…) tuỳ chọn. Có link thì hiện, không có vẫn lưu được (Q3).
- "Giá trị này đúng" không đổi số, chỉ tắt báo. Số vẫn là số nguồn, có `src`.

## 4. Ảnh hưởng tới đường đọc hiện tại và thứ tự làm

### 4.1 Ảnh hưởng

- `catalog.js` `fromSupplier`: thêm bước áp `specfix` sau `rowExceptions`. Khi map rỗng (mặc định) thì ra **y từng byte** như cũ. Kiểm bằng md5 JSON `build()` trên `suppliers/cn` (luật `web/CLAUDE.md`), `spec-diff` 0 đổi, `quality --check` không đổi.
- Màn Thông số / hồ sơ NCC / ô linh kiện: danh mục dựng lại khi `specfix` đổi. Chỉ Khoa ghi, nên rất hiếm.
- `config-bot`: một lần đọc thêm `specfix` mỗi lượt (vài KB). `candidates`, `majorityOf` (phiếu số đông), `khoaRules`, `fuelChecks`, `makerSheetChecks` đọc số đã sửa / đã bỏ. Đây là chỗ đổi top 30.
- `row-flags.mjs`: `absurdOf` chạy trên spec đã áp, nên một dòng có thể hết cờ "absurd" sau khi Khoa sửa / bỏ số vô lý. Làm vậy là đúng, nhưng phải nói rõ trong PR 4.
- `spec-standard.mjs`, `spec-value-check.mjs`, `spec-value-gate.mjs`: workflow đọc `specfix` (service key) rồi dựng. Hash doc `spec_std` của model có quyết định sẽ đổi, nên chỉ các doc đó được ghi lại.

### 4.2 Thứ tự PR

| PR | Nội dung | Đụng `candidates`? | Đo |
|---|---|---|---|
| 1 | `spec-value-gate.mjs`: ngoài doc khoá, ghi danh sách đầy đủ vào bảng `spec_flag` (chỉ dòng đổi hash, `gone` cho ca hết). Mỗi ca gom: chữ dòng, tiêu đề bảng, các `n` chép, giá trị nguồn khác của cùng model / trường. Có `--dry` in số dòng và byte. Không ghi khi bảng chưa tạo (biến repo `SPEC_FLAG_PUBLISH=1`, như `SPEC_STD_PUBLISH`). | Không | test thuần + `--dry` trên `cn/` (số ca, MB) |
| 2 | Web, chỉ đọc: tab "Giá trị nghi sai" (đọc `spec_flag`, lọc, chi tiết, câu nguồn + link nếu Q2 duyệt), `navSnap` / `navKey`, test Playwright với `fake-shim`. | Không | `web/test` |
| 3 | Lưu quyết định: doc `specfix/<NCC>` (ghi từ tab, một chỗ kiểm quyền như `rowOkCan`), `subscribe("specfix")`, thêm `specfix` vào `READABLE` (`api/requests.js:12`) và nhãn tiếng Việt ở `shim.js:86`. `catalog.js` `useSpecFixes` + áp trong `fromSupplier`, web truyền `state.specfix` (Thông số hiện chip "Khoa xác nhận"). Bộ kiểm / gate / bản chuẩn đọc `specfix` trong workflow. **Bot chưa đọc.** | Không (bot chưa nối) | md5 `build()` với map rỗng = main; `spec-diff` 0 đổi; test áp từng `act`; test "nguồn đổi chữ → hết hiệu lực" |
| 4 | config-bot đọc `specfix` (`readAll`, cảnh báo khi lỗi như `rowOkOf`) và gọi `useSpecFixes` trước `CAT.build`. | **Có** | top 30 bằng `do-gop.mjs`, gốc ↔ nhánh cùng bidhist, với (i) map rỗng: phải 0 đổi, (ii) bản chụp `specfix` lúc đó. Gộp một lần cho cả đợt, theo dặn của Khoa. |
| 5 (tuỳ Q4) | Action hằng ngày xuất `specfix` ra `suppliers/spec-fixes.json` (PR tự merge). `catalog.js` trên node dùng tệp này khi không được truyền map. | Có (gián tiếp: test / fixture thấy quyết định) | `regress-config` + `quality --check` |

Workflow cần thêm `schedule` (vd. mỗi đêm) hoặc chạy tay sau đợt sửa. Nếu không, bản chuẩn và tab chỉ cập nhật khi có push dữ liệu NCC (Q6).

### 4.3 SQL Khoa chạy tay (một lần, trước khi bật `SPEC_FLAG_PUBLISH`)

Đề xuất thêm vào `web/supabase/schema.sql`. Chạy lại an toàn.

```sql
create table if not exists public.spec_flag (
  id text primary key,          -- khoá ca (violationKey bỏ n) hoặc "mo-coi:<fixKey>"
  supplier text,
  part text not null,
  field text not null,
  rule text not null,
  level text not null,          -- sai | can-xac-nhan
  hash text not null,           -- "gone" = ca đã hết
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists spec_flag_supplier on public.spec_flag (supplier, id);
alter table public.spec_flag enable row level security;
drop policy if exists spec_flag_read on public.spec_flag;
create policy spec_flag_read on public.spec_flag for select to authenticated using (public.is_member());
-- Không policy ghi: chỉ service role (bước gate). Không thêm vào supabase_realtime, không gắn trigger nhật ký.
```

`specfix` nằm trong `docs` có sẵn nên **không** cần SQL. Quyền ghi doc theo policy `docs_members` (mọi thành viên). Giới hạn Superadmin chỉ ở web (`rowOkCan`), giống `rowok`. Muốn chặn cả ở máy chủ thì cần thêm policy riêng (Q1).

## 5. Điểm cần Khoa quyết

| # | Câu hỏi | Đề xuất | Lý do (một dòng) |
|---|---|---|---|
| Q1 | Ai xem, ai sửa? | Mọi thành viên xem, chỉ Superadmin sửa (kiểm ở web như `rowok`) | Giống "Dòng nghi sai" Khoa đã chốt 18/11/2026; chặn ở máy chủ thì phải thêm policy cho riêng `specfix` |
| Q2 | Cho tab hiện câu nguồn nguyên văn + link tài liệu (ngoại lệ thứ 4 của `SHOW_SRC`)? | Có, chỉ trong tab này | Không có câu nguồn thì không quyết được đúng / sai, cùng lý do ngoại lệ 1 |
| Q3 | Sửa giá trị có bắt buộc kèm căn cứ (link / tài liệu)? | Lý do bắt buộc, căn cứ tuỳ chọn; giá trị mang dấu "Khoa xác nhận" | Khoa đã nói cập nhật là thành đúng; bắt link sẽ chặn ca Khoa biết mà không có tài liệu |
| Q4 | Lưu ở đâu: A (Supabase, có hiệu lực ngay), B (git `ROW_EXCEPTIONS`), hay C (A + xuất ra git hằng ngày)? | A trước (PR 1–4), C sau | Có hiệu lực ngay như Khoa muốn; C giữ test / đo tái tạo được từ git |
| Q5 | "Giá trị nguồn khác" liệt kê đủ từng NCC hay chỉ số NCC + một nguồn mẫu? | Số NCC + một nguồn mẫu trước | Bản chuẩn chỉ giữ một nguồn mỗi giá trị; liệt kê đủ thì PR 1 nặng hơn |
| Q6 | Workflow đăng chạy thêm theo lịch để tab / bản chuẩn cập nhật quyết định? | Có, mỗi đêm + chạy tay | Hiện chỉ chạy khi push dữ liệu NCC; thêm khoảng 7 phút mỗi lượt |
| Q7 | Quyết định của Khoa vào Gợi ý cấu hình ngay (như `rowok`), không đo top 30 từng lần? | Có; đo top 30 một lần ở PR 4 với bản chụp lúc đó | Cùng cách `rowok` đang chạy; đo từng lần sửa là quá nặng |
| Q8 | Đưa 1.408 ca "chưa chuẩn" (enum) vào tab? | Không | Là việc bước 4 (quy cách viết nguồn), không phải số sai |
| Q9 | Sửa / bỏ công suất tổ máy (`genset.power`) và định mức đầu phát (`alternator.ratings`)? Hai trường này không có khoá `SPECS` đơn (`spec-fields.json`), đi đường khác (`u.power`, `sourceRatings`). | Bản đầu chỉ cho "Giá trị này đúng" với hai trường này; sửa / bỏ thì vẫn qua `nopower` trong git | Áp đè hai đường đó là việc riêng, đụng thẳng lọc công suất của `candidates` |
| Q10 | Ca "hình học" (≈ 200, không biết ô nào sai) có vào tab? | Có, nhưng gộp theo dòng: một ca hiện cả xi lanh / bore / dung tích để Khoa chọn ô sửa | Khoa đã chốt cho luật số đông loại ô không tự khớp; tab là chỗ Khoa xử lý ca biết được |
