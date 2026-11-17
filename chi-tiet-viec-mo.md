# Chi tiết các việc còn mở — 17/11/2026

Bổ sung cho `so-dieu-phoi.md` (sổ chỉ ghi một dòng mỗi việc). Ghi lúc main = 38a1bb16 (sau #839). Việc khép thì xoá mục ở đây cùng lúc xoá dòng trong sổ.

Thứ tự làm (Khoa duyệt): **1 → 2 → 3**, các việc còn lại làm xen khi rảnh. Ba việc 1, 3 (và 7) cùng sửa `web/catalog.js` nên làm lần lượt, không song song.

---

## 1. Thương hiệu ≠ nơi sản xuất (động cơ, đầu phát, bộ điều khiển) — LÀM TIẾP

**Khoa chốt (16–17/11, bộ nhớ `config-suggest.md`):**
- HSMT đòi G7 / G20 chỉ cho **bộ phận** (37/928 gói) → đọc dòng đó ghi **thương hiệu** hay **nơi sản xuất**, tuỳ đó mà xét.
- Đòi nơi sản xuất:
  - Dòng nguồn ghi rõ nhà máy TQ (DCEC, CCEC, SME, Perkins China, 潍柴博杜安, MTU Yuchai, Stamford (China), 无锡斯坦福, 福州利莱森玛…) → **không đạt**.
  - Ghi hàng nhập / nhà máy G7 ("Imported Cummins", "UK Perkins", 日本三菱, 瑞典沃尔沃, 德国MTU…) → **đạt**.
  - Không ghi (đa số) → giữ, gắn **"cần xác nhận nơi sản xuất"** (CO). Không đoán theo model.
- Gói **Xuất xứ TQ**: hãng ngoại mà dòng ghi rõ nhà máy TQ tính là **sản xuất tại TQ** (thay quyết định 29/10). Được cộng như hãng TQ.
- Nơi sản xuất mặc định theo hãng (khi dòng không ghi), Khoa chốt:

| Hãng | Bộ phận | Tính là | Căn cứ |
|---|---|---|---|
| Deep Sea (DSE) | BĐK | G7 (Anh) | Hãng: chỉ SX ở Anh |
| Stamford | Đầu phát | G7 (Anh) | Khoa chốt; hãng có nhà máy Vô Tích (TQ), Ấn Độ |
| Leroy-Somer | Đầu phát | G7 (Pháp) | Khoa chốt; hãng có 7 nước gồm Phúc Châu |
| Mecc Alte | Đầu phát | G7 (Ý) | Khoa chốt; hãng có Ý, Anh, Ấn Độ, TQ |
| Datakom | BĐK | G20 (Thổ Nhĩ Kỳ) | Khoa chốt; nguồn chỉ nói nhà máy Istanbul |
| ComAp | BĐK | EU (Séc) | Khoa chốt; nguồn chỉ nói thiết kế ở Praha |
| DEIF | BĐK | EU (Đan Mạch) | Hãng: chỉ SX ở Skive |
| Woodward easYgen-1500 / 2000 / 3000 / 3000XT | BĐK | EU (Ba Lan) | Hãng: Kraków. easYgen-800 có thể làm ở TQ (chưa xác minh) → cần xác nhận |
| AvK | Đầu phát | EU (Romania) | Hãng: chỉ SX ở Craiova |
| Marathon, SICES, Lovato, DynaGen | | Cần xác nhận | Nguồn hãng không nói / bị chặn |
| SmartGen | BĐK | TQ | Hãng TQ |

Dòng nguồn ghi rõ nhà máy TQ luôn thắng mặc định (vd. "Stamford (China)" → TQ).

**Dữ liệu đã có:**
- Báo cáo tra nhà máy (nguồn hãng, URL, câu trích nguyên văn, kiểm 16/11): `nghiem-thu\noi-san-xuat\tra-nha-may-hang.md`.
- Quét dòng nguồn có ghi nơi SX không (trên main 38a1bb16): `nghiem-thu\noi-san-xuat\quet-dong-nguon-dong-co.txt` (động cơ), `quet-dong-nguon-dp-bdk.txt` (đầu phát, BĐK). Ví dụ: Cummins NCC TQ 1.940 dòng ghi TQ (CCEC / DCEC), 365 ghi nhập, 8.343 không ghi; Perkins 69 ghi "Perkins China"; Mitsubishi 169 ghi SME; Baudouin 11 ghi 潍柴博杜安; Stamford 125 ghi TQ.
- Script đo (chạy `node <script> <worktree>`): `nghiem-thu\noi-san-xuat\script\` — `noi-sx.mjs`, `noi-sx-dp.mjs` (quét dòng), `dem-g7.mjs` (đếm gói theo `originOfHsmt` phạm vi / căn cứ), `do-gop.mjs` + `cmp-gop.mjs` (top 30 ứng viên toàn bộ gói, main ↔ nhánh; dữ liệu `genbid-test\noi-chuan-hoa\bidhist.json`, `GENBID_SPEC_NORM=1`), `pick10.mjs` + `cmp-d10.mjs` (chọn và soi 10 gói đổi nhiều nhất).

**Các bước (một nhánh, worktree mới từ origin/main):**
1. **Dữ liệu nhà máy theo hãng**: lưu trang nguồn (như `savePages`), thêm trường nhà máy / nơi SX vào hồ sơ hãng (`suppliers/cn/<hãng>.json`: comap, deep-sea-electronics, mecc-alte, marathon-generators, stamford-avk-china…; hãng chưa có hồ sơ thì thêm), sửa `schema.json` + `verify.mjs` kiểm câu trích có trong trang đã lưu. Mặc định Khoa chốt ghi kèm "Khoa chốt 16/11" khi nguồn không nói thẳng.
2. **Nhận nơi SX từng dòng** (`web/catalog.js`): dấu hiệu nhà máy TQ (DCEC, CCEC, SME, Perkins China, 潍柴博杜安, MTU Yuchai, 无锡斯坦福, 福州利莱森玛, "(China)") ↔ dấu hiệu nhập / G7 (Imported, 进口, UK / 英国, 日本, 瑞典, 德国, 美国…). Có cả hai → không rõ. Lấy từ dòng bảng, tiêu đề cột, tên trang (như `RANK`). Mỗi bản ghi danh mục có `madeIn: "cn" | "g7" | … | null` kèm câu trích.
   - Bẫy: tên trang kiểu "进口康明斯系列_帕金斯系列_..._合资康明斯系列" ghi cả nhập lẫn liên doanh → không rõ (đã thấy ở sanq-power).
3. **Đọc HSMT**: `originOfHsmt` / `basisOfLine` (`suppliers/config-bot.mjs` dòng ~170–313) đã có `scope` (genset / parts) và `basis` (brand / origin). Cần tách theo **từng bộ phận** (động cơ / đầu phát / BĐK có thể ghi khác nhau).
4. **Lọc ứng viên + chấm**: `candidates` (lọc G7 / G20 khi `partsOnly`), mã `engine_origin` / `alt_origin` / `ctl_origin` (`reqcodes.mjs`): căn cứ "origin" → CN = không đạt, G7 = đạt, không rõ = "cần xác nhận" (tài liệu). Căn cứ "brand" → giữ như hiện nay.
5. **Xuất xứ TQ**: `cnMade` / `originOf` coi bản ghi `madeIn: "cn"` của hãng ngoại là hàng TQ (ưu đãi +250 như hãng TQ).
6. Test dòng thật cho từng nhánh (TQ / nhập / không ghi / cả hai) + test HSMT thương hiệu vs nơi SX.
7. **Đo trước khi merge**: top 30 ứng viên toàn bộ gói (`do-gop.mjs`), số gói đổi, soi tay 10 gói đổi nhiều nhất (chú ý 37 gói chỉ đòi G7 / G20 bộ phận, và gói Xuất xứ TQ có hãng ngoại làm ở TQ). Không bất thường → nghiệm thu `nghiem-thu\noi-san-xuat.md` → PR → merge; có thì trình Khoa.

**Rủi ro đã biết:** Cummins 6BT / 6CTA (đa số DCEC) hiện qua lọc G7 / G20 theo thương hiệu sau #839; việc này sẽ đưa chúng về "cần xác nhận" hoặc "không đạt" ở gói đòi nơi SX.

---

## 2. Nhãn "Công suất chưa xác nhận" trên thẻ cấu hình — XONG #842 (17/11)

- Khoa 17/11: "ok làm". Mục công suất kết quả "chưa rõ" (nguồn chỉ ghi một số, không rõ Prime / Standby) → nhãn nổi trên đầu thẻ cấu hình.
- **Chỉ hiển thị**, không đổi thứ hạng, không đổi dữ liệu.
- Sửa `web/index.html` (chỗ vẽ thẻ cấu hình); test static + thử Playwright (thẻ có / không có nhãn, điện thoại 375 px).
- Làm sau việc 1 hoặc song song (khác tệp), model Sonnet đủ.

---

## 3. "Model" rác trong danh mục — sau việc 1

- Ô không phải mã máy lọt `isCode` / bảng ngang thành bản ghi động cơ: "≤6S", "≤5S", "6-cylinder/inline", "12-cylinder/V-type", "1-PHASE", "100% copper", "800(KW)", "330(KW)", "195(g/kw.h)", "300 W", "330+250 W", "Container 20'". Mã đầu phát "LTP224S-52/60", "BW-274E" đọc thành động cơ.
- Cách sửa: loại dạng có đơn vị trong ngoặc, %, ≤, "-cylinder", PHASE, "W" sau số; đầu phát nhầm cột sửa chỗ chọn cột.
- Đo trước / sau: số model bị loại, model thật bị loại nhầm (phải 0), top 30 ứng viên toàn bộ gói. #839 đã cho một số model rác (vd. "800(KW)", "1-PHASE") thành "chưa rõ hãng".

---

## 4. Soát ngưỡng HSMT do code đọc trên toàn bộ kho — XONG #844 + #850 (17/11; "thiếu" 664 → 274, `nghiem-thu\soat-nguong-2.md`, `soat-nguong-3.md`)

- Khoa 17/11 (ghi từ KAYENGRAM): `node suppliers\hints-audit.mjs --texts "C:\Projects\GenSet Pro\genbid-work\specs" --out "C:\Projects\GenSet Pro\genbid-work\dieu-phoi\nghiem-thu\soat-nguong.json"`. Không tốn agent, không ghi web. Chạy trên máy có `genbid-work\specs` đầy đủ.
- Mục "LỆCH": mở dòng HSMT, xem code hay Phân tích sai; code sai thì sửa `powerRead` / `engineMins` + ca test dòng thật. "THIẾU" chỉ đếm.
- 40 gói mới nhất đã soát: lệch 2 (sửa #820, #822), thiếu 14 (`nghiem-thu\soat-nguong-disp.md`).

---

## 5. Mâu thuẫn số liệu depco-power (#806) — Khoa: "xử lý sau"

- 130 ca mâu thuẫn trong `quality --check` từ dữ liệu depco-power (baseline đã ghi lại ở #813).
- Sửa ca **đọc sai** (vd. 4006-23TAG3A số xi lanh "6,8L"); ca **nguồn ghi lệch** thật → luật số đông (≥3 NCC và gấp ≥3 lần mỗi giá trị khác), còn lại để "chưa rõ".
- Script liệt kê: `nghiem-thu\noi-san-xuat\script\depco.mjs <worktree> [id NCC]`.

---

## 6. Các việc nhỏ trong sổ (chưa giao)

| Việc | Chi tiết / chỗ xem | Ai làm được |
|---|---|---|
| Đánh dấu 6 hồ sơ NCC nghi thương hiệu cấp phép | himoinsa-china, hipower, aksa-china, agg-fuzhou, cat-tianjin, bruno-generators; quy tắc "cần xác nhận" Khoa chốt 13/11 | Sonnet |
| 10 ca `todo` trong `suppliers/domain.test.mjs` (#622) | Bảng `nghiem-thu\test-review.md`; chờ Khoa duyệt bảng rồi mới sửa | Sonnet |
| BCĐG | IB2600354007 kết luận rỗng (mình hạng 2) chưa đối chiếu; "fetch failed" khi đăng sau OCR dài. `nghiem-thu\bcdg-3.md`, `bcdg-4.md` | Sonnet |
| Log lượt bot thật | #605 (agent giá giữ mức xếp cũ), #547 (`savePages`), #573 (`gaps.mjs` sau lọc NCC loại trừ): chưa có lượt thật | Haiku |
| Kiểm bằng mắt trên Vercel | Các PR web từ #239; cần trình duyệt đã đăng nhập | Sonnet |
| Phủ test còn mở | (1) Back / quẹt trên điện thoại thật sau #691; (2) gói bấm Gợi ý giá 11–13/11 cần bấm lại (#690); (3) luật tên gói chưa nhận "Diezel" (IB2400069058), sửa cả 3 nơi; (4) Khoa thêm website `xcmg-doosan-engine`, `mtu-yuchai`; (5) lượt Sync / lịch sử / nhà thầu thật đầu tiên của bot mới; (6) nhánh `server/`, tải tệp báo giá / HSMT dự án, Forward sau Back từ link thẳng | Khoa / Sonnet |
| Sót từ đợt chuẩn hoá | Tiêu hao khí thật của lees-power (bảng lệch cột); 1 dòng tecnogen mất số xi lanh sau #784 | Sonnet |

---

## Chờ Khoa
- Không còn câu nào (dải mặc định dung tích 0,4–100 L / 400–100.000 cc: Khoa 17/11 "giữ").

## Không làm (Khoa đã bảo BỎ) — xem mục cùng tên trong sổ
