# Nghiệm thu cfg-chuyen-mon-1 — Bốn loại yêu cầu + "xác nhận khi đặt hàng" + bảng câu hỏi gửi NCC

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/502 (draft, nhánh `cfg-kind` từ origin/main a16f9d7)

## Sửa theo điều phối (10/11, commit f4ab3db)
1. voltage: chỉ `confirm` khi đọc được số điện áp và mọi số ≤ 1.000 V (`voltsIn`: "380V - 415V", "400/230 V", "380/220VAC", "0,4 kV" = 400 V). Trung áp ("6,3 kV", "22kV / 0,4 kV") hay không có số → chưa rõ.
2. phases: chỉ `confirm` khi có 3 pha và không có 1 pha ("3 pha – 4 dây", "3-Phase"). "1 pha", "Một pha", "3 pha hoặc 1 pha", không ghi số pha → chưa rõ.
3. alt_ip: chỉ `confirm` khi đọc được IP và mọi IP ≤ IP23 (chữ số đầu ≤ 2, sau ≤ 3). IP44, "IP 54", không ghi IP → chưa rõ.
4. genset_origin: về `model` (chưa rõ), để PR 2 xử lý cùng thương hiệu / xuất xứ G7.
Cài đặt: `reqcodes.mjs` `confirmKindOf(r)` (đọc `requirement` + `quote` của yêu cầu) — `confirmChecks`, `scoreOf`, `rfqOf` dùng nó thay cho kind trần. Test hai phía: `confirm.test.mjs` "confirmKindOf…" (20 ca) + "confirmChecks: a medium-voltage, 1-phase or IP54 requirement stays unclear". `node --test`: 158/158.
Đo lại: 28 yêu cầu voltage / phases / alt_ip của 12 gói đều hạ áp, 3 pha, ≤ IP23 (đã liệt kê từng câu HSMT, scratchpad `held.mjs`) nên số của chúng không đổi; chỉ genset_origin bớt 22 confirm (về chưa rõ). Bảng dưới đã là số sau sửa. Hạng #1 và thứ tự cả 13 kết quả vẫn không đổi.

## Tệp đã đổi
- `suppliers/reqcodes.mjs` — bảng `KIND` (kind cho từng mã, lý do trong comment), `KINDS`, `kindOf(r)`; `withCode` ghi `kind`; `codesMd` thêm cột kind cho agent.
- `suppliers/config-bot.mjs` — `confirmChecks(c, reqs)` (gọi cuối mỗi cấu hình trong `check`), `rfqOf(c, reqs)` (gọi trong `rankConfigs`, ghi `c.rfq`), `scoreOf` không tính `confirm` là chưa rõ; trong `check` mọi `confirm` (agent ghi hoặc lượt check trước) về `unclear` trước khi kiểm.
- `web/index.html` — `CFG_STATUS.confirm`, `cfgStOf`, lớp `.chip.cfm` (trung tính, viền nét đứt), đếm riêng trong `cfgGridBox`, tiêu đề cấu hình "Đạt, còn điểm cần NCC xác nhận" khi chỉ còn confirm; `cfgRfqHtml`/`cfgRfqText` + nút `data-cfgrfq` "Chép bảng câu hỏi" (grep trước: các tên này chưa có). Không in câu trích nào (SHOW_SRC không đụng tới).
- `suppliers/config-prompt.md`, `suppliers/check-prompt.md` — agent chỉ ghi met/not_met/unclear; code tự đổi sang confirm.
- `suppliers/gaps.mjs` (ngoài danh sách brief, 1 dòng): "Việc cần thu thập" không đếm confirm là chưa rõ (không phải thiếu thông số datasheet). Bỏ được nếu phiên điều phối không muốn.
- Test: `suppliers/confirm.test.mjs` (mới, 7 test), `config.test.mjs` (test stdChecks: 380/220 V nguồn không ghi giờ là check confirm do code ghi, trước là không có check), `reqcodes.test.mjs` (withCode có kind).
- Không đụng `web/bidprice.js`, `suppliers/bidprice-bot.mjs`, `web/conversions.js`. Không đổi `REQ_VERSION` (kind suy từ code, không đổi cách agent viết yêu cầu).

