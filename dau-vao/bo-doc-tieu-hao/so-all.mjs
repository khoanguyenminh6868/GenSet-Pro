// So MỌI cấu hình + MỌI check của hai kết quả check-all. node so-all.mjs goc.json nhanh.json
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
let same = 0, n = 0;
const head = (x) => { const [p, i, r] = x.k.split("|"); return { id: `${p}|${i}`, st: (r || "").split(" ")[0], full: x.k, note: x.note }; };
for (const key of Object.keys(a)) {
  const A = a[key].configs || [], B = b[key]?.configs || [], out = [];
  if (a[key].again !== b[key]?.again) out.push(`  lặp lại: ${a[key].again} → ${b[key]?.again}`);
  const order = (l) => l.map((c) => `${c.engine}+${c.alt}`).join(" > ");
  if (order(A) !== order(B)) out.push(`  THỨ TỰ: ${order(A)}\n       → ${order(B)}`);
  for (const c of A) {
    n++;
    const d = B.find((x) => x.engine === c.engine && x.alt === c.alt && x.controller === c.controller);
    if (!d) { out.push(`  mất cấu hình ${c.engine}+${c.alt}`); continue; }
    if (JSON.stringify(c) === JSON.stringify({ ...d, rank: c.rank })) { same++; continue; }
    if (c.score !== d.score && JSON.stringify(c.score) !== JSON.stringify(d.score)) out.push(`  ${c.engine}: điểm ${JSON.stringify(c.score)} → ${JSON.stringify(d.score)}`);
    const X = c.checks.map(head), Y = d.checks.map(head);
    for (const id of new Set([...X, ...Y].map((q) => q.id))) {
      const x = X.find((q) => q.id === id), y = Y.find((q) => q.id === id);
      if (x?.full === y?.full && x?.note === y?.note) continue;
      out.push(`  ${c.engine} | ${id}: ${x?.st ?? "∅"} → ${y?.st ?? "∅"}\n     cũ: ${(x?.full || "").slice(0, 170)} :: ${(x?.note || "").slice(0, 150)}\n     mới: ${(y?.full || "").slice(0, 170)} :: ${(y?.note || "").slice(0, 170)}`);
    }
  }
  if (out.length) console.log(`== ${key}\n${out.join("\n")}`);
}
console.log(`\ncấu hình ${n}, giống hệt ${same}`);
