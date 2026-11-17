# Nghiệm thu cfg-r2-1 — Gợi ý cấu hình rà soát lần hai (A ổn định điện áp, B làm rõ HSMT, C giá chạy lại, D bảng câu hỏi NCC)

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/521 — nhánh `cfg-r2`, commit 173c627, dựng trên main d234a6a (main chưa đổi lúc mở PR).

## Tệp đã đổi
- `suppliers/config-bot.mjs`: `vregChecks` + `pctsIn` (A); `clarifyOf` (B, gọi cuối `check()`, gộp mã giữ `quotes`, `check(…, { sized })`, prep ghi `meta.json.sized` cho gói nhiều cỡ); `rebidOf` + `rebidAfterConfig`, gọi cuối `answer()` (C); `rfqOf` viết lại + `rfqPoints`, `RFQ_TIERS` (D).
- `suppliers/config-prompt.md`: trường `clarify` trong result.json + quy tắc câu trích nguyên văn.
- `web/index.html`: `cfgClarifyOf/Text/Html` + nút `data-cfgclar` (khối đầu kết quả Gợi ý cấu hình); `cfgRfqText/cfgRfqHtml/cfgRfqLi` theo tầng + `items` (dạng cũ vẫn hiện); `bpStaleHtml` ở tab Giá gợi ý. Đã grep tên trước khi thêm (không trùng). Câu trích HSMT trên màn hình theo `SHOW_SRC` (tắt → chỉ hiện điểm + lý do); văn bản chép ra nêu nguyên văn hai chỗ.
- `suppliers/cfg-r2.test.mjs` (mới, 12 test), `suppliers/confirm.test.mjs` (1 test cập nhật: Điện áp nằm trong dòng gộp).
- Không sửa `web/api/webreq.js`: không có trường yêu cầu mới từ web (bot gửi lại bidpricereq qua /api/ingest, ingest tự đặt `updated_at`). Không tăng `REQ_VERSION` (clarify không đổi yêu cầu).

