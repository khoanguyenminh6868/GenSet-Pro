---
name: tim-thong-so-ncc
description: Tìm thông số động cơ, đầu phát, bộ điều khiển của MỘT nhà cung cấp máy phát điện (GenSet-Pro) trên trang chính thức của họ và bổ sung vào hồ sơ nhà cung cấp (specTables, productLines, controllers). Dùng khi Khoa nói "tìm thông số NCC <tên/id>", "bổ sung thông số cho <NCC>", hoặc khi bot chạy nút Tìm Thông Số ở màn Nhà cung cấp.
---

# Tìm thông số của một nhà cung cấp

Bổ sung vào hồ sơ một nhà cung cấp (supplier/<id>) các bảng thông số tổ máy: model tổ máy, công suất, **động cơ**,
**đầu phát**, **bộ điều khiển**, cùng các thông số khác ghi trên trang (dung tích, số xy lanh, tiêu hao nhiên liệu,
kích thước...). Danh mục động cơ / đầu phát / bộ điều khiển của web (web/catalog.js) và Gợi ý cấu hình chỉ đọc được
nhà cung cấp qua các bảng này: một dòng bảng phải ghi cả model động cơ (hoặc đầu phát) và công suất.

Quy tắc của Khoa (2026-10-28): không bịa gì về nhà cung cấp. Mọi dòng, mọi số chép nguyên văn từ một trang đã lưu
bằng lệnh save; code kiểm bằng verify.mjs và bỏ những gì không tìm thấy. Trả lời bằng tiếng Việt.

## Cách chạy

- **Bot (nút Tìm Thông Số trên web, chỉ Superadmin thấy):** `config-bot.mjs run` nhận yêu cầu `specreq/<id>`, chuẩn bị
  thư mục, chép skill này thành `prompt.md` và gọi Claude. Agent làm các bước bên dưới trong thư mục đó.
- **Chạy tay trong Claude Code** (repo `C:\Projects\GenSet Pro\GenSet-Pro`):
  1. `node suppliers/config-bot.mjs spec-prep --id <id> --out <thư mục trống trong scratchpad>`
  2. Làm các bước bên dưới trong thư mục đó (đọc input.md trước).
  3. `node suppliers/config-bot.mjs spec-post --dir <thư mục>`: kiểm lại, đăng lên web, mở PR vào repo, ghi kết quả
     để màn Nhà cung cấp hiện. Hoặc chạy cả lượt như bot: `node suppliers/config-bot.mjs spec --id <id>`.
- Không đọc mã nguồn của repo, không tự viết bộ kiểm tra; chỉ ghi `newCatalog.json`, `spec.json` và các trang lưu
  bằng lệnh save.

## Các tệp trong thư mục

- `input.md`: nhà cung cấp (id, tên, vai trò, website), các lệnh, các nguồn đã có, những model / bảng đã có trong hồ
  sơ (đừng thêm lại), động cơ / đầu phát / bộ điều khiển danh mục đã đọc được từ hồ sơ.
- `supplier.json`: hồ sơ hiện tại.
- `suppliers.json`, `meta.json`: cho lệnh kiểm tra.

## Các bước

1. Đọc input.md. Ghi nhận các dòng sản phẩm (dải công suất) và những gì hồ sơ còn thiếu: tổ máy nào chưa có bảng ghi
   động cơ, đầu phát, bộ điều khiển.
2. Tìm trên trang chính thức của nhà cung cấp (website trong input.md): trang sản phẩm từng tổ máy, bảng tổng hợp
   các model, catalogue / datasheet PDF, trang tải tài liệu. Dùng WebSearch với `site:<tên miền>` và tên model,
   "datasheet", "catalogue", "pdf", "spec sheet", "technical data". Trang Trung Quốc: thêm 参数, 技术参数, 机组型号.
   Chỉ khi trang chính thức không có: trang B2B của chính nhà cung cấp (made-in-china.com, alibaba.com: tier C).
   Không dùng wikipedia, baike, zhihu, mạng xã hội, trang đại lý của hãng khác.
