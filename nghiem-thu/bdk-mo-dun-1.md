# Nghiệm thu bdk-mo-dun PR 1: datasheet mô-đun truyền thông Deep Sea + ComAp

- PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/977 — nhánh `bdk-mo-dun-1`, commit 5a572dbe, gốc `origin/main` 59f3369e.
- Phạm vi: chỉ hồ sơ `deep-sea-electronics`, `comap` + nguồn. Không sửa `config-bot.mjs`, `web/catalog.js`, `schema.json` (không cần khoá mới).
- Script + đầu ra đo: `genbid-work\dieu-phoi\dau-vao\bdk-mo-dun\` (`sua-tieu-de.mjs`, `so-ho-so.mjs`, `chup-catalog.mjs` / `so-catalog.mjs`, `tieu-de-tu-dong.mjs` + `phan-chung.txt`, `so-prep.mjs` / `so-suppliers.mjs` + `so-prep-*.txt`, `spec-diff-*.{txt,md}`, `prep\`).

## Tệp đổi
| Tệp | Đổi |
|---|---|
| `suppliers/cn/deep-sea-electronics.json` | + nguồn và bảng n1012–1015 |
| `suppliers/cn/comap.json` | + nguồn và bảng n1014–1016 |
| `suppliers/datasheets/{deep-sea-electronics,comap}.json` | + 7 mục (đầu vào của merge-specs) |
| `suppliers/sources/deep-sea-electronics/1012–1015.md`, `suppliers/sources/comap/1014–1016.md` | trang PDF đã lưu |
`so-ho-so.mjs origin/main`: mọi nguồn / bảng cũ giữ nguyên từng trường; chỉ THÊM; trường khác không đổi.

| n | Mô-đun | URL (lấy từ kết quả tìm kiếm / trang sản phẩm hãng) |
|---|---|---|
| DSE 1012 | DSE890 MKII DSEWebNet® / IoT Gateway - 4G (GSM/Ethernet), 0890-04 | https://www.deepseaelectronics.com/genset/remote-communications-overview-displays/dse890-mkii/downloads/datasheet |
| DSE 1013 | DSE891 MKII DSEWebNet® Gateway - Ethernet Only, 0891-04 | https://www.deepseaelectronics.com/genset/remote-communications-overview-displays/dse891-mkii/downloads/datasheet |
| DSE 1014 | DSE855 USB → Ethernet | https://www.deepseaelectronics.com/genset/remote-communications-overview-displays/dse855/downloads/datasheet |
| DSE 1015 | DSEWebNet® Remote Monitoring Software | https://www.deepseaelectronics.com/genset/remote-communications-overview-displays/dsewebnetr/downloads/datasheet |
| ComAp 1014 | CM2-4G-GPS (CM24GGPSXBX) | https://www.comap-control.com/productfile/72943fd8-1c4e-4d5f-9f6d-6273bc13ddcd (link "CM2-4G-GPS Datasheet" trên https://www.comap-control.com/products/communications/cm2-4g-gps/) |
| ComAp 1015 | CM3-Ethernet (CM3ETHERXBX) | https://www.comap-control.com/productfile/df2da8df-b134-4776-a13b-0f39a457934c (trang …/cm3-ethernet/) |
| ComAp 1016 | CM-RS232-485 (CM223248XBX) | https://www.comap-control.com/productfile/12347085-21c5-44db-a56f-42f5ad1ce36e (trang na.comap-control.com/…/cm-rs232-485/) |
"DSE855 nếu có": có, đã lưu. Không lưu: SmartGen (ngoài phạm vi brief).

## Lệnh kiểm + đầu ra thật
1. `node suppliers/verify.mjs` → "435 bản ghi, 0 có lỗi".
2. Danh mục + facts, gốc (worktree `wt-bdk-base` = origin/main) ↔ nhánh: `chup-catalog.mjs` + `so-catalog.mjs`:
   ```
   # controllers: 187 → 187; thêm 0, mất 0, đổi 0
   # engines: 6889 → 6889; thêm 0, mất 0, đổi 0
   # alternators: 2704 → 2704; thêm 0, mất 0, đổi 0
   # facts: 4330 → 4330; thêm 0, mất 0, đổi 0
   GIỐNG HỆT
   ```
   (so cả danh sách `uses` của mỗi bộ điều khiển và mọi dòng fact của mỗi khoá.)
3. **Phản chứng** (vì sao phải đặt tiêu đề tay): giữ tiêu đề `maker-datasheets.mjs` tự đặt (DSE890/891 → "| DSE8680 | Synchronising Generator Bus Tie Control Module | 8680-01", DSE855 → "… | dse6010/20", CM-RS232-485 → "Optional plug-in card to enable InteliLite the RS232") trong worktree nháp:
   ```
   # facts: 4330 → 4334; thêm 4, mất 0, đổi 0
     + controller:INTELILITE
     + controller:DSE8680
     + controller:DSE6010
     + controller:DSE6020
   ```
   → mọi dòng của mô-đun thành thông số của bộ điều khiển. Với tiêu đề = tên mô-đun (không chứa model bộ điều khiển) `controllerSheetFacts` trả rỗng (`sheet` rỗng). Ba bảng CM2-4G-GPS / CM3-Ethernet / DSEWebNet tự đặt tiêu đề đã không rò, vẫn đặt lại cho thống nhất.
4. `node suppliers/spec-diff.mjs git:59f3369e… .` → "Bản ghi: 60.073 → 60.073; 0 đổi, 0 mất, 0 thêm"; đảo vai 0 → 0; "Không có bản ghi nào đổi."
5. `GENBID_LOCAL_SUPPLIERS=1 node suppliers/config-bot.mjs prep --key <K> --origin all`, gốc ↔ nhánh, `so-prep.mjs`:
   - IB2600603983: `catalog.md` (128.910 ký tự), `catalog-1…7.md`, `controllers.md` (415.068), `ctl-lookup.md` / `-1` / `-2`, `models.json`, `specs.json`, `prompt.md`, `hsmt.txt` GIỐNG HỆT. Khác: `input.md` / `input-1.md` (chỉ đường dẫn `wt-bdk-base` ↔ `wt-bdk-mo-dun-1` ở 3 dòng lệnh), `suppliers.json` (`so-suppliers.mjs`: 309 → 309 bản ghi, chỉ comap + deep-sea-electronics khác ở `sources,specTables`, bảng thêm đúng 7, bảng mất 0).
   - IB2600601812: như trên (`catalog.md` 186.735, `controllers.md` 426.543 giống hệt).
   - Tên mô-đun trong mục "Bộ điều khiển" / "Thông số bộ điều khiển" của catalog.md: 0 lần cả hai bên; tiêu đề `###` mang tên mô-đun: 0. controllers.md có 35 / 44 lần cả hai bên (các dòng "DSE890 MKII | DSEWebNet® Gateway" vốn có trong datasheet bộ điều khiển).
