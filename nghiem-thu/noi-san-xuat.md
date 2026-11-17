# Nghiệm thu: thương hiệu ≠ nơi sản xuất theo từng bộ phận (việc 1)

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/849 (draft, chưa merge). Nhánh `noi-san-xuat-bo-phan` (commit b1f4da52 trên origin/main ae0559d0), worktree `wt-noi-sx`. Test sau rebase: `node --test suppliers/` 914/914.

## Tệp đã đổi
- `web/catalog.js`: thay khối `CN_PLANT` / `madeOf` của #841 bằng một bộ nhận duy nhất `madeIn(kind, makes, texts, model)` → `{ at, why }`;
  `madeAt(e, u)` (một dòng của bản ghi), `madeOf(e)` giữ API cũ (màn Thông số dùng như trước). `build()` không đổi.
  - Dấu hiệu gắn TỪNG hãng: nhà máy TQ (DCEC/CCEC/XCEC, Đông Phong/Trùng Khánh/Tây An Cummins, Perkins Wuxi, SME/上海菱重/Shanghai MHI,
    MTU Yuchai, 潍柴博杜安, 烟台斗山, 无锡斯坦福, 福州利莱森玛), "合资/国产 <hãng>", "<hãng> (China)"; hàng nhập ("进口 / Imported <hãng>"
    → nước của hãng); nước ghi cạnh hãng (UK Perkins, 日本三菱, 德国MTU, 瑞典沃尔沃, Cummins (India)…).
  - Dòng thắng tiêu đề cột thắng tên trang; cùng mức có hai nơi → "?" (không rõ).
  - Không ghi: hãng TQ → CN; mặc định Khoa chốt 16/11 (Stamford GB, Leroy-Somer FR, Mecc Alte IT, AvK RO, DSE GB, DEIF DK, Datakom TR,
    ComAp CZ, Woodward easYgen-1500/2000/3000 PL — easYgen-800 thì "?"); còn lại "?".
  - "China <hãng> … factory/manufacturers" (tên trang người bán) KHÔNG tính là nhà máy TQ.
- `suppliers/config-bot.mjs`:
  - `partOriginOfHsmt(text)`: với mỗi dòng G7/G20 là luật, xét TỪNG mệnh đề có G7/G20: chữ của mệnh đề quyết (thương hiệu / xuất xứ,
    sản xuất tại, nhập khẩu…), không có thì nhãn gần nhất, không có nữa thì `basisOfLine`. "Thương hiệu xuất xứ", "xuất xứ hãng sản xuất"
    là nước của thương hiệu. Bộ phận = bộ phận nhãn nêu; dòng không nêu bộ phận (của tổ máy), dòng ATS/tủ/bơm/van/vỏ, mệnh đề
    tiêu chuẩn/công nghệ/tham khảo: không tính. Một bộ phận vừa thương hiệu vừa nơi SX → nơi SX.
  - `hintsOf` thêm `madeRule`.
  - `candidates` (khi đòi nhóm G7/G20): bộ phận đòi NƠI SX → động cơ dòng ghi nơi ngoài nhóm (TQ, Ấn Độ…) bị loại (`ruled: made`, trừ
    model HSMT nêu); đầu phát / BĐK ngoài nhóm −300; trong nhóm ghi lý do; không ghi → "cần xác nhận nơi sản xuất <bộ phận>" (vào
    "lý do xếp" của catalog.md cho agent). Đòi THƯƠNG HIỆU → như cũ.
  - Xuất xứ TQ (`origin "cn"`): động cơ hãng ngoại dòng ghi nhà máy TQ được +250 như hãng TQ.
  - `madeChecks` (gọi trong `check` sau `originChecks`): mã `engine_origin` / `alt_origin` / `ctl_origin` có G7/G20 và căn cứ nơi SX
    (`madeBasisOf`) → code chấm theo dòng nguồn của bộ phận: ngoài nhóm = không đạt, trong nhóm = đạt, không ghi = "Cần chứng từ" (CO).
    Agent đã có câu trích riêng cho biết nơi SX mà dòng nguồn không ghi gì → giữ của agent. Nhóm lấy từ chính câu yêu cầu.
