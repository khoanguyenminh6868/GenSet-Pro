# Nghiệm thu: số đông DUNG TÍCH, phương án (c), chặng B (19/11/2026)

Khoa duyệt 19/11 qua điều phối: (i) chỉ áp cho dung tích, số xi lanh giữ luật (d); (ii) áp cả cho trần dung tích;
(iii) hồ sơ hãng động cơ / datasheet hãng không gộp; (iv) thứ tự CN_ROWS ↔ PER_SUPPLIER giữ nguyên, không sửa;
(v) +50 bộ điều khiển chỉ thêm câu lý do, không đổi điểm. Cách gộp: C6.

## PR, nhánh, tệp

- Nhánh `so-dong-dung-tich`, gốc 2a1b6ebd. Commit: e66d6e48 (mã + test + fixture), e14ea128 (suppliers/CLAUDE.md).
- PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/939 (chưa merge, chờ Khoa).
- Tệp đổi:
  - `suppliers/config-bot.mjs`:
    - `MAJ_KEYS = {cyl, disp}`.
    - `dispVoters()`: gộp các NCC chép chung bảng mẫu thành MỘT phiếu. Điều kiện gộp:
      - cùng model động cơ;
      - cùng tập giá trị dung tích;
      - có chung ô kích thước tổ máy (lấy trong chữ dòng), không tính ô container ISO.
      - NCC là hãng động cơ, hoặc có fact `sheet` / bảng "Datasheet:", thì đứng riêng, không gộp.
    - `candidates` dùng `dispVoters` cho cả dung tích tối thiểu và trần dung tích.
    - Lý do của +50 bộ điều khiển có thêm câu chữ.
  - `suppliers/cand-disp-c.test.mjs` (mới, 8 test, dòng thật).
  - `suppliers/cand-majority.test.mjs`: 2 test dung tích chuyển sang luật mới.
  - `suppliers/fixtures/so-dong-dung-tich.json` (mới): 63 NCC, 548 dòng thật.
  - `suppliers/CLAUDE.md`: luật mới + bẫy về cách gộp.
- KHÔNG sửa `web/catalog.js`: phần gộp nằm hết ở config-bot, `tally` / `majorityOf` giữ nguyên.

## Lệnh đã chạy, đầu ra thật

