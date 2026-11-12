// "Gợi ý giá đấu" in the Tạo HSDT tham khảo tab (Khoa, 2026-11-03: compare by configuration with AI), run on the Windows
// PC by config-bot.mjs run (as a child process: run) for every pending bidpricereq/<TBMT>:
//   node suppliers/bidprice-bot.mjs prep --key <TBMT> --out <dir> [--kva 400 --price 1230000000]
//   node suppliers/bidprice-bot.mjs check --dir <dir>          check result.json in code, print the prices
//   node suppliers/bidprice-bot.mjs run [--key <TBMT>]              answer every pending bidpricereq (or that tender's)
//   node suppliers/bidprice-bot.mjs try --key <TBMT> [--kva .. --price ..]   prep + agent + check, nothing posted
// Code picks the decided lots most like the tender from bidhist (web/bidprice.js candidates); the agent (claude -p,
// bidprice-prompt.md) reads this tender's configuration and each lot's (won goods, HSMT lines) and puts each lot in a
// level (same / close / different / unknown) with a quote; check drops a lot whose quote is not word for word in what it
// was given; code computes the prices from the alike lots (suggest) and posts bidprice/<TBMT>.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { norm } from "./verify.mjs";
import { viaApi, noteApiSpend, costOf, switchToPlan } from "./api-budget.mjs";
import { api, allDocs, doc, post, technicalPart, hsmtTextOf, sizesFor, sizeText, MAX_SIZES, fitPart, writeForRead, agentInput, capNote } from "./config-bot.mjs";
import * as RG from "./read-guard.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = fileURLToPath(import.meta.url);
const CLAUDE = process.env.GENBID_CLAUDE || "claude";
await import(pathToFileURL(path.join(ROOT, "..", "web", "bidprice.js")).href);
const BP = globalThis.GenbidBidprice;
const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const fmt = (v) => Number(v).toLocaleString("vi-VN");
// The HSMT's technical part in input.md (cut guard, điều phối 2026-11-12): at most TP_MAX characters, the window with the
// most figures, whole lines, the lines left out named for the agent and, when they hold figures, in the result's notes.
// Measured on the 12 tenders priced so far: 1 over (IB2600574589, 63,154; the 3,154 left out held 8 figures).
export const TP_MAX = 60000;
// What a part the agent did not read may change, and the button (read-guard notes).
const GUARD = { risk: "mức giống/gần của gói cũ có thể sai", again: "bấm Gợi ý giá đấu lại" };
const TASK = "chỉ ghi result.json";

