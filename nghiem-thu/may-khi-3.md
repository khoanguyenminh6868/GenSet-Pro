**Kết luận: PR 2 (config-bot) xong, DRAFT, xếp chồng trên #958 (base = nhánh `khi-fuel-1`): nhánh `khi-fuel-2`. `hintsOf().fuel` (HSMT không nêu → diesel), `candidates` loại dòng có `u.fuel` trái bằng `ruled: "fuel"`, `check` thêm check "Nhiên liệu (HSMT)" không đạt. Tám gói đổi ở lượt đo #958: cả 8 đều ra "diesel" (4 nêu: "chạy dầu", "Diesel", "Dầu Diesel"; 4 không nêu → mặc định), nên 14 khoá agg-fuzhou COP bị loại ở cả tám. Đo cloud cả chồng do điều phối (SHA ở tin nhắn).**

Phạm vi: `suppliers/config-bot.mjs`, `suppliers/fuel-hsmt.test.mjs`, `suppliers/CLAUDE.md`. Không đụng `catalog.js`, `genbid-hsmt\`, web thật.

## 1. Luật (Khoa 20/11/2026)
- `fuelOfHsmt(technicalPart(text))` → `{fuel, stated, why}`; `hintsOf().fuel`. Một loại nêu → loại đó (`gas` / `gasoline` / `diesel`); không nêu → `diesel`, `stated: false`; hai loại trở lên (gói bảo dưỡng xăng + diesel; "Nhiên liệu: Dầu Diesel hoặc xăng") → `null`, không luật (không loại ai).
- Chỉ chữ NÊU nhiên liệu của tổ máy: "Nhiên liệu: …", "chạy xăng", "máy / động cơ xăng", "khí thiên nhiên", "biogas", LPG / CNG / LNG, "động cơ chạy khí / gas"; KHÔNG tính "hút khí tự nhiên" (động cơ không tăng áp), "khóa liên động cơ khí" (đã bắt nhầm ở lượt đầu: 4 gói), "xăng dầu" (cửa hàng), khí thải / khí nén; "dầu DO" / "diesel" chỉ để thấy hỗn hợp.
- `candidates`: `fuelOff(hints.fuel, u.fuel)` → điểm -600, `ruled: "fuel"` (vào `dropped` trừ khi HSMT nêu đích danh model, như `layout` / `freq`). diesel → loại mọi dòng có `fuel`; khí → loại xăng; xăng → loại khí; `dual` hợp khí và xăng; dòng KHÔNG có `fuel` luôn ở lại (rỗng ≠ diesel nên "HSMT khí → loại diesel" không làm được ở catalog; muốn ưu tiên máy khí cho gói khí cần nhiên liệu diesel được ghi, hiện không có).
- `check`: check `Nhiên liệu (HSMT)` `not_met`, `byCode`, `fuelRule`, ở đầu `c.checks`, khi dòng catalog trong `c.suppliers` (khoá `supplierId|n|keyOf(line)`) ghi nhiên liệu trái HSMT; gỡ rồi ghi lại mỗi lượt (không nhân đôi). Cấu hình internet / dòng không ghi fuel không có check. Cấu hình vẫn hiện, xếp sau (như check bộ điều khiển đích danh).

## 2. Đo HSMT (bidhist cục bộ 18/11, `genbid-work\doc-cache\bidhist.json`, không commit; 1.259 gói có chữ Chương V)
| kết quả | gói |
|---|---|
| diesel, HSMT nêu | 761 |
| diesel, mặc định (không nêu) | 438 |
| xăng | 32 |
| hỗn hợp (không luật) | 28 |
| khí | 0 |
Soát từng gói không phải diesel (xăng 32 + hỗn hợp 28): xăng = gói mua máy xăng / máy xăng nhỏ (5–13 kVA, trạm BTS, CHXD) đúng; hỗn hợp = gói bảo dưỡng "máy xăng và diesel", "Dầu Diesel hoặc xăng". Ba ca bắt nhầm đã sửa: "hút khí tự nhiên" (nhiều gói diesel) và "khóa liên động cơ khí" vào nhóm khí; "nhiên liệu … tránh dư xăng" vào xăng. Lịch sử không có gói khí nào: phần "HSMT khí giữ dòng khí" chỉ kiểm bằng test tổng hợp.
Tám lượt đổi của đo #958 (IB2200021335, IB2200100465, IB2300146335, IB2300204696, IB2300277166, IB2300290906, IB2300346506, IB2400116021): chữ HSMT không nêu khí (không gặp khí thiên nhiên / biogas / LPG / "động cơ khí"); kết quả `fuelOfHsmt`: 4 diesel nêu (IB2300146335 "chạy dầu", IB2300204696 "Diesel", IB2300277166 "Dầu Diesel", IB2400116021 "Diesel"), 4 diesel mặc định (IB2200021335, IB2200100465, IB2300290906, IB2300346506) ⇒ cả tám loại dòng khí / xăng.

## 3. Kiểm
`node --test suppliers/*.test.mjs web/test/*.test.mjs`: xem mục 4. `suppliers/fuel-hsmt.test.mjs` (7 ca): `fuelOfHsmt` (diesel nêu / mặc định, khí, xăng, các chữ KHÔNG phải nhiên liệu, hỗn hợp = null); `fuelOff`; `hintsOf.fuel`; `candidates` (HSMT diesel và HSMT không nêu loại dòng agg-fuzhou n115 thật + dòng giả ghi "Natural Gas" kèm `ruled: ["fuel"]`, dòng diesel ở lại; HSMT khí giữ, xăng loại khí, hỗn hợp không loại; tổ máy HSMT nêu đích danh ở lại); `check` (không đạt, chạy lại không nhân đôi, HSMT khí không có check).
Đo top 30 KHÔNG làm trên máy (điều phối đo cloud cả chồng). Kỳ vọng: 14 khoá agg-fuzhou COP vào ở #958 bị loại; mọi dòng khí / xăng ở gói diesel bị loại (221 lần lọt top đã đếm ở `may-khi-1`, kể cả victory xăng 81 lần); không dòng diesel nào đổi (dòng không ghi `fuel` không bị đụng); gói xăng (32) nay loại dòng khí; gói hỗn hợp (28) không đổi.

## 4. Rủi ro, quay lui
- Phát hiện nhiên liệu dựa vào chữ: gói khí viết "máy phát điện chạy bằng gas" / "động cơ gas" nhận; cách viết khác (vd. "nhiên liệu CH4") thì coi diesel mặc định → loại dòng khí: đây chính là luật Khoa chọn ("không nêu = diesel"), phía thiệt là bỏ nhầm máy khí cho gói khí viết lạ.
- Gói xăng: loại dòng khí nhưng không loại dòng diesel (không ghi fuel). Đúng như trước đây với diesel.
- Quay lui: revert PR 2; `hints.fuel` thiếu thì `candidates` / `check` tự bỏ qua (`fuelOff(undefined …)` = false), kết quả cũ lưu không bị đổi.
- Chưa kiểm: HSMT khí thật (lịch sử chưa có); tác động của check mới lên màn hình web (chưa dựng).

## Cần ghi nhớ
- Quyết định Khoa 20/11 đã áp (mặc định diesel, mức T có dùng). Weichai-power n125–128 (10 bản ghi, `fuel` rỗng ở PR 1): căn cứ phân tay ở `dau-vao\may-khi\2-phan-loai.mjs` dòng 61 (`[all("weichai-power"), "khi", "M", "tiêu đề 'Standard Land-based Generator Set', model tổ máy 'PG…*7NG', động cơ '…N0/5' (cùng bảng với weichai-heavy-machinery có URL gas-generator-set)"]`) và 4 dòng của `phan-loai-bang.tsv` (`weichai-power 125–128`, lớp khí, mức M).
