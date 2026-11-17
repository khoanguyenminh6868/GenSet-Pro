# Tìm lại website + thông số cho NCC chưa có bảng (13/11/2026)

Khoa 13/11: "tiếp tục thử tìm website và thông số của các NCC chưa có thông số 1 lần nữa; NCC nào không tìm được thì đánh dấu để lần sau không xuất hiện trong danh sách cần tìm".
Đánh dấu: `node suppliers/spec-todo.mjs --mark <id>... --why "…"` (PR #649). Danh sách đầy đủ còn cần tìm: `node suppliers/spec-todo.mjs`.

## Cách làm mỗi NCC (nhóm KHÔNG có website)
1. Tìm website CHÍNH THỨC (WebSearch tên tiếng Anh, tên tiếng Trung + 官网, tên + tỉnh/thành; xem `suppliers/CLAUDE.md` + bộ nhớ supplier-db.md). Không nhận made-in-china/alibaba/directory/trang đại lý hãng khác. Mở trang kiểm tên công ty / địa chỉ khớp hồ sơ.
2. Tìm thấy: `node suppliers/discover.mjs save <id> <url>` (trang chủ) → thêm vào `cn/<id>.json`: `website` + một mục `sources` (n kế tiếp 1–99, tier A, `quote` = câu NGUYÊN VĂN có tên công ty trong trang đã lưu, `file`, `accessedAt` theo dòng Accessed) — mẫu: PR #640.
   Rồi `node suppliers/crawl-specs.mjs --max 80 <id>` (0 dòng thì thử thêm `--render`, bọc `timeout 1200`) → `node suppliers/merge-specs.mjs <id>` → `node suppliers/verify.mjs` (0 lỗi).
3. Không tìm được website chính thức → KHÔNG tự sửa `spec-none.json` (hai nhóm chạy song song sẽ xung đột); ghi id + lý do ngắn vào mục "Không tìm được website" của nghiệm thu, điều phối đánh dấu một lần.
   Có website nhưng cào 0 dòng → KHÔNG đánh dấu; ghi id vào mục "Có website, 0 dòng" của nghiệm thu (điều phối sẽ chạy Tìm Thông Số qua bot rồi mới đánh dấu).
4. Đại lý (distributor): website của chính đại lý; bảng thông số trên trang đại lý vẫn cào bình thường (tier theo quy tắc hiện hành).

Xong: một PR DRAFT gồm `cn/*.json`, `sources/`, `specs/` (không sửa `spec-none.json`); so số dòng bảng/nguồn với origin/main (chỉ các id của nhóm được đổi). Nghiệm thu `nghiem-thu/tim-lai-web-<A|B>.md`: bảng id → website / số dòng / đánh dấu; 3 mẫu website kèm câu trích.

## Nhóm A (38)
| id | vai trò | tên | nơi |
|---|---|---|---|
| derui-power | genset_oem |  / 无锡得瑞动力科技有限公司 | CN, Zhejiang, Lanxi |
| huatai-power-fujian | genset_oem | FUJIAN HUATAI POWER SUPPLY CO.,LTD.  | CN, Fujian, Fuzhou |
| kema-zhejiang | genset_oem | ZHEJIANG KEMA ENGINE & MACHINERY CO.,LTD  | CN, Zhejiang, Taizhou |
| pushi-power | genset_oem |  / 重庆普什新能源技术有限公司 | CN, Chongqing, Chongqing |
| yaohu-chongqing | genset_oem | CHONGQING YAOHU POWER MACHINE CO.,LTD.  | CN, Chongqing, Chongqing |
| zt-power | genset_oem | ZT Power Equipment Co.,Ltd  | CN, Taizhou |
| kubota-wuxi | engine_maker | Kubota Engine (WUXI) Co.,Ltd.  | CN, Jiangsu, Wuxi |
| shanghai-mhi-engine | engine_maker | Shanghai MHI Engine Co., Ltd.  | CN, Shanghai, Shanghai |
| xcmg-doosan-engine | engine_maker | Xuzhou XCMG Doosan Engine  | CN, Jiangsu, Xuzhou |
| yipu-power | engine_maker |  / 苏州屹普动力科技有限公司 | CN, Jiangsu, Suzhou |
| dingol | alternator_maker |  / 顶格电力设备江阴有限公司 | CN, Jiangsu, Jiangyin |
| geshin-marathon | alternator_maker |  / 上海马拉松·革新电气有限公司 | CN, Shanghai, Shanghai |
| nianfeng-fujian | alternator_maker | NIANFENG (FUJIAN) MOTOR CO., LTD.  | CN, Fujian, Fuan |
| weike-wuxi | alternator_maker |  / 无锡威克电机技术有限公司 | CN, Jiangsu, Wuxi |
| cummins-china-investment | distributor | Cummins (China) Investment Co., Ltd.  | CN |
| cummins-dealer-chengdu-huida-electromechanical-equipment | distributor | Chengdu Huida Electromechanical Equipment Co., Ltd  | CN |
| cummins-dealer-chenxun-power-technology | distributor | Chenxun Power Technology Co., Ltd  | CN, Hu Nan, Chang Sha |
| cummins-dealer-chongqing-kangfa-diesel-genset-component | distributor | Chongqing Kangfa Diesel Genset Component Co. Ltd.  | CN |
| cummins-dealer-fujian-innovation-kinetic-energy-petroleum-produ | distributor | Fujian Innovation Kinetic Energy Petroleum Products Co., Ltd  | CN, Fujian, Quanzhou |
| cummins-dealer-guangzhou-city-chongkang-m-e-equipment | distributor | Guangzhou City Chongkang M&E Equipment Co., Ltd.  | CN, Guangdong, Guangzhou |
| cummins-dealer-guizhou-kangcheng-power-generation-equipment | distributor | Guizhou Kangcheng Power Generation Equipment Co., Ltd  | CN, Guizhou, Guiyang |
| cummins-dealer-hefei-dongneng-electromechanical-equipment | distributor | Hefei Dongneng Electromechanical Equipment Co., Ltd  | CN, Anhui Sheng, Hefei |
| cummins-dealer-kangji-power-xiamen-import-and-export | distributor | Kangji Power Xiamen Import And Export Co. Ltd  | CN, Fujian, Xiamen |
| cummins-dealer-nanjing-kanghao-electromechanical-equipment | distributor | Nanjing Kanghao Electromechanical Equipment Co., Ltd  | CN, Jiangsu, Nanjing |
| cummins-dealer-new-chongkang-electromechanical | distributor | New Chongkang Electromechanical (Shenzhen) Co., Ltd  | CN, Guangdong, Shenzhen |
| cummins-dealer-shandong-mingyang-electromechanical | distributor | Shandong Mingyang Electromechanical Co., Ltd  | CN, Shandong Sheng, Yantai |
| cummins-dealer-tibet-kangchai-mechanical-electrical-equipment | distributor | Tibet Kangchai Mechanical & Electrical Equipment Co., Ltd.  | CN, Tibet, Changdu |
| cummins-dealer-wuhan-suofuna-electromechanical-engineering | distributor | Wuhan Suofuna Electromechanical Engineering Co., Ltd  | CN, Hebei, Wuhan |
| cummins-dealer-xiamen-city-mingdong-m-e | distributor | Xiamen City Mingdong M&E Co. Ltd  | CN, Fujian, Xiamen |
| cummins-dealer-yongyou-generator | distributor | Yongyou Generator Co., Ltd.  | CN, Taiwan, Taichung City |
| cummins-dealer-zhengzhou-yukang-electromechanical-equipment | distributor | Zhengzhou Yukang Electromechanical Equipment Co., Ltd  | CN, Hainan, Zhengzhou |
| gensets-fuzhou | distributor | Fuzhou Gen-Sets Mech & Elec Co., Ltd. Fuzhou Multi-Union Electric Equipment Co., Ltd  | CN, Fujian, Fuzhou |
| jinghai-qixiang-hainan | distributor | Hainan Jinghai Qixiang Technology Development Co.,LTD  | CN, Hainan |
| kelaisi-chongqing | distributor | Chongqing Kelaisi Construction Machinery Co.,Ltd.  | CN, Chongqing, Chongqing |
| neway-anhui | distributor | Anhui Neway  | CN, Anhui |
| rixin-ningbo | distributor | Ningbo Rixin Power Technology Co.,Ltd.  | CN, Zhejiang, Ningbo |
| xuchao-shaanxi | distributor | Shaanxi Xuchao Electromechanical Equipment Engineering Co., Ltd.  | CN, Shaanxi, Xi'an |
| zhongchuang-guizhou | distributor | GuiZhou ZhongChuang Electrical Technology Co.,Ltd  | CN, Guizhou, Guiyang |

## Nhóm B (38)
| id | vai trò | tên | nơi |
|---|---|---|---|
| goldlink-jiangsu | genset_oem | GoldLink Power Jiangsu Co.,Ltd  | CN, Jiangsu, Yangzhou |
| huineng-shandong | genset_oem | Shandong Huineng Power Co.,Ltd  | CN, Shandong, Weifang |
| perfect-house | genset_oem | Perfect House Pvt. Limited  | IN, Maharashtra, Mumbai |
| yanma-jiangsu | genset_oem | JIANGSU YANMA INDUSTRY CO.,LTD.  | CN, Jiangsu, Nanjing |
| yukun-qiangwei | genset_oem | FUJIAN YUKUN QIANGWEI MOTOR CO., LTD. / 福建省煜坤强威电机有限公司 | CN, Fujian, Fuan |
| huadong-weifang | engine_maker | Weifang Huadong Diesel Engine Co.,Ltd  | CN, Shandong, Weifang |
| mtu-yuchai | engine_maker | MTU Yuchai Power Co., Ltd.  | CN, Guangxi, Yulin |
| volvo-penta-wuxi | engine_maker | Volvo Penta engine plant in Wuxi (Volvo Penta / Wuxi Diesel Engine Works)  | CN, Jiangsu, Wuxi |
| yanmar-shandong | engine_maker | Yanmar Engine (Shandong) Co., Ltd.  | CN, Shandong, Qingdao |
| boss-fujian | alternator_maker | Fujian BOSS Electrical Machinery Co.,Ltd.  | CN, Fujian, Fuzhou |
| falande-jiangsu | alternator_maker |  / 江苏法兰德电机科技有限公司 | CN, Jiangsu, Wuxi |
| huawei-fuan | alternator_maker | FUJIAN FUAN HUAWEI ELECTRICAL MOTOR CO., LTD.  | CN, Fujian, Fuan |
| sanhe-fujian | alternator_maker | SANHE ELECTRICAL(FUJIAN) CO.,LTD.  | CN, Fujian, Fuan |
| zhenjiang-cssc-hyundai | alternator_maker |  / 镇江中船现代发电设备有限公司 | CN, Jiangsu, Zhenjiang |
| cummins-dealer-beijing-campower-electric-science-techonology | distributor | Beijing Campower Electric Science & Techonology Co., Ltd.  | CN |
| cummins-dealer-chengdu-zhongfa-electromechanical-equipment | distributor | Chengdu Zhongfa Electromechanical Equipment Co., Ltd  | CN |
| cummins-dealer-chongqing-changkang-electromechanical-equipment | distributor | Chongqing Changkang Electromechanical Equipment Co., Ltd  | CN |
| cummins-dealer-chongqing-xikang-electromechanical-equipment | distributor | Chongqing Xikang Electromechanical Equipment Co., Ltd  | CN, Chongqing, Chong Qing |
| cummins-dealer-fuzhou-zhong-qi-kang-hui-m-e | distributor | Fuzhou Zhong Qi Kang Hui M&E Co.,Ltd  | CN, Fujian, Fuzhou |
| cummins-dealer-guangzhou-weineng-electromechanical | distributor | Guangzhou Weineng Electromechanical Co., Ltd  | CN, Guangdong, Guangzhou |
| cummins-dealer-hefei-chongkang-electromechanical-equipment | distributor | Hefei Chongkang Electromechanical Equipment Co., Ltd  | CN, Anhui, Hefei |
| cummins-dealer-hunan-zhongqi-power-equipment | distributor | Hunan Zhongqi Power Equipment Co., Ltd.  | CN, Hunan, Changsha |
| cummins-dealer-liuzhou-kangfa-electromechanical | distributor | Liuzhou Kangfa Electromechanical Co., Ltd  | CN, Guangxi, Liuzhou |
| cummins-dealer-nanning-chengjian-kanghong-electromechanical-equ | distributor | Nanning Chengjian Kanghong Electromechanical Equipment Co., Ltd  | CN, Anhui, Nanning |
| cummins-dealer-ningxia-simike-generating-equipment-co | distributor | Ningxia Simike Generating Equipment Co.  | CN, Ningxia, Yinchuan |
| cummins-dealer-shanghai-leisheng-machinery-and-electrical-equip | distributor | Shanghai Leisheng Machinery And Electrical Equipment Co.,Ltd  | CN |
| cummins-dealer-weifang-yidaneng-power | distributor | Weifang Yidaneng Power Co., Ltd  | CN, Shandong, Weifang |
| cummins-dealer-xi-an-chongkang-diesel-engine-parts | distributor | Xi'An Chongkang Diesel Engine Parts Co., Ltd  | CN, Shaanxi, Xian |
| cummins-dealer-yangzhou-kanglai-power-system | distributor | Yangzhou Kanglai Power System Co.Ltd.  | CN, Jiangsu, Yangzhou |
| cummins-dealer-zhanjiang-weili-electromechanical-equipment | distributor | Zhanjiang Weili Electromechanical Equipment Co., Ltd.  | CN, Guangxi, Zhanjiang |
| dongfang-urumqi | distributor | Urumqi Dongfang Power Trading Co.,Ltd.  | CN, Xinjiang, Urumqi |
| huateng-machinery | distributor | Hua Teng Machinery  | CN |
| kangzhen-weifang | distributor | Shandong Kangzhen Electric Power Technology Co., Ltd  | CN, Shandong, Weifang |
| lei-shing-hong | distributor | Lei Shing Hong Machinery Limited  | CN |
| penghui-nantong | distributor | Nantong Penghui Power Equipment Co., Ltd  | CN, Jiangsu, Nantong |
| sime-darby-elco-foshan | distributor | Foshan Sime Darby Elco Power Equipment Limited  | CN, Guangdong, Foshan |
| yatu-xining | distributor | XINING YA TU ELECTROMECHANICAL CO.,LTD.  | CN, Qinghai, Xining |
| zongfeng-xiamen | distributor | Xiamen Zongfeng Technology Co., Ltd.  | CN, Fujian, Xiamen |
