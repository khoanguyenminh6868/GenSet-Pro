# Gộp mã viết hai cách (7 nhóm, Khoa 24/11/2026)

Nhánh `gop-trung-ma` (worktree `wt-gop-trung-ma`, từ `origin/main` `2e678d48`). PR nháp, KHÔNG đo top 30 (Khoa: đo một lần sau).

## Đã làm
- `web/catalog.js`: thêm 6 mục "ô=mã" vào `ENGINE_CELL_LIST` (nhóm 9, 10, 12, 15, 18, 20) kèm chú thích căn cứ; thêm bảng `ALT_CELL_LIST` nhỏ (1 mục: `ECP 28-M/4C` → `ECP28 M4C`, nhóm 2) và cho `splitEngineCells` tra bảng đó với `kind === "alternator"`. Không luật chung.
- Không gộp: nhóm 22–28, 9 nhóm chưa đủ bằng chứng (kể cả 17 `NT855D(M)`), 6 mã "-G…(M)", nhóm 4 và 21 (chưa quyết).
- Test mới `suppliers/gop-trung-ma.test.mjs`: 6 cặp gộp, 6 mã "-G…(M)" + `NT855-D(M)` giữ nguyên, ECP28-2S/4C và ECP32-2S/4C giữ nguyên.

## Kiểm (gốc cố định `git:2e678d48…`)
- `spec-diff`: 62.160 → 62.160 bản ghi, **20 đổi**, 0 mất, 0 thêm; chỉ trường `model` đổi (số liệu giữ nguyên); đảo vai 0 → 0. Đúng 7 nhóm: mecca-power 7 (KTA19-D(M) 3 + KTA38-D(M) 4), walter-yangzhou 6 (KTA19 2, KTA38 3, NTA855 1), endress 4 (đầu phát ECP 28-M/4C: n113, n114, n1013, n1024), acepow n114 1, frs-shenyang n106 1, kangwo n108 1. 16 động cơ + 4 đầu phát. Báo cáo ước "4+4" đầu phát = số lần dùng cả hai khoá; 4 bản ghi còn lại ("ECP28 M4C" n133, n140, n144, n148) đã mang khoá đích nên không đổi: không lệch.
- `spec-value-check`: nhóm trùng mã 28 → 21 (còn: ^/★ 37 cố ý, ngoặc (M)/(E) 10, còn lại 11), không nhóm mới.
- `quality.mjs --check`: không chỉ số nào xấu đi.
- Test: xem PR (CI) và kết quả `node --test` toàn bộ ở báo cáo của phiên.
- Đầu ra đo: `genbid-work\gop-trung-ma-out\` (ngoài git).
