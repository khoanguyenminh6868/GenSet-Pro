# Nghiệm thu chat-luong-2-1: kiểm chéo toàn bộ bản ghi trong CI (spec-diff)

- PR (draft, KHÔNG tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/899 (nhánh `chat-luong-2-kiem-cheo`, worktree `wt-chat-luong-2`)
- PR thử (đóng, không merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/900 (bỏ `BC164/BC184` khỏi `ALT_CODE`)

## Tệp đã đổi
- `suppliers/spec-diff.mjs` (mới): công cụ + CLI. Mỗi bên là thư mục gốc repo hoặc `git:<ref>` (git archive | tar vào thư mục tạm). Nạp `conversions.js`, `catalog.js`, `spec-norm.js` của từng bên trong một `window` giả riêng (truyền `module` = undefined để catalog.js gắn vào root), nên hai bản mã chạy trong một tiến trình.
  - `diff` + `fullText`: chép nguyên logic `cmpSpec.cjs` (khoá NCC|n|bảng|dòng|loại#k, mọi trường + specs).
  - `swaps`: chép nguyên `swap.cjs`.
  - `verify` / `checkSpec`: chép nguyên `verSpec.cjs`.
  - `normDiff` (thêm): khi `spec-norm.js` / `conversions.js` hai bên khác chữ, so `normalizeRecord` (bỏ `raw`) của mọi thông số mọi bản ghi có ở cả hai bên; gom theo `<mã> có số / mất số / đổi missing / đổi số / đơn vị`. Không có cái này thì PR chỉ sửa spec-norm.js sẽ luôn báo "0 đổi".
  - `markdown`: bảng tóm tắt (theo NCC: dòng đổi / đổi / mất / thêm; mỗi dạng thay đổi ≤ 3 ví dụ ưu tiên NCC khác nhau kèm dòng nguồn; đảo vai theo NCC + danh sách ca MỚI; tự kiểm không xác nhận; chuẩn hoá). Cắt ở 60.000 ký tự.
  - `--gate`: thoát 1 CHỈ khi số ca đảo vai tăng.
- `suppliers/spec-diff.test.mjs` (mới): 8 test.
- `.github/workflows/spec-diff.yml` (mới): `pull_request` với `paths` = `web/catalog.js`, `web/spec-norm.js`, `web/conversions.js`, `suppliers/spec-diff.mjs`, chính workflow. Checkout `fetch-depth: 2`, so `git:HEAD^1` ↔ `.`; job summary + một bình luận PR (dấu `<!-- spec-diff -->`, lượt sau sửa lại) + artifact `spec-diff` (bản đầy đủ, verSpec, danh sách đảo vai). `concurrency` huỷ lượt cũ, `timeout-minutes: 15`.
- `suppliers/CLAUDE.md`: một mục cách dùng.

## Lệnh kiểm đã chạy + đầu ra thật
1. Đối chiếu với script gốc trên 7b3ba722^ ↔ 7b3ba722 (rút bằng `git archive` hai bản `web/catalog.js` + `suppliers/cn`; PR #894 không đổi `suppliers/cn`):
   - Script gốc: `node cmpSpec.cjs A B ref-cmp.txt` → `bản ghi cũ 58999, mới 59222 | khác 2101 | chỉ cũ 8, chỉ mới 231 | bảng có đổi 372`; `swap.cjs A` → `tổng: 211`; `swap.cjs B` → `tổng: 3`; `verSpec.cjs A B` → `cần soát tay: 416`.
   - Công cụ mới (scratchpad `cmp.mjs`): `swap 211 3 ver fails 416`; `cmp ref-cmp.txt new-cmp.txt` → giống hệt (CMP-IDENTICAL); `diff ref-swapA.txt new-swapA.txt`, `ref-swapB`, `ref-ver` → không khác dòng nào.
   - Lưu ý: `cmpSpec.txt` trong `dau-vao\ra-soat-lech-dong-cot\` là lần so CUỐI trong PR #894 (59.224 → 59.222, chỉ 2 bản ghi tecnogen SCP8610), không phải cả PR. 2 bản ghi đó có trong bản đầy đủ của cặp cả PR (`[tecnogen n2004 bảng 3]`, MẤT bản ghi engine SCP8610 ×2), khớp.
2. `node --test suppliers/spec-diff.test.mjs` → `# pass 8 # fail 0` (~2 giây).
3. `node suppliers/spec-diff.mjs git:origin/main . --gate` trên nhánh → `bản ghi cũ 59222, mới 59222 | khác 0 ...`, `đảo vai: 3 → 3`, thoát 0, 70 giây trên máy này.
4. PR thử tại máy: `git:chat-luong-2-kiem-cheo .` → `khác 104 | chỉ cũ 8`, `đảo vai: 3 → 36` (acepow 33 alternator←engine), thoát 1.
5. CI: xem mục "Kết quả CI" dưới.

## Số đo trước / sau
| Chỉ số | Đo |
|---|---|
| Cặp PR #894: bản ghi | 58.999 → 59.222 (đo, giống script gốc) |
| Cặp PR #894: đảo vai | 211 → 3 (đo, giống `swap.cjs`) |
| Cặp PR #894: tự kiểm cần soát tay | 416 (đo, giống `verSpec.cjs`; báo cáo cũ ghi 29 là riêng việc 2) |
| Thời gian một lượt | 70–105 giây máy này; 24–31 giây cả job trên CI (đo) |

## 3 mẫu đối chiếu (dòng nguồn trong `suppliers/cn`, bảng tóm tắt của cặp PR #894)
- fukangsi-yangzhou n2008 bảng 16: dòng `| FKS-50GF | 50 | 62.5 | 90 | DB58 | ...` → `current thêm ∅ → 90` (90 A ≈ 1,44 × 62,5 kVA, tự xác nhận).
- kangwo-guangdong n101 bảng 0: dòng `| GKW-18GF | 18 | 22.5 | 32.4 | YC2108D | ...` → `current thêm ∅ → 32.4`.
- tecnogen n2004 bảng 3 dòng 14: `| SA1100TSX-D20 1 | ... | 2 x DC13 072A 02 14 | ... | SCP8610 |` → MẤT bản ghi engine SCP8610 (tủ điều khiển bị đọc làm động cơ, đúng như báo cáo PR #894).

## Kết quả CI
- #899 (chính PR này, mã đọc không đổi): `spec-diff` pass 24 giây (https://github.com/khoanguyenminh6868/GenSet-Pro/actions/runs/44203656346), `suppliers` pass (có chạy test mới), `server` pass. Bình luận: "main (bb82a3c3) ↔ PR #899 (e3d5efa6) … 59.222 → 59.222; 0 đổi … 3 → 3 ✅ … Không có bản ghi nào đổi."
- #900 (PR thử, base = nhánh #899, bỏ BC164/BC184 khỏi `ALT_CODE`): `spec-diff` FAIL 31 giây (https://github.com/khoanguyenminh6868/GenSet-Pro/actions/runs/44203810329) đúng như mong: bình luận "59.222 → 59.214; 104 đổi, 8 mất … 3 → 36 ❌ TĂNG (chặn)", bảng NCC acepow-fuan 112, dạng `model` 104 / `other` 86 / `MẤT bản ghi` 8 kèm dòng nguồn, bảng đảo vai (acepow alternator←engine 0 → 33) và 8 ca mới. Khớp lượt chạy tại máy. `suppliers` cũng đỏ (test catalog, đúng).
- Đẩy commit rỗng lần hai lên #900: vẫn MỘT bình luận của github-actions[bot], tiêu đề đổi sang commit mới (5be96737) → sửa lại đúng, không tạo bình luận mới.
- #900 đã đóng, xoá nhánh `chat-luong-2-thu` và worktree thử.
- Thời gian trên CI: 24–31 giây cả job (nhanh hơn máy này).

## Rủi ro còn lại + quay lui
- Thời gian CI ~1,5–2 phút / PR sửa mã đọc (chỉ PR đổi 3 tệp web đó). Quay lui: xoá `.github/workflows/spec-diff.yml` (công cụ vẫn dùng tay được).
- Bình luận PR cần `pull-requests: write`; PR từ fork không ghi được (bước để `continue-on-error`, vẫn có job summary).
- Workflow lọc theo `paths` → PR dữ liệu bot (`suppliers/cn/*`) không có check này, `mergeWhenGreen` (`gh pr checks --watch --fail-fast`) không chờ. Nếu ai đặt check `spec-diff` thành bắt buộc trong branch protection thì PR dữ liệu sẽ kẹt "Expected": đừng đặt (đã ghi trong `suppliers/CLAUDE.md`).
- Khoá bản ghi theo vị trí (n | bảng | dòng | loại + số thứ tự): một PR thêm / bớt một bản ghi giữa dòng làm các bản ghi sau cùng dòng lệch số thứ tự, hiện thành "đổi" (giống script gốc).
- Chặn chỉ theo TỔNG số ca đảo vai: PR sửa 5 ca và làm sai 3 ca mới vẫn xanh; bảng tóm tắt có mục "Ca đảo vai MỚI" để thấy.

## Việc chưa kiểm được
- Top 30 ứng viên không đo trong CI (theo brief); vẫn đo tay bằng `gopWhy2` / `gopRow`.
- Phần chuẩn hoá (`normDiff`) chỉ thử bằng test (bản spec-norm giả đổi đơn vị khối lượng), chưa có PR spec-norm thật để xem.

## Cần ghi nhớ
- Công cụ thay ba script tay: `node suppliers/spec-diff.mjs git:origin/main . --out full.txt --md tom-tat.md`. Bộ nhớ `kiem-cheo-toan-bo.md` có thể trỏ sang công cụ này thay `cmpSpec/verSpec/swap` (phiên điều phối quyết).
