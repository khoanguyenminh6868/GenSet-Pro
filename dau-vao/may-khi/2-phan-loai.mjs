// Phân loại TAY (kết quả soát từng bảng của 1-quet.mjs / cand.json) thành: khi | xang | xang_khi | diesel_nham | khong_ro.
//   node 2-phan-loai.mjs <gốc repo origin/main> <thư mục ra>  (đọc cand.json cùng thư mục script)
// Mỗi quyết định ghi lý do + mức bằng chứng: B = bảng / tiêu đề cột / ô ghi nhiên liệu hoặc tiêu hao khí; T = tên trang / tiêu đề bảng ghi
// khí cho CHÍNH sản phẩm (bảng không có cột nhiên liệu); M = chỉ mã model đuôi NG + URL; N = chữ ở menu / khẩu hiệu công ty / đơn vị không phải khí.
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const ROOT = process.argv[2], OUT = process.argv[3];
import { fileURLToPath } from "node:url"; const here = path.dirname(fileURLToPath(import.meta.url));
const cand = JSON.parse(fs.readFileSync(path.join(here, "cand.json"), "utf8"));
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog;
const all = (id) => (t) => t.id === id;
const ns = (id, list) => (t) => t.id === id && list.includes(t.n);
const except = (id, list) => (t) => t.id === id && !list.includes(t.n);
// [điều kiện, lớp, mức, lý do]
const RULES = [
  // --- diesel bị nhầm (dấu hiệu chữ nhưng là diesel / menu) ---
  [all("powerzoo"), "diesel_nham", "N", "chữ 'Gas Generator Set' là mục menu trang ('Diesel Generator Set | Gas Generator Set | BESS…'), mọi bảng là máy diesel"],
  [all("chenxing-weifang"), "diesel_nham", "N", "'提供柴油、燃气发电机组' là khẩu hiệu công ty ở tiêu đề trang; bảng là 柴油机参数 (NT855-GA…), không nêu khí"],
  [all("gillette-generators"), "diesel_nham", "N", "'Natural Gas and … Diesel' là menu trang; bảng ghi ENGINE FUEL TANK / FUEL USE gal/ltr/hr, không có khí"],
  [(t) => t.id === "westinpower" && t.tier === "W", "diesel_nham", "N", "m³/h là lưu lượng nước làm mát ('Coolant flow | 80m³/h') của datasheet diesel TX…"],
  [ns("victory-generator", [129, 133]), "diesel_nham", "N", "máy diesel hai xi lanh ('Silent Diesel Twin-cylinder'); chữ xăng chỉ ở dòng khác của trang"],
  // --- xăng ---
  [ns("bison-zhejiang", [1003]), "xang", "T", "datasheet 'View the gasoline generator Catalog' (BISON-gasoline-generator-2.pdf), động cơ BS170F hai kỳ"],
  [ns("cameo-power", [127]), "xang", "B", "tiêu đề '10kw Gasoline Generator', dòng 'Fuel Type | Gasoline'"],
  [ns("kigerpower", [2011]), "xang", "T", "URL 'kg15000e-12kw-portable-gasoline-generator'"],
  [ns("yunnei-power", [103]), "xang", "B", "tiêu đề '汽油发动机', dòng '燃料 | 汽油' (động cơ G16MPI)"],
  [ns("victory-generator", [119, 124, 130, 131, 132]), "xang", "T", "tiêu đề 'Gasoline Portable / Welding / Twin-cylinder Generator', dòng 'Gasoline Consumption'"],
  // --- xăng + khí ---
  [ns("victory-generator", [117]), "khi", "B", "tiêu đề 'Cummins Gas Generator Set', cột 'Gas Consumption (M3/KW.h)'"],
  [ns("victory-generator", [118]), "xang_khi", "T", "'2KW~10.5KW Gas(LPG) Portable Generator': tiêu đề ghi LPG, bảng ghi 'Gasoline Consumption' (máy xăng chạy LPG)"],
  [all("slong-power"), "xang_khi", "B", "dòng 'Fuel Type | Gasoline , LPG , NG' (máy nhiều nhiên liệu xăng / LPG / khí thiên nhiên)"],
  // --- không rõ ---
  [all("jianghao-genset"), "khong_ro", "T", "tiêu đề trang 'Gas Generator' nhưng cột 'FuelCon. (L)' (lít) và động cơ 4B / Chaochai CY4102; bảng không nêu khí"],
  [ns("simpson-power", [124]), "khong_ro", "T", "tiêu đề 'SIMPSON-GasGenerators', máy 2,2 kW (ZS168FA): 'Gas' có thể là gasoline; bảng không nêu nhiên liệu"],
  [ns("man-engines", [104]), "khong_ro", "T", "tiêu đề 'Compact MAN diesel and gas engines as auxiliary engines': bảng gộp D2676 / D2862 (diesel) với E3262 (khí), dòng không nêu nhiên liệu"],
  [ns("kingway-power", [117]), "khong_ro", "T", "tiêu đề '70KW Double Membrane Biogas Storage Tank For Waste Water Treatment' (bể chứa khí sinh học), model KGD250B: không rõ sản phẩm có phải tổ máy khí"],
  [ns("penlucky", [102]), "khong_ro", "T", "URL 'diesel-industrial-generators/cummins-generator' (diesel) nhưng động cơ ghi 'K38N' (đuôi N); bảng không nêu nhiên liệu"],
  // --- khí ---
  [all("aosif"), "khi", "B", "tiêu đề 'Natural Gas / Biogas Series', cột 'Natural Gas / Biogas Consumption'"],
  [all("agg-fuzhou"), "khi", "M", "URL 'agg-natural-gas-generator-sets', ô model tổ máy đuôi '-NG' (DC260G6-NG), động cơ K19N-G2 / LY13-G280"],
  [all("ettes-power"), "khi", "T", "tiêu đề 'Natural Gas / Biogas Power Generator, CHP' (kWe, kWt)"],
  [all("googol"), "khi", "B", "'Gas Genset', cột 'Gas Engine Model', 'Gas consumption (Nm³/hr)'"],
  [all("green-power-generators"), "khi", "B", "'Gruppi elettrogeni a Gas', ô nhiên liệu 'METANO / GPL GAS. METHANE / LPG'"],
  [all("huayuan-weifang"), "khi", "B", "'gas generator set', cột '燃气消耗(m3/kw.h)'"],
  [all("innio-jenbacher"), "khi", "B", "Jenbacher (động cơ khí): tiêu đề 'khí tự nhiên', 'Natural gas', 'Gas Engine'"],
  [all("jichai-huanneng"), "khi", "T", "tiêu đề 'Biomass Gas (Syngas) / Biogas (methane) / Natural Gas Generator Set'"],
  [all("kaihua-genset"), "khi", "T", "tiêu đề + URL 'By-Function/Gas-Generator'; bảng không nêu nhiên liệu"],
  [except("kingway-power", [117]), "khi", "T", "tiêu đề 'LPG / Biogas / Gas Generator Set'; bảng không nêu nhiên liệu"],
  [all("lees-power"), "khi", "B", "cột 'Gas Consumption' (CUMMINS / KUBOTA GAS GENERATOR SET)"],
  [ns("man-engines", [105, 111]), "khi", "B", "'MAN gas engines for power generation' / 'E3262 gas engine', cột 'Air/fuel ratio λ'"],
  [all("mwm"), "khi", "B", "datasheet TCG (động cơ khí MWM): nhiên liệu 'Landfill gas / Biogas', 'kWh/Nm3'"],
  [all("naipute-weifang"), "khi", "B", "dòng 'Fuel Type | Natural gas / Biogas'"],
  [ns("penlucky", [107]), "khi", "M", "URL 'generator/gas-generator', 'Gaseous Industrial Generators', model GGP33*9NG3 / động cơ WP4D44E200NG"],
  [all("power-hf"), "khi", "B", "'R系列燃气发动机' / '燃气发电机组', '燃气种类 沼气、天然气、液化气', '燃气消耗率'"],
  [all("repower-gas"), "khi", "B", "'Gas Generator 500kw', 'Gas engine', 'Gas consumption'"],
  [all("rise-power"), "khi", "B", "'Gas Powered Generator Set', cột nhiên liệu 'Natural gas'"],
  [all("ronsun-power"), "khi", "T", "tiêu đề 'Natural Gas / Biogas Generator Set', 'Biogas ≤0.3 m³/kW.h'"],
  [all("sunkings"), "khi", "B", "'Natural Gas Generator Set', 'Associated Gas', 'Fuel Consumption MJ/kw.h'"],
  [all("taihai-taizhou"), "khi", "B", "'天然气发电机组', cột '燃气消耗量 m3/kwh', '燃料 NG'"],
  [all("tide-power"), "khi", "B", "'Gas Genset Selector Sheets', 'NATURAL GAS'"],
  [all("weichai-power"), "khi", "M", "tiêu đề 'Standard Land-based Generator Set', model tổ máy 'PG…*7NG', động cơ '…N0/5' (cùng bảng với weichai-heavy-machinery có URL gas-generator-set)"],
  [all("weichai-heavy-machinery"), "khi", "M", "URL '…/gas-generator-set/…', model tổ máy 'PG…*7NG'"],
  [all("weiman-fujian"), "khi", "T", "tiêu đề + URL 'Gas Generator Set'; bảng không nêu nhiên liệu"],
  [(t) => t.id === "westinpower" && t.tier === "S", "khi", "T", "tiêu đề 'Gas Generator Sets with MAN / Baudouin / Perkins Engines' (Baudouin: 'Natural Gas')"],
  [all("xinshengan-shandong"), "khi", "T", "tiêu đề '燃气发电机组' (XSA300GFNG)"],
  [all("xinzhengfa"), "khi", "T", "tiêu đề '燃气发电机组'; bảng không nêu nhiên liệu"],
  [all("yingtai-jiangsu"), "khi", "T", "tiêu đề '燃气发电机组' (cùng trang có bảng '燃气种类 天然气，LNG，CNG'); bảng này không nêu nhiên liệu"],
  [ns("simpson-power", [120]), "khi", "T", "tiêu đề 'SIMPSON- Natural gasis'"],
];
const lab = { khi: "khí", xang: "xăng", xang_khi: "xăng/khí", diesel_nham: "diesel bị nhầm", khong_ro: "không rõ", chua: "chưa phân loại" };
const rows = [], unitsOut = [];
for (const t of cand) {
  const has = t.nRecs || t.units.length;
  const r = RULES.find(([f]) => f(t));
  const cls = r ? r[1] : (has ? "chua" : "ngoai_catalog");
  rows.push({ id: t.id, n: t.n, ti: t.ti, cls, lv: r ? r[2] : "", why: r ? r[3] : "", title: t.title.slice(0, 70), url: t.url, nRows: t.nRows, nRecs: t.nRecs, units: t.units.length, tier: t.tier });
  if (has && cls !== "ngoai_catalog") for (const u of t.units) if (u.kind === "engines") unitsOut.push({ cls, id: t.id, n: t.n, ti: t.ti, ekey: u.ekey, model: u.model, make: u.make, kl: `${t.id}|${u.ekey}|${C.keyOf(u.line)}` });
}
fs.mkdirSync(OUT, { recursive: true });
const tsv = ["ncc\tn\tti\tlop\tmuc\tdong\tbanghi\ttieu-de\tly-do"];
for (const r of rows.filter((r) => r.cls !== "ngoai_catalog")) tsv.push([r.id, r.n, r.ti, lab[r.cls], r.lv, r.nRows, r.units, r.title, r.why].join("\t"));
fs.writeFileSync(path.join(OUT, "phan-loai-bang.tsv"), tsv.join("\n") + "\n");
fs.writeFileSync(path.join(OUT, "dong-khi.json"), JSON.stringify(unitsOut));
// tổng hợp
const sum = {}, by = {};
for (const r of rows) {
  if (r.cls === "ngoai_catalog") continue;
  if (!r.units) { (sum[r.cls + " (0 bản ghi)"] = sum[r.cls + " (0 bản ghi)"] || { bang: 0, dong: 0, bg: 0, ncc: new Set() }).bang++; continue; }
  const s = (sum[r.cls] = sum[r.cls] || { bang: 0, dong: 0, bg: 0, ncc: new Set() }); s.bang++; s.dong += r.nRows; s.bg += r.units; s.ncc.add(r.id);
  const b = (by[r.id + "\t" + r.cls] = by[r.id + "\t" + r.cls] || { bang: 0, dong: 0, bg: 0 }); b.bang++; b.dong += r.nRows; b.bg += r.units;
}
for (const [k, v] of Object.entries(sum)) console.log(lab[k.replace(" (0 bản ghi)","")]||k, k.includes("0 bản")?"(0 bản ghi)":"", v.bang, "bảng", v.dong, "dòng", v.bg, "bản ghi (engine+alt)", v.ncc.size, "NCC");
console.log("chưa phân loại:", rows.filter((r) => r.cls === "chua").map((r) => r.id + " n" + r.n).join(", "));
console.log("ngoài catalog (0 bản ghi):", rows.filter((r) => r.cls === "ngoai_catalog").length, "bảng");
const lines = ["ncc\tlop\tbang\tdong\tbanghi"]; for (const [k, v] of Object.entries(by).sort()) { const [id, c] = k.split("\t"); lines.push([id, lab[c], v.bang, v.dong, v.bg].join("\t")); }
fs.writeFileSync(path.join(OUT, "tong-hop-ncc.tsv"), lines.join("\n") + "\n");
fs.writeFileSync(path.join(OUT, "phan-loai-ngoai-catalog.tsv"), ["ncc\tn\tdong\ttieu-de\tdau-hieu"].concat(rows.filter((r) => r.cls === "ngoai_catalog").map((r) => [r.id, r.n, r.nRows, r.title, r.tier].join("\t"))).join("\n") + "\n");
