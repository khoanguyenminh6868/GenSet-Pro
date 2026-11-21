// Liệt kê mọi check tiêu hao (mục có "tiêu hao" / "nhiên liệu" + L/h) trong một kết quả check-all: lượt, hạng, động cơ, trạng thái, chào, ghi chú.
// node fuel-checks.mjs <check-all.json> [<check-all khác.json>]  (hai tệp: chỉ in dòng khác)
import fs from "node:fs";
const [a, b] = process.argv.slice(2);
const rows = (f) => {
  const j = JSON.parse(fs.readFileSync(f, "utf8")), out = new Map();
  for (const [key, v] of Object.entries(j)) for (const c of v.configs || []) for (const x of c.checks || []) {
    const [part, item, rest] = x.k.split("|");
    if (!/ti[êe]u\s*hao|su[ấa]t\s*ti[êe]u|nhi[êe]n\s*li[ệe]u.*(l[íi]t|l\/h|t[ảa]i)|fuel\s*consum/i.test(item)) continue;
    out.set(`${key}\t#${c.rank}\t${c.engine}\t${item}`, `${rest}\t${x.note}`);
  }
  return out;
};
const A = rows(a);
if (!b) { for (const [k, v] of A) console.log(`${k}\t${v}`); process.exit(0); }
const B = rows(b);
for (const k of new Set([...A.keys(), ...B.keys()])) if (A.get(k) !== B.get(k)) console.log(`${k}\n  gốc : ${A.get(k) ?? "(không có)"}\n  nhánh: ${B.get(k) ?? "(không có)"}`);
