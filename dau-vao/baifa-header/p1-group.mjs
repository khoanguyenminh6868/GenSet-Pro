// Gom các lần luật 0,8 kích hoạt theo NCC + tiêu đề + tiêu đề con + đơn vị; in số dòng và một dòng mẫu.
import fs from "node:fs";
const { events } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const g = new Map();
for (const v of events) { const k = `${v.sid} | tiêu đề: ${v.PT.join(" ¦ ")} | con: ${v.sub.join(" ¦ ")} | đơn vị ${v.u} (prime từ ${v.usrc.prime}, standby từ ${v.usrc.standby})`; if (!g.has(k)) g.set(k, []); g.get(k).push(v); }
for (const [k, l] of [...g].sort((a, b) => a[0].localeCompare(b[0]))) console.log(`${l.length} dòng | ${k}\n      vd: standby ${l[0].s} prime ${l[0].p} | ${l[0].cells.join(" | ").slice(0, 140)}`);
