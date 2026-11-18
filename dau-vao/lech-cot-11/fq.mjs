// node fq.mjs — mọi bản ghi có freq ĐỔI giữa origin/main (cùng catalog chưa sửa freqIn nhưng cả hai đã có sửa lệch cột? không: so với main) và bản làm việc
import fs from "node:fs"; import path from "node:path";
const SP = path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ""));
const load = (f) => { const win = {}; new Function("window", "module", fs.readFileSync(f, "utf8"))(win, undefined); return win.GenbidCatalog; };
const NEW = load(path.join(process.cwd(), "web", "catalog.js")), OLD = load(process.argv[2] || path.join(SP, "main-catalog.js"));
const dir = path.join(process.cwd(), "suppliers", "cn");
const key = (u) => [u.table, u.row, u.kind, u.model, u.genset].join("§");
const lab = /(?:frequency|freq\.?|tần\s*số|频\s*率)\s*(?:[(（\[]\s*hz\s*[)）\]]|\bhz\b)?\s*[:：=|]?\s*(50|60)(?![\d.,%]|\s*(?:%|v\b|kw|kva))/i;
const rows = [], cls = new Map(), sup = new Map();
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const a = new Map(OLD.fromSupplier(s, []).map((u) => [key(u), u])), b = NEW.fromSupplier(s, []);
  for (const u of b) {
    const o = a.get(key(u)); if (!o || (o.freq ?? null) === (u.freq ?? null)) continue;
    const t = s.specTables[u.table]; const text = u.row != null ? t.rows[u.row] : t.rows.join(" ");
    const m = (text + " " + (t.header || []).join(" ") + " " + (t.title || "")).match(lab);
    const form = m ? m[0].toLowerCase().replace(/\s+/g, " ").replace(/\d+$/, "N") : "?(không thấy nhãn)";
    const k = `${o.freq ?? "∅"}→${u.freq ?? "∅"} | ${form}`; cls.set(k, (cls.get(k) || 0) + 1); sup.set(s.id || f, (sup.get(s.id || f) || 0) + 1);
    rows.push(`${s.id || f} n${t.n} b${u.table} d${u.row} ${u.kind} ${u.model} ${o.freq ?? "∅"}→${u.freq ?? "∅"} | ${String(text).slice(0, 170)}`);
  }
}
console.log("bản ghi freq đổi:", rows.length); console.log([...cls].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}\t${k}`).join("\n")); console.log([...sup].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join(" "));
fs.writeFileSync(path.join(SP, "fq-rows.txt"), rows.join("\n"));
// ---- kiểm chéo: nhãn nói một tần số nhưng chữ bảng (tiêu đề + dòng) nhắc tần số kia
const conf = new Map(), ctx = new Map();
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const a = new Map(OLD.fromSupplier(s, []).map((u) => [key(u), u])), b = NEW.fromSupplier(s, []);
  for (const u of b) {
    const o = a.get(key(u)); if (!o || (o.freq ?? null) === (u.freq ?? null)) continue;
    const t = s.specTables[u.table]; const all = (t.title || "") + " " + (t.header || []).join(" ") + " " + t.rows.join(" ");
    const other = u.freq === 50 ? /60\s?hz|1800\s?(rpm|r\/min)/i : /50\s?hz|1500\s?(rpm|r\/min)/i;
    if (other.test(all)) { const k = `${s.id} → ${u.freq}`; conf.set(k, (conf.get(k) || 0) + 1); if (!ctx.has(k)) ctx.set(k, all.match(other) && all.slice(Math.max(0, all.search(other) - 60), all.search(other) + 40)); }
    const m = all.match(lab); const form = m ? m[0] : ""; const kk = `${s.id}§${form.toLowerCase().replace(/\s+/g, " ").replace(/\d+$/, "N")}`; if (!ctx.has("f" + kk)) ctx.set("f" + kk, all.slice(Math.max(0, all.search(lab) - 40), all.search(lab) + 60));
  }
}
console.log("\nBẢNG NÓI MỘT TẦN SỐ NHƯNG CÓ CHỮ TẦN SỐ KIA:", [...conf.values()].reduce((a, b) => a + b, 0), "bản ghi");
for (const [k, n] of conf) console.log(n, k, "|", String(ctx.get(k)).replace(/\s+/g, " "));
fs.writeFileSync(path.join(SP, "fq-ctx.txt"), [...ctx].filter(([k]) => k.startsWith("f")).map(([k, v]) => `${k.slice(1)} | ${String(v).replace(/\s+/g, " ")}`).join("\n"));
