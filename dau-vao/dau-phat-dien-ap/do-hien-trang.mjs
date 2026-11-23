// Đo hiện trạng thông số điện đầu phát theo điện áp trên MỌI tệp sources/<id>/1001..1999.md của hồ sơ alternator_maker.
// node do-hien-trang.mjs <gốc repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.argv[2] || "."), out = process.argv[3] || "hien-trang.json";
const sup = path.join(root, "suppliers");
const R = await import(pathToFileURL(path.join(sup, "ratings.mjs")).href);
const CB = await import(pathToFileURL(path.join(sup, "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const cnDir = path.join(sup, "cn");
const all = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8")));
const makers = all.filter((s) => s.role === "alternator_maker");

// ---- Bước 2: dòng nào tờ có ghi (đếm theo tờ) ----
const FIELD = {
  winding_pitch: /winding pitch|coil pitch|wound to 2\/3 pitch|\b2\/3 pitch/i,
  wires: /\b\d+[\s-]*wires?\b|\b(?:6|12) (?:ends|terminals|leads)\b|number of (?:wires|leads|terminals)/i,
  altitude: /^\|?\s*altitude\b|\baltitude\b[^\n]*\d|\d[^\n]*\baltitude\b/i,
  overspeed: /^\|?\s*(?:maximum )?over-?speed\b|\bmaximum over-?speed\b/i,
  air_flow: /air flow[^\n]*m[3³]|cooling air[^\n]*m[3³]|m[3³]\/(?:s|sec|min)/i,
  short_circuit: /short[\s-]*circuit current|sustained short|300\s*%/i,
  excitation: /^(?!From:|URL:).*(?:excitation system|control system|self[\s-]*excited|\bPMG\b|\bAREP\b)/i,
  avr: /AVR type|\b(?:AS|MX|SX)\d{3}\b|\bD(?:350|550)\b|\bR(?:180|250|450|221|230|731)\b/,
  voltage_regulation: /voltage regulation|regulation\s*\(/i,
  thd_no_load: /no[\s-]*load[^\n]*(?:THD|distortion|harmonic)|(?:THD|distortion|harmonic)[^\n]*no[\s-]*load/i,
  thd_linear_load: /(?:THD|distortion|harmonic)[^\n]*linear|linear[^\n]*(?:THD|distortion|harmonic)/i,
  tif: /\bTIF\b|telephone (?:influence|interfer)/i,
  thf: /\bTHF\b|telephone harmonic/i,
  poles: /number of poles|^\|?\s*poles\b|\b\d{1,2}[\s-]*poles?\b|\bpoles?\s*\|/i,
  bearing: /\bbearings?\b[^\n]*\||\|[^\n]*\bbearings?\b|\b(?:1|2|single|two)[\s-]*bearing/i,
  cooling: /\bIC\s?0\d|self[\s-]*ventilated|cooling (?:method|system)/i,
  standards: /\b(?:ISO\s*\d{4,5}|IEC\s*\d{5}|BS\s*\d{4}|VDE\s*\d{4}|NEMA\s*MG)/i,
  efficiency: /^\|?\s*efficienc|efficiency\s*\(%|efficiencies/i,
  current_a: /current\s*\(\s*(?:A|amp)|\|\s*current\b|rated current/i,
};
const SKIPCAT = process.env.SKIPCAT === "1";

const res = { root, at: new Date().toISOString(), makers: {} };
for (const m of makers) {
  const dir = path.join(sup, "sources", m.id);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => /^1\d{3}\.md$/.test(f)).sort();
  if (!files.length) continue;
  const o = { id: m.id, sheets: files.length, noRows: [], models: {}, field: {}, fieldSample: {}, attrKeys: {}, sheetsInfo: [] };
  for (const k of Object.keys(FIELD)) { o.field[k] = []; }
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    const rs = R.ratingsOf(text).filter((r) => r.part === "alternator");
    const attrs = [...R.altSheetAttrs(text), ...(R.lsSheetAttrs ? R.lsSheetAttrs(text) : []), ...(R.meccSheetAttrs ? R.meccSheetAttrs(text) : []), ...(R.lsStandards ? R.lsStandards(text) : [])];
    const title = (text.split("\n").find((l) => l.trim()) || "").trim().slice(0, 80);
    o.sheetsInfo.push({ f, title, rows: rs.length, chars: text.length, attrs: [...new Set(attrs.map((a) => a.key))] });
    if (!rs.length) o.noRows.push({ f, title, chars: text.length });
    for (const a of attrs) (o.attrKeys[a.key] ||= []).push(f);
    for (const r of rs) {
      const mm = (o.models[r.model] ||= { sheets: new Set(), volts: {}, cols: { duty: new Set(), rise: new Set(), hz: new Set(), phase: new Set(), conn: new Set() } });
      mm.sheets.add(f);
      const vk = `${r.hz}Hz/${r.phase}ph/${r.volt == null ? "1ph" : r.volt + "V"}`;
      const v = (mm.volts[vk] ||= { kVA: false, kW: false, eff: false });
      if (r.kVA != null) v.kVA = true;
      if (r.kW != null) v.kW = true;
      if (r.eff != null) v.eff = true;
      mm.cols.duty.add(r.duty); mm.cols.rise.add(r.rise); mm.cols.hz.add(r.hz); mm.cols.phase.add(r.phase);
      if (r.conn) mm.cols.conn.add(r.conn);
    }
    const lines = text.split("\n");
    for (const [k, re] of Object.entries(FIELD)) {
      const hit = lines.find((l) => re.test(l));
      if (hit) { o.field[k].push(f); (o.fieldSample[k] ||= { f, line: hit.trim().slice(0, 200) }); }
    }
  }
  for (const mm of Object.values(o.models)) { mm.sheets = [...mm.sheets]; for (const k of Object.keys(mm.cols)) mm.cols[k] = [...mm.cols[k]]; }
  res.makers[m.id] = o;
}

// ---- Model trong danh mục không có tờ hãng ----
if (SKIPCAT) { const prev = JSON.parse(fs.readFileSync(out, "utf8")); res.catalog = prev.catalog; fs.writeFileSync(out, JSON.stringify(res, (k, v) => (v instanceof Set ? [...v] : v), 1)); console.log("giữ catalog cũ"); process.exit(0); }
const live = all.filter((s) => s.status !== "incomplete");
const built = CAT.build(live);
const RT = CB.sourceRatings(live, path.join(sup, "sources"));
const MAKERIDS = new Set(makers.map((s) => s.id));
const rows = [];
for (const a of built.alternators) {
  const rat = CB.ratingsFor(RT.alt, a.model), at = CB.ratingsFor(RT.attr, a.model);
  const makerSup = (a.suppliers || []).filter((id) => MAKERIDS.has(id));
  rows.push({ model: a.model, make: a.make || "", nSup: (a.suppliers || []).length, makerSup, ratingRows: rat.length, attrKeys: [...new Set(at.map((x) => x.key))], kva: a.kva });
}
res.catalog = { total: rows.length, rows };
fs.writeFileSync(out, JSON.stringify(res, (k, v) => (v instanceof Set ? [...v] : v), 1));
console.log(`NCC alternator_maker có tờ: ${Object.keys(res.makers).join(", ")}; model đầu phát trong danh mục: ${rows.length}`);
