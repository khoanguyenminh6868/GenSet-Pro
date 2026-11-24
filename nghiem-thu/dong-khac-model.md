# Dòng fact BĐK nêu model khác (soát, chỉ đọc; 24/11/2026)

Main `8832317f` (có #1148 `af428439` + #1154). Không sửa mã, dữ liệu; script ở `genbid-work\dieu-phoi\dau-vao\dong-khac-model\`
(`dung-lai.mjs` dựng, `ngu-canh.mjs` lấy 2 dòng trước / sau trong `suppliers/sources`, `dung-duoc.mjs` đo chỗ dùng, `xep-loai.mjs` xếp loại,
`fixture-tim.mjs` tìm trong lượt thật). TSV đủ mọi dòng: `nghiem-thu\dong-khac-model.tsv` (403 dòng: model gắn, model dòng nêu, nguồn,
số dòng trong tệp nguồn, mới / cũ, loại, chức năng `ctlShows` nhận, chữ dòng, căn cứ, ngữ cảnh).

## 1. Dựng lại danh sách

`modelFacts` trên `cn/` hiện tại: 68.570 dòng fact `controller:*`. Lấy dòng mà chữ dòng nêu ít nhất một mã BĐK (`CAT.controllersIn` + dãy
"HGM6120N/6120NC", "DSE6010/20", như `ctlNames` của config-bot) và KHÔNG mã nào là model gắn, đời của nó (DSE7320 ↔ DSE7320 MKII) hay bản
không chữ (HGM6110 ↔ HGM6110N). "Mới" = khoá `key|supplierId|n|line` không có trong `modelFacts` của `af428439^` (trước #1148).

- **403 dòng-model** (196 chữ dòng khác nhau, 45 model gắn): **132 mới do bỏ trần**, 271 có từ trước (cũ).
- 132, không phải 146 của PR 2: 14 dòng trong TSV của PR 2 là dòng nêu CHÍNH model gắn dưới dạng khác (HGM6110N nhận "HGM6110 without." / "HGM6110, there are no
  items 1-5"; HGM9530N nhận "HGM9510N/9530N controller …"; HGM9310 nhận "(HGM9310MPU, HGM9310CAN without)"), nên không tính. Mọi dòng mới của tôi nằm trong 146.
- Theo hãng (mới / cũ): smartgen 125 / 180, deif 6 / 0, datakom 1 / 1, deep-sea 0 / 65, woodward 0 / 24, comap 0 / 1.
- Theo tài liệu: smartgen 1001 (HGM6100N) 44 c + 41 a1 + 15 a2 + 5 b + 2 d; 1002 (6100U) 44; 1003 / 1004 / 1013 chủ yếu ghi chú; 1005 (HGM9500N) 8; 1006 (9600) 34;
  1007 (7100N) 12; 1008 (7200) 60; 1011 (HGM9420N) 10; 1012 (HGM9310/9320) 20; deep-sea 1036 (DSE8680) 17 …; datakom 1002 2; deif 1001 / 1004 3 + 3; woodward 1001 20, 1002 4.
- Model gắn nhiều dòng sai nhất (a1): HGM6110N 8, HGM6110NC 8, HGM6120N 7, HGM6120NC 7, HGM6110CAN 6, HGM6120CAN 5, HGM9510N 3, HGM9530N 3, HGM9420N 3, HGM9310 3, HGM9320 2, DKG307 2.

## 2. Loại (căn cứ từng dòng: cột `can_cu` + `ngu_canh` trong TSV)

| Loại | Dòng-model | Mới | Cũ | Nghĩa |
|---|---:|---:|---:|---|
| a1 gắn sai, chữ dòng nói chức năng / số liệu CHỈ của model khác | 57 | 17 | 40 | có thể thành bằng chứng cho model không có |
| a2 dòng mô tả / phủ định model khác, sai chỗ nhưng không chứng minh gì cho model gắn | 32 | 19 | 13 | |
| b tham chiếu tài liệu / sản phẩm khác (danh mục, TOC, "features may change…") | 108 | 26 | 82 | vô hại |
| c họ model áp thật cho model gắn ("HGM6100N SERIES", "HGM9600 series", "easYgen-1000 Series") | 188 | 68 | 120 | đúng |
| d không rõ | 18 | 2 | 16 | không suy ra |

**a1 (57 dòng-model, 26 chữ dòng khác nhau), nhóm chính:**
- datakom 1002 → DKG307: "6.27 Password Operation (applicable only to DKG-317CAN/MPU)" và "Applicable only to the DKG-317 model:" (khối tham số P_115… sau đó). Nghĩa ngược. 1 mới, 1 cũ.
- smartgen 1001 (HGM6100N/CAN, tài liệu chung hai bản): "1) HGM6120: When mains is abnormal … Mains Abnormal Delay", "HGM6120: During normal running … Mains Normal Delay", "HGM6120: Manual Mode …",
  "Note: The key is fit for HGM6120 series controllers" gắn cho HGM6110N / NC / CAN (bản chỉ khởi động từ xa, tờ nói "HGM6110 without" ở nhiều dòng khác) → bằng chứng AMF cho bản không AMF.
  Ngược lại "2) HGM6110: When remote start input is active …", "Stop Delay as soon as Remote Start is inactive", "key fit for HGM6110" gắn cho HGM6120*.
  "for HGM6100CAN, press start key …", "only suits for HGM6100CAN with engine type Yuchai-LMB", "Custom Theme … HGM6100CAN" gắn cho bản N / NC (không CAN). "Only HGM6100N has these" gắn cho 6110CAN / 6120CAN (CAN không có). 41 dòng-model (10 mới).
- smartgen 1005 (HGM9500N) → HGM9510N, HGM9530N: "(Only available for HGM9520N.)" ở mục Remote Start (Island), Grid-Tied Track, Island Parallel. 6 dòng, đều mới.
- smartgen 1012 (HGM9310 / 9320 MPU(CAN)) → HGM9310: trình tự MẤT LƯỚI của HGM9320MPU(CAN) ("When Mains is abnormal … abnormal delay", "mains return normal … Normal delay"); tờ tự ghi "In HGM9310MPU(CAN) controller, there are no items of mains". 5 dòng cũ.
  Chiều ngược (HGM9310MPU(CAN) "When Remote Start (on load) is active …" gắn HGM9320) xếp a1 trong nhóm cũ cùng.
- smartgen 1011 → HGM9420N: nhiệt độ làm việc / lưu kho và màn hình của HGM9420LT ("HGM9420LT: (-40~+70)°C", "(-45~+80)°C", "LCD Display (HGM9420LT) …") — tờ ghi hai dòng riêng cho hai biến thể. 3 dòng cũ.

**a2 (32):** "HGM6110 without." / "no items 1-5 in table 7" gắn HGM6120*; "(HGM9310MPU, HGM9310CAN without)", "no mains status screen", "no items of mains" gắn HGM9320; chú thích hình "HGM9310MPU(CAN) typical application diagram" gắn HGM9320 (và ngược lại);
hàng mã đặt 4G băng tần "HGM9420LT-S01…-G" gắn HGM9420N; chú giải "HGM7X20 = All HGM7200 series AMF" gắn HGM7210* (bản ASM); "HGM9510's analog sensors …" trong tờ HGM9520.

**d (18):** DSE8660 (1005) / DSE8620 (1010) / DSE8680 (1026): ô cột PDF trộn tên DSE8610 vào dòng của tờ; DSE7570 (1027) "RS232 | DSE8610 MKII Com Port" là bảng cổng truyền thông CỦA tờ DSE7570 nêu model khác làm mốc
(có thể là cổng của chính DSE7570); smartgen 1001 "Only HGM6100N has these" gắn HGM6110NC / 6120NC (tờ không nói NC thuộc N hay CAN); smartgen 1012 "(HGM9320MPU, HGM9320CAN without)" ở dòng nút Gen Close/Open của HGM9310 (nghĩa phụ thuộc cột bảng).

## 3. Dùng ở đâu, luật nào chặn, lượt thật

Nguyên nhân gốc (đọc `controllerSheetFacts`, config-bot.mjs:756): `keysOf(line)` chỉ giữ mã BĐK nằm trong `sheet` (mã tiêu đề, khoá đủ: HGM6110N …). Dòng nêu mã không thuộc `sheet`
("HGM6120" không chữ, "HGM9520N", "HGM9320MPU", "HGM9420LT", "DKG-317") ra `names` rỗng, rơi xuống `own = goesOn ? prev : scope` = phạm vi trước đó. Vì thế "HGM6120: …" nhận phạm vi vừa mở bởi HGM6110N.

Chỗ đọc dòng fact BĐK:
1. **Agent**: `catalogMd` ghi MỌI dòng vào `controllers.md` dưới "### <model>"; không lọc. Đây là đường chính (agent grep chức năng, trích câu).
2. `CM.ctlShows` / `commWords` / `commEval` (bằng chứng cổng truyền thông): chỉ bỏ dòng có tên mô-đun (`moduleIn`) hoặc tuỳ chọn mở rộng (`EXT`). **Không luật nào chặn dòng nêu BĐK khác.** `modShows` ("third party / replacement", mô-đun khác) chỉ áp cho fact MÔ-ĐUN (`moduleFacts`), không đụng 403 dòng này; đã đo: 0 / 403 dòng nêu tên mô-đun.
   Đo bằng `ctlShows`: 14 dòng-model được nhận làm bằng chứng — CAN 10 (4 a1: "HGM9320MPU(CAN): When Mains is abnormal …" gắn HGM9310; chữ "(CAN)" là hậu tố biến thể, không phải cổng CAN bus), RS232 2 (d, DSE7570), 4G 2 (a2, hàng mã LT-S04 / S05 gắn HGM9420N).
3. `compatModules` (ghép mô-đun theo dòng nêu tên mô-đun): 0 dòng trong 403 nêu tên mô-đun nên không bị ảnh hưởng. `ctlKinds` đọc `specTables`, không đọc `modelFacts`: không ảnh hưởng.
4. `candidates` chỉ đếm có / không datasheet (config-bot.mjs:1920), `ctlCands` loại bộ nếu `sheetModel` trùng bộ chính: không đọc nội dung dòng.

Lượt thật (`suppliers/fixtures/runs`, 5 lượt, 18 tệp): kết quả của agent (`result`) trích đúng **1** dòng trong danh sách, ở lượt IB2600601812, check "Loại bộ điều khiển" của HGM6120N: "HGM6100N series genset controller, integrating …" — loại **c** (họ), đúng. Không lượt nào trích dòng a1 / a2.
Giới hạn: fixture là 5 lượt cũ (13/11) trên bản manual còn trần 700, chưa phải lượt chạy trên dữ liệu đủ dòng; "không thấy trích" không phải bằng chứng rủi ro bằng 0.

## 4. Đề xuất (không làm)

Gốc ở `controllerSheetFacts`; sửa ở đó, không ở từng chỗ đọc.

| Cách | Làm gì | Dòng-model đổi (mới / cũ) | Rủi ro |
|---|---|---|---|
| A (khuyến nghị) | Khi dòng nêu ≥ 1 mã BĐK và không mã nào là model trong phạm vi (cùng khoá, đời, bản không chữ, hay họ `HGM\d\d00…` / `HGM9600` / `easYgen-1000`): không đưa vào `own` của phạm vi. Gắn đúng model nếu mã khớp theo tiền tố (HGM6120 → HGM6120N / NC / CAN) | a1 57 + a2 32 (đúng chỗ hoặc bỏ): 89 (36 / 53) | Phải viết luật họ (không viết = mất 188 dòng c). `HGM6120:` chuyển đúng thì +dòng cho 6120*; đo `factsFor` trước / sau như bước bdk-mo-dun. Đổi `modelFacts` → đo top 30 |
| A mở rộng | A + bỏ luôn b (tham chiếu) và d: 215 dòng-model (64 / 151), 144 chữ dòng khác nhau | + 126 | b là danh mục sản phẩm, mất cũng không hại; d thì chưa rõ nên đừng bỏ trước khi Khoa xem |
| B | Giữ dòng, thêm cờ `other: [mã]` trong `controllerSheetFacts`; `ctlShows` / `commWords` bỏ dòng có cờ; `catalogMd` in dòng đó dưới "### model — dòng nêu model khác" | 215 dòng-model có cờ; 14 dòng hết làm bằng chứng cổng | Ít mất dữ liệu nhất, agent vẫn thấy dòng; không chữa nguyên nhân gốc (dòng vẫn nằm dưới model sai) |
| C | Chỉ chặn ở `ctlShows` (dòng nêu mã BĐK khác không tính) | 14 dòng-model | Nhỏ nhất, nhưng bảo vệ chỉ đường cổng truyền thông, không bảo vệ chức năng khác agent đọc trong `controllers.md` |

Tệp sẽ sửa (A / B): `suppliers/config-bot.mjs` (`controllerSheetFacts`, `catalogMd` nếu B), `suppliers/ctl-module.mjs` (`ctlShows`), test `cover-config.test.mjs` (đã có test `controllerSheetFacts`), `ctl-module.test.mjs`; thêm test trên dữ liệu thật (HGM6110N không có "HGM6120: When mains …", DKG307 không có "applicable only to DKG-317", HGM9510N / 9530N không có "Only available for HGM9520N", HGM9310 không có trình tự mất lưới của 9320MPU(CAN)).
Bẫy cho `ctlKinds` (a): đổi gán dòng KHÔNG đổi `ctlKinds` (đọc `specTables`), nhưng đo lại 65 model như PR 2.

## Giới hạn của soát này

- Chỉ bắt dòng nêu mã BĐK `controllersIn` nhận ra. Dòng kiểu "only for the CAN version" không nêu mã, hoặc mã lạ, không có trong 403.
- Dòng cắt ô bảng (PDF) có thể mất ngữ cảnh trong nguồn; 2 dòng trước / sau lấy từ `.md`, không từ PDF.
- Xếp loại là soát tay theo luật trong `xep-loai.mjs` (đọc từng nhóm chữ dòng + ngữ cảnh, không đọc từng dòng một khi cùng mẫu lặp); 18 dòng d giữ không suy ra. Tên model đời (MKII) và họ do tôi so khớp tiền tố, không phải luật của code.
- Chưa đo `factsFor` trước / sau cho Cách A, chưa đo top 30.
