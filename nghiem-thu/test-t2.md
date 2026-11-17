# Nghiệm thu T2 — phủ test hàm xuất ra còn thiếu của `suppliers/`

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/627 (nhánh `test-t2-cover`, worktree `wt-test-t2`; chưa merge).

## Tệp đổi (chỉ thêm, không sửa mã sản phẩm, không sửa test có sẵn)
`suppliers/cover-budget.test.mjs` (15 ca), `cover-named.test.mjs` (32), `cover-memo.test.mjs` (16), `cover-guard.test.mjs` (16), `cover-config.test.mjs` (77) = 156 ca.

## Lệnh kiểm
`node --test suppliers/*.test.mjs` (Windows, worktree): tests 704, pass 701, **fail 0**, todo 3 (1 của T2 + 2 có sẵn). Mỗi tệp cover chạy < 1 giây. Không mạng thật (`globalThis.fetch` giả), không `claude`, thư mục tạm cho sổ chi / kho đọc lại / tệp token; biến môi trường được khôi phục. Chưa chạy trên ubuntu (CI sẽ chạy trên PR); đã tránh phụ thuộc Windows (đường dẫn Windows trong log chỉ là chuỗi, `os.homedir` được đặt cả HOME và USERPROFILE).

## Số hàm xuất ra chưa test nào nhắc tới (đếm = tên `export` của module so với mọi `suppliers/*.test.mjs` bằng grep từ nguyên)
| Module | Trước | Sau |
|---|---|---|
| api-budget.mjs | 4 (API_OUT viaApi noteApiSpend switchToPlan) | 0 |
| named-genset.mjs | 10 (makesIn specsAsReqs makerOf sellerAllowed namedHit brandLicensedSeller BRAND_ASK brandLicensedChecks sellerSrc namedRank) | 0 |
| web-memo.mjs | 9 (NEG_DAYS OUTCOMES WEB_MEMO familyOfRec officialDomains officialOfSource inTrace negKey negLine) | 0 |
| read-guard.mjs | 4 (traceUnder guardTrace logFiles logReport) | 0 |
| config-bot.mjs | 30 | 4 |
Tổng 57 → 4. (Đã đo, không ước tính.)

## Hàm cố ý chưa phủ (config-bot.mjs)
- `pdfToText`: gọi tiến trình ngoài `pdftotext`; không có phần thuần tách ra được mà không sửa mã.
- `findPrep`, `specPrep`, `specPost`: dựng cả thư mục lượt (catalog.md, input.md, suppliers.json, đọc `find-prompt.md`, kho NCC, `prep()`), ghi nhiều tệp; test được cần fixture lớn hoặc tách hàm → ngoài phạm vi "không sửa mã". Phần thuần của `findPrep` là `targetText` và `sizesFor`, đã phủ. Đề xuất: việc sau tách `prep` sang module có thể tiêm đường dẫn rồi test.
- `allDocs`, `post`, `sizesFor`, `hsmtTextOf` **đã phủ** bằng `fetch` giả (không sửa mã): `GENBID_*` đặt trước khi nạp module.

## Ca `todo` (1)
- `brandLicensedChecks: gọi hai lần với 'GRV POWER PRODUCTS, S.L.' không lặp câu ghi chú` — regex gỡ câu "Code ghi: thương hiệu … (CO, CQ, thư uỷ quyền)." dùng `[^.]*` nên dừng ở dấu chấm trong "S.L.", chạy lại trên cùng cấu hình thì `note` lặp "Code ghi:". Ảnh hưởng: chỉ nội dung ghi chú (không đổi trạng thái / hạng). Đúng tên pháp nhân của GRV (quy tắc Khoa 13/11). Cách sửa gợi ý: gỡ theo `licensedNote` đã biết thay vì regex. Chưa đo trên `doc-cache` (cần cấu hình đã chạy hai lần; chưa có số).
Ca đối chứng cùng hành vi với tên không có dấu chấm là ca chạy thường (đạt).

## Quy tắc nghiệp vụ được kiểm (không chép đầu ra của code)
- api-budget: chỉ lượt trả bằng API key tính vào sổ chi, làm tròn 4 số lẻ; "hết tiền" bỏ ANTHROPIC_API_KEY, ghi `exhausted`, nạp token gói tháng nếu máy chưa đăng nhập, chỉ một lần. (Ngưỡng 90/98 USD nằm trong `GenBid-Bot.ps1` — thuộc T6, không có ở đây.)
- named-genset (Khoa 13/11): tổ máy lắp ráp chỉ dùng động cơ cùng hãng → `namedHit` null (tương đương); NCC chỉ mang thương hiệu cấp phép → dòng hãng "confirm", vẫn named, hạng không đổi; nhà phân phối không phải nhà sản xuất.
- web-memo: 90 ngày hết hạn (89 còn / 90 hết), khoá `source` gồm xuất xứ, CDN / bên bán không phải nguồn chính thức, `official` tự khai bị bỏ qua.
- read-guard: IB2600592684 (đọc 321/446 dòng), lọc theo thư mục khi một lượt đọc nhiều thư mục, lượt không có dòng result.
- config-bot: sheetChecks chỉ nâng "chưa rõ" → "đạt", không bao giờ tự kết luận "không đạt"; powerRead bỏ công suất động cơ, bỏ gói nhiều cỡ; engineLists bỏ bình làm mát (rà soát 12/11), dung sai ± (IB2300087393); allDocs đọc lại đúng tài liệu đổi.

## Khoá hành vi (không rõ đúng sai, ghi chú trong ca)
- `engineLists` trả giá trị dung tích lặp (`[11.05, 11.05]`) khi dòng "Số xi lanh" kề dòng dung tích (dòng 2 bị coi là ô liền kề). `engineMins` dùng tập nên không ảnh hưởng; ca so theo tập.
- Các hằng `MAX_SIZES=4, MAX_CONFIGS=6, MAKE_CAP=10, LOSS_RANKS=3, WEB_KEEP=2, REQ_VERSION≥5`.
- `guardTrace` không có `under` coi tệp trùng tên thư mục khác là đã đọc (vì thế phải dùng `under`).

## 3 mẫu đối chiếu
1. IB2600592684 (04/11), read-guard: input.md 1–321 / 446 → ghi chú "thiếu dòng 322–446 / 446" (ca `guardTrace`).
2. `suppliers/CLAUDE.md`: "Prime power / Speed (KW/RPM)" fdk-energy → số thứ hai là tốc độ: `ratedPower("Prime power / Speed (KW/RPM)", "284/1500")` → prime 284, rpm 1500.
3. Khoa 13/11 (`config-suggest.md`): GRV Power Products brandLicensed → `brandLicensedChecks` đổi "đạt" thành "confirm" kèm ghi chú CO, CQ, thư uỷ quyền.

## Rủi ro còn lại / quay lui
Chỉ thêm tệp test: quay lui = xoá 5 tệp `cover-*.test.mjs`. Rủi ro: ca khoá hành vi cần sửa khi đổi quy tắc có chủ ý. Chưa kiểm: chạy ubuntu CI.

## Cần ghi nhớ
- Lỗi `todo` ở trên (đề xuất sửa nhỏ, chưa sửa vì ngoài phạm vi).
- 4 hàm chưa phủ cần tách mã mới test được.
