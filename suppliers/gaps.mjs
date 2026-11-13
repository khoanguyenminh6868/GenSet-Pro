// Việc cần thu thập (2026-11-10): thông số nào thiếu trong danh mục đang làm Gợi ý cấu hình ra "chưa rõ" nhiều nhất, và
// nên tìm ở hãng nào trước. Điểm của một mục = số gói thầu cần nó × phần danh mục chưa có nó, nên việc tìm thông số đi
// theo nhu cầu thật của các gói thay vì cào dàn trải.
//
//   node suppliers/gaps.mjs                 in báo cáo (đọc bidhist / configmatch / specmatch qua API của bot)
//   node suppliers/gaps.mjs --post          đăng gaps/current lên web (màn Nhà cung cấp hiện mục "Việc cần thu thập")
//   node suppliers/gaps.mjs --queue 3       gửi yêu cầu Tìm Thông Số (specreq) cho 3 hãng đứng đầu chưa tìm trong 8 tuần
//   --bidhist <tệp> --configmatch <tệp>     đọc từ tệp thay vì API (doc-cache của bot, hoặc để thử); --json <tệp> ghi báo cáo ra tệp
// Với SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (workflow supplier-gaps.yml chạy hằng tuần) thì đọc và ghi thẳng bảng docs.
//
// Cách tính (gapReport):
// - Nhu cầu: mỗi gói mua sắm máy phát đã có chữ Chương V (bidhist.config.text) → các mã yêu cầu (reqcodes.mjs codesIn)
//   mà HSMT nêu, theo dải công suất của gói.
// - Độ phủ: với mỗi dải công suất, các model động cơ của danh mục có dòng tổ máy trong dải; một model "có" một thông số
//   khi bảng / datasheet của nó (config-bot.mjs modelFacts), đầu phát đi cùng, hoặc chính dòng tổ máy ghi thông số đó.
// - Mục thiếu = (mã yêu cầu, dải): điểm = số gói trong dải nêu mã đó × tỉ lệ model chưa có thông số.
// - Hãng nên tìm: mỗi model thiếu chia điểm của mục cho hãng làm ra bộ phận đó (động cơ → hãng động cơ, đầu phát → hãng
//   đầu phát, thông số cả tổ máy → nhà cung cấp của dòng bảng).
// - Mã yêu cầu không có cột nào trong bảng thông số (quá tải, nhận tải một bước, ISO 8528, chức năng bộ điều khiển…):
//   chỉ đếm nhu cầu, vì phải đọc từ datasheet / brochure chứ không tìm được trong bảng.
// - "Chưa rõ" thật ở các lượt Gợi ý cấu hình đã chạy (configmatch) được đếm riêng để đối chiếu.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { skippedOf, dropSkipped, UNFILTERED_WARNING } from "./sup-skip.mjs";
import { specNone } from "./spec-todo.mjs";
import { REQ_CODES,CODE_BY, codesIn, codeOf, clausesOf } from "./reqcodes.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "bidprice.js")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;

// Mã yêu cầu → khoá thông số của danh mục (web/catalog.js SPEC). Mã không có ở đây không tìm được trong bảng thông số.
export const CODE_KEY = {
  fuel_consumption_75: "fuel75", fuel_consumption_50: "fuel50", fuel_consumption: "fuel", fuel_tank: "tank", noise: "noise", dimensions: "dims", weight: "weight",
  bore_stroke: "bore", displacement: "disp", cylinders: "cyl", compression: "compr", aspiration: "asp", governor: "gov", emission: "emission", coolant_capacity: "coolant",
  cooling: "cooling", oil_capacity: "oil", starting: "start", engine_power: "engPower", speed: "speed", engine_type: "engType",
  alt_efficiency: "eff", alt_insulation: "insul", alt_ip: "ip", alt_avr: "excit", alt_thd: "thd", alt_vreg: "vreg", freq_regulation: "freg",
  current: "current", voltage: "voltage", power_factor: "pf", phases: "phase",
};
// Mã chỉ nói gói cần gì (công suất, hãng, model, xuất xứ…), không phải một thông số để đi tìm.
const NOT_A_FIELD = new Set(["power_prime", "power_standby", "genset_make", "genset_model", "genset_origin", "engine_make", "engine_model", "engine_origin", "alt_make", "alt_model", "alt_origin", "alt_power",
  "ctl_make", "ctl_model", "ctl_origin", "brand_sync", "frequency", "fuel", "genset_type", "breaker", "canopy", "battery", "exhaust"]);
