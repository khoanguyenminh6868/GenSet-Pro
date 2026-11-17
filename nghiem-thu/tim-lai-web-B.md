# Nghiệm thu: tìm lại website + thông số, Nhóm B (38 NCC) — 13/11/2026

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/655
Nhánh `sup/tim-web-b`, worktree `..\wt-tim-web-b`.

## Kết quả
Tìm được website chính thức cho 2/38 (cả hai 0 dòng bảng); 36 chưa có website chính thức.

| id | kết quả |
|---|---|
| sime-darby-elco-foshan | website https://en.elco-sime.com/ ; cào `--max 80` và `--render`: 8 trang, 0 bảng → **có website, 0 dòng** |
| lei-shing-hong | website https://www.lsh-cat.com/en/ (Caterpillar/Perkins dealer, trang nêu "Lei Shing Hong Machinery Limited"); cào 75 trang, chỉ 3 dòng "Engine Power kW | 414/620/825" không có model → bỏ, **có website, 0 dòng** |

### Có website, 0 dòng (điều phối chạy Tìm Thông Số qua bot rồi mới đánh dấu)
sime-darby-elco-foshan, lei-shing-hong

### Cần điều phối quyết (không tự làm)
- perfect-house: chỉ thấy `perfectgenset.co.in` — mini-site dựng trên IndiaMART (có "Send Email / Response Rate" của IndiaMART), tên công ty khớp (Perfect House Private Limited, CIN U31100MH1988PTC045910). Coi là directory nên KHÔNG ghi. Nếu Khoa chấp nhận mini-site này là website công ty thì ghi lại + cào.
- boss-fujian: `bosspowers.com` (email của công ty) chuyển về `tesla-power.net`, vốn đã là website của `tesla-fujian` (relatedIds đã trỏ nhau). Không ghi trùng website; đã cào thử được 1322 dòng nhưng thuộc tesla-fujian → đã loại bỏ khỏi PR. Đề nghị đánh dấu/giữ nguyên.
- yanmar-shandong, volvo-penta-wuxi, mtu-yuchai: chỉ có trang của hãng mẹ (yanmar.com, volvopenta.com, mtu-solutions.com), không có website riêng của pháp nhân → không ghi.

### Không tìm được website (đề nghị điều phối đánh dấu `spec-todo.mjs --mark`)
Lý do chung: tìm tiếng Anh + tiếng Trung + địa phương chỉ ra made-in-china/alibaba/trang hãng mẹ/không kết quả nào nêu tên công ty.
- genset_oem: goldlink-jiangsu (chỉ made-in-china, energy-xprt), huineng-shandong (không có kết quả nêu tên), yanma-jiangsu (không có), yukun-qiangwei (không có)
- engine_maker: huadong-weifang (chỉ made-in-china)
- alternator_maker: falande-jiangsu, huawei-fuan, sanhe-fujian, zhenjiang-cssc-hyundai (không có kết quả nêu tên; zhenjiang-cssc chỉ có trang tin tập đoàn)
- distributor đại lý Cummins (chỉ có trang địa điểm cummins.com, không tìm ra website riêng): cummins-dealer-beijing-campower-electric-science-techonology, -chengdu-zhongfa-electromechanical-equipment, -chongqing-changkang-electromechanical-equipment, -chongqing-xikang-electromechanical-equipment, -fuzhou-zhong-qi-kang-hui-m-e, -guangzhou-weineng-electromechanical, -hefei-chongkang-electromechanical-equipment, -hunan-zhongqi-power-equipment, -liuzhou-kangfa-electromechanical, -nanning-chengjian-kanghong-electromechanical-equ, -ningxia-simike-generating-equipment-co, -shanghai-leisheng-machinery-and-electrical-equip, -weifang-yidaneng-power, -xi-an-chongkang-diesel-engine-parts, -yangzhou-kanglai-power-system, -zhanjiang-weili-electromechanical-equipment
- distributor khác: dongfang-urumqi, huateng-machinery, kangzhen-weifang, penghui-nantong, yatu-xining, zongfeng-xiamen

## Tệp đã đổi
- `suppliers/cn/sime-darby-elco-foshan.json`, `suppliers/cn/lei-shing-hong.json` (website + nguồn n=2 tier A)
- `suppliers/sources/sime-darby-elco-foshan/2.md`, `suppliers/sources/lei-shing-hong/2.md`
- Không đổi code, không đổi `spec-none.json`, không tạo `specs/` (0 dòng).

## Lệnh đã chạy
- `discover.mjs save <id> <url>` (đã lưu 2.md cho 2 id; perfect-house và boss-fujian lưu rồi gỡ)
- `crawl-specs.mjs --max 80 [--render] <id>`, `merge-specs.mjs <id>`
- `node suppliers/verify.mjs` → "435 bản ghi, 0 có lỗi" (sau khi gỡ phần loại)

## Số đo trước/sau (đo)
Số NCC có website: +2. Số dòng bảng: 0 thay đổi (so origin/main, chỉ 2 id bị đổi).

## 3 mẫu đối chiếu
1. sime-darby-elco-foshan — https://en.elco-sime.com/ : "Foshan Sime Darby Elco Power Equipment Ltd. is the first Perkins authorized Engine Power distributorwhich now has over 30 years’ experience in China."
2. lei-shing-hong — https://www.lsh-cat.com/en/ : "October 1994: Lei Shing Hong Machinery Limited was registered and established in Hong Kong."
3. (mẫu loại bỏ, để đối chiếu) boss-fujian — https://www.tesla-power.net/ : "Fujian Tesla Power Technology Co.,Ltd, as a subsidiary of Fujian BOSS Electrical Machinery Co.,LTD."

## Rủi ro / quay lui
Rủi ro thấp: chỉ thêm website + 1 nguồn mỗi id. Quay lui: revert PR.
lsh-cat.com là website tập đoàn Lei Shing Hong (nhiều pháp nhân); tên pháp nhân khớp trong trang nhưng chưa đối chiếu địa chỉ đăng ký.

## Việc chưa kiểm được
WebSearch của phiên này yếu với công ty nhỏ Trung Quốc; chưa thử Baidu/Tianyancha/Qichacha (không truy cập được). Các id "không tìm được" có thể tìm ra nếu có công cụ tra cứu tiếng Trung tốt hơn.

## Cần ghi nhớ
- Quyết định về perfect-house (mini-site IndiaMART có tính là website không).
- Nhóm đại lý Cummins: trang cummins.com chỉ có tên, không bao giờ có website riêng qua tìm web.
