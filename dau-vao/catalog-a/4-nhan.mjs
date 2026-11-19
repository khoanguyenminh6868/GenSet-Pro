// Bản ghi "đổi" mà giá trị không đổi: liệt kê trường thật sự khác (nhãn thông số…), gom theo dạng.
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const load = (root) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(root, "web", "catalog.js"), "utf8"), box); return box.GenbidCatalog; };
const CB = load("goc"), CH = load("../../../../wt-catalog-a"), dir = "../../../../wt-catalog-a/suppliers/cn";
const key = (o) => `${o.supplierId}|${o.n}|${o.table}|${o.row}|${o.kind}|${o.model}`;
const kinds = new Map();
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); if (s.status === "incomplete") continue;
  const mb = new Map(CB.fromSupplier(s).map((o) => [key(o), o]));
  for (const o of CH.fromSupplier(s)) { const b = mb.get(key(o)); if (!b) continue;
    const a = (b.specs || []), c = (o.specs || []);
    if (JSON.stringify(a.map((x) => [x.key, x.value])) !== JSON.stringify(c.map((x) => [x.key, x.value]))) continue;
    for (let i = 0; i < a.length; i++) for (const k of Object.keys({ ...a[i], ...c[i] })) if (JSON.stringify(a[i][k]) !== JSON.stringify(c[i][k])) { const t = `${s.id}\t${a[i].key}.${k}\t${JSON.stringify(a[i][k])} → ${JSON.stringify(c[i][k])}`; kinds.set(t, (kinds.get(t) || 0) + 1); }
  }
}
for (const [k, v] of [...kinds].sort()) console.log(v + "\t" + k);
