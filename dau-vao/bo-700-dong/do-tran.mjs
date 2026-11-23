// Đo ba trần số dòng (700 / 250 / 60) và nhóm (b) trên MỌI hồ sơ, bằng code ĐÃ BỎ trần: node do-tran.mjs <worktree> <thư mục ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [wt, out] = process.argv.slice(2);
const SUP = path.join(wt, "suppliers");
const imp = (f) => import(pathToFileURL(path.join(SUP, f)).href);
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const { controllerSheet } = await imp("maker-datasheets.mjs");
const { sheetOf } = await imp("crawl-datasheets.mjs");
const { tablesOf } = await imp("crawl-specs.mjs");
fs.mkdirSync(out, { recursive: true });

const bodyOf = (s) => s.replace(/\r/g, "").replace(/^URL:.*\nAccessed:.*\n(From:.*\n)?\n?/, "");
const size = (r) => Buffer.byteLength(JSON.stringify(r, null, 2) + "\n");
const all = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8")));
const hits = [], sim = new Map();
const b = { longLines1001: 0, longDocs1001: 0, longLinesCtl: 0, recsAtPageMax: [] };

// Bảng đang lưu đúng phần đầu của danh sách đầy đủ thì mới là bảng bị trần cắt.
const isPrefix = (rows, full, cap) => rows.length === cap && full.length > cap && rows.every((l, i) => l === full[i]);

for (const rec of all) {
  const dir = path.join(SUP, "sources", rec.id);
  if (!fs.existsSync(dir)) continue;
  const ctl = rec.role === "controller_maker", copy = structuredClone(rec);
  const ns = fs.readdirSync(dir).map((f) => parseInt(f, 10)).filter((x) => x >= 101 && x < 2000).sort((a, c) => a - c);
  if (ns.filter((n) => n < 1000).length >= 40) b.recsAtPageMax.push(`${rec.id}:${ns.filter((n) => n < 1000).length}`);
  for (const n of ns) {
    const raw = fs.readFileSync(path.join(dir, `${n}.md`), "utf8"), text = bodyOf(raw);
    const tables = (copy.specTables || []).filter((t) => t.n === n);
    if (n >= 1001) {
      const long = text.split("\n").filter((l) => l.trim().length > 220).length;
      if (long) { b.longLines1001 += long; b.longDocs1001++; if (ctl) b.longLinesCtl += long; }
    }
    const tryCap = (cap, full) => {
      for (const t of tables) if (isPrefix(t.rows || [], full, cap)) {
        hits.push({ cap, id: rec.id, n, title: (t.title || "").replace(/^Datasheet:\s*/, "").slice(0, 60), stored: t.rows.length, full: full.length, cut: full.length - t.rows.length });
        t.rows = full; sim.set(rec.id, copy); return;
      }
    };
    if (n >= 1001 && ctl) { const full = controllerSheet(text).rows; if (full.length > 700) { const t = tables[0]; if (t && t.rows.length <= 700) { hits.push({ cap: 700, id: rec.id, n, title: (t.title || "").replace(/^Datasheet:\s*/, "").slice(0, 60), stored: t.rows.length, full: full.length, cut: full.filter((l) => !new Set(t.rows).has(l)).length }); t.rows = [...t.rows, ...full.filter((l) => !new Set(t.rows).has(l))]; sim.set(rec.id, copy); } } }
    else if (n >= 1001) tryCap(250, sheetOf(text));
    else for (const t of tablesOf(raw)) if (t.sheet) tryCap(60, t.rows);
  }
}

const buildMs = (list) => { const l = structuredClone(list), s = performance.now(); C.build(l); return Math.round(performance.now() - s); };
const after = all.map((r) => sim.get(r.id) || r);
const before1 = buildMs(all), after1 = buildMs(after), before2 = buildMs(all), after2 = buildMs(after);
const sum = (l) => l.reduce((a, r) => a + size(r), 0);
const byCap = {};
for (const cap of [700, 250, 60]) { const h = hits.filter((x) => x.cap === cap); byCap[cap] = { docs: h.length, records: new Set(h.map((x) => x.id)).size, cutLines: h.reduce((a, x) => a + x.cut, 0) }; }
const ctl = all.filter((r) => r.role === "controller_maker");
const summary = {
  byCap, groupB: { ...b, recsAtPageMaxCount: b.recsAtPageMax.length },
  bytes: { cnBefore: sum(all), cnAfter: sum(after), ctlBefore: sum(ctl), ctlAfter: sum(ctl.map((r) => sim.get(r.id) || r)) },
  grown: [...sim.keys()].map((id) => { const r = all.find((x) => x.id === id); return { id, before: size(r), after: size(sim.get(id)), ratio: +(size(sim.get(id)) / size(r)).toFixed(2) }; }).sort((x, y) => (y.after - y.before) - (x.after - x.before)),
  buildMs: { before: [before1, before2], after: [after1, after2] },
};
fs.writeFileSync(path.join(out, "tran.tsv"), ["tran\tho_so\tn\ttieu_de\tdong_luu\tdong_day_du\tdong_bi_cat", ...hits.map((x) => [x.cap, x.id, x.n, x.title, x.stored, x.full, x.cut].join("\t"))].join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(out, "tran-tom-tat.json"), JSON.stringify(summary, null, 1), "utf8");
console.log(JSON.stringify(summary, null, 1));