## Quy tắc
- `confirm` chỉ khi: check đang `unclear`, mã thuộc `order`/`document`, KHÔNG unverified (câu trích không khớp), KHÔNG conflict (nguồn mâu thuẫn), KHÔNG version (đời BĐK), KHÔNG phải nhóm. `x.confirm` = "order" | "document".
- Yêu cầu order/document mà cấu hình không có check → code thêm check `confirm` (byCode, note "nguồn của cấu hình không nói tới điểm này").
- Met / not_met giữ nguyên (vd. IP21 chào cho IP23 vẫn Không đạt).
- `hint` KHÔNG giữ lại unclear: ban đầu có giữ, nhưng đo thấy IB2600586587 #2–#4 có hint nhầm ("Voltage regulation NL-FL ≤±1%" cho "AVR tự động") nên AVR vẫn chưa rõ, còn #5 cùng đầu phát UCI274H không có check AVR → thành confirm → #5 vượt #3, #4. Hint được tính lại sau lượt đọc cuối của agent nên không phải dấu hiệu "nguồn có ghi"; bỏ điều kiện này thì thứ tự không đổi.
- `scoreOf`: confirm không cộng vào cột "chưa rõ"; yêu cầu order/document không có check cũng không cộng. Các cột và thứ tự khác giữ nguyên (`config-suggest.md`).

## Phân loại mã (cần Khoa xem)
- order (11): voltage (chỉ hạ áp), phases (chỉ 3 pha), fuel_tank, genset_type, breaker, canopy, battery, air_filter, alt_ip (chỉ ≤ IP23), alt_avr, ctl_display_lang.
- document (3): standards, prototype, alt_standard. (genset_origin → model theo điều phối.)
- site (2): ambient, noise.
- model: còn lại. **Lưỡng lự, đang để model (an toàn)**: iso8528_class (G2/G3 thường chỉ có tuyên bố của NSX), frequency (50/60 Hz đổi định mức động cơ), current (suy từ kVA + điện áp), dimensions / weight (phụ thuộc vỏ), exhaust (giảm thanh là order, lưu lượng khí xả là model), starting (đề 12/24 V), engine_origin / alt_origin / ctl_origin (nước SX theo model, CO chứng minh), alt_type (PMG/AREP là tùy chọn của nhiều đầu phát).
- Ngoài brief: các mã brief nêu "chưa rõ ở mọi cấu hình" mà vẫn để model: engine_type, fuel_system, overload, load_step, alt_vreg (đều là thông số datasheet), ambient (site). PR 2 xử lý overload/load_step/ambient bằng kiểm tra tổ hợp + câu hỏi rfq.

## Lệnh kiểm + đầu ra thật
```
cd wt-cfg-kind/suppliers && node --test
# tests 156
# pass 156
# fail 0
```
CI PR #502: xem mục cuối.
Web cục bộ (serve.js + configmatch thật IB2600586587 đã chuyển bằng code mới): cấu hình #1 lưới "Đạt 13 · Chưa rõ 4 · Cần NCC xác nhận 6", ô kết quả "Xác nhận khi đặt hàng" / "Cần chứng từ" màu xám nét đứt; khối "Câu hỏi gửi nhà cung cấp (10) 6 cần xác nhận / chứng từ, 4 chưa rõ"; nút chép ra 12 dòng chữ (dưới); console không lỗi.

## Số đo trước / sau (ĐO, không ước tính)
Nguồn: `genbid-work/doc-cache/configmatch.json` (12 gói, 13 kết quả kể cả gói nhiều cỡ, 57 cấu hình). "Trước" = dữ liệu lưu; "sau" = `confirmChecks` code mới trên cùng dữ liệu, yêu cầu được ánh xạ mã bằng `codeOf`. Script: scratchpad `measure2.mjs` (đếm theo check, met có ⚠ tính chưa rõ chỉ ở bản xếp hạng).

