# Nghiệm thu: spend-fix (sổ chi API thiếu dòng config/bidprice)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/597 (nhánh `spend-fix`, 1 commit)

## Nguyên nhân (đo trên log thật)
`costOf` (suppliers/api-budget.mjs, từ #554) tìm `/\{"type":"result".*$/m`. CLI hiện ghi dòng kết quả với `type` ở GIỮA:
`{"duration_api_ms":266291,"stop_reason":"end_turn","session_id":...,"total_cost_usd":1.617,...,"type":"result","subtype":"success",...}`.
Không khớp regex → rơi xuống `JSON.parse(cả stdout)` → lỗi → `null` → `noteApiSpend` không ghi (`Number(null) > 0` sai).
Đo: chạy `costOf` CŨ trên 26/26 log stream-json thật trong `%TEMP%` (genbid-config-*, genbid-bidprice-*, genbid-find*-, genbid-spec-*) → **26 lần null**. Tiền tố `[Ns] ` KHÔNG phải nguyên nhân (regex không neo đầu dòng nên vẫn qua được tiền tố).
Đường trước đây không ghi: TẤT CẢ đường dùng `costOf`: `runClaude` của config-bot (Gợi ý cấu hình, kiểm lại `findcheck`, Tìm NCC, spec NCC) và `runClaude` của bidprice-bot (kể cả tiến trình con do config-bot gọi). Đường `ask` (genbid-sync.js, `--output-format json`, đọc `j.total_cost_usd` trực tiếp) vốn đúng nên có 21 dòng trong sổ.
`append` có nuốt lỗi (`catch {}`) nhưng không phải nguyên nhân ở đây; tệp sổ và env đúng (dòng `ask`/`bidprice` ghi được cùng tệp).

Chưa giải thích được: 2 dòng `bidprice` 05:58Z (0.7579) và 06:01Z (0.91) CÓ trong sổ và khớp log `bidprice-IB2600592684-1/-2`, dù log đó cùng thứ tự khoá. Có thể lượt đó chạy bằng bản mã khác (nhánh/bản tạm); không tái hiện được bằng mã trên main.

## Sửa
`suppliers/api-budget.mjs`: `costOf` tách dòng, bỏ tiền tố trước `{`, parse JSON, chấp nhận dòng có `type==="result"` và `total_cost_usd` số, lấy dòng CUỐI; vẫn đọc được `--output-format json` đơn. Tệp mới `suppliers/api-budget.test.mjs` (dòng result thật rút gọn, không khoá).

## Lệnh kiểm
`node --test suppliers/api-budget.test.mjs` → tests 4, pass 4, fail 0.
`costOf` mới trên 26 log thật: đều ra số (vd. `genbid-config-IB2600586587.log` → 1.6170104, khớp `total_cost_usd` trong log).

## Trước/sau
Trước: 0/26 log ra số (đo). Sau: 26/26 (đo).

## ƯỚC TÍNH các lượt hôm nay 12/11 chưa vào sổ (cộng `total_cost_usd` từ log thật còn trong %TEMP%; Khoa nhập bù, tôi KHÔNG sửa sổ)
Giờ = mtime log (UTC).
| Giờ | Lượt | USD |
|---|---|---|
| 05:54 | config IB2600592684-2 | 1.5210 |
| 05:55 | config IB2600592684-1 | 1.7118 |
| 15:45 | config IB2600604739-1 | 1.0255 |
| 15:45 | config IB2600604739-2 | 1.1800 |
| 15:47 | bidprice IB2600604739-1 | 0.4380 |
| 15:47 | config IB2600586587 | 1.6170 |
| 15:48 | config IB2600602880 | 1.7342 |
| 15:48 | bidprice IB2600604739-2 | 0.4314 |
| 15:49 | bidprice IB2600586587 | 0.3055 |
| 15:49 | config IB2600594596-1 | 2.4637 |
| 15:50 | config IB2600601812 | 2.4551 |
| 15:50 | bidprice IB2600602880 | 0.5323 |
| 15:52 | config IB2600603983 | 2.8335 |
| 15:52 | bidprice IB2600601812 | 0.6576 |
| 15:52 | config IB2600594596-2 | 3.0800 |
| 15:54 | bidprice IB2600603983 | 0.4815 |
| 15:55 | bidprice IB2600594596-1 | 0.8431 |
| 15:56 | bidprice IB2600594596-2 | 0.6130 |
| | **Tổng chưa vào sổ** | **≈ 23.92** |

Đã loại 2 dòng bidprice 05:58/06:01 (0.7579 + 0.91 = 1.67) vì đã có trong sổ. Tổng 20 log hôm nay = 25.59; trừ 1.67 → 23.92.
Là CẬN DƯỚI: log theo khoá bị ghi đè khi chạy lại cùng TBMT, nên các lượt sớm hơn (bot log config 07:42, 10:14, 12:49, 13:34 giờ máy) không còn stream để cộng; lượt config-bot đã chết giữa chừng cũng không có dòng result. Mốc "Khoa nhập tay 29.62 đến 12/11 03:45Z" có thể đã gồm một phần; chưa đối chiếu được.
Sau khi merge và bot nạp mã mới (restart task), các lượt mới sẽ tự vào sổ.

## 3 mẫu đối chiếu
Không áp dụng (không có dữ liệu nhà cung cấp). Đối chiếu số: `genbid-config-IB2600586587.log` dòng 150 `[434s] {"duration_api_ms":266291,...,"total_cost_usd":1.6170104,...,"type":"result"` ↔ bảng trên; tương tự `genbid-bidprice-IB2600592684-1.log` → 0.7579 ↔ sổ 05:58:38Z.

## Rủi ro / quay lui
Rủi ro thấp: chỉ đổi cách đọc chuỗi, không đổi nơi ghi. Quay lui: revert PR. Nếu `viaApi()` sai ở tiến trình con thì vẫn không ghi (không kiểm được không chạy agent thật).
Ngoài phạm vi, ghi nhận: bot (vòng điều phối GenBid-Bot.ps1) và config-bot đang chạy cần restart sau merge mới nạp mã.

## Chưa kiểm được
Chạy agent thật cuối-cuối (cấm); xác nhận `ANTHROPIC_API_KEY`/`GENBID_API_SPEND_FILE` ở tiến trình con trong lượt sau merge — nên xem sổ sau lượt Gợi ý đầu tiên.
