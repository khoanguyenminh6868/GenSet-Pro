// Tìm commit của web/catalog.js làm sheetOf đổi ở aosif 1052, 1108, 1109: node aosif-bisect.mjs <worktree> <thư mục tạm> <commit gốc>
// So C.specKey của từng nhãn lệch qua mọi commit của catalog.js từ commit gốc tới HEAD.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [wt, tmp, base] = process.argv.slice(2);
const git = (...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const LABELS = ["Charge Air Cooled", "Intercooled", "Lubrication oil consumption"];
const commits = [base, ...git("log", "--reverse", "--format=%h", `${base}..HEAD`, "--", "web/catalog.js").trim().split("\n").filter(Boolean)];
fs.mkdirSync(tmp, { recursive: true });
const keysAt = async (c) => {
  const f = path.join(tmp, `catalog-${c}.mjs`);
  fs.writeFileSync(f, git("show", `${c}:web/catalog.js`), "utf8");
  delete globalThis.GenbidCatalog;
  await import(pathToFileURL(f).href);
  const C = globalThis.GenbidCatalog;
  fs.rmSync(f);
  return Object.fromEntries(LABELS.map((l) => [l, C.specKey(l) ?? null]));
};
console.log("số commit catalog.js:", commits.length);
let prev = await keysAt(commits[0]);
console.log(commits[0], JSON.stringify(prev));
for (const c of commits.slice(1)) {
  let k;
  try { k = await keysAt(c); } catch (e) { console.log(c, "không nạp được:", e.message.slice(0, 80)); continue; }
  if (JSON.stringify(k) !== JSON.stringify(prev)) {
    console.log(c, git("log", "-1", "--format=%ad %s", "--date=short", c).trim().slice(0, 90));
    for (const l of LABELS) if (k[l] !== prev[l]) console.log(`  "${l}": ${prev[l]} -> ${k[l]}`);
    prev = k;
  }
}
console.log("HEAD", JSON.stringify(prev));