## Lệnh kiểm + đầu ra thật
- `cd suppliers && node --test` → `# pass 204  # fail 0`.
- CI PR #521: `server`, `suppliers`, `app` đều pass.
- Web cục bộ: `serve.js` (bản chép trong scratchpad r2, thêm seed `extra.json`) trên cổng 8795, dữ liệu configmatch/bidprice/bidpricereq THẬT của 2 gói đọc chỉ-đọc bằng `doc()`; configmatch chạy qua code mới (vregChecks + clarifyOf + rankConfigs) trước khi nạp. Không lỗi console. Ảnh (Edge headless qua playwright-core): `nghiem-thu\cfg-r2-1-anh\` desktop-1-lamro, desktop-2-rfq, desktop-3-gia, mobile-1/2/3. rfq dạng cũ (configmatch thật IB2600594596 nạp nguyên trạng) vẫn hiện 15 dòng và chép được.
- Không chạy agent thật, không ghi web thật, không đụng `genbid-hsmt\`.

## Số đo (ĐO, script scratchpad `r2/measure.mjs`; "trước" = code main d234a6a, "sau" = nhánh)
57 cấu hình: 12 configmatch trong `doc-cache` + 2 configmatch thật 11/11 (IB2600603983 1 cỡ, IB2600594596 2 cỡ).

**A — thứ hạng đổi (chỉ một gói):** 7 check ổn định điện áp đổi thành confirm, tất cả ở IB2600603983 (3 trong bản doc-cache 10/11, 4 trong bản thật 11/11); 11 gói còn lại không có check nào đủ điều kiện → không đổi thứ hạng.

| Gói (bản thật 11/11) | Cấu hình | Trước | Sau | Vì sao |
|---|---|---|---|---|
| IB2600603983 | QSK23-G2 + S5L1D-H41 + DSE8610 | #2 | #1 | ổn định điện áp not_met → confirm (nguồn ±1% / ±5%, HSMT ±0,5%); hết "không đạt" ở đầu phát |
| IB2600603983 | 4006-23TAG3A + S5L1D-H4 + DSE7320 | #3 | #2 | not_met → confirm (nguồn ±1%) |
| IB2600603983 | 4006-23TAG2A + S5L1D-H41 + DSE7320 | #1 | #3 | unclear → confirm, nhưng hai cấu hình trên lên vì hết not_met (chúng nhiều check đạt hơn) |
| IB2600603983 | 4006-23TAG2A + LVI634B + DEEPSEA6020 | #4 | #4 | not_met → confirm, vẫn đứng cuối |

Bản doc-cache 10/11 của IB2600603983: 3 cấu hình unclear → confirm, thứ tự không đổi.

**D — số dòng bảng câu hỏi NCC (cùng trạng thái check, trước A):** 57 cấu hình — trung bình **23,1 → 6,4 dòng**, lớn nhất **49 → 18**; tổng điểm trong các dòng mới trung bình 23,1 = số dòng cũ, **0 cấu hình mất điểm** (so từng cấu hình: số dòng cũ == `rfqPoints` mới). IB2600603983 cấu hình 4006-23TAG2A + S5L1D-H41 (#1 cũ): **44 → 16 dòng**, 44 điểm. Sau A, QSK23-G2 (#1 mới): 13 dòng / 32 điểm.

**B — câu hỏi làm rõ:** IB2600603983 (bản thật): 2 câu (ổn định điện áp ±0,5% / ±1,5%; tỷ số nén 14:1). IB2600594596: 0 câu (gói 2 cỡ: quét HSMT tắt cho từng cỡ; lần đo đầu quét cả HSMT ra 4 câu sai — dòng "Biến thiên tần số" bị lấy cho điện áp vì từ khoá `alt_vreg` có nhánh "±0,x%", và cỡ 300/400 kVA có mục riêng mức khác nhau — đã sửa: từ khoá riêng có loại trừ chéo, `scan: false` khi `meta.sized`, có test).

**C — giá chạy lại:** cả hai gói thật đang ở đúng tình trạng cần sửa: IB2600603983 bidprice 10/11 11:25 < configmatch 11/11 04:45; IB2600594596 bidprice 06/11 < configmatch 11/11 05:05 (configreq 11/11 gửi tay → `autoBidprice` không chạy). Với code mới, `rebidOf` cho cả hai: IB2600603983 basis kva 700, giá gói 5.412.000.000; IB2600594596 basis kva 400 (bidpricereq), giá gói 3.710.365.000. Web cục bộ hiện "Giá tính theo cấu hình gợi ý cũ (trước 11:45 11/11/2026) — chưa tính lại." (ảnh desktop/mobile-3-gia).

## Văn bản "Câu hỏi làm rõ HSMT" — IB2600603983 (chép từ nút trên bản thử cục bộ; dựng từ configmatch thật + hsmt, không chạy agent)
Bản thử dùng tên gói/chủ đầu tư giả của serve.js; trên web thật dòng "Kính gửi" lấy `procuringEntityName` / `investorName` và tên gói thật. Thay vào đây cho đúng gói:

```
Kính gửi: CÔNG TY ĐIỆN LỰC GIA LAI

Về việc: đề nghị làm rõ hồ sơ mời thầu gói thầu "Gói thầu số 61/2027/MSMF: Mua sắm Máy phát điện dung lượng 700kVA 3 pha - 380/220V, Chạy bằng dầu diesel" (số TBMT IB2600603983).

Sau khi nghiên cứu hồ sơ mời thầu, chúng tôi nhận thấy một số nội dung cần được làm rõ. Kính đề nghị Quý Bên mời thầu xem xét và trả lời các nội dung sau:

1. Về "Ổn định điện áp": HSMT ghi "Dao động điện áp ≤ ± 0,5% Udm" và ở chỗ khác ghi "Kích từ: không chổi than, tự động điều chỉnh điện áp, đảm bảo dao động điện áp ≤ ±1,5%Udm trong quá trình chuyển đổi tải từ 0 đến 100%Pđm." HSMT ghi hai mức khác nhau cho cùng một yêu cầu (±0,5% và ±1,5%). Đề nghị Quý Bên mời thầu xác nhận giá trị áp dụng.
2. Về "Tỷ số nén": HSMT ghi "Tỉ số nén 14 : 01". Tỷ số nén là giá trị thiết kế của từng model động cơ; không động cơ nào trong các cấu hình gợi ý ghi đúng 14:1. Đề nghị cho phép dải giá trị hoặc giá trị tương đương.

