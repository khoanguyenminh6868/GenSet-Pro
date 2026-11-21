// node probe.mjs <repoDir> <supplierId> [n,n,...] [--notes] — in bản ghi fromSupplier (kind, model, genset, other, dòng) của một NCC.
import { loadSideOne } from "./load.mjs";
const [dir, id, ns, ...flags] = process.argv.slice(2);
const { C, s } = loadSideOne(dir, id);
const want = ns && ns !== "-" ? new Set(ns.split(",").map(Number)) : null;
const notes = [];
for (const r of C.fromSupplier(s, notes)) {
  if (want && !want.has(r.n)) continue;
  console.log([r.n, r.table, r.row ?? "L", r.kind, r.model, "g=" + (r.genset ?? ""), "o=" + (r.other ?? ""), (r.makes || []).map((m) => m.name).join(",")].join(" | "));
}
if (flags.includes("--notes")) for (const n of notes) if (!want || want.has(n.n)) console.log("NOTE", n.n, n.table, n.row, n.reason, "::", String(n.detail).slice(0, 160));
