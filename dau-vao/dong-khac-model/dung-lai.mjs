// Dựng danh sách dòng fact controller:* mà chữ dòng nêu model BĐK khác, không nêu model được gắn.
// node dung-lai.mjs <repo> <refTruoc> <out.json>
// "mới" = dòng không có trong modelFacts của refTruoc (trước #1148), cùng khoá key|supplierId|n|line.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [repo, ref, out] = process.argv.slice(2), SUP = path.join(repo, "suppliers");
const git = (...a) => execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });
await import(pathToFileURL(path.join(repo, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const { modelFacts } = await import(pathToFileURL(path.join(SUP, "config-bot.mjs")).href);

const changed = new Set(git("diff", "--name-only", ref, "--", "suppliers/cn/").trim().split("\n").filter(Boolean).map((f) => path.basename(f)));
const files = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json"));
const after = files.map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8")));
const before = files.map((f, i) => (changed.has(f) ? JSON.parse(git("show", `${ref}:suppliers/cn/${f}`)) : after[i]));
const run = (list) => { const l = structuredClone(list), cat = C.build(l); return modelFacts(cat, l); };
const A = run(before), B = run(after);
const id = (f) => `${f.key}|${f.supplierId}|${f.n}|${f.line}`;

// Model BĐK mà chữ dòng nêu (giống ctlNames của config-bot: controllersIn + dãy "HGM6120N/6120NC" + "DSE6010/20").
const keysIn = (line) => {
  const o = new Set(C.controllersIn(line).filter((c) => c.model).map((c) => C.keyOf(c.model)));
  for (const m of String(line).matchAll(/\bHGM\s?(\d{4}[A-Z]{0,4})((?:\s?\/\s?\d{4}[A-Z]{0,4})+)/gi)) for (const c of [m[1], ...m[2].split("/")].map((x) => x.trim()).filter(Boolean)) o.add(C.keyOf(`HGM${c}`));
  for (const m of String(line).matchAll(/\bDSE\s?(\d{2})(\d{2})((?:\s?\/\s?\d{2}(?!\d))+)(\s*MK\s?I{2,3})?/gi)) {
    const gen = m[4] ? ` ${m[4].trim().replace(/\s+/g, "").toUpperCase()}` : "";
    for (const c of [m[2], ...m[3].split("/").map((x) => x.trim()).filter(Boolean)]) o.add(C.keyOf(`DSE${m[1]}${c}${gen}`));
  }
  return [...o];
};
// "nêu model được gắn": khoá được gắn trùng, hoặc khoá nêu là đời của nó (DSE7320 ↔ DSE7320MKII), hoặc ngược lại.
const names = (k, ks) => ks.some((x) => x === k || x.startsWith(k) || k.startsWith(x));

const sa = new Map();
for (const [k, l] of A) { if (k.startsWith("controller:")) { const s = new Set(l.map(id)); sa.set(k, s); } }
const rows = [], stat = { controllerFacts: 0 };
for (const [k, l] of B) {
  if (!k.startsWith("controller:")) continue;
  const model = k.slice(11), old = sa.get(k) || new Set();
  for (const f of l) {
    stat.controllerFacts++;
    const ks = keysIn(f.line);
    if (!ks.length || names(model, ks)) continue;
    rows.push({ model, sheetModel: f.sheetModel || "", nguon: `${f.supplierId}#${f.n}`, supplier: f.supplierId, n: f.n, moi: old.has(id(f)) ? "cu" : "moi", nameds: ks.join(","), line: f.line });
  }
}
fs.writeFileSync(out, JSON.stringify({ stat, rows }, null, 1), "utf8");
const cnt = (g) => { const m = {}; for (const r of rows) m[g(r)] = (m[g(r)] || 0) + 1; return m; };
console.log(JSON.stringify({ stat, tong: rows.length, moi: rows.filter((r) => r.moi === "moi").length, theoHang: cnt((r) => r.supplier + "/" + r.moi), theoNguon: cnt((r) => r.nguon + "/" + r.moi) }, null, 1));
