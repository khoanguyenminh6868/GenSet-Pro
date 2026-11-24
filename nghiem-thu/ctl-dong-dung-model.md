# ctl-dong-dung-model: dòng BĐK nêu mã ngoài sheet (phương án A, 24/11/2026)

Nhánh `ctl-dong-dung-model` (worktree `wt-ctl-dong-dung-model`, từ `origin/main` bf6ca0fd). PR NHÁP. Sửa `suppliers/config-bot.mjs` (`controllerSheetFacts`), thêm `suppliers/ctl-dong-dung-model.test.mjs`, một dòng bẫy ở `suppliers/CLAUDE.md`.
Danh sách ĐỦ từng dòng đổi (model, loại theo báo cáo soát, nguồn, chữ dòng): `ctl-dong-dung-model.tsv` cùng thư mục (197 dòng, đều là dòng BỊ BỎ khỏi model đó).

## Luật mới
Dòng không có mã nào thuộc sheet mà nêu mã BĐK lạ (sau khi bỏ tên họ `isSeries` và `easYgen-N000`):
- mã là đầu / đuôi khoá của model trong sheet ("HGM6120" → 6120N/NC/CAN, "HGM9320MPU" → HGM9320, "HGM6110" → 6110N/NC/CAN) → chỉ gắn model đó; KHÔNG mở phạm vi mới, không đổi `scope`;
- còn lại ("DKG-317", "HGM9520N", "HGM9420LT", DSE8610 trong tờ DSE8660…) → bỏ đúng dòng đó.
Hai lần làm hỏng ở bản đầu (đã bỏ): (1) mã tiền tố kích hoạt luật "dòng tiêu đề mở phạm vi" → HGM9310 mất 767 dòng thường; (2) bỏ kéo theo dòng nối tiếp → mất 961 dòng thường. Bản cuối chỉ bỏ ĐÚNG dòng có mã lạ.

## Số liệu (so bản gốc cùng `cn/`: 68.570 → 68.373 dòng `controller:*`, −197 dòng-model)
| Loại báo cáo soát | trong TSV | bị đổi | còn |
|---|---:|---:|---:|
| a1 | 57 | 43 | 14 |
| a2 | 32 | 32 | 0 |
| b | 108 | 76 | 32 |
| c | 188 | **0** | 188 |
| d | 18 | 16 | 2 |
| ngoài TSV | – | 30 | – |
Tổng 197 = 43 + 32 + 76 + 16 + 30. Không dòng nào được THÊM vào model khác (dòng gắn lại cho HGM6120* / HGM9320… đã có sẵn ở model đó, nên chỉ thấy dòng bị bỏ). c không mất dòng nào.

**a1 còn 14** (không phải lỗi của luật): "for HGM6100CAN, press start key…", "only suits for HGM6100CAN…", "Custom Theme … HGM6100CAN" (3 dòng × 4 model N / NC) và "Only HGM6100N has these" (6110CAN / 6120CAN). `HGM6100CAN` / `HGM6100N` khớp `isSeries` (`^HGM\d{2}00`) nên coi là họ cả sheet. Báo cáo soát liệt kê `HGM\d\d00(N|U|CAN|A)?` là họ đúng với "HGM6100N SERIES" nhưng "HGM6100CAN" là nhánh con. Không mở rộng theo chỉ dẫn; nếu cần: nhánh CAN → 6110CAN / 6120CAN, nhánh N → mơ hồ (d: tờ không nói NC thuộc N hay CAN).

**b bị bỏ 76 (giải thích)**: đều là dòng tham chiếu sản phẩm / tài liệu khác tên mã lạ: deep-sea 1001 / 1004 / 1005 / 1010 / 1011 / 1020 / 1027 / 1031 / 1035 / 1036 / 1038 (hàng bảng "Related products": "| DSE7310 MKII | Auto Start Control Module | 7310-03", DSE6110 / 6120 MKIII, DSE8003…) 52 dòng; deif 1001 / 1004 (danh sách liên kết "• AGC-4 …", "• AGC 150 …") 6; smartgen 1003 / 1004 / 1006 / 1012 / 1013 (mục lục "5.6.2 HGM9610 Switch Control Procedures", câu "features of HGM9210/…/HGM9620 may change") 13; comap 1020 InteliVision 1; woodward 1001 "ToolKit-SC … easYgen-100 and –1000" 4. Báo cáo gọi chúng "vô hại"; mất khỏi `controllers.md` là mất thông tin tham chiếu, không mất bằng chứng chức năng. **b còn 32**: dòng có tên họ (HGM6100U, HGM9500, HGM6500), giữ vì `isSeries`.

**d bị bỏ 16 (CẦN XEM)**: DSE8660 ×3 / DSE8620 ×4 / DSE8680 ×2 (ô cột PDF trộn tên DSE8610), HGM9310 ×2 / HGM9320 ×1 ("HGM9320MPU, HGM9320CAN without") và **DSE7570 ×4** ("| RS232 | DSE8610 MKII Com Port", "Communications": có thể là cổng của chính DSE7570). Theo báo cáo "A mở rộng" mới bỏ d, nhưng không có cách máy phân biệt a với d: mã lạ thì bỏ. Hệ quả cụ thể: DSE7570 mất hai dòng RS232 (xem ctlShows dưới).

