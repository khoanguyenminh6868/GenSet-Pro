// Đo việc (C): mọi dòng bảng NGANG có mã tổ máy (gi >= 0) mà không ra động cơ / đầu phát (ei < 0 && ai < 0).
// Chạy fromSupplier THẬT của <repo>/web/catalog.js (bản sao gắn vết trong bộ nhớ, không sửa repo).
// node do-to-may.mjs <repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [REPO, OUT] = process.argv.slice(2);
let src = fs.readFileSync(path.join(REPO, "web", "catalog.js"), "utf8");
const A = "if (ei >= 0) out.push({ ...common, kind: \"engine\"";
if (!src.includes(A)) throw new Error("không thấy chỗ gắn vết");
src = src.replace(A, "if (ei < 0 && ai < 0 && gi >= 0) __G(s, t, ti, ri, common, hasEngineCol, hasAltCol, engineTable, cells, codes, makesFor(\"engine\", rowText, null));\n        " + A);
const hits = [];
const box = { console, __G: (s, t, ti, ri, c, hE, hA, eT, cells, codes, mk) => hits.push({ makes: mk, sup: s.id, role: s.role || "", n: t.n, ti, ri, title: String(t.title || "").slice(0, 120), header: (t.header || []).join(" / ").slice(0, 300), genset: c.genset, power: c.power, freq: c.freq, specs: (c.specs || []).map((x) => ({ key: x.key, value: x.value })), line: c.line, hasEngineCol: hE, hasAltCol: hA, engineTable: eT, nCodes: codes.length, cells }) };
box.globalThis = box; box.window = box;
vm.runInNewContext(src, box);
const C = box.GenbidCatalog;
const dir = path.join(REPO, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const recs = {};
for (const s of sups) {
  if (!s || s.status === "incomplete" || s.role === "controller_maker") continue;
  const r = C.fromSupplier(s);
  recs[s.id] = { engine: r.filter((o) => o.kind === "engine").length, alternator: r.filter((o) => o.kind === "alternator").length, tables: [...new Set(r.flatMap((o) => [o.table, ...(o.also || []).map((a) => a.table)]))] };
}
const status = Object.fromEntries(sups.map((s) => [s.id, { status: s.status || "", role: s.role || "", name: s.names?.en || "" }]));
fs.writeFileSync(OUT, JSON.stringify({ hits, recs, status }, null, 0));
console.log("dòng tổ máy không động cơ / đầu phát:", hits.length, "NCC:", new Set(hits.map((h) => h.sup)).size, "bảng:", new Set(hits.map((h) => h.sup + "|" + h.ti)).size);
