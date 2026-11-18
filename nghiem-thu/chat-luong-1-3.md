# Nghiệm thu: Chất lượng 1, chặng 2 — B(iii) (nối cờ dòng vào Gợi ý cấu hình)

PR NHÁP https://github.com/khoanguyenminh6868/GenSet-Pro/pull/929 (commit 6fa190ef, trên origin/main d220b145), chưa merge. Worktree `wt-chat-luong-1c`, nhánh `chat-luong-1c`. Đang giữ `suppliers/config-bot.mjs` tới khi #929 merge.

## Đã làm
- `suppliers/row-flags-lib.mjs` (mới): luật cờ, tách khỏi `row-flags.mjs`.
  - `config-bot.mjs` import lib và đưa hàm vào bằng `useBot`. Lý do: `row-flags.mjs` import `config-bot.mjs`, nên nếu config-bot import ngược thì vòng import cộng top-level await làm node thoát 13 (bẫy đã có trong `suppliers/CLAUDE.md`).
  - `row-flags.mjs` còn dòng lệnh, `--post`, và re-export lib; workflow vẫn gọi như cũ.
- `blockedRows(S, rowok, webRows)`: trả về khoá CẢ DÒNG bảng (NCC | băm chữ dòng) bị loại.
  - Bị loại: dòng mức loại (absurd) chưa "cho dùng", và dòng bị "bỏ hẳn" (có cờ hay không).
  - Khoá NCC khác ghi nhầm vào doc của NCC này thì không áp.
- `config-bot.mjs`:
  - `prep` đọc `rowflags/current` (`rowFlagsOf`) và `rowok` (`rowOkOf`) rồi truyền `blocked` vào `candidates`.
  - `candidates` bỏ dòng (`dropped` có `ruled: ["rowflag"]`), kể cả model HSMT nêu đích danh. Lý do: dữ liệu dòng sai, không phải động cơ sai; các dòng khác của cùng model vẫn còn.
  - Thông số của dòng vẫn ở `facts` (số đông, chấm đạt) để không dòng nào đổi điểm.
  - Không truyền `blocked` thì như cũ.
- Web:
  - Bỏ `ROWFLAGS_IN_CONFIG`. Chip ghi "Bị loại khỏi gợi ý", kèm câu "Quyết định áp cho các lượt Gợi ý cấu hình chạy sau đó."
  - Quyền: chỉ Superadmin (Khoa 18/11/2026), đã ghi ở chú thích và `web/CLAUDE.md`.
  - `rowflags` thêm vào `READABLE` của `web/api/requests.js`.

## Chỗ khác thiết kế / khác đề xuất B(i)
1. **Bot ĐỌC `rowflags/current`, không tự tính.** Đề xuất B(i) số 3 là ngược lại; em đổi vì đo thấy `flagRows` mất 42 giây mỗi lượt `prep` (riêng `recordsOf` 22 giây, đọc lại mọi bảng). Doc do workflow tính trên đúng dữ liệu NCC mà bot đọc từ web, vì cùng một workflow đăng cả hai. Đã kiểm trên toàn bộ `suppliers/cn`: `blockedRows` từ doc = tự tính (48 = 48, giống từng khoá), cả với doc #924 trước merge.
   Dự phòng: đọc lỗi (trước khi `web/api/requests.js` mới lên Vercel thì bot nhận lỗi vì `rowflags` chưa trong `READABLE`) hoặc chạy `GENBID_LOCAL_SUPPLIERS=1` thì tự tính, có in CẢNH BÁO.
2. **Quyết định áp theo DÒNG, không theo bản ghi.** Thông số đọc theo dòng nên một số vô lý gắn cờ cả bản ghi động cơ LẪN đầu phát của dòng (ví dụ test: dung tích 3800 L có cờ ở cả KTA38-G2 và S5L1D-H41).
   - Web: mỗi dòng bảng là một mục, ghép động cơ · đầu phát. Bấm một nút áp cả dòng; bấm lại thì xoá mọi quyết định của dòng.
   - Lib: hai quyết định khác nhau trong một dòng thì "bỏ hẳn" thắng.
   - Nhãn "n dòng nghi sai" giờ đếm dòng bảng, nên số nhỏ hơn số bản ghi: 193 bản ghi có cờ ↔ ít dòng hơn, trong đó 51 bản ghi mức loại ↔ 48 dòng.
3. `rowok` không đọc được thì coi như chưa ai quyết: dòng mức loại vẫn bị loại (thà thiếu còn hơn sai), dòng đã "cho dùng" tạm bị loại ở lượt đó. Có in CẢNH BÁO.