- `suppliers/noi-san-xuat.test.mjs`: 9 test, dòng nguồn và dòng HSMT nguyên văn.
- `web/CLAUDE.md`: bẫy tên trang "China <hãng> … manufacturers", thứ tự dòng > tiêu đề cột > tên trang.

KHÔNG làm (ngoài phạm vi brief): bước 1 của chi-tiet-viec-mo (trường nhà máy trong `suppliers/cn/<hãng>.json` + schema/verify):
mặc định Khoa chốt đang nằm trong code `MADE_DEFAULT` như #841.

## Lệnh kiểm + đầu ra
- `node --test suppliers/ web/test/spec-norm.test.mjs web/test/static.test.mjs` → `# pass 1067 # fail 0` (gồm `regress-config` lượt đóng băng: không đổi).
- `node suppliers/quality.mjs --check` → "không chỉ số nào xấu đi quá ngưỡng".
- `node --test suppliers/noi-san-xuat.test.mjs` → 9/9.

## Số đo
### Nơi SX từng dòng động cơ (script/made-at.mjs, đo, 435 NCC)
Cummins: TQ 2.066 dòng (dòng/tiêu đề ghi), nhập/US 255, GB 26, IN 35, hai nơi → không rõ 88 (sanq-power), không ghi 8.333.
Mitsubishi: TQ 195, JP 38. Perkins: TQ 52, GB 40, IN 15, US 12. Doosan KR 24. Volvo Penta SE 7. Baudouin (Weichai) TQ 11.
Đầu phát: Stamford TQ 26 (shanhua WUXI STAMFORD). BĐK: Deep Sea GB ghi rõ 6, Woodward US 1.
(Bản quét cũ quet-dong-nguon-dong-co.txt: Cummins TQ 1.940 — nay nhiều hơn vì thêm Đông Phong/Trùng Khánh Cummins viết chữ Latin, CUMMINS (CHINA); và
bỏ "China Perkins … manufacturers" của mamo/mingbang/wintpower, trước bị tính TQ.)

### Đọc HSMT theo bộ phận (script/dem-bo-phan.mjs, đo, 928 gói, 168 gói đòi G7/G20)
Xem `noi-san-xuat/dem-bo-phan.txt`. 37 gói chỉ đòi bộ phận: 10 gói động cơ đòi nơi SX, 17 gói động cơ chỉ thương hiệu, 10 gói không có
dòng nêu động cơ. Chi tiết từng gói + dòng HSMT: `noi-san-xuat/dong-bo-phan-nhanh.txt` (main: `dong-bo-phan-main.txt`).

### Top 30 ứng viên toàn bộ gói, main ↔ nhánh (do-gop.mjs + cmp-gop.mjs, đo)
Đo (GENBID_SPEC_NORM=1, 928 gói / 1.093 lượt cỡ, NCC của nhánh; main = checkout chính 98792510):
`{ runs: 1093, err: 0, same: 1082, orderOnly: 0, setChanged: 11, rowsIn: 30, rowsOut: 30, allCountChanged: 13, droppedCountChanged: 13, makeShownChanged: 0 }`.
Đầu ra đủ: `noi-san-xuat/do/cmp.txt`, dữ liệu `do/main.json`, `do/nhanh.json`. Gói không đòi G7/G20 ("all") và gói chỉ đòi thương hiệu: không đổi.
Không đo được nhánh Xuất xứ TQ (+250 cho hãng ngoại làm ở TQ): do-gop chỉ dùng xuất xứ đọc từ HSMT, không có gói "cn" (chỉ chọn tay trên web); có test riêng.

