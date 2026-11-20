// kVA "Cont. H 125/40 °C, 50 Hz, 3 pha, 400 V" (cột prime) mỗi model đọc ĐƯỢC từ tờ hãng đã lưu bằng ratings.mjs hiện có.
// node dai-kva.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const R = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
const src = path.join(root, "suppliers", "sources");
for (const id of ["stamford-avk-china", "leroy-somer-fuzhou", "mecc-alte"]) {
  const d = path.join(src, id);
  for (const f of fs.readdirSync(d).filter((x) => /^1\d{3}\.md$/.test(x))) {
    const rs = R.ratingsOf(fs.readFileSync(path.join(d, f), "utf8")).filter((r) => r.part === "alternator");
    const by = new Map();
    for (const r of rs) {
      if (r.hz !== 50 || r.phase !== 3 || r.duty !== "Cont." || !/^(125|H)/.test(r.rise)) continue;
      if (r.volt && r.volt !== 400) continue;
      by.set(r.model, Math.max(by.get(r.model) || 0, r.kVA));
    }
    console.log(`${id}/${f}: ${[...by].map(([m, k]) => `${m} ${k}`).join(", ") || "(không đọc được)"}`);
  }
}