| Bộ phận | Trước: đạt / không / chưa rõ | Sau: đạt / không / chưa rõ / xác nhận |
|---|---|---|
| Tất cả | 1.793: 578 (32%) / 38 (2%) / 1.177 (66%) | 1.826: 578 (32%) / 38 (2%) / 959 (53%) / 251 (14%) |
| Tổ máy | 710: 202 / 21 / 487 (69%) | 738: 202 / 21 / 313 (42%) / 202 (27%) |
| Động cơ | 552: 205 / 10 / 337 (61%) | 552: 205 / 10 / 331 (60%) / 6 (1%) |
| Đầu phát | 306: 61 / 3 / 242 (79%) | 311: 61 / 3 / 205 (66%) / 42 (14%) |
| Bộ điều khiển | 225: 110 / 4 / 111 (49%) | 225: 110 / 4 / 110 (49%) / 1 |

+33 check là confirm do code thêm cho yêu cầu order/document mà agent không ghi check.
(Trước sửa theo điều phối: chưa rõ 937 (51%) / xác nhận 273 (15%); tổ máy chưa rõ 291 / xác nhận 224.)
Confirm theo mã (sau xếp hạng, 1.615 check): voltage 39, phases 30, fuel_tank 30, standards 23, alt_ip 19, alt_avr 16, prototype 13, genset_type 12, battery 8, air_filter 6, breaker 5, alt_standard 5, ctl_display_lang 1.
Bảng câu hỏi: 5–49 câu / cấu hình, trung bình 22,3.

**Hạng #1**: 13/13 kết quả giữ nguyên #1; thứ tự toàn bộ cấu hình trong cả 13 kết quả cũng giữ nguyên (so `rankConfigs` của main a16f9d7 với code mới, scratchpad `measure.mjs`). Lý do: confirm rơi chủ yếu vào nhóm "đầu phát + tổ máy" và gần như đều nhau giữa các cấu hình cùng gói (cùng yêu cầu HSMT, cùng loại nguồn không ghi).

## 3 mẫu đối chiếu với nguồn
1. IB2600586587 #1 (Perkins 1106A-70TAG4 + UCI274G + HGM6120N), mục "AVR" → **Xác nhận khi đặt hàng**. HSMT: "Điều chỉnh điện áp: AVR tự động". Nguồn cấu hình: tecgen-fujian, https://www.dgdieselgenerator.com/quality-41276349-standby-genset-180kva-perkins-diesel-generators-200kva-uk-perkins-engine-stamford-alternator, bảng "| Genset Model | TG220P" — agent ghi "Nguồn không ghi loại AVR". Câu hỏi: "[Đầu phát UCI274G] AVR — HSMT yêu cầu: AVR tự động. Cần: Xác nhận cấu hình đặt hàng đáp ứng."
2. IB2600603983 #1 (Cummins QSK23-G2 + Stamford S5L1D-H41 + DSE8610), mục "Thử nghiệm mẫu (prototype test)" → **Cần chứng từ**. HSMT: "Biên bản thử nghiệm điển hình: Nhà thầu phải cung cấp với E-HSDT." Nguồn: fdk-energy datasheet https://fdkenergy.com/wp-content/uploads/2026/03/CG825E-H1-QSK23-G2.pdf ("| Genset Model | FDK-CG825E/H1") không có biên bản. Câu hỏi: "Gửi chứng từ / bản cam kết đáp ứng". Cùng cấu hình, "Tiêu chuẩn khí thải — Phù hợp QCVN" (mã emission, model) vẫn **Chưa rõ**, câu hỏi "Xác nhận thông số, gửi datasheet / catalog có ghi".
3. IB2600574589 #1 (SDEC 6ETAA12.8-G21 + JET444F), mục "Số pha" → **Xác nhận khi đặt hàng**. HSMT: "380V - 415V / 50Hz / 3 pha - 4 dây". Nguồn: jet-power https://www.jetgenset.com/50hz-16kva-to-2500kva-sdec-diesel-generator-set.html, dòng "| SD-440 | 440 | 352 | 400 | 320 | 6ETAA12.8-G21 | 6L | 130×161 | 12.8 | 190 | JET444F" — không ghi số pha.

