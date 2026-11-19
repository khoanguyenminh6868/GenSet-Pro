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

## Vòng 4 (19/11/2026): giải thích top 30 cloud, main 671797e4 ↔ nhánh 48044c61

Tệp ở `dau-vao\so-dong-dung-tich\top30-cloud\`:
- `runs-doi.mjs`: tìm lượt khác.
- `do-r.mjs` → `do-r-nhanh.json`: chạy lại cục bộ các lượt khác bằng code nhánh, ghi mọi dòng bị loại kèm `ruled` / `src`.
- `an-r.mjs` → `an-r.txt`: giải thích ĐỦ, mọi nhóm, mọi lượt.
- `pushed.mjs` → `pushed.txt`: dòng bị đẩy khỏi top.
- `one.mjs <lượt>`: xem tay một lượt.
- `votes.mjs` (thư mục trên): phiếu dung tích của một động cơ.

### 0. Số đếm và chạy lại

So theo khoá dòng đầy đủ (NCC | động cơ | đầu phát | chữ dòng), cả theo tập lẫn đa tập:
- 1.093 lượt: 952 giống hệt, 141 lượt `all` khác, 127 lượt top khác.
- Rời `all`: 14.573 khoá. VÀO `all`: **0**.
- Rời top: 776 khoá; vào top: 757 khoá.

Số của điều phối (rời 5.217 / vào 270 / ra top 405) em không tái lập được bằng các cách gom khoá đã thử: NCC | động cơ ra
10.426 / 0; thêm đầu phát ra 11.355 / 0; bỏ đầu phát vẫn 14.573 / 0. Cần xem cách đếm bên điều phối.

Chạy lại 141 lượt cục bộ (bidhist `genbid-test\noi-chuan-hoa`, cùng `cn`): 140 lượt khớp cloud từng ký tự (all + top).
Lượt không khớp là IB2400121273#0: bidhist cục bộ cho 0 ứng viên (khác bản cloud tải 11:21Z). Lượt này chỉ có 1 khoá rời
`all`: elitech-power 403D15G (EPS11PA3), HSMT ≥ 2,3 L. Đây là nhóm {1.496, 1.5} của 403D15G, số chính xác 1.496 < 2.3, giống
10 dòng 403D15G ≥ 2,3 ở lượt khác (`an-r.txt`). Như vậy 14.572 / 14.573 khoá được giải thích bằng lượt chạy lại, 1 khoá bằng
đối chiếu.

### 1. Mọi khoá rời `all` (`an-r.txt` mục 1, 463 nhóm động cơ × luật × ngưỡng, 0 dòng không rõ ngoài khoá trên)

Mọi khoá rời đều bị loại bởi luật dung tích (`disp` hoặc `maxDisp`) theo số đông. Không có luật nào khác.

| Lớp | Dòng |
|---|---|
| Sai thật: số chính xác của nhóm thắng không đạt, và không có số làm tròn nào đạt | 11.763 |
| (a) Nhóm thắng có số làm tròn đạt, số chính xác không đạt (Khoa 19/11: LOẠI) | 2.653 |
| (b) Nguồn chỉ có số làm tròn của ngưỡng (Khoa 19/11: LOẠI) | 156 |
| Không thấy trong lượt chạy lại (IB2400121273#0, giải thích ở trên) | 1 |

- Trong 11.763 dòng sai thật: 5.419 dòng thuộc nhóm thắng chỉ một số (số đông dung tích của chặng B, gộp NCC C6); 6.344 dòng
  thuộc nhóm có gộp làm tròn (số đông mới hoặc số chính xác mới).
- (a) theo ngưỡng (dòng): ≥ 5,9: 1.832; ≥ 19: 380; ≥ 10,34: 120; ≥ 2,3: 106; ≥ 6,8: 74; ≥ 7,15: 60; ≥ 8,3: 52; ≥ 4,4: 11;
  trần ≤ 8: 10; ≥ 23: 8.
  - ≥ 5,9 là họ Cummins 6BT5.9 / QSB5.9 (nhóm {5.88, 5.9}, D×S nguồn ghi 102×120×6 = 5,883).
  - ≥ 19 là KTA19 / QSK19 (nhóm {18.9, 19}, 159×159×6 = 18,942).
  - D×S nguồn ghi ở mọi nhóm (a) đều cho số dưới ngưỡng, khớp số chính xác.
- (b): 2206CE13TAG3 (67) và TAG2 (40) với ≥ 12,513 (12.5); SC4H95D2 với ≥ 4,33 (45) và ≥ 4,329 (4) (4.3; D×S 105×124×4 =
  4,295). Y490D không đổi vì main cũng loại: mọi nguồn chỉ ghi 2.67 < 2.672.
- Mỗi nhóm trong `an-r.txt` có: phiếu, nhóm thắng, số chính xác, lớp, nguồn gốc ("có gộp làm tròn" / "nhóm một số"), D×S×z
  nguồn ghi (3 bộ nhiều NCC nhất), số dòng / lượt.

### 2. Khoá vào `all`: 0

Theo khoá dòng đầy đủ, nhánh không có dòng nào mà main không có. Luật siết lại chỉ loại dòng, không cứu dòng nào. 757 khoá
vào TOP đều đã có trong `all` của main, chỉ là lấp chỗ trống (mục 3).

### 3. 127 lượt top đổi (`an-r.txt` mục 3: mỗi lượt có ngưỡng, số dòng top trước → sau, động cơ rời / vào top và lý do)

- **Không lượt nào top rỗng hay còn < 5 dòng.** 118 lượt vẫn đủ 30 dòng. 9 lượt top giảm (trước → sau): 26→25, 25→22,
  21→20, 21→19, 21→18, 20→19, 19→17, 18→16, 16→12.
- Rời top 776 khoá:
  - 714 khoá rời vì dòng bị loại khỏi `all` (lý do như mục 1).
  - 62 khoá vẫn ở `all` nhưng bị đẩy khỏi top (`pushed.txt`):
    - 9: thay bằng dòng cùng động cơ, cùng điểm (thứ tự hoà điểm);
    - 5: thay bằng dòng cùng NCC, cùng điểm;
    - 4: bằng điểm thấp nhất top mới;
    - 6: điểm thấp hơn mọi dòng top mới;
    - 38: điểm cao hơn dòng thấp nhất của top mới. Nguyên nhân là cách chọn top: 12 chỗ cho dòng động cơ Trung Quốc được
      chọn TRƯỚC, mỗi động cơ ≤ 3 dòng, mỗi NCC ≤ 4 dòng, mỗi hãng ≤ 10 dòng. Dòng Trung Quốc điểm cao bị loại thì 12 chỗ
      lấy dòng Trung Quốc điểm thấp hơn. Các dòng này chiếm trần động cơ (25 dòng), trần NCC (6), trần hãng Cummins (6),
      nên dòng điểm cao phía sau bị chặn. Dòng còn lại (IB2300343208#0, dingbo 401661TRG3, 456 điểm) soát tay bằng
      `one.mjs`: dòng Yuchai YC12V / YC16V của fdk-energy và longkai-power bị loại (trần ≤ 66 L) nên hai NCC này hết bị
      trần 4 dòng / NCC; dòng 4016TAG2A fdk (481) và 12M55D2210E310 longkai (465) vào phần chọn theo điểm, đẩy dòng 456 ra.
- Vào top 757 khoá: đều có trong `all` của main (0 dòng mới), lấp chỗ dòng rời theo đúng thứ tự chọn ở trên.

### 4. Bảng cho Khoa: 10 động cơ mất nhiều dòng nhất (rời `all`)

| Động cơ | Dòng / lượt | Ngưỡng HSMT (dòng) | Số đông (phiếu) → số chính xác | D×S×z nguồn ghi | Câu HSMT điển hình |
|---|---|---|---|---|---|
| 6BTAA5.9-G12 | 1.170 / 15 | ≥ 5,9 (412), ≥ 6,7 (238), ≥ 8,3 (127), ≥ 6,75 (121), ≥ 6,8 (108), ≥ 6,44 (102), ≥ 6,87 (59), khác 3 | {5.88, 5.9}: 5.88 × 16 : 8.3 × 1 → 5,88 | 102×120×6 = 5,883 (7 NCC) | IB2200037783: "Dung tích xi lanh 5900cc" (Hyundai DHY110KSE) |
| 6BTAA5.9-G2 | 888 / 19 | ≥ 5,9 (370), ≥ 6,7 (176), ≥ 6,87 (133), ≥ 8,07 (102), ≥ 8,3 (39), khác 68 | {5.88, 5.9} × 15 → 5,88 | 5,883 (8 NCC) | như trên |
| 6BTA5.9-G2 | 709 / 16 | ≥ 5,9 (376), ≥ 8,07 (127), ≥ 6,87 (119), ≥ 6,871 (61), khác 26 | {5.88, 5.9} × 16 → 5,88 | 5,883 (8 NCC) | như trên |
| 6LTAA8.9-G2 | 656 / 6 | ≥ 11,051 (512), ≥ 9,726 (144) | 8.9 × 18 : 8.3 × 1 → 8,9 | 114×145×6 = 8,880 (8); 114×135×6 = 8,268 (4) | IB2300042675: "Dung tích xi lanh: ≥ 11.051 L" |
| 404D-22TG | 492 / 15 | ≥ 2,54 … ≥ 3,9 (12 ngưỡng) | {2.2, 2.216} → 2,216 | 84×100×4 = 2,217 (4) | IB2200064629: "Động cơ: dung tích …" (ngưỡng ≥ 2,54) |
| 1104C-44TAG2 | 447 / 9 | ≥ 5,9 (194), ≥ 4,837 (99), ≥ 4,7 (98), khác 56 | {4.4, 4.41} × 20 : 12.6 × 1 → 4,41 | 105×127×4 = 4,399 (7) | IB2200037783: "5900cc" |
| 6BT5.9-G2 | 427 / 5 | ≥ 5,9 (427) | {5.88, 5.9} × 17 → 5,88 | 5,883 (9) | IB2200037783: "5900cc" |
| 403D-15G | 418 / 15 | ≥ 1,8 (158), ≥ 1,6 (126), ≥ 2,27 (92), khác 42 | {1.496, 1.5} × 10 : 149 : 2.2 → 1,496 | 84×90×3 = 1,496 (8); ×4 = 1,995 (1) | IB2400513782: "Tổng dung tích xilanh: >= 1,8 lít" |
| 6LTAA9.5-G3 | 398 / 14 | ≥ 11,051 (262), ≥ 9,726 (65), khác 71 | 9.5 × 7 : 14 : 8.9 → 9,5 | 116×148×6 = 9,385 (2) | IB2300042675: "≥ 11.051 L" |
| 6CTAA8.3-G2 | 281 / 11 | ≥ 9,726 (127), ≥ 8,8 (127), khác 27 | 8.3 × 16 → 8,3 | 114×135×6 = 8,268 (9) | IB2200082109: "Dung tích xi lanh: 9.726 L." |

**Hệ quả của quyết định "loại" (lớp (a)):**
- Họ 6BT5.9 / QSB5.9 (Cummins, tên ghi "5.9") mất 1.832 dòng ở các gói ghi ≥ 5,9 L / "5900cc", vì số chính xác của nguồn là
  5,88 (D×S 5,883).
- KTA19 / QSK19 mất 380 dòng ở gói ≥ 19 L (18,9; D×S 18,942).
- Nếu HSMT ghi "5900cc" là tên gọi 5.9 L của chính dòng Cummins này thì loại là quá chặt. Đây là hệ quả trực tiếp của luật
  so chặt Khoa chọn; em không đổi gì.

### 5. Ba nhóm và luật hoà phiếu (nêu phương án, không chốt)

- **YD4EZLD** (HSMT ≥ 4,087): bản cloud (sau #941) GIỮ đủ 29 dòng, không có trong khác biệt.
  - #941 đọc được thêm bảng jinjia-power (3.86). Phiếu (`votes.mjs`): 4.1 × 3 (depco, wintpower, yangdong), 4.08 × 1
    (waeta-fujian), 3.86 × 1, 3.857 × 1.
  - Gộp làm tròn: {4.08, 4.1} × 4 : {3.857, 3.86} × 2, không đủ gấp 3 nên không có số đông, quay về "mọi nguồn" → 4,1 đạt → giữ.
  - Đếm cũ (không gộp làm tròn) thì 4.1 × 3 thắng. Tức là gộp làm tròn cũng có thể LÀM MẤT số đông.
  - Phương án nếu số đông trở lại (thêm nguồn ghi 4.1 / 4.08):
    - (1) giữ luật: số chính xác 4,08 < 4,087 → loại;
    - (2) nhận cắt cụt khi D×S của chính nguồn đó cho số dài hơn mà cắt ra đúng nó (105×118×4 = 4,087 → 4.08) → đạt;
    - (3) ghi chú dữ liệu nguồn waeta-fujian.
- **Y4100D** (trần ≤ 2,9, IB2300293753#1, 6 dòng):
  - Phiếu: 3.707 × 3 (depco, wintpower, yangdong; yangdong là hãng động cơ), 3.7 × 1, 2.54 × 1 (jinjia), 2.545 × 1 (victory).
    Không gộp được 2.54 với 2.545 (2.545 làm tròn ra 2.55).
  - Nhóm {3.7, 3.707} × 4 thắng → 3,707 > 2,9 → loại. D×S: 100×118×4 = 3,707 (1 NCC) : 90×100×4 = 2,545 (1 NCC).
  - Phương án:
    - (1) giữ (hãng Yangdong ghi 3.707);
    - (2) khi bộ D×S nguồn ghi mâu thuẫn ngang phiếu thì bỏ số đông, về "mọi nguồn" → có nguồn 2,545 ≤ 2,9 → giữ.
- **KT38G** (trần ≤ 22, IB2300254479#0, 31 dòng):
  - Phiếu: {37.8 × 6, 38 × 2} = 7 phiếu sau gộp NCC : 18.9 × 2 (agestar, mingbang-mbkl).
  - D×S: 159×159×12 = 37,885 (2) : 159×159×6 = 18,942 (1). Số 18.9 là số của KTA19, nhưng em mới đối chiếu D×S, chưa kiểm
    datasheet hãng.
  - Phương án: (1) giữ loại; (2) như Y4100D (2) → giữ.
- **Luật hoà phiếu "số trượt trước"** (cùng độ chính xác, cùng phiếu): 5 nhóm thắng toàn danh mục rơi vào: D1146 / D1146T
  {8.071, 8.074}, DP086LA {8.071, 8.074}, WP41D80E200 {4.087, 4.088}, YC4D90ZD21 {4.214, 4.215}.
  - Trong 141 lượt cloud chỉ DP086LA (trần ≤ 8) có mặt: cả 8,071 lẫn 8,074 đều > 8,04, nên luật nào cũng loại. Luật hoà
    phiếu hiện KHÔNG đổi dòng nào.
  - Phương án:
    - (1) số trượt trước (đang dùng);
    - (2) số đạt trước;
    - (3) hoà phiếu thì không có số chính xác, về "mọi nguồn".

### Bổ sung Vòng 4: 36 lần chênh, 270 dòng đổi điểm (`top30-cloud\diem.mjs` → `diem.txt`)

- **36 lần chênh** (đa tập 14.609 ↔ tập 14.573): 36 / 36 là khoá xuất hiện HAI lần trong `all` của main ở cùng một lượt (cùng
  NCC, động cơ, đầu phát, chữ dòng; vd uleengen YC6T660LD20 bảng tiếng Anh và tiếng Trung ở IB2200032133#0 / IB2200049662#0;
  wintpower 6BTAA59G12 WTC165 ở IB2200067764#0). Nhánh loại cả hai lần. Không có khoá nào còn ở nhánh mà ít lần hơn.
- **270 dòng đổi điểm, đều −600, ở đúng 2 lượt** (trước em ghi "0 dòng đổi điểm": SAI, vì cmp chỉ so khoá):
  - IB2400389856#0: 151 dòng 6BT5.9-G2. HSMT ghi "Động cơ … Cummins Dongfeng 6BT5.9G2 hoặc tương đương" và "Dung tích xy lanh
    5.9 L, đường kính xy lanh 102 mm, hành trình xy lanh 120 mm".
  - IB2400440222#0: 119 dòng 6BTA5.9-G2. HSMT ghi "Động cơ: Model: 6BTA5.9-G2 (hoặc tương đương)" và "Tổng dung tích xy lanh:
    5.9 Lít".
  - Tiêu chí: luật dung tích tối thiểu (`ruled: disp`). Số đông {5.88, 5.9}, số chính xác 5,88 < 5,9.
  - Vì sao không bị loại như lượt khác: HSMT NÊU ĐÍCH DANH model động cơ (`isNamed = named(hints, e.model)`). Với model HSMT
    nêu, `candidates` không loại mà giữ dòng, trừ 600 điểm và ghi lý do ("dung tích 5.88 L < 5.9 L HSMT yêu cầu (số đông …)")
    cho agent thấy (luật có từ trước, cho mọi luật tối thiểu). Không phải ngưỡng mềm hay "khoảng".
  - Mọi dòng của model đó ở hai lượt đều đổi điểm (main 1861 → 1261, …). Danh sách đủ 270 dòng ở `diem.txt`.
- **Hệ quả với top của 2 lượt:**
  - Dòng model nêu đích danh vẫn ở top: 8 dòng ở top cả trước lẫn sau mỗi lượt. Điểm của chúng vẫn hơn mọi dòng khác ~350 nhờ
    điểm "HSMT nêu model".
  - Thứ tự đổi: ở IB2400440222#0, dòng ettes-power 6BTA5.9-G (khoá khác, không bị trừ, 1165) lên đầu.
  - Top đổi ở phần dưới: dòng Cummins cùng họ mà KHÔNG phải model nêu (6BTAA5.9-G2, 6BT5.9-G2, QSB5.9-G3 ở IB2400440222#0;
    6BTA5.9-G2, 6BT5.9-G1, QSB5.9-G2 ở IB2400389856#0) bị loại hẳn, thay bằng 6CTA8.3, 1106A70TAG2, WP6D152, CA6DF219D…
    ở IB2400440222#0 và các mã 6BT5.9 khoá lạ ở IB2400389856#0.
  - Agent sẽ thấy chính model HSMT nêu bị ghi "dung tích 5.88 L < 5.9 L" dù HSMT tự ghi model đó là 5,9 L (và D×S 102×120,
    đúng D×S nguồn ghi): **đây là chỗ luật so chặt tự mâu thuẫn với HSMT, Khoa cần xem.**
  - Phương án:
    - (1) giữ như nay;
    - (2) model HSMT nêu thì không áp dung tích (HSMT đã chọn nó);
    - (3) model HSMT nêu thì so bằng số làm tròn như HSMT ghi.

### Chưa kiểm

- Cách đếm 5.217 / 270 / 405 của điều phối: đã rõ (số khoá khác nhau gom qua mọi lượt; 270 là lần đổi điểm).
- Datasheet hãng: Cummins 6BT5.9 (5,9 hay 5,88), KT38G, Y4100D, YD4EZLD.

## Khoa chốt 19/11 đêm: "giữ chặt"; merge #945

- Khoa chốt sau khi xem bảng hệ quả: luật nhánh giữ nguyên. Model HSMT nêu đích danh vẫn trừ 600 (`isNamed`); Y4100D / KT38G
  giữ loại; luật hoà phiếu giữ "số trượt trước". Đã ghi vào `suppliers/CLAUDE.md` (93f4586c) để không ai nới lại.
- Merge main a89b88be (#945, `web/catalog.js`) → d4063a36. Test: suppliers 1166/1166, bot 137/137, web 161/161. Không test C6
  nào đổi. spec-diff ↔ a89b88be: 0 bản ghi đổi. Đầu nhánh đã đẩy: 93f4586c.

## Vòng 5 (20/11/2026): đo cloud lần 2 (a89b88be ↔ 93f4586c), #939 đã merge (b00762f1)

74 lần rời `all` thêm so với Vòng 4 (14.683 ↔ 14.609), 0 lần mất (`top30-cloud-2\them.mjs`). Đều là dòng mới của #945 thuộc
động cơ × ngưỡng đã có ở Vòng 4: WP23D25 / 33 / 40 / 48E200 (≥ 2,3 … 2,771), WP10D320E200 (≥ 10,34 / 11 / 11,051),
WP10D264 / 238E200 (≤ 6,8 / 8), WP41D66E200 (≥ 4,3 / 4,329 / 4,33), WP6D152 / 167E200 (≥ 6,8), WP6D132E200 (≤ 5,9),
WP13D385E200 (≤ 9,84), KTA19G3A / G4 / G8, KTAA19G6 (≥ 19, ≤ 14,6), KTA38G2 / G2A (≤ 22), S16RPTAA2 / S16R2PTAW (≤ 20 / 66).
Chỉ một cặp (lượt, động cơ) chưa có dòng rời ở Vòng 4: IB2300163186#1 WP23D25E200 ≥ 2,3, 1 dòng. Nhóm {2.289, 2.29, 2.3}
→ 2,289 với cùng ngưỡng ≥ 2,3 đã có ở 3 lượt khác của Vòng 4. Không có gì khác loại.
