# Nghiệm thu T4 — hồi quy phần sau agent, không gọi agent (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/630 (nhánh `test/t4-regress`, 1 commit trên origin/main 51c78473).

## Tệp đã đổi
- mới `suppliers/regress-config.test.mjs` (7 ca), `suppliers/regress-bidprice.test.mjs` (4 ca)
- mới `suppliers/fixtures/runs/regress.mjs` (đọc fixture, tóm tắt, so / cập nhật mẫu), `README.md`
- mới `suppliers/fixtures/runs/<TBMT>/{config[-n],bidprice}.input.json.gz` + `.expected.json`
- sửa `suppliers/config-bot.mjs`: `check(..., { sourcesDir })` truyền vào `sourceRatings` (mặc định như cũ → không đổi
  hành vi; cần để test đọc bảng RATINGS đóng băng thay vì `suppliers/sources/` đang đổi — main vừa cào lại +24k dòng ở #629)
- sửa `suppliers/CLAUDE.md`: 1 dòng cách dùng ở mục "Thử không tốn agent"

## Nguồn đầu vào (vì sao không phải result.json thô)
- `%TEMP%\genbid-config\<TBMT>` bị `answer()` xoá sau mỗi lượt (thư mục trống khi kiểm). Log `%TEMP%\genbid-config-*.log`
  chỉ có `scripts/build.mjs` của agent + nhiều lần sed sửa nó → không dựng lại được result.json thô.
- Vì vậy đầu vào = kết quả đã lưu `configmatch` (doc-cache 12/11 13:46, chụp sang thư mục tạm trước khi dùng). `check`
  chạy lại trên kết quả đã lưu là đường thật của bot (`keepFound`, Gợi ý lại, `restore-web`).
- Chữ HSMT: `hsmtTextOf` đọc web (chỉ GET) 13/11; email thay bằng `[email]` (có email cá nhân cán bộ bên mời thầu);
  kiểm lại: mẫu không đổi sau khi thay.
- NCC: `doc-cache\supplier.json` 13/11 06:31, rút gọn (README). Lúc dựng, bản tóm tắt trên phần rút gọn TRÙNG HOÀN TOÀN
  với chạy trên cả kho 433 NCC (6/6 lượt). Bảng RATINGS: chép 2–9 tệp `sources/<id>/<n>.md` mỗi lượt, trùng 6/6.
- Giá gợi ý: `samples.json` dựng lại bằng chính `bidprice-bot prep` (bidhist doc-cache 12/11 22:46, `GENBID_DOC_CACHE`
  trỏ ra thư mục tạm để không ghi đè doc-cache chung); `result.json` = mức/câu trích agent lấy từ `bidprice` đã lưu.
  Danh sách gói cũ trùng 3/3 với bản lưu; giá ba mức, giá hiệu chỉnh và giá theo cấu hình khớp từng đồng 3/3.
- Công cụ dựng (cần token đọc web, đường dẫn cứng tới worktree wt-test-t4): `nghiem-thu\test-t4-tools\`
  (fetch-hsmt, fetch-bp, build-cfg, build-bp, pack-bp, vs-stored, probs).

## Lượt đã chọn + lý do + kích thước (gzip, trong repo)
| Lượt | Lý do | input | expected |
|---|---|---|---|
| IB2600586587/config | máy một cỡ thường 160 kVA, xuất xứ Tất cả | 73 KB | 2,8 KB |
| IB2600601812/config | HSMT nêu đích danh "Huyndai DHY110K SE", không "tương đương" | 97 KB | 3,3 KB |
| IB2600592684/config-1, -2 | gói hai cỡ (30 kVA, 500 kVA), cũng nêu FORTUGEN có "tương đương" | 67 + 98 KB | 3,0 + 1,3 KB |
| IB2600603983/config | xuất xứ G7/EU tự đọc từ HSMT (chỉ bộ phận chính, basis origin) | 134 KB | 3,4 KB |
| IB2600594596/config-1 | đồng bộ thương hiệu 2/3 (cỡ 300 kVA) | 84 KB | 3,2 KB |
| IB2600586587/bidprice | 1 gói gần dùng được + 16 gói cùng cỡ; giá cấu hình khác nhóm | 15 KB | 0,8 KB |
| IB2600601812/bidprice | 3 giống + 5 gần, hiệu chỉnh theo dự báo số nhà thầu | 33 KB | 1,2 KB |
| IB2600603983/bidprice | không gói nào giống/gần, giá chỉ từ gói cùng cỡ | 23 KB | 0,7 KB |
Theo gói: IB2600592684 165 KB, IB2600603983 157 KB, IB2600601812 130 KB, IB2600586587 88 KB, IB2600594596 84 KB (< 300 KB).
Không có lượt xuất xứ G7 thuần (configreq không có origin g7); dùng g7eu tự đọc. Bỏ IB2600594596 cỡ 400 kVA: cấu hình
rehlko dựa trên trang internet `web/1.txt` (cdn.shopify D440.pdf) không còn lưu → check chạy lại ra 57 điểm "không tìm thấy
nguồn", không đại diện.

So mỗi lượt cấu hình: số vấn đề nguồn, số yêu cầu, đồng bộ thương hiệu, tổ máy nêu đích danh (found/equivalent/warn), câu
hỏi làm rõ do code, mã yêu cầu HSMT có mà requirements chưa có; mỗi cấu hình: hạng, động cơ/đầu phát/BĐK, đích danh hay
tương đương, NCC `id:n`, đạt/không đạt/chưa rõ/xác nhận theo bộ phận, số check chưa kiểm được, tên check không đạt, cảnh báo
thua thầu. Mỗi lượt giá: mức từng gói sau check, gói giống/gần đã kiểm câu trích, stats (basis, n, same, close, nPrior, pool,
3 mức, 3 mức hiệu chỉnh, giá theo kVA), giá theo cấu hình.

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/regress-config.test.mjs` → pass 7, fail 0, 5,2 s (Windows; lượt G7/EU 2,3 s — hơi quá mốc 5 s
  mỗi tệp, cả bộ vẫn dưới 60 s).
- `node --test suppliers/regress-bidprice.test.mjs` → pass 4, fail 0, 0,4 s.
- `node --test suppliers/*.test.mjs` → tests 559, pass 557, fail 0, todo 2 (của việc khác), 33,0 s.
- CI PR #630: app, server, suppliers (19 s trên ubuntu), Vercel đều pass.
- Thử chạy 2 lần liên tiếp: cùng kết quả (không phụ thuộc giờ; `GENBID_NAMED_SELLER` bị xoá trong test).

## Thử cố ý làm hỏng quy tắc (đã hoàn lại, không commit)
1. `syncCheck`: nhánh "các bộ phận thuộc 3 hãng khác nhau" trả `unclear` thay vì `not_met`. →
   `not ok 5 - hồi quy cấu hình IB2600594596/config-1: đồng bộ thương hiệu 2/3...`; diff mẫu: tổ máy lắp ráp
   Cummins 6LTAA9.5-G1 + Bobig BW-314DS + DSE7320 nhảy từ hạng 3 lên hạng 1 (genset 4/2/8/9 → 4/1/9/9), ba cấu hình
   Yuchai/Weichai + Nianfeng + DSE mất "Đồng bộ thương hiệu" khỏi danh sách không đạt. Lần thử đầu (nới `need - 1`) KHÔNG
   bị bắt vì nhánh sau của `syncCheck` vẫn ra not_met — hành vi đúng, không phải lỗ của test.
2. `web/bidprice.js suggest`: chỉ dùng gói "giống" khi có ≥ 3 (thay vì ≥ 5). → `not ok 3 - hồi quy giá IB2600601812`;
   diff: basis same+close → same, n 8 → 3, mức trung vị 383.240.000 → 352.341.000, cao 440.204.000 → 353.349.000.

## Xem tay từng lượt — điểm trông sai nghiệp vụ (không sửa code)
1. **check chạy lại tự báo lỗi check do chính code viết**: trên kết quả đã lưu, các check `byCode` (Đồng bộ thương hiệu,
   "Khả năng quá tải" quy tắc qua-tai, cosφ = 250/313 = 0,799) bị đếm là "thiếu câu trích nguồn" / "câu trích nguồn" /
   "số 799": IB2600601812 6/6 vấn đề, IB2600603983 4/5, IB2600594596-1 9/9. Không đổi trạng thái (unverifiedChecks = 0)
   nhưng `check` thêm ghi chú "Kiểm tra bằng code: N điểm chưa khớp nguồn, đã đánh dấu ⚠" → Gợi ý lại / keepFound có thể
   hiện cảnh báo giả. Đề xuất: bỏ qua check `byCode` khi kiểm câu trích. Mẫu hiện khoá hành vi này (sửa thì cập nhật mẫu).
2. IB2600601812: HSMT nêu đích danh Huyndai DHY110K SE không "tương đương"; 6/6 cấu hình là hàng tương đương (found=false,
   namedWarn có). Kết quả lưu không có câu hỏi làm rõ do code (agent đã có câu hỏi về hãng nên code không thêm) — đúng quy
   tắc, nhưng nên xem lại có NCC Hyundai nào trong kho để gợi ý đúng hãng.
3. IB2600592684 cỡ 30 kVA: hạng 2, 3, 5 không có model đầu phát (alternator null, 0 đạt / 7 chưa rõ) vẫn đứng trên
   Hyundai DM01VP (hạng 6, có 3 điểm không đạt) — hợp quy tắc xếp hạng, nhưng cấu hình thiếu đầu phát ở hạng 2 là yếu.
4. IB2600603983 (G7/EU, chỉ bộ phận chính): có Baudouin 6M33G825/5 (thương hiệu Pháp, công ty mẹ Weichai) và Volvo Penta
   (Thuỵ Điển, chỉ EU) — cần Khoa xác nhận Baudouin có tính là "nhãn hiệu G7/EU". 3 cấu hình đầu có cảnh báo
   `alt_standard:document` (cần chứng từ tiêu chuẩn đầu phát).
5. Cảnh báo thua thầu (`lossWarn`) có ở mọi lượt chạy lại nhưng KHÔNG có trong kết quả đã lưu trên web (lượt cũ chạy
   trước khi có LOSS_CHECKS, hoặc bị bỏ khi lưu) — Gợi ý lại sẽ làm chúng xuất hiện.
6. IB2600594596-1 hạng 1: Cummins QSL9-G5 + Stamford HC4D + PowerCommand 1.2, code ghi "3/3 cùng hãng Cummins" (đếm
   Stamford là Cummins). Đúng theo kho hiện tại; nếu quan hệ Stamford–Cummins đổi thì cần sửa dữ liệu hãng.
7. IB2600586587 giá: 2 gói "gần" nhưng stats chỉ dùng 1 (gói kia < 2 nhà thầu, `ok()` loại). Trường `chosen` của mẫu là
   "giống/gần đã kiểm câu trích", chưa trừ điều kiện ≥ 2 nhà thầu; số gói thực dùng là `stats.n`.
8. Mã yêu cầu HSMT có mà requirements chưa có: IB2600586587 iso8528_class, genset_type; IB2600592684 30 kVA standards,
   cooling, fuel_system, alt_type, ctl_measure; IB2600603983 iso8528_class, alt_cooling, oil_capacity, alt_ip.

## Số đo "hàm xuất ra chưa test nào nhắc tới" (đo, đếm tên export trong suppliers/*.mjs xuất hiện trong *.test.mjs)
Trước 79/279, sau 79/279 (T4 là hồi quy đầu-cuối, không thêm tên hàm mới; số lần nhắc `check` 152→158, `rankConfigs`
40→43, `missingCodes` 5→7, `sourceRatings` 3→4).

## 3 mẫu đối chiếu với nguồn gốc
- IB2600601812 giá mức thấp 257.032.000 đ / trung vị 383.240.000 / cao 440.204.000 = bản `bidprice/IB2600601812` trên
  web lúc 2026-11-12T17:41:08Z (stats.levels).
- IB2600594596-1 #3 Đồng bộ thương hiệu không đạt, HSMT: "- Tổ máy phải được đồng bộ 02 trong 03 bộ phận chính (động cơ,
  đầu phát, bộ điều khiển)…"; code ghi "các bộ phận thuộc 3 hãng khác nhau".
