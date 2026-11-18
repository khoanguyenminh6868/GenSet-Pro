// node phanLoai.cjs gop-so.txt: xếp mỗi gói đổi vào một nhóm nguyên nhân theo NCC của các dòng có bản ghi đổi / mới / mất
// (vào, ra, hay còn trong top). Gói không có dòng nào như vậy: in ra để soát riêng.
const fs = require("fs");
const txt = fs.readFileSync(process.argv[2], "utf8").split("\n");
const pk = [];
let cur = null;
for (let i = 0; i < txt.length; i++) {
  const l = txt[i];
  if (l.startsWith("== ")) { cur = { head: l, causes: new Set(), lines: [] }; pk.push(cur); continue; }
  if (!cur) continue;
  cur.lines.push(l);
  const m = l.match(/^\s+(?:VÀO|RA) hạng \d+: ([^|]+)\|/) || l.match(/^\s+\(trong top cả hai\) ([^|]+)\|/);
  if (m) {
    const st = l.includes("(trong top cả hai)") ? l : txt[i + 1] || "";
    if (/bản ghi ĐỔI|dòng mới có|dòng không còn/.test(st)) cur.causes.add(m[1].trim());
  }
}
const by = {}, none = [];
for (const p of pk) {
  const kind = (p.head.match(/\[(.*?)\]/) || [])[1] || "?";
  const c = [...p.causes].sort().join("+") || "KHÔNG có dòng đổi trong top / vào / ra";
  const k = `${kind} | ${c}`;
  by[k] = (by[k] || 0) + 1;
  if (!p.causes.size) none.push(p.head);
}
console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${String(v).padStart(4)}  ${k}`).join("\n"));
console.log(`\ngói không có dòng đổi nào trong top / vào / ra: ${none.length}`);
for (const h of none.slice(0, 80)) console.log("  " + h);
