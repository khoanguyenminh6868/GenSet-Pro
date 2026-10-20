# GenBid Pro

Ứng dụng di động (Android, iOS và web) quản lý toàn bộ vòng đời các gói thầu máy phát điện.

| Tính năng | Mô tả |
|---|---|
| **Gói thầu** | Tự lấy các thông báo mời thầu **còn đang mở** về máy phát điện từ [muasamcong.mof.gov.vn](https://muasamcong.mof.gov.vn/web/guest/contractor-selection?render=index), đếm ngược thời điểm đóng thầu, lọc và sắp xếp. |
| **Theo dõi** | Quy trình vòng đời: Mới → Đang đánh giá → Chuẩn bị HSDT → Đã nộp → Trúng / Không trúng / Bỏ qua, kèm ghi chú nội bộ và thống kê tỉ lệ trúng. Lưu trên máy. |
| **Phân tích** | Đọc HSMT/E-HSMT (PDF, DOCX, TXT, ảnh chụp) bằng Claude, tóm tắt thông tin chính, thông số kỹ thuật, yêu cầu năng lực và **highlight** các điểm cần lưu ý theo mức độ (nghiêm trọng / cần lưu ý / thông tin), kèm trích dẫn nguyên văn và khuyến nghị. |
| **Đối chiếu** | So hồ sơ dự thầu với yêu cầu ban đầu từng dòng: Đạt / Đạt một phần / Không đạt / Thiếu / Chưa rõ, điểm tổng, tài liệu còn thiếu, việc cần làm trước khi nộp. |
| **Dịch** | Dịch Việt ⇄ Anh với thuật ngữ đấu thầu và máy phát điện chuẩn. |

Giao diện tông vàng đen.

## Cấu trúc

```
app/      Ứng dụng Expo (React Native + Expo Router), chạy Android, iOS, web
server/   API Node.js: lấy dữ liệu muasamcong, gọi Claude để phân tích, dịch, đối chiếu
```

Ứng dụng gọi qua `server` vì: khoá API Claude không được nằm trong app, và bản web không gọi thẳng được muasamcong (CORS).

## Chạy thử

Cần Node.js 20 trở lên.

**1. Máy chủ**

```bash
cd server
npm install
cp .env.example .env      # điền ANTHROPIC_API_KEY
npm run dev               # http://localhost:8787
```

**2. Ứng dụng**

```bash
cd app
npm install
cp .env.example .env      # EXPO_PUBLIC_API_URL trỏ tới máy chủ
npx expo start
```

Quét mã QR bằng Expo Go (Android/iOS), hoặc bấm `w` để mở bản web. Trên điện thoại thật, đặt `EXPO_PUBLIC_API_URL` là IP LAN của máy tính chạy server (ví dụ `http://192.168.1.10:8787`), không dùng `localhost`.

## Triển khai

**Máy chủ** (`server/Dockerfile`, có sẵn Chromium): trên [Render](https://render.com), chọn *New → Blueprint*, trỏ tới repo này. Render đọc `render.yaml` và chỉ hỏi `ANTHROPIC_API_KEY`. Cần gói từ Starter trở lên vì Chromium cần khoảng 1 GB RAM. Có thể dùng bất kỳ host chạy Docker nào khác (Railway, Fly.io, VPS).

**Ứng dụng**: `app/eas.json` có sẵn hai cấu hình build, đều trỏ tới `https://genbid-pro-api.onrender.com`. Nếu máy chủ của anh có địa chỉ khác thì sửa lại trong tệp này.

```bash
cd app
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview   # file APK cài thẳng lên Android
npx eas-cli@latest build -p ios --profile production    # cần tài khoản Apple Developer
```

## API máy chủ

| Endpoint | Mô tả |
|---|---|
| `GET /api/tenders` | Gói thầu máy phát điện đang mở. `?refresh=1` bỏ cache 10 phút, `?q=...` tìm theo từ khoá khác, `?sample=1` trả dữ liệu mẫu (gắn nhãn rõ, không phải thông báo thật). |
| `POST /api/analyze` | multipart: `files[]` và/hoặc `text`, `context`, `language` (`vi`/`en`). |
| `POST /api/compare` | multipart: `requirements[]`, `submission[]` (hoặc `requirementsText`, `submissionText`), `language`. |
| `POST /api/translate` | JSON `{ text, direction: "vi-en" \| "en-vi" \| "auto" }`. |

## Ghi chú

- **Kết nối muasamcong**: phần lấy dữ liệu nằm trọn trong `server/src/muasamcong.ts`. Nó gọi đúng endpoint tìm kiếm mà trang muasamcong dùng (`/o/egp-portal-contractor-selection-v2/services/smart/search`), tìm theo các từ khoá trong `GENERATOR_KEYWORDS` và chỉ giữ gói có thời điểm đóng thầu sau hiện tại. Trang này yêu cầu token reCAPTCHA v3, nên nếu gọi trực tiếp bị từ chối, máy chủ sẽ mở trang trong Chromium ẩn để lấy token (`MUASAMCONG_MODE=auto|direct|browser`). Workflow *muasamcong live check* trên GitHub chạy kiểm tra thật mỗi sáng; chạy tay bằng `npm run check:portal`.
- **AI**: dùng Claude (`claude-opus-5-5`, đổi bằng `ANTHROPIC_MODEL`) với structured outputs để kết quả luôn đúng cấu trúc. Tệp tối đa 20 MB mỗi tệp; PDF và ảnh được gửi nguyên để AI đọc được cả bản scan.
- **Dữ liệu theo dõi** lưu trên thiết bị (AsyncStorage). Muốn dùng chung cho cả nhóm cần thêm cơ sở dữ liệu và đăng nhập ở `server`.

## Kiểm tra

```bash
cd server && npm run typecheck && npm test
cd app && npx tsc --noEmit
```