// The tender as the web sent it (bidpricereq basis: kva, price, capText, bidForm, investorName read on the page), with what
// the bot can add: the analysis, the configuration suggested in Cấu hình gợi ý and the HSMT's technical part.
// `size` (a tender of several sizes, attempt): this run's size, its share of the package price being in basis, with the
// tender's sizes, the whole package price and the configurations Gợi ý cấu hình suggested for this size.
// The Đồng bộ thương hiệu check config-bot wrote for a configuration, in a few words after it.
const syncNote = (c) => {
  const x = (c.checks || []).find((x) => x.item === "Đồng bộ thương hiệu");
  return !x ? "" : x.status === "met" ? " (đạt đồng bộ thương hiệu)" : x.status === "not_met" ? " (KHÔNG đạt đồng bộ thương hiệu: tổ máy lắp ráp từ nhiều hãng)" : " (chưa rõ đồng bộ thương hiệu)";
};
export async function prep(req, dir, hist, size = null) {
  fs.mkdirSync(dir, { recursive: true });
  const key = req.key || req.notifyNo, b = req.basis || {};
  const [analysis, cfg, hsmt] = await Promise.all([doc("analysis", key).catch(() => null), size ? null : doc("configmatch", key).catch(() => null), hsmtTextOf(key).catch(() => null)]);
  const a = analysis?.result, K = Number(b.kva) || null, P = Number(b.price) || null;
  const top = ((size ? size.cfg : cfg?.result)?.configs || []).slice(0, 3);
  // What this HSMT asks for, read the way bidhist's config.text was (the analysis' technical lines), else the HSMT's
  // technical part; and the engine of the configuration Gợi ý cấu hình put first (its origin group picks the lots).
  const cfgText = a?.technicalSpecs?.length ? a.technicalSpecs.map((s) => `${s.item}: ${s.requirement}`).join("\n") : hsmt ? technicalPart(hsmt.text) : "";
  const first = top.find((c) => !/KHÔNG/.test(syncNote(c))) || null;
  // Where the engine to be offered is made (2026-11-06 audit): a foreign make from a supplier based in China (DCEC Cummins,
  // Perkins Wuxi...) is priced between a Chinese make and the same make made abroad, not as a G7 set.
  const supIds = (first?.suppliers || []).map((s) => s.supplierId).filter(Boolean);
  const sups = supIds.length ? (await allDocs("supplier").catch(() => [])).filter((d) => supIds.includes(d.id)) : [];
  const place = sups.length && sups.every((d) => d.data?.country === "CN") ? "cn" : BP.placeOf(`${first?.engine?.make || ""} ${first?.engine?.model || ""} ${a?.keyInfo?.generatorCapacity || ""}`);
  const t = { notifyNo: key, bidName: req.bidName || a?.keyInfo?.bidName || "", investorName: b.investorName || a?.keyInfo?.investor || "", cfgText,
    // Not the engine of a configuration that fails Đồng bộ thương hiệu (an assembled set is not what will be offered):
    // the first one that does not fail it, else what the HSMT asks for (Khoa, 2026-11-06).
    engine: first?.engine || null, place,
    // The rating K is given at (the web's capText: "500 kVA liên tục; 550 kVA dự phòng (phân tích)"), so a past lot's power
    // is compared at the same rating (2026-11-06 audit: names give prime, HSMTs often standby, 10% apart).
    rating: BP.kvaRated(b.capText)?.rating || (K && BP.kvaRated(a?.keyInfo?.generatorCapacity)?.kva === K ? BP.kvaRated(a?.keyInfo?.generatorCapacity)?.rating : null) || null,
    sync: (hsmt && BP.brandSyncOf(hsmt.text)) || BP.brandSyncOf(cfgText) };
  const docs = hist || Object.fromEntries((await allDocs("bidhist")).map((d) => [d.id, d.data]));
  const { total, tol, group, otherGroup, vnMade, list, prior } = BP.candidates(t, docs, K, P);
  // Giá theo cấu hình (2026-11-10): cấu hình hạng 1 dùng giá của agent như cũ; cấu hình gần nhất có động cơ khác nhóm xuất
  // xứ được ba mức riêng từ gói cũ cùng nhóm, chọn bằng code (groupPrices), không vay gói nhóm khác.
  const byConfig = await configPrices((size ? size.cfg : cfg?.result)?.configs || [], first, group, t, docs, K && K * (size?.qty || 1), P, K);
  const ratingVi = { prime: "liên tục", standby: "dự phòng" };
  // cfgText is read whole by code (profileOf, regex: was its first 20,000); the agent gets at most TP_MAX (was the first 60,000).
  const fit = hsmt ? fitPart(technicalPart(hsmt.text), TP_MAX) : null;
  const cutNotes = fit?.hits ? [capNote(`Phần kỹ thuật HSMT dài hơn ${fmt(TP_MAX)} ký tự: agent không được đọc dòng ${fit.dropped.map(([a, z]) => (a === z ? a : `${a}–${z}`)).join(", ")} / ${fit.lines} của phần đó (${fit.hits} chỗ thông số).`)] : [];
  const order = [...writeForRead(dir, "input.md", [
    `# Gói thầu ${key}`, `Tên gói: ${t.bidName}`, t.investorName ? `Chủ đầu tư: ${t.investorName}` : "",
    `Công suất: ${K ? `${fmt(Math.round(K))} kVA${t.rating ? ` mức ${ratingVi[t.rating]}` : ""}${b.capText ? ` (${b.capText})` : ""}` : "không rõ"}`, `Giá gói${size ? " (phần của cỡ máy này, code ước tính)" : ""}: ${P ? fmt(P) + " đ" : "không rõ"}`,
    ...(size ? ["", `## Gói có nhiều cỡ máy: ${size.sizes.map(sizeText).join("; ")}`,
      `Lượt này CHỈ so máy ${sizeText(size)}; các cỡ khác có lượt riêng. Xếp mức theo máy cỡ này: so công suất một máy với máy ${size.label}; gói cũ chỉ có máy cỡ này (một hay nhiều máy cùng cỡ) không bị xếp "khác" chỉ vì gói này còn máy cỡ khác. Giá gói ở trên là phần giá của cỡ máy này do code ước tính (chia giá cả gói${size.whole ? ` ${fmt(size.whole)} đ` : ""} theo số lượng và công suất từng cỡ), không phải số trên muasamcong.`, ""] : []),
    `Công suất gói cũ được lấy: lệch không quá ${Math.round((tol || BP.POWER_TOL) * 100)}% so với gói này${tol > BP.POWER_TOL ? " (nới vì gói đòi đồng bộ thương hiệu)" : ""}, so cùng mức liên tục/dự phòng khi biết; gói cũ chỉ khớp khi đọc ở mức kia thì dòng công suất của nó ghi rõ ("có thể là mức dự phòng của máy … liên tục").`,
    `Nhóm xuất xứ động cơ (code đọc từ cấu hình dự kiến chào, nếu chưa có thì từ HSMT): ${group ? BP.GROUP[group] : "không rõ"}${otherGroup ? ` — đã bỏ ${otherGroup} gói khác nhóm` : ""}${vnMade ? `; đã bỏ ${vnMade} gói có tổ máy hãng / xuất xứ Việt Nam` : ""}${group === "cnmade" ? ". Hãng ngoài Trung Quốc nhưng sản xuất tại Trung Quốc (Dongfeng/Chongqing Cummins, Perkins Wuxi…): giá nằm giữa máy hãng Trung Quốc và máy cùng hãng sản xuất ở nước ngoài; gói cũ hai nhóm đó đều được giữ để so, gói cũ cũng là hãng ngoại sản xuất tại Trung Quốc là sát nhất." : ""}`, "",
    // Đồng bộ thương hiệu (Khoa, 2026-11-06): an OEM set, priced far above a set assembled from three makes.
    ...(t.sync ? [`## Đồng bộ thương hiệu: HSMT đòi ít nhất ${t.sync.need}/${t.sync.parts.length} bộ phận chính (động cơ, đầu phát, bộ điều khiển) do chính hãng sản xuất tổ máy làm ra`,
      `HSMT ghi: "${t.sync.text}"`, `Gói cũ HSMT không đòi điều này, hay hàng trúng là tổ máy lắp ráp (động cơ, đầu phát, bộ điều khiển của các hãng khác nhau), thì không xếp "giống".`, ""] : []),
    ...(a?.keyInfo ? ["## Thông tin chính (phân tích HSMT)", ...Object.entries(a.keyInfo).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`), ""] : []),
    ...(a?.technicalSpecs?.length ? ["## Thông số kỹ thuật (phân tích HSMT)", ...a.technicalSpecs.map((s) => `- ${s.item}: ${s.requirement}`), ""] : []),
    ...(top.length ? ["## Cấu hình dự kiến chào (Gợi ý cấu hình)", ...top.map((c) => `- ${[c.engine && `động cơ ${[c.engine.make, c.engine.model].filter(Boolean).join(" ")}`, c.alternator && `đầu phát ${[c.alternator.make, c.alternator.model].filter(Boolean).join(" ")}`, c.controller && `bộ điều khiển ${[c.controller.make || c.controller.brand, c.controller.model].filter(Boolean).join(" ")}`].filter(Boolean).join(", ")}${syncNote(c)}`), ""] : []),
    hsmt ? "## Phần kỹ thuật của HSMT\n" + (fit.note ? fit.note + "\n" : "") + fit.text : "Chưa có văn bản HSMT.",
  ].filter((l) => l !== "").join("\n")),
  // samples.md was 52,000–271,000 characters on all 12 tenders priced so far, over what Read takes at once: cut at its
  // "## S<n>" headings, read part after part, checked in the run's log (read-guard).
  ...writeForRead(dir, "samples.md", list.map((s) => `## ${s.id}\n${BP.sampleText(s)}\n${BP.cfgLine(s)}`).join("\n\n"))];
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(order), "utf8");
  // Ba mức hiệu chỉnh theo cạnh tranh dự báo (web/bidprice.js CALIB): bật mặc định (Khoa duyệt 11/11); GENBID_BIDPRICE_CALIB=0
  // tắt (samples.json và kết quả y như trước, không có stats.calib).
  const fc = calibOn() ? BP.nbForecast({ notifyNo: key, investorName: t.investorName, location: b.location || "", field: b.field || "", bidCloseDate: b.bidCloseDate || "" }, docs) : null;
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: K, price: P, capText: b.capText || "", rating: t.rating, group, ...(size ? { qty: size.qty } : {}) }, total, list, prior, byConfig, cutNotes, ...(fc ? { fc: { p: fc.p } } : {}) }), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "bidprice-prompt.md"), "utf8"), "utf8");
  return { total, group, otherGroup, vnMade, candidates: list.length, K, P, prior, byConfig, fc };
}