- IB2600603983 xuất xứ g7eu, HSMT: "2 Nhà sản xuất/ nhãn hiệu Nhóm các nước khối G7, EU" (originOfHsmt, scope parts).

## Rủi ro còn lại + quay lui
- Mẫu là khoá hành vi: sửa code hợp lý cũng làm đỏ → chạy `GENBID_REGRESS_UPDATE=1`, đọc diff, commit. Quay lui: revert PR
  (tham số `sourcesDir` mặc định như cũ, gỡ ra không ảnh hưởng bot).
- Fixture dùng kết quả đã qua check, không phải câu trả lời thô của agent; không phủ đường `checkDir` đọc `web/*.txt`
  (readWeb = null) và `addToCatalog`.
- regress-config 5,2 s/tệp trên Windows (mốc 5 s).

## Việc chưa kiểm được
- (CI đã xanh.)
- Không có lượt origin "g7"/"g20" thuần, không có lượt có trang internet còn lưu để phủ `readWeb`.

## Cần ghi nhớ
- Muốn có result.json thô của agent cho hồi quy sau này: bot cần giữ lại `result.json` + `hsmt.txt` + `web/` của lượt
  (hiện `answer()` xoá cả thư mục) — cần Khoa/điều phối quyết.
- Điểm 1 (check tự báo lỗi check byCode khi chạy lại) nên thành việc sửa riêng.