**30 dòng ngoài TSV (giải thích)**: dòng nối tiếp câu (chữ thường đầu dòng / dòng ngắn) của dòng có mã lạ: "when mains indicator illuminates, “Stop Delay” begins.", "and its indicator illuminates. Under this mode,", "| press | to start genset…" (câu "HGM6120:" nằm ở tờ HGM6110* nay đi theo 6120*; 18 dòng 6110*), "about mains." (3 dòng 6120* — câu "HGM6110: …" nay đi theo 6110*), HGM9310 6 dòng ("and LCD display count down time…", "voltage “Normal delay”…", "| Open | Can"…) và HGM9320 3 dòng ("initiated;", "items in configurable ports…"). Đúng vì chúng là phần đuôi của câu của model kia; mỗi dòng đã có ở model đúng (không dòng nào mất khỏi sheet).

## Model đổi số dòng (`controller:*` của modelFacts = factsFor, cùng giá trị trừ hai ca)
trước → sau: INTELIDRIVE 184→183, DKG307 2051→2049, DSE7310MKII 457→455, DSE7320MKII 464→462, DSE8610MKII 327→323, DSE8660MKII 329→318, DSE8620MKII 177→171, DSE7220 102→99, DSE8680 488→461, DSE7570 128→121, DSE8003MKII 108→105, AGC150 1424→1421, AGC4 1589→1586, HGM6110N 1495→1484, HGM6120N 1194→1184, HGM6110NC 1191→1180, HGM6120NC 1194→1184, HGM6110CAN 1191→1180, HGM6120CAN 1193→1183, HGM9510 2847→2845 (`factsFor` 6189→6184, tính cả đời), HGM9530 2415→2413 (5748→5743), HGM9510N 3342→3339, HGM9530N 3333→3330, HGM9610 1793→1791, HGM9620 2263→2261, HGM9420N 3271→3261, HGM9310 2296→2282, HGM9320 2295→2280, HGM9520 2349→2346, EASYGEN1400 205→204, 1600 218→217, 1700 203→202, 1800 218→217. 78 model, 45 không đổi.
`ctlKinds` trước / sau: 65 model, GIỐNG HỆT (đọc `specTables`, không đọc `modelFacts`); không model nào đổi loại.

## ctlShows (bằng chứng cổng truyền thông, 7 chức năng con × mọi dòng `controller:*`)
Dòng nhận 3.435 → 3.421, mất đúng 14 = đúng 14 dòng báo cáo soát nêu (CAN 10: HGM9310 ×4 + HGM9320 ×6 dòng "HGM93x0MPU(CAN)…"; RS232 2: DSE7570; 4G 2: HGM9420N "LT-S04 / S05"). Thêm 0. Sau A không còn dòng a1 / a2 nào được `ctlShows` nhận → KHÔNG sửa `ctlShows` (không làm B / C). Ngoại lệ cần ý Khoa: hai dòng RS232 của DSE7570 là loại d, có thể là cổng của chính nó; nếu muốn giữ thì phải cho DSE7570 một ngoại lệ riêng (báo lại, không tự làm).

## Chạm `candidates`
`candidates` KHÔNG đọc nội dung dòng `controller:*` (chỉ đếm có / không datasheet, config-bot.mjs ~1920; `ctlCands` đọc `sheetModel` và `kind`). `modelFacts` đổi nhưng số khoá `controller:*` và `sheetModel` không đổi (78 model như cũ) → không kỳ vọng đổi top 30; không đo (đúng chỉ dẫn). Đường bị ảnh hưởng thật: `catalogMd` (`controllers.md` cho agent, ít dòng sai hơn), `commEval` / `commWords` (ctlShows, trên) và `factsFor`.

## Kiểm
- `node --test suppliers/ctl-dong-dung-model.test.mjs`: 6 ca, lấy bảng THẬT của `cn/` (datakom 1002 DKG307 không nhận "applicable only to DKG-317"; smartgen 1001 HGM6110* ↔ HGM6120* đúng chỗ, họ "HGM6100N series" còn đủ; 1005 HGM9510N / 9530N không nhận "Only available for HGM9520N"; 1012 HGM9310 ↔ 9320) + một bảng dựng tay.
- Toàn bộ `suppliers/*.test.mjs` (gồm `ctl-amf`, `ctl-twin`, `ctl-module`, `ctl-option`, `no-line-cap`, `regress-config`): xem kết quả ở phần cuối báo cáo này (cập nhật sau lần chạy).
- Soát lại script `dong-khac-model\dung-lai.mjs`: không chạy lại (dùng bản chụp so TSV bằng `modelFacts` trước / sau trên cùng `cn/`). Còn a1 14 (trên) + a2 0; mọi dòng còn lại nêu mã BĐK lạ nằm ở họ hoặc nhánh họ.

## Giới hạn
- Luật không phân biệt a với b / d: mọi dòng có mã lạ bị bỏ; thông tin tham chiếu của b mất khỏi `controllers.md`.
- Dòng nối tiếp của dòng bị bỏ (ngắn, chữ thường) vẫn vào phạm vi cũ như trước PR này (không kéo theo).
- Chỉ bắt mã `controllersIn` nhận ra; dòng "only for the CAN version" không nêu mã, hoặc mã lạ chưa có trong danh mục, không đổi.
