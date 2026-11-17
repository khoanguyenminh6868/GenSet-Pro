# Đo: tăng ứng viên `candidates()` từ 30 lên 50 (CHỈ ĐO, chưa PR)

Theo chỉ thị điều phối (12/11): chỉ đo, không mở PR. Bản thử: `C:\Projects\GenSet Pro\wt-cand-50` (nhánh `cand-50` từ origin/main 44e9eb7), CHƯA commit, chỉ đổi 1 chữ: `max = 30` → `max = 50` ở mặc định `candidates()` (`suppliers/config-bot.mjs`). Trước = origin/main.

## Chỗ gắn với số 30
- Mặc định `max = 30` ở `candidates()`; `prep()` / `catalogMd` không truyền `max` (dùng mặc định). Chỉ có một con số.
- `config-prompt.md`, `find-prompt.md`, `README.md`: không nhắc "30 dòng".
- Chú thích `config-bot.mjs` có 3 chỗ "30 rows"; test `cand-sync.test.mjs` có `assert.equal(..., 30)` ở 2 chỗ (dòng 42, 92) phải đổi nếu làm.
- Hạn mức con (PER_ENGINE 3, PER_NAMED_ENGINE 8, PER_SUPPLIER 4, CN_ROWS 12, MAKE_ROWS 3, SYNC_ROWS 6, SYNC_PER_SUPPLIER 2): đều số tuyệt đối, chỉ bị chặn bằng `Math.min(.., max)`, không định nghĩa theo tỉ lệ max. Không đổi.

## Cách đo
- Xếp hạng: `diag.mjs` (dựng lại `prep()`, bản chụp supplier cố định) cho 14 cỡ; so tập dòng 30 với 50.
- Kích thước: chạy `prep --origin all [--size N]` thật (chỉ GET) ở bản 30 và bản 50, dữ liệu web hiện tại, **không có `prevResult` / `keep`**; ký tự = độ dài chuỗi JS; token ≈ ký tự / 3,5. Đầu vào agent = prompt.md + input.md + hsmt.txt + catalog.md (controllers.md không tính: agent chỉ grep khi cần).

## (a) 30 dòng cũ còn trong 50: **14/14 cỡ còn đủ**
Thứ tự hạng đổi ở 7 cỡ (IB2600581294, IB2600581977, IB2600594596 ×2, IB2600599817, IB2600601812, IB2600603983) vì dòng giữ chỗ (đồng bộ / hãng G7) điểm thấp nay đứng sau các dòng điểm cao mới vào; 7 cỡ còn lại 30 dòng cũ đứng đầu y nguyên.

## (b) 20 dòng thêm: của ai, điểm bao nhiêu
Toàn bộ là NCC lắp ráp Trung Quốc, 8–15 NCC và 12–18 động cơ khác nhau mỗi cỡ (mỗi NCC tối đa 4 dòng).
| cỡ | điểm dòng 30 cũ | điểm 20 dòng thêm | NCC nhiều nhất |
|---|---|---|---|
| IB2600574589 400 | 244 | 244 → 229 | longkai ×3, comappower ×3 |
| IB2600581294 500 (đồng bộ) | 73* | 257 → 229 | longkai ×3, bobig ×3, wintpower ×3 |
| IB2600581977 250 (đồng bộ) | 103* | 236 → 197 | westinpower ×4, comappower ×4 |
| IB2600586587 160 | 235 | 234 → 211 | comappower ×3 |
| IB2600592658 500 | 721 | 721 → 673 | longkai ×4 |
| IB2600592684 30 | 689 | 656 → 405 | yingtai-jiangsu ×4 |
| IB2600592684 500 | 721 | 721 → 706 | longkai / koten / victory ×4 |
| IB2600594596 300 (đồng bộ) | 123* | 255 → 228 | wintpower ×3 |
| IB2600594596 400 (đồng bộ) | 75* | 268 → 229 | acepow-fuan ×4, longkai ×4 |
| IB2600595853 500 | 721 | 721 → 673 | longkai ×4 |
| IB2600599817 (không cỡ) | 269 | 284 → 275 | dingbo ×4, gb-power ×4 |
| IB2600601812 100 | 237 | 243 → 221 | voltgent ×3 |
| IB2600602880 150 | 693 | 689 → 504 | mecca-power ×4 |
| IB2600603983 700 (G7 thương hiệu) | 69* | 261 → 198 | dingbo ×3, eastern-lion-fuan ×3 |

