# Đầu phát không ghi hãng, trùng mã với mã đã có hãng (kiểm kê 24/11/2026)

Việc theo Khoa 24/11/2026: "tra mã model nếu giống chính xác với mã đã có hãng thì gộp vào hoặc xóa". Hiểu: mã không hãng TRÙNG CHÍNH XÁC (sau chuẩn hoá khoá `keyOf` của catalog: hoa, bỏ dấu cách / gạch / chấm) với một mã đã có hãng thì nhập vào mục có hãng. Không gộp theo mã gần giống, không đoán hãng từ họ mã.

Gốc: `origin/main` @ 2917500f. Script chạy trên toàn bộ `suppliers/cn/*.json` (436 hồ sơ), dùng chính `web/catalog.js build()`, không lấy mẫu. **Chỉ đọc, không sửa mã, không mở PR** (kết quả: không cần sửa code).

## Kết luận

**Catalog đã chung mục.** Khoá đầu phát chỉ là mã đã chuẩn hoá (`addSupplier`: `maps[kind].get(keyOf(model))`), KHÔNG kèm hãng. Mọi NCC ghi cùng mã (có hãng hay không) rơi vào một mục; hãng của mục là hãng mà các NCC ghi (`keptMakes`), nên một NCC không ghi hãng đã hưởng hãng của NCC khác ghi cùng mã. Vì vậy một mục không hãng có nghĩa là KHÔNG NCC nào (trong cn/) ghi hãng cho mã đó.

Đo trên catalog dựng từ dữ liệu thật:

| | Số |
|---|---|
| Mục đầu phát | 3.045 |
| Có hãng | 624 |
| Không hãng | 2.421 (2.128 khoá chung + 293 khoá riêng theo NCC, mục dưới) |
| Khoá trùng ở hai mục (có hãng + không hãng) | **0** (không có khoá nào bị tách) |
| Mục có `makeConflict` (hai hãng trở lên mâu thuẫn) | **0** |
| Mục có nhiều hơn một hãng sau luật chọn | **0** |

## Bảng kiểm kê theo yêu cầu mục 1

| Nhóm | Số khoá không hãng | Ghi chú |
|---|---|---|
| (i) trùng với đúng MỘT hãng, do NCC khác ghi | **0** | Không thể có: khoá trùng thì đã cùng một mục và mục đó đã nhận hãng. Hiện trạng "hai mục tách" không tồn tại. |
| (i') trùng chính xác với tờ của chính hãng (tờ trong hồ sơ `alternator_maker` của Stamford / Leroy-Somer / Mecc Alte, tiêu đề tờ nêu đúng một mã, so khoá như `titleModelKeys` của config-bot) | **1** | `LVSI804W`, xem "Cần Khoa xem". Mục này hiện không hãng nhưng có tờ Stamford. |
| (ii) trùng với hai hãng trở lên | **0** | Không có `makeConflict`. |
| (iii) không trùng | 2.420 | Không đụng. |

Đối chiếu với kiểm kê cũ `nghiem-thu/dau-phat-chua-co-datasheet.tsv` (1.926 khoá "chưa rõ hãng" nhóm không tờ): 1.814 khoá có trong catalog, **0 có hãng**; 112 khoá còn lại là khoá riêng theo NCC (`NCC|mã`) nên không khớp khoá trần.

## Ba chỗ KHÔNG phải trùng-mã-mà-chưa-gộp (đã kiểm, ghi để khỏi hiểu nhầm)

1. **Khoá riêng theo NCC (293 mục, tất cả không hãng).** Tên dòng nhiều xưởng dùng chung ("STC-10", `LOOSE_TABLES scope "supplier"`), cố ý KHÔNG gộp giữa NCC. Khoá trần của chúng: 0 trùng với mục có hãng; 62 trùng với một mục chung cũng không hãng. Không đụng.
2. **Hãng bị gỡ vì mã thuộc họ khác (`altMakeAsk`, Khoa 23/11/2026).** 19 mục có dòng mang `makeAsk`; 3 trong đó không hãng (`LSA532M12`, `LSA542L14` của baifa/kaihua; `PI734G1` của penlucky): NCC ghi hãng ở cột nhưng mã thuộc họ hãng khác, quyết định đã có là không tin bên nào. Không gộp, không đoán hãng.
3. **Mã gần giống (ví dụ NCC ghi trần `274C` / `224E`, mục kia là `UCI274C` / `UCI224E`).** Khoá khác nhau, theo luật Khoa không gộp; không dựa họ mã để đoán hãng. (Số này không đếm vì không thuộc việc.)

## Cần Khoa xem (1 mục)

| Mã | Mục catalog | Tờ hãng trùng khoá | NCC ghi |
|---|---|---|---|
| `LVSI804W` | không hãng | `stamford-avk-china` n 1068, tiêu đề "Datasheet: LVSI804W - WDG 12 Technical Data Sheet (tờ ghi LV 804 W)" | 1 NCC (`meao-jiangsu`, dòng "MP-2500GF … 20V4000G63L \| LVSI804W …") |

Mục đã chung khoá với tờ (config-bot dùng tờ làm nguồn số liệu của mã này) nhưng `a.make` vẫn rỗng vì hãng của tờ chưa được đọc vào mục (catalog chỉ đọc hãng từ cột / ô / tên trang / hồ sơ NCC có bảng). Chưa sửa vì: (a) một mục duy nhất; (b) hãng chỉ dựa một nguồn là tờ Stamford (tờ ghi cả tên "LV 804 W"); (c) sửa sẽ chạm hãng đầu phát dùng để chấm của Gợi ý cấu hình (`candidates`), theo ràng buộc phải là PR nháp, không tự đo top 30. Nếu Khoa muốn: gắn hãng "Stamford" cho mục này kèm nguồn gốc "hãng theo tờ hãng Stamford (stamford-avk-china n1068), NCC `meao-jiangsu` không ghi hãng", ở mức `via` riêng. Cách tổng quát (mọi tờ hãng) cũng chỉ ra 1 mục, nên không đáng viết luật.

## Cách tái lập

Script đọc `suppliers/cn/*.json`, gọi `GenbidCatalog.build()` rồi: đếm mục theo `make`, tìm khoá trùng, `makeConflict`, mục có `makeAsk`, khoá riêng theo NCC, và so khoá không hãng với tiêu đề tờ của ba hồ sơ `alternator_maker` có hãng (`MAKER_ALT_MAKE` trong config-bot: Leroy-Somer, Stamford, Mecc Alte). Bản script ở phiên con điều phối ngày 24/11/2026; chạy lại được trong vài giây.
