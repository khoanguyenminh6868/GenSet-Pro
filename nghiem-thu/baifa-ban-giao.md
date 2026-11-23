# Bàn giao: baifa / dòng máy ngoài bảng / cần xác nhận hãng (23/11/2026)

Phiên con của phiên điều phối `session_011tAj4Mp31GbgmLRtLgBxSA`. Cả ba PR đều DRAFT, chưa merge, chưa đo 1.093 lượt top 30.

## Trạng thái từng PR

| PR | Nhánh | SHA | Worktree | Base |
|---|---|---|---|---|
| #1101 baifa dòng máy nằm trong `header` | `fix/baifa-header-rows` | `f713a80f2460bae9b6ec485fcc41d00eb32d2284` | `C:\Projects\GenSet Pro\wt-baifa-header` | main |
| #1105 dòng máy bộ thu thập bỏ ngoài bảng (`tablesOf`) | `fix/crawl-dropped-rows` | `a95b8ab5f8eafcfc3ad4b32b93b02bc179ad2018` | `C:\Projects\GenSet Pro\wt-crawl-dropped` | `fix/baifa-header-rows` (chồng lên #1101) |
| #1108 kVA / kW tiêu đề con + cần xác nhận hãng đầu phát | `fix/alt-brand-confirm` | `6ea53ac65d88e05f821a92278d7e8ca75bcb73b7` | `C:\Projects\GenSet Pro\wt-alt-brand` | main (`8f830469`), không chồng |

Ba worktree đều sạch, đã push. Gỡ worktree khi PR tương ứng đã merge (người tạo là phiên này; phiên kế gỡ thay).

### Đã kiểm
- #1101: xem `nghiem-thu\baifa-3-diem.md` và thân PR.
- #1105: `tablesOf` cũ ↔ mới trên 3.983 tệp nguồn: 0 bảng cũ đổi; +64 bảng, +1.392 dòng ở 15 NCC; bản ghi 62.063 → 63.350 (+1.287), mất 0, đổi 19 (lees-power, chỉ thêm hãng Perkins mức "tên trang"); verify 436 / 0 lỗi; quality --check xanh; spec-diff --gate qua (đảo vai 0 → 0); test 1.580 / 1.580; merge-specs trên bản sao ra đúng từng byte. Chi tiết: `nghiem-thu\crawl-dropped-1.md`.
- #1108: `fromSupplier` 436 hồ sơ / 62.006 bản ghi, main ↔ nhánh: thêm 0, mất 0, đổi 39 (38 bản ghi đầu phát chỉ `makes` + `makeAsk`; 1 bản ghi động cơ baifa `4M08G8D3/5` chỉ `power`: rated 37,5 kVA / 30 kW → standby 37,5 kVA, prime 30 kVA). build(): 18 khoá đầu phát đổi (7 hãng không đổi; 8 từ "chưa rõ hãng" → có hãng do nguồn khác ghi; 3 mất hãng: LSA 53.2M12, LSA 54.2L14, PI734G1), 1 khoá động cơ, 0 bộ điều khiển / tổ máy. `candidates` cho cả 38 dòng (HSMT giả định nêu Stamford hoặc Leroy-Somer): 22 dòng −80 điểm, 16 không đổi, không dòng nào bị loại. verify 436 / 0; quality --check xanh; spec-diff `git:8f830469 .` --gate qua; test 1.573 / 1.573 (+ `alt-make-ask.test.mjs` 7 ca); `web/test/spec-norm.test.mjs` 158 / 158.

