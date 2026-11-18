// node cntCmp.mjs <worktree mới> <ref cũ> <gopRow-cũ.json> <gopRow-mới.json> <tệp ra>: gói chỉ đổi số all / dropped — mọi dòng
// đổi trạng thái (all ↔ dropped, mới có, không còn), truy về bản ghi (đổi / mới / mất) hoặc dữ kiện theo mã động cơ đổi.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, REF, FA, FB, OUT] = process.argv.slice(2);
const SD = await import(pathToFileURL(path.join(WT, "suppliers", "spec-diff.mjs")).href);
const sa = SD.loadSide(SD.checkoutRef(REF, WT)), sb = SD.loadSide(WT);
const recs = (side) => { const m = new Map(); for (const s of side.S) { if (s.status === "incomplete") continue; for (const o of side.C.fromSupplier(s)) { const k = s.id + "|" + side.C.keyOf(o.line || (o.lines?.rows || []).join(" ")); (m.get(k) || m.set(k, []).get(k)).push(JSON.stringify([o.kind, o.model, o.power, o.specs, o.other])); } } for (const v of m.values()) v.sort(); return m; };
const facts = (side) => { const m = new Map(); for (const s of side.S) { if (s.status === "incomplete") continue; for (const o of side.C.fromSupplier(s)) { const k = o.kind + "|" + side.C.keyOf(o.model); const v = m.get(k) || m.set(k, new Set()).get(k); for (const x of o.specs || []) v.add(`${x.key}=${x.value}`); } } return m; };
const ra = recs(sa), rb = recs(sb), fa = facts(sa), fb = facts(sb);
const recSt = (k) => { const o = ra.get(k), n = rb.get(k); return !o && !n ? "?" : !o ? "dòng mới có" : !n ? "dòng không còn" : o.join() === n.join() ? null : "bản ghi ĐỔI"; };
const factSt = (eng) => { const k = "engine|" + eng, a = [...(fa.get(k) || [])].sort().join(), b = [...(fb.get(k) || [])].sort().join(); return a === b ? null : `dữ kiện động cơ ${eng} đổi: +[${[...(fb.get(k) || [])].filter((x) => !fa.get(k)?.has(x)).join(", ")}] −[${[...(fa.get(k) || [])].filter((x) => !fb.get(k)?.has(x)).join(", ")}]`; };
const A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const L = [], cls = {};
for (const k of Object.keys(A)) {
  const a = A[k].rows, b = B[k].rows;
  L.push(`\n== ${k} cap ${JSON.stringify(A[k].cap)}`);
  for (const r of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[r], y = b[r], sx = x ? (x.st === "top" ? "all" : x.st) : "∅", sy = y ? (y.st === "top" ? "all" : y.st) : "∅";
    if (sx === sy) continue;
    const why = recSt(r) || factSt((y || x).eng) || "KHÔNG RÕ";
    const c = `${sx} → ${sy}: ${why.split(":")[0].replace(/ [A-Z0-9]+ đổi$/, " đổi")}`;
    cls[c] = (cls[c] || 0) + 1;
    L.push(`   ${sx} → ${sy} ${r.slice(0, 110)} [${(y || x).make} ${(y || x).eng}] ruled ${JSON.stringify(x?.ruled || [])} → ${JSON.stringify(y?.ruled || [])}\n      ${why}`);
  }
}
const head = JSON.stringify(cls, null, 1);
fs.writeFileSync(OUT, head + "\n" + L.join("\n") + "\n", "utf8");
console.log(head);
