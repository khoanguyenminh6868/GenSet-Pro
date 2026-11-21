// Trước khi code: tiêu hao tờ hãng động cơ ở bước chọn ứng viên ảnh hưởng bao nhiêu. Chỉ đọc, chỉ in số (không chữ HSMT).
// node do-pham-vi.mjs <worktree> <bidhist.json> <gop-nhanh.json.gz>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const [WT, BH, GOP] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href), CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice, J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CN = path.join(WT, "suppliers", "cn"), sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete"), full = CAT.build(sups), facts = B.modelFacts(full, sups);
const LOADS = [["fuel_consumption", "fuel", "maxFuel"], ["fuel_consumption_75", "fuel75", "maxFuel75"], ["fuel_consumption_50", "fuel50", "maxFuel50"]];
// Số tờ hãng đúng theo fuelChecks: gọi chính hàm đó với yêu cầu giả, đọc số ở `offered`.
const sheetOf = (ef) => { const out = {}; for (const [code, key] of LOADS) { const c = { checks: [], engine: {} }; B.fuelChecks(c, [{ code, item: key, requirement: "≤ 999 L/h", quote: "" }], { specs: [] }, ef); const x = c.checks.find((y) => y.rule === "to-hang-tieu-hao"); if (x) out[key] = { v: parseFloat(x.offered), s: x.factSrc?.supplierId, n: x.factSrc?.n }; } return out; };
const SH = new Map(); for (const e of full.engines) { const s = sheetOf(facts.get(`engine:${e.key}`) || []); if (Object.keys(s).length) SH.set(e.key, { e, s }); }
const mk = new Map(); for (const { e } of SH.values()) mk.set(e.make || "?", (mk.get(e.make || "?") || 0) + 1);
console.log("Động cơ có số tiêu hao tờ hãng:", SH.size, "/", full.engines.length, JSON.stringify([...mk].sort((a, b) => b[1] - a[1])));
const LH = /l\s*\/\s*h|l\/hr|lph|l[íi]t\s*\/\s*(gi[ờo]|h)|litres?\s*\/\s*h/i, ownNum = (u, key) => { const x = (u.specs || []).filter((y) => y.key === key && LH.test(`${y.label} ${y.value} ${y.unitCell || ""}`)).map((y) => B.fuelAt(y, { fuel: 100, fuel75: 75, fuel50: 50 }[key])).filter((v) => v != null); return x.length ? x[0] : null; };
// Dòng NCC ghi số khác tờ hãng.
let cmp = 0, same5 = 0, over5 = 0, under5 = 0; const far = new Map();
for (const { e, s } of SH.values()) for (const u of e.uses || []) { if (s.fuel && u.supplierId === s.fuel.s) continue; for (const k of ["fuel", "fuel75", "fuel50"]) { const a = ownNum(u, k); if (a == null || !s[k]) continue; cmp++; const r = a / s[k].v; if (Math.abs(r - 1) <= 0.05) same5++; else { if (r > 1) over5++; else under5++; const m = `${e.model} ${u.supplierId}`; far.set(m, Math.max(far.get(m) || 0, Math.abs(r - 1))); } } }
console.log(`Dòng NCC ghi L/h cùng mức tải, so với tờ hãng: ${cmp} số | lệch ≤ 5%: ${same5} | NCC cao hơn > 5%: ${over5} | NCC thấp hơn > 5%: ${under5} | cặp model-NCC lệch: ${far.size}`);
console.log("Lệch nhiều nhất:", [...far].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join("; "));
const G = JSON.parse(zlib.gunzipSync(fs.readFileSync(GOP))), hist = Object.values(J(BH).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const useBy = new Map(); for (const e of full.engines) for (const u of e.uses || []) { const k = `${u.supplierId}|${e.key}`, o = useBy.get(k) || { has: { fuel: false, fuel75: false, fuel50: false } }; for (const f of Object.keys(o.has)) if (ownNum(u, f) != null) o.has[f] = true; useBy.set(k, o); }
let runs = 0, rows = 0, withSheet = 0, wouldPass = 0, wouldOver = 0, top = 0, topOver = 0; const overRun = new Set(), byE = new Map();
for (const d of hist) {
  const text = d.config.text, kv = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kv, d.bidName], d.bidName), rs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ sizing: { size: s, sizes: found } })) : [{ sizing: null }];
  rs.forEach((r, ri) => {
    const run = `${d.notifyNo}#${ri}`, g = G[run]; if (!g?.all) return; const h = B.hintsOf(text, "", r.sizing); if (![h.maxFuel, h.maxFuel75, h.maxFuel50].some((x) => x != null)) return; runs++;
    const tops = new Set(g.top.map((k) => { const p = k.split("|"); return `${p[0]}|${p[1]}`; })), seen = new Set();
    for (const [k] of g.all) { const p = k.split("|"), id = `${p[0]}|${p[1]}`; if (seen.has(id)) continue; seen.add(id); rows++; const sh = SH.get(p[1]); if (!sh) continue; const own = useBy.get(id)?.has || {}; let any = false, over = false; for (const [, f, hk] of LOADS) { if (h[hk] == null || own[f] || !sh.s[f]) continue; any = true; if (sh.s[f].v > h[hk]) over = true; } if (!any) continue; withSheet++; if (over) { wouldOver++; overRun.add(run); byE.set(sh.e.model, (byE.get(sh.e.model) || 0) + 1); if (tops.has(id)) topOver++; } else wouldPass++; if (tops.has(id)) top++; }
  });
}
console.log(`Lượt có ngưỡng tiêu hao: ${runs} | cặp NCC-động cơ trong all: ${rows} | không tự ghi số mà có tờ hãng: ${withSheet} (trong top 30: ${top})`);
console.log(`  theo tờ hãng đạt mọi mức: ${wouldPass} | vượt ít nhất một mức: ${wouldOver} (trong top 30: ${topOver}), ở ${overRun.size} lượt`);
console.log("  Động cơ vượt nhiều nhất:", JSON.stringify([...byE].sort((a, b) => b[1] - a[1]).slice(0, 15)));
