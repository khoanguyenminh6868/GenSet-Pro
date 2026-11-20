# Đo top 30 Gợi ý cấu hình: GỐC vs PR #957

- GỐC = merge-base(origin/main, PR #957) = `cf0b04481379675267fdf0915d7b7c6e6155d0c3`
- NHÁNH = PR #957 SHA `5875f6677ec668062bf79b09aef2304657ae2a1a`
- Cùng một tệp bidhist (tải 2026-11-20T06:42:22Z, 1556 doc, không commit): 928 gói, 432 NCC.
- Lệnh (cả hai lượt cùng `--bidhist` tải một lần; lượt GỐC tải bằng `--save-bidhist`, lượt chạy lại cho kết quả cuối dùng `--bidhist`):
  `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn gop-goc.json --bidhist <bidhist>`
  `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn gop-nhanh.json --bidhist <bidhist>`
- do-gop.mjs có ghi sẵn `dropped` (số dòng loại) và `rowflag` (khoá dòng bị loại bởi rowflag); không bật thêm gì, không sửa mã.
- Tệp: `gop-goc.json.gz`, `gop-nhanh.json.gz`, `meta-*.json`.

## Kết quả
- Số lượt (gói#cỡ): 1093 mỗi bên, 0 lỗi, không lượt nào chỉ có một bên.
- Giống hoàn toàn: 879; khác: 214.
- Đổi top 30 (danh sách khoá): 1 lượt; đổi điểm top: 1 lượt.
- Số lượt khác theo trường: all 190, dropped 176, rowflag 206, top 1, topScore 1.
