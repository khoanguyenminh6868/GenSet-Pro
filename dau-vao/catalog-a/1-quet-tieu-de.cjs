// Quét MỌI bảng trong suppliers/cn: dòng tiêu đề thứ 2 trở đi có ô mã (isCode) → in ra để phân loại.
// Dùng: node 1-quet-tieu-de.cjs <repo> > out.tsv
const fs = require("fs"), path = require("path");
const repo = process.argv[2] || ".";
const win = {}; for (const f of ["conversions.js", "catalog.js"]) new Function("window", "module", fs.readFileSync(path.resolve(repo, "web", f), "utf8"))(win, undefined); const CAT = win.GenbidCatalog;
const dir = path.resolve(repo, "suppliers/cn");
const out = [["ncc", "n", "bang", "hdong", "so_o", "o_dong_dau", "o_ma_dau", "dong_dau_ma", "dong", "dong_dau"].join("\t")];
const bySup = {};
let lines = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  (s.specTables || []).forEach((t, ti) => {
    const h = t.header || [];
    for (let i = 1; i < h.length; i++) {
      const c = CAT.cellsOf(h[i]);
      const ci = c.findIndex((x) => CAT.isCode(x));
      if (ci < 0) continue;
      const r0 = CAT.cellsOf((t.rows || [])[0] || "");
      const r0ci = r0.findIndex((x) => CAT.isCode(x));
      out.push([s.id, t.n, ti, i, c.length, r0.length, ci, r0ci, h[i], (t.rows || [])[0] || ""].join("\t"));
      bySup[s.id] = (bySup[s.id] || 0) + 1; lines++;
    }
  });
}
fs.writeFileSync(process.argv[3] || "quet.tsv", out.join("\n") + "\n");
console.log(lines, JSON.stringify(Object.entries(bySup).sort((a, b) => b[1] - a[1])));
