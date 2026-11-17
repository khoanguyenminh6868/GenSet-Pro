# Nghiệm thu G1: sửa 4 lỗi bot (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/645 (nhánh `fix/g1-bot`, worktree `wt-fix-g1`). Không tự merge. Mỗi lỗi một commit.

## Tệp đã đổi
| Tệp | Đổi gì |
|---|---|
| `bot/genbid-hsmt/sync-pure.js` | `SERVICE_RE`: `\bthu[êe]\b` → `\bthu[êe](?![a-zà-ỹ])`; `apiBudgetOf`: bỏ qua dòng không phải object |
| `bot/genbid-hsmt/goods-read.js` (MỚI) | đoạn đọc bảng hàng (USED/IGNORED, note/audit, `goodsOf`, `num`) cắt NGUYÊN VĂN từ `history-extract.js` |
| `bot/genbid-hsmt/history-extract.js` | thay đoạn trên bằng dòng `//@include goods-read.js` (hành vi không đổi: 15 ca history vẫn đạt) |
| `bot/genbid-hsmt/bidders-extract.js` | cũng `//@include goods-read.js`; hàng chào = `goodsOf(lot,[mã nhà thầu trúng])` (≤ 4 dòng), bỏ bộ đọc riêng |
| `bot/genbid-hsmt/genbid-sync.js` | `snippet()` dán tệp ở dòng `//@include <tệp>` (2 dòng) |
| `bot/genbid-hsmt/ocr-pdf.js` | `ODD`: dấu kết hợp chỉ còn 0300 0301 0302 0303 0306 0309 031B 0323 (bỏ cả dải 0300–036F) |
| `bot/test/snippet.mjs`, `extract/ocr-pure/sync-rules.test.mjs` | nạp `//@include` như bot; bỏ `todo` 4 ca |
| `CLAUDE.md` (gốc) | bẫy `//@include goods-read.js` |

## Điều phối cần chép sang `C:\Projects\GenSet Pro\genbid-hsmt\` (cùng lúc, sau merge)
`sync-pure.js`, `genbid-sync.js`, `goods-read.js` (MỚI), `history-extract.js`, `bidders-extract.js`, `ocr-pdf.js`. Thiếu `goods-read.js` thì hai tệp extract lỗi "goodsOf is not defined" (history chạy lịch sử, bidders chạy Sync). Không cần restart task (mỗi lượt tiến trình mới). Backup chép tệp phẳng nên nhận `goods-read.js`. Kiểm: `powershell -File bot\Backup-GenBidBot.ps1 -Check`.

## Lệnh đã chạy
- `node --check` mọi `.js` của kit: ok.
- `node --test bot/test/*.test.mjs`: 95 ca, 92 đạt, 0 lỗi, 3 todo (còn lại là của G2/G3: specsPick ×2, MPĐ). Trước: 88 đạt, 7 todo.
- `node --test suppliers/*.test.mjs`: 776 đạt, 0 lỗi.
- CI PR #645: xem trạng thái trên PR (chạy sau khi đẩy).

