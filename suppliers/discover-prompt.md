# Bot tìm nhà cung cấp — hướng dẫn cho agent

Dành cho agent trong Antigravity (Gemini 3.8 Flash, mức suy nghĩ medium). Khoa giao việc bằng một câu, ví dụ:
"Đọc suppliers/discover-prompt.md và làm theo. Lượt này: 5 hãng động cơ" hoặc "... 10 nhà máy tổ máy ở Phúc Kiến".
Không nói số lượng thì làm **5 bản ghi** rồi dừng.

Mục tiêu: thêm vào hệ thống nhà cung cấp mới thuộc 3 loại:

| role | Là gì |
| --- | --- |
| `genset_oem` | Nhà máy lắp ráp tổ máy phát điện hoàn chỉnh, có thương hiệu riêng |
| `engine_maker` | Hãng sản xuất động cơ dùng cho máy phát (kể cả liên doanh tại Trung Quốc) |
| `alternator_maker` | Hãng sản xuất đầu phát (alternator) |

Giai đoạn này chỉ lấy công ty **tại Trung Quốc** (`country: "CN"`), trừ khi Khoa nói khác. Không lấy nhà phân phối tại Việt Nam, không lấy công ty chỉ buôn bán.

Mọi lệnh chạy ở thư mục gốc repo (`C:\Projects\GenSet Pro\GenSet-Pro`), bằng `node suppliers/discover.mjs ...`.

---

## Quy tắc cứng (vi phạm là bản ghi bị loại)

1. **Không bịa.** Mọi thông tin phải chép từ trang đã lưu bằng lệnh `save`. Không có trong trang thì để `null` / `[]` và ghi lý do vào `miss`.
2. **Câu trích phải là nguyên văn.** Chép y nguyên một đoạn từ kết quả lệnh `grep` (giữ tiếng Anh/tiếng Trung gốc). Không dịch, không sửa chính tả, không ghép hai dòng, không thêm dấu "...".
3. **Số phải có trong câu trích.** Công suất min/max, năm thành lập phải xuất hiện đúng con số trong câu trích của nguồn đó. Không quy đổi kW↔kVA, không làm tròn, không suy từ tên model (ví dụ "WP13" không cho biết công suất).
4. **Không đoán URL.** Chỉ dùng URL lấy từ kết quả tìm kiếm hoặc link trên trang của hãng. Lệnh `save` báo `ENOTFOUND` nghĩa là bạn đã đoán sai — tìm lại.
5. **Không đăng nhập, không vượt CAPTCHA, không trả tiền.** Không dùng Qichacha, Tianyancha, Wikipedia, Baidu Baike, Zhihu, mạng xã hội, blog làm nguồn.
6. **Không sửa** `cn/*.json`, `sources/` bằng tay, không sửa các file `.mjs`, không chạy `upload.mjs`, không push lên `main`. Bạn chỉ viết `suppliers/drafts/<id>.json` và chạy các lệnh dưới đây.
7. Lệnh báo lỗi thì đọc lỗi và sửa bản nháp. Sửa 3 lần vẫn lỗi ở cùng một chỗ thì **xoá thông tin đó** khỏi bản nháp (không cố ép). Không cứu được bản ghi thì `skip` và sang ứng viên khác.

### Hạng nguồn (`tier`)
- **A**: website chính thức của chính công ty, catalogue/datasheet PDF của hãng, báo cáo thường niên.
- **B**: trang triển lãm chính thức, hiệp hội ngành, trang tra chứng chỉ.
- **C**: gian hàng trên sàn B2B (Made-in-China, Alibaba, Global Sources...), website của đại lý. Chỉ có nguồn C thì `"conf": "low"`.

Website mang tên hãng nhưng của đại lý (ví dụ `sdec-engine.com`, `dcec-engine.com`, `ccec-engine.com`) là hạng C, không phải website chính thức. Lệnh `check` sẽ báo.

---

## Quy trình cho mỗi lượt

