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
