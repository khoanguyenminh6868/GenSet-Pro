# bdk-manual-1: lưu operator manual DSE7320 MKII (21/11/2026): DỪNG, chưa tải được

**Kết quả: không có thay đổi dữ liệu hay mã, không có PR.** Các mục 3/12, 0/8, 1/13, 4/5 của IB2600603983 giữ nguyên (chưa đo lại vì dữ liệu không đổi).

## Đã làm
- Đọc URL điều phối giao qua Firecrawl (1 credit): https://www.deepseaelectronics.com/genset/manual-auto-start-control-modules/dse7310-mkii/downloads/operators-manual/855
- Kết quả: `statusCode 403`, tiêu đề "Error 403 | Deep Sea Electronics", `proxyUsed: stealth`. Không nhận được nội dung manual.
- Theo suppliers/CLAUDE.md (403 → Firecrawl, vẫn lỗi thì dừng): dừng.

## Không làm (cố ý)
- Không đoán URL khác (vd. đổi đuôi từ URL datasheet n1001 `.../dse7320-mkii/downloads/datasheet`).
- Không lấy bản ở trang bên thứ ba, không đăng nhập, không đổi User-Agent.
- Không viết cơ chế "tuỳ chọn" (việc 2): chưa có dòng manual thật để thiết kế theo.

## Chưa biết
- Vì sao 403: trang có thể đòi tài khoản DSE hoặc chặn truy cập tự động. Chưa xác định.
- Trên máy: không có tệp tên chứa 057-253 trong `genbid-work`. Trong nguồn DSE đã lưu, chữ 057-253 chỉ có ở datasheet `1001.md` (mã tài liệu được nhắc tới, không phải nội dung manual).

## Cần Khoa chọn
1. **Khoa tự tải PDF** (đăng nhập tài khoản DSE nếu trang đòi) rồi đặt vào máy: phiên sau chạy tiếp từ `maker-datasheets` / lưu nguồn, URL ghi là trang chính hãng ở trên.
2. Hoặc bỏ qua manual: các mục BĐK giữ "chưa rõ", hỏi NCC.

## Làm tiếp khi có PDF (CHƯA làm)
Việc 1–4 của giao việc giữ nguyên. Sau DSE7320 MKII mới xét DSE7420 MKII, DSE8610 MKII, ComAp; các trang đó chưa thử nên chưa biết có bị chặn không.
