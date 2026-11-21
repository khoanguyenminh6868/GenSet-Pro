// So hai kết quả check-all: mọi check / phần / điểm đổi. node ca-diff.mjs <before.json> <after.json> <out.txt>
import fs from "node:fs";
const [bf, af, out] = process.argv.slice(2);
const B = JSON.parse(fs.readFileSync(bf, "utf8")), A = JSON.parse(fs.readFileSync(af, "utf8"));
const res = []; let cfg = 0, chk = 0, same = 0;
for (const k of new Set([...Object.keys(B), ...Object.keys(A)])) {
  if (JSON.stringify(B[k]) === JSON.stringify(A[k])) { same++; continue; }
  const bc = B[k]?.configs || [], ac = A[k]?.configs || [];
  if (bc.length !== ac.length) res.push(`${k}: số cấu hình ${bc.length} -> ${ac.length}`);
  for (let i = 0; i < Math.max(bc.length, ac.length); i++) {
    const x = bc[i], y = ac[i]; cfg++;
    if (JSON.stringify(x) === JSON.stringify(y)) continue;
    for (const f of ["rank", "engine", "alt", "controller", "modules", "alternatives", "altLine", "score"]) if (JSON.stringify(x?.[f]) !== JSON.stringify(y?.[f])) res.push(`${k} #${i + 1} ${f}: ${JSON.stringify(x?.[f])} -> ${JSON.stringify(y?.[f])}`);
    const bm = new Map((x?.checks || []).map((c) => [c.k.split("|").slice(0, 2).join("|"), c])), am = new Map((y?.checks || []).map((c) => [c.k.split("|").slice(0, 2).join("|"), c]));
    for (const n of new Set([...bm.keys(), ...am.keys()])) if (JSON.stringify(bm.get(n)) !== JSON.stringify(am.get(n))) { chk++; res.push(`${k} #${i + 1} ${x?.controller} check ${n}\n  - ${JSON.stringify(bm.get(n))?.slice(0, 600)}\n  + ${JSON.stringify(am.get(n))?.slice(0, 600)}`); }
  }
}
fs.writeFileSync(out, res.join("\n") + "\n", "utf8");
console.log(`lượt giống ${same}/${new Set([...Object.keys(B), ...Object.keys(A)]).size}, check đổi ${chk}, dòng báo ${res.length}`);
console.log("lặp lại khác:", Object.entries(A).filter(([, v]) => !v.again).map(([k]) => k).join(",") || "0");
console.log(res.slice(0, 12).join("\n").slice(0, 5000));
