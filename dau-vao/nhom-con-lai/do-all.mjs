// Chạy fromSupplier + build THẬT của <repo>/web/catalog.js trên mọi NCC, lưu theo bảng (sid|ti).
// node do-all.mjs <repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [REPO, OUT] = process.argv.slice(2);
const src = fs.readFileSync(path.join(REPO, "web", "catalog.js"), "utf8");
const box = { console };
box.globalThis = box; box.window = box;
vm.runInNewContext(src, box);
const C = box.GenbidCatalog;
const dir = path.join(REPO, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const tables = {};
for (const s of sups) {
  (s.specTables || []).forEach((t, ti) => {
    tables[s.id + "|" + ti] = { sid: s.id, status: s.status || "", role: s.role || "", n: t.n, ti, title: String(t.title || ""), header: t.header || [], nrows: (t.rows || []).length, rows: t.rows || [], recs: [], notes: [] };
  });
  if (!s || s.status === "incomplete" || s.role === "controller_maker") continue;
  const notes = [];
  let r = [];
  try { r = C.fromSupplier(s, notes); } catch (e) { console.error(s.id, e.message); }
  for (const o of r) {
    for (const loc of [{ table: o.table, row: o.row }, ...(o.also || [])]) {
      const k = s.id + "|" + loc.table;
      if (!tables[k]) continue;
      tables[k].recs.push({ kind: o.kind, model: o.model, row: loc.row, genset: o.genset, power: o.power, freq: o.freq, specs: (o.specs || []).map((x) => x.key + "=" + x.value), makes: o.makes || o.make || null });
    }
  }
  for (const x of notes) { const k = s.id + "|" + x.table; if (tables[k]) tables[k].notes.push({ row: x.row, reason: x.reason, detail: x.detail }); }
}
fs.writeFileSync(OUT, JSON.stringify(tables));
const all = Object.values(tables);
console.log("bảng", all.length, "có bản ghi", all.filter((t) => t.recs.length).length, "bản ghi", all.reduce((a, t) => a + t.recs.length, 0));