## Số đo (ĐO, không ước tính)
### 1. SERVICE_RE (`scratchpad\m1.js`, `bidhist.json` 1.556 tên + `analysis.json` 1.286 kết quả)
- `isServiceTender` trên tên bidhist: **88 / 1.556 đổi** false→true (khớp số đo T5: 88/111 gói có "thuê"). Không có gói đổi theo chiều ngược lại.
- `autoConfigSkip` trên analysis: **47 đổi**, đều "" → "service" (45) hoặc giữ "power" (2 dòng khác nhau chỉ ở `isServiceTender`, kết quả vẫn "power").
- Rà `\b` còn lại: `BUY_SET_RE` (`\bmua`), `GENSET_RE` (`\bgenset\b`, `k[vV]?[aA]\b`) chỉ cạnh chữ ASCII: không lỗi. `\bmp[đd]\b` là lỗi MPĐ, KHÔNG sửa theo lệnh (todo giữ nguyên).
- Xem tay cả 88 tên: đều có "thuê" là động từ thuê (thuê máy phát điện, cho thuê, thuê tổ hợp, thuê thiết bị…). Không có "thuế". Không có gói mở đầu "Mua sắm / Cung cấp và lắp đặt … máy phát" bị chặn. Nhóm đáng chú ý (đều hợp lý là không tự chạy):
  - 40 gói "Thi công xây lắp, mua bảo hiểm … và thuê máy phát điện phục vụ thi công" (Điện lực Gò Vấp, Gia Định…) và 8 gói "Cung cấp VTTB, thử nghiệm VTTB, thuê máy phát điện, … xây lắp" (đã dính vật tư nên vốn đã gần dịch vụ).
  - Gói sự kiện / hạ tầng có thuê máy phát: IB2300056387, IB2300234356, IB2400064046, IB2400407585, IB2600041358, IB2600041367, IB2400126152, IB2300168256.
  - Thuê tổ hợp máy phát Diesel Khe Chàm (TKV): IB2300030459, IB2300042764, IB2300141947, IB2400248480, IB2500027056, IB2600060676.
  - Thuê dịch vụ / chuyên gia, không phải mua máy: IB2300063223, IB2300132315 (đào tạo thiết kế), IB2400184998 (phân tích phóng điện), IB2500312856 (nhân lực chế tạo Shelter), IB2600011106 (thuê vị trí đặt máy chủ), IB2600554211 (chuyên gia rung động).
  - **Cần Khoa liếc 1 ca**: IB2500020231 "Gói thầu TB1: Cung cấp và lắp đặt thiết bị công trình: Nhà văn phòng làm việc và căn hộ **cho thuê** (… máy phát điện dự phòng, PCCC, thang máy …)". "Cho thuê" ở đây chỉ là loại công trình; gói là cung cấp thiết bị toà nhà có máy phát, nên có thể đúng ra là gói mua. Bị đổi thành dịch vụ (đã có trong 47 ca autoConfigSkip). Chấp nhận (gói thiết bị toà nhà cỡ lớn, máy phát chỉ là một mục), nhưng ghi để quyết.
- Danh sách đủ 88 tên + 47 dòng analysis: `scratchpad\m1.out` (cùng thư mục scratch của phiên).

### 2. bidders-extract (hàng chào mẫu BD.CG.02.0192)
- Trước: `note` nhà thầu trúng IB2400268027 phần 1 không có "Hàng chào" (todo). Sau: `Hàng chào: Excel Power EPS-FA12KVA (China)` (ca test mẫu dựng từ bidhist `docs.IB2400268027`, bot đọc trang thật 09/11), cả hai phần, phần 2 (danh sách rỗng) dùng danh sách chung như history. Mẫu cũ formValue vẫn đạt.
- Chung cách đọc: một tệp `goods-read.js` cho cả hai (không chép lệch). Không đo được trên bidders thật vì doc-cache không có bidders.
- Khác biệt hành vi nhỏ so với bộ đọc cũ của bidders: goodsList dạng object chỉ lấy `dsHhKq` + danh sách lạ (bỏ listTG… là dịch vụ) như history; nhà thầu trúng không có mục trong dsHhKq thì lấy mọi mục của phần (như history).

### 3. apiBudgetOf
- Trước: dòng `null` ném lỗi trong vòng, `try` ngoài nuốt, mọi dòng sau bị bỏ. Sau: dòng không phải object bị bỏ qua, đọc tiếp (ca test: 1 + null + 2 → 3 USD, trước 1).
- Đối chiếu cách đọc khác (chỉ ghi nhận, KHÔNG sửa `.ps1`):
  - `GenBid-Bot.ps1` `Get-ApiBudget`: đọc từng dòng, `try … ConvertFrom-Json … [datetime]::Parse([string]$e.t)` + `continue`: dòng `null` → `$e.t` rỗng → Parse lỗi → bỏ qua, đọc tiếp. Đã khớp hành vi mới. Lệch còn lại: (a) `ReadAllLines` nằm NGOÀI try: nếu bot Node đang ghi sổ (khoá chia sẻ) có thể ném lỗi cả hàm, trong khi bản JS đọc chuỗi đã có; (b) ngày làm mới: ps1 `ngày 1 + (resetDay-1)` ngày, JS `new Date(y,m,resetDay)` — giống với resetDay ≤ 28, khác khi > 28 (tràn tháng); (c) ps1 `if ($e.usd)` với usd chuỗi "0"/âm: không đáng kể.
  - `suppliers/api-budget.mjs`: chỉ GHI sổ (`append`, usd > 0 hoặc exhausted), không đọc: không có lệch.

