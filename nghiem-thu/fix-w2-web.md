# Nghiệm thu W2 — sửa 4 lỗi `web/index.html` (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/691 (nhánh `fix-w2-web`, chưa merge). Worktree `wt-fix-w2-web`.

## Tệp đã đổi
- `web/index.html`: `navKey`, `navTap`, `navSync`, popstate (Back); CSS `.chip` trên màn ≤ 640 px; `isGenset`.
- `web/test/back-link.spec.mjs` (mới, 14 ca), `smoke.spec.mjs` (+1 ca), `mobile.spec.mjs` (bỏ 2 `fixme`, ca tab Cấu hình
  gợi ý được kiểm lại trong vòng "mọi tab"), `misc.spec.mjs` (bỏ 1 `fixme`, +1 ca luật tên gói), `README.md`.
- `web/CLAUDE.md`: bẫy `navKey` / `navDirect`, luật tên gói chung.

Commit (sau rebase lên origin/main): e21e4d3a (lỗi 1), 20b348c9 (lỗi 2), caa1dc34 (lỗi 3), 64ecf706 (lỗi 4), 7c385587 (docs).

## Nguyên nhân từng lỗi
1. **Back bỏ qua màn Nhà thầu mở từ bảng nhà thầu của gói.** Đo bằng navStack: gói đầu tiên trong màn nhà thầu chính là gói
   đang mở bên dưới (IB2600586587 → nhà thầu 1801292268 → gói IB2600586587). `navSync` coi bước mới có cùng `navKey` với bước
   ngay trước là "Back bằng nút của trang" → `navAt--` + `history.back()`, nên bước Nhà thầu bị xoá; Back tiếp theo về thẳng
   danh sách. Mở Nhà thầu bằng nút đầu trang thì bước trước là màn nhà thầu (khoá khác) nên đúng. Sửa: `navKey` tính cả độ dài
   `drawerBack` (bước mở từ màn nhà thầu có 1 mục quay lại, bước gói đầu có 0). Back bằng nút ← của khung chi tiết vẫn bỏ
   một mục `drawerBack` nên vẫn khớp bước trước như cũ.
2. **Màn mở thẳng bằng link không thành bước Back.** `navTap()` lần chạm đầu `replaceState` mục 0 + `pushState` mục 1 = trang
   chủ (`NAV_HOME`), rồi `navSync` đẩy bước mới thành mục 2. Back → mục 1 = trang chủ → đóng màn của link. Sửa (`navDirect`):
   lần chạm đầu mà màn hình không phải trang chủ thì mục 1 là màn đang mở (link), mục 0 đổi địa chỉ thành trang chủ. Back tới
   mục 0 khi `navDirect`: hiện trang chủ, `history.forward()` về mục 1 và đổi địa chỉ mục 1 thành trang chủ (`navFixUrl`), nên
   Back vẫn không rời trang và tải lại không mở lại link. Đóng màn của link bằng nút của trang (Đóng, Escape) thì trang chủ
   thay chỗ mục 1 (không thêm bước).
   **Link thẳng nào cùng lỗi** (chạy `back-link.spec.mjs` trên index.html cũ): CẢ NĂM — `#goi/<TBMT>`, `#cdt/<tên>`,
   `#nha-thau`, `#nha-cung-cap`, `#dong-co` — đỏ ở Back đầu tiên, máy tính lẫn điện thoại (10/10 ca link đỏ; 4 ca "Đóng"/
   "đổi tab" kiểu khác: 2 ca Đóng xanh cả trước, 2 ca đổi tab đỏ trước). `#dau-phat`, `#bo-dieu-khien` cùng đường code với
   `#dong-co` (không viết ca riêng).
3. **Nhãn dài thò ra mép phải (390 px).** `.chip` có `white-space:nowrap`; nhãn "dòng bảng không ghi đầu phát NIANFENG
   NF274H" (danh sách nhà cung cấp đề xuất trong tab Cấu hình gợi ý) dài hơn màn khi phông rộng (CI ubuntu). Sửa: màn ≤ 640 px,
   `.chip` trong `#dbody` / `#mdl` được xuống dòng, `overflow-wrap:anywhere`, `max-width:100%`, góc 10 px. Máy tính không đổi
   (chỉ trong `@media (max-width:640px)`). Tái hiện cục bộ trên Edge bằng `letter-spacing:1.5px`: trước sửa 2 nhãn thò ra,
   sau sửa 0. Ca test có thêm lượt giãn chữ này nên Edge cục bộ cũng bắt được.
