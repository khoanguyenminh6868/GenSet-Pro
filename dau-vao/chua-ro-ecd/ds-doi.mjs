// Mọi check đổi giữa hai kết quả check-all, dạng bảng markdown. Chỉ in tên mục, trạng thái, giá trị của tờ hãng và dòng tờ hãng: KHÔNG in chữ HSMT
// (tệp này vào sổ điều phối). node ds-doi.mjs goc.json nhanh.json
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const VI = { met: "đạt", unclear: "chưa rõ", confirm: "cần xác nhận", not_met: "không đạt" }, parse = (x) => { const [p, i, r] = x.k.split("|"), m = (r || "").match(/^(\w+)(?: \((.*)\))?$/); return { id: `${p}|${i}`, item: i, st: m?.[1], off: m?.[2] || "", q: x.q || "", note: x.note || "" }; };
const cell = (s) => String(s).replace(/\|/g, "/").replace(/\s+/g, " ").trim(), out = [], cfg = new Set();
for (const key of Object.keys(a)) for (const c of a[key].configs) {
  const d = (b[key]?.configs || []).find((x) => x.engine === c.engine && x.alt === c.alt && x.controller === c.controller);
  if (!d) { out.push(`| ${key} | ${c.engine} + ${c.alt} + ${c.controller} | MẤT CẤU HÌNH | | | |`); continue; }
  const X = c.checks.map(parse), Y = d.checks.map(parse);
  // A configuration can hold two checks of one item: the identical ones are paired off first, only what is left is a change.
  const same = (p, q) => p.id === q.id && p.st === q.st && p.off === q.off && p.note === q.note, left = [...X], rest = Y.filter((y) => { const i = left.findIndex((x) => same(x, y)); if (i < 0) return true; left.splice(i, 1); return false; });
  for (const y of rest) { const j = left.findIndex((q) => q.id === y.id), x = j >= 0 ? left.splice(j, 1)[0] : null; cfg.add(`${key}|${c.engine}|${c.alt}|${c.controller}`); out.push(`| ${key} | ${c.engine} + ${c.alt} + ${c.controller} | ${y.item} | ${VI[x?.st] || "∅"} → ${VI[y.st]} | ${cell(y.off)} | ${cell(y.q)} |`); }
}
console.log(`Cấu hình đổi: ${cfg.size}. Check đổi: ${out.length}.\n\n| Gói | Cấu hình | Check | Trước → sau | Giá trị (tờ hãng) | Dòng nguồn |\n|---|---|---|---|---|---|\n${out.join("\n")}`);