### 4. garbled() (`scratchpad\m4.js`, `genbid-work\specs\*\text.txt`, 1.499 tệp)
Chữ trong text.txt đã trích sẵn, không có ranh giới trang: đo theo tệp và theo khối 3.000 ký tự (xấp xỉ một trang).
- Tệp coi là hỏng: **36 → 36** (không đổi). Khối: **338 → 352** (+14 khối, 10 gói: IB2200105676, IB2300188511, IB2400139788, IB2400202566, IB2500057816, IB2500320544, IB2500351876, IB2600020985, IB2600092758, IB2600137973).
- Xem tay các khối mới bị bắt: đều chữ TCVN3 / VNI / rác nhị phân thật ("B¶n ®ång tiÕp ®Þa D©y ®ång", "Ñoái vôùi keïp ngöøng", "&1*7<&3+r1", "hµnh lang an toµn") — không có tiếng Việt đúng bị báo nhầm. Ký tự lạ đứng đầu: dấu ̈ (diaeresis từ ü, ï, ÿ), ̊, ̧, ¸ ¹ ¶ Þ.
- Tiếng Nga (Vietsovpetro) vẫn đọc được: ca test "Технические требования…" đạt; tiếng Việt NFC + NFD đạt. Ví dụ chú thích "3456ÿ89ÿ ÿ": hỏng (ca todo nay đạt).
- Rủi ro: tiếng Việt chen tên riêng ngoại (Müller, Çelik) nhiều hơn 5% của một trang: vẫn không đáng kể (ngưỡng 5% như cũ, số đo không thấy ca nào).

## Mẫu đối chiếu nguồn
1. IB2400268027 phần 1: nhà thầu trúng Việt Nhật hàng `EPS-FA12KVA / Excel Power / China` = `genbid-work\doc-cache\bidhist.json` docs.IB2400268027.
2. IB2200033737 "Thuê máy phát điện phục vụ cho các kỳ thi và dự phòng phục vụ lễ hội" = tên trong bidhist, nay là dịch vụ.
3. Ví dụ phông vỡ "3456ÿ89ÿ ÿ" = chú thích gốc trong `ocr-pdf.js` (IB2500127205); mẫu thật khác: IB2500057816 "&1*7<&3+r1".

## Rủi ro còn lại, quay lui
- Chép thiếu `goods-read.js` → hai tệp extract chết (lịch sử và Nhà thầu tham dự). Quay lui: chép lại 6 tệp từ commit `6755d01e` (`git show 6755d01e:bot/genbid-hsmt/<tệp>`), xoá `goods-read.js`.
- 88 gói thuê nay không tự Gợi ý cấu hình (đúng ý Khoa 12/11); gói thuê muốn chạy tay vẫn chạy bằng nút.
- 47 dòng autoConfigSkip đổi; IB2500020231 (xem trên).

## Chưa kiểm được
- Chạy thật bidders-extract trên trang muasamcong (cần trình duyệt, web thật): chỉ đã chạy bằng dữ liệu dựng theo trang đã lưu.
- `garbled` trên trang PDF gốc (không có PDF trong doc-cache; đo xấp xỉ bằng khối chữ).

## Cần ghi nhớ
- Khoa quyết: IB2500020231 (cho thuê = loại công trình) — chấp nhận hay thêm ngoại lệ.
- Todo còn lại ngoài G1: MPĐ (GENSET_RE, cấm sửa nhánh này), specsPick ×2 (G2).
