// Quét named() cũ (chuỗi con của chữ dồn) ↔ mới (trọn token) trên MỌI gói máy phát của bidhist cục bộ, MỌI model động cơ / đầu phát
// của catalog (mọi hãng, không riêng EL). Chữ HSMT ngắn quanh chỗ khớp chỉ ghi ra tệp ngoài repo.
// node quet-named.mjs <worktree> <bidhist.json> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BH, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice, CAT = globalThis.GenbidCatalog;
const { norm } = await import(pathToFileURL(path.join(WT, "suppliers", "verify.mjs")).href);
const raw = JSON.parse(fs.readFileSync(BH, "utf8"));
const docs = raw.docs || Object.values(raw)[0];
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const sups = fs.readdirSync(path.join(WT, "suppliers", "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(WT, "suppliers", "cn", f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups);
const models = new Map(); // squash -> [kind:model]
const sq = (s) => norm(s).replace(/[^a-z0-9]/g, "");
for (const [kind, list] of [["engine", cat.engines], ["alternator", cat.alternators]]) for (const e of list) {
  const k = sq(e.model); if (k.length < 5) continue;
  if (!models.has(k)) models.set(k, new Set()); models.get(k).add(`${kind}:${e.model}`);
}
console.error(`gói ${hist.length}, model ${models.size}`);
const lines = ["gói\tmodel squash\tvai:model\tcũ\tmới\tngữ cảnh (token quanh chỗ khớp)"];
let lost = 0, gained = 0, both = 0;
const byModel = {};
for (const d of hist) {
  const h = B.hintsOf(d.config.text, "");
  const toks = norm(`${d.config.text}`).match(/[a-z0-9]+/g) || [];
  for (const [k, names] of models) {
    if (!h.text.includes(k)) continue; // cũ = false thì mới cũng false
    const nw = B.named(h, k);
    if (nw) { both++; continue; }
    lost++;
    // ngữ cảnh: token chứa chỗ khớp đầu tiên ± 2 token
    let pos = h.text.indexOf(k), acc = 0, ti = 0;
    while (ti < toks.length && acc + toks[ti].length <= pos) acc += toks[ti++].length;
    const ctx = toks.slice(Math.max(0, ti - 2), ti + 4).join(" ");
    lines.push([d.notifyNo, k, [...names].join(","), "có", "không", ctx].join("\t"));
    byModel[[...names].join(",")] = (byModel[[...names].join(",")] || 0) + 1;
  }
}
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`cặp (gói, model) cũ khớp: ${both + lost}; mới vẫn khớp ${both}; mất ${lost}; mới thêm ${gained} (không thể: mới ⊂ cũ)`);
for (const [m, n] of Object.entries(byModel).sort((a, b) => b[1] - a[1])) console.log(" ", n, m);
