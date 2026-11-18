# Nghiệm thu: Đặc thù hãng động cơ, chặng 1 (18/11/2026)

Phiên điều phối: `session_011tAj4SWVDGLLSjnuyb3jXS`. Chặng 1 = nghiên cứu + đo, KHÔNG sửa code Gợi ý cấu hình.

## 1. PR và tệp
- PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/914 (nhánh `dac-thu-dong-co-1`, chưa merge).
- Tệp mới: `suppliers/engine-traits.json` (112 mục, 70 mục `exclusive: true`, 50 mục chưa xác nhận), `suppliers/engine-traits.test.mjs`, `suppliers/trait-source.mjs` (lưu trang nguồn, dự phòng Firecrawl), 93 trang nguồn `suppliers/sources/engine-traits/<n>.md`, một dòng bẫy trong `suppliers/CLAUDE.md`.
- KHÔNG đụng: `config-bot.mjs`, `config-prompt.md`, `web/catalog.js`, `web/index.html`, `genbid-hsmt\`, web thật.
- Dạng dữ liệu: đúng như đầu vào đề xuất, thêm `aliases` đã có, `kind` ∈ {buồng đốt, phun, điều khiển điện tử, tên dòng, khác}, `src` (số nguồn, mỗi hãng một khối 100 số), `quote[]`, `note`; thêm mảng `unconfirmed[] {make, term, why}`. Khác đề xuất: có `src` để test kiểm quote trong trang đã lưu.

## 2. Lệnh kiểm và đầu ra thật
- `node --test suppliers/engine-traits.test.mjs`: 5 test, pass 5, fail 0 (quote nằm trong trang lưu bỏ khác biệt khoảng trắng / hoa thường; src đúng khối của hãng; make + term không trùng; E-TVCS đúng một mục, của Kubota, exclusive; unconfirmed có lý do và không trùng mục đã xác nhận).
- `node --test suppliers/*.test.mjs` (cả bộ CI): tests 1019, pass 1019, fail 0.

## 3. Bước 1: từ đặc thù trong HSMT thật (đo)
Nguồn: chữ HSMT `genbid-work\specs\*\text.txt` (1.499 gói) + `technicalSpecs` của `analysis.json` (1.299 gói; 49 gói chỉ có trong analysis) = 1.548 gói, bản chụp cố định trước khi đo. Quét: 10.448 đoạn quanh từ khoá động cơ + 13.656 dòng yêu cầu động cơ của Phân tích; rút từ bằng so tên mục ("động cơ: kiểu buồng đốt / phun / điều tốc / nạp khí / loại động cơ") và đếm từ khoá. Không lấy mẫu; nhưng danh sách từ là danh sách em soát tay trên các từ có hình dạng tên riêng (chữ hoa, có gạch / số) + bộ từ khoá theo hãng, nên một từ lạ nằm ngoài cả hai có thể sót.

Kết quả chính: HSMT gần như không dùng tên công nghệ riêng. Đa số dòng yêu cầu động cơ chỉ ghi từ chung ("phun trực tiếp" 1.112 gói, "điều tốc điện tử" 459 gói trong Phân tích, "turbo tăng áp").

| Từ trong HSMT | Số gói (đo) | Ghi chú |
|---|---|---|
| E-TVCS ("Xoáy ba hướng") | 3: IB2500189935, IB2500416364, IB2600612866 | cả ba đi cùng "Phun gián tiếp (IDI)" |
| "Swirl Chamber" | 2: IB2200029975, IB2300139646 | IB2200029975 ghi "Kubota V2203-EB"; IB2300139646 không nêu tên hãng (chỉ dung tích 2.197 L, 4 xi lanh 87x92.4); trang Kubota không dùng chữ này (xem mục 5) |
| "Xoáy lốc" | 2: IB2200012797 ("phun trực tiếp hoặc gián tiếp xoáy lốc"), IB2300252125 (8 xi lanh V) | không gắn hãng |
| "Buồng đốt thống nhất" | 6 | từ chung (buồng đốt trực tiếp) |
| "Buồng đốt hình cầu" (đúng chữ động cơ) | 1: IB2400152304 | 4 gói còn lại khớp "spherical" của hạt trao đổi ion / vòng bi, không phải động cơ |
| IDI / phun gián tiếp | 3 (cùng gói E-TVCS) + IB2200012797 | |
| Common Rail | 17 | từ chung |
| EUI (kim phun điện tử) | 8 | từ chung (Cat, Cummins, Volvo, Deere cùng dùng) |
| Bosch HPCR | 1: IB2500327119 | nhãn hiệu linh kiện, không phải hãng động cơ |
| ADEM 4-E2 | 1: IB2300023194 | Caterpillar |
| EMR / EMR2 (bộ điều tốc) | 7 | phần lớn là phụ tùng máy Broadcrown (động cơ DEUTZ) trong gói vật tư; bảng chưa xác nhận được là nhãn hiệu (mục 5) |
| EMCP | 5 | bộ điều khiển Cat |
| PowerCommand | 4 | bộ điều khiển Cummins |
| AmpSentry | 6 | bảo vệ đầu phát Cummins (viết trong yêu cầu "tích hợp phần mềm AmpSentry") |
| OHV | 9 | gần hết là động cơ xăng Honda cỡ nhỏ; từ chung |
| PowerTech | 0 | |

Ngoài ra tên dòng máy: Cummins QSK / KTA / 6BT (21 / 17 / 23 gói theo bộ từ khoá rộng), Cat C-series, Perkins, MTU Series 2000/4000, FPT NEF 3 gói..., xem cột "Gói" ở bảng mục 4 cho số đã soát.

## 4. Bước 2: bảng theo hãng (`engine-traits.json`)
Chỉ từ `exclusive: true` mới có thể dùng làm dấu hiệu "HSMT viết theo hãng này". Cột "Gói" = số gói HSMT khớp regex đã soát tay (chỉ có ở từ có mặt trong HSMT; trống = không thấy trong 1.548 gói).

### kubota
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| E-TVCS (TVCS, Three Vortex Combustion System, three-jet combustion system) | buồng đốt | true | https://engine.kubota.com/products/detail?id=58&ln=en | Kubota’s original E-TVCS (Three Vortex Combustion System) |
| TVCR (TVCR combustion) | buồng đốt | true | https://engine.kubota.com/en/technology/tvcr/d1105k.html | The TVCR is Kubota's original combustion system. |
| Indirect injection (IDI, phun gián tiếp) | phun | false | https://engine.kubota.com/products/detail?id=58&ln=en | Combustion System / Indirect injection |

Chưa xác nhận (kubota): **Swirl Chamber / xoáy lốc** (không thấy trang chính hãng Kubota dùng cụm này; không có câu trích); **IDI (viết tắt)** (trang hãng chỉ ghi 'Indirect injection', không có câu trích tính chất chung của chữ IDI)

### yanmar
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| TNV (4TNV88, 4TNV88-B, 3TNV, 4TNV98) | tên dòng | true | https://www.yanmar.com/global/about/technology/technical_review/2015/1027_1.html | Yanmar released the new TNV engine series to the market in 2013 |
| TN series (4TN101, 4TN107) (4TN101, 4TN107) | tên dòng | true | https://www.yanmar.com/eu/industrial/wp-content/uploads/sites/11/2021/06/IPT-All-in-one_v2024-def.pdf | HIGH POWER TN SERIES |
| Yanmar's original direct-injection combustion chamber (hole valve, hole-type nozzle, buồng đốt phun trực tiếp) | buồng đốt | false | https://www.yanmar.com/media/en_th/com/maintenance/catalog/100242.pdf | The use of Yanmar's original direct-injection combustion chamber plus hole valve |
| Direct injection (DI) / IDI (DI, IDI) | phun | false | https://www.yanmar.com/in/engine/products/diesel/v_watercooled/4tnv88_b/ | IDI engines: combustion chamber, fuel injection equipment mechanical pump. |
| Common Rail (TNV mới) (common rail) | phun | false | https://www.yanmar.com/eu/industrial/wp-content/uploads/sites/11/2021/06/IPT-All-in-one_v2024-def.pdf | Common Rail Technology |
| Total engine management system / ECU (Yanmar ECU) | điều khiển điện tử | false | https://www.yanmar.com/global/about/technology/technical_review/2015/1027_1.html | Yanmar's original total engine management system calculates the conditions of engine |

Chưa xác nhận (yanmar): **buồng đốt Yanmar tên riêng (ví dụ swirl/TVCR-kiểu)** (không thấy tên riêng/nhãn hiệu buồng đốt nào trên trang chính hãng; chỉ có 'original direct-injection combustion chamber'); **Swirl chamber** (trang chính hãng Yanmar đã lưu không dùng cụm này cho dòng TNV; không có câu trích)

### perkins
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| Syncro (Perkins Syncro, SYNCRO) | tên dòng | true | https://www.perkins.com/en_GB/company/news/corporate-press-release/perkins-syncro-tractor-engine-range-debuts-at-agritechnica.html | While the Perkins® Syncro 1.7, 2.2, 2.8 and 3.6 litre industrial engines already meet the needs of a broad range of farm machinery |
| ElectropaK (Electropak, ELECTROPAK) | khác | true | https://www.perkins.com/en_GB/products/new/perkins/electric-power-generation/diesel-engines/1000002240.html | The 6 cylinder, 7 litre Perkins 1106 range of ElectropaK engines gives you all the power you need for electric power generation. |
| Electro Unit (ElectroUnit) | khác | true | https://www.perkins.com/en_GB/products/product-range/400-series/403.html.html | Engines range from 0.7-1.5 litre and come in ElectropaK and Electro Unit options. |
| 400 Series (Perkins 400, dòng 400) | tên dòng | true | https://www.perkins.com/en_GB/products/product-range/400-series/403.html.html | The Perkins 400® Series is an extensive family of engines in the 0.5-2.2 litre range. |
| 1100 Series (Perkins 1100, dòng 1100, 1106D) | tên dòng | true | https://www.perkins.com/en_GB/products/product-range/1100-series.html | The Perkins 1100 Series is a versatile and powerful range of 3-, 4-, and 6-cylinder diesel engines, designed for performance, reliability, and low cost of owner |
| 1200 Series (Perkins 1200, dòng 1200, 1206) | tên dòng | true | https://www.perkins.com/en_GB/products/product-range/1200-series.html | The Perkins 1200 Series is a modern, high-performance range of 4- and 6-cylinder diesel engines designed for industrial, agricultural, and electric power applic |
| 4000 Series (Perkins 4012, 4012, 4016, dòng 4000) | tên dòng | true | https://www.perkins.com/en_GB/products/product-range/4000-series/4012.html | The Perkins® 4012 range delivers a powerful performance, with 12 cylinders and 46 litre displacement providing all the power you need and features ElectropaK di |
| ECM (Electronic Control Module) | điều khiển điện tử | false | https://www.perkins.com/en_GB/products/new/perkins/marine-power-systems/auxiliary/1000003014.html | Cold start aid, ECM controlled to -15°C (5°F) |
| common rail (high pressure common rail, HPCR) | phun | false | https://www.perkins.com/en_GB/products/new/perkins/marine-power-systems/auxiliary/1000003014.html | Electronic high pressure common rail fuel system |

Chưa xác nhận (perkins): **ADEM** (WebSearch giới hạn perkins.com không ra trang nào có chữ ADEM; 6 trang Perkins đã lưu (301-306) đếm 0 lần ADEM. Không có bằng chứng từ trang hãng.); **ElectroPAC** (Không thấy trên perkins.com; trang hãng viết 'ElectropaK' (đã nhận mục ElectropaK). ElectroPAC có thể là cách viết sai trong HSMT.); **1106D-E70TAG4 (hậu tố TAG4/E70)** (Trang 301 chỉ có 1106D-E70TAG (không có TAG4); chưa có câu trích giải thích hậu tố.); **4000 (dòng 4012/4016/4008) tên công nghệ riêng** (Chưa lưu trang riêng; chỉ xác nhận tên dòng.)

### cummins
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| PowerCommand (Power Command, PowerCommand Control, PCC) | điều khiển điện tử | true | https://www.cummins.com/en-na/generators/generator-set-controls | With hundreds of thousands of units in service globally, PowerCommand® generator set paralleling controls have an established and proven record of reliability a |
| AmpSentry (Amp Sentry) | điều khiển điện tử | true | https://www.cummins.com/en-na/generators/generator-set-controls | Backed by Cummins AmpSentry™, the controls will always protect themselves and the system before causing any internal damage. |
| XPI (Xtra-High Pressure Injection, XPI Fuel System) | phun | true | https://www.cummins.com/en-na/engines/products/qsx15-tier-4-finalstage-iv | The proven technology of the XPI common-rail fuel system delivers a precise quantity of fuel at ultra-high pressures. |
| MCRS (Modular Common Rail Fuel System, Modular Common Rail) | phun | true | https://www.cummins.com/en-na/news/2025/06/17/understanding-cummins-hpi-mcrs-fuel-system-upgrades-mining | These kits convert the engines to Cummins’ newer Modular Common Rail Fuel System (MCRS). |
| HPI (High Pressure Injection, Cummins HPI) | phun | true | https://www.cummins.com/en-na/news/2025/06/17/understanding-cummins-hpi-mcrs-fuel-system-upgrades-mining | Cummins has developed upgrade kits for QSK60 and QSK78 engines with HPI fuel systems. |
| PT fuel system (Pressure Time, PT pump) | phun | true | https://www.cummins.com/engines/kta50 | Dependable Cummins PT fuel system can be operated mechanically or with CENTRY electronics for precise engine fueling. |
| CENTRY (Centry) | điều khiển điện tử | true | https://www.cummins.com/engines/kta50 | Dependable Cummins PT fuel system can be operated mechanically or with CENTRY electronics for precise engine fueling. |
| Holset (Holset VGT, Cummins Turbo Technologies) | khác | true | https://www.cummins.com/en-na/components/turbochargers/holset-turbochargers | The Holset VGT™ from Cummins Turbo Technologies pioneered Variable Geometry (VG) technology for the commercial vehicle market in 1998. |
| QSX15 (QSX15-G8) | tên dòng | true | https://www.cummins.com/en-na/engines/products/qsx15-tier-4-finalstage-iv | the QSX15 is engineered to deliver the economical, reliable power and performance that you expect from a Cummins engine. |
| QSK60 (QSK78, QSK50) | tên dòng | true | https://www.cummins.com/en-na/news/2025/06/17/understanding-cummins-hpi-mcrs-fuel-system-upgrades-mining | Cummins has developed upgrade kits for QSK60 and QSK78 engines with HPI fuel systems. |
| QSB6.7 (QSB, QSB7) | tên dòng | true | https://www.cummins.com/en-na/engines/products/qsb67-tier-3?v=996&application=Agriculture | The QSB6.7 uses in-cylinder combustion technology to meet emissions standards without external components, and is compatible with high-sulfur fuels for worldwid |
| KTA50 (KTA19) | tên dòng | true | https://www.cummins.com/engines/kta50 | Covered by a comprehensive one year warranty and backed by Cummins global service network |
| HPCR (High Pressure Common Rail) | phun | false | https://www.cummins.com/en-na/engines/products/qsb67-tier-3?v=996&application=Agriculture | It features a High Pressure Common Rail (HPCR) fuel system, and robust electronic controls make for a highly durable, highly fuel-efficient power plant. |
| VGT (Variable Geometry Turbocharger) | khác | false | https://www.cummins.com/en-na/engines/products/qsx15-tier-4-finalstage-iv | The Cummins VGT Turbocharger is both simple and precise. |
| ECM (Electronic Control Module) | điều khiển điện tử | false | https://www.cummins.com/en-na/engines/products/qsx15-tier-4-finalstage-iv | A single higher-capacity Electronic Control Module (ECM) controls everything from air intake to exhaust aftertreatment, for peak performance and near-zero emiss |

Chưa xác nhận (cummins): **QSZ** (Chưa lưu trang cummins.com nào có dòng QSZ; không có câu trích.); **6BT** (Chưa tìm được trang cummins.com chính hãng nói về 6BT; không có câu trích.); **QSK50 / KTA19 (như tên riêng)** (Chỉ thấy tiêu đề trong kết quả tìm kiếm; trang đã lưu chỉ nêu QSK60/QSK78 và KTA50.)

### mitsubishi
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| MHIET (MHI-ET, MHIET fuel system, MHI-ET) | phun | true | https://engine-genset.mhi.com/industrial-engines-constant-speed/s16r-pta | The engine uses proprietary MHIET mechanical fuel system and turbocharger technology |
| S16R-PTA (S16R2-PTAW, S16R-PTAA2, S16R2-PTAWT-CR) | tên dòng | true | https://engine-genset.mhi.com/industrial-engines-constant-speed/s16r-pta | The S16R-PTA engine is designed in Japan and manufactured in France |
| S12R-PTA (S12R-PTA2, S12R-F1PTAW2) | tên dòng | true | https://engine-genset.mhi.com/industrial-engines-constant-speed/s12r-pta | The S12R-PTA engine is designed in Japan and manufactured in France |
| S16R2-PTAWT-CR (PTAWT-CR, CRS) | điều khiển điện tử | false | https://www.mhi.com/technology/review/sites/g/files/jwhtju2326/files/tr/pdf/e602/e602110_0.pdf | we newly developed a common-rail electronically controlled fuel injection system |
| pump-line-nozzle (bơm cao áp dãy) | phun | false | https://engine-genset.mhi.com/industrial-engines-constant-speed/s16r-pta | pump-line-nozzle (2x in-line pump) |

Chưa xác nhận (mitsubishi): **PTA (giải nghĩa viết tắt)** (Trang hãng không giải nghĩa chữ PTA; chỉ dùng như hậu tố trong tên model.)

### isuzu
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| REDTech (Isuzu REDTech, REDTECH) | điều khiển điện tử | true | https://www.isuzuengines.com/pdf/Isuzu-REDTech-Engine-Controller.pdf | The New Isuzu REDTech™ |
| 4JJ1 (4JJ1X, 4JJ1T) | tên dòng | true | https://www.isuzu.co.jp/world/product/industrial/generator/t4.html | 4JJ1X 2.999L |
| 6WG1 (6WG1X, 6W series) | tên dòng | true | https://www.isuzu.co.jp/world/product/industrial/generator/t4.html | 6WG1X 15.681L |
| High pressure Common Rail and Direct Injection (common rail, phun trực tiếp) | phun | false | https://ptmedia.isuzuengines.com/downloads/Lit%20Sheets/Isuzu-REDTech-6W-Lit-Sheet.pdf | High pressure Common Rail and Direct Injection |

Chưa xác nhận (isuzu): **công nghệ buồng đốt tên riêng của Isuzu** (không thấy tên riêng nào trên trang chính hãng đã lưu (chỉ 'Type of Injection Direct', common rail))

### caterpillar
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| ADEM (ADEM A4, A4 ECU, ADEM4) | điều khiển điện tử | true | https://emc.cat.com/n/api/pubdirect?media_string_id=SS-9060220-18396452-023.pdf | producing the advanced Cat ADEM™ A4 controllers used in Cat engines today |
| ACERT (ACERT Technology, C9 ACERT) | buồng đốt | true | https://emc.cat.com/n/api/pubdirect?media_string_id=LEDH4624-05.pdf | Cat ACERT™ Technology, a revolutionary diesel engine innovation, enhances overall engine performance while reducing emissions |
| HEUI (Hydraulically actuated Electronically controlled Unit Injector) | phun | true | https://emc.cat.com/n/api/pubdirect?media_string_id=SS-9060220-18396452-023.pdf | Precision fuel injection using Cat Common Rail, HEUI™, and MEUI™ (Hydraulically and Mechanically actuated, Electronically controlled Unit Injector) fuel systems |
| MEUI (Mechanically actuated Electronically controlled Unit Injector) | phun | true | https://emc.cat.com/n/api/pubdirect?media_string_id=SS-8902492-18396631-023.pdf | Precision fuel injection using Cat Common Rail, HEUI™, and MEUI™ (Hydraulically and Mechanically actuated, Electronically controlled Unit Injector) fuel systems |
| EMCP (EMCP 3, EMCP 4, EMCP4, EMCP 4.2) | điều khiển điện tử | true | https://www.cat.com/en_US/by-industry/electric-power/electric-power-products/custom-power-solutions/ep-custom-products/custom-control-systems-and-switchgear/generator-controllers/emcp-4.html | EMCP 4 Generator Set Controls / Cat / Caterpillar |
| Cat C9 (C9 ACERT) | tên dòng | true | https://emc.cat.com/n/api/pubdirect?media_string_id=SS-9060220-18396452-023.pdf | Cat® C9 ACERT™ Industrial Diesel Engine |
| Cat C15 (C15 ACERT) | tên dòng | true | https://emc.cat.com/n/api/pubdirect?media_string_id=SS-8902492-18396631-023.pdf | Cat® C15 ACERT™ Industrial Diesel Engine |
| Cat C32 (C32 ACERT) | tên dòng | true | https://emc.cat.com/n/api/pubdirect?media_string_id=SS-9249201-18332039-017.pdf | C32 Generator Set |
| Cat Common Rail (common rail) | phun | false | https://emc.cat.com/n/api/pubdirect?media_string_id=LEDH4624-05.pdf | Precision fuel injection using Cat Common Rail, HEUI™, and MEUI™ (Hydraulically and Mechanically actuated, Electronically controlled Unit Injector) fuel systems |

Chưa xác nhận (caterpillar): **C18** (Trang Cat C18 lưu thất bại (HTTP 404 hai URL); chỉ thấy trong kết quả tìm kiếm.); **ADEM 3** (Các trang đã lưu chỉ nêu ADEM A4; không có câu trích về ADEM 3.); **EUI (chung)** (Trang Cat chỉ dùng HEUI/MEUI có ™; không có câu trích 'EUI' như thuật ngữ chung.); **EMCP 4.4 như dòng riêng** (Trang 704 chỉ dùng 'EMCP 4'; mã 4.4 chỉ nằm trong danh sách tài liệu.)

### kohler
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| KDI (KDI 1903, KDI 2504, KDI 3404, KDI-TCR) | tên dòng | true | https://resources.kohler.com/power/kohler/enginesUS/pdf/Diesel_KDI_31-55_4kW.pdf | With the KOHLER KDI diesel engine, we started from scratch to build an entirely new engine experience. |
| KOHLER Flex (Flex U4, Flex E5) | khác | true | https://resources.kohler.com/power/kohler/enginesUS/pdf/Diesel_KDI_31-55_4kW.pdf | KOHLER Flex is the range of solutions for emission control that Kohler has designed to enable each configuration of the engines of the KDI platform to comply wi |
| Common rail (2000 bar) (2000 bar) | phun | false | https://resources.kohler.com/power/kohler/enginesUS/pdf/KDI_Power_Pack.pdf | Injection Equipment Common rail (2000 bar) |
| KD (làm mát khí, nhỏ) (KD15, KD425, KD625, KD625-2) | tên dòng | true | https://resources.kohler.com/power/kohler/enginesUS/pdf/Diesel_Full_Line.pdf | KD Series (Air-Cooled) |
| KD SERIES (G-Drive) (KD27V12, KD62V12, KD1000, KD2250) | tên dòng | true | https://resources.kohler.com/power/kohler/industrial/pdf/WF76900%20KD%20Series%20Engine%20Brochure%20singlepg.pdf | KD SERIES™ ENGINES |
| G-Drive (KOHLER G-Drive) | tên dòng | true | https://resources.kohler.com/power/kohler/industrial/pdf/WF76900%20KD%20Series%20Engine%20Brochure%20singlepg.pdf | KOHLER® G-Drive diesel engines offer outstanding specific power in a clean, modular design. |
| KODIA | điều khiển điện tử | true | https://resources.kohler.com/power/kohler/industrial/pdf/kd_series_data_kd27v12.pdf | and to communicate with KODIA, our |
| Lombardini (Lombardini Diesel, LDW) | khác | true | https://resources.kohler.com/power/kohler/enginesUS/pdf/OM_KDI_1903_TCR_TCRE5_TC_EN.pdf | KOHLER and Lombardini Diesel |
| KH (mã đầu phát) (KH06220TO4D, KH07770TO4D, KH01221) | khác | false | https://resources.kohler.com/power/kohler/industrial/pdf/g5586.pdf | Alternator Choices |

Chưa xác nhận (kohler): **KD (HSMT viết 'KD' không số)** (Hai họ cùng tiền tố KD (làm mát khí nhỏ và G-Drive lớn); phải xem kèm số (KD15/KD625 so với KD27V12/KD62V12).); **Lombardini là công ty thuộc Kohler** (Kết quả tìm có câu 'Lombardini s.r.l. is a part of Kohler Group' nhưng không tìm thấy trong tệp đã lưu (807, 808) nên không trích.); **KH (động cơ)** (Không tìm thấy dòng động cơ KH trên trang Kohler; chỉ thấy KH là mã đầu phát.)

### volvo-penta
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| EMS 2 (EMS2, Engine Monitoring System 2) | điều khiển điện tử | true | https://volvopenta.com/about-us/news-media/press-releases/2004/mar/news-20735 | Engine Monitoring System 2 (EMS 2), a new electronic control system for diesel engines developed by Volvo Penta |
| EMS (Engine Management System) | điều khiển điện tử | false | https://www.volvopenta.com/industrial/power-generation-engines/power-generation-engine-range/d13-eu-stage-ii-epa-tier-2/ | The D13 power generation engine is equipped with an Engine Management System (EMS), an electronically controlled processing system |
| EVC 2.0 | điều khiển điện tử | true | https://www.volvopenta.com/marine/marine-commercial/variable-speed-marine-generator-sets/ | It includes our latest EVC 2.0 technology for smoother and more intuitive operations. |
| TAD (TAD940VE, TAD1341GE, TAD1346GE) | tên dòng | false | https://volvopenta.com/about-us/news-media/press-releases/2004/mar/news-20735 | comes in four versions: TAD940VE, TAD941VE, TAD942VE and TAD943VE |
| TWD (TWD1031VE) | tên dòng | false | https://volvopenta.com/about-us/news-media/press-releases/2004/mar/news-20735 | Compared to its predecessor, the TWD1031VE, the new 9-liter engine |
| unit injector (Electronic unit injectors) | phun | false | https://www.volvopenta.com/industrial/power-generation-engines/power-generation-engine-range/d13-eu-stage-ii-epa-tier-2/ | Electronic unit injectors |

Chưa xác nhận (volvo-penta): **V-ACT** (Tìm trên volvopenta.com không ra trang nào nhắc V-ACT.); **EGR / SCR đặt tên riêng** (Các trang đã lưu không có tên riêng cho EGR hay SCR.); **EVC (máy công nghiệp)** (EVC chỉ thấy ở trang máy phát biển (903); chưa có trang nói EVC dùng cho TAD công nghiệp.)

### mtu
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| ADEC (ECU 9, ADEC/ECU9) | điều khiển điện tử | false | https://www.mtu-solutions.com/na/en/applications/defense/marine-defense-solutions/system-solutions/engines/mtu-series-4000.html | Engine control and monitoring system (ADEC); engine interface module - EIM |
| Series 4000 (4000, V4000) | tên dòng | false | https://www.mtu-solutions.com/na/en/applications/defense/marine-defense-solutions/system-solutions/engines/mtu-series-4000.html | mtu Series 4000 |
| Series 2000 (2000, V2000) | tên dòng | false | https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/3239641_PG_spec_16V2000DS1250_800kVA_3A_FC_50Hz.pdf/_jcr_content/renditions/original./3239641_PG_spec_16V2000DS1250_800kVA_3A_FC_50Hz.pdf | mtu 16V2000 DS1250 |
| common rail (Common rail fuel injection) | phun | false | https://www.mtu-solutions.com/na/en/applications/defense/marine-defense-solutions/system-solutions/engines/mtu-series-4000.html | the first high speed diesel engine with common rail fuel injection |

Chưa xác nhận (mtu): **Blue Line** (Hai lượt tìm trên mtu-solutions.com / rolls-royce.com không ra trang nào dùng tên Blue Line.); **ECU 7 / ECU 8** (Các datasheet đã lưu chỉ ghi ECU 9; không tìm thấy trang hãng nhắc ECU 7 hay ECU 8.); **Series 396** (Không có trang hãng trong kết quả tìm; chưa lưu.)

### baudouin
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| PowerKit (Powerkit, POWERKIT, PowerKit by Baudouin) | tên dòng | true | https://baudouin.com/engine_product-category/baudouin-powerkit-engines/ | Baudouin’s full range of PowerKit products spans from 18 – 4125 kVA, the most comprehensive range available on the market today. |
| M26 (12M26) | tên dòng | true | https://baudouin.com/our-history/ | the focus was the new M26 engine. Designed for continuous power it was available from 225 to 900hp at 1800 rpm. |
| M33 (6M33, 8M33, 12M33, 16M33) | tên dòng | true | https://baudouin.com/engine_product/6m33/ | 6M33 PowerKit diesel |
| M55 (12M55, 16M55) | tên dòng | true | https://baudouin.com/engine_product-category/baudouin-powerkit-engines/ | 12M55 Power: kWm: 2210 - 3600 kVA: 2280 - 4125 |
| Dòng xM nhỏ (4M06, 4M10, 4M12, 6M11, 6M12, 6M16, 6M21, 6M31, 8M21) (4M06, 4M10, 4M12, 6M11) | tên dòng | true | https://baudouin.com/engine_product-category/baudouin-powerkit-engines/ | 4M06 Power: kWm: 20 - 63 kVA: 18 - 69 |
| Common Rail 2200 bar (common rail) | phun | false | https://baudouin.com/wp-content/uploads/2023/07/10707_12M26.3-STAGE-V_Spec-Sheet_revD.pdf | Most advanced Common Rail technology and high-end injection system (2200 bar), key to achieve strict emissions regulations |
| Weichai (chủ sở hữu) (Weichai Power) | khác | false | https://baudouin.com/our-history/ | In January 2009, Baudouin was purchased by Weichai Power, a company specializing in the design, manufacturing, and sale of diesel engines in China. |

Chưa xác nhận (baudouin): **'6M' như tiền tố chung** (Trang không giải thích quy ước đặt tên 4M/6M/12M (chỉ liệt kê model), nên '6M' riêng lẻ không đủ chứng cứ; xét theo cả mã (6M16, 6M33...).); **DCP (Data Centre Power rating)** (Trang Baudouin có cột Rating 'DCP' và 'Data Centre Engine Power' nhưng không có câu nói đó là tên riêng của hãng.); **HHP** (Chỉ thấy trong kết quả tìm kiếm tóm tắt (tin M33/M55 'HHP'), chưa lưu trang nên không trích.)

### john-deere
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| PowerTech (PowerTech ™, Power Tech) | tên dòng | true | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/4045HFG04_PWL.pdf | PowerTech ™ PWL |
| PowerTech Plus (PowerTech+) | khác | true | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/brochures/dswt89-industrial-engine-selection-guide.pdf | Utilizing the most advanced engine technology, PowerTech Plus engines have a 4-valve cylinder head, |
| PowerTech E (PowerTech E EUI) | tên dòng | true | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/6135HFG75_A.pdf | PowerTech ™ E |
| PowerTech PWL (PWL) | tên dòng | true | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/4045HFG04_PWL.pdf | PowerTech ™ PWL |
| PowerTech PSL | tên dòng | true | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/brochures/dswt89-industrial-engine-selection-guide.pdf | PSL engines provide exceptional power in a compact |
| PowerTech PVS (PVS) | tên dòng | true | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/brochures/dswt89-industrial-engine-selection-guide.pdf | PVS engines deliver excellent power, torque, and |
| 4045 / 6068 / 6135 (mã model) (4045HFG04, 6068HFG85, 6135HFG75) | tên dòng | false | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/4045HFG04_PWL.pdf | 4045HFG04 Diesel Engine |
| HPCR (High-Pressure Common-Rail) | phun | false | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/4045HFG04_PWL.pdf | High-Pressure Common-Rail (HPCR) and Engine |
| EUI (Electronic unit injector) | phun | false | https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/6135HFG75_A.pdf | Electronic unit injector (EUI) fuel system provides variable common rail |

Chưa xác nhận (john-deere): **6081** (Không trang deere.com nào đã lưu có động cơ 6081 (spec sheet 4045/6068/6135 và selection guide đều không nhắc); WebSearch cũng không thấy.); **PowerTech tên riêng 6068 trong genset** (Trang deere.com/en/generator-drive-engines/... (1201-1204) khi tải chỉ ra trang danh sách chung (Firecrawl), không có nội dung từng model; không dùng làm nguồn.)

### fpt
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| HI-eSCR (HI-eSCR2, Hi-eSCR2) | khác | true | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | FPT Industrial’s patented, DPF-free HI-eSCR technology for Tier 4 Final compliance |
| NEF (NEF45, NEF67, NEF67TM4) | tên dòng | true | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | The engines on display include F34 , F36 , NEF45 G Drive , NEF67, C9 and C16 . |
| CURSOR (Cursor 9, Cursor 13, Cursor 16) | tên dòng | true | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | C = CURSOR |
| N45 / N67 (N45, N67, N67TEVP05) | tên dòng | true | https://www.fptindustrial.com/media/press-releases/2025/02/12/14/21/PowerGen-2025 | from 4.5 liters (N45) to 12.9 liters (CURSOR 13) |
| exhaust flap điện tử (patented) (electronically controlled exhaust flap) | điều khiển điện tử | true | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | Our patented electronically controlled exhaust flap maximizes performance at low temperature and low load |
| MyFPT (My FPT) | điều khiển điện tử | true | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | featuring the MyFPT app for real-time engine diagnostics |
| ATS (patented) (ATS) | khác | false | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | FPT Industrial’s patented ATS technology |
| Common Rail (ECR) | phun | false | https://www.fptindustrial.com/en/media/press-releases/2024/01/24/09/28/PowerGen-2024-Stand | Cursor 9 offers a very compact Common Rail system |

Chưa xác nhận (fpt): **Vector** (WebSearch giới hạn fptindustrial.com không thấy động cơ/công nghệ tên Vector; các tệp 1301-1303 đã lưu cũng không có từ này.)

### deutz
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| DCR (DEUTZ Common Rail, Deutz Common Rail) | phun | true | https://www.deutz.com/en/products/engine-finder/engine-detail/tcd-52/ | The powerful DEUTZ Common Rail (DCR®) injection system and the electronic engine control (EMR) |
| DVERT | khác | true | https://www.deutz.com/en/products/engine-finder/engine-detail/tcd-52/ | EPA Tier 4 with DVERT®, selective catalytic reduction (SCR) and particulate filter (DPF) |
| EMR | điều khiển điện tử | false | https://www.deutz.com/en/products/engine-finder/engine-detail/tcd-52/ | the electronic engine control (EMR) with intelligent link to the drive management |
| TCD (TCD 5.2, TCD 7.8) | tên dòng | false | https://www.deutz.com/en/products/engine-finder/engine-detail/tcd-52/ | # TCD 5.2 |
| BF6M1015 (BF8M1015, BFM 1015) | tên dòng | false | https://www.deutz.com/fileadmin/user_upload/produkte/datasheets/en/legacy/bfm_1015_mobile_machinery_en.pdf | BF6M1015C BF6M1015CP BF8M1015C BF8M1015CP |

Chưa xác nhận (deutz): **EMR2 / EMR3** (Không tìm thấy trang hãng nào dùng tên EMR2 hay EMR3 (chỉ thấy 'EMR 4' qua tóm tắt tìm kiếm, trang chưa lưu).); **EMR 4** (Tóm tắt tìm kiếm nói trang TCD 3.6 L4 (Agri) ghi EMR 4; chưa lưu trang nên chưa có câu trích.); **BF4L / BF6L 914** (Datasheet bfl_914c_genset_en.pdf đã lưu (1504) chỉ có tên model 'BF4L 914' trong bảng, không có câu nói về tên riêng.); **TCD 2012 / TCD 914** (Không có trang hãng dùng tên này trong kết quả tìm.); **Anubis** (Máy chủ deutz.com trả trang chặn bot (Anubis) cho cách tải trực tiếp; lệnh trait-source.mjs không chuyển sang Firecrawl nên tệp 1501-1502 được lưu tay từ kết quả firecrawl_scrape (tệp ghi Via: firecrawl).)

### weichai
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| WP13 (WP10, WP7, WP4.1, WP3.2) | tên dòng | true | https://www.weichaipower.com/subsidiary/weichaipower/cn/products/energy-power/power-generation/weichai/diesel/2026090122021977948/index.html | WP13系列产品是潍柴自主研发的高功率密度发动机 |
| M (6M33, 16M55...) (6M33, 6M31, 12M33, 16M33) | tên dòng | false | https://www.weichaipower.com/eportal/ui?pageId=a3035c6ce3f74b769e13419d08f53185 | 6M33系列发电用发动机 |
| 潍柴牌 / 博杜安牌 (Baudouin) (Baudouin, 博杜安) | khác | false | https://www.weichaipower.com/eportal/ui?pageId=a3035c6ce3f74b769e13419d08f53185 | 博杜安牌 |
| 电控高压共轨 (electronically controlled common rail) | phun | false | https://www.weichaipower.com/subsidiary/weichaipower/cn/products/energy-power/power-generation/weichai/diesel/2026090122021977948/index.html | 电控高压共轨 |

Chưa xác nhận (weichai): **WD (WD10, WD12...)** (Tìm trên weichaipower.com / weichai.com không ra trang nào ghi WD; tìm kiếm trả rỗng.); **TBD (TBD226B...)** (Không có trang chính hãng nào trong kết quả tìm kiếm ghi TBD; chưa có câu trích.); **Buồng đốt / hệ phun mang tên riêng** (Trang đã lưu chỉ ghi 'common rail' chung và 'mechanical injection pump' (WP10 dump truck, chưa lưu); không thấy tên riêng.)

### yuchai
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| YC6 (YC6MK, YC6K, YC6T, YC6C) | tên dòng | true | https://www.yuchai.com/news/productnews-detail-686943.htm | 主要产品包括YC6MK发电柴油机、YC6K电控发电柴油机、YC6C、YC6T等 |
| ECW (điện tử điều khiển van xả tăng áp) (电控增压, Electric control wastegate) | điều khiển điện tử | true | https://www.yuchai.com/news/productnews-detail-687467.htm | ECW（电控增压） |
| 稀薄燃烧 (đốt nghèo) (lean burn) | buồng đốt | false | https://www.yuchai.com/news/productnews-detail-687467.htm | 稀薄燃烧是玉柴气体机为客户创造燃气经济性的重要手段 |
| 四气门技术 / 玉柴专有活塞环密封技术 | khác | false | http://cn.yuchaiie.com/product/41675.html | 采用玉柴专有活塞环密封技术和气门油封技术 |

Chưa xác nhận (yuchai): **YCD** (Không trang chính hãng nào trong kết quả tìm kiếm (yuchai.com, yuchaiie.com, en.yuchaidiesel.com) ghi YCD; chưa có câu trích.); **Tên riêng buồng đốt/hệ phun diesel phát điện** (yuchai.com/product/engine.htm chỉ nêu '10大平台' phát điện, không nêu tên; trang chi tiết phát điện chưa tìm thấy qua tìm kiếm.)

### sdec
| Từ | Loại | Exclusive | Nguồn (trang chính hãng) | Câu trích |
|---|---|---|---|---|
| SC12E460D2 (SC13G, SC15G, SC25G, SC27G) | tên dòng | true | https://sdeciepower.com/2018/1-industrial-diesel-engines.html | SC13G / SC15G Diesel Engine for Genset |
| 6135 (12V135, 6114, G128, D114) | tên dòng | true | https://sdeciepower.com/2018/about-sdec.html | Our products are spread out across 7 series: G128/135, C(121), D(114), E, R, H, and W. |
| Dòng chữ cái Z/H/D/E/K/W/VK (series cho máy phát) (E series, W series, K series, VK series) | tên dòng | false | https://sdeciepower.com/2018/1-industrial-diesel-engines.html | E Series Diesel Engine for Genset |
| AVL (hợp tác phát triển dòng E) | khác | false | https://sdeciepower.com/1-4-4-2-e-truck-diesel-engine.html | we unite AVL company in Austria to create and develop the E series truck diesel engine in the new platform |
| electronically controlled common rail (电控共轨) | phun | false | https://sdeciepower.com/1-4-4-2-e-truck-diesel-engine.html | In-line, four valves, electronically controlled common rail, TCI, water cooling wet cylinder liner, rear gear housing |

Chưa xác nhận (sdec): **6126** (Không trang chính hãng nào đã lưu ghi 6126.); **6135 / 6114 dạng đầy đủ có tiền tố 6** (Chỉ có 'G128/135' và 'D(114)'; chưa có câu trích 6135 / 6114 nguyên dạng.); **Tên miền chính hãng sdec.com.cn** (sdec.com.cn không phân giải DNS qua Firecrawl; dùng sdeciepower.com (chính hãng, liên hệ Shanghai New Power Automotive Technology, địa chỉ 2636 Jungong Road). Cần Khoa xác nhận đây là trang chính thức của SDEC.)

## 5. Từ chưa xác nhận hoặc cần Khoa quyết (không đoán)
- **Swirl Chamber / xoáy lốc / IDI** (Kubota): trang Kubota chỉ ghi "Indirect injection" và "E-TVCS", không dùng "swirl chamber"; Yanmar cũng không dùng. Nên "swirl chamber" KHÔNG vào bảng exclusive.
- **EMR / EMR2 (Deutz)**: có trong 7 gói nhưng trang Deutz đã lưu chỉ nói "electronic engine control (EMR)", không ghi ™/®: bảng để exclusive = false, chưa xác nhận.
- **Doosan / Hyundai**: 0 mục. doosanengine.com trả 403 cả với Firecrawl, doosaninfracore.com không phân giải DNS; DP, P-series, DL, HY, D4 đều chưa xác nhận. Cần nguồn khác (PDF brochure của hãng) hoặc Khoa tải tay.
- **MTU**: ADEC, Series 2000/4000, common rail đều exclusive = false (trang không ghi nhãn hiệu); Blue Line, ECU 7/8, Series 396 chưa tìm thấy trang hãng.
- **Perkins ADEM**: 6 trang perkins.com không có chữ này; HSMT có "ECM Perkins 1106D-E70TAG4" nhưng không có nhãn riêng nào xác nhận được; hậu tố TAG4 / E70 chưa xác nhận.
- **Yuchai** (mục từ cn.yuchaiie.com) và **SDEC** (sdeciepower.com): đây là trang công ty con / xuất khẩu, không phải sdec.com.cn (không phân giải DNS). Cần Khoa chấp nhận là nguồn chính hãng, hoặc đổi nguồn. Mọi mục SDEC / Yuchai vì thế mức tin cậy thấp hơn.
- **Weichai "M" ↔ Baudouin M26/M33/M55**: cùng dòng nằm ở hai hãng (Baudouin thuộc Weichai, cặp SAME_MAKER); mục Weichai đặt exclusive = false.
- **Kohler "KH"**: là mã đầu phát (phiếu máy phát Kohler ghi dưới "Alternator Choices"), không phải động cơ; "KD" có hai họ khác nhau (nhỏ làm mát khí và G-Drive), phải xem kèm số.
- **Tên dòng** (TNV, NEF, QSK60, KTA50, C9...): exclusive = true theo nghĩa "mã model của hãng", không phải ™ nguyên văn; FPT / Mitsubishi / Yanmar được ghi rõ trong `note`. Nếu muốn chặt hơn (chỉ nhãn hiệu có ™/®) thì hạ các mục `kind: "tên dòng"` xuống false; code đã nhận được hãng từ model nên các mục này ít giá trị mới.
- **Từ đã bỏ khỏi bảng vì mơ hồ**: "C9"/"C13" trơ (trùng Cursor 9 của FPT), "PT" trơ, "QSK/KTA/QSX" trơ, "SC", "135", "M", "EVC" trơ: đã hạ khỏi aliases (thêm `Cat` hoặc số model đầy đủ).

## 6. Bước 4: đo
Regex đã soát tay từng nhóm (xem ngữ cảnh các gói khớp; lần đo thô đầu có nhiều khớp nhầm: D114 ống nhựa khớp "114", WP7.5-12 là ắc quy, M55 là cáp, "EMS 2" là SCADA/EMS, "HPI" là chữ OCR). Mọi số dưới đây là ĐO, trên 1.548 gói.

**HSMT có từ exclusive của một hãng**
- Từ không phải tên dòng (công nghệ / điều khiển): 19 gói: Kubota 3 (E-TVCS), Cummins 10 (PowerCommand 4 + AmpSentry 6), Caterpillar 6 (ADEM 1 + EMCP 5; IB2400073077 nhắc cả EMCP lẫn Perkins 4012).
- Tính cả tên dòng: 53 gói: Cummins 32 (QSK60 9, KTA50 11, QSX15 3, QSB6.7 1...), Caterpillar 10, FPT 5, Perkins 4, Yanmar 2, Kubota 3, Weichai 1, SDEC 1. Ba gói nhắc nhiều hãng cùng lúc (IB2400073077, IB2300176119, IB2400323739): đó là gói bảo trì nhiều máy hiện hữu, không phải yêu cầu một tổ máy.
- Lưu ý: hầu hết gói nhắc tên dòng là gói bảo trì / vật tư của máy đã có, không phải yêu cầu của tổ máy mới. Chỉ E-TVCS xuất hiện đúng trong bảng yêu cầu động cơ.
- Số gói theo hãng cho E-TVCS: Kubota 3/3, không hãng nào khác.

**Gói đã có kết quả Gợi ý (`configmatch.json` chụp lúc đo, 16 gói; 8 gói có cấu hình)**
| Gói | Số cấu hình | Từ exclusive trong HSMT | Hãng động cơ của các cấu hình | Cấu hình hãng khác |
|---|---|---|---|---|
| IB2600574589 | 5 | (không có) | sdec, yuchai, yuchai, yuchai, weichai | - |
| IB2600581294 | 8 | (không có) | sdec, weichai, sdec, weichai, yuchai, yuchai, yuchai, chưa rõ | - |
| IB2600581977 | 5 | (không có) | volvo-penta, doosan-hyundai, weichai, deutz, volvo-penta | - |
| IB2600586587 | 6 | (không có) | yuchai, yuchai, cummins, weichai, perkins, volvo-penta | - |
| IB2600592658 | 1 | (không có) | cummins | - |
| IB2600592684 | 0 | (không có) | - | - |
| IB2600594596 | 0 | (không có) | - | - |
| IB2600595853 | 1 | (không có) | cummins | - |
| IB2600599817 | 0 | (không có) | - | - |
| IB2600601812 | 6 | (không có) | chưa rõ, yuchai, sdec, perkins, cummins, volvo-penta | - |
| IB2600602880 | 1 | (không có) | cummins | - |
| IB2600603983 | 8 | (không có) | perkins, cummins, baudouin, volvo-penta, mitsubishi, mtu, baudouin, mtu | - |
| IB2600604739 | 0 | (không có) | - | - |
| IB2600607539 | 0 | (không có) | - | - |
| IB2600609805 | 3 | (không có) | chưa rõ, chưa rõ, chưa rõ | - |
| IB2600612866 | 5 | kubota: E-TVCS | caterpillar, kubota, kubota, perkins, yanmar | 3/5 |

Kết luận đo: trong 16 gói đã có Gợi ý chỉ 1 gói (IB2600612866) có từ exclusive (E-TVCS → Kubota); gói đó 5 cấu hình thì 3 là hãng khác (Caterpillar C1.1, Perkins 403A-11G1, Yanmar 3TNV76-GGE) và 2 là Kubota (D1105 wintpower, V2203 Denyo). 15 gói còn lại không có từ exclusive nên luật mới không đổi gì ở chúng. Số lớn hơn (53 gói có tên dòng) chưa so được với Gợi ý vì chỉ 16 gói có kết quả lưu. Hai gói E-TVCS khác (IB2500189935, IB2500416364) chưa có kết quả Gợi ý trong bản chụp, nên chưa biết Gợi ý sẽ ra gì ở đó.

## 7. Ba mẫu đối chiếu nguồn gốc
1. Kubota E-TVCS: https://engine.kubota.com/en/technology/tvcr/d1105k.html và trang https://engine.kubota.com/products/detail?id=58&ln=en. Trích: "Kubota’s original E-TVCS (Three Vortex Combustion System)".
2. Caterpillar ADEM: https://emc.cat.com/n/api/pubdirect?media_string_id=SS-9060220-18396452-023.pdf. Trích: "producing the advanced Cat ADEM™ A4 controllers used in Cat engines today".
3. Deutz DCR: https://www.deutz.com/en/products/engine-finder/engine-detail/tcd-52/. Trích: "The powerful DEUTZ Common Rail (DCR®) injection system and the electronic engine control (EMR)".
(Test đã kiểm cả 112 mục, không chỉ 3 mẫu này.)

## 8. Đề xuất luật cho chặng 2 (chưa qua Khoa; việc cần làm mới được ghi rõ)
1. Chỉ dùng mục `exclusive: true` và `kind` ≠ "tên dòng" làm dấu hiệu từ HSMT (trên đo: 19 gói). Hiện chỉ E-TVCS (Kubota) thật sự nằm trong yêu cầu động cơ; PowerCommand / AmpSentry / EMCP / ADEM là bộ điều khiển, nên dùng cho khối "bộ điều khiển / đầu phát" (hãng tổ máy), KHÔNG dùng để lọc hãng động cơ (PowerCommand gắn với tổ máy Cummins nhưng việc "động cơ phải là Cummins" là một luật khác, cần Khoa quyết).
2. Khi dòng yêu cầu động cơ (tên mục "kiểu buồng đốt / hệ phun / điều khiển") có từ exclusive: ứng viên là động cơ hãng đó (`hints.engineMakes`), bỏ trần 2 cấu hình mỗi hãng cho hãng đó; hãng khác = "không đạt" ở dòng đó. Việc code phải làm mới: nhận mã yêu cầu cho "kiểu buồng đốt" (hiện là `other`), đọc `engine-traits.json` ở `config-bot.mjs`, sửa `config-prompt.md` cùng lúc; không có giao diện nào để xem — nói rõ khi trình Khoa.
3. Từ chung (IDI, common rail, EUI, turbo, "buồng đốt thống nhất", swirl chamber, OHV) không được dùng để lọc hãng.
4. Gói nêu nhiều hãng (bảo trì nhiều máy) không áp luật.
5. Hãng chưa có mục (Doosan / Hyundai, và các hãng TQ nhỏ) = không có dấu hiệu; đừng suy ngược.
6. Việc tay có thể phải nhờ Khoa: xác nhận nguồn SDEC (sdeciepower.com) và Yuchai (cn.yuchaiie.com); tải tay PDF Doosan.

## 9. Rủi ro còn lại và quay lui
- Dữ liệu SDEC / Yuchai dùng trang công ty con (mục 5); nên coi mức tin cậy thấp cho tới khi Khoa xác nhận.
- Danh sách từ HSMT là soát tay trên 1.548 gói; một từ riêng không có hình dạng quen thuộc vẫn có thể sót. Đo lại bằng `engine-traits.json` khi có từ mới.
- Dữ liệu mới, chưa có code nào đọc nên rủi ro chạy = 0. Quay lui: đóng PR / revert commit; không có gì ghi lên web hay `genbid-hsmt\`.
- Firecrawl: các agent báo dùng vài chục lượt tìm / scrape (không đếm chính xác, ước tính dưới 60 credit); hạn mức 1.000 credit tháng.

## 10. Việc chưa kiểm được
- Chưa kiểm nghĩa các viết tắt PTA (Mitsubishi), EMR (Deutz), ADEM của Perkins.
- Chưa có trang chính hãng nào cho: Doosan / Hyundai, MTU Blue Line / ECU 7-8, Perkins ADEM, Cummins QSZ / 6BT, Cat C18, Yanmar tên riêng buồng đốt / phun, Isuzu buồng đốt, Weichai WD / TBD, Yuchai YCD.
- Chưa đo ảnh hưởng thật lên Gợi ý (đó là chặng 2).

## Cần ghi nhớ
- Quyết định cần Khoa: (a) chấp nhận trang công ty con (sdeciepower.com, cn.yuchaiie.com) làm "chính hãng"; (b) có hạ mục "tên dòng" xuống exclusive=false không; (c) luật "gói nêu PowerCommand / EMCP ⇒ động cơ cùng hãng" có áp không.
- Bẫy mã: đã ghi vào `suppliers/CLAUDE.md` trong PR #914 (alias ngắn khớp nhầm; deutz.com Anubis không tự qua Firecrawl).
