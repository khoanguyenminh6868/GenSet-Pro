// Mọi tên phần / check bộ điều khiển chưa đạt của cấu hình DSE7310/7320 MKII trong bản chụp (kể cả result.sizes).
import fs from "node:fs";
import path from "node:path";
const here = import.meta.dirname;
const list = JSON.parse(fs.readFileSync(path.join(here, "snap", "configmatch.json"), "utf8"));
const seen = new Map(), models = new Map(); let cfg = 0, dse = 0;
const walk = (key, r) => {
  for (const c of r?.configs || []) {
    cfg++;
    const m = c.controller?.model || "(không)";
    models.set(m, (models.get(m) || 0) + 1);
    if (!/DSE\s?73[12]0\s*MK/i.test(m)) continue;
    dse++;
    for (const x of c.checks || []) {
      if (x.part !== "controller") continue;
      for (const p of x.parts?.length ? x.parts : [x]) {
        if (p.status === "met") continue;
        const k = `${p.status} | ${x.parts?.length ? `${x.item} :: ` : ""}${p.item}`;
        if (!seen.has(k)) seen.set(k, new Set());
        seen.get(k).add(key);
      }
    }
  }
  for (const z of r?.sizes || []) walk(key, z.result);
};
for (const d of list) walk(d.id || d.key, d.data?.result || d.result || d.data);
const lines = [...seen].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${[...v].join(",")}\t${k}`);
fs.writeFileSync(path.join(here, "names.txt"), lines.join("\n") + "\n", "utf8");
console.log(`lượt ${list.length}, cấu hình ${cfg}, DSE73x0 MKII ${dse}, tên chưa đạt ${lines.length}`);
console.log([...models].filter(([m]) => /73[12]0/.test(m)).map(([m, n]) => `${m}: ${n}`).join("; "));
console.log(lines.join("\n").slice(0, 14000));
