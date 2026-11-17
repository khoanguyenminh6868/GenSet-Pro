# Nghiệm thu: "model" rác trong danh mục (việc 3)

- PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/871. Nhánh `model-rac`, worktree `wt-model-rac`, đã rebase lên origin/main d1079f05.
- Tệp đổi: `web/catalog.js`, `suppliers/spec-read.test.mjs` (+2 test), `web/CLAUDE.md` (+1 bẫy).

## Sửa gì
1. `isCode` loại ô là GIÁ TRỊ: ≤/≥/~ đầu ô, `%`, `[ ]`, `-cylinder`, `In-line`, `Container`, `m3/s`, `Qty`, `cSt`, `gal/h`, `PHASE` (cả "3-PHASE", "single phase"), số + đơn vị (`800(KW)`, `195(g/kw.h)`, `208g /kwh`, `300 W`, `330+250 W`, `1800k W`, `12 kg/h`, `50Hz/ 400V`).
2. Bảng ngang: bỏ ghi chú cuối ô ("… made in china", "（…）" toàn góc) trước khi chọn cột. Ghi chú làm ô động cơ trượt `isCode` nên mã đầu phát kế bên bị đọc thành động cơ (bobig `1104C-44TAG2 made in china | BW-274E`).
3. `ALT_CODE` thêm `LTP\d{3}` (landtop) và `BW(C|LV|P)?-?\d` (bobig): tiêu đề không ghi hãng đầu phát, cột "Governor Type" làm `LTP224S-50` bị lấy làm động cơ.
- Đã thử rồi bỏ: tách hậu tố chữ Hán sau mã (cho "MTU 1600系列", "tcu368小时" thành model sai) và luật "mã cuối dòng sau cột động cơ là đầu phát" (đẩy 970 động cơ thật sang đầu phát).

## Đo model (đo thật, `suppliers/cn`, 435 NCC, `build()` trước = main fe1aaf09, sau = nhánh)
| | trước | sau | bị loại | thêm |
|---|---|---|---|---|
| động cơ | 7142 | 6898 | 256 | 12 |
| đầu phát | 2792 | 2813 | 12 | 33 |

