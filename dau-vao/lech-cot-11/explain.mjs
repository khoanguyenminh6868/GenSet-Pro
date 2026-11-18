import fs from "node:fs";
const L = fs.readFileSync("gop-so.txt", "utf8").split("\n");
const changed = new Set(JSON.parse(fs.readFileSync("facts-changed.json", "utf8")));
const R = new Map(JSON.parse(fs.readFileSync("cmp30.json", "utf8")).map((r) => [r.k, r]));
const runs = []; let cur = null;
for (let i = 0; i < L.length; i++) {
  const m = L[i].match(/^== (\S+) \[(.+?)\]/); if (m) { cur = { k: m[1], kind: m[2], items: [] }; runs.push(cur); continue; }
  const t = L[i].match(/^   (VÀO|RA) hạng (\d+): (.*)$/);
  if (t && cur) { const st = L[i + 1].replace(/^\s*→ /, ""); const cu = L[i + 2]?.startsWith("            CŨ") || L[i + 2]?.startsWith("            MỚI") ? [L[i + 2], L[i + 3]?.startsWith("            MỚI") ? L[i + 3] : ""].join(" ") : ""; cur.items.push({ dir: t[1], rank: +t[2], key: t[3], st, d: cu }); }
}
const keyParts = (k) => { const p = k.split("|"); return { sup: p[0], eng: p[1], alt: p[2] }; };
const cause = (it, run) => {
  const { sup, eng, alt } = keyParts(it.key);
  if (it.st === "bản ghi ĐỔI" || it.st === "dòng mới có" || it.st === "dòng không còn") {
    const d = it.d;
    if (/CŨ: (engine|alternator) (\S+) .*MỚI: (alternator|engine) \2/.test(d.replace(/\s+/g, " ")) || (/CŨ: engine/.test(d) && /MỚI: alternator/.test(d)) || (/CŨ: alternator/.test(d) && /MỚI: engine/.test(d))) return "đổi vai động cơ ↔ đầu phát (Doosan P-series / mã khung)";
    return "bản ghi đổi: " + (d.replace(/\s+/g, " ").slice(0, 140));
  }
  if (changed.has("engine:" + eng) || changed.has("alternator:" + alt) || changed.has("engine:" + alt)) return "dữ kiện model đổi (" + (changed.has("engine:" + eng) ? eng : alt) + ")";
  return "bị chen / lấp chỗ (bản ghi không đổi)";
};
const tab = new Map(); const sq = [];
for (const r of runs) for (const it of r.items) { const c = cause(it, r); const kk = `${it.dir} | ${c.startsWith("bản ghi đổi") ? "bản ghi đổi (" + keyParts(it.key).sup + ")" : c}`; tab.set(kk, (tab.get(kk) || 0) + 1); it.c = c; }
console.log([...tab].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}\t${k}`).join("\n"));
// mỗi lượt: có ít nhất một dòng vào/ra KHÔNG phải "chen" thì lượt đã giải thích
let un = 0; const unl = [];
for (const r of runs) { if (r.kind === "chỉ đổi all / dropped") continue; if (!r.items.some((i) => !i.c.startsWith("bị chen"))) { un++; unl.push(r.k); } }
console.log("\nlượt đổi top / thứ tự mà KHÔNG có dòng vào/ra nào do thay đổi (chỉ bị chen):", un, unl.slice(0, 10).join(" "));
fs.writeFileSync("explain.json", JSON.stringify(runs));