export const BANDS = [[0, 30, "dưới 30 kVA"], [30, 100, "30–100 kVA"], [100, 300, "100–300 kVA"], [300, 700, "300–700 kVA"], [700, 1500, "700–1.500 kVA"], [1500, Infinity, "từ 1.500 kVA"]];
const bandOf = (k) => BANDS.findIndex(([a, b]) => k >= a && k < b);
const kvasOf = (u) => Object.values(u.power || {}).map((p) => p.kVA ?? (p.kW != null ? p.kW / 0.8 : null)).filter((v) => v > 0);
const ROLE_OF_PART = { engine: "engine_maker", alternator: "alternator_maker" };
export const QUEUE_GAP_DAYS = 56;

// Mã yêu cầu một HSMT nêu: từng dòng / mệnh đề của chữ Chương V.
export function codesOfText(text) {
  const out = new Set();
  for (const cl of clausesOf(text)) for (const c of codesIn(cl)) out.add(c.code);
  return out;
}
export function demandOf(docs) {
  const bands = BANDS.map(() => ({ tenders: 0, codes: new Map() })), noPower = { tenders: 0 };
  let n = 0;
  for (const d of Object.values(docs || {})) {
    if (!BP.isGensetName(d.bidName) || BP.bidKind(d.bidName) !== "supply" || !d.config?.text) continue;
    const multi = (d.lots || []).length > 1, K = BP.kvaOf(d.bidName) || BP.cfgPower(d, multi)?.kva || null;
    if (!K) { noPower.tenders++; continue; }
    const b = bands[bandOf(K)];
    n++; b.tenders++;
    for (const c of codesOfText(d.config.text)) b.codes.set(c, (b.codes.get(c) || 0) + 1);
  }
  return { n, bands, noPower: noPower.tenders };
}
// Model động cơ của danh mục theo dải công suất, với các khoá thông số đã có ở model, ở đầu phát đi cùng và ở dòng tổ máy.
export function coverageOf(cat, facts) {
  const altMake = new Map((cat.alternators || []).map((a) => [a.key, a.make || ""])), keysOf = (k) => new Set((facts.get(k) || []).map((f) => f.key));
  const bands = BANDS.map(() => []);
  for (const e of cat.engines || []) {
    const ek = keysOf(`engine:${e.key}`), per = new Map();
    for (const u of e.uses || []) {
      const bs = new Set(kvasOf(u).map(bandOf).filter((i) => i >= 0));
      for (const i of bs) {
        const x = per.get(i) || { key: e.key, model: e.model, make: e.make || "", keys: new Set(ek), alts: new Set(), suppliers: new Set() };
        for (const s of u.specs || []) x.keys.add(s.key);
        if (u.other) { const ak = CAT.keyOf(u.other); for (const k of keysOf(`alternator:${ak}`)) x.keys.add(k); if (altMake.get(ak)) x.alts.add(altMake.get(ak)); }
        if (u.supplierId) x.suppliers.add(u.supplierId);
        per.set(i, x);
      }
    }
    for (const [i, x] of per) bands[i].push(x);
  }
  return bands;
}
// suppliers: bản ghi nhà cung cấp; specs: { <supplierId>: thời điểm Tìm Thông Số gần nhất (ISO) }.
// none: NCC đã tìm thông số mà không ra (spec-none.json, spec-todo.mjs): không vào hàng chờ Tìm Thông Số.
export function gapReport({ docs, suppliers, modelFacts, configmatch = [], specs = {}, none = {}, now = new Date(), cat = CAT.build(suppliers) }) {
  const facts = modelFacts(cat, suppliers), dem = demandOf(docs), cov = coverageOf(cat, facts);
  const fields = [], noKey = new Map(), targets = new Map();
  const target = (kind, name) => { const id = `${kind}:${name}`; if (!targets.has(id)) targets.set(id, { kind, name, score: 0, missing: new Map() }); return targets.get(id); };
  BANDS.forEach(([, , label], i) => {
    const b = dem.bands[i], models = cov[i];
    for (const [code, demand] of b.codes) {
      const def = CODE_BY.get(code), key = CODE_KEY[code];
      if (!def || NOT_A_FIELD.has(code)) continue;
      if (!key) { const x = noKey.get(code) || { code, item: def.item, part: def.part, demand: 0 }; x.demand += demand; noKey.set(code, x); continue; }
      if (!models.length) { fields.push({ code, item: def.item, part: def.part, key, band: label, demand, have: 0, total: 0, fill: 0, score: demand }); continue; }
      const lacking = models.filter((m) => !m.keys.has(key)), fill = 1 - lacking.length / models.length, score = demand * (1 - fill);
      fields.push({ code, item: def.item, part: def.part, key, band: label, demand, have: models.length - lacking.length, total: models.length, fill, score });
      const share = demand / models.length, scope = CAT.SPEC[key]?.scope;
      for (const m of lacking) {
        const names = scope === "engine" ? m.make.split(" / ").filter(Boolean).map((x) => ["engine", x]) : scope === "alternator" ? [...m.alts].flatMap((a) => a.split(" / ")).filter(Boolean).map((x) => ["alternator", x]) : [...m.suppliers].map((x) => ["supplier", x]);
        for (const [kind, name] of names) { const t = target(kind, name); t.score += share / names.length; t.missing.set(def.item, (t.missing.get(def.item) || 0) + 1); }
      }
    }
  });
  fields.sort((a, b) => b.score - a.score);
  // Hãng → bản ghi của chính hãng đó (vai trò hãng động cơ / đầu phát có thương hiệu ấy); nhà cung cấp → chính nó.
  const byId = new Map(suppliers.map((s) => [s.id, s])), brandOf = (s) => [...(s.names?.brands || []), s.names?.en || ""].join(" | ");
  // The make's own record first (its English name begins with the make: "Cummins Inc.", whatever its role), then the
  // makers of that part that carry the brand (a joint venture: DCEC for Cummins), the one with more tables first.
  const word = (name) => new RegExp(`(^|[^\\p{L}\\p{N}])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`, "iu");
  const own = (s, name) => s.role !== "distributor" && String(s.names?.en || "").trim().toLowerCase().startsWith(name.toLowerCase());
  const recsOf = (kind, name) => (kind === "supplier" ? (byId.has(name) ? [name] : [])
    : suppliers.filter((s) => own(s, name) || (s.role === ROLE_OF_PART[kind] && word(name).test(brandOf(s))))
      .sort((a, b) => Number(own(b, name)) - Number(own(a, name)) || (b.specTables || []).length - (a.specTables || []).length).map((s) => s.id));
  const list = [...targets.values()].map((t) => {
    const ids = recsOf(t.kind, t.name), last = ids.map((id) => specs[id]).filter(Boolean).sort().pop() || null;
    return { kind: t.kind, name: t.kind === "supplier" ? byId.get(t.name)?.names?.en || byId.get(t.name)?.names?.zh || t.name : t.name, score: Math.round(t.score * 10) / 10, supplierIds: ids, lastSpecAt: last,
      missing: [...t.missing.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([item, models]) => ({ item, models })) };
  }).sort((a, b) => b.score - a.score);
  // "Chưa rõ" thật ở các lượt Gợi ý đã chạy: theo mã yêu cầu, trên mọi cấu hình của mọi cỡ.
  const unclear = new Map();
  for (const m of configmatch) {
    const r = m?.result || m?.data?.result; if (!r) continue;
    for (const res of r.sizes ? r.sizes.map((z) => z.result).filter(Boolean) : [r]) for (const c of res.configs || []) for (const x of c.checks || []) {
      const code = x.code || codeOf(x), def = CODE_BY.get(code), u = unclear.get(code) || { code, item: def?.item || x.item || code, part: def?.part || x.part || "", unclear: 0, total: 0 };
      u.total++; if (x.status !== "met" && x.status !== "not_met" && x.status !== "confirm") u.unclear++; // confirm: chọn khi đặt hàng / chứng từ, không phải thiếu thông số
      unclear.set(code, u);
    }
  }
  const stale = (t) => !t.lastSpecAt || now - new Date(t.lastSpecAt) > QUEUE_GAP_DAYS * 864e5;
  return {
    at: now.toISOString(), tenders: dem.n, noPower: dem.noPower, engines: cat.engines.length, alternators: cat.alternators.length,
    bands: BANDS.map(([, , label], i) => ({ label, tenders: dem.bands[i].tenders, models: cov[i].length })),
    fields: fields.filter((f) => f.score >= 1).slice(0, 40).map((f) => ({ ...f, fill: Math.round(f.fill * 100) / 100, score: Math.round(f.score * 10) / 10 })),
    noKey: [...noKey.values()].sort((a, b) => b.demand - a.demand).slice(0, 20),
    targets: list.slice(0, 30),
    queue: list.map((t) => ({ ...t, ask: t.supplierIds.filter((id) => !none[id]) })).filter((t) => t.ask.length && stale(t)).slice(0, 10).map((t) => ({ name: t.name, kind: t.kind, supplierId: t.ask[0], score: t.score })),
    unclear: [...unclear.values()].filter((u) => u.unclear).sort((a, b) => b.unclear - a.unclear).slice(0, 20),
  };
}
export function reportText(r) {
  const pct = (x) => Math.round(100 * x) + "%", L = [];
  L.push(`Việc cần thu thập (${r.at.slice(0, 10)}): ${r.tenders} gói mua sắm máy phát có Chương V và công suất (${r.noPower} gói chưa rõ công suất không tính); danh mục ${r.engines} động cơ, ${r.alternators} đầu phát.`);
  L.push("", "Dải công suất: " + r.bands.map((b) => `${b.label}: ${b.tenders} gói / ${b.models} model động cơ`).join("; "));
  L.push("", "THÔNG SỐ THIẾU NHIỀU NHẤT (điểm = số gói nêu × phần model chưa có):");
  for (const f of r.fields.slice(0, 25)) L.push(`  ${String(f.score).padStart(6)}  ${f.item} · ${f.band}: ${f.demand} gói nêu, ${f.have}/${f.total} model có (${pct(f.fill)})`);
  L.push("", "YÊU CẦU HAY GẶP MÀ BẢNG THÔNG SỐ KHÔNG CÓ CỘT (phải đọc datasheet / brochure):");
  for (const x of r.noKey.slice(0, 12)) L.push(`  ${String(x.demand).padStart(6)} gói  ${x.item}`);
  L.push("", "NÊN TÌM Ở ĐÂU TRƯỚC:");
  for (const t of r.targets.slice(0, 20)) L.push(`  ${String(t.score).padStart(6)}  ${t.kind === "engine" ? "hãng động cơ" : t.kind === "alternator" ? "hãng đầu phát" : "nhà cung cấp"} ${t.name}${t.supplierIds.length ? ` [${t.supplierIds.join(", ")}]` : " [chưa có bản ghi hãng]"}${t.lastSpecAt ? ` · đã tìm ${t.lastSpecAt.slice(0, 10)}` : ""} · thiếu: ${t.missing.map((m) => `${m.item} (${m.models})`).join(", ")}`);
  if (r.unclear.length) { L.push("", "CHƯA RÕ Ở CÁC LƯỢT GỢI Ý CẤU HÌNH ĐÃ CHẠY:"); for (const u of r.unclear.slice(0, 15)) L.push(`  ${String(u.unclear).padStart(4)}/${u.total}  ${u.item}`); }
  L.push("", "Hàng chờ Tìm Thông Số: " + (r.queue.map((q) => `${q.name} (${q.supplierId})`).join("; ") || "không có"));
  return L.join("\n");
}

