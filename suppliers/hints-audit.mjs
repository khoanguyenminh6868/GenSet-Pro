// Soát ngưỡng HSMT do code đọc (Khoa, 2026-11-17, sau IB2600603983: 113 L/h của dòng 70% tải bị đọc thành mức 100% tải).
// hintsOf() của config-bot.mjs tìm nhãn quanh con số trong chữ HSMT; bảng PDF xuống dòng lạ thì gán nhầm và dòng ứng
// viên bị loại im lặng. Công cụ này so từng ngưỡng code đọc (tiêu hao 100 / 75 / 50% tải, công suất liên tục, số xi
// lanh) với đúng ngưỡng đó trong Phân tích của gói (analysis.technicalSpecs, generatorSets: do agent đọc cả văn bản)
// và in gói nào lệch. Không gọi agent, không ghi gì lên web.
//
//   node suppliers/hints-audit.mjs --texts <thư mục>      mỗi gói một thư mục con <TBMT>\text.txt (genbid-work\specs)
//   node suppliers/hints-audit.mjs --web --keys K1,K2     đọc chữ HSMT của vài gói từ web (ít gói thôi: tốn egress)
//     [--analysis <analysis.json>]   mặc định genbid-work\doc-cache\analysis.json; gói không có ở đó thì đọc web
//     [--out <tệp.json>]             ghi toàn bộ phát hiện
// Mức: "lech" = hai bên đều đọc được mà khác nhau (xem tay: code sai hoặc Phân tích sai); "thieu" = Phân tích có ngưỡng
// mà code không đọc ra (không loại nhầm ai, chỉ là không lọc được).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const num = (s) => { const t = String(s).trim(); return Number(/^\d{1,3}(?:[.,]\d{3})+$/.test(t) ? t.replace(/[.,]/g, "") : t.replace(",", ".")); };
const FUEL_W = /ti[êe]u\s*(?:hao|th[ụu])|su[ấa]t\s*ti[êe]u\s*hao|fuel\s*consumption/i;
const LPH = /(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)\s*(?:l[íi]t|l)\s*\/\s*(?:gi[ờo]|hr|h)(?![a-z])/gi; // không dùng \b: "ờ" không phải ký tự chữ của \b
const PCT = /(\d{2,3})\s*%/;

// Các mức tiêu hao (L/h) Phân tích ghi, theo mức tải: { 100: [156], 70: [113], 50: [77], null: [...] }.
export function analysisFuel(specs = []) {
  const out = {};
  for (const s of specs) {
    const item = String(s.item || ""), req = String(s.requirement || "");
    if (!FUEL_W.test(`${item} ${req}`)) continue;
    const clauses = req.split(/[;\n]|,(?!\d)/);
    const figs = clauses.flatMap((c) => [...c.matchAll(LPH)].map((m) => ({ v: num(m[1]), load: (c.match(PCT) || [])[1] })));
    for (const f of figs) {
      const load = f.load ?? (item.match(PCT) || [])[1] ?? (/đầy tải|full load/i.test(`${item} ${req}`) ? "100" : null);
      // Một dòng chỉ có một số và không ghi mức tải: mức 100% (quy ước của catalog và của powerRead).
      const k = load ?? (figs.length === 1 ? "100" : "null");
      (out[k] ||= []).push(f.v);
    }
  }
  return out;
}
// Số xi lanh Phân tích ghi (mọi giá trị thấy được).
export function analysisCyl(specs = []) {
  const out = new Set();
  for (const s of specs) {
    const item = String(s.item || ""), req = String(s.requirement || ""), t = `${item} ${req}`;
    for (const m of t.matchAll(/(\d{1,2})\s*(?:xi|xy)\s*-?\s*lanh/gi)) out.add(Number(m[1]));
    if (/s[ốo]\s*(?:xi|xy)\s*-?\s*lanh/i.test(item)) { const m = req.match(/(?:^|[^\d.,])(\d{1,2})(?![\d.,]|\s*(?:mm|l[íi]t|l\b|cc|cm|k[ỳy]|th[ìi]))/); if (m) out.add(Number(m[1])); }
  }
  return [...out].filter((n) => n >= 1 && n <= 24);
}
const same = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b)) * 0.005;