### Chưa kiểm
- Cả ba: đo top 30 trên cloud (1.093 lượt, `do-gop.mjs`), row-flags sau khi thêm dòng (#1101, #1105).
- #1105 + #1108 chưa đo GỘP: khi #1101 vào, mục 1 của #1108 đổi thêm 2 bản ghi `BF-C2500Q-T2`, mục 2 thêm 1 bản ghi baifa `LSA52.3 UL16` (39 thay vì 38). Chưa rebase thử #1108 lên #1101 / #1105 (cùng sửa `web/catalog.js`? #1101 có sửa catalog.js; #1105 chỉ `crawl-specs.mjs` + hồ sơ: kiểm xung đột khi merge).
- #1108 `altMakeAskChecks`: mới có test đơn vị, chưa chạy lượt Gợi ý thật (cần AI).

## Việc còn dở (chưa ai làm)
- lees-power: 17 dòng "Single phase" vào bảng nhưng không mang thông tin pha (bản ghi không biết là 1 pha).
- awt-aiweite: 13 dòng "Dual-band 50/60HZ" đang đọc thành 60 Hz.
- huayuan-weifang n113: 6 bản ghi không công suất; camda-generator n139: bảng mới chưa ra bản ghi.
- 82 dòng máy mà TỆP NGUỒN crawl đã bị cắt (không dựng lại được nếu không cào lại): conductorjasa 26, jet-power 25, sanq-power 23, camda n155 8.
- 84 dòng để PR sau: baifa 70, taihai n107 8, hnd-henan 6 (cần tách TRONG khối; việc "tách bảng con theo tiêu đề lặp" đã có phiên khác làm ở `wt-tach-bang-con`, đừng làm trùng).
- 294 trong 460 dòng còn ngoài không phải bảng công suất tổ máy (không cần làm).
- #1108 chưa làm: các bước tra hãng theo KHOÁ (đồng bộ thương hiệu `BP.familyOf`, `madeChecks` nơi sản xuất đầu phát, `gaps.mjs`) vẫn dùng hãng của khoá cho dòng có cờ; bản web chưa hiện `makeAsk`.

## Quyết định đã nhận (Khoa, 23/11/2026, qua phiên điều phối)
1. kVA / kW: không veto "prime = 0,8 × standby" khi đơn vị của CẢ prime lẫn standby lấy từ tiêu đề con của chính cột. Không mở rộng sang tiêu đề phủ.
2. Mã đầu phát mang tiền tố hãng này dưới tiêu đề cột hãng khác: KHÔNG tin bên nào, "cần xác nhận hãng" (giữ dòng, why "mã … dưới cột …"). Bảng tiền tố → hãng chỉ để PHÁT HIỆN, không gán hãng; ghi rõ là hiểu biết chung.
3. Dòng không có model tổ máy: ĐƯỢC làm ứng viên, không đổi gì.
4. 1.661 dòng máy ngoài bảng: làm luôn, sửa gốc ở `tablesOf`, dựng lại từ tệp nguồn sẵn có, không cào lại, không đoán URL, không suy ra ô thiếu.
- Chung: không tự merge, không tự đo 1.093 lượt; repo public: không commit bidhist / chữ HSMT / token; không ghi tên model vào commit / PR.

## Bẫy (đã ghi vào CLAUDE.md thư mục trong từng PR)
- `spec-diff` so theo CHỈ SỐ bảng: chèn bảng giữa danh sách sinh "đổi / mất" ảo, `thêm − mất` mới đúng.
- Tách trong khối ở `tablesOf` (bản đầu) đổi 447 bảng / 66 NCC, mất 285 dòng: #1105 dùng thiết kế CHỈ-THÊM (bảng mới ở `cut`, không đụng bảng cũ).
- Regex chữ Hán nới ("功率") nhận bảng rác (功率因数, 备用电源): `POWER_ZH` hẹp, chỉ xét header.
- `isNumCell` dung thứ ≤ 3 ký tự dư nên loại nhầm mã ngắn: `codeRow` dùng regex riêng.
- Hãng của KHOÁ đầu phát có thể đến từ NCC khác; cờ `makeAsk` nằm trên bản ghi ĐẦU PHÁT của dòng, tra bằng `altMakeAskOf(a, u)`.
- `S\dL\d` (Stamford) trùng dạng động cơ Mitsubishi "S4L2": chỉ áp cho bản ghi đầu phát.
- Máy: `node --test suppliers/*.test.mjs` phải chạy bằng Bash (PowerShell không mở rộng `*`), khoảng 6,5 phút; `sed -i` với `\n` làm hỏng chuỗi JS (dùng Edit); tệp `.js` ngoài repo bị coi là CommonJS (đổi đuôi `.mjs` khi chép `catalog.js` ra để so).

## Script và số liệu
- #1108: `dau-vao\alt-brand\` — `ab.mjs` (so hai bản catalog.js trên mọi hồ sơ + build), `cand.mjs` + `cand-diff.mjs` (bước xếp ứng viên trước ↔ sau), `ab.txt` (đủ 39 bản ghi và 18 khoá trước / sau), `cand-diff.md` (bảng 38 dòng trước / sau), `specdiff.md`.
- #1105: `dau-vao\crawl-dropped\` (measure / newtabs / rebuild / rec-diff / account / classify …, `account.txt`, `rest-blocks.txt`).
- #1101 và ba điểm: `dau-vao\baifa-header\` (`p1-veto.mjs`, `p2-alt.mjs`), `nghiem-thu\baifa-3-diem.md`.
