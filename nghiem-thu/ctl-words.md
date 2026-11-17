# Nghiệm thu: CTL_WORDS có ký tự backspace

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/530 — nhánh `fix-ctl-words`, worktree `C:\Projects\GenSet Pro\wt-ctl-words`.

## Tệp đã đổi
- `suppliers/config-bot.mjs`: 6 ký tự U+0008 → `\b` (2 dòng).
- `suppliers/ctl-words.test.mjs` (mới): 6 test.

## Vị trí 6 ký tự (đếm thật bằng node)
Tìm U+0008 trong mọi `suppliers/*.mjs`, `web/*.js`, và toàn repo `.mjs/.js/.json`: chỉ có `config-bot.mjs`, đúng 6, không tệp nào khác.
| Dòng | Cột (0-based) | Ngữ cảnh | Nhánh |
|---|---|---|---|
| 1192 | 94 | `\bVs?(L-?L\|L-?N\|ph-?ph\|ph-?n` | điện áp |
| 1192 | 122 | `ph-?n)\b/i` | điện áp |
| 1192 | 180 | `\bCT` | dòng điện |
| 1192 | 183 | `CT\b` | dòng điện |
| 1196 | 77 | `\bLCD` | LCD / màn hình |
| 1196 | 81 | `LCD\b` | LCD / màn hình |

`CTL_WORDS` chỉ dùng ở `hintFor` trong `check()` (gợi ý dòng datasheet cho check bộ điều khiển "chưa rõ"); nó KHÔNG đổi trạng thái check.

## Đo trước/sau (đo thật)
Cách đo: nạp `check()` + `rankConfigs()` của code cũ (HEAD) và code mới, chạy trên mọi cấu hình của các gói trong `doc-cache/configmatch.json` (12 gói, 9 gói có cấu hình, 42 cấu hình) với `supplier.json` (431 bản ghi; loại status rejected). Script: `C:\Projects\GenSet Pro\genbid-test\ctl-measure.mjs`, kết quả `ctl-measure.json`.
Hạn chế: cache không có văn bản HSMT, nên `hsmtText` dựng từ chính các câu trích (quote) đã lưu trong kết quả; `hint` cũ trong dữ liệu đã lưu bị xoá trước khi chạy lại.

| Check phần controller | Trước | Sau |
|---|---|---|
| met | 33 | 33 |
| unclear (không gợi ý) | 33 | 33 |
| unclear (có gợi ý) | 6 | 6 |
| not_met | 5 | 5 |
| confirm | 0 | 0 |

- Tổng gợi ý (mọi phần): 27 → 27.
- Check đổi trạng thái / đổi "Đạt x/y" / đổi hint: **0**.
- `rankConfigs`: thứ hạng không đổi ở cả 9 gói.
- Độ phủ: 18 check controller có tên chứa điện áp / dòng điện / LCD / màn hình (gói IB2600581977, IB2600586587, IB2600602880: "Đo lường, hiển thị", "Bảo vệ, dừng máy"): 10 đã "met", 8 "unclear" (IB2600581977 #5 và IB2600602880 #1 "Đo lường, hiển thị"; 6 cái "Bảo vệ, dừng máy" của IB2600586587). Không cái nào có hint, cả trước lẫn sau: dữ liệu datasheet bộ điều khiển hiện có không có dòng khớp các nhánh vừa sửa.

## Mẫu đối chiếu với nguồn
Không có check nào đổi trạng thái hay sinh hint mới, nên không có mẫu để đối chiếu tay; không đưa số liệu nguồn nào vào mà không đo. Điều kiện DỪNG (mất "không đạt" / sinh "đạt" mới) không xảy ra.

## Kiểm tra đã chạy
- `node --test ctl-words.test.mjs` trên code cũ: 5 fail, 1 pass; trên code mới: 6/6 pass.
- `node --test` toàn `suppliers/`: tests 235, pass 235, fail 0.
- `node verify.mjs`: 433 bản ghi, 0 có lỗi.
- Test (`ctl-words.test.mjs`): không còn U+0008 trong code `suppliers/` và `web/`; từng nhánh: câu datasheet thật khớp (VL-L, VL-N, Vph-ph, CT ratio, 4-line LCD...), chữ nằm giữa từ khác không khớp (DEVLL, Factory, ACTION, SECTION, SOLCDATA).

## Việc chưa kiểm
- Chưa chạy trên HSMT thật (cache không có văn bản HSMT) và chưa chạy lượt agent thật; dữ liệu đo chỉ 9 gói, nên số 0 thay đổi chưa chứng tỏ sửa này không có tác dụng ở gói khác: các gói mới có check "Đo lường" unclear mà datasheet có dòng `VL-L`/`CT`/`LCD` sẽ bắt đầu có hint.
- Quay lui: revert PR; bot nạp lại code sau restart.