4. **`isGenset` riêng.** Nay `window.GenbidBidprice.isGensetName(t.bidName)` (gọi qua `window` vì `const { isGensetName }`
   khai báo ở dòng ~4470, sau `analysisState`).

## Mục 4 — số đo (đo, không ước tính)
- Nguồn: `genbid-work\doc-cache` chỉ có `bidhist.json` mang tên gói (không có feed / seen / tracked; `analysis.json` không
  có `bidName`). Script: scratchpad `count-genset.mjs` (luật cũ `includes("máy phát điện")` so với `isGensetName` của
  `web/bidprice.js` nhánh này).
- 1556 tên gói: 1504 cả hai nhận, 0 cả hai loại, **52 đổi kết quả: 8 nhận thêm, 44 loại ra** (danh sách đầy đủ ở cuối).
- **Hành vi thật của `isGenset` trong index.html:** chỉ dùng ở `analysisState`, cho gói tab Mới, chưa đóng thầu, chưa có tệp
  HSMT: nhận → trạng thái `nodocs` (biểu tượng "Chưa phân tích, chưa có HSMT" trên danh sách, chữ "Gói này chưa có hồ sơ mời
  thầu." ở tab Phân tích); không nhận → `skip` (không biểu tượng, nút "Phân tích ngay"). Hàm KHÔNG lọc danh sách: không gói
  nào biến mất. Gói đang theo dõi (Chuẩn bị HSDT, Đã nộp…) không đi qua nhánh này (chỉ tab Mới). Bộ lọc "Chưa phân tích"
  coi `nodocs` và `skip` như nhau (`!== "done"`) nên kết quả lọc không đổi. Ca test mới: gói đang theo dõi "Sửa chữa máy
  phát điện tổ máy H1 nhà máy thủy điện (BỊA)" (luật mới loại) vẫn ở tab Chuẩn bị HSDT; "máy phát điện gió" vẫn ở tab Mới,
  không biểu tượng; "MPĐ dự phòng 300 kVA" có biểu tượng (luật cũ không có → ca đỏ trên code cũ).
- Lưu ý cho Khoa: luật chung (H3) loại cả "08PTV-UB-SXKD-2024: Sửa chữa máy phát điện Diezel số 2 Tổ máy 300MW"
  (IB2400069058) vì là gói của nhà máy điện có "Tổ máy 300MW"; đây là luật H3, không đổi ở W2.

## Lệnh kiểm + đầu ra thật
- `node --test web/test/static.test.mjs` → `# pass 10 # fail 0`.
- Playwright cục bộ `PW_PORT=4393 PW_CHANNEL=msedge npx playwright test` (trước rebase lên #690) → `75 passed (1.8m)`,
  `1 skipped` (ca fixme của W1 trong `requests.spec.mjs`, nay #690 đã gỡ trên main).
- Mỗi ca mới / bỏ fixme đã chạy trên index.html cũ và thấy đỏ đúng chỗ (lỗi 1: `#ov` hidden sau Back; lỗi 2: 10 ca link đỏ ở
  Back đầu; lỗi 3: lượt "chữ giãn" đỏ; lỗi 4: dấu của gói MPĐ thiếu).
- Số ca: trước 56 xanh + 4 fixme → sau 76 xanh, 0 fixme (56 + 3 bỏ fixme của W2 + ca W1 bỏ fixme ở #690 + 1 smoke
  + 14 back-link + 1 luật tên gói).

## CI
- Job `web` (ubuntu + chromium), run 43368651595, 2 lượt liền: `76 passed (37.2s)`, chạy lại `76 passed (37.5s)`; 0 skipped
  (ca fixme của W1 đã gỡ ở #690, nhánh đã rebase). Job `CI` (server, suppliers) run 43368651501: success.

## 3 mẫu đối chiếu
- Lỗi 1: navStack đo được trước sửa — sau bấm gói của nhà thầu: `at:2`, stack `[…, [IB2600586587, back 1], [IB2600586587, bd
  1801292268]]` (bước nhà thầu bị lùi). Sau sửa: ca `smoke.spec.mjs` "Back: gói → nhà thầu (từ bảng…)" xanh.
- Lỗi 2: `back-link.spec.mjs` "mở thẳng #nha-cung-cap → một NCC" trên code cũ: đỏ ở `L.at` sau Back đầu (`#supBody` không còn).
- Lỗi 4: IB2300165131 "Cung cấp, lắp đặt máy phát Diezel dự phòng 100kVA…" — luật cũ không nhận (không có "máy phát điện"),
  luật mới nhận.

## Rủi ro / quay lui
- Back là luồng nhạy: đổi `navKey` làm mọi bước có độ dài `drawerBack` khác nhau được coi là bước khác. Đã chạy lại toàn bộ ca
  Back cũ (smoke, mobile) xanh. Quay lui: revert từng commit (mỗi lỗi một commit).
- Chưa thử trên điện thoại thật (quẹt thật); test dùng `page.goBack()`. Chrome "bỏ qua mục lịch sử đẩy không có chạm": cách
  sửa lỗi 2 không đẩy thêm mục nào (chỉ `replaceState` + một `pushState` như cũ trong lần chạm đầu), mục 0 vẫn quay về bằng
  `history.forward()` như trước.
- Nhánh: đóng màn mở từ Nhà thầu bằng nút "Đóng" khi gói đó mở từ màn nhà thầu đè lên gói khác: về màn nhà thầu nhưng khung
  chi tiết gói dưới không mở lại (hành vi cũ của `closeDrawer`, không đổi ở W2).

## Cần ghi nhớ
- IB2400069058 (sửa chữa máy phát Diezel của tổ máy 300MW) bị luật tên gói chung loại — nếu Khoa muốn nhận thì sửa luật ở cả
  ba nơi (xem `suppliers/CLAUDE.md`).
- Luồng phụ chưa có ca: Forward của trình duyệt sau khi Back về trang chủ từ link thẳng (mở lại bước cũ trong navStack).

## Danh sách 52 gói đổi kết quả (mã · tên, bidhist)
### Nhận thêm (8)
- IB2200094981 · Gói thầu số 42: Cung cấp bộ điều khiển cho máy phát diesel TAD1641GE 550kVA - Nhà máy Thủy điện An Khê
- IB2300126517 · Gói thầu thứ 4: Thi công xây dựng công trình “Sửa chữa hệ thống điện, máy bơm nước phòng cháy chữa cháy khu trạm nước mặt cổng 3; Sửa chữa, bảo trì hệ thống Phòng cháy chữa cháy từ trạm nước ngầm đến Khu hành chính của Văn phòng Ban và các Trung tâm; Sửa chữa, bảo trì hệ thống trạm bơm nước ngầm phục vụ cấp nước sinh hoạt và nước PCCC cho Văn phòng Ban và các Trung tâm; Sửa chữa và đấu nối lại máy phát 330KVA sử dụng cho trạm nước ngầm phục vụ PCCC”
- IB2300165131 · TKT-ĐTPT-22-2023: Cung cấp, lắp đặt máy phát Diezel dự phòng 100kVA tại Đập tràn - Thủy điện Thượng Kon Tum
- IB2300193337 · Cung cấp, lắp đặt HT điện và Máy phát Diesel tại CNN
- IB2300238244 · Sửa chữa máy phát dự phòng Cummins 550kVA cấp điện Nhà điều hành Công ty Điện lực Bình Thuận
- IB2500064127 · Gói thầu số 10: Mua sắm phục vụ sửa chữa theo RCM thiết bị cơ - điện Đập tràn (Phần: Thiết bị điều khiển cửa van cung; máy phát Diesel) năm 2025 - Nhà máy thủy điện Sông Ba Hạ
- IB2500260414 · Gói thầu số 23/2025/XL-AL: Sửa chữa bảo trì các mục công trình xây dựng cầu thang, lan can, cửa phòng thông gió, cửa sắt phòng máy phát diezel 500kVA thuộc Nhà máy thủy điện A Lưới
- IB2500305519 · Đại tu Đại tu Máy phát Diezen số 1 và số 2 - Kế hoạch sửa chữa lớn năm 2025 Công ty Cổ phần Nhiệt điện Phả Lại

### Loại ra (44)
- IB2200036934 · Sơn lại các khung bao che cho tổ máy Tuabin hơi và Máy phát điện ST14 NMĐ PM1
- IB2300018108 · Sửa chữa, bảo dưỡng hệ thống tuabin - Máy phát điện 3MVA
- IB2300063223 · 02/VMC-ĐGCSN: Thuê đào tạo thiết kế máy phát điện và thiết kế cánh turbine bằng vật liệu composite giai đoạn EVT
- IB2300116330 · Gói số 1: Cung cấp, lắp đặt Hệ thống hút bụi chổi than máy phát điện tổ máy H2 Nhà máy thủy điện Hòa Bình.
- IB2300132315 · 04/VMC-ĐGCSN: Thuê đào tạo thiết kế máy phát điện và thiết kế cánh turbine bằng vật liệu composite giai đoạn EVT thuộc nhiệm vụ KHCN: “Nghiên cứu, thiết kế, chế tạo hệ thống điện gió công suất nhỏ 1 kW”
- IB2300145905 · Cung cấp bộ điều khiển phát xung hệ thống kích từ máy phát điện Nhà máy Nhiệt điện Hải Phòng
- IB2300160925 · Mua dầu nhớt và phụ kiện thay thế định kỳ cho Hệ thống máy phát điện Turbine Kawasaki Đài THVN
- IB2300178278 · Cung cấp bộ điều khiển phát xung hệ thống kích từ máy phát điện Nhà máy Nhiệt điện Hải Phòng
- IB2300240374 · Cung cấp dầu tuabin máy phát điện
- IB2300247684 · 08/VMC-ĐGCSN: Mua sắm hàng hóa phục vụ sản xuất cụm cơ khí và máy phát điện gió giai đoạn EVT
- IB2400002758 · Cung cấp vật tư sửa chữa giá đỡ chổi than kích từ máy phát điện tổ máy số 2
- IB2400005422 · Phục hồi vành góp kích từ máy phát điện tổ máy số 2
- IB2400069058 · 08PTV-UB-SXKD-2024: Sửa chữa máy phát điện Diezel số 2 Tổ máy 300MW
- IB2400114575 · Gói thầu 27PTV-SXKD-2024: Thử nghiệm đo phóng điện cục bộ máy phát điện online định kỳ cho tổ máy số 1 và số 2 - NMTĐ Bản Vẽ năm 2024
- IB2400124704 · Cung cấp vật tư, thiết bị phục vụ bảo dưỡng, sửa chữa tổ máy phát điện 32MW số 2 – Nhà máy Thủy điện Quảng Trị
- IB2400133691 · Cung cấp, lắp đặt Hệ thống hút bụi chổi than máy phát điện tổ máy H4
- IB2400184998 · 15PTV-UB-SXKD-2024: Thuê dịch vụ phân tích tình trạng phóng điện cục bộ Máy phát điện cho tổ máy 300MW và 330MW
- IB2400245497 · Cung cấp, lắp đặt Hệ thống hút bụi chổi than máy phát điện tổ máy H4
- IB2400341727 · Gói thầu số 01/SCL-SXKD2024: Sửa chữa máy phát điện (phần điện) rotor, stator tổ máy H1, H2 Nhà máy thuỷ điện Nậm Mở 3
- IB2400558597 · Cung cấp, tháo dỡ và lắp đặt hệ thống rơ - le bảo vệ tổ máy phát điện - Nhà máy thủy điện Thác Bà
- IB2400573268 · Cung cấp dàn làm mát máy phát tổ máy phát điện - Nhà máy thủy điện Thác Bà
- IB2400604022 · Cung cấp và lắp đặt hệ thống thiết bị đo độ rung, đảo tổ máy phát điện - Nhà máy thủy điện Thác Bà
- IB2400604174 · Cung cấp séc măng, bulong chỏm cầu, đĩa đàn hồi tổ máy phát điện - Nhà máy thủy điện Thác Bà
- IB2400605754 · Cung cấp cơ cấu chắn rò rỉ ổ tuabin tổ máy phát điện - Nhà máy thủy điện Thác Bà
- IB2500024019 · Tính toán tham số chỉnh định rơ - le bảo vệ tổ máy phát điện - Nhà máy thủy điện Thác Bà
- IB2500025236 · Vật tư Offskid cho nâng cấp hệ thống điều khiển máy phát điện Solar TG-A trên GNTT (VT-0155/25-KHI-TTH)
- IB2500085435 · Vật tư Offskid cho nâng cấp hệ thống điều khiển máy phát điện Solar TG-B trên GNTT (VT-0595/25-KHI-TTH)
- IB2500094134 · Gói thầu số 01/SCL-SXKD2024: Sửa chữa máy phát điện (phần điện) rotor, stator tổ máy H1, H2 Nhà máy thuỷ điện Nậm Mở 3
- IB2500138609 · Gói thầu 17PTV-SXKD.BV-2025: Thử nghiệm đo phóng điện cục bộ máy phát điện online định kỳ cho tổ máy số 1 và số 2 - NMTĐ Bản Vẽ năm 2025
- IB2500187218 · MS25-1.1. Cung cấp, lắp đặt hệ thống hút bụi chổi than máy phát điện tổ máy H7
- IB2500256667 · Mua vật tư tiêu hao thay thế cho UPS APC và máy phát điện gas turbine tòa nhà TT THVN
- IB2500340522 · MS25-1.1. Cung cấp, lắp đặt hệ thống hút bụi chổi than máy phát điện tổ máy H7
- IB2500353129 · Vật tư Offskid cho nâng cấp hệ thống điều khiển máy phát điện Solar TG-C trên GNTT (VT-2932/25-KHI-TTH)
- IB2500429652 · Gói thầu 04/SCL-SXKD2025: Sửa chữa máy phát điện (phần điện) rotor, stator tổ máy H1, H2 Nhà máy thủy điện Nậm Mở 3
- IB2500435157 · 2025-TMP-TB-14.29 thay thế thanh dẫn stator 02 máy phát điện Nhà máy Thủy điện Thác Mơ
- IB2500469768 · MS25-1.1. Cung cấp, lắp đặt hệ thống hút bụi chổi than máy phát điện tổ máy H7
- IB2500566017 · Cung cấp chổi than cho máy phát điện nhà máy Nhiệt điện Hải Phòng
- IB2600059549 · Cung cấp, lắp đặt hệ thống hút bụi chổi than máy phát điện tổ máy H1
- IB2600127164 · Gói thầu số 11: Cung cấp dịch vụ BDSC cho thiết bị phụ trợ (bao gồm nhân công/CCDC/VTTH) cho hệ thống thiết bị Phụ trợ: tuabin khí, tuabin hơi, máy phát điện, lò thu hồi nhiệt, BOP, hơi nước tuần hoàn, C&I, điện, sân trạm.
- IB2600195266 · Cung cấp, lắp đặt hệ thống hút bụi chổi than máy phát điện tổ máy H1 - Lần 2
- IB2600453056 · Gói thầu 01.2027.TĐQT: Cung cấp vật tư thiết bị và dịch vụ sửa chữa Stator máy phát điện tổ máy H1- NMTĐ Quảng Trị
- IB2600455248 · Gói số 1: Cung cấp vật tư thiết bị phục vụ sửa chữa lớn các Hạng mục: Hệ thống Tuabin tổ máy số 2, Hệ thống điều tốc Tuabin tổ máy số 2, Hệ thống nước kỹ thuật tổ máy số 2, Hệ thống máy phát điện tổ máy số 2, Máy biến áp chính (220kV) và thiết bị nguồn điện T2, Hệ thống 13.8kV, hệ thống đo đếm và đo lường trung áp tổ máy số 2, Hệ thống kích từ tổ máy số 2, Hệ thống điện 0,4 kV tổ máy số 2, Hệ thống điện một chiều và UPS tổ máy số 2
- IB2600512067 · Gói số 2: Cung cấp dịch vụ sửa chữa lớn các Hạng muc: Hệ thống Tuabin tổ máy số 2, Hệ thống điều tốc Tuabin tổ máy số 2, Hệ thống nước kỹ thuật tổ máy số 2, Hệ thống máy phát điện tổ máy số 2, Hệ thống 13.8kV, hệ thống đo đếm và đo lường trung áp tổ máy số 2, Hệ thống kích từ tổ máy số 2, Hệ thống điện 0,4 kV tổ máy số 2, Hệ thống điện một chiều và UPS tổ máy số 2
- IB2600557434 · Dịch vụ đánh giá thiết bị hiện tại, thí nghiệm phóng điện cục bộ máy phát điện online cho các tổ máy Nhà máy thủy điện Bản Chát và thủy điện Huội Quảng năm 2026
