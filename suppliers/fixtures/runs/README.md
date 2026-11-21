# Hồi quy phần sau agent (không gọi agent)

`regress-config.test.mjs` và `regress-bidprice.test.mjs` lấy câu trả lời agent của một lượt thật làm đầu vào cố định,
chạy lại code và so với `*.expected.json`. Đổi code làm đổi kết quả → test đỏ.

## Đổi quy tắc có chủ ý
```
GENBID_REGRESS_UPDATE=1 node --test suppliers/regress-config.test.mjs suppliers/regress-bidprice.test.mjs
git diff suppliers/fixtures/runs
```
Đọc diff (thứ hạng, số đạt / không đạt / chưa rõ / xác nhận theo bộ phận, NCC, cảnh báo, giá ba mức), đúng ý thì commit
cùng PR sửa quy tắc. Không cập nhật mẫu chỉ để test xanh.

## Mỗi lượt
`<TBMT>/config[-<cỡ>].input.json.gz` (gzip JSON):
- `result`: kết quả Gợi ý cấu hình đã lưu (`configmatch`, đã qua check của lượt đó); `check` chạy lại trên nó như
  `keepFound` / Gợi ý lại. Thư mục lượt `%TEMP%\genbid-config\<TBMT>` bị xoá sau mỗi lượt, log agent chỉ có script
  dựng result.json, nên không còn result.json thô của agent.
- `hsmtText`: chữ HSMT như `prep` ghi hsmt.txt (đọc lại từ web 13/11/2026; email đã thay bằng `[email]`).
- `meta`: origin / basis / sized như `prep` ghi meta.json.
- `suppliers`: chỉ NCC mà kết quả nhắc tới (supplierId ở cấu hình, src, factSrc), cắt bớt: bảng có `n` được dẫn
  (bảng dài > 40 dòng chỉ giữ 3 dòng đầu + dòng nêu model / dòng được trích; datasheet một model giữ nguyên), bảng khác
  có dòng nêu model của cấu hình, bộ điều khiển liên quan. Lấy từ `doc-cache\supplier.json` 13/11/2026. Lúc dựng, kết
  quả trên phần cắt này trùng hoàn toàn với chạy trên cả kho NCC.
- `sources`: các `sources/<id>/<n>.md` có bảng RATINGS mà `sourceRatings` đọc, đóng băng (test truyền `sourcesDir`).

`<TBMT>/bidprice.input.json.gz`: `samples` (samples.json do `bidprice-bot prep` dựng lại với bidhist 12/11/2026, cùng
danh sách gói cũ như lượt thật) và `result` (mức agent xếp từng gói, lấy từ `bidprice` đã lưu). Lúc dựng, giá ba mức,
giá hiệu chỉnh và giá theo cấu hình khớp từng đồng với bản trên web.

Lượt đã chọn và lý do: tên ca trong hai tệp test; chi tiết, kích thước và điểm nghiệp vụ trông sai:
`genbid-work\dieu-phoi\nghiem-thu\test-t4.md`. Thêm lượt mới: chép cách dựng ở bản nghiệm thu đó (script trong
`nghiem-thu\test-t4-tools\`, cần token đọc web), mỗi lượt < 300 KB, không đưa giá vốn / báo giá NCC / token vào.
