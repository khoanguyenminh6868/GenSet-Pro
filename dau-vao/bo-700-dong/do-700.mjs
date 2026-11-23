// Đo việc cắt 700 dòng trên MỌI nguồn 1001+ của hồ sơ controller_maker: node do-700.mjs <worktree> <thư mục ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [wt, out] = process.argv.slice(2);
const SUP = path.join(wt, "suppliers");
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const { controllerSheet } = await import(pathToFileURL(path.join(SUP, "maker-datasheets.mjs")).href);
fs.mkdirSync(out, { recursive: true });

// Chép nguyên bộ lọc của controllerSheet.
const FOOTER = /^(\|\s*)?(T|E|W|Tel|Fax|Web|Email)\s*:|DEEP SEA ELECTRONICS (UK|USA|UAE|INDIA|CHINA)|Registered in England|maintains a policy|details shown on this data sheet|contents are intended for guidance|^(\|\s*)?(\d{3}-\d{3}\b)|Page \d+ of \d+|Xuemei Street|Registered trademark|^(\|\s*)?www\./i;
const kept = (text) => text.split("\n").map((l) => l.trim()).filter((l) => l && l.length <= 220 && /[a-z]{2}/i.test(l) && !FOOTER.test(l));
const bodyOf = (s) => s.replace(/^URL:.*\r?\nAccessed:.*\r?\n\r?\n?/, "").replace(/\r/g, "");

const KINDS = [
  ["muc-luc", (l) => /\.{4,}|(\. ){3,}|…{2,}|_{4,}/.test(l)],
  ["tieu-de-lap", (l, n) => n >= 3],
  ["chu-trung", (l) => /[㐀-鿿]/.test(l)],
  ["bao-ve", (l) => /alarm|warning|shutdown|shut down|\btrip|protect|fault|electrical trip/i.test(l)],
  ["tham-so", (l) => /setting|parameter|default|\brange\b|configur|menu|timer|delay/i.test(l)],
  ["dau-day", (l) => /terminal|wiring|connector|\bpin\b|diagram|cable|\bwire/i.test(l)],
  ["co-so", (l) => /\d/.test(l)],
  ["khac", () => true],
];
const kindOf = (l, n) => KINDS.find(([, f]) => f(l, n))[0];

const files = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json"));
const all = files.map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8")));
const rowsOut = [], perKind = {}, samples = {}, sim = [];
let bytesBefore = 0, bytesAfter = 0, otherDiff = 0;

for (const rec of all) {
  if (rec.role !== "controller_maker") continue;
  const before = Buffer.byteLength(JSON.stringify(rec, null, 2) + "\n");
  const copy = structuredClone(rec);
  const dir = path.join(SUP, "sources", rec.id);
  const ns = fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => parseInt(f, 10)).filter((x) => x >= 1001 && x < 2000).sort((a, b) => a - b) : [];
  for (const n of ns) {
    const text = bodyOf(fs.readFileSync(path.join(dir, `${n}.md`), "utf8"));
    const lines = kept(text), uniq = [...new Set(lines)], count = new Map();
    for (const l of lines) count.set(l, (count.get(l) || 0) + 1);
    const tables = copy.specTables?.filter((t) => t.n === n) || [];
    const stored = new Set(tables.flatMap((t) => t.rows || []));
    const missing = uniq.filter((l) => !stored.has(l));
    const capped = uniq.length > 700;
    const k = {};
    for (const l of missing) { const c = kindOf(l, count.get(l)); k[c] = (k[c] || 0) + 1; if (capped) { perKind[c] = (perKind[c] || 0) + 1; (samples[c] ||= []).length < 25 && samples[c].push(`${rec.id}/${n}: ${l}`); } }
    if (!capped && missing.length && tables.length) otherDiff += missing.length;
    rowsOut.push({ id: rec.id, n, title: (tables[0]?.title || "(không có bảng)").replace(/^Datasheet:\s*/, "").slice(0, 60), source: uniq.length, stored: stored.size, cut: capped ? missing.length : 0, otherMissing: capped ? 0 : missing.length, hasTable: !!tables.length, kinds: capped ? k : {}, sameAsCode: controllerSheet(text).rows.length });
    if (capped && tables.length) tables[0].rows = [...tables[0].rows, ...missing];
  }
  const after = Buffer.byteLength(JSON.stringify(copy, null, 2) + "\n");
  bytesBefore += before; bytesAfter += after;
  sim.push({ id: rec.id, before, after, copy });
}

const timeBuild = (list) => { const t = []; for (let i = 0; i < 3; i++) { const l = structuredClone(list), s = performance.now(); C.build(l); t.push(Math.round(performance.now() - s)); } return t; };
const byId = new Map(sim.map((s) => [s.id, s.copy]));
const buildBefore = timeBuild(all), buildAfter = timeBuild(all.map((r) => byId.get(r.id) || r));
const allBytes = all.reduce((a, r) => a + Buffer.byteLength(JSON.stringify(r, null, 2) + "\n"), 0);

const hdr = "ho_so\tn\ttieu_de\tdong_nguon\tdong_luu\tdong_bi_cat\tthieu_khac\tco_bang\tphan_loai_phan_cat";
const tsv = [hdr, ...rowsOut.map((r) => [r.id, r.n, r.title, r.source, r.stored, r.cut, r.otherMissing, r.hasTable ? 1 : 0, Object.entries(r.kinds).map(([a, b]) => `${a}=${b}`).join(" ")].join("\t"))].join("\n");
fs.writeFileSync(path.join(out, "do-700.tsv"), tsv + "\n", "utf8");
fs.writeFileSync(path.join(out, "mau-phan-cat.json"), JSON.stringify(samples, null, 1), "utf8");
const summary = {
  sources: rowsOut.length, capped: rowsOut.filter((r) => r.source > 700).length, cutLines: rowsOut.reduce((a, r) => a + r.cut, 0),
  cappedNoTable: rowsOut.filter((r) => r.source > 700 && !r.hasTable).length, otherMissingNotCapped: otherDiff, perKind,
  ctlBytesBefore: bytesBefore, ctlBytesAfter: bytesAfter, allCnBytes: allBytes,
  perMaker: sim.map((s) => ({ id: s.id, before: s.before, after: s.after, ratio: +(s.after / s.before).toFixed(2) })),
  buildBeforeMs: buildBefore, buildAfterMs: buildAfter,
  top: [...rowsOut].sort((a, b) => b.cut - a.cut).slice(0, 12).map((r) => `${r.id}/${r.n} nguồn ${r.source} lưu ${r.stored} cắt ${r.cut} ${r.title}`),
};
fs.writeFileSync(path.join(out, "tom-tat.json"), JSON.stringify(summary, null, 1), "utf8");
console.log(JSON.stringify(summary, null, 1));