Chữ chép ra (IB2600586587 #1, thử trên web cục bộ):
```
Gói IB2600586587 — cấu hình #1: động cơ 1106A-70TAG4 (Perkins), đầu phát UCI274G, bộ điều khiển HGM6120N
Đề nghị Quý công ty xác nhận / cung cấp các nội dung sau:
1. [Động cơ 1106A-70TAG4] Loại động cơ — HSMT yêu cầu: Diesel 4 kỳ, tăng áp. Cần: Xác nhận thông số, gửi datasheet / catalog có ghi.
2. [Động cơ 1106A-70TAG4] Lọc nhiên liệu — HSMT yêu cầu: Có lọc nhiên liệu. Cần: Xác nhận cấu hình đặt hàng đáp ứng.
3. [Bộ điều khiển HGM6120N] Chức năng bảo vệ — HSMT yêu cầu: Bảo vệ quá tải, điện áp thấp/cao, mất pha, nhiệt độ cao. Cần: Xác nhận có các chức năng: Mất pha; gửi datasheet.
4. [Đầu phát UCI274G] Cấp cách điện — HSMT yêu cầu: Class H hoặc C. Cần: Xác nhận thông số, gửi datasheet / catalog có ghi.
5. [Đầu phát UCI274G] AVR — HSMT yêu cầu: AVR tự động. Cần: Xác nhận cấu hình đặt hàng đáp ứng.
6. [Tổ máy TG220P] Loại máy — HSMT yêu cầu: Máy phát điện diesel, 3 pha. Cần: Xác nhận cấu hình đặt hàng đáp ứng.
7. [Tổ máy TG220P] Tiêu chuẩn chất lượng — HSMT yêu cầu: ISO 9001 hoặc ISO 8528 hoặc tương đương. Cần: Gửi chứng từ / bản cam kết đáp ứng.
8. [Tổ máy TG220P] Tiêu hao nhiên liệu — HSMT yêu cầu: ~35–45 L/h ở 100% tải. Cần: Xác nhận thông số, gửi datasheet / catalog có ghi.
9. [Tổ máy TG220P] Bình dầu tích hợp — HSMT yêu cầu: Chạy ≥ 6 giờ. Cần: Xác nhận cấu hình đặt hàng đáp ứng.
10. [Tổ máy TG220P] Bộ sạc ắc quy — HSMT yêu cầu: Bộ sạc ắc quy tự động. Cần: Xác nhận cấu hình đặt hàng đáp ứng.
```

## Rủi ro còn lại
- Phân loại do mình chọn; một mã order/document Khoa coi là model thì đổi 1 dòng trong `KIND`. Mã "Loại máy" (genset_type) gom cả "Máy phát điện diesel, 3 pha" thành order — ổn với HSMT hiện có nhưng có thể che "diesel" (model).
- confirm không bị phạt khi xếp hạng: cấu hình có nhiều điểm order/document chưa ghi xếp ngang cấu hình có ghi đạt. Trên 12 gói không đổi thứ tự nào; gói khác có thể đổi.
- Kết quả configmatch cũ trên web chưa có `rfq`/confirm cho tới khi Gợi ý lại hoặc check lại (web cũ vẫn hiện như trước, không lỗi).
- Tiến trình `config-bot.mjs run` đang chạy giữ code cũ: sau khi gộp phải đợi nó thoát.

## Quay lui
Revert PR #502 (một commit). Không đổi dữ liệu nào trên web; configmatch ghi bằng code mới có `status: "confirm"` và `rfq` — web cũ sẽ hiện chip trống ở các ô confirm (CFG_STATUS không có khoá), Gợi ý lại bằng code cũ xoá chúng.

## Chưa kiểm được
- Chưa chạy `check --dir` đầy đủ trên thư mục lượt cũ (dry-*) — đo bằng ánh xạ 12 configmatch như brief cho phép.
- Chưa xem trên Vercel preview thật (không đăng nhập); chỉ thử web cục bộ với dữ liệu giả lập DB.
CI sau sửa theo điều phối (f4ab3db, run 42840028667): app pass 1m9s, server pass 14s, suppliers pass 12s.
CI PR #502 lần đầu (run 42839402958): app pass 54s, server pass 14s, suppliers pass 16s; Vercel bỏ qua build (Ignored Build Step), Supabase Preview skipping.