### Soi tay 10 gói đổi nhiều nhất (pick10.mjs + cmp-d10.mjs)
Chỉ 11 lượt đổi (dưới 10 gói khác nhau: 9 gói), soi tay cả 11 bằng `script/soi-d10.mjs` + `script/cmp-d10.mjs` → `noi-san-xuat/do/d10.txt` (top 30 ra / vào kèm lý do) và danh sách dòng bị loại vì nơi SX theo NCC + chữ nguồn.
- 9 gói đều thuộc 37 gói chỉ đòi bộ phận và có bộ phận đòi NƠI SX (IB2400362458, IB2400495407 "Xuất xứ: EU – G7"; IB2400509473 "thương hiệu/hãng sản xuất/xuất xứ: G7"; IB2500503506, IB2500541094 "Xuất xứ: G7"; IB2500533266 "Sản xuất tại chính quốc gia…"; IB2600392438; IB2300062472 và IB2600490077 chỉ BĐK).
- Dòng bị loại vì động cơ: chữ nguồn đều là nhà máy TQ ghi rõ: DCEC / CCEC / dongfeng / Chongqing Cummins / 东风康明斯 / 重庆康明斯 (aosif, rcg-power, mecca-power, wiseke-taizhou, generatordieselchina, yingtai, pengpai…), «Cummins (China» và «Perkins China» (fdk-energy), «Shanghai MITSUBISHI» (rcg-power, dòng RDC… / RYC…), và «Perkins India» / «Cummins INDIA» (Ấn Độ ngoài G7/EU). Không thấy dòng bị loại vì tên trang người bán.
- Dòng ra khỏi top mà không bị loại: eastern-lion-fuan (BĐK SMARTGEN6120), comappower (BĐK SmartGen) bị −300 vì HSMT đòi nơi SX bộ điều khiển G7, SmartGen là hãng TQ. Đúng luật mới.
- Dòng vào: cùng hãng (Perkins, Cummins 6ZTAA13 / KTA19 / 6BT, Baudouin, Mitsubishi S6B/S6R) của NCC không ghi nơi SX → mang "cần xác nhận nơi sản xuất động cơ"; BĐK DSE/ComAp mang "sản xuất tại Anh / Séc (mặc định theo hãng (Khoa chốt 16/11/2026))".
- Không thấy bất thường.

## 3 mẫu đối chiếu nguồn
1. aosif [102] https://www.aosif.com/p/5-6.html — tên trang «CCEC Series(50HZ)-Xiamen Aosif Engineering Ltd.» → KTA50-G3 sản xuất tại TQ (CCEC).
2. aosif [117] https://www.aosif.com/p/5-13.html — «Imported Cummins Series(60HZ)-Xiamen Aosif Engineering Ltd.» → nhập, Mỹ.
3. bdadl-shanghai [129] http://www.bdadl.cn/?products_33/67.html — dòng «| BDA-SL1760 | 1600/1760 | 日本三菱 | S16R-PTAA2 |» → Nhật.
(Thêm: fdk-energy [103] https://fdkenergy.com/diesel-generator-set-9-3250kva/ «QSL9-G2 | Cummins (USA)»; shanhua [1001] «Manufacturer | WUXI STAMFORD».)

## Rủi ro còn lại / quay lui
- Lọc mới chỉ chạy khi HSMT đòi nhóm và dòng HSMT nêu bộ phận + căn cứ nơi SX; đọc sai căn cứ → loại nhầm dòng ghi nhà máy TQ (chỉ dòng ghi rõ).
- Nhóm của bộ phận ở `candidates` là nhóm của cả gói (vd. IB2400592848 động cơ G7 nhưng gói G20 vì đầu phát ghi G20) — `madeChecks` thì lấy nhóm của câu.
- `candidates` chỉ chấm đầu phát khi tìm được bản ghi đầu phát (`alts.get(keyOf(u.other))`): ô ghi kèm hãng ("Stamford S5L1D-H41") không khớp
  — lỗi có từ trước, chưa sửa (ngoài phạm vi), nên đầu phát ít khi được chấm ở bước ứng viên; `madeChecks` vẫn chấm.
- Quay lui: revert PR (không có dữ liệu, không đổi `build()`).

## Chưa kiểm được
- Chưa chạy agent thật một gói (tốn ~3 USD); `madeChecks` chỉ kiểm bằng test + hồi quy lượt đóng băng.
- Volvo Penta / Kubota "China …" trên tên trang người bán: đã loại; nếu có NCC ghi "Volvo Penta (China)" thật thì vẫn tính TQ.

## Cần ghi nhớ
- Mặc định Khoa chốt nằm ở `catalog.js MADE_DEFAULT` (+ Woodward theo model); bước "trường nhà máy trong hồ sơ hãng + verify" chưa làm.
- Lỗi cũ: `candidates` không ghép đầu phát khi ô ghi kèm hãng → đề xuất việc nhỏ riêng.
