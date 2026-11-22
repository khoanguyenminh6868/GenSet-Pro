# `check` chạy lại trên kết quả của chính nó (điều tra, 22/11/2026)

Chỉ điều tra: không sửa mã, không commit, không PR. Code: `origin/main` 65dd6cec (worktree `wt-check-2-lan`). Dữ liệu: bản chụp 17 lượt `dau-vao\dau-phat-hang-b\snap` (20/11).

## Kết luận

- **Không lũy đẳng ở 15/17 lượt, không phải 7; đó là MỌI lượt có cấu hình** (2 lượt còn lại có 0 cấu hình). Con số 7 thiếu 5 lượt chỉ khác ở `notes[]` và 3 lượt nhiều cỡ máy (`check-all` chỉ chạy phần trên cùng của kết quả, phần đó có 0 cấu hình).
- **Phần Khoa dùng để chọn không đổi:** ở mọi lượt và mọi cỡ, lần hai có 0 đổi status, 0 đổi điểm, 0 đổi số cấu hình. Ở 14 lượt không chia cỡ còn đo thêm: 0 đổi rank, 0 đổi thứ tự cấu hình, 0 đổi số check.
- **Cái đổi là chữ và thứ tự dòng:** ghi chú tự dài ra, ghi chú số "điểm chưa khớp" chồng thêm, một số check đổi chỗ.
- **Cùng đầu vào cho cùng kết quả:** `check(x)` chạy hai lần giống hệt ở 17/17 lượt và mọi cỡ. Vậy `checkDir` đọc lại cùng `result.json` (lệnh `check`, `post`) không tự đổi; lỗi chỉ xảy ra khi đầu ra của `check` được đưa lại vào `check`.

## Lượt nào khác, khác gì

| Nhóm | Lượt |
|---|---|
| A. Câu "cần xác nhận đời (MK)" nhân đôi | 581977, 592684 (2 cỡ), 601812, 602880, 603983, 604739 (2 cỡ), 609805, 612866, 613475 |
| B. `notes[]` "Kiểm tra bằng code" chồng thêm hoặc đảo | 574589, 581294, 581977, 586587, 592658, 594596 (2 cỡ), 595853, 612866 (đảo thứ tự) |
| C. Check đổi chỗ | 603983 (5 cấu hình), 594596 cỡ 400 kVA (1 cấu hình, chưa soi nguyên nhân) |
| Không khác, vì có 0 cấu hình | 599817, 607539 |

## Nguyên nhân (`suppliers/config-bot.mjs`)

**A. `check`, dòng 3386.** Mỗi lần chạy nối thêm câu "Nguồn là datasheet …" vào `x.note`, không xem đã có chưa (ngay dưới, `gap` ở dòng 3387–3388 thì có kiểm). Ở 14 lượt không chia cỡ: 254 ghi chú dài thêm MỖI lần chạy (204 `parts[].note`, 38 `note`, 12 `codeWas.note`), không dừng. Ba lượt nhiều cỡ thêm 29 check. **Đã có trên web:** IB2600601812 có 62 ghi chú lặp câu này ở 4 cấu hình.

**B. `check`, dòng 3598 + 3458, 3418.**
- Dòng 3598 luôn nối `Kiểm tra bằng code: N điểm…`, không gỡ dòng cũ, nên `notes[]` dài thêm 1 mỗi lần.
- N còn tụt ở lần hai (8→2, 7→4, 10→3, 10→4, 5→0; lượt nhiều cỡ 15→5, 111→11). Ở 14 lượt không chia cỡ, 31 problem biến mất gồm: 11 của cấu hình đã bị bỏ ở lần một, 4 chỉ đánh số lại, 16 "câu trích nguồn, nguồn". 16 cái này do lần một hạ `met` → `unclear` (dòng 3461), còn lần hai chỉ soát nguồn cho `met` / `not_met` (dòng 3418, 3458) nên không báo nữa dù nguồn vẫn sai.
- IB2600612866: dòng 3271 gỡ rồi nối lại ghi chú E-TVCS nên đảo thứ tự với dòng "Kiểm tra bằng code".

