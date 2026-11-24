// Buoc 4 kiem ke, phan 1 (ket): xep hang truong theo loi ich = so "model-o" bang cn co gia tri neu nhan cac nhan DA DUYET TAY duoi day.
// Danh sach nhan do em chon sau khi doc vi du (truong-chat.tsv, nhan-nham.mjs). Chay: node xep-hang.mjs → xep-hang.tsv
// model-o: o gia tri cua bang cn (dong nhan|gia tri: moi o sau nhan; o tieu de cot: moi dong du lieu co o cung chi so) — la so Ô CO GIA TRI, co the dem trung model neu nhieu bang.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/web/catalog.js").href);
const CAT = globalThis.GenbidCatalog;
const labels = JSON.parse(fs.readFileSync(path.join(OUT, "labels.json"), "utf8"));
const squash = (n) => n.replace(/[(（\[【][^)）\]】]*[)）\]】]/g, " ").replace(/^[•●○▪\-–*\d.\s]+(?=[a-z\u3400-\u9fff])/i, "").replace(/[*:：]+/g, " ").replace(/\s+/g, " ").trim();

// [truong, trang thai hien tai, ghi chu hanh dong, [nhan da duyet]]
const A = [
  ["engine.genset_power", "chưa sinh", "nhận nhãn cột trong bảng ĐỘNG CƠ (cùng dòng với công suất tổ máy)", ["kwe", "genset power", "机组功率", "electrical output", "generator power", "发电功率", "electrical power", "发电机功率", "电功率", "genset rating"]],
  ["alternator.wires", "chưa sinh; 'Wires' đang nhận nhầm sang phase", "nhận 'Wires', 'No of Leads', 'Leads', 'Terminals', 'Number of wires'; bỏ khỏi phase", ["wires", "no of leads", "leads", "terminals", "number of wires", "terminal", "leads number", "winding leads"]],
  ["alternator.avr", "chưa sinh; 'Voltage Regulator', 'AVR', 'AVR type' đang nhận nhầm sang vreg / excit", "nhận 'AVR Model', 'Regulator', 'Voltage regulator (type)', 'AVR type', 'AVR', '调压器'", ["voltage regulator", "avr model", "voltage regulator type", "regulator", "avr type", "avr", "调压器", "regulator type"]],
  ["engine.coolant_capacity", "đã sinh 149 model; mất nhãn có chữ 'capacity'", "sửa chặn `capacity` ở đầu specKeyOf", ["coolant capacity", "cooling system capacity", "冷却液容量", "cooling water capacity", "engine coolant capacity", "water capacity"]],
  ["engine.oil_capacity", "đã sinh 1.093 model; mất nhãn có chữ 'capacity'", "sửa chặn `capacity` ở đầu specKeyOf", ["oil capacity", "lubricating oil capacity", "lube oil capacity", "oil", "engine oil capacity", "oil sump capacity", "oil pan capacity", "sump capacity", "lubrication oil capacity"]],
  ["engine.fuel_system", "chưa sinh", "nhận 'Fuel System', 'Injection system/type', 'Fuel injection system'", ["fuel system", "injection type", "injection system", "injection", "direct injection", "fuel injection system", "燃油系统", "fuel system type", "fuel pump", "injection pump", "common rail", "fuel injection pump"]],
  ["engine.compression", "đã sinh 844 model; thiếu nhãn tiếng Trung", "thêm 压缩比", ["压缩比"]],
  ["engine.electrical_vdc", "chưa sinh; 'Starting voltage / system' đang vào `start`", "nhận nhãn điện áp hệ thống khởi động / ắc quy; tách khỏi starting", ["engine electrical system", "starting voltage", "starter voltage", "starting system", "starter", "starter motor", "battery voltage", "electrical system"]],
  ["alternator.poles", "chưa sinh", "nhận 'Poles', 'Pole', 'No of poles', 'Pole number'", ["pole", "poles", "pole number", "no of poles", "number of poles", "number of pole"]],
  ["alternator.bearing", "chưa sinh", "nhận 'Bearing', '轴承数', 'Number of bearings'", ["bearing", "轴承数", "bearing number", "number of bearings", "bearings", "bearing arrangement", "bearing type"]],
  ["genset.breaker", "chưa sinh", "nhận 'Circuit breaker', 'Breaker', 'MCCB'", ["circuit breaker", "breaker", "mccb", "breaker model", "ac circuit breaker", "capacity of breaker", "main circuit breaker", "circuit breaker type"]],
  ["alternator.overspeed", "chưa sinh", "nhận 'Overspeed', 'Maximum overspeed'", ["overspeed", "maximum overspeed", "overspeed rpm", "over speed", "over-speed"]],
  ["alternator.altitude", "chưa sinh (trùng genset.ambient)", "nhận 'Altitude (requirement)'; ghi vào ambient của tổ máy hay altitude của đầu phát: cần Khoa", ["altitude", "altitude requirements", "altitude requirement", "海拔要求", "operating altitude", "höhe", "海拔高度"]],
  ["genset.ambient", "chưa sinh (trùng alternator.altitude)", "nhận altitude / operating temperature / ambient", ["altitude", "operating temperature", "altitude requirements", "temperature", "altitude requirement", "operating conditions", "ambient temperature", "working temperature", "humidity"]],
  ["genset.genset_type", "chưa sinh", "nhận 'Genset type', '机组类型', 'Enclosure type'; tiêu đề cột 'Open type / Silent type' cần bộ đọc cấu trúc bảng", ["机组类型", "genset type", "generator type", "set type", "型式", "enclosure type", "unit type"]],
  ["genset.genset_type (cột Open/Silent)", "chưa sinh (cột phân vỏ)", "tiêu đề cột 'Open type' / 'Silent type' / 'canopy': không phải cặp nhãn – giá trị", ["open type", "silent type", "soundproof canopy", "开架机组 open type", "soundproof type"]],
  ["genset.battery", "chưa sinh", "nhận 'Battery', 'Battery capacity', 'Battery voltage' (hiện → voltage)", ["battery", "battery capacity", "battery voltage", "number of batteries", "battery charging alternator", "电瓶", "battery type", "battery charger"]],
  ["alternator.short_circuit", "chưa sinh; '短路电流' đang nhận nhầm sang current", "nhận 'Short circuit capacity/ratio', '短路能力', '短路电流'", ["short circuit ratio", "short circuit capacity", "sustained short circuit", "短路能力", "短路电流", "short-circuit"]],
  ["alternator.air_flow", "chưa sinh", "nhận 'Cooling air flow', 'Air flow'", ["air flow", "cooling air flow", "cooling air", "air consumption"]],
  ["engine.power_hp", "chưa sinh ('cn/ không có số HP')", "nhận cột 'CV', 'HP', 'BHP', 'Engine HP'", ["cv", "hp", "engine hp", "bhp", "horsepower"]],
  ["engine.starting", "đã sinh 224 model", "thêm 启动方式 / 起动方式 / 启动系统", ["启动方式", "起动方式", "启动系统"]],
  ["engine.displacement", "đã sinh 2.547 model", "thêm 排气量, Hubraum, 'Engine capacity'", ["排气量", "hubraum", "engine capacity", "cubic capacity"]],
  ["genset.series", "chưa sinh", "nhận 'Series', '系列', 'Serie'", ["series", "系列series", "系列", "serie"]],
  ["genset.made_in", "chưa sinh", "nhận 'Origin', '产地', 'Place of origin', 'Assembled in'", ["origin", "产地", "assembled in", "place of origin", "made in"]],
  ["genset.overload", "chưa sinh", "nhận 'Overload', '过载能力'", ["overload", "过载能力", "allowed overload", "overload capacity"]],
  ["genset.load_step", "chưa sinh", "nhận 'One-step load acceptance', 'Load acceptance ability'", ["one-step load acceptance", "load acceptance ability"]],
  ["genset.iso8528_class", "chưa sinh", "nhận 'Performance class' (cẩn thận 'Leistungsklasse' = hạng công suất)", ["performance class", "governing class"]],
  ["alternator.winding_pitch", "chưa sinh", "nhận 'Winding pitch'", ["winding pitch"]],
  ["alternator.tif", "chưa sinh", "nhận 'Telephone influence factor', 'TIF'", ["telephone influence factor", "tif", "telephone interference"]],
  ["alternator.thf", "chưa sinh; 'THF' đang nhận nhầm sang thd", "nhận 'THF', 'Telephone harmonic factor', '电话谐波系数'", ["thf", "telephone harmonic factor", "电话谐波系数 thf", "电话谐波系数"]],
  ["alternator.thd_no_load", "đã sinh 38 model (thd)", "thêm 'Waveform distortion', '波形畸变率'", ["waveform distortion", "波形畸变率"]],
  ["genset.freq_regulation", "đã sinh 150 model", "thêm 'Steady state frequency', 'Frequency accuracy'", ["steady state frequency", "frequency accuracy", "speed regulation", "steady-state frequency band", "frequency variation", "frequency band"]],
  ["engine.engine_type", "đã sinh 98 model", "thêm 'Cycle', 'Combustion system', 'Combustion chamber'", ["cycle", "combustion system", "combustion chamber", "combustion", "engine configuration"]],
  ["alternator.type", "chưa sinh", "nhận 'Alternator type', 'Generator type', '电机类型'", ["alternator type", "generator type", "电机类型"]],
];

