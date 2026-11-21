// MỌI lượt nhiều cỡ trong bidhist: ngưỡng đọc từ khối của cỡ ↔ ngưỡng khi bỏ các dòng mà nhãn đầu dòng nêu rõ cỡ KHÁC. Dòng mất (giai-thich-2) nào dựa vào ngưỡng đổi. Chỉ đọc; tệp ra có chữ HSMT: không commit.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/config-bot.mjs").href);
const BP = globalThis.GenbidBidprice;
const T = JSON.parse(fs.readFileSync(new URL("./giai-thich-2.json", import.meta.url), "utf8"));
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const KEYS = ["minDisp", "maxDisp", "minCyl", "maxFuel", "maxFuel75", "maxFuel50"], RULE = { disp: "minDisp", maxDisp: "maxDisp", cyl: "minCyl", fuel: "maxFuel", fuel75: "maxFuel75", fuel50: "maxFuel50" };
const num = (s) => +String(s).replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
// Nhãn đầu dòng ("Phần 1 - Máy 500 kVA:") nêu cỡ gần cỡ khác hơn cỡ đang xét.
const foreign = (line, cap, all) => { const head = line.split(":")[0]; if (head.length > 90) return false; const k = [...head.matchAll(/(\d[\d.,]*)\s*k\s*va/gi)].map((m) => num(m[1])); if (!k.length) return false; const near = (x) => all.reduce((b, v) => (Math.abs(v - x) < Math.abs(b - x) ? v : b), all[0]); return k.every((x) => near(x) !== cap); };
const lostBy = new Map(); for (const x of T.lost) { if (!lostBy.has(x.run)) lostBy.set(x.run, []); lostBy.get(x.run).push(x); }
const out = [], p = (...a) => out.push(a.join(" ")), byKey = new Map(); let runs = 0, changed = 0, oan = 0, oanTop = 0, still = 0;
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
for (const d of hist) {
  const t = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  if (found.length < 2) continue;
  const list = found.slice(0, B.MAX_SIZES), caps = found.map((s) => s.cap.value);
  list.forEach((s, ri) => {
    runs++; const run = `${d.notifyNo}#${ri}`, a = B.minsForSize(t, s, found).mins, L = t.split("\n"), kept = L.map((x) => (foreign(x, s.cap.value, caps) ? "" : x)).join("\n");
    if (kept === t) return;
    const b = B.minsForSize(kept, s, found).mins, diff = KEYS.filter((k) => (a[k] ?? null) !== (b[k] ?? null));
    if (!diff.length) return;
    changed++; diff.forEach((k) => byKey.set(k, (byKey.get(k) || 0) + 1));
    const rows = lostBy.get(run) || [], dep = rows.filter((x) => x.ruled.some((r) => diff.includes(RULE[r]))), free = dep.filter((x) => x.ruled.every((r) => diff.includes(RULE[r])));
    oan += free.length; oanTop += free.filter((x) => x.top >= 0).length; still += dep.length - free.length;
    p(`${run} cỡ ${s.cap.value}: ${diff.map((k) => `${k} ${a[k] ?? "-"} → ${b[k] ?? "-"}`).join("; ")} | dòng mất dựa vào: ${dep.length}, chỉ vì ngưỡng này: ${free.length}${free.length ? ` (${[...new Set(free.map((x) => x.model))].slice(0, 5).join(", ")})` : ""}`);
  });
}
p(`\nLượt nhiều cỡ: ${runs} | ngưỡng đổi: ${changed} lượt ${JSON.stringify([...byKey])}`);
p(`Dòng mất chỉ vì ngưỡng của cỡ khác: ${oan} (trong top 30 gốc: ${oanTop}); còn luật khác vẫn loại: ${still}`);
fs.writeFileSync(new URL("./soat-khoi.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 14000));