**C. Chọn đầu phát theo datasheet hãng, dòng 4503.** `fill` xoá mọi check `part: alternator` rồi các check đó được ghi lại ở cuối, nên ở IB2600603983 "Khả năng quá tải" (genset) từ cuối danh sách nhảy lên trước khối đầu phát. Đổi một lần rồi ổn định (lần 2→3 không đổi chỗ). Nguyên nhân suy từ đọc code và mẫu đổi chỗ, chưa thử bằng cách sửa.

## Đường nào trong bot thật sự chạy lại trên đầu ra

- `keepFound` (dòng 6346, cả `restoreWeb`): kiểm lại cấu hình giữ từ lượt trước, kèm check và ghi chú cũ → dính A, có thể dính C. Không dính B vì `sub` không mang `notes`.
- `checkDir` đọc `result.json` của agent và ghi ra `result.checked.json`, nên tự nó không lặp. Prompt không bảo agent chép tệp này đè `result.json`.
- **Chưa rõ:** 4 cấu hình lặp MK của IB2600601812 KHÔNG có cờ `keptFind` / `keptWeb`, nên còn một đường khác chưa tìm ra (có thể agent chép từ `result.checked.json`).

## Đề xuất sửa (chưa làm)

| # | Sửa | Đổi kết quả lần một? |
|---|---|---|
| A | Dòng 3386: gỡ mọi câu MK cũ trong `x.note` rồi ghi một câu. | Không với kết quả mới. Kết quả đã lưu bị lặp sẽ sạch khi được check lại. |
| B1 | Dòng 3598: gỡ dòng `Kiểm tra bằng code:` cũ trước khi ghi. | Không. |
| B2 | Check đã `unverified` vẫn được đếm khi chạy lại, để N không tụt. | **Cần điều phối duyệt:** không đổi lần một của agent, nhưng đổi số `problems` agent và web thấy khi check lại. Cần chốt `unverified` do agent ghi thì xử lý sao (`stripAgentCodeFlags` hiện không gỡ cờ này). |
| B3 | Dòng 3271: giữ nguyên vị trí ghi chú E-TVCS. | Không (B1 đã gỡ phần lớn trường hợp). |
| C | Cuối `check`, xếp check theo thứ tự `requirements`. | **Cần điều phối duyệt:** đổi THỨ TỰ dòng check hiển thị ở lần một. Phải đo lại status / điểm / rank trên 17 lượt. Cách khác: giữ vị trí cũ khi ghi lại check đầu phát, ít đổi hơn nhưng phải sửa nhiều chỗ. |

**Phép thử CI đề xuất** (tệp mới, ví dụ `suppliers/check-idempotent.test.mjs`): với mọi `config*.input.json.gz` trong `fixtures/runs/`, chạy `check` + `rankConfigs` hai lần trên đầu ra, so `f(f(x)) = f(x)` KHÔNG phụ thuộc thứ tự khoá, chạy trên TỪNG `sizes[]`. Thêm một ca nhỏ tự dựng cho A. Fixture chỉ có 5 gói (586587, 592684, 594596, 601812, 603983), theo mã gói thì có đủ ba nhóm, nhưng **chưa chạy thử** trên fixture. Bản 17 lượt không có trong repo nên vẫn đo tay.

## Đã kiểm

- 17/17 lượt: `check` + `rankConfigs` 4 lần liên tiếp, so mọi trường; thêm phép `f(x) = f(x)`; so check theo khoá `part|item` để tách đổi chỗ khỏi đổi nội dung.
- 6/6 cỡ của 3 lượt nhiều cỡ: `f(x) = f(x)`, `f(f(x))`, status, điểm, số cấu hình, đổi chỗ.
- Phân loại toàn bộ 31 problem mất ở 14 lượt không chia cỡ.

## Chưa kiểm

- Chạy qua `checkDir` / `post` / `keepFound` thật: đo gọi thẳng `check` với `readWeb: () => null`, nên cấu hình nguồn internet đọc như không có trang lưu.
- Lượt nhiều cỡ: `cap` lấy từ `sizes[].cap` / `kva`, không từ `meta.json`; chưa so rank và chưa liệt kê từng problem mất.
- Đường tạo ra 62 ghi chú lặp trên web của IB2600601812; nguyên nhân đổi chỗ ở 594596 cỡ 400 kVA.
- Kết quả web mới hơn bản chụp 20/11.
- Script đo nằm ở scratchpad phiên (`idem.mjs`, `idem3.mjs`, `idem4.mjs`), có thể bị dọn; chưa chép vào sổ.
