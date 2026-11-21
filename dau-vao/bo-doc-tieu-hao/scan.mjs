// bo-doc-tieu-hao bước 1: rà MỌI bản ghi fromSupplier của suppliers/cn (một gốc repo), không lấy mẫu.
// node scan.mjs <gốc repo> <thư mục ra>
//  tieu-hao.tsv : bản ghi có chữ L/h trong ngữ cảnh tiêu hao (dòng / tiêu đề / dòng nhãn) mà số tiêu hao của mức tải đó không ra L/h
//                 (lấy cột g/kWh, không đơn vị, hay không có số)
//  xi-lanh.tsv  : dòng nhãn nói số xi lanh mà bản ghi không có `cyl`
//  dong-may.tsv : bảng không tiêu đề của NCC động cơ / "Datasheet:" mà modelFacts (đường 1) không gắn model nào
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, outDir] = process.argv.slice(2), root = path.resolve(rootArg);
await import(pathToFileURL(path.join(root, "web", "conversions.js")).href).catch(() => {});
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
await import(pathToFileURL(path.join(root, "web", "spec-norm.js")).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const cat = C.build(sups);
const LH = /(?<![a-z])l\s*\/\s*h(r|our)?\b|(?<![a-z])lph\b|lit(re|er)s?\s*\/\s*h|升\s*\/\s*小?时|\blt\s*\/\s*hr?\b/i;
const GKWH = /g(r)?\s*\/\s*\(?\s*k\s*w\s*[.·\-]?\s*h|克\/千瓦/i;
const FUELCTX = /consum|fuel|油耗|耗油|燃油|tiêu hao|\d\s*%\s*(load|prp|prime|esp|负载|功率)|rating/i;
const KEYS = ["fuel", "fuel75", "fuel50"], LOAD = { fuel: 100, fuel75: 75, fuel50: 50 };
const esc = (s) => String(s ?? "").replace(/[\t\n\r]+/g, " ").slice(0, 300);
const out = { th: [], cyl: [], fam: [] };
const counts = { th: {}, cyl: {}, fam: {} };
const bump = (k, s, n = 1) => { counts[k][s] = (counts[k][s] || 0) + n; };
let recs = 0;
for (const s of sups) {
  const rowsOf = (i) => s.specTables?.[i]?.rows || [];
  for (const r of C.fromSupplier(s, [])) {
    recs++;
    const kv = !r.line && r.lines;
    // Lines of fuel context: a row table = its header + its own line; a label table = the lines whose label is fuel or a unit line.
    const text = kv ? (r.lines.rows || []).filter((l) => FUELCTX.test(l) || LH.test(l)) : [...(r.header || []), r.line || ""];
    const hasLh = text.some((l) => LH.test(l) && (kv ? true : FUELCTX.test([...(r.header || []), r.line].join(" ")) || LH.test(l)));
    if (hasLh) {
      const norm = SN.normalizeRecord(r, rowsOf(r.table));
      const fs_ = (r.specs || []).map((x, i) => ({ x, n: SN.normalize(x, { title: r.title, header: r.header || r.lines?.header || [], rows: rowsOf(r.table) }) })).filter((o) => KEYS.includes(o.x.key));
      // Which loads the text writes in L/h: a row table with an L/h column → every key read from that table; a label table → the load of each L/h line.
      for (const k of KEYS) {
        const got = fs_.filter((o) => o.x.key === k);
        const ok = got.some((o) => o.n?.unit === "L/h" && o.n?.num != null);
        // Does the source write this load in L/h at all?
        const loadRe = k === "fuel" ? /100\s*%|full|满载|(?<!\d)(?!75|50|25)(consum|油耗|cons)/i : new RegExp(`(?<![\\d.])${LOAD[k]}\\s*%|${k === "fuel75" ? "3\\/4" : "1\\/2"}`, "i");
        const lhLoad = kv ? text.some((l) => LH.test(l) && loadRe.test(l)) || (text.some((l) => LH.test(l) && !/\d/.test(l.replace(/\d\s*\/?\s*h|kw\s*h/gi, ""))) && text.some((l) => loadRe.test(l)))
          : got.length > 0 || (r.header || []).some((h) => LH.test(h) && loadRe.test(h));
        if (ok || !lhLoad) continue;
        const why = !got.length ? "khong-co-so" : got.some((o) => o.n?.unit === "g/kWh") ? "lay-g/kWh" : got.some((o) => o.n?.missing?.includes("unit")) ? "khong-don-vi" : `khac:${got.map((o) => (o.n?.missing || []).join("+") || o.n?.unit).join(",")}`;
        const role = s.role || "", both = text.some((l) => GKWH.test(l)) ? "ca-hai" : "chi-L/h";
        out.th.push([s.id, role, r.n, r.kind, r.model || "", r.genset || "", k, both, why, got.map((o) => `${o.x.label}=${o.x.value}`).join(" ; "), kv ? "nhan" : "dong", esc(kv ? text.join(" ¦ ") : r.line)].join("\t"));
        bump("th", `${both}|${role}|${why}`);
      }
    }
    // Cylinder labels not read.
    if (kv && r.kind === "engine" && !(r.specs || []).some((x) => x.key === "cyl")) {
      for (const l of r.lines.rows || []) {
        const c = C.cellsOf(l);
        if (/cylinder|气缸|缸数/i.test(c[0] || "") && !/bore|diam|stroke|arrangement|liner|head|block|pressure|order|press|displace|capac|volume/i.test(c[0] || "") && /\d/.test(c.slice(1).join(" ") || c[0])) {
          out.cyl.push([s.id, s.role || "", r.n, r.model || "", esc(l)].join("\t")); bump("cyl", s.id); break;
        }
      }
    }
  }
  // Family tables (modelFacts path 1) that give no model.
  const own = { engine_maker: "engine", alternator_maker: "alternator" }[s.role];
  for (const t of s.specTables || []) {
    if (t.header?.length) continue;
    const models = [...new Set(String(t.title || "").split(/[\s:–—|,/()]+/).filter((w) => C.isCode(w)).map((w) => C.keyOf(w)))];
    const isPart = (k, m) => (cat[k === "engine" ? "engines" : "alternators"] || []).some((e) => e.key === m);
    // Only tables that give an engine constant / fuel ("| Cylinders 6" counts: label and figure in one cell).
    const engRows = t.rows.filter((l) => { const c = C.cellsOf(l); return ["bore", "disp", "cyl", "compr", "fuel", "fuel75", "fuel50"].includes(C.specKey(c.length >= 2 ? c[0] : String(c[0]).replace(/[\d.,:：xX×*\s/()-]+$/, ""))); }).length;
    if (!engRows) continue;
    if (models.length !== 1) { if (own === "engine" || /^Datasheet: /.test(t.title || "")) { out.fam.push([s.id, s.role || "", t.n, "tieu-de-khong-1-ma", models.join(","), esc(t.title)].join("\t")); bump("fam", `${s.id}|tieu-de-khong-1-ma`); } continue; }
    const kind = own || (/^Datasheet: /.test(t.title || "") ? ["alternator", "engine"].find((k) => isPart(k, models[0])) : null);
    if (!kind) continue;
    if (isPart(kind, models[0])) continue;
    const FRAME_SUFFIX = /^([A-Z]{1,2}|[A-Z]{0,2}\d{1,2})$/;
    const known = new Set((kind === "engine" ? cat.engines : cat.alternators || []).map((e) => e.key));
    const cov = [...new Set(t.rows.flatMap((l) => C.cellsOf(l)).filter((c) => C.isCode(c)).map((c) => C.keyOf(c)))].filter((k) => k !== models[0] && k.startsWith(models[0]) && FRAME_SUFFIX.test(k.slice(models[0].length)) && known.has(k));
    if (cov.length) continue;
    const pref = [...known].filter((k) => k.startsWith(models[0]));
    out.fam.push([s.id, s.role || "", t.n, "khong-gan", models[0], esc(t.title), pref.length, pref.slice(0, 12).join(",")].join("\t")); bump("fam", `${s.id}|khong-gan`);
  }
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "tieu-hao.tsv"), ["ncc\tvai\tn\tkind\tmodel\tgenset\tkhoa\tdon-vi\tvi-sao\tdoc-duoc\tbang\tchu", ...out.th].join("\n") + "\n");
fs.writeFileSync(path.join(outDir, "xi-lanh.tsv"), ["ncc\tvai\tn\tmodel\tdong", ...out.cyl].join("\n") + "\n");
fs.writeFileSync(path.join(outDir, "dong-may.tsv"), ["ncc\tvai\tn\tloai\tma\ttieu-de\tso-model-cung-tien-to\tmodel", ...out.fam].join("\n") + "\n");
console.log("bản ghi", recs, "| tiêu hao", out.th.length, "| xi lanh", out.cyl.length, "| dòng máy", out.fam.length);
console.log(JSON.stringify(counts, null, 1));
