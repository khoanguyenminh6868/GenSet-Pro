# Nghiệm thu H1 — test prep / findPrep / specPrep / specPost / pdfToText (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/683 (nhánh `test/h1-prep`, worktree `wt-test-h1-prep`), KHÔNG tự merge.

## Tệp đã đổi
- `suppliers/config-bot.mjs` (+32 / −22): chỉ thêm tham số tiêm phụ thuộc, mặc định = như bot chạy. Diff đầy đủ: `test-h1-prep-tools\config-bot.diff`.
- `suppliers/cover-prep.test.mjs` (mới, 34 ca, ~1,7 s).
- `suppliers/CLAUDE.md` (+1 dòng: tham số io, và bẫy web giả cùng tiến trình phải trả `Connection: close`).

## Mã đã tách (tóm tắt diff)
| Hàm | Trước | Sau (mặc định) |
|---|---|---|
| `pdfToText(file)` | `execFileSync("pdftotext", …)` | `pdfToText(file, exec = execFileSync)` |
| `sizesFor(key, bidName)` | `doc(…)` | `sizesFor(key, bidName, read = doc)` |
| `hsmtTextOf(key)` | `doc(…)` | `hsmtTextOf(key, read = doc)` |
| `prep(...)` (không export) | `doc`, `allDocs`, `ROOT/cn`, `process.env.GENBID_LOCAL_SUPPLIERS`, `WEB_MEMO_DIR`, `new Date()` | `export prep(key, dir, reqData, given, multi, io = {})`; io = { doc, allDocs, supDir = ROOT/cn, local = !!env, memoDir = WEB_MEMO_DIR, today = hôm nay UTC } |
| `findPrep(key, dir, req, suppliers)` | — | thêm `io = {}`, chuyển cho `sizesFor` và `prep` |
| `specPost(dir, suppliers, req)` | — | thêm `io`, chuyển cho `addToCatalog` |
| `addToCatalog(dir, key, suppliers, opts)` | `git`, `post`, `execFileSync(gh)`, `mergeWhenGreen` | `opts.io` = { git = gitRun, post, gh, merge = mergeWhenGreen, repo = GENBID_REPO_DIR \|\| ROOT/.. } (hàm `git` đổi tên `gitRun`, chỉ dùng trong addToCatalog) |

Không đổi thứ tự gọi, chuỗi in ra, tệp ghi. Các nơi gọi cũ (answer, find, specJob, CLI) không truyền io → mặc định.

## Bằng chứng không đổi hành vi (đo, không ước tính)
Cách đo (`test-h1-prep-tools\measure.mjs`): web giả cục bộ (http 127.0.0.1) dựng từ bản cố định doc-cache chụp 13/11 trước khi đo
(md5 `analysis.json` de927c12…, `supplier.json` 4d04316b…, `supexcl.json` a4a70081…), chữ HSMT = `hsmtText` của `fixtures/runs/<TBMT>`;
`GENBID_DOC_CACHE` trỏ thư mục tạm (không ghi doc-cache thật), token giả, không gọi agent, không post.
- `config-bot.mjs prep --key K --out D` với `GENBID_LOCAL_SUPPLIERS=1` cho 5 gói IB2600586587, IB2600592684, IB2600594596, IB2600601812, IB2600603983 + `--size 1`, `--size 2` của IB2600592684;
- `findPrep` 3 lượt: IB2600586587 (một cỡ), IB2600592684 (nhiều cỡ, target không cỡ), IB2600592684 (target 30 kVA);
- `specPrep` 2 NCC: kaichen-jiangsu, cps-generators.

Kết quả: **183/183 tệp trùng md5** trước/sau; JSON in ra của 7 lượt CLI và thông tin trả về của findPrep trùng nguyên văn.
Bảng md5 (8 ký tự đầu, đủ ở `md5-table.json`, `md5-before.json`, `md5-after.json`):