## Đo top 30 (theo yêu cầu điều phối)
- Cách đo:
  - Script `scratchpad\do-gop-rf.mjs`: bản sao `genbid-test\lc8\do-gop.mjs`, thêm `blocked = blockedRows(sups, {})` và ghi cả `all` kèm điểm.
  - Chạy hai tiến trình song song: gốc `wt-cl1-base` (origin/main fc94789f) ↔ nhánh, CÙNG `suppliers/cn` (diff -rq: giống), rowok rỗng, `GENBID_SPEC_NORM=1`, 928 gói lịch sử / 1.093 lượt (cỡ), 0 lỗi.
  - Mỗi bên khoảng 90 phút. So bằng `scratchpad\cmp-rf.mjs` và `pushed.mjs`.
  - `config-bot.mjs` trên main KHÔNG đổi từ fc94789f tới d220b145 (git diff rỗng) nên số đo áp cho PR đã rebase.
- Kết quả, đối chiếu với kỳ vọng của điều phối:
  - `blocked`: 48 dòng (51 bản ghi mức loại; 3 dòng có cờ cả động cơ lẫn đầu phát).
  - Biến khỏi `all`: 544 lần xuất hiện của 32 dòng khác nhau. Cả 544 đều nằm trong danh sách bị chặn của lượt đó (`goneNotBlocked` = 0). 16 dòng bị chặn còn lại không vào `all` của lượt nào ở cả main; em CHƯA soát từng dòng vì sao (ngoài dải công suất, lọc xuất xứ / tần số, hay không phải dòng tổ máy).
  - Dòng MỚI trong `all`: 0. Dòng đổi điểm: 0.
  - Top 30 đổi ở 18 lượt, không lượt nào chỉ đổi thứ tự:
    - RA 23 dòng: 21 vì bị chặn, 2 bị đẩy dây chuyền.
    - VÀO 20 dòng, tất cả đã có trong `all` của main (lấp chỗ).
    - Có lượt top ngắn hơn 30 vì không đủ dòng lấp.
  - **Hai dòng bị đẩy dây chuyền** (soát tay cả hai), cùng một luật:
    - Luật: dòng bị chặn trả lại một suất của trần mỗi NCC / mỗi động cơ (`PER_SUPPLIER` / `PER_ENGINE` trong `pick`). Dòng cùng điểm đứng trước trong danh sách vào chỗ cuối, dòng hoà điểm đứng sau bị đẩy ra.
    - IB2500600028#0: mecca-power QSK50-G17 (481) ra. Dòng chặn là aosif KTA50-G16B và hosem 4016TAG1A. Vào: aosif QSK50-G17 (521, do aosif được trả suất) và yunding-jiangsu KTA50-G16B (481, cùng điểm, do KTA50-G16B được trả suất).
    - IB2600107089#0: kaichen-jiangsu KTA50-G15X (521) ra. Dòng chặn là aosif KTA50-G16B, fdk-energy QSK50-G7 và hosem. Vào: fdk-energy QSK60-G7, aosif KTA50-G15X (521) và sunkings QSK60-G3.
- Tệp đo: `gop-base.json`, `gop-branch.json` (mỗi tệp khoảng 165 MB), `cmp-rf.txt` trong scratchpad của phiên. Không chép vào sổ vì quá lớn.

## Soát các dòng bị chặn không vào `all` của lượt nào (điều phối yêu cầu sau merge #929)
Đúng là **15 dòng**, không phải 16. Lý do: hai dòng bảng nhãn của xinhengxin-fujian n101 (tổ D9000 và D9500, cùng động cơ 1103FE) có chung một khoá do-gop (NCC | động cơ | chữ dòng, KHÔNG có tên tổ máy). Vì vậy 33 dòng bị chặn từng vào `all` chỉ ra 32 khoá; 48 − 33 = 15.
Soát bằng `scratchpad\soat16.mjs`, `soat16c.mjs`, `why3.mjs` (mã main, cùng `facts` như do-gop). Từng dòng:

| # | Dòng (NCC, nguồn, bảng/dòng) | Cờ (absurd) | Vì sao không vào `all` |
|---|---|---|---|
| 1 | cgm-italia n1001 b13 d15, 1103A-33TG1 (tổ 45P) | weight "39,6" (nhãn "kg"; cột "kg" của cgm là kW, đã ghi ở chặng 1) | Lọt dải công suất 29 lượt: 25 lượt bị lọc xuất xứ / nhóm NCC (24 origin all có nhóm NCC theo Đồng bộ, 1 g7eu); 4 lượt bị luật HSMT loại (3 `cyl`, 1 `disp,cyl`) |
| 2 | huipu-power n105 b4 d30, 4012-46TAG2A | disp "458" (nhãn "Swept volume(L)") | dòng không có công suất (`power` null) → không qua lọc dải công suất |
| 3 | huipu-power n106 b5 d7, TAD1341GE | disp "1278" | không có công suất |
| 4 | huipu-power n106 b5 d11, TAD1345GE | disp "1278" | không có công suất |
| 5 | mwm n1028 b71 (bảng nhãn), TCG 2032 | weight "43,100" | công suất đọc thành 3,333 kW (misread "3,333", đã ghi ở chặng 1): lọt dải 1 lượt (gói máy nhỏ) và bị lọc xuất xứ / nhóm NCC ở lượt đó |
| 6–15 | xinhengxin-fujian n101 b0 (186FAE, 188FAE, 192FE, 195FE, 1100FE) và n102 b1 (170FE, 178FE, 186FA, 188FA, 192F), bảng nhãn | dims "…" (nhãn "Motor Size", đọc nhầm thành kích thước, đã ghi ở chặng 1) | không có công suất (bảng nhãn ghi "Rated Output Power(kw)" dạng cặp 50/60 Hz, không đọc ra) |

