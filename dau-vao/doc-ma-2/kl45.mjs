// node kl45.mjs <repoDir> — tecnogen n2008 KL45TSX: thông số đọc được với ô "- - -" gốc, và khi đổi từng nhóm ô sang "--".
import fs from "node:fs";
import path from "node:path";
import { loadWeb } from "./load.mjs";
const dir = process.argv[2];
const C = loadWeb(dir);
const s = JSON.parse(fs.readFileSync(path.join(dir, "suppliers", "cn", "tecnogen.json"), "utf8"));
const t = s.specTables.find((x) => x.n === 2008 && x.rows.some((l) => l.includes("KL45TSX")));
const line = t.rows.find((l) => l.includes("KL45TSX"));
const run = (name, l) => {
  const notes = [];
  const r = C.fromSupplier({ ...s, specTables: [{ ...t, rows: [t.rows[2], l] }] }, notes).find((x) => x.kind === "engine" && x.genset === "KL45TSX");
  console.log(name.padEnd(14), r ? (r.specs || []).map((x) => `${x.key}=${x.value}`).join(" ") : "không bản ghi");
  console.log("".padEnd(14), "power", JSON.stringify(r?.power));
  for (const n of notes) if (n.row === 1) console.log("".padEnd(14), "NOTE", n.reason, "::", String(n.detail).slice(0, 80));
};
run("gốc", line);
run("tất cả --", line.replaceAll("- - -", "--"));
let i = 0;
for (const k of [0, 1, 2, 3]) { i = 0; run("đổi ô " + k, line.replace(/- - -/g, (m) => (i++ === k ? "--" : m))); }