| Thư mục lượt | số tệp | trùng | tệp chính |
|---|---|---|---|
| find-IB2600586587 | 10 | 10 | catalog.md d33db7e3, hsmt.txt 257aa5a9, input.md d539805a, meta.json c7397cfa, suppliers.json 326706f6 |
| find-IB2600592684 (target 30 kVA) | 10 | 10 | catalog.md 0a3d7150, hsmt.txt 3edee018, input.md 4fc6d423, meta.json 6b183026, suppliers.json 326706f6 |
| find-IB2600592684 (mọi cỡ) | 10 | 10 | catalog.md 0a3d7150, hsmt.txt 3edee018, input.md c66e28f9, meta.json d9bf4d8b, suppliers.json 326706f6 |
| prep-IB2600586587 | 18 | 18 | catalog.md 3b233d23, hsmt.txt 257aa5a9, input.md 3bf54be6, meta.json 58e18e1e, suppliers.json 2240d653 |
| prep-IB2600592684 | 21 | 21 | catalog.md 5a674321, hsmt.txt 3edee018, input.md da262cfa, meta.json 58e18e1e, suppliers.json 2240d653 |
| prep-IB2600592684 --size 1 | 19 | 19 | catalog.md b1278f5b, input.md c1f4c6bf, meta.json 805b809c |
| prep-IB2600592684 --size 2 | 21 | 21 | catalog.md 53724bfe, input.md d572f3bc, meta.json 805b809c |
| prep-IB2600594596 | 21 | 21 | catalog.md ae5bc2cf, hsmt.txt 9589a68f, input.md 5b2b35f8 |
| prep-IB2600601812 | 22 | 22 | catalog.md d6a64212, hsmt.txt 465451b6, input.md f62f90de |
| prep-IB2600603983 | 21 | 21 | catalog.md 3ca4b255, hsmt.txt f9340297, input.md 1ba49a6a |
| spec-cps-generators | 5 | 5 | input.md 8aefac28, meta.json 120ad5a6, suppliers.json 326706f6 |
| spec-kaichen-jiangsu | 5 | 5 | input.md 4140140d, meta.json 1368c4c1, suppliers.json 326706f6 |

(Các tệp còn lại mỗi thư mục: catalog-N.md / input-N.md, read-order.json, models.json, controllers.md, ctl-lookup*.md, specs.json, prompt.md, supplier.json.)
Đo "sau" trên commit trước rebase; rebase lên origin/main không chạm `config-bot.mjs` (main không đổi tệp này giữa chừng).

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/cover-prep.test.mjs` → `# pass 34  # fail 0  # todo 0  duration_ms 1691`
- `node --test suppliers/*.test.mjs` (sau rebase) → `# tests 818  # pass 818  # fail 0  # todo 0`; `git status` sạch ở `suppliers/fixtures/runs` (mẫu hồi quy không đổi).
- CI PR #683: xem trang PR 4 xanh, 1 bỏ qua, 0 đỏ (mergeable, CLEAN).

## Ca test (34, không todo)
- pdfToText (4): đối số `-table -enc UTF-8 <tệp> -`, bộ đệm ≥ 64 MB, chữ Việt/Trung; poppler không có `-table` → `-layout`; thiếu chương trình (ENOENT) → ném lỗi; PDF scan → "" và không thử `-layout` (khoá hành vi).
- findPrep (10): một cỡ (meta, prompt = find-prompt.md); dải bandOf 398 / 480 vào, 390 / 481 ra (400 kVA); ≤ 30 kVA tới 140 % (42 vào, 43 ra); HSMT không đòi G7/G20 → ứng viên chỉ NCC Trung Quốc nhưng danh sách "NCC trong hệ thống" đủ mọi NCC; nhiều cỡ không target → cap danh sách; target → một cỡ, đúng động cơ / đầu phát / bộ điều khiển, danh mục xếp cho cỡ đó; target cỡ lạ → mọi cỡ (khoá hành vi); target không model động cơ → bỏ qua; xoá read-order.json / phần cắt; gói chưa có chữ HSMT → lỗi.
- prep (5): kho tệp bỏ NCC loại trừ on:true + xoá mềm, giữ NCC bỏ loại trừ, bỏ incomplete; không đọc được danh sách loại trừ → cảnh báo, không bỏ ai; tệp lượt Gợi ý (hsmt.txt, specs.json, read-order, prompt); dùng lại requirements khi cùng reqHash (Khoa 02/11), HSMT đổi thì đọc lại; một cỡ của gói nhiều cỡ (sized).
- specPrep (5): tệp lượt, prompt = SKILL.md bỏ frontmatter (có quy tắc tier C 12/11); không website → vẫn chuẩn bị (khoá hành vi); đã có > 80 bảng → cắt, chỉ chỗ xem tiếp (khoá hành vi); chưa có gì → 4 chỗ "(chưa có)"; id không có → lỗi, không xoá thư mục cũ.
- specPost (10): qua verify + trang chính NCC → đăng 1 lần, nguồn đánh số 2001, PR `specs/<id>`, merge watcher; trang bên bán tier C ngoài tên miền → bỏ nguồn và bảng dựa trên nó, ghi lý do; chỉ trang bên bán → không đăng, không git; tier C trên tên miền NCC → vẫn đăng; verify trượt / trang chưa lưu / id khác / không có gì mới / thiếu newCatalog.json → không đăng; mục của NCC khác bị lọc; gh lỗi → vẫn đăng web, ghi prError.