const bySq = new Map();
for (const e of labels) {
  const n = squash(e.n);
  const g = bySq.get(n) || { tb: { lines: 0, models: 0, nccs: new Set() }, src: { lines: 0, nccs: new Set() } };
  if (e.kind.startsWith("src")) { g.src.lines += e.lines; for (const c of e.nccs) g.src.nccs.add(c); }
  else { g.tb.lines += e.lines; g.tb.models += e.models; for (const c of e.nccs) g.tb.nccs.add(c); }
  bySq.set(n, g);
}
const rows = [];
for (const [f, st, act, list] of A) {
  const nt = new Set(), ns = new Set(); let lines = 0, models = 0, sl = 0; const per = [];
  for (const l of list) {
    const g = bySq.get(l); if (!g) continue;
    lines += g.tb.lines; models += g.tb.models; sl += g.src.lines; for (const c of g.tb.nccs) nt.add(c); for (const c of g.src.nccs) ns.add(c);
    per.push(`${l}(${g.tb.models}/${g.tb.nccs.size}|s${g.src.lines})`);
  }
  rows.push({ f, st, act, lines, models, nt: nt.size, sl, ns: ns.size, per: per.join("; "), cur: [...new Set(list.map((l) => CAT.specKey(l) || ""))].join(",") });
}
rows.sort((a, b) => b.models - a.models);
const t = ["hang\ttruong\ttrang_thai_hien_tai\thanh_dong_de_xuat\tmodel_o_bang\tdong_bang\tncc_bang\tdong_nguon\tncc_nguon\tspecKey_cua_cac_nhan\tchi_tiet(nhan(model_o/ncc|s=dong_nguon))"];
rows.forEach((r, i) => t.push([i + 1, r.f, r.st, r.act, r.models, r.lines, r.nt, r.sl, r.ns, r.cur, r.per].join("\t")));
fs.writeFileSync(path.join(OUT, "xep-hang.tsv"), t.join("\n"));
console.log(rows.map((r, i) => `${i + 1}. ${r.f}: m${r.models} dong${r.lines} ncc${r.nt} | src ${r.sl}/${r.ns}`).join("\n"));