### Bước 1 — Lấy danh sách ứng viên
```
node suppliers/discover.mjs seeds --genbid
node suppliers/discover.mjs status
```
- **Làm trước tiên:** `seeds` in danh sách công ty Khoa hay làm việc (`suppliers/discover-watchlist.json`). Mỗi dòng **CHƯA CÓ** phải tìm riêng theo tên: `"<tên> official website"`, `"<tên> generator"`, `"<tên> 官网"`, dùng ít nhất hai công cụ tìm kiếm khác nhau. Không tìm ra thì ghi rõ vào báo cáo cho Khoa (kèm những gì đã thử) để Khoa gửi tên đầy đủ hoặc website; không tự bỏ qua. Khoa nhắc thêm công ty nào thì thêm vào file này.
- `seeds` liệt kê hãng động cơ / đầu phát xuất hiện trong bảng thông số nhưng **CHƯA CÓ** bản ghi hãng. Ưu tiên các dòng CHƯA CÓ có nhiều dòng bảng nhất. Với hãng nước ngoài (Mitsubishi, Doosan, Volvo Penta, MTU...) chỉ lấy **pháp nhân tại Trung Quốc** (nhà máy liên doanh / công ty con sản xuất tại TQ) nếu tìm được website chính thức của pháp nhân đó; không có thì bỏ.
- `--genbid` ghi file `genbid-mentions.md` (đường dẫn in ra) gồm yêu cầu về hãng / xuất xứ trong các gói thầu đã phân tích. Đọc file này để biết hãng nào hay bị hỏi. Không chép nội dung file này vào repo.
- Nhà máy tổ máy (`genset_oem`): tìm web với từ khoá `柴油发电机组 生产厂家`, `发电机组 制造商 官网`, `diesel generator set manufacturer China factory`, `燃气发电机组 厂家`, kèm tên tỉnh (福建, 山东 潍坊, 江苏 扬州, 广西...) để ra công ty mới.
- Đầu phát: `无刷发电机 生产厂家`, `同步发电机 厂家 官网`, `brushless alternator manufacturer China`.

### Bước 2 — Kiểm tra trùng trước khi làm
```
node suppliers/discover.mjs check "<tên công ty>" <url website>
```
- `ĐÃ CÓ ... cùng website` → bỏ, không làm lại.
- `CÓ THỂ TRÙNG` → mở bản ghi đó (`suppliers/cn/<id>.json`) so tên đầy đủ. Cùng pháp nhân thì bỏ. Khác pháp nhân (ví dụ công ty mẹ làm động cơ, công ty con lắp tổ máy) thì làm bản ghi mới và ghi id kia vào `related`.
- `trong nhật ký ... đã bỏ qua` → không làm lại trừ khi có nguồn mới.
- Tìm chung chung (“diesel generator manufacturer China”) chủ yếu ra sàn B2B và trang SEO, rất dễ sót công ty thật. Trước khi kết luận "chỉ có sàn B2B", luôn tìm lại theo đúng tên công ty (như trên). Nhiều công ty có vài website cùng tên: chọn trang có "Company Profile / About" ghi tên pháp nhân, ghi các website còn lại vào `miss`.
- `sàn B2B` → tìm website riêng của công ty. Không có thì chỉ làm khi Khoa yêu cầu, với `conf: "low"`, `status: "partial"`, `web: null`.

### Bước 3 — Lưu trang nguồn
Đặt `id` là slug a-z 0-9 - theo tên tiếng Anh, ví dụ `kofo-fujian`, `mitsubishi-sme-shanghai`. Lưu 2–5 trang của chính hãng:
- trang chủ, trang "About us / 公司简介" (tên đầy đủ, năm thành lập, nhà máy),
- trang sản phẩm / danh mục có dải công suất,
- trang chứng chỉ nếu có.
```
node suppliers/discover.mjs save <id> <url>
```
Mỗi lệnh in số nguồn (1, 2, 3...). Lệnh báo "trang gần như trống" thì xoá file `suppliers/sources/<id>/<n>.md` vừa lưu rồi lưu lại với `--render`. Báo CAPTCHA / đăng nhập thì xoá file đó, dùng trang khác. Trang công khai mà cả `--render` cũng bị chặn (HTTP 403) thì lưu lại với `--firecrawl` (Khoa cho phép, 2026-10-29); không dùng `--firecrawl` cho trang đòi đăng nhập hay CAPTCHA.

### Bước 4 — Tìm câu trích
```
node suppliers/discover.mjs grep <id> "kva|kw"
node suppliers/discover.mjs grep <id> "founded|established|since|成立|始建"
node suppliers/discover.mjs grep <id> "co\.,? ?ltd|有限公司"
node suppliers/discover.mjs grep <id> "iso|ce |certif|认证"
```
Mỗi dòng in ra có dạng `<số nguồn>: <nội dung>`. Câu trích là **một đoạn liên tục** trong `<nội dung>` (có thể cắt bớt đầu/cuối, tối thiểu 8 ký tự). Không lấy câu từ chỗ khác.

### Bước 5 — Viết bản nháp
```
node suppliers/discover.mjs new <id>
```
rồi sửa `suppliers/drafts/<id>.json`. Mẫu đầy đủ:

```json
{
  "id": "example-power",
  "country": "CN",
  "role": "genset_oem",
  "status": "verified",
  "conf": "medium",
  "en": "Example Power Machinery Co., Ltd.",
  "zh": "示例动力机械有限公司",
  "brands": ["EXPOWER"],
  "web": "https://www.example-power.com/",
  "prov": "Fujian",
  "city": "Fuzhou",
  "founded": 2008,
  "fsrc": [2],
  "related": [],
  "src": {
    "1": ["A", "Example Power Machinery Co., Ltd.", "Power range: 10kVA-2500kVA"],
    "2": ["A", "was founded in 2008"]
  },
  "str": [["Có dải tổ máy 10–2500 kVA", 1], ["Theo hãng: là nhà sản xuất hàng đầu tại Phúc Kiến", 2]],
  "cert": [["ISO9001", 2]],
  "lines": [
    { "k": "genset", "s": "Diesel generator set", "fuel": "diesel", "eng": ["Cummins", "Perkins"], "models": [], "alt": ["Stamford"],
      "p": [10, 2500, "kVA", "unspecified", 1], "src": [1] }
  ],
  "miss": ["website không công bố tần số / điện áp"],
  "by": "discover-bot (Antigravity)"
}
```

