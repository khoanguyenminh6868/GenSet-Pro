# Nghiệm thu T8 — test cho `server/`

PR (nháp): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/631. Nhánh `test/t8-server`, worktree `wt-test-t8`.

## 1. `server/` còn dùng ở đâu
| Phần | Ai gọi | Kết luận |
|---|---|---|
| `src/muasamcong.ts` | `server/scripts/lookup-tenders.ts` (workflow `tender-lookup.yml`, chạy tay + khi PR đổi script), `export-feed.ts`, `check-portal.ts` | **CÒN DÙNG** (thực tế duy nhất). Web Vercel / bot không import `server/`. |
| `src/index.ts` (Express: `/api/tenders`, `/analyze`, `/translate`, `/compare`) | app Expo (`app/src/lib/api.ts`) + `render.yaml`/Dockerfile (Render) | **NGHI CHẾT** — chỉ app Expo/Render dùng; Khoa chỉ dùng web Vercel + bot Windows (bộ nhớ `no-artifact-version`). Không thấy `genbid-pro-api.onrender.com` được web/bot gọi. |
| `src/claude.ts`, `src/documents.ts` | chỉ `index.ts` | **NGHI CHẾT** (cùng chuỗi trên) |
| `src/sampleTenders.ts` | chỉ `index.ts` (`?sample=1`) | **NGHI CHẾT** |
| README nhắc workflow "muasamcong live check" | không có tệp workflow này trong `.github/workflows` | README lỗi thời |

Theo brief: phần mã chết KHÔNG viết test. Không có test cho `index.ts`, `claude.ts`, `documents.ts`, `sampleTenders.ts`. **Điều phối quyết**: xoá cả chuỗi Express/Claude/app, hay giữ (nếu Khoa còn dùng app Expo). Nếu giữ thì cần việc bổ sung test `documents.ts` (PDF/ảnh/docx/txt, `UnsupportedFileError`) và các tuyến `index.ts` bằng fetch/SDK giả.

## 2. Đã phủ (tệp mới `server/test/muasamcong-more.test.ts`, 28 ca + 3 `todo`)
Trước: 3/11 xuất ra của `muasamcong.ts` có test nhắc tới (`isGeneratorTender`, `normalizeTender`, `searchBody`) — đo bằng đếm tên trong `server/test`.
Sau: 10/11 (thêm `stripAccents`, `buildDetailUrl`, `extractContent`, `CaptchaRequiredError`, `searchRaw` chế độ direct, `fetchOpenGeneratorTenders`, `GENERATOR_KEYWORDS`, `PORTAL_ORIGIN`). Chưa phủ: nhánh trình duyệt (`searchViaBrowser`, chế độ auto/browser) vì cần Chromium thật — không giả hợp lý, bỏ.

Nội dung: bỏ dấu (đ/Đ); từ khoá máy phát; link chi tiết (tham số `undefined`, isInternet 1/0, bidForm); chuẩn hoá tên trường dự phòng; múi giờ +07:00 / Z / mili-giây / chuỗi rác; ranh giới đóng thầu (bằng = đã đóng, +1s = mở); không ngày = đóng; địa điểm nhiều nơi; isInternet các dạng; bộ lọc `openOnly=false` (tra gói đã đóng), loại KHKQ; các dạng trả lời của cổng; `fetch` giả: POST đúng URL/thân, reCAPTCHA (trả về số), HTTP 503, lọc gói đóng/không phải máy phát, gộp trùng giữ bản mới nhất, mới đăng xếp trước, từ khoá mặc định.
Ca "khoá hành vi": `Phát điện mặt trời` vẫn coi là máy phát (chuỗi `phat dien`).

## 3. `todo` (lỗi thật ở `asNumber`, `muasamcong.ts`, chưa sửa)
1. `"2.500.000.000 đ"` (dấu chấm ngăn nghìn kiểu Việt) → `Number("2.500.000.000")` = NaN → giá `undefined`.
2. `bidGuarantee: "45.000.000"` → `undefined` (cùng nguyên nhân).
3. `"Không công bố"` → bỏ hết ký tự → `Number("")` = **0** → giá 0 đồng thay vì không có giá.
Chưa đo trên `doc-cache` (cổng thật hiện trả số / mảng số nên chưa gây hại; không có mẫu chuỗi trong dữ liệu).

## 4. Lệnh đã chạy
- `npm run typecheck` → xanh (tsc --noEmit, không lỗi).
- `npx tsx --test test/muasamcong.test.ts test/muasamcong-more.test.ts` → tests 31, pass 28, fail 0, todo 3, ~1 giây.
- Lưu ý: `npm test` với glob `test/*.test.ts` không chạy trên Windows cmd (không bung glob) — trên CI ubuntu thì bình thường; cục bộ liệt kê tệp. Không sửa `package.json`.
- Không gọi mạng thật (`fetch` giả, khôi phục sau mỗi ca).

## 5. Rủi ro / quay lui
Chỉ thêm 1 tệp test; quay lui = xoá tệp. Không sửa `server/src`, không sửa workflow.

## 6. Cần ghi nhớ
- Quyết xoá/giữ chuỗi Express + Claude + app Expo + Render (README cũng nhắc workflow "muasamcong live check" không tồn tại).
- Có sửa `asNumber` để đọc dấu chấm nghìn và "không có số" → undefined hay không.
