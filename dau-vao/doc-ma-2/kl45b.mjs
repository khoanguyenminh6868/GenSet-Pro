// node kl45b.mjs <repoDir> — tecnogen n2008: thông số của MỌI dòng bảng có KL45TSX, đọc cả bảng và đọc từng dòng một mình; rồi thử đổi số của KL45.
import fs from "node:fs";
import path from "node:path";
import { loadWeb } from "./load.mjs";
const dir = process.argv[2];
const C = loadWeb(dir);
const s = JSON.parse(fs.readFileSync(path.join(dir, "suppliers", "cn", "tecnogen.json"), "utf8"));
const t = s.specTables.find((x) => x.n === 2008 && x.rows.some((l) => l.includes("KL45TSX")));
const fmt = (r) => (r ? (r.specs || []).map((x) => `${x.key}=${x.value}`).join(" ") : "không bản ghi");
const notes = [];
const all = C.fromSupplier({ ...s, specTables: [t] }, notes).filter((x) => x.kind === "engine");
t.rows.forEach((l, i) => {
  const g = l.split("|")[1].trim();
  console.log(i, g, "|", l.split("|")[6]?.trim(), "| bảng:", fmt(all.find((x) => x.row === i)));
  const solo = C.fromSupplier({ ...s, specTables: [{ ...t, rows: [l] }] }).find((x) => x.kind === "engine");
  console.log("   một mình:", fmt(solo));
});
for (const n of notes) console.log("NOTE", n.row, n.reason, "::", String(n.detail).slice(0, 110));
const k = t.rows.find((l) => l.includes("KL45TSX"));
const tries = {
  "kVA 45→46": k.replace("| 45 | 41 |", "| 46 | 41 |"),
  "kVA 41→36 (=0.8)": k.replace("| 45 | 41 |", "| 45 | 36 |"),
  "tank 135→136": k.replace("| 67 | 135 |", "| 67 | 136 |"),
  "4→5 cyl": k.replace("| M | 4 |", "| M | 5 |"),
  "6.6→6.7": k.replace("| 6.6 |", "| 6.7 |"),
  "37.3→37.4": k.replace("| 37.3 |", "| 37.4 |"),
};
for (const [n, l] of Object.entries(tries)) console.log(n.padEnd(18), fmt(C.fromSupplier({ ...s, specTables: [{ ...t, rows: [l] }] }).find((x) => x.kind === "engine")));
