// Xem hình dữ liệu bộ phận trong configmatch + link manual trong kết quả tìm kiếm (chỉ đọc). node xem-hinh.mjs <tệp tìm kiếm>
import fs from "node:fs";
const list = JSON.parse(fs.readFileSync(new URL("./configmatch.json", import.meta.url), "utf8"));
const d = list.find((x) => (x.id || x.key) === "IB2600603983"), r = (d.data || d).result || d.data, c = r.configs.find((x) => x.rank === 2);
for (const p of ["engine", "alternator", "controller"]) console.log(p, JSON.stringify({ ...c[p], alternatives: undefined }).slice(0, 420));
const kinds = {}; for (const x of list) for (const k of ((x.data || x).result || x.data || {}).configs || []) for (const p of ["engine", "alternator", "controller"]) { const s = k[p]?.src || {}; const t = `${p}:${s.kind}:${Object.keys(s).join(",")}`; kinds[t] = (kinds[t] || 0) + 1; }
console.log(kinds);
const raw = JSON.parse(fs.readFileSync(process.argv[2], "utf8")), j = Array.isArray(raw) && raw[0]?.text ? JSON.parse(raw[0].text) : raw;
for (const w of j.data?.web || []) if (/deepseaelectronics\.com/.test(w.url)) for (const m of String(w.description || "").matchAll(/\[[^\]]*Operators? Manual[^\]]*\]\((https?:[^)\s]+)/gi)) console.log("LINK", w.url, "=>", m[1]);
