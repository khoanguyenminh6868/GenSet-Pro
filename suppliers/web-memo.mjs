// Gợi ý cấu hình — "tra một lần, dùng lại cho mọi gói" (Khoa duyệt 2026-11-12, phương án B của điều phối).
//
// Kết quả DƯƠNG đã có đường riêng: newCatalog.json → addToCatalog → verify.mjs → PR → suppliers/cn/<id>.json, mọi gói
// đọc qua modelFacts / candidates. Ở đây chỉ thêm cờ `official` (trang thuộc tên miền chính thức của hãng), do code tính,
// để in ra catalog.md và CLI; chưa đổi cách modelFacts / makerSheetChecks cân nguồn.
//
// Kết quả ÂM: agent khai trong result.json `searched: [{ part, model, what, where: [url | câu tìm], outcome }]`; code chỉ
// ghi một mục khi MỌI `where` có trong dấu vết log stream-json của chính lượt đó (traceOf) và model là model của lượt.
// Kho ở genbid-work/web-memo/negative.json (ngoài git, ≤ NEG_MAX mục, ≤ NEG_BYTES), mỗi mục hết hạn sau NEG_DAYS ngày.
// Kho mất chỉ tốn tiền tra lại, không sai dữ liệu.
//
//   node suppliers/web-memo.mjs --list [--json]        liệt kê kho âm + đếm nguồn chính thức / không chính thức (chỉ đọc)
//   node suppliers/web-memo.mjs --forget <model>       xoá các mục âm của model đó (so khoá CAT.keyOf)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
await import(pathToFileURL(path.join(ROOT, "..", "web", "bidprice.js")).href);
const BP = globalThis.GenbidBidprice;

export const NEG_DAYS = 90, NEG_MAX = 2000, NEG_BYTES = 1 << 20;
export const PARTS = ["engine", "alternator", "controller", "genset"];
export const OUTCOMES = ["not_found", "blocked"];
const TOKEN_FILE = process.env.GENBID_INGEST_TOKEN_FILE || "C:/Projects/GenSet Pro/.genbid-ingest-token";
export const WEB_MEMO = process.env.GENBID_WEB_MEMO || path.join(path.dirname(TOKEN_FILE), "genbid-work", "web-memo");
const keyOf = (m) => CAT.keyOf(String(m || ""));

// ---------- tên miền chính thức ----------
const hostOf = (u) => { try { return new URL(String(u)).hostname.toLowerCase().replace(/\.$/, ""); } catch { return ""; } };
// The registrable domain: powersystems.rehlko.com → rehlko.com, en.weichaipower.com → weichaipower.com,
// hd-hhi.com, www.isuzu.co.jp → isuzu.co.jp, www.dcec.com.cn → dcec.com.cn.
export function domainOf(u) {
  const h = /^[a-z]+:\/\//i.test(String(u)) ? hostOf(u) : String(u || "").toLowerCase().replace(/^www\./, "");
  const p = h.split(".").filter(Boolean);
  if (p.length < 2) return h;
  const sld = p.length >= 3 && p[p.length - 1].length === 2 && /^(co|com|net|org|gov|ac|edu|or|ne|go)$/.test(p[p.length - 2]);
  return p.slice(sld ? -3 : -2).join(".");
}
const MAKER_ROLES = new Set(["engine_maker", "alternator_maker", "controller_maker", "genset_oem"]);
// The maker family of a record (web/bidprice.js familyOf of its names, brands, id); null for most Chinese makers.
export const familyOfRec = (r) => BP.familyOf(r?.names?.en, ...(r?.brands || r?.names?.brands || []), r?.id) || null;
// The official domains of a make: the website of every maker record of that family, and the hosts of their tier A
// sources (a maker's second site: origin-sea.rehlko.com). A record with no family (a Chinese maker): its own only.
export function officialDomains(rec, suppliers = []) {
  const fam = familyOfRec(rec);
  const recs = fam ? suppliers.filter((s) => MAKER_ROLES.has(s?.role) && familyOfRec(s) === fam) : [];
  if (rec && !recs.includes(rec)) recs.push(rec);
  const out = new Set();
  for (const r of recs) {
    if (r.website) out.add(domainOf(r.website));
    if (MAKER_ROLES.has(r.role)) for (const s of r.sources || []) if (s.tier === "A" && s.url && domainOf(s.url) === domainOf(r.website || "")) out.add(domainOf(s.url));
  }
  out.delete("");
  return out;
}
// A page is official for a record when its domain is one of the record's make's (above). A reseller, a CDN
// (cdn.shopify.com), a distributor or another maker hosting the sheet is not.
export const isOfficial = (url, rec, suppliers = []) => !!hostOf(url) && officialDomains(rec, suppliers).has(domainOf(url));
// The make's official page for a part of a configuration (the make the agent wrote, read through familyOf).
export function officialForMake(url, make, suppliers = []) {
  const fam = BP.familyOf(make);
  if (!fam || !hostOf(url)) return false;
  const rec = suppliers.find((s) => MAKER_ROLES.has(s?.role) && familyOfRec(s) === fam);
  return !!rec && isOfficial(url, rec, suppliers);
}
// The flag of each source of each record, for catalog.md and the CLI (computed, never trusted from the record).
export function officialOfSource(suppliers = []) {
  const out = new Map();
  for (const r of suppliers) for (const s of r.sources || []) out.set(`${r.id}#${s.n}`, isOfficial(s.url, r, suppliers));
  return out;
}