// Hiệu chỉnh khoảng giá theo cạnh tranh dự báo: bật trừ khi GENBID_BIDPRICE_CALIB=0.
export const calibOn = () => process.env.GENBID_BIDPRICE_CALIB !== "0";
// The configuration in a few words, for the web.
const cfgLabel = (c) => [c.engine && `động cơ ${[c.engine.make, c.engine.model].filter(Boolean).join(" ")}`, c.alternator && `đầu phát ${[c.alternator.make, c.alternator.model].filter(Boolean).join(" ")}`].filter(Boolean).join(", ");
// [hạng 1 (giá = result.stats của agent), cấu hình gần nhất có nhóm xuất xứ động cơ khác (giá riêng, code)]. Nhóm của một
// cấu hình: hãng động cơ (catalog.js), sản xuất tại Trung Quốc khi mọi NCC của nó ở Trung Quốc. Kmult: kVA × số máy.
export async function configPrices(configs, first, group, t, docs, Kmult, P, K = Kmult) {
  if (!configs.length) return [];
  const ids = [...new Set(configs.flatMap((c) => (c.suppliers || []).map((s) => s.supplierId)).filter(Boolean))];
  const sups = ids.length ? await allDocs("supplier").catch(() => []) : [];
  const placeOf = (c) => { const s = (c.suppliers || []).map((x) => sups.find((d) => d.id === x.supplierId)).filter(Boolean); return s.length && s.every((d) => d.data?.country === "CN") ? "cn" : null; };
  const out = [];
  const main = first || configs[0];
  out.push({ rank: main.rank ?? 1, label: cfgLabel(main), group, main: true });
  const alt = configs.find((c) => c !== main && !/KHÔNG/.test(syncNote(c)) && (() => { const g = BP.engineGroup(c.engine, placeOf(c)); return g && g !== group; })());
  if (alt) {
    // A size of several sets: the price per kVA times all of them (Kall), as check does for the main one.
    const g = BP.engineGroup(alt.engine, placeOf(alt)), r = BP.groupPrices({ t: { ...t, engine: alt.engine }, docs, K, P, group: g, Kall: Kmult });
    out.push({ rank: alt.rank ?? null, label: cfgLabel(alt), group: g, ...r });
  }
  return out;
}

