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

**Build cài đặt (APK/IPA)**: dùng EAS, `npx eas-cli@latest build -p android` hoặc `-p ios`. Khi phát hành, triển khai `server` lên một máy chủ có HTTPS (Render, Railway, VPS...) và đặt `EXPO_PUBLIC_API_URL` theo địa chỉ đó.

## API máy chủ

| Endpoint | Mô tả |
|---|---|
| `GET /api/tenders` | Gói thầu máy phát điện đang mở. `?refresh=1` bỏ cache 10 phút, `?q=...` tìm theo từ khoá khác, `?sample=1` trả dữ liệu mẫu (gắn nhãn rõ, không phải thông báo thật). |
| `POST /api/analyze` | multipart: `files[]` và/hoặc `text`, `context`, `language` (`vi`/`en`). |
| `POST /api/compare` | multipart: `requirements[]`, `submission[]` (hoặc `requirementsText`, `submissionText`), `language`. |
| `POST /api/translate` | JSON `{ text, direction: "vi-en" \| "en-vi" \| "auto" }`. |

## Ghi chú

- **Kết nối muasamcong**: phần lấy dữ liệu nằm trọn trong `server/src/muasamcong.ts` (endpoint tìm kiếm mà trang muasamcong dùng, từ khoá trong `GENERATOR_KEYWORDS`, chỉ giữ gói có thời điểm đóng thầu sau hiện tại). Cổng thông tin có thể đổi API hoặc bật captcha; khi đó chỉ cần sửa tệp này. Ứng dụng báo lỗi rõ ràng và cho xem dữ liệu mẫu nếu không kết nối được.
- **AI**: dùng Claude (`claude-opus-5-5`, đổi bằng `ANTHROPIC_MODEL`) với structured outputs để kết quả luôn đúng cấu trúc. Tệp tối đa 20 MB mỗi tệp; PDF và ảnh được gửi nguyên để AI đọc được cả bản scan.
- **Dữ liệu theo dõi** lưu trên thiết bị (AsyncStorage). Muốn dùng chung cho cả nhóm cần thêm cơ sở dữ liệu và đăng nhập ở `server`.

## Kiểm tra

```bash
cd server && npm run typecheck && npm test
cd app && npx tsc --noEmit
```
