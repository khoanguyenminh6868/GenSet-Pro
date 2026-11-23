# Tích hợp đo lượt 3 (nhánh `tich-hop-luot-3`, chỉ để đo, không merge)

Gốc: `origin/main` = 2090afc4fbfbae716f016df6255f0643ec78c206 (worktree `wt-tich-hop-3`).
Mọi đầu PR khớp SHA điều phối đưa: 1105 = 28615f527567ecc6244815a7db416fe123766e3d, 1110 = 0d589bda3a5fd8b61734c749d67a8894b403afcf,
1111 = 19ab0c53b0673fda9f45e9be2a81af0fdbc74afe, 1118 = fc10692363196222de475b1887081ec77cf50700, 1108 = b22fabf65cc900cb4f4ab27aa653f3e9d68bd438,
1109 = 5fedd4d36b7495bd2b6967c3a833eca6827c706e, 1114 = 019d251e95a9fa1e1f5d6844fa7fe7cc8048f00f, 1115 = 8fe1f98d8e41110b5f08fb2be41456cbb57f64b3,
1116 = eb6a880f09583a5d0740397d8d56c9598629c091.

## Test `node --test suppliers/*.test.mjs` sau từng merge

| # | PR | Xung đột | pass | fail |
|---|----|----------|------|------|
| 1 | 1105 | không | 1597 | 0 |
| 2 | 1110 | không | 1604 | 0 |
| 3 | 1111 | không | 1609 | 0 |
| 4 | 1118 | `suppliers/CLAUDE.md` (gỡ) | 1619 | 0 |
| 5 | 1108 | không | 1626 | 0 |
| 6 | 1109 | không | 1632 | 0 |
| 7 | 1114 | `suppliers/config-bot.mjs` (gỡ) | 1640 | 0 |
| 8 | 1115 | không | 1643 | 0 |
| 9 | 1116 | `suppliers/CLAUDE.md` (gỡ) | 1646 | 0 |

Không sửa test nào.

## Chỗ gỡ xung đột

### 1. PR #1118, `suppliers/CLAUDE.md`, đoạn "Dòng máy bị cắt khỏi tiêu đề (crawl-dropped…)"
Hai phía cùng sửa ĐUÔI của đoạn này, độc lập:
- main (nhờ #1105 / #1110): đuôi `… (`catalog.js` chỉ đọc pha từ CỘT); awt-aiweite "Dual-band 50/60HZ" đọc thành 60 Hz.` và có thêm đoạn kế "Bảng con nối liền trong một khối (tach-bang-con…)".
- #1118: đuôi `… (`catalog.js` chỉ đọc pha từ CỘT): `candidates` đọc qua `onePhaseOf` (mục "Số pha" ở config-bot).` (không có câu awt-aiweite vì nhánh cũ).

Sau: giữ đoạn của main, chỉ đổi mỗi chỗ `CỘT); awt-aiweite` thành
`CỘT): `candidates` đọc qua `onePhaseOf` (mục "Số pha" ở config-bot); awt-aiweite`, giữ nguyên đoạn tach-bang-con.
Lý do: tài liệu, hai câu độc lập, lấy cả hai.

### 2. PR #1114, `suppliers/config-bot.mjs` ~dòng 2157, `rows.push({...})`
Trước, hai phía thêm hai thuộc tính độc lập vào cùng đối tượng:
- HEAD: `…fuelOver, fuelNoLoad, ...(altAsk ? { altAsk } : {}), ...(Object.keys(made).length ? { made } : {}), …`
- #1114: `…fuelOver, fuelNoLoad, ...(hzV?.ask ? { freqAsk: hzV.kind } : {}), ...(Object.keys(made).length ? { made } : {}), …`

Sau: `…fuelOver, fuelNoLoad, ...(altAsk ? { altAsk } : {}), ...(hzV?.ask ? { freqAsk: hzV.kind } : {}), ...(Object.keys(made).length ? { made } : {}), …`
Thứ tự: altAsk (#1118) trước, freqAsk (#1114) sau (thứ tự merge). `hzV` và `altAsk` đều đã khai báo trong tệp sau merge. Test xanh 1640.

### 3. PR #1116, `suppliers/CLAUDE.md` ~dòng 33–40
Trước: HEAD có 3 dòng (baifa-header đã bỏ đuôi "CHƯA sửa (việc riêng)…", crawl-dropped, tach-bang-con); #1116 có dòng baifa-header BẢN CŨ (còn đuôi "CHƯA sửa (việc riêng): … 1.661 dòng máy …", vì #1116 chưa biết crawl-dropped đã xử lý) và thêm dòng mới "Khoá động cơ / đầu phát rác (engine-key-junk…)".
Sau: giữ 3 dòng của HEAD nguyên văn (baifa-header bản mới, không đuôi cũ, vì đoạn đó nay do crawl-dropped / tach-bang-con thay) + dòng engine-key-junk của #1116 xếp ngay sau.
Lý do: tài liệu; đuôi cũ của baifa-header đã lỗi thời so với main nên không giữ lại.

## verify / quality
Đầu nhánh tích hợp: 00bbdc25b55aec509d3e6dd7c50e244760d21be4.
- `node suppliers/verify.mjs`: 436 bản ghi, 0 có lỗi (thoát 0).
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng" (thoát 0).
