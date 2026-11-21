// Danh sách cho phiên sửa sizeBlocks: 33 dòng oan (lượt, NCC, model, luật, nhãn cỡ, khối bị gán nhầm) + mọi lượt nhiều cỡ có ngưỡng đổi. Chỉ ghi nhãn cỡ và số, không ghi câu HSMT.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/config-bot.mjs").href);
const BP = globalThis.GenbidBidprice;
const T = JSON.parse(fs.readFileSync(new URL("./giai-thich-2.json", import.meta.url), "utf8"));
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const KEYS = ["minDisp", "maxDisp", "minCyl", "maxFuel", "maxFuel75", "maxFuel50"], RULE = { disp: "minDisp", maxDisp: "maxDisp", cyl: "minCyl", fuel: "maxFuel", fuel75: "maxFuel75", fuel50: "maxFuel50" };
const num = (s) => +String(s).replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
const heads = (line) => { const h = line.split(":")[0]; return h.length > 90 ? [] : [...h.matchAll(/(\d[\d.,]*)\s*k\s*va/gi)].map((m) => num(m[1])); };
const foreign = (line, cap, all) => { const k = heads(line); if (!k.length) return false; const near = (x) => all.reduce((b, v) => (Math.abs(v - x) < Math.abs(b - x) ? v : b), all[0]); return k.every((x) => near(x) !== cap); };
const cell = (s) => String(s).replace(/\|/g, "/").replace(/\s+/g, " ").trim();
const lostBy = new Map(); for (const x of T.lost) { if (!lostBy.has(x.run)) lostBy.set(x.run, []); lostBy.get(x.run).push(x); }
const rows33 = [], runs = [];
for (const d of Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text)) {
  const t = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  if (found.length < 2) continue;
  const caps = found.map((s) => s.cap.value), L = t.split("\n");
  found.slice(0, B.MAX_SIZES).forEach((s, ri) => {
    const run = `${d.notifyNo}#${ri}`, R = B.minsForSize(t, s, found), a = R.mins, kept = L.map((x) => (foreign(x, s.cap.value, caps) ? "" : x)).join("\n");
    if (kept === t) return;
    const b = B.minsForSize(kept, s, found).mins, diff = KEYS.filter((k) => (a[k] ?? null) !== (b[k] ?? null));
    if (!diff.length) return;
    const blockOf = (i) => R.blocks.find((x) => i + 1 >= x.from && i + 1 < x.to), wrong = [];
    L.forEach((x, i) => { const bl = blockOf(i); if (bl?.size >= 0 && caps[bl.size] === s.cap.value && foreign(x, s.cap.value, caps)) wrong.push({ i: i + 1, label: cell(x.split(":")[0]) }); });
    const labels = [...new Set(wrong.map((w) => w.label))], span = wrong.length ? `${wrong[0].i}–${wrong.at(-1).i}` : "-", own = R.blocks.filter((x) => x.size >= 0 && caps[x.size] === s.cap.value).map((x) => `${x.from}–${x.to - 1}`).join(", ");
    const dep = (lostBy.get(run) || []).filter((x) => x.ruled.length && x.ruled.every((r) => diff.includes(RULE[r])));
    runs.push(`| ${run} | ${s.cap.value} | ${diff.map((k) => `${k} ${a[k] ?? "-"} → ${b[k] ?? "-"}`).join("; ")} | ${dep.length} |`);
    for (const x of dep) rows33.push(`| ${run} | ${x.sup} | ${x.model} | ${x.top >= 0 ? x.top + 1 : "-"} | ${x.ruled.join(", ")} | ${labels.slice(0, 2).join("; ")} (dòng ${span}) | cỡ ${s.cap.value}, dòng ${own} |`);
  });
}
const md = ["### 33 dòng oan", "", "Hạng = hạng trong top 30 gốc. Dòng HSMT tính từ 1 trên `config.text` của bidhist 20/11 12:30.", "", "| Lượt | NCC | Model | Hạng | Luật loại | Nhãn cỡ của dòng ngưỡng | Khối bị gán nhầm |", "|---|---|---|--:|---|---|---|", ...rows33, "", `### ${runs.length} lượt nhiều cỡ có ngưỡng đổi`, "", "Ngưỡng hiện tại → ngưỡng khi bỏ dòng có nhãn cỡ khác. Cột cuối: số dòng mất chỉ vì ngưỡng đó.", "", "| Lượt | Cỡ | Ngưỡng đổi | Dòng oan |", "|---|--:|---|--:|", ...runs, ""].join("\n");
fs.writeFileSync(new URL("./soat-khoi-ds.md", import.meta.url), md);
console.log("dòng oan", rows33.length, "lượt", runs.length);
console.log(rows33.slice(0, 3).join("\n"));
