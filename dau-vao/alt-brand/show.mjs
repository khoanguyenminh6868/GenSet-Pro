// In tiêu đề + vài dòng của một bảng: node show.mjs <gốc> <id> <chỉ số bảng> <dòng,dòng>
import fs from "node:fs";
import path from "node:path";
const [root, id, ti, rs] = process.argv.slice(2);
const s = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8")), t = s.specTables[Number(ti)];
console.log(JSON.stringify({ n: t.n, title: t.title, header: t.header, rows: rs.split(",").map((r) => t.rows[Number(r)]) }, null, 1));
