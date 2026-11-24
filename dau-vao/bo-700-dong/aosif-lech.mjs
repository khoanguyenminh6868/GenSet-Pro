// Vì sao aosif 1052, 1108, 1109 lệch 1 dòng so với sheetOf: node aosif-lech.mjs <worktree>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [wt] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const { sheetOf } = await import(pathToFileURL(path.join(SUP, "crawl-datasheets.mjs")).href);
const bodyOf = (s) => s.replace(/\r/g, "").replace(/^URL:.*\nAccessed:.*\n(From:.*\n)?\n?/, "");
const ds = JSON.parse(fs.readFileSync(path.join(SUP, "datasheets", "aosif.json"), "utf8"));
const cn = JSON.parse(fs.readFileSync(path.join(SUP, "cn", "aosif.json"), "utf8"));
for (const n of [1052, 1108, 1109]) {
  const raw = fs.readFileSync(path.join(SUP, "sources", "aosif", `${n}.md`), "utf8"), body = bodyOf(raw);
  const full = sheetOf(body), lines = body.split("\n").map((l) => l.trim());
  const tabs = ds.filter((t) => t.n === n), cnTabs = (cn.specTables || []).filter((t) => t.n === n);
  console.log(`\n== ${n}: head ${JSON.stringify(raw.split("\n").slice(0, 3))}`);
  console.log(`sheetOf ${full.length}; datasheets ${tabs.map((t) => t.rows.length)}; cn ${cnTabs.map((t) => t.rows.length)}`);
  tabs.forEach((t, k) => {
    const have = new Set(t.rows), want = new Set(full);
    const onlyStored = t.rows.filter((l) => !want.has(l)), onlyFull = full.filter((l) => !have.has(l));
    const firstDiff = t.rows.findIndex((l, i) => l !== full[i]);
    console.log(`bảng ${k}: chỉ-lưu ${onlyStored.length}, chỉ-sheetOf ${onlyFull.length}, lệch đầu tiên ở dòng ${firstDiff}`);
    for (const l of onlyStored.slice(0, 3)) console.log("  chỉ lưu:", JSON.stringify(l), "| dòng nguồn:", lines.indexOf(l), "| số lần trong nguồn:", lines.filter((x) => x === l).length);
    for (const l of onlyFull.slice(0, 3)) console.log("  chỉ sheetOf:", JSON.stringify(l), "| dòng nguồn:", lines.indexOf(l), "| số lần trong nguồn:", lines.filter((x) => x === l).length);
    if (firstDiff >= 0) console.log("  tại lệch: lưu", JSON.stringify(t.rows[firstDiff]), "sheetOf", JSON.stringify(full[firstDiff]));
  });
}
