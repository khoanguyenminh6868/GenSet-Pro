// So goc.json ↔ nhanh.json (check-all.mjs): MỌI cấu hình đổi hạng / điểm / trạng thái check (cả phần con), mô-đun thêm,
// phương án khác. node so-ab.mjs goc.json nhanh.json
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const key = (c) => `${c.engine} | ${c.alt} | ${c.controller}`;
const st = (x) => x.k.replace(/ \(.*$/, "");
let nChange = 0;
for (const k of Object.keys(a)) {
  const A = a[k], B = b[k];
  const lines = [];
  if (!A.again || !B.again) lines.push(`  lặp lại: gốc ${A.again ? "giống" : "KHÁC"}, nhánh ${B.again ? "giống" : "KHÁC"}`);
  const order = (X) => X.configs.map(key);
  if (JSON.stringify(order(A)) !== JSON.stringify(order(B))) lines.push(`  THỨ TỰ: gốc [${order(A).join(" ; ")}] → nhánh [${order(B).join(" ; ")}]`);
  for (const cb of B.configs) {
    const ca = A.configs.find((x) => key(x) === key(cb));
    if (!ca) { lines.push(`  cấu hình mới ở nhánh: ${key(cb)}`); continue; }
    const out = [];
    if (JSON.stringify(ca.score) !== JSON.stringify(cb.score)) out.push(`điểm ${JSON.stringify(ca.score)} → ${JSON.stringify(cb.score)}`);
    for (const xb of cb.checks) {
      const xa = ca.checks.find((y) => y.k.split("|").slice(0, 2).join("|") === xb.k.split("|").slice(0, 2).join("|"));
      if (!xa) { out.push(`check mới: ${xb.k}`); continue; }
      if (st(xa) !== st(xb)) out.push(`check ${st(xa)} → ${xb.k.split("|")[2]}`);
      for (const pb of xb.parts) {
        const n = pb.split("|")[0], pa = xa.parts.find((p) => p.split("|")[0] === n);
        if (!pa) { out.push(`  phần mới ${pb}`); continue; }
        if (pa.split("|")[1] !== pb.split("|")[1] || pa !== pb) out.push(`  ${xb.k.split("|")[1]} › ${n}: ${pa.split("|")[1]} → ${pb.split("|")[1]}${pa.split("|")[1] === pb.split("|")[1] ? " (chữ đổi)" : ""} :: ${pb.split("|").slice(2).join(" | ").slice(0, 260)}`);
      }
    }
    if (cb.modules) out.push(`mô-đun: ${cb.modules.map((m) => `${m.model} (${m.why.join(", ")})`).join(", ")}`);
    if (cb.altLine) out.push(cb.altLine);
    if (out.length) lines.push(`  #${cb.rank} ${key(cb)}`, ...out.map((o) => `    ${o}`));
  }
  if (lines.length) { nChange++; console.log(`## ${k}`); console.log(lines.join("\n")); }
}
console.log(`\n# Gói có thay đổi: ${nChange}/${Object.keys(a).length}`);
