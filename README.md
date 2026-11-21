# GenSet-Pro

Công cụ theo dõi và chuẩn bị hồ sơ cho các gói thầu máy phát điện trên [muasamcong.mof.gov.vn](https://muasamcong.mof.gov.vn): danh sách gói, phân tích HSMT, gợi ý cấu hình, gợi ý giá đấu, nhà cung cấp, nhà thầu.

## Cấu trúc

```
web/        Trang web (Vercel): index.html + api/ (Supabase)
bot/        Bot Windows: bản trong git của C:\Projects\GenSet Pro\genbid-hsmt\ (Sync, Lấy tệp, Phân tích, điều phối các lượt Claude)
suppliers/  Dữ liệu nhà cung cấp và mã Gợi ý cấu hình / Giá gợi ý mà bot chạy (config-bot.mjs, bidprice-bot.mjs)
server/     Đọc cổng muasamcong (src/muasamcong.ts) cho các script tra gói thầu
```

Quy tắc và bẫy khi sửa mã: `CLAUDE.md`, `web/CLAUDE.md`, `suppliers/CLAUDE.md`. Cài bot trên máy mới: `bot/SETUP-CLAUDE.md`.

## Kiểm tra

```bash
node --test suppliers/*.test.mjs
node --test bot/test/*.test.mjs
node --test web/api/test/*.test.mjs
node --test web/test/static.test.mjs
cd server && npm run typecheck && npm test
```

Giao diện web (Playwright) và bot PowerShell (Pester): xem `web/test/README.md` và `.github/workflows/`.

## server/

`src/muasamcong.ts` gọi đúng endpoint tìm kiếm mà trang muasamcong dùng. Script:

```bash
cd server
npm install
npm run lookup:tenders    # tra gói theo danh sách scripts/lookup.txt (workflow tender-lookup.yml)
npm run check:portal      # kiểm cổng còn trả lời
npm run export:feed       # xuất các gói máy phát điện đang mở
```

Ứng dụng điện thoại (Expo) và máy chủ Express / Render đã gỡ ngày 13/11/2026; lấy lại từ lịch sử git nếu cần (commit trước PR gỡ).
