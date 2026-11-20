// PR 1 (eastern-lion 1B + n156): so fromSupplier cũ (origin/main) ↔ mới (worktree) cho MỌI NCC, liệt kê từng thay đổi
// của eastern-lion theo bảng / dòng, và kiểm không NCC khác đổi.
// node soat-el.mjs <catalog cũ.js> <catalog mới.js> <thư mục cn> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [OLD, NEW, CN, OUT] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const A = load(OLD), B = load(NEW);
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8")));
const sig = (o) => JSON.stringify([o.kind, o.model, o.genset, o.power, o.freq, (o.specs || []).map((x) => x.key + "=" + x.value), (o.makes || []).map((m) => m.name + "/" + m.via), o.other]);
const key = (o) => `${o.table}|${o.row}|${o.kind}|${o.freq ?? ""}`;
const rows = [];
let otherChanged = [];
for (const s of sups) {
  if (!s || s.status === "incomplete" || s.role === "controller_maker") continue;
  const a = A.fromSupplier(s), b = B.fromSupplier(s);
  const ma = new Map(a.map((o) => [key(o) + "|" + o.model, o])), mb = new Map(b.map((o) => [key(o) + "|" + o.model, o]));
  const diff = [];
  for (const [k, o] of ma) if (!mb.has(k)) diff.push(["MẤT", o]); else if (sig(o) !== sig(mb.get(k))) diff.push(["ĐỔI", mb.get(k), o]);
  for (const [k, o] of mb) if (!ma.has(k)) diff.push(["MỚI", o]);
  if (!diff.length) continue;
  if (s.id !== "eastern-lion-fuan") { otherChanged.push(`${s.id}: ${diff.length}`); continue; }
  const T = s.specTables;
  for (const [what, o, old] of diff) rows.push([what, o.n, o.table, o.row, o.kind, o.model, JSON.stringify(o.power), o.freq ?? "", o.other ?? "", old ? `cũ: other=${old.other ?? ""} specs=${(old.specs || []).map((x) => x.key + "=" + x.value).join(";")}` : "", (o.specs || []).map((x) => x.key + "=" + x.value).join(";"), String(o.line ?? T[o.table]?.rows?.[o.row] ?? "")]);
}
fs.writeFileSync(OUT, ["loai\tn\tbang\tdong\tvai\tmodel\tcong-suat\ttan-so\tother\tcu\tspecs\tdong-nguon"].concat(rows.map((r) => r.join("\t"))).join("\n") + "\n");
const c = {}; for (const r of rows) { const k = `${r[0]} ${r[4]}`; c[k] = (c[k] || 0) + 1; }
console.log("eastern-lion:", JSON.stringify(c));
const byT = {}; for (const r of rows) { const k = `n${r[1]}/b${r[2]}`; byT[k] = byT[k] || {}; const kk = `${r[0]} ${r[4]}`; byT[k][kk] = (byT[k][kk] || 0) + 1; }
for (const [k, v] of Object.entries(byT)) console.log(" ", k, JSON.stringify(v));
console.log("NCC khác có đổi:", otherChanged.length ? otherChanged.join(", ") : "0");
