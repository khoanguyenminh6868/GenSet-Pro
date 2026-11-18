# Nghiệm thu: Lệch cột 11 (sửa mã đọc cho dòng đọc lệch, nhóm A)

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/926 — nhánh `lech-cot-11`, gốc `origin/main` 270b4eb4 (#925).

## Tệp đổi
- `web/catalog.js` (mã đọc)
- `suppliers/lech-cot-11.test.mjs` (mới, 23 ca, dòng thật từ `suppliers/cn`)
- `suppliers/row-flags.test.mjs` (fixture: dòng yingtai n113 nay đọc đúng nên không còn ví dụ "điện áp = công suất"; thay bằng bảng có ô điện áp 1150)
- `web/CLAUDE.md` (bẫy "Lệch cột 11", 7 điểm, gồm hai hướng đã thử và bỏ)
- `suppliers/unread-tables.json` (chạy lại; 3.375 bảng, diff lớn một phần do bản chụp cũ trôi)
Không đụng `config-bot.mjs`, `row-flags.mjs`, `web/index.html`, `suppliers/cn`.

## Đã sửa gì (theo bố cục, không theo tên NCC)
1. **SPECS `not`**: dòng điện không nhận "Circuit Breaker / 断路器 / 空开" (hosem n1001); kích thước không nhận "Motor Size" (xinhengxin); tốc độ không nhận "Max Over Speed / 超速" (aosif).
2. **`notOutput`** (bọc `rowSpecs`): bỏ dòng điện dạng "5 9/54" (zhengdian); bỏ khối lượng / độ ồn trùng đúng kW / kVA của dòng (cgm-italia "kg" = công suất dự phòng, yingtai n111 lẫn); bỏ điện áp trùng công suất của dòng mà không phải mức chuẩn ≥ 380 V (yingtai n113). Mỗi lần bỏ có ghi `unread` note.
3. **`walkedSpecs`**: tiêu đề "Max power" đứng trên số ngoài 0,9–1,8×kW → bỏ cả lượt đi (yanfa n107: nhiên liệu 58.8 / 2.5 đọc thành dung tích); tiêu đề "L×W×H" nằm trên ô động cơ thì ngắt lượt đi (yingtai n111: "净重" 115.2 = dòng điện, nay trọng lượng 1180 + kích thước đọc đúng); `cut/lost`: ≥ 2 tiêu đề công suất không xác nhận thì cắt các số sau.
4. **Dòng "Power range"** dạng "a – b kW" → bỏ cả dòng, ghi note (eastern-lion n109/n129: dòng tổng quan dòng máy, không là một tổ máy).
5. **Doosan `P\d{3}(TI|LE)`** ở ô đầu phát khi có cột động cơ → là động cơ, đầu phát lấy từ ô sau (green-power n108 và các NCC khác); **mã khung `(16|18|22|27|31|35)4[A-Z]{1,2}`** khi có cột đầu phát → là đầu phát (uleengen n132/133/136).
6. **Bảng nhãn "Engine model"** nhiều động cơ trong một trang: `engSplit` tách theo động cơ (yongcai n172, nhiều động cơ một trang), `multiEng` bỏ xi lanh / dung tích / đường kính / tỉ số nén vì không ghép được (hosem n134).
7. **Số phẩy + 3 chữ số** trong bảng nhãn đọc là hàng nghìn, trừ bảng tự viết phẩy thập phân (mwm n1028: 3,333 → 3333 kW).

## Lệnh đã chạy (kết quả thật)
- `node suppliers/spec-diff.mjs git:270b4eb4 . --out full.txt --md tom-tat.md` (cùng dữ liệu hai bên, sau rebase): bản ghi 58.963 → 59.016; **120 đổi, 43 mất, 96 thêm**, 44 bảng của 18 NCC; **đảo vai 1 → 0**; 77 giá trị "soát tay".
- `node --test suppliers/*.test.mjs`: tests 1091, pass 1083, fail 0, todo 8 (8 todo "PR 2" của #925).
- `node --test web/test/*.test.mjs`: 161/161 pass.
- `node --test suppliers/lech-cot-11.test.mjs`: 23/23 pass. Trên catalog của origin/main: 16 ca FAIL (đúng là các sửa) và 7 ca pass (ca bảo vệ hồi quy).
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".
- `row-flags --list absurd`: 51 → 21 (còn lại là nhóm B và yongcai QC385BT tốc độ 2350 do nguồn ghi vậy). cylMaj 143 → 142.

## Số liệu trước / sau (đo, không ước)
| | trước | sau |
|---|---|---|
| Bản ghi | 58.963 | 59.016 |
| Đảo vai | 1 | 0 |
| Cờ `absurd` | 51 | 21 |

Thay đổi theo kiểu (đã xem từng kiểu):
- **Mất 43**: eastern-lion 22 (dòng tổng quan, kể cả bản ghi "động cơ ↔ hãng" của chúng), uleengen 11 (đọc lại khung đầu phát thay vì động cơ; mỗi bản ghi mất có bản ghi mới đúng số), agg 4, green-power 3, kaichen 3 (Doosan P-series đọc lại là động cơ).
- **Thêm 96**: yongcai 43 (tách theo động cơ), rise-power 19, rcg-power 10, uleengen 11, agg 4, green-power 3, kaichen 3, sanq 2, jet-power 1 (Doosan / khung đầu phát; rcg, rise n120, sanq, jet n107 là dữ liệu mới vào main sau lần đo đầu).
- **Giá trị bị bỏ (để trống)**: yanfa dung tích ×36, xinhengxin kích thước ×12, cgm khối lượng / ồn, yingtai n113 điện áp ×6, yingtai n111 khối lượng sai, hosem xi lanh / dòng, aosif tốc độ, zhengdian dòng.
- **Đọc đúng hơn**: mwm 3.333 → 3333 (và vài công suất mwm khác), yingtai n111 115.2 → 1180 + kích thước.

## 3 mẫu để so với nguồn
1. **mwm n1028** — https://www.mwm.net/files/upload/mwm/issuu/CES24019-Update-Produktbroschuere-TCG-2032B_210x297mm_EN_1_0_RZ_sm_screen.pdf — dòng nguồn: `| Electrical power3) | kW | 3,333 | 4,300 | 4,500 |`. Trước: 3.333 kW; sau: 3333 kW (cùng dòng dùng phẩy nghìn "4,300", "4,500").
2. **yingtai-jiangsu n113** — https://www.yingtaigroup.com/pd43525735.html — dòng nguồn: `| 1000GF | 1000 | 1100 | 114.3 | 11330 | 6.40×2.04×2.64 | KTA50-G3 | 1097 | 1227 | 16 | 50.3 | ≤209 | 电子` (thiếu ô điện áp). Trước: điện áp = 1100 (là công suất dự phòng); sau: bỏ điện áp, giữ dòng điện 114.3, kích thước, xi lanh 16, tiêu hao ≤209.
3. **yanfa-yancheng n107** — http://www.yanfapower.cn/product1.asp?Product_ID=1524 — các số 58.8 và 2.5 nằm dưới tiêu đề "Max power" (nhiên liệu), trước đọc thành dung tích. Sau: không có dung tích. (Tôi chưa mở lại trang web trực tiếp trong phiên này; so với bảng trong `suppliers/cn/yanfa-yancheng.json` n107.)

## Ca chưa sửa được / để trống
- yanfa, xinhengxin: bố cục không đọc đúng được bằng luật chung → để trống (đúng nguyên tắc thà thiếu còn hơn sai).
- hosem n134: số xi lanh bỏ cho cả hai động cơ; cặp DP158LD / QSZ13 không khôi phục được.
- Cgm, zhengdian, aosif: bỏ giá trị lệch, không đọc lại ô đúng.
- eastern-lion: 22 bản ghi tổng quan bị xoá (đúng ý: dải công suất không là tổ máy), mất luôn mẫu "động cơ ↔ hãng" của những dòng đó.

## Rủi ro và rollback
- Rủi ro chính: luật `engSplit / multiEng` và `cut/lost` có thể dư / thiếu ở NCC chưa có trong 3.375 bảng đã đo. Đã hạ phạm vi sau hai lần quá tay (xoá hàng trăm khối lượng đúng; tách nhầm keypower / mingbang / acepow), nay spec-diff không còn thay đổi ngoài 44 bảng nêu trên.
- Rollback: revert PR #926 (chỉ đổi mã và test, không đổi dữ liệu).

## Chưa kiểm được
- **Đo top 30 ứng viên trên toàn bộ gói: CHƯA chạy** (chờ phiên điều phối cho phép vì máy chỉ chạy được vài lượt một lúc). Khi cho phép sẽ làm như `chat-luong-3-3.md`: bản cũ và mới cùng dữ liệu, giải thích mọi dòng vào / ra.
- Chưa mở lại trang web gốc của yanfa trong phiên này (mẫu 3 dựa trên bảng đã lưu).
- Chưa chạy CI của PR (spec-diff.yml sẽ đăng tóm tắt).
- Diff `unread-tables.json` lớn một phần là bản chụp cũ trôi; không soát từng dòng.

## Cần ghi nhớ
- Đã ghi vào `web/CLAUDE.md` mục "Lệch cột 11": (1) walk cạnh phải trên dòng tiêu đề thấp, và tiêu đề chỉ có đơn vị trên ô động cơ đã thử rồi bỏ vì xoá hàng trăm khối lượng đúng, (2) `onePair` không còn đòi `x !== y`, (3) tách theo "Engine model" cần ≥ 3 mô hình khác nhau, khoá qua `tidyModel/keyOf`, trần 4 dòng mỗi khối, (4) Doosan `P086TI/P126TI/P158LE` là động cơ.
- Fixture `row-flags.test.mjs` không còn dùng dòng thật yingtai n113 (đã đọc đúng); ví dụ "lệch cột" thật còn lại là nhóm B.
- `spec-diff` so với `origin/main` đang trôi: cố định `git:<sha>` khi đo.
