// Ca kiểm IB2600603983: mỗi cấu hình, bộ điều khiển, mô-đun, phương án khác, và MỌI phần "Truyền thông, giám sát từ xa"
// trước (goc.json) → sau (nhanh.json). node ca-kiem.mjs [goc.json nhanh.json] [mã gói]
import fs from "node:fs";
const [ga = "goc.json", gb = "nhanh.json", key = "IB2600603983"] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(ga, "utf8"))[key], B = JSON.parse(fs.readFileSync(gb, "utf8"))[key];
const comm = (c) => c.checks.find((x) => /\|Truyền thông, giám sát từ xa\|/.test(x.k));
for (const cb of B.configs) {
  const ca = A.configs.find((x) => x.engine === cb.engine && x.alt === cb.alt && x.controller === cb.controller);
  console.log(`#${cb.rank} ${cb.engine} | ${cb.alt} | bộ điều khiển ${cb.controller}${cb.modules ? ` + ${cb.modules.map((m) => `${m.model} (mã ${m.order}, ghép theo ${m.compat.by === "controller" ? "datasheet bộ điều khiển" : "datasheet mô-đun"} n${m.compat.n}: ${m.compat.line.trim()})`).join(" + ")}` : ""}`);
  console.log(`   điểm ${JSON.stringify(ca?.score)} → ${JSON.stringify(cb.score)}`);
  const xa = ca && comm(ca), xb = comm(cb);
  if (xb) {
    console.log(`   ${xa ? xa.k.split("|")[2] : "-"} → ${xb.k.split("|")[2]}`);
    for (const p of xb.parts) {
      const n = p.split("|")[0], q = xa?.parts.find((y) => y.split("|")[0] === n);
      console.log(`     ${n}: ${q ? q.split("|")[1] : "-"} → ${p.split("|")[1]}${p.includes("|via ") ? ` (${p.split("|")[2]})` : ""}`);
    }
  }
  if (cb.altLine) console.log(`   ${cb.altLine}`);
}
