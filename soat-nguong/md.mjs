import fs from "node:fs";
const rows = JSON.parse(fs.readFileSync("table.json", "utf8"));
const o = JSON.parse(fs.readFileSync("out.json", "utf8"));
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/nghiem-thu/soat-nguong-disp.md";
const cnt = (f) => rows.filter(f).length;
const head = fs.readFileSync("head.md", "utf8");
const T = rows.map((r) => `| ${r.key}${r.tags ? " [" + r.tags + "]" : ""} | ${r.sizes} | ${r.thr} | ${r.quote} | **${r.v}**${r.g ? " — " + r.g : ""}${r.stale ? " (đo #576 áp ngưỡng không theo cỡ; mã thật không áp)" : ""}${r.n ? ": " + r.n : ""} |`).join("\n");
fs.writeFileSync(OUT, head.replace("{{SUM}}", `ĐÚNG ${cnt((r) => r.v === "ĐÚNG")} / SAI ${cnt((r) => r.v === "SAI")} / KHÔNG RÕ ${cnt((r) => r.v === "KHÔNG RÕ")} (tổng ${rows.length} gói, ${o.length} lượt; trong ĐÚNG có ${cnt((r) => r.v === "ĐÚNG" && r.g === "số trần (L2)")} gói "số trần", ${cnt((r) => r.stale)} gói có lượt đo lệch)`) + "\n| gói | cỡ | ngưỡng code (dung tích) | câu nguồn (nguyên văn ≤150 ký tự) | phán |\n|---|---|---|---|---|\n" + T + "\n");
console.log("ok", rows.length);
