# Ghi chú "xác nhận đời (MK)" lặp 3 lần — đường gây, quét, dọn (24/11/2026, máy KhoaMiniPC)

PR https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1189 (nhánh `mk-lap-3`, worktree `wt-mk-lap-3` từ origin/main 83ec53ec): ready, chưa merge.

## Đã dọn web (24/11/2026 ~15:17, điều phối duyệt)
- Bản gốc trước khi ghi: `nghiem-thu\mk-lap-3-backup\configmatch-IB2600601812.json`, `configmatch-IB2600603983.json`.
- `node suppliers/dedupe-notes.mjs --key IB2600601812 --write` (bỏ 124 câu MK ở 62 ghi chú), `--key IB2600603983 --write` (bỏ 7 câu BMS ở 7 ghi chú); mỗi lần `{"written":1}`.
- Quét lại toàn bộ (chỉ đọc): 18 gói, 0 gói có lặp.
- So với backup (từng trường, script `backup.mjs --diff` ở scratchpad phiên): IB2600601812 62 trường khác, IB2600603983 7 trường khác, TẤT CẢ là chuỗi `note` ngắn đi; doc web = đúng bản backup sau `dedupeMatch`; `at` giữ nguyên.
- Còn lại (ngoài phạm vi, KHÔNG dọn): quét chung thấy IB2600603983 có 1 chuỗi lặp mảnh "tự động khi mất lưới (AMF) theo datasheet hãng;" (có từ trước khi dọn, không phải câu MK / BMS).

## 1. Đường gây (ĐÃ XÁC NHẬN bằng bằng chứng): không phải bot, là hai phiên tính lại bằng tay

| Bước | Lúc (giờ VN) | Câu MK trên cả gói | Bằng chứng |
|---|---|---|---|
| Lượt bot `config 16060` | 13/11 00:31–00:41 (đăng 12/11 17:39:27Z) | 62 (1×) | `genbid-bot-logs\bot-2026-11.log` dòng 2735; log agent `%TEMP%\genbid-config-IB2600601812.log`: agent viết `result.json` mới bằng `scripts/build.mjs` (chỉ đọc requirements.json, controllers.md), không đọc `result.checked.json`; code ff502d93 (reflog checkout chính: pull 00:08, 00:30 b18bc382 không đổi config-bot) chỉ gọi `check` một lần (`checkDir`); không có cấu hình giữ từ Tìm NCC nên `keepFound` không chạy `check`. `genbid-test\configmatch-601812-before-recheck.json` (bản web chụp 01:10) = 62. |
| Phiên PR #601 (datasheet dọc Hyundai) | 13/11 01:09 | 124 (2×) | `genbid-test\recheck-601812.mjs` gọi `B.check` trên bản web → `configmatch-601812-recheck.json` = 124; bản web chụp lúc 05:41 (`configmatch-601812-before-brand.json`) có check / phần / ghi chú GIỐNG HỆT tệp này ⇒ phiên #601 đã đăng nó. |
| Phiên PR #602 (brandLicensed) | 13/11 05:38–05:41 | 186 (3×) | `recheck-601812-brand.mjs` → `configmatch-601812-brand.json` = 186, check / phần / ghi chú GIỐNG HỆT bản web hiện tại; `updated_at` của doc = 2026-11-12T22:41:46Z, 10 giây sau merge #602 (22:41:36Z); check trên web có trường `licensed` / `licensedNote` chỉ code #602 sinh ra; thân PR #602 ghi "Tính lại IB2600601812". |

Cả hai lần đăng GIỮ `at` 17:39Z nên trông như kết quả của lượt bot. Transcript hai phiên không còn trên máy (chỉ còn tệp trong `genbid-test`); không thấy script đăng, nhưng nội dung web khớp đúng hai tệp đầu ra.

**Còn gây hại khác ngoài lặp chữ?** Đường là thao tác tay, không còn trong code bot (#1080 đã làm `check` lũy đẳng). Nếu lặp lại: (a) web hiện `at` cũ dù nội dung do code mới chấm; (b) hai script gọi `check` với `readWeb: () => null` (cấu hình nguồn internet thành chưa rõ; gói này không có cấu hình internet nên không ảnh hưởng) và danh mục NCC lúc đăng. Không sửa code cho việc này; ghi bẫy vào `suppliers/CLAUDE.md`.

## 2. Quét MỌI configmatch (18 gói trên web)

Hai cách: (1) `dedupe-notes.mjs` tìm câu MK lặp và dòng "Kiểm tra bằng code" giống hệt; (2) quét chung mọi câu (> 25 ký tự) lặp trong một chuỗi và mọi phần tử mảng chuỗi trùng.

| Gói | Lặp | Ghi chú |
|---|---|---|
| IB2600601812 | 124 câu MK thừa ở 62 ghi chú (cấu hình #1 AMF9, #4 AMF25, #5 / #6 DSE7320) | đường ở mục 1 |
| IB2600603983 | 7 câu "BMS qua Modbus/SNMP, cần NCC xác nhận." thừa ở 7 ghi chú (mỗi cấu hình 1, `checks[40/50].parts[5]`) | KIỂU KHÁC, lượt bot 21/11 11:44Z (`at` = `updated_at`): `config-prompt.md` bảo agent ghi câu này, `commWords` (ctl-module.mjs) nối thêm mà không xem đã có → lặp ngay trong một lượt. **Đã sửa** trong PR. |

16 gói còn lại: 0 lặp. Không gói nào có dòng `notes[]` "Kiểm tra bằng code" trùng.

## 3. Dọn: `suppliers/dedupe-notes.mjs` (trong PR)

- Mỗi chuỗi `note` của check, phần, `codeWas`: mỗi câu MK khác nhau giữ một (câu đầu, đúng chỗ), câu BMS giữ một; `notes[]` bỏ dòng "Kiểm tra bằng code" GIỐNG HỆT (dòng khác số giữ nguyên). Không đổi trường nào khác, giữ `at`.
- `node suppliers/dedupe-notes.mjs` = chỉ đọc (đã chạy 24/11: kết quả như bảng trên). `--write` ghi (5 doc một lần qua `post`). `--key IB…` một gói, `--verbose` liệt kê từng chỗ.
- Test `suppliers/dedupe-notes.test.mjs` 3/3; `ctl-module.test.mjs` thêm ca agent đã ghi câu BMS.

## Đã kiểm
- Test ctl-*, check-idempotent, regress-config, dedupe-notes: 63/63.
- So bản web với tệp trong `genbid-test` theo (rank, động cơ, mọi check: item, status, note, phần) — script `cmp.mjs` ở scratchpad phiên.

## Chưa kiểm / chưa làm
- Chưa ghi web (chờ duyệt). Sau khi ghi: chạy lại `dedupe-notes.mjs` phải ra 0.
- Không chạy toàn bộ `node --test suppliers/*.test.mjs` (chỉ các tệp liên quan).
- Không chép gì sang `genbid-hsmt\` (không đổi tệp bot đang chạy; config-bot đọc từ checkout chính sau merge).