Giải thích từng trường:
- `src`: khoá là số nguồn đã `save`; giá trị là `[hạng, câu trích 1, câu trích 2, ...]`. Mỗi thông tin khác (tên, năm, công suất, chứng chỉ, thế mạnh) phải nằm trong câu trích của nguồn mà nó trỏ tới.
- `en`, `zh`: tên như nguồn ghi; nên có câu trích chứa tên. Không biết tên tiếng Trung thì `null`.
- `founded` + `fsrc`: năm và số nguồn có câu trích chứa năm đó. Không có thì `"founded": null, "fsrc": []`.
- `str` (thế mạnh): `["câu tiếng Việt ngắn, sự thật cụ thể", số nguồn]`. Lời tự khen của hãng (leading, No.1, best, hàng đầu, uy tín...) phải bắt đầu bằng `Theo hãng:`. Không viết lời khen của riêng bạn.
- `cert`: `["ISO9001", số nguồn]`, chỉ khi câu trích ghi chứng chỉ đó.
- `lines` (dòng máy):
  - `k`: `genset` (tổ máy), `engine` (động cơ), `alternator` (đầu phát).
  - `s`: tên dòng máy như nguồn ghi.
  - `fuel`: `diesel | gas | dual | hfo | gasoline | other` (đầu phát bỏ trường này).
  - `eng` / `alt`: hãng động cơ / đầu phát mà nguồn ghi rõ là dùng cho dòng này. `models`: model động cơ nguồn ghi. Mỗi tên phải viết đúng như trong câu trích của nguồn dòng này (nguồn ghi "现代" thì ghi "现代", không tự dịch thành "Hyundai"); `finish` kiểm điều này.
  - `p`: `[min, max, "đơn vị", "rating", số nguồn]`. Đơn vị `kVA | kW | hp | PS` đúng như nguồn. Rating `prime | standby | continuous` chỉ khi nguồn ghi rõ, không thì `unspecified`. Không có dải công suất thì bỏ hẳn `p` và phải có `src`.
  - Tuỳ chọn khi nguồn ghi: `freq` (["50Hz","60Hz"]), `volt`, `types` (["open","silent","container"]), `emis` (["EU Stage V"]), `std` (["ISO8528"]).
- `status`: `verified` khi có `web` chính thức **và** ít nhất một dòng có `p`; không thì `partial`.
- `conf`: `medium` mặc định; `low` nếu chỉ có nguồn C; `high` chỉ khi Khoa yêu cầu và có nguồn A.
- `miss`: liệt kê điều đã tìm mà không thấy (dải công suất, năm thành lập, chứng chỉ...).

### Bước 6 — Kiểm tra và dựng bản ghi
```
node suppliers/discover.mjs finish <id>
```
- `✗ drafts/<id>.json: ... lỗi` → sửa đúng chỗ báo. Lỗi "không có nguyên văn" có kèm "dòng gần nhất": chép lại câu trích từ dòng đó (hoặc chạy lại `grep`).
- Hết lỗi, lệnh tự cào bảng thông số trên website (có thể mất vài phút), gộp vào bản ghi và chạy `verify.mjs`. Kết thúc bằng `✓ cn/<id>.json` là xong ứng viên này.
- Website quá chậm hoặc cào lỗi: chạy `finish <id> --no-crawl` để chỉ dựng bản ghi.

### Ứng viên bị bỏ
```
node suppliers/discover.mjs skip "<tên hoặc url>" --reason "<lý do ngắn>"
```
Ví dụ lý do: "chỉ có gian hàng Alibaba", "là đại lý, không có nhà máy", "trùng với yuchai", "website đòi đăng nhập". Xoá luôn `suppliers/sources/<id>/` và `suppliers/drafts/<id>.json` của ứng viên bị bỏ.

### Bước 7 — Kết thúc lượt
```
node suppliers/discover.mjs status
node suppliers/discover.mjs pr
```
`pr` chạy `verify.mjs` cho toàn bộ, commit, push nhánh và mở pull request cho Khoa duyệt. Còn lỗi thì sửa (hoặc xoá bản ghi lỗi của lượt này) rồi chạy lại. Sau cùng báo cho Khoa: số bản ghi đã thêm (id, role, status), số ứng viên bỏ qua kèm lý do, link PR.

Không tự gộp PR. Khoa duyệt và gộp; khi gộp vào `main`, workflow *Supplier publish* tự đăng lên web.