Không dòng nào vắng mặt vì lọc tần số, và không có dòng nào không phải dòng tổ máy (cả 15 đều có bản ghi động cơ trong catalog).

## Test
- `suppliers/*.test.mjs`: 1.069 pass, 0 fail. 7 ca `# TODO PR 2` là của "Đặc thù hãng" trên main, không phải của PR này.
- `row-flags.test.mjs`: 13/13, trong đó 6 ca mới:
  - "cho dùng" giữ dòng có cờ; "bỏ hẳn" loại dòng không cờ; khoá NCC khác không áp.
  - Đổi chữ dòng thì quyết định cũ thôi áp.
  - Quyết định theo dòng.
  - `candidates` bỏ dòng mà điểm các dòng khác không đổi.
  - Doc web = tự tính; `rowFlagsOf` / `rowOkOf` đọc lỗi.
- Playwright `row-flags` và `smoke`: 25/25 (Edge). Ca mới: hai bản ghi cùng dòng gộp thành một mục.
- `web/api/test`: 197/197. `static.test.mjs`: 11/11.

## Kiểm sau triển khai #924 (điều phối yêu cầu)
- `rowflags/current` trên web thật: log workflow Supplier publish run 44283890469 (fc94789f), bước Row flags ghi "rowflags/current: 193 dòng (51 bị loại), 130538 byte", rồi "đã ghi rowflags/current". Khớp `row-flags.mjs` trên main (193 / 51).
- **CHƯA xem được màn Nhà cung cấp thật.** Browser pane mở https://genset-pro-web.vercel.app/#nha-cung-cap nhưng chưa đăng nhập (`state.db` = false, không có dữ liệu). Cần Khoa (hoặc phiên có đăng nhập) mở một NCC có cờ (ví dụ aoke-yangzhou, yingtai-jiangsu) xem nhãn và mục. Chỉ xem, không bấm nút.
- Sau khi #929 lên main: mục "Dòng nghi sai" gộp theo dòng nên số trên nhãn sẽ nhỏ hơn số bản ghi (đúng ý: đếm dòng bảng).

## Kiểm sau triển khai #929 (3c0a49ff, Vercel success)
Chỉ đọc, bằng hàm của config-bot trên máy này (`scratchpad\readweb.mjs`):
- `rowFlagsOf(doc)` qua `/api/requests?kind=docs&coll=rowflags&id=current`: 193 dòng, 51 mức loại. Không có CẢNH BÁO, nghĩa là không rơi về tự tính.
- `rowOkOf` qua `/api/requests?kind=docs&coll=rowok`: đọc được, hiện rỗng `{}` vì chưa ai bấm nút.
- `blockedRows(nhà cung cấp trên web, rowok, doc web)` = 48, khớp số đo.

## Lỗi của em trong lúc làm (đã sửa, chỉ trên nhánh của em)
- Lần commit đầu em `git reset --soft origin/main` sau khi main đã tiến lên (#927/#928). Commit 5e68fc3f đẩy lên `chat-luong-1c` vì thế đảo ngược thay đổi của người khác (engine-traits, bidprice).
- Đã commit lại trên đúng gốc fc94789f, rebase lên d220b145 và force-push (with-lease) nhánh của em TRƯỚC khi mở PR. Main không bị ảnh hưởng.

## Dọn dẹp (18/11/2026)
- Đã xoá worktree `wt-cl1-base`, `wt-chat-luong-1`, `wt-chat-luong-1b`, `wt-chat-luong-1c` và nhánh cục bộ `chat-luong-1`, `chat-luong-1b`, `chat-luong-1c`. Nhánh trên GitHub thì để GitHub / người merge xử lý.
- `gop-base.json`, `gop-branch.json` (mỗi tệp khoảng 165 MB, ở scratchpad của phiên `C:\Users\Khoa\AppData\Local\Temp\claude\d4c88f0a2fd88962\a0e007ba-670e-4a63-8ae0-4b884b9daaf4\scratchpad\`) giữ tới hết 18/11 cho Lệch cột 11 / Đặc thù hãng đối chiếu. Đã hẹn xoá lúc 23:30 (tác vụ hẹn giờ trig_01KBgL38oto6XwPpSDFQESUE gửi vào phiên này).
