// Đối chiếu ĐỦ 1.661 dòng (classify.json, chụp trước khi sửa) với hồ sơ sau khi dựng lại: dòng nào đã vào bảng, dòng nào còn ngoài.
//   node account.mjs <gốc repo mới> <classify.json> <out.json>
import fs from "node:fs";
import path from "node:path";
const [root, file, outFile] = process.argv.slice(2);
const all = JSON.parse(fs.readFileSync(file, "utf8"));
const by = new Map();
for (const x of all) { if (!by.has(x.sid)) by.set(x.sid, []); by.get(x.sid).push(x); }
const rest = [];
let A = 0, R = 0;
console.log("NCC".padEnd(26), "tổng  vào bảng  còn ngoài");
for (const [sid, l] of [...by].sort((a, b) => b[1].length - a[1].length)) {
  const rec = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${sid}.json`), "utf8"));
  const have = new Set((rec.specTables || []).flatMap((t) => [...t.header, ...t.rows]));
  const inn = l.filter((x) => have.has(x.text)), out = l.filter((x) => !have.has(x.text));
  A += inn.length; R += out.length; rest.push(...out);
  console.log(sid.padEnd(26), String(l.length).padStart(4), String(inn.length).padStart(9), String(out.length).padStart(10));
}
console.log(`TỔNG ${all.length}: vào bảng ${A}, còn ngoài ${R}`);
fs.writeFileSync(outFile, JSON.stringify(rest, null, 1), "utf8");