3. Ưu tiên một bảng nhiều model (model tổ máy | công suất | động cơ | đầu phát | bộ điều khiển) hơn nhiều trang lẻ.
   Tối đa khoảng 15 trang lưu; công suất 10–3000 kVA; tập trung các dải công suất hay gặp trong thầu (20–1500 kVA).
4. Lưu mỗi trang dùng tới bằng lệnh save của input.md (in ra web/1.txt, web/2.txt...; PDF được chuyển thành chữ).
   Đọc tệp đã lưu rồi mới chép. Không dùng trang chưa lưu. Trang trả lỗi (403, cần đăng nhập) thì bỏ, ghi vào spec.json.
5. Ghi `newCatalog.json`: một danh sách đúng MỘT mục, `id` là id của nhà cung cấp trong input.md, chỉ gồm phần MỚI:
   - `sources`: `{ "n": 1, "file": "web/1.txt", "tier": "A|B|C", "quote": ["câu nguyên văn của trang, ≥ 8 ký tự"] }`
     (A: trang / datasheet chính thức của nhà cung cấp, C: B2B, tự giới thiệu). Mỗi số trong productLines phải có
     trong quote của nguồn đó.
   - `specTables`: `{ "n": 1, "title": "", "header": ["| ... |"], "rows": ["| ... |"] }`: header và mỗi dòng là
     NGUYÊN một dòng của trang đã lưu, chép y hệt. Mỗi dòng nên ghi cả model tổ máy, công suất và model động cơ
     (đầu phát, bộ điều khiển nếu có). Bảng chỉ có nhãn (`| Engine model | 6M33D605E200 |`, `| Prime power | 550 kVA |`)
     của một model cũng được: cả khối dòng của một tổ máy là một bảng.
   - Datasheet một model mà chữ bị tách cột (PDF hai cột: "Engine ref." và "P158LE" ở hai dòng khác nhau, không dòng
     nào ghi cả động cơ và công suất): thêm `productLines` của tổ máy đó với `series` là model tổ máy,
     `engineModels` [đúng một động cơ, chép như trang], `engineMakes`, `power` `min` = `max`, và một bảng
     `specTables` cùng nguồn có dòng chứa số công suất đó.
   - `productLines` cho dải công suất mới: `{ "kind": "genset", "series": "", "fuel": "diesel", "power": { "min": 20,
     "max": 1500, "unit": "kVA", "rating": "prime|standby|unspecified", "src": [1] }, "src": [1] }`.
   - `controllers`: `{ "brand": "Deep Sea", "model": "DSE7320", "text": "DSE7320", "line": "nguyên một dòng của trang",
     "src": [1] }` cho mỗi bộ điều khiển trang ghi (Deep Sea, SmartGen, ComAp, DEIF, Datakom, Woodward...);
     `model` null khi trang chỉ ghi hãng.
   - Không lặp bảng / dòng đã có trong hồ sơ (input.md liệt kê). Không có gì mới thì ghi `[]`.
6. Chạy lệnh kiểm tra của input.md. Nó in lỗi verify.mjs và các động cơ, đầu phát, bộ điều khiển danh mục đọc được từ
   phần mới. Sửa (chép lại đúng nguyên văn, thêm dòng công suất / động cơ) rồi chạy lại đến khi không còn lỗi.
   Phần mới không cho ra động cơ nào thì xem lại bước 5 (dòng phải ghi cả động cơ và công suất).
7. Ghi `spec.json`:
```json
{
  "summary": "1-2 câu: đã bổ sung những model nào, động cơ / đầu phát / bộ điều khiển gì",
  "skipped": [{ "name": "trang hoặc model", "reason": "vì sao bỏ (403, không ghi động cơ, đã có...)" }],
  "notes": ["điều Khoa cần lưu ý: thông số mâu thuẫn, model ngừng sản xuất, cần xin catalogue..."]
}
```