// ---------- dấu vết lượt chạy ----------
const URL_RE = /https?:\/\/[^\s"'<>|;)`\\]+/g;
const cleanUrl = (u) => String(u || "").trim().replace(/[.,]+$/, "").replace(/\/$/, "");
const cleanQuery = (q) => String(q || "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
// A shell loop "for s in 0525 0226; do … d440-$s.pdf …" names one URL per value.
function urlsOfCommand(cmd) {
  const loops = [...cmd.matchAll(/for\s+(\w+)\s+in\s+([^;]+?)\s*;\s*do/g)].map((m) => [m[1], m[2].trim().split(/\s+/).map((v) => v.replace(/^["']|["']$/g, ""))]);
  const out = [];
  for (const raw of cmd.match(URL_RE) || []) {
    const u = raw.replace(/["']+$/, "");
    const loop = loops.find(([v]) => new RegExp(`\\$\\{?${v}\\b\\}?`).test(u));
    if (loop) for (const val of loop[1]) out.push({ url: cleanUrl(u.replace(new RegExp(`\\$\\{?${loop[0]}\\b\\}?`, "g"), val)), token: val });
    else if (!/\$/.test(u)) out.push({ url: cleanUrl(u), token: null });
  }
  return out;
}
const DENIED = /permission for this action was denied|was blocked|denied by the claude code/i;
// Reads a run's log (config-bot.mjs writes the agent's stream-json, each line stamped "[Ns] "). Returns what the agent
// really did on the web: its search queries, and each URL it fetched with the HTTP status the tool printed (null when
// none was printed) and the saved file (save). A call the permission check refused is not a fetch.
export function traceOf(logText) {
  const uses = new Map(), searches = new Set(), fetched = new Map();
  const put = (url, info) => { const old = fetched.get(url) || { status: null, saved: null }; fetched.set(url, { status: info.status ?? old.status, saved: info.saved ?? old.saved }); };
  for (const l of String(logText || "").split("\n")) {
    const m = l.match(/^(?:\[\d+s\]\s*)?(\{.*\})\s*$/);
    if (!m) continue;
    let j; try { j = JSON.parse(m[1]); } catch { continue; }
    for (const c of Array.isArray(j?.message?.content) ? j.message.content : []) {
      if (c.type === "tool_use") uses.set(c.id, c);
      if (c.type !== "tool_result" || !uses.has(c.tool_use_id)) continue;
      const u = uses.get(c.tool_use_id), out = typeof c.content === "string" ? c.content : (c.content || []).map((x) => x?.text || "").join("\n");
      if (c.is_error && DENIED.test(out)) continue;
      if (u.name === "WebSearch" && u.input?.query) searches.add(cleanQuery(u.input.query));
      else if (u.name === "WebFetch" && u.input?.url) put(cleanUrl(u.input.url), { status: c.is_error ? Number((out.match(/\b(4\d\d|5\d\d)\b/) || [])[1]) || null : 200 });
      else if (u.name === "Bash" && typeof u.input?.command === "string") {
        const cmd = u.input.command, urls = urlsOfCommand(cmd), lines = out.split("\n").map((x) => x.trim());
        const isSave = /config-bot\.mjs["']?\s+save\b/.test(cmd);
        for (const { url, token } of urls) {
          let status = null, saved = null;
          if (isSave) { saved = (out.match(/\bweb\/\d+\.txt\b/) || [])[0] || null; status = saved ? 200 : Number((out.match(/HTTP (\d{3})/) || [])[1]) || null; }
          else if (token) status = Number((lines.find((x) => new RegExp(`^${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(\\d{3})$`).test(x)) || "").split(/\s+/).pop()) || null;
          else if (urls.length === 1) status = Number((lines.find((x) => /^\d{3}$/.test(x)) || "")) || null;
          put(url, { status, saved });
        }
      }
    }
  }
  return { searches, fetched };
}
const isUrl = (w) => /^https?:\/\//i.test(String(w || "").trim());
// Where a `where` of the agent is in the trace: a URL it fetched, or a query it searched.
export const inTrace = (w, trace) => (isUrl(w) ? trace.fetched.has(cleanUrl(w)) : trace.searches.has(cleanQuery(w)));

// ---------- kho âm ----------
// "source" depends on the run's origin condition (a find among Chinese suppliers says nothing of the G7): the origin is in the key.
export const negKey = (e) => `${e.part}|${e.modelKey}|${e.what}${e.what === "source" ? `|${e.origin || ""}` : ""}`;
// The model names a text writes (tokens with a letter and a digit, 4+ characters), as CAT.keyOf keys: the models an HSMT names.
export function modelKeysOf(text) {
  const out = new Set();
  const t = String(text || "").normalize("NFC");
  for (const m of t.match(/[A-Za-z0-9][A-Za-z0-9\-_./]{2,}[A-Za-z0-9]/g) || []) if (/[A-Za-z]/.test(m) && /\d/.test(m)) out.add(keyOf(m));
  // A model written with a space before its last part ("DHY110K SE", "QES 30"): its key without the space too
  // (2026-11-12: the HSMT's "DHY110K SE" was refused as "model không phải model của lượt này").
  for (const m of t.matchAll(/(?<![A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9\-_./]{1,}[A-Za-z0-9])\s+([A-Za-z0-9]{1,4})(?![A-Za-z0-9])/g)) {
    const all = `${m[1]}${m[2]}`;
    if (/[A-Za-z]/.test(all) && /\d/.test(all) && /\d/.test(m[1])) out.add(keyOf(all));
  }
  return out;
}
const ORIGIN_VI = { all: "mọi xuất xứ", cn: "nhà cung cấp đặt tại Trung Quốc", g7: "nhóm G7", g20: "nhóm G20", g7eu: "nhóm G7 + EU", g20eu: "nhóm G20 + EU", other: "xuất xứ khác" };
const dayMs = 864e5;
export const isLive = (e, today) => (Date.parse(today) - Date.parse(e.date)) / dayMs < NEG_DAYS;
export function loadNeg(root = WEB_MEMO) {
  try { const j = JSON.parse(fs.readFileSync(path.join(root, "negative.json"), "utf8")); return Array.isArray(j.entries) ? j.entries : []; } catch { return []; }
}
// Newest first, live only, at most NEG_MAX entries and NEG_BYTES; the oldest go first.
export function saveNeg(entries, root = WEB_MEMO, today = new Date().toISOString().slice(0, 10)) {
  let list = entries.filter((e) => isLive(e, today)).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, NEG_MAX);
  let txt = JSON.stringify({ entries: list }, null, 1);
  while (list.length && Buffer.byteLength(txt) > NEG_BYTES) { list = list.slice(0, Math.floor(list.length * 0.9)); txt = JSON.stringify({ entries: list }, null, 1); }
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, "negative.json"), txt + "\n", "utf8");
  return list;
}
// What the agent declared it searched and did not find (result.searched), kept only with proof:
//  - part one of PARTS, outcome one of OUTCOMES, `what` a figure key or "datasheet";
//  - the model one of this run's models (`models`: part → Set of CAT.keyOf), compared key to key, never "near";
//  - every `where` in the run's trace; "blocked" also needs one of its URLs answered 401 / 403 / 429.
// Returns { entries (the new list), added, refused: [why] }.
//  - what "source" = no usable source (the maker's page, a supplier fit for this run's origin) for a model the HSMT names:
//    the model may be one of `hsmtKeys` (modelKeysOf of the HSMT) too; the entry keeps `origin`, only a run of that origin reuses it.
export function recordNegatives(entries, searched, { trace, models, today, tender = "", size = "", suppliers = [], origin = "", hsmtKeys = new Set() }) {
  const out = [...entries], added = [], refused = [];
  for (const s of Array.isArray(searched) ? searched : []) {
    const label = `${s?.part || "?"} ${s?.model || "?"} / ${s?.what || "?"}`;
    const where = (Array.isArray(s?.where) ? s.where : []).map((w) => String(w || "").trim()).filter(Boolean);
    const mk = keyOf(s?.model);
    if (!PARTS.includes(s?.part) || !OUTCOMES.includes(s?.outcome) || !s?.what) { refused.push(`${label}: thiếu part / what / outcome hợp lệ`); continue; }
    const named = s?.what === "source" && hsmtKeys.has(mk);
    if (s?.what === "source" && s.outcome !== "not_found") { refused.push(`${label}: "source" chỉ ghi được với not_found`); continue; }
    if (!mk || !(models?.[s.part]?.has(mk) || named)) { refused.push(`${label}: model không phải model của lượt này (so đúng khoá)`); continue; }
    if (!where.length) { refused.push(`${label}: không ghi đã tìm ở đâu`); continue; }
    const missing = where.filter((w) => !inTrace(w, trace));
    if (missing.length) { refused.push(`${label}: không có dấu vết trong log: ${missing.slice(0, 3).join(" ; ")}`); continue; }
    const urls = where.filter(isUrl).map(cleanUrl), statuses = Object.fromEntries(urls.map((u) => [u, trace.fetched.get(u)?.status ?? null]));
    if (s.outcome === "blocked" && !urls.some((u) => [401, 403, 429].includes(statuses[u]))) { refused.push(`${label}: ghi "blocked" mà log không có mã 401/403/429`); continue; }
    if (s.outcome === "not_found" && urls.some((u) => trace.fetched.get(u)?.saved) && s.what === "datasheet") { refused.push(`${label}: đã lưu được trang ở ${urls.find((u) => trace.fetched.get(u)?.saved)} nên không phải "không có datasheet"`); continue; }
    const hosts = [...new Set(urls.map(domainOf))];
    const e = { part: s.part, model: String(s.model), modelKey: mk, what: String(s.what), outcome: s.outcome, where, statuses, hosts, ...(s.what === "source" ? { origin: String(origin || "all") } : {}),
      official: urls.length ? urls.some((u) => officialForMake(u, s.make || "", suppliers)) : false, date: today, tender, ...(size ? { size } : {}), ...(s.note ? { note: String(s.note).slice(0, 300) } : {}) };
    const i = out.findIndex((x) => negKey(x) === negKey(e));
    if (i >= 0) out.splice(i, 1);
    out.push(e); added.push(e);
  }
  return { entries: out, added, refused };
}
export const forget = (entries, model) => { const k = keyOf(model); return { entries: entries.filter((e) => e.modelKey !== k), removed: entries.filter((e) => e.modelKey === k).length }; };
// The live entries of one model of a part. An entry "datasheet" covers every figure of the model on its hosts.
export const negativesFor = (entries, part, model, today) => entries.filter((e) => e.part === part && e.modelKey === keyOf(model) && isLive(e, today));
const PART_VI = { engine: "Động cơ", alternator: "Đầu phát", controller: "Bộ điều khiển", genset: "Tổ máy" };
export function negLine(e) {
  const all = e.where.map((w) => (isUrl(w) ? `${w}${e.statuses?.[cleanUrl(w)] ? ` (HTTP ${e.statuses[cleanUrl(w)]})` : ""}` : `tìm "${w}"`));
  const where = all.slice(0, 4).join("; ") + (all.length > 4 ? `; và ${all.length - 4} chỗ khác` : "");
  if (e.what === "source") return `- nguồn dùng được (trang hãng / nhà cung cấp đủ điều kiện) của ${e.model}: đã tra ngày ${e.date} với điều kiện ${ORIGIN_VI[e.origin] || e.origin}, không thấy (${where}) — đừng tra lại với cùng điều kiện; điều kiện khác (xuất xứ khác) thì được tra.`;
  const what = e.what === "datasheet" ? `datasheet trên ${e.hosts.length ? e.hosts.join(", ") : "các nguồn đã tìm"} (phủ mọi thông số của model trên ${e.hosts.length > 1 ? "các " : ""}tên miền đó, không phủ tên miền khác)` : e.what;
  return e.outcome === "blocked"
    ? `- ${what}: đã tra ngày ${e.date} — trang hãng chặn tải tự động (${where}). KHÔNG thử lại, không đổi User-Agent, không tìm bản sao để lách.`
    : `- ${what}: đã tra ngày ${e.date}, không tìm thấy (${where}) — đừng tra lại; ghi trạng thái như khi nguồn không ghi.`;
}
// catalog.md: the section of searches already done for the models of this run (models: [{ part, model }]).
export function negativesMd(entries, models, today, { origin = "", hsmtText = "" } = {}) {
  const out = [], seen = new Set(), keys = modelKeysOf(hsmtText);
  // "source" entries of a model the HSMT names, of this run's origin, even when it is not among the candidates.
  models = [...models];
  for (const e of entries) if (e.what === "source" && e.origin === (origin || "all") && keys.has(e.modelKey) && isLive(e, today) && !models.some((m) => m.part === e.part && keyOf(m.model) === e.modelKey)) models.push({ part: e.part, model: e.model });
  for (const { part, model } of models) {
    const k = `${part}|${keyOf(model)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const list = negativesFor(entries, part, model, today).filter((e) => e.what !== "source" || e.origin === (origin || "all"));
    if (list.length) out.push(`### ${PART_VI[part]} ${model}`, ...list.map(negLine), "");
  }
  return out.length ? ["## Đã tra trên mạng ở lượt trước (đừng tra lại)", "",
    `Các mục dưới do code ghi từ dấu vết lượt chạy trước (hết hạn sau ${NEG_DAYS} ngày). Với một mục "không tìm thấy": không tra lại đúng thứ đó ở đúng nơi đó; check vẫn ghi như khi nguồn không ghi (unclear), không tự kết luận đạt / không đạt. Với "chặn tải tự động": không thử lại bằng cách nào.`, "", ...out].join("\n") : "";
}

// ---------- CLI ----------
function listAll(root, suppliers, today) {
  const entries = loadNeg(root), live = entries.filter((e) => isLive(e, today));
  const flag = officialOfSource(suppliers), web = [];
  for (const r of suppliers) for (const s of r.sources || []) if (s.n > 2000 && s.n < 3000) web.push({ id: r.id, n: s.n, url: s.url, tier: s.tier, official: flag.get(`${r.id}#${s.n}`) });
  return {
    negative: { total: entries.length, live: live.length, expired: entries.length - live.length, models: new Set(live.map((e) => `${e.part}|${e.modelKey}`)).size,
      notFound: live.filter((e) => e.outcome === "not_found").length, blocked: live.filter((e) => e.outcome === "blocked").length, entries: live },
    internetSources: { total: web.length, official: web.filter((w) => w.official).length, notOfficial: web.filter((w) => !w.official).map((w) => `${w.id}#${w.n} ${w.tier} ${w.url}`) },
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
  const root = arg("root") || WEB_MEMO, today = new Date().toISOString().slice(0, 10);
  if (process.argv.includes("--forget")) {
    const model = arg("forget");
    if (!model) { console.error("Cần --forget <model>"); process.exit(2); }
    const { entries, removed } = forget(loadNeg(root), model);
    saveNeg(entries, root, today);
    console.log(`Đã xoá ${removed} mục âm của ${model} (khoá ${keyOf(model)}).`);
  } else if (process.argv.includes("--list")) {
    const dir = path.join(ROOT, "cn"), suppliers = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    const r = listAll(root, suppliers, today);
    if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 1));
    else {
      const n = r.negative;
      console.log(`Kho âm ${path.join(root, "negative.json")}: ${n.live} mục còn hạn (${n.notFound} không tìm thấy, ${n.blocked} bị chặn) của ${n.models} model; ${n.expired} mục hết hạn.`);
      for (const e of n.entries) console.log(`  ${e.part} ${e.model} / ${e.what}: ${e.outcome} ${e.date} (${e.tender}) ${e.hosts.join(", ")}`);
      const w = r.internetSources;
      console.log(`Nguồn internet trong danh mục (n 2001–2999): ${w.total}, chính thức ${w.official}, không chính thức ${w.notOfficial.length}:`);
      for (const x of w.notOfficial) console.log(`  ${x}`);
    }
  } else { console.error("Dùng: --list [--json] | --forget <model> [--root <thư mục>]"); process.exit(2); }
}
