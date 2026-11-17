# Nghiệm thu: Gán hãng động cơ / đầu phát — 17/11/2026

Nhánh `gan-hang` (worktree `wt-gan-hang`). Khoa duyệt 16/11 (vế 1 + vế 2 kiểu b + luật số đông), duyệt merge 17/11 sau khi soi tay 10 gói.

## Đã đổi
- `web/catalog.js`: `keptMakes` trong `finish` của `build`. Chỉ giữ hãng ở mức bằng chứng cao nhất (dòng bảng 3 > tiêu đề cột / hãng tự SX 2 > tên trang 1). Hai tên trở lên ở mức đó: cùng một hãng theo `SAME_MAKER` (Doosan / Hyundai / Daewoo, Weichai / Deutz, Kofo / Ricardo, Baudouin / Weichai, FAWDE / Xichai) thì giữ cả; không thì luật số đông (một hãng ≥3 NCC và gấp ≥3 lần mỗi hãng khác, kèm tên cùng hãng với nó); còn lại không hãng, `makeConflict: [{name, suppliers}]`. `makes` là bản đã lọc (make, originOf, groupOf đọc từ đây), `makesAll` giữ mọi hãng nguồn ghi.
- `suppliers/config-bot.mjs`: dòng ứng viên trong catalog.md ghi "chưa rõ hãng: nguồn ghi khác nhau A / B" khi `makeConflict`.
- `web/index.html`: chi tiết model trong danh mục ghi "Chưa rõ hãng: các nguồn ghi khác nhau (A n NCC, B m NCC)".
- Test: `catalog.test.mjs` (tên trang bị bỏ dưới hãng dòng bảng, cặp cùng hãng, số đông 3:1, 1:1 / 2:1 không hãng); `config-accuracy.test.mjs` (thay test cũ "hai hãng vẫn tính hãng HSMT nêu": Doosan / Hyundai được cộng điểm hãng, Perkins / Lovol 1:1 không, Perkins 3:1 có).
- `suppliers/CLAUDE.md`: luật mới; sửa câu nối sai của #833.

## Số đo
Danh mục (main ↔ nhánh, cùng `suppliers/cn`):
- Động cơ có hãng 5.748 → 5.664; hiển thị hai hãng trở lên 184 → 81. Đầu phát có hãng 595 → 583.
- 84 động cơ thành "chưa rõ hãng" (ngang ngửa: K4100ZD Ricardo 1 / Weichai 1, WD129D11 Cummins 1 / Wudong 2, Huachai / Ricardo, model rác "800(KW)", "1-PHASE"…); 12 đầu phát TAL / LSA (Stamford 1 / Leroy-Somer 2).
- 19 động cơ bỏ hãng sai nhờ số đông: 4BTA3.9-G11, QSZ13-G3, 6BT5.9-G1 → Cummins; S12R / S16R / S6R2 → Mitsubishi; YC4A155-D30, YC6MJ → Yuchai; 1006TAG → Perkins. 3 đầu phát TAL → Leroy-Somer.
- 163 động cơ đổi xuất xứ (SDEC SC… "other" → "cn", WP10D238E200…). Lọc G7 / G20: 66 vào (Cummins B / C / QSB, Mitsubishi S, Baudouin M26 / M33 / M55, Perkins 1006), 15 ra (DP086LA khỏi G7, model rác).

Top 30 ứng viên (`candidates`, không agent, `GENBID_SPEC_NORM=1`), 1.093 lượt (928 gói có Chương V, `genbid-test\noi-chuan-hoa\bidhist.json`), main 978d5f24 ↔ nhánh fec6ebf5: y hệt 446, chỉ đổi thứ tự 38, đổi tập 609 (2.128 vào / 2.082 ra). Theo hãng: Weichai +458, Cummins +181, Perkins +151, Baudouin +101; Yuchai −519, FAWDE −248, Ricardo −97.

Soi tay 10 gói đổi nhiều nhất (IB2200023019, IB2200092179, IB2300022940, IB2300074496, IB2300083662, IB2300324220, IB2300366912, IB2500124299, IB2500611943, IB2600194231; chi tiết từng dòng điểm + lý do trong `nghiem-thu\gan-hang-d10.txt`):
- Điểm từng dòng không đổi. Cơ chế: gói không đòi G7 / G20 dành 12 dòng cho hãng TQ (`CN_ROWS`); SDEC SC / Weichai WP nay là hãng TQ, điểm cao, lấp các chỗ đó, đẩy dòng TQ điểm thấp hơn (Yuchai, FAWDE, SDEC 6DTAA / 12GTAA) ra; chỗ hãng ngoài chúng chiếm sai trước đây về Cummins, Perkins, Baudouin, Deutz, Doosan, MTU.
- Gói G7 / G20: Cummins 6BT / 6CTA / 6BTA5.9 (điểm 250–284) vào thay dòng điểm 144–228; "BW-274E" (mã đầu phát đọc thành động cơ) ra.

## Test
`node --test suppliers/` 900 / 0; web static + spec-norm 158 / 0; `quality --check` không xấu đi.

## Rủi ro
- Cummins 6BT / 6CTA phần lớn do Dongfeng Cummins làm ở TQ: nay qua lọc G7 / G20 theo thương hiệu. Việc "thương hiệu ≠ nơi sản xuất" (sổ) xử lý.
- Thứ tự tên trong "A / B" vẫn theo thứ tự gặp; trần mỗi hãng tính theo tên đầu.

## Quay lui
Revert PR.
