# ung-vien-ab-1 (TẠM DỪNG 20/11/2026 theo điều phối, chưa xong)

- Đã xong: PR draft #996 (nhánh `ung-vien-ab`, worktree `wt-ung-vien-ab`, commit 3a16b04e): luật A + B + cờ `GENBID_CAND_A/B=0`, test `suppliers/cand-ab.test.mjs`; `node --test suppliers/` 1.261/1.261 qua.
- IB2600603983 (prep mới, main 56087390): main đã có 6M31G825/5 voltgent 222đ ở #17 (khác số 190 của điều phối); A+B: 262đ, #8. Bản in trước/sau: scratchpad của phiên `cand-base.txt` / `cand-ab.txt` / `ib-30.txt`.
- Đang dở: đo MẪU 1/10 (hai tiến trình nền `mau-ab.mjs` step 20 lệch 0 và 10 → `mau-0.json`, `mau-10.json` trong scratchpad) — chưa đọc kết quả. Lệnh nền kết thúc mã 1 (chưa xem log `mau-0.log` / `mau-10.log`: có thể một tiến trình lỗi, xem trước khi tổng hợp).
- Bước kế tiếp: `node tong-hop.mjs mau-0.json mau-10.json` → viết phần nghiệm thu (số lượt đổi, do A / do B, 10 lượt đổi nhiều nhất, rủi ro, câu hỏi CN_ROWS cho Khoa) → kiểm CI #996 → báo điều phối.