## Hàm xuất ra chưa test nào nhắc tới (đếm tên trong mã test, bỏ dòng chú thích; `test-h1-prep-tools\count.mjs`)
- config-bot.mjs: 142 tên export. Trước (không tính tệp mới): 7 — prep, pdfToText, originChecks, addToCatalog, findPrep, specPrep, specPost. Sau: **2** — `originChecks` (ngoài phạm vi H1), `addToCatalog` (được chạy thật qua specPost trong 10 ca nhưng không gọi tên trực tiếp).
- Lưu ý: header của `cover-config.test.mjs` (T2) còn ghi "Không phủ: pdfToText, findPrep, specPrep, specPost" — tệp của việc khác, không sửa; đếm theo chú thích sẽ ra 0.

## 3 mẫu đối chiếu nguồn gốc (quy tắc nghiệp vụ → nơi ghi)
1. Dải công suất: `config-bot.mjs` chú thích trên `inBand`: "the same as the candidates of catalog.md, NEAR_LOW (100% less the 0.5% of rounding) to NEAR_HIGH (120%; 140% up to 30 kVA, bandOf)" (Khoa 12/11).
2. Trang bên bán: `config-bot.mjs` trên `sellerPage`: "A page of a seller (tier C and not on its make's own domain, Khoa 2026-11-12…) is no source of the catalog".
3. Loại trừ NCC: `sup-skip.mjs`: "NCC đã Loại trừ trên web (supexcl/<id> {on:true}) hoặc xoá mềm (supdeleted/<id>) không được xuất hiện ở đầu ra nào của bot (Khoa 2026-11-11)".

## Rủi ro còn lại + quay lui
- Rủi ro thấp: mọi tham số mới có mặc định = biểu thức cũ, đo 183 tệp trùng. Bot chạy `config-bot.mjs` từ checkout chính sau merge; tiến trình `config-bot.mjs run` đang chạy giữ mã cũ tới khi thoát.
- Quay lui: revert squash commit của PR #683 (chỉ 3 tệp).

## Chưa kiểm được
- Đường `addToCatalog` thật (git worktree, push, `gh pr create`, mergeWhenGreen) không chạy trong đo trước/sau (sẽ tạo PR thật); chỉ đọc lại diff: chỉ đổi tên `git`→`gitRun` và đi qua biến io mặc định.
- `findPrep` chạy bằng đường `run` (Tìm NCC qua agent) không chạy (tốn agent); đo bằng gọi trực tiếp findPrep.
- Chữ HSMT trong đo là `hsmtText` của fixture (một khối, không notice), không phải dữ liệu web hiện tại; đủ cho so trước/sau.

## Cần ghi nhớ / cần quyết
- Brief nói "specPrep dừng sớm khi NCC không có website / đã có đủ bảng": mã KHÔNG có điểm dừng này (specPrep luôn chuẩn bị; việc lọc NCC là của `spec-todo.mjs --mark` / gaps.mjs, agent tự quyết theo skill). Test khoá hành vi hiện tại; nếu Khoa muốn chặn sớm (không website → không chạy agent) thì là việc sửa mã riêng.
- Bẫy mới (đã ghi `suppliers/CLAUDE.md`): web giả http chạy cùng tiến trình với config-bot phải trả `Connection: close`, nếu không fetch dùng lại socket đã đóng, `sizesFor` nuốt lỗi và gói nhiều cỡ thành một cỡ (đã gặp khi đo).
