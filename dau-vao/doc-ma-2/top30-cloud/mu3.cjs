// Với mỗi lượt dòng nhóm ^ vào / rời theo tệp cloud (mu2.json): luật nào loại ở bên kia (chạy lại ct-goc / ct-nhanh trên bidhist máy) và ngưỡng HSMT.
// Chỉ in số; không in chữ HSMT. node --max-old-space-size=6000 mu3.cjs <mu2.json> <ct-goc.json> <ct-nhanh.json> <out.tsv>
const fs = require("fs");
const [M, CG, CN, OUT] = process.argv.slice(2);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const list = J(M), cg = J(CG).runs, cn = J(CN).runs;
const idOf = (k) => { const a = k.split("|"); return a[0] + "|" + a.slice(3).join("|"); };
const index = (runs) => { const o = {}; for (const [run, x] of Object.entries(runs)) { o[run] = { all: new Set(x.all.map(([k]) => idOf(k))), dropped: new Map(x.dropped.map(([k, w]) => [idOf(k), w])), h: x.h, cap: x.cap }; } return o; };
const ig = index(cg), inn = index(cn);
const first = Object.values(cg)[0]; if (first) console.log("khoá h:", Object.keys(first.h).join(","));
const thr = (h) => ["minCyl", "cylExact", "minDisp", "maxDisp", "freq", "cylLayout"].map((k) => `${k}=${h?.[k] ?? ""}`).join(" ");
const out = ["hướng\tNCC\tkhoá\tlượt\tcap\tluật bên kia\tcó ở lượt chạy lại\tngưỡng"];
const sum = {}; let noRun = 0, noRepro = 0, total = 0;
for (const r of list) for (const [dir, runs, other, same] of [["vào", r.moi, ig, inn], ["rời", r.mat, inn, ig]]) for (const run of runs) {
  total++;
  const o = other[run], s = same[run];
  if (!o || !s) { noRun++; out.push([dir, r.s, r.eN || r.eG, run, "", "", "không có lượt", ""].join("\t")); continue; }
  const repro = s.all.has(r.id) && !o.all.has(r.id);
  if (!repro) noRepro++;
  const why = o.dropped.get(r.id) ?? (o.all.has(r.id) ? "(vẫn trong all)" : "(không thấy)");
  out.push([dir, r.s, r.eN || r.eG, run, o.cap, why, repro ? "khớp cloud" : "lệch cloud", thr(o.h)].join("\t"));
  const k = `${dir} ${r.eN || r.eG} ${why}${repro ? "" : " [lệch]"}`; sum[k] = (sum[k] || 0) + 1;
}
fs.writeFileSync(OUT, out.join("\n") + "\n");
console.log(`tổng lượt-dòng ${total}; không có lượt chạy lại ${noRun}; lệch cloud ${noRepro}`);
for (const [k, n] of Object.entries(sum).sort()) console.log(n, k);
