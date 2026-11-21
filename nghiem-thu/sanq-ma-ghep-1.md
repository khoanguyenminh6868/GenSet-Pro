Kết luận: spec-diff so ab5c5e07: 61.229 → 61.199 bản ghi, mất đúng 30 bản ghi động cơ sanq, 0 đổi, 0 thêm, đầu phát 0 đổi, NCC khác 0 đổi, đảo vai 0 → 0; test 1500/1500.

# sanq-ma-ghep-1: ô động cơ "TAD1650GE(1345GE)" là một ô ghi hai mã (21/11/2026)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1020 — nhánh `sanq-ma-ghep`, commit **d310875a**, gốc **ab5c5e07** (đầu `doc-ma-2`, #1017). KHÔNG tự merge, không đo top 30. Sau khi #1017 merge: gộp main vào nhánh này rồi đo.
Tệp soát: `genbid-work\dieu-phoi\dau-vao\sanq-ma-ghep\` (`sd.txt`, `sd.md`, `sd.log`, `test-full.txt`, `quality.txt`, `rowflags.txt`).

## Quyết định
Khoa 21/11/2026 chọn "A" (qua điều phối): dòng không cho bản ghi động cơ, ghi note; GIỮ bản ghi đầu phát.

## Tệp đã đổi
- `web/catalog.js`: `TWO_CODE_CELLS` (danh sách tường minh: sanq-power, n111 + n117, mẫu `^[A-Z]+\d+([A-Z]+)\(\d+\1\)$`) + nhánh ở chỗ đẩy bản ghi động cơ.
- `suppliers/sanq-ma-ghep.test.mjs` (mới, 4 ca, dòng thật SQV500).
- `web/CLAUDE.md`: bổ sung mục doc-ma-2 (3).

## Phạm vi mẫu
Quét MỌI ô của mọi bảng trong `suppliers/cn` bằng mẫu trên: chỉ sanq-power n111 (15) và n117 (15). Ngoặc khác (`4BTA3.9-G2(G45E1)`, `6M33G8D3/5 (6M33G825/5)`, "(国三)"…) không khớp.

## Số đo (đo thật, so ab5c5e07)
| chỉ số | trước | sau |
|---|--:|--:|
| bản ghi | 61.229 | 61.199 |
| đổi / mất / thêm | | 0 / 30 / 0 |
| bảng có đổi / NCC | | 2 / 1 (sanq-power) |
| đảo vai | 0 | 0 |
| note "một ô ghi hai mã" | 26 | 56 |
| row-flags cờ / loại | 144 / 5 | 144 / 5 |

- 30 bản ghi mất: toàn bộ là động cơ, 15 mã × 2 bảng; liệt kê đủ cạnh dòng nguồn trong `sd.txt`.
- Sau sửa, n111 và n117 mỗi bảng còn 15 bản ghi, đều là đầu phát (`probe.mjs`); spec-diff báo 0 bản ghi đổi nên `other` của đầu phát vẫn giữ nguyên chữ ô động cơ.

## Lệnh kiểm + đầu ra thật
- `node suppliers/spec-diff.mjs git:ab5c5e07 . --out sd.txt --md sd.md` → `bản ghi cũ 61229, mới 61199 | khác 0 | chỉ cũ 30, chỉ mới 0 | bảng có đổi 2`, `đảo vai: 0 → 0 | tự kiểm: cần soát tay 0`.
- `node --test suppliers/*.test.mjs web/test/*.test.mjs` → `# tests 1500 # pass 1500 # fail 0`.
- `node suppliers/quality.mjs --check` → "không chỉ số nào xấu đi quá ngưỡng".
- `node suppliers/row-flags.mjs` → `bản ghi 61199 …, bị gắn cờ 144, trong đó bị loại (mức drop) 5`; sanq 2/1180 → 2/1150.

## Ba mẫu đối chiếu nguồn (bản lưu `suppliers/sources/sanq-power`, chưa mở lại URL)
1. n111, http://www.gz-sanqpower.com/Volvo-penta/Powered-by-Volvo-penta.html (Accessed 2026-10-28): "| SQV500 | 400/500 | 360/450 | TAD1650GE(1345GE) | Sweden | HCI544C |…" → không động cơ, đầu phát HCI544C.
2. n117, http://www.gz-sanqpower.com/wew/Powered-by-Volvo-penta-cn.html (Accessed 2026-10-28): "| SQV145 | 114/145 | 105/130 | TAD750GE(532GE) | Germany | UCI274E |…" → không động cơ, đầu phát UCI274E.
3. n117, cùng trang: "| SQV688 | 550/688 | 500/625 | TWD1653GE(1643GE) | Sweden | HCI544FS |…" → không động cơ, đầu phát HCI544FS.

## Rủi ro + quay lui
- 30 dòng ứng viên của sanq (Volvo) rời Gợi ý, gồm cả 13 / 15 cặp mà NCC khác ghi cùng dung tích cho hai mã: đúng phương án A, chủ ý. Dự kiến hết lọt trần ở IB2400236068#0, **chưa đo**.
- Bản ghi đầu phát còn `other` = "TAD1650GE(1345GE)". Chưa đo `candidates`, top 30 sẽ cho biết.
- Quay lui: `git revert d310875a`. Không đổi dữ liệu `cn/`.

## Chưa kiểm
Top 30 (điều phối đo). md5 `build()` không so riêng. URL nguồn không mở lại. `bind_pr` của app bị chế độ tự động từ chối nên phiên này không theo dõi CI của #1020 qua thanh PR.

## Cần ghi nhớ
- Khoa 21/11/2026: lỗi 3 sanq = "A" (giữ đầu phát, không theo tiền lệ bỏ cả dòng).

## Cập nhật 21/11/2026: đã gộp main sau #1017
Đầu nhánh `c1893236`, so `589596ed`: diff 3 tệp (`web/catalog.js`, `web/CLAUDE.md`, `suppliers/sanq-ma-ghep.test.mjs`), `^` giữ như main. spec-diff 61.229 → 61.199: 0 đổi, 30 mất (đều động cơ sanq), 0 thêm, đảo vai 0 → 0. `suppliers/*.test.mjs` 1368/1368, `quality --check` đạt. Top 30 chưa đo.
