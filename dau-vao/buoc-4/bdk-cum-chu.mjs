// Buoc 4 kiem ke, phan 4: voi moi truong bo dieu khien cua spec-fields.json, dem so TAI LIEU (tuong ung 1 model hoac 1 ho model)
// co cum chu that su dung. Kho: bdk-text/dse (pdftotext 136 to DSE), bdk-text/other (9 to SmartGen/ComAp/SICES),
// va suppliers/sources/<hang>/1xxx.md cua smartgen, comap, comappower, deif, datakom, woodward, sices, deep-sea-electronics.
// Chay: node bdk-cum-chu.mjs → bdk-cum-chu.tsv (truong x hang), bdk-cum-chu-vidu.tsv (vi du nguyen van)
import fs from "node:fs";
import path from "node:path";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const SRC = "C:/Projects/GenSet Pro/GenSet-Pro/suppliers/sources";
const FIELDS = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/spec-fields.json", "utf8")).parts.controller;

// kho tai lieu: { brand, id, text }
const docs = [];
const dseDir = path.join(OUT, "bdk-text", "dse"), othDir = path.join(OUT, "bdk-text", "other");
for (const f of fs.readdirSync(dseDir)) docs.push({ brand: "DSE", id: f.replace(/\.txt$/, ""), kind: "pdf", text: fs.readFileSync(path.join(dseDir, f), "utf8") });
for (const f of fs.readdirSync(othDir)) {
  const b = /^HGM/i.test(f) ? "SmartGen" : /Inteli/i.test(f) ? "ComAp" : /DST|SICES/i.test(f) ? "SICES" : "?";
  docs.push({ brand: b, id: f.replace(/\.txt$/, ""), kind: "pdf", text: fs.readFileSync(path.join(othDir, f), "utf8") });
}
const BR = { smartgen: "SmartGen", comap: "ComAp", comappower: "ComAp", deif: "DEIF", datakom: "Datakom", woodward: "Woodward", sices: "SICES", "deep-sea-electronics": "DSE-web" };
for (const [dir, b] of Object.entries(BR)) {
  const d = path.join(SRC, dir);
  for (const f of fs.readdirSync(d)) {
    const n = +f.replace(/\.md$/, "");
    if (!((n >= 1001 && n <= 1999) || n >= 3001 || n >= 6001)) continue;
    docs.push({ brand: b, id: `${dir}/${f}`, kind: "src", text: fs.readFileSync(path.join(d, f), "utf8") });
  }
}
const brands = [...new Set(docs.map((d) => d.brand))];
const nDocs = Object.fromEntries(brands.map((b) => [b, docs.filter((d) => d.brand === b).length]));
console.error("kho:", JSON.stringify(nDocs), "tong", docs.length);

