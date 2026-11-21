// Mục chưa phân nhóm của dem-nguon + madeBasisOf của mục xuất xứ động cơ + ngữ cảnh link manual. node khac-va-goc.mjs <gốc repo> <tệp tìm kiếm>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const CB = await import(pathToFileURL(path.join(path.resolve(process.argv[2]), "suppliers", "config-bot.mjs")).href);
const list = JSON.parse(fs.readFileSync(new URL("./configmatch.json", import.meta.url), "utf8"));
const KNOWN = /tiêu hao|tốc độ|vòng quay|tần số|công suất.*(động cơ|đầu phát)|kiểu động cơ|loại động cơ|phun|hệ thống nhiên liệu|nhiên liệu|làm mát|khí thải|phát thải|điều tốc|avr|ổn áp|điều chỉnh điện áp|điều áp|tiêu chuẩn|\bip\b|cấp bảo vệ|cách điện|nhận tải|bước tải|bước đóng tải/i;
const t = {}, org = {};
for (const d of list) for (const c of ((d.data || d).result || d.data || {}).configs || []) for (const x of c.checks || []) {
  if (x.status !== "unclear" && x.status !== "confirm") continue;
  if (/xuất xứ động cơ/i.test(x.item)) { const b = `${CB.madeBasisOf(x.hsmtQuote)}|${CB.madeBasisOf(x.requirement)}|${x.status}|${x.byCode ? "code" : "agent"}|${String(x.note || "").slice(0, 60)}`; org[b] = (org[b] || 0) + 1; }
  if (KNOWN.test(x.item) || (x.part === "controller" && (x.parts || []).some((y) => y.status === "unclear"))) continue;
  const k = `${x.part}|${x.item}`; t[k] = (t[k] || 0) + 1;
}
const e = Object.entries(t).sort((a, b) => b[1] - a[1]);
console.log(`chưa phân nhóm: ${e.reduce((s, [, n]) => s + n, 0)} check, ${e.length} tên mục`);
for (const [k, n] of e.slice(0, 40)) console.log(n, k.slice(0, 72));
console.log("\nxuất xứ động cơ (basis quote|basis yêu cầu|trạng thái|ai ghi|ghi chú):"); for (const [k, n] of Object.entries(org)) console.log(n, k);
const raw = JSON.parse(fs.readFileSync(process.argv[3], "utf8")), j = Array.isArray(raw) && raw[0]?.text ? JSON.parse(raw[0].text) : raw;
const w = (j.data?.web || []).find((x) => /dse7310-mkii\/downloads$/.test(x.url));
for (const m of String(w?.description || "").matchAll(/\[[^\]]*Operators? Manual[^\]]*\]\([^)]*\)[^\[]{0,90}/gi)) console.log("\n", m[0].replace(/\s+/g, " "));
