# bdk-link-goc: link tài liệu gốc của hãng trên thẻ cấu hình (21/11/2026)

Việc: điều phối chuyển lời Khoa 21/11/2026 "ok, cho hiện link gốc". Nhánh `bdk-link-goc`, từ origin/main 7bca1582.

## Sửa
- `web/index.html`: `cfgMakerLinkHtml` vẽ "Tài liệu gốc ↗" (tab mới, `rel=noopener`) cạnh nhãn của bộ phận `fromMaker` và mô-đun NCC chưa chào. URL = `src.url`, không có thì nguồn [n] trong hồ sơ hãng (`src` / `compat`: supplierId + n). Không có URL http(s) thì không vẽ. Hồ sơ hãng về sau khi thẻ đã vẽ thì `partsFill()` điền vào ô `.cfgmk`.
- Các link nguồn khác vẫn gate bằng `SHOW_SRC`.
- Không cần sửa bot: kết quả đã lưu mang `supplierId` + `n`, web tra ra URL.

## CHƯA làm: ghi ngoại lệ vào `web/CLAUDE.md`
Phiên này không sửa CLAUDE.md theo tin chuyển từ phiên khác. Khoa (hoặc phiên điều phối, nếu Khoa bảo trực tiếp) thêm vào mục "Trích nguồn", và đổi chữ "NGOẠI LỆ DUY NHẤT" thành "HAI NGOẠI LỆ":

> Ngoại lệ 2 (Khoa 21/11/2026): thẻ cấu hình Gợi ý hiện link "Tài liệu gốc" của bộ phận `fromMaker` và mô-đun NCC chưa chào (`cfgMakerLinkHtml`); chỉ link, không câu trích. Không có URL thì không vẽ.

## Kiểm trên dữ liệu thật
configmatch IB2600603983 đang đăng: 15 bộ phận / mô-đun thuộc diện này, cả 15 ra URL. Mô-đun DSE890 MKII trỏ tới datasheet DSE7320 MKII (nguồn [1001], nơi có dòng "DSE890 MKII | 0890-04"), không phải tờ riêng của mô-đun; CM2-4G-GPS tương tự trỏ tới tệp ComAp [1011].

## Ảnh (`bdk-mo-dun-4\`)
`truoc-link-goc.png` / `sau-link-goc.png` (thẻ #2).

## Test
- `node --test suppliers/*.test.mjs web/test/spec-norm.test.mjs`: 1514 đạt, 0 hỏng.
- Playwright toàn bộ (Edge, 2 worker, hạn 120 giây): 140 / 140 đạt, gồm `cfg-maker-link.spec.mjs` mới.
