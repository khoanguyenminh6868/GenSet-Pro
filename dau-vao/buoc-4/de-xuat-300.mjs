// Buoc 4 kiem ke, phan 2: 300 nhan pho bien nhat (xep theo SO NCC, roi so dong) ma specKey khong nhan + de xuat truong.
// Doc nhan-khong-nhan-bang.tsv (nhan-khong-nhan.mjs). Chay: node de-xuat-300.mjs → de-xuat-300.tsv + tom tat theo loai
import fs from "node:fs";
import path from "node:path";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const L = fs.readFileSync(path.join(OUT, "nhan-khong-nhan-bang.tsv"), "utf8").split("\n").slice(1).map((l) => l.split("\t"));
const top = L.filter((r) => +r[4] >= 3).sort((a, b) => (+b[4] - +a[4]) || (+b[3] - +a[3])).slice(0, 300);

// [regex tren nhan chuan hoa, loai, truong de xuat / ghi chu]
const R = [
  [/^(model|型号|型 号|models?|model number|gensetmodel|genset model|generator set model|generator model|机组型号|发电机组型号|柴油机型号|发动机型号|发电机型号|diesel engine model|engine model|alternator model|柴油机型号 engine model|发动机型号 engine model)$/, "MA", "mã model: bộ đọc mã (headerRows/isCode), không qua specKey: genset.model / engine.model / alternator.model theo vai bảng"],
  [/^(prime power|standby power|rated power|kva|kw|power|standby|prime|备用功率|额定功率|功率|输出功率|prp|esp|rated output|output|prime output|standby output|output power|主用功率|常用功率|continuous power|power output|standby kva|prime kva|prime kw|standby kw|power rating|max\. power|max power|power range|kva\/kw|kw\/kva|kwe|kva prp|power kw|rated output power|rated output prime power|rated prime power|standby power rating|prime power rating|rated standard power|rated capacity|continuous output|max\. output|genset power|gensets power|机组输出功率|最大功率|备用功率 standby power|rated|load|comprehensive power|starting power|power supply|supply|output type|rated currency|备用)$/, "CONG-SUAT", "công suất: bộ đọc riêng (powersIn / bảng power), không phải trường specKey. 'rated currency' (gõ sai) = dòng điện: genset.current"],
  [/^(frequency|rated frequency|hz|50hz|60hz|50 hz|60 hz|频率|额定频率|frequency range|output frequency \/ rated speed)$/, "TAN-SO", "genset.frequency (đọc bằng freqIn của catalog.js, trường không có key)"],
  [/^(engine brand|engine make|engine manufacturer|柴油机品牌|发动机品牌|brand|品牌|manufacturer|make)$/, "THUONG-HIEU", "engine.brand / genset.brand (theo vai bảng; 'brand' trơ trong bảng có cột Engine = hãng động cơ)"],
  [/^(alternator brand|alternator manufacturer)$/, "FIELD", "alternator.brand"],
  [/^(alternator|engine|generator|generator set|genset|diesel engine|diesel|motor|gensets|generator sets?|发动机)$/, "TIEU-DE-CUM", "tiêu đề cột / cụm (Engine | Alternator): giá trị là model ở cột kế; không phải nhãn thông số"],
  [/^(cummins|perkins|stamford|leroy somer|mitsubishi|mtu|deutz|yuchai|weichai|baudouin|longkai|shangchai|mecc alte|珀金斯|重庆康明斯|东风康明斯|潍柴博杜安|上柴股份|上柴动力|沃尔沃遍达|广西玉柴股份|玉柴|潍柴动力|道依茨|康明斯|china|cn)$/, "GIA-TRI", "tên hãng / nước: giá trị lọt vào cột nhãn (dòng đầu bảng 'hãng' hoặc cột), không phải nhãn"],
  [/^(\d+(\.\d+)?\s*(kw|kva|hz|v)|\d+\s*[/.]?\s*[lv]|[lv]\d+|\d+\s*[lv]|\d+\/[lv]|400v, 50 hz|200g\/kw\.h|204g\/kw\.h|g\/kw\.h|l\/h|mm|n\/a|na|tba|none|50hz|stage v|t2|g3|electronic|mechanical|natural|digital|open|silent|open type|silent type|soundproof type|auto|stop)$/, "GIA-TRI", "giá trị / đơn vị (cột công suất '400KW', bố trí '6L', tiêu hao '200g/kw.h', 'Open type' = tên cột loại vỏ) lọt vào cột nhãn"],
  [/^(n\.w|n\.w\.|g\.w|weight)$/, "FIELD", "genset.weight: 'N.W (kg)' = net weight; regex weight của specKey không có 'n.w'"],
  [/^(fuel con\.?|fuel consumption|fuel cons)$/, "FIELD", "genset.fuel_100: 'Fuel Con.(L/H)' chưa khớp (regex fuel cần 'consum' / 'cons.')"],
  [/^(sound decibel|noise|noise level)$/, "FIELD", "genset.noise: 'Sound decibel' chưa khớp"],
  [/^(no\.? ?of bearings|bearing|bearings)$/, "FIELD", "alternator.bearing"],
  [/^(no\.? ?of poles|poles?|pole number)$/, "FIELD", "alternator.poles"],
  [/^(no\.? ?of leads|leads|wires|no\.? ?of wires)$/, "FIELD", "alternator.wires ('Wires' hiện bị specKey nhận là phase)"],
  [/^(avr model|avr|avr type)$/, "FIELD", "alternator.avr"],
  [/^(alternator type|alternator option|alternator options?)$/, "FIELD", "alternator.type (kiểu đầu phát) hoặc tuỳ chọn hãng đầu phát: cần Khoa xem"],
  [/^(fuel system|injection system)$/, "FIELD", "engine.fuel_system"],
  [/^(fuel type|fuel)$/, "FIELD", "genset.fuel (enum diesel/gas/gasoline/dual; 'Fuel' trơ có thể là cột nhiên liệu hay tiêu hao)"],
  [/^(压缩比|compression ratio)$/, "FIELD", "engine.compression: specKey chỉ khớp tiếng Anh 'compression', thiếu 压缩比"],
  [/^(oil capacity|total oil capacity|lubricating oil capacity|lube oil capacity|机油量)$/, "FIELD", "engine.oil_capacity: specKeyOf bỏ cả nhãn có 'capacity' (chặn công suất) nên 'Oil Capacity' rơi ra ngoài"],
  [/^(coolant capacity|cooling system capacity|冷却液容量)$/, "FIELD", "engine.coolant_capacity: cùng lỗi 'capacity' như oil_capacity"],
  [/^(排气量|排量|displacement)$/, "FIELD", "engine.displacement: 排气量 chưa khớp (regex chỉ có 排量)"],
  [/^(启动方式|起动方式)$/, "FIELD", "engine.starting: regex /start/ chỉ tiếng Anh, thiếu 启动方式 / 起动方式"],
  [/^(combustion system|燃烧方式)$/, "FIELD", "engine.engine_type (hoặc trường combustion không có trong bộ: cần Khoa xem)"],
  [/^(功率因素|power factor|factor)$/, "FIELD", "genset.power_factor: '功率因素' gõ sai 因数 → 因素"],
  [/^(current|电流)$/, "FIELD", "genset.current: nhãn 'Current' trơ; regex chỉ khớp 'rated current' / 电流 (中文)"],
  [/^(output voltage|voltage output|voltage output 50 hz|volrage|230v)$/, "FIELD", "genset.voltage ('Volrage' gõ sai, 645 dòng 1 NCC)"],
  [/^(接线方式|connection|connection type|number of phase power)$/, "FIELD", "genset.phases (số pha / dây) hoặc kiểu nối sao-tam giác không có trong bộ: cần Khoa xem"],
  [/^(circuit breaker|breaker)$/, "FIELD", "genset.breaker (hiện không nhãn nào nhận)"],
  [/^battery$/, "FIELD", "genset.battery"],
  [/^(altitude|operating temperature|storage temperature|temperature|condition)$/, "FIELD", "genset.ambient (altitude / nhiệt độ); trong tờ BĐK là dải làm việc của BĐK: controller.operating_temp"],
  [/^(overspeed)$/, "FIELD", "alternator.overspeed (trong tờ BĐK là bảo vệ quá tốc của BĐK)"],
  [/^(overload)$/, "FIELD", "genset.overload (trong tờ BĐK là bảo vệ quá tải của BĐK)"],
  [/^(length|width|height)$/, "FIELD", "genset.dimensions: nhãn L/W/H tách dòng, cần ghép 3 dòng"],
  [/^(accuracy|measurement range|resolution|display|port|ethernet|input|inputs|reverse power|warning|alarm|mains|ecu|ecm|can|switch|datasheet|control system|control|dc output|terminals of controller|fuel relay output|pre-heater)$/, "BDK", "nhãn của tờ bộ điều khiển (controller.*): xem mục 4"],
  [/^(thermal efficiency|electrical efficiency)$/, "KHONG-TRUONG", "hiệu suất nhiệt / điện của tổ máy khí: không thuộc bộ trường"],
  [/^(warranty|oil pressure|engine air flow|input)$/, "KHONG-TRUONG", "nhãn thật nhưng không có trong bộ trường"],
  [/^(type|series|specification|specifications|description|unit|no\.|number|item|parameter|parameters|models?|note|download|click here|product|detail data|page|function|features|and|the|to|of|in|on|by|for|or|this|with|be|not|other|powered|1|input|motor)$/, "NHIEU", "chữ nhiễu / nhãn quá chung ('Type' không biết loại gì)"],
];

const cls = {};
const t = ["hang\tnhan\tdong\tncc\tcol_row_pair\tloai\tde_xuat\tvi_du1\tvi_du2"];
top.forEach((r, i) => {
  let loai = "CHUA-PHAN-LOAI", dx = "cần xem tay";
  for (const [re, l, d] of R) if (re.test(r[1])) { loai = l; dx = d; break; }
  cls[loai] = (cls[loai] || { n: 0, lines: 0 }); cls[loai].n++; cls[loai].lines += +r[3];
  t.push([i + 1, r[1], r[3], r[4], r[6], loai, dx, r[7] || "", r[8] || ""].join("\t"));
});
fs.writeFileSync(path.join(OUT, "de-xuat-300.tsv"), t.join("\n"));
console.log(JSON.stringify(cls));
console.log(top.filter((r) => { for (const [re] of R) if (re.test(r[1])) return false; return true; }).map((r) => `${r[1]}(${r[4]}/${r[3]})`).join(" ; "));
