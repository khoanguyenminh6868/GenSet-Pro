// In URL + tiêu đề + 160 ký tự mô tả của một tệp kết quả tìm kiếm. node ket-qua-tim.mjs <tệp>
import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const j = Array.isArray(raw) && raw[0]?.text ? JSON.parse(raw[0].text) : raw;
for (const w of j.data?.web || []) console.log(`${w.url}\n   ${String(w.title || "").slice(0, 90)} | ${String(w.description || "").replace(/\s+/g, " ").slice(0, 160)}`);
