# Đo top 30 ứng viên cho Lệch cột 11 (PR #926) — chuẩn bị sẵn, CHƯA chạy

Chờ điều phối báo máy rảnh (Chất lượng 1 đang đo tới ~19:30).

## Hai worktree (đã tạo, cùng dữ liệu)
- Gốc: `C:\Projects\GenSet Pro\wt-lc11-base`  = 270b4eb4 (origin/main hiện tại, chưa đổi)
- Nhánh: `C:\Projects\GenSet Pro\wt-lc11-new` = eaff24a8 (lech-cot-11)
- `suppliers/cn` hai bên GIỐNG HỆT (`git diff 270b4eb4 lech-cot-11 -- suppliers/cn` rỗng). Cả hai lần đo dùng chung thư mục cn của wt-lc11-base nên dữ liệu chắc chắn trùng.
- Nếu main đổi trước khi đo: tạo lại hai worktree từ cùng một commit mới, rebase nhánh lên đó (web/catalog.js không ai khác sửa), đo lại từ đầu.

## Lệnh (mỗi lần một tiến trình; máy chỉ chịu vài lượt cùng lúc)
```powershell
$B="C:\Projects\GenSet Pro\wt-lc11-base"; $N="C:\Projects\GenSet Pro\wt-lc11-new"; $O="C:\Projects\GenSet Pro\genbid-work\dieu-phoi\dau-vao\lech-cot-11"
node "C:\Projects\GenSet Pro\genbid-test\lc8\do-gop.mjs" $B "$B\suppliers\cn" "$O\gop-main.json"
node "C:\Projects\GenSet Pro\genbid-test\lc8\do-gop.mjs" $N "$B\suppliers\cn" "$O\gop-lech-cot-11.json"
node "$O\gopCl3.mjs" $N 270b4eb4 "$O\gop-main.json" "$O\gop-lech-cot-11.json" "$O\gop-so.txt"
```
`do-gop` tiếp tục được (tệp `.part`): mất điện chỉ mất gói đang chạy. Hai lần đo chạy được song song nếu RAM trống ≥ 4 GB (chặng 3 của Chất lượng 3 đã chạy hai tiến trình song song).

## Giải thích từng dòng
- `gopCl3.mjs` (từ chat-luong-3\c3): so MỌI lượt (tập top 30, thứ tự, all / dropped), mỗi dòng vào / ra truy về bản ghi danh mục của chính nó (đổi / mất / mới / không đổi = bị chen).
- `factCheck.mjs`: lượt không có bản ghi đổi → truy về dữ kiện theo mã động cơ / đầu phát.
- `cntCmp.mjs`: dòng đổi trạng thái all / dropped ở lượt chỉ đổi số đếm.
- `phanLoai.cjs`: gom nhóm nguyên nhân.
- Nguyên nhân dự kiến cần giải thích: yongcai (43 bản ghi động cơ tách), Doosan / khung đầu phát đổi vai (rise, rcg, agg, kaichen, uleengen, green-power, sanq, jet), 80 dòng sanq thêm khối lượng, eastern-lion (22 bản ghi mất), mwm (công suất 3333, 1000…), yanfa (dung tích bỏ), cgm / yingtai (khối lượng, điện áp bỏ). Mỗi dòng vào / ra phải gắn với một trong các nhóm này, hoặc là "bị chen / lấp chỗ".
