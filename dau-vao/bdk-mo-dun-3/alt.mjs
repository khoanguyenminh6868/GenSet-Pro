// Mọi phương án khác + mô-đun theo gói / cấu hình. node alt.mjs <cm.json>
import fs from "node:fs";
const a = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
for (const [k, v] of Object.entries(a)) for (const c of v.configs) if (c.altLine || c.modules) console.log(k, `#${c.rank}`, c.controller, c.modules ? `+${c.modules.map((m) => m.model)}` : "", "::", c.altLine || "");