Trân trọng cảm ơn.
```
(Số thứ tự dòng bảng "15", "14" và gạch đầu dòng bị bỏ khỏi câu trích trong văn bản; dữ liệu `quoteA/quoteB` giữ nguyên văn.)

## 3 mẫu đối chiếu với nguồn
1. HSMT IB2600603983 (hsmttext, `hsmtTextOf`), dòng 533: "15   Dao động điện áp                          ≤ ± 0,5% Udm"; dòng 305–306: "đảm bảo dao động điện áp ≤" / "±1,5%Udm trong quá trình chuyển đổi tải từ 0 đến 100%Pđm." → quoteA / quoteB của câu 1.
2. Nguồn đầu phát S5L1D-H41 mức ±1%: fdk-energy nguồn [1027] https://fdkenergy.com/wp-content/uploads/2026/03/CG825-H1-VTA28-G6.pdf — dòng "| Voltage regulation NL-FL | ≤±1%" (cũng là `sourceQuote` của check QSK23-G2 trong configmatch thật).
3. Mức ±5% trong ghi chú "nguồn ghi ±1 / ±5%": shanhua nguồn [1046] https://shanhuachina.cn/wp-content/uploads/2025/07/600KW-Perkins-generator.pdf — dòng "| 电压调整Voltage Regulation | ±5%" (dòng thông số theo model S5L1D-H41). Lưu ý: có thể là dải chỉnh điện áp chứ không phải độ ổn định; không đổi kết luận (mọi mức nguồn đều > ±0,5%) nhưng ghi chú hiện cả hai số đúng như nguồn. Thêm: LVI634B — gb-power [1027] https://www.gbpower.net/Uploads/GB-P%2050/GB-P700.doc-1.pdf "| Voltage Regulation, | ≤±1%".

## Rủi ro còn lại + cách quay lui
- A: confirm khiến cấu hình có mức nguồn ±1% xếp ngang cấu hình đạt ±0,5% — đúng quy tắc duyệt, nhưng nếu NCC không có AVR ±0,5% thì #1 sai. Câu hỏi nằm trong dòng "Cấu hình đặt hàng" của bảng câu hỏi NCC kèm ghi chú AVR. Dòng nguồn "Voltage Regulation ±5%" (có thể là dải chỉnh) chỉ làm ghi chú dài hơn.
- B: quét HSMT chỉ cho ±% điện áp / tần số và chỉ gói một cỡ; so sánh số theo đơn vị của mã (%, V, Hz, kVA, v/p) nên "1,1Pdm" và "10%" không bị coi là mâu thuẫn. Có thể còn dương tính giả khi HSMT ghi hai mức cho hai chế độ (xác lập / khi đóng tải) mà dòng không có chữ quá độ. Câu agent bị bỏ nếu câu trích không khớp.
- C: mỗi lượt Gợi ý lại (chỉ `answer()` của configreq, không phải Tìm NCC) với gói đã có giá sẽ tốn thêm một lượt bidprice (~agent Opus). Không lặp: bidprice-bot chỉ ghi bidprice/bidpricereq (có test đọc mã nguồn).
- D: web cũ đọc `rfq` mới vẫn được (cùng trường `of/item/requirement/ask/status/kind`); dòng gộp có `of` rỗng.
- Quay lui: revert PR #521 (một commit). Kết quả configmatch đã ghi bằng code mới vẫn hiện trên web cũ (trường thêm `clarify`, `rfq[].items/tier`, `checks[].avr/was` bị bỏ qua). Sau khi gộp phải chờ tiến trình `config-bot.mjs run` đang chạy thoát (bẫy code cũ).

## Việc chưa kiểm được
- Chưa chạy lượt agent thật để xem agent điền `clarify` (prompt mới).
- Chưa xem trên Vercel thật; chưa kiểm luồng gửi lại bidpricereq trên bot thật (đã kiểm `rebidOf` bằng test + dữ liệu thật, không post).
