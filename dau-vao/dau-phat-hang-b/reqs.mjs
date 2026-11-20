// In các yêu cầu đầu phát của một lượt trong snap/configmatch.json. node reqs.mjs <TBMT> [regex tên mục]
import fs from "node:fs";
const [key, re] = process.argv.slice(2), j = JSON.parse(fs.readFileSync(new URL("./snap/configmatch.json", import.meta.url), "utf8"));
const hit = (o) => o && typeof o === "object" && Array.isArray(o.requirements) && JSON.stringify(o).includes(key);
const walk = (o) => { if (!o || typeof o !== "object") return null; if (hit(o) && o.configs) return o; for (const v of Object.values(o)) { const r = walk(v); if (r) return r; } return null; };
const r = walk(Object.fromEntries(Object.entries(j).filter(([k, v]) => k.includes(key) || JSON.stringify(v).includes(key))));
for (const q of r?.requirements || []) if (q.part === "alternator" || new RegExp(re || "đầu phát", "i").test(q.item)) console.log(JSON.stringify({ item: q.item, code: q.code, part: q.part, req: q.requirement }));
