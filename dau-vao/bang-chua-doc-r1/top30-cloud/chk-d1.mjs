import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [CBJ, CHJ, CN] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((s) => s.status !== "incomplete");
const eB = new Map(load(CBJ).build(sups).engines.map((e) => [e.key, e])), eH = new Map(load(CHJ).build(sups).engines.map((e) => [e.key, e]));
const rows = fs.readFileSync("cmp-dong.tsv", "utf8").trim().split("\n").slice(1).map((l) => l.split("\t")).filter((r) => /^D1/.test(r[5]));
const keys = new Map(); for (const r of rows) { const k = r[2].split("|")[1]; keys.set(k, (keys.get(k) || 0) + 1); }
const tal = {}, out = [];
const sig = (e, f) => JSON.stringify(f(e));
for (const [k, n] of keys) {
  const b = eB.get(k), h = eH.get(k), c = [];
  if (!b || !h) c.push("thiếu ở một bên");
  else {
    if (sig(b, (e) => e.make) !== sig(h, (e) => e.make)) c.push(`hãng ${b.make}→${h.make}`);
    if (sig(b, (e) => (e.makes || []).map((m) => m.name).sort()) !== sig(h, (e) => (e.makes || []).map((m) => m.name).sort())) c.push("danh sách hãng");
    if (b.suppliers.size !== h.suppliers.size) c.push(`số NCC ${b.suppliers.size}→${h.suppliers.size}`);
    if (b.uses.length !== h.uses.length) c.push(`số dòng ${b.uses.length}→${h.uses.length}`);
    if (sig(b, (e) => e.specs) !== sig(h, (e) => e.specs)) c.push("thông số gộp (specs/win)");
  }
  const t = c.filter((x) => !/^số/.test(x)).map((x) => x.replace(/ .*→.*/, "")).join("+") || "chỉ thêm dòng/NCC";
  tal[t] = (tal[t] || 0) + n; out.push(`${k}\t${n}\t${c.join("; ")}`);
}
fs.writeFileSync("cmp-d1-model.tsv", "model\tso-dong-doi\tkhac\n" + out.join("\n") + "\n");
console.log(keys.size, tal);