- `node --test suppliers` → `# pass 1128`, `# fail 0`.
- `node --test web/test/*.test.mjs` → `# pass 161`, `# fail 0`.
- Đã thử rebase lên origin/main mới (49713e3b, #938: do-gop.mjs, web/index.html, test web, không đụng config-bot / catalog / dữ liệu cn).
  - Kết quả: 1128/1128 test đạt; `git merge-tree` không xung đột.
  - Nhánh trên GitHub vẫn ở e14ea128 vì đẩy đè (force push) bị chặn. PR tự gộp với main.
- Đo C6 lại trên main 2a1b6ebd (`do-c6.mjs` → `do-c6-main.json`): giống hệt lần đo trên babd36d6.
  - Dung tích: mất thắng 31, mới 21, giữ 63.
  - Sửa đủ 7 nhóm sai.
  - Không giá trị thắng nào bị đổi sang số khác.
- Mã nhánh khớp C6: `node impl-vs-c6.mjs <wt> do-c6-main.json` → mã nhánh 78 nhóm, C6 78 nhóm, không lệch nhóm nào.
- Đo top 30 toàn bộ (928 gói lịch sử, 1093 lượt, 432 NCC):
  - Gốc: `catalog-fg-wilson/gop-main.json` của phiên FG Wilson, đo bằng `do-gop-rf.mjs` trên `wt-cfw-base` @ 2a1b6ebd (sạch). Dùng lại, không đo trùng.
  - Nhánh: `node do-gop-sd.mjs <wt-so-dong-c> <wt-so-dong-c>/suppliers/cn gop-nhanh.json`, chạy 7355 s.
    - `do-gop-sd.mjs` là bản của do-gop-rf, thêm `dispDrop` / `hints` / `ctrlWhy`; phần chọn ứng viên giống hệt.
  - So: `node cmp.cjs gop-main.json gop-nhanh.json out.txt`. `all` so theo đa tập (khoá dòng → các điểm).
  - Toàn bộ tệp ở `dau-vao/so-dong-dung-tich/top30/`.

## Kết quả top 30 (gốc → nhánh)

| | số |
|---|---|
| Lượt / lỗi | 1093 / 0 |
| Lượt `all` không đổi | 985 |
| Lượt `all` đổi | 108 (mọi lượt đều có minDisp hoặc maxDisp trong HSMT) |
| Dòng có điểm khác giữa gốc và nhánh | **0** |
| Dòng RA khỏi `all` | 9322, **cả 9322** nằm trong `dispDrop` của nhánh (bị loại vì dung tích theo số đông) |
| Dòng VÀO `all` | 0 |
| Lượt top đổi tập | 89, tất cả nằm trong 108 lượt có `all` đổi; đổi thứ tự thuần: 0 |
| Dòng RA top | 505 |
| ‣ bị loại theo số đông | 454 (dung tích tối thiểu 341, trần 113) |
| ‣ bị đẩy, vẫn ở `all` | 51 |
| ‣ không rõ | 0 |
| Dòng VÀO top | 496, đều đã có trong `all` của gốc với cùng điểm (lấp chỗ) |
| Top ngắn đi | 9 dòng ở 6 lượt (IB2400317224 16→13, IB2400362865 21→19, IB2500017038, IB2500553750, IB2500626302, IB2600308125 −1): không còn dòng đạt để lấp |
| **Chưa giải thích** | **0** |

Không có dòng VÀO `all` vì gốc chưa có luật số đông cho dung tích. Nhánh thêm luật nên chỉ loại thêm dòng, không cứu dòng nào.
Các nhóm "mất thắng" ở chặng A là so với C0 (số đông không gộp), một phép đo chưa từng chạy trên main.

**51 dòng bị đẩy** (`pushed.cjs`):
- Cả 51 dòng giữ nguyên điểm.
- 42 dòng: trong cùng lượt có dòng VÀO top với điểm ≥ điểm của nó.
- 9 dòng: có dòng VÀO cùng NCC hoặc cùng động cơ.
- Lý do: giới hạn chọn (PER_ENGINE 3, PER_SUPPLIER 4, CN_ROWS 12, MAKE_CAP 10). Một dòng bị loại thì suất của nó chuyển sang dòng khác.
- Không dòng nào ngoài hai nhóm trên.

**Thay đổi why +50 không đổi điểm / thứ hạng**:
- 0 dòng đổi điểm trên toàn bộ `all` của 1093 lượt.
- 985 lượt không có dòng bị loại theo dung tích thì giữ nguyên `all` (đa tập) và top (đúng thứ tự).
- Mọi thay đổi top đều nằm trong lượt có dòng bị loại theo dung tích.
- Lý do mới xuất hiện ở 27783 dòng top.

## 3 mẫu đối chiếu nguồn (`suppliers/cn`, chữ dòng thật)

1. **SDEC SC9D340D2**, số đông 8.82 L:
   - bdadl BDA-S220 ghi `| 6 | 8.82 |`; fukangsi FKS-S220 ghi `8.82`; một NCC khác ghi `6/L | 114*144 | 8.82`; BDA-S200 ghi `8.8`.
   - Bị loại ở gói đòi ≥ 9.726 / ≥ 11.051 / ≥ 13 L (IB2200082109, IB2300042675, IB2400041536, …) và trần ≤ 6.8 / ≤ 8 L.
   - 8.82 < 9.726, nên loại đúng.
2. **Weichai WP10D264E200**, số đông 9.726 L:
   - BDA-W250 ghi `9.726`; một NCC ghi `6/126/130 | 9.726`; FKS-W250 và BDA-W200 ghi `9.7`.
   - Bị loại theo trần ở IB2300191244 (≤ 9.5 L), IB2300215868 (≤ 6.8 L), IB2400481114 (≤ 8 L).
3. **Perkins 403A-11G1**, số đông 1.131 L:
   - GP10 / GP10(S) ghi `| 3 | 1.131 |`; RS-7P ghi `3/L | 77 | 81 | 1.131`.
   - Bị loại ở IB2200086314 (≥ 1.532 L), IB2200029952 (≥ 2.1 L), IB2200012797 (≥ 1.6 L).
   - Ví dụ IB2200086314: 3 dòng 403A-11G1 rời top. Vào thay là ettes EP10 (403A-11G1★), superwatt SK11 (D1105BG), xingguang XG8GF (ZS195), đều đã có trong `all` của gốc với cùng điểm.
     - Dòng ettes vào top vì có khoá động cơ khác (`403A11G1★`, dấu ★ dính vào model): danh mục coi là động cơ riêng, không có số đông nên luật không áp. Đây là bẫy dữ liệu có sẵn, nhánh không gây ra.

## Rủi ro, cách quay lui

- Rủi ro chính: một số model chỉ có bảng chép chung (Yangdong YD385D, YND485D).
  - Sau gộp, các model này không còn giá trị thắng. Dung tích của chúng quay về luật "mọi nguồn" như cũ, tức là bớt loại chứ không loại sai.
- Gói đòi dung tích cao (≥ 11 L) mất 300–400 dòng trong `all`, nhưng top vẫn đủ 30.
- Quay lui nhanh: bỏ `"disp"` khỏi `MAJ_KEYS`. Trần dung tích có điều kiện `MAJ_KEYS.has("disp")` nên cũng tắt theo. Hoặc revert PR.

## Chưa kiểm

- Mới có 3 mẫu nguồn ở trên được đối chiếu tay. Chưa xem tay từng dòng trong 454 dòng rời top.
  - Phần còn lại chỉ kiểm máy móc: dòng nằm trong `dispDrop` và giá trị thắng nằm ngoài ngưỡng HSMT.
- Khoá động cơ có ký tự lạ (ví dụ `403A11G1★` của ettes-power) tách khỏi model thật nên thoát luật số đông. Chưa đếm có bao nhiêu khoá như vậy.
- Chưa đo trên web thật / bot thật (đúng ràng buộc: không ghi web thật).

## Cần ghi nhớ

- Khoá `rowKey` của `R.dropped` không có `r.a`, nên ô máy phát rỗng. Lần đầu so lệch 2807 dòng vì chuyện này. Khi so `dropped` với `all`, bỏ trường thứ 3 (`cmp.cjs` `noAlt`).
- Đẩy đè nhánh đã đẩy bị chặn (auto mode). Rebase chỉ để kiểm, đừng đẩy. Để PR tự gộp main.

## Vòng 2 (19/11/2026): lớp loại do làm tròn, đo biến thể V

Chỉ đo, CHƯA đẩy lên PR. Mã V nằm trong worktree `wt-so-dong-c` (`suppliers/config-bot.mjs`, chưa commit), chỉ chạy khi
`GENBID_DISP_ROUND=1`; không có cờ thì test vẫn 1128/1128. Tệp đo trong `dau-vao\so-dong-dung-tich\`: `do-v.mjs` (đo),
`an-v.mjs` + `an-v.txt` (phân tích, đủ mọi nhóm), `eng-v.txt` (theo động cơ), `odd-keys.txt` (khoá ký tự lạ).

### Định nghĩa "tương thích làm tròn"

Hai số x, y tương thích khi: làm tròn số có NHIỀU chữ số thập phân hơn về số chữ số của số kia thì ra đúng số kia,
VÀ hai số lệch nhau ≤ 1% (`roundCompat`). Ví dụ 21.927 ~ 21.9; 6.75 ~ 6.8; 10.338 ~ 10.34 ~ 10.3. Hai số cùng số chữ số
thập phân thì không tương thích (trừ khi bằng nhau).
- Mức 1% là để loại 4.3 ~ 4 hay 5.9 ~ 6: lệch như vậy có thể là đọc nhầm số xi lanh hoặc số khác, không phải làm tròn.
- KHÔNG nhận cắt cụt (37.88 → 37.8): người ghi số làm tròn chứ không cắt; nhận cắt cụt sẽ gộp cả 37.88 với 37.8 lẫn
  37.9, mở rộng nhóm mà không có cơ sở. Đo thực tế: 0 dòng chỉ khớp khi cắt cụt (mục 2b của `an-v.txt`), nên chọn này
  không đổi kết quả.

### 1. Liệt kê đủ: dòng bị loại vì dung tích có liên quan làm tròn (nhánh hiện tại, 261 lượt có ngưỡng dung tích)

164 nhóm lệch ≤ 3% mà điều phối đếm = **25 nhóm "số thắng là ngưỡng HSMT làm tròn" + 139 nhóm loại đúng theo số**.
Các nhóm này tách thành:

**(a) Nguồn có số chính xác hơn, tương thích với số thắng và đạt ngưỡng: 6 nhóm, 181 khoá dòng (= 180 dòng bảng; một
dòng có hai đầu phát).** V sửa đúng lớp này.

| Động cơ | Số thắng | Ngưỡng | Số tương thích đạt | Các số trong phiếu | Dòng / lượt |
|---|---|---|---|---|---|
| DP222CB | 21.9 | ≥ 21.927 | 21.927 | 21.9, 21.927 | 66 / 3 |
| SC8D280D2 | 8.27 | ≥ 8.3 | 8.3 | 6.5, 8.27, 8.3, 8.8 | 46 / 2 |
| WP6D152E200 | 6.75 | ≥ 6.8 | 6.8 | 6.25, 6.75, 6.8 | 30 / 1 |
| WP6D167E200 | 6.75 | ≥ 6.8 | 6.8 | 6.75, 6.8 | 20 / 1 |
| WP6D158E201 | 6.75 | ≥ 6.8 | 6.8 | 6.25, 6.75, 6.8 | 12 / 1 |
| SC8D220D2 | 8.27 | ≥ 8.3 | 8.3 | 8.27, 8.3 | 7 / 1 |

**(b) Số thắng chính là NGƯỠNG HSMT làm tròn, nguồn không có số nào chính xác hơn: 19 nhóm thêm (25 nhóm tính cả 6
nhóm ở (a)), 687 khoá dòng.** V KHÔNG sửa lớp này vì V chỉ gộp các số của nguồn với nhau. Y490D (2.67, HSMT ≥ 2.672,
48 dòng / 2 lượt) thuộc lớp này. Danh sách đủ ở mục 2c của `an-v.txt`; lớn nhất:
- 1103A33G 3.3 / ≥ 3.331 (109 dòng / 1 lượt);
- 2206CE13TAG3 12.5 / ≥ 12.513 (68 / 1), cùng 6 model 2206 khác (TAG2 39, AE13TAG3 13, AE13TAG6 11, DE13TAG3 8,
  AE13TAG2 7, AE13TAG5 6, DE13TAG2 6);
- 1506AE88TAG5 8.8 / ≥ 8.82 (63 / 1), TAG4 4, TAG1 1;
- Y490D 2.67 / ≥ 2.672 (48 / 2);
- SC4H95D2 4.3 / ≥ 4.33 (45 / 1) và ≥ 4.329 (4 / 1);
- YC6K600D30 12.94 / ≥ 13 (40 / 3), YC6K660D30 (22 / 2);
- 1103A33TG1 3.3 / ≥ 3.331 (11 / 1); WP6D152E310 6.75 / ≥ 6.8 (1 / 1).
Với lớp này, sự thật là "nguồn ghi số làm tròn, HSMT ghi số chính xác": theo nguồn KHÔNG biết được là đạt hay không
(vd 12.94 có thể là 12.94 thật, < 13). **Điểm Khoa quyết**: có so ngưỡng sau khi làm tròn ngưỡng về độ chính xác của số
thắng không (biến thể khác V, chưa đo).

**(c) Loại đúng theo số (số thắng lệch ngưỡng ≤ 3% nhưng không phải làm tròn): 139 nhóm, 3.804 khoá dòng**, mục 2d
của `an-v.txt`. Ví dụ: 2806AE18TAG2 18.1 < 18.273 (232 / 3); 6LTAA95G3 9.5 < 9.726; MTA11G2 10.8 < 11.051; 404A22G1
2.216 < 2.27; SC4H160D2 4.3 < 4.4; TAD1355GE 12.78 > trần 12.7; 6ZTAA13G2 13 > trần 12.7.

Cắt cụt: 0 nhóm.

### 2. Biến thể V

V: các số tương thích làm tròn của một động cơ gộp thành MỘT nhóm phiếu (bắc cầu, đại diện là số nhỏ nhất); nhóm thắng
có một số đạt ngưỡng thì dòng đạt; với trần: có một số ≤ trần × 1,005.

**Lượt đo:** 261 lượt có minDisp hoặc maxDisp (không chỉ 108 lượt có dòng đổi ở chặng B). Lượt không có hai ngưỡng này
không đọc số đông dung tích nên V không đổi được gì. Phải chạy cả 261 lượt (không chỉ 108) vì V có thể TẠO giá trị thắng
mới ở động cơ trước đây không có số đông, tức là loại thêm dòng ở lượt chặng B không đổi. Mỗi lượt chạy hai lần trong
cùng tiến trình: V tắt (khớp gop-nhanh 261 / 261 lượt: top, all, dòng bị loại) và V bật.

**Kết quả:**
- **V giữ lại 6 nhóm / 180 dòng** (đúng 6 nhóm (a)). 7 dòng vào lại top 30.
  - Đạt theo số chính xác nhất: DP222CB (21.927 ≥ 21.927), 66 dòng / 3 lượt.
  - **CHỈ số làm tròn đạt, số chính xác hơn không đạt: Khoa quyết.** Đủ 5 nhóm, 114 dòng:

    | Động cơ | Nhóm | Ngưỡng | Dòng / lượt |
    |---|---|---|---|
    | SC8D280D2 | 8.27 / 8.3 | ≥ 8.3 | 46 / 2 (IB2200067764#0, IB2200092179#0) |
    | WP6D152E200 | 6.75 / 6.8 | ≥ 6.8 | 30 / 1 (IB2300359120#0) |
    | WP6D167E200 | 6.75 / 6.8 | ≥ 6.8 | 20 / 1 (IB2300359120#0) |
    | WP6D158E201 | 6.75 / 6.8 | ≥ 6.8 | 12 / 1 (IB2300359120#0) |
    | SC8D220D2 | 8.27 / 8.3 | ≥ 8.3 | 6 / 1 (IB2200067764#0) |

  - Lớp (b) (Y490D, 2206, 1103A33, YC6K…) V không sửa: 19 nhóm vẫn bị loại.
- **Thay đổi NGOÀI lớp làm tròn: có, lớn.** V loại THÊM 130 nhóm / 5.107 dòng ở 56 lượt đổi top (186 dòng đang ở top 30
  bị loại). Nguyên nhân: trước V, phiếu một động cơ chia theo độ làm tròn (vd 403D15G: 1.496 và 1.5) nên không đủ gấp 3
  lần, không có số đông; V gộp lại thì có số đông và loại dòng theo nó. Theo cách V chạy, mọi số trong nhóm thắng đều
  không đạt ngưỡng, nên các dòng này bị loại đúng theo số của nguồn, nếu số đông đúng. Lớn nhất:
  - 403D15G / 403A15G1 nhóm 1.496 / 1.5 với HSMT ≥ 1.6 … 2.67 (hàng chục lượt, mỗi lượt 50–156 dòng);
  - YC6MK350LD20 / YC6MK420LD20 nhóm 10.3 / 10.33 / 10.338 / 10.34 (≥ 11.051, trần 6.8 / 8 / 9.5 / 9.84);
  - BF4M1013FC 4.76 / 4.764; 404D22TG 2.2 / 2.216; KTA19G2/G3/G3A/G4 18.9 / 19 với trần 14.6; KTA38G2/G2A, KT38G
    37.8 / 38 với trần 22; 401246TWG2A / TAG2A 45.8 / 46; WP10D320E200 9.7 / 9.726 / 9.73; 1106A70TG1 7 / 7.01;
    DP126LB 11 / 11.05 / 11.051 / 11.1; QSK19G20 18.9 / 19; SC13G355D2 12.88 / 12.9; WP23D 2.289 / 2.29 / 2.3 …
  - **Cần soát:** 6DTAA89G34 có phiếu {8.8: 3 (gộp 8.8 + 8.82), 8.9: 1}, nhưng tên model ghi "8.9". Trước V không có số
    đông; V cho thắng 8.8 và loại 12 dòng / 2 lượt với HSMT ≥ 8.9 (IB2300158982#0, IB2400216393#0). Chưa kiểm số thật
    của model này.
  - Danh sách đủ 130 nhóm (động cơ, nhóm thắng, ngưỡng, phiếu, dòng / lượt): mục 3b của `an-v.txt`.
  - Ngoài hai việc trên, V không đổi gì: số xi lanh không đụng tới; điểm của dòng không đổi; lượt không có ngưỡng
    dung tích không chạy V.
- **7 nhóm sai đã biết** (6R / 8V / 10V / 12V1600G70F / G80F, TAD1341GE): trước và sau V đều KHÔNG có giá trị thắng
  (`eng-v.txt`), tức là vẫn sửa đủ.
- Khác ở mức động cơ (toàn danh mục, không chỉ 261 lượt): 275 nhóm (động cơ, số đông trước, số đông sau) đổi hoặc nhóm
  thắng V có > 1 số (`eng-v.txt`). Có bắc cầu dài: 18 / 18.1 / 18.13; 22.9 / 22.92 / 22.921 / 23; 61 / 61.1 / 61.12 /
  61.123; 9.7 / 9.72 / 9.726 / 9.73. 6BT5.9 trước thắng 5.9, V đổi thành nhóm {5.88, 5.9} đại diện 5.88: với HSMT
  ≥ 5.9, dòng vẫn đạt nhờ số 5.9 (cùng loại "Khoa quyết" như trên; ở 261 lượt không có ngưỡng nào rơi vào khoảng này).

### 3. Khoá động cơ có ký tự lạ (chỉ đếm, không sửa: thuộc `catalog.js`)

6.873 khoá động cơ; 89 khoá có ký tự ngoài A–Z 0–9 . - / ( ). Theo ký tự: ★ ×33, * ×20, ^ ×13, `,` ×6, × ×5, : ×5,
– ×3, ° ×1, — ×1, ? ×1, # ×1. **52 khoá có khoá sạch tồn tại riêng** (dòng bị tách khỏi model thật):
1104A44TG1★ 1104A44TG2★ 1104C44TAG2★ 1106A70TAG2★ 1106A70TAG3★ 1106A70TAG4★ 1106A70TG1★ 12M55G6D3/5^ 12V4000G23F★
12V4000G63F★ 16M33D1980E310^ 16M33G2250/5^ 16M33G8D3/5^ 16M55G6D3/5^ 16V4000G23F★ 16V4000G63F★ 20M33G4D3/5^
20V4000G23F★ 20V4000G63F★ 20V4000G63LF★ 403A11G1★ 403A15G1★ 403A15G2★ 403D11G★ 403D15G★ 404A22G1★ 404D22G★
404D22TG★ 4135D—1 4HTAA43*G34 6CT83–GM115 6M31G1000/5^ 6M31G800/6^ 8M33D1012E311^ 8M33D975E310^ 8M33G6D3/5^
8M33G900/6^ KTA50G15× KTA50–G3 QSNTG4× TAD1351GE★ TAD1354GE★ TAD1355GE★ TAD1650GE★ TAD1651GE★ TAD851GE★ TAD852GE★
TAD853GE★ TWD1645GE★ TWD1652GE★ TWD1653GE★ WP6D180E201^. Đủ 89 khoá (ký tự, số dòng, NCC) ở `odd-keys.txt`.
Ngoài ra khoảng 152 khoá có ngoặc kiểu `4BTA39G2(G45E1)`, không tính là ký tự lạ.

### Khoa quyết

1. 5 nhóm / 114 dòng chỉ đạt nhờ số làm tròn (bảng ở mục 2): V giữ hay không.
2. Lớp (b), 19 nhóm / ~500 dòng, số thắng là ngưỡng HSMT làm tròn: có làm tròn ngưỡng về độ chính xác của số thắng
   không (chưa đo).
3. Nhận V với phần loại thêm 130 nhóm / 5.107 dòng không (đều là số đông mới sau khi gộp; soát 6DTAA89G34).

### Chưa kiểm

- Số dung tích thật của 6DTAA89G34, SC8D280D2 / SC8D220D2 (8.27 hay 8.3), SC4H95D2 (4.3 hay 4.33).
- Biến thể "làm tròn ngưỡng" cho lớp (b).

## Vòng 3 (19/11/2026): luật chốt của Khoa

### W1 / W2 (khoảng làm tròn): Khoa bỏ, không có số

Đã viết `dispFails` (sau cờ) và chạy `do-w.mjs`; Khoa quyết trong lúc chạy nên đã dừng ở lượt 20 / 261. Tệp chỉ ghi khi
xong nên KHÔNG có số nào của W1 / W2. Mã W đã xoá. Kiểm tay trên các ca mẫu khi viết: W1 giữ Y490D (2.67 ↔ ≥ 2.672) và 2206
(12.5 ↔ ≥ 12.513), loại YC6K (12.94 ↔ ≥ 13) và SC8D (8.27 ↔ ≥ 8.3); nhưng cũng giữ SC4H95D2 (4.3 ↔ ≥ 4.33; nguồn ghi
105×124×4 = 4,295 < 4,33) và cả số nguyên "13" với trần 12.7 (khoảng [12.5; 13.5)). Đó là cái giá W phải trả; Khoa không chọn.

### Luật chốt (Khoa 19/11): đã hiện thực, không cờ

- Các số tương thích làm tròn (`roundCompat` như Vòng 2, không nhận cắt cụt) của một động cơ gộp thành MỘT nhóm phiếu
  (`majorityRound`).
- So ngưỡng CHẶT bằng số chính xác nhất của nhóm thắng (`dispExact`): tối thiểu số < ngưỡng thì loại; trần số > trần × 1,005
  thì loại. Main đang so trần `x > maxDisp * 1.005` (dòng 1490 của main), nên giữ đúng hệ số này.
- Nhiều số cùng độ chính xác cao nhất: lấy số nhiều phiếu hơn (số người bỏ phiếu sau gộp NCC); bằng phiếu thì lấy số trượt
  trước (nhỏ hơn khi so tối thiểu, lớn hơn khi so trần), theo hướng Khoa chọn loại khi nguồn không đủ căn cứ. Các nhóm thắng rơi
  vào trường hợp này (toàn danh mục, `eng-v.txt`): D1146T và D1146 {8.07, 8.071, 8.074}, DP086LA {8, 8.071, 8.074, 8.1},
  WP41D80E200 {4.08, 4.087, 4.088, 4.1}, YC4D90ZD21 {4.2, 4.21, 4.214, 4.215}.
- `srcOf.disp` / `srcOf.maxDisp` thêm `group` (mọi số của nhóm thắng) và `exact` (số đem so); lý do ghi số `exact`.
- Commit acd2f7e4 (luật + test `cand-disp-round.test.mjs` dòng thật, fixture `fixtures/so-dong-lam-tron.json` chép nguyên
  văn 108 NCC / 1.399 dòng), sửa `suppliers/CLAUDE.md`. Merge main 671797e4 (c9373ab1). Commit 48044c61: #941 đọc được bảng
  jinjia-power, nên test C6 có thêm hai nhóm, đều đúng tiêu chí C6: jinjia + yunding (12V2000G25, cùng ô 4000*1650*2280, cùng
  23.88) và jinjia + victory (TAD1351GE, 3100×1150×1600 / 3100*1150*1600, cùng 12.78; 12.78 trước gộp 10 phiếu, sau 8, vẫn
  thắng). Đã đẩy; test suppliers 1156/1156, bot 130/130, web 161/161; spec-diff ↔ 671797e4: 0 bản ghi đổi.
- Test dòng thật: DP222CB {21.9, 21.927} ↔ ≥ 21.927 giữ; SC8D280D2 {8.27, 8.3} ↔ ≥ 8.3 loại; Y490D 2.67 ↔ ≥ 2.672 loại;
  403D15G {1.496, 1.5} (trước chia phiếu, không số đông) ↔ ≥ 1.6 loại; 6DTAA89G34 {8.8, 8.82} × 3 : 8.9 × 1, số chính xác
  8.82, nguồn hanyang-weifang ghi 114×144 → 114×144×6 = 8,819 L; trần WP10D264E200 {9.7, 9.72, 9.726, 9.73} ↔ ≤ 9.5 loại
  theo 9.726, ↔ ≤ 9.7 ở lại (9.726 ≤ 9.7485).

### Đo luật chốt (F) trên 261 lượt (`do-f.mjs`, `an-f.mjs` → `an-f.txt`)

Đo bằng code trước merge #941 (acd2f7e4, cùng `cn` như gop-nhanh); top 30 lần cuối (main mới ↔ nhánh) điều phối đo trên
cloud. Đếm theo danh sách `all` (dòng ứng viên còn lại), so từng khoá dòng có đầu phát; số này khác cách đếm theo khoá dòng bị
loại ở Vòng 2 (ở đó V loại thêm "130 nhóm / 5.107 dòng"; theo `all` là 92 nhóm / 3.062 dòng).

| | so nhánh #939 | so main (gop-main) |
|---|---|---|
| giữ lại | 1 nhóm / 64 dòng (DP222CB, 3 lượt) | 0 |
| loại thêm | 125 nhóm / 5.621 dòng | 419 nhóm / 14.879 dòng |
| lượt top 30 đổi | 70 | 126 |

(Đối chứng V cùng cách đếm: giữ 6 nhóm / 178 dòng, loại thêm 92 nhóm / 3.062 dòng, top đổi 56 so nhánh / 113 so main.)

Lớp (b), 25 nhóm số thắng là ngưỡng HSMT làm tròn: F giữ DP222CB (64 dòng theo `all`; Vòng 2 đếm 66 theo khoá dòng bị loại,
chưa soát vì sao lệch 2), loại cả 24 nhóm còn lại, gồm 5 nhóm "chỉ số làm tròn đạt" (SC8D280D2, SC8D220D2, WP6D152 / 167 / 158E…)
và 19 nhóm nguồn chỉ có số làm tròn (Y490D, 2206…, 1103A33…, 1506AE88…, SC4H95D2, YC6K600 / 660D30, WP6D152E310).
Đúng như Khoa quyết.

7 nhóm sai đã biết (MTU 1600, TAD1341GE): không có giá trị thắng trước và sau (gộp làm tròn không đổi các nhóm này).

### Soát số đông mới bằng đường kính × hành trình × số xi lanh nguồn ghi

Hai lần soát (D×S×z đọc qua lớp chuẩn hoá, mỗi NCC một bộ, dung tích = π/4·D²·S·z):
- 130 nhóm V loại thêm (`soat-ds.mjs` → `soat-ds.txt`): 97 khớp (mọi D×S×z cũng không đạt), 33 có NCC ghi D×S khác,
  **0 nhóm trái** (D×S×z mọi nguồn đều đạt).
- 125 nhóm F loại thêm so nhánh (`an-f.txt`): 86 khớp, 38 có NCC ghi D×S khác, 1 không nguồn nào ghi D×S (QSK19G14 18.9 ↔
  ≥ 19), **0 nhóm trái**.

Nhóm có NCC ghi D×S khác: hầu hết số đông D×S khớp số đông dung tích, chỉ 1–2 NCC lệch (403D15G / 403A15G1 84×90×3 = 1,496 ×
8 NCC : ×4 = 1,995 × 1; YC6MK420LD20 123×145×6 = 10,338 × 12 : 131×145 × 1; WP10D320E200 126×130×6 = 9,726 × 9 : 127×165 × 1;
WP23D 89×92×4 = 2,289 × 6–8 : 1–2; KTA19G2 / G4 159×159×6 = 18,942 × 3–6 : 1–2; WP12D317E200 11,596 × 4 : 9,726 × 2 :
11,413 × 1; 400623TAG3A 22,921 × 12 : 30,561 × 1). **Cần Khoa / điều phối xem riêng** (D×S không đủ để khẳng định số đông):
- **YD4EZLD** (chỉ F, không có ở V): nhóm {4.08, 4.1}, số chính xác 4.08 < HSMT ≥ 4.087 → loại 29 dòng / 1 lượt. D×S nguồn
  ghi: 105×118×4 = 4,087 (1 NCC) : 102×118×4 = 3,857 (1 NCC). 4.08 có thể là 4.087 bị CẮT CỤT (làm tròn ra 4.09): nếu đúng thì
  dòng đạt. Luật không nhận cắt cụt nên loại.
- **Y4100D** trần ≤ 2.9: {3.7, 3.707}; D×S 100×118×4 = 3,707 (1) : 90×100×4 = 2,545 (1). Loại 6 dòng / 1 lượt.
- **KT38G** trần ≤ 22: {37.8, 38}; D×S 159×159×12 = 37,885 (2) : ×6 = 18,942 (1). Loại 31 dòng / 1 lượt.

6DTAA89G34: D×S nguồn ghi 114×144×6 = 8,819 (1 NCC) → loại với ≥ 8,9 là đúng theo nguồn.

### Chưa kiểm

- Top 30 main 671797e4 ↔ nhánh 48044c61: điều phối đo trên cloud, gửi tệp về để giải thích.
- Dung tích thật của YD4EZLD (4.087 hay 4.08), Y4100D, KT38G theo datasheet hãng.