// cum chu theo truong (tren van ban chu thuong, nhieu dong)
const P = {
  kind: { re: /\bamf\b|auto mains failure|automatic mains failure|synchronis|synchroniz|manual start|auto start|bus ?tie|\bats\b|remote (display|annunciator)/i, note: "kind (enum): suy từ nhiều cụm; AMF / sync / bus tie là từ khoá đơn" },
  auto_start_stop: { re: /auto(matic)?[ -]?start|auto mode|automatic mode|start on remote|auto start\/stop/i },
  mains_failure: { re: /mains failure|mains fail|\bamf\b|auto mains|loss of mains|mains (monitor|supervision)/i },
  remote_start: { re: /remote start|start on load|remote start on load|remote start off load|remote start input/i },
  scheduler: { re: /scheduler|scheduled (run|start)|exerciser|exercise|weekly|calendar/i },
  prot_earth_fault: { re: /earth fault|ground fault|earth leakage|residual current/i },
  prot_reverse_power: { re: /reverse (power|kw)|reverse kvar|reverse real/i },
  prot_overcurrent: { re: /over ?current|short circuit|idmt|\bovercurrent\b|over-?current/i },
  prot_mains_decoupling: { re: /rocof|vector shift|df\/dt|mains decoupl|loss of mains|decoupl/i },
  emergency_stop: { re: /emergency stop|e-?stop|emergency-stop/i },
  ecu_support: { re: /j1939|\becu\b|\becm\b|can ?bus engine|canbus engine|electronic engine|engine can/i },
  protections: { re: /protection|alarm|shutdown|warning|trip/i, note: "text: danh mục dài, không phải từ khoá; cần bảng cấu trúc (xem mục 4)" },
  display: { re: /lcd|tft|oled|graphic|display|screen|led indicat/i },
  measure_voltage: { re: /\b(\d{2,3})\s?v\s?(ac)?\s?(ph-n|l-n|ph-ph|l-l)|voltage (range|measur|input)|ac voltage|measure.*voltage|\d+\s?v ?ac ?(l-?l|l-?n)/i, note: "dải: số + đơn vị, cần regex số" },
  measure_frequency: { re: /frequency (range|measur|accuracy)|3\.5\s?hz|\d+\s?hz\s?(to|-|~)\s?\d+\s?hz/i },
  measure_current: { re: /current (range|measur|input)|ct (secondary|input|ratio)|\b[15]\s?a\b.*(input|secondary)|\d+\s?a\s?(ac)?\s?ct/i },
  accuracy: { re: /accuracy|±\s?\d+(\.\d+)?\s?%/i },
  usb: { re: /\busb\b/i },
  rs232: { re: /rs-?232|rs 232/i },
  rs485: { re: /rs-?485|rs 485/i },
  ethernet: { re: /ethernet|rj-?45|tcp\/ip|\blan\b/i },
  can: { re: /\bcan\b ?(bus|port|interface|communication|2\.0)|canbus|can-?bus|can open|j1939/i },
  modbus_rtu: { re: /modbus[ -]?rtu|modbus (rtu|serial)|modbus (over|via) rs/i },
  modbus_tcp: { re: /modbus[ -]?tcp|modbus\/tcp|modbus tcp-?ip/i },
  snmp: { re: /\bsnmp\b/i },
  remote_monitoring: { re: /remote monitor|scada|web ?server|cloud|dsewebnet|remote (control|communication)|smartgen cloud|gprs|telemetry|\bscada\b/i },
  cellular_sms: { re: /gsm|gprs|\b[345]g\b|\blte\b|\bsms\b|sim card|cellular|modem/i },
  event_log: { re: /event log|\d+\s?(events?|records?|logs?)\b|log of events|history log/i },
  data_logging: { re: /data log|datalog|logging|trend|log ?data/i },
  plc: { re: /(?<!electronics )plc|programmable logic|logic editor|ladder|flexible logic|programmable functions?/i },
  synchronising: { re: /synchronis|synchroniz|paralleling|parallel (operation|running)|\bsync\b/i },
  load_sharing: { re: /load shar|kw sharing|active load sharing|load balanc|droop/i },
  load_demand: { re: /load demand|load[- ]dependent|dependent start|load[- ]sensing|start\/stop (on|by) load|load shedding|dummy load/i },
  dead_bus: { re: /dead bus|dead-bus|dead busbar|dead bar/i },
  max_sets: { re: /up to \d+\s?(gen|set|engine|unit)|maximum \d+\s?(gen|set)|(\d+)\s?(gen(erator)?s?|sets) (in|per|on) (a )?(parallel|system|bus)|up to \d+\s?controllers?/i },
  governor_avr_control: { re: /governor|avr control|speed bias|speed control|voltage bias|avr bias|analogue (output|control)/i },
  languages: { re: /language|multi-?lingu|chinese.*english|english.*chinese/i },
  dc_supply: { re: /dc supply|power supply|supply voltage|\b\d+\s?v\s?(dc)?\s?(to|~|-)\s?\d+\s?v|\b8\s?-\s?35\s?v|\b9\s?-\s?35\s?v|7\.?\d?\s?v\s?(to|-)\s?\d+/i },
  front_ip: { re: /\bip ?(65|54|55|66|67|20)\b|front panel|degree of protection|ip rating/i },
  operating_temp: { re: /operating temperature|working temperature|operating range.*°c|-\s?\d+\s?°?c\s?(to|~|-)|temperature range/i },
  dimensions: { re: /dimensions?|overall size|\b\d+\s?[x×]\s?\d+\s?[x×]\s?\d+\s?mm|panel cut-?out|cut-?out/i },
  io: { re: /digital inputs?|digital outputs?|configurable (inputs?|outputs?)|analogue inputs?|relay outputs?|binary inputs?|\d+\s?(inputs?|outputs?)/i },
  ul: { re: /ul listed|ul ?6200|ul ?508|ul certified|cul|c-?ul-?us|ul recognized|ul approved/i },
  order_code: { re: /order(ing)? (code|information|number)|part (no|number)|ordering/i },
};

const q = (s) => String(s).replace(/[\t\r\n]+/g, " ").replace(/\s+/g, " ").trim();
const t = ["truong\tvai\t" + brands.join("\t") + "\ttong_tai_lieu\tthuc_hien"];
const ex = ["truong\thang\ttai_lieu\tdong_nguyen_van"];
const t0 = ["tong_tai_lieu\t" + brands.map((b) => `${b}=${nDocs[b]}`).join(" ")];
const sum = {};
for (const f of FIELDS) {
  const p = P[f.id];
  if (!p) { t.push([f.id, f.type, ...brands.map(() => ""), "", f.id === "brand_country" || f.id === "made_in" ? "dẫn xuất từ hồ sơ hãng" : f.id === "brand" || f.id === "model" ? "đã sinh" : "chưa có cụm chữ"].join("\t")); continue; }
  const cnt = Object.fromEntries(brands.map((b) => [b, 0])); let total = 0;
  const exb = {};
  for (const d of docs) {
    const m = d.text.match(p.re);
    if (!m) continue;
    cnt[d.brand]++; total++;
    if (!exb[d.brand] || exb[d.brand].length < 2) {
      const i = d.text.search(p.re);
      const ln = d.text.slice(Math.max(0, d.text.lastIndexOf("\n", i) + 1), (d.text.indexOf("\n", i) + 1 || d.text.length + 1) - 1);
      (exb[d.brand] = exb[d.brand] || []).push([d.id, q(ln).slice(0, 170)]);
    }
  }
  sum[f.id] = { total, cnt };
  t.push([f.id, f.type, ...brands.map((b) => `${cnt[b]}/${nDocs[b]}`), total, p.note || ""].join("\t"));
  for (const [b, arr] of Object.entries(exb)) for (const [id, ln] of arr) ex.push([f.id, b, id, ln].join("\t"));
}
fs.writeFileSync(path.join(OUT, "bdk-cum-chu.tsv"), t.join("\n"));
fs.writeFileSync(path.join(OUT, "bdk-cum-chu-vidu.tsv"), ex.join("\n"));
console.log(t.join("\n"));
