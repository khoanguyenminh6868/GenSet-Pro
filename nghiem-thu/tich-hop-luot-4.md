# Tích hợp lượt 4 (24/11/2026)

Nhánh `tich-hop-luot-4` (đã push, KHÔNG có PR, chỉ để đo): **d8a41abb**, dựng từ main **788033dc** (#1159) bằng merge lần lượt #1105, #1110, #1111, #1118, #1114, #1115. Không rebase, không force-push, không merge PR nào vào main.

Main đã đi tiếp tới `c41e3fd0` trong lúc làm (checkout dùng chung `.git`, `origin/main` tự đổi): cổng `spec-diff` phải cố định `git:788033dc` (với `git:origin/main` lúc đó nó sập vì `spec-norm.js` khác và `brief` của spec-diff không nhận `dims` dạng object: lỗi riêng của spec-diff, chưa sửa). Nhánh tích hợp CHƯA chứa `c41e3fd0` trở đi.

## Bước 1: merge main `07dcd57d` vào từng nhánh (không xung đột), rồi push
| PR | Nhánh | SHA cũ | SHA mới | Test | verify / quality / spec-diff --gate |
|---|---|---|---|---|---|
| #1105 | fix/crawl-dropped-rows | 2950420e | 303eab52 | 1.622 | xanh |
| #1110 | fix/tach-bang-con | 5cdc0086 | 73a3db29 | 1.629 | xanh |
| #1111 | fix/tach-bang-con-2 | 763d993c | c44b552f | 1.634 | xanh |
| #1118 | fix/mot-pha-hai-tan-so | 378726b8 | 47d66424 | 1.637 | xanh |
| #1114 | fix/tan-so-dong-khong-ghi | 45e49abe | 22610fcb | 1.637 | xanh |
| #1115 | ma-dong-co-keyof | ab47894d | b8f4c4f7 | 1.629 | xanh |
Mỗi nhánh chồng merge nhánh gốc đã push (#1110 ← #1105; #1111 ← #1110; #1118 ← #1105). Test: `node --test suppliers/*.test.mjs`, 0 lỗi, 0 bỏ qua.

## Bước 2: sửa mô tả PR
#1115 và #1118 đã viết lại cho khớp (#1115: 27 mã MTU, 6 mã Cummins "(M)" để riêng, 31 bản ghi đổi `model`; #1118: `rowPhaseOf`, căn cứ dự phòng, hai ngoại lệ, sửa cột Phase lệch ô). Không ghi tên model.

## Mục thêm của điều phối: hai ngoại lệ số pha (trong #1118, commit 47d66424)
`PHASE_FALLBACK_SKIP` trong `suppliers/config-bot.mjs`: voltgent `P2500-1P` và acepow-fuan n136 → `rowPhaseOf` trả null (không rõ), gói đòi 1 pha thì giữ dòng kèm "cần xác nhận số pha". Không đổi luật chung; test thêm trong `mot-pha-hai-tan-so.test.mjs` (đủ cả hai ca, ca model khác / trang khác vẫn theo luật). Ghi chú ở `suppliers/CLAUDE.md` đã sửa.
Số dòng đổi: **1 + 16 = 17 theo danh sách** `sua-sau-do-luot-3-pha.txt` (căn cứ dự phòng 135 → 118: đuôi -1P 91 → 90, tên trang 44 → 28). CHƯA đo lại 49.637 dòng bằng mã; điều kiện khớp theo `supplierId` + `n` (+ `genset`), nên số dòng thật nên được đo khi điều phối đo lượt.

## Bước 3: tich-hop-luot-4
Gốc `788033dc`; merge theo thứ tự #1105 303eab52, #1110 73a3db29, #1111 c44b552f, #1118 47d66424, #1114 22610fcb, #1115 b8f4c4f7.
Xung đột (2), cả hai đã gỡ giữ ý của hai bên:
1. `suppliers/CLAUDE.md` khi merge #1118: dòng "Dòng máy bị cắt khỏi tiêu đề" bản #1105 còn câu "awt-aiweite 'Dual-band 50/60HZ' đọc thành 60 Hz", bản #1118 đã bỏ câu đó (vì `freqIn` sửa) và thêm ``: `candidates` đọc qua `onePhaseOf` ``. Lấy bản #1118 (đúng với mã), giữ nguyên dòng "Bảng con nối liền" của #1110 ngay sau.
2. `suppliers/config-bot.mjs` khi merge #1114: dòng `rows.push({...})` (#1105 / main thêm `altAsk`, `made`; #1114 thêm `freqAsk: hzV.kind`). Lấy bản #1114 vì nó là bản gồm cả hai.
Kết quả: **1.678 test đạt, 0 lỗi**; `verify.mjs` 436 bản ghi, 0 lỗi; `quality --check` không chỉ số nào xấu đi; `spec-diff --gate` (so `git:788033dc`) đảo vai 0 → 0, thoát 0. Bản đầy đủ: scratchpad của phiên (`sd-l4.*`, không lưu vào sổ).

## Bước 4: worktree
Đã gỡ `wt-sua-l3` (sạch), `wt-sua-l3-goc` (sạch) và `wt-l4` của phiên này. `92a82135` (commit tạm, cha 763d993c + 378726b8) kiểm bằng `git merge-tree`: khác bản gộp tự động của hai cha CHỈ ở 6 dòng dấu xung đột của `suppliers/CLAUDE.md` — không chứa gì chưa có trên các nhánh. Commit chỉ còn trong reflog.

## Chưa làm / lưu ý
- Chưa đo 1.093 lượt top 30 (không thuộc phiên này).
- Nhánh tích hợp thiếu `c41e3fd0`…: nếu đo thì merge main mới vào lại.
- spec-diff dùng `git:origin/main` sập khi `origin/main` đổi `spec-norm.js` so với nhánh (lỗi `r.dims.join`): cần sửa riêng hoặc luôn cố định SHA.
