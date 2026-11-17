# Nghiệm thu: saudi-diesel không phải hãng SDEC (PR 1, nhánh `fix-saudi-diesel`)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/549 (từ origin/main 44e9eb7). Worktree `C:\Projects\GenSet Pro\wt-saudi`.

## Nguyên nhân (khác giả thuyết "khớp chuỗi con")
`names.en` = "Saudi Diesel Equipment Co (SDEC)", `brands` = ["SDEC"]. Regex hãng SDEC trong `web/bidprice.js` là `\bsdec\b|shangchai|上柴` — khớp đúng ranh giới từ, không phải chuỗi con. SDEC là viết tắt của chính công ty Ả Rập Xê Út, trùng với hãng động cơ SDEC (Thượng Hải). Ranh giới từ không phân biệt được hai bên, nên sửa theo quốc gia, không sửa regex (không đụng `web/`).

## Sửa (`suppliers/config-bot.mjs`)
- `supplierFamily(r, withBrands)`: hãng đọc từ tên / brands / id của NCC; nếu hãng thuộc `CN_FAMILY` (Weichai, Yuchai, SDEC, Nianfeng, Bobig, Jet-Power, Wintpower, SmartGen, Harsen, Mebay, Lixise) mà NCC có `country` khác CN thì không tính (trùng viết tắt) → null.
- `gensetMakerOf` (syncCheck + giữ chỗ #543), `brandMakers` (G7/G20 theo thương hiệu) và chỗ đọc datasheet đầu phát (`fam` trong ratings) dùng hàm này. `web/bidprice.js` không đổi.
- Test mới (`suppliers/cand-sync.test.mjs`): saudi-diesel → null; cùng tên đặt ở CN vẫn SDEC; jet-power / weichai-heavy-machinery / rehlko giữ hãng; không được giữ chỗ trong ứng viên.

## Rà toàn bộ supplier (supplier.json, 432 NCC, chỉ đọc; `scratchpad\audit.mjs`, `audit-before.json`, `audit-after.json`)
109 NCC có `familyOf` / `gensetMakerOf` trả về hãng. Trước / sau: **chỉ 1 ca đổi**: `saudi-diesel` (genset_oem, SA): SDEC → không hãng (cả `gensetMakerOf` lẫn familyOf có brands). Lý do: trùng chữ viết tắt.
Giữ nguyên: rehlko (Kohler), fg-wilson (Caterpillar), cummins-inc, caterpillar, mwm, denyo, mhiet, mtu-rolls-royce, honda-power, kubota-japan, yanmar; các hãng CN: jet-power, bobig-power, wintpower, weichai-heavy-machinery, weichai-power, yuchai, yuchai-equipment, sdec (CN), smartgen, nianfeng-fujian. Công ty CN mang tên hãng ngoại (cat-tianjin, perkins-wuxi, các đại lý Cummins…) vẫn null như trước.

## Đo 12 gói / 14 cỡ (không agent; `diag.mjs`, bản chụp supplier md5 b2299bf8…, configmatch md5 d106239e…; trước = origin/main, sau = nhánh)
- Check Đồng bộ thương hiệu: **không check nào đổi trạng thái**: không cấu hình nào trong configmatch.json của 12 gói nhắc `saudi-diesel` (grep 0), và saudi-diesel là NCC duy nhất đổi.
- Ứng viên ở 4 cỡ đồng bộ (#543): IB2600581294 500 kVA đổi: ra saudi-diesel S6A3-PTAR (điểm 73, dòng giữ chỗ), vào longkai-power 6M21G550/5 (257). IB2600581977 250, IB2600594596 300 và 400: y nguyên (md5 catalog.md giống). 10 cỡ không đồng bộ: y nguyên.

## Test
`node --test` (suppliers/): 294 pass, 0 fail (main 293 + 1). `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi.

## Rủi ro + quay lui
- Quy tắc theo quốc gia: NCC thật của một hãng CN đặt ngoài CN (vd. nhà máy Weichai ở nước khác) cũng bị bỏ hãng. Rà 432 NCC: không ca nào; NCC thêm sau này cần để ý.
- Quay lui: revert PR. Sau merge restart bot (GenBid-Bot.ps1 nạp một lần).

## Chưa kiểm
- Chưa chạy agent thật; không biết agent có chọn longkai 6M21G550/5 thay saudi ở IB2600581294.