// result.json checked against samples.json: every lot gets a level; a lot the agent left out, or whose quote is not in
// its own text, counts as unknown (unverified). A "same" lot whose power code read is over 1,5 times off becomes "close".
export function check(dir) {
  const { basis, total, list, prior = [], byConfig = [], fc = null, cutNotes = [] } = JSON.parse(fs.readFileSync(path.join(dir, "samples.json"), "utf8"));
  const r = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8")), problems = [];
  const by = new Map((r.samples || []).map((x) => [x.id, x]));
  const samples = list.map((s) => {
    const x = by.get(s.id), level = BP.LEVELS.includes(x?.level) ? x.level : "unknown";
    const out = { ...s, level, same: (x?.same || []).map(String).slice(0, 8), diff: (x?.diff || []).map(String).slice(0, 8), quote: String(x?.quote || "") };
    if (!x) { problems.push(`${s.id}: agent không xếp mức`); return { ...out, unverified: "agent không xếp mức" }; }
    if (level === "same" || level === "close") {
      const q = norm(out.quote).replace(/…$/, "");
      if (!q || !norm(BP.sampleText(s)).includes(q)) { problems.push(`${s.id}: câu trích không có trong thông tin gói: "${out.quote.slice(0, 80)}"`); return { ...out, unverified: "câu trích không khớp thông tin gói" }; }
      if (level === "same" && basis.kva && s.k && Math.abs(Math.log(basis.kva / s.k)) > Math.log(1.5)) { problems.push(`${s.id}: "giống" nhưng công suất ${Math.round(s.k)} kVA → "gần"`); return { ...out, level: "close" }; }
    }
    return out;
  });
  // A size of several sets (a tender of several sizes): the price per kVA times all of them.
  const stats = BP.suggest(samples, basis.price, basis.kva && basis.kva * (basis.qty || 1), prior, fc ? { fc } : {});
  const result = { basis, total, tender: { summary: String(r.tender?.summary || ""), points: (r.tender?.points || []).map(String).slice(0, 10) }, notes: [...(r.notes || []).map(String).slice(0, 6), ...cutNotes], samples, stats, ...(byConfig.length ? { byConfig } : {}) };
  fs.writeFileSync(path.join(dir, "result.checked.json"), JSON.stringify(result, null, 1));
  return { result, problems };
}

