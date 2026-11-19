// Đo (a): dòng tiêu đề thứ 2 trở đi có hình dòng dữ liệu (ô mã cùng vị trí với dòng đầu của bảng, ≤ ô 1) —
// dòng đó hiện có bản ghi nào mang đúng chữ dòng (đọc ở bảng khác) không?
// Dùng: node 2-do-a.cjs <repo> [out.tsv]
const fs = require("fs"), path = require("path");
const repo = process.argv[2] || ".";
const win = {};
for (const f of ["conversions.js", "catalog.js"]) new Function("window", "module", fs.readFileSync(path.resolve(repo, "web", f), "utf8"))(win, undefined);
const CAT = win.GenbidCatalog;
const dir = path.resolve(repo, "suppliers/cn");
const norm = (x) => String(x || "").replace(/\s+/g, " ").trim();
const res = {}, out = [["ncc", "n", "bang", "hdong", "da_doc", "dong"].join("\t")];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  let cand = [];
  (s.specTables || []).forEach((t, ti) => {
    const h = t.header || [];
    const r0 = CAT.cellsOf((t.rows || [])[0] || "");
    const r0ci = r0.findIndex((x) => CAT.isCode(x));
    for (let i = 1; i < h.length; i++) {
      const c = CAT.cellsOf(h[i]);
      const ci = c.findIndex((x) => CAT.isCode(x));
      if (ci < 0 || ci !== r0ci || ci > 1) continue;
      cand.push({ n: t.n, ti, i, line: h[i] });
    }
  });
  if (!cand.length) continue;
  const recs = CAT.fromSupplier(s);
  const seen = new Set(recs.map((o) => norm(o.line)));
  const r = (res[s.id] = { cand: cand.length, read: 0, unread: 0 });
  for (const c of cand) {
    const ok = seen.has(norm(c.line));
    ok ? r.read++ : r.unread++;
    out.push([s.id, c.n, c.ti, c.i, ok ? 1 : 0, c.line].join("\t"));
  }
}
if (process.argv[3]) fs.writeFileSync(process.argv[3], out.join("\n") + "\n");
let T = { cand: 0, read: 0, unread: 0 };
for (const [k, v] of Object.entries(res)) { console.log(k.padEnd(24), v.cand, "đã đọc ở chỗ khác", v.read, "chưa đọc", v.unread); for (const x in T) T[x] += v[x]; }
console.log("TỔNG", JSON.stringify(T));