- 256 động cơ bị loại = 186 ô rác (kể cả "400V/230V", "50Hz/400V", "[1/min]", "Loading Qty(20GP/40HQ)") + 70 mã đầu phát LTP/BW (cả 70 đã sang danh sách đầu phát, kiểm bằng script: 0 mã không sang). **Model thật bị loại nhầm: 0** (script phân loại 256 mã: 70 LTP/BW → đầu phát, 186 khớp dạng giá trị; không còn mã nào ngoài).
- 12 đầu phát bị loại: "0,11 m3/s"…, "Self-excited,2-pole,single phase", "100% copper", "≤6S", "≤5S", "376(no rad.)": đều rác.
- 12 động cơ thêm (thật): KD477, 3TNM74F, KTA38, CP460, CP690, LA170FG, 4TNV88GLE/GTE, 1106A70ATG4, MCP12080, Q401AUS80, KOHLER4252 (trước bị "1-PHASE" / ô ghi chú chiếm chỗ).
- 33 đầu phát thêm: 33 mã BW…/LTP… (bobig, landtop).
- Danh sách đầy đủ: chạy `script\models.mjs` / `diff.mjs` (trong scratchpad, đầu ra `model-rac\`); các mẫu đề bài ("≤6S", "≤5S", "6-cylinder/inline", "12-cylinder/V-type", "1-PHASE", "100% copper", "800(KW)", "330(KW)", "195(g/kw.h)", "300 W", "330+250 W", "Container 20'", "LTP224S-52", "BW-274E") đều hết khỏi danh sách động cơ.

## Top 30 ứng viên toàn bộ gói (đo thật; `do-gop.mjs` + `cmp-gop.mjs`, `GENBID_SPEC_NORM=1`, 928 gói, 1093 lượt cỡ máy)
Tệp: `model-rac\gop-main.json`, `gop-nhanh.json`, `cmp.txt`, `explain.txt`, `dist.txt`.
- lỗi 0; giống hệt 412; đổi thứ tự thuần 0; đổi tập 681 (dòng vào 1026, dòng ra 1007); hãng hiển thị đổi 0.
- Đổi vì bobig-power: 761 dòng mới đều là bobig có đầu phát `BW…` (trước đó dòng bobig thiếu đầu phát hoặc đứng với động cơ sai), 193 dòng bobig cũ ra (66 có "động cơ" là BW/LTP, 25 đầu phát rỗng). Còn lại: victory-generator (57 vào), 173 dòng ra có model rác (ví dụ động cơ "1-PHASE"…).
- Mức đổi: 430 gói chỉ 1 dòng mới, 173 gói 2, 60 gói 3, 15 gói 4, 2 gói 5. Dòng mới cao nhất ở hạng 1–10: 207 gói; 11–20: 246; 21–30: 227.
- Soi tay: IB2200001635#0 chỉ thêm `bobig|4BTA3.9-G13|BW224G` ở hạng 22, đẩy dingbo hạng 30 ra. IB2200004914#0: dòng bobig `6BTAA5.9-G12` trước thiếu đầu phát, nay có `BW-274E`. IB2200006257#0/#1 (victory-generator): "SELF-EXCITED,2-POLE,SINGLE PHASE" từng bị đọc thành đầu phát, nay bỏ.
- Chưa đối chiếu từng gói trong số 681: lý do đổi đã quy được về nhóm bobig / victory / model rác; không có hãng hiển thị đổi.

## Kiểm
- `node --test suppliers/`: tests 945, pass 945, fail 0 (sau rebase).
- `node --test web/test/static.test.mjs web/test/spec-norm.test.mjs`: pass 159, fail 0.
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".
- Playwright / giao diện: không chạy (chỉ đổi `catalog.js`, không đổi `index.html`).

## 3 mẫu đối chiếu nguồn (bảng trong `suppliers/cn/<id>.json`, trang gốc)
1. bobig-power, bảng n=101 (https://www.bobigpower.com/): dòng `| BP110 | 80 | 100 | 88 | 110 | 1104C-44TAG2 made in china | 81 | BW-274E | …`, cột "Engine model" = `1104C-44TAG2`, cột đầu phát BW-274E. Trước: BW-274E là "động cơ"; sau: động cơ 1104C-44TAG2, đầu phát BW-274E (test `spec-read.test.mjs`).
2. landtop-fuzhou, bảng n=117 (https://www.landtop.cn/news.html): header `Genset Model | … | Governor Type | Engine Model | Alternator Model`, dòng `| LTP69KF | 69 | 55 | 63 | 50 | Mechanical | LTP224S-50`. Sau: không có động cơ, đầu phát LTP224S-50.
3. green-power-generators, bảng n=129 (https://www.greenpowergen.it/): dòng `| GP6000 SM/LDE | 1-PHASE | 5.5 | / | KOHLER KD15440 | …`: cột "TIPO TYPE" = 1-PHASE không còn làm động cơ; động cơ là KOHLER KD…

## Rủi ro và quay lui
- `ALT_CODE` thêm LTP/BW là theo tên hãng (landtop, bobig): NCC khác dùng tiền tố này cho động cơ sẽ bị đọc sai (hiện không có trong `suppliers/cn`). Quay lui: revert PR; không đụng dữ liệu NCC.
- Thay đổi thứ hạng Gợi ý cấu hình (bobig thêm vào top) là hệ quả đọc đúng cột, không phải sửa điểm.
- Rule bỏ ghi chú chỉ áp trong bảng ngang chọn cột (`cells` của nhánh bảng), không áp bảng nhãn.

## Việc chưa kiểm được / ngoài phạm vi
- Ô vẫn lọt isCode nhưng không có trong danh sách đề bài (ví dụ "4AW", "4BW", "4DW", "(YD485D)", "LSA51.2S6)", "Endress 175/E", "ZH4100D/30,1 KW"): chưa chắc là rác nên để nguyên.
- Script đo cũ (`noi-san-xuat\script\do-gop.mjs`) không lưu kết quả từng gói, mất điện phải chạy lại từ đầu (~2 giờ cho 1093 lượt). Bản tiếp tục được: `model-rac\script\do-gop.mjs` (ghi `<out>.part`, chạy lại bỏ qua gói đã xong); chưa thử mất điện thật.

## Cần ghi nhớ
- Khoa 17/11: ghi kết quả từng gói khi đo dài để mất điện chỉ chạy lại gói chưa xong (đã làm trong `model-rac\script\do-gop.mjs`).
- Việc depco (cùng sửa `catalog.js`) có thể làm sau khi PR này merge.