const CLAUDE_MIN = 25;
function runClaude(dir) {
  const api = viaApi();
  // stream-json: every Read is in the log, so read-guard can tell whether input.md and samples.md were read whole; the
  // first message is the instructions and the files to read in order (agentInput).
  const r = spawnSync(CLAUDE, ["-p", "--permission-mode", "auto", "--output-format", "stream-json", "--verbose", "--model", process.env.GENBID_BIDPRICE_MODEL || "opus",
    "--strict-mcp-config", "--disable-slash-commands", "--tools", "Read", "Write", "Grep", "Glob"],
    { cwd: dir, encoding: "utf8", timeout: CLAUDE_MIN * 60e3, maxBuffer: 256 << 20, windowsHide: true, input: agentInput(dir, TASK, { scripts: false }) });
  noteApiSpend(costOf(r.stdout), "bidprice", api);
  return api && switchToPlan(`${r.stdout || ""}${r.stderr || ""}`, "bidprice") ? runClaude(dir) : r;
}

// prev: this tender's (this size's) result posted before, kept when the run stops half way (read guard, as Gợi ý cấu hình).
async function attemptOne(req, dir, hist, size = null, tag = req.key, prev = null) {
  fs.rmSync(dir, { recursive: true, force: true });
  const info = await prep(req, dir, hist, size);
  if (!info.candidates) return { result: { basis: { kva: info.K, price: info.P, capText: req.basis?.capText || "", ...(size ? { qty: size.qty } : {}) }, total: info.total, tender: { summary: "", points: [] }, notes: [`Chưa có gói đã có kết quả nào gần với gói này (cùng là cung cấp máy phát, công suất xê dịch không quá 5%${info.group ? `, động cơ cùng nhóm ${BP.GROUP[info.group]}` : ""}).${info.prior?.length ? ` Giá dưới đây tính từ ${info.prior.length} gói cùng cỡ (±15%) có cạnh tranh, chưa qua Agent so cấu hình.` : ""}`], samples: [], stats: BP.suggest([], info.P, info.K && info.K * (size?.qty || 1), info.prior || [], info.fc ? { fc: info.fc } : {}), ...(info.byConfig?.length ? { byConfig: info.byConfig } : {}) }, problems: [] };
  const started = Date.now(), r = runClaude(dir);
  fs.writeFileSync(path.join(os.tmpdir(), `genbid-bidprice-${tag}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
  if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
  const label = size ? `máy ${size.label}` : "", g = RG.guardRun(dir, r.stdout || "", { label, ...GUARD });
  const stopped = RG.stoppedNote(g.end, r.error ? (r.error.code === "ETIMEDOUT" ? `quá ${CLAUDE_MIN} phút` : r.error.message) : "");
  if (g.notes.length || stopped) console.log(`${tag}: CHỐT ĐỌC — ${[...g.notes, ...(stopped && !g.notes.some((n) => n.includes(stopped)) ? [stopped] : [])].join(" | ")}`);
  // A run stopped half way (killed, timeout, error_max_turns): its result.json may be a draft. The earlier result stays,
  // with a note; with none, the draft is used with readNotes' note.
  if (stopped && prev) {
    const note = capNote(`Lượt Gợi ý giá đấu${label ? ` (${label})` : ""} lúc ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC bị dừng giữa chừng (${stopped}); đang hiển thị kết quả lần trước — ${GUARD.again}.`);
    return { result: { ...prev, notes: [...(prev.notes || []).filter((n) => !/bị dừng giữa chừng/.test(n)), note] }, problems: [], stopped: true };
  }
  const out = check(dir);
  out.result.seconds = Math.round((Date.now() - started) / 1000);
  if (stopped && !g.notes.some((n) => /bị dừng giữa chừng/.test(n))) g.notes.push(`Lượt agent${label ? ` (${label})` : ""} bị dừng giữa chừng (${stopped}): result.json có thể là bản dở — ${GUARD.again}.`);
  if (g.notes.length) { out.result.notes.push(...g.notes.map(capNote)); out.result.readIncomplete = true; }
  return out;
}

// ---------- Gói nhiều cỡ máy (Khoa, 2026-11-04: Gợi ý giá đấu chạy riêng từng cỡ máy như Gợi ý cấu hình) ----------
// The sizes are those of Gợi ý cấu hình (configmatch result.sizes), else read the same way (config-bot.mjs sizesFor).
// The package price is shared out by quantity x kVA^0.7: a set of twice the power costs about 1.6 times as much
// (log-log fit over the 48 won generator sets of bidhist whose goods give a unit price and a power, 2026-11-04:
// exponent 0.69). Tried on the 6 past tenders whose won goods give each size's unit price: off by 8 points of share at
// the median, 49 where the quantities are not known (the median winning unit price of each size's similar lots: 12;
// the package price per set by 51: lots of many sets list no quantity). A size with no quantity counts as one set.
// Each size then runs as a tender of its own with its share as the package price; the package's levels add them up.
export const SCALE = 0.7;
export function sharesOf(sizes) {
  const w = sizes.map((z) => (z.qty || 1) * z.kva ** SCALE), sum = w.reduce((x, y) => x + y, 0);
  return sizes.map((z, i) => ({ share: w[i] / sum }));
}
async function sizesOfTender(key, req, cfg) {
  const own = (cfg?.result?.sizes || []).map((x) => ({ cap: x.cap, kva: x.kva, qty: x.qty, label: x.label, quote: x.quote, cfg: x.result || null }));
  return own.length > 1 ? own : (await sizesFor(key, req.bidName)).slice(0, MAX_SIZES);
}
async function attempt(req, dir, hist, prev = null) {
  const key = req.key || req.notifyNo, cfg = await doc("configmatch", key).catch(() => null), sizes = await sizesOfTender(key, req, cfg);
  if (sizes.length < 2) return attemptOne(req, dir, hist, null, req.key, prev && !prev.multi ? prev : null);
  fs.rmSync(dir, { recursive: true, force: true });
  const docs = hist || Object.fromEntries((await allDocs("bidhist")).map((d) => [d.id, d.data]));
  const b = req.basis || {}, P = Number(b.price) || null;
  const shares = sharesOf(sizes);
  const outs = [], problems = [];
  for (const [i, z] of sizes.entries()) {
    const size = { ...z, sizes, whole: P }, part = P ? Math.round((P * shares[i].share) / 1000) * 1000 : null;
    try {
      const out = await attemptOne({ ...req, basis: { ...b, kva: z.kva, price: part, capText: sizeText(z) } }, path.join(dir, String(i + 1)), docs, size, `${key}-${i + 1}`, prev?.multi ? prev.sizes?.find((x) => x.label === z.label)?.result || null : null);
      outs.push({ z, sh: shares[i], result: out.result });
      problems.push(...out.problems.map((x) => `máy ${z.label}: ${x}`));
    } catch (e) { outs.push({ z, sh: shares[i], error: e.message || String(e) }); }
  }
  if (!outs.some((o) => o.result)) throw new Error(outs.map((o) => `Máy ${o.z.label}: ${o.error}`).join(" "));
  // The package's levels: each size's level added up, when every size has one.
  const levels = outs.every((o) => o.result?.stats.levels.length) ? outs[0].result.stats.levels.map((l, j) => {
    const price = outs.reduce((a, o) => a + o.result.stats.levels[j].price, 0);
    return { id: l.id, label: l.label, price, ratio: P ? price / P : null };
  }) : [];
  // Ba mức hiệu chỉnh của cả gói: tổng từng cỡ, khi cỡ nào cũng có (cùng cách với levels).
  const calibSum = outs.every((o) => o.result?.stats.calib?.levels?.length) ? outs[0].result.stats.calib.levels.map((l, j) => {
    const price = outs.reduce((a, o) => a + o.result.stats.calib.levels[j].price, 0);
    return { id: l.id, label: l.label, price, ratio: P ? price / P : null };
  }) : [];
  const result = {
    basis: { kva: null, price: P, capText: sizes.map(sizeText).join(" + ") }, multi: true, levels, ...(calibSum.length ? { calib: { levels: calibSum, ...BP.CALIB } } : {}),
    sizes: outs.map((o) => ({ cap: o.z.cap, kva: o.z.kva, qty: o.z.qty, label: o.z.label, quote: o.z.quote, share: o.sh.share, ...(o.result ? { result: o.result } : { error: o.error }) })),
    notes: [`Gói có ${sizes.length} cỡ máy (${sizes.map(sizeText).join("; ")}): mỗi cỡ được so riêng với các gói đã có kết quả cùng cỡ. Giá gói chia cho từng cỡ theo số lượng x công suất^0,7 (máy công suất gấp đôi giá khoảng gấp 1,6)${sizes.some((z) => !z.qty) ? ", cỡ không ghi số lượng tính 1 máy" : ""}: ${outs.map((o) => `máy ${o.z.label} ${Math.round(100 * o.sh.share)}%`).join(", ")}.`],
  };
  return { result, problems };
}

// bidpricereq keeps the request's own fields and gets doneAt (+ error); bidprice carries the checked result.
export async function answer(req, hist) {
  const key = req.key, dir = path.join(os.tmpdir(), "genbid-bidprice", key);
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = JSON.parse(JSON.stringify({ notifyNo: req.notifyNo || key, bidName: req.bidName, basis: req.basis, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" }));
    return post([...(result ? [{ coll: "bidprice", id: key, data: { at, result } }] : []), { coll: "bidpricereq", id: key, data: reqData }]);
  };
  try {
    const prev = (await doc("bidprice", key).catch(() => null))?.result || null;
    const { result, problems } = await attempt(req, dir, hist, prev);
    await done({ result, error: "" });
    console.log(`${key}: ${result.multi ? result.sizes.map((z) => `máy ${z.label}: ${z.result ? `giá đấu từ ${z.result.stats.n} gói tương tự` : `lỗi ${z.error}`}`).join("; ") : `giá đấu từ ${result.stats.n} gói tương tự (${result.samples.length} ứng viên)`}${problems.length ? `, ${problems.length} điểm chưa khớp` : ""}`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: Gợi ý giá đấu lỗi ${e.message}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

function printResult({ result, problems }) {
  if (result.multi) {
    for (const z of result.sizes) {
      console.log(`== Máy ${z.qty ? `${z.qty} x ` : ""}${z.label}: ${Math.round(100 * z.share)}% giá gói`);
      if (z.result) printResult({ result: z.result, problems: [] }); else console.log(`lỗi ${z.error}`);
    }
    if (result.calib) console.log(`== Cả gói, hiệu chỉnh: ${result.calib.levels.map((l) => `${l.label} ${fmt(l.price)}`).join(" · ")}`);
    console.log(`== Cả gói: ${result.levels.length ? result.levels.map((l) => `${l.label} ${fmt(l.price)}`).join(" · ") : "chưa đủ cỡ máy có giá"}`);
    if (problems.length) console.log("Chưa khớp:\n" + problems.join("\n"));
    return;
  }
  const s = result.stats;
  console.log(`Ứng viên ${result.samples.length}/${result.total}: ${BP.LEVELS.map((l) => `${l} ${result.samples.filter((x) => x.level === l).length}`).join(", ")}`);
  console.log(`Tính từ ${s.n} gói (${s.basis})${s.enough ? "" : " — CHƯA ĐỦ"}: ${s.levels.map((l) => `${l.label} ${fmt(l.price)} (${Math.round(100 * l.ratio)}%, thắng ${Math.round(100 * l.chance)}%)`).join(" · ")}`);
  if (s.calib) console.log(`Hiệu chỉnh theo cạnh tranh dự báo: ${s.calib.levels.map((l) => `${l.label} ${fmt(l.price)} (${Math.round(100 * l.ratio)}%)`).join(" · ")}`);
  if (s.perKva) console.log(`Theo đ/kVA: ${fmt(s.perKva.value)} đ/kVA → ${fmt(s.perKva.price)} (${s.perKva.n} gói)`);
  for (const c of (result.byConfig || []).filter((c) => !c.main)) console.log(`Cấu hình #${c.rank ?? "?"} ${c.label} (nhóm ${BP.GROUP[c.group] || c.group}, code chọn gói): ${c.stats.levels.length ? c.stats.levels.map((l) => `${l.label} ${fmt(l.price)} (${Math.round(100 * l.ratio)}%)`).join(" · ") + ` từ ${c.stats.pool} gói` : c.note}`);
  for (const x of result.samples.filter((x) => x.level === "same" || x.level === "close")) console.log(`  ${x.id} ${x.level} ${x.key} ${Math.round(100 * x.ratio)}% ${x.bidders.length}NT — ${x.same.join(", ")} / khác: ${x.diff.join(", ")}`);
  if (problems.length) console.log("Chưa khớp:\n" + problems.join("\n"));
}

const cmd = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  const req = { key: arg("key"), notifyNo: arg("key"), basis: { kva: arg("kva"), price: arg("price") } };
  if (cmd === "prep") console.log(JSON.stringify(await prep(req, arg("out"))));
  else if (cmd === "check") printResult(check(arg("dir", ".")));
  else if (cmd === "run") {
    // Every pending bidpricereq, or with --key only that tender's (config-bot.mjs run starts one per tender, all at once).
    // Only requests the web wrote (basis).
    const reqs = (await api("kind=bidprice")).filter((r) => r.basis && (!arg("key") || r.key === arg("key")));
    if (reqs.length) { const hist = Object.fromEntries((await allDocs("bidhist")).map((d) => [d.id, d.data])); for (const r of reqs) await answer(r, hist); }
  }
  else if (cmd === "try") { const dir = arg("out") || path.join(os.tmpdir(), "genbid-bidprice-try", req.key); printResult(await attempt(req, dir)); console.log(`Thư mục: ${dir}`); }
  else { console.error("usage: bidprice-bot.mjs prep --key K --out D [--kva N --price P] | check --dir D | try --key K [--kva N --price P]"); process.exit(2); }
}