\* dòng 30 cũ là dòng giữ chỗ điểm thấp (đồng bộ / hãng G7). Ở cỡ thường, điểm cao nhất của 20 dòng thêm xấp xỉ dòng 30 (bằng hoặc thấp hơn ≤ 11), điểm thấp nhất thấp hơn 15–48; hai cỡ ít dòng vừa công suất (IB2600592684 30 và IB2600602880 150) tụt tới ~405–504 (thấp hơn dòng 30 ~190–280).

## (c) Kích thước (ký tự → token ≈ ký tự/3,5); catalog.md = ứng viên + mục nhà cung cấp
| cỡ | catalog.md 30 → 50 | tổng đầu vào 30 → 50 | tăng tổng |
|---|---|---|---|
| IB2600574589 400 | 172.415 → 220.737 (49,3k → 63,1k) | 342.796 → 391.112 (97,9k → 111,7k) | +14,1% |
| IB2600581294 500 | 180.844 → 238.876 (51,7k → 68,3k) | 257.610 → 315.636 (73,6k → 90,2k) | +22,5% |
| IB2600581977 250 | 155.322 → 199.323 (44,4k → 56,9k) | 275.229 → 319.224 (78,6k → 91,2k) | +16,0% |
| IB2600586587 160 | 153.959 → 204.856 (44,0k → 58,5k) | 256.275 → 307.166 (73,2k → 87,8k) | +19,9% |
| IB2600592658 500 | 149.297 → 188.884 (42,7k → 54,0k) | 203.105 → 242.686 (58,0k → 69,3k) | +19,5% |
| IB2600592684 30 | 118.211 → 167.211 (33,8k → 47,8k) | 232.213 → 281.207 (66,3k → 80,3k) | +21,1% |
| IB2600592684 500 | 146.701 → 191.798 (41,9k → 54,8k) | 260.708 → 305.799 (74,5k → 87,4k) | +17,3% |
| IB2600594596 300 | 148.802 → 211.762 (42,5k → 60,5k) | 301.172 → 364.126 (86,0k → 104,0k) | +20,9% |
| IB2600594596 400 | 169.828 → 225.785 (48,5k → 64,5k) | 322.198 → 378.149 (92,1k → 108,0k) | +17,4% |
| IB2600595853 500 | 149.297 → 188.884 (42,7k → 54,0k) | 203.067 → 242.648 (58,0k → 69,3k) | +19,5% |
| IB2600599817 | 177.225 → 294.707 (50,6k → 84,2k) | 250.285 → 367.761 (71,5k → 105,1k) | +46,9% |
| IB2600601812 100 | 172.331 → 211.260 (49,2k → 60,4k) | 267.745 → 306.668 (76,5k → 87,6k) | +14,5% |
| IB2600602880 150 | 134.501 → 178.971 (38,4k → 51,1k) | 223.327 → 267.791 (63,8k → 76,5k) | +19,9% |
| IB2600603983 700 | 151.355 → 183.300 (43,2k → 52,4k) | 290.953 → 322.892 (83,1k → 92,3k) | +11,0% |

Tổng 14 cỡ: catalog.md +33,3% (2,18 → 2,91 triệu ký tự); đầu vào cả lượt +19,7% (3,69 → 4,41 triệu ký tự). Mỗi cỡ catalog.md thêm ≈ 31–66k ký tự ≈ 9–19k token (IB2600599817 thêm 117k ký tự ≈ 33k token: dòng của gói này dài, gói không có cỡ rõ). input.md / prompt.md / hsmt.txt không đổi (prompt.md 29.067 ký tự; input.md 14–78k; hsmt.txt 7–70k). Token tiếng Việt thật thường cao hơn ký tự/3,5; số này để so sánh.

## (d) Cỡ còn dưới 50 dòng vì không đủ dòng hợp lệ: **0/14** (cả 14 cỡ đủ 50; số dòng tính điểm 1.136–29.739 mỗi cỡ).

## Hạn mức con
Không cái nào làm 20 chỗ thêm không lấp được; không thấy lệch. Chỗ giữ (SYNC 6, CN 12, MAKE 3) là số tuyệt đối nên chiếm tỉ lệ nhỏ hơn trong 50. Không đổi.

## Chưa kiểm
- Chưa đo chất lượng cấu hình agent chọn từ 50 dòng (không chạy agent); 20 dòng thêm đều là NCC lắp ráp CN điểm sát dòng 30, nên lợi ích chưa rõ.
- Kích thước từ `prep` không có `prevResult` (lượt thật có `keep`, thêm vài dòng); web hiện tại có thể khác bản chụp dùng cho phần xếp hạng.
- Thời gian / chi phí token thật của agent chưa đo.