6. `node --test suppliers/{schema-keys,manufacturing,config-accuracy,cover-config,agent-waste}.test.mjs` → 165 pass, 0 fail. Chưa chạy cả bộ test (CI của PR sẽ chạy).

## Số đo trước / sau (đo)
Bộ điều khiển trong danh mục 187 → 187; khoá fact 4.330 → 4.330; bản ghi spec 60.073 → 60.073; catalog.md hai gói: 0 ký tự khác. Bảng hãng bộ điều khiển: deep-sea-electronics 11 → 15, comap 12 → 15. Mô-đun có datasheet riêng: 0 → 7.

## 3 mẫu đối chiếu (dòng nguyên văn trong bảng, có trong trang đã lưu)
1. DSE890 MKII (n1012, URL hàng 1): "| • | 4G Connectivity"; và "equipment, clearing alarm conditions, starting/stopping equipment and monitoring fuel levels." (nối dòng trên "DSEWebNet® software is accessed using an Internet browser or the dedicated app. Users are able to perform multiple tasks including: monitoring") — câu cho điều khiển khởi động / dừng từ xa qua DSEWebNet.
2. ComAp CM2-4G-GPS (n1014): "Built-in 4G (LTE) cellular modem"; "Active e-mails and SMS support".
3. ComAp CM3-Ethernet (n1015): "Wired Internet connection via Ethernet port"; "Modbus, SNMP protocols for local monitoring". Datasheet KHÔNG có chữ "BMS" (grep 0) — mô tả "BMS integration" trong kết quả tìm kiếm là của trang sản phẩm, chưa lưu; theo Q3 Khoa đã duyệt thì Modbus / SNMP vẫn dùng được cho "BMS" trơ.

## Rủi ro còn lại + quay lui
- Dữ liệu chưa ai đọc (đúng ý PR 1): PR 2 thêm fact `module:*`. Rủi ro duy nhất là sau này ai đó chạy lại `maker-datasheets.mjs` cho hai hồ sơ: các URL đã có trong `datasheets/*.json` được bỏ qua ("đã có"), tiêu đề tay giữ nguyên; nhưng `merge-specs.mjs` đọc tiêu đề từ `datasheets/*.json` (đã sửa ở đó) nên vẫn đúng.
- DSE890 MKII: datasheet ghi không đạt yêu cầu an ninh mạng RED (EU); không liên quan gói VN, chỉ ghi lại.
- Quay lui: đóng PR / revert commit 5a572dbe (chỉ thêm tệp + bảng).

## Chưa kiểm được
- Không chạy agent Gợi ý (không cần: catalog.md không đổi).
- `quality.mjs --check` không chạy (PR không đổi code đọc; CI chỉ chặn khi đổi code đọc).
- Trang sản phẩm ComAp có chữ BMS chưa lưu (nếu PR 2 cần câu "BMS" đúng chữ thì lưu thêm bằng `fetch-source.mjs`).

## Cần ghi nhớ
- Bẫy (chưa ghi vào `suppliers/CLAUDE.md` vì brief giới hạn phạm vi; đề nghị PR 2 ghi): `maker-datasheets.mjs` với hồ sơ `controller_maker` lấy dòng ĐẦU nhắc model bộ điều khiển làm tiêu đề → datasheet mô-đun / phụ kiện (danh sách tương thích, câu mô tả "InteliLite") bị gán làm thông số bộ điều khiển. Lưu datasheet mô-đun thì sửa `title` trong `datasheets/<id>.json` thành tên mô-đun trước `merge-specs`, rồi so `modelFacts` trước / sau (`chup-catalog.mjs`).
- Worktree `wt-bdk-base` và `wt-bdk-mo-dun-1` đã gỡ; nhánh `bdk-mo-dun-1` trên GitHub.