// ---------- đọc / ghi ----------
const SB = process.env.SUPABASE_URL, SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sbHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
// Mọi tài liệu của một collection từ bảng docs, theo trang, luôn có order (thiếu thì mất dòng).
async function sbDocs(coll, select = "id,data") {
  const out = [];
  for (let from = 0; ; from += 500) {
    const r = await fetch(`${SB}/rest/v1/docs?select=${select}&coll=eq.${coll}&order=id.asc&offset=${from}&limit=500`, { headers: sbHeaders });
    if (!r.ok) throw new Error(`${coll}: HTTP ${r.status}`);
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < 500) return out;
  }
}
async function sbPost(rows) {
  const now = new Date().toISOString();
  const r = await fetch(`${SB}/rest/v1/docs`, { method: "POST", headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows.map((x) => ({ coll: x.coll, id: x.id, data: x.data, updated_at: now }))) });
  if (!r.ok) throw new Error(`ghi docs: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
}
async function main() {
  const arg = (n) => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; }, has = (n) => process.argv.includes("--" + n);
  const bot = await import("./config-bot.mjs");
  const fromFile = (f) => { const j = JSON.parse(fs.readFileSync(f, "utf8")); return j.docs ? Object.entries(j.docs).map(([id, v]) => ({ id, data: v.d })) : j; };
  const read = async (coll, file) => (file ? fromFile(file) : SB && SERVICE ? await sbDocs(coll) : coll === "bidhist" ? await bot.allDocs(coll) : await bot.api(`kind=docs&coll=${coll}`));
  const all = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8"))).filter((s) => s.status !== "incomplete");
  // NCC loại trừ / xoá mềm trên web không vào báo cáo và không nhận specreq. Không đọc được danh sách → báo cáo vẫn ra
  // nhưng có cảnh báo và KHÔNG gửi specreq lượt này (điều phối 2026-11-12). --skipfile {supexcl:[..],supdeleted:[..]} để thử.
  const skip = await skippedOf((coll) => (arg("skipfile") ? JSON.parse(fs.readFileSync(arg("skipfile"), "utf8"))[coll] : SB && SERVICE ? sbDocs(coll) : bot.allDocs(coll)));
  const suppliers = dropSkipped(all, skip.ids);
  const [hist, cms, sms, sreq] = await Promise.all([read("bidhist", arg("bidhist")), read("configmatch", arg("configmatch")).catch(() => []), read("specmatch").catch(() => []), read("specreq").catch(() => [])]);
  const docs = Object.fromEntries(hist.map((d) => [d.id, d.data]));
  // Một hãng coi như vừa tìm khi có kết quả (specmatch.at) hoặc đang có yêu cầu chờ (specreq chưa doneAt).
  const specs = {};
  for (const d of sms) if (d.data?.at) specs[d.id] = d.data.at;
  for (const d of sreq) if (d.data?.requestedAt && !(d.data.doneAt >= d.data.requestedAt)) specs[d.id] = d.data.requestedAt;
  const report = gapReport({ docs, suppliers, modelFacts: bot.modelFacts, configmatch: cms.map((d) => d.data), specs, none: specNone() });
  if (!skip.ok) report.warning = UNFILTERED_WARNING;
  console.log((skip.ok ? "" : `CẢNH BÁO: ${UNFILTERED_WARNING} (không đọc được supexcl/supdeleted); không gửi specreq lượt này.\n`) + reportText(report));
  const rows = [];
  if (has("post")) rows.push({ coll: "gaps", id: "current", data: report });
  const n = skip.ok ? Number(arg("queue") || 0) : 0;
  if (n > 0) {
    const at = new Date().toISOString(), picked = report.queue.slice(0, n);
    for (const q of picked) rows.push({ coll: "specreq", id: q.supplierId, data: { spec: true, requestedAt: at, by: "Việc cần thu thập (hằng tuần)", from: "gaps" } });
    console.log(`\nGửi Tìm Thông Số: ${picked.map((q) => q.supplierId).join(", ") || "không có hãng nào đủ điều kiện"}`);
    report.queued = picked.map((q) => ({ ...q, at }));
  }
  if (arg("json")) fs.writeFileSync(arg("json"), JSON.stringify(report), "utf8");
  if (!rows.length) return;
  if (SB && SERVICE) await sbPost(rows); else await bot.post(rows);
  console.log(`Đã ghi ${rows.map((r) => `${r.coll}/${r.id}`).join(", ")}`);
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main().catch((e) => { console.error(e.message || e); process.exit(1); });