// hints: của hintsOf(); result: analysis.result. Trả [{ field, level, code, analysis, why }].
export function auditHints(hints = {}, result = {}) {
  const out = [], specs = result.technicalSpecs || [], fuel = analysisFuel(specs);
  const anyFuel = Object.values(fuel).flat();
  for (const [hk, load] of [["maxFuel", "100"], ["maxFuel75", "75"], ["maxFuel50", "50"]]) {
    const c = hints[hk] ?? null, a = fuel[load] || [];
    if (c != null && a.length && !a.some((v) => same(v, c))) {
      const other = Object.entries(fuel).find(([k, vs]) => k !== load && vs.some((v) => same(v, c)));
      out.push({ field: hk, level: "lech", code: c, analysis: a, why: other ? `code lấy số của mức ${other[0] === "null" ? "không ghi tải" : other[0] + "% tải"} làm mức ${load}% tải` : `Phân tích ghi ${a.join(" / ")} L/h ở ${load}% tải` });
    } else if (c != null && !a.length && anyFuel.length && !anyFuel.some((v) => same(v, c))) {
      out.push({ field: hk, level: "lech", code: c, analysis: anyFuel, why: `Phân tích không có số ${c} L/h nào (có: ${anyFuel.join(" / ")})` });
    } else if (c != null && !a.length) {
      const other = Object.entries(fuel).find(([, vs]) => vs.some((v) => same(v, c)));
      if (other && other[0] !== "null") out.push({ field: hk, level: "lech", code: c, analysis: other[1], why: `code lấy số của mức ${other[0]}% tải làm mức ${load}% tải` });
    } else if (c == null && a.length === 1) out.push({ field: hk, level: "thieu", code: null, analysis: a, why: `Phân tích ghi ${a[0]} L/h ở ${load}% tải, code không đọc ra` });
  }
  // Công suất liên tục: chỉ so khi Phân tích ghi đúng một cỡ máy.
  const sets = (result.generatorSets || []).filter((g) => g && (g.primeKva != null || g.primeKw != null));
  const mp = hints.minPrime;
  if (sets.length === 1) {
    const g = sets[0], pairs = [["kVA", g.primeKva], ["kW", g.primeKw]].filter(([u, v]) => v != null && mp?.[u] != null);
    if (pairs.length && !pairs.some(([u, v]) => same(Number(v), mp[u]))) out.push({ field: "minPrime", level: "lech", code: mp, analysis: { primeKva: g.primeKva, primeKw: g.primeKw }, why: "công suất liên tục khác Phân tích" });
    else if (!mp) out.push({ field: "minPrime", level: "thieu", code: null, analysis: { primeKva: g.primeKva, primeKw: g.primeKw }, why: "Phân tích có công suất liên tục, code không đọc ra" });
  }
  const cyl = analysisCyl(specs);
  if (hints.minCyl != null && cyl.length && !cyl.includes(hints.minCyl)) out.push({ field: "minCyl", level: "lech", code: hints.minCyl, analysis: cyl, why: `Phân tích ghi ${cyl.join(" / ")} xi lanh` });
  else if (hints.minCyl == null && cyl.length === 1) out.push({ field: "minCyl", level: "thieu", code: null, analysis: cyl, why: `Phân tích ghi ${cyl[0]} xi lanh, code không đọc ra` });
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; }, has = (k) => process.argv.includes("--" + k);
  const CB = await import("./config-bot.mjs");
  const aFile = arg("analysis", "C:/Projects/GenSet Pro/genbid-work/doc-cache/analysis.json");
  // doc-cache\analysis.json là { docs: { <TBMT>: { u, d: { result, ... } } } }; cũng nhận bản không có lớp "docs".
  const raw = fs.existsSync(aFile) ? JSON.parse(fs.readFileSync(aFile, "utf8")) : {}, cache = raw.docs && typeof raw.docs === "object" ? raw.docs : raw;
  const analysisOf = async (key) => cache[key]?.d?.result || cache[key]?.result || (has("web") ? (await CB.doc("analysis", key).catch(() => null))?.result : null);
  let items = [];
  if (arg("texts")) {
    const dir = arg("texts");
    items = fs.readdirSync(dir).filter((k) => fs.existsSync(path.join(dir, k, "text.txt"))).map((k) => ({ key: k, text: () => fs.readFileSync(path.join(dir, k, "text.txt"), "utf8") }));
  } else if (has("web")) {
    const keys = arg("keys").split(",").map((s) => s.trim()).filter(Boolean);
    if (!keys.length) { console.error("--web cần --keys K1,K2 (đừng đọc cả kho từ web: tốn egress)"); process.exit(2); }
    items = keys.map((k) => ({ key: k, text: async () => (await CB.hsmtTextOf(k)).text }));
  } else { console.error("Dùng: --texts <thư mục> | --web --keys K1,K2  [--analysis f] [--out f]"); process.exit(2); }
  const all = [], count = { goi: 0, coPhanTich: 0, lech: 0, thieu: 0 };
  for (const it of items) {
    count.goi++;
    const result = await analysisOf(it.key);
    if (!result) continue;
    count.coPhanTich++;
    let found;
    try { found = auditHints(CB.hintsOf(await it.text(), ""), result); } catch (e) { console.log(`${it.key}: lỗi ${e.message}`); continue; }
    for (const f of found) { count[f.level]++; all.push({ key: it.key, ...f }); }
  }
  for (const lv of ["lech", "thieu"]) {
    const list = all.filter((f) => f.level === lv);
    console.log(`\n${lv === "lech" ? "LỆCH (xem tay)" : "THIẾU (code không đọc ra)"}: ${list.length}`);
    for (const f of lv === "lech" ? list : list.slice(0, 40)) console.log(`  ${f.key} ${f.field}: code ${JSON.stringify(f.code)} | phân tích ${JSON.stringify(f.analysis)} — ${f.why}`);
    if (lv === "thieu" && list.length > 40) console.log(`  … còn ${list.length - 40} dòng (xem --out)`);
  }
  console.log(`\nSUMMARY: ${count.goi} gói, ${count.coPhanTich} có Phân tích; lệch ${count.lech}, thiếu ${count.thieu}; gói có lệch: ${new Set(all.filter((f) => f.level === "lech").map((f) => f.key)).size}`);
  if (arg("out")) fs.writeFileSync(arg("out"), JSON.stringify({ at: new Date().toISOString(), count, findings: all }, null, 1));
}
